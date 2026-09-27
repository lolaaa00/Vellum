'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, Empty, Label, Row, Stat, Tag } from '@/components/ui';
import { getCounts, listCharters, listMandates, listMotions } from '@/lib/genlayer/vellum';
import type { Charter, Mandate, Motion } from '@/lib/types';
import { gen } from '@/lib/format';

export default function Home(){
  const [counts,setCounts]=useState({charters:0,mandates:0,motions:0}); const [charters,setCharters]=useState<Charter[]>([]); const [mandates,setMandates]=useState<Mandate[]>([]); const [motions,setMotions]=useState<Motion[]>([]); const [error,setError]=useState('');
  useEffect(()=>{(async()=>{try{const [c,cs,ms,xs]=await Promise.all([getCounts(),listCharters(1,8),listMandates(1,8),listMotions(1,10)]);setCounts(c);setCharters(cs);setMandates(ms);setMotions(xs)}catch(e:any){setError(e?.message||String(e))}})()},[]);
  const permitted=motions.filter(m=>m.verdict==='PERMITTED'&&m.status==='REVIEWED').length;
  return <>
    <section className="hero"><div><Label>Governance, made executable</Label><h1>Write the rules.<br/><em>Make them matter.</em></h1><p>VELLUM pins a governance charter, escrows a mandate, and asks independent GenLayer validators whether a proposed treasury action is actually authorised by the words that govern it.</p><div className="heroActions"><Link className="btn" href="/charters/new">Publish a charter</Link><Link className="btn secondary" href="/motions/new">Review a motion</Link></div></div><aside className="heroSide"><Label>Why VELLUM exists</Label><b>Natural-language constitutions become a real execution boundary.</b><p>A motion does not unlock escrow because one server says so. Validators inspect the same pinned charter, mandate and external evidence, then consensus decides the gate.</p></aside></section>
    {error?<div className="note">Live reads are unavailable until the StudioNet deployment address is configured. {error}</div>:null}
    <div className="grid4"><Stat label="Published charters" value={counts.charters}/><Stat label="Funded mandates" value={counts.mandates}/><Stat label="Reviewed motions" value={counts.motions}/><Stat label="Reserved to execute" value={permitted} detail="PERMITTED and still in review window"/></div>
    <section className="section grid2"><Card><div className="sectionHead"><h2>Charters</h2><Link href="/charters/new">new →</Link></div>{charters.length?charters.slice().reverse().map(c=><Row key={c.id} href={`/charters/${c.id}`} title={c.title} meta={`${c.jurisdiction} · sha256 ${c.source_hash.slice(0,10)}…`} right={<Tag tone={c.active?'sage':'muted'}>{c.active?'active':'inactive'}</Tag>}/>):<Empty>No charters yet.</Empty>}</Card><Card><div className="sectionHead"><h2>Mandates</h2><Link href="/mandates/new">new →</Link></div>{mandates.length?mandates.slice().reverse().map(m=><Row key={m.id} href={`/mandates/${m.id}`} title={m.title} meta={`${gen(m.available)} GEN available · charter #${m.charter_id}`} right={<Tag tone={m.active?'rose':'muted'}>{m.active?'funded rail':'closed'}</Tag>}/>):<Empty>No mandates yet.</Empty>}</Card></section>
    <section className="section"><Card><div className="sectionHead"><h2>Recent motions</h2><Link href="/motions/new">submit →</Link></div>{motions.length?motions.slice().reverse().map(m=><Row key={m.id} href={`/motions/${m.id}`} title={m.summary} meta={`mandate #${m.mandate_id} · ${gen(m.amount)} GEN · ${m.risk_class}`} right={<Tag tone={m.verdict==='PERMITTED'?'sage':m.verdict==='CONFLICT'?'rose':'amber'}>{m.verdict}</Tag>}/>):<Empty>No consensus decisions yet.</Empty>}</Card></section>
  </>
}
