# VELLUM

**Constitutional execution rails for governed treasuries on GenLayer StudioNet (61999).**

VELLUM turns a natural-language governance charter into a consequential treasury boundary without pretending that policy interpretation is deterministic. A charter is pinned from an external source, a mandate escrows GEN under that charter, and motions can release value only when independent GenLayer validators agree that the requested action is authorised by the charter, mandate and current evidence.

## The product

VELLUM is deliberately not a clone of GovSentry. It does not scan GovernorBravo/OpenZeppelin proposal calldata, classify malicious selectors, or act as an interception oracle. It starts from a different product boundary: **policy-backed treasury execution**.

The core lifecycle is:

1. **Publish charter** — validator-fetched HTTPS source is pinned as bounded text + SHA-256 digest.
2. **Create mandate** — a user narrows the charter into a purpose, ceiling and expiry and escrows GEN.
3. **Submit motion** — proposer specifies beneficiary, amount, natural-language action and evidence URLs.
4. **Consensus review** — validators fetch evidence and independently judge `PERMITTED`, `CONDITIONAL`, `CONFLICT`, or `INSUFFICIENT_EVIDENCE`.
5. **Reserve** — only `PERMITTED` motions reserve escrow.
6. **Challenge** — one bounded appeal may add evidence during the 24-hour window.
7. **Execute** — after the window, only a still-`PERMITTED` motion can transfer reserved GEN to the beneficiary.
8. **Receipt** — the frontend exposes the rationale, material clause, risk class and lifecycle as a readable consensus receipt.

## StudioNet only

This repository is intentionally pinned to:

- chain id: **61999**
- RPC: `https://studio.genlayer.com/api`
- explorer: `https://explorer-studio.genlayer.com`

Do not substitute Studio Dev / Studio Next 61997.

## Routes

- `/` editorial dashboard and live state
- `/charters/new`
- `/charters/[id]`
- `/mandates/new`
- `/mandates/[id]`
- `/motions/new`
- `/motions/[id]`
- `/receipts/[id]`
- `/demo`

The visual system is original: cream paper, rose, wine, sage and lilac with an editorial serif/sans pairing. It is intentionally distinct from GovSentry and from CAVEAT's dark execution-console identity.

## Security / consensus properties

- current evidence is fetched by validators, never trusted from browser-submitted page bodies;
- all semantic text is bounded and treated as untrusted evidence;
- prompt-delimiter injection is neutralised;
- custom equivalence validation re-runs the whole review and agrees on substantive `verdict + risk_class`;
- charter source is immutable once published; revisions create a new version;
- deterministic code owns budget arithmetic, reservation, expiry, roles and native transfers;
- one permitted motion cannot be overbooked by later motions because reservation reduces available balance immediately;
- no execution before the challenge window;
- one appeal only, restricted to governance participants and bonded;
- HTTPS evidence URLs are bounded and obvious private/local targets are rejected;
- no centralized backend decides the result.

See `docs/architecture.md` and `docs/threat-model.md`.

## Local preparation

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm install
```

Then:

```bash
genvm-lint check contracts/vellum.py
genvm-lint validate contracts/vellum.py
genvm-lint typecheck contracts/vellum.py
pytest tests/direct -q
npm run typecheck
npm run lint
npm run build
```

## Deployment

The production application is live at [vellum-eight-azure.vercel.app](https://vellum-eight-azure.vercel.app).

- contract: `0xc3A73ddf6DC8aa166e749f4D12a702758B4ea7Dd`
- deployment transaction: `0x44e52f2cda4f43eb474d9ae7fc893f8f6c228f4130bc3d45b4a7db204de104db`
- network: GenLayer StudioNet, chain `61999`
- deployment status: finalized, unanimous validator agreement, successful execution

The complete machine-readable record is in `artifacts/deployment.json`.
