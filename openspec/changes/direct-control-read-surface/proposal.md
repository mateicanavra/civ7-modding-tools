## Why

The package can execute arbitrary JavaScript, but developer tooling needs
structured, bounded, proof-backed reads instead of repeated ad hoc command
strings. The capability inventory identified read wrappers that materially help
mapgen debugging, Studio, gameplay observation, and LLM-agent context.

## Target Authority Refs

- `docs/projects/civ7-direct-control/workstream/capability-inventory/capability-inventory.md`
- `docs/projects/civ7-direct-control/workstream/capability-inventory/tuner-surface-report.md`
- `docs/projects/civ7-direct-control/workstream/capability-inventory/app-ui-surface-report.md`
- `docs/projects/civ7-direct-control/workstream/capability-inventory/owner-runtime-probes.md`
- `packages/civ7-direct-control/AGENTS.md`

## What Changes

- Add bounded first-class read wrappers for playable status, map summary, plot
  snapshot, map grid, player/unit/city summaries, visibility summaries,
  GameInfo/Database table reads, and bounded root inspection.
- Keep raw command execution available for expert debugging, while documenting
  structured reads as the preferred product surface.

## Requires

- `direct-control-state-role-model`

## Enables Parallel Work

- Studio live map/status panels.
- LLM-agent context snapshots.
- Runtime-vs-MapGen comparison tooling.

## Affected Owners

- `packages/civ7-direct-control`
- `packages/cli/src/commands/game/**`
- `apps/mapgen-studio` if endpoints consume new reads
- package/system docs

## Forbidden Owners

- CLI or Studio local JavaScript string builders for package-owned reads.
- Unbounded root dumps as normal control API.

## Stop Conditions

- Tuner cannot provide bounded gameplay/map reads after Begin Game.
- GameInfo/Database reads cannot be bounded safely.

## Consumer Impact

Developers and tools can call typed package functions instead of copy-pasting
JavaScript into `game exec`.

## Verification Gates

- Direct-control mock socket tests for every read wrapper.
- CLI tests for exposed read commands.
- Studio endpoint tests/build when Studio is touched.
- Live read-only proof against Civ7 when available.
- OpenSpec validation and `git diff --check`.
