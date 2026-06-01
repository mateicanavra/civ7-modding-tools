# FireTuner Runtime

Use FireTuner when the proof requires live Civ7 runtime behavior, JS globals,
or fast in-game iteration. This is still an evidence surface: it can prove what
the running game did, but source changes still belong in the repo.

## Connection

- Civ7 must have tuner support enabled in the game's user options before the
  socket is available. On Windows this is `AppOptions.txt` under
  `%LOCALAPPDATA%\Firaxis Games\Sid Meier's Civilization VII`; set
  `EnableTuner 1` without the leading semicolon.
- The default tuner port is `4318`.
- On this Mac + Parallels setup, FireTuner running in Windows should connect to
  the Mac host through the Parallels shared-network host address. Verify rather
  than memorizing:
  - Mac side: `ifconfig bridge100` usually shows the host address, commonly
    `10.211.55.2`.
  - Windows VM side: `prlctl list --all --info` shows the guest address, commonly
    `10.211.55.4`.
  - If shared networking is not the path, try the Mac LAN IP from
    `ipconfig getifaddr en0`.
- `127.0.0.1` inside Windows means the Windows VM, not the Mac Civ7 process.

## Scripting States

- After Civ7 starts, FireTuner may connect before states are populated. Use
  `Connection -> Refresh Lua States`.
- The main menu may expose only `App UI`.
- In-game sessions should expose both `App UI` and `Tuner`. Select `Tuner` for
  gameplay/runtime globals such as `Autoplay`, `Game`, and map debugging unless
  deliberately exercising UI-only globals.
- Refresh states again after leaving to main menu or starting/restarting a game.

## Fast Runtime Loops

Use direct commands in the console; old Civ6 tuner panels are not reliable
authority for Civ7 even when some still open.

When driving FireTuner through the append-only bridge command log, every
instruction must carry an agent identifier:

```text
AGENT=DRA-map-config-generation COMMAND=Network.restartGame()
```

Bridge scripts and Windows command wrappers must parse
`AGENT[=:][ \t]*([A-Za-z0-9_.-]+)` from each appended instruction and include
the captured agent name in audit output. If the field is missing, the bridge
should log `AGENT=unknown` and reject restart commands unless a human explicitly
overrides that guard.

Restart the current setup with a fresh seed when restart is enabled:

```js
Network.restartGame()
```

Run bounded autoplay from the gameplay/tuner context:

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
