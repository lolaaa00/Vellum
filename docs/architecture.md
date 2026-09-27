# VELLUM architecture

VELLUM is not a proposal-malware scanner and it does not decode another project's governance calldata. It is a **constitutional treasury execution rail**.

## Trust model

1. A charter sponsor publishes an HTTPS governance source.
2. GenLayer validators fetch the source and VELLUM stores an immutable bounded snapshot plus SHA-256 digest.
3. A mandate owner escrows GEN and narrows the charter to a purpose, ceiling and expiry.
4. A motion identifies a beneficiary, amount, summary and up to four HTTPS evidence URLs.
5. Validators independently fetch the evidence and semantically decide `PERMITTED`, `CONDITIONAL`, `CONFLICT`, or `INSUFFICIENT_EVIDENCE`.
6. A custom equivalence validator re-runs the complete review and requires agreement on both verdict and risk class, not merely JSON shape.
7. `PERMITTED` immediately reserves deterministic escrow, but payment remains locked for a 24-hour challenge window.
8. One bounded appeal may add evidence. Only the proposer, mandate owner or charter sponsor may file it, limiting griefing.
9. After the window, a `PERMITTED` motion can release GEN directly to the beneficiary. Any other verdict can only close and return bonds.

## Boundaries

The LLM never controls arithmetic, access control, expiry, reservations, payouts, URL count, input length or treasury accounting. Those are deterministic contract rules. All user and website text is wrapped as untrusted evidence and angle-bracket delimiters are neutralised before prompting.

## Why GenLayer

The hard question is not whether a number is within a ceiling. It is whether a real-world governance action is authorised by natural-language policy and current evidence when parties may disagree. Centralising that judgment in one backend defeats the purpose of the governance boundary. VELLUM makes the semantic decision part of validator consensus and ties it directly to execution of escrowed value.
