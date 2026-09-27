# Threat model

VELLUM is designed around adversarial governance inputs.

- **Prompt injection:** charter, motion, appeal and evidence text are explicitly untrusted; delimiter characters are neutralised and inputs are bounded.
- **Fake evidence:** validators fetch evidence URLs themselves. The browser does not submit fetched page bodies or semantic conclusions.
- **Mutable policy source:** a charter is pinned at publication. Later web edits do not silently rewrite the rulebook; publish a new version instead.
- **Overspending / duplicate approvals:** `reserved` escrow is deducted from available balance as soon as a motion is permitted. Execution checks the reservation again.
- **Appeal griefing:** only three governance roles may appeal and only once, with a minimum bond.
- **Early execution:** payment is impossible until the challenge window closes.
- **Semantic non-convergence:** validator agreement requires a repeated substantive verdict + risk class. Format-only agreement is insufficient.
- **SSRF-ish URLs:** only bounded HTTPS URLs are accepted and common private/local forms are rejected.
- **Frontend spoofing:** the frontend reads contract state directly and writes through an injected EIP-1193 wallet. There is no server-side decision API.

Before production use, Claude should run the current GenVM linter, Direct Mode, live StudioNet consensus tests, fee profiling and finality checks against the exact deployed source.
