# Live Proof Ledger

Status: live blocker reproduced, repaired, and partially proven on branch
`codex/studio-live-civ7-proof-gates`.

This ledger records SMR-07 proof labels separately: tested, built, generated,
deployed, tuner-exercised, logged, and in-game observed. It names branch, commit,
request id, commands, deployed target, log ranges, direct-control host/port/state
/command/result, and unresolved labels.

## Priority Blocker

User report:

`Civ7 setup cannot see {swooper-maps}/maps/studio-current.js`

Observed meaning:

- A fresh `studio-current.js` deploy can exist on disk while the already-running
  Civ7 shell does not list the transient row in setup.
- `ensureCiv7SetupMapRowVisible(... reloadIfMissing: "exit-to-shell")` cannot
  make the running shell see a newly added transient map row.
- A Civ process restart loads the deployed mod metadata, after which the setup
  row is immediately visible and the game can start.

## Evidence

### Generated Local

- Request id: `smr07-local-proof-20260617004904`.
- Command:
  `SWOOPER_INCLUDE_STUDIO_CURRENT=1 SWOOPER_STUDIO_RUN_ID=smr07-local-proof-20260617004904 bun run nx run mod-swooper-maps:build:studio-deploy --outputStyle=static`.
- Result: build generated eight map configs, including `studio-current`.
- Local generated source:
  `mods/mod-swooper-maps/src/maps/generated/studio-current.ts`
  - sha256: `e76c9b74cee5e1de59fcda585bf0f7fc11863fa63e2682033793d8fcb2a5c6f1`
  - markers: `sourceConfigId: "studio-current"`,
    `requestId: "smr07-local-proof-20260617004904"`,
    `configHash: "f5bf5787f7c0670d0ecf4fee6d1cccdaaea2922b8a1951e47e094ed10b21773b"`,
    `envelopeHash: "b5def7ee5bc4f807da93038429cc7052d461f7f7ecae173131c8e1f86750e3b0"`.
- Local mod script:
  `mods/mod-swooper-maps/mod/maps/studio-current.js`
  - sha256: `24ea030538d4bb5db4261948b99b44daf2b192b948aa2131c7e001652ebd0d5a`
  - marker: `requestId: "smr07-local-proof-20260617004904"`.

### Deployed Copy

- Deploy API:
  `deployMod({ inputDir: "mods/mod-swooper-maps/mod", modId: "mod-swooper-maps" })`.
- Mods dir:
  `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods`.
- Target dir:
  `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/mod-swooper-maps`.
- Files copied: `12`.
- Deployed script:
  `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/maps/studio-current.js`
  - sha256 after deploy:
    `24ea030538d4bb5db4261948b99b44daf2b192b948aa2131c7e001652ebd0d5a`
  - marker after deploy:
    `requestId: "smr07-local-proof-20260617004904"`.
- Deployed metadata:
  - `config/config.xml` contains
    `File="{swooper-maps}/maps/studio-current.js"`.
  - `swooper-maps.modinfo` imports `maps/studio-current.js`.

### Running Shell Visibility Before Restart

- Direct-control host: `127.0.0.1`.
- Port: `4318`.
- State: `{ id: "65535", name: "App UI" }`.
- Initial setup row query for `{swooper-maps}/maps/studio-current.js`: no rows.
- Reload attempt: `ensureCiv7SetupMapRowVisible` with
  `reloadIfMissing: "exit-to-shell"`.
- Final setup row query: no rows.
- Classification: deployed copy exists, but the running Civ7 shell did not load
  the newly introduced transient map row. This is a process-load boundary, not a
  missing local generation or deploy-copy failure.

### Process Restart And Setup Visibility

- Shutdown used repo-owned macOS process restart utilities.
- `osascript` quit returned user-cancel stderr; fallback `pkill -f
  CivilizationVII.app/Contents/MacOS/CivilizationVII` produced stable process
  exit.
- Steam launch command: `open steam://rungameid/1295660`.
- Launch succeeded on attempt 2.
- Direct-control host: `127.0.0.1`.
- Port: `4318`.
- State: `{ id: "65535", name: "App UI" }`.
- Setup row query after process restart:
  - setup-domain row:
    `{swooper-maps}/maps/studio-current.js`, sort index `1900`.
  - config-db row:
    `{swooper-maps}/maps/studio-current.js`,
    `LOC_MAP_STUDIO_CURRENT_NAME`,
    `LOC_MAP_STUDIO_CURRENT_DESCRIPTION`,
    sort index `1900`.

### Mutating Setup/Start

- Command surface: repo-owned `runCiv7SinglePlayerFromSetup` direct-control API.
- Input:
  - map script: `{swooper-maps}/maps/studio-current.js`
  - map size: `MAPSIZE_STANDARD`
  - map seed/game seed: `123456789`
  - player count: `8`
  - `fromRunningGame: "exit-to-shell"`
  - `waitForTuner: true`
- Prepare result:
  - `verified: true`
  - applied `Map`, `MapSize`, `MapRandomSeed`, `GameRandomSeed`, and
    `MaxMajorPlayers`
  - selected setup map row:
    `{swooper-maps}/maps/studio-current.js`
- Start result:
  - `beginAttempted: true`
  - final UI: `inGame=true`, `loadingStateName="GameStarted"`,
    active input context `World`
  - tuner state: `{ id: "1", name: "Tuner" }`
  - map readback: width `84`, height `54`, plot count `4536`, random seed
    `123456789`
  - game readback: turn `1`, turn date `4000 BCE`

## Fix

Disposable Run in Game requests materialize transient `studio-current`, but the
default workflow still tries the normal map-restart path first: deploy,
`exit-to-shell`, and setup row visibility proof. A Civ process restart is only a
fallback after that proof returns the typed `setup-row-unavailable` failure with
`reloadBoundary: "process-restart-required"`. Durable saved-map launches remain
restart opt-in.

Browser SMR-06 evidence reopened the restart boundary: returning after the macOS
process starts is too early because Civ7 can still be in the intro/cinematic
window and direct-control status can be unavailable. The macOS restart leaf now
records two separate boundaries:

- process launch: Steam starts the Civilization VII process;
- shell readiness: Studio passively polls `getCiv7PlayableStatus` App UI probes
  until `inShell === true` before workflow `checking-civ7` begins.

No AppleScript coordinate click is part of the production restart path. Browser
evidence showed a generic click can open in-game UI if it lands after Civ7
becomes interactive. The restart path may accelerate the intro/cinematic by
closing active `Cinematic` display-queue requests through the direct-control
DisplayQueueManager atom, but the proof gate remains the passive
shell-readiness watcher and the accelerator is skipped after `inGame === true`.

Production error handling remains Effect-based:

- App UI command/dependency failures map to `dependencyUnavailable`.
- Missing setup rows map to `proofFailed` with reason `setup-row-unavailable`.
- Materialization/deploy proof failures map to `materializationFailed`.

## Unresolved Labels

- Fresh bounded `Scripting.log`, `Modding.log`, `Database.log`, and `UI.log`
  ranges were not used for the current claim and remain unclaimed.
- Full Studio browser-button execution after this branch was not yet run in the
  rendered UI; the core live setup/start boundary was proven through the
  repo-owned direct-control API.
