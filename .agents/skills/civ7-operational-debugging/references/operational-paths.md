# Operational Paths

## Repo Surfaces

| Surface | Path |
|---|---|
| Official resource evidence | `.civ7/outputs/resources/` |
| Mod sources | `mods/<mod-slug>/src/` |
| Mod package scripts | `mods/<mod-slug>/package.json` |
| Generated mod output | `mods/<mod-slug>/mod/` |
| Root deploy command | `bun run deploy:mods` |
| Project build command | `nx run <mod-project>:build` |
| Project deploy command | `nx run <mod-project>:deploy` |

`mods/<mod-slug>/mod/` is generated output. Inspect it to confirm generation,
but change source files and regenerate instead of editing it directly.

## Civ7 Game Data Locations

The repo resolver for the local game data path lives in
`packages/plugins/plugin-files/src/index.ts`.

| Platform | Game Data Directory | Deployed Mods Directory |
|---|---|---|
| macOS | `~/Library/Application Support/Civilization VII` | `~/Library/Application Support/Civilization VII/Mods/<mod-id>/` |
| Windows | `%USERPROFILE%/Documents/My Games/Sid Meier's Civilization VII` | `%USERPROFILE%/Documents/My Games/Sid Meier's Civilization VII/Mods/<mod-id>/` |
| Linux/other | `~/.local/share/civ7` | `~/.local/share/civ7/Mods/<mod-id>/` |

The deploy helper copies the contents of `--input` into
`<game-data>/Mods/<mod-id>/`.

## Civ7 Logs

| Platform | Logs Directory |
|---|---|
| macOS | `~/Library/Application Support/Civilization VII/Logs/` |
| Windows | `%USERPROFILE%/Documents/My Games/Sid Meier's Civilization VII/Logs/` |
| Linux/other | `~/.local/share/civ7/Logs/` |

Common files to inspect:

- `Modding.log`: mod discovery, load, and package issues.
- `Database.log`: XML database import and schema/data errors.
- `Scripting.log`: map/runtime JavaScript errors and `console.log` output.
- `UI.log`: UI JavaScript/module errors, including App UI tuner context issues.
- `Game.log` and `GameCore.log`: game-flow and simulation signals.
- `Engine.log` and `General.log`: startup/runtime context.
- `Localization.log`: missing or malformed localization records.
- `net_connection_debug.log`, `net_message_debug.log`, and
  `net_transport_debug.log`: connection and network transport context.
- `output.log`: broad process output when present.

Always bound log reads to the action under review. Use file mtimes, a pre-run
snapshot, or a timestamp marker in the notes before treating a line as current.

## Direct Tuner Surfaces

| Surface | Location / Command |
|---|---|
| Default tuner port | `4318` |
| macOS listener check | `lsof -nP -iTCP:4318` |
| Direct health check | `civ7 game health --json` |
| Direct command execution | `civ7 game exec "1+1" --json` |
| Direct restart | `civ7 game restart --agent Codex --wait` |
| Installed Civ7 tuner panels | `<Steam Civ7 install>/Base/Platforms/Windows/Config/TunerPanels/` |

The repo resource mirror may not contain installed-game `TunerPanels`. Prefer
official resources in `.civ7/outputs/resources/` when present, and inspect the
installed game path only as runtime/resource evidence.
