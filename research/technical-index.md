# Índice técnico — antes da narrativa

[CODE] Índice estático de todos os arquivos versionados no commit `f1194d4dfd069982752a12f812e82a188f7dd898`. API pública aqui significa export TypeScript, não estabilidade contratual. Dependências são imports lexicais resolvidos: não capturam DI, strings SQL, imports dinâmicos calculados ou chamadas HTTP. Export não prova uso. A leitura profunda está indicada por registros E; os demais grupos são cobertura estrutural, não auditoria semântica integral.

## .bun-version

Module: `.bun-version`  
Path: [diretório](sources/agents/.bun-version)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [.bun-version](sources/agents/.bun-version) — 2 linhas; exports: —.

</details>

## .claude

Module: `.claude`  
Path: [diretório](sources/agents/.claude)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:token  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 61

<details><summary>Arquivos e exports</summary>

- [.claude/hooks/check-before-stop.sh](sources/agents/.claude/hooks/check-before-stop.sh) — 30 linhas; exports: —.
- [.claude/rules/prisma.md](sources/agents/.claude/rules/prisma.md) — 78 linhas; exports: —.
- [.claude/settings.json](sources/agents/.claude/settings.json) — 17 linhas; exports: —.
- [.claude/skills/agents-dev/SKILL.md](sources/agents/.claude/skills/agents-dev/SKILL.md) — 36 linhas; exports: —.
- [.claude/skills/agents-dev/gotchas.md](sources/agents/.claude/skills/agents-dev/gotchas.md) — 7 linhas; exports: —.
- [.claude/skills/agents-dev/guardrails.md](sources/agents/.claude/skills/agents-dev/guardrails.md) — 7 linhas; exports: —.
- [.claude/skills/agents-dev/references/00-get-the-code.md](sources/agents/.claude/skills/agents-dev/references/00-get-the-code.md) — 27 linhas; exports: —.
- [.claude/skills/agents-dev/references/01-layout-and-bun-check.md](sources/agents/.claude/skills/agents-dev/references/01-layout-and-bun-check.md) — 30 linhas; exports: —.
- [.claude/skills/agents-dev/references/02-free-full-and-invariants.md](sources/agents/.claude/skills/agents-dev/references/02-free-full-and-invariants.md) — 8 linhas; exports: —.
- [.claude/skills/agents-dev/references/03-implement.md](sources/agents/.claude/skills/agents-dev/references/03-implement.md) — 10 linhas; exports: —.
- [.claude/skills/agents-dev/references/04-own-image-and-deploy.md](sources/agents/.claude/skills/agents-dev/references/04-own-image-and-deploy.md) — 14 linhas; exports: —.
- [.claude/skills/agents-onboarding/SKILL.md](sources/agents/.claude/skills/agents-onboarding/SKILL.md) — 81 linhas; exports: —.
- [.claude/skills/agents-onboarding/gotchas.md](sources/agents/.claude/skills/agents-onboarding/gotchas.md) — 158 linhas; exports: —.
- [.claude/skills/agents-onboarding/guardrails.md](sources/agents/.claude/skills/agents-onboarding/guardrails.md) — 67 linhas; exports: —.
- [.claude/skills/agents-onboarding/references/00-prereqs-and-access.md](sources/agents/.claude/skills/agents-onboarding/references/00-prereqs-and-access.md) — 38 linhas; exports: —.
- [.claude/skills/agents-onboarding/references/01-vps-dns-ssh.md](sources/agents/.claude/skills/agents-onboarding/references/01-vps-dns-ssh.md) — 72 linhas; exports: —.
- [.claude/skills/agents-onboarding/references/01b-brownfield.md](sources/agents/.claude/skills/agents-onboarding/references/01b-brownfield.md) — 104 linhas; exports: —.
- [.claude/skills/agents-onboarding/references/01c-pick-tier.md](sources/agents/.claude/skills/agents-onboarding/references/01c-pick-tier.md) — 63 linhas; exports: —.
- [.claude/skills/agents-onboarding/references/02-coolify.md](sources/agents/.claude/skills/agents-onboarding/references/02-coolify.md) — 118 linhas; exports: —.
- [.claude/skills/agents-onboarding/references/03-chatwoot-pro.md](sources/agents/.claude/skills/agents-onboarding/references/03-chatwoot-pro.md) — 62 linhas; exports: —.
- [.claude/skills/agents-onboarding/references/04-agents-image.md](sources/agents/.claude/skills/agents-onboarding/references/04-agents-image.md) — 50 linhas; exports: —.
- [.claude/skills/agents-onboarding/references/05-langfuse.md](sources/agents/.claude/skills/agents-onboarding/references/05-langfuse.md) — 73 linhas; exports: —.
- [.claude/skills/agents-onboarding/references/06-setup-and-mcp.md](sources/agents/.claude/skills/agents-onboarding/references/06-setup-and-mcp.md) — 73 linhas; exports: —.
- [.claude/skills/agents-onboarding/references/08-agent-import.md](sources/agents/.claude/skills/agents-onboarding/references/08-agent-import.md) — 66 linhas; exports: —.
- [.claude/skills/agents-onboarding/references/09-chatwoot-bind.md](sources/agents/.claude/skills/agents-onboarding/references/09-chatwoot-bind.md) — 50 linhas; exports: —.
- [.claude/skills/agents-onboarding/references/10-validate-e2e.md](sources/agents/.claude/skills/agents-onboarding/references/10-validate-e2e.md) — 55 linhas; exports: —.
- [.claude/skills/agents-onboarding/references/agent-features.md](sources/agents/.claude/skills/agents-onboarding/references/agent-features.md) — 74 linhas; exports: —.
- [.claude/skills/agents-onboarding/references/chatwoot-hub-register.md](sources/agents/.claude/skills/agents-onboarding/references/chatwoot-hub-register.md) — 96 linhas; exports: —.
- [.claude/skills/agents-onboarding/references/deploy-b-portainer.md](sources/agents/.claude/skills/agents-onboarding/references/deploy-b-portainer.md) — 139 linhas; exports: —.
- [.claude/skills/agents-onboarding/references/deploy-c-compose.md](sources/agents/.claude/skills/agents-onboarding/references/deploy-c-compose.md) — 68 linhas; exports: —.
- [.claude/skills/agents-onboarding/references/migracao-v3.md](sources/agents/.claude/skills/agents-onboarding/references/migracao-v3.md) — 357 linhas; exports: —.
- [.claude/skills/agents-onboarding/samples/agents/README.md](sources/agents/.claude/skills/agents-onboarding/samples/agents/README.md) — 35 linhas; exports: —.
- [.claude/skills/agents-onboarding/samples/agents/maria-clinica-moreira.json](sources/agents/.claude/skills/agents-onboarding/samples/agents/maria-clinica-moreira.json) — 313 linhas; exports: —.
- [.claude/skills/agents-onboarding/samples/agents/rui-transportadora-http.json](sources/agents/.claude/skills/agents-onboarding/samples/agents/rui-transportadora-http.json) — 130 linhas; exports: —.
- [.claude/skills/agents-onboarding/scripts/chatwoot-admin.py](sources/agents/.claude/skills/agents-onboarding/scripts/chatwoot-admin.py) — 390 linhas; exports: —.
- [.claude/skills/agents-onboarding/scripts/coolify.py](sources/agents/.claude/skills/agents-onboarding/scripts/coolify.py) — 553 linhas; exports: —.
- [.claude/skills/agents-onboarding/scripts/docker-status.py](sources/agents/.claude/skills/agents-onboarding/scripts/docker-status.py) — 130 linhas; exports: —.
- [.claude/skills/agents-onboarding/scripts/harbor-login.py](sources/agents/.claude/skills/agents-onboarding/scripts/harbor-login.py) — 119 linhas; exports: —.
- [.claude/skills/agents-onboarding/scripts/langfuse-set-password.py](sources/agents/.claude/skills/agents-onboarding/scripts/langfuse-set-password.py) — 273 linhas; exports: —.
- [.claude/skills/agents-onboarding/scripts/langfuse-verify.py](sources/agents/.claude/skills/agents-onboarding/scripts/langfuse-verify.py) — 119 linhas; exports: —.
- [.claude/skills/agents-onboarding/scripts/portainer-brownfield.py](sources/agents/.claude/skills/agents-onboarding/scripts/portainer-brownfield.py) — 118 linhas; exports: —.
- [.claude/skills/agents-onboarding/scripts/remote.py](sources/agents/.claude/skills/agents-onboarding/scripts/remote.py) — 199 linhas; exports: —.
- [.claude/skills/agents-onboarding/scripts/sshkey.py](sources/agents/.claude/skills/agents-onboarding/scripts/sshkey.py) — 141 linhas; exports: —.
- [.claude/skills/agents-onboarding/templates/chatwoot/.env.example](sources/agents/.claude/skills/agents-onboarding/templates/chatwoot/.env.example) — 32 linhas; exports: —.
- [.claude/skills/agents-onboarding/templates/chatwoot/README.md](sources/agents/.claude/skills/agents-onboarding/templates/chatwoot/README.md) — 66 linhas; exports: —.
- [.claude/skills/agents-onboarding/templates/chatwoot/docker-compose.coolify.yml](sources/agents/.claude/skills/agents-onboarding/templates/chatwoot/docker-compose.coolify.yml) — 138 linhas; exports: —.
- [.claude/skills/agents-onboarding/templates/chatwoot/docker-compose.yml](sources/agents/.claude/skills/agents-onboarding/templates/chatwoot/docker-compose.yml) — 140 linhas; exports: —.
- [.claude/skills/agents-onboarding/templates/langfuse/.env.example](sources/agents/.claude/skills/agents-onboarding/templates/langfuse/.env.example) — 60 linhas; exports: —.
- [.claude/skills/agents-onboarding/templates/langfuse/README.md](sources/agents/.claude/skills/agents-onboarding/templates/langfuse/README.md) — 133 linhas; exports: —.
- [.claude/skills/agents-onboarding/templates/langfuse/docker-compose.coolify.yml](sources/agents/.claude/skills/agents-onboarding/templates/langfuse/docker-compose.coolify.yml) — 190 linhas; exports: —.
- [.claude/skills/agents-onboarding/templates/langfuse/docker-compose.yml](sources/agents/.claude/skills/agents-onboarding/templates/langfuse/docker-compose.yml) — 186 linhas; exports: —.
- [.claude/skills/agents-operation/SKILL.md](sources/agents/.claude/skills/agents-operation/SKILL.md) — 44 linhas; exports: —.
- [.claude/skills/agents-operation/gotchas.md](sources/agents/.claude/skills/agents-operation/gotchas.md) — 62 linhas; exports: —.
- [.claude/skills/agents-operation/guardrails.md](sources/agents/.claude/skills/agents-operation/guardrails.md) — 27 linhas; exports: —.
- [.claude/skills/agents-operation/references/00-production-safety.md](sources/agents/.claude/skills/agents-operation/references/00-production-safety.md) — 25 linhas; exports: —.
- [.claude/skills/agents-operation/references/01-diagnose.md](sources/agents/.claude/skills/agents-operation/references/01-diagnose.md) — 35 linhas; exports: —.
- [.claude/skills/agents-operation/references/02-reproduce.md](sources/agents/.claude/skills/agents-operation/references/02-reproduce.md) — 23 linhas; exports: —.
- [.claude/skills/agents-operation/references/03-adjust.md](sources/agents/.claude/skills/agents-operation/references/03-adjust.md) — 48 linhas; exports: —.
- [.claude/skills/agents-operation/references/04-validate-and-apply.md](sources/agents/.claude/skills/agents-operation/references/04-validate-and-apply.md) — 32 linhas; exports: —.
- [.claude/skills/agents-operation/references/05-load-sim.md](sources/agents/.claude/skills/agents-operation/references/05-load-sim.md) — 65 linhas; exports: —.
- [.claude/skills/agents-operation/scripts/simulate-load.py](sources/agents/.claude/skills/agents-operation/scripts/simulate-load.py) — 385 linhas; exports: —.

</details>

## .dockerignore

Module: `.dockerignore`  
Path: [diretório](sources/agents/.dockerignore)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [.dockerignore](sources/agents/.dockerignore) — 19 linhas; exports: —.

</details>

## .env.example

Module: `.env.example`  
Path: [diretório](sources/agents/.env.example)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [.env.example](sources/agents/.env.example) — 308 linhas; exports: —.

</details>

## .github

Module: `.github`  
Path: [diretório](sources/agents/.github)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 6

<details><summary>Arquivos e exports</summary>

- [.github/workflows/build-check.yml](sources/agents/.github/workflows/build-check.yml) — 83 linhas; exports: —.
- [.github/workflows/deploy-swagger.yml](sources/agents/.github/workflows/deploy-swagger.yml) — 144 linhas; exports: —.
- [.github/workflows/label-needs-triage.yml](sources/agents/.github/workflows/label-needs-triage.yml) — 33 linhas; exports: —.
- [.github/workflows/lint.yml](sources/agents/.github/workflows/lint.yml) — 63 linhas; exports: —.
- [.github/workflows/publish_github_package.yml](sources/agents/.github/workflows/publish_github_package.yml) — 231 linhas; exports: —.
- [.github/workflows/test.yml](sources/agents/.github/workflows/test.yml) — 147 linhas; exports: —.

</details>

## .gitignore

Module: `.gitignore`  
Path: [diretório](sources/agents/.gitignore)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [.gitignore](sources/agents/.gitignore) — 60 linhas; exports: —.

</details>

## .husky

Module: `.husky`  
Path: [diretório](sources/agents/.husky)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [.husky/pre-commit](sources/agents/.husky/pre-commit) — 5 linhas; exports: —.

</details>

## .vscode

Module: `.vscode`  
Path: [diretório](sources/agents/.vscode)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [.vscode/settings.json](sources/agents/.vscode/settings.json) — 18 linhas; exports: —.

</details>

## CLA.md

Module: `CLA.md`  
Path: [diretório](sources/agents/CLA.md)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [CLA.md](sources/agents/CLA.md) — 85 linhas; exports: —.

</details>

## CLAUDE.md

Module: `CLAUDE.md`  
Path: [diretório](sources/agents/CLAUDE.md)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [CLAUDE.md](sources/agents/CLAUDE.md) — 149 linhas; exports: —.

</details>

## CONTRIBUTING-en.md

Module: `CONTRIBUTING-en.md`  
Path: [diretório](sources/agents/CONTRIBUTING-en.md)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [CONTRIBUTING-en.md](sources/agents/CONTRIBUTING-en.md) — 59 linhas; exports: —.

</details>

## CONTRIBUTING.md

Module: `CONTRIBUTING.md`  
Path: [diretório](sources/agents/CONTRIBUTING.md)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [CONTRIBUTING.md](sources/agents/CONTRIBUTING.md) — 59 linhas; exports: —.

</details>

## Dockerfile

Module: `Dockerfile`  
Path: [diretório](sources/agents/Dockerfile)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [Dockerfile](sources/agents/Dockerfile) — 62 linhas; exports: —.

</details>

## LICENSE

Module: `LICENSE`  
Path: [diretório](sources/agents/LICENSE)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [LICENSE](sources/agents/LICENSE) — 203 linhas; exports: —.

</details>

## NOTICE

Module: `NOTICE`  
Path: [diretório](sources/agents/NOTICE)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [NOTICE](sources/agents/NOTICE) — 10 linhas; exports: —.

</details>

## README-en.md

Module: `README-en.md`  
Path: [diretório](sources/agents/README-en.md)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [README-en.md](sources/agents/README-en.md) — 156 linhas; exports: —.

</details>

## README.md

Module: `README.md`  
Path: [diretório](sources/agents/README.md)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [README.md](sources/agents/README.md) — 156 linhas; exports: —.

</details>

## biome-plugins

Module: `biome-plugins`  
Path: [diretório](sources/agents/biome-plugins)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 6

<details><summary>Arquivos e exports</summary>

- [biome-plugins/always-render-modal.grit](sources/agents/biome-plugins/always-render-modal.grit) — 84 linhas; exports: —.
- [biome-plugins/no-bun-public-env.grit](sources/agents/biome-plugins/no-bun-public-env.grit) — 15 linhas; exports: —.
- [biome-plugins/no-dynamic-i18n-key.grit](sources/agents/biome-plugins/no-dynamic-i18n-key.grit) — 24 linhas; exports: —.
- [biome-plugins/no-dynamic-translate-key.grit](sources/agents/biome-plugins/no-dynamic-translate-key.grit) — 16 linhas; exports: —.
- [biome-plugins/no-t-rename.grit](sources/agents/biome-plugins/no-t-rename.grit) — 28 linhas; exports: —.
- [biome-plugins/require-page-container.grit](sources/agents/biome-plugins/require-page-container.grit) — 34 linhas; exports: X.

</details>

## biome.jsonc

Module: `biome.jsonc`  
Path: [diretório](sources/agents/biome.jsonc)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [biome.jsonc](sources/agents/biome.jsonc) — 96 linhas; exports: —.

</details>

## build.ts

Module: `build.ts`  
Path: [diretório](sources/agents/build.ts)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package.json, package:bun-plugin-tailwind, package:fs, package:path  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [build.ts](sources/agents/build.ts) — 210 linhas; exports: —.

</details>

## bun-env.d.ts

Module: `bun-env.d.ts`  
Path: [diretório](sources/agents/bun-env.d.ts)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [bun-env.d.ts](sources/agents/bun-env.d.ts) — 10 linhas; exports: —.

</details>

## bun.lock

Module: `bun.lock`  
Path: [diretório](sources/agents/bun.lock)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:: , package:: [  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [bun.lock](sources/agents/bun.lock) — 2033 linhas; exports: —.

</details>

## bunfig.toml

Module: `bunfig.toml`  
Path: [diretório](sources/agents/bunfig.toml)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [bunfig.toml](sources/agents/bunfig.toml) — 11 linhas; exports: —.

</details>

## docker-compose.coolify.yml

Module: `docker-compose.coolify.yml`  
Path: [diretório](sources/agents/docker-compose.coolify.yml)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [docker-compose.coolify.yml](sources/agents/docker-compose.coolify.yml) — 111 linhas; exports: —.

</details>

## docker-compose.portainer.yml

Module: `docker-compose.portainer.yml`  
Path: [diretório](sources/agents/docker-compose.portainer.yml)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [docker-compose.portainer.yml](sources/agents/docker-compose.portainer.yml) — 175 linhas; exports: —.

</details>

## docker-compose.prod.yml

Module: `docker-compose.prod.yml`  
Path: [diretório](sources/agents/docker-compose.prod.yml)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [docker-compose.prod.yml](sources/agents/docker-compose.prod.yml) — 129 linhas; exports: —.

</details>

## docker-compose.yml

Module: `docker-compose.yml`  
Path: [diretório](sources/agents/docker-compose.yml)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [docker-compose.yml](sources/agents/docker-compose.yml) — 25 linhas; exports: —.

</details>

## docs

Module: `docs`  
Path: [diretório](sources/agents/docs)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package: is not , package:we did not ask, src/api, src/client/lib  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 30

<details><summary>Arquivos e exports</summary>

- [docs/api-and-fleet.md](sources/agents/docs/api-and-fleet.md) — 144 linhas; exports: —.
- [docs/auth.md](sources/agents/docs/auth.md) — 18 linhas; exports: —.
- [docs/bun-compile-segfault.md](sources/agents/docs/bun-compile-segfault.md) — 22 linhas; exports: —.
- [docs/cdn-r2-setup.md](sources/agents/docs/cdn-r2-setup.md) — 216 linhas; exports: —.
- [docs/channel-redirect.md](sources/agents/docs/channel-redirect.md) — 176 linhas; exports: —.
- [docs/chatwoot.md](sources/agents/docs/chatwoot.md) — 297 linhas; exports: —.
- [docs/contact-auth.md](sources/agents/docs/contact-auth.md) — 561 linhas; exports: —.
- [docs/csp.md](sources/agents/docs/csp.md) — 16 linhas; exports: —.
- [docs/debounce.md](sources/agents/docs/debounce.md) — 55 linhas; exports: —.
- [docs/deploy.md](sources/agents/docs/deploy.md) — 117 linhas; exports: —.
- [docs/documents.md](sources/agents/docs/documents.md) — 348 linhas; exports: —.
- [docs/eden-treaty.md](sources/agents/docs/eden-treaty.md) — 66 linhas; exports: —.
- [docs/frontend-env-vars.md](sources/agents/docs/frontend-env-vars.md) — 21 linhas; exports: —.
- [docs/google-oauth.md](sources/agents/docs/google-oauth.md) — 26 linhas; exports: —.
- [docs/graph.md](sources/agents/docs/graph.md) — 178 linhas; exports: —.
- [docs/i18n.md](sources/agents/docs/i18n.md) — 60 linhas; exports: ErrorTranslationKey.
- [docs/integrations.md](sources/agents/docs/integrations.md) — 93 linhas; exports: —.
- [docs/logs.md](sources/agents/docs/logs.md) — 96 linhas; exports: —.
- [docs/mcp.md](sources/agents/docs/mcp.md) — 204 linhas; exports: —.
- [docs/modals.md](sources/agents/docs/modals.md) — 55 linhas; exports: —.
- [docs/playground.md](sources/agents/docs/playground.md) — 74 linhas; exports: —.
- [docs/realtime.md](sources/agents/docs/realtime.md) — 110 linhas; exports: —.
- [docs/routing.md](sources/agents/docs/routing.md) — 36 linhas; exports: —.
- [docs/service-window.md](sources/agents/docs/service-window.md) — 33 linhas; exports: —.
- [docs/spend-ceiling.md](sources/agents/docs/spend-ceiling.md) — 550 linhas; exports: —.
- [docs/split.md](sources/agents/docs/split.md) — 78 linhas; exports: —.
- [docs/stt.md](sources/agents/docs/stt.md) — 76 linhas; exports: —.
- [docs/tenancy.md](sources/agents/docs/tenancy.md) — 115 linhas; exports: —.
- [docs/tts.md](sources/agents/docs/tts.md) — 100 linhas; exports: —.
- [docs/ui.md](sources/agents/docs/ui.md) — 214 linhas; exports: —.

</details>

## i18next-parser.api.config.cjs

Module: `i18next-parser.api.config.cjs`  
Path: [diretório](sources/agents/i18next-parser.api.config.cjs)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [i18next-parser.api.config.cjs](sources/agents/i18next-parser.api.config.cjs) — 31 linhas; exports: —.

</details>

## i18next-parser.config.cjs

Module: `i18next-parser.config.cjs`  
Path: [diretório](sources/agents/i18next-parser.config.cjs)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [i18next-parser.config.cjs](sources/agents/i18next-parser.config.cjs) — 41 linhas; exports: —.

</details>

## openapi.json

Module: `openapi.json`  
Path: [diretório](sources/agents/openapi.json)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [openapi.json](sources/agents/openapi.json) — 40573 linhas; exports: —.

</details>

## package.json

Module: `package.json`  
Path: [diretório](sources/agents/package.json)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: build.ts  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [package.json](sources/agents/package.json) — 121 linhas; exports: —.

</details>

## prisma

Module: `prisma`  
Path: [diretório](sources/agents/prisma)  
Responsibility: Modelo relacional e evolução SQL incluindo RLS e vetor.  
Public API: schema.prisma; migrations  
Internal API: funções auxiliares nos arquivos abaixo; fronteiras reais detalhadas nos registros E  
Dependencies: package:Chatwoot agreed  
Dependents: nenhum import lexical identificado  
Runtime relevance: Persistência de aplicação; E19, E26  
Confidence: HIGH nos fluxos citados; não em todo símbolo  
Files: 92

<details><summary>Arquivos e exports</summary>

- [prisma/migrations/20260727000000_init/migration.sql](sources/agents/prisma/migrations/20260727000000_init/migration.sql) — 1379 linhas; exports: —.
- [prisma/migrations/20260802075309_branding_footer_links/migration.sql](sources/agents/prisma/migrations/20260802075309_branding_footer_links/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260804030100_contact_conversation_custom_attributes/migration.sql](sources/agents/prisma/migrations/20260804030100_contact_conversation_custom_attributes/migration.sql) — 7 linhas; exports: —.
- [prisma/migrations/20260804140000_contact_custom_attributes_watermark/migration.sql](sources/agents/prisma/migrations/20260804140000_contact_custom_attributes_watermark/migration.sql) — 3 linhas; exports: —.
- [prisma/migrations/20260804160000_integration_route_token_readable/migration.sql](sources/agents/prisma/migrations/20260804160000_integration_route_token_readable/migration.sql) — 3 linhas; exports: —.
- [prisma/migrations/20260807032257_agent_follow_up_armed_at/migration.sql](sources/agents/prisma/migrations/20260807032257_agent_follow_up_armed_at/migration.sql) — 10 linhas; exports: —.
- [prisma/migrations/20260814191926_conversation_chatwoot_state_versions/migration.sql](sources/agents/prisma/migrations/20260814191926_conversation_chatwoot_state_versions/migration.sql) — 4 linhas; exports: —.
- [prisma/migrations/20260815180000_conversation_failure_notice/migration.sql](sources/agents/prisma/migrations/20260815180000_conversation_failure_notice/migration.sql) — 3 linhas; exports: —.
- [prisma/migrations/20260815210000_tool_expected_statuses/migration.sql](sources/agents/prisma/migrations/20260815210000_tool_expected_statuses/migration.sql) — 4 linhas; exports: —.
- [prisma/migrations/20260817210000_tts_normalize_default_on/migration.sql](sources/agents/prisma/migrations/20260817210000_tts_normalize_default_on/migration.sql) — 40 linhas; exports: —.
- [prisma/migrations/20260818120000_followup_armed_at_backfill_rls/migration.sql](sources/agents/prisma/migrations/20260818120000_followup_armed_at_backfill_rls/migration.sql) — 26 linhas; exports: —.
- [prisma/migrations/20260819220000_attendance_summaries/migration.sql](sources/agents/prisma/migrations/20260819220000_attendance_summaries/migration.sql) — 45 linhas; exports: —.
- [prisma/migrations/20260820000000_business_hours_exceptions/migration.sql](sources/agents/prisma/migrations/20260820000000_business_hours_exceptions/migration.sql) — 13 linhas; exports: —.
- [prisma/migrations/20260820140000_conversation_away_message_sent_at/migration.sql](sources/agents/prisma/migrations/20260820140000_conversation_away_message_sent_at/migration.sql) — 10 linhas; exports: —.
- [prisma/migrations/20260821120000_scheduler_claim_seq/migration.sql](sources/agents/prisma/migrations/20260821120000_scheduler_claim_seq/migration.sql) — 9 linhas; exports: —.
- [prisma/migrations/20260821210000_agent_thread_agent_watermark/migration.sql](sources/agents/prisma/migrations/20260821210000_agent_thread_agent_watermark/migration.sql) — 12 linhas; exports: —.
- [prisma/migrations/20260822150000_conversation_resolved_by/migration.sql](sources/agents/prisma/migrations/20260822150000_conversation_resolved_by/migration.sql) — 29 linhas; exports: —.
- [prisma/migrations/20260822151000_agent_thread_recent_message_ids/migration.sql](sources/agents/prisma/migrations/20260822151000_agent_thread_recent_message_ids/migration.sql) — 38 linhas; exports: —.
- [prisma/migrations/20260822153000_scheduler_ingest_message_kind/migration.sql](sources/agents/prisma/migrations/20260822153000_scheduler_ingest_message_kind/migration.sql) — 2 linhas; exports: —.
- [prisma/migrations/20260822160000_contact_scoped_by_instance/migration.sql](sources/agents/prisma/migrations/20260822160000_contact_scoped_by_instance/migration.sql) — 88 linhas; exports: —.
- [prisma/migrations/20260822161000_contact_identity_watermark/migration.sql](sources/agents/prisma/migrations/20260822161000_contact_identity_watermark/migration.sql) — 66 linhas; exports: —.
- [prisma/migrations/20260822180000_scheduler_job_payload_secret/migration.sql](sources/agents/prisma/migrations/20260822180000_scheduler_job_payload_secret/migration.sql) — 10 linhas; exports: —.
- [prisma/migrations/20260822215900_document_tool_source/migration.sql](sources/agents/prisma/migrations/20260822215900_document_tool_source/migration.sql) — 9 linhas; exports: —.
- [prisma/migrations/20260822220000_documents/migration.sql](sources/agents/prisma/migrations/20260822220000_documents/migration.sql) — 140 linhas; exports: —.
- [prisma/migrations/20260822220000_playground_turn_notes/migration.sql](sources/agents/prisma/migrations/20260822220000_playground_turn_notes/migration.sql) — 36 linhas; exports: —.
- [prisma/migrations/20260823170000_drop_tool_risk_tier/migration.sql](sources/agents/prisma/migrations/20260823170000_drop_tool_risk_tier/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260825140000_scheduler_delivery_sweep_kind/migration.sql](sources/agents/prisma/migrations/20260825140000_scheduler_delivery_sweep_kind/migration.sql) — 7 linhas; exports: —.
- [prisma/migrations/20260825140100_delivery_conversation_ref/migration.sql](sources/agents/prisma/migrations/20260825140100_delivery_conversation_ref/migration.sql) — 107 linhas; exports: —.
- [prisma/migrations/20260825200000_chatwoot_first_response_mirror/migration.sql](sources/agents/prisma/migrations/20260825200000_chatwoot_first_response_mirror/migration.sql) — 6 linhas; exports: —.
- [prisma/migrations/20260826140000_conversation_redirect_origin/migration.sql](sources/agents/prisma/migrations/20260826140000_conversation_redirect_origin/migration.sql) — 9 linhas; exports: —.
- [prisma/migrations/20260826150000_delivery_ledger_keyset_indexes/migration.sql](sources/agents/prisma/migrations/20260826150000_delivery_ledger_keyset_indexes/migration.sql) — 25 linhas; exports: —.
- [prisma/migrations/20260826200000_inbound_delivery_claimed_at/migration.sql](sources/agents/prisma/migrations/20260826200000_inbound_delivery_claimed_at/migration.sql) — 37 linhas; exports: —.
- [prisma/migrations/20260826210000_scheduler_delivery_recovery_kind/migration.sql](sources/agents/prisma/migrations/20260826210000_scheduler_delivery_recovery_kind/migration.sql) — 7 linhas; exports: —.
- [prisma/migrations/20260826210000_thread_turn_claim/migration.sql](sources/agents/prisma/migrations/20260826210000_thread_turn_claim/migration.sql) — 39 linhas; exports: —.
- [prisma/migrations/20260826220000_appointment_record/migration.sql](sources/agents/prisma/migrations/20260826220000_appointment_record/migration.sql) — 121 linhas; exports: —.
- [prisma/migrations/20260826230000_drop_redundant_tenant_index_agent_threads/migration.sql](sources/agents/prisma/migrations/20260826230000_drop_redundant_tenant_index_agent_threads/migration.sql) — 46 linhas; exports: —.
- [prisma/migrations/20260826230000_tool_appointment_declaration/migration.sql](sources/agents/prisma/migrations/20260826230000_tool_appointment_declaration/migration.sql) — 9 linhas; exports: —.
- [prisma/migrations/20260826230001_drop_redundant_tenant_index_chatwoot_agent_bots/migration.sql](sources/agents/prisma/migrations/20260826230001_drop_redundant_tenant_index_chatwoot_agent_bots/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260826230002_drop_redundant_tenant_index_chatwoot_instances/migration.sql](sources/agents/prisma/migrations/20260826230002_drop_redundant_tenant_index_chatwoot_instances/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260826230003_drop_redundant_tenant_index_contacts/migration.sql](sources/agents/prisma/migrations/20260826230003_drop_redundant_tenant_index_contacts/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260826230004_drop_redundant_tenant_index_conversations/migration.sql](sources/agents/prisma/migrations/20260826230004_drop_redundant_tenant_index_conversations/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260826230005_drop_redundant_tenant_index_conversion_events/migration.sql](sources/agents/prisma/migrations/20260826230005_drop_redundant_tenant_index_conversion_events/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260826230006_drop_redundant_tenant_index_document_templates/migration.sql](sources/agents/prisma/migrations/20260826230006_drop_redundant_tenant_index_document_templates/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260826230007_drop_redundant_tenant_index_inbound_deliveries/migration.sql](sources/agents/prisma/migrations/20260826230007_drop_redundant_tenant_index_inbound_deliveries/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260826230008_drop_redundant_tenant_index_inboxes/migration.sql](sources/agents/prisma/migrations/20260826230008_drop_redundant_tenant_index_inboxes/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260826230009_drop_redundant_tenant_index_integration_external_refs/migration.sql](sources/agents/prisma/migrations/20260826230009_drop_redundant_tenant_index_integration_external_refs/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260826230010_drop_redundant_tenant_index_integration_instances/migration.sql](sources/agents/prisma/migrations/20260826230010_drop_redundant_tenant_index_integration_instances/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260826230011_drop_redundant_tenant_index_issued_documents/migration.sql](sources/agents/prisma/migrations/20260826230011_drop_redundant_tenant_index_issued_documents/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260826230012_drop_redundant_tenant_index_mcp_server_connections/migration.sql](sources/agents/prisma/migrations/20260826230012_drop_redundant_tenant_index_mcp_server_connections/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260826230013_drop_redundant_tenant_index_outbound_webhook_deliveries/migration.sql](sources/agents/prisma/migrations/20260826230013_drop_redundant_tenant_index_outbound_webhook_deliveries/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260826230014_drop_redundant_tenant_index_prompt_variant_assignments/migration.sql](sources/agents/prisma/migrations/20260826230014_drop_redundant_tenant_index_prompt_variant_assignments/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260826230015_drop_redundant_tenant_index_scheduler_jobs/migration.sql](sources/agents/prisma/migrations/20260826230015_drop_redundant_tenant_index_scheduler_jobs/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260826230016_drop_redundant_tenant_index_tool_definitions/migration.sql](sources/agents/prisma/migrations/20260826230016_drop_redundant_tenant_index_tool_definitions/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260826230017_drop_redundant_tenant_index_vault_entries/migration.sql](sources/agents/prisma/migrations/20260826230017_drop_redundant_tenant_index_vault_entries/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260827000000_appointment_provider/migration.sql](sources/agents/prisma/migrations/20260827000000_appointment_provider/migration.sql) — 17 linhas; exports: —.
- [prisma/migrations/20260827000000_contact_auth_grant/migration.sql](sources/agents/prisma/migrations/20260827000000_contact_auth_grant/migration.sql) — 66 linhas; exports: —.
- [prisma/migrations/20260827000000_rls_split_tenant_and_fleet_policies/migration.sql](sources/agents/prisma/migrations/20260827000000_rls_split_tenant_and_fleet_policies/migration.sql) — 213 linhas; exports: —.
- [prisma/migrations/20260830000000_conversation_reset_boundary/migration.sql](sources/agents/prisma/migrations/20260830000000_conversation_reset_boundary/migration.sql) — 7 linhas; exports: —.
- [prisma/migrations/20260831000000_reply_burst_claim/migration.sql](sources/agents/prisma/migrations/20260831000000_reply_burst_claim/migration.sql) — 12 linhas; exports: —.
- [prisma/migrations/20260901000000_status_claim/migration.sql](sources/agents/prisma/migrations/20260901000000_status_claim/migration.sql) — 26 linhas; exports: —.
- [prisma/migrations/20260902100000_delivery_owed_takeover/migration.sql](sources/agents/prisma/migrations/20260902100000_delivery_owed_takeover/migration.sql) — 31 linhas; exports: —.
- [prisma/migrations/20260902100100_scheduler_takeover_recovery_kind/migration.sql](sources/agents/prisma/migrations/20260902100100_scheduler_takeover_recovery_kind/migration.sql) — 12 linhas; exports: —.
- [prisma/migrations/20260902130000_inbox_observers/migration.sql](sources/agents/prisma/migrations/20260902130000_inbox_observers/migration.sql) — 51 linhas; exports: —.
- [prisma/migrations/20260902140000_console_write_message_order/migration.sql](sources/agents/prisma/migrations/20260902140000_console_write_message_order/migration.sql) — 18 linhas; exports: —.
- [prisma/migrations/20260902150000_fleet_api_keys/migration.sql](sources/agents/prisma/migrations/20260902150000_fleet_api_keys/migration.sql) — 18 linhas; exports: —.
- [prisma/migrations/20260903100000_scheduler_observe_kind/migration.sql](sources/agents/prisma/migrations/20260903100000_scheduler_observe_kind/migration.sql) — 8 linhas; exports: —.
- [prisma/migrations/20260903120000_rename_http_tools_named_after_natives/migration.sql](sources/agents/prisma/migrations/20260903120000_rename_http_tools_named_after_natives/migration.sql) — 114 linhas; exports: —.
- [prisma/migrations/20260903130000_delivery_route_observed/migration.sql](sources/agents/prisma/migrations/20260903130000_delivery_route_observed/migration.sql) — 40 linhas; exports: —.
- [prisma/migrations/20260903130000_spend_ceiling_in_dollars/migration.sql](sources/agents/prisma/migrations/20260903130000_spend_ceiling_in_dollars/migration.sql) — 55 linhas; exports: —.
- [prisma/migrations/20260903140000_audit_latest_at_indexes/migration.sql](sources/agents/prisma/migrations/20260903140000_audit_latest_at_indexes/migration.sql) — 48 linhas; exports: —.
- [prisma/migrations/20260903140000_code_tool_source/migration.sql](sources/agents/prisma/migrations/20260903140000_code_tool_source/migration.sql) — 5 linhas; exports: —.
- [prisma/migrations/20260903140100_code_tool_definitions/migration.sql](sources/agents/prisma/migrations/20260903140100_code_tool_definitions/migration.sql) — 72 linhas; exports: —.
- [prisma/migrations/20260903140200_drop_run_code_native_grants/migration.sql](sources/agents/prisma/migrations/20260903140200_drop_run_code_native_grants/migration.sql) — 15 linhas; exports: —.
- [prisma/migrations/20260903150000_restore_http_tools_renamed_off_run_code/migration.sql](sources/agents/prisma/migrations/20260903150000_restore_http_tools_renamed_off_run_code/migration.sql) — 100 linhas; exports: —.
- [prisma/migrations/20260903150100_drop_inert_run_code_preconditions/migration.sql](sources/agents/prisma/migrations/20260903150100_drop_inert_run_code_preconditions/migration.sql) — 109 linhas; exports: —.
- [prisma/migrations/20260904100000_inbox_responder_bound_at/migration.sql](sources/agents/prisma/migrations/20260904100000_inbox_responder_bound_at/migration.sql) — 14 linhas; exports: —.
- [prisma/migrations/20260904170000_audit_keyset_by_time/migration.sql](sources/agents/prisma/migrations/20260904170000_audit_keyset_by_time/migration.sql) — 91 linhas; exports: —.
- [prisma/migrations/20260904170001_audit_assert_indexes_valid/migration.sql](sources/agents/prisma/migrations/20260904170001_audit_assert_indexes_valid/migration.sql) — 25 linhas; exports: —.
- [prisma/migrations/20260904170002_audit_drop_tenant_created_at_idx/migration.sql](sources/agents/prisma/migrations/20260904170002_audit_drop_tenant_created_at_idx/migration.sql) — 13 linhas; exports: —.
- [prisma/migrations/20260904170003_audit_drop_created_at_idx/migration.sql](sources/agents/prisma/migrations/20260904170003_audit_drop_created_at_idx/migration.sql) — 13 linhas; exports: —.
- [prisma/migrations/20260904170004_audit_drop_fleet_created_at_idx/migration.sql](sources/agents/prisma/migrations/20260904170004_audit_drop_fleet_created_at_idx/migration.sql) — 21 linhas; exports: —.
- [prisma/migrations/20260908120000_rename_mcp_oauth_consent_actions/migration.sql](sources/agents/prisma/migrations/20260908120000_rename_mcp_oauth_consent_actions/migration.sql) — 52 linhas; exports: —.
- [prisma/migrations/20260908160000_audit_drop_fleet_id_idx/migration.sql](sources/agents/prisma/migrations/20260908160000_audit_drop_fleet_id_idx/migration.sql) — 24 linhas; exports: —.
- [prisma/migrations/20260908170000_binding_generation/migration.sql](sources/agents/prisma/migrations/20260908170000_binding_generation/migration.sql) — 35 linhas; exports: —.
- [prisma/migrations/20260908170001_route_remembers/migration.sql](sources/agents/prisma/migrations/20260908170001_route_remembers/migration.sql) — 12 linhas; exports: —.
- [prisma/migrations/20260908170002_observer_attached_at/migration.sql](sources/agents/prisma/migrations/20260908170002_observer_attached_at/migration.sql) — 28 linhas; exports: —.
- [prisma/migrations/20260908170003_binding_generation_triggers/migration.sql](sources/agents/prisma/migrations/20260908170003_binding_generation_triggers/migration.sql) — 122 linhas; exports: —.
- [prisma/migrations/20260908170004_human_reply_sibling_idx/migration.sql](sources/agents/prisma/migrations/20260908170004_human_reply_sibling_idx/migration.sql) — 34 linhas; exports: —.
- [prisma/migrations/20260908170005_assert_delivery_indexes_valid/migration.sql](sources/agents/prisma/migrations/20260908170005_assert_delivery_indexes_valid/migration.sql) — 27 linhas; exports: —.
- [prisma/migrations/20260908180000_delivery_turn_covered/migration.sql](sources/agents/prisma/migrations/20260908180000_delivery_turn_covered/migration.sql) — 21 linhas; exports: —.
- [prisma/migrations/migration_lock.toml](sources/agents/prisma/migrations/migration_lock.toml) — 4 linhas; exports: —.
- [prisma/schema.prisma](sources/agents/prisma/schema.prisma) — 2133 linhas; exports: —.

</details>

## prisma.config.ts

Module: `prisma.config.ts`  
Path: [diretório](sources/agents/prisma.config.ts)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:prisma  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [prisma.config.ts](sources/agents/prisma.config.ts) — 34 linhas; exports: —.

</details>

## public

Module: `public`  
Path: [diretório](sources/agents/public)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 6

<details><summary>Arquivos e exports</summary>

- [public/assets/logo-light.png](sources/agents/public/assets/logo-light.png) — binary linhas; exports: —.
- [public/assets/logo.png](sources/agents/public/assets/logo.png) — binary linhas; exports: —.
- [public/favicon-dark.png](sources/agents/public/favicon-dark.png) — binary linhas; exports: —.
- [public/favicon-light.png](sources/agents/public/favicon-light.png) — binary linhas; exports: —.
- [public/index.css](sources/agents/public/index.css) — 291 linhas; exports: —.
- [public/index.html](sources/agents/public/index.html) — 74 linhas; exports: —.

</details>

## scripts

Module: `scripts`  
Path: [diretório](sources/agents/scripts)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:${fleetRole}, package:${path}, package:@langchain/core, package:@modelcontextprotocol/sdk, package:@prisma/adapter-pg, package:node:crypto, package:node:fs, package:node:os, package:node:path, package:pg, src/api, src/bootstrap, src/graph, src/graph/tools, src/lib, src/modules/mcp, src/modules/memory  
Dependents: tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 13

<details><summary>Arquivos e exports</summary>

- [scripts/build-openapi.ts](sources/agents/scripts/build-openapi.ts) — 207 linhas; exports: —.
- [scripts/db-bootstrap.sql](sources/agents/scripts/db-bootstrap.sql) — 410 linhas; exports: —.
- [scripts/db-bootstrap.ts](sources/agents/scripts/db-bootstrap.ts) — 1206 linhas; exports: parseAppRole, RoleProvisioningPlan, planRoleProvisioning, assertRuntimeRoleIsUnprivileged, FLEET_ROLE_FORBIDDEN_ATTRIBUTES, assertFleetRoleIsUnprivileged, fleetMembershipRepair, assertFleetMembership.
- [scripts/gen-onboarding-env.ts](sources/agents/scripts/gen-onboarding-env.ts) — 191 linhas; exports: OnboardingEnvOptions, OnboardingEnv, buildOnboardingEnv.
- [scripts/i18n-extract.ts](sources/agents/scripts/i18n-extract.ts) — 146 linhas; exports: I18nExtractConfig, I18nExtractResult, runI18nExtract.
- [scripts/mcp-stdio-smoke.ts](sources/agents/scripts/mcp-stdio-smoke.ts) — 88 linhas; exports: —.
- [scripts/mcp-tools-check.ts](sources/agents/scripts/mcp-tools-check.ts) — 79 linhas; exports: —.
- [scripts/measure-summary-battery.ts](sources/agents/scripts/measure-summary-battery.ts) — 209 linhas; exports: —.
- [scripts/seed-local-demo.ts](sources/agents/scripts/seed-local-demo.ts) — 167 linhas; exports: —.
- [scripts/set-admin.ts](sources/agents/scripts/set-admin.ts) — 148 linhas; exports: ExistingUserUpdatePlan, planExistingUserUpdate.
- [scripts/setup.ts](sources/agents/scripts/setup.ts) — 97 linhas; exports: —.
- [scripts/test-db-setup.ts](sources/agents/scripts/test-db-setup.ts) — 176 linhas; exports: —.
- [scripts/tool-name-translate-table.ts](sources/agents/scripts/tool-name-translate-table.ts) — 42 linhas; exports: —.

</details>

## src/api

Module: `src/api`  
Path: [diretório](sources/agents/src/api)  
Responsibility: Rotas e validação de entrada; delegates para serviços.  
Public API: controllers  
Internal API: funções auxiliares nos arquivos abaixo; fronteiras reais detalhadas nos registros E  
Dependencies: package:@elysiajs/jwt, package:@elysiajs/openapi, package:@prisma/adapter-pg, package:elysia, package:elysia-rate-limit, package:i18next, package:node:async_hooks, package:node:crypto, package:node:path, package:pino, package:pino-pretty, package:zod, src/api/features/admin, src/api/features/auth, src/api/features/branding, src/api/features/health, src/api/features/i18n, src/api/features/invitations, src/api/features/realtime, src/api/features/updates, src/bootstrap, src/lib, src/modules/agents, src/modules/analytics, src/modules/api-keys, src/modules/audit, src/modules/business-hours, src/modules/chatwoot, src/modules/code-tools, src/modules/conversations, src/modules/documents, src/modules/experiments, src/modules/flowlog, src/modules/guardrails, src/modules/integrations, src/modules/mcp, src/modules/mcp-connections, src/modules/models, src/modules/n8n-export, src/modules/playground, src/modules/rag, src/modules/spend-ceiling, src/modules/tenant-settings, src/modules/tool-definitions, src/modules/tts, src/modules/vault, src/modules/webhooks  
Dependents: docs, scripts, src/api/features/admin, src/api/features/auth, src/api/features/branding, src/api/features/health, src/api/features/i18n, src/api/features/invitations, src/api/features/realtime, src/api/features/updates, src/bootstrap, src/graph, src/graph/tools, src/lib, src/modules/agents, src/modules/analytics, src/modules/api-keys, src/modules/appointments, src/modules/audit, src/modules/business-hours, src/modules/channel-redirect, src/modules/chatwoot, src/modules/code-tools, src/modules/contact-auth, src/modules/conversations, src/modules/debounce, src/modules/documents, src/modules/experiments, src/modules/flowlog, src/modules/followups, src/modules/guardrails, src/modules/integrations, src/modules/mcp-connections, src/modules/mcp, src/modules/memory, src/modules/models, src/modules/n8n-export, src/modules/observe, src/modules/playground, src/modules/rag, src/modules/scheduler, src/modules/spend-ceiling, src/modules/split, src/modules/stt, src/modules/tenant-settings, src/modules/tool-definitions, src/modules/tts, src/modules/updates, src/modules/vault, src/modules/vision, src/modules/webhooks, tests  
Runtime relevance: Controle de acesso → serviços; E02, E03  
Confidence: HIGH nos fluxos citados; não em todo símbolo  
Files: 51

<details><summary>Arquivos e exports</summary>

- [src/api/index.ts](sources/agents/src/api/index.ts) — 259 linhas; exports: —.
- [src/api/lib/auth.ts](sources/agents/src/api/lib/auth.ts) — 244 linhas; exports: JWTPayload, AuthUser, authPlugin.
- [src/api/lib/clientIp.ts](sources/agents/src/api/lib/clientIp.ts) — 72 linhas; exports: extractForwardedIp, resolveClientIp.
- [src/api/lib/crypto.ts](sources/agents/src/api/lib/crypto.ts) — 49 linhas; exports: encryptJson, decryptJson.
- [src/api/lib/csp.ts](sources/agents/src/api/lib/csp.ts) — 134 linhas; exports: extractInlineScriptHashes, CspBuildOptions, buildCspDirectives, cspDirectives.
- [src/api/lib/i18n.ts](sources/agents/src/api/lib/i18n.ts) — 101 linhas; exports: Locale, requestContext, currentLocale, translate, translateWithLocale, getLocaleFromHeader.
- [src/api/lib/logger.ts](sources/agents/src/api/lib/logger.ts) — 112 linhas; exports: deepSanitizeObject.
- [src/api/lib/openapi.ts](sources/agents/src/api/lib/openapi.ts) — 133 linhas; exports: ErrorResponse, OAuthErrorResponse, errors, doc, ResponseDoc, jsonResponse, htmlResponse, errorResponse.
- [src/api/lib/origin.ts](sources/agents/src/api/lib/origin.ts) — 68 linhas; exports: parseOrigins, isOriginAllowed, originPlugin.
- [src/api/lib/prisma.ts](sources/agents/src/api/lib/prisma.ts) — 13 linhas; exports: —.
- [src/api/lib/query-filters.ts](sources/agents/src/api/lib/query-filters.ts) — 113 linhas; exports: parseQueryInstant, parseQueryEnum, parseQueryId, parseQueryText, parseQueryCount, parseQueryAuditCursor.
- [src/api/lib/realtime.ts](sources/agents/src/api/lib/realtime.ts) — 32 linhas; exports: WS_CLOSE, WsCloseCode, realtimeConfig.
- [src/api/lib/refusal.ts](sources/agents/src/api/lib/refusal.ts) — 66 linhas; exports: RefusalBody, refusalBody, refusalHeaders.
- [src/api/lib/schema-refusal.ts](sources/agents/src/api/lib/schema-refusal.ts) — 196 linhas; exports: SchemaRefusal, fieldFromPointer, schemaRefusal.
- [src/api/lib/step-up.ts](sources/agents/src/api/lib/step-up.ts) — 103 linhas; exports: StepUpPrincipal, STEP_UP_PASSWORD_DESCRIPTION, confirmStepUp, stepUpPrincipalOf, requireSession.
- [src/api/lib/unhandled-error.ts](sources/agents/src/api/lib/unhandled-error.ts) — 55 linhas; exports: isFrameworkRefusal, errorDetail.
- [src/api/locales/en.json](sources/agents/src/api/locales/en.json) — 255 linhas; exports: —.
- [src/api/locales/pt-BR.json](sources/agents/src/api/locales/pt-BR.json) — 255 linhas; exports: —.
- [src/api/middlewares/locale.ts](sources/agents/src/api/middlewares/locale.ts) — 11 linhas; exports: localeMiddleware.
- [src/api/middlewares/rateLimit.ts](sources/agents/src/api/middlewares/rateLimit.ts) — 211 linhas; exports: clientKeyFor, isMcpTransport, rateLimitMiddleware, mcpTransportRateLimitMiddleware, isCredentialRequest, credentialRateLimitMiddleware, staticRateLimitMiddleware, isRegisterRequest, registerRateLimitMiddleware.
- [src/api/middlewares/tenancy.ts](sources/agents/src/api/middlewares/tenancy.ts) — 39 linhas; exports: tenancyPlugin.
- [src/api/v1/agents.controller.ts](sources/agents/src/api/v1/agents.controller.ts) — 1465 linhas; exports: parseExpectedUpdatedAt, splitAgentUpdateBody, playgroundDraftSchema, playgroundTurnBodySchema, playgroundFollowupBodySchema, decodeMultipartFlag, agentsController.
- [src/api/v1/alert-channels.controller.ts](sources/agents/src/api/v1/alert-channels.controller.ts) — 218 linhas; exports: alertChannelsController.
- [src/api/v1/api-keys.controller.ts](sources/agents/src/api/v1/api-keys.controller.ts) — 208 linhas; exports: apiKeysController.
- [src/api/v1/audit.controller.ts](sources/agents/src/api/v1/audit.controller.ts) — 186 linhas; exports: auditController.
- [src/api/v1/business-hours.controller.ts](sources/agents/src/api/v1/business-hours.controller.ts) — 240 linhas; exports: businessHoursController.
- [src/api/v1/chatwoot-admin.controller.ts](sources/agents/src/api/v1/chatwoot-admin.controller.ts) — 654 linhas; exports: chatwootAdminController.
- [src/api/v1/chatwoot.controller.ts](sources/agents/src/api/v1/chatwoot.controller.ts) — 111 linhas; exports: chatwootController.
- [src/api/v1/code-tools.controller.ts](sources/agents/src/api/v1/code-tools.controller.ts) — 254 linhas; exports: writeBody, codeToolsController.
- [src/api/v1/document-templates.controller.ts](sources/agents/src/api/v1/document-templates.controller.ts) — 327 linhas; exports: writeBody, documentTemplatesController.
- [src/api/v1/documents.controller.ts](sources/agents/src/api/v1/documents.controller.ts) — 252 linhas; exports: threadIdSchema, documentsController.
- [src/api/v1/experiments.controller.ts](sources/agents/src/api/v1/experiments.controller.ts) — 254 linhas; exports: experimentsController.
- [src/api/v1/integrations-admin.controller.ts](sources/agents/src/api/v1/integrations-admin.controller.ts) — 358 linhas; exports: integrationsAdminController.
- [src/api/v1/integrations.controller.ts](sources/agents/src/api/v1/integrations.controller.ts) — 88 linhas; exports: integrationsController.
- [src/api/v1/knowledge.controller.ts](sources/agents/src/api/v1/knowledge.controller.ts) — 709 linhas; exports: readerSafeBlock, searchHitDto, knowledgeController.
- [src/api/v1/logs.controller.ts](sources/agents/src/api/v1/logs.controller.ts) — 195 linhas; exports: logsController.
- [src/api/v1/mcp-admin.controller.ts](sources/agents/src/api/v1/mcp-admin.controller.ts) — 250 linhas; exports: mcpAdminController.
- [src/api/v1/mcp-connections.controller.ts](sources/agents/src/api/v1/mcp-connections.controller.ts) — 239 linhas; exports: mcpConnectionsController.
- [src/api/v1/mcp-me.controller.ts](sources/agents/src/api/v1/mcp-me.controller.ts) — 101 linhas; exports: mcpMeController.
- [src/api/v1/mcp-oauth.controller.ts](sources/agents/src/api/v1/mcp-oauth.controller.ts) — 605 linhas; exports: mcpOAuthController.
- [src/api/v1/mcp.controller.ts](sources/agents/src/api/v1/mcp.controller.ts) — 115 linhas; exports: mcpController.
- [src/api/v1/n8n-export.controller.ts](sources/agents/src/api/v1/n8n-export.controller.ts) — 49 linhas; exports: n8nExportController.
- [src/api/v1/oauth-google.controller.ts](sources/agents/src/api/v1/oauth-google.controller.ts) — 367 linhas; exports: oauthGoogleVaultController, oauthGoogleCallbackController.
- [src/api/v1/oauth-mcp.controller.ts](sources/agents/src/api/v1/oauth-mcp.controller.ts) — 456 linhas; exports: oauthMcpVaultController, oauthMcpCallbackController.
- [src/api/v1/tenant-settings.controller.ts](sources/agents/src/api/v1/tenant-settings.controller.ts) — 410 linhas; exports: tenantSettingsController.
- [src/api/v1/tenants.admin.service.ts](sources/agents/src/api/v1/tenants.admin.service.ts) — 33 linhas; exports: updateTenant, createTenant, deleteTenant.
- [src/api/v1/tenants.service.ts](sources/agents/src/api/v1/tenants.service.ts) — 195 linhas; exports: TenantDto, TENANT_SELECT, toDto, listTenants, resolveTenantSelector, getTenant, tenantUpdateSchema, TenantUpdate, tenantCreateSchema, TenantCreate, assertTenantCreatable, assertTenantSlugAvailable, assertTenantUpdatable.
- [src/api/v1/tools.controller.ts](sources/agents/src/api/v1/tools.controller.ts) — 371 linhas; exports: writeBody, toolsController.
- [src/api/v1/v1.controller.ts](sources/agents/src/api/v1/v1.controller.ts) — 755 linhas; exports: v1Controller.
- [src/api/v1/vault.controller.ts](sources/agents/src/api/v1/vault.controller.ts) — 306 linhas; exports: vaultController.
- [src/api/v1/webhooks.controller.ts](sources/agents/src/api/v1/webhooks.controller.ts) — 370 linhas; exports: parseDeliveryQuery, webhooksController.

</details>

## src/api/features/admin

Module: `src/api/features/admin`  
Path: [diretório](sources/agents/src/api/features/admin)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:elysia, src/api, src/api/features/invitations, src/bootstrap, src/lib, src/modules/audit  
Dependents: src/api/features/invitations, src/api, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 2

<details><summary>Arquivos e exports</summary>

- [src/api/features/admin/admin.controller.ts](sources/agents/src/api/features/admin/admin.controller.ts) — 486 linhas; exports: adminController.
- [src/api/features/admin/admin.service.ts](sources/agents/src/api/features/admin/admin.service.ts) — 536 linhas; exports: ManageableRole, getUsers, TenantWithUserCount, listTenantsWithUserCounts, getAdminStats, UserNotInScopeError, CannotDeleteSelfError, LastAdminError, ConcurrentMoveError, TenantRequiredError, TenantNotChangeableError, TenantNotFoundError, EmailTakenInTenantError, updateUserRole, deleteUser.

</details>

## src/api/features/auth

Module: `src/api/features/auth`  
Path: [diretório](sources/agents/src/api/features/auth)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:elysia, package:jose, package:node:crypto, src/api, src/api/features/invitations, src/bootstrap, src/lib  
Dependents: src/api/features/invitations, src/api, src/bootstrap, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 4

<details><summary>Arquivos e exports</summary>

- [src/api/features/auth/auth.controller.ts](sources/agents/src/api/features/auth/auth.controller.ts) — 689 linhas; exports: authController.
- [src/api/features/auth/auth.service.ts](sources/agents/src/api/features/auth/auth.service.ts) — 302 linhas; exports: isEmailDomainAllowed, getSignupRoleForEmail, getUserByEmail, getUserById, getUserByGoogleId, createUser, SetupAlreadyCompleteError, slugifyCompany, createInitialAdmin, resolveDefaultTenantId, createGoogleUser, linkGoogleIdToUser, NoPasswordSetError, IncorrectPasswordError, getUserHasPassword, changeUserPassword, hashPassword, verifyPassword, updateLastLogin, getTenantName.
- [src/api/features/auth/google.service.ts](sources/agents/src/api/features/auth/google.service.ts) — 169 linhas; exports: GoogleProfile, GoogleEmailNotVerifiedError, GoogleEmailDomainNotAllowedError, GoogleIdMismatchError, GoogleAdminLinkBlockedError, GoogleRegistrationDisabledError, verifyGoogleIdToken, upsertGoogleUser.
- [src/api/features/auth/setup.service.ts](sources/agents/src/api/features/auth/setup.service.ts) — 88 linhas; exports: initSetupState, isSetupRequired, refreshSetupState, isSetupTokenRequired, verifySetupToken, completeSetup.

</details>

## src/api/features/branding

Module: `src/api/features/branding`  
Path: [diretório](sources/agents/src/api/features/branding)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:elysia, src/api, src/bootstrap, src/lib  
Dependents: src/api, src/modules/mcp, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 3

<details><summary>Arquivos e exports</summary>

- [src/api/features/branding/branding.admin.service.ts](sources/agents/src/api/features/branding/branding.admin.service.ts) — 45 linhas; exports: updateBrandingColors, setBrandingAsset, clearBrandingAsset.
- [src/api/features/branding/branding.controller.ts](sources/agents/src/api/features/branding/branding.controller.ts) — 230 linhas; exports: brandingController.
- [src/api/features/branding/branding.service.ts](sources/agents/src/api/features/branding/branding.service.ts) — 312 linhas; exports: SINGLETON_ID, AssetKind, AssetVariant, ColorMode, ASSET_MAX_BYTES, EXT_BY_TYPE, ALLOWED_ASSET_TYPES, ALLOWED_ASSET_FORMATS, GlobalBrandingDto, BrandingRow, DEFAULT_DTO, sanitizeBrandName, sanitizeSiteUrl, sanitizeSupportEmail, toDto, getGlobalBranding, assertBrandingColorsUpdatable, ColorUpdate, keyColumn, assetPath, ServedAsset, readBrandingAsset.

</details>

## src/api/features/health

Module: `src/api/features/health`  
Path: [diretório](sources/agents/src/api/features/health)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:elysia, src/api, src/bootstrap  
Dependents: src/api  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [src/api/features/health/health.controller.ts](sources/agents/src/api/features/health/health.controller.ts) — 65 linhas; exports: healthController.

</details>

## src/api/features/i18n

Module: `src/api/features/i18n`  
Path: [diretório](sources/agents/src/api/features/i18n)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:elysia, src/api  
Dependents: src/api  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [src/api/features/i18n/i18n.controller.ts](sources/agents/src/api/features/i18n/i18n.controller.ts) — 34 linhas; exports: i18nController.

</details>

## src/api/features/invitations

Module: `src/api/features/invitations`  
Path: [diretório](sources/agents/src/api/features/invitations)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:node:crypto, src/api, src/api/features/admin, src/api/features/auth, src/lib, src/modules/audit  
Dependents: src/api/features/admin, src/api/features/auth, src/api, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [src/api/features/invitations/invitation.service.ts](sources/agents/src/api/features/invitations/invitation.service.ts) — 341 linhas; exports: InviteStatus, InviteEmailInUseError, InviteInvalidError, InviteNotFoundError, CreateInviteParams, CreatedInvite, createInvite, InviteListItem, listInvites, revokeInvite, ValidatedInvite, findValidInviteByToken, AcceptInviteParams, acceptInvite.

</details>

## src/api/features/realtime

Module: `src/api/features/realtime`  
Path: [diretório](sources/agents/src/api/features/realtime)  
Responsibility: Pub/sub WebSocket local e tópicos por escopo.  
Public API: setPublisher; broadcastAgentConfigEvent  
Internal API: funções auxiliares nos arquivos abaixo; fronteiras reais detalhadas nos registros E  
Dependencies: package:elysia, src/api, src/lib  
Dependents: src/api, src/bootstrap, src/graph, src/modules/agents, src/modules/chatwoot, src/modules/conversations, src/modules/rag, tests  
Runtime relevance: Mutação → publisher Bun → conexão; E23  
Confidence: HIGH nos fluxos citados; não em todo símbolo  
Files: 2

<details><summary>Arquivos e exports</summary>

- [src/api/features/realtime/realtime.controller.ts](sources/agents/src/api/features/realtime/realtime.controller.ts) — 309 linhas; exports: realtimeController.
- [src/api/features/realtime/realtime.service.ts](sources/agents/src/api/features/realtime/realtime.service.ts) — 438 linhas; exports: TOPICS, PresenceTick, ChatMessage, PrivatePing, AdminBroadcast, ConversationEvent, AgentActivityPhase, AgentActivityStage, AgentActivityEvent, KnowledgeDocumentEvent, AgentConfigEvent, ServerEvent, setPublisher, broadcastChatMessage, broadcastAdminMessage, sendToUser, broadcastConversationEvent, broadcastAgentActivity, broadcastDocumentEvent, broadcastAgentConfigEvent, tryAttachEvents, detachEvents, EventsTenantResolution, resolveEventsTenant, tryAttachUser, detachUser, currentUserCount, presenceSnapshot.

</details>

## src/api/features/updates

Module: `src/api/features/updates`  
Path: [diretório](sources/agents/src/api/features/updates)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:elysia, src/api, src/modules/updates  
Dependents: src/api  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [src/api/features/updates/updates.controller.ts](sources/agents/src/api/features/updates/updates.controller.ts) — 25 linhas; exports: updatesController.

</details>

## src/bootstrap

Module: `src/bootstrap`  
Path: [diretório](sources/agents/src)  
Responsibility: Composição Elysia, publicação WebSocket e lifecycle dos workers.  
Public API: src/index.ts; src/app.ts  
Internal API: funções auxiliares nos arquivos abaixo; fronteiras reais detalhadas nos registros E  
Dependencies: package:@elysiajs/cors, package:@elysiajs/static, package:elysia, package:elysia-helmet, package:pino, src/api, src/api/features/auth, src/api/features/realtime, src/lib, src/modules/appointments, src/modules/channel-redirect, src/modules/chatwoot, src/modules/debounce, src/modules/flowlog, src/modules/followups, src/modules/mcp, src/modules/memory, src/modules/observe, src/modules/rag, src/modules/scheduler, src/modules/spend-ceiling, src/modules/webhooks  
Dependents: scripts, src/api/features/admin, src/api/features/auth, src/api/features/branding, src/api/features/health, src/api, src/client/lib, src/graph, src/graph/tools, src/lib, src/modules/agents, src/modules/chatwoot, src/modules/contact-auth, src/modules/debounce, src/modules/documents, src/modules/experiments, src/modules/flowlog, src/modules/mcp-connections, src/modules/mcp, src/modules/memory, src/modules/scheduler, src/modules/spend-ceiling, src/modules/tool-definitions, src/modules/updates, src/modules/vault, src/modules/webhooks, tests  
Runtime relevance: Boot → workers → stop em sinais; E01  
Confidence: HIGH nos fluxos citados; não em todo símbolo  
Files: 4

<details><summary>Arquivos e exports</summary>

- [src/app.ts](sources/agents/src/app.ts) — 274 linhas; exports: buildApp, App.
- [src/config.ts](sources/agents/src/config.ts) — 614 linhas; exports: parseIntSetting, assertLimiterBudgetsAreDistinct, assertCredentialBudgetIsTighter.
- [src/global.d.ts](sources/agents/src/global.d.ts) — 2 linhas; exports: —.
- [src/index.ts](sources/agents/src/index.ts) — 255 linhas; exports: —.

</details>

## src/client/App.tsx

Module: `src/client/App.tsx`  
Path: [diretório](sources/agents/src/client/App.tsx)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:@radix-ui/react-tooltip, package:react-router, src/client/components, src/client/contexts, src/client/pages  
Dependents: src/client/frontend.tsx  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [src/client/App.tsx](sources/agents/src/client/App.tsx) — 289 linhas; exports: App.

</details>

## src/client/components

Module: `src/client/components`  
Path: [diretório](sources/agents/src/client/components)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:@codemirror/autocomplete, package:@codemirror/commands, package:@codemirror/lang-javascript, package:@codemirror/language, package:@codemirror/state, package:@codemirror/view, package:@lezer/highlight, package:@radix-ui/react-dialog, package:@radix-ui/react-dropdown-menu, package:@radix-ui/react-popover, package:@radix-ui/react-toast, package:@radix-ui/react-tooltip, package:chose this, package:everything, package:i18next, package:lucide-react, package:react, package:react-i18next, package:react-markdown, package:react-router, package:remark-gfm, src/client/contexts, src/client/hooks, src/client/lib, src/graph, src/lib, src/modules/business-hours, src/modules/flowlog  
Dependents: src/client/App.tsx, src/client/contexts, src/client/hooks, src/client/lib, src/client/pages, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 88

<details><summary>Arquivos e exports</summary>

- [src/client/components/AnnouncementBanner.tsx](sources/agents/src/client/components/AnnouncementBanner.tsx) — 126 linhas; exports: AnnouncementBanner.
- [src/client/components/Badge.tsx](sources/agents/src/client/components/Badge.tsx) — 41 linhas; exports: Badge.
- [src/client/components/BrandFooter.tsx](sources/agents/src/client/components/BrandFooter.tsx) — 32 linhas; exports: BrandFooter.
- [src/client/components/Breadcrumbs.tsx](sources/agents/src/client/components/Breadcrumbs.tsx) — 58 linhas; exports: Breadcrumbs.
- [src/client/components/BusinessHoursForm.tsx](sources/agents/src/client/components/BusinessHoursForm.tsx) — 558 linhas; exports: WindowSpec, ScheduleException, BusinessHoursFormProps, BusinessHoursForm.
- [src/client/components/Button.tsx](sources/agents/src/client/components/Button.tsx) — 80 linhas; exports: Button.
- [src/client/components/Card.tsx](sources/agents/src/client/components/Card.tsx) — 21 linhas; exports: Card.
- [src/client/components/CodeEditor.tsx](sources/agents/src/client/components/CodeEditor.tsx) — 607 linhas; exports: completionsFor, hoverInfo, SHOW_SCOPE_KEYS, scopeKeyLabel, isMacLike, sourceFor, namesKeyOf, CodeEditorProps, CodeEditor.
- [src/client/components/CodeMirrorField.tsx](sources/agents/src/client/components/CodeMirrorField.tsx) — 481 linhas; exports: EditorCap, CodeMirrorFieldProps, CodeMirrorField.
- [src/client/components/ComboBox.tsx](sources/agents/src/client/components/ComboBox.tsx) — 379 linhas; exports: ComboItem, ComboBox.
- [src/client/components/ConfirmDialog.tsx](sources/agents/src/client/components/ConfirmDialog.tsx) — 72 linhas; exports: ConfirmPayload, ConfirmDialog.
- [src/client/components/CredentialForm.tsx](sources/agents/src/client/components/CredentialForm.tsx) — 1243 linhas; exports: parseLangfuseEnv, CredentialForm.
- [src/client/components/CredentialPicker.tsx](sources/agents/src/client/components/CredentialPicker.tsx) — 571 linhas; exports: CredentialPicker.
- [src/client/components/CredentialTestResult.tsx](sources/agents/src/client/components/CredentialTestResult.tsx) — 68 linhas; exports: CredentialTestState, CredentialTestResult.
- [src/client/components/DataBoundary.tsx](sources/agents/src/client/components/DataBoundary.tsx) — 107 linhas; exports: DataBoundary.
- [src/client/components/DiscardDialog.tsx](sources/agents/src/client/components/DiscardDialog.tsx) — 73 linhas; exports: DiscardDialog.
- [src/client/components/Dropdown.tsx](sources/agents/src/client/components/Dropdown.tsx) — 110 linhas; exports: DropdownItem, Dropdown.
- [src/client/components/EmptyState.tsx](sources/agents/src/client/components/EmptyState.tsx) — 45 linhas; exports: EmptyState.
- [src/client/components/FilterPills.tsx](sources/agents/src/client/components/FilterPills.tsx) — 89 linhas; exports: FilterPillItem, FilterPills.
- [src/client/components/FormField.tsx](sources/agents/src/client/components/FormField.tsx) — 206 linhas; exports: FormField.
- [src/client/components/FormFieldContext.ts](sources/agents/src/client/components/FormFieldContext.ts) — 44 linhas; exports: FormFieldContextValue, FormFieldContext, useFormField, mergeDescribedBy.
- [src/client/components/GlobalApiToasts.tsx](sources/agents/src/client/components/GlobalApiToasts.tsx) — 29 linhas; exports: GlobalApiToasts.
- [src/client/components/GoogleOAuthSection.tsx](sources/agents/src/client/components/GoogleOAuthSection.tsx) — 675 linhas; exports: GoogleRedirectUriField, GoogleOAuthSection.
- [src/client/components/GoogleSignInButton.tsx](sources/agents/src/client/components/GoogleSignInButton.tsx) — 127 linhas; exports: GoogleSignInButton.
- [src/client/components/Header.tsx](sources/agents/src/client/components/Header.tsx) — 46 linhas; exports: Header.
- [src/client/components/HelpPopover.tsx](sources/agents/src/client/components/HelpPopover.tsx) — 96 linhas; exports: HelpPopover.
- [src/client/components/HighlightedTemplateField.tsx](sources/agents/src/client/components/HighlightedTemplateField.tsx) — 160 linhas; exports: HighlightedTemplateField.
- [src/client/components/InboxRow.tsx](sources/agents/src/client/components/InboxRow.tsx) — 128 linhas; exports: InboxRowStatus, InboxRow.
- [src/client/components/Input.tsx](sources/agents/src/client/components/Input.tsx) — 132 linhas; exports: Input.
- [src/client/components/Layout.tsx](sources/agents/src/client/components/Layout.tsx) — 53 linhas; exports: Layout.
- [src/client/components/Logo.tsx](sources/agents/src/client/components/Logo.tsx) — 40 linhas; exports: Logo.
- [src/client/components/Markdown.tsx](sources/agents/src/client/components/Markdown.tsx) — 147 linhas; exports: Markdown.
- [src/client/components/McpOAuthSection.tsx](sources/agents/src/client/components/McpOAuthSection.tsx) — 346 linhas; exports: McpOAuthSection.
- [src/client/components/MediaAudio.tsx](sources/agents/src/client/components/MediaAudio.tsx) — 43 linhas; exports: MediaAudio.
- [src/client/components/MediaImage.tsx](sources/agents/src/client/components/MediaImage.tsx) — 50 linhas; exports: MediaImage.
- [src/client/components/Modal.tsx](sources/agents/src/client/components/Modal.tsx) — 584 linhas; exports: ModalController, useUnsavedChanges, useModalController, useModal, useModalClose, ModalCancelButton, useOnModalOpen, isInsideRadixPopper, Modal.
- [src/client/components/ModelPicker.tsx](sources/agents/src/client/components/ModelPicker.tsx) — 136 linhas; exports: ModelPicker.
- [src/client/components/MonitoringBadge.tsx](sources/agents/src/client/components/MonitoringBadge.tsx) — 16 linhas; exports: MonitoringBadge.
- [src/client/components/OutOfHoursBadge.tsx](sources/agents/src/client/components/OutOfHoursBadge.tsx) — 17 linhas; exports: OutOfHoursBadge.
- [src/client/components/PageContainer.tsx](sources/agents/src/client/components/PageContainer.tsx) — 33 linhas; exports: PageContainer.
- [src/client/components/Popover.tsx](sources/agents/src/client/components/Popover.tsx) — 221 linhas; exports: Popover.
- [src/client/components/ProGate.tsx](sources/agents/src/client/components/ProGate.tsx) — 103 linhas; exports: ProFeature, ProGate.
- [src/client/components/ProtectedRoute.tsx](sources/agents/src/client/components/ProtectedRoute.tsx) — 54 linhas; exports: ProtectedRoute.
- [src/client/components/ResourceReferences.tsx](sources/agents/src/client/components/ResourceReferences.tsx) — 50 linhas; exports: AgentRef, AgentReferences.
- [src/client/components/SchedulePicker.tsx](sources/agents/src/client/components/SchedulePicker.tsx) — 244 linhas; exports: ScheduleOption, SchedulePicker.
- [src/client/components/Select.tsx](sources/agents/src/client/components/Select.tsx) — 63 linhas; exports: Select.
- [src/client/components/SelectableCard.tsx](sources/agents/src/client/components/SelectableCard.tsx) — 82 linhas; exports: SelectableCard.
- [src/client/components/SetupGate.tsx](sources/agents/src/client/components/SetupGate.tsx) — 28 linhas; exports: SetupGate.
- [src/client/components/Sidebar.tsx](sources/agents/src/client/components/Sidebar.tsx) — 488 linhas; exports: Sidebar.
- [src/client/components/SidebarResizer.tsx](sources/agents/src/client/components/SidebarResizer.tsx) — 239 linhas; exports: SidebarResizer.
- [src/client/components/Skeleton.tsx](sources/agents/src/client/components/Skeleton.tsx) — 21 linhas; exports: Skeleton.
- [src/client/components/SpendBar.tsx](sources/agents/src/client/components/SpendBar.tsx) — 170 linhas; exports: SpendUsageEntry, SPEND_NOT_CONFIGURED, SpendBar, SpendHealthLines.
- [src/client/components/StrongConfirmModal.tsx](sources/agents/src/client/components/StrongConfirmModal.tsx) — 122 linhas; exports: StrongConfirmPayload, StrongConfirmModal.
- [src/client/components/SupportModal.tsx](sources/agents/src/client/components/SupportModal.tsx) — 107 linhas; exports: SupportModal.
- [src/client/components/Switch.tsx](sources/agents/src/client/components/Switch.tsx) — 45 linhas; exports: Switch.
- [src/client/components/SwitchField.tsx](sources/agents/src/client/components/SwitchField.tsx) — 63 linhas; exports: SwitchField.
- [src/client/components/Tabs.tsx](sources/agents/src/client/components/Tabs.tsx) — 99 linhas; exports: TabItem, Tabs.
- [src/client/components/TenantDeepLink.tsx](sources/agents/src/client/components/TenantDeepLink.tsx) — 179 linhas; exports: TenantDeepLink.
- [src/client/components/TenantIndicator.tsx](sources/agents/src/client/components/TenantIndicator.tsx) — 16 linhas; exports: TenantIndicator.
- [src/client/components/TenantSwitcher.tsx](sources/agents/src/client/components/TenantSwitcher.tsx) — 129 linhas; exports: TenantSwitcher.
- [src/client/components/TestModeBadge.tsx](sources/agents/src/client/components/TestModeBadge.tsx) — 29 linhas; exports: TestModeBadge.
- [src/client/components/Textarea.tsx](sources/agents/src/client/components/Textarea.tsx) — 112 linhas; exports: Textarea.
- [src/client/components/TimezonePicker.tsx](sources/agents/src/client/components/TimezonePicker.tsx) — 137 linhas; exports: TimezonePicker.
- [src/client/components/Toast.tsx](sources/agents/src/client/components/Toast.tsx) — 197 linhas; exports: useToast, ToastProvider.
- [src/client/components/ToolArgPills.tsx](sources/agents/src/client/components/ToolArgPills.tsx) — 51 linhas; exports: DisplayToolArg, ToolArgPills.
- [src/client/components/ToolCallDetails.tsx](sources/agents/src/client/components/ToolCallDetails.tsx) — 73 linhas; exports: TracePre, ToolCallDetails.
- [src/client/components/Tooltip.tsx](sources/agents/src/client/components/Tooltip.tsx) — 71 linhas; exports: Tooltip.
- [src/client/components/UserMenu.tsx](sources/agents/src/client/components/UserMenu.tsx) — 187 linhas; exports: UserMenu.
- [src/client/components/admin/DemoteFleetAdminModal.tsx](sources/agents/src/client/components/admin/DemoteFleetAdminModal.tsx) — 131 linhas; exports: DemoteTarget, DemoteFleetAdminModal.
- [src/client/components/admin/InviteUserModal.tsx](sources/agents/src/client/components/admin/InviteUserModal.tsx) — 260 linhas; exports: InviteUserModal.
- [src/client/components/admin/PendingInvitesCard.tsx](sources/agents/src/client/components/admin/PendingInvitesCard.tsx) — 175 linhas; exports: PendingInvitesCard.
- [src/client/components/alerts/AlertChannelsSection.tsx](sources/agents/src/client/components/alerts/AlertChannelsSection.tsx) — 657 linhas; exports: AlertChannelsSection.
- [src/client/components/api-keys/CreateApiKeyModal.tsx](sources/agents/src/client/components/api-keys/CreateApiKeyModal.tsx) — 225 linhas; exports: ApiKeyScope, CreateApiKeyModal.
- [src/client/components/escapeClaim.ts](sources/agents/src/client/components/escapeClaim.ts) — 42 linhas; exports: EscapeClaim, claimEscape, handOverEscape.
- [src/client/components/icons/AntigravityIcon.tsx](sources/agents/src/client/components/icons/AntigravityIcon.tsx) — 207 linhas; exports: AntigravityIcon.
- [src/client/components/icons/ClaudeIcon.tsx](sources/agents/src/client/components/icons/ClaudeIcon.tsx) — 17 linhas; exports: ClaudeIcon.
- [src/client/components/icons/CodexIcon.tsx](sources/agents/src/client/components/icons/CodexIcon.tsx) — 17 linhas; exports: CodexIcon.
- [src/client/components/icons/CopilotIcon.tsx](sources/agents/src/client/components/icons/CopilotIcon.tsx) — 17 linhas; exports: CopilotIcon.
- [src/client/components/icons/CursorIcon.tsx](sources/agents/src/client/components/icons/CursorIcon.tsx) — 17 linhas; exports: CursorIcon.
- [src/client/components/icons/GithubIcon.tsx](sources/agents/src/client/components/icons/GithubIcon.tsx) — 20 linhas; exports: GithubIcon.
- [src/client/components/icons/HermesIcon.tsx](sources/agents/src/client/components/icons/HermesIcon.tsx) — 23 linhas; exports: HermesIcon.
- [src/client/components/icons/ServiceLogo.tsx](sources/agents/src/client/components/icons/ServiceLogo.tsx) — 154 linhas; exports: ServiceLogo.
- [src/client/components/index.ts](sources/agents/src/client/components/index.ts) — 88 linhas; exports: —.
- [src/client/components/mcp/DiscoveredMcpTools.tsx](sources/agents/src/client/components/mcp/DiscoveredMcpTools.tsx) — 41 linhas; exports: DiscoveredMcpTool, McpServerInstructions, McpToolArgs.
- [src/client/components/mcp/McpInstall.tsx](sources/agents/src/client/components/mcp/McpInstall.tsx) — 204 linhas; exports: McpInstall.
- [src/client/components/mcp/RegisterMcpClientModal.tsx](sources/agents/src/client/components/mcp/RegisterMcpClientModal.tsx) — 225 linhas; exports: McpClientPayload, RegisterMcpClientModal.
- [src/client/components/useMediaObjectUrl.ts](sources/agents/src/client/components/useMediaObjectUrl.ts) — 62 linhas; exports: useMediaObjectUrl.
- [src/client/components/webhooks/WebhookSubscriptionModal.tsx](sources/agents/src/client/components/webhooks/WebhookSubscriptionModal.tsx) — 318 linhas; exports: WebhookSubscription, WebhookModalPayload, WebhookSubscriptionModal.

</details>

## src/client/contexts

Module: `src/client/contexts`  
Path: [diretório](sources/agents/src/client/contexts)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:lucide-react, package:react, package:react-router, src/client/components, src/client/lib, src/lib  
Dependents: src/client/App.tsx, src/client/components, src/client/hooks, src/client/pages, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 8

<details><summary>Arquivos e exports</summary>

- [src/client/contexts/ApprovalsContext.tsx](sources/agents/src/client/contexts/ApprovalsContext.tsx) — 71 linhas; exports: ApprovalsProvider, usePendingApprovals.
- [src/client/contexts/AuthContext.tsx](sources/agents/src/client/contexts/AuthContext.tsx) — 257 linhas; exports: User, GoogleAuthProvider, AuthProviders, AuthProvider, useAuth.
- [src/client/contexts/BrandingContext.tsx](sources/agents/src/client/contexts/BrandingContext.tsx) — 187 linhas; exports: BrandingProvider, useBranding.
- [src/client/contexts/BreadcrumbContext.tsx](sources/agents/src/client/contexts/BreadcrumbContext.tsx) — 65 linhas; exports: BreadcrumbProvider, useBreadcrumbLabel, useBreadcrumbLabels.
- [src/client/contexts/NavGuardContext.tsx](sources/agents/src/client/contexts/NavGuardContext.tsx) — 172 linhas; exports: NavGuardProvider, useNavGuard, useConfirmLeave.
- [src/client/contexts/SidebarContext.tsx](sources/agents/src/client/contexts/SidebarContext.tsx) — 148 linhas; exports: SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH, SIDEBAR_DEFAULT_WIDTH, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_COLLAPSE_SNAP, SidebarProvider, useSidebar.
- [src/client/contexts/ThemeContext.tsx](sources/agents/src/client/contexts/ThemeContext.tsx) — 111 linhas; exports: ThemeProvider, useTheme, ThemedAsset, useThemedAsset.
- [src/client/contexts/UpdatesContext.tsx](sources/agents/src/client/contexts/UpdatesContext.tsx) — 88 linhas; exports: UpdatesProvider, useUpdates.

</details>

## src/client/frontend.tsx

Module: `src/client/frontend.tsx`  
Path: [diretório](sources/agents/src/client/frontend.tsx)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:react-dom, src/client/App.tsx  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [src/client/frontend.tsx](sources/agents/src/client/frontend.tsx) — 15 linhas; exports: —.

</details>

## src/client/hooks

Module: `src/client/hooks`  
Path: [diretório](sources/agents/src/client/hooks)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:react, package:react-i18next, package:react-router, package:we were connected and then dropped, src/client/components, src/client/contexts, src/client/lib  
Dependents: src/client/components, src/client/pages, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 7

<details><summary>Arquivos e exports</summary>

- [src/client/hooks/useActiveTenantName.ts](sources/agents/src/client/hooks/useActiveTenantName.ts) — 34 linhas; exports: isFleetSession, resolveActiveTenantName, useActiveTenantName.
- [src/client/hooks/useFieldRefusal.ts](sources/agents/src/client/hooks/useFieldRefusal.ts) — 187 linhas; exports: FieldRefusal, useFieldRefusal.
- [src/client/hooks/useGoogleSignIn.ts](sources/agents/src/client/hooks/useGoogleSignIn.ts) — 57 linhas; exports: useGoogleSignIn.
- [src/client/hooks/useSidebarShortcut.ts](sources/agents/src/client/hooks/useSidebarShortcut.ts) — 30 linhas; exports: useSidebarShortcut.
- [src/client/hooks/useTenantEvents.ts](sources/agents/src/client/hooks/useTenantEvents.ts) — 163 linhas; exports: AgentActivityPhase, AgentActivityStage, TenantRealtimeEvent, ConversationRealtimeEvent, AgentActivityRealtimeEvent, KnowledgeDocumentRealtimeEvent, AgentConfigRealtimeEvent, UseTenantEventsOptions, useTenantEvents.
- [src/client/hooks/useTenantList.ts](sources/agents/src/client/hooks/useTenantList.ts) — 81 linhas; exports: TenantListEntry, TenantList, useTenantList.
- [src/client/hooks/useWebSocket.ts](sources/agents/src/client/hooks/useWebSocket.ts) — 396 linhas; exports: ConnectionStatus, EdenLikeSocket, UseWebSocketOptions, UseWebSocketResult, useWebSocket.

</details>

## src/client/lib

Module: `src/client/lib`  
Path: [diretório](sources/agents/src/client/lib)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:@codemirror/autocomplete, package:@codemirror/lang-json, package:@codemirror/state, package:@codemirror/view, package:@elysiajs/eden, package:@lezer/common, package:i18next, package:lucide-react, package:none, package:react, package:react-i18next, src/bootstrap, src/client/components, src/client/locales, src/graph/tools, src/lib, src/modules/agents, src/modules/tool-definitions  
Dependents: docs, src/client/components, src/client/contexts, src/client/hooks, src/client/pages, src/modules/agents, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 47

<details><summary>Arquivos e exports</summary>

- [src/client/lib/activeTenant.ts](sources/agents/src/client/lib/activeTenant.ts) — 81 linhas; exports: getActiveTenantId, setActiveTenantId, TENANTS_CHANGED_EVENT, notifyTenantsChanged, reconcileActiveTenantId, dropRejectedSelection.
- [src/client/lib/affiliateLinks.ts](sources/agents/src/client/lib/affiliateLinks.ts) — 29 linhas; exports: AFFILIATE_LINKS, PROVIDER_KEY_LINKS, ProviderLink, providerLink.
- [src/client/lib/api.ts](sources/agents/src/client/lib/api.ts) — 46 linhas; exports: api.
- [src/client/lib/apiError.ts](sources/agents/src/client/lib/apiError.ts) — 23 linhas; exports: apiErrorMessage.
- [src/client/lib/approvalEdit.ts](sources/agents/src/client/lib/approvalEdit.ts) — 49 linhas; exports: ApprovalOriginal, ApprovalDraft, ApprovalEditPatch, approvalEditPatch.
- [src/client/lib/auditPeriod.ts](sources/agents/src/client/lib/auditPeriod.ts) — 282 linhas; exports: DateKey, AUDIT_PERIOD_PRESETS, AuditPeriodPreset, DATE_KEY_RE, shiftDays, mondayOf, auditPresetRange, auditPresetOf, isUsableRange, isCommittableRange, msUntilNextLocalMidnight, todayKey, isNamedPeriodPreset, selectedPreset.
- [src/client/lib/breadcrumbs.ts](sources/agents/src/client/lib/breadcrumbs.ts) — 206 linhas; exports: Breadcrumb, buildBreadcrumbs.
- [src/client/lib/chatwootLinks.ts](sources/agents/src/client/lib/chatwootLinks.ts) — 20 linhas; exports: chatwootAccountUrl, chatwootInboxNewUrl.
- [src/client/lib/credentialCompat.ts](sources/agents/src/client/lib/credentialCompat.ts) — 56 linhas; exports: credentialCompat.
- [src/client/lib/credentialRef.ts](sources/agents/src/client/lib/credentialRef.ts) — 26 linhas; exports: VAULT_REF_PREFIX, formatVaultRef, canonicalVaultRef.
- [src/client/lib/duration.ts](sources/agents/src/client/lib/duration.ts) — 57 linhas; exports: DurationUnit, ReadableDuration, readableDuration, formatDuration.
- [src/client/lib/editorRefusal.ts](sources/agents/src/client/lib/editorRefusal.ts) — 373 linhas; exports: UNDRAWN_TOOL_NOTES, hasNoConsoleControl, EditorTab, EditorTarget, editorTargetFor, EditorControlsShown, followUpStepField, editorRefusalFields, sentFromPatch.
- [src/client/lib/env.ts](sources/agents/src/client/lib/env.ts) — 33 linhas; exports: CDN_URL, APP_VERSION, EDITION, IS_FREE.
- [src/client/lib/favicon.ts](sources/agents/src/client/lib/favicon.ts) — 63 linhas; exports: IconLink, applyFavicon.
- [src/client/lib/fieldRefusal.ts](sources/agents/src/client/lib/fieldRefusal.ts) — 222 linhas; exports: Refusal, readRefusal, RefusalPlacement, FormAtAnswer, placeRefusal, sameValue, RefusalReader, firstRefusalAt, settlesRefusal.
- [src/client/lib/flowLabels.ts](sources/agents/src/client/lib/flowLabels.ts) — 66 linhas; exports: flowStageLabel, flowLevelLabel.
- [src/client/lib/google.ts](sources/agents/src/client/lib/google.ts) — 126 linhas; exports: GoogleCredentialResponse, loadGsiScript.
- [src/client/lib/i18n.ts](sources/agents/src/client/lib/i18n.ts) — 64 linhas; exports: —.
- [src/client/lib/importWarningCount.ts](sources/agents/src/client/lib/importWarningCount.ts) — 20 linhas; exports: importWarningCount.
- [src/client/lib/knowledgeDocs.ts](sources/agents/src/client/lib/knowledgeDocs.ts) — 102 linhas; exports: DocumentRowState, DocumentEventFields, mergeDocumentEvent, DocErrorEntry, docErrorEntry.
- [src/client/lib/languages.ts](sources/agents/src/client/lib/languages.ts) — 21 linhas; exports: LANGUAGES, LanguageCode, SUPPORTED_LANGUAGE_CODES, DEFAULT_LANGUAGE, isValidLanguageCode, getLanguageByCode.
- [src/client/lib/logGroupTitle.ts](sources/agents/src/client/lib/logGroupTitle.ts) — 40 linhas; exports: LogGroupTitle, logGroupTitle.
- [src/client/lib/logout.ts](sources/agents/src/client/lib/logout.ts) — 56 linhas; exports: performLogout, afterLogout.
- [src/client/lib/media.ts](sources/agents/src/client/lib/media.ts) — 30 linhas; exports: mediaFetch.
- [src/client/lib/nativeTools.ts](sources/agents/src/client/lib/nativeTools.ts) — 170 linhas; exports: NATIVE_TOOL_ICONS, NativeToolMeta, nativeToolMeta.
- [src/client/lib/navigation.tsx](sources/agents/src/client/lib/navigation.tsx) — 197 linhas; exports: NavItemIcon, NavItem, NAV_ITEMS, filterNavItems, FooterLink, SupportContact, SUPPORT_LINK, AGENTS_REPO_URL, SECONDARY_LINKS, UPGRADE_URL.
- [src/client/lib/oauthPopup.ts](sources/agents/src/client/lib/oauthPopup.ts) — 124 linhas; exports: OAuthPopupOutcome, WatchOAuthPopupOptions, OAuthPopupWatcher, watchOAuthPopup.
- [src/client/lib/promptPreview.ts](sources/agents/src/client/lib/promptPreview.ts) — 68 linhas; exports: wrapPreviewVar, rehypeHighlightVars.
- [src/client/lib/providerDefaults.ts](sources/agents/src/client/lib/providerDefaults.ts) — 41 linhas; exports: STT_DEFAULT_MODEL, VISION_DEFAULT_MODEL, TTS_DEFAULT_MODEL, TTS_PROVIDERS, TTS_DEFAULT_VOICE.
- [src/client/lib/providerLabels.ts](sources/agents/src/client/lib/providerLabels.ts) — 22 linhas; exports: providerLabel.
- [src/client/lib/roles.ts](sources/agents/src/client/lib/roles.ts) — 7 linhas; exports: —.
- [src/client/lib/sampleJson.ts](sources/agents/src/client/lib/sampleJson.ts) — 235 linhas; exports: JsonSpot, firstJsonProblem, Reindent, reindentJson.
- [src/client/lib/secretTypes.ts](sources/agents/src/client/lib/secretTypes.ts) — 167 linhas; exports: SECRET_TYPE_IDS, SecretTypeId, SecretTypeMeta, SECRET_TYPE_META, isTestableSecretType, secretTypeNeedsBase, secretTypeNeedsParamName, secretTypeFields, secretTypeSupportsBaseUrl, secretTypeRefusesBaseUrl, dialableBaseUrl, secretTypeRequiresBaseUrl, secretTypeIsManagedBlob, secretTypeService.
- [src/client/lib/serverClock.ts](sources/agents/src/client/lib/serverClock.ts) — 51 linhas; exports: noteServerDate, serverNow, serverNowDate, resetServerClock.
- [src/client/lib/templateEditor.tsx](sources/agents/src/client/lib/templateEditor.tsx) — 183 linhas; exports: templateSource, templateExtensions.
- [src/client/lib/tenantDeepLink.ts](sources/agents/src/client/lib/tenantDeepLink.ts) — 91 linhas; exports: TenantScope, TenantDeepLinkAction, tenantDeepLinkAction.
- [src/client/lib/tenantSelectorRecovery.ts](sources/agents/src/client/lib/tenantSelectorRecovery.ts) — 35 linhas; exports: recoverFromRejectedSelector.
- [src/client/lib/tenantSwitch.ts](sources/agents/src/client/lib/tenantSwitch.ts) — 39 linhas; exports: tenantSwitchTarget, reloadOntoSafeRoute.
- [src/client/lib/timezones.ts](sources/agents/src/client/lib/timezones.ts) — 68 linhas; exports: formatTimezoneLabel, listTimezones.
- [src/client/lib/toolSample.ts](sources/agents/src/client/lib/toolSample.ts) — 342 linhas; exports: ToolSample, sampleIsNothing, SampleTicket, sampleTicket, recallToolSample, rememberToolSample, forgetToolSample, noteOperator, vaultGeneration, noteVaultChanged.
- [src/client/lib/toolpackTools.ts](sources/agents/src/client/lib/toolpackTools.ts) — 215 linhas; exports: TOOLPACK_TOOL_ICONS, toolpackArgNote, withToolpackArgNotes, ToolpackToolMeta, toolpackToolMeta.
- [src/client/lib/types.ts](sources/agents/src/client/lib/types.ts) — 9 linhas; exports: ApiErrorPayload.
- [src/client/lib/unsavedGuard.ts](sources/agents/src/client/lib/unsavedGuard.ts) — 162 linhas; exports: acquireBeforeUnload, suppressUnloadPrompt, pushBackBlocker, leaveViaBackTrap, useBeforeUnload, useBackGuard.
- [src/client/lib/utils.ts](sources/agents/src/client/lib/utils.ts) — 133 linhas; exports: cn, formatDate, formatDateTime, formatRelativeTime, SLUG_PATTERN, isValidSlug, slugify, loadErrorMessage, isSafeHttpUrl, getAssetUrl.
- [src/client/lib/validation.ts](sources/agents/src/client/lib/validation.ts) — 22 linhas; exports: isValidHttpUrl, isValidUrlTemplate.
- [src/client/lib/vaultCache.ts](sources/agents/src/client/lib/vaultCache.ts) — 237 linhas; exports: VaultEntry, VAULT_CHANGED_EVENT, loadVault, refreshVault, vaultRevision, invalidateVault, useVaultBaseUrls, useVaultRefs.
- [src/client/lib/webhookEvents.ts](sources/agents/src/client/lib/webhookEvents.ts) — 36 linhas; exports: webhookEventLabel.

</details>

## src/client/locales

Module: `src/client/locales`  
Path: [diretório](sources/agents/src/client/locales)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: src/client/lib, src/modules/agents, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 2

<details><summary>Arquivos e exports</summary>

- [src/client/locales/en.json](sources/agents/src/client/locales/en.json) — 2860 linhas; exports: —.
- [src/client/locales/pt-BR.json](sources/agents/src/client/locales/pt-BR.json) — 2918 linhas; exports: —.

</details>

## src/client/pages

Module: `src/client/pages`  
Path: [diretório](sources/agents/src/client/pages)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package: | , package:) ?? , package:@codemirror/lang-json, package:@codemirror/view, package:@radix-ui/react-dropdown-menu, package:@radix-ui/react-popover, package:i18next, package:loaded and the account exposed no folders, package:lucide-react, package:mermaid, package:react, package:react-i18next, package:react-router, package:recharts, src/client/components, src/client/contexts, src/client/hooks, src/client/lib, src/graph, src/graph/tools, src/lib, src/modules/agents, src/modules/appointments, src/modules/business-hours, src/modules/channel-redirect, src/modules/chatwoot, src/modules/documents, src/modules/flowlog, src/modules/followups, src/modules/guardrails, src/modules/memory, src/modules/observe, src/modules/tool-definitions, src/modules/tts, src/modules/vision  
Dependents: src/client/App.tsx, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 84

<details><summary>Arquivos e exports</summary>

- [src/client/pages/AcceptInvitePage.tsx](sources/agents/src/client/pages/AcceptInvitePage.tsx) — 242 linhas; exports: AcceptInvitePage.
- [src/client/pages/AgentsPage.tsx](sources/agents/src/client/pages/AgentsPage.tsx) — 469 linhas; exports: AgentsPage.
- [src/client/pages/ApiKeysPage.tsx](sources/agents/src/client/pages/ApiKeysPage.tsx) — 269 linhas; exports: ApiKeysPage.
- [src/client/pages/AuditPage.tsx](sources/agents/src/client/pages/AuditPage.tsx) — 1012 linhas; exports: localMidnight, localDayBounds, FieldChange, ProjectionDiff, diffProjection, AuditPage.
- [src/client/pages/ChannelsPage.tsx](sources/agents/src/client/pages/ChannelsPage.tsx) — 1870 linhas; exports: ChannelsPage.
- [src/client/pages/ConversationDetailPage.tsx](sources/agents/src/client/pages/ConversationDetailPage.tsx) — 2143 linhas; exports: ConversationDetailPage.
- [src/client/pages/ConversationsPage.tsx](sources/agents/src/client/pages/ConversationsPage.tsx) — 417 linhas; exports: ConversationsPage.
- [src/client/pages/DashboardPage.tsx](sources/agents/src/client/pages/DashboardPage.tsx) — 1363 linhas; exports: OPERATOR_TZ, buildCostTrend, DashboardPage.
- [src/client/pages/LoginPage.tsx](sources/agents/src/client/pages/LoginPage.tsx) — 244 linhas; exports: isServerNavigation, LoginPage.
- [src/client/pages/LogsExportModal.tsx](sources/agents/src/client/pages/LogsExportModal.tsx) — 202 linhas; exports: LogsExportModal.
- [src/client/pages/LogsPage.tsx](sources/agents/src/client/pages/LogsPage.tsx) — 621 linhas; exports: LogsPage.
- [src/client/pages/McpPage.tsx](sources/agents/src/client/pages/McpPage.tsx) — 319 linhas; exports: McpPage.
- [src/client/pages/OAuthConsentPage.tsx](sources/agents/src/client/pages/OAuthConsentPage.tsx) — 324 linhas; exports: OAuthConsentPage.
- [src/client/pages/SetupPage.tsx](sources/agents/src/client/pages/SetupPage.tsx) — 306 linhas; exports: SetupPage.
- [src/client/pages/SignupPage.tsx](sources/agents/src/client/pages/SignupPage.tsx) — 241 linhas; exports: SignupPage.
- [src/client/pages/WebhooksPage.tsx](sources/agents/src/client/pages/WebhooksPage.tsx) — 300 linhas; exports: WebhooksPage.
- [src/client/pages/admin/AdminBrandingPage.tsx](sources/agents/src/client/pages/admin/AdminBrandingPage.tsx) — 43 linhas; exports: AdminBrandingPage.
- [src/client/pages/admin/AdminLayout.tsx](sources/agents/src/client/pages/admin/AdminLayout.tsx) — 68 linhas; exports: AdminLayout.
- [src/client/pages/admin/AdminTenantsPage.tsx](sources/agents/src/client/pages/admin/AdminTenantsPage.tsx) — 142 linhas; exports: AdminTenantsPage.
- [src/client/pages/admin/AdminUsersPage.tsx](sources/agents/src/client/pages/admin/AdminUsersPage.tsx) — 574 linhas; exports: AdminUsersPage.
- [src/client/pages/agents/AgentEditorPage.tsx](sources/agents/src/client/pages/agents/AgentEditorPage.tsx) — 4075 linhas; exports: AgentEditorPage.
- [src/client/pages/agents/BehaviorTab.tsx](sources/agents/src/client/pages/agents/BehaviorTab.tsx) — 3412 linhas; exports: ContactAuthState, MemoryState, ModelFallbackState, SendImageState, TakeoverState, FollowUpStepState, FollowUpState, MONITORING_SECTIONS, BehaviorTab.
- [src/client/pages/agents/CapabilityMap.tsx](sources/agents/src/client/pages/agents/CapabilityMap.tsx) — 514 linhas; exports: MapGroup, buildGroups, toMermaid, CapabilityMap.
- [src/client/pages/agents/ChannelRedirectTab.tsx](sources/agents/src/client/pages/agents/ChannelRedirectTab.tsx) — 801 linhas; exports: ChannelRedirectFormState, ChannelRedirectTab.
- [src/client/pages/agents/ChannelsTab.tsx](sources/agents/src/client/pages/agents/ChannelsTab.tsx) — 609 linhas; exports: ChannelsTab.
- [src/client/pages/agents/ExperimentsTab.tsx](sources/agents/src/client/pages/agents/ExperimentsTab.tsx) — 24 linhas; exports: ExperimentsTab.
- [src/client/pages/agents/ExportAgentModal.tsx](sources/agents/src/client/pages/agents/ExportAgentModal.tsx) — 164 linhas; exports: ExportAgentModal.
- [src/client/pages/agents/GeneralTab.tsx](sources/agents/src/client/pages/agents/GeneralTab.tsx) — 380 linhas; exports: GeneralTab.
- [src/client/pages/agents/GuardrailsTab.tsx](sources/agents/src/client/pages/agents/GuardrailsTab.tsx) — 428 linhas; exports: GuardrailsTab.
- [src/client/pages/agents/HighlightedPromptEditor.tsx](sources/agents/src/client/pages/agents/HighlightedPromptEditor.tsx) — 33 linhas; exports: HighlightedPromptEditor.
- [src/client/pages/agents/KnowledgeGrantsEditor.tsx](sources/agents/src/client/pages/agents/KnowledgeGrantsEditor.tsx) — 208 linhas; exports: KnowledgeGrantsEditor.
- [src/client/pages/agents/KnowledgeTab.tsx](sources/agents/src/client/pages/agents/KnowledgeTab.tsx) — 50 linhas; exports: KnowledgeTab.
- [src/client/pages/agents/ObservationSection.tsx](sources/agents/src/client/pages/agents/ObservationSection.tsx) — 268 linhas; exports: ObservationSection.
- [src/client/pages/agents/PlaygroundChat.tsx](sources/agents/src/client/pages/agents/PlaygroundChat.tsx) — 1451 linhas; exports: PlaygroundCapabilities, PlaygroundChat, guardrailTraceLabel.
- [src/client/pages/agents/PlaygroundFab.tsx](sources/agents/src/client/pages/agents/PlaygroundFab.tsx) — 388 linhas; exports: PlaygroundFab.
- [src/client/pages/agents/PlaygroundTab.tsx](sources/agents/src/client/pages/agents/PlaygroundTab.tsx) — 32 linhas; exports: PlaygroundTab.
- [src/client/pages/agents/PromptPanel.tsx](sources/agents/src/client/pages/agents/PromptPanel.tsx) — 335 linhas; exports: PromptPanel.
- [src/client/pages/agents/SectionNav.tsx](sources/agents/src/client/pages/agents/SectionNav.tsx) — 164 linhas; exports: SectionDef, SectionProps, Section, SectionNav.
- [src/client/pages/agents/TabActionBar.tsx](sources/agents/src/client/pages/agents/TabActionBar.tsx) — 59 linhas; exports: TabActionBar.
- [src/client/pages/agents/ToolGrantsEditor.tsx](sources/agents/src/client/pages/agents/ToolGrantsEditor.tsx) — 1745 linhas; exports: ToolGrantsEditor.
- [src/client/pages/agents/ToolPreconditionsEditor.tsx](sources/agents/src/client/pages/agents/ToolPreconditionsEditor.tsx) — 244 linhas; exports: ToolPreconditionsEditor, serializeToolPreconditions, parseToolPreconditionRows.
- [src/client/pages/agents/ToolsTab.tsx](sources/agents/src/client/pages/agents/ToolsTab.tsx) — 208 linhas; exports: ToolsTab.
- [src/client/pages/agents/followUpFormState.ts](sources/agents/src/client/pages/agents/followUpFormState.ts) — 90 linhas; exports: followUpToForm, followUpToStored.
- [src/client/pages/agents/guardrailsFormState.ts](sources/agents/src/client/pages/agents/guardrailsFormState.ts) — 66 linhas; exports: readGuardrailsFormState.
- [src/client/pages/agents/memoryFormState.ts](sources/agents/src/client/pages/agents/memoryFormState.ts) — 50 linhas; exports: memoryToForm, memoryToStored, compactionReaderKeys.
- [src/client/pages/agents/modelFallbackFormState.ts](sources/agents/src/client/pages/agents/modelFallbackFormState.ts) — 68 linhas; exports: modelFallbackToForm, modelFallbackToStored, modelFallbackReaderKeys, fallbackIsConfigured, fallbackModelIsMissing.
- [src/client/pages/agents/modelOverrideForm.ts](sources/agents/src/client/pages/agents/modelOverrideForm.ts) — 148 linhas; exports: AgentModelSource, overrideResolution, overrideProviderChanged, overridePicked, overrideNeedsOwnCredential, overridePickerSource, overrideBaseUrlUnsupported, overrideBaseUrlInvalid.
- [src/client/pages/agents/observabilityFormState.ts](sources/agents/src/client/pages/agents/observabilityFormState.ts) — 41 linhas; exports: ObservabilityFormState, observabilityToForm, observabilityToStored.
- [src/client/pages/agents/observationFormState.ts](sources/agents/src/client/pages/agents/observationFormState.ts) — 166 linhas; exports: ObservationGroupState, ObservationState, OBSERVATION_LIMITS, observationToForm, groupValues, groupIncomplete, observationToStored, monitoringReaderKeys.
- [src/client/pages/agents/ttsFormState.ts](sources/agents/src/client/pages/agents/ttsFormState.ts) — 241 linhas; exports: TtsFormState, readTtsFormState, ttsSettingsFrom, ttsNormalizerProviderChanged, ttsNormalizerOverridePicked, ttsNormalizerResolution, ttsNormalizerNeedsOwnCredential, ttsNormalizerPickerSource, ttsNormalizerBaseUrlUnsupported, ttsNormalizerBaseUrlInvalid.
- [src/client/pages/agents/types.ts](sources/agents/src/client/pages/agents/types.ts) — 106 linhas; exports: ToolSelectionView, ToolCatalog, GrantState, VaultEntry, Hours, HandoffUiState, ToolPreconditionRow, BehaviorRefusals, GuardrailsRefusals, ToolRefusals.
- [src/client/pages/agents/usePlaygroundChat.ts](sources/agents/src/client/pages/agents/usePlaygroundChat.ts) — 960 linhas; exports: PlaygroundTurn, PlaygroundSessionMeta, RecordState, PlaygroundDraft, PlaygroundToolInfo, DEFAULT_PLAYGROUND_PROMPT_VARS, agentTurn, usePlaygroundChat, recordingExt.
- [src/client/pages/dashboard/CostTrendChart.tsx](sources/agents/src/client/pages/dashboard/CostTrendChart.tsx) — 235 linhas; exports: TrendPoint.
- [src/client/pages/mcp/McpAdminSections.tsx](sources/agents/src/client/pages/mcp/McpAdminSections.tsx) — 475 linhas; exports: McpAdminSections.
- [src/client/pages/resources/AdvancedPanel.tsx](sources/agents/src/client/pages/resources/AdvancedPanel.tsx) — 343 linhas; exports: AdvancedPanel.
- [src/client/pages/resources/AiFieldsPanel.tsx](sources/agents/src/client/pages/resources/AiFieldsPanel.tsx) — 331 linhas; exports: SCALAR_FIELD_TYPES, AI_FIELD_TYPES, ScalarFieldType, AiFieldType, AiFieldRow, rid, aiFieldsFromSchema, schemaFromAiFields, testFieldsFrom, AiFieldsPanel.
- [src/client/pages/resources/BusinessHoursPanel.tsx](sources/agents/src/client/pages/resources/BusinessHoursPanel.tsx) — 214 linhas; exports: BusinessHoursPanel.
- [src/client/pages/resources/CodeToolEditModal.tsx](sources/agents/src/client/pages/resources/CodeToolEditModal.tsx) — 573 linhas; exports: CodeTool, CodeToolListed, starterCode, formFromCodeTool, payloadOfCodeTool, CodeToolEditModal.
- [src/client/pages/resources/CodeToolTestModal.tsx](sources/agents/src/client/pages/resources/CodeToolTestModal.tsx) — 507 linhas; exports: contextToSend, contextNamesUsedBy, CodeToolTestTarget, CodeToolTestModal.
- [src/client/pages/resources/IntegrationEditModal.tsx](sources/agents/src/client/pages/resources/IntegrationEditModal.tsx) — 1942 linhas; exports: IntegrationEditModal.
- [src/client/pages/resources/IntegrationsPanel.tsx](sources/agents/src/client/pages/resources/IntegrationsPanel.tsx) — 236 linhas; exports: IntegrationsPanel.
- [src/client/pages/resources/KnowledgeApprovals.tsx](sources/agents/src/client/pages/resources/KnowledgeApprovals.tsx) — 400 linhas; exports: KnowledgeApprovals.
- [src/client/pages/resources/KnowledgePanel.tsx](sources/agents/src/client/pages/resources/KnowledgePanel.tsx) — 132 linhas; exports: KnowledgePanel.
- [src/client/pages/resources/McpEditModal.tsx](sources/agents/src/client/pages/resources/McpEditModal.tsx) — 445 linhas; exports: McpEditModal.
- [src/client/pages/resources/McpPanel.tsx](sources/agents/src/client/pages/resources/McpPanel.tsx) — 330 linhas; exports: McpPanel.
- [src/client/pages/resources/ResourcesContext.tsx](sources/agents/src/client/pages/resources/ResourcesContext.tsx) — 16 linhas; exports: ResourcesContext, useResourcesContext.
- [src/client/pages/resources/ResourcesLayout.tsx](sources/agents/src/client/pages/resources/ResourcesLayout.tsx) — 127 linhas; exports: ResourcesLayout.
- [src/client/pages/resources/SpendCeilingCard.tsx](sources/agents/src/client/pages/resources/SpendCeilingCard.tsx) — 447 linhas; exports: SpendCeilingCard.
- [src/client/pages/resources/ToolEditModal.tsx](sources/agents/src/client/pages/resources/ToolEditModal.tsx) — 3124 linhas; exports: Tool, templateSaveProblem, templatePreviewFor, contextNamesReferencedBy, parseExpectedStatuses, requestShapeOf, captureShapeOf, shapeOfArrival, shapeOfOpening, sampleDescribes, sampleToRemember, sendsNothing, revisionForSave, payloadOf, formFromTool, outputSchemaForm, PathPicker, readOffsetsField, eachBlockEdit, insertEachBlock, insertIntoView, ToolEditModal.
- [src/client/pages/resources/ToolTestModal.tsx](sources/agents/src/client/pages/resources/ToolTestModal.tsx) — 567 linhas; exports: ToolTestField, ToolTestTarget, CoercedArg, coerceTestArg, fieldUsesPicker, ArgProblem, argProblem, fieldTakesEmptyString, ToolTestModal.
- [src/client/pages/resources/ToolsPanel.tsx](sources/agents/src/client/pages/resources/ToolsPanel.tsx) — 391 linhas; exports: ToolsPanel.
- [src/client/pages/resources/VaultPanel.tsx](sources/agents/src/client/pages/resources/VaultPanel.tsx) — 570 linhas; exports: VaultPanel.
- [src/client/pages/resources/documents/CompanyProfileCard.tsx](sources/agents/src/client/pages/resources/documents/CompanyProfileCard.tsx) — 367 linhas; exports: CompanyProfile, CompanyProfileCard.
- [src/client/pages/resources/documents/DocumentPreview.tsx](sources/agents/src/client/pages/resources/documents/DocumentPreview.tsx) — 57 linhas; exports: DocumentPreview.
- [src/client/pages/resources/documents/DocumentTemplateModal.tsx](sources/agents/src/client/pages/resources/documents/DocumentTemplateModal.tsx) — 524 linhas; exports: DocumentTemplate, TemplateModalPayload, DocumentTemplateModal.
- [src/client/pages/resources/documents/DocumentsPanel.tsx](sources/agents/src/client/pages/resources/documents/DocumentsPanel.tsx) — 936 linhas; exports: DocumentsPanel.
- [src/client/pages/resources/documents/companyDraft.ts](sources/agents/src/client/pages/resources/documents/companyDraft.ts) — 102 linhas; exports: COMPANY_FIELDS, CompanyDraft, CompanyDraftState, blankCompanyDraft, companyToDraft, seedCompanyDraft, emptyCompanyForm, companyChanges, afterCompanySave, nextCompanyDraft.
- [src/client/pages/resources/documents/useCompanyLogoUrl.ts](sources/agents/src/client/pages/resources/documents/useCompanyLogoUrl.ts) — 53 linhas; exports: useCompanyLogoUrl.
- [src/client/pages/resources/documents/useDocumentPreview.ts](sources/agents/src/client/pages/resources/documents/useDocumentPreview.ts) — 126 linhas; exports: DocumentPreviewState, useDocumentPreview.
- [src/client/pages/resources/toolFieldTypes.ts](sources/agents/src/client/pages/resources/toolFieldTypes.ts) — 22 linhas; exports: fieldTypeLabels.
- [src/client/pages/resources/useKnowledgeManager.tsx](sources/agents/src/client/pages/resources/useKnowledgeManager.tsx) — 1719 linhas; exports: Base, KnowledgeManager, useKnowledgeManager.
- [src/client/pages/settings/SettingsAppearancePage.tsx](sources/agents/src/client/pages/settings/SettingsAppearancePage.tsx) — 121 linhas; exports: SettingsAppearancePage.
- [src/client/pages/settings/SettingsLayout.tsx](sources/agents/src/client/pages/settings/SettingsLayout.tsx) — 70 linhas; exports: SettingsLayout.
- [src/client/pages/settings/SettingsProfilePage.tsx](sources/agents/src/client/pages/settings/SettingsProfilePage.tsx) — 212 linhas; exports: SettingsProfilePage.

</details>

## src/graph

Module: `src/graph`  
Path: [diretório](sources/agents/src/graph)  
Responsibility: Carregamento da configuração, montagem de contexto e execução conversacional.  
Public API: runAgentTurn; runLoadedTurn; loadAgentConfig; buildModelAndGraph  
Internal API: funções auxiliares nos arquivos abaixo; fronteiras reais detalhadas nos registros E  
Dependencies: package:@langchain/anthropic, package:@langchain/core, package:@langchain/deepseek, package:@langchain/google-genai, package:@langchain/langgraph, package:@langchain/langgraph-checkpoint, package:@langchain/langgraph-checkpoint-postgres, package:@langchain/openai, package:bun:test, package:langfuse-langchain, package:no agent here, package:noted, package:pg, package:superseded, package:tokenx, package:we could not ask, package:zod, src/api, src/api/features/realtime, src/bootstrap, src/graph/tools, src/lib, src/modules/agents, src/modules/appointments, src/modules/business-hours, src/modules/channel-redirect, src/modules/chatwoot, src/modules/contact-auth, src/modules/conversations, src/modules/debounce, src/modules/experiments, src/modules/flowlog, src/modules/guardrails, src/modules/handoff, src/modules/images, src/modules/integrations, src/modules/kanban, src/modules/memory, src/modules/scheduler, src/modules/service-window, src/modules/spend-ceiling, src/modules/split, src/modules/tenant-settings, src/modules/tts, src/modules/vault, src/modules/webhooks  
Dependents: scripts, src/client/components, src/client/pages, src/graph/tools, src/modules/agents, src/modules/analytics, src/modules/appointments, src/modules/channel-redirect, src/modules/chatwoot, src/modules/contact-auth, src/modules/conversations, src/modules/debounce, src/modules/documents, src/modules/followups, src/modules/guardrails, src/modules/memory, src/modules/models, src/modules/observe, src/modules/playground, src/modules/service-window, src/modules/spend-ceiling, src/modules/tts, src/modules/vision, src/modules/webhooks, tests  
Runtime relevance: Webhook/debounce → grafo → entrega; E04–E10  
Confidence: HIGH nos fluxos citados; não em todo símbolo  
Files: 42

<details><summary>Arquivos e exports</summary>

- [src/graph/attendance-boundary.ts](sources/agents/src/graph/attendance-boundary.ts) — 182 linhas; exports: AttendanceBoundaryInput, AttendanceBoundaryClaim, attendanceHasStarted, movesAttendanceFrontier, crossesAttendanceBoundary, needsAttendanceStartProbe, claimAttendanceBoundary.
- [src/graph/checkpointer.ts](sources/agents/src/graph/checkpointer.ts) — 101 linhas; exports: getCheckpointer, chatwootThreadId, contactInboxThreadId, resolveGraphThreadId, threadBelongsToTenant.
- [src/graph/close-intent.ts](sources/agents/src/graph/close-intent.ts) — 48 linhas; exports: DeliveryOutcome, mayCloseConversation, PostedOutcome, postedOutcomeFor.
- [src/graph/empty-completion.ts](sources/agents/src/graph/empty-completion.ts) — 34 linhas; exports: isEmptyCompletionFault, EMPTY_COMPLETION_MESSAGE.
- [src/graph/fallback-settings.ts](sources/agents/src/graph/fallback-settings.ts) — 86 linhas; exports: FallbackOverrides, FallbackConfig, readModelFallbackConfig, hasModelFallback, resolveFallbackModel.
- [src/graph/gemini-tools.ts](sources/agents/src/graph/gemini-tools.ts) — 246 linhas; exports: GeminiFunctionDeclaration, GeminiFunctionTool, toGeminiTools.
- [src/graph/graph.ts](sources/agents/src/graph/graph.ts) — 723 linhas; exports: FallbackModel, BuildAgentGraphParams, buildAgentGraph, lastAssistantText.
- [src/graph/handback.ts](sources/agents/src/graph/handback.ts) — 76 linhas; exports: owesHandbackNote.
- [src/graph/history-window.ts](sources/agents/src/graph/history-window.ts) — 111 linhas; exports: HistoryWindow, selectHistoryWindow.
- [src/graph/inflight.ts](sources/agents/src/graph/inflight.ts) — 92 linhas; exports: markTurnInFlight, markTurnReserved, clearTurnReserved, clearTurnInFlight, isTurnInFlight, isTurnRunning.
- [src/graph/ingest-dedup.ts](sources/agents/src/graph/ingest-dedup.ts) — 83 linhas; exports: INGEST_ID_WINDOW, IngestVerdict, ingestVerdict, rememberIngested.
- [src/graph/ingest-drain.ts](sources/agents/src/graph/ingest-drain.ts) — 120 linhas; exports: IngestDrainOutcome, drainPendingIngest.
- [src/graph/ingest-job.ts](sources/agents/src/graph/ingest-job.ts) — 242 linhas; exports: ArmIngestParams, armIngest, ingestHandler, registerIngestJob.
- [src/graph/ingest.ts](sources/agents/src/graph/ingest.ts) — 516 linhas; exports: IngestRole, ingestedMessages, IngestMessageParams, ingestMessageIntoThread.
- [src/graph/markers.ts](sources/agents/src/graph/markers.ts) — 307 linhas; exports: conversationStamp, stampedConversationId, lastStampedConversationId, CONVERSATION_DIVIDER, MEMORY_HEAD_OPEN, MEMORY_HEAD_CLOSE, conversationDividerMessage, memoryHeadMessage, endedInHumanAttendance, nudgeMessage, HUMAN_AGENT_NOTE, humanAgentMessage, HUMAN_HANDBACK_NOTE, humanHandbackMessage, isHumanHandback, isConversationDivider, isMemoryHead, isNudgeTurn, isHumanAgentTurn, CALLED_OFF_TOOL_RESULT, calledOffToolResult, isCalledOffToolResult, turnWasCalledOff.
- [src/graph/message-text.ts](sources/agents/src/graph/message-text.ts) — 18 linhas; exports: contentToText.
- [src/graph/model-config.ts](sources/agents/src/graph/model-config.ts) — 132 linhas; exports: MODEL_PROVIDERS, PROVIDERS_HONORING_BASE_URL, VerdictAskMode, verdictAskMode, modelConfigSchema, ModelConfig, DEFAULT_MODEL_CONFIG, parseModelConfig.
- [src/graph/model-defaults.ts](sources/agents/src/graph/model-defaults.ts) — 35 linhas; exports: PROVIDER_DEFAULT_MODEL, modelOptionalFor.
- [src/graph/model-fallback.ts](sources/agents/src/graph/model-fallback.ts) — 55 linhas; exports: PRIMARY_MAX_RETRIES, PRIMARY_TIMEOUT_MS, isFallbackWorthy.
- [src/graph/model-limit.ts](sources/agents/src/graph/model-limit.ts) — 161 linhas; exports: ModelLabels, ModelFallback, ModelRetryInfo, ModelCallOptions, runModelCall.
- [src/graph/model-override.ts](sources/agents/src/graph/model-override.ts) — 245 linhas; exports: OverrideAgentModel, ModelOverride, ModelOverrideCredential, ModelOverrideNotRunnableReason, ModelOverrideResolution, ResolveModelOverrideOptions, resolveModelOverride.
- [src/graph/models.ts](sources/agents/src/graph/models.ts) — 286 linhas; exports: ResolvedModelConfig, createChatModel.
- [src/graph/nudge-retry.ts](sources/agents/src/graph/nudge-retry.ts) — 73 linhas; exports: NUDGE_RETRY_BACKOFF_MS, NUDGE_RETRY_LIMIT, isRepairableNudgeRefusal, NudgeRetryDecision, nextNudgeRetry.
- [src/graph/nudge.ts](sources/agents/src/graph/nudge.ts) — 1950 linhas; exports: AgentNudge, nudgeOccasionKey, RunAgentNudgeOutcome, NudgePostActions, RunAgentNudgeParams, parseThreadId, DATA_FENCE, OUTSIDE_WINDOW_NOTE_PREFIX, renderNudge, runAgentNudge.
- [src/graph/observability.ts](sources/agents/src/graph/observability.ts) — 385 linhas; exports: langfuseKeysSchema, LangfuseConfig, resolveLangfuseConfig, makeMask, shutdownLangfuseClients, attachLangfuseDeliveryLogging, environmentForSource, TraceContext, buildToolTraceMetadata, buildLangfuseHandler, DirectGenerationContext, DirectGeneration, recordDirectGeneration.
- [src/graph/openai-reasoning.ts](sources/agents/src/graph/openai-reasoning.ts) — 87 linhas; exports: REASONING_EFFORTS, ReasoningEffort, OpenAITransportPlan, planOpenAITransport.
- [src/graph/prepare.ts](sources/agents/src/graph/prepare.ts) — 1692 linhas; exports: AgentConfig, LoadAgentArgs, AgentConfigOverrides, loadAgentConfig, ToolsetCtx, ToolBuildDeps, buildToolset, CallbacksArgs, buildCallbacks, SpeechNormalizerArgs, buildSpeechNormalizer, GraphBuildDeps, buildFallbackModel, buildModelAndGraph.
- [src/graph/prompt-audit.ts](sources/agents/src/graph/prompt-audit.ts) — 122 linhas; exports: AuditedSection, auditedPromptVar, auditedSection, buildPromptAudit.
- [src/graph/prompt.test.ts](sources/agents/src/graph/prompt.test.ts) — 65 linhas; exports: —.
- [src/graph/prompt.ts](sources/agents/src/graph/prompt.ts) — 386 linhas; exports: GROUNDING_DIRECTIVE, composeSystemPrompt, PromptVarContext, VALUE_MAX, sanitizePromptValue, buildPromptVars, TIME_ROUND_MINUTES, SCHEDULE_VARS, PROMPT_PLACEHOLDER_SOURCE, PromptRenderOpts, interpolatePromptVars, PROMPT_TIME_VARS, PROMPT_TIME_VARS_DISPLAY, PROMPT_SCHEDULE_VARS_DISPLAY, PROMPT_CONTEXT_VARS, PROMPT_ALL_VARS, isKnownPromptVar, TimeVarKind, timeVarKind, findExactTimeVarUsages.
- [src/graph/refused-turn.ts](sources/agents/src/graph/refused-turn.ts) — 361 linhas; exports: RollbackPlan, planTurnRollback, planReactiveTurnRollback, undoRefusedTurn.
- [src/graph/reset-episode.ts](sources/agents/src/graph/reset-episode.ts) — 116 linhas; exports: resetLandedAfter, EpisodeFenceParams, stillInSameEpisode.
- [src/graph/runtime.ts](sources/agents/src/graph/runtime.ts) — 2499 linhas; exports: RunAgentTurnOutcome, RuntimeDeps, RunLoadedTurnParams, runLoadedTurn, RunAgentTurnParams, runAgentTurn.
- [src/graph/silence.ts](sources/agents/src/graph/silence.ts) — 287 linhas; exports: FOLLOWUP_SKIP_SENTINEL, SKIP_REPLY_TOOL, SKIP_REPLY_ACK, SKIP_REPLY_MARK, CustomerFacingReply, customerFacingReply, isNudgeSilent, proactiveReply, FollowupSilenceConfig, withFollowupSilenceChannel, inertToolsFor, followupSilenceChannel, skipReplyRan, withoutLoneSilenceTool.
- [src/graph/status.ts](sources/agents/src/graph/status.ts) — 91 linhas; exports: StatusTarget, AgentStatusReporter.
- [src/graph/thread-claim.ts](sources/agents/src/graph/thread-claim.ts) — 556 linhas; exports: ThreadOwner, TurnHold, markTurnOwning, clearTurnOwning, turnOwnsThread, turnOwnsThreadOn, threadBusyForResetOn, IngestWriteState, IngestWriteClaim, claimIngestWrite, releaseIngestWrite.
- [src/graph/thread-state.ts](sources/agents/src/graph/thread-state.ts) — 26 linhas; exports: THREAD_STATE_NODE, buildThreadStateGraph.
- [src/graph/time.ts](sources/agents/src/graph/time.ts) — 114 linhas; exports: DEFAULT_TIMEZONE, roundDownToMinutes, TimeParts, partsInTimezone, formatWithPattern, zonedWallClockToInstant, formatHumanDateTime.
- [src/graph/token-count.ts](sources/agents/src/graph/token-count.ts) — 48 linhas; exports: TokenCounter, countMessageTokens.
- [src/graph/tool-flowlog.ts](sources/agents/src/graph/tool-flowlog.ts) — 196 linhas; exports: ToolFlowLogger.
- [src/graph/trace.ts](sources/agents/src/graph/trace.ts) — 283 linhas; exports: TraceSource, TraceToolCall, TraceToolResult, TraceLabelOpts, TraceAssistant, TraceMedia, TraceGuardrail, traceGuardrail, TraceEntry, buildPlaygroundTrace, buildVisionTraceEntry, collectTraceSources.
- [src/graph/usage.ts](sources/agents/src/graph/usage.ts) — 441 linhas; exports: UsageSource, USAGE_MODEL_METADATA_KEY, UsageRow, UsagePersist, USAGE_NODE_IS_AGENT_TURN, NON_AGENT_TURN_NODES, defaultUsagePersist, TokenUsage, extractTokenUsage, usageAttribution, recordDirectUsage, UsageCaptureParams, UsageCapture.

</details>

## src/graph/tools

Module: `src/graph/tools`  
Path: [diretório](sources/agents/src/graph/tools)  
Responsibility: Construção e execução de native/HTTP/CODE/MCP/RAG/document.  
Public API: buildHttpTool; loadMcpTools; buildNativeTools  
Internal API: funções auxiliares nos arquivos abaixo; fronteiras reais detalhadas nos registros E  
Dependencies: package:@jitl/quickjs-wasmfile-release-sync, package:@langchain/core, package:@langchain/mcp-adapters, package:node:crypto, package:quickjs-emscripten-core, package:zod, src/api, src/bootstrap, src/graph, src/lib, src/modules/agents, src/modules/chatwoot, src/modules/conversations, src/modules/documents, src/modules/flowlog, src/modules/handoff, src/modules/images, src/modules/integrations, src/modules/rag, src/modules/tool-definitions, src/modules/vault, src/modules/webhooks  
Dependents: scripts, src/client/lib, src/client/pages, src/graph, src/modules/agents, src/modules/code-tools, src/modules/documents, src/modules/integrations, src/modules/mcp-connections, src/modules/mcp, src/modules/playground, src/modules/tool-definitions, tests  
Runtime relevance: buildToolset → bindTools → ToolNode; E11–E17  
Confidence: HIGH nos fluxos citados; não em todo símbolo  
Files: 18

<details><summary>Arquivos e exports</summary>

- [src/graph/tools/assemble.ts](sources/agents/src/graph/tools/assemble.ts) — 512 linhas; exports: RagConfig, LoadedHttpToolDef, LoadedCodeToolDef, AgentToolSelections, loadToolSelections, HttpToolBuildDeps, buildHttpTools.
- [src/graph/tools/calculator.ts](sources/agents/src/graph/tools/calculator.ts) — 190 linhas; exports: CalculatorError, evaluateExpression.
- [src/graph/tools/catalog.ts](sources/agents/src/graph/tools/catalog.ts) — 87 linhas; exports: NATIVE_TOOL_NAMES, NativeToolName, isNativeToolName, NativeToolCategory, NATIVE_TOOL_CATEGORY, UTILITY_NATIVE_TOOL_NAMES, CONVERSATION_NATIVE_TOOL_NAMES, RAG_TOOL_NAMES, RagToolName, HANDOFF_DONE_PREFIX, HANDOFF_TOOL_NAME.
- [src/graph/tools/code-sandbox-limits.ts](sources/agents/src/graph/tools/code-sandbox-limits.ts) — 22 linhas; exports: SANDBOX_TIMEOUT_MS, SANDBOX_MEMORY_BYTES, SANDBOX_STACK_BYTES, SANDBOX_CODE_MAX_CHARS, CODE_TOOL_INPUT_MAX_CHARS, CODE_TOOL_CONTEXT_MAX_CHARS.
- [src/graph/tools/code-sandbox.ts](sources/agents/src/graph/tools/code-sandbox.ts) — 352 linhas; exports: SANDBOX_MAX_CONCURRENCY, SandboxOutcome, SandboxOptions, SandboxDeps, SandboxQueue, localIsoNow, runSandboxedCode, formatSandboxResult.
- [src/graph/tools/code-sandbox.worker.ts](sources/agents/src/graph/tools/code-sandbox.worker.ts) — 899 linhas; exports: SandboxRequest, SandboxCall, SandboxReply, SandboxLimit.
- [src/graph/tools/code.ts](sources/agents/src/graph/tools/code.ts) — 183 linhas; exports: LoadedCodeToolDef, CodeToolDeps, CodeToolRun, runCodeToolDefinition, buildCodeTool, buildCodeTools.
- [src/graph/tools/documents.ts](sources/agents/src/graph/tools/documents.ts) — 312 linhas; exports: DocumentSelection, DocumentToolDeps, documentToolSchema, screenableValues, buildDocumentTools.
- [src/graph/tools/failure.ts](sources/agents/src/graph/tools/failure.ts) — 56 linhas; exports: ToolFailure, toolFailure, failableTool.
- [src/graph/tools/http-status.ts](sources/agents/src/graph/tools/http-status.ts) — 80 linhas; exports: normalizeExpectedStatuses, isExpectedResult.
- [src/graph/tools/http.ts](sources/agents/src/graph/tools/http.ts) — 932 linhas; exports: HttpToolDef, DEFAULT_HTTP_TOOL_TIMEOUT_MS, HttpToolDeps, parseToolInputSchema, sanitizeToolName, buildHttpTool.
- [src/graph/tools/mcp.ts](sources/agents/src/graph/tools/mcp.ts) — 445 linhas; exports: McpSelection, McpLoadOpts, buildConnConfig, filterAllowed, mcpServerSlug, namespacedToolName, buildMcpContextSection, McpConnect, McpLoadDeps, loadMcpToolsForAgent.
- [src/graph/tools/native.ts](sources/agents/src/graph/tools/native.ts) — 1424 linhas; exports: TurnState, HandoffTurnState, handoffAnsweredTheTurn, PendingAttachment, ToolCtx, queuedImages, buildNativeTools, buildSimulatedNativeTools.
- [src/graph/tools/precondition.ts](sources/agents/src/graph/tools/precondition.ts) — 228 linhas; exports: RefusalReason, guardedTool, applyToolPreconditions, preconditionFlowEvent, unmatchedPreconditionEvent, preconditionStateLoader.
- [src/graph/tools/rag.ts](sources/agents/src/graph/tools/rag.ts) — 308 linhas; exports: RagToolCtx, resolveSearchScope, resolveSuggestTarget, buildRagTools.
- [src/graph/tools/toolName.ts](sources/agents/src/graph/tools/toolName.ts) — 17 linhas; exports: normalizeToolName.
- [src/graph/tools/unique-names.ts](sources/agents/src/graph/tools/unique-names.ts) — 73 linhas; exports: dropDuplicateToolNames, droppedToolNamesEvent.
- [src/graph/tools/zone-offset.ts](sources/agents/src/graph/tools/zone-offset.ts) — 99 linhas; exports: zoneFormatter, resolveTimezone, WallClock, wallClock, zoneOffsetSeconds, zoneOffsetMinutes.

</details>

## src/lib

Module: `src/lib`  
Path: [diretório](sources/agents/src/lib)  
Responsibility: Infraestrutura compartilhada: tenancy, vault helpers, SSRF, locks e erros.  
Public API: runScopedOn; assertSafeOutboundUrl  
Internal API: funções auxiliares nos arquivos abaixo; fronteiras reais detalhadas nos registros E  
Dependencies: package:acorn, package:node:async_hooks, package:node:crypto, package:node:dns, package:node:net, package:over it, package:zod, src/api, src/bootstrap, src/modules/tool-definitions  
Dependents: scripts, src/api/features/admin, src/api/features/auth, src/api/features/branding, src/api/features/invitations, src/api/features/realtime, src/api, src/bootstrap, src/client/components, src/client/contexts, src/client/lib, src/client/pages, src/graph, src/graph/tools, src/modules/agents, src/modules/analytics, src/modules/api-keys, src/modules/appointments, src/modules/audit, src/modules/availability, src/modules/business-hours, src/modules/channel-redirect, src/modules/chatwoot, src/modules/code-tools, src/modules/contact-auth, src/modules/conversations, src/modules/debounce, src/modules/documents, src/modules/experiments, src/modules/flowlog, src/modules/followups, src/modules/guardrails, src/modules/handoff, src/modules/images, src/modules/integrations, src/modules/mcp-connections, src/modules/mcp, src/modules/memory, src/modules/models, src/modules/n8n-export, src/modules/observe, src/modules/playground, src/modules/rag, src/modules/scheduler, src/modules/spend-ceiling, src/modules/stt, src/modules/tenant-settings, src/modules/tool-definitions, src/modules/tts, src/modules/vault, src/modules/vision, src/modules/webhooks, tests  
Runtime relevance: Serviços → escopo transacional/políticas; E26, E27  
Confidence: HIGH nos fluxos citados; não em todo símbolo  
Files: 32

<details><summary>Arquivos e exports</summary>

- [src/lib/audit/actions.ts](sources/agents/src/lib/audit/actions.ts) — 194 linhas; exports: AUDIT_ACTIONS, AuditAction, RENAMED_AUDIT_ACTIONS, canonicalAuditAction, FLEET_LEVEL_ACTIONS, isFleetLevelAction.
- [src/lib/audit/markers.ts](sources/agents/src/lib/audit/markers.ts) — 36 linhas; exports: AUDIT_MARKER_KEYS, AuditMarkerKey, carriesAuditMarker.
- [src/lib/audit/scope.ts](sources/agents/src/lib/audit/scope.ts) — 20 linhas; exports: AUDIT_SCOPES, AuditScope, isAuditScope.
- [src/lib/branding.ts](sources/agents/src/lib/branding.ts) — 94 linhas; exports: BRANDABLE_KEYS, BrandableKey, BRANDABLE_KEY_TO_VAR, isValidColorToken, sanitizeBranding, DEFAULT_BRAND_NAME, BRANDING_CACHE_KEY, resolveBrandName, BRANDING_ASSET_BASE, brandingAssetUrl, pickVariant, BRANDING_DEFAULT_FAVICONS_KEY.
- [src/lib/code-tool-syntax.ts](sources/agents/src/lib/code-tool-syntax.ts) — 121 linhas; exports: CodeSyntaxWarning, checkCodeToolSyntax.
- [src/lib/code-tool-vocabulary.ts](sources/agents/src/lib/code-tool-vocabulary.ts) — 181 linhas; exports: CodeToolContextVar, CODE_TOOL_CONTEXT_VARS, CodeToolGlobal, CODE_TOOL_GLOBALS, CODE_TOOL_CONTEXT_NAMES, CODE_TOOL_INTERPOLATED_NAMES.
- [src/lib/console-params.ts](sources/agents/src/lib/console-params.ts) — 38 linhas; exports: SWITCH_TENANT_PARAM, CONSOLE_ROUTES, REJECTED_TENANT_SELECTOR_HEADER.
- [src/lib/db-guard.ts](sources/agents/src/lib/db-guard.ts) — 291 linhas; exports: FLEET_INHERITED_REASON, FleetRoleUnreachableError, FleetPolicyMismatchError, SuperuserRuntimeError, assertRuntimeRoleIsNotSuperuser.
- [src/lib/db-id.ts](sources/agents/src/lib/db-id.ts) — 61 linhas; exports: MAX_DB_ID, parseDbId, requireDbId, optionalDbId.
- [src/lib/edition.ts](sources/agents/src/lib/edition.ts) — 6 linhas; exports: IS_FREE.
- [src/lib/embedding-block.ts](sources/agents/src/lib/embedding-block.ts) — 32 linhas; exports: EmbeddingBlockReason, EMBEDDING_BLOCK_KEY.
- [src/lib/errors.ts](sources/agents/src/lib/errors.ts) — 145 linhas; exports: ErrorTranslationKey, AppError, ForbiddenError, ProEditionError, ConflictError, TenantTargetRequiredError, NotFoundError, ActiveTenantNotFoundError, UnauthorizedError, ServiceUnavailableError, ClassifierOverlapError.
- [src/lib/instance.ts](sources/agents/src/lib/instance.ts) — 14 linhas; exports: instanceIdentity.
- [src/lib/locks.ts](sources/agents/src/lib/locks.ts) — 55 linhas; exports: withEntityLock, withKeyedQueue, queuedKeyCount.
- [src/lib/mcp-launchers.ts](sources/agents/src/lib/mcp-launchers.ts) — 65 linhas; exports: MCP_STDIO_LAUNCHERS, McpStdioLauncher, DEFAULT_MCP_STDIO_LAUNCHER, isMcpStdioLauncher, stdioCommandLauncher, parseStdioCommand, composeStdioCommand, hasSafeStdioCommandChars.
- [src/lib/outbound.ts](sources/agents/src/lib/outbound.ts) — 235 linhas; exports: MAX_OUTBOUND_BODY_CHARS, OutboundBody, OutboundTimeoutError, readCappedBody, FetchBoundedOptions, BoundedResponse, fetchBounded, fetchBoundedNoBody, OutboundBytes, readCappedBytes, fetchBoundedBytes.
- [src/lib/palette.ts](sources/agents/src/lib/palette.ts) — 131 linhas; exports: Theme, derivePalette.
- [src/lib/parse-input.ts](sources/agents/src/lib/parse-input.ts) — 49 linhas; exports: parseInput.
- [src/lib/provider-failure.ts](sources/agents/src/lib/provider-failure.ts) — 167 linhas; exports: isTransientProviderStatus, statusOf, providerFailure, asProviderFailure, throughProvider.
- [src/lib/query-param.ts](sources/agents/src/lib/query-param.ts) — 36 linhas; exports: badQueryParam, assertUsableCount.
- [src/lib/redact.ts](sources/agents/src/lib/redact.ts) — 262 linhas; exports: MAX_STRING, truncate, scrubbedClip, redactSecretsDeep, sanitizeErrorMessage.
- [src/lib/roles.ts](sources/agents/src/lib/roles.ts) — 27 linhas; exports: ROLE_RANK, roleAtLeast, isAdminRole.
- [src/lib/semaphore.ts](sources/agents/src/lib/semaphore.ts) — 42 linhas; exports: Semaphore.
- [src/lib/ssrf.ts](sources/agents/src/lib/ssrf.ts) — 267 linhas; exports: SsrfError, isBlockedIpv4, isBlockedIpv6, isBlockedIp, isNameNotFound, SafeUrlOptions, assertSafeOutboundUrl.
- [src/lib/tenancy/actor.ts](sources/agents/src/lib/tenancy/actor.ts) — 10 linhas; exports: ACTOR_TYPES, ActorType.
- [src/lib/tenancy/context.ts](sources/agents/src/lib/tenancy/context.ts) — 55 linhas; exports: TenantContext, ScopedDb, runWithTenantContext, getTenantContext, requireTenantContext.
- [src/lib/tenancy/fleet-role.ts](sources/agents/src/lib/tenancy/fleet-role.ts) — 113 linhas; exports: FLEET_ROLE_FN, FLEET_ROLE_EXPR, FLEET_ROLE_FUNCTION_DDL, ENTER_FLEET_ROLE_SQL, FLEET_ROLE_RETAINED_MEMBER_ENV, FLEET_ROLE_RETAINED_MEMBER_GUC, retainedFleetMembers.
- [src/lib/tenancy/index.ts](sources/agents/src/lib/tenancy/index.ts) — 97 linhas; exports: authorize, resolveRequestTenantContext.
- [src/lib/tenancy/multi-tenant.ts](sources/agents/src/lib/tenancy/multi-tenant.ts) — 255 linhas; exports: SCOPED_TX_OPTIONS, runScopedOn, runScoped, asSuperAdminOn, asSuperAdmin, asPrincipalOn.
- [src/lib/tenancy/privileged-reach.ts](sources/agents/src/lib/tenancy/privileged-reach.ts) — 74 linhas; exports: CAN_REACH, RLS_DEFEATING, OUTLIVES_SET_ROLE, privilegedReachSql.
- [src/lib/text.ts](sources/agents/src/lib/text.ts) — 202 linhas; exports: clipText, clipTextEnd, OVERFLOW_PROBE_MARGIN, replaceLoneSurrogates, makeStorable, makeStorableDeep, unstorableCodePoints, unstorableProblem, UnstorableField, firstUnstorableField.
- [src/lib/xml.ts](sources/agents/src/lib/xml.ts) — 25 linhas; exports: xmlEscape, xmlAttr.

</details>

## src/modules/agents

Module: `src/modules/agents`  
Path: [diretório](sources/agents/src/modules/agents)  
Responsibility: CRUD/importação e grants do agente persistido.  
Public API: createAgent; replaceAgentToolSelections; importAgent  
Internal API: funções auxiliares nos arquivos abaixo; fronteiras reais detalhadas nos registros E  
Dependencies: package:bun:test, package:fix this, package:zod, src/api, src/api/features/realtime, src/bootstrap, src/client/lib, src/client/locales, src/graph, src/graph/tools, src/lib, src/modules/audit, src/modules/availability, src/modules/business-hours, src/modules/channel-redirect, src/modules/chatwoot, src/modules/contact-auth, src/modules/debounce, src/modules/documents, src/modules/flowlog, src/modules/followups, src/modules/guardrails, src/modules/handoff, src/modules/images, src/modules/integrations, src/modules/kanban, src/modules/memory, src/modules/n8n-export, src/modules/observe, src/modules/rag, src/modules/service-window, src/modules/split, src/modules/stt, src/modules/tenant-settings, src/modules/tool-definitions, src/modules/tts, src/modules/vault, src/modules/vision, src/modules/webhooks  
Dependents: src/api, src/client/lib, src/client/pages, src/graph, src/graph/tools, src/modules/availability, src/modules/channel-redirect, src/modules/chatwoot, src/modules/contact-auth, src/modules/conversations, src/modules/debounce, src/modules/followups, src/modules/guardrails, src/modules/handoff, src/modules/mcp, src/modules/observe, src/modules/spend-ceiling, src/modules/vault, src/modules/vision, tests  
Runtime relevance: REST/MCP → transação → audit; E02, E18  
Confidence: HIGH nos fluxos citados; não em todo símbolo  
Files: 19

<details><summary>Arquivos e exports</summary>

- [src/modules/agents/audit-projection.ts](sources/agents/src/modules/agents/audit-projection.ts) — 437 linhas; exports: AUDITED_AGENT_FIELDS, AuditedAgentField, AgentUpdateAction, AgentUpdateAudit, grantSetChanged, auditSafe, agentUpdateAudit.
- [src/modules/agents/behavior-settings.ts](sources/agents/src/modules/agents/behavior-settings.ts) — 371 linhas; exports: BehaviorSettings, BEHAVIOR_SETTINGS_KEYS, BehaviorSettingsKey, readBehaviorSettings, BehaviorSettingsPatch, behaviorSettingsMaxDepth, MERGE_MAX_DEPTH_FOR_TESTS, mergeBehaviorSettings.
- [src/modules/agents/config-health-copy.ts](sources/agents/src/modules/agents/config-health-copy.ts) — 53 linhas; exports: configIssueTranslator.
- [src/modules/agents/config-health-message.ts](sources/agents/src/modules/agents/config-health-message.ts) — 141 linhas; exports: ConfigIssueMessageDeps, configIssueMessage.
- [src/modules/agents/config-health-read.ts](sources/agents/src/modules/agents/config-health-read.ts) — 421 linhas; exports: AgentConfigHealthIssue, UncheckedCheck, AgentConfigHealth, ReadAgentConfigHealthOptions, readAgentConfigHealth, ConfigHealthAfterWrite, configHealthAfterWrite.
- [src/modules/agents/config-health-severity.ts](sources/agents/src/modules/agents/config-health-severity.ts) — 81 linhas; exports: ConfigIssueSeverity, severityOf, SEVERITY_ORDER.
- [src/modules/agents/config-health.ts](sources/agents/src/modules/agents/config-health.ts) — 924 linhas; exports: VaultRefFacts, ConfigIssueKey, ConfigIssue, issueHasAction, ConfigHealthInput, computeConfigIssues.
- [src/modules/agents/credential-paths.ts](sources/agents/src/modules/agents/credential-paths.ts) — 234 linhas; exports: SETTINGS_CREDENTIAL_PATHS, credRefSlot, remapCredRefAt, CredentialFieldTab, CredentialRefWrite, collectCredentialRefWrites.
- [src/modules/agents/limits.ts](sources/agents/src/modules/agents/limits.ts) — 59 linhas; exports: LimitsConfig, DEFAULT_MAX_TOOL_CALLS, readLimitsConfig.
- [src/modules/agents/mode.ts](sources/agents/src/modules/agents/mode.ts) — 35 linhas; exports: AGENT_MODES, AgentMode, normalizeAgentMode, isMonitoring, ingestsContinuously.
- [src/modules/agents/service.ts](sources/agents/src/modules/agents/service.ts) — 2390 linhas; exports: AgentDto, AGENT_SELECT, toDto, listAgents, ListAgentsOptions, PagedAgentItem, PagedAgents, listAgentsPaged, getAgent, PromptTooLongError, assertPromptSize, SettingsTextTooLongError, assertSettingsTextSizes, DebugWindowTooLongError, InvalidToolPreconditionError, assertSettingsToolPreconditions, HalfConfiguredFallbackError, SettingsWriteMode, classifierTaxonomyLock, assertNoClassifierOverlap, assertMonitoringLabelGroups, assertSettingsModelFallback, assertSettingsDebugWindow, assertCredentialRefsUsable, agentUpdateSchema, AgentUpdate, assertAgentUpdatable, assertAgentNotObserving, updateAgent, requireTenant, agentCreateSchema, AgentCreate, assertSchedulesExist, assertAgentCreatable, createAgent, deleteAgent, cloneAgent, ToolGrantInput, ToolGrantDto, ToolSelectionView, listKnowledgeBasesNeedingIndex, getAgentToolSelections, assertAgentToolGrantsResolvable, replaceAgentToolSelections.
- [src/modules/agents/settings-schema.ts](sources/agents/src/modules/agents/settings-schema.ts) — 861 linhas; exports: BEHAVIOR_PATCH_SHAPE, BehaviorPatchArgs.
- [src/modules/agents/speaks.ts](sources/agents/src/modules/agents/speaks.ts) — 85 linhas; exports: ObservesNow, agentObservesNow, agentStillSpeaks.
- [src/modules/agents/test-mode.ts](sources/agents/src/modules/agents/test-mode.ts) — 27 linhas; exports: isTestSilenced, shouldRunReset.
- [src/modules/agents/text-caps.ts](sources/agents/src/modules/agents/text-caps.ts) — 242 linhas; exports: TOOL_INSTRUCTIONS_MAX, CUSTOM_POLICY_MAX, TEMPLATE_MESSAGE_MAX, GENERATION_PROMPT_MAX, EXTRACTION_PROMPT_MAX, FOLLOW_UP_INSTRUCTIONS_MAX, FOLLOW_UP_MAX_STEPS, OversizedText, collectOversizedTextChanges, clampOversizedTextInPlace.
- [src/modules/agents/tool-guidance.ts](sources/agents/src/modules/agents/tool-guidance.ts) — 32 linhas; exports: readToolGuidance.
- [src/modules/agents/tool-preconditions.ts](sources/agents/src/modules/agents/tool-preconditions.ts) — 233 linhas; exports: PreconditionState, ToolPrecondition, parseToolPrecondition, readToolPreconditions, evaluatePrecondition, unmetPreconditionMessage, isGuardableToolName, invalidToolPreconditions.
- [src/modules/agents/transfer.test.ts](sources/agents/src/modules/agents/transfer.test.ts) — 98 linhas; exports: —.
- [src/modules/agents/transfer.ts](sources/agents/src/modules/agents/transfer.ts) — 2815 linhas; exports: AGENT_EXPORT_KIND, AGENT_EXPORT_VERSION, EXPORTED_COMPONENT_KEYS, agentExportSchema, AgentExport, ExportedHttpTool, ImportWarningTarget, ImportWarning, collectCredRefs, credentialFieldTargets, fieldTargetForPath, remapCredRefs, exportAgent, ImportAgentResult, importAgent, configBusinessHoursId, remapConfigBusinessHoursIdToName, importableHttpTool.

</details>

## src/modules/analytics

Module: `src/modules/analytics`  
Path: [diretório](sources/agents/src/modules/analytics)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: src/api, src/graph, src/lib, src/modules/conversations  
Dependents: src/api, src/modules/mcp, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 3

<details><summary>Arquivos e exports</summary>

- [src/modules/analytics/langfuse-costs.ts](sources/agents/src/modules/analytics/langfuse-costs.ts) — 244 linhas; exports: LangfuseCosts, resolveLangfuseProjectId, getLangfuseCosts.
- [src/modules/analytics/langfuse-test.ts](sources/agents/src/modules/analytics/langfuse-test.ts) — 41 linhas; exports: LangfuseTestResult, testLangfuseConnection.
- [src/modules/analytics/service.ts](sources/agents/src/modules/analytics/service.ts) — 427 linhas; exports: AgentUsage, InboxUsage, ModelUsage, SourceUsage, InstanceMetrics, MetricsFilter, normalizeTimeZone, getInstanceMetrics, DashboardKpis, getKpis, TimeseriesPoint, getTimeseries.

</details>

## src/modules/api-keys

Module: `src/modules/api-keys`  
Path: [diretório](sources/agents/src/modules/api-keys)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:node:crypto, package:zod, src/api, src/lib, src/modules/audit  
Dependents: src/api, src/modules/mcp, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 2

<details><summary>Arquivos e exports</summary>

- [src/modules/api-keys/service.ts](sources/agents/src/modules/api-keys/service.ts) — 274 linhas; exports: ApiKeyDto, listApiKeys, apiKeyCreateSchema, ApiKeyCreate, CreatedApiKey, createApiKey, assertApiKeyRevocable, revokeApiKey, listFleetApiKeys, createFleetApiKey, revokeFleetApiKey.
- [src/modules/api-keys/verify.ts](sources/agents/src/modules/api-keys/verify.ts) — 133 linhas; exports: API_KEY_PREFIX, LEGACY_API_KEY_PREFIX, hasApiKeyPrefix, GeneratedApiKey, hashApiKey, generateApiKey, ApiKeyPrincipal, verifyApiKey.

</details>

## src/modules/appointments

Module: `src/modules/appointments`  
Path: [diretório](sources/agents/src/modules/appointments)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:fired, src/api, src/graph, src/lib, src/modules/integrations, src/modules/scheduler, src/modules/vault  
Dependents: src/bootstrap, src/client/pages, src/graph, src/modules/chatwoot, src/modules/conversations, src/modules/followups, src/modules/integrations, src/modules/tool-definitions, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 6

<details><summary>Arquivos e exports</summary>

- [src/modules/appointments/context.ts](sources/agents/src/modules/appointments/context.ts) — 166 linhas; exports: AppointmentContextEvent, parseStartMs, loadAppointmentContext, buildAppointmentContextSection.
- [src/modules/appointments/provider.ts](sources/agents/src/modules/appointments/provider.ts) — 64 linhas; exports: GOOGLE_CALENDAR_PROVIDER, DECLARED_PROVIDER, readProviderSlug, reminderScopeId.
- [src/modules/appointments/record.ts](sources/agents/src/modules/appointments/record.ts) — 125 linhas; exports: RecordAppointmentArgs, RecordAppointmentResult, recordAppointment, cancelAppointmentRecord, cancelThreadAppointmentRecords.
- [src/modules/appointments/reminders.ts](sources/agents/src/modules/appointments/reminders.ts) — 792 linhas; exports: ReminderJob, computeReminderJobs, ScheduleAppointmentRemindersArgs, enqueueAppointmentReminders, AppointmentBookedArgs, AppointmentBookedResult, appointmentBooked, cancelAppointment, cancelThreadAppointments, hasLiveAppointment, ReminderNudgeArgs, reminderNudge, authoritativeReminderStart, reminderAlreadyStarted, appointmentReminderHandler, registerAppointmentReminderHandler.
- [src/modules/appointments/settings.ts](sources/agents/src/modules/appointments/settings.ts) — 81 linhas; exports: AppointmentReminderConfig, APPOINTMENT_REMINDER_MAX_OFFSETS, APPOINTMENT_REMINDER_DEFAULTS, normalizeOffsets, readAppointmentReminderConfig.
- [src/modules/appointments/side-effect.ts](sources/agents/src/modules/appointments/side-effect.ts) — 147 linhas; exports: AppointmentBookedNotice, AppointmentSideEffectDeps, AppointmentSideEffects, appointmentSideEffects.

</details>

## src/modules/audit

Module: `src/modules/audit`  
Path: [diretório](sources/agents/src/modules/audit)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: src/api, src/lib, src/modules/vault  
Dependents: src/api/features/admin, src/api/features/invitations, src/api, src/modules/agents, src/modules/api-keys, src/modules/business-hours, src/modules/chatwoot, src/modules/code-tools, src/modules/conversations, src/modules/documents, src/modules/experiments, src/modules/flowlog, src/modules/integrations, src/modules/mcp-connections, src/modules/mcp, src/modules/rag, src/modules/tenant-settings, src/modules/tool-definitions, src/modules/vault, src/modules/webhooks, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 3

<details><summary>Arquivos e exports</summary>

- [src/modules/audit/export.ts](sources/agents/src/modules/audit/export.ts) — 351 linhas; exports: AUDIT_EXPORT_FORMAT, AUDIT_EXPORT_MAX_ROWS, AUDIT_EXPORT_MAX_BYTES, clampAuditExportCeilings, ExportAuditOpts, ExportAuditResult, highWaterFrom, exportAudit.
- [src/modules/audit/projection.ts](sources/agents/src/modules/audit/projection.ts) — 152 linhas; exports: truncForAudit, redactEndpoint, refForAudit, undisclosedMoved, markUndisclosed.
- [src/modules/audit/service.ts](sources/agents/src/modules/audit/service.ts) — 413 linhas; exports: AuditEntry, recordAudit, auditMutation, auditMutationOn, projectionMoved, AuditLogItem, AuditFilterOpts, ListAuditOpts, AuditPage, buildAuditWhere, auditTrailFor, readInScope, listAudit, AuditKeyset, AuditCursor, encodeAuditCursor, parseAuditCursor.

</details>

## src/modules/availability

Module: `src/modules/availability`  
Path: [diretório](sources/agents/src/modules/availability)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: src/lib, src/modules/agents, src/modules/business-hours  
Dependents: src/modules/agents, src/modules/chatwoot, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [src/modules/availability/away.ts](sources/agents/src/modules/availability/away.ts) — 120 linhas; exports: AvailabilityConfig, AVAILABILITY_DEFAULTS, readAvailabilityConfig, AwayRender, renderAwayMessage, awayMessageDue.

</details>

## src/modules/business-hours

Module: `src/modules/business-hours`  
Path: [diretório](sources/agents/src/modules/business-hours)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:zod, src/api, src/lib, src/modules/audit  
Dependents: src/api, src/client/components, src/client/pages, src/graph, src/modules/agents, src/modules/availability, src/modules/chatwoot, src/modules/conversations, src/modules/followups, src/modules/integrations, src/modules/mcp, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 3

<details><summary>Arquivos e exports</summary>

- [src/modules/business-hours/announce.ts](sources/agents/src/modules/business-hours/announce.ts) — 123 linhas; exports: NextOpening, isOpenNow, nextOpening, formatWindowsSummary, formatNextOpen.
- [src/modules/business-hours/hours.ts](sources/agents/src/modules/business-hours/hours.ts) — 417 linhas; exports: timeRangeSchema, TimeRange, windowSpecSchema, WindowSpec, scheduleExceptionSchema, ScheduleException, Schedule, MAX_SCHEDULE_WINDOWS, MAX_SCHEDULE_EXCEPTIONS, parseWindows, parseExceptions, parseSchedule, isRangeOrdered, isRealDate, localDateKey, exceptionInForceAt, effectiveRangesAt, isOpenAt, scheduleCanClose, isOutOfHoursNow, fitsWithinWindows, NEXT_OPEN_SCAN_DAYS, nextOpenAt.
- [src/modules/business-hours/service.ts](sources/agents/src/modules/business-hours/service.ts) — 344 linhas; exports: BusinessHoursDto, businessHoursCreateSchema, BusinessHoursCreate, businessHoursUpdateSchema, BusinessHoursUpdate, listBusinessHours, getBusinessHours, readSchedule, assertBusinessHoursCreatable, createBusinessHours, assertBusinessHoursUpdatable, updateBusinessHours, deleteBusinessHours.

</details>

## src/modules/channel-redirect

Module: `src/modules/channel-redirect`  
Path: [diretório](sources/agents/src/modules/channel-redirect)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:already-closed, package:node:crypto, package:retired, package:silent, src/api, src/graph, src/lib, src/modules/agents, src/modules/chatwoot, src/modules/conversations, src/modules/scheduler, src/modules/service-window  
Dependents: src/bootstrap, src/client/pages, src/graph, src/modules/agents, src/modules/chatwoot, src/modules/conversations, src/modules/debounce, src/modules/followups, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 6

<details><summary>Arquivos e exports</summary>

- [src/modules/channel-redirect/cross-link.ts](sources/agents/src/modules/channel-redirect/cross-link.ts) — 225 linhas; exports: conversationUrl, shouldPropagateTestMode, whatsappSideNote, chatSideNote, LinkRedirectParams, LinkRedirectResult, linkRedirectConversations.
- [src/modules/channel-redirect/episode.ts](sources/agents/src/modules/channel-redirect/episode.ts) — 235 linhas; exports: redirectSide, EpisodeLookupInputs, needsEpisodeLookup, EpisodeActivationParams, episodeTestActivatedAt, EpisodeOriginParams, hasStoredOrigin, episodeOriginQuery.
- [src/modules/channel-redirect/followup.ts](sources/agents/src/modules/channel-redirect/followup.ts) — 1292 linhas; exports: followUpDedupeKey, retireRedirectFollowUp, RedirectFollowUpLiveness, isRedirectFollowUpLive, RedirectFollowUpStage, RedirectFollowUpPayload, parseRedirectFollowUpPayload, chatFollowupNudge, minutesFromNow, ArmRedirectChatFollowUpParams, armRedirectChatFollowUp, WhatsAppFollowUpOutcome, LadderVerdict, SendWhatsAppFollowUpParams, sendWhatsAppFollowUp, redirectFollowUpHandler, registerRedirectFollowUpHandlers, DeliverRedirectClosingParams, DeliverRedirectClosingOutcome, deliverRedirectClosing.
- [src/modules/channel-redirect/gate.ts](sources/agents/src/modules/channel-redirect/gate.ts) — 310 linhas; exports: RedirectGateOutcome, ResolveRedirectLinkParams, isOurIdentifier, identifierQueueKey, resolveRedirectLink, interpolateLink, RunRedirectGateParams, runRedirectGate.
- [src/modules/channel-redirect/link.ts](sources/agents/src/modules/channel-redirect/link.ts) — 96 linhas; exports: WidgetLink, NormalizedWebsiteUrl, normalizeWebsiteUrl, WidgetHealthStatus, WidgetHealth, classifyWidgetHealth, buildWidgetUrl.
- [src/modules/channel-redirect/service.ts](sources/agents/src/modules/channel-redirect/service.ts) — 233 linhas; exports: RedirectDelayUnit, ChannelRedirectConfig, CHANNEL_REDIRECT_DEFAULTS, REDIRECT_LINK_TTL_SECONDS, redirectDelayMinutes, REDIRECT_DELAY_UNITS, readChannelRedirectConfig, isRedirectEntryInbox, shouldSendRedirect.

</details>

## src/modules/chatwoot

Module: `src/modules/chatwoot`  
Path: [diretório](sources/agents/src/modules/chatwoot)  
Responsibility: Recepção autenticada, mirror, eleição de atendimento e entrega externa.  
Public API: receiveChatwootWebhook; recordAndProcessChatwootDelivery  
Internal API: funções auxiliares nos arquivos abaixo; fronteiras reais detalhadas nos registros E  
Dependencies: package: is not , package:an unobserve ran, package:did not know, package:no route ever asked, package:node:crypto, package:our own write-back, package:run the delivery path again, package:the agent was detached, package:the server that would have said so is down, package:zod, src/api, src/api/features/realtime, src/bootstrap, src/graph, src/lib, src/modules/agents, src/modules/appointments, src/modules/audit, src/modules/availability, src/modules/business-hours, src/modules/channel-redirect, src/modules/contact-auth, src/modules/conversations, src/modules/debounce, src/modules/flowlog, src/modules/handoff, src/modules/memory, src/modules/observe, src/modules/scheduler, src/modules/spend-ceiling, src/modules/stt, src/modules/vision, src/modules/webhooks  
Dependents: src/api, src/bootstrap, src/client/pages, src/graph, src/graph/tools, src/modules/agents, src/modules/channel-redirect, src/modules/conversations, src/modules/debounce, src/modules/flowlog, src/modules/followups, src/modules/guardrails, src/modules/handoff, src/modules/integrations, src/modules/mcp, src/modules/observe, src/modules/playground, src/modules/split, src/modules/stt, src/modules/vault, src/modules/vision, tests  
Runtime relevance: ACK separado do processamento; E03  
Confidence: HIGH nos fluxos citados; não em todo símbolo  
Files: 32

<details><summary>Arquivos e exports</summary>

- [src/modules/chatwoot/annotations.ts](sources/agents/src/modules/chatwoot/annotations.ts) — 123 linhas; exports: MediaAnnotation, sweepMediaAnnotations, nextSweepDelayMs, stashMediaAnnotation, overlayMediaAnnotations, clearMediaAnnotations, mediaAnnotationCount.
- [src/modules/chatwoot/attributes.ts](sources/agents/src/modules/chatwoot/attributes.ts) — 211 linhas; exports: AttributeScope, ATTRIBUTE_SCOPES, SCOPE_MODEL, AttributeContextConfig, ATTRIBUTE_CONTEXT_DEFAULTS, ATTRIBUTE_KEYS_MAX, ATTRIBUTE_KEY_MAX, ATTRIBUTE_KEYS_SCAN_MAX, readAttributeContextConfig, isAttributeContextEmpty, AttributeBags, ATTRIBUTE_VALUE_MAX, stringifyAttributeValue, buildAttributeContextSection, attributeBagsFrom.
- [src/modules/chatwoot/client.ts](sources/agents/src/modules/chatwoot/client.ts) — 1498 linhas; exports: ChatwootApiError, ChatwootMissingTokenError, BOT_ENDPOINT_NOT_AUTHORIZED, ChatwootClientConfig, ChatwootClientDeps, AttachmentDownloadOptions, ChatwootMessageType, CustomAttributeDef, WebWidgetInbox, ChatwootClient, createChatwootClient, fetchChatwootProfile.
- [src/modules/chatwoot/command-route.ts](sources/agents/src/modules/chatwoot/command-route.ts) — 37 linhas; exports: CommandRouteDrop, CommandRoute, commandRoute.
- [src/modules/chatwoot/console-write-order.ts](sources/agents/src/modules/chatwoot/console-write-order.ts) — 136 linhas; exports: consoleWriteMark, consoleWriteLandedAfter.
- [src/modules/chatwoot/constants.ts](sources/agents/src/modules/chatwoot/constants.ts) — 35 linhas; exports: CHATWOOT_AUTH_HEADER, CHATWOOT_SEND_ID_KEY.
- [src/modules/chatwoot/delivery-sweep.ts](sources/agents/src/modules/chatwoot/delivery-sweep.ts) — 1048 linhas; exports: recordTurnCoverage, retireCoveredDeliveries, SweepCounts, finish, SweepStrandedDeliveriesParams, sweepStrandedDeliveries, registerDeliverySweepHandler, ensureDeliverySweep, ensureAllDeliverySweeps.
- [src/modules/chatwoot/gate-close.ts](sources/agents/src/modules/chatwoot/gate-close.ts) — 53 linhas; exports: GateCloseDetail, HumanTakeoverDetail, describeHumanTakeover, describeClosedGate.
- [src/modules/chatwoot/human-takeover.ts](sources/agents/src/modules/chatwoot/human-takeover.ts) — 769 linhas; exports: OWNERSHIP_PROJECTION, conversationOwnershipNow, claimOpenForHumanQueue, HumanQueueOutcome, openForHumanQueue, HumanReplyTakeoverParams, runHumanReplyTakeover.
- [src/modules/chatwoot/instance.ts](sources/agents/src/modules/chatwoot/instance.ts) — 114 linhas; exports: LoadChatwootClientDeps, loadChatwootClient, AgentBotIdentity, agentBotChatwootId, loadAgentBot.
- [src/modules/chatwoot/kanban.ts](sources/agents/src/modules/chatwoot/kanban.ts) — 196 linhas; exports: KanbanStep, KanbanCard, KanbanContext, loadKanbanContext, matchKanbanStep, __resetKanbanStepsCache.
- [src/modules/chatwoot/labels.ts](sources/agents/src/modules/chatwoot/labels.ts) — 32 linhas; exports: withConversationLabels.
- [src/modules/chatwoot/management.ts](sources/agents/src/modules/chatwoot/management.ts) — 3849 linhas; exports: ChatwootInstanceDto, ChatwootDeploymentDto, listChatwootInstances, getChatwootInstance, getChatwootDeployment, disconnectChatwootDeployment, normalizeChatwootBaseUrl, chatwootDeploymentConnectSchema, ChatwootDeploymentConnectInput, assertDeploymentNotSwitching, assertDeploymentConnectable, connectChatwootDeployment, rotateChatwootDeploymentToken, listDeploymentAccounts, assertAccountsClaimable, assertDeploymentConnected, assertAccountsSelectable, setConnectedAccounts, softDisconnectChatwootInstance, reconnectChatwootInstance, removeChatwootInstance, InboxDto, listInboxes, readOutOfOfficeInboxes, listOutOfOfficeInboxes, getWidgetInboxHealth, InboxBotStatus, InboxBotStatuses, reconcileInboxBots, assertInboxReconnectable, reconnectInbox, AgentTeamDto, HandoffAccountDto, listAgentsAndTeams, ServiceWindowTemplateDto, listServiceWindowTemplates, InboxLabel, listInboxLabels, InboxCustomAttribute, listInboxCustomAttributes, unbindNeedsNothingRemote, assertInboxBindable, bindInbox, readObserveTarget, assertBindTargetNotObserving, observeInbox, unobserveInbox, remoteInboxIsGone, previewInboxRemoval, removeInbox, RemoteInbox, readInboxStates, parseInboxList, ChatwootAccountClaim, ChatwootAccountSummary, chatwootAccountsProbeSchema, ChatwootAccountsProbeInput, parseChatwootAccounts, ListAccountsDeps, listChatwootAccounts, SyncInboxesResult, syncInboxes.
- [src/modules/chatwoot/messages.ts](sources/agents/src/modules/chatwoot/messages.ts) — 242 linhas; exports: ChatwootMessageRow, chatwootMessageListLength, parseChatwootMessages, buildQuoteResolver, toRenderable, maxIncomingId, pendingIncoming.
- [src/modules/chatwoot/mirror.ts](sources/agents/src/modules/chatwoot/mirror.ts) — 797 linhas; exports: MirrorResult, mirrorChatwootEvent.
- [src/modules/chatwoot/normalize.ts](sources/agents/src/modules/chatwoot/normalize.ts) — 872 linhas; exports: messageTypeOf, TURN_BEARING_EVENT, LATE_TRANSCRIPTION_EVENT, normalizeChatwootEvent, LiveConversationState, parseLiveConversation, heldByAnotherParty, effectiveAssignee, shouldBotHandle, isIncomingMessage, isNewIncomingMessage, inboundTranscriptionOnUpdate, isHumanAgentMessage, isNewHumanAgentMessage, SESSION_SENDER_NAME, ECHO_RESERVING_WHATSAPP_PROVIDERS, providerReservesEchoIds, hasDeviceAttendantShape, isDeviceAttendantMessage, mayBeNewHumanReply, HumanReplyRoute, humanReplyShape, newHumanReplyShape, resolveHumanReplyRoute, humanReplyRoute, newHumanReplyRoute, isNewHumanReplyToCustomer, ControlCommand, controlCommand, isCommandMessage, firstAudioAttachment, incomingRenderable, firstLocationAttachment, firstVisualAttachment.
- [src/modules/chatwoot/out-of-office.ts](sources/agents/src/modules/chatwoot/out-of-office.ts) — 27 linhas; exports: chatwootAutoRepliesOutOfHours.
- [src/modules/chatwoot/provisioning.ts](sources/agents/src/modules/chatwoot/provisioning.ts) — 239 linhas; exports: EnsuredAgentBot, EnsureAgentBotDeps, ensureAgentBot, renameAgentBots.
- [src/modules/chatwoot/reconcile.ts](sources/agents/src/modules/chatwoot/reconcile.ts) — 386 linhas; exports: ReconcileResult, ReconcileFromLiveParams, reconcileMirrorFromLive.
- [src/modules/chatwoot/recover-delivery.ts](sources/agents/src/modules/chatwoot/recover-delivery.ts) — 1740 linhas; exports: MAX_RECOVERY_ATTEMPTS, MAX_RECOVERY_AGE_MS, RecoveryOutcome, RecoverStrandedDeliveryParams, recoverStrandedDelivery, putRowBack, deliveryRecoveryDedupeKey, isRecoverableStrand, armDeliveryRecovery, registerDeliveryRecoveryHandler.
- [src/modules/chatwoot/recover-payload.ts](sources/agents/src/modules/chatwoot/recover-payload.ts) — 249 linhas; exports: RecoveryConversation, RecoveryMessage, buildRecoveryPayload.
- [src/modules/chatwoot/recover-takeover.ts](sources/agents/src/modules/chatwoot/recover-takeover.ts) — 438 linhas; exports: takeoverRecoveryDedupeKey, armTakeoverRecovery, TakeoverRecoveryOutcome, RecoverTakeoverParams, recoverStrandedTakeover, registerTakeoverRecoveryHandler.
- [src/modules/chatwoot/render.ts](sources/agents/src/modules/chatwoot/render.ts) — 155 linhas; exports: RenderableLocation, RenderableMessage, renderAttendantMessage, cleanTranscription, renderInboundMessage.
- [src/modules/chatwoot/route-token-cache.ts](sources/agents/src/modules/chatwoot/route-token-cache.ts) — 281 linhas; exports: ROUTE_TOKEN_CACHE_TTL_MS, ROUTE_TOKEN_STALE_MS, ROUTE_TOKEN_REFRESH_WAIT_MS, ROUTE_TOKEN_NEGATIVE_MAX, CachedRouteTokenBot, RouteTokenCacheHit, routeTokenCacheGeneration, noteRouteTokenLookup, readRouteTokenCache, WriteRouteTokenOptions, writeRouteTokenCache, routeTokenRefreshInFlight, awaitRouteTokenRefresh, trackRouteTokenRefresh, invalidateRouteTokenCache.
- [src/modules/chatwoot/signing.ts](sources/agents/src/modules/chatwoot/signing.ts) — 55 linhas; exports: CHATWOOT_SIGNATURE_HEADER, CHATWOOT_TIMESTAMP_HEADER, CHATWOOT_DELIVERY_HEADER, VerifyChatwootSignatureParams, verifyChatwootSignature.
- [src/modules/chatwoot/state-order.ts](sources/agents/src/modules/chatwoot/state-order.ts) — 420 linhas; exports: StatePayload, StateRow, StateDecision, decideConversationWrites.
- [src/modules/chatwoot/status-claim.ts](sources/agents/src/modules/chatwoot/status-claim.ts) — 235 linhas; exports: STATUS_CLAIM_TTL_MS, statusClaimDeadline, statusClaimIsLive, StatusClaimVerdict, statusClaimVerdict, statusClaimDeferredWins.
- [src/modules/chatwoot/stranded-delivery.ts](sources/agents/src/modules/chatwoot/stranded-delivery.ts) — 266 linhas; exports: StrandedDeliveryRow, StrandedDeliveryPolicy, StrandedVerdict, classifyStrandedDelivery, isHumanReplyShape.
- [src/modules/chatwoot/types.ts](sources/agents/src/modules/chatwoot/types.ts) — 193 linhas; exports: ChatwootStatus, ChatwootAssigneeType, ChatwootMessageType, CHATWOOT_HANDLED_EVENTS, NormalizedChatwootAttachment, NormalizedChatwootMessage, NormalizedChatwootContact, NormalizedChatwootEvent.
- [src/modules/chatwoot/vocab.ts](sources/agents/src/modules/chatwoot/vocab.ts) — 50 linhas; exports: ChatwootVocab, loadChatwootVocab, attributesForModel, __resetChatwootVocabCache.
- [src/modules/chatwoot/webhook-mount.ts](sources/agents/src/modules/chatwoot/webhook-mount.ts) — 17 linhas; exports: CHATWOOT_WEBHOOK_MOUNT, chatwootOutgoingUrl.
- [src/modules/chatwoot/webhook.ts](sources/agents/src/modules/chatwoot/webhook.ts) — 6531 linhas; exports: ReceiveChatwootResult, ReceiveChatwootParams, receiveChatwootWebhook, RecordAndProcessChatwootParams, recordAndProcessChatwootDelivery, fillLedgerTranscribedMessage, ProcessChatwootParams, turnHadTheWords, hasPendingInboundMediaUpdate, EagerMediaOwner, runEagerMedia, outOfHoursGate, claimAwayMessage, releaseAwayMessage, contactAuthNoteText, processChatwootDelivery.

</details>

## src/modules/code-tools

Module: `src/modules/code-tools`  
Path: [diretório](sources/agents/src/modules/code-tools)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:@langchain/core, package:zod, src/api, src/graph/tools, src/lib, src/modules/audit, src/modules/tool-definitions  
Dependents: src/api, src/modules/mcp, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 2

<details><summary>Arquivos e exports</summary>

- [src/modules/code-tools/service.ts](sources/agents/src/modules/code-tools/service.ts) — 463 linhas; exports: CodeToolDto, CodeToolListDto, CodeToolWriteResult, LIST_SELECT, codeToolCreateSchema, CodeToolCreate, codeToolUpdateSchema, CodeToolUpdate, listCodeTools, getCodeTool, assertCodeToolCreatable, assertCodeToolPatchValid, assertCodeToolNameAvailable, createCodeTool, updateCodeTool, deleteCodeTool, codeToolReferences.
- [src/modules/code-tools/test-run.ts](sources/agents/src/modules/code-tools/test-run.ts) — 136 linhas; exports: CodeToolTestInput, CodeToolTestResult, runCodeToolTest.

</details>

## src/modules/contact-auth

Module: `src/modules/contact-auth`  
Path: [diretório](sources/agents/src/modules/contact-auth)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:node:crypto, package:we did not ask, src/api, src/bootstrap, src/graph, src/lib, src/modules/agents, src/modules/flowlog, src/modules/vault  
Dependents: src/graph, src/modules/agents, src/modules/chatwoot, src/modules/conversations, src/modules/debounce, src/modules/spend-ceiling, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 6

<details><summary>Arquivos e exports</summary>

- [src/modules/contact-auth/check.ts](sources/agents/src/modules/contact-auth/check.ts) — 418 linhas; exports: AuthorizationOutcome, ContactAuthOutcome, AuthorizationVerdict, ContactAuthVerdict, ContactIdentity, CheckDeps, REASON_SLUG_RE, MAX_RESPONSE_BYTES, MESSAGE_TEXT_MAX, reasonSlug, AUTH_CONTEXT_KEYS_MAX, AUTH_CONTEXT_VALUE_MAX, AUTH_CONTEXT_TOTAL_MAX, AuthContextField, AuthContext, readAuthContext, channelSlug, classifyAuthorizationResponse, buildAuthorizationRequest, underSignal, checkContactAuthorization.
- [src/modules/contact-auth/context.ts](sources/agents/src/modules/contact-auth/context.ts) — 67 linhas; exports: AUTH_CONTEXT_AUDIT_LABEL, buildAuthContextSection, withAuthContextSection.
- [src/modules/contact-auth/grants.ts](sources/agents/src/modules/contact-auth/grants.ts) — 598 linhas; exports: setMaxTrackedContactsForTest, setRefusalProtectionForTest, knownContactCount, hasUnconfirmedWrite, retryUnconfirmedWrite, clearContactAuthGrantState, unconfirmedWriteCount, GrantIdentity, contactAuthIdentityHash, contactAuthPolicyHash, CredentialStamp, readCredentialStamp, GrantKey, readContactAuthGrant, writeContactAuthGrant, dropContactAuthGrant.
- [src/modules/contact-auth/service.ts](sources/agents/src/modules/contact-auth/service.ts) — 338 linhas; exports: ContactAuthResult, AuthorizeContactParams, authorizeContact, contactAuthFlowEvent.
- [src/modules/contact-auth/settings.ts](sources/agents/src/modules/contact-auth/settings.ts) — 170 linhas; exports: ContactAuthMode, ContactAuthConfig, CONTACT_AUTH_DEFAULTS, CONTACT_AUTH_TIMEOUT_MIN_MS, CONTACT_AUTH_TIMEOUT_MAX_MS, CONTACT_AUTH_NOTICE_COOLDOWN_MAX_SECONDS, CONTACT_AUTH_GRANT_TTL_MIN_SECONDS, CONTACT_AUTH_GRANT_TTL_MAX_SECONDS, readContactAuthUrl, readContactAuthConfig.
- [src/modules/contact-auth/state.ts](sources/agents/src/modules/contact-auth/state.ts) — 203 linhas; exports: ContactAuthNotice, contactAuthNoticeKey, contactAuthFlightKey, NoticeClaim, claimContactAuthNotice, releaseContactAuthNotice, sweepContactAuthNotices, nextSweepDelayMs, singleFlight, clearContactAuthState, contactAuthNoticeCount, contactAuthNoticeEntries.

</details>

## src/modules/conversations

Module: `src/modules/conversations`  
Path: [diretório](sources/agents/src/modules/conversations)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: src/api, src/api/features/realtime, src/graph, src/lib, src/modules/agents, src/modules/appointments, src/modules/audit, src/modules/business-hours, src/modules/channel-redirect, src/modules/chatwoot, src/modules/contact-auth, src/modules/debounce, src/modules/flowlog, src/modules/followups, src/modules/spend-ceiling  
Dependents: src/api, src/graph, src/graph/tools, src/modules/analytics, src/modules/channel-redirect, src/modules/chatwoot, src/modules/debounce, src/modules/mcp, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 7

<details><summary>Arquivos e exports</summary>

- [src/modules/conversations/audit.ts](sources/agents/src/modules/conversations/audit.ts) — 53 linhas; exports: recordConversationAction.
- [src/modules/conversations/error.ts](sources/agents/src/modules/conversations/error.ts) — 65 linhas; exports: recordConversationError, clearConversationError.
- [src/modules/conversations/failure-note.ts](sources/agents/src/modules/conversations/failure-note.ts) — 243 linhas; exports: TurnFailure, isTurnLost, readDirectFence, FAILURE_NOTICE_COOLDOWN_MS, claimFailureNotice, announceFailedTurn.
- [src/modules/conversations/record-resolution.ts](sources/agents/src/modules/conversations/record-resolution.ts) — 176 linhas; exports: ConversationRef, ObservedConversation, observeBeforeClose, recordResolutionOrigin.
- [src/modules/conversations/reengage.ts](sources/agents/src/modules/conversations/reengage.ts) — 467 linhas; exports: ReengageOutcome, ReengageResult, assertConversationReengageable, reengageConversation.
- [src/modules/conversations/resolution-origin.ts](sources/agents/src/modules/conversations/resolution-origin.ts) — 207 linhas; exports: clearsResolutionOrigin, RESOLUTION_ORIGINS, ResolutionOrigin, isResolutionOrigin, ConversationOutcomeRow, ConversationOutcome, classifyOutcome.
- [src/modules/conversations/service.ts](sources/agents/src/modules/conversations/service.ts) — 2748 linhas; exports: ConversationStatus, ListConversationsFilter, ConversationListItem, ConversationsPage, listConversations, ConversationAttachment, ConversationMessage, ConversationDetail, ConversationTrailEntry, ConversationThread, getConversationDetail, getConversationMessages, ConversationMediaBlob, getConversationMedia, replyToConversation, handoffConversation, ReturnToAgentOutcome, requireAnsweringResponder, assertConversationReturnable, ReturnToAgentHolder, returnConversationToAgent, setConversationStatus.

</details>

## src/modules/debounce

Module: `src/modules/debounce`  
Path: [diretório](sources/agents/src/modules/debounce)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: src/api, src/bootstrap, src/graph, src/lib, src/modules/agents, src/modules/channel-redirect, src/modules/chatwoot, src/modules/contact-auth, src/modules/conversations, src/modules/flowlog, src/modules/memory, src/modules/observe, src/modules/scheduler, src/modules/spend-ceiling  
Dependents: src/bootstrap, src/graph, src/modules/agents, src/modules/chatwoot, src/modules/conversations, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 5

<details><summary>Arquivos e exports</summary>

- [src/modules/debounce/handler.ts](sources/agents/src/modules/debounce/handler.ts) — 1868 linhas; exports: CoalesceTurnContext, selectAnswerableBurst, coalesceAndRunTurn, FlushDebounceParams, flushDebounceJob, announceDeadDebounceFlush, registerDebounceHandler.
- [src/modules/debounce/service.ts](sources/agents/src/modules/debounce/service.ts) — 138 linhas; exports: debounceDedupeKey, resolveDebounceConfig, readLastMessageId, ArmDebounceParams, armDebounce.
- [src/modules/debounce/settings.ts](sources/agents/src/modules/debounce/settings.ts) — 75 linhas; exports: DebounceConfig, DEBOUNCE_DEFAULTS, WINDOW_MIN_SECONDS, WINDOW_MAX_SECONDS, readDebounceConfig.
- [src/modules/debounce/watermark.ts](sources/agents/src/modules/debounce/watermark.ts) — 178 linhas; exports: AdvanceHandledWatermarkParams, advanceHandledWatermark, claimReplyBurst, readAnsweredFloor, readHandledWatermark.
- [src/modules/debounce/worker.ts](sources/agents/src/modules/debounce/worker.ts) — 82 linhas; exports: DebounceTickDeps, runDebounceTick, StartOptions, startDebounceWorker, stopDebounceWorker.

</details>

## src/modules/documents

Module: `src/modules/documents`  
Path: [diretório](sources/agents/src/modules/documents)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:@react-pdf/renderer, package:node:crypto, package:node:fs, package:zod, src/api, src/bootstrap, src/graph, src/graph/tools, src/lib, src/modules/audit, src/modules/tenant-settings, src/modules/tool-definitions  
Dependents: src/api, src/client/pages, src/graph/tools, src/modules/agents, src/modules/mcp, src/modules/playground, src/modules/tenant-settings, src/modules/tool-definitions, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 17

<details><summary>Arquivos e exports</summary>

- [src/modules/documents/blocks.ts](sources/agents/src/modules/documents/blocks.ts) — 348 linhas; exports: headerBlockSchema, textBlockSchema, fieldsBlockSchema, LINE_ITEM_COLUMNS, LineItemColumn, lineItemsBlockSchema, TOTAL_ROWS, TotalRow, totalsBlockSchema, dividerBlockSchema, documentBlockSchema, DocumentBlock, DocumentBlockType, DOCUMENT_BLOCK_TYPES, FIELD_TYPES, DocumentFieldType, FIELD_NAME_RE, isPrototypeName, documentFieldSchema, DocumentField, DOCUMENT_FONTS, DocumentFont, BASE_FONT_SIZE_MIN, BASE_FONT_SIZE_MAX, documentStyleSchema, DocumentStyle, DOCUMENT_STYLE_DEFAULTS, parseDocumentStyle, blockCanDraw, MAX_BLOCKS_PER_DOCUMENT, MAX_LINE_ITEMS, MAX_FIELDS_PER_DOCUMENT, MAX_DOCUMENT_AMOUNT, MAX_TOKENS_PER_DOCUMENT, documentAuthoringSchema.
- [src/modules/documents/company.ts](sources/agents/src/modules/documents/company.ts) — 371 linhas; exports: LOGO_EXT_BY_TYPE, LOGO_MAX_BYTES, LOGO_ALLOWED_FORMATS, LOGO_MAX_PIXELS, LOGO_MAX_SIDE, logoPixels, logoBytesLookLike, LOGO_CONTENT_TYPE, logoKeyFor, logoExtOf, UploadedFile, setCompanyLogo, clearCompanyLogo, CompanyLogo, readCompanyLogo.
- [src/modules/documents/deliverable.ts](sources/agents/src/modules/documents/deliverable.ts) — 32 linhas; exports: DocumentBlock, DocumentDeliverability, DocumentVerdict, documentVerdict.
- [src/modules/documents/draws.ts](sources/agents/src/modules/documents/draws.ts) — 141 linhas; exports: DrawsInput, documentDraws.
- [src/modules/documents/format.ts](sources/agents/src/modules/documents/format.ts) — 85 linhas; exports: formatMoney, formatNumber, formatDate, formatDocumentNumber.
- [src/modules/documents/issue.ts](sources/agents/src/modules/documents/issue.ts) — 783 linhas; exports: DocumentSnapshot, IssueDocumentParams, IssuedDocumentResult, printedDate, calendarDay, sysCtx, storageKey, documentFileName, issueDocument, DocumentPdf, getIssuedDocumentPdf, IssuedDocumentListItem, listIssuedDocuments, revokeIssuedDocument.
- [src/modules/documents/markdown.ts](sources/agents/src/modules/documents/markdown.ts) — 107 linhas; exports: InlineSpan, MarkdownLine, parseInline, parseSimpleMarkdown.
- [src/modules/documents/printable.ts](sources/agents/src/modules/documents/printable.ts) — 76 linhas; exports: isPrintableCodeUnit, unprintableCharacters, unprintableProblem.
- [src/modules/documents/render.tsx](sources/agents/src/modules/documents/render.tsx) — 483 linhas; exports: FOOTER_MAX_LINES, footerReserve, DocumentRenderInput, renderDocumentPdf.
- [src/modules/documents/sample.ts](sources/agents/src/modules/documents/sample.ts) — 45 linhas; exports: sampleValues.
- [src/modules/documents/slug.ts](sources/agents/src/modules/documents/slug.ts) — 61 linhas; exports: slugifyTemplateName, documentToolName, SLUG_MAX, slugProblem.
- [src/modules/documents/starters.ts](sources/agents/src/modules/documents/starters.ts) — 297 linhas; exports: DocumentStarter, documentStarters, documentStarter.
- [src/modules/documents/templates.ts](sources/agents/src/modules/documents/templates.ts) — 1313 linhas; exports: documentTemplateWriteProblem, DocumentTemplateDto, DocumentTemplateInput, templateNameSchema, normalizeTemplateName, templateDescriptionSchema, templateNumberPrefixSchema, templateMetadataProblem, listDocumentTemplates, getDocumentTemplate, createDocumentTemplate, updateDocumentTemplate, patchedContent, deleteDocumentTemplate, ResourceReferences, documentTemplateReferences, PreviewInput, ResolvedRenderContext, readRenderContext, previewDocumentTemplate.
- [src/modules/documents/tokens.ts](sources/agents/src/modules/documents/tokens.ts) — 159 linhas; exports: DOCUMENT_TOKEN_RE, RESERVED_TOKEN_PREFIXES, isReservedTokenName, COMPANY_TOKEN_ALIASES, DOCUMENT_TOKEN_ALIASES, RESERVED_TOKEN_NAMES, withAliases, sanitizeDocumentValue, malformedTokenIn, tokensIn, resolveTokens.
- [src/modules/documents/totals.ts](sources/agents/src/modules/documents/totals.ts) — 116 linhas; exports: DocumentTotals, roundDecimal, displayedQuantity, displayedMoney, computeTotals, lineTotal.
- [src/modules/documents/validate.ts](sources/agents/src/modules/documents/validate.ts) — 772 linhas; exports: documentBlocksSchema, documentFieldsSchema, ParsedTemplateContent, TemplateParse, authoredStyleProblem, ParsedAuthoredTemplate, AuthoredTemplateParse, AuthoredHalves, parseAuthoredTemplate, parseTemplateContent, lineItemValueSchema, LineItemValue, DocumentValue, DocumentValues, ValuesParse, parseDocumentValues, invalidDocumentTemplate.
- [src/modules/documents/vars.ts](sources/agents/src/modules/documents/vars.ts) — 91 linhas; exports: DocumentMeta, DocumentVarsInput, buildDocumentVars.

</details>

## src/modules/experiments

Module: `src/modules/experiments`  
Path: [diretório](sources/agents/src/modules/experiments)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:zod, src/api, src/bootstrap, src/lib, src/modules/audit  
Dependents: src/api, src/graph, src/modules/mcp, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [src/modules/experiments/service.ts](sources/agents/src/modules/experiments/service.ts) — 483 linhas; exports: variantSchema, Variant, variantWriteSchema, parseVariants, chooseVariant, resolveVariantOverride, EXPERIMENT_NAME_MAX, assertExperimentNameUsable, requireExperimentAgent, assertExperimentAgentExists, listExperiments, createExperiment, getExperiment, updateExperiment, deleteExperiment, VariantResult, experimentResults.

</details>

## src/modules/flowlog

Module: `src/modules/flowlog`  
Path: [diretório](sources/agents/src/modules/flowlog)  
Responsibility: Registro de etapas, redaction, falhas e alertas.  
Public API: emitFlowEvent; withFlowStage  
Internal API: funções auxiliares nos arquivos abaixo; fronteiras reais detalhadas nos registros E  
Dependencies: package:the write has not landed yet, package:zod, src/api, src/bootstrap, src/lib, src/modules/audit, src/modules/chatwoot, src/modules/scheduler, src/modules/vault, src/modules/webhooks  
Dependents: src/api, src/bootstrap, src/client/components, src/client/pages, src/graph, src/graph/tools, src/modules/agents, src/modules/chatwoot, src/modules/contact-auth, src/modules/conversations, src/modules/debounce, src/modules/guardrails, src/modules/mcp, src/modules/memory, src/modules/observe, src/modules/playground, src/modules/rag, src/modules/scheduler, src/modules/spend-ceiling, src/modules/split, src/modules/stt, src/modules/tts, src/modules/vision, src/modules/webhooks, tests  
Runtime relevance: Callbacks → writes assíncronos de ExecutionLog; E25  
Confidence: HIGH nos fluxos citados; não em todo símbolo  
Files: 16

<details><summary>Arquivos e exports</summary>

- [src/modules/flowlog/alert-worker.ts](sources/agents/src/modules/flowlog/alert-worker.ts) — 440 linhas; exports: AlertWorkerOptions, AlertBatchSummary, processAlertBatch, startAlertWorker, stopAlertWorker.
- [src/modules/flowlog/alerts.ts](sources/agents/src/modules/flowlog/alerts.ts) — 81 linhas; exports: dispatchAlertsForEvent.
- [src/modules/flowlog/channels.ts](sources/agents/src/modules/flowlog/channels.ts) — 386 linhas; exports: AlertChannelDto, listAlertChannels, alertChannelCreateSchema, AlertChannelCreate, assertAlertChannelWritable, createAlertChannel, alertChannelUpdateSchema, AlertChannelUpdate, updateAlertChannel, deleteAlertChannel.
- [src/modules/flowlog/command.ts](sources/agents/src/modules/flowlog/command.ts) — 70 linhas; exports: CommandDrop, emitCommandDropped.
- [src/modules/flowlog/dead-letter.ts](sources/agents/src/modules/flowlog/dead-letter.ts) — 58 linhas; exports: emitDeadLetter.
- [src/modules/flowlog/debug-mode.ts](sources/agents/src/modules/flowlog/debug-mode.ts) — 84 linhas; exports: DebugModes, readDebugModes, debugModesFrom.
- [src/modules/flowlog/export.ts](sources/agents/src/modules/flowlog/export.ts) — 128 linhas; exports: LOG_EXPORT_FORMATS, LogExportFormat, MAX_LOG_EXPORT_ROWS, ExportLogsOpts, ExportLogsResult, serializeLogItems, exportExecutionLogs.
- [src/modules/flowlog/read.ts](sources/agents/src/modules/flowlog/read.ts) — 148 linhas; exports: ExecutionLogItem, ListLogsOpts, ListLogsResult, LOG_SELECT, ExecutionLogRow, buildLogWhere, mapExecutionLogRow, listExecutionLogs.
- [src/modules/flowlog/retention.ts](sources/agents/src/modules/flowlog/retention.ts) — 98 linhas; exports: registerFlowlogRetentionHandler, ensureFlowlogSweep, ensureAllFlowlogSweeps.
- [src/modules/flowlog/scheduled.ts](sources/agents/src/modules/flowlog/scheduled.ts) — 64 linhas; exports: trackFlowWrite, scheduledFlowWrites, settleFlowEvents.
- [src/modules/flowlog/service.ts](sources/agents/src/modules/flowlog/service.ts) — 242 linhas; exports: debugCeilingFor, DEBUG_MAX_STRING, FlowContext, FlowEvent, emitFlowEvent, writeFlowEvent, withFlowStage.
- [src/modules/flowlog/settings.ts](sources/agents/src/modules/flowlog/settings.ts) — 194 linhas; exports: FULL_DETAIL_MAX_HOURS, FULL_DETAIL_ARM_HOURS, ObservabilityConfig, readObservabilityConfig, isFullDetailWindowOpen, StorableObservability, storableObservability, disarmFullDetail, parseIsoInstant.
- [src/modules/flowlog/shape.ts](sources/agents/src/modules/flowlog/shape.ts) — 76 linhas; exports: DeclaredKeys, describeShape.
- [src/modules/flowlog/stages.ts](sources/agents/src/modules/flowlog/stages.ts) — 94 linhas; exports: FLOW_STAGES, FlowStage, isFlowStage, ALERT_DELIVERY_UNIT, DEAD_UNITS, DeadUnit, FLOW_LEVELS, FlowLevel, isFlowLevel, FlowStatus, FlowSource.
- [src/modules/flowlog/unrouted.ts](sources/agents/src/modules/flowlog/unrouted.ts) — 62 linhas; exports: emitUnroutedMessage.
- [src/modules/flowlog/webhook.ts](sources/agents/src/modules/flowlog/webhook.ts) — 118 linhas; exports: emitDeliveryDead, emitDeliveryRequeued.

</details>

## src/modules/followups

Module: `src/modules/followups`  
Path: [diretório](sources/agents/src/modules/followups)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: src/api, src/graph, src/lib, src/modules/agents, src/modules/appointments, src/modules/business-hours, src/modules/channel-redirect, src/modules/chatwoot, src/modules/scheduler  
Dependents: src/bootstrap, src/client/pages, src/modules/agents, src/modules/conversations, src/modules/playground, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 5

<details><summary>Arquivos e exports</summary>

- [src/modules/followups/appointment-pause.ts](sources/agents/src/modules/followups/appointment-pause.ts) — 32 linhas; exports: appointmentPauseApplies.
- [src/modules/followups/eligibility.ts](sources/agents/src/modules/followups/eligibility.ts) — 76 linhas; exports: FollowUpLiveness, MirrorHolder, isFollowUpLive.
- [src/modules/followups/handlers.ts](sources/agents/src/modules/followups/handlers.ts) — 651 linhas; exports: inactivityNudge, followUpHandler, registerFollowUpHandlers, ensureTenantSweep, ensureAllTenantSweeps.
- [src/modules/followups/service.ts](sources/agents/src/modules/followups/service.ts) — 4 linhas; exports: —.
- [src/modules/followups/settings.ts](sources/agents/src/modules/followups/settings.ts) — 183 linhas; exports: FollowUpDelayUnit, FollowUpStep, FollowUpConfig, FOLLOW_UP_DEFAULTS, isNewFollowUpEpisode, stepDelayMinutes, FOLLOW_UP_DELAY_UNITS, readFollowUpConfig.

</details>

## src/modules/guardrails

Module: `src/modules/guardrails`  
Path: [diretório](sources/agents/src/modules/guardrails)  
Responsibility: Análise de entrada/saída com modelo e integração de veredictos.  
Public API: analyzeText  
Internal API: funções auxiliares nos arquivos abaixo; fronteiras reais detalhadas nos registros E  
Dependencies: package:@langchain/core, package:never screened, src/api, src/graph, src/lib, src/modules/agents, src/modules/chatwoot, src/modules/flowlog  
Dependents: src/api, src/client/pages, src/graph, src/modules/agents, src/modules/playground, tests  
Runtime relevance: Runtime → modelo de análise → resultado; E28  
Confidence: HIGH nos fluxos citados; não em todo símbolo  
Files: 7

<details><summary>Arquivos e exports</summary>

- [src/modules/guardrails/analyze.ts](sources/agents/src/modules/guardrails/analyze.ts) — 316 linhas; exports: splitAnalyses, analyzeGuardrail.
- [src/modules/guardrails/gate.ts](sources/agents/src/modules/guardrails/gate.ts) — 355 linhas; exports: GuardrailDecision, screenedText, guardrailTripped, guardrailLeftAMark, guardrailRan, GuardrailGate, GuardrailReport, GuardrailAnnounce, chatwootNoteSink, GuardrailGateParams, buildGuardrailGate.
- [src/modules/guardrails/health.ts](sources/agents/src/modules/guardrails/health.ts) — 118 linhas; exports: GUARDRAIL_HEALTH_WINDOW_HOURS, guardrailHealthWindowStart, GuardrailHealth, readGuardrailHealth.
- [src/modules/guardrails/log-categories.ts](sources/agents/src/modules/guardrails/log-categories.ts) — 30 linhas; exports: loggableCategories.
- [src/modules/guardrails/prompts.ts](sources/agents/src/modules/guardrails/prompts.ts) — 224 linhas; exports: GuardrailPromptParams, GUARDRAIL_CATEGORY_KEYS, activeChecks, judgesAnything, CUSTOMER_MESSAGE_TAG, customerMessageForReview, fenceCustomerMessage, buildGuardrailSystemPrompt.
- [src/modules/guardrails/settings.ts](sources/agents/src/modules/guardrails/settings.ts) — 204 linhas; exports: GuardrailAction, GUARDRAIL_ACTIONS, GuardrailChecks, GuardrailDirectionConfig, GuardrailsConfig, GUARDRAILS_DEFAULTS, readGuardrailsConfig.
- [src/modules/guardrails/verdict.ts](sources/agents/src/modules/guardrails/verdict.ts) — 211 linhas; exports: VerdictMode, GuardrailVerdict, CLEAN, unanalyzed, VERDICT_SCHEMA, VERDICT_SCHEMA_OPENAPI, verdictFromObject, readVerdict.

</details>

## src/modules/handoff

Module: `src/modules/handoff`  
Path: [diretório](sources/agents/src/modules/handoff)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: src/lib, src/modules/agents, src/modules/chatwoot  
Dependents: src/graph, src/graph/tools, src/modules/agents, src/modules/chatwoot, src/modules/kanban, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 2

<details><summary>Arquivos e exports</summary>

- [src/modules/handoff/settings.ts](sources/agents/src/modules/handoff/settings.ts) — 129 linhas; exports: HandoffMode, HandoffConfig, HANDOFF_DEFAULTS, readToolInstructions, HANDOFF_MODES, readHandoffConfig, TakeoverConfig, TAKEOVER_DEFAULTS, readTakeoverConfig.
- [src/modules/handoff/targets.ts](sources/agents/src/modules/handoff/targets.ts) — 53 linhas; exports: HandoffTargets, loadHandoffTargets, matchHandoffTarget, __resetHandoffTargetsCache.

</details>

## src/modules/images

Module: `src/modules/images`  
Path: [diretório](sources/agents/src/modules/images)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: src/lib  
Dependents: src/graph, src/graph/tools, src/modules/agents, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 2

<details><summary>Arquivos e exports</summary>

- [src/modules/images/fetch.ts](sources/agents/src/modules/images/fetch.ts) — 209 linhas; exports: ImageFetchFailure, ImageFetchResult, SUPPORTED_IMAGE_TYPES, ImageFetchDeps, fetchImageForDelivery.
- [src/modules/images/settings.ts](sources/agents/src/modules/images/settings.ts) — 109 linhas; exports: SendImageConfig, SEND_IMAGE_DEFAULTS, IMAGE_MAX_BYTES, IMAGE_FETCH_TIMEOUT_MS, MAX_ALLOWED_HOSTS, SEND_IMAGE_MAX_PER_TURN, SEND_IMAGE_MAX_TURN_BYTES, SEND_IMAGE_MAX_CAPTION_CHARS, normalizeAllowedHost, readSendImageConfig, isAllowedImageHost, normalizeSettingsForStorage.

</details>

## src/modules/integrations

Module: `src/modules/integrations`  
Path: [diretório](sources/agents/src/modules/integrations)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:@langchain/core, package:node:crypto, package:zod, src/api, src/graph/tools, src/lib, src/modules/appointments, src/modules/audit, src/modules/business-hours, src/modules/chatwoot, src/modules/vault, src/modules/webhooks  
Dependents: src/api, src/graph, src/graph/tools, src/modules/agents, src/modules/appointments, src/modules/mcp, src/modules/webhooks, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 12

<details><summary>Arquivos e exports</summary>

- [src/modules/integrations/catalog.ts](sources/agents/src/modules/integrations/catalog.ts) — 51 linhas; exports: CATALOG, getCatalogEntry, isKnownCatalogType.
- [src/modules/integrations/google-calendar.service.ts](sources/agents/src/modules/integrations/google-calendar.service.ts) — 138 linhas; exports: CalendarListItem, mapCalendarListResponse, CalendarListDeps, listCredentialCalendars.
- [src/modules/integrations/google-drive.service.ts](sources/agents/src/modules/integrations/google-drive.service.ts) — 147 linhas; exports: DriveFolderListItem, mapDriveFolderListResponse, DriveFolderListDeps, listCredentialDriveFolders.
- [src/modules/integrations/mappers.ts](sources/agents/src/modules/integrations/mappers.ts) — 114 linhas; exports: registerMapper, getMapper.
- [src/modules/integrations/service.ts](sources/agents/src/modules/integrations/service.ts) — 508 linhas; exports: ResolvedInboundRoute, resolveInboundRouteByToken, assertUsableHeaderNames, CreateIntegrationParams, createIntegrationInstance, listCatalog, IntegrationInstanceDto, RouteTokenStatus, listIntegrationInstances, getIntegrationInstance, UpdateIntegrationParams, updateIntegrationInstance, rotateIntegrationRouteToken, deleteIntegrationInstance.
- [src/modules/integrations/toolpacks/asaas.ts](sources/agents/src/modules/integrations/toolpacks/asaas.ts) — 644 linhas; exports: asaasToolpack.
- [src/modules/integrations/toolpacks/calendar-slots.ts](sources/agents/src/modules/integrations/toolpacks/calendar-slots.ts) — 368 linhas; exports: SlotInput, Slot, computeAvailableSlots, CalendarSource, AggregatedSlot, AggregateInput, AggregateResult, computeAggregatedSlots, zonedWallClock, zonedMidnightMs, BookingInput, BookingVerdict, bookingWindow, judgeBooking, subtractWindow.
- [src/modules/integrations/toolpacks/google-calendar.ts](sources/agents/src/modules/integrations/toolpacks/google-calendar.ts) — 1728 linhas; exports: googleCalendarToolpack.
- [src/modules/integrations/toolpacks/google-drive.ts](sources/agents/src/modules/integrations/toolpacks/google-drive.ts) — 364 linhas; exports: googleDriveToolpack.
- [src/modules/integrations/toolpacks/index.ts](sources/agents/src/modules/integrations/toolpacks/index.ts) — 23 linhas; exports: —.
- [src/modules/integrations/toolpacks/types.ts](sources/agents/src/modules/integrations/toolpacks/types.ts) — 193 linhas; exports: IntegrationSelection, ToolpackCtx, SideEffectErrorReporter, ToolArgSpec, ToolSpec, Toolpack, argsFromZod, ToolView, registerToolpack, getToolpack, buildToolpackTools, getToolpackToolNames, getToolpackToolViews.
- [src/modules/integrations/types.ts](sources/agents/src/modules/integrations/types.ts) — 64 linhas; exports: INBOUND_EVENT_KINDS, InboundEventKind, NormalizedInboundEvent, MapResult, InboundMapper, CatalogKind, CatalogEntry.

</details>

## src/modules/kanban

Module: `src/modules/kanban`  
Path: [diretório](sources/agents/src/modules/kanban)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: src/modules/handoff  
Dependents: src/graph, src/modules/agents, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [src/modules/kanban/settings.ts](sources/agents/src/modules/kanban/settings.ts) — 27 linhas; exports: KanbanConfig, KANBAN_DEFAULTS, readKanbanConfig.

</details>

## src/modules/mcp

Module: `src/modules/mcp`  
Path: [diretório](sources/agents/src/modules/mcp)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:@modelcontextprotocol/sdk, package:jose, package:node:crypto, package:zod, src/api, src/api/features/branding, src/bootstrap, src/graph/tools, src/lib, src/modules/agents, src/modules/analytics, src/modules/api-keys, src/modules/audit, src/modules/business-hours, src/modules/chatwoot, src/modules/code-tools, src/modules/conversations, src/modules/documents, src/modules/experiments, src/modules/flowlog, src/modules/integrations, src/modules/mcp-connections, src/modules/playground, src/modules/rag, src/modules/tenant-settings, src/modules/tool-definitions, src/modules/vault, src/modules/webhooks  
Dependents: scripts, src/api, src/bootstrap, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 21

<details><summary>Arquivos e exports</summary>

- [src/modules/mcp/console-links.ts](sources/agents/src/modules/mcp/console-links.ts) — 55 linhas; exports: consoleUrl, vaultFillUrl, vaultCreateUrl, integrationsUrl.
- [src/modules/mcp/oauth/admin.ts](sources/agents/src/modules/mcp/oauth/admin.ts) — 498 linhas; exports: McpClientDto, listClients, CreateClientInput, createClient, UpdateClientInput, updateClient, deleteClient, ActiveTokenDto, listActiveTokens, revokeToken, ClientApprovalDto, listClientApprovals, deleteClientApproval.
- [src/modules/mcp/oauth/connections.ts](sources/agents/src/modules/mcp/oauth/connections.ts) — 141 linhas; exports: MyConnectionDto, listMyConnections, DisconnectResult, disconnectClient.
- [src/modules/mcp/oauth/consent.ts](sources/agents/src/modules/mcp/oauth/consent.ts) — 187 linhas; exports: CreatePendingParams, createPendingAuthorization, getPendingAuthorization, issueConsentCsrf, consumePendingAuthorization, findApproval, isApprovalSufficient, upsertApproval.
- [src/modules/mcp/oauth/dcr.ts](sources/agents/src/modules/mcp/oauth/dcr.ts) — 30 linhas; exports: validateRedirectUris.
- [src/modules/mcp/oauth/grant.ts](sources/agents/src/modules/mcp/oauth/grant.ts) — 230 linhas; exports: CreateCodeParams, createAuthorizationCode, TokenResponse, ExchangeCodeParams, exchangeAuthorizationCode, RefreshParams, refreshAccessToken.
- [src/modules/mcp/oauth/metadata.ts](sources/agents/src/modules/mcp/oauth/metadata.ts) — 60 linhas; exports: issuerUrl, mcpResourceId, authServerMetadata, protectedResourceMetadata.
- [src/modules/mcp/oauth/tokens.ts](sources/agents/src/modules/mcp/oauth/tokens.ts) — 192 linhas; exports: MCP_SCOPES, McpScope, IssueAccessTokenParams, IssuedAccessToken, issueAccessToken, VerifiedToken, verifyAccessToken, revokeAccessToken, hasScope, scopesForRole, mcpPrincipalFromApiKey.
- [src/modules/mcp/read.ts](sources/agents/src/modules/mcp/read.ts) — 1232 linhas; exports: agentGet, agentConfigHealth, agentToolsGet, toolList, toolGet, codeToolList, codeToolGet, codeToolSchema, documentTemplateList, documentTemplateGet, documentTemplateSchema, documentStarterList, issuedDocumentList, mcpConnectionList, integrationList, integrationCatalog, knowledgeList, knowledgeSearch, knowledgeDocumentsList, knowledgeApprovalsList, instanceList, instanceGet, inboxList, webhookList, webhookEventsList, WebhookDeliveryListArgs, webhookDeliveryList, webhookDeliveryGet, alertChannelList, alertStageList, businessHoursList, experimentList, experimentGet, experimentResultsGet, tenantSettingsGet, vaultList, vaultReferencesGet, apiKeyList, AuditQueryArgs, auditList, LogsQueryArgs, logsQuery, LogsExportArgs, logsExport, metricsGet, metricsTimeseries, conversationGet, conversationMessages.
- [src/modules/mcp/server.ts](sources/agents/src/modules/mcp/server.ts) — 3273 linhas; exports: inputSchemaArg, McpPlaygroundAttachment, mcpAttachmentToFile, isAudioMime, playgroundTurnOptions, buildMcpServer, handleMcpRequest.
- [src/modules/mcp/tenant-target.ts](sources/agents/src/modules/mcp/tenant-target.ts) — 56 linhas; exports: tenantSelectorField, EffectivePrincipal, resolveEffectivePrincipal.
- [src/modules/mcp/write-agents.ts](sources/agents/src/modules/mcp/write-agents.ts) — 1136 linhas; exports: AgentCreateArgs, agentCreate, AgentUpdateArgs, agentUpdate, agentClone, agentImport, agentDelete, AgentToolsSetArgs, agentToolsSet, ToolWriteArgs, buildToolPatch, toolCreate, toolUpdate, toolDelete, McpConnectionWriteArgs, mcpConnectionCreate, mcpConnectionUpdate, mcpConnectionDelete, mcpConnectionDiscover.
- [src/modules/mcp/write-channels.ts](sources/agents/src/modules/mcp/write-channels.ts) — 519 linhas; exports: DeploymentConnectArgs, deploymentConnect, deploymentRotateToken, deploymentListAccounts, deploymentSetAccounts, instanceDisconnect, instanceListAccounts, instanceSyncInboxes, inboxBind, inboxObserve, inboxUnobserve, inboxRemove, inboxReconnect, inboxReconcile.
- [src/modules/mcp/write-code-tools.ts](sources/agents/src/modules/mcp/write-code-tools.ts) — 253 linhas; exports: CodeToolWriteArgs, buildCodeToolPatch, codeToolCreate, codeToolUpdate, codeToolDelete.
- [src/modules/mcp/write-conversations.ts](sources/agents/src/modules/mcp/write-conversations.ts) — 239 linhas; exports: conversationReply, conversationHandoff, conversationReturn, conversationStatus, conversationReengage.
- [src/modules/mcp/write-documents.ts](sources/agents/src/modules/mcp/write-documents.ts) — 306 linhas; exports: DocumentTemplateWriteArgs, documentTemplateCreate, documentTemplateUpdate, documentTemplateDelete.
- [src/modules/mcp/write-fleet.ts](sources/agents/src/modules/mcp/write-fleet.ts) — 110 linhas; exports: tenantList, tenantGet, tenantCreate.
- [src/modules/mcp/write-knowledge.ts](sources/agents/src/modules/mcp/write-knowledge.ts) — 536 linhas; exports: knowledgeCreate, knowledgeUpdate, knowledgeDelete, knowledgeDocumentCreate, knowledgeDocumentDelete, knowledgeDocumentRetry, knowledgeReindex, knowledgeApprove, knowledgeReject, knowledgeEdit.
- [src/modules/mcp/write-settings.ts](sources/agents/src/modules/mcp/write-settings.ts) — 709 linhas; exports: experimentCreate, experimentUpdate, experimentDelete, businessHoursCreate, businessHoursUpdate, businessHoursDelete, TenantSettingsUpdateArgs, tenantSettingsUpdate, LangfuseConnectArgs, langfuseConnect, apiKeyRevoke.
- [src/modules/mcp/write-webhooks.ts](sources/agents/src/modules/mcp/write-webhooks.ts) — 750 linhas; exports: WebhookCreateArgs, webhookCreate, WebhookUpdateArgs, webhookUpdate, webhookDelete, webhookDeliveryRequeue, webhookTest, AlertChannelCreateArgs, alertChannelCreate, AlertChannelUpdateArgs, alertChannelUpdate, alertChannelDelete, IntegrationCreateArgs, integrationCreate, IntegrationUpdateArgs, integrationUpdate, integrationDelete.
- [src/modules/mcp/write.ts](sources/agents/src/modules/mcp/write.ts) — 1086 linhas; exports: WriteResult, ok, err, WriteDeps, parseMcpId, diffFields, ctxOf, gate, adminGate, readGate, authoringGate, recordMcpAudit, SecretRefResult, resolveSecretRef, SecretValueResult, resolveSecretValue, CredentialCreateArgs, credentialCreate, PromptSetArgs, promptSet, agentList, AgentSettingsGetArgs, agentSettingsGet, AgentSettingsSetArgs, agentSettingsSet, TenantUpdateArgs, tenantUpdate, BrandingSetArgs, brandingSet, BrandingAssetSetArgs, brandingAssetSet.

</details>

## src/modules/mcp-connections

Module: `src/modules/mcp-connections`  
Path: [diretório](sources/agents/src/modules/mcp-connections)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:@langchain/mcp-adapters, package:zod, src/api, src/bootstrap, src/graph/tools, src/lib, src/modules/audit, src/modules/vault  
Dependents: src/api, src/modules/mcp, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [src/modules/mcp-connections/service.ts](sources/agents/src/modules/mcp-connections/service.ts) — 634 linhas; exports: McpConnectionDto, mcpConnectionCreateSchema, McpConnectionCreate, mcpConnectionUpdateSchema, McpConnectionUpdate, listMcpConnections, getMcpConnection, assertMcpConnectionCreatable, assertMcpConnectionNameAvailable, createMcpConnection, assertMcpConnectionUpdatable, updateMcpConnection, deleteMcpConnection, McpReferences, mcpReferences, DiscoveredMcpToolArg, DiscoveredMcpTool, summarizeToolArgs, DiscoveredMcp, discoverMcpTools.

</details>

## src/modules/memory

Module: `src/modules/memory`  
Path: [diretório](sources/agents/src/modules/memory)  
Responsibility: Compactação por atendimento com resumo persistido e proteção contra concorrência.  
Public API: runMemoryCompact; armMemoryCompact; summarizeAttendance  
Internal API: funções auxiliares nos arquivos abaixo; fronteiras reais detalhadas nos registros E  
Dependencies: package:@langchain/core, package:@langchain/langgraph-checkpoint, package:head rebuilt, package:the mirror row is gone, package:tokenx, src/api, src/bootstrap, src/graph, src/lib, src/modules/flowlog, src/modules/scheduler  
Dependents: scripts, src/bootstrap, src/client/pages, src/graph, src/modules/agents, src/modules/chatwoot, src/modules/debounce, tests  
Runtime relevance: Scheduler → modelo de resumo → rewrite protegido; E20  
Confidence: HIGH nos fluxos citados; não em todo símbolo  
Files: 6

<details><summary>Arquivos e exports</summary>

- [src/modules/memory/compact.ts](sources/agents/src/modules/memory/compact.ts) — 932 linhas; exports: CompactionReason, ArmCompactionParams, armCompaction, CompactPayload, CompactionDeps, runCompaction, announceDeadCompaction, registerMemoryHandlers.
- [src/modules/memory/cut.ts](sources/agents/src/modules/memory/cut.ts) — 166 linhas; exports: AttendanceCut, selectClosedPrefix, MEMORY_HEAD_MAX_ATTENDANCES, SummaryRow, renderMemoryHead, renderEmptyMemoryHead.
- [src/modules/memory/reset.ts](sources/agents/src/modules/memory/reset.ts) — 64 linhas; exports: MemoryRowStore, ClearContactMemoryParams, clearContactMemory.
- [src/modules/memory/settings.ts](sources/agents/src/modules/memory/settings.ts) — 92 linhas; exports: MemoryConfig, readMemoryConfig.
- [src/modules/memory/summarize.ts](sources/agents/src/modules/memory/summarize.ts) — 289 linhas; exports: ATTENDANCE_SUMMARY_MAX, TRANSCRIPT_TAG, AttendanceSummaryResult, renderTranscript, summarizeAttendance.
- [src/modules/memory/worker.ts](sources/agents/src/modules/memory/worker.ts) — 179 linhas; exports: defaultBatchSize, CompactionTickDeps, runCompactionTick, StartOptions, startCompactionWorker, stopCompactionWorker.

</details>

## src/modules/models

Module: `src/modules/models`  
Path: [diretório](sources/agents/src/modules/models)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: src/api, src/graph, src/lib, src/modules/vault  
Dependents: src/api, src/modules/tts, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 2

<details><summary>Arquivos e exports</summary>

- [src/modules/models/provider-listing.ts](sources/agents/src/modules/models/provider-listing.ts) — 35 linhas; exports: readProviderJson.
- [src/modules/models/service.ts](sources/agents/src/modules/models/service.ts) — 418 linhas; exports: ModelCapability, ProviderModel, KeyResolver, listProviderModels.

</details>

## src/modules/n8n-export

Module: `src/modules/n8n-export`  
Path: [diretório](sources/agents/src/modules/n8n-export)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: src/api, src/lib  
Dependents: src/api, src/modules/agents, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 2

<details><summary>Arquivos e exports</summary>

- [src/modules/n8n-export/n8n.ts](sources/agents/src/modules/n8n-export/n8n.ts) — 197 linhas; exports: SecretLeakError, assertNoSecretsInCode, assertNoSecrets, N8nNode, N8nWorkflow, ToolWorkflowInput, buildToolWorkflow, CREDENTIALS_NOTE.
- [src/modules/n8n-export/service.ts](sources/agents/src/modules/n8n-export/service.ts) — 46 linhas; exports: ToolWorkflowExport, exportToolWorkflow, exportToolWorkflowForTenant.

</details>

## src/modules/observe

Module: `src/modules/observe`  
Path: [diretório](sources/agents/src/modules/observe)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:@langchain/core, package:the agent was detached, src/api, src/graph, src/lib, src/modules/agents, src/modules/chatwoot, src/modules/flowlog, src/modules/scheduler, src/modules/spend-ceiling  
Dependents: src/bootstrap, src/client/pages, src/modules/agents, src/modules/chatwoot, src/modules/debounce, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 3

<details><summary>Arquivos e exports</summary>

- [src/modules/observe/apply.ts](sources/agents/src/modules/observe/apply.ts) — 76 linhas; exports: VerdictChange, RefusedValue, AppliedVerdict, applyVerdict.
- [src/modules/observe/job.ts](sources/agents/src/modules/observe/job.ts) — 1610 linhas; exports: ObserveReason, OBSERVE_TIMEOUT_MS, OBSERVE_CEILING_WINDOW_MS, OBSERVE_NOTE_REASON_MAX, observeDedupeKey, observeKeyPrefix, ArmObserveParams, armObserve, ObservePayload, parseObservePayload, ObserveDeps, verdictSchemaFor, buildObserveTask, TranscriptLine, transcriptFromRows, renderTranscript, observeNoteText, runObserve, observeHandler, registerObserveHandler.
- [src/modules/observe/settings.ts](sources/agents/src/modules/observe/settings.ts) — 263 linhas; exports: MonitoringAnalysis, LabelGroup, MonitoringConfig, MONITORING_DEFAULTS, WINDOW_MESSAGES_MIN, WINDOW_MESSAGES_MAX, OBSERVE_WINDOW_MIN_SECONDS, OBSERVE_WINDOW_MAX_SECONDS, LABEL_GROUPS_MAX, LABEL_VALUES_MAX, LABEL_GROUP_NAME_MAX, LABEL_VALUE_MAX, RESERVED_GROUP_NAMES, readLabelGroups, LabelGroupConflict, firstLabelGroupConflict, readMonitoringConfig, observationEnabled, labelValuesOf.

</details>

## src/modules/playground

Module: `src/modules/playground`  
Path: [diretório](sources/agents/src/modules/playground)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:@langchain/core, package:@langchain/langgraph-checkpoint, package:node:crypto, src/api, src/graph, src/graph/tools, src/lib, src/modules/chatwoot, src/modules/documents, src/modules/flowlog, src/modules/followups, src/modules/guardrails, src/modules/spend-ceiling, src/modules/stt, src/modules/tts, src/modules/vision  
Dependents: src/api, src/modules/mcp, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 5

<details><summary>Arquivos e exports</summary>

- [src/modules/playground/media.ts](sources/agents/src/modules/playground/media.ts) — 144 linhas; exports: PlaygroundMediaKind, SaveMediaParams, savePlaygroundMedia, MediaMeta, listThreadMedia, MediaBlob, getPlaygroundMedia.
- [src/modules/playground/service.ts](sources/agents/src/modules/playground/service.ts) — 1599 linhas; exports: PlaygroundDeps, PlaygroundTurnParams, PlaygroundTurnResult, toPlaygroundInvokeError, applyToolMocks, PlaygroundToolCategory, PlaygroundToolInfo, listPlaygroundTools, runPlaygroundTurn, PlaygroundFollowupParams, PlaygroundFollowupResult, runPlaygroundFollowup, PlaygroundTranscribeOnlyParams, runPlaygroundTranscribe, PlaygroundAudioParams, PlaygroundAudioResult, runPlaygroundAudioTurn, PlaygroundExtractKind, PlaygroundExtractOnlyParams, runPlaygroundExtract, PlaygroundFileParams, PlaygroundFileResult, runPlaygroundFileTurn.
- [src/modules/playground/sessions.ts](sources/agents/src/modules/playground/sessions.ts) — 579 linhas; exports: RebuiltMedia, RebuiltTurn, rebuildPlaygroundTurns, applyTurnNotes, upsertPlaygroundSession, PlaygroundSessionMeta, listPlaygroundSessions, getPlaygroundSessionTurns, deletePlaygroundSession.
- [src/modules/playground/thread.ts](sources/agents/src/modules/playground/thread.ts) — 30 linhas; exports: newPlaygroundThreadId, isValidPlaygroundThread.
- [src/modules/playground/turn-notes.ts](sources/agents/src/modules/playground/turn-notes.ts) — 111 linhas; exports: PlaygroundTurnNote, savePlaygroundTurnNote, LoadedTurnNote, listThreadTurnNotes.

</details>

## src/modules/rag

Module: `src/modules/rag`  
Path: [diretório](sources/agents/src/modules/rag)  
Responsibility: Embedding, busca vetorial e propostas de conhecimento.  
Public API: searchKnowledge; createSuggestion  
Internal API: funções auxiliares nos arquivos abaixo; fronteiras reais detalhadas nos registros E  
Dependencies: package:@langchain/openai, package:@langchain/textsplitters, package:mammoth, package:unpdf, src/api, src/api/features/realtime, src/lib, src/modules/audit, src/modules/flowlog, src/modules/scheduler, src/modules/tenant-settings, src/modules/vault  
Dependents: src/api, src/bootstrap, src/graph/tools, src/modules/agents, src/modules/mcp, tests  
Runtime relevance: Tool → embedding fora da transação → SQL scoped; E22  
Confidence: HIGH nos fluxos citados; não em todo símbolo  
Files: 6

<details><summary>Arquivos e exports</summary>

- [src/modules/rag/chunk.ts](sources/agents/src/modules/rag/chunk.ts) — 25 linhas; exports: ChunkOptions, chunkText.
- [src/modules/rag/documents.ts](sources/agents/src/modules/rag/documents.ts) — 978 linhas; exports: EmbeddingStatus, resolveEmbeddingStatus, resolveEmbeddingConfig, assertChunkingUpdatable, validateChunkParams, refuseUnstorable, CreateDocumentParams, createDocument, listDocuments, getDocument, deleteDocument, UpdateDocumentParams, updateDocument, assertDocumentRetryable, retryDocument, EmbeddingBlock, ReindexResult, readEmbeddingBlock, reindexKnowledgeBase, registerRagIngestHandler.
- [src/modules/rag/embeddings.ts](sources/agents/src/modules/rag/embeddings.ts) — 400 linhas; exports: EMBEDDING_DIM, EmbeddingConfig, EmbeddingDeps, embedTexts, embedQuery.
- [src/modules/rag/loaders.ts](sources/agents/src/modules/rag/loaders.ts) — 105 linhas; exports: SUPPORTED_EXTENSIONS, SUPPORTED_MIME_TYPES, FileInput, extractText.
- [src/modules/rag/service.ts](sources/agents/src/modules/rag/service.ts) — 839 linhas; exports: SearchParams, searchKnowledge, listKnowledgeBases, KB_NAME_MAX, knowledgeBaseNameUsable, assertKnowledgeBaseNameUsable, createKnowledgeBase, SuggestParams, createSuggestion, ApprovalSource, parseThreadOrigin, listPendingApprovals, EditApprovalParams, editApprovalItem, ApproveResult, ClaimedApproval, claimApprovalForStorage, approveApprovalItem, rejectApprovalItem, getKnowledgeBase, updateKnowledgeBase, deleteKnowledgeBase, listChunks.
- [src/modules/rag/sql.ts](sources/agents/src/modules/rag/sql.ts) — 100 linhas; exports: toVectorLiteral, InsertChunkInput, insertChunks, SearchChunksParams, ChunkHit, searchChunks.

</details>

## src/modules/scheduler

Module: `src/modules/scheduler`  
Path: [diretório](sources/agents/src/modules/scheduler)  
Responsibility: Fila durável de jobs e despacho de handlers.  
Public API: claimDue; runSchedulerTick; registerJobHandler  
Internal API: funções auxiliares nos arquivos abaixo; fronteiras reais detalhadas nos registros E  
Dependencies: src/api, src/bootstrap, src/lib, src/modules/flowlog  
Dependents: src/bootstrap, src/graph, src/modules/appointments, src/modules/channel-redirect, src/modules/chatwoot, src/modules/debounce, src/modules/flowlog, src/modules/followups, src/modules/memory, src/modules/observe, src/modules/rag, src/modules/spend-ceiling, src/modules/webhooks, tests  
Runtime relevance: SKIP LOCKED → token de claim → handler; E21  
Confidence: HIGH nos fluxos citados; não em todo símbolo  
Files: 3

<details><summary>Arquivos e exports</summary>

- [src/modules/scheduler/lanes.ts](sources/agents/src/modules/scheduler/lanes.ts) — 341 linhas; exports: SchedulerLane, JOB_LANE, JOB_SPENDS_PROVIDER, sharedProviderConcurrency, JOB_DELETE_ON_DONE, JOB_TRAFFIC_PROPORTIONAL, JOB_DEATH_LEVEL, kindsInLane.
- [src/modules/scheduler/service.ts](sources/agents/src/modules/scheduler/service.ts) — 1055 linhas; exports: SchedulerJobKind, ClaimedJob, Rearm, JobRowParams, EnqueueParams, upsertJobRow, upsertJobRows, enqueueJob, cancelPendingJob, cancelPendingJobsByPrefix, cancelPendingJobsByPrefixUpToMessage, retireJobsByDedupeKey, retireJobsByDedupeKeyOn, jobRetired, jobRetiredStrict, jobNotRetiredSql, revokeJobsByKeyPrefixOn, claimDueJobs, claimDueTrafficJobs, claimPendingByKeyPrefix, countOwedByKeyPrefix, claimDueDebounceJobs, claimDueCompactionJobs, completeJob, rescheduleJob, failJob, ReapedJob, reapStaleJobs.
- [src/modules/scheduler/worker.ts](sources/agents/src/modules/scheduler/worker.ts) — 436 linhas; exports: JobResult, JobHandler, registerJobHandler, getJobHandler, unregisterJobHandler, DeadLetterHandler, registerDeadLetterHandler, getDeadLetterHandler, announceReaped, runClaimed, TickOptions, runSchedulerTick, StartOptions, startScheduler, stopScheduler.

</details>

## src/modules/service-window

Module: `src/modules/service-window`  
Path: [diretório](sources/agents/src/modules/service-window)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: src/graph  
Dependents: src/graph, src/modules/agents, src/modules/channel-redirect, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [src/modules/service-window/service.ts](sources/agents/src/modules/service-window/service.ts) — 159 linhas; exports: ServiceWindowConfig, SERVICE_WINDOW_DEFAULTS, readServiceWindowConfig, isWithinServiceWindow, InboxChannel, channelHasServiceWindow, ProactiveSendMode, proactiveSendMode, TemplatePayload, buildTemplatePayload.

</details>

## src/modules/spend-ceiling

Module: `src/modules/spend-ceiling`  
Path: [diretório](sources/agents/src/modules/spend-ceiling)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:node:crypto, package:the agent broke, package:zod, src/api, src/bootstrap, src/graph, src/lib, src/modules/agents, src/modules/contact-auth, src/modules/flowlog, src/modules/scheduler  
Dependents: src/api, src/bootstrap, src/graph, src/modules/chatwoot, src/modules/conversations, src/modules/debounce, src/modules/observe, src/modules/playground, src/modules/tenant-settings, src/modules/vision, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 7

<details><summary>Arquivos e exports</summary>

- [src/modules/spend-ceiling/arm.ts](sources/agents/src/modules/spend-ceiling/arm.ts) — 105 linhas; exports: SPEND_POLL_DEDUPE_KEY, syncTenantSpendPoll, ensureAllSpendPolls.
- [src/modules/spend-ceiling/coverage.ts](sources/agents/src/modules/spend-ceiling/coverage.ts) — 62 linhas; exports: SpendGateSite, SPEND_GATE_FOR_NODE.
- [src/modules/spend-ceiling/decide.ts](sources/agents/src/modules/spend-ceiling/decide.ts) — 77 linhas; exports: SpendVerdict, SpendDecisionInput, ceilingFor, decideSpend, monthStart, monthEnd.
- [src/modules/spend-ceiling/notice.ts](sources/agents/src/modules/spend-ceiling/notice.ts) — 140 linhas; exports: spendCeilingNoteText, SpendCeilingAnnounceParams, announceSpendCeilingOnConversation, clearSpendCeilingFlights.
- [src/modules/spend-ceiling/poll.ts](sources/agents/src/modules/spend-ceiling/poll.ts) — 707 linhas; exports: PollDeps, PollOutcome, projectKeyOf, pollTenantSpend, spendPollHandler, registerSpendPollHandler.
- [src/modules/spend-ceiling/service.ts](sources/agents/src/modules/spend-ceiling/service.ts) — 615 linhas; exports: SpendSnapshot, readSpendSnapshot, spendUsedInMonth, SPEND_SNAPSHOT_STALE_AFTER_MS, LANGFUSE_NOT_CONFIGURED, snapshotUnenforceable, SpendSnapshotHealth, snapshotHealth, SpendCeilingParams, SpendCeilingResult, spendCeilingVerdict, readTenantSpendCeiling, SPEND_CEILING_WARN_COOLDOWN_MS, spendCeilingWarnKey, SpendCeilingOccasion, SPEND_CEILING_MESSAGE_WINDOW_MS, SPEND_CEILING_BURST_WINDOW_MS, spendCeilingOverKey, spendCeilingAnnouncement, announceSpendCeiling, announceSpendCeilingWarning, spendCeilingFlowEvent, assertPlaygroundSpendCeiling, SpendCeilingUsageEntry, SpendCeilingUsageDto, spendCeilingUsage.
- [src/modules/spend-ceiling/settings.ts](sources/agents/src/modules/spend-ceiling/settings.ts) — 262 linhas; exports: SpendCeilingConfig, SPEND_CEILING_DEFAULTS, SPEND_CEILING_USD_MAX, SPEND_CEILING_NOTICE_COOLDOWN_MAX_SECONDS, centsOf, readSpendCeilingConfig, spendCeilingSettingsSchema, SpendCeilingStored, SpendCeilingLegacyStored.

</details>

## src/modules/split

Module: `src/modules/split`  
Path: [diretório](sources/agents/src/modules/split)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: src/api, src/modules/chatwoot, src/modules/flowlog  
Dependents: src/graph, src/modules/agents, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [src/modules/split/service.ts](sources/agents/src/modules/split/service.ts) — 657 linhas; exports: SplitConfig, SPLIT_DEFAULTS, readSplitConfig, ReplyParts, splitReplyParts, splitReply, typingDelayMs, ReplyDelivery, deliverReply.

</details>

## src/modules/stt

Module: `src/modules/stt`  
Path: [diretório](sources/agents/src/modules/stt)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: src/api, src/lib, src/modules/chatwoot, src/modules/flowlog, src/modules/vault  
Dependents: src/modules/agents, src/modules/chatwoot, src/modules/playground, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 3

<details><summary>Arquivos e exports</summary>

- [src/modules/stt/providers.ts](sources/agents/src/modules/stt/providers.ts) — 211 linhas; exports: SttRequest, SttProvider, SttError, STT_PROVIDER_NAMES, getSttProvider.
- [src/modules/stt/service.ts](sources/agents/src/modules/stt/service.ts) — 337 linhas; exports: MakeClient, resolveSttConfig, TranscribeInboundParams, transcribeInboundAudio, PlaygroundTranscribeParams, transcribePlaygroundAudio.
- [src/modules/stt/settings.ts](sources/agents/src/modules/stt/settings.ts) — 62 linhas; exports: SttConfig, STT_DEFAULTS, LANG_RE, readSttConfig.

</details>

## src/modules/tenant-settings

Module: `src/modules/tenant-settings`  
Path: [diretório](sources/agents/src/modules/tenant-settings)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:node:crypto, package:zod, src/api, src/lib, src/modules/audit, src/modules/documents, src/modules/spend-ceiling, src/modules/vault  
Dependents: src/api, src/graph, src/modules/agents, src/modules/documents, src/modules/mcp, src/modules/rag, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [src/modules/tenant-settings/service.ts](sources/agents/src/modules/tenant-settings/service.ts) — 664 linhas; exports: embeddingSettingsSchema, EmbeddingSettings, EMBEDDING_DEFAULTS, langfuseSettingsSchema, LangfuseSettings, LANGFUSE_DEFAULTS, companySettingsSchema, CompanySettings, COMPANY_DEFAULTS, parseCompanySettings, parseEmbeddingSettings, parseLangfuseSettings, readEmbeddingSettings, readLangfuseSettings, readCompanySettings, TenantSettingsDto, getTenantSettings, assertEmbeddingCredentialUsable, updateEmbeddingSettings, LangfuseUpdateInput, assertLangfuseCredentialUsable, updateLangfuse, CompanyUpdateInput, updateCompanySettings, withCompanyLock, setCompanyLogoKey, SpendCeilingUpdateInput, updateSpendCeiling.

</details>

## src/modules/tool-definitions

Module: `src/modules/tool-definitions`  
Path: [diretório](sources/agents/src/modules/tool-definitions)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:@langchain/core, package:node:net, package:the API did not answer, package:zod, src/api, src/bootstrap, src/graph/tools, src/lib, src/modules/appointments, src/modules/audit, src/modules/documents, src/modules/vault  
Dependents: src/api, src/client/lib, src/client/pages, src/graph/tools, src/lib, src/modules/agents, src/modules/code-tools, src/modules/documents, src/modules/mcp, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 9

<details><summary>Arquivos e exports</summary>

- [src/modules/tool-definitions/appointment.ts](sources/agents/src/modules/tool-definitions/appointment.ts) — 265 linhas; exports: AppointmentDeclaration, readAppointmentDeclaration, readPath, sampleLeaves, ExtractedAppointment, WallClockResolver, ExtractResult, extractAppointment.
- [src/modules/tool-definitions/body-shape.ts](sources/agents/src/modules/tool-definitions/body-shape.ts) — 155 linhas; exports: unsupportedBodyShape, canonicalBodyShape.
- [src/modules/tool-definitions/credential-wiring.ts](sources/agents/src/modules/tool-definitions/credential-wiring.ts) — 814 linhas; exports: isRelativeTemplate, effectiveUrlTemplate, reachableTemplates, credentialReachesRequest, unusedCredentialWarning.
- [src/modules/tool-definitions/json-path.ts](sources/agents/src/modules/tool-definitions/json-path.ts) — 164 linhas; exports: isUsablePath, ScalarReader, walkPath, SampleLeaf, SampleList, collectLists, collectLeaves.
- [src/modules/tool-definitions/namespace.ts](sources/agents/src/modules/tool-definitions/namespace.ts) — 140 linhas; exports: lockToolNames, isRagToolName, documentHoldingToolName, toolHoldingName, NameMatch, resolveByModelName, toolUnderModelName, toolsUnderModelName.
- [src/modules/tool-definitions/normalize.ts](sources/agents/src/modules/tool-definitions/normalize.ts) — 370 linhas; exports: ToolShapePatch, NormalizedToolShapes, CONTEXT_VAR_NAMES, isJsonSchemaShape, compactFromJsonSchema, hasReservedFieldName, normalizeToolShapes, normalizeInputSchemaShape.
- [src/modules/tool-definitions/response-template.ts](sources/agents/src/modules/tool-definitions/response-template.ts) — 873 linhas; exports: MODEL_RESPONSE_CHAR_LIMIT, MAX_TEMPLATE_CHARS, ABSENT_MARKER, ITEM_SELF, MAX_EACH_ITEMS, EMPTY_LIST_MARKER, moreItemsMarker, ResponseTemplate, isTemplatePath, TemplateSegment, ParsedTemplate, parseTemplate, templateTokens, unusableTemplateTokens, TemplateSpanKind, TemplateSpan, scanTemplate, templateNeedsBody, enclosingBlock, unmatchedTemplateDelimiter, templateLeaves, templateLists, templateItemLeaves, templateListAt, TemplateOffer, TemplateSampleOffer, templateOfferAt, TemplateWrite, templateWriteAt, ResponseTemplateRead, readResponseTemplateResult, readResponseTemplate, ProjectedResponse, readsBodyVerbatim, projectToolResponse, clipToModelLimit, storableResponseTemplate, RenderedResponse, RenderOptions, renderResponseTemplate.
- [src/modules/tool-definitions/service.ts](sources/agents/src/modules/tool-definitions/service.ts) — 869 linhas; exports: HTTP_METHODS, HttpToolMethod, DEFAULT_HTTP_METHOD, TOOL_LABEL_MAX, readHttpMethod, ToolDefinitionDto, toolDefinitionCreateSchema, ToolDefinitionCreate, toolDefinitionUpdateSchema, ToolDefinitionUpdate, listToolDefinitions, getToolDefinition, urlTemplateProblem, relativeTemplateHasBase, assertRelativeTemplateHasBase, assertToolRelativeTemplateResolvable, assertToolDefinitionCreatable, assertToolNameAvailable, assertToolDefinitionPatchValid, createToolDefinition, updateToolDefinition, deleteToolDefinition, ResourceReferences, toolReferences.
- [src/modules/tool-definitions/test-run.ts](sources/agents/src/modules/tool-definitions/test-run.ts) — 377 linhas; exports: ToolTestInput, ToolTestNote, ToolTestResult, ToolTestDeps, runToolTest.

</details>

## src/modules/tts

Module: `src/modules/tts`  
Path: [diretório](sources/agents/src/modules/tts)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:@langchain/core, src/api, src/graph, src/lib, src/modules/flowlog, src/modules/models, src/modules/vault  
Dependents: src/api, src/client/pages, src/graph, src/modules/agents, src/modules/playground, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 8

<details><summary>Arquivos e exports</summary>

- [src/modules/tts/listing.ts](sources/agents/src/modules/tts/listing.ts) — 227 linhas; exports: TtsListItem, TtsListKind, KeyResolver, listTtsOptions.
- [src/modules/tts/normalize-model.ts](sources/agents/src/modules/tts/normalize-model.ts) — 50 linhas; exports: NormalizeModelSource, NormalizeCredentialSource, NormalizeNotRunnableReason, NormalizeModelResolution, ResolveNormalizeOptions, NormalizeOverrides, resolveNormalizeModel.
- [src/modules/tts/normalize.ts](sources/agents/src/modules/tts/normalize.ts) — 92 linhas; exports: llmNormalizeForSpeech.
- [src/modules/tts/providers.ts](sources/agents/src/modules/tts/providers.ts) — 356 linhas; exports: TtsOutputFormat, TtsRequest, TtsResult, TtsProvider, TtsError, readProviderErrorCode, pickTtsFormat, TTS_PROVIDER_NAMES, getTtsProvider.
- [src/modules/tts/service.ts](sources/agents/src/modules/tts/service.ts) — 199 linhas; exports: prepareSpeechText, SynthesizeReplyParams, synthesizeReply.
- [src/modules/tts/settings-shared.ts](sources/agents/src/modules/tts/settings-shared.ts) — 126 linhas; exports: TtsMode, TTS_MODES, TtsVoiceSettings, VOICE_SETTINGS_DEFAULTS, TtsConfig, TTS_DEFAULTS, clampVoiceSetting, readVoiceSettings.
- [src/modules/tts/settings.ts](sources/agents/src/modules/tts/settings.ts) — 98 linhas; exports: readTtsConfig, voiceSettingsOf, shouldReplyWithAudio.
- [src/modules/tts/wav.ts](sources/agents/src/modules/tts/wav.ts) — 32 linhas; exports: pcmToWav.

</details>

## src/modules/updates

Module: `src/modules/updates`  
Path: [diretório](sources/agents/src/modules/updates)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: src/api, src/bootstrap  
Dependents: src/api/features/updates, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 4

<details><summary>Arquivos e exports</summary>

- [src/modules/updates/hubClient.ts](sources/agents/src/modules/updates/hubClient.ts) — 136 linhas; exports: Edition, fetchAnnouncements, fetchLatestVersion.
- [src/modules/updates/semver.ts](sources/agents/src/modules/updates/semver.ts) — 40 linhas; exports: compareSemver, isUpdateAvailable.
- [src/modules/updates/service.ts](sources/agents/src/modules/updates/service.ts) — 121 linhas; exports: getUpdates, resetUpdatesCache.
- [src/modules/updates/types.ts](sources/agents/src/modules/updates/types.ts) — 30 linhas; exports: AnnouncementLevel, AnnouncementText, AnnouncementDTO, UpdateInfo, UpdatesPayload.

</details>

## src/modules/vault

Module: `src/modules/vault`  
Path: [diretório](sources/agents/src/modules/vault)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:node:crypto, src/api, src/bootstrap, src/lib, src/modules/agents, src/modules/audit, src/modules/chatwoot  
Dependents: src/api, src/graph, src/graph/tools, src/modules/agents, src/modules/appointments, src/modules/audit, src/modules/contact-auth, src/modules/flowlog, src/modules/integrations, src/modules/mcp-connections, src/modules/mcp, src/modules/models, src/modules/rag, src/modules/stt, src/modules/tenant-settings, src/modules/tool-definitions, src/modules/tts, src/modules/vision, src/modules/webhooks, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 7

<details><summary>Arquivos e exports</summary>

- [src/modules/vault/google-oauth.ts](sources/agents/src/modules/vault/google-oauth.ts) — 429 linhas; exports: GOOGLE_OAUTH_CALLBACK_SCRIPT, STATE_TTL_MS, GoogleOAuthCredential, GoogleOAuthState, validateScopes, decryptOAuthState, buildState, buildAuthorizeUrl, ExchangedTokens, exchangeCodeForTokens, revokeGoogleToken, ensureFreshGoogleAccessToken, buildCallbackHtml, GoogleOAuthStatus, projectStatus.
- [src/modules/vault/injectable.ts](sources/agents/src/modules/vault/injectable.ts) — 62 linhas; exports: InjectableCredential, resolveInjectableCredentialEntry, resolveInjectableCredential.
- [src/modules/vault/mcp-oauth.ts](sources/agents/src/modules/vault/mcp-oauth.ts) — 601 linhas; exports: STATE_TTL_MS, McpOAuthCredential, McpOAuthState, OAuthNetOpts, defaultNetOpts, DiscoveredOAuthServer, discoverOAuthServer, RegisteredClient, registerClient, buildMcpAuthorizeUrl, buildMcpState, decryptMcpState, ExchangedMcpTokens, exchangeMcpCode, ensureFreshMcpAccessToken, McpOAuthStatus, projectMcpStatus.
- [src/modules/vault/oauth-core.ts](sources/agents/src/modules/vault/oauth-core.ts) — 154 linhas; exports: base64url, generateCodeVerifier, computeCodeChallenge, newNonce, encryptOAuthState, decryptOAuthStateRaw, OAUTH_CALLBACK_SCRIPT, escapeHtml, OAuthCallbackHtmlParams, buildOAuthCallbackHtml.
- [src/modules/vault/secret-test.ts](sources/agents/src/modules/vault/secret-test.ts) — 171 linhas; exports: SecretTestFailCode, SecretTestResult, SecretTestInput, SecretTestDeps, runSecretTest.
- [src/modules/vault/secret-types.ts](sources/agents/src/modules/vault/secret-types.ts) — 535 linhas; exports: SecretInjection, SecretTestSpec, SecretType, SECRET_TYPES, SECRET_TYPE_IDS, isSecretTypeId, isTestableSecretType, getSecretType, secretTypeNeedsParamName, PARAM_NAME_KIND_IDS, secretTypeRefusesParamName, secretTypeAutoInjects, INJECTING_MECHANISM_KIND_IDS, secretTypeRequiresBaseUrl, secretTypeSupportsBaseUrl, BASE_URL_KIND_IDS, secretTypeRefusesBaseUrl, secretTypeIsManagedBlob, isManagedOAuthKind, CredentialUse, secretTypeFits, readsPlainKey, valueRuleApplies, credentialServes, secretValueFitsKind, getSecretTypeFields, ResolvedInjection, isNonInjectableSecret, resolveSecretInjection.
- [src/modules/vault/service.ts](sources/agents/src/modules/vault/service.ts) — 1798 linhas; exports: VAULT_REF_PREFIX, formatVaultRef, isVaultIdRef, readVaultRefId, readableVaultRef, vaultRefWhere, resolveVaultSecret, tryResolveVaultSecret, VaultRefResolution, resolveVaultRefState, ResolvedVaultEntry, VaultEntryResolution, dialableBaseUrl, resolveVaultEntryState, resolveVaultEntry, tryResolveVaultEntry, ApiKeyResolution, tryResolveApiKeyEntry, VaultNameResolution, resolveVaultRefByName, resolveVaultRefByNameOn, requireVaultRef, VaultEntryFacts, readVaultRefFacts, requireVaultRefFor, vaultNameByRef, validateBaseUrl, listVaultNames, VaultEntryInfo, listVaultInfos, storedVaultName, listVaultEntries, listVaultEntryInfos, CreateVaultEntryInput, assertVaultEntryCreatable, createVaultEntry, CreatePendingVaultEntryInput, assertVaultNameAvailable, assertPendingVaultEntryCreatable, createPendingVaultEntry, ensurePendingVaultEntryOn, UpdateVaultEntryPatch, updateVaultEntry, replaceVaultSecret, persistRefreshedOAuthSecret, deleteVaultEntry, testVaultValue, testStoredVaultEntry, VaultReferences, vaultReferences.

</details>

## src/modules/vision

Module: `src/modules/vision`  
Path: [diretório](sources/agents/src/modules/vision)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:carried what was billed, src/api, src/graph, src/lib, src/modules/agents, src/modules/chatwoot, src/modules/flowlog, src/modules/spend-ceiling, src/modules/vault  
Dependents: src/client/pages, src/modules/agents, src/modules/chatwoot, src/modules/playground, tests  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 6

<details><summary>Arquivos e exports</summary>

- [src/modules/vision/document-support.ts](sources/agents/src/modules/vision/document-support.ts) — 56 linhas; exports: visionAcceptsDocuments.
- [src/modules/vision/prompt-default.ts](sources/agents/src/modules/vision/prompt-default.ts) — 6 linhas; exports: DEFAULT_EXTRACTION_PROMPT.
- [src/modules/vision/providers.ts](sources/agents/src/modules/vision/providers.ts) — 374 linhas; exports: VisionKind, VisionRequest, VisionUsage, VisionResult, VisionProvider, VisionError, VISION_PROVIDER_NAMES, getVisionProvider, visionKindForMime.
- [src/modules/vision/retry.ts](sources/agents/src/modules/vision/retry.ts) — 126 linhas; exports: isTransientVisionFailure, VISION_TOTAL_BUDGET_MS, VISION_RETRY_DELAYS_MS, VISION_MAX_ATTEMPTS, VISION_IMAGE_CEILING_MS, attemptCeilingMs, retryDelayMs, attemptBudgetMs.
- [src/modules/vision/service.ts](sources/agents/src/modules/vision/service.ts) — 590 linhas; exports: MakeClient, resolveVisionConfig, extractWithRetry, ExtractInboundParams, ExtractResult, extractInboundFile, PlaygroundExtractParams, PlaygroundExtractResult, extractPlaygroundFile.
- [src/modules/vision/settings.ts](sources/agents/src/modules/vision/settings.ts) — 62 linhas; exports: VisionConfig, VISION_DEFAULTS, readVisionConfig.

</details>

## src/modules/webhooks

Module: `src/modules/webhooks`  
Path: [diretório](sources/agents/src/modules/webhooks)  
Responsibility: Assinaturas e entregas de eventos outbound.  
Public API: emitOutbound  
Internal API: funções auxiliares nos arquivos abaixo; fronteiras reais detalhadas nos registros E  
Dependencies: package:node:crypto, package:zod, src/api, src/bootstrap, src/graph, src/lib, src/modules/audit, src/modules/flowlog, src/modules/integrations, src/modules/scheduler, src/modules/vault  
Dependents: src/api, src/bootstrap, src/graph, src/graph/tools, src/modules/agents, src/modules/chatwoot, src/modules/flowlog, src/modules/integrations, src/modules/mcp, tests  
Runtime relevance: Evento → delivery PENDING por assinatura → worker; E24  
Confidence: HIGH nos fluxos citados; não em todo símbolo  
Files: 11

<details><summary>Arquivos e exports</summary>

- [src/modules/webhooks/inbound/auth.ts](sources/agents/src/modules/webhooks/inbound/auth.ts) — 172 linhas; exports: DEFAULT_STATIC_HEADER, DEFAULT_SIGNATURE_HEADER, InboundAuthConfig, resolveInboundAuthConfig, isUsableHeaderName, InboundSecretResolution, InboundAuthFailure, InboundAuthOutcome, verifyInboundAuth.
- [src/modules/webhooks/inbound/route-token.ts](sources/agents/src/modules/webhooks/inbound/route-token.ts) — 22 linhas; exports: GeneratedRouteToken, generateRouteToken, hashRouteToken.
- [src/modules/webhooks/inbound/service.ts](sources/agents/src/modules/webhooks/inbound/service.ts) — 709 linhas; exports: ReceiveResult, ReceiveParams, receiveInbound, ProcessDeps, ProcessParams, processInboundDelivery.
- [src/modules/webhooks/outbound/deliveries.ts](sources/agents/src/modules/webhooks/outbound/deliveries.ts) — 305 linhas; exports: WebhookDeliveryDto, ListDeliveriesOpts, ListDeliveriesResult, OUTBOUND_DELIVERY_STATUSES, OutboundDeliveryStatus, isOutboundDeliveryStatus, listWebhookDeliveries, getWebhookDelivery, requeueWebhookDelivery.
- [src/modules/webhooks/outbound/events.ts](sources/agents/src/modules/webhooks/outbound/events.ts) — 63 linhas; exports: OUTBOUND_EVENTS, OutboundEvent, isOutboundEvent, OUTBOUND_ENVELOPE_VERSION, OutboundEnvelope, buildOutboundEnvelope.
- [src/modules/webhooks/outbound/heartbeat.ts](sources/agents/src/modules/webhooks/outbound/heartbeat.ts) — 101 linhas; exports: syncTenantHeartbeat, heartbeatHandler, registerHeartbeatHandler.
- [src/modules/webhooks/outbound/service.ts](sources/agents/src/modules/webhooks/outbound/service.ts) — 52 linhas; exports: emitOutbound, nextBackoffMs.
- [src/modules/webhooks/outbound/signing.ts](sources/agents/src/modules/webhooks/outbound/signing.ts) — 78 linhas; exports: SIGNATURE_HEADER, TIMESTAMP_HEADER, DELIVERY_HEADER, LEGACY_SIGNATURE_HEADER, LEGACY_TIMESTAMP_HEADER, LEGACY_DELIVERY_HEADER, signOutbound, OutboundHeaderParams, outboundHeaders, verifyOutboundSignature.
- [src/modules/webhooks/outbound/subscriptions.ts](sources/agents/src/modules/webhooks/outbound/subscriptions.ts) — 356 linhas; exports: WebhookSubscriptionDto, assertUrlSafe, listWebhookSubscriptions, webhookSubscriptionCreateSchema, WebhookSubscriptionCreate, assertWebhookSubscriptionCreatable, createWebhookSubscription, webhookSubscriptionUpdateSchema, WebhookSubscriptionUpdate, assertWebhookSubscriptionUpdatable, updateWebhookSubscription, deleteWebhookSubscription.
- [src/modules/webhooks/outbound/test.ts](sources/agents/src/modules/webhooks/outbound/test.ts) — 143 linhas; exports: WebhookTestResult, sendWebhookTest.
- [src/modules/webhooks/outbound/worker.ts](sources/agents/src/modules/webhooks/outbound/worker.ts) — 400 linhas; exports: OutboundWorkerOptions, OutboundBatchSummary, processOutboundBatch, startOutboundWorker, stopOutboundWorker.

</details>

## tests

Module: `tests`  
Path: [diretório](sources/agents/tests)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:)).toBe(, package:), params.get(, package:@\/tests\, package:@codemirror/autocomplete, package:@codemirror/commands, package:@codemirror/lang-javascript, package:@codemirror/lang-json, package:@codemirror/state, package:@codemirror/view, package:@elysiajs/eden, package:@elysiajs/static, package:@happy-dom/global-registrator, package:@langchain/anthropic, package:@langchain/core, package:@langchain/google-genai, package:@langchain/langgraph, package:@langchain/langgraph-checkpoint, package:@langchain/openai, package:@modelcontextprotocol/sdk, package:@prisma/adapter-pg, package:@radix-ui/react-tooltip, package:@sinclair/typebox, package:@testing-library/dom, package:@testing-library/jest-dom, package:@testing-library/react, package:a call is still in flight, package:absent, package:an unobserve ran, package:another process, package:bun, package:bun:test, package:elysia, package:fired, package:i18next, package:jose, package:no toast at all, package:node:async_hooks, package:node:crypto, package:node:fs, package:node:http, package:node:net, package:node:os, package:node:path, package:node:url, package:node:zlib, package:not checked, package:nothing to report, package:one exists, package:pg, package:ran and returned something that reads like a refusal, package:react, package:react-i18next, package:react-router, package:simplifying, package:stale, package:switches a view, package:the WASM heap ran out eventually, package:the command landed, package:the guardrail removed it, package:the largest operator-authored prompt this API accepts, package:the name of the first tenant there is, package:the turn cost nothing, package:tokenx, package:we could not find out, package:we did not ask, package:x, package:y, package:zod, scripts, src/api, src/api/features/admin, src/api/features/auth, src/api/features/branding, src/api/features/invitations, src/api/features/realtime, src/bootstrap, src/client/components, src/client/contexts, src/client/hooks, src/client/lib, src/client/locales, src/client/pages, src/graph, src/graph/tools, src/lib, src/modules/agents, src/modules/analytics, src/modules/api-keys, src/modules/appointments, src/modules/audit, src/modules/availability, src/modules/business-hours, src/modules/channel-redirect, src/modules/chatwoot, src/modules/code-tools, src/modules/contact-auth, src/modules/conversations, src/modules/debounce, src/modules/documents, src/modules/experiments, src/modules/flowlog, src/modules/followups, src/modules/guardrails, src/modules/handoff, src/modules/images, src/modules/integrations, src/modules/kanban, src/modules/mcp, src/modules/mcp-connections, src/modules/memory, src/modules/models, src/modules/n8n-export, src/modules/observe, src/modules/playground, src/modules/rag, src/modules/scheduler, src/modules/service-window, src/modules/spend-ceiling, src/modules/split, src/modules/stt, src/modules/tenant-settings, src/modules/tool-definitions, src/modules/tts, src/modules/updates, src/modules/vault, src/modules/vision, src/modules/webhooks  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 691

<details><summary>Arquivos e exports</summary>

- [tests/api/app.test.ts](sources/agents/tests/api/app.test.ts) — 61 linhas; exports: —.
- [tests/api/error-catalog.test.ts](sources/agents/tests/api/error-catalog.test.ts) — 1356 linhas; exports: A, B, C.
- [tests/api/features/auth/auth.controller.test.ts](sources/agents/tests/api/features/auth/auth.controller.test.ts) — 356 linhas; exports: —.
- [tests/api/features/auth/auth.service.test.ts](sources/agents/tests/api/features/auth/auth.service.test.ts) — 432 linhas; exports: —.
- [tests/api/features/auth/google.service.test.ts](sources/agents/tests/api/features/auth/google.service.test.ts) — 449 linhas; exports: —.
- [tests/api/features/auth/setup.service.test.ts](sources/agents/tests/api/features/auth/setup.service.test.ts) — 149 linhas; exports: —.
- [tests/api/features/branding/branding-audit-actor.test.ts](sources/agents/tests/api/features/branding/branding-audit-actor.test.ts) — 143 linhas; exports: —.
- [tests/api/features/branding/branding.test.ts](sources/agents/tests/api/features/branding/branding.test.ts) — 121 linhas; exports: —.
- [tests/api/features/health/health.controller.test.ts](sources/agents/tests/api/features/health/health.controller.test.ts) — 63 linhas; exports: —.
- [tests/api/features/invitations/invitation.service.test.ts](sources/agents/tests/api/features/invitations/invitation.service.test.ts) — 227 linhas; exports: —.
- [tests/api/features/realtime/realtime.controller.test.ts](sources/agents/tests/api/features/realtime/realtime.controller.test.ts) — 119 linhas; exports: —.
- [tests/api/features/realtime/realtime.service.test.ts](sources/agents/tests/api/features/realtime/realtime.service.test.ts) — 534 linhas; exports: —.
- [tests/api/lib/auth.test.ts](sources/agents/tests/api/lib/auth.test.ts) — 343 linhas; exports: —.
- [tests/api/lib/clientIp.test.ts](sources/agents/tests/api/lib/clientIp.test.ts) — 142 linhas; exports: —.
- [tests/api/lib/crypto.test.ts](sources/agents/tests/api/lib/crypto.test.ts) — 37 linhas; exports: —.
- [tests/api/lib/csp.test.ts](sources/agents/tests/api/lib/csp.test.ts) — 151 linhas; exports: —.
- [tests/api/lib/i18n.test.ts](sources/agents/tests/api/lib/i18n.test.ts) — 41 linhas; exports: —.
- [tests/api/lib/origin.test.ts](sources/agents/tests/api/lib/origin.test.ts) — 127 linhas; exports: —.
- [tests/api/lib/refusal-callsites.test.ts](sources/agents/tests/api/lib/refusal-callsites.test.ts) — 285 linhas; exports: topLevelArgs, codeOnly, fieldOffenders.
- [tests/api/lib/refusal.test.ts](sources/agents/tests/api/lib/refusal.test.ts) — 129 linhas; exports: —.
- [tests/api/lib/schema-refusal-declared.test.ts](sources/agents/tests/api/lib/schema-refusal-declared.test.ts) — 515 linhas; exports: validFor, violation, bodyViolation.
- [tests/api/lib/schema-refusal-production.test.ts](sources/agents/tests/api/lib/schema-refusal-production.test.ts) — 87 linhas; exports: —.
- [tests/api/lib/schema-refusal.test.ts](sources/agents/tests/api/lib/schema-refusal.test.ts) — 222 linhas; exports: —.
- [tests/api/lib/step-up.test.ts](sources/agents/tests/api/lib/step-up.test.ts) — 183 linhas; exports: —.
- [tests/api/lib/unhandled-error.test.ts](sources/agents/tests/api/lib/unhandled-error.test.ts) — 121 linhas; exports: —.
- [tests/api/middlewares/credentialRateLimit.test.ts](sources/agents/tests/api/middlewares/credentialRateLimit.test.ts) — 278 linhas; exports: —.
- [tests/api/middlewares/rateLimit.test.ts](sources/agents/tests/api/middlewares/rateLimit.test.ts) — 177 linhas; exports: —.
- [tests/api/middlewares/rateLimitMetering.test.ts](sources/agents/tests/api/middlewares/rateLimitMetering.test.ts) — 220 linhas; exports: —.
- [tests/api/refusal-sentences.test.ts](sources/agents/tests/api/refusal-sentences.test.ts) — 443 linhas; exports: —.
- [tests/api/refusal-wire.test.ts](sources/agents/tests/api/refusal-wire.test.ts) — 641 linhas; exports: —.
- [tests/api/schema-refusal-wire.test.ts](sources/agents/tests/api/schema-refusal-wire.test.ts) — 196 linhas; exports: —.
- [tests/api/v1/actor-audit-actor.test.ts](sources/agents/tests/api/v1/actor-audit-actor.test.ts) — 508 linhas; exports: —.
- [tests/api/v1/agent-config-health.test.ts](sources/agents/tests/api/v1/agent-config-health.test.ts) — 237 linhas; exports: —.
- [tests/api/v1/agents-audit-actor.test.ts](sources/agents/tests/api/v1/agents-audit-actor.test.ts) — 187 linhas; exports: —.
- [tests/api/v1/agents-controller.test.ts](sources/agents/tests/api/v1/agents-controller.test.ts) — 58 linhas; exports: —.
- [tests/api/v1/audit-read.test.ts](sources/agents/tests/api/v1/audit-read.test.ts) — 433 linhas; exports: —.
- [tests/api/v1/body-id-refusal.test.ts](sources/agents/tests/api/v1/body-id-refusal.test.ts) — 232 linhas; exports: —.
- [tests/api/v1/carveout.test.ts](sources/agents/tests/api/v1/carveout.test.ts) — 121 linhas; exports: —.
- [tests/api/v1/channels-audit-actor.test.ts](sources/agents/tests/api/v1/channels-audit-actor.test.ts) — 392 linhas; exports: —.
- [tests/api/v1/code-tools-controller.test.ts](sources/agents/tests/api/v1/code-tools-controller.test.ts) — 38 linhas; exports: —.
- [tests/api/v1/config-families-audit-actor.test.ts](sources/agents/tests/api/v1/config-families-audit-actor.test.ts) — 457 linhas; exports: —.
- [tests/api/v1/conversations-audit-actor.test.ts](sources/agents/tests/api/v1/conversations-audit-actor.test.ts) — 355 linhas; exports: —.
- [tests/api/v1/document-id-range.test.ts](sources/agents/tests/api/v1/document-id-range.test.ts) — 111 linhas; exports: —.
- [tests/api/v1/document-templates-controller.test.ts](sources/agents/tests/api/v1/document-templates-controller.test.ts) — 173 linhas; exports: —.
- [tests/api/v1/documents-thread-key.test.ts](sources/agents/tests/api/v1/documents-thread-key.test.ts) — 30 linhas; exports: —.
- [tests/api/v1/fleet-api-key.test.ts](sources/agents/tests/api/v1/fleet-api-key.test.ts) — 546 linhas; exports: —.
- [tests/api/v1/knowledge-audit-actor.test.ts](sources/agents/tests/api/v1/knowledge-audit-actor.test.ts) — 380 linhas; exports: —.
- [tests/api/v1/knowledge-controller.test.ts](sources/agents/tests/api/v1/knowledge-controller.test.ts) — 44 linhas; exports: —.
- [tests/api/v1/knowledge-search-bigint.test.ts](sources/agents/tests/api/v1/knowledge-search-bigint.test.ts) — 127 linhas; exports: —.
- [tests/api/v1/knowledge-tenant-context.test.ts](sources/agents/tests/api/v1/knowledge-tenant-context.test.ts) — 97 linhas; exports: —.
- [tests/api/v1/mcp-dcr.test.ts](sources/agents/tests/api/v1/mcp-dcr.test.ts) — 73 linhas; exports: —.
- [tests/api/v1/mcp-oauth-authorize.test.ts](sources/agents/tests/api/v1/mcp-oauth-authorize.test.ts) — 80 linhas; exports: —.
- [tests/api/v1/mcp-oauth-consent-seam.test.ts](sources/agents/tests/api/v1/mcp-oauth-consent-seam.test.ts) — 367 linhas; exports: —.
- [tests/api/v1/mcp.test.ts](sources/agents/tests/api/v1/mcp.test.ts) — 95 linhas; exports: —.
- [tests/api/v1/metrics-kpis-response.test.ts](sources/agents/tests/api/v1/metrics-kpis-response.test.ts) — 36 linhas; exports: —.
- [tests/api/v1/playground-guardrails-wire.test.ts](sources/agents/tests/api/v1/playground-guardrails-wire.test.ts) — 79 linhas; exports: —.
- [tests/api/v1/playground-multipart-draft.test.ts](sources/agents/tests/api/v1/playground-multipart-draft.test.ts) — 212 linhas; exports: —.
- [tests/api/v1/query-filter-refusal.test.ts](sources/agents/tests/api/v1/query-filter-refusal.test.ts) — 316 linhas; exports: —.
- [tests/api/v1/route-id-refusal.test.ts](sources/agents/tests/api/v1/route-id-refusal.test.ts) — 271 linhas; exports: —.
- [tests/api/v1/spend-ceiling-message-cap.test.ts](sources/agents/tests/api/v1/spend-ceiling-message-cap.test.ts) — 48 linhas; exports: —.
- [tests/api/v1/tenant-cache-vary.test.ts](sources/agents/tests/api/v1/tenant-cache-vary.test.ts) — 61 linhas; exports: —.
- [tests/api/v1/tools-controller.test.ts](sources/agents/tests/api/v1/tools-controller.test.ts) — 107 linhas; exports: —.
- [tests/api/v1/upstream-zod-error.test.ts](sources/agents/tests/api/v1/upstream-zod-error.test.ts) — 77 linhas; exports: —.
- [tests/api/v1/webhook-delivery-filters.test.ts](sources/agents/tests/api/v1/webhook-delivery-filters.test.ts) — 127 linhas; exports: —.
- [tests/api/v1/webhooks-audit-actor.test.ts](sources/agents/tests/api/v1/webhooks-audit-actor.test.ts) — 358 linhas; exports: —.
- [tests/api/v1/write-body-required.test.ts](sources/agents/tests/api/v1/write-body-required.test.ts) — 434 linhas; exports: recordConstrainsItsValues, unmarkedServiceParse.
- [tests/client/agent-document-preview.test.tsx](sources/agents/tests/client/agent-document-preview.test.tsx) — 311 linhas; exports: —.
- [tests/client/agent-editor-takeover-block.test.ts](sources/agents/tests/client/agent-editor-takeover-block.test.ts) — 31 linhas; exports: —.
- [tests/client/approval-edit.test.ts](sources/agents/tests/client/approval-edit.test.ts) — 85 linhas; exports: —.
- [tests/client/approval-refusal-session.test.tsx](sources/agents/tests/client/approval-refusal-session.test.tsx) — 113 linhas; exports: —.
- [tests/client/audit-cursor-reset.test.tsx](sources/agents/tests/client/audit-cursor-reset.test.tsx) — 156 linhas; exports: —.
- [tests/client/audit-export-button.test.tsx](sources/agents/tests/client/audit-export-button.test.tsx) — 262 linhas; exports: —.
- [tests/client/audit-no-freshness-header.test.tsx](sources/agents/tests/client/audit-no-freshness-header.test.tsx) — 99 linhas; exports: —.
- [tests/client/audit-period-control.test.tsx](sources/agents/tests/client/audit-period-control.test.tsx) — 293 linhas; exports: —.
- [tests/client/audit-period.test.ts](sources/agents/tests/client/audit-period.test.ts) — 335 linhas; exports: —.
- [tests/client/audit-renamed-action-link.test.tsx](sources/agents/tests/client/audit-renamed-action-link.test.tsx) — 98 linhas; exports: —.
- [tests/client/audit-scope-control.test.tsx](sources/agents/tests/client/audit-scope-control.test.tsx) — 260 linhas; exports: —.
- [tests/client/auth-logout-failure.test.ts](sources/agents/tests/client/auth-logout-failure.test.ts) — 125 linhas; exports: —.
- [tests/client/behavior-dirty-snapshot.test.ts](sources/agents/tests/client/behavior-dirty-snapshot.test.ts) — 102 linhas; exports: blocksTheBehaviorSaveWrites, snapshotBody, savedBlocksMissingFromSnapshot.
- [tests/client/behavior-save-gate.test.ts](sources/agents/tests/client/behavior-save-gate.test.ts) — 107 linhas; exports: declaredEndpointChecks, saveGateExpression, checksMissingFromGate.
- [tests/client/brand-favicon-preload.test.ts](sources/agents/tests/client/brand-favicon-preload.test.ts) — 234 linhas; exports: —.
- [tests/client/brand-title-preload.test.ts](sources/agents/tests/client/brand-title-preload.test.ts) — 109 linhas; exports: —.
- [tests/client/bundle-boundary.test.ts](sources/agents/tests/client/bundle-boundary.test.ts) — 105 linhas; exports: —.
- [tests/client/capability-graph.test.ts](sources/agents/tests/client/capability-graph.test.ts) — 215 linhas; exports: —.
- [tests/client/code-editor-completions.test.tsx](sources/agents/tests/client/code-editor-completions.test.tsx) — 1279 linhas; exports: —.
- [tests/client/code-tools-locale-defaults.test.ts](sources/agents/tests/client/code-tools-locale-defaults.test.ts) — 88 linhas; exports: —.
- [tests/client/codemirror-field-shell.test.tsx](sources/agents/tests/client/codemirror-field-shell.test.tsx) — 219 linhas; exports: —.
- [tests/client/company-draft.test.ts](sources/agents/tests/client/company-draft.test.ts) — 201 linhas; exports: —.
- [tests/client/company-logo-one-request.test.tsx](sources/agents/tests/client/company-logo-one-request.test.tsx) — 295 linhas; exports: —.
- [tests/client/company-logo-url.test.tsx](sources/agents/tests/client/company-logo-url.test.tsx) — 166 linhas; exports: —.
- [tests/client/company-modal-reopen.test.tsx](sources/agents/tests/client/company-modal-reopen.test.tsx) — 144 linhas; exports: —.
- [tests/client/company-nav-guard.test.tsx](sources/agents/tests/client/company-nav-guard.test.tsx) — 95 linhas; exports: —.
- [tests/client/company-save-session.test.tsx](sources/agents/tests/client/company-save-session.test.tsx) — 249 linhas; exports: —.
- [tests/client/components/AlertChannelsSection.test.tsx](sources/agents/tests/client/components/AlertChannelsSection.test.tsx) — 321 linhas; exports: —.
- [tests/client/components/Breadcrumbs.test.tsx](sources/agents/tests/client/components/Breadcrumbs.test.tsx) — 40 linhas; exports: —.
- [tests/client/components/BusinessHoursForm.test.tsx](sources/agents/tests/client/components/BusinessHoursForm.test.tsx) — 127 linhas; exports: —.
- [tests/client/components/Button.test.tsx](sources/agents/tests/client/components/Button.test.tsx) — 80 linhas; exports: —.
- [tests/client/components/CredentialFormParamName.test.tsx](sources/agents/tests/client/components/CredentialFormParamName.test.tsx) — 162 linhas; exports: —.
- [tests/client/components/CredentialPicker.test.tsx](sources/agents/tests/client/components/CredentialPicker.test.tsx) — 125 linhas; exports: —.
- [tests/client/components/FormFieldHelp.test.tsx](sources/agents/tests/client/components/FormFieldHelp.test.tsx) — 418 linhas; exports: —.
- [tests/client/components/Header.test.tsx](sources/agents/tests/client/components/Header.test.tsx) — 80 linhas; exports: —.
- [tests/client/components/Modal.test.tsx](sources/agents/tests/client/components/Modal.test.tsx) — 274 linhas; exports: —.
- [tests/client/components/ModelPicker.test.tsx](sources/agents/tests/client/components/ModelPicker.test.tsx) — 70 linhas; exports: —.
- [tests/client/components/ProGate.full.test.tsx](sources/agents/tests/client/components/ProGate.full.test.tsx) — 27 linhas; exports: —.
- [tests/client/components/ProGate.test.tsx](sources/agents/tests/client/components/ProGate.test.tsx) — 55 linhas; exports: —.
- [tests/client/components/SetupGate.test.tsx](sources/agents/tests/client/components/SetupGate.test.tsx) — 82 linhas; exports: —.
- [tests/client/components/Sidebar.test.tsx](sources/agents/tests/client/components/Sidebar.test.tsx) — 183 linhas; exports: —.
- [tests/client/components/SidebarResizer.test.tsx](sources/agents/tests/client/components/SidebarResizer.test.tsx) — 193 linhas; exports: —.
- [tests/client/components/SupportModal.test.tsx](sources/agents/tests/client/components/SupportModal.test.tsx) — 92 linhas; exports: —.
- [tests/client/components/TenantDeepLink.test.tsx](sources/agents/tests/client/components/TenantDeepLink.test.tsx) — 315 linhas; exports: —.
- [tests/client/components/TenantSwitcher.test.tsx](sources/agents/tests/client/components/TenantSwitcher.test.tsx) — 240 linhas; exports: —.
- [tests/client/components/Textarea.test.tsx](sources/agents/tests/client/components/Textarea.test.tsx) — 83 linhas; exports: —.
- [tests/client/components/Toast.test.tsx](sources/agents/tests/client/components/Toast.test.tsx) — 63 linhas; exports: —.
- [tests/client/components/UserMenu.test.tsx](sources/agents/tests/client/components/UserMenu.test.tsx) — 164 linhas; exports: —.
- [tests/client/components/WebhookSubscriptionModal.test.tsx](sources/agents/tests/client/components/WebhookSubscriptionModal.test.tsx) — 210 linhas; exports: —.
- [tests/client/contact-auth-ttl-zero.test.ts](sources/agents/tests/client/contact-auth-ttl-zero.test.ts) — 63 linhas; exports: —.
- [tests/client/contexts/SidebarContext.test.tsx](sources/agents/tests/client/contexts/SidebarContext.test.tsx) — 195 linhas; exports: —.
- [tests/client/conversation-outcomes.test.ts](sources/agents/tests/client/conversation-outcomes.test.ts) — 251 linhas; exports: —.
- [tests/client/credential-name-kind-refusal.test.tsx](sources/agents/tests/client/credential-name-kind-refusal.test.tsx) — 202 linhas; exports: —.
- [tests/client/credential-whitespace-not-overridable.test.tsx](sources/agents/tests/client/credential-whitespace-not-overridable.test.tsx) — 109 linhas; exports: —.
- [tests/client/debug-warning-source.test.ts](sources/agents/tests/client/debug-warning-source.test.ts) — 374 linhas; exports: —.
- [tests/client/document-preview-height.test.tsx](sources/agents/tests/client/document-preview-height.test.tsx) — 68 linhas; exports: —.
- [tests/client/document-preview-matches-save.test.tsx](sources/agents/tests/client/document-preview-matches-save.test.tsx) — 212 linhas; exports: —.
- [tests/client/document-preview-session.test.tsx](sources/agents/tests/client/document-preview-session.test.tsx) — 133 linhas; exports: —.
- [tests/client/document-refresh-error.test.tsx](sources/agents/tests/client/document-refresh-error.test.tsx) — 197 linhas; exports: —.
- [tests/client/document-revoke-confirm.test.tsx](sources/agents/tests/client/document-revoke-confirm.test.tsx) — 149 linhas; exports: —.
- [tests/client/document-server-refusal.test.tsx](sources/agents/tests/client/document-server-refusal.test.tsx) — 242 linhas; exports: —.
- [tests/client/document-starters-race.test.tsx](sources/agents/tests/client/document-starters-race.test.tsx) — 341 linhas; exports: —.
- [tests/client/document-tool-name-follows-name.test.tsx](sources/agents/tests/client/document-tool-name-follows-name.test.tsx) — 201 linhas; exports: —.
- [tests/client/editor-refusal.test.ts](sources/agents/tests/client/editor-refusal.test.ts) — 414 linhas; exports: —.
- [tests/client/editor-save-errors.test.ts](sources/agents/tests/client/editor-save-errors.test.ts) — 464 linhas; exports: —.
- [tests/client/editor-text-caps.test.ts](sources/agents/tests/client/editor-text-caps.test.ts) — 74 linhas; exports: —.
- [tests/client/error-toast-reason.test.ts](sources/agents/tests/client/error-toast-reason.test.ts) — 1249 linhas; exports: openBlocks, headKeyword, talkedToTheServer, Offender, deadReads, unreadRefusals, unaskedToasts, unparenthesisedFallback, waiverKey.
- [tests/client/escape-claim.test.ts](sources/agents/tests/client/escape-claim.test.ts) — 64 linhas; exports: —.
- [tests/client/field-refusal-at-input.test.tsx](sources/agents/tests/client/field-refusal-at-input.test.tsx) — 407 linhas; exports: —.
- [tests/client/field-refusal-fence.test.ts](sources/agents/tests/client/field-refusal-fence.test.ts) — 1471 linhas; exports: writesAForm, handlers, writeHandlers, unheldWrites, unheldBranches, distrustedNulls, tautologicalStaleness, halfUsedHolders, declarations, declaredFields, readFields, uncleanedHolders, holdersBlindToTheScreen, guardOf, guardedButUnconditional, deadReadings, silentDeclarations.
- [tests/client/field-refusal-forms.test.tsx](sources/agents/tests/client/field-refusal-forms.test.tsx) — 196 linhas; exports: —.
- [tests/client/field-refusal.test.ts](sources/agents/tests/client/field-refusal.test.ts) — 435 linhas; exports: —.
- [tests/client/followup-form-state.test.ts](sources/agents/tests/client/followup-form-state.test.ts) — 89 linhas; exports: —.
- [tests/client/grant-before-refetch.test.ts](sources/agents/tests/client/grant-before-refetch.test.ts) — 56 linhas; exports: —.
- [tests/client/guardrails-form-state.test.ts](sources/agents/tests/client/guardrails-form-state.test.ts) — 104 linhas; exports: —.
- [tests/client/help-placement.test.ts](sources/agents/tests/client/help-placement.test.ts) — 74 linhas; exports: —.
- [tests/client/hooks/useActiveTenantName.test.ts](sources/agents/tests/client/hooks/useActiveTenantName.test.ts) — 60 linhas; exports: —.
- [tests/client/hooks/useFieldRefusal.test.tsx](sources/agents/tests/client/hooks/useFieldRefusal.test.tsx) — 103 linhas; exports: —.
- [tests/client/hooks/useTenantList.test.tsx](sources/agents/tests/client/hooks/useTenantList.test.tsx) — 50 linhas; exports: —.
- [tests/client/hooks/useWebSocket.test.tsx](sources/agents/tests/client/hooks/useWebSocket.test.tsx) — 612 linhas; exports: —.
- [tests/client/import-warning-count.test.ts](sources/agents/tests/client/import-warning-count.test.ts) — 31 linhas; exports: —.
- [tests/client/import-warning-plurals.test.ts](sources/agents/tests/client/import-warning-plurals.test.ts) — 56 linhas; exports: —.
- [tests/client/import-warnings-rendered.test.ts](sources/agents/tests/client/import-warnings-rendered.test.ts) — 21 linhas; exports: —.
- [tests/client/knowledge-docs.test.ts](sources/agents/tests/client/knowledge-docs.test.ts) — 161 linhas; exports: —.
- [tests/client/lib/activeTenant.test.ts](sources/agents/tests/client/lib/activeTenant.test.ts) — 103 linhas; exports: —.
- [tests/client/lib/apiError.test.ts](sources/agents/tests/client/lib/apiError.test.ts) — 36 linhas; exports: —.
- [tests/client/lib/breadcrumbs.test.ts](sources/agents/tests/client/lib/breadcrumbs.test.ts) — 66 linhas; exports: —.
- [tests/client/lib/credentialRef.test.ts](sources/agents/tests/client/lib/credentialRef.test.ts) — 31 linhas; exports: —.
- [tests/client/lib/duration.test.ts](sources/agents/tests/client/lib/duration.test.ts) — 77 linhas; exports: —.
- [tests/client/lib/logGroupTitle.test.ts](sources/agents/tests/client/lib/logGroupTitle.test.ts) — 105 linhas; exports: —.
- [tests/client/lib/navigation.test.tsx](sources/agents/tests/client/lib/navigation.test.tsx) — 33 linhas; exports: —.
- [tests/client/lib/promptPreview.test.ts](sources/agents/tests/client/lib/promptPreview.test.ts) — 97 linhas; exports: —.
- [tests/client/lib/tenantDeepLink.test.ts](sources/agents/tests/client/lib/tenantDeepLink.test.ts) — 143 linhas; exports: —.
- [tests/client/lib/tenantSelectorRecovery.test.ts](sources/agents/tests/client/lib/tenantSelectorRecovery.test.ts) — 147 linhas; exports: —.
- [tests/client/lib/tenantSwitch.test.ts](sources/agents/tests/client/lib/tenantSwitch.test.ts) — 40 linhas; exports: —.
- [tests/client/lib/toolpack-arg-notes.test.ts](sources/agents/tests/client/lib/toolpack-arg-notes.test.ts) — 142 linhas; exports: —.
- [tests/client/lib/unsavedGuard.test.ts](sources/agents/tests/client/lib/unsavedGuard.test.ts) — 93 linhas; exports: —.
- [tests/client/lib/utils.test.ts](sources/agents/tests/client/lib/utils.test.ts) — 55 linhas; exports: —.
- [tests/client/lib/vaultCache.test.ts](sources/agents/tests/client/lib/vaultCache.test.ts) — 524 linhas; exports: —.
- [tests/client/locale-plurals.test.ts](sources/agents/tests/client/locale-plurals.test.ts) — 325 linhas; exports: —.
- [tests/client/memory-form-state.test.ts](sources/agents/tests/client/memory-form-state.test.ts) — 119 linhas; exports: —.
- [tests/client/model-fallback-form-state.test.ts](sources/agents/tests/client/model-fallback-form-state.test.ts) — 213 linhas; exports: —.
- [tests/client/monitoring-editor.test.ts](sources/agents/tests/client/monitoring-editor.test.ts) — 312 linhas; exports: —.
- [tests/client/observability-form-state.test.ts](sources/agents/tests/client/observability-form-state.test.ts) — 110 linhas; exports: —.
- [tests/client/observation-form-state.test.ts](sources/agents/tests/client/observation-form-state.test.ts) — 196 linhas; exports: —.
- [tests/client/pages/AdminDemoteFleetAdmin.test.tsx](sources/agents/tests/client/pages/AdminDemoteFleetAdmin.test.tsx) — 180 linhas; exports: —.
- [tests/client/pages/ApiKeysFleet.test.tsx](sources/agents/tests/client/pages/ApiKeysFleet.test.tsx) — 276 linhas; exports: —.
- [tests/client/pages/AuditFieldDiff.test.ts](sources/agents/tests/client/pages/AuditFieldDiff.test.ts) — 301 linhas; exports: —.
- [tests/client/pages/BehaviorTabVisionDocuments.test.tsx](sources/agents/tests/client/pages/BehaviorTabVisionDocuments.test.tsx) — 264 linhas; exports: —.
- [tests/client/pages/CodeToolEditModal.test.tsx](sources/agents/tests/client/pages/CodeToolEditModal.test.tsx) — 791 linhas; exports: —.
- [tests/client/pages/CodeToolTestModal.test.ts](sources/agents/tests/client/pages/CodeToolTestModal.test.ts) — 147 linhas; exports: —.
- [tests/client/pages/DashboardFirstResponse.test.tsx](sources/agents/tests/client/pages/DashboardFirstResponse.test.tsx) — 136 linhas; exports: —.
- [tests/client/pages/DashboardSpendCeiling.test.tsx](sources/agents/tests/client/pages/DashboardSpendCeiling.test.tsx) — 832 linhas; exports: —.
- [tests/client/pages/GuardrailsTab.test.tsx](sources/agents/tests/client/pages/GuardrailsTab.test.tsx) — 212 linhas; exports: —.
- [tests/client/pages/KnowledgeApprovals.test.tsx](sources/agents/tests/client/pages/KnowledgeApprovals.test.tsx) — 307 linhas; exports: —.
- [tests/client/pages/KnowledgeDocsBlock.test.tsx](sources/agents/tests/client/pages/KnowledgeDocsBlock.test.tsx) — 987 linhas; exports: —.
- [tests/client/pages/LoginPage.redirect.test.ts](sources/agents/tests/client/pages/LoginPage.redirect.test.ts) — 33 linhas; exports: —.
- [tests/client/pages/LogsGroupTitle.test.tsx](sources/agents/tests/client/pages/LogsGroupTitle.test.tsx) — 133 linhas; exports: —.
- [tests/client/pages/LogsScopeChip.test.tsx](sources/agents/tests/client/pages/LogsScopeChip.test.tsx) — 167 linhas; exports: —.
- [tests/client/pages/SetupPage.test.tsx](sources/agents/tests/client/pages/SetupPage.test.tsx) — 167 linhas; exports: —.
- [tests/client/pages/ToolEditModal.test.tsx](sources/agents/tests/client/pages/ToolEditModal.test.tsx) — 751 linhas; exports: —.
- [tests/client/pages/VaultFillDeepLink.test.tsx](sources/agents/tests/client/pages/VaultFillDeepLink.test.tsx) — 146 linhas; exports: —.
- [tests/client/pages/WebhooksPageSigningLabel.test.tsx](sources/agents/tests/client/pages/WebhooksPageSigningLabel.test.tsx) — 122 linhas; exports: —.
- [tests/client/pages/resources/SpendCeilingCard.test.tsx](sources/agents/tests/client/pages/resources/SpendCeilingCard.test.tsx) — 456 linhas; exports: —.
- [tests/client/path-picker-empty-offer.test.tsx](sources/agents/tests/client/path-picker-empty-offer.test.tsx) — 56 linhas; exports: —.
- [tests/client/playground-agent-turn.test.ts](sources/agents/tests/client/playground-agent-turn.test.ts) — 199 linhas; exports: —.
- [tests/client/sample-json.test.ts](sources/agents/tests/client/sample-json.test.ts) — 266 linhas; exports: —.
- [tests/client/server-clock.test.ts](sources/agents/tests/client/server-clock.test.ts) — 103 linhas; exports: —.
- [tests/client/shell-scroll-containment.test.ts](sources/agents/tests/client/shell-scroll-containment.test.ts) — 63 linhas; exports: —.
- [tests/client/template-completion.test.ts](sources/agents/tests/client/template-completion.test.ts) — 253 linhas; exports: —.
- [tests/client/tool-appointment-declaration-form.test.tsx](sources/agents/tests/client/tool-appointment-declaration-form.test.tsx) — 420 linhas; exports: —.
- [tests/client/tool-context-scan.test.ts](sources/agents/tests/client/tool-context-scan.test.ts) — 171 linhas; exports: —.
- [tests/client/tool-path-picker-affordance.test.tsx](sources/agents/tests/client/tool-path-picker-affordance.test.tsx) — 514 linhas; exports: —.
- [tests/client/tool-preconditions-editor.test.ts](sources/agents/tests/client/tool-preconditions-editor.test.ts) — 440 linhas; exports: —.
- [tests/client/tool-sample-json-editor.test.tsx](sources/agents/tests/client/tool-sample-json-editor.test.tsx) — 426 linhas; exports: —.
- [tests/client/tool-sample-persistence.test.ts](sources/agents/tests/client/tool-sample-persistence.test.ts) — 1467 linhas; exports: —.
- [tests/client/tool-test-arg-coercion.test.ts](sources/agents/tests/client/tool-test-arg-coercion.test.ts) — 176 linhas; exports: —.
- [tests/client/tool-test-modal-sends-typed.test.tsx](sources/agents/tests/client/tool-test-modal-sends-typed.test.tsx) — 405 linhas; exports: —.
- [tests/client/tts-form-state.test.ts](sources/agents/tests/client/tts-form-state.test.ts) — 576 linhas; exports: —.
- [tests/client/window-open-api-path.test.ts](sources/agents/tests/client/window-open-api-path.test.ts) — 44 linhas; exports: —.
- [tests/config.test.ts](sources/agents/tests/config.test.ts) — 278 linhas; exports: —.
- [tests/db-gate.ts](sources/agents/tests/db-gate.ts) — 412 linhas; exports: DB_GATE_OPT_OUT, missingDbConfig, unreachableDb, probeTargets, PROBE_DEADLINE_MS, probePoolConfig, PROBE_BACKSTOP_MS, withDeadline, MigrationRow, LocalMigration, appliedMigrations, failedMigrations, outOfOrderPending, foreignMigrations, pendingMigrations, changedMigrations, appliedOutOfOrder, schemaOutOfStep, reprovisionReasons, localMigrations.
- [tests/db-name.ts](sources/agents/tests/db-name.ts) — 106 linhas; exports: checkoutRootFrom, testDbNameFor, withDbName.
- [tests/dom-setup.ts](sources/agents/tests/dom-setup.ts) — 34 linhas; exports: —.
- [tests/fixtures/code-sandbox/host-limit.ts](sources/agents/tests/fixtures/code-sandbox/host-limit.ts) — 11 linhas; exports: —.
- [tests/fixtures/code-sandbox/host-zone.ts](sources/agents/tests/fixtures/code-sandbox/host-zone.ts) — 15 linhas; exports: —.
- [tests/fixtures/code-sandbox/worker-boot-fails.ts](sources/agents/tests/fixtures/code-sandbox/worker-boot-fails.ts) — 4 linhas; exports: —.
- [tests/fixtures/code-sandbox/worker-dies.ts](sources/agents/tests/fixtures/code-sandbox/worker-dies.ts) — 8 linhas; exports: —.
- [tests/fixtures/code-sandbox/worker-hangs.ts](sources/agents/tests/fixtures/code-sandbox/worker-hangs.ts) — 8 linhas; exports: —.
- [tests/graph/agent-node.test.ts](sources/agents/tests/graph/agent-node.test.ts) — 1885 linhas; exports: —.
- [tests/graph/attendance-boundary.test.ts](sources/agents/tests/graph/attendance-boundary.test.ts) — 218 linhas; exports: —.
- [tests/graph/attribute-context.test.ts](sources/agents/tests/graph/attribute-context.test.ts) — 401 linhas; exports: —.
- [tests/graph/calculator.test.ts](sources/agents/tests/graph/calculator.test.ts) — 34 linhas; exports: —.
- [tests/graph/calendar-pinned-calendar-turn.test.ts](sources/agents/tests/graph/calendar-pinned-calendar-turn.test.ts) — 384 linhas; exports: —.
- [tests/graph/checkpointer.test.ts](sources/agents/tests/graph/checkpointer.test.ts) — 56 linhas; exports: —.
- [tests/graph/close-intent.test.ts](sources/agents/tests/graph/close-intent.test.ts) — 97 linhas; exports: —.
- [tests/graph/code-sandbox.test.ts](sources/agents/tests/graph/code-sandbox.test.ts) — 1526 linhas; exports: —.
- [tests/graph/code-tools.test.ts](sources/agents/tests/graph/code-tools.test.ts) — 264 linhas; exports: —.
- [tests/graph/document-tool.test.ts](sources/agents/tests/graph/document-tool.test.ts) — 574 linhas; exports: —.
- [tests/graph/duplicate-tool-name-visible.test.ts](sources/agents/tests/graph/duplicate-tool-name-visible.test.ts) — 243 linhas; exports: —.
- [tests/graph/fallback-flow-labels.test.ts](sources/agents/tests/graph/fallback-flow-labels.test.ts) — 186 linhas; exports: handlerBody, allHandlerBodies, unlabelled, levelOf.
- [tests/graph/gemini-tool-schema.test.ts](sources/agents/tests/graph/gemini-tool-schema.test.ts) — 665 linhas; exports: —.
- [tests/graph/handback-persistence.test.ts](sources/agents/tests/graph/handback-persistence.test.ts) — 73 linhas; exports: —.
- [tests/graph/handback.test.ts](sources/agents/tests/graph/handback.test.ts) — 224 linhas; exports: —.
- [tests/graph/history-ceiling-turn.test.ts](sources/agents/tests/graph/history-ceiling-turn.test.ts) — 351 linhas; exports: —.
- [tests/graph/history-window.test.ts](sources/agents/tests/graph/history-window.test.ts) — 165 linhas; exports: —.
- [tests/graph/http-expected-status.test.ts](sources/agents/tests/graph/http-expected-status.test.ts) — 93 linhas; exports: —.
- [tests/graph/ingest-dedup.test.ts](sources/agents/tests/graph/ingest-dedup.test.ts) — 127 linhas; exports: —.
- [tests/graph/ingest-job.test.ts](sources/agents/tests/graph/ingest-job.test.ts) — 884 linhas; exports: —.
- [tests/graph/ingest.test.ts](sources/agents/tests/graph/ingest.test.ts) — 1042 linhas; exports: —.
- [tests/graph/model-config.test.ts](sources/agents/tests/graph/model-config.test.ts) — 56 linhas; exports: —.
- [tests/graph/model-endpoint-support.test.ts](sources/agents/tests/graph/model-endpoint-support.test.ts) — 66 linhas; exports: —.
- [tests/graph/model-fallback-build.test.ts](sources/agents/tests/graph/model-fallback-build.test.ts) — 152 linhas; exports: —.
- [tests/graph/model-fallback.test.ts](sources/agents/tests/graph/model-fallback.test.ts) — 825 linhas; exports: —.
- [tests/graph/model-limit.test.ts](sources/agents/tests/graph/model-limit.test.ts) — 164 linhas; exports: —.
- [tests/graph/model-limits-transport.test.ts](sources/agents/tests/graph/model-limits-transport.test.ts) — 161 linhas; exports: —.
- [tests/graph/model-reasoning-effort.test.ts](sources/agents/tests/graph/model-reasoning-effort.test.ts) — 742 linhas; exports: —.
- [tests/graph/model-temperature.test.ts](sources/agents/tests/graph/model-temperature.test.ts) — 139 linhas; exports: —.
- [tests/graph/nudge-agent-unavailable.test.ts](sources/agents/tests/graph/nudge-agent-unavailable.test.ts) — 465 linhas; exports: —.
- [tests/graph/nudge-refused-rollback.test.ts](sources/agents/tests/graph/nudge-refused-rollback.test.ts) — 848 linhas; exports: —.
- [tests/graph/nudge-retry.test.ts](sources/agents/tests/graph/nudge-retry.test.ts) — 232 linhas; exports: RunAgentNudgeOutcome.
- [tests/graph/nudge.test.ts](sources/agents/tests/graph/nudge.test.ts) — 4686 linhas; exports: —.
- [tests/graph/observability.test.ts](sources/agents/tests/graph/observability.test.ts) — 283 linhas; exports: —.
- [tests/graph/pool-inversion.test.ts](sources/agents/tests/graph/pool-inversion.test.ts) — 139 linhas; exports: —.
- [tests/graph/prepare.test.ts](sources/agents/tests/graph/prepare.test.ts) — 344 linhas; exports: —.
- [tests/graph/prompt-audit.test.ts](sources/agents/tests/graph/prompt-audit.test.ts) — 196 linhas; exports: —.
- [tests/graph/prompt.test.ts](sources/agents/tests/graph/prompt.test.ts) — 288 linhas; exports: —.
- [tests/graph/rag-tools.test.ts](sources/agents/tests/graph/rag-tools.test.ts) — 253 linhas; exports: —.
- [tests/graph/read-receipt-turn.test.ts](sources/agents/tests/graph/read-receipt-turn.test.ts) — 572 linhas; exports: —.
- [tests/graph/reasoning-effort-turn.test.ts](sources/agents/tests/graph/reasoning-effort-turn.test.ts) — 300 linhas; exports: —.
- [tests/graph/refused-turn-callsites.test.ts](sources/agents/tests/graph/refused-turn-callsites.test.ts) — 227 linhas; exports: refuseSection, bareRefusalsAfterTheRollback.
- [tests/graph/refused-turn.test.ts](sources/agents/tests/graph/refused-turn.test.ts) — 530 linhas; exports: —.
- [tests/graph/reset-episode.test.ts](sources/agents/tests/graph/reset-episode.test.ts) — 82 linhas; exports: —.
- [tests/graph/runtime.test.ts](sources/agents/tests/graph/runtime.test.ts) — 5966 linhas; exports: —.
- [tests/graph/schedule-context.test.ts](sources/agents/tests/graph/schedule-context.test.ts) — 224 linhas; exports: —.
- [tests/graph/side-effect-flowlog.test.ts](sources/agents/tests/graph/side-effect-flowlog.test.ts) — 288 linhas; exports: —.
- [tests/graph/silence.test.ts](sources/agents/tests/graph/silence.test.ts) — 696 linhas; exports: lastAssistantText.
- [tests/graph/status.test.ts](sources/agents/tests/graph/status.test.ts) — 142 linhas; exports: —.
- [tests/graph/still-wanted-strictness.test.ts](sources/agents/tests/graph/still-wanted-strictness.test.ts) — 148 linhas; exports: —.
- [tests/graph/thread-claim.test.ts](sources/agents/tests/graph/thread-claim.test.ts) — 522 linhas; exports: —.
- [tests/graph/time.test.ts](sources/agents/tests/graph/time.test.ts) — 86 linhas; exports: —.
- [tests/graph/token-count.test.ts](sources/agents/tests/graph/token-count.test.ts) — 96 linhas; exports: —.
- [tests/graph/tool-ack-fence.test.ts](sources/agents/tests/graph/tool-ack-fence.test.ts) — 139 linhas; exports: —.
- [tests/graph/tool-expected-status-wiring.test.ts](sources/agents/tests/graph/tool-expected-status-wiring.test.ts) — 149 linhas; exports: —.
- [tests/graph/tool-failure.test.ts](sources/agents/tests/graph/tool-failure.test.ts) — 53 linhas; exports: —.
- [tests/graph/tool-flowlog.test.ts](sources/agents/tests/graph/tool-flowlog.test.ts) — 551 linhas; exports: —.
- [tests/graph/tool-grant-order.test.ts](sources/agents/tests/graph/tool-grant-order.test.ts) — 331 linhas; exports: —.
- [tests/graph/tool-name-uniqueness.test.ts](sources/agents/tests/graph/tool-name-uniqueness.test.ts) — 101 linhas; exports: —.
- [tests/graph/tool-precondition-db.test.ts](sources/agents/tests/graph/tool-precondition-db.test.ts) — 211 linhas; exports: —.
- [tests/graph/tool-precondition.test.ts](sources/agents/tests/graph/tool-precondition.test.ts) — 373 linhas; exports: —.
- [tests/graph/tools-assemble.test.ts](sources/agents/tests/graph/tools-assemble.test.ts) — 252 linhas; exports: —.
- [tests/graph/tools-http-appointment.test.ts](sources/agents/tests/graph/tools-http-appointment.test.ts) — 389 linhas; exports: —.
- [tests/graph/tools-http-body-bound.test.ts](sources/agents/tests/graph/tools-http-body-bound.test.ts) — 204 linhas; exports: —.
- [tests/graph/tools-http.test.ts](sources/agents/tests/graph/tools-http.test.ts) — 1654 linhas; exports: —.
- [tests/graph/tools-mcp.test.ts](sources/agents/tests/graph/tools-mcp.test.ts) — 411 linhas; exports: —.
- [tests/graph/tools.test.ts](sources/agents/tests/graph/tools.test.ts) — 1002 linhas; exports: —.
- [tests/graph/trace.test.ts](sources/agents/tests/graph/trace.test.ts) — 212 linhas; exports: —.
- [tests/graph/usage-provider-counts.test.ts](sources/agents/tests/graph/usage-provider-counts.test.ts) — 249 linhas; exports: —.
- [tests/graph/usage.test.ts](sources/agents/tests/graph/usage.test.ts) — 295 linhas; exports: —.
- [tests/lib/astral-cap-sweep.test.ts](sources/agents/tests/lib/astral-cap-sweep.test.ts) — 524 linhas; exports: —.
- [tests/lib/branding-palette.test.ts](sources/agents/tests/lib/branding-palette.test.ts) — 115 linhas; exports: —.
- [tests/lib/caller-id-spelling.test.ts](sources/agents/tests/lib/caller-id-spelling.test.ts) — 461 linhas; exports: startsRegex, blankNonCode, bigIntArgs, unwaived.
- [tests/lib/code-tool-syntax.test.ts](sources/agents/tests/lib/code-tool-syntax.test.ts) — 81 linhas; exports: —.
- [tests/lib/code-tool-vocabulary.test.ts](sources/agents/tests/lib/code-tool-vocabulary.test.ts) — 91 linhas; exports: —.
- [tests/lib/counting-base-context.test.ts](sources/agents/tests/lib/counting-base-context.test.ts) — 75 linhas; exports: —.
- [tests/lib/db-gate.test.ts](sources/agents/tests/lib/db-gate.test.ts) — 287 linhas; exports: —.
- [tests/lib/db-guard.test.ts](sources/agents/tests/lib/db-guard.test.ts) — 454 linhas; exports: —.
- [tests/lib/db-id.test.ts](sources/agents/tests/lib/db-id.test.ts) — 77 linhas; exports: —.
- [tests/lib/edition.test.ts](sources/agents/tests/lib/edition.test.ts) — 20 linhas; exports: —.
- [tests/lib/jsx-comment-tag-sweep.test.ts](sources/agents/tests/lib/jsx-comment-tag-sweep.test.ts) — 246 linhas; exports: —.
- [tests/lib/keyed-queue.test.ts](sources/agents/tests/lib/keyed-queue.test.ts) — 90 linhas; exports: —.
- [tests/lib/ledger.test.ts](sources/agents/tests/lib/ledger.test.ts) — 44 linhas; exports: —.
- [tests/lib/mcp-launchers.test.ts](sources/agents/tests/lib/mcp-launchers.test.ts) — 98 linhas; exports: —.
- [tests/lib/module-mock-package.test.ts](sources/agents/tests/lib/module-mock-package.test.ts) — 352 linhas; exports: ScannedFile, packageMocksIn, unwaived, staleWaivers, testFiles, nonInterpolatingI18nStubs, i18nStubFiles.
- [tests/lib/module-mock-undo.test.ts](sources/agents/tests/lib/module-mock-undo.test.ts) — 168 linhas; exports: ScannedFile, undoByLiveNamespace.
- [tests/lib/outbound-family.test.ts](sources/agents/tests/lib/outbound-family.test.ts) — 45 linhas; exports: —.
- [tests/lib/outbound.test.ts](sources/agents/tests/lib/outbound.test.ts) — 323 linhas; exports: —.
- [tests/lib/provider-boundary-sweep.test.ts](sources/agents/tests/lib/provider-boundary-sweep.test.ts) — 146 linhas; exports: —.
- [tests/lib/provider-failure.test.ts](sources/agents/tests/lib/provider-failure.test.ts) — 189 linhas; exports: —.
- [tests/lib/query-param.test.ts](sources/agents/tests/lib/query-param.test.ts) — 66 linhas; exports: —.
- [tests/lib/redact.test.ts](sources/agents/tests/lib/redact.test.ts) — 358 linhas; exports: —.
- [tests/lib/rls-policy-shape.test.ts](sources/agents/tests/lib/rls-policy-shape.test.ts) — 509 linhas; exports: —.
- [tests/lib/semaphore.test.ts](sources/agents/tests/lib/semaphore.test.ts) — 107 linhas; exports: —.
- [tests/lib/source-text.test.ts](sources/agents/tests/lib/source-text.test.ts) — 843 linhas; exports: slashesAfterAParenthesis, opensRegex, clipText.
- [tests/lib/ssrf.test.ts](sources/agents/tests/lib/ssrf.test.ts) — 210 linhas; exports: —.
- [tests/lib/storable-write-sweep.test.ts](sources/agents/tests/lib/storable-write-sweep.test.ts) — 411 linhas; exports: —.
- [tests/lib/tenancy-unknown-target.test.ts](sources/agents/tests/lib/tenancy-unknown-target.test.ts) — 186 linhas; exports: —.
- [tests/lib/tenancy.integration.test.ts](sources/agents/tests/lib/tenancy.integration.test.ts) — 149 linhas; exports: —.
- [tests/lib/tenancy.test.ts](sources/agents/tests/lib/tenancy.test.ts) — 225 linhas; exports: —.
- [tests/lib/test-db-identity.test.ts](sources/agents/tests/lib/test-db-identity.test.ts) — 938 linhas; exports: —.
- [tests/lib/text.test.ts](sources/agents/tests/lib/text.test.ts) — 259 linhas; exports: —.
- [tests/modules/agent-import-schedule.test.ts](sources/agents/tests/modules/agent-import-schedule.test.ts) — 314 linhas; exports: —.
- [tests/modules/agent-limits.test.ts](sources/agents/tests/modules/agent-limits.test.ts) — 57 linhas; exports: —.
- [tests/modules/agent-mode.test.ts](sources/agents/tests/modules/agent-mode.test.ts) — 55 linhas; exports: —.
- [tests/modules/agent-settings-mcp-parity.test.ts](sources/agents/tests/modules/agent-settings-mcp-parity.test.ts) — 699 linhas; exports: —.
- [tests/modules/agent-tool-preconditions.test.ts](sources/agents/tests/modules/agent-tool-preconditions.test.ts) — 474 linhas; exports: —.
- [tests/modules/agent-transfer-tool-names.test.ts](sources/agents/tests/modules/agent-transfer-tool-names.test.ts) — 293 linhas; exports: —.
- [tests/modules/agent-transfer.test.ts](sources/agents/tests/modules/agent-transfer.test.ts) — 3142 linhas; exports: —.
- [tests/modules/agents-text-caps.test.ts](sources/agents/tests/modules/agents-text-caps.test.ts) — 320 linhas; exports: —.
- [tests/modules/agents.test.ts](sources/agents/tests/modules/agents.test.ts) — 1103 linhas; exports: —.
- [tests/modules/agents/credential-paths.test.ts](sources/agents/tests/modules/agents/credential-paths.test.ts) — 212 linhas; exports: —.
- [tests/modules/alert-channel-secret-roundtrip.test.ts](sources/agents/tests/modules/alert-channel-secret-roundtrip.test.ts) — 622 linhas; exports: ThingDto.
- [tests/modules/analytics-kpis.test.ts](sources/agents/tests/modules/analytics-kpis.test.ts) — 273 linhas; exports: —.
- [tests/modules/analytics.test.ts](sources/agents/tests/modules/analytics.test.ts) — 227 linhas; exports: —.
- [tests/modules/api-keys.test.ts](sources/agents/tests/modules/api-keys.test.ts) — 459 linhas; exports: —.
- [tests/modules/appointment-context-db.test.ts](sources/agents/tests/modules/appointment-context-db.test.ts) — 919 linhas; exports: —.
- [tests/modules/appointment-context.test.ts](sources/agents/tests/modules/appointment-context.test.ts) — 140 linhas; exports: —.
- [tests/modules/appointment-reminders.test.ts](sources/agents/tests/modules/appointment-reminders.test.ts) — 1225 linhas; exports: —.
- [tests/modules/appointment-side-effect.test.ts](sources/agents/tests/modules/appointment-side-effect.test.ts) — 179 linhas; exports: —.
- [tests/modules/audit-actions.test.ts](sources/agents/tests/modules/audit-actions.test.ts) — 307 linhas; exports: —.
- [tests/modules/audit-actor-family.test.ts](sources/agents/tests/modules/audit-actor-family.test.ts) — 733 linhas; exports: —.
- [tests/modules/audit-agent-family.test.ts](sources/agents/tests/modules/audit-agent-family.test.ts) — 1755 linhas; exports: lockedBeforeSnapshot.
- [tests/modules/audit-channel-family.test.ts](sources/agents/tests/modules/audit-channel-family.test.ts) — 1755 linhas; exports: —.
- [tests/modules/audit-config-families.test.ts](sources/agents/tests/modules/audit-config-families.test.ts) — 1398 linhas; exports: mutableColumns, coveredColumns, selectedColumns, undisclosedNames.
- [tests/modules/audit-conversation-family.test.ts](sources/agents/tests/modules/audit-conversation-family.test.ts) — 877 linhas; exports: —.
- [tests/modules/audit-endpoint-redaction.test.ts](sources/agents/tests/modules/audit-endpoint-redaction.test.ts) — 81 linhas; exports: —.
- [tests/modules/audit-export.test.ts](sources/agents/tests/modules/audit-export.test.ts) — 788 linhas; exports: —.
- [tests/modules/audit-knowledge-family.test.ts](sources/agents/tests/modules/audit-knowledge-family.test.ts) — 719 linhas; exports: —.
- [tests/modules/audit-latest-at-plan.test.ts](sources/agents/tests/modules/audit-latest-at-plan.test.ts) — 358 linhas; exports: —.
- [tests/modules/audit-markers.test.ts](sources/agents/tests/modules/audit-markers.test.ts) — 46 linhas; exports: —.
- [tests/modules/audit-read.test.ts](sources/agents/tests/modules/audit-read.test.ts) — 439 linhas; exports: —.
- [tests/modules/audit-scope.test.ts](sources/agents/tests/modules/audit-scope.test.ts) — 236 linhas; exports: —.
- [tests/modules/audit-seam.test.ts](sources/agents/tests/modules/audit-seam.test.ts) — 300 linhas; exports: —.
- [tests/modules/audit-tenant-family.test.ts](sources/agents/tests/modules/audit-tenant-family.test.ts) — 313 linhas; exports: —.
- [tests/modules/audit-vault-family.test.ts](sources/agents/tests/modules/audit-vault-family.test.ts) — 438 linhas; exports: —.
- [tests/modules/audit-webhook-family.test.ts](sources/agents/tests/modules/audit-webhook-family.test.ts) — 946 linhas; exports: —.
- [tests/modules/availability-away-e2e.test.ts](sources/agents/tests/modules/availability-away-e2e.test.ts) — 813 linhas; exports: —.
- [tests/modules/availability-away.test.ts](sources/agents/tests/modules/availability-away.test.ts) — 281 linhas; exports: —.
- [tests/modules/behavior-settings.test.ts](sources/agents/tests/modules/behavior-settings.test.ts) — 323 linhas; exports: —.
- [tests/modules/billed-call-usage.test.ts](sources/agents/tests/modules/billed-call-usage.test.ts) — 860 linhas; exports: —.
- [tests/modules/business-hours-exceptions.test.ts](sources/agents/tests/modules/business-hours-exceptions.test.ts) — 552 linhas; exports: —.
- [tests/modules/business-hours.test.ts](sources/agents/tests/modules/business-hours.test.ts) — 419 linhas; exports: —.
- [tests/modules/calendar-slots.test.ts](sources/agents/tests/modules/calendar-slots.test.ts) — 536 linhas; exports: —.
- [tests/modules/calendar-write-honors-availability.test.ts](sources/agents/tests/modules/calendar-write-honors-availability.test.ts) — 670 linhas; exports: —.
- [tests/modules/channel-redirect-closing-origin.test.ts](sources/agents/tests/modules/channel-redirect-closing-origin.test.ts) — 793 linhas; exports: —.
- [tests/modules/channel-redirect-cross-link.test.ts](sources/agents/tests/modules/channel-redirect-cross-link.test.ts) — 444 linhas; exports: —.
- [tests/modules/channel-redirect-episode.test.ts](sources/agents/tests/modules/channel-redirect-episode.test.ts) — 532 linhas; exports: —.
- [tests/modules/channel-redirect-followup.test.ts](sources/agents/tests/modules/channel-redirect-followup.test.ts) — 2228 linhas; exports: —.
- [tests/modules/channel-redirect-gate.test.ts](sources/agents/tests/modules/channel-redirect-gate.test.ts) — 779 linhas; exports: —.
- [tests/modules/channel-redirect-update-event.test.ts](sources/agents/tests/modules/channel-redirect-update-event.test.ts) — 476 linhas; exports: —.
- [tests/modules/channel-redirect.test.ts](sources/agents/tests/modules/channel-redirect.test.ts) — 225 linhas; exports: —.
- [tests/modules/chatwoot-account-uniqueness.test.ts](sources/agents/tests/modules/chatwoot-account-uniqueness.test.ts) — 168 linhas; exports: —.
- [tests/modules/chatwoot-accounts-bounded.test.ts](sources/agents/tests/modules/chatwoot-accounts-bounded.test.ts) — 183 linhas; exports: —.
- [tests/modules/chatwoot-annotations.test.ts](sources/agents/tests/modules/chatwoot-annotations.test.ts) — 185 linhas; exports: —.
- [tests/modules/chatwoot-attribute-writes.test.ts](sources/agents/tests/modules/chatwoot-attribute-writes.test.ts) — 155 linhas; exports: —.
- [tests/modules/chatwoot-attributes.test.ts](sources/agents/tests/modules/chatwoot-attributes.test.ts) — 270 linhas; exports: —.
- [tests/modules/chatwoot-bind-agent-race.test.ts](sources/agents/tests/modules/chatwoot-bind-agent-race.test.ts) — 389 linhas; exports: deleteAgent.
- [tests/modules/chatwoot-client.test.ts](sources/agents/tests/modules/chatwoot-client.test.ts) — 796 linhas; exports: —.
- [tests/modules/chatwoot-command-active-e2e.test.ts](sources/agents/tests/modules/chatwoot-command-active-e2e.test.ts) — 488 linhas; exports: —.
- [tests/modules/chatwoot-command-dropped.test.ts](sources/agents/tests/modules/chatwoot-command-dropped.test.ts) — 406 linhas; exports: —.
- [tests/modules/chatwoot-command-route.test.ts](sources/agents/tests/modules/chatwoot-command-route.test.ts) — 46 linhas; exports: —.
- [tests/modules/chatwoot-first-response-sla.test.ts](sources/agents/tests/modules/chatwoot-first-response-sla.test.ts) — 446 linhas; exports: —.
- [tests/modules/chatwoot-gate-trail.test.ts](sources/agents/tests/modules/chatwoot-gate-trail.test.ts) — 351 linhas; exports: —.
- [tests/modules/chatwoot-human-reply-takeover.test.ts](sources/agents/tests/modules/chatwoot-human-reply-takeover.test.ts) — 1875 linhas; exports: —.
- [tests/modules/chatwoot-inbox-remove.test.ts](sources/agents/tests/modules/chatwoot-inbox-remove.test.ts) — 393 linhas; exports: —.
- [tests/modules/chatwoot-kanban.test.ts](sources/agents/tests/modules/chatwoot-kanban.test.ts) — 139 linhas; exports: —.
- [tests/modules/chatwoot-messages.test.ts](sources/agents/tests/modules/chatwoot-messages.test.ts) — 226 linhas; exports: —.
- [tests/modules/chatwoot-mirror-contact-race.test.ts](sources/agents/tests/modules/chatwoot-mirror-contact-race.test.ts) — 193 linhas; exports: —.
- [tests/modules/chatwoot-mirror-handoff.test.ts](sources/agents/tests/modules/chatwoot-mirror-handoff.test.ts) — 1890 linhas; exports: —.
- [tests/modules/chatwoot-mirror-redirect-origin.test.ts](sources/agents/tests/modules/chatwoot-mirror-redirect-origin.test.ts) — 733 linhas; exports: —.
- [tests/modules/chatwoot-monitoring-seam.test.ts](sources/agents/tests/modules/chatwoot-monitoring-seam.test.ts) — 2212 linhas; exports: —.
- [tests/modules/chatwoot-observe-inbox.test.ts](sources/agents/tests/modules/chatwoot-observe-inbox.test.ts) — 2681 linhas; exports: —.
- [tests/modules/chatwoot-observer-route.test.ts](sources/agents/tests/modules/chatwoot-observer-route.test.ts) — 2746 linhas; exports: —.
- [tests/modules/chatwoot-out-of-office.test.ts](sources/agents/tests/modules/chatwoot-out-of-office.test.ts) — 596 linhas; exports: —.
- [tests/modules/chatwoot-payload-shape.test.ts](sources/agents/tests/modules/chatwoot-payload-shape.test.ts) — 343 linhas; exports: —.
- [tests/modules/chatwoot-receiver.test.ts](sources/agents/tests/modules/chatwoot-receiver.test.ts) — 1984 linhas; exports: —.
- [tests/modules/chatwoot-reconcile.test.ts](sources/agents/tests/modules/chatwoot-reconcile.test.ts) — 547 linhas; exports: —.
- [tests/modules/chatwoot-recover-delivery.test.ts](sources/agents/tests/modules/chatwoot-recover-delivery.test.ts) — 4796 linhas; exports: —.
- [tests/modules/chatwoot-recover-payload.test.ts](sources/agents/tests/modules/chatwoot-recover-payload.test.ts) — 289 linhas; exports: —.
- [tests/modules/chatwoot-recover-takeover.test.ts](sources/agents/tests/modules/chatwoot-recover-takeover.test.ts) — 1093 linhas; exports: —.
- [tests/modules/chatwoot-render.test.ts](sources/agents/tests/modules/chatwoot-render.test.ts) — 232 linhas; exports: —.
- [tests/modules/chatwoot-reset-stale-turn.test.ts](sources/agents/tests/modules/chatwoot-reset-stale-turn.test.ts) — 925 linhas; exports: —.
- [tests/modules/chatwoot-reset.test.ts](sources/agents/tests/modules/chatwoot-reset.test.ts) — 3205 linhas; exports: —.
- [tests/modules/chatwoot-route-token-cache.test.ts](sources/agents/tests/modules/chatwoot-route-token-cache.test.ts) — 297 linhas; exports: —.
- [tests/modules/chatwoot-route-token-invalidation.test.ts](sources/agents/tests/modules/chatwoot-route-token-invalidation.test.ts) — 177 linhas; exports: —.
- [tests/modules/chatwoot-state-order.test.ts](sources/agents/tests/modules/chatwoot-state-order.test.ts) — 639 linhas; exports: —.
- [tests/modules/chatwoot-status-claim.test.ts](sources/agents/tests/modules/chatwoot-status-claim.test.ts) — 108 linhas; exports: —.
- [tests/modules/chatwoot-unbind-orphan.test.ts](sources/agents/tests/modules/chatwoot-unbind-orphan.test.ts) — 307 linhas; exports: —.
- [tests/modules/chatwoot-unbound-inbox.test.ts](sources/agents/tests/modules/chatwoot-unbound-inbox.test.ts) — 268 linhas; exports: —.
- [tests/modules/chatwoot-vocab.test.ts](sources/agents/tests/modules/chatwoot-vocab.test.ts) — 81 linhas; exports: —.
- [tests/modules/chatwoot-webhook.test.ts](sources/agents/tests/modules/chatwoot-webhook.test.ts) — 1009 linhas; exports: —.
- [tests/modules/claimed-job-fixture-ids.test.ts](sources/agents/tests/modules/claimed-job-fixture-ids.test.ts) — 519 linhas; exports: fixtureIdHits, testFiles, offendingFixtures.
- [tests/modules/code-body-secret-scan.test.ts](sources/agents/tests/modules/code-body-secret-scan.test.ts) — 73 linhas; exports: —.
- [tests/modules/code-tool-test-run.test.ts](sources/agents/tests/modules/code-tool-test-run.test.ts) — 109 linhas; exports: —.
- [tests/modules/code-tools.test.ts](sources/agents/tests/modules/code-tools.test.ts) — 654 linhas; exports: —.
- [tests/modules/compaction-worker.test.ts](sources/agents/tests/modules/compaction-worker.test.ts) — 227 linhas; exports: —.
- [tests/modules/config-health-message.test.ts](sources/agents/tests/modules/config-health-message.test.ts) — 157 linhas; exports: —.
- [tests/modules/config-health-read.test.ts](sources/agents/tests/modules/config-health-read.test.ts) — 925 linhas; exports: —.
- [tests/modules/config-health-severity.test.ts](sources/agents/tests/modules/config-health-severity.test.ts) — 75 linhas; exports: ConfigIssueKey.
- [tests/modules/config-health.test.ts](sources/agents/tests/modules/config-health.test.ts) — 1870 linhas; exports: —.
- [tests/modules/config-issue-i18n.test.ts](sources/agents/tests/modules/config-issue-i18n.test.ts) — 161 linhas; exports: ConfigIssueKey.
- [tests/modules/console-write-order.test.ts](sources/agents/tests/modules/console-write-order.test.ts) — 177 linhas; exports: —.
- [tests/modules/contact-auth-budget.test.ts](sources/agents/tests/modules/contact-auth-budget.test.ts) — 154 linhas; exports: —.
- [tests/modules/contact-auth-check.test.ts](sources/agents/tests/modules/contact-auth-check.test.ts) — 518 linhas; exports: —.
- [tests/modules/contact-auth-context.test.ts](sources/agents/tests/modules/contact-auth-context.test.ts) — 229 linhas; exports: —.
- [tests/modules/contact-auth-gate-e2e.test.ts](sources/agents/tests/modules/contact-auth-gate-e2e.test.ts) — 996 linhas; exports: —.
- [tests/modules/contact-auth-grant.test.ts](sources/agents/tests/modules/contact-auth-grant.test.ts) — 1222 linhas; exports: —.
- [tests/modules/contact-auth-mirror-identity.test.ts](sources/agents/tests/modules/contact-auth-mirror-identity.test.ts) — 376 linhas; exports: —.
- [tests/modules/contact-auth-nudge.test.ts](sources/agents/tests/modules/contact-auth-nudge.test.ts) — 576 linhas; exports: —.
- [tests/modules/contact-auth-settings.test.ts](sources/agents/tests/modules/contact-auth-settings.test.ts) — 414 linhas; exports: —.
- [tests/modules/contact-auth-state.test.ts](sources/agents/tests/modules/contact-auth-state.test.ts) — 219 linhas; exports: —.
- [tests/modules/conversation-followup-estimate.test.ts](sources/agents/tests/modules/conversation-followup-estimate.test.ts) — 1316 linhas; exports: —.
- [tests/modules/conversation-resolution-clear.test.ts](sources/agents/tests/modules/conversation-resolution-clear.test.ts) — 725 linhas; exports: —.
- [tests/modules/conversation-resolution-origin.test.ts](sources/agents/tests/modules/conversation-resolution-origin.test.ts) — 436 linhas; exports: —.
- [tests/modules/conversations.test.ts](sources/agents/tests/modules/conversations.test.ts) — 212 linhas; exports: —.
- [tests/modules/credential-reader-fence.test.ts](sources/agents/tests/modules/credential-reader-fence.test.ts) — 123 linhas; exports: x, y.
- [tests/modules/credential-ref-redaction.test.ts](sources/agents/tests/modules/credential-ref-redaction.test.ts) — 636 linhas; exports: refColumnsInSchema, guardedProjections.
- [tests/modules/credential-shape.test.ts](sources/agents/tests/modules/credential-shape.test.ts) — 589 linhas; exports: —.
- [tests/modules/debounce-monitoring-flush.test.ts](sources/agents/tests/modules/debounce-monitoring-flush.test.ts) — 1670 linhas; exports: —.
- [tests/modules/debounce-parallelism.test.ts](sources/agents/tests/modules/debounce-parallelism.test.ts) — 315 linhas; exports: —.
- [tests/modules/debounce-settings.test.ts](sources/agents/tests/modules/debounce-settings.test.ts) — 59 linhas; exports: —.
- [tests/modules/debounce-worker.test.ts](sources/agents/tests/modules/debounce-worker.test.ts) — 72 linhas; exports: —.
- [tests/modules/debounce.test.ts](sources/agents/tests/modules/debounce.test.ts) — 4636 linhas; exports: —.
- [tests/modules/delivery-sweep.test.ts](sources/agents/tests/modules/delivery-sweep.test.ts) — 3069 linhas; exports: processChatwootDelivery, retireCoveredDeliveries, retireCoveredDeliveries.
- [tests/modules/document-blocks.test.ts](sources/agents/tests/modules/document-blocks.test.ts) — 1271 linhas; exports: —.
- [tests/modules/document-deliverable.test.ts](sources/agents/tests/modules/document-deliverable.test.ts) — 41 linhas; exports: —.
- [tests/modules/document-draws.test.ts](sources/agents/tests/modules/document-draws.test.ts) — 233 linhas; exports: —.
- [tests/modules/document-error-reason.test.ts](sources/agents/tests/modules/document-error-reason.test.ts) — 54 linhas; exports: —.
- [tests/modules/document-logo.test.ts](sources/agents/tests/modules/document-logo.test.ts) — 288 linhas; exports: —.
- [tests/modules/document-markdown.test.ts](sources/agents/tests/modules/document-markdown.test.ts) — 133 linhas; exports: —.
- [tests/modules/document-printable.test.ts](sources/agents/tests/modules/document-printable.test.ts) — 107 linhas; exports: —.
- [tests/modules/document-render.test.ts](sources/agents/tests/modules/document-render.test.ts) — 270 linhas; exports: —.
- [tests/modules/document-slug.test.ts](sources/agents/tests/modules/document-slug.test.ts) — 47 linhas; exports: —.
- [tests/modules/document-tokens.test.ts](sources/agents/tests/modules/document-tokens.test.ts) — 173 linhas; exports: —.
- [tests/modules/document-tool-name-single-source.test.ts](sources/agents/tests/modules/document-tool-name-single-source.test.ts) — 58 linhas; exports: —.
- [tests/modules/document-totals.test.ts](sources/agents/tests/modules/document-totals.test.ts) — 295 linhas; exports: —.
- [tests/modules/document-unprintable-surfaces.test.ts](sources/agents/tests/modules/document-unprintable-surfaces.test.ts) — 229 linhas; exports: —.
- [tests/modules/documents.test.ts](sources/agents/tests/modules/documents.test.ts) — 2665 linhas; exports: —.
- [tests/modules/eager-media-flow-context.test.ts](sources/agents/tests/modules/eager-media-flow-context.test.ts) — 875 linhas; exports: —.
- [tests/modules/experiments.test.ts](sources/agents/tests/modules/experiments.test.ts) — 346 linhas; exports: —.
- [tests/modules/failure-note.test.ts](sources/agents/tests/modules/failure-note.test.ts) — 754 linhas; exports: —.
- [tests/modules/flowlog-astral-detail.test.ts](sources/agents/tests/modules/flowlog-astral-detail.test.ts) — 191 linhas; exports: —.
- [tests/modules/flowlog-debug-mode-e2e.test.ts](sources/agents/tests/modules/flowlog-debug-mode-e2e.test.ts) — 309 linhas; exports: —.
- [tests/modules/flowlog-debug-mode.test.ts](sources/agents/tests/modules/flowlog-debug-mode.test.ts) — 1188 linhas; exports: assertSettingsDebugWindow.
- [tests/modules/flowlog-detail-pii.test.ts](sources/agents/tests/modules/flowlog-detail-pii.test.ts) — 635 linhas; exports: —.
- [tests/modules/flowlog-export.test.ts](sources/agents/tests/modules/flowlog-export.test.ts) — 222 linhas; exports: —.
- [tests/modules/flowlog-reader-scope.test.ts](sources/agents/tests/modules/flowlog-reader-scope.test.ts) — 581 linhas; exports: flowlogReaders, isScoped, rawReadLines, rawClearLines.
- [tests/modules/flowlog-retention.test.ts](sources/agents/tests/modules/flowlog-retention.test.ts) — 106 linhas; exports: —.
- [tests/modules/flowlog-settle.test.ts](sources/agents/tests/modules/flowlog-settle.test.ts) — 239 linhas; exports: —.
- [tests/modules/flowlog-shape.test.ts](sources/agents/tests/modules/flowlog-shape.test.ts) — 162 linhas; exports: —.
- [tests/modules/flowlog-stage-labels.test.ts](sources/agents/tests/modules/flowlog-stage-labels.test.ts) — 78 linhas; exports: labelledCases, flowStageLabel, flowLevelLabel.
- [tests/modules/flowlog-worker.test.ts](sources/agents/tests/modules/flowlog-worker.test.ts) — 575 linhas; exports: —.
- [tests/modules/flowlog.test.ts](sources/agents/tests/modules/flowlog.test.ts) — 295 linhas; exports: —.
- [tests/modules/followup-appointment-pause.test.ts](sources/agents/tests/modules/followup-appointment-pause.test.ts) — 112 linhas; exports: —.
- [tests/modules/followup-armed-backfill.test.ts](sources/agents/tests/modules/followup-armed-backfill.test.ts) — 127 linhas; exports: —.
- [tests/modules/followup-eligibility.test.ts](sources/agents/tests/modules/followup-eligibility.test.ts) — 156 linhas; exports: —.
- [tests/modules/followup-handler.test.ts](sources/agents/tests/modules/followup-handler.test.ts) — 1843 linhas; exports: —.
- [tests/modules/followup-resolved-guardrails.test.ts](sources/agents/tests/modules/followup-resolved-guardrails.test.ts) — 1157 linhas; exports: —.
- [tests/modules/followup-settings.test.ts](sources/agents/tests/modules/followup-settings.test.ts) — 252 linhas; exports: —.
- [tests/modules/gate-close.test.ts](sources/agents/tests/modules/gate-close.test.ts) — 124 linhas; exports: —.
- [tests/modules/grant-target-vanishes.test.ts](sources/agents/tests/modules/grant-target-vanishes.test.ts) — 324 linhas; exports: —.
- [tests/modules/guardrail-constrained.test.ts](sources/agents/tests/modules/guardrail-constrained.test.ts) — 350 linhas; exports: —.
- [tests/modules/guardrail-health.test.ts](sources/agents/tests/modules/guardrail-health.test.ts) — 521 linhas; exports: —.
- [tests/modules/guardrail-log-categories.test.ts](sources/agents/tests/modules/guardrail-log-categories.test.ts) — 72 linhas; exports: —.
- [tests/modules/guardrail-verdict.test.ts](sources/agents/tests/modules/guardrail-verdict.test.ts) — 236 linhas; exports: —.
- [tests/modules/guardrails.test.ts](sources/agents/tests/modules/guardrails.test.ts) — 1333 linhas; exports: —.
- [tests/modules/handoff-targets.test.ts](sources/agents/tests/modules/handoff-targets.test.ts) — 121 linhas; exports: —.
- [tests/modules/human-agent-ingest.test.ts](sources/agents/tests/modules/human-agent-ingest.test.ts) — 355 linhas; exports: —.
- [tests/modules/inbound-receptor.test.ts](sources/agents/tests/modules/inbound-receptor.test.ts) — 1489 linhas; exports: —.
- [tests/modules/integration-route-token.test.ts](sources/agents/tests/modules/integration-route-token.test.ts) — 340 linhas; exports: —.
- [tests/modules/integrations-google-calendar-service.test.ts](sources/agents/tests/modules/integrations-google-calendar-service.test.ts) — 108 linhas; exports: —.
- [tests/modules/integrations-google-drive-service.test.ts](sources/agents/tests/modules/integrations-google-drive-service.test.ts) — 119 linhas; exports: —.
- [tests/modules/integrations-mappers.test.ts](sources/agents/tests/modules/integrations-mappers.test.ts) — 163 linhas; exports: —.
- [tests/modules/langfuse-costs.test.ts](sources/agents/tests/modules/langfuse-costs.test.ts) — 244 linhas; exports: —.
- [tests/modules/langfuse.test.ts](sources/agents/tests/modules/langfuse.test.ts) — 110 linhas; exports: —.
- [tests/modules/last-admin-invariant.test.ts](sources/agents/tests/modules/last-admin-invariant.test.ts) — 293 linhas; exports: —.
- [tests/modules/late-media-ingest.test.ts](sources/agents/tests/modules/late-media-ingest.test.ts) — 935 linhas; exports: processChatwootDelivery.
- [tests/modules/lock-order.test.ts](sources/agents/tests/modules/lock-order.test.ts) — 68 linhas; exports: —.
- [tests/modules/mcp-admin.test.ts](sources/agents/tests/modules/mcp-admin.test.ts) — 344 linhas; exports: —.
- [tests/modules/mcp-audit-scope.test.ts](sources/agents/tests/modules/mcp-audit-scope.test.ts) — 378 linhas; exports: —.
- [tests/modules/mcp-console-links.test.ts](sources/agents/tests/modules/mcp-console-links.test.ts) — 66 linhas; exports: —.
- [tests/modules/mcp-dcr.test.ts](sources/agents/tests/modules/mcp-dcr.test.ts) — 45 linhas; exports: —.
- [tests/modules/mcp-discover-args.test.ts](sources/agents/tests/modules/mcp-discover-args.test.ts) — 65 linhas; exports: —.
- [tests/modules/mcp-logs-schema.test.ts](sources/agents/tests/modules/mcp-logs-schema.test.ts) — 52 linhas; exports: —.
- [tests/modules/mcp-me-connections.test.ts](sources/agents/tests/modules/mcp-me-connections.test.ts) — 196 linhas; exports: —.
- [tests/modules/mcp-oauth-consent.test.ts](sources/agents/tests/modules/mcp-oauth-consent.test.ts) — 252 linhas; exports: —.
- [tests/modules/mcp-oauth-grant.test.ts](sources/agents/tests/modules/mcp-oauth-grant.test.ts) — 184 linhas; exports: —.
- [tests/modules/mcp-oauth-tokens.test.ts](sources/agents/tests/modules/mcp-oauth-tokens.test.ts) — 202 linhas; exports: —.
- [tests/modules/mcp-playground-attachment.test.ts](sources/agents/tests/modules/mcp-playground-attachment.test.ts) — 86 linhas; exports: —.
- [tests/modules/mcp-playground-guardrails.test.ts](sources/agents/tests/modules/mcp-playground-guardrails.test.ts) — 52 linhas; exports: —.
- [tests/modules/mcp-read.test.ts](sources/agents/tests/modules/mcp-read.test.ts) — 440 linhas; exports: —.
- [tests/modules/mcp-settings-new-blocks.test.ts](sources/agents/tests/modules/mcp-settings-new-blocks.test.ts) — 598 linhas; exports: —.
- [tests/modules/mcp-settings-schema.test.ts](sources/agents/tests/modules/mcp-settings-schema.test.ts) — 570 linhas; exports: —.
- [tests/modules/mcp-settings-tool-maps.test.ts](sources/agents/tests/modules/mcp-settings-tool-maps.test.ts) — 159 linhas; exports: —.
- [tests/modules/mcp-tenant-target.test.ts](sources/agents/tests/modules/mcp-tenant-target.test.ts) — 209 linhas; exports: —.
- [tests/modules/mcp-tool-descriptions.test.ts](sources/agents/tests/modules/mcp-tool-descriptions.test.ts) — 596 linhas; exports: —.
- [tests/modules/mcp-webhook-deliveries.test.ts](sources/agents/tests/modules/mcp-webhook-deliveries.test.ts) — 286 linhas; exports: —.
- [tests/modules/mcp-write-agents.test.ts](sources/agents/tests/modules/mcp-write-agents.test.ts) — 609 linhas; exports: —.
- [tests/modules/mcp-write-channels.test.ts](sources/agents/tests/modules/mcp-write-channels.test.ts) — 726 linhas; exports: —.
- [tests/modules/mcp-write-code-tools.test.ts](sources/agents/tests/modules/mcp-write-code-tools.test.ts) — 499 linhas; exports: —.
- [tests/modules/mcp-write-conversations.test.ts](sources/agents/tests/modules/mcp-write-conversations.test.ts) — 171 linhas; exports: —.
- [tests/modules/mcp-write-documents.test.ts](sources/agents/tests/modules/mcp-write-documents.test.ts) — 581 linhas; exports: —.
- [tests/modules/mcp-write-fleet.test.ts](sources/agents/tests/modules/mcp-write-fleet.test.ts) — 154 linhas; exports: —.
- [tests/modules/mcp-write-resources.test.ts](sources/agents/tests/modules/mcp-write-resources.test.ts) — 370 linhas; exports: —.
- [tests/modules/mcp-write-webhooks.test.ts](sources/agents/tests/modules/mcp-write-webhooks.test.ts) — 317 linhas; exports: —.
- [tests/modules/mcp-write.test.ts](sources/agents/tests/modules/mcp-write.test.ts) — 1114 linhas; exports: —.
- [tests/modules/mcp/dry-run-coherence.test.ts](sources/agents/tests/modules/mcp/dry-run-coherence.test.ts) — 2491 linhas; exports: —.
- [tests/modules/mcp/write-passes-its-client.test.ts](sources/agents/tests/modules/mcp/write-passes-its-client.test.ts) — 176 linhas; exports: —.
- [tests/modules/memory-compaction-arm.test.ts](sources/agents/tests/modules/memory-compaction-arm.test.ts) — 741 linhas; exports: —.
- [tests/modules/memory-compaction.test.ts](sources/agents/tests/modules/memory-compaction.test.ts) — 2300 linhas; exports: —.
- [tests/modules/memory-cut.test.ts](sources/agents/tests/modules/memory-cut.test.ts) — 349 linhas; exports: —.
- [tests/modules/memory-dead-letter.test.ts](sources/agents/tests/modules/memory-dead-letter.test.ts) — 635 linhas; exports: —.
- [tests/modules/memory-reset.test.ts](sources/agents/tests/modules/memory-reset.test.ts) — 60 linhas; exports: —.
- [tests/modules/memory-settings.test.ts](sources/agents/tests/modules/memory-settings.test.ts) — 134 linhas; exports: —.
- [tests/modules/memory-summarize.test.ts](sources/agents/tests/modules/memory-summarize.test.ts) — 422 linhas; exports: —.
- [tests/modules/model-fallback-turn.test.ts](sources/agents/tests/modules/model-fallback-turn.test.ts) — 412 linhas; exports: —.
- [tests/modules/models.test.ts](sources/agents/tests/modules/models.test.ts) — 351 linhas; exports: —.
- [tests/modules/n8n-export.test.ts](sources/agents/tests/modules/n8n-export.test.ts) — 172 linhas; exports: —.
- [tests/modules/namespace-resolve.test.ts](sources/agents/tests/modules/namespace-resolve.test.ts) — 51 linhas; exports: —.
- [tests/modules/observe-apply.test.ts](sources/agents/tests/modules/observe-apply.test.ts) — 668 linhas; exports: —.
- [tests/modules/observe-job.test.ts](sources/agents/tests/modules/observe-job.test.ts) — 3053 linhas; exports: —.
- [tests/modules/observer-delete-lock-order.test.ts](sources/agents/tests/modules/observer-delete-lock-order.test.ts) — 47 linhas; exports: —.
- [tests/modules/playground-capabilities.test.ts](sources/agents/tests/modules/playground-capabilities.test.ts) — 126 linhas; exports: —.
- [tests/modules/playground-guardrails.test.ts](sources/agents/tests/modules/playground-guardrails.test.ts) — 958 linhas; exports: —.
- [tests/modules/playground-sessions.test.ts](sources/agents/tests/modules/playground-sessions.test.ts) — 444 linhas; exports: —.
- [tests/modules/playground-tenant-selector.test.ts](sources/agents/tests/modules/playground-tenant-selector.test.ts) — 363 linhas; exports: buildsATenantContext.
- [tests/modules/playground-tools.test.ts](sources/agents/tests/modules/playground-tools.test.ts) — 286 linhas; exports: —.
- [tests/modules/playground.test.ts](sources/agents/tests/modules/playground.test.ts) — 794 linhas; exports: —.
- [tests/modules/pools.test.ts](sources/agents/tests/modules/pools.test.ts) — 339 linhas; exports: —.
- [tests/modules/provider-defaults.test.ts](sources/agents/tests/modules/provider-defaults.test.ts) — 51 linhas; exports: —.
- [tests/modules/rag-approval-review.test.ts](sources/agents/tests/modules/rag-approval-review.test.ts) — 241 linhas; exports: —.
- [tests/modules/rag-chunk.test.ts](sources/agents/tests/modules/rag-chunk.test.ts) — 19 linhas; exports: —.
- [tests/modules/rag-chunking-bounds.test.ts](sources/agents/tests/modules/rag-chunking-bounds.test.ts) — 256 linhas; exports: —.
- [tests/modules/rag-document-storable.test.ts](sources/agents/tests/modules/rag-document-storable.test.ts) — 390 linhas; exports: —.
- [tests/modules/rag-documents.test.ts](sources/agents/tests/modules/rag-documents.test.ts) — 443 linhas; exports: —.
- [tests/modules/rag-embeddings-failure.test.ts](sources/agents/tests/modules/rag-embeddings-failure.test.ts) — 121 linhas; exports: —.
- [tests/modules/rag-embeddings.test.ts](sources/agents/tests/modules/rag-embeddings.test.ts) — 486 linhas; exports: —.
- [tests/modules/rag-ingest-block.test.ts](sources/agents/tests/modules/rag-ingest-block.test.ts) — 376 linhas; exports: —.
- [tests/modules/rag-ingest-stale-publish.test.ts](sources/agents/tests/modules/rag-ingest-stale-publish.test.ts) — 433 linhas; exports: —.
- [tests/modules/rag-loaders.test.ts](sources/agents/tests/modules/rag-loaders.test.ts) — 108 linhas; exports: —.
- [tests/modules/rag-sql.test.ts](sources/agents/tests/modules/rag-sql.test.ts) — 166 linhas; exports: —.
- [tests/modules/rag-thread-origin.test.ts](sources/agents/tests/modules/rag-thread-origin.test.ts) — 58 linhas; exports: —.
- [tests/modules/reengage.test.ts](sources/agents/tests/modules/reengage.test.ts) — 1268 linhas; exports: —.
- [tests/modules/schedule-malformed-entry.test.ts](sources/agents/tests/modules/schedule-malformed-entry.test.ts) — 144 linhas; exports: —.
- [tests/modules/scheduler-claim-token.test.ts](sources/agents/tests/modules/scheduler-claim-token.test.ts) — 273 linhas; exports: —.
- [tests/modules/scheduler-lanes.test.ts](sources/agents/tests/modules/scheduler-lanes.test.ts) — 638 linhas; exports: —.
- [tests/modules/scheduler-row-writers.test.ts](sources/agents/tests/modules/scheduler-row-writers.test.ts) — 85 linhas; exports: createsASchedulerRow.
- [tests/modules/scheduler-tenant-fence.test.ts](sources/agents/tests/modules/scheduler-tenant-fence.test.ts) — 148 linhas; exports: —.
- [tests/modules/scheduler.test.ts](sources/agents/tests/modules/scheduler.test.ts) — 1075 linhas; exports: —.
- [tests/modules/secret-test.test.ts](sources/agents/tests/modules/secret-test.test.ts) — 228 linhas; exports: —.
- [tests/modules/secret-type-fit.test.ts](sources/agents/tests/modules/secret-type-fit.test.ts) — 157 linhas; exports: —.
- [tests/modules/secret-types-mirror.test.ts](sources/agents/tests/modules/secret-types-mirror.test.ts) — 91 linhas; exports: —.
- [tests/modules/secret-types.test.ts](sources/agents/tests/modules/secret-types.test.ts) — 90 linhas; exports: —.
- [tests/modules/send-image.test.ts](sources/agents/tests/modules/send-image.test.ts) — 678 linhas; exports: —.
- [tests/modules/service-count-range.test.ts](sources/agents/tests/modules/service-count-range.test.ts) — 96 linhas; exports: —.
- [tests/modules/service-window.test.ts](sources/agents/tests/modules/service-window.test.ts) — 118 linhas; exports: —.
- [tests/modules/spend-ceiling-coverage.test.ts](sources/agents/tests/modules/spend-ceiling-coverage.test.ts) — 41 linhas; exports: —.
- [tests/modules/spend-ceiling-decide.test.ts](sources/agents/tests/modules/spend-ceiling-decide.test.ts) — 696 linhas; exports: —.
- [tests/modules/spend-ceiling-gate-e2e.test.ts](sources/agents/tests/modules/spend-ceiling-gate-e2e.test.ts) — 875 linhas; exports: —.
- [tests/modules/spend-ceiling-paths-e2e.test.ts](sources/agents/tests/modules/spend-ceiling-paths-e2e.test.ts) — 557 linhas; exports: —.
- [tests/modules/spend-ceiling-poll.test.ts](sources/agents/tests/modules/spend-ceiling-poll.test.ts) — 1520 linhas; exports: —.
- [tests/modules/spend-ceiling-service.test.ts](sources/agents/tests/modules/spend-ceiling-service.test.ts) — 757 linhas; exports: —.
- [tests/modules/split.test.ts](sources/agents/tests/modules/split.test.ts) — 1571 linhas; exports: —.
- [tests/modules/stranded-delivery.test.ts](sources/agents/tests/modules/stranded-delivery.test.ts) — 421 linhas; exports: —.
- [tests/modules/stt-baseurl.test.ts](sources/agents/tests/modules/stt-baseurl.test.ts) — 184 linhas; exports: —.
- [tests/modules/stt-providers.test.ts](sources/agents/tests/modules/stt-providers.test.ts) — 156 linhas; exports: —.
- [tests/modules/stt-settings.test.ts](sources/agents/tests/modules/stt-settings.test.ts) — 51 linhas; exports: —.
- [tests/modules/stt.test.ts](sources/agents/tests/modules/stt.test.ts) — 353 linhas; exports: —.
- [tests/modules/superadmin-demote.test.ts](sources/agents/tests/modules/superadmin-demote.test.ts) — 371 linhas; exports: —.
- [tests/modules/template-offer.test.ts](sources/agents/tests/modules/template-offer.test.ts) — 228 linhas; exports: —.
- [tests/modules/template-scan.test.ts](sources/agents/tests/modules/template-scan.test.ts) — 111 linhas; exports: —.
- [tests/modules/tenant-selector-entry-points.test.ts](sources/agents/tests/modules/tenant-selector-entry-points.test.ts) — 621 linhas; exports: handsOutABareTenantId, passesTheContextOn, routeIdentity.
- [tests/modules/tenant-settings-langfuse.test.ts](sources/agents/tests/modules/tenant-settings-langfuse.test.ts) — 176 linhas; exports: —.
- [tests/modules/tenants.test.ts](sources/agents/tests/modules/tenants.test.ts) — 24 linhas; exports: —.
- [tests/modules/terminal-failure-announces.test.ts](sources/agents/tests/modules/terminal-failure-announces.test.ts) — 1035 linhas; exports: —.
- [tests/modules/terminal-failure-fence.test.ts](sources/agents/tests/modules/terminal-failure-fence.test.ts) — 231 linhas; exports: TerminalSite, terminalWriteSites.
- [tests/modules/test-mode.test.ts](sources/agents/tests/modules/test-mode.test.ts) — 42 linhas; exports: —.
- [tests/modules/tier3.test.ts](sources/agents/tests/modules/tier3.test.ts) — 2753 linhas; exports: —.
- [tests/modules/tool-appointment-declaration.test.ts](sources/agents/tests/modules/tool-appointment-declaration.test.ts) — 627 linhas; exports: —.
- [tests/modules/tool-body-shape.test.ts](sources/agents/tests/modules/tool-body-shape.test.ts) — 329 linhas; exports: —.
- [tests/modules/tool-credential-wiring.test.ts](sources/agents/tests/modules/tool-credential-wiring.test.ts) — 1869 linhas; exports: —.
- [tests/modules/tool-definition-body-shape-e2e.test.ts](sources/agents/tests/modules/tool-definition-body-shape-e2e.test.ts) — 289 linhas; exports: —.
- [tests/modules/tool-definitions-normalize.test.ts](sources/agents/tests/modules/tool-definitions-normalize.test.ts) — 339 linhas; exports: —.
- [tests/modules/tool-definitions-reserved-name.test.ts](sources/agents/tests/modules/tool-definitions-reserved-name.test.ts) — 168 linhas; exports: —.
- [tests/modules/tool-grant-refusal.test.ts](sources/agents/tests/modules/tool-grant-refusal.test.ts) — 211 linhas; exports: —.
- [tests/modules/tool-guidance.test.ts](sources/agents/tests/modules/tool-guidance.test.ts) — 43 linhas; exports: —.
- [tests/modules/tool-keyed-unwritable.test.ts](sources/agents/tests/modules/tool-keyed-unwritable.test.ts) — 74 linhas; exports: —.
- [tests/modules/tool-precondition-alerting.test.ts](sources/agents/tests/modules/tool-precondition-alerting.test.ts) — 146 linhas; exports: —.
- [tests/modules/tool-response-template.test.ts](sources/agents/tests/modules/tool-response-template.test.ts) — 742 linhas; exports: —.
- [tests/modules/tool-test-run.test.ts](sources/agents/tests/modules/tool-test-run.test.ts) — 935 linhas; exports: —.
- [tests/modules/toolpack-specs.test.ts](sources/agents/tests/modules/toolpack-specs.test.ts) — 60 linhas; exports: —.
- [tests/modules/toolpacks-asaas-payment-status.test.ts](sources/agents/tests/modules/toolpacks-asaas-payment-status.test.ts) — 208 linhas; exports: —.
- [tests/modules/toolpacks-asaas.test.ts](sources/agents/tests/modules/toolpacks-asaas.test.ts) — 709 linhas; exports: —.
- [tests/modules/toolpacks-google-calendar.test.ts](sources/agents/tests/modules/toolpacks-google-calendar.test.ts) — 1994 linhas; exports: —.
- [tests/modules/toolpacks-google-drive.test.ts](sources/agents/tests/modules/toolpacks-google-drive.test.ts) — 443 linhas; exports: —.
- [tests/modules/tts-baseurl.test.ts](sources/agents/tests/modules/tts-baseurl.test.ts) — 144 linhas; exports: —.
- [tests/modules/tts-format.test.ts](sources/agents/tests/modules/tts-format.test.ts) — 76 linhas; exports: —.
- [tests/modules/tts-normalize-model.test.ts](sources/agents/tests/modules/tts-normalize-model.test.ts) — 541 linhas; exports: —.
- [tests/modules/tts-normalize-observability.test.ts](sources/agents/tests/modules/tts-normalize-observability.test.ts) — 456 linhas; exports: —.
- [tests/modules/tts-normalize.test.ts](sources/agents/tests/modules/tts-normalize.test.ts) — 32 linhas; exports: —.
- [tests/modules/tts-providers.test.ts](sources/agents/tests/modules/tts-providers.test.ts) — 459 linhas; exports: —.
- [tests/modules/tts-settings.test.ts](sources/agents/tests/modules/tts-settings.test.ts) — 86 linhas; exports: —.
- [tests/modules/tts.test.ts](sources/agents/tests/modules/tts.test.ts) — 595 linhas; exports: —.
- [tests/modules/turn-had-the-words.test.ts](sources/agents/tests/modules/turn-had-the-words.test.ts) — 54 linhas; exports: —.
- [tests/modules/updates-semver.test.ts](sources/agents/tests/modules/updates-semver.test.ts) — 47 linhas; exports: —.
- [tests/modules/updates-service.test.ts](sources/agents/tests/modules/updates-service.test.ts) — 165 linhas; exports: —.
- [tests/modules/user-delete.test.ts](sources/agents/tests/modules/user-delete.test.ts) — 118 linhas; exports: —.
- [tests/modules/vault-audit.integration.test.ts](sources/agents/tests/modules/vault-audit.integration.test.ts) — 779 linhas; exports: —.
- [tests/modules/vault-google-revoke.test.ts](sources/agents/tests/modules/vault-google-revoke.test.ts) — 43 linhas; exports: —.
- [tests/modules/vault/base-url-applicability.test.ts](sources/agents/tests/modules/vault/base-url-applicability.test.ts) — 564 linhas; exports: —.
- [tests/modules/vault/dangling-ref.test.ts](sources/agents/tests/modules/vault/dangling-ref.test.ts) — 154 linhas; exports: —.
- [tests/modules/vault/google-oauth.test.ts](sources/agents/tests/modules/vault/google-oauth.test.ts) — 443 linhas; exports: —.
- [tests/modules/vault/mcp-oauth.test.ts](sources/agents/tests/modules/vault/mcp-oauth.test.ts) — 468 linhas; exports: —.
- [tests/modules/vault/oauth-core.test.ts](sources/agents/tests/modules/vault/oauth-core.test.ts) — 89 linhas; exports: —.
- [tests/modules/vault/param-name-applicability.test.ts](sources/agents/tests/modules/vault/param-name-applicability.test.ts) — 389 linhas; exports: —.
- [tests/modules/vault/pending.test.ts](sources/agents/tests/modules/vault/pending.test.ts) — 183 linhas; exports: —.
- [tests/modules/vault/ref-where.test.ts](sources/agents/tests/modules/vault/ref-where.test.ts) — 75 linhas; exports: —.
- [tests/modules/vault/ref-write-boundary.test.ts](sources/agents/tests/modules/vault/ref-write-boundary.test.ts) — 716 linhas; exports: —.
- [tests/modules/vault/references.test.ts](sources/agents/tests/modules/vault/references.test.ts) — 135 linhas; exports: —.
- [tests/modules/vault/value-whitespace.test.ts](sources/agents/tests/modules/vault/value-whitespace.test.ts) — 223 linhas; exports: —.
- [tests/modules/vision-document-support.test.ts](sources/agents/tests/modules/vision-document-support.test.ts) — 125 linhas; exports: —.
- [tests/modules/vision-openai-documents.test.ts](sources/agents/tests/modules/vision-openai-documents.test.ts) — 323 linhas; exports: —.
- [tests/modules/vision-retry.test.ts](sources/agents/tests/modules/vision-retry.test.ts) — 633 linhas; exports: —.
- [tests/modules/vision.test.ts](sources/agents/tests/modules/vision.test.ts) — 207 linhas; exports: —.
- [tests/modules/webhooks-outbound-dead-alert.test.ts](sources/agents/tests/modules/webhooks-outbound-dead-alert.test.ts) — 341 linhas; exports: —.
- [tests/modules/webhooks-outbound-deliveries.test.ts](sources/agents/tests/modules/webhooks-outbound-deliveries.test.ts) — 575 linhas; exports: —.
- [tests/modules/webhooks-outbound-events.test.ts](sources/agents/tests/modules/webhooks-outbound-events.test.ts) — 212 linhas; exports: —.
- [tests/modules/webhooks-outbound-heartbeat.test.ts](sources/agents/tests/modules/webhooks-outbound-heartbeat.test.ts) — 200 linhas; exports: —.
- [tests/modules/webhooks-outbound-worker.test.ts](sources/agents/tests/modules/webhooks-outbound-worker.test.ts) — 343 linhas; exports: —.
- [tests/modules/webhooks-outbound.test.ts](sources/agents/tests/modules/webhooks-outbound.test.ts) — 218 linhas; exports: —.
- [tests/modules/write-input-without-use.test.ts](sources/agents/tests/modules/write-input-without-use.test.ts) — 1585 linhas; exports: —.
- [tests/prisma/agent-thread-recent-message-ids-migration.test.ts](sources/agents/tests/prisma/agent-thread-recent-message-ids-migration.test.ts) — 220 linhas; exports: —.
- [tests/prisma/appointment-record-migration.test.ts](sources/agents/tests/prisma/appointment-record-migration.test.ts) — 231 linhas; exports: —.
- [tests/prisma/binding-generation-migration-atomicity.test.ts](sources/agents/tests/prisma/binding-generation-migration-atomicity.test.ts) — 198 linhas; exports: —.
- [tests/prisma/conversation-resolved-by-migration.test.ts](sources/agents/tests/prisma/conversation-resolved-by-migration.test.ts) — 165 linhas; exports: —.
- [tests/prisma/delivery-conversation-ref-migration.test.ts](sources/agents/tests/prisma/delivery-conversation-ref-migration.test.ts) — 190 linhas; exports: —.
- [tests/prisma/delivery-route-observed-migration.test.ts](sources/agents/tests/prisma/delivery-route-observed-migration.test.ts) — 70 linhas; exports: —.
- [tests/prisma/drop-inert-run-code-preconditions-migration.test.ts](sources/agents/tests/prisma/drop-inert-run-code-preconditions-migration.test.ts) — 291 linhas; exports: —.
- [tests/prisma/inbound-claimed-at-migration.test.ts](sources/agents/tests/prisma/inbound-claimed-at-migration.test.ts) — 81 linhas; exports: —.
- [tests/prisma/mcp-oauth-consent-action-rename-migration.test.ts](sources/agents/tests/prisma/mcp-oauth-consent-action-rename-migration.test.ts) — 267 linhas; exports: —.
- [tests/prisma/migration-rls-bypass.test.ts](sources/agents/tests/prisma/migration-rls-bypass.test.ts) — 392 linhas; exports: stripFunctionBodies, tablesWrittenBy, needsBypass, FLEET_ENTRY_RE, liftsWithoutRestoring, POLICY_SPLIT_MIGRATION, hasBypass, bracketedTables, tablesReadBy, unbracketedWrites, unbracketedReads.
- [tests/prisma/native-tool-name-rename-migration.test.ts](sources/agents/tests/prisma/native-tool-name-rename-migration.test.ts) — 386 linhas; exports: —.
- [tests/prisma/native-tool-names-renamed-by-migration.test.ts](sources/agents/tests/prisma/native-tool-names-renamed-by-migration.test.ts) — 22 linhas; exports: —.
- [tests/prisma/observer-attached-at-migration.test.ts](sources/agents/tests/prisma/observer-attached-at-migration.test.ts) — 141 linhas; exports: —.
- [tests/prisma/reply-sibling-index-migration.test.ts](sources/agents/tests/prisma/reply-sibling-index-migration.test.ts) — 116 linhas; exports: —.
- [tests/prisma/restore-run-code-name-migration.test.ts](sources/agents/tests/prisma/restore-run-code-name-migration.test.ts) — 237 linhas; exports: —.
- [tests/prisma/rls-policy-split-migration.test.ts](sources/agents/tests/prisma/rls-policy-split-migration.test.ts) — 211 linhas; exports: —.
- [tests/prisma/tenant-index-redundancy.test.ts](sources/agents/tests/prisma/tenant-index-redundancy.test.ts) — 227 linhas; exports: —.
- [tests/prisma/tts-normalize-default-migration.test.ts](sources/agents/tests/prisma/tts-normalize-default-migration.test.ts) — 217 linhas; exports: —.
- [tests/scripts/db-bootstrap-twins.test.ts](sources/agents/tests/scripts/db-bootstrap-twins.test.ts) — 352 linhas; exports: OUTLIVES_SET_ROLE, RLS_DEFEATING, OUTLIVES_SET_ROLE.
- [tests/scripts/db-bootstrap.test.ts](sources/agents/tests/scripts/db-bootstrap.test.ts) — 2352 linhas; exports: —.
- [tests/scripts/gen-onboarding-env.test.ts](sources/agents/tests/scripts/gen-onboarding-env.test.ts) — 78 linhas; exports: —.
- [tests/scripts/i18n-extract.test.ts](sources/agents/tests/scripts/i18n-extract.test.ts) — 83 linhas; exports: X, X.
- [tests/scripts/set-admin.test.ts](sources/agents/tests/scripts/set-admin.test.ts) — 74 linhas; exports: —.
- [tests/setup.ts](sources/agents/tests/setup.ts) — 214 linhas; exports: —.
- [tests/types.d.ts](sources/agents/tests/types.d.ts) — 7 linhas; exports: —.
- [tests/utils/agent-config.ts](sources/agents/tests/utils/agent-config.ts) — 94 linhas; exports: makeConfig.
- [tests/utils/audit-action.ts](sources/agents/tests/utils/audit-action.ts) — 17 linhas; exports: syntheticAction.
- [tests/utils/chatwoot-attribute-store.ts](sources/agents/tests/utils/chatwoot-attribute-store.ts) — 95 linhas; exports: FakeChatwootRequest, FakeChatwootAttributeStore, fakeChatwootAttributeStore.
- [tests/utils/chatwoot.ts](sources/agents/tests/utils/chatwoot.ts) — 65 linhas; exports: SeedChatwootInstanceArgs, withRunNamespace, seedChatwootInstance.
- [tests/utils/counting-base.ts](sources/agents/tests/utils/counting-base.ts) — 63 linhas; exports: countingBase.
- [tests/utils/db-gate-noop.ts](sources/agents/tests/utils/db-gate-noop.ts) — 10 linhas; exports: —.
- [tests/utils/flowlog.ts](sources/agents/tests/utils/flowlog.ts) — 71 linhas; exports: clearFlowLog, flowLogRows, flowLogRow, flowLogCount.
- [tests/utils/followup-step-fields.ts](sources/agents/tests/utils/followup-step-fields.ts) — 36 linhas; exports: followUpStepFields, FollowUpStep.
- [tests/utils/i18n.tsx](sources/agents/tests/utils/i18n.tsx) — 65 linhas; exports: createTestI18n, withI18n.
- [tests/utils/job-registry.ts](sources/agents/tests/utils/job-registry.ts) — 35 linhas; exports: withJobHandler.
- [tests/utils/ledger.ts](sources/agents/tests/utils/ledger.ts) — 44 linhas; exports: expectWaiverLedger.
- [tests/utils/outbound.ts](sources/agents/tests/utils/outbound.ts) — 16 linhas; exports: outboundUrl.
- [tests/utils/ownership-read.ts](sources/agents/tests/utils/ownership-read.ts) — 20 linhas; exports: isOwnershipRead.
- [tests/utils/pg-waits.ts](sources/agents/tests/utils/pg-waits.ts) — 43 linhas; exports: blockedByChain, waitUntilBlocked.
- [tests/utils/poll.ts](sources/agents/tests/utils/poll.ts) — 27 linhas; exports: POLL_DEADLINE_MS.
- [tests/utils/prisma-mock.ts](sources/agents/tests/utils/prisma-mock.ts) — 131 linhas; exports: MockUserEntity, mockUser, MockTenantEntity, mockTenant, MockUser, MockTenant, mockFindFirst, mockFindUnique, mockCreate, mockUpdate, mockUpdateMany, mockCount, mockTenantFindFirst, mockTenantCreate, mockQueryRaw, mockExecuteRaw, prismaMock, setupPrismaMock, resetPrismaMocks.
- [tests/utils/scheduler.ts](sources/agents/tests/utils/scheduler.ts) — 22 linhas; exports: burnSchedulerJobId.
- [tests/utils/scripted-models.ts](sources/agents/tests/utils/scripted-models.ts) — 622 linhas; exports: EmptyThenReplyModel, FailingModel, ToolRecordingModel, SideEffectModel, UsageReportingModel, PromptCapturingModel, ResolveThenReplyModel, HandoffThenReplyModel, HandoffThenThrowModel, HandoffRetryModel, SetVoiceThenHandoffModel, SendImageThenReplyModel, SendImageThenHandoffModel, SendImageOnlyModel, SendImageBatchModel, SendImageAndResolveModel, guardrailModel, SendDocumentThenReplyModel, ToolLoopModel, SlowFailingModel.
- [tests/utils/source-text.ts](sources/agents/tests/utils/source-text.ts) — 598 linhas; exports: withoutComments, codeOnly, commentSpans, unterminatedLiteral, countInSrc, codeSkeleton.

</details>

## tmp

Module: `tmp`  
Path: [diretório](sources/agents/tmp)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [tmp/.keep](sources/agents/tmp/.keep) — 1 linhas; exports: —.

</details>

## tsconfig.json

Module: `tsconfig.json`  
Path: [diretório](sources/agents/tsconfig.json)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: nenhuma identificada pelo scanner  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 1

<details><summary>Arquivos e exports</summary>

- [tsconfig.json](sources/agents/tsconfig.json) — 41 linhas; exports: —.

</details>

## workers

Module: `workers`  
Path: [diretório](sources/agents/workers)  
Responsibility: [UNKNOWN] Responsabilidade completa não validada por tracing; agrupamento estrutural, consultar arquivos e consumidores.  
Public API: exports listados abaixo; não equivalem à API de produto  
Internal API: [UNKNOWN] callers/callees internos não reconstruídos para cada símbolo  
Dependencies: package:my-main-module  
Dependents: nenhum import lexical identificado  
Runtime relevance: [UNKNOWN] sem tracing profundo dedicado; presença em árvore não prova carregamento  
Confidence: LOW para responsabilidade de runtime; HIGH somente para presença/export/import lexical  
Files: 4

<details><summary>Arquivos e exports</summary>

- [workers/cdn/src/index.ts](sources/agents/workers/cdn/src/index.ts) — 103 linhas; exports: —.
- [workers/cdn/tsconfig.json](sources/agents/workers/cdn/tsconfig.json) — 19 linhas; exports: —.
- [workers/cdn/worker-configuration.d.ts](sources/agents/workers/cdn/worker-configuration.d.ts) — 14682 linhas; exports: httpServerHandler, httpServerHandler, httpServerHandler, onRequest, PipelineRecord, PipelineBatchMetadata, Pipeline, __RPC_STUB_BRAND, __RPC_TARGET_BRAND, __WORKER_ENTRYPOINT_BRAND, __DURABLE_OBJECT_BRAND, __WORKFLOW_ENTRYPOINT_BRAND, RpcTargetBranded, WorkerEntrypointBranded, DurableObjectBranded, WorkflowEntrypointBranded, EntrypointBranded, Stubable, Stub, Provider, RpcStub, RpcStub, WorkflowDurationLabel, WorkflowSleepDuration, WorkflowDelayDuration, WorkflowDynamicDelayContext, WorkflowDelayFunction, WorkflowTimeoutDuration, WorkflowRetentionDuration, WorkflowBackoff, WorkflowStepSensitivity, WorkflowStepConfig, WorkflowStepRollbackConfig, WorkflowCronSchedule, WorkflowEvent, WorkflowStepEvent, WorkflowStepContext, WorkflowRollbackContext, WorkflowRollbackHandler, WorkflowStepRollbackOptions, WorkflowInstanceStatus, waitUntil, withEnv, withExports, withEnvAndExports, env, exports, cache, tracing, NonRetryableError.
- [workers/cdn/wrangler.toml](sources/agents/workers/cdn/wrangler.toml) — 11 linhas; exports: —.

</details>


# Índice do repositório agents-skills

[DOC + CODE] Todos os 66 arquivos adquiridos são incluídos abaixo. APIs de skills são superfícies de autoria para um host externo, não endpoints do atendimento. Tracing detalhado: [forensics das skills](skills-forensics.md).

## B / distribution

Module: distribution  
Path: [.](sources/agents-skills/.)  
Responsibility: Metadata de distribuição, README e licença; não engine de runtime.  
Public API: plugin/marketplace metadata  
Internal API: referências progressivas; helpers de validação, HTTP/SSH/serialização quando há scripts  
Dependencies: host externo de skills; APIs/CLI administrativas conforme script e referência  
Dependents: assistente/operador; conteúdo equivalente vendorizado em A; host loader não adquirido  
Runtime relevance: autoria/implantação/operação; sem loading encontrado no turno conversacional  
Confidence: HIGH para composição e mecanismos rastreados; UNKNOWN para host/CLI externo e sucesso de deploy  
Files: 4

- [.claude-plugin/marketplace.json](sources/agents-skills/.claude-plugin/marketplace.json) — 90 linhas.
- [.claude-plugin/plugin.json](sources/agents-skills/.claude-plugin/plugin.json) — 12 linhas.
- [LICENSE](sources/agents-skills/LICENSE) — 22 linhas.
- [README.md](sources/agents-skills/README.md) — 50 linhas.

## B / agents-onboarding

Module: agents-onboarding  
Path: [skills/agents-onboarding](sources/agents-skills/skills/agents-onboarding)  
Responsibility: Guia de implantação/configuração; scripts executam operações administrativas e templates/samples alimentam o setup/import.  
Public API: SKILL.md e interfaces CLI dos scripts abaixo  
Internal API: referências progressivas; helpers de validação, HTTP/SSH/serialização quando há scripts  
Dependencies: host externo de skills; APIs/CLI administrativas conforme script e referência  
Dependents: assistente/operador; conteúdo equivalente vendorizado em A; host loader não adquirido  
Runtime relevance: autoria/implantação/operação; sem loading encontrado no turno conversacional  
Confidence: HIGH para composição e mecanismos rastreados; UNKNOWN para host/CLI externo e sucesso de deploy  
Files: 44

- [skills/agents-onboarding/SKILL.md](sources/agents-skills/skills/agents-onboarding/SKILL.md) — 81 linhas.
- [skills/agents-onboarding/gotchas.md](sources/agents-skills/skills/agents-onboarding/gotchas.md) — 158 linhas.
- [skills/agents-onboarding/guardrails.md](sources/agents-skills/skills/agents-onboarding/guardrails.md) — 67 linhas.
- [skills/agents-onboarding/references/00-prereqs-and-access.md](sources/agents-skills/skills/agents-onboarding/references/00-prereqs-and-access.md) — 38 linhas.
- [skills/agents-onboarding/references/01-vps-dns-ssh.md](sources/agents-skills/skills/agents-onboarding/references/01-vps-dns-ssh.md) — 72 linhas.
- [skills/agents-onboarding/references/01b-brownfield.md](sources/agents-skills/skills/agents-onboarding/references/01b-brownfield.md) — 104 linhas.
- [skills/agents-onboarding/references/01c-pick-tier.md](sources/agents-skills/skills/agents-onboarding/references/01c-pick-tier.md) — 63 linhas.
- [skills/agents-onboarding/references/02-coolify.md](sources/agents-skills/skills/agents-onboarding/references/02-coolify.md) — 118 linhas.
- [skills/agents-onboarding/references/03-chatwoot-pro.md](sources/agents-skills/skills/agents-onboarding/references/03-chatwoot-pro.md) — 62 linhas.
- [skills/agents-onboarding/references/04-agents-image.md](sources/agents-skills/skills/agents-onboarding/references/04-agents-image.md) — 50 linhas.
- [skills/agents-onboarding/references/05-langfuse.md](sources/agents-skills/skills/agents-onboarding/references/05-langfuse.md) — 73 linhas.
- [skills/agents-onboarding/references/06-setup-and-mcp.md](sources/agents-skills/skills/agents-onboarding/references/06-setup-and-mcp.md) — 73 linhas.
- [skills/agents-onboarding/references/08-agent-import.md](sources/agents-skills/skills/agents-onboarding/references/08-agent-import.md) — 66 linhas.
- [skills/agents-onboarding/references/09-chatwoot-bind.md](sources/agents-skills/skills/agents-onboarding/references/09-chatwoot-bind.md) — 50 linhas.
- [skills/agents-onboarding/references/10-validate-e2e.md](sources/agents-skills/skills/agents-onboarding/references/10-validate-e2e.md) — 55 linhas.
- [skills/agents-onboarding/references/agent-features.md](sources/agents-skills/skills/agents-onboarding/references/agent-features.md) — 74 linhas.
- [skills/agents-onboarding/references/chatwoot-hub-register.md](sources/agents-skills/skills/agents-onboarding/references/chatwoot-hub-register.md) — 96 linhas.
- [skills/agents-onboarding/references/deploy-b-portainer.md](sources/agents-skills/skills/agents-onboarding/references/deploy-b-portainer.md) — 139 linhas.
- [skills/agents-onboarding/references/deploy-c-compose.md](sources/agents-skills/skills/agents-onboarding/references/deploy-c-compose.md) — 68 linhas.
- [skills/agents-onboarding/references/migracao-v3.md](sources/agents-skills/skills/agents-onboarding/references/migracao-v3.md) — 357 linhas.
- [skills/agents-onboarding/samples/agents/README.md](sources/agents-skills/skills/agents-onboarding/samples/agents/README.md) — 35 linhas.
- [skills/agents-onboarding/samples/agents/maria-clinica-moreira.json](sources/agents-skills/skills/agents-onboarding/samples/agents/maria-clinica-moreira.json) — 313 linhas.
- [skills/agents-onboarding/samples/agents/rui-transportadora-http.json](sources/agents-skills/skills/agents-onboarding/samples/agents/rui-transportadora-http.json) — 130 linhas.
- [skills/agents-onboarding/scripts/chatwoot-admin.py](sources/agents-skills/skills/agents-onboarding/scripts/chatwoot-admin.py) — 390 linhas.
- [skills/agents-onboarding/scripts/coolify.py](sources/agents-skills/skills/agents-onboarding/scripts/coolify.py) — 553 linhas.
- [skills/agents-onboarding/scripts/docker-status.py](sources/agents-skills/skills/agents-onboarding/scripts/docker-status.py) — 130 linhas.
- [skills/agents-onboarding/scripts/gen-onboarding-env.ts](sources/agents-skills/skills/agents-onboarding/scripts/gen-onboarding-env.ts) — 191 linhas.
- [skills/agents-onboarding/scripts/harbor-login.py](sources/agents-skills/skills/agents-onboarding/scripts/harbor-login.py) — 119 linhas.
- [skills/agents-onboarding/scripts/langfuse-set-password.py](sources/agents-skills/skills/agents-onboarding/scripts/langfuse-set-password.py) — 273 linhas.
- [skills/agents-onboarding/scripts/langfuse-verify.py](sources/agents-skills/skills/agents-onboarding/scripts/langfuse-verify.py) — 119 linhas.
- [skills/agents-onboarding/scripts/portainer-brownfield.py](sources/agents-skills/skills/agents-onboarding/scripts/portainer-brownfield.py) — 118 linhas.
- [skills/agents-onboarding/scripts/remote.py](sources/agents-skills/skills/agents-onboarding/scripts/remote.py) — 199 linhas.
- [skills/agents-onboarding/scripts/sshkey.py](sources/agents-skills/skills/agents-onboarding/scripts/sshkey.py) — 141 linhas.
- [skills/agents-onboarding/templates/chatwoot/.env.example](sources/agents-skills/skills/agents-onboarding/templates/chatwoot/.env.example) — 32 linhas.
- [skills/agents-onboarding/templates/chatwoot/README.md](sources/agents-skills/skills/agents-onboarding/templates/chatwoot/README.md) — 66 linhas.
- [skills/agents-onboarding/templates/chatwoot/docker-compose.coolify.yml](sources/agents-skills/skills/agents-onboarding/templates/chatwoot/docker-compose.coolify.yml) — 138 linhas.
- [skills/agents-onboarding/templates/chatwoot/docker-compose.yml](sources/agents-skills/skills/agents-onboarding/templates/chatwoot/docker-compose.yml) — 140 linhas.
- [skills/agents-onboarding/templates/docker-compose.coolify.yml](sources/agents-skills/skills/agents-onboarding/templates/docker-compose.coolify.yml) — 111 linhas.
- [skills/agents-onboarding/templates/docker-compose.portainer.yml](sources/agents-skills/skills/agents-onboarding/templates/docker-compose.portainer.yml) — 175 linhas.
- [skills/agents-onboarding/templates/docker-compose.prod.yml](sources/agents-skills/skills/agents-onboarding/templates/docker-compose.prod.yml) — 129 linhas.
- [skills/agents-onboarding/templates/langfuse/.env.example](sources/agents-skills/skills/agents-onboarding/templates/langfuse/.env.example) — 60 linhas.
- [skills/agents-onboarding/templates/langfuse/README.md](sources/agents-skills/skills/agents-onboarding/templates/langfuse/README.md) — 133 linhas.
- [skills/agents-onboarding/templates/langfuse/docker-compose.coolify.yml](sources/agents-skills/skills/agents-onboarding/templates/langfuse/docker-compose.coolify.yml) — 190 linhas.
- [skills/agents-onboarding/templates/langfuse/docker-compose.yml](sources/agents-skills/skills/agents-onboarding/templates/langfuse/docker-compose.yml) — 186 linhas.

## B / agents-dev

Module: agents-dev  
Path: [skills/agents-dev](sources/agents-skills/skills/agents-dev)  
Responsibility: Guia de alteração do código/build/deploy de Agents; execução depende do assistente e ferramentas externas.  
Public API: SKILL.md e interfaces CLI dos scripts abaixo  
Internal API: referências progressivas; helpers de validação, HTTP/SSH/serialização quando há scripts  
Dependencies: código e build tooling do Agents, via procedimentos  
Dependents: assistente/operador; conteúdo equivalente vendorizado em A; host loader não adquirido  
Runtime relevance: autoria/implantação/operação; sem loading encontrado no turno conversacional  
Confidence: HIGH para composição e mecanismos rastreados; UNKNOWN para host/CLI externo e sucesso de deploy  
Files: 8

- [skills/agents-dev/SKILL.md](sources/agents-skills/skills/agents-dev/SKILL.md) — 36 linhas.
- [skills/agents-dev/gotchas.md](sources/agents-skills/skills/agents-dev/gotchas.md) — 7 linhas.
- [skills/agents-dev/guardrails.md](sources/agents-skills/skills/agents-dev/guardrails.md) — 7 linhas.
- [skills/agents-dev/references/00-get-the-code.md](sources/agents-skills/skills/agents-dev/references/00-get-the-code.md) — 27 linhas.
- [skills/agents-dev/references/01-layout-and-bun-check.md](sources/agents-skills/skills/agents-dev/references/01-layout-and-bun-check.md) — 30 linhas.
- [skills/agents-dev/references/02-free-full-and-invariants.md](sources/agents-skills/skills/agents-dev/references/02-free-full-and-invariants.md) — 8 linhas.
- [skills/agents-dev/references/03-implement.md](sources/agents-skills/skills/agents-dev/references/03-implement.md) — 10 linhas.
- [skills/agents-dev/references/04-own-image-and-deploy.md](sources/agents-skills/skills/agents-dev/references/04-own-image-and-deploy.md) — 14 linhas.

## B / agents-operation

Module: agents-operation  
Path: [skills/agents-operation](sources/agents-skills/skills/agents-operation)  
Responsibility: Guia de diagnóstico/ajuste via MCP e script de simulação de carga Chatwoot; não loop de atendimento.  
Public API: SKILL.md e interfaces CLI dos scripts abaixo  
Internal API: referências progressivas; helpers de validação, HTTP/SSH/serialização quando há scripts  
Dependencies: host externo de skills; APIs/CLI administrativas conforme script e referência  
Dependents: assistente/operador; conteúdo equivalente vendorizado em A; host loader não adquirido  
Runtime relevance: autoria/implantação/operação; sem loading encontrado no turno conversacional  
Confidence: HIGH para composição e mecanismos rastreados; UNKNOWN para host/CLI externo e sucesso de deploy  
Files: 10

- [skills/agents-operation/SKILL.md](sources/agents-skills/skills/agents-operation/SKILL.md) — 44 linhas.
- [skills/agents-operation/gotchas.md](sources/agents-skills/skills/agents-operation/gotchas.md) — 62 linhas.
- [skills/agents-operation/guardrails.md](sources/agents-skills/skills/agents-operation/guardrails.md) — 27 linhas.
- [skills/agents-operation/references/00-production-safety.md](sources/agents-skills/skills/agents-operation/references/00-production-safety.md) — 25 linhas.
- [skills/agents-operation/references/01-diagnose.md](sources/agents-skills/skills/agents-operation/references/01-diagnose.md) — 35 linhas.
- [skills/agents-operation/references/02-reproduce.md](sources/agents-skills/skills/agents-operation/references/02-reproduce.md) — 23 linhas.
- [skills/agents-operation/references/03-adjust.md](sources/agents-skills/skills/agents-operation/references/03-adjust.md) — 48 linhas.
- [skills/agents-operation/references/04-validate-and-apply.md](sources/agents-skills/skills/agents-operation/references/04-validate-and-apply.md) — 32 linhas.
- [skills/agents-operation/references/05-load-sim.md](sources/agents-skills/skills/agents-operation/references/05-load-sim.md) — 65 linhas.
- [skills/agents-operation/scripts/simulate-load.py](sources/agents-skills/skills/agents-operation/scripts/simulate-load.py) — 385 linhas.

