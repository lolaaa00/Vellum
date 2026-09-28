# StudioNet verification

All transactions below target GenLayer StudioNet chain `61999` and contract `0x505C287A44a39a968157933c316174652fb83BfF`.

- Deployment: `0x1d7f787a7f5b8941dd9334c2a34e8c9c2a9c121883691b632b8fc58f75995613` — `FINALIZED`, `MAJORITY_AGREE`, leader `SUCCESS`.
- Charter #1: `0xd4f8de1f14b3f11ef19fc2a5e3523c0b014e0f0b304020faa2950253e35ed6a8` — finalized from the public controlled charter fixture.
- Mandate #1: `0xcb3415bf61e962831100daf6885b65909324c300c37a0bc7a9c48ffd23c5d812` — finalized and funded with `0.50 GEN`.
- Motion #1: `0x28e5bd1f10314ea6a61d4ba8c4e1499c41922c4df96ea84b5cf559281da0abc1` — finalized as `INSUFFICIENT_EVIDENCE`; `0.10 GEN` appeal liability locked.
- Appeal: `0x322a8a66604719f57b86031439a4036fd2ad4174dd142fc767109f06ed5df7b4` — finalized as `PERMITTED`; liability converted to a `0.10 GEN` reservation.

The final read shows motion #1 `REVIEWED`, `PERMITTED`, `RESERVED`, with zero appeal liability. Its immutable challenge deadline is `2026-09-29T16:54:53Z`. Execution is intentionally impossible before that deadline; this is a protocol-enforced 24-hour safety property, not an incomplete transaction. The mandate expires later at `2026-10-01T13:23:54Z`.

Controlled evidence:

- `https://vellum-eight-azure.vercel.app/verification/charter.txt`
- `https://vellum-eight-azure.vercel.app/verification/initial-evidence.txt`
- `https://vellum-eight-azure.vercel.app/verification/appeal-evidence.txt`

Repository verification completed locally: 21 Direct Mode contract tests, 7 frontend tests, TypeScript typecheck, ESLint (zero errors), production build, and GenVM lint/validation.
