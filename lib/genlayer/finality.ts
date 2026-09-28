import type { TxState } from '@/lib/types';

const get = (value: unknown, ...keys: string[]): unknown => {
  let current = value as Record<string, unknown> | undefined;
  for (const key of keys) {
    if (!current || typeof current !== 'object') return undefined;
    current = current[key] as Record<string, unknown> | undefined;
  }
  return current;
};

export function classifyFinalizedReceipt(receipt: unknown): { ok: boolean; reason?: string } {
  const status = String(get(receipt, 'statusName') ?? get(receipt, 'status_name') ?? get(receipt, 'status') ?? '').toUpperCase();
  if (status !== 'FINALIZED' && status !== '7') return { ok: false, reason: `Transaction is not finalized (status: ${status || 'unknown'}).` };

  const leader = get(receipt, 'consensus_data', 'leader_receipt', '0') ?? get(receipt, 'consensusData', 'leaderReceipt', '0');
  const execution = String(get(leader, 'execution_result') ?? get(leader, 'executionResult') ?? get(receipt, 'txExecutionResultName') ?? '').toUpperCase();
  if (execution && execution !== 'SUCCESS' && execution !== 'FINISHED_WITH_RETURN') return { ok: false, reason: `GenVM execution failed (${execution}).` };
  if (!execution) return { ok: false, reason: 'Finalized receipt did not include explicit GenVM execution evidence.' };

  const consensus = String(get(receipt, 'result_name') ?? get(receipt, 'resultName') ?? '').toUpperCase();
  if (consensus && consensus !== 'MAJORITY_AGREE') return { ok: false, reason: `Consensus did not agree (${consensus}).` };
  return { ok: true };
}

export function txStateFromError(error: unknown): TxState {
  const e = error as Error & { hash?: string; uncertain?: boolean };
  return { kind: e?.uncertain ? 'uncertain' : 'error', hash: e?.hash, message: e?.message || String(error) };
}
