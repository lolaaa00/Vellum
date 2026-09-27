'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/lib/wallet/WalletProvider';
import { CHAIN_ID, CONTRACT_ADDRESS, explorerAddress, isConfigured } from '@/lib/config';
import { short } from '@/lib/format';
import { ClaimButton } from '@/components/ClaimButton';

const links = [
  ['/', 'Overview'], ['/charters/new','Charters'], ['/mandates/new','Mandates'], ['/motions/new','Motions'], ['/demo','Demo']
];
export function TopNav(){
  const path=usePathname(); const w=useWallet();
  return <header className="topbar">
    <div className="navLeft">
      <Link href="/" className="brand"><span className="seal">V</span><span>VELLUM</span></Link>
      <nav>{links.map(([href,label])=><Link key={href} href={href} className={path===href?'active':''}>{label}</Link>)}{isConfigured()?<a href={explorerAddress(CONTRACT_ADDRESS)} target="_blank">Contract</a>:null}</nav>
    </div>
    <div className="walletArea"><ClaimButton/>
      {!w.ready?<button className="pill" onClick={()=>void w.connect()}>Connect wallet</button>:!w.correct?<button className="pill warn" onClick={()=>void w.switchNetwork()}>Switch to {CHAIN_ID}</button>:<span className="walletChip"><i />{short(w.address||'',14)}</span>}
    </div>
  </header>
}
