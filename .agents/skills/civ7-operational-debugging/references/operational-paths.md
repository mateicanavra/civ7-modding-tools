# Operational Surfaces

Use this map to find the owner of an observation. Confirm actual roots and
targets through Nx before running anything.

## Owner Roots

| Fact or effect | Durable owner root |
| --- | --- |
| Tuner contract and failure vocabulary | `resources/civ7-tuner` |
| Local Tuner acquisition/session/epoch | `resources/civ7-tuner/providers/local-socket` |
| Generic selected-window capture contract | `resources/window-capture` |
| macOS capture/helper/process execution | `resources/window-capture/providers/macos-screencapturekit` |
| Civ7 app/game/map/UI interpretation | `services/civ7-control` |
| Actor-facing gameplay outcomes | `services/civ7-play` |
| Save & Deploy / Run in Game operation outcomes | `services/mapgen-runs` |
| Swooper portable definition | `plugins/mod/map/swooper-physics` |
| Swooper deployable realization | `apps/mods/map/swooper-physics` |
| Studio host effects and composition | `apps/mapgen-studio` |
| Game and MapGen CLI projections | `plugins/cli/topics/{game,mapgen}` |
| Official resource evidence | `.civ7/outputs/resources` |

## Discover Project And Command Surfaces

```bash
bunx nx show projects
bunx nx show project <project-name> --json
bun apps/cli/bin/run.js game --help
bun apps/cli/bin/run.js mapgen --help
```

For Swooper, current project identities are discoverable as
`swooper-physics` (definition), `swooper-physics-mod` (realization), and
`cli-mapgen` (CLI projection). Do not infer a target name from a directory or
copy an invocation from an old proof note.

## Generated And Installed Evidence

The Swooper realization project declares its generated output in Nx. At the
time of use, read that `outputs` field and the realization's build/deploy
entrypoints. Inspect generated files only after the owning target completes.

The installed Civ7 Mods root is an app configuration fact. Prefer the path and
receipt emitted by the qualified install adapter over hard-coded OS guesses.
Common locations can help diagnose configuration, but are not selection
authority:

| Platform | Common game-data root |
| --- | --- |
| macOS | `~/Library/Application Support/Civilization VII` |
| Windows | `%USERPROFILE%/Documents/My Games/Sid Meier's Civilization VII` |
| Linux/other | `~/.local/share/civ7` |

Installation evidence should record mod identity, source and destination tree
digests, replacement counts, target root, and adapter-issued receipt. It does
not prove loader acceptance.

## Civ7 Logs

Logs commonly live below `<game-data>/Logs`. The selected app configuration is
the authority for the actual root.

- `Modding.log`: discovery and load signals.
- `Database.log`: XML import and schema/data failures.
- `Scripting.log`: map/runtime JavaScript and authored diagnostic output.
- `UI.log`: App UI JavaScript/module failures.
- `Game.log` and `GameCore.log`: game-flow and simulation evidence.
- `Engine.log`, `General.log`, and `output.log`: process/runtime context.
- `Localization.log`: localization import or lookup failures.
- network debug logs: connection and transport evidence.

Always record a pre-action offset, size/digest, or timestamp and read only the
fresh window. A search over an unbounded log is not run-specific evidence.

## Live Resource Evidence

Tuner host/port, timeouts, and endpoint discovery belong to the selected
local-socket provider configuration. Window selection, helper preparation,
permissions, child processes, and image installation belong to the selected
capture provider. Discover these through their resource/provider source and
app composition, not through a service or command implementation.

Raw health or execution belongs to the Tuner resource surface. Civ7 readiness,
map observation, and appshot meaning belong to foundational control. Gameplay
meaning belongs to play. Preserve that distinction in every report.
