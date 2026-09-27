# Originality boundary

VELLUM was designed after studying the *problem class* illustrated by GovSentry, not by forking or minimally modifying its implementation.

## GovSentry problem class studied

The useful idea is that governance actions can be dangerous or misleading and that GenLayer can put semantic consensus between a proposal and a consequential outcome.

## What VELLUM changes at the product level

- GovSentry inspects governance proposals that already exist on an external governor; VELLUM originates its own charter → mandate → motion → escrow lifecycle.
- GovSentry's authoritative facts are another chain's proposal state, calldata and proposal event; VELLUM's authoritative facts are a pinned natural-language charter, deterministic mandate budget and validator-fetched evidence.
- GovSentry produces an interception/security verdict for another governance stack; VELLUM directly reserves and releases its own escrowed GEN.
- GovSentry focuses on deceptive/malicious execution payloads; VELLUM focuses on constitutional authorisation, scope, procedure, beneficiary and evidence sufficiency.
- VELLUM's routes, storage model, prompt, verdict taxonomy, economic lifecycle and visual system were written independently.

SDK/wallet/deployment patterns follow public GenLayer conventions rather than another builder's proprietary product logic.
