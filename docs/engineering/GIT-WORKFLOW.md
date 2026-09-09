# Git, CI/CD & Agent Workflow

## Branch model

`main` is protected and releasable.

Short-lived branches:
- `feat/<topic>`;
- `fix/<topic>`;
- `refactor/<topic>`;
- `docs/<topic>`;
- agent/worktree variants may prefix an agent name if useful.

No coding agent commits directly to `main`.

## Commits

Prefer small semantic commits that leave the branch testable. Do not generate a giant "AI changes"
commit when changes can be separated meaningfully.

Do not amend/rewrite commits authored by others unless the human explicitly requests it.

## Pull requests

PR body includes:
- summary and rationale;
- scope/non-scope;
- implementation notes;
- test evidence;
- screenshots for meaningful UI changes;
- database/migration note;
- security/tenancy note;
- dependency note;
- rollback consideration where applicable.

Large cross-cutting PRs should reference an execution plan.

## Required CI

PR:
1. frozen install;
2. format check;
3. Oxlint type-aware;
4. TypeScript check;
5. unit tests;
6. integration/RLS tests;
7. build;
8. Playwright for relevant/critical changes;
9. CodeQL/dependency/security checks.

Use Turborepo affected/filtering when it preserves correctness.

## Dependency automation

- Renovate: routine version updates, grouping/policies, release-age delay.
- Dependabot: security alerts and security update PRs.
- Automatic merge may be enabled for trusted low-risk patch updates after all checks.
- Major updates and security-sensitive packages require human review.

## Protected paths / human review

Require human approval for changes touching, conceptually:
- RLS/policies/DB roles/migrations with destructive effect;
- auth/authz/session;
- policy engine/privileged tools;
- MCP trust/auth;
- production deploy/network/secrets;
- license/legal headers;
- branch protection/CI security policy;
- container privilege/security.

CODEOWNERS can express these paths once the repository structure exists.

## Environments

### Local
Docker Compose for developer dependencies. Disposable databases are preferred for tests.

### Staging
Every accepted `main` revision builds immutable images and deploys to an isolated staging
environment. Staging may share the same physical VPS initially, but not DB/schema/volumes/secrets.

### Production
Promotion is explicit and protected. Promote the **same tested image digest** from staging rather
than rebuilding source.

GitHub `production` environment:
- required human reviewer;
- environment-scoped secrets;
- branch/tag restrictions;
- deployment concurrency = 1.

## Coolify integration

Preferred flow:
1. GitHub Actions builds OCI images.
2. Push to GHCR with commit SHA and immutable digest.
3. CI deploys staging via Coolify webhook/API.
4. smoke/E2E checks staging.
5. production workflow waits for environment approval.
6. promote same digest to production.
7. verify health endpoint and deployment logs.

Production Compose/image references must not use `latest`.

## Rollback

Application rollback = redeploy prior known-good image digest.

Database rollback is not assumed. Use forward-compatible expand/contract migrations and explicit
recovery plans for destructive/data migrations.
