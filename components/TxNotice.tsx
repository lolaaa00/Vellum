import type { TxState } from '@/lib/types';
import { explorerTx } from '@/lib/config';
export function TxNotice({tx}:{tx:TxState}){if(tx.kind==='idle')return null; return <div className={`tx ${tx.kind}`}><b>{tx.kind==='signing'?'Awaiting signature':tx.kind==='pending'?'Consensus pending':tx.kind==='accepted'?'Accepted · finality pending':tx.kind==='finalized'?'Finalized':tx.kind==='error'?'Transaction failed':'Status'}</b><span>{tx.message}</span>{tx.hash?<a href={explorerTx(tx.hash)} target="_blank" rel="noreferrer">View transaction</a>:null}</div>}
