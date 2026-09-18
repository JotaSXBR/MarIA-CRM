---
name: maria-dev-setup
description: Prepare or diagnose the MarIA CRM local development environment and repository commands. Applies when bootstrapping a clone, debugging dev/build commands or verifying environment setup.
---

# MarIA CRM development setup

Read root AGENTS.md and DEVELOPMENT.md. The latter owns Windows/WSL setup, migration
commands, variables and verification. Versions come from .nvmrc, manifests and lockfile.

- Verify branch and HANDOFF.md before edits.
- For a fresh clone, install with the frozen lockfile, prepare an empty DB, run the shared
  migration runner and provision the restricted runtime credential.
- Keep migration credentials separate from the API's DATABASE_URL.
- Root pnpm dev builds upstream packages and watches dependencies. Direct package dev
  bypasses root orchestration: build its dependencies first.
- The dev compose also runs WAHA + Redis; copy docker/.env.example to docker/.env first.
  Session webhooks are configured per WAHA session — see DEVELOPMENT.md "Local WAHA + Redis".
- If pnpm is absent from PATH, use corepack pnpm when available.
- Use the smallest relevant check first, then required pre-PR gates. Record unavailable
  Docker, permissions or tools as blockers; never report unexecuted checks as passed.
- No pnpm clean command exists. Diagnose build/cache failures before removing artifacts.
  Do not delete database volumes as routine troubleshooting.

RTK hooks at .devin/hooks.v1.json and .devin/rtk-pretooluse.mjs are optional gitignored
customization, not prerequisites for a fresh clone.
