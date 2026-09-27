'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CHAIN_HEX, CHAIN_ID, RPC_URL } from '@/lib/config';
import { injected } from '@/lib/genlayer/client';

type State = { address:string|null; ready:boolean; correct:boolean; loading:boolean; error?:string };
type Ctx = State & { connect:()=>Promise<void>; switchNetwork:()=>Promise<void> };
const WalletContext = createContext<Ctx | null>(null);
export function WalletProvider({children}:{children:React.ReactNode}) {
  const [state,setState] = useState<State>({address:null,ready:false,correct:false,loading:true});
  const refresh = useCallback(async()=>{
    const p:any = injected();
    if(!p){ setState({address:null,ready:false,correct:false,loading:false,error:'No injected wallet'}); return; }
    const accounts = await p.request({method:'eth_accounts'}) as string[];
    const chain = await p.request({method:'eth_chainId'}) as string;
    setState({address:accounts?.[0]??null,ready:!!accounts?.[0],correct:parseInt(chain,16)===CHAIN_ID,loading:false});
  },[]);
  useEffect(()=>{ void refresh(); const p:any=injected(); if(!p)return; const h=()=>void refresh(); p.on?.('accountsChanged',h); p.on?.('chainChanged',h); return()=>{p.removeListener?.('accountsChanged',h);p.removeListener?.('chainChanged',h)};},[refresh]);
  const connect = useCallback(async()=>{ const p:any=injected(); if(!p) throw new Error('Install an injected EIP-1193 wallet.'); await p.request({method:'eth_requestAccounts'}); await refresh();},[refresh]);
  const switchNetwork = useCallback(async()=>{ const p:any=injected(); if(!p) throw new Error('No wallet'); try { await p.request({method:'wallet_switchEthereumChain',params:[{chainId:CHAIN_HEX}]}); } catch(e:any) { if(e?.code===4902) await p.request({method:'wallet_addEthereumChain',params:[{chainId:CHAIN_HEX,chainName:'GenLayer StudioNet',nativeCurrency:{name:'GEN',symbol:'GEN',decimals:18},rpcUrls:[RPC_URL]}]}); else throw e; } await refresh();},[refresh]);
  const value=useMemo(()=>({...state,connect,switchNetwork}),[state,connect,switchNetwork]);
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
export const useWallet=()=>{const x=useContext(WalletContext); if(!x) throw new Error('WalletProvider missing'); return x;};
