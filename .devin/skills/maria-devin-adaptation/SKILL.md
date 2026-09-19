---
name: maria-devin-adaptation
description: Reconcile MarIA CRM coding-agent workflows and repository-local skill references. Applies when setting up or auditing agent configuration, skills or tooling for this repository.
---

# MarIA CRM agent adaptation

Root AGENTS.md owns the shared contract and delegation policy. Devin is the primary coding
agent; model and permission settings live in Devin user/project config, not in this file.

## Where things live

- Shared skills: `.devin/skills/<name>/SKILL.md` — readable files, not installed slash
  commands. List the directory and read only the ones relevant to the task.
- Ecosystem skills installed via `npx skills`: `.agents/skills/`, manifest `skills-lock.json`.
- Project config `.devin/config.json` supports only `permissions`, `read_config_from` and
  `hooks`; model/theme settings are user-level. Personal overrides go in
  `.devin/config.local.json` / `AGENTS.local.md` (both gitignored).
- Optional local RTK hooks: `.devin/hooks.v1.json` + `.devin/rtk-pretooluse.mjs` (gitignored).
  `/hooks` lists what is loaded.

## Devin skill frontmatter facts

- Supported fields: `name`, `description`, `argument-hint`, `model`, `subagent`, `agent`,
  `allowed-tools`, `permissions`, `triggers`. `devin doctor` validates profiles.
- `permissions` uses the CLI scope syntax: `Read(glob)`, `Write(glob)`, `Exec(command prefix)`
  or a bare tool name (`exec`, `edit`). `Exec(**)` is a literal prefix and denies nothing —
  use `exec` to block the tool. Relative globs resolve against the repository root.
- Do not pin `model:` on inline review/guidance skills; it silently switches the session model.
- `description` is the only routing signal: state what the skill does and when to use it
  (and when not to). Keep `name` equal to the directory name.

## Evaluating skill changes

`skill-creator`'s automated eval/description loop needs `claude -p`, which is not available
here. Validate a skill change by running 2–3 realistic task prompts in an explore subagent
with and without the change, comparing outputs, and recording the result in the PR.

Use HANDOFF.md for current work, DEVELOPMENT.md for setup/checks, manifests for versions and
ARCHITECTURE.md/ADRs for target boundaries. Do not duplicate roadmaps here or in agent config.
If a preferred tool is unavailable, use an available equivalent and report the limitation.
Read-only tasks must not update files or run writing checks. Authorization persists within the
requested implementation scope, not unrelated publication.
