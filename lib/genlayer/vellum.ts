'use client';
import { CONTRACT_ADDRESS, isConfigured } from '@/lib/config';
import { readClient, writeClient } from './client';
import { estimateFees } from './fees';
import type { Charter, Mandate, Motion } from '@/lib/types';
import { classifyFinalizedReceipt } from './finality';
export { classifyFinalizedReceipt, txStateFromError } from './finality';

const norm = (v:any):any => v instanceof Map ? Object.fromEntries([...v.entries()].map(([k,x])=>[String(k),norm(x)])) : Array.isArray(v) ? v.map(norm) : (v && typeof v==='object' ? Object.fromEntries(Object.entries(v).map(([k,x])=>[k,norm(x)])) : v);
const address = () => { if(!isConfigured()) throw new Error('NEXT_PUBLIC_VELLUM_CONTRACT_ADDRESS is not configured'); return CONTRACT_ADDRESS as `0x${string}`; };
export async function readFn<T>(functionName:string,args:any[]=[]):Promise<T>{ const x=await readClient().readContract({address:address(),functionName,args}); return norm(x) as T; }
export const getCounts=()=>readFn<{charters:number;mandates:number;motions:number}>('get_counts');
export const getCharter=(id:number)=>readFn<Charter>('get_charter',[id]);
export const getMandate=(id:number)=>readFn<Mandate>('get_mandate',[id]);
export const getMotion=(id:number)=>readFn<Motion>('get_motion',[id]);
export const listCharters=(start=1,limit=20)=>readFn<Charter[]>('list_charters',[start,limit]);
export const listMandates=(start=1,limit=20)=>readFn<Mandate[]>('list_mandates',[start,limit]);
export const listMotions=(start=1,limit=30)=>readFn<Motion[]>('list_motions',[start,limit]);
export const getClaimable=(who:string)=>readFn<string>('get_claimable',[who]);


type StoredWrite = { hash:string; actionLabel:string; objectId?:string; submittedAt:string; account:string; chainId:number; status:'submitted'|'accepted'|'finalized'|'failed'|'uncertain' };
const STORAGE_KEY='vellum:transactions:v1';

function saveWrite(next:StoredWrite){
  if(typeof window==='undefined')return;
  let items:StoredWrite[]=[];
  try{items=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{}
  const merged=[next,...items.filter(x=>x.hash.toLowerCase()!==next.hash.toLowerCase())].slice(0,50);
  localStorage.setItem(STORAGE_KEY,JSON.stringify(merged));
}

export async function writeFn(account:string,functionName:string,args:unknown[]=[],value=0n,onHash?:(h:string)=>void,onAccepted?:(h:string)=>void,objectId?:string){
  const c:any=writeClient(account); const req:any={address:address(),functionName,args,value};
  let submittedHash='';
  try {
    await c.connect('studionet');
    const fees=await estimateFees(c,req).catch(()=>undefined);
    const hash=await c.writeContract({...req,...(fees?{fees}:{})}); submittedHash=String(hash);
    saveWrite({hash:submittedHash,actionLabel:functionName,objectId,submittedAt:new Date().toISOString(),account,chainId:61999,status:'submitted'});
    onHash?.(submittedHash);
    await c.waitForTransactionReceipt({hash,waitUntil:'decided',fullTransaction:true,retries:60,interval:5000});
    saveWrite({hash:submittedHash,actionLabel:functionName,objectId,submittedAt:new Date().toISOString(),account,chainId:61999,status:'accepted'});
    onAccepted?.(submittedHash);
    const receipt=norm(await c.waitForTransactionReceipt({hash,waitUntil:'finalized',fullTransaction:true,retries:180,interval:5000}));
    const outcome=classifyFinalizedReceipt(receipt);
    if(!outcome.ok){
      saveWrite({hash:submittedHash,actionLabel:functionName,objectId,submittedAt:new Date().toISOString(),account,chainId:61999,status:'failed'});
      throw new Error(outcome.reason);
    }
    saveWrite({hash:submittedHash,actionLabel:functionName,objectId,submittedAt:new Date().toISOString(),account,chainId:61999,status:'finalized'});
    return {hash:submittedHash,receipt};
  } catch (error) {
    const message=explainWriteError(error);
    if(submittedHash&&/timeout|taking longer|not found|fetch failed|network/i.test(message)){
      saveWrite({hash:submittedHash,actionLabel:functionName,objectId,submittedAt:new Date().toISOString(),account,chainId:61999,status:'uncertain'});
      const pending=Object.assign(new Error(`Transaction submitted, but finality could not be confirmed. Use the explorer link to reconcile it before retrying. ${message}`),{hash:submittedHash,uncertain:true});
      throw pending;
    }
    const failed=Object.assign(new Error(message),submittedHash?{hash:submittedHash}:{});
    throw failed;
  }
}

function explainWriteError(error: unknown): string {
  const e = error as { code?: number; message?: string; shortMessage?: string; cause?: { message?: string } };
  const raw = e?.shortMessage || e?.cause?.message || e?.message || String(error);
  const message = raw.replace(/^Error:\s*/i, '');
  if (e?.code === 4001 || /user rejected|denied|cancelled/i.test(message)) return 'The wallet signature was rejected. No transaction was submitted.';
  if (/insufficient funds|insufficient balance|fee.*balance/i.test(message)) return 'This wallet does not have enough GEN for the value and network fees.';
  if (/wrong network|chain.*mismatch|unsupported chain/i.test(message)) return 'Switch the wallet to GenLayer StudioNet (chain 61999) and try again.';
  if (/timeout|timed out|retries/i.test(message)) return 'The transaction was submitted, but acceptance is taking longer than expected. Check its explorer link before retrying.';
  if (/consensus|validator|rotation|appeal/i.test(message)) return `GenLayer consensus did not complete: ${message}`;
  if (/fetch|render|https|evidence/i.test(message)) return `Validators could not verify the external evidence: ${message}`;
  return message;
}
