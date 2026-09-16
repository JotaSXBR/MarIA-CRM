# Development and verification

AGENTS.md defines the engineering contract. This file owns setup and verification procedures;
HANDOFF.md records the latest execution evidence. Exact versions come from `.nvmrc`, package
manifests and the lockfile. Commands below run at the repository root on a feature branch.

## Prerequisites

- Node matching `.nvmrc` and pnpm matching `package.json#packageManager`.
- A working Docker engine for the local database, integration tests and API process E2E.
- `pnpm install --frozen-lockfile --ignore-scripts` for an existing checkout.
- If pnpm is unavailable but Corepack exists, use `corepack pnpm` for the same commands.
  For scripts invoking pnpm internally, put the matching pnpm shim on PATH in that environment.

On WSL use Linux Node/pnpm/Docker integration; verify with `command -v node pnpm docker`.
On Windows use `Get-Command node,pnpm,docker`. Do not mix Windows shims with Linux dependencies.
Run `docker version` to check the server connection; a CLI alone is insufficient.

## Fresh local database: PowerShell

The following credentials are public development examples, only for a disposable local database.
Choose different credentials for any shared environment. Do not commit real credentials.

```powershell
pnpm install --frozen-lockfile --ignore-scripts
$env:POSTGRES_PASSWORD = 'local-admin-change-me'
$env:MIGRATION_DATABASE_URL = 'postgres://maria_admin:local-admin-change-me@127.0.0.1:5432/maria'
$env:RUNTIME_DATABASE_PASSWORD = 'local-runtime-change-me'
docker compose -f docker/compose.yaml up -d --wait
pnpm --filter @maria/database db:migrate --provision-runtime
$env:DATABASE_URL = 'postgres://maria_runtime:local-runtime-change-me@127.0.0.1:5432/maria'
$env:ADMIN_EMAIL = 'admin@example.test'
$env:ADMIN_PASSWORD = 'local-login-change-me'
Remove-Item Env:MIGRATION_DATABASE_URL,Env:RUNTIME_DATABASE_PASSWORD
pnpm dev
```

## Fresh local database: Linux / WSL

```bash
nvm use
pnpm install --frozen-lockfile --ignore-scripts
export POSTGRES_PASSWORD='local-admin-change-me'
export MIGRATION_DATABASE_URL='postgres://maria_admin:local-admin-change-me@127.0.0.1:5432/maria'
export RUNTIME_DATABASE_PASSWORD='local-runtime-change-me'
docker compose -f docker/compose.yaml up -d --wait
pnpm --filter @maria/database db:migrate --provision-runtime
export DATABASE_URL='postgres://maria_runtime:local-runtime-change-me@127.0.0.1:5432/maria'
export ADMIN_EMAIL='admin@example.test'
export ADMIN_PASSWORD='local-login-change-me'
unset MIGRATION_DATABASE_URL RUNTIME_DATABASE_PASSWORD
pnpm dev
```

Use URI-encoded passwords in connection URLs when credentials contain reserved characters.
The API runs at `http://127.0.0.1:3000`, the web app at `http://localhost:5173`. Log in using
the bootstrap administrator, create an organization/workspace in Administration and add the
administrator as a workspace member. Global administration alone does not grant CRM membership.
Select that workspace to use contacts, companies and Kanban.

`pnpm dev` uses dependency-aware Turbo watch: upstream packages build before the API starts,
and changes rebuild dependencies/restart development tasks. Runtime variables are explicitly
passed through; migration credentials are not passed to the API. Direct package dev commands
bypass this build orchestration. Stop with Ctrl+C; `docker compose -f docker/compose.yaml down`
stops the local DB without deleting its volume. Changing POSTGRES_PASSWORD does not rotate an
existing volume's credentials. ADMIN_EMAIL/ADMIN_PASSWORD seed a missing user, not reset a password.

## Migrations and runtime credentials

`pnpm db:migrate` invokes the shared runner using **MIGRATION_DATABASE_URL**, never DATABASE_URL.
The runner discovers numbered SQL files in `packages/database/drizzle`, checks SHA-256 history
in `public.maria_schema_migrations`, takes a transaction-scoped migration lock and applies pending
SQL with its ledger updates in a transaction. Failure rolls back the batch. Applied files are
immutable. The accepted SQL convention is transactional migrations; operations requiring execution
outside a transaction need a separately reviewed strategy before adding such SQL.

`pnpm --filter @maria/database db:migrate --provision-runtime` additionally provisions the runtime
password from RUNTIME_DATABASE_PASSWORD after migrations. Provisioning is a separate operation;
if it fails, migration history remains committed and rerunning safely retries provisioning.
Do not pass either privileged variable into application runtime. Shared/production credentials
come from that environment's secret manager, not these local example values.

Existing databases populated by the previous manual SQL workflow have **no ledger**. The runner
refuses automatic adoption. Preserve them: take and verify a backup, inventory applied SQL/schema
against the intended migration prefix, and obtain an explicit adoption plan/review before creating
history. No automatic baseline/adoption command is provided. Do not delete the volume, replay all
SQL, or fabricate ledger rows to bypass this check. This session does not migrate a persistent DB.

Drizzle Kit is not configured. Add reviewed numbered SQL and update `src/schema.ts` together.
The same discovery/runner is used by local setup, Testcontainers and CI. New migrations require:
empty DB application, upgrade from the previous prefix with existing data, no-op rerun, failure
rollback and history-drift rejection. Destructive operations need the contract's approval/backup
plan. Staging and production deployment wiring remains future work.

## Verification matrix

| Changed scope                | Smallest relevant checks                        | Required additional evidence                                                           |
| ---------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------- |
| Documentation / skills       | `pnpm fmt:check`, inspect links and commands    | References match actual scripts; no invented results                                   |
| API / auth                   | Package typecheck and relevant integration test | Session/role negatives; HTTP E2E for process/contract changes                          |
| Tenant persistence           | Database unit/integration tests                 | Restricted role, cross-tenant read/write/reference negatives, context cleanup          |
| Multi-row invariant          | Independent-connection integration tests        | Deliberately overlapping operations; losing operation rejected; invariant preserved    |
| Migration                    | Migration integration tests                     | Empty DB, prior-prefix upgrade/data retention, rerun, rollback, history rejection      |
| Web interaction              | Web typecheck and component tests               | Browser checklist below; component tests are not browser E2E                           |
| Image / delivery             | Docker build and CI smoke                       | Non-root/read-only image, runtime DB role, login, scoped CRUD, denied access, shutdown |
| Cross-cutting implementation | `pnpm verify`                                   | Relevant scope checks above; CI security/image checks remain additional                |

`pnpm verify` runs formatting, type-aware lint, typecheck, unit/component tests, PostgreSQL
integration, built API HTTP E2E and compilation. It does **not** run a real browser or build/smoke
the Docker image. CI adds dependency audit and the final image smoke; CodeQL runs separately.
Record command, date, OS/runtime, revision (including dirty scope), outcome and evidence location.
Blocked checks remain outstanding and must be rerun before merge; cached results must be identified.

### Browser coverage gap and acceptance

Automated browser E2E is not implemented. For changed UI flows, record manual checks until a
Playwright suite is introduced with reviewed dependency/build requirements:

1. Login/logout and unauthorized route redirect in a real browser.
2. Workspace selection and changing workspace without data from the previous workspace.
3. Contact/company create, edit and delete, including server errors.
4. Kanban drag/move and deal edit, persistence after reload, failed mutation recovery.
5. Admin visibility for global admin versus member; denied direct API access for members.
6. Each new API prefix through the Vite proxy, checking JSON rather than SPA HTML fallback.

The automated suite must cover these flows against real API/database before claiming browser E2E
coverage. A previous user's visual approval is historical evidence for that revision only.

## Tooling and state

Repository skills are ordinary files in `.devin/skills`; AGENTS.md lists their use. Optional RTK
hooks are gitignored local files and are not installed by cloning. Current work belongs in
HANDOFF.md, not agent config. Durable decisions belong in ADRs; deferred cosmetic refactors are
not prerequisites for unrelated feature slices. Never publish internal notes or credentials.
