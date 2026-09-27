import Link from 'next/link';
import type { ReactNode } from 'react';
export function Card({children,className=''}:{children:ReactNode;className?:string}){return <div className={`card ${className}`}>{children}</div>}
export function Label({children}:{children:ReactNode}){return <span className="kicker">{children}</span>}
export function Stat({label,value,detail}:{label:string;value:ReactNode;detail?:string}){return <Card><div className="statLabel">{label}</div><div className="statValue">{value}</div>{detail?<div className="statDetail">{detail}</div>:null}</Card>}
export function Tag({children,tone='rose'}:{children:ReactNode;tone?:'rose'|'sage'|'amber'|'ink'|'muted'}){return <span className={`tag ${tone}`}>{children}</span>}
export function PageHead({eyebrow,title,body,actions}:{eyebrow:string;title:string;body:string;actions?:ReactNode}){return <section className="pageHead"><Label>{eyebrow}</Label><h1>{title}</h1><p>{body}</p>{actions?<div className="heroActions">{actions}</div>:null}</section>}
export function Empty({children}:{children:ReactNode}){return <div className="empty">{children}</div>}
export function Row({href,title,meta,right}:{href:string;title:string;meta:string;right?:ReactNode}){return <Link href={href} className="row"><div><b>{title}</b><span>{meta}</span></div>{right}</Link>}
