import { describe, expect, it } from 'vitest';
import { classifyFinalizedReceipt, txStateFromError } from '../../lib/genlayer/finality';

const receipt = (execution = 'SUCCESS', result = 'MAJORITY_AGREE') => ({
  status_name: 'FINALIZED',
  result_name: result,
  consensus_data: { leader_receipt: [{ execution_result: execution }] },
});

describe('GenLayer finality semantics', () => {
  it('does not treat ACCEPTED as final', () => {
    expect(classifyFinalizedReceipt({ ...receipt(), status_name: 'ACCEPTED' }).ok).toBe(false);
  });

  it('recognizes finalized successful execution', () => {
    expect(classifyFinalizedReceipt(receipt())).toEqual({ ok: true });
  });

  it('rejects finalized execution errors', () => {
    expect(classifyFinalizedReceipt(receipt('ERROR')).reason).toContain('GenVM execution failed');
  });

  it('handles consensus disagreement separately', () => {
    expect(classifyFinalizedReceipt(receipt('SUCCESS', 'DISAGREE')).reason).toContain('Consensus did not agree');
  });

  it('does not turn polling uncertainty into a false failure', () => {
    const error = Object.assign(new Error('Finality could not be confirmed.'), { uncertain: true, hash: '0xabc' });
    expect(txStateFromError(error)).toMatchObject({ kind: 'uncertain', hash: '0xabc' });
  });
});
