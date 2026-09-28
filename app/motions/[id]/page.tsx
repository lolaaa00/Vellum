'use client';
import { FormEvent,useEffect,useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card,PageHead,Tag } from '@/components/ui';
import { TxNotice } from '@/components/TxNotice';
import { getMandate,getMotion,txStateFromError,writeFn } from '@/lib/genlayer/vellum';
import { terminalMethodForMotion } from '@/lib/genlayer/terminal';
import type { Mandate,Motion,TxState } from '@/lib/types';
import { dateTime,gen } from '@/lib/format';
import { useWallet } from '@/lib/wallet/WalletProvider';

const tone=(v:string)=>v==='PERMITTED'?'sage':v==='CONFLICT'?'rose':'amber' as const;

export default function MotionPage(){
  const p=useParams<{id:string}>(); const w=useWallet();
  const [x,setX]=useState<Motion|null>(null); const [mandate,setMandate]=useState<Mandate|null>(null);
  const [err,setErr]=useState(''); const [tx,setTx]=useState<TxState>({kind:'idle'});
  const [arg,setArg]=useState(''); const [urls,setUrls]=useState('');
  const load=async()=>{try{const motion=await getMotion(Number(p.id));setX(motion);setMandate(await getMandate(motion.mandate_id))}catch(e:any){setErr(e?.message||String(e))}};
  useEffect(()=>{void load()},[p.id]);

  async function appeal(e:FormEvent){e.preventDefault();try{if(!w.address)throw new Error('Connect wallet first');setTx({kind:'signing',message:'Submitting one bounded semantic appeal.'});const ev=urls.split('\n').map(s=>s.trim()).filter(Boolean);const r=await writeFn(w.address,'appeal_motion',[Number(p.id),arg,JSON.stringify(ev)],200000000000000000n,h=>setTx({kind:'pending',hash:h,message:'Appeal consensus is running.'}),h=>setTx({kind:'accepted',hash:h,message:'Appeal decided; waiting for finalization and execution proof.'}),`motion:${p.id}`);setTx({kind:'finalized',hash:r.hash,message:'Appeal finalized with successful GenVM execution.'});await load()}catch(e:unknown){setTx(txStateFromError(e))}}

  const terminalMethod=x&&mandate?terminalMethodForMotion(x,mandate.expires_at):null;
  async function terminal(){try{if(!w.address||!x||!mandate)throw new Error('Connect wallet first');const fn=terminalMethodForMotion(x,mandate.expires_at);const message=fn==='expire_motion'?'The mandate has expired. Releasing its lock and returning bonds.':fn==='execute_motion'?'Releasing reserved escrow after the challenge window.':'Closing blocked motion and returning bonds.';setTx({kind:'signing',message});const r=await writeFn(w.address,fn,[x.id],0n,h=>setTx({kind:'pending',hash:h,message:'Terminal transaction submitted.'}),h=>setTx({kind:'accepted',hash:h,message:'Terminal transaction accepted; waiting for finalization and execution proof.'}),`motion:${x.id}`);setTx({kind:'finalized',hash:r.hash,message:'Motion terminal transition finalized with successful GenVM execution.'});await load()}catch(e:unknown){setTx(txStateFromError(e))}}

  if(err)return <div className="pageHead"><h1>Motion unavailable</h1><p>{err}</p></div>;
  if(!x||!mandate)return <div className="pageHead"><p>Reading motion…</p></div>;
  return <><PageHead eyebrow={`Motion #${x.id} · mandate #${x.mandate_id}`} title={x.summary} body={`${gen(x.amount)} GEN requested for ${x.beneficiary}`}/><section className={`verdict ${x.verdict.toLowerCase()}`}><span className="kicker">Consensus-backed semantic decision</span><h2>{x.verdict.replaceAll('_',' ')}</h2><p><b>Leader explanatory analysis:</b> {x.rationale}</p><div className="heroActions"><Tag tone={tone(x.verdict)}>{x.risk_class}</Tag><Tag tone="ink">{x.status}</Tag><Tag tone="amber">{x.reservation_state.replaceAll('_',' ')}</Tag>{x.appealed?<Tag tone="amber">appealed once</Tag>:null}</div></section><section className="section grid2"><Card><dl className="detailGrid"><dt>Explanatory clause</dt><dd>{x.material_clause||'—'}</dd><dt>Explanatory missing fact</dt><dd>{x.missing_fact||'none'}</dd><dt>Proposer</dt><dd className="mono">{x.proposer}</dd><dt>Beneficiary</dt><dd className="mono">{x.beneficiary}</dd><dt>Consensus evidence digest</dt><dd className="mono">{x.evidence_digest||'—'}</dd><dt>Accounting state</dt><dd>{x.reservation_state}</dd><dt>Execution block</dt><dd>{x.execution_block_reason||'none'}</dd><dt>Reviewed</dt><dd>{dateTime(x.reviewed_at)}</dd><dt>Challenge ends</dt><dd>{dateTime(x.challenge_until)}</dd><dt>Mandate expires</dt><dd>{dateTime(mandate.expires_at)}</dd></dl></Card><Card><div className="kicker">Lifecycle</div><div className="timeline"><div>Motion submitted with a 0.1 GEN bond.</div><div>Consensus binds verdict, risk class, and evidence digest; prose remains leader-generated explanation.</div><div>{x.reservation_state==='RESERVED'?'Funds are reserved, not yet paid.':x.liability_locked?'Equal appeal exposure is locked so withdrawal cannot defeat a successful appeal.':'No treasury lock remains.'}</div><div>{terminalMethod==='expire_motion'?'The mandate expired; the motion must expire and refund its bonds instead of executing.':'After the challenge window, the motion can move to a terminal state.'}</div></div><div className="heroActions"><Link className="btn secondary" href={`/receipts/${x.id}`}>Open receipt</Link><button className="btn" onClick={()=>void terminal()}>{terminalMethod==='expire_motion'?'Expire & refund':terminalMethod==='execute_motion'?'Execute after window':'Close after window'}</button></div></Card></section>{!x.appealed&&x.status==='REVIEWED'?<section className="section"><Card><div className="sectionHead"><h2>Appeal once</h2><p>proposer, mandate owner or charter sponsor only</p></div><form className="form" onSubmit={appeal}><div className="field"><label>Argument</label><textarea className="textarea" value={arg} onChange={e=>setArg(e.target.value)} required/></div><div className="field"><label>Additional evidence URLs</label><textarea className="textarea mono" value={urls} onChange={e=>setUrls(e.target.value)} placeholder="one HTTPS URL per line"/></div><div className="note">Appeal bond: 0.2 GEN. New evidence is fetched by validators and treated as untrusted data. Combined evidence may not exceed four URLs.</div><button className="btn soft">Submit appeal</button></form></Card></section>:null}<TxNotice tx={tx}/></>
}
