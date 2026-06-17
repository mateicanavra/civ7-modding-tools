# Scenario Corpus Ledger

Date: 2026-06-16

Status values: `corpus-only`, `designed`, `tested`, `built`, `generated`, `deployed`, `tuner-exercised`, `logged`, `in-game observed`, `unresolved`.

Closeout note: this ledger is the prework corpus. Final row-by-row disposition
for SMR-08 is recorded in
`openspec/changes/studio-effect-state-machine-closeout/workstream/reconciliation-ledger.md`.
The closeout ledger preserves this corpus while adding current proof labels and
explicitly marking claimed and unclaimed labels. As of the SMR-08 closeout
evidence update, bounded `Scripting.log` proof is claimed for request
`studio-run-in-game-mqhog22i-13if-2`; Graphite submission, broad product proof,
and sibling load-diagnostic logs remain separate.

## Server Read RPCs

| ID | Surface | User scenario | Current evidence | Required next proof | Status |
|---|---|---|---|---|---|
| READ-01 | `civ7.status` | User opens Studio when Civ7 tuner is unavailable. | Prior focused checks claimed defined 500. | Source test, live unavailable probe, browser projection row. | corpus-only |
| READ-02 | `civ7.mapSummary` | User requests map summary while tuner is unavailable or mid-game. | Prior focused checks claimed defined 500. | Unavailable and happy-path tuner probes. | corpus-only |
| READ-03 | `civ7.gameInfo` | User requests game info with tuner unavailable. | Prior focused checks claimed defined 400. | Source test plus live unavailable/happy-path distinction. | corpus-only |
| READ-04 | `civ7.setupConfig` | Setup config load fails without stack spam and UI remains actionable. | User reported reproduced failure class after prior fix. | Source test, live unavailable probe, browser setup-load flow. | unresolved |
| READ-05 | `civ7.savedConfigs` | Saved configs load without requiring Civ7. | Prior focused checks claimed 200. | Source test and browser startup flow. | corpus-only |
| READ-06 | `civ7.setupCatalog` | Setup catalog loads without requiring Civ7. | Prior focused checks claimed 200. | Source test and browser startup flow. | corpus-only |

## Other Unified RPCs

| ID | Surface | User scenario | Current evidence | Required next proof | Status |
|---|---|---|---|---|---|
| RPC-01 | `recipeDag.get` | Studio recipe DAG lookup returns declared not-found/unavailable errors and defects stay defects. | Server code-path review found this effect-oRPC leaf outside the first packet draft. | Source tests for `RECIPE_DAG_RECIPE_NOT_FOUND`, `RECIPE_DAG_UNAVAILABLE`, defect logging, and explicit exterior decision for non-Studio control routes. | unresolved |

## Live RPCs

| ID | Surface | User scenario | Current evidence | Required next proof | Status |
|---|---|---|---|---|---|
| LIVE-01 | `civ7.live.status` | Partial live reads return 200 with embedded field errors. | Code-path review identified parity behavior. | Unit tests for partial failure and browser rendering. | corpus-only |
| LIVE-02 | `civ7.live.snapshot` | Snapshot failure becomes declared runtime error, not generic defect. | Needs trace. | Source test and unavailable/happy-path tuner probe. | corpus-only |
| LIVE-03 | `civ7.live.entities` | Entity read failure is visible and classified. | Needs trace. | Source test and unavailable/happy-path tuner probe. | corpus-only |
| LIVE-04 | `civ7.live.gameInfo` | Live game info failure is declared and actionable. | Needs trace. | Source test and unavailable/happy-path tuner probe. | corpus-only |

## Stateful Operations

| ID | Surface | User scenario | Current evidence | Required next proof | Status |
|---|---|---|---|---|---|
| OP-01 | `runInGame.start` admission | Invalid seed/map size/player count/map script fails before worker start. | Needs trace. | Unit tests and browser validation flow. | corpus-only |
| OP-02 | `runInGame.start` duplicate | Duplicate active or terminal fingerprint returns existing operation DTO. | Code-path review requested row. | Unit tests and UI adoption proof. | corpus-only |
| OP-03 | `runInGame.status` | Missing, expired, and daemon-mismatch statuses echo server identity. | Needs trace. | Source tests and browser restart proof. | corpus-only |
| OP-04 | Run in Game workflow | Materialize, deploy, restart, playable check, setup row, start game, log proof, exact authorship, cleanup. | Operational review requires one proof row per boundary. User reports Civ7 setup cannot see `{swooper-maps}/maps/studio-current.js` after `preparing-setup`; the game stays at shell and does not create a new game. | Phase tests plus live proof labels. Prioritize proof that `studio-current.js` is generated, copied to the deployed Mods target, visible to Civ7 setup, and tied to the current request id before start-game proof is claimed. | unresolved |
| OP-05 | Runtime disposed | Active worker becomes failed DTO and new starts return service unavailable. | Code-path review requested row. | Source tests and event projection proof. | corpus-only |
| OP-06 | `mapConfigs.saveDeploy` validation | Bad id/requestId/restart flags/envelope/path jail are rejected. | Needs trace. | Source tests and browser typed-error proof. | corpus-only |
| OP-07 | Save/deploy workflow | Save failure, deploy failure, rollback failure, cleanup failure, missing leaf context. | Code-path review says more phase-aware than Run in Game. | Source tests and DTO/browser proof. | corpus-only |
| OP-08 | `civ7.autoplay` | Start/stop blocked, unavailable, failed, verification failed. | Browser wrapper may flatten defined errors. | Source tests and UI typed-error proof. | corpus-only |
| OP-09 | `display.explore.request` | Explore request defined control-oRPC failure is shown coherently. | Browser catches generic `Error.message`. | UI/API test or explicit exterior decision. | corpus-only |

## Studio State And Events

| ID | Surface | User scenario | Current evidence | Required next proof | Status |
|---|---|---|---|---|---|
| STUDIO-01 | `studio.operations.current` | Active vs recent operation truth survives event publish failure. | Code-path review requested row. | Source test and browser adoption flow. | corpus-only |
| STUDIO-02 | `studio.events.watch` hello/current | Reconnect emits hello/current and clears stale local error. | Code-path review found possible stale local error. | Hook/UI tests and browser reconnect proof. | unresolved |
| STUDIO-03 | Event cancel/dispose | Stream cancellation and runtime disposal do not leak bad status. | Needs trace. | Source test and bounded log assertion. | corpus-only |

## Browser UI Surfaces

| ID | Surface | User scenario | Current evidence | Required next proof | Status |
|---|---|---|---|---|---|
| UI-01 | Setup load | Setup unavailable shows actionable diagnostics and no stack spam. | User reproduced bug class. | Browser test/manual flow with daemon unavailable. | unresolved |
| UI-02 | Run in Game button | Click starts or adopts operation, shows phase sequence and diagnostics. | Not fully tested. | Manual rendered-shell browser protocol plus server proof. A browser automation stack requires a separate accepted test-stack packet. | unresolved |
| UI-03 | Retry/restart | Diagnostics, retry, restart server affordance behave predictably. | Not fully tested. | Browser flow across terminal failure and daemon restart. | unresolved |
| UI-04 | Operation adoption | Reload/reconnect adopts current operation by server identity. | Needs trace. | Browser reload/reconnect flow. | corpus-only |
| UI-05 | Busy gates | Run, autoplay, and explore busy states are visible to users. | Review found autoplay/explore may return silently. | UI tests or intentional product decision. | corpus-only |
| UI-06 | Defined error projection | Run, save/deploy, autoplay, setup config preserve or intentionally flatten code/data. | Review found inconsistent browser wrappers. | API/UI tests and copy decision. | unresolved |

## Dev And Operational Proof

| ID | Surface | Scenario | Current evidence | Required next proof | Status |
|---|---|---|---|---|---|
| DEV-01 | `bun run dev:mapgen-studio` | Studio starts with isolated ports. | Probe hit existing Nx process and was interrupted. | Clean process/port run with daemon and Vite URLs recorded. | unresolved |
| DEV-02 | Nx orchestration | Dev uses `serve-daemon` plus frontend and dependency builds. | Mechanical review confirmed. | Use root/Nx entrypoint for proof. | corpus-only |
| PROOF-01 | Build | Server/app/mod build commands complete. | Not rerun for this prework yet. | `nx run @civ7/studio-server:build`, `nx run mapgen-studio:build:vite`, relevant mod build. | corpus-only |
| PROOF-02 | Generated local | Generated mod files exist and markers match source request. | Operational review requires separate row. | `mod-swooper-maps:build:studio-deploy` with `SWOOPER_INCLUDE_STUDIO_CURRENT=1` and `SWOOPER_STUDIO_RUN_ID=<requestId>` produces `mods/mod-swooper-maps/mod/maps/studio-current.js` and matching source/generated identities. | unresolved |
| PROOF-03 | Deployed copy | Local generated output is copied to Civ7 Mods dir. | User reports Civ7 setup cannot see `{swooper-maps}/maps/studio-current.js`, consistent with missing/stale deployed `maps/studio-current.js` or Civ7 mod reload boundary. | `@civ7/plugin-mods` deploy result records Mods dir, target dir, file count, deployed `maps/studio-current.js` sha/mtime/markers, and Civ7 setup row visibility for `{swooper-maps}/maps/studio-current.js`. | unresolved |
| PROOF-04 | Direct tuner health | FireTuner/LSQ availability and required states are observed. | Currently may be unavailable. | Direct-control health command with host/port/result. | unresolved |
| PROOF-05 | Fresh bounded log | `Scripting.log` fresh markers match request/config/envelope. | Not part of prework. | Pre-action offset plus bounded marker parse. | unresolved |
| PROOF-06 | Runtime readback | In-game map summary/live status matches request. | Not part of prework. | Post-start readback and exact-authorship proof. | unresolved |
