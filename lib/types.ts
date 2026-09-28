export type Charter = {
  id: number; sponsor: string; title: string; source_url: string; source_hash: string;
  jurisdiction: string; scope: string; parent_id: number; published_at: number; open_motions: number; active: boolean;
};
export type Mandate = {
  id: number; owner: string; charter_id: number; title: string; purpose: string;
  max_amount: string; funded: string; spent: string; withdrawn: string; reserved: string;
  appeal_liability: string; open_motions: number; available: string; expires_at: number; created_at: number; active: boolean;
};
export type Motion = {
  id: number; mandate_id: number; proposer: string; beneficiary: string; amount: string;
  summary: string; evidence_urls_json: string; verdict: string; risk_class: string;
  rationale: string; material_clause: string; missing_fact: string; created_at: number;
  reviewed_at: number; challenge_until: number; status: string; appealed: boolean;
  appeal_actor: string; appeal_argument: string; appeal_evidence_json: string; evidence_digest: string;
  liability_locked: boolean; reservation_state: string; execution_block_reason: string;
  consensus_backed_fields: string[]; explanatory_fields: string[];
};
export type TxState = { kind: 'idle'|'signing'|'pending'|'accepted'|'finalized'|'uncertain'|'error'; message?: string; hash?: string };
