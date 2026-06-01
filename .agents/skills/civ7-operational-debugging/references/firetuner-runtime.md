# Civ7 Tuner Runtime

Use the Civ7 tuner socket when the proof requires live Civ7 runtime behavior,
JS globals, or fast in-game iteration. Repo tooling should call
`@civ7/direct-control`; FireTuner is reference-client evidence only.

## Connection

- Civ7 must have tuner support enabled in the game's user options before the
  socket is available. On Windows this is `AppOptions.txt` under
  `%LOCALAPPDATA%\Firaxis Games\Sid Meier's Civilization VII`; set
  `EnableTuner 1` without the leading semicolon.
- The default tuner port is `4318`.
- The repo-owned direct path is local to the machine running Civ7:
  `civ7 game restart`, `civ7 game exec`, `civ7 game health`, or package
  callers of `@civ7/direct-control`.
- If a Windows reference client is used manually, it connects to the Mac host
  through the Parallels shared-network host address. Verify rather than
  memorizing:
  - Mac side: `ifconfig bridge100` usually shows the host address, commonly
    `10.211.55.2`.
  - Windows VM side: `prlctl list --all --info` shows the guest address, commonly
    `10.211.55.4`.
  - If shared networking is not the path, try the Mac LAN IP from
    `ipconfig getifaddr en0`.
- `127.0.0.1` inside Windows means the Windows VM, not the Mac Civ7 process.
  `127.0.0.1` on the Mac means the local Civ7 tuner socket.

## Scripting States

- After Civ7 starts, a tuner client may connect before states are populated.
  Direct tooling should query `LSQ:` again or call the package readiness helpers.
  In FireTuner, use `Connection -> Refresh Lua States`.
- The main menu may expose only `App UI`.
- In-game sessions should expose both `App UI` and `Tuner`. Treat them as
  separate API surfaces. Current evidence places `Network.restartGame()` and
  the native Begin Game action (`UI.notifyUIReady()`) on `App UI`; `Tuner` is
  command-ready only after Begin Game and is the better canary for gameplay
  globals such as `Game`, `GameplayMap`, and `Players`.
- Refresh states again after leaving to main menu or starting/restarting a game.

## Fast Runtime Loops

Use direct commands through `@civ7/direct-control`; old Civ6 tuner panels are
not reliable authority for Civ7 even when some still open.

CLI restart example:

```bash
civ7 game restart --agent Codex --begin --wait-tuner
```

Read-only direct command probes should use the package API or purpose-built
scripts, not caller-local socket implementations.

Restart the current setup with a fresh seed when restart is enabled:

```bash
civ7 game restart --agent Codex --begin --wait-tuner
```

Check whether the Tuner state can actually execute gameplay API probes:

```bash
civ7 game health --tuner --json
```

Run direct JavaScript:

```bash
civ7 game exec "1+1"
```

Run bounded autoplay from `App UI` unless a fresh probe proves a different
state exposes the required `Autoplay` methods:

```js
Autoplay.setTurns(5)
Autoplay.setReturnAsPlayer(0)
Autoplay.setObserveAsPlayer(PlayerIds.OBSERVER_ID)
Autoplay.setActive(true)
```

Stop autoplay:

```js
Autoplay.setActive(false)
```

When constants are unavailable or uncertain, verify them in the connected
context before using numeric literals. Community evidence says observer is
`1000` and no-player is `-1`, but official runtime constants are preferred.

## Runtime Proof

For map-generation claims, bound the run with:

- deployed map/mod file mtime before the command,
- `Scripting.log` mtime before and after the command,
- a fresh `Creating Context -  MapGeneration`,
- the expected final stage, such as
  `[50/50] ok mod-swooper-maps.standard.placement.placement`,
- `Destroying Context -  MapGeneration`,
- no current-run `TextEncoder`, `Uncaught`, `Error`, or `Exception` failure.

Inspect sibling logs when the question is not purely map script execution:

- `Modding.log` for mod discovery/load.
- `Database.log` for XML import/schema issues.
- `UI.log` for UI JS/module failures.
- `GameCore.log` and `Game.log` for game-flow/simulation signals.
- `General.log`, `output.log`, and net logs for engine/process context.

## Official Resource Anchors

- Installed game Tuner panels may live under
  `Base/Platforms/Windows/Config/TunerPanels`; the repo resource mirror may not
  include that directory.
- Official automation scripts demonstrate `Autoplay.setTurns`,
  `setReturnAsPlayer`, `setObserveAsPlayer`, and `setActive`.
- Official pause-menu UI calls `Network.restartGame()` for restart.
- Official map scripts import `maps/map-debug-helpers.js` to dump terrain,
  elevation, rainfall, biomes, features, resources, and related map diagnostics.
