# 05 — Server Boundary / API Contract Inventory

**Lane:** server-boundary / API-contract corpus for the `effect-orpc` router migration.
**Scope:** `apps/mapgen-studio`. Current "server" = hand-rolled `server.middlewares.use("/api/...")` handlers inside `vite.config.ts` (`configureServer`, lines 379–1147) plus helper modules under `src/server/*`. Client calls via raw `fetch` in `src/App.tsx`.
**Goal:** every endpoint captured so the oRPC router implements exact behavior parity. Cited `file:line` against the snapshot at the head of this branch.

All paths below are relative to `apps/mapgen-studio` unless absolute.

---

## Endpoint corpus

### Conventions shared across all endpoints

- **Server file:** every handler lives in `vite.config.ts` under `configureServer(server)` (line 379).
- **Body writer:** `writeJson(res, status, body)` (`vite.config.ts:355`) — sets `Content-Type: application/json`, `res.statusCode`, `res.end(JSON.stringify(body))`. Default `Content-Type` is always JSON.
- **JSON body reader:** `readJsonBody` (`vite.config.ts:289`) or inline chunk-accumulate (`vite.config.ts:1060`).
- **Method gate:** each handler does `if (req.method !== "<M>") return next();` — non-matching methods fall through to Vite (no 405; effectively 404 from Vite SPA fallback). **Parity note:** oRPC must reproduce "wrong method → not handled here" rather than emit 405.
- **No auth, no CORS headers, no request-id header.** Identity is internal only (see `studio/server-info`, run-in-game `serverInstanceId`).
- **Tuner timeout:** `DEFAULT_CIV7_TUNER_TIMEOUT_MS = 10_000` (`@civ7/direct-control`), referenced on nearly every Civ7 call.

---

| # | Method + Path | Purpose | Request shape | Response shape (success) + status codes | Side effects | Helpers (`src/server/*` + `@civ7/direct-control`) | Client call site → consumer | Effect service mapping | Parity risk |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `GET /api/civ7/status` | Civ7 playable status probe | none | `200 {ok: status.playable, status: PlayableStatus}`; `500 {ok:false, error}` | reads FireTuner socket (`getCiv7PlayableStatus`) | `getCiv7PlayableStatus` (`vite.config.ts:383`) | **No client caller** (server-only / dead or external). | `Civ7TunerClient.playableStatus()` | low — read-only; needs tuner socket ctx |
| 2 | `GET /api/civ7/map-summary` | Current map summary w/ area & region counts | none | `200 {ok:true, summary: MapSummary}`; `500 {ok:false,error}` | reads FireTuner socket | `getCiv7MapSummary({includeAreaRegionCounts:true})` (`vite.config.ts:395`) | **No client caller.** | `Civ7TunerClient.mapSummary()` | low |
| 3 | `GET /api/civ7/gameinfo?table=&limit=` | Read a GameInfo DB table | query: `table` (string, **required**), `limit` (number, default `100`) | `200 {ok:true, rows}`; `400 {ok:false,error}` (also for missing `table`) | reads FireTuner socket | `getCiv7GameInfoRows` (`vite.config.ts:412`) | **No client caller.** | `Civ7TunerClient.gameInfoRows(table,limit)` | low — note error status is **400** not 500 |
| 4 | `GET /api/civ7/live/status` | Aggregated live runtime status (status+appUi+mapSummary+autoplay) | none | `200 {ok, playable, observedAt, status, appUi, mapSummary, autoplay}` — `ok = playableStatus && readiness!=="unavailable"`; per-field `{error}` on partial failure via `Promise.allSettled`; `500 {ok:false,error}` only on outer throw | reads FireTuner socket (4 parallel `allSettled` calls) | `getCiv7PlayableStatus`, `getCiv7AppUiSnapshot`, `getCiv7MapSummary`, `getCiv7AutoplayStatus` (`vite.config.ts:424`) | `App.tsx:1042` (poll) → `buildLiveRuntimeStatusState`, drives `liveRuntime` state | `Civ7LiveStatus.snapshot()` aggregating `Civ7TunerClient` | **medium** — partial-failure envelope (`allSettled` → per-field `{error: String(reason)}`) and `ok`/`observedAt` derivation must be byte-identical |
| 5 | `GET /api/civ7/live/snapshot?x=&y=&width=&height=&fields=&playerId=&maxPlots=` | Map-grid tile window snapshot | query: `x`(0),`y`(0),`width`(24),`height`(18),`fields`(csv, default `terrain,biome,feature,resource,visibility,owner`),`playerId`(opt → number or omitted),`maxPlots`(clamp 1..512, default 512) | `200 {ok:true, observedAt, grid}`; `400 {ok:false,error}` | reads FireTuner socket | `getCiv7MapGrid` (`vite.config.ts:448`) | `App.tsx:986` (`readSnapshot`) → `buildLiveRuntimeSnapshotState`, `liveRuntimeSnapshot` state | `Civ7TunerClient.mapGrid(bounds,fields,...)` | **medium** — query parsing/clamping/defaults (esp. `maxPlots` clamp, `fields` csv split/trim/filter, `playerId` null→omit) must be exact |
| 6 | `GET /api/civ7/live/entities?playerId=&maxItems=` | Players + units + cities summary | query: `playerId`(opt→number/omit), `maxItems`(clamp 1..128, default 128) | `200 {ok:true, observedAt, players, units, cities}`; `400 {ok:false,error}` | reads FireTuner socket (3 parallel `Promise.all`) | `getCiv7PlayerSummary`,`getCiv7UnitSummary`,`getCiv7CitySummary` (`vite.config.ts:478`) | **No client caller.** | `Civ7TunerClient.entities(...)` | low–medium — `Promise.all` (not allSettled): any failure → whole 400 |
| 7 | `GET /api/civ7/live/gameinfo?tables=&limit=` | Multi-table GameInfo dump | query: `tables`(csv, default `Terrains,Biomes,Features,Resources,Maps,MapSizes`, **slice(0,8)**), `limit`(clamp 1..200, default 100) | `200 {ok:true, observedAt, tables: Record<table,rows>}`; `400 {ok:false,error}` | reads FireTuner socket (N parallel) | `getCiv7GameInfoRows` ×N (`vite.config.ts:496`) | **No client caller.** | `Civ7TunerClient.gameInfoTables(...)` | low–medium — 8-table cap + `Object.fromEntries` shape |
| 8 | `POST /api/civ7/autoplay` | Start/stop autoplay (verified) | body: `{action: "start"|"stop"}` | `200 {ok: result.verified, action, autoplay, game, gameContext, result}`; `400` (bad action); `409` (run-in-game OR save/deploy active, with `details.code`); `500 {ok:false,error}` | reads FireTuner socket; **mutates game state** (start/stop autoplay); waits on scripting log markers (`waitTimeoutMs=90s`) | `startCiv7Autoplay`/`stopCiv7Autoplay` w/ `approval={approved,reason,disposableSession:true}` (`vite.config.ts:515`) | `App.tsx:409` (`requestCiv7Autoplay`) → autoplay UI toggle | `Civ7Autoplay.start/stop()` + reads `OperationRegistry` for 409 guard | **HIGH** — cross-operation mutex (409 if run-in-game or save/deploy active), `verified` semantics, approval object, log-wait timing |
| 9 | `GET /api/studio/server-info` | Server identity / API version | none | `200 {ok:true, serverInstanceId, startedAt, runInGameApiVersion:2, viteCommand}` | none (pure) | uses module-level `STUDIO_SERVER_INSTANCE_ID`, `STUDIO_SERVER_STARTED_AT` (`vite.config.ts:575`) | **No client caller.** | `StudioServerInfo` layer (process-lifetime singleton) | medium — `serverInstanceId`/`startedAt` are stable per process; clients reconcile run-in-game state against these. Must remain a per-process singleton in Effect. |
| 10 | `GET /api/civ7/setup-config` | Civ7 setup-screen snapshot | none | `200 {ok:true, observedAt, setup, state, host, port}`; `503 {ok:false,error,observedAt}` | reads FireTuner socket | `getCiv7SetupSnapshot` (`vite.config.ts:585`) | `App.tsx:303` (`fetchCiv7SetupConfig`, abortable) → consumes `body.setup` | `Civ7TunerClient.setupSnapshot()` | low — note **503** on failure (unique), exposes `host`/`port` |
| 11 | `GET /api/civ7/saved-configs` | List saved game configurations | none | `200 {ok:true, observedAt, ...listResult(directory,configurations)}`; `500 {ok:false,error,observedAt}` | reads filesystem (Civ7 saved config dir) | `listCiv7SavedGameConfigurations` (`vite.config.ts:602`) | `App.tsx:348` (`fetchCiv7SavedSetupConfigs`) → consumes `directory`,`configurations` | `Civ7SavedConfigStore.list()` (fs ctx) | low |
| 12 | `GET /api/civ7/setup-catalog` | Leaders/civs/difficulties/speeds catalog from XML | none | `200 {ok:true, catalog: Civ7SetupCatalog}`; `500 {ok:false,error,observedAt}` | reads filesystem: repo `.civ7/outputs/resources` + Steam app Resources dir (macOS path) | `loadCiv7SetupCatalog({repoRoot})` (`vite.config.ts:616`, `src/server/civ7Resources/catalog.ts`) | `App.tsx:380` (`fetchCiv7SetupCatalog`) → catalog dropdowns | `Civ7ResourceCatalog.load()` (needs `repoRoot` + `appResourcesRoot` ctx) | medium — `repoRoot` derived from `import.meta.url`; app-resources root is **macOS/homedir-specific**; merge/precedence (app-resources overrides mirror) must hold |
| 13 | `GET /api/civ7/run-in-game/status?requestId=` | Poll run-in-game operation state | query: `requestId` (**required**) | `200 RunInGameOperationState`; `400 {ok:false,error:"Missing requestId"}`; `404 {ok:false,error, serverInstanceId, serverStartedAt}` | reads in-memory op store (prunes TTL) | `runInGameOperations.get` (`vite.config.ts:627`, `runInGame/operationState.ts`) | `App.tsx:287` (`fetchRunInGameStatus`, polled while running) | `RunInGameOperations.get(requestId)` | **HIGH** — 404 includes `serverInstanceId`/`serverStartedAt` so client detects server restart (lost op). State machine + TTL pruning must be ported exactly. |
| 14 | `POST /api/civ7/run-in-game` | Launch current/selected config in Civ7 (full pipeline) | body: `{recipeId, seed, mapSize, playerCount?, resources?, materialization:{mode}, recovery:{restartCivProcess?}, setupConfig, config, sourceSnapshot?, selectedConfig:{id,label,description,sourcePath,sortIndex,latitudeBounds}}` | `202 RunInGameOperationState` (accepted, async); `202` dup (same fingerprint, `details.duplicateRequest`); `409` (another run-in-game OR save/deploy active); `400`/`500`/`503` on validation/pipeline error via `RunInGameHttpError` (`details` carries code/materialization/recovery boundaries) | **MASSIVE.** Writes repo config file (`mods/.../src/maps/configs/*.config.json`); spawns `bun ... deploy:studio` (process); spawns `bun ... gen:maps` (regen, always in `finally`); reads/writes FireTuner socket; reads scripting log file; **optionally restarts Civ7 process via Steam (macOS only: osascript quit + pkill + `open steam://`)**; serialized through `studioOperationQueue` | `parseRunInGameSetupRequest`, `makeRepoMapEnvelope`, `assertRepoMapEnvelope`, `materializeRunInGameConfig`, `deploySwooperMapsForRun`, `regenerateSwooperMapArtifacts`, `restartCiv7ProcessViaSteam`→`shutdownCiv7MacProcess`/`launchCiv7MacViaSteamWithRetries`, `ensureCiv7SetupMapRowVisible`, `runCiv7SinglePlayerFromSetup`, `waitForFreshLogMarkers`, `waitForCiv7MapgenLogFailure`, `parseSwooperMapgenLogProof`, `buildRunInGame*Proof`, `fileIdentity`, `runInGameOperations.*` (`vite.config.ts:647`) | `App.tsx:251` (`runCurrentConfigInGame`) → kicks off, then polls #13 | `RunInGamePipeline.start(req)` orchestrating `MapConfigStore` + `DeployRunner` + `Civ7ProcessControl` + `Civ7TunerClient` + `ScriptingLog` + `ProofBuilder` + `OperationRegistry` | **HIGHEST** — see §"Hard parity cases". Operation state machine (9 phases), fingerprint dedup→202, dual mutex→409, proof identity (log markers + file sha256 + envelope/config hashes), log-failure classification, macOS process restart, disposable cleanup+regen in `finally`, serialized queue. |
| 15 | `GET /api/map-configs/status?requestId=` | Poll save/deploy operation state | query: `requestId` (**required**) | `200 MapConfigSaveDeployStatus`; `400` (missing); `404 {ok:false,error}` | reads in-memory op store (TTL prune) | `saveDeployOperations.get` (`vite.config.ts:1042`, `mapConfigs/operationState.ts`) | `App.tsx:213` (`fetchMapConfigSaveDeployStatus`, polled) | `MapConfigOperations.get(requestId)` | medium — 404 here does **not** include serverInstanceId (asymmetry vs #13); preserve. |
| 16 | `POST /api/map-configs` | Save config to repo + deploy (no Civ restart) | body: `{requestId?, id, sourcePath?, envelope, restart?, verifyRestart?}` (restart/verifyRestart **must be falsy** → else 400) | `202 MapConfigSaveDeployStatus` (async); `202` (idempotent: same active requestId returns current); `409` (run-in-game active OR different save/deploy active); `400 {ok:false,error}` on validation | Writes repo config file; spawns `bun ... deploy:studio`; on deploy failure **restores previous file content**; serialized via `studioOperationQueue` | `parseMapConfigSaveRequest`, `assertRepoMapEnvelope`, `deploySwooperMaps`, `restoreRepoConfig`, `saveDeployOperations.*` (`vite.config.ts:1057`) | `App.tsx:168` (`saveRepoConfig`→`/api/map-configs`), then polls #15 | `MapConfigPipeline.saveDeploy(req)` over `MapConfigStore` + `DeployRunner` + `MapConfigOperations` | **HIGH** — write-then-deploy with rollback on deploy-phase failure; idempotent requestId reuse; cross-op mutex with run-in-game; path-jail (`configRoot` prefix + `.config.json` suffix). |

**Endpoint count: 16** (8 with live client callers; 8 server-only/no caller — `civ7/status`, `civ7/map-summary`, `civ7/gameinfo`, `civ7/live/entities`, `civ7/live/gameinfo`, `studio/server-info` are not fetched anywhere in `src/`; they must still be ported for parity / external tooling).

> Stale doc-only references (`POST /api/generate`, `POST/GET /api/presets`) appear in `src/ui/types/index.ts:279,304,316` as comments — **no implementation, no caller.** Not endpoints; do not port.

---

## Helper module → behavior reference (for the implementer)

- **`runInGame/operationState.ts`** — in-memory `Map<requestId, state>` store. `create/update/complete/fail/findActive/get/prune`. TTL-prune on every access (`RUN_IN_GAME_OPERATION_TTL_MS = 30min`). `update` auto-advances `completedPhases`, computes `status` from phase (`statusForPhase`), computes `recoveryActions` (`recoveryActionsFor`). `fail` classifies into `blocked`/`failed`/`uncertain` (`classifyRunInGameFailure`: 409→blocked; timeout/socket-closed during starting-game/waiting-for-proof→uncertain). `RunInGameHttpError(statusCode, message, details)`.
- **`mapConfigs/operationState.ts`** — analogous store for save/deploy. Phases `queued|saving|deploying|complete|failed`. Same TTL.
- **`mapConfigs/deploy.ts`** — `buildSwooperMapsStudioDeployCommand({requestId?})` → `{command, args:["run","--cwd","mods/mod-swooper-maps","deploy:studio"], env}`. When `requestId` set, injects `SWOOPER_STUDIO_RUN_ID` env var (used downstream to stamp log proof).
- **`mapConfigs/requestValidation.ts`** — `parseMapConfigSaveRequest`: rejects `restart/verifyRestart===true`; id kebab-case; requestId pattern `^[a-zA-Z0-9._:-]+$`.
- **`runInGame/requestValidation.ts`** — `parseRunInGameSetupRequest`: `assertNoRawControlFields` (deep scan rejecting `command|script|javascript|rawJs|rawCommand` keys — **security boundary**); recipe pinned `mod-swooper-maps/standard`; mode `durable|disposable`; id kebab-case (`studio-current` for disposable); seed via `parseCiv7StudioSeed`; mapSize `MAPSIZE_*`; playerCount 1..64; `restartCivProcess`; `normalizeStudioSetupConfig`.
- **`runInGame/proofIdentity.ts`** — `fileIdentity` (sha256+size+mtime), `parseDeployTargetDir` (`/Deployed to:\s*(.+)$/m`), `buildRunInGameSourceSnapshotProof`, `buildRunInGameExactAuthorshipProof`, `parseSwooperMapgenLogProof`. All hashing is `sha256` over canonicalized JSON.
- **`runInGame/logFailure.ts`** — `classifyCiv7MapgenLogFailure` (regex over fresh scripting-log text → `map-script-load-failed` | `map-generation-script-failed`, with `dismissNotificationRequired`/`recoveryBoundary`), `waitForCiv7MapgenLogFailure` (poll loop w/ grace window).
- **`runInGame/macosProcessRestart.ts`** — pure(ish) functions taking injected `execFileAsync`/`sleep`/`tail`: `shutdownCiv7MacProcess` (osascript quit → pkill -f → pkill -9 -f, each with exit-poll), `launchCiv7MacViaSteamWithRetries` (`open steam://rungameid/1295660`, retries), `waitForMacProcessExit/Start`, `isMacProcessRunning` (pgrep). **macOS-only**, `Civ7MacSteamLaunchError`.
- **`civ7Resources/catalog.ts`** — `loadCiv7SetupCatalog({repoRoot, appResourcesRoot?})`: scans repo mirror + Steam app Resources, regex-parses Setup XML `<Row>`s, dedups (app-resources wins), sorts. `DEFAULT_CIV7_APP_RESOURCES_ROOT` is **homedir/macOS Steam path**.
- **`@civ7/direct-control`** — FireTuner socket client. Defaults: host `127.0.0.1`, port `4318` (env `CIV7_TUNER_HOST`/`CIV7_TUNER_PORT`), timeout `10s`. `DEFAULT_CIV7_SCRIPTING_LOG` (env `CIV7_SCRIPTING_LOG`). `createCiv7ControlRequestId(prefix)`.

---

## Proposed oRPC router shape

Contract-first. The existing helper modules already separate pure validation/state from IO; oRPC's contract-first mode (Zod/TypeBox schemas in a `contract/`, implementation in handlers that `provide` Effect layers) maps cleanly and lets the no-caller endpoints retain their exact response schemas as a published surface. The feature `status.ts` types (`RunInGameOperationStatus`, `MapConfigSaveDeployStatus`, `Civ7SetupCatalog`, etc.) become the canonical output schemas — reuse them so client typings don't drift.

Namespaced procedures (preserve path → procedure mapping so the client `fetch` migration is mechanical; mount the OpenAPI handler at `/api` so legacy paths keep working during cutover):

```
civ7.status                      GET  /api/civ7/status            (#1)
civ7.mapSummary                  GET  /api/civ7/map-summary       (#2)
civ7.gameInfo                    GET  /api/civ7/gameinfo          (#3)
civ7.live.status                 GET  /api/civ7/live/status       (#4)
civ7.live.snapshot               GET  /api/civ7/live/snapshot     (#5)
civ7.live.entities               GET  /api/civ7/live/entities     (#6)
civ7.live.gameInfo               GET  /api/civ7/live/gameinfo     (#7)
civ7.autoplay                    POST /api/civ7/autoplay          (#8)
civ7.setupConfig                 GET  /api/civ7/setup-config      (#10)
civ7.savedConfigs                GET  /api/civ7/saved-configs     (#11)
civ7.setupCatalog                GET  /api/civ7/setup-catalog     (#12)
runInGame.start                  POST /api/civ7/run-in-game       (#14)
runInGame.status                 GET  /api/civ7/run-in-game/status(#13)
mapConfigs.saveDeploy            POST /api/map-configs            (#16)
mapConfigs.status                GET  /api/map-configs/status     (#15)
studio.serverInfo                GET  /api/studio/server-info     (#9)
```

Namespaces: **`civ7`** (tuner reads + autoplay), **`civ7.live`** (live runtime sub-namespace), **`runInGame`**, **`mapConfigs`**, **`studio`**.

### Effect services / layers

| Service | Responsibility | Context needed |
|---|---|---|
| `Civ7TunerClient` | All FireTuner socket reads + autoplay mutation (wraps `@civ7/direct-control`) | host/port (`CIV7_TUNER_HOST/PORT`, default 127.0.0.1:4318), timeout |
| `Civ7LiveStatus` | Aggregates #4/#6/#7 with `allSettled`/`all` semantics | depends on `Civ7TunerClient` |
| `Civ7ResourceCatalog` | #12 XML catalog | `repoRoot`, `appResourcesRoot` (macOS homedir default) |
| `Civ7SavedConfigStore` | #11 saved-game fs listing | Civ7 saved-config dir (fs) |
| `MapConfigStore` | repo `*.config.json` read/write + path-jail + rollback | `repoRoot`, configRoot jail |
| `DeployRunner` (a.k.a. `ProcessControl`) | spawns `bun deploy:studio` / `gen:maps` | `repoRoot`, env (incl. `SWOOPER_STUDIO_RUN_ID`), timeouts, maxBuffer |
| `Civ7ProcessControl` | macOS quit/pkill/Steam-relaunch | macOS only; Steam app id, process pattern, all timeout consts |
| `ScriptingLog` | scripting-log snapshot/diff + fresh-marker wait + failure classify | `CIV7_SCRIPTING_LOG` path |
| `ProofBuilder` | sha256 file identity + log-proof + authorship proof | `repoRoot` |
| `RunInGameOperations` / `MapConfigOperations` | in-memory TTL stores (state machines) | TTL, `serverInstanceId`, `serverStartedAt`, `now` clock |
| `OperationQueue` | serializes run-in-game + save/deploy (single `studioOperationQueue`) | shared singleton |
| `StudioServerInfo` | #9 identity singleton | per-process `serverInstanceId`/`startedAt`/`viteCommand` |

---

## Context / middleware needs

- **Auth:** none today. No middleware needed; do **not** add auth (parity).
- **Request-id / proof identity:** server mints `createCiv7ControlRequestId(prefix)` per operation (NOT per HTTP request). This is *operation identity*, lives in the op-store, and is echoed in 404s as `serverInstanceId/serverStartedAt`. Model as service-level (`OperationRegistry`), not transport middleware. There is no incoming request-id header to honor.
- **Logging:** none structured today (handlers swallow into `{ok:false,error}`). Optional to add Effect logging, but error envelopes must stay identical.
- **Error mapping middleware:** central need. Today errors map ad-hoc per endpoint: `RunInGameHttpError.statusCode/details` (#14), fixed codes elsewhere (#3 `400`, #10 `503`, #11/#12 `500`). An oRPC error-mapping interceptor must translate Effect failures → the **exact** status code + `{ok:false, error, details?}` body per endpoint (status codes are NOT uniform — preserve the table above). Note partial-failure endpoints (#4) return **200** with embedded per-field errors — these are *not* errors at the transport layer.
- **Env/config injection:** a `StudioConfig` layer providing `repoRoot` (from `import.meta.url`/cwd), tuner host/port, scripting-log path, app-resources root, Steam app id, process pattern, and all the timeout constants (`vite.config.ts:59–76`). These are currently module-level consts — centralize them.
- **Singletons:** `serverInstanceId`, `serverStartedAt`, the two op-stores, and `studioOperationQueue` must be **process-lifetime singletons** (one Effect `Layer.scoped`/runtime, not per-request). Client restart-detection depends on `serverInstanceId` stability.

---

## The hard parity cases

### 1. Operation state machines (`RunInGameOperations`, `MapConfigOperations`) — #13/#14/#15/#16
- Run-in-game phases (`materializing → deploying → restarting-civ? → checking-civ7 → reload-needed? → preparing-setup → starting-game → waiting-for-proof → complete`) with derived `status`, accumulating `completedPhases`, and computed `recoveryActions` (`recoveryActionsFor` — includes `exit-to-shell-and-continue`, `restart-civ-process-and-retry`, `dismiss-civ-notification-and-retry` driven by `details` flags).
- Failure classification (`classifyRunInGameFailure`): `409→blocked`; `response-timeout`/`socket-closed`/`connection-timeout`/`all-hosts-unavailable` during `starting-game`/`waiting-for-proof` → **`uncertain`** (the operation may have succeeded — client must not retry blindly). Everything else `failed`.
- TTL pruning (30 min) on every store access; pruned op → 404.
- **Move to Effect:** a `Ref`-backed store inside a scoped layer. Keep `now` injectable for tests. The phase-advance/`completedPhases`/`recoveryActions` derivation is pure — port verbatim from `operationState.ts`. Status codes for status-poll (200/400/404) and the **404 `serverInstanceId/serverStartedAt` echo** must be preserved.

### 2. `macosProcessRestart` — #14 (`recovery.restartCivProcess`)
- Sequence: `osascript` graceful quit → poll exit (45s) → `pkill -f` → poll (30s) → `pkill -9 -f` → poll (15s); then `open steam://rungameid/1295660` with up to 6 attempts × 20s start-wait; then poll `getCiv7SetupSnapshot` until `phase==="shell"` (180s). Hard-fails if shell not reached.
- **macOS-only guard** (`process.platform !== "darwin"` throws).
- **Move to Effect:** `Civ7ProcessControl` layer with injected `execFileAsync`/`sleep` (already injected in the helper — port mechanically). Preserve every timeout constant and the exact command strings (they appear in the `processRestart` proof payload returned to the client). Keep the platform guard as a typed failure.

### 3. `proofIdentity` — #14
- The "exact authorship proof" chains: `sourceSnapshot` hash → `configHash`/`envelopeHash` (sha256 of canonicalized JSON, `vite.config.ts:94–108`) → file identities (`fileIdentity`: sha256+size+mtime of generated source / local mod / deployed mod scripts) → setup row proof → start map summary → **log proof** (`parseSwooperMapgenLogProof` matching markers `[mapgen-proof]`, requestId, configHash, envelopeHash, `[mapgen-complete]` in the fresh scripting log, with `rejectPattern` for TextEncoder/Uncaught/Exception/Error).
- This is the integrity contract: it proves the map that ran is *exactly* the authored config. Hashing must be byte-identical (same canonicalization, same field ordering, same sha256).
- **Move to Effect:** a pure `ProofBuilder` service (no IO except `fileIdentity` which needs fs). Port `canonicalize`/`stableHash` and all `build*Proof`/`parse*Proof` functions unchanged. Any drift in JSON key ordering or hash input breaks proof verification.

### 4. `logFailure` capture — #14
- After a launch or proof-wait throws, the pipeline races a **grace-window poll** (`SCRIPTING_LOG_FAILURE_GRACE_MS=5s`, `250ms` interval) reading *fresh* scripting-log text (diffed against a pre-launch `snapshotFile`) and classifies `map-script-load-failed` vs `map-generation-script-failed`, attaching `dismissNotificationRequired`/`recoveryBoundary:"civ-notification-dismiss"`. This converts an opaque tuner error into an actionable `RunInGameHttpError(500, ...)` with recovery hints.
- **Move to Effect:** `ScriptingLog` service holding the pre-launch snapshot in scope; `waitForCiv7MapgenLogFailure`/`classifyCiv7MapgenLogFailure` are pure over text — port verbatim. Timing (grace + interval) and the diff-from-snapshot semantics (`logTextFromSnapshot`/`readFreshLogText`) must be preserved or proof/failure detection flakes.

### 5. Serialized operation queue + dual mutex — #8/#14/#16
- A single module-level `studioOperationQueue` Promise chains run-in-game and save/deploy so they never overlap; additionally each entrypoint checks `findActive()` on **both** stores and returns `409` (with `details.code = run-in-game-operation-active` | `save-deploy-operation-active`). Run-in-game also dedups identical `requestFingerprint` → `202` instead of `409`. Autoplay (#8) is gated by both stores too.
- **Move to Effect:** an `OperationQueue` service (`Effect.Semaphore` of permit 1) plus mutex checks reading both registries. Preserve: fingerprint→202 dedup, 409 `details` shapes, and that the actual work runs **after** the 202/202 response is sent (fire-and-forget via the queue), which the status-poll endpoints then observe.

---

## One-screen summary

- **Endpoint count: 16** (`vite.config.ts` `configureServer`, lines 379–1147). 8 have live `src/App.tsx` callers; 8 are server-only with no current client caller but must still be ported. Stale `/api/generate` + `/api/presets` are comment-only — not real.
- **Router namespaces:** `civ7.*` (status, mapSummary, gameInfo, autoplay, setupConfig, savedConfigs, setupCatalog), `civ7.live.*` (status, snapshot, entities, gameInfo), `runInGame.*` (start, status), `mapConfigs.*` (saveDeploy, status), `studio.*` (serverInfo). Contract-first, OpenAPI handler mounted at `/api` so legacy paths stay live during cutover.
- **Top 3 parity-risk endpoints:**
  1. **`POST /api/civ7/run-in-game` (#14)** — the whole hard-parity surface: 9-phase state machine, fingerprint dedup→202, dual mutex→409, sha256 proof identity, log-failure classification, macOS Steam process restart, disposable cleanup+regen in `finally`, serialized queue.
  2. **`GET /api/civ7/run-in-game/status` (#13)** — restart-detection contract: 404 echoes `serverInstanceId`/`serverStartedAt`; `uncertain`/`blocked` failure classes; TTL pruning. Drift here corrupts the client's recovery UX.
  3. **`POST /api/map-configs` (#16)** — write-then-deploy with **rollback on deploy-phase failure**, idempotent requestId reuse, cross-op mutex with run-in-game, and the config-path jail.

  (Honorable mention: **`POST /api/civ7/autoplay` (#8)** for its `verified` semantics + dual-store 409 mutex + log-wait timing.)
