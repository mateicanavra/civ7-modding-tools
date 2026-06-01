## Why

CLI and Studio already call the direct-control package for the initial restart
loop. The expanded package surface should be consumed through the same boundary
so developer workflows, Studio/mapgen debugging, and LLM-agent tooling do not
grow separate socket or command-string implementations.

## Target Authority Refs

- User goal: CLI, Studio, and future tools call the canonical control boundary.
- `packages/civ7-direct-control/AGENTS.md`
- `packages/cli/AGENTS.md`
- `docs/projects/civ7-direct-control/workstream/capability-inventory/capability-inventory.md`
- `openspec/changes/remove-firetuner-bridge-legacy/`

## What Changes

- Expose the expanded read/action/catalog surface through focused CLI commands.
- Route Studio server endpoints through package read wrappers where useful for
  mapgen debugging.
- Update docs and cleanup references that imply bridge, FireTuner UI, or local
  socket ownership for covered behaviors.

## Requires

- `direct-control-read-surface`
- `direct-control-action-surface`
- `direct-control-capability-catalog`

## Enables Parallel Work

- Studio runtime comparison panels.
- Scriptable CLI proof loops.
- LLM-agent tool adapters over stable CLI/package contracts.

## Affected Owners

- `packages/cli`
- `apps/mapgen-studio`
- `packages/civ7-direct-control/README.md`
- `docs/system/cli/overview.md`
- `docs/projects/civ7-direct-control/**`

## Forbidden Owners

- CLI/Studio raw tuner-socket framing or duplicated direct-control JS builders.
- Restoring bridge commands or external Windows scripts.
- Deleting official FireTuner development tools.

## Stop Conditions

- Package wrappers cannot satisfy CLI/Studio needs without duplicating protocol
  logic.
- A legacy path remains necessary for a behavior direct control cannot perform.

## Consumer Impact

Developers get coherent CLI commands and Studio endpoints. Existing `game exec`
remains expert/debug escape hatch, but structured commands become the maintained
surface.

## Verification Gates

- Focused CLI tests/check/build.
- Studio build and endpoint tests where touched.
- Docs diff review.
- OpenSpec validation and `git diff --check`.
