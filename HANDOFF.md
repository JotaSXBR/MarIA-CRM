# MarIA CRM handoff

Updated: 2026-09-17

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current objective

- Branch: `feat/media-messages`, PR #54, now merged with `main` at `adad13d`.
- Scope: WhatsApp-style attachments end to end — composer `+` menu (Fotos e vídeos / Documento / Contato), outbound image/video/document/voice + vCard contact sends, inbound media download and persistence, authenticated media retrieval, and inbox rendering.
- Product baseline on `main`: text inbox, WAHA interaction choreography, delivery reconciliation, and failed/unknown-send operator recovery are merged through PR #53.
- Related merged process change: PR #55 added the layered memory model and `maria-pattern-research`; it is included in this branch through the merge of `main`.

## Memory model

- `AGENTS.md`: always-on normative invariants and routing rules.
- `.devin/skills/`: focused procedures loaded only when relevant.
- `adr/`: durable architectural decisions and tradeoffs.
- `HANDOFF.md`: current branch, verified state, blockers, and immediate next actions only.
- Git, PRs, migrations, and test results remain the factual source of truth.
- Devin session resume (`devin -c` / `devin --resume`) preserves conversational context but is not shared repository memory.

## Verified state

- `pnpm verify` passed locally on 2026-09-17 after merging `main` and fixing `MediaStore` path handling: formatting, lint, typecheck, unit tests, PostgreSQL/API integration tests, built HTTP E2E, and build.
- `media-store.test.ts` covers a put/read round-trip and rejects invalid workspace IDs, traversal keys, and cross-workspace key reads.
- CodeQL must re-run in CI to confirm the two `js/path-injection` alerts are closed.
- Environment: Windows, Node 24.21.0, pnpm 11.26.0, Docker 29.7.2.

## Blockers and risks

- PR #54 still requires normal review and all required GitHub checks before merge.
- Media sends remain dependent on the tenant-scoped `MediaStore`; missing bytes must fail the dispatch rather than downgrade to text.
- Pre-existing local runtime artifacts remain untracked under `apps/api/data/media/` and must stay excluded from commits.

## Next actions

1. Push the merge and `MediaStore` fix, then watch PR #54 CI.
2. Merge PR #54 only after review and all required checks pass.
3. Choose the next product objective from current Git/PR state after this slice merges.
