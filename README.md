# MarIA CRM

MarIA CRM is an independent, multi-tenant, agent-native CRM where AI agents and human operators
share the same workspace, inbox, contacts, companies, pipelines, tasks and knowledge.

## Status

Pre-implementation engineering baseline. The repository currently contains the architecture,
security invariants, stack decisions, research and execution rules required to begin Phase 0.

## Start here

1. [`AGENTS.md`](AGENTS.md) — normative engineering contract and documentation map.
2. [`ARCHITECTURE.md`](ARCHITECTURE.md) — product boundaries and target repository topology.
3. [`docs/engineering/`](docs/engineering/) — governing documents by subsystem.
4. [`research/README.md`](research/README.md) — independent research, evidence boundaries and
   product blueprint.
5. [`docs/exec-plans/README.md`](docs/exec-plans/README.md) — format for substantial implementation
   work.

Claude Code procedures live under [`.claude/skills/`](.claude/skills/). Other coding agents follow
the equivalent checklists referenced by `AGENTS.md`.

## License

Licensed under the [GNU Affero General Public License v3.0](LICENSE).
