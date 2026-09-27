'use client';
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { CHAIN_ID, RPC_URL } from '@/lib/config';

type Provider = { request:(args:{method:string;params?:unknown[]|object})=>Promise<unknown>; on?:(e:string,h:(...a:any[])=>void)=>void; removeListener?:(e:string,h:(...a:any[])=>void)=>void };
export const injected = (): Provider | null => typeof window === 'undefined' ? null : ((window as any).ethereum ?? null);
const chain = { ...studionet, id: CHAIN_ID, rpcUrls: { default: { http: [RPC_URL] as readonly string[] } } };
export const readClient = () => createClient({ chain: chain as any, endpoint: RPC_URL });
export const writeClient = (address: string) => {
  const provider = injected();
  if (!provider) throw new Error('No injected wallet detected.');
  return createClient({ chain: chain as any, endpoint: RPC_URL, account: address as `0x${string}`, provider: provider as any });
};
