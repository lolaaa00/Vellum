'use client';
import { useEffect, useState } from 'react';
import { getClaimable, writeFn } from '@/lib/genlayer/vellum';
import { gen } from '@/lib/format';
import { useWallet } from '@/lib/wallet/WalletProvider';

export function ClaimButton() {
  const w = useWallet();
  const [amount, setAmount] = useState('0');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const refresh = async () => {
    if (!w.address || !w.correct) { setAmount('0'); return; }
    try { setAmount(await getClaimable(w.address)); setError(''); }
    catch (e: any) { setError(e?.message || String(e)); }
  };
  useEffect(() => { void refresh(); }, [w.address, w.correct]);
  let positive = false;
  try { positive = BigInt(amount) > 0n; } catch {}
  if (!positive && !error) return null;
  return <button
    className="claimChip"
    disabled={busy || !positive}
    title={error || 'Return motion / appeal bonds from VELLUM claimable balance'}
    onClick={async () => {
      if (!w.address) return;
      try {
        setBusy(true); setError('');
        await writeFn(w.address, 'claim', []);
        await refresh();
      } catch (e: any) { setError(e?.message || String(e)); }
      finally { setBusy(false); }
    }}
  >{busy ? 'Claiming…' : error ? 'Claim unavailable' : `Claim ${gen(amount)} GEN`}</button>;
}
