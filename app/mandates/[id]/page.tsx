'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, PageHead, Stat, Tag } from '@/components/ui';
import { TxNotice } from '@/components/TxNotice';
import { getMandate, txStateFromError, writeFn } from '@/lib/genlayer/vellum';
import type { Mandate, TxState } from '@/lib/types';
import { dateTime, gen, parseGen } from '@/lib/format';
import { useWallet } from '@/lib/wallet/WalletProvider';

export default function MandatePage() {
  const p = useParams<{ id: string }>();
  const w = useWallet();
  const [x, setX] = useState<Mandate | null>(null);
  const [error, setError] = useState('');
  const [tx, setTx] = useState<TxState>({ kind: 'idle' });
  const [funding, setFunding] = useState('1');
  const [withdrawal, setWithdrawal] = useState('1');

  const load = async () => {
    try { setX(await getMandate(Number(p.id))); setError(''); }
    catch (e: any) { setError(e?.message || String(e)); }
  };

  useEffect(() => { void load(); }, [p.id]);

  const transact = async (functionName: string, args: unknown[], value = 0n, label = 'Transaction') => {
    try {
      if (!w.address) throw new Error('Connect wallet first');
      if (!w.correct) throw new Error('Switch to StudioNet 61999');
      setTx({ kind: 'signing', message: `${label}: waiting for wallet signature.` });
      const r = await writeFn(w.address, functionName, args, value, (hash) =>
        setTx({ kind: 'pending', hash, message: `${label}: waiting for GenLayer acceptance.` }),
        (hash) => setTx({ kind: 'accepted', hash, message: `${label}: accepted; waiting for finalization and execution proof.` }),
        `mandate:${x?.id ?? p.id}`,
      );
      setTx({ kind: 'finalized', hash: r.hash, message: `${label}: finalized with successful GenVM execution.` });
      await load();
    } catch (e: unknown) {
      setTx(txStateFromError(e));
    }
  };

  if (error) return <div className="pageHead"><h1>Mandate unavailable</h1><p>{error}</p></div>;
  if (!x) return <div className="pageHead"><p>Reading mandate…</p></div>;

  return <>
    <PageHead
      eyebrow={`Mandate #${x.id} · charter #${x.charter_id}`}
      title={x.title}
      body={x.purpose}
      actions={<Link className="btn" href="/motions/new">Submit motion</Link>}
    />

    <div className="grid4">
      <Stat label="Available" value={`${gen(x.available)} GEN`} />
      <Stat label="Reserved" value={`${gen(x.reserved)} GEN`} />
      <Stat label="Appeal exposure" value={`${gen(x.appeal_liability)} GEN`} />
      <Stat label="Spent" value={`${gen(x.spent)} GEN`} />
    </div>

    <section className="section grid2">
      <Card>
        <dl className="detailGrid">
          <dt>Owner</dt><dd className="mono">{x.owner}</dd>
          <dt>Status</dt><dd><Tag tone={x.active ? 'sage' : 'muted'}>{x.active ? 'ACTIVE' : 'INACTIVE'}</Tag></dd>
          <dt>Expires</dt><dd>{dateTime(x.expires_at)}</dd>
          <dt>Created</dt><dd>{dateTime(x.created_at)}</dd>
          <dt>Funded</dt><dd>{gen(x.funded)} GEN</dd>
          <dt>Withdrawn</dt><dd>{gen(x.withdrawn)} GEN</dd>
          <dt>Open motions</dt><dd>{x.open_motions}</dd>
        </dl>
      </Card>
      <Card>
        <div className="kicker">Execution model</div>
        <p>PERMITTED motions reserve balance immediately. A non-PERMITTED motion locks equal provisional appeal exposure until its one appeal is resolved or its window closes. Neither lock is withdrawable, and both are counted exactly once.</p>
      </Card>
    </section>

    <section className="section grid2">
      <Card>
        <div className="sectionHead"><h2>Fund mandate</h2><p>any wallet may add GEN up to the ceiling</p></div>
        <form className="form" onSubmit={(e: FormEvent) => { e.preventDefault(); void transact('fund_mandate', [x.id], parseGen(funding), 'Fund mandate'); }}>
          <div className="field"><label>GEN amount</label><input className="input" value={funding} onChange={(e) => setFunding(e.target.value)} /></div>
          <button className="btn soft">Add escrow</button>
        </form>
      </Card>
      <Card>
        <div className="sectionHead"><h2>Owner controls</h2><p>reservations and live appeal exposure cannot be withdrawn</p></div>
        <form className="form" onSubmit={(e: FormEvent) => { e.preventDefault(); void transact('withdraw_available', [x.id, parseGen(withdrawal)], 0n, 'Withdraw available'); }}>
          <div className="field"><label>Withdraw GEN</label><input className="input" value={withdrawal} onChange={(e) => setWithdrawal(e.target.value)} /></div>
          <div className="formActions">
            <button className="btn secondary">Withdraw available</button>
            <button type="button" className="btn soft" onClick={() => void transact('deactivate_mandate', [x.id], 0n, 'Deactivate mandate')}>Deactivate</button>
          </div>
        </form>
      </Card>
    </section>

    <TxNotice tx={tx} />
  </>;
}
