## Why

Studio Run in Game needs a package-owned way to prepare and start a Civ7
single-player game through direct control. Current Studio behavior can deploy a
Swooper config and restart the already-selected game, but it cannot prove that
Civ selected the requested map row, map size, and setup seed.

## Target Authority Refs

- User goal: Studio-driven game launch and live sync on top of
  `@civ7/direct-control`.
- Latest acceptance criteria: Run in Game is separate from preview Run; seed is
  setup/runtime input; direct-control owns setup/start wrappers; proof must
  include map row, seed, runtime seed, and Swooper hash evidence.
- `docs/projects/civ7-direct-control/workstream/studio-run-in-game/agent-setup-api.md`
- `docs/projects/civ7-direct-control/workstream/studio-run-in-game/agent-proof-test.md`
- Official Civ setup UI and automation resources under `.civ7/outputs/resources`.

## What Changes

- Add App UI setup snapshot and frontend map-row verification wrappers.
- Add approved setup mutation wrappers for map script, map size, map seed, and
  bounded setup options.
- Add approved start/orchestration wrappers that verify expected setup before
  start and Tuner/runtime postconditions after start.
- Keep setup/start command strings private to `@civ7/direct-control`.
- Add no-replay failure behavior for setup/start mutations.

## Requires

- `direct-control-state-role-model`
- `direct-control-read-surface`
- `direct-control-action-surface`

## Enables Parallel Work

- Studio Run in Game endpoint can call structured package wrappers instead of
  raw setup JavaScript.
- CLI can expose setup snapshots and proof output without owning protocol
  details.

## Affected Owners

- `packages/civ7-direct-control`
- `packages/cli` if setup commands are exposed
- Workstream proof ledger and verification notes

## Forbidden Owners

- Studio, CLI, or docs examples that emit raw `GameSetup`, `Configuration`,
  `Network.hostGame`, or `engine.call("startGame")` snippets as a launch path.
- Windows/FireTuner bridge fallback.

## Stop Conditions

- Direct control cannot read setup parameter state from App UI.
- Direct control cannot select the requested setup row/seed/size with reliable
  readback.
- No direct start primitive can be live-proven from shell/main menu.

## Consumer Impact

Developers get deterministic setup/start contracts and proof output. Studio can
build Run in Game on a single package boundary instead of duplicating socket or
setup behavior.

## Verification Gates

- Mock socket tests for snapshot, map row lookup, setup write/readback, start,
  postcondition mismatch, and no mutation replay.
- Live proof ledger entry for return-to-shell, setup write/readback, start, and
  post-start seed/dimensions when Civ socket is healthy.
- OpenSpec validation and package `test`, `check`, and `build`.
