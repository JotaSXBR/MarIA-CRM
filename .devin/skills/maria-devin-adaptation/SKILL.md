---
name: maria-devin-adaptation
description: Reconcile MarIA CRM coding-agent workflows and repository-local skill references. Applies when setting up or auditing agent configuration, skills or tooling for this repository.
---

# MarIA CRM agent adaptation

Root AGENTS.md owns the shared contract and delegation policy. Devin is the primary coding
agent; model and permission settings live in Devin user/project config, not in this file.

Shared skills are readable files at .devin/skills/<name>/SKILL.md, not assumed installed
slash commands — list the directory and read only the ones relevant to the task.
Ecosystem skills installed via `npx skills` live in .agents/skills/ with the install
manifest at skills-lock.json.

Use HANDOFF.md for current work, DEVELOPMENT.md for setup/checks, manifests for versions and
ARCHITECTURE.md/ADRs for target boundaries. Do not duplicate roadmaps here or in agent config.
Local gitignored RTK hooks are optional. If a preferred tool is unavailable, use an available
equivalent and report the limitation. Read-only tasks must not update files or run writing checks.
Authorization persists within the requested implementation scope, not unrelated publication.
