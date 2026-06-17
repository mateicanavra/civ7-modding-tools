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

## 2026-06-17 Closeout Logged Proof

Closeout request:

- Branch: `codex/studio-effect-state-machine-closeout`.
- Request id: `studio-run-in-game-mqhog22i-13if-2`.
- Studio daemon: `127.0.0.1:5297`.
- Server instance:
  `studio-server-mqhoepc2-13if-1`.
- Result: `phase=complete`, `status=complete`, `ok=true`.
- Completed phases: `materializing`, `deploying`, `checking-civ7`,
  `preparing-setup`, `starting-game`, `waiting-for-proof`.

Generated and deployed evidence:

- Materialization mode: `disposable`.
- Map script: `{swooper-maps}/maps/studio-current.js`.
- Config hash:
  `6e7a3f18679ef2dbebba8992f7b7b6e89226132b6a2a60e9b6d59d2c9fd1ec9c`.
- Envelope hash:
  `523d45759fda3f03fcf2c96810dc5014838fc52fd7567e418e320028667488df`.
- Source config:
  `mods/mod-swooper-maps/src/maps/configs/studio-current.config.json`
  sha256
  `48000de5ac26ccf232dabd65813e5181e66067fd0534fa2449e433bb35ba6e91`.
- Generated source:
  `mods/mod-swooper-maps/src/maps/generated/studio-current.ts`
  sha256
  `78333249eeb5f311ba4b670149f6f59baf4072933ebd778f574041f165afef44`.
- Local mod script:
  `mods/mod-swooper-maps/mod/maps/studio-current.js` sha256
  `85d3eb03ac4709bc2f5bef27d6cdfec630bd53660a0162c526fcb3a6079a6632`.
- Deployed mod script:
  `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/maps/studio-current.js`
  sha256
  `85d3eb03ac4709bc2f5bef27d6cdfec630bd53660a0162c526fcb3a6079a6632`.
- Marker proofs present in both local and deployed script:
  request id, config hash, envelope hash,
  `map.rivers.authoredTerrainMaterialization`, and
  `POST-AUTHORED-RIVERS`.
- Deploy task: `mod-swooper-maps:build:studio-deploy`, files copied `12`.

Setup/start evidence:

- Direct-control host: `127.0.0.1`.
- Port: `4318`.
- State: `{ id: "65535", name: "App UI" }`.
- Setup row proof found setup-domain and config-db rows for
  `{swooper-maps}/maps/studio-current.js`.
- Row visibility: initial and final match present, `refreshed=false`,
  `verified=true`.
- Applied setup values:
  - `Map: {swooper-maps}/maps/studio-current.js`
  - `MapSize: MAPSIZE_STANDARD`
  - `MapRandomSeed: 1781676935`
  - `GameRandomSeed: 1781676935`
  - `MaxMajorPlayers: 6`
- Start result:
  - `beginAttempted=true`
  - final App UI observation reached `loadingStateName=GameStarted`,
    `inGame=true`
  - map summary width `84`, height `54`, plot count `4536`, random seed
    `1781676935`
  - game readback turn `1`, turn date `4000 BCE`

Bounded log evidence:

- Log path:
  `/Users/mateicanavra/Library/Application Support/Civilization VII/Logs/Scripting.log`.
- Observed at: `2026-06-17T06:16:10.396Z`.
- Start offset: `61590`.
- Matched markers:
  `[mapgen-proof]`, `studio-run-in-game-mqhog22i-13if-2`, config hash,
  envelope hash, and `[mapgen-complete]`.
- Direct grep evidence:
  - line 369:
    `[2026-06-17 02:15:52] [SWOOPER_MOD] [mapgen-proof] ... requestId studio-run-in-game-mqhog22i-13if-2 ...`
  - line 539:
    `[2026-06-17 02:15:54] [SWOOPER_MOD] [mapgen-complete] ... requestId studio-run-in-game-mqhog22i-13if-2 ...`

Exact authorship proof:

- Status: `complete`.
- Created at: `2026-06-17T06:16:10.399Z`.
- Request fingerprint:
  `db27c8581b359efea928e4b5778edc117124a6c01f2d10b1603c0149b57e9e43`.
- Runtime readback: seed `1781676935`, width `84`, height `54`, plot count
  `4536`, turn `1`, game hash `0`, source snapshot id
  `status:1:4cd3196d`.
- `unresolvedLinks: []`.

## 2026-06-17 Resume Current-Top Proof

This is the current-top rerun after the closeout reconciliation branch resumed:

- Branch/head: `codex/studio-effect-state-machine-closeout` at
  `baa9d7f8e docs(studio): reconcile state-machine closeout`.
- Dev server: `STUDIO_DAEMON_PORT=5298 STUDIO_DEV_PORT=5198 NX_DAEMON=false bun run dev:mapgen-studio`.
- Browser entrypoint: `http://localhost:5198/`.
- Studio daemon: `http://127.0.0.1:5298/`.
- Browser action: clicked the rendered Run in Game button.
- Request id: `studio-run-in-game-mqhqd5ic-jrj-5`.
- Final browser state: `Ready. Live Civ7 turn 1 seed 123. Run in Game complete`.
- Final action state: `Run in Game: Complete`, map
  `{swooper-maps}/maps/studio-current.js`, `Studio state: Current`.
- Screenshots:
  - `/tmp/studio-proof-initial.png`
  - `/tmp/studio-proof-after-action-click.png`
  - `/tmp/studio-proof-final-run.png`

Current-top generated/deployed evidence:

- Source config:
  `mods/mod-swooper-maps/src/maps/configs/studio-current.config.json` sha256
  `480d8d38cd6ebd17887c12e99aab956440886e365571d89d8981739bf2953d3f`.
- Deployed script:
  `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/maps/studio-current.js`.
- Deployed script sha256:
  `1b9aee5f882e329371d9e16384290eab357d143c4d06e78ff7e5e67eb2ca218a`.
- Deployed script mtime: `2026-06-17 03:09:23`.
- Deployed marker proofs:
  - `requestId: "studio-run-in-game-mqhqd5ic-jrj-5"`;
  - `configHash: "6e7a3f18679ef2dbebba8992f7b7b6e89226132b6a2a60e9b6d59d2c9fd1ec9c"`;
  - `envelopeHash: "523d45759fda3f03fcf2c96810dc5014838fc52fd7567e418e320028667488df"`;
  - `map.rivers.authoredTerrainMaterialization`;
  - `POST-AUTHORED-RIVERS`.
- Disposable local paths were absent after the completed run, which preserves
  the intended cleanup boundary:
  - `mods/mod-swooper-maps/src/maps/generated/studio-current.ts`;
  - `mods/mod-swooper-maps/mod/maps/studio-current.js`.

Current-top Civ7 readback:

- Direct health command:
  `bun packages/cli/bin/run.js game health --tuner --json`.
- Health result: `ok=true`, host `127.0.0.1`, port `4318`, state
  `{ id: "1", name: "Tuner" }`, ready `true`, turn `1`, date `4000 BCE`,
  width `84`, height `54`, alive human ids `[0]`.
- `civ7.setupConfig` at `2026-06-17T07:15:21.658Z`: `phase=running-game`,
  selected map row `{swooper-maps}/maps/studio-current.js`, `mapSeed=123`,
  `gameSeed=123`, player count `6`.
- `civ7.live.snapshot` at `2026-06-17T07:15:22.035Z`: state
  `{ id: "1", name: "Tuner" }`, map width `84`, height `54`, sampled plot count
  `432`.

Current-top bounded log evidence:

- Bounds before browser action:
  - `Scripting.log` offset `319766`;
  - `Modding.log` offset `3557789`;
  - `Database.log` offset `10511`;
  - `UI.log` offset `19054504`.
- `Scripting.log` contains `[SWOOPER_MOD] [mapgen-proof]` and
  `[SWOOPER_MOD] [mapgen-complete]` for
  `studio-run-in-game-mqhqd5ic-jrj-5`, seed `123`, dimensions `84x54`, and the
  config/envelope hashes above.
- `Modding.log` contains `Map Script: {swooper-maps}/maps/studio-current.js`
  and `Loading maps/studio-current.js`.
- `Database.log` has no Swooper/studio-current matches in the bounded search.
- `UI.log` has no Swooper/studio-current matches in the bounded search; it is
  not claimed as globally clean because unrelated third-party UI errors exist
  in the local Civ7 environment.

Current-top operation-history caveat:

- After the browser proof, the Studio daemon serving `5298` restarted with
  `serverInstanceId=studio-server-mqhqkd0r-23o4-1`.
- `runInGame.status` for `studio-run-in-game-mqhqd5ic-jrj-5` returned
  `404 RUN_IN_GAME_STATUS_NOT_FOUND` under the new identity.
- `studio.operations.current` returned no active or recent operations under the
  new identity.
- Therefore this pass proves the user-reported generated/deployed/setup/start
  path, but not durable operation-history recovery across daemon restarts.

## Unresolved Labels

- Fresh bounded `Scripting.log`, `Modding.log`, `Database.log`, and `UI.log`
  searches are claimed for the current-top request
  `studio-run-in-game-mqhqd5ic-jrj-5` within the limits above.
- `UI.log` is not globally clean because the local Civ7 environment includes
  unrelated third-party UI errors outside Swooper/studio-current.
- Operation history across a Studio daemon restart is unresolved for
  `studio-run-in-game-mqhqd5ic-jrj-5`.
- Full Studio browser-button execution after this branch was later recorded in
  `openspec/changes/studio-browser-scenario-proof/workstream/browser-proof-ledger.md`
  for request `studio-run-in-game-mqhng9hg-1pku-2`. That browser fast path
  reached `Complete` / `Current` without a process restart. The process-restart
  fallback remains unit-tested rather than manually rendered in the browser.
- A later top-of-stack correction
  `1b9ec418e fix(studio): scope restart recovery to current run state`
  prevents stale browser operation state from carrying `Restart Civ & Run` onto
  a changed authored Studio state. No new live generated/deployed/tuner/log
  proof is claimed from that UI-scoping correction.
