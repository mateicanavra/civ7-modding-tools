# Phase Record: D0 Public Surface Compatibility Matrix

## State

- Status: D0 design/specification packet accepted for execution planning.
- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`.
- Branch: `codex/deep-habitat-openspec-remediation`.
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

Run from `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`.

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

## Non-Claims

- D0 does not prove command correctness.
- D0 does not prove current-tree structural cleanliness.
- D0 does not prove runtime or product behavior.
- D0 does not approve proof/evidence terminology as target language.
- D0 does not authorize TypeScript source edits.
