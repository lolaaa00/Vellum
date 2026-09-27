export const short = (s?: string, n = 10) => !s ? '—' : s.length <= n ? s : `${s.slice(0, 6)}…${s.slice(-4)}`;
export const gen = (atto: string | bigint) => {
  try { return (Number(BigInt(atto)) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 4 }); }
  catch { return '0'; }
};
export const dateTime = (sec: number) => sec ? new Date(sec * 1000).toLocaleString() : '—';
export const parseGen = (value: string) => {
  const [whole, frac=''] = value.trim().split('.');
  if (!/^\d+$/.test(whole || '') || !/^\d*$/.test(frac) || frac.length > 18) throw new Error('Enter a valid GEN amount');
  return BigInt(whole || '0') * 10n**18n + BigInt((frac + '0'.repeat(18)).slice(0,18));
};
