## Why

The first direct-control workstream proved that Civ7 accepts FireTuner-style
socket commands directly, and the capability inventory proved that `App UI` and
`Tuner` expose different API surfaces. The expanded control surface needs a
normative state-role model before read wrappers, mutating wrappers, generated
catalogs, CLI commands, or Studio endpoints grow around the package.

## Target Authority Refs

- Direct user goal for a first-class `@civ7/direct-control` developer/player/
  agent surface without Windows, Steam relaunches, or FireTuner UI.
- `docs/projects/civ7-direct-control/workstream/capability-inventory/capability-inventory.md`
- `docs/projects/civ7-direct-control/workstream/capability-inventory/app-ui-surface-report.md`
- `docs/projects/civ7-direct-control/workstream/capability-inventory/tuner-surface-report.md`
- `openspec/changes/civ7-direct-control-surface/`
- `packages/civ7-direct-control/AGENTS.md`

## What Changes

- Define App UI and Tuner as complementary state roles in the public contract.
- Extend the direct-control boundary contract with readiness phases, state-role
  selection, reconnect/backoff behavior, error taxonomy, and mutation replay
  rules.
- Require wrapper implementations to declare the state role they target and the
  proof class that supports them.

## Requires

- `civ7-direct-control-surface`
- `remove-firetuner-bridge-legacy`
- Capability inventory workstream artifacts.

## Enables Parallel Work

- `direct-control-read-surface`
- `direct-control-action-surface`
- `direct-control-capability-catalog`
- `direct-control-cli-studio-expansion`

## Affected Owners

- `packages/civ7-direct-control`: state-role contract and shared helpers.
- `packages/cli`: presentation of role-specific health/readiness.
- `apps/mapgen-studio`: caller of package-owned role helpers.
- Docs/OpenSpec: canonical explanation and proof boundaries.

## Forbidden Owners

- Caller-local socket framing or state selection.
- FireTuner/Windows bridge runtimes.
- Generated output or deployed Mods.

## Stop Conditions

- Fresh evidence shows App UI and Tuner roles differ materially from the
  capability inventory in a way that invalidates wrapper ownership.
- A required control surface can only be reached through FireTuner UI/panel
  injection, not direct socket commands.

## Consumer Impact

Developers get one role-aware package contract. CLI and Studio do not guess
which state owns a command; they call role-specific helpers or generic package
selectors.

## Verification Gates

- `bun run openspec -- validate direct-control-state-role-model --strict`
- Focused direct-control package tests for role selection, readiness, and
  no-replay behavior.
- `bun run --cwd packages/civ7-direct-control check`
- Live read-only health proof when Civ7 is available.
