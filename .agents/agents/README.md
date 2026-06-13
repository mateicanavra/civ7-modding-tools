# Repo-Local Agents

Repo-local agents are durable role prompts for Civ7 Modding Tools workstreams.
They complement skills: skills teach the main agent how to operate; agent files
define bounded sub-agent roles that can be launched when the main workflow needs
delegation.

If the current agent runner does not auto-discover repo-local agents, use the
matching launch prompt asset from the relevant skill instead.

## Agents

| Agent | Use When |
|---|---|
| `openspec-workstream-artifact-worker` | A Civ7 OpenSpec workstream needs a standing worker to keep phase records, task lists, review ledgers, downstream realignment ledgers, closure checklists, or next packets current while the main DRA owns implementation and synthesis. |

## Operating Rules

- Keep agent prompts durable and role-specific; do not store project status.
- Give each agent explicit scope, non-goals, grounding, validation, and output
  format.
- Prefer inherited/high-quality models for judgment-heavy artifact work.
- Keep worktree edits bounded to the write set provided by the main owner.
- Agents do not commit, submit, merge, or drain unless explicitly instructed.
