## Why

The direct Civ7 tuner-socket path now covers the old bridge's only repo-owned
runtime responsibility: submit JavaScript such as `Network.restartGame()` to the
running Civ7 process. It also adds state discovery, state selection, health,
readiness polling, arbitrary command execution, classified errors, and reusable
runtime proof helpers.

Keeping the Windows/FireTuner bridge as a fallback would preserve the Steam,
Parallels, and FireTuner UI fragility this workstream set out to remove.

## What Changes

- Remove CLI bridge flags, bridge utility code, and bridge tests.
- Remove repo docs and operational skill guidance that tell agents to append
  Windows bridge log requests.
- Remove or decommission shared-drive bridge scripts and wrappers after
  inventorying the exact files.
- Keep FireTuner references only as reference-client or historical evidence, not
  as a repo-owned runtime control path.

## Requires

- `civ7-direct-control-surface`
- Direct-control parity evidence for:
  - state discovery and selection;
  - arbitrary JavaScript command execution;
  - `Network.restartGame()` on a restart-capable Civ7 state;
  - health/readiness polling;
  - reconnect by opening fresh sockets and rediscovering states;
  - bounded runtime proof where the current game state can produce it.

## Forbidden Non-Goals

- No Windows supervisor replacement.
- No bridge fallback hidden behind direct-control errors.
- No FireTuner clone or TUI.
- No deletion of official FireTuner binaries or unrelated Civ7 development
  tool files.

## Verification Gates

- Focused `@civ7/direct-control` tests/check/build.
- Focused CLI tests proving direct restart, exec, and health.
- CLI check/build to refresh the oclif manifest.
- Studio build against direct-control imports.
- `bun run openspec:validate`.
- `git diff --check`.
- Live direct-control proof when Civ7 state allows it; otherwise record the
  command/health evidence and the state-dependent restart boundary.
