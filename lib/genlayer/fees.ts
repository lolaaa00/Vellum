export async function estimateFees(client: any, request: Record<string, unknown>) {
  if (typeof client?.estimateTransactionFees !== 'function') return undefined;
  const opts = { appealRounds: 1n, rotations: [0n, 0n] };
  const base = await client.estimateTransactionFees(opts);
  if (typeof client?.simulateWriteContract === 'function' && typeof client?.estimateTransactionFeesFromSimulation === 'function') {
    const sim = await client.simulateWriteContract({ ...request, includeReceipt: true, fees: toFees(base) });
    const refined = await client.estimateTransactionFeesFromSimulation({ ...opts, simulation: sim });
    return toFees(refined);
  }
  return toFees(base);
}
function toFees(x: any) {
  if (!x?.distribution) return undefined;
  return { distribution: x.distribution, ...(x.messageAllocations ? {messageAllocations:x.messageAllocations}:{}), ...((x.feeValue ?? x.fee_value) !== undefined ? {feeValue:x.feeValue ?? x.fee_value}:{}) };
}
