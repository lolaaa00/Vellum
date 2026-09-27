import type { Metadata } from 'next';
import './globals.css';
import { WalletProvider } from '@/lib/wallet/WalletProvider';
import { TopNav } from '@/components/TopNav';
export const metadata: Metadata = { title:'VELLUM', description:'Constitutional execution rails for governed treasuries on GenLayer.' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><WalletProvider><div className="petal petalA"/><div className="petal petalB"/><TopNav/><main>{children}</main><footer><span>VELLUM</span><span>GenLayer StudioNet · chain 61999</span></footer></WalletProvider></body></html>}
