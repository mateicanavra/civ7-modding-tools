# Phase Record: D0 Public Surface Compatibility Matrix

## State

- Status: D0 implementation artifact authored and under packet-boundary review.
- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-deep-habitat-prep-frame`.
- Branch: `agent-DRA-d0-command-surface-inventory`.
- Source packet:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D0-scenario-public-contract-inventory.md`.
- D0 review:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D0-review.md`.
- Final D0 acceptance review:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D0-final-review.md`.
- OpenSpec change:
  `openspec/changes/deep-habitat-d0-command-surface-inventory/`.

## Objective

Design the D0 public surface compatibility matrix packet so the implementation
agent has a complete artifact contract, state model, validation oracle, write
set, and downstream citation rule before authoring the matrix.

## Acceptance State

D0 is accepted for design/specification purposes. The final fresh review found
no P1/P2 blockers after repairs to row identity, compatibility handling, and row
relationship semantics.

## Approved Write Set

- `docs/projects/habitat-harness/public-surface-compatibility-matrix.md`.
- `tools/habitat-harness/docs/IMPLEMENTED-SURFACE.md` only for a link or current
  compatibility clarification.
- `tools/habitat-harness/docs/SCENARIOS.md` only for current command invocation
  clarification.
- `openspec/changes/deep-habitat-d0-command-surface-inventory/**`.
- `docs/projects/habitat-harness/openspec-remediation/packet-index.md` only for
  D0 status/citation updates.

## Protected Paths

- `tools/habitat-harness/src/**`.
- `tools/habitat-harness/package.json`.
- root `package.json`.
- `nx.json`.
- generated outputs including `dist/**`, `oclif.manifest.json`, Nx cache, and
  generated project outputs.

## Current Evidence Commands

Historical design/planning commands below were run from the old remediation
worktree named above in the original design record. Implementation validation
for the matrix now runs from
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-deep-habitat-prep-frame`
on branch `agent-DRA-d0-command-surface-inventory`; see the matrix Validation
Evidence table for expected status, actual status, sample locations, cache
stance, and non-claims.

- `git status --short --branch`.
- `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts`.
- `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts`.
- `bun run habitat check --json`.
- `bun run habitat classify tools/habitat-harness/src/plugin.js`.
- `bun run habitat verify --json`.
- `bun run habitat fix --dry-run`.
- `bun run habitat graph --json`.
- `bun run habitat hook --help`.
- `nx show project @internal/habitat-harness`.
- `bun run openspec -- validate deep-habitat-d0-command-surface-inventory --strict`.
- `bun run openspec:validate`.
- `git diff --check`.

## Implementation Evidence Snapshot

- Matrix:
  `docs/projects/habitat-harness/public-surface-compatibility-matrix.md`.
- Row count: 328 concrete D0 rows across all required planes.
- Strict matrix parser: passed for closed planes, states, compatibility handling,
  typed relationship JSON, duplicate IDs, and dangling relationship references.
- OpenSpec validation:
  `bun run openspec -- validate deep-habitat-d0-command-surface-inventory --strict`
  passed.
- OpenSpec all validation: `bun run openspec:validate` passed with 249 items.
- `git diff --check`: passed.
- Required validation probes are recorded in the matrix, including current
  `check --help` / `hook --help` failures and long-running broad command
  timeouts. These are current source-surface evidence, not D0 source repairs.
- Root checkout side-branch risk: root checkout
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools` is back on
  clean `main`; D0 artifact work remains only on the linear Graphite stack layer
  `agent-DRA-d0-command-surface-inventory` above
  `agent-DRA-deep-habitat-prep-frame`.

## Non-Claims

- D0 does not prove command correctness.
- D0 does not prove current-tree structural cleanliness.
- D0 does not prove runtime or product behavior.
- D0 does not approve proof/evidence terminology as target language.
- D0 does not authorize TypeScript source edits.
