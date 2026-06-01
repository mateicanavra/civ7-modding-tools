# Verification Audit

Audit date: 2026-05-31

Objective: assess whether the final Civ7 direct-control workstream has a
defensible verification story for a repo-owned `@civ7/direct-control` boundary
that controls a running macOS Civ7 instance without Windows, Steam relaunches,
or the FireTuner UI.

Evidence policy:

- Source/mock tests prove source-level contracts.
- OpenSpec validation proves artifact validity, not live runtime behavior.
- Live Civ evidence must be bounded by fresh action windows and timestamps.
- Historical FireTuner/DLL evidence is reference-client evidence only.

## Gates Run

| Gate | Status | Evidence |
|---|---|---|
| `bun run --cwd packages/civ7-direct-control build` | PASS | ESM/CJS/DTS emitted successfully |
| `bun run --cwd packages/civ7-direct-control test` | PASS | 1 file, 12 tests passed |
| `bun run --cwd packages/civ7-direct-control check` | PASS | `tsc -p tsconfig.json --noEmit` exited 0 |
| `bun run --filter @mateicanavra/civ7-cli test -- test/commands/game.restart.test.ts test/commands/game.control.test.ts` | PASS | 2 files, 8 tests passed |
| `bun run --cwd packages/cli check` | PASS | `tsc -p tsconfig.json --noEmit` exited 0 |
| `bun run --filter @mateicanavra/civ7-cli build` | PASS | oclif manifest generated |
| `bun run --cwd apps/mapgen-studio build` | PASS | Vite build and worker-bundle check passed; existing large-chunk warning only |
| `bun run openspec -- validate civ7-direct-control-surface --strict` | PASS | Change is valid |
| `bun run openspec -- validate remove-firetuner-bridge-legacy --strict` | PASS | Change is valid |
| `bun run openspec:validate` | PASS | 18 OpenSpec items passed |
| `git diff --check` | PASS | No whitespace errors reported |

## Live Runtime Proof

Fresh proof was rerun after Steam was restarted and a clean game was already
started. The direct session started at `2026-05-31T18:58:31.563Z`.

Observed sequence:

- `LSQ:` returned `App UI (65535)` and `Tuner (1)`.
- Preflight App UI snapshot reported `inGame: true`, `inLoading: false`, turn
  `1`, date `4000 BCE`, and loading state `GameStarted`.
- `Network.restartGame()` returned `true`.
- App UI loading states progressed through `WaitingForGameplayData`,
  `WaitingForLoadingCurtain`, `WaitingForGameCore`, `WaitingForVisualization`,
  and `WaitingForUIReady`.
- `UI.notifyUIReady()` returned `null`.
- App UI then reported `GameStarted` and `inGame: true`.
- Tuner health canary returned `ready: true` with `Game`, `Autoplay`,
  `GameplayMap`, and `Players` as objects, `Network` undefined, turn `1`, date
  `4000 BCE`, map `84x54`, alive ids `0..7`, alive human id `0`, and autoplay
  inactive.
- Fresh `Scripting.log` proof after offset `24957` matched `Creating Context -
  MapGeneration`, `[SWOOPER_MOD]`, and `Destroying Context -  MapGeneration`;
  log size advanced to `49944`.

Boundary: this proves direct transport, state discovery, App UI restart/begin,
post-Begin Tuner command readiness, and fresh runtime log effects. It does not
prove full Civ7 process exit/relaunch recovery.

Post-implementation CLI proof also passed through the committed command path:
`bun run --cwd packages/cli dev -- game health --json` returned `App UI` and
`Tuner`, then
`bun run --cwd packages/cli dev -- game restart --begin --wait-tuner --json --timeout-ms 120000`
returned restart output `true`, begin output `null`, final App UI
`GameStarted`, and Tuner health `ready: true`.

## Source Coverage

`packages/civ7-direct-control/test/direct-control.test.ts` covers default/env
configuration, `LSQ:` state discovery, command framing, state selection by role,
name, and id, missing-state errors, restart output validation, App UI snapshot
parsing, Tuner health parsing, restart/begin orchestration, fragmented and
concatenated frame parsing, and fresh ordered log marker matching.

CLI tests cover direct restart by default, native restart+begin+Tuner readiness,
dry-run output, arbitrary command execution, direct health, Tuner health,
runtime inspection, and App UI snapshot output.

Studio coverage is build-level: the Vite API code imports `@civ7/direct-control`
and the production build plus worker bundle check passed.

## Cleanup Verification

- Repo-owned CLI bridge utilities, tests, flags, and docs were removed or
  realigned to the direct package boundary.
- Shared-drive cleanup left the `Comms` directory with only `Modifiers.ltp`;
  no bridge scripts, wrappers, command files, or bridge logs remain there.
- Operational debugging guidance now points to direct tuner control,
  `game restart --begin --wait-tuner`, and `game health --tuner`.
- Pre-existing user dirty files remain outside this workstream staging plan:
  `mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json` and
  `NOTE-TO-DRA.md`.

## Closure Assessment

The workstream has a defensible verification base for the direct-only cutover:
focused source tests, CLI tests, Studio build, OpenSpec validation, whitespace
validation, and fresh live Civ evidence all passed. Remaining risk is limited to
Civ process exit/relaunch recovery and the later typed autocomplete/catalog
slice, neither of which is claimed as complete here.
