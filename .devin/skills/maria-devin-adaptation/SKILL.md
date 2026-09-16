---
name: maria-devin-adaptation
description: Reconcile MarIA CRM coding-agent workflows and repository-local skill references.
---

# MarIA CRM agent adaptation

Root AGENTS.md owns the shared contract and routing policy. Each coding tool retains its
own model and sandbox configuration. Do not copy Codex model instructions into Devin.

Shared skills are readable files at .devin/skills/<name>/SKILL.md, not assumed installed
slash commands: maria-dev-setup, maria-database-rls, maria-api-development and maria-testing.
Read only the ones relevant to the task.

Use HANDOFF.md for current work, DEVELOPMENT.md for setup/checks, manifests for versions and
ARCHITECTURE.md/ADRs for target boundaries. Do not duplicate roadmaps here or in agent config.
Local gitignored RTK hooks are optional. If a preferred tool is unavailable, use an available
equivalent and report the limitation. Read-only tasks must not update files or run writing checks.
Authorization persists within the requested implementation scope, not unrelated publication.
