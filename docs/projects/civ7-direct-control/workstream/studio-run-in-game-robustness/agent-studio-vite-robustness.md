# Agent Report: Studio/Vite Robustness

## Scope

Frame: Studio/Vite robustness lane for `apps/mapgen-studio` Run in Game, Vite
middleware, dev-server identity, Turbo freshness, HMR/full reload caused by
artifact generation, and operation status durability.

Selected out: direct-control protocol logic in Studio, raw setup JavaScript,
FireTuner/Windows bridge fallback, production code changes, and generated output
hand edits.

## Severity-Ordered Findings

### P1: Run in Game is coupled to one browser fetch and one React component lifetime.

`apps/mapgen-studio/src/App.tsx` keeps Run in Game state only in
`runInGameRunning` (`useState(false)`) and resets it after the awaited fetch
returns. The request helper `runCurrentConfigInGame` posts to
`/api/civ7/run-in-game` and returns only the terminal HTTP response. There is no
request id before the operation has completed, no status route, no rehydration
from `sessionStorage`/`localStorage`, and no durable server-side operation
record.

The Vite middleware in `apps/mapgen-studio/vite.config.ts` does not return until
the whole operation finishes: it materializes a config, snapshots logs, deploys
the mod, checks setup row visibility, may exit Civ7 to shell and reload UI,
starts the game, waits for log proof, cleans up, regenerates artifacts, and only
then calls `writeJson(res, 200, ...)`. A browser full reload, HMR invalidation,
navigation, fetch abort, or renderer crash during that window loses the only UI
state and leaves the user with no authoritative way to know whether the request
is still running, succeeded, failed, or reached an uncertainty boundary.

Evidence:

- `apps/mapgen-studio/src/App.tsx:171-190`: `runCurrentConfigInGame` awaits one
  POST and collapses fetch aborts into `{ ok: false, error }`.
- `apps/mapgen-studio/src/App.tsx:528`: Run in Game state is only
  `const [runInGameRunning, setRunInGameRunning] = useState(false)`.
- `apps/mapgen-studio/src/App.tsx:1215-1249`: `handleRunInGame` sets the
  in-memory boolean, awaits the POST, clears the boolean, and emits only a toast.
- `apps/mapgen-studio/vite.config.ts:507-604`: the server creates `requestId`
  but exposes it only in the final 200 response after all side effects finish.
- `apps/mapgen-studio/vite.config.ts:599-604`: `saveDeployRestartQueue`
  serializes runs in memory but is not an operation ledger and cannot answer a
  reload-time status query.

Proposed implementation:

- Make `/api/civ7/run-in-game` an operation-accepting endpoint. It should
  validate input, allocate `requestId`, create an operation record, enqueue work,
  and return `202 Accepted` immediately with `{ requestId, serverId, statusUrl }`.
- Add `GET /api/civ7/run-in-game/:requestId` for authoritative status. Optional
  SSE can improve UX, but polling is enough for recovery.
- Persist each operation record to a Studio-owned runtime state path, for
  example `.tmp/mapgen-studio/run-in-game/<serverId>/<requestId>.json`. The
  record should include `serverId`, `requestId`, phase, terminal status,
  timestamps, completed phases, materialization mode/path/mapScript, hashes,
  deploy command summary, direct-control failure code/details, reload attempt
  details, cleanup state, and copyable diagnostics.
- In the client, store `{ serverId, requestId }` as soon as the POST is accepted
  and rehydrate it on mount. The browser cache is only a pointer; the server
  status is authoritative.
- Keep all direct-control protocol logic in `@civ7/direct-control`. Studio
  middleware should call typed wrappers such as `ensureCiv7SetupMapRowVisible`
  and `runCiv7SinglePlayerFromSetup`, not raw setup JavaScript.

### P1: Run in Game writes files in Vite's watched/client-imported graph, so a tab refresh is expected.

The current Run in Game implementation mutates source and generated artifacts
that are part of the Studio dev server's module graph.

Disposable mode writes
`mods/mod-swooper-maps/src/maps/configs/studio-current.config.json`, deploys,
then cleanup removes/restores it and regenerates map artifacts. Durable mode can
rewrite the selected built-in config source path. The mod deploy script runs
`bun run build`, and `build` runs `gen:maps && tsup`. `gen:maps` deletes and
rewrites every `src/maps/generated/*.ts`, rewrites `mod/config/config.xml`,
`mod/swooper-maps.modinfo`, `mod/text/en_us/MapText.xml`, and rewrites
`dist/recipes/standard-map-configs.js` plus related schema/declaration files.

Studio imports generated recipe artifacts and built-in map configs from
`mod-swooper-maps` package exports. Those exports point at `dist/recipes/*.js`.
Vite's current config only pins `server.port = 5173`; it does not set
`server.watch.ignored`, `handleHotUpdate`, or any operation-aware reload
guard. Vite documentation says the dev server watches the root and applies HMR
for watched-file updates, and that a full reload happens when HMR is not
handled. Because these generated modules are imported by Studio and are not
React-only HMR boundaries, a full page reload during Run in Game is a plausible
and expected outcome.

Evidence:

- `apps/mapgen-studio/vite.config.ts:258-290`: `materializeRunInGameConfig`
  writes into `mods/mod-swooper-maps/src/maps/configs`.
- `apps/mapgen-studio/vite.config.ts:94-115`: Run in Game deploy invokes
  `bun run --cwd mods/mod-swooper-maps deploy` with `SWOOPER_STUDIO_RUN_ID`.
- `mods/mod-swooper-maps/package.json:30-32`: `build` runs `gen:maps && tsup`;
  `gen:maps` is the artifact generator.
- `mods/mod-swooper-maps/package.json:45` onward: `deploy` builds dependencies,
  runs the mod build, then deploys `mod/`.
- `mods/mod-swooper-maps/scripts/generate-map-artifacts.ts:21-25`: generator
  target directories include `src/maps/configs`, `src/maps/generated`, `mod/*`,
  and `dist/recipes`.
- `mods/mod-swooper-maps/scripts/generate-map-artifacts.ts:277-292`: generator
  removes generated TS entries and rewrites generated TS, mod XML, modinfo,
  text XML, schema, `standard-map-configs.js`, and declarations.
- `mods/mod-swooper-maps/package.json:20-27`: package exports for
  `standard-artifacts` and `standard-map-configs` point to `dist/recipes`.
- `apps/mapgen-studio/src/recipes/catalog.ts:75-86`: Studio imports
  `mod-swooper-maps/recipes/standard-artifacts`,
  `mod-swooper-maps/recipes/standard-map-configs`, and browser-test artifacts.
- `apps/mapgen-studio/vite.config.ts:698-700`: Vite server config has only a
  port, so default file watching/HMR behavior applies.
- Vite docs: `server.watch` watches the root and updates via HMR when watched
  files change; full reload is used when HMR is not handled:
  <https://vite.dev/config/server-options.html#server-watch> and
  <https://vite.dev/guide/troubleshooting.html#a-full-reload-happens-instead-of-hmr>.

Proposed implementation:

- Stop making Run in Game mutate Studio-imported source/dist artifacts. Preferred
  path: add a mod-side request-scoped run materialization path that can build and
  deploy a map script from an external operation config without rewriting
  `src/maps/configs`, `src/maps/generated`, or `dist/recipes/*` that Studio
  imports.
- Durable mode should not rewrite the selected source config as part of Run in
  Game. If the current Studio config is clean and matches the selected built-in
  config, deploy the existing artifact. If it differs, require an explicit save
  or run as disposable.
- If any temporary files must be written, put them under a path outside the
  client import graph and configure Vite to ignore that runtime state path.
- Treat `server.watch.ignored` as a secondary guard, not the main fix. Ignoring
  imported generated files may reduce reloads, but it can also leave the UI's
  imported preset list stale. The stronger boundary is to avoid touching
  imported files during a launch operation.

### P1: Dev-server identity is not authoritative, so recovery cannot distinguish "same operation" from "new server/new state".

The current Vite middleware is an anonymous process. The client has no server
identity to pin an accepted request to, and the server has no boot id or
operation namespace to report after a reload. If the Vite dev server restarts
while Civ7 is still changing state, the new process cannot classify an old
browser pointer. If the browser reloads while the old process is still running,
the new page cannot know whether the same server accepted the prior run.

Evidence:

- `apps/mapgen-studio/vite.config.ts` has module-scope state only:
  `saveDeployRestartQueue`, with no exported or API-visible server identity.
- `apps/mapgen-studio/src/App.tsx` has no boot-time server handshake before
  enabling Run in Game.
- `apps/mapgen-studio/vite.config.ts:507`: `requestId` is created after input
  validation but before the long operation; it is not returned until
  `apps/mapgen-studio/vite.config.ts:582-597`.

Proposed implementation:

- Generate a `serverId` and `serverStartedAt` once at Vite plugin initialization.
- Add `GET /api/studio/server` returning `{ serverId, serverStartedAt, repoRoot,
  branch?, dirtySummary? }`. Branch/dirty fields are diagnostic only; avoid
  blocking UI on Git.
- Every Run in Game operation record includes `serverId`. Client rehydration
  checks `/api/studio/server`; if the cached request's server id differs, show
  an `unknown-after-server-restart` state and provide only non-mutating
  classification actions.
- Use idempotency keys from the client for accepted requests. A duplicate POST
  with the same idempotency key should return the existing request status
  instead of enqueueing another mutating launch.

### P1: Duplicate clicks after reload can enqueue a second mutating launch while the first launch is still running.

Because browser reload clears `runInGameRunning`, the button can become enabled
while the original server-side promise is still in `saveDeployRestartQueue`.
The next click creates a new request and appends it behind the first. This can
rewrite `studio-current.config.json`, regenerate artifacts, deploy different
hashes, or issue another setup/start action after the first operation reaches a
later phase. That is a browser-click reliability failure, not just a UI polish
issue.

Evidence:

- `apps/mapgen-studio/src/App.tsx:1215-1218`: duplicate suppression is local to
  the current React component instance.
- `apps/mapgen-studio/vite.config.ts:599-604`: server queue serializes work but
  does not dedupe semantically equivalent requests or reject conflicting active
  operations.
- `apps/mapgen-studio/vite.config.ts:575-580`: cleanup/regeneration runs in a
  `finally`, so a second queued request can observe repo artifacts changed by
  the first run's cleanup path.

Proposed implementation:

- Maintain one active Run in Game operation per dev-server identity unless the
  user explicitly starts a new operation after acknowledging the current one is
  terminal or unknown.
- Deduplicate by client idempotency key and content hash. If the same browser
  retries after a reload, return the existing operation. If a different config
  is submitted while an operation is active, return `409 active-operation` with
  the active request id and status URL.
- Record phase completion before each mutating side effect and after each
  cleanup step so recovery can say whether a replay is allowed.

### P2: The live status poll still calls gameplay-only APIs during shell/setup states.

`/api/civ7/live/status` calls `getCiv7PlayableStatus`,
`getCiv7AppUiSnapshot`, `getCiv7MapSummary`, and `getCiv7AutoplayStatus`
concurrently. The footer displays a red live status and error text when `body.ok`
is false. In shell/main-menu, gameplay globals can be unavailable; the
workstream brief already observed a shell health error like `Game is not
defined`. This does not directly cause the Vite reload, but it can overwrite the
operator's mental model while Run in Game is failing/recovering and can make a
valid shell/setup state look broken.

Evidence:

- `apps/mapgen-studio/src/App.tsx:588-615`: the poll runs every 3-5 seconds and
  records an error when the composed live status is not ok.
- `apps/mapgen-studio/src/ui/components/AppFooter.tsx:93-100`: footer renders a
  red dot and error text for `liveRuntime.status === "error"`.
- `packages/civ7-direct-control/src/index.ts:1420-1458`:
  `getCiv7PlayableStatus` can classify `shell`, `loading`, `begin-ready`,
  `app-ui-game`, and `tuner-ready` from App UI/tuner state.

Proposed implementation:

- Split shell-safe readiness from gameplay live telemetry. The footer should be
  able to show `shell`, `loading`, `begin-ready`, and `tuner-ready` without
  labeling shell as an error.
- Only call gameplay-only map/entity/autoplay APIs after App UI indicates a
  running game or after a setup/start operation reaches the appropriate phase.
- Preserve Run in Game operation status as a separate surface from passive live
  telemetry.

### P2: Turbo/preflight freshness is mostly correct for startup, but Run in Game bypasses that model during the operation.

The root `dev:mapgen-studio` script goes through Turbo, and
`mapgen-studio#dev` depends on `^build` and
`mod-swooper-maps#build:studio-recipes`. The app-local `dev` script also runs
`ensure-studio-recipe-artifacts.mjs` before Vite. That is good startup
freshness.

The problem is not startup freshness; the problem is that Run in Game re-enters
the build/deploy pipeline from inside a live Vite request and writes the same
artifact families that Turbo/Vite treat as build/import outputs. That mixes
"make Studio's imported artifacts fresh" with "launch this one map in Civ7".

Evidence:

- `package.json:16`: root `dev:mapgen-studio` runs
  `turbo run dev --filter=mapgen-studio`.
- `turbo.json:17-20`: `mapgen-studio#dev` depends on upstream builds and
  `mod-swooper-maps#build:studio-recipes`.
- `apps/mapgen-studio/package.json:8`: app `dev` runs the preflight before
  `vite`.
- `scripts/preflight/ensure-studio-recipe-artifacts.mjs:8-30`: preflight
  requires recipe and Studio artifact outputs.
- `scripts/preflight/ensure-studio-recipe-artifacts.mjs:34-44` and `86-110`:
  preflight compares source/dist mtimes and rebuilds `build:studio-recipes`
  when stale.

Proposed implementation:

- Keep Turbo/preflight for dev-server startup and app build/check/test gates.
- Move operation-time launch materialization to a runtime path or a mod package
  command that does not refresh Studio's imported recipe artifacts.
- Add a narrow verification gate that proves Run in Game does not change the
  mtimes/content of files imported by `apps/mapgen-studio/src/recipes/catalog.ts`.

## Proposed Phase Model

Use explicit, persisted phases:

- `accepted`: request validated, `requestId` and `serverId` allocated.
- `materializing`: request-scoped launch inputs are being prepared.
- `deploying`: mod deployment is running.
- `checking-civ7`: shell-safe App UI/direct-control readiness is being read.
- `ensuring-setup-row`: setup row visibility is being checked.
- `reload-needed`: row is missing and a disruptive reload/exit boundary is
  required or has been authorized.
- `preparing-setup`: map/size/seed/options are being applied.
- `starting-game`: Begin Game/start command issued.
- `waiting-for-proof`: waiting for log markers/hash proof.
- `restoring-artifacts`: temporary materialization cleanup is running.
- `succeeded`: terminal success with proof details.
- `failed`: terminal failure before uncertainty.
- `blocked`: user action required; no automatic replay.
- `unknown`: server/browser restart or lost transport after a mutating phase.

Replay rule: never silently replay after `preparing-setup`, `starting-game`, or
`waiting-for-proof`. Recovery actions there must first classify current Civ7
state and compare request hashes/log markers.

## Tests And Proof

- Unit-test the operation store: accepted record is written before side effects;
  each phase transition is persisted; terminal success/failure survives a page
  reload; server-id mismatch returns `unknown-after-server-restart`.
- Middleware tests: POST returns `202` immediately with request id; duplicate
  idempotency key returns the existing operation; conflicting active request
  returns `409 active-operation`; direct-control failures include phase, failure
  class, code, completed phases, materialization, reload details, and
  diagnostics.
- Studio tests: Run in Game UI rehydrates an accepted request after remount,
  polls status, disables duplicate launch for active operation, and displays
  phase-specific recovery actions.
- Vite proof: run Studio under Vite, trigger a stubbed Run in Game operation,
  touch/regenerate the current generated artifact paths, and listen for
  `vite:beforeFullReload`. The passing condition is either no full reload
  during operation or, if a reload is forced, the new tab shows the same active
  request id and phase from server status.
- Artifact proof: during Run in Game, assert no content/mtime changes under
  `mods/mod-swooper-maps/dist/recipes/*` imported by Studio and no changes to
  `mods/mod-swooper-maps/src/maps/generated/*` unless the final chosen design
  explicitly accepts and guards those changes.
- Direct-control proof: shell/main-menu, loading, begin-ready, running-game,
  stale-listener/LSQ, durable, and disposable paths each produce phase records
  and recovery classifications. Live Civ proof remains required for claims about
  actual game load/start behavior.
- Existing broad gate to keep: `bun run verify:studio-run-in-game`, after the
  targeted tests are added and the dependent OpenSpec task state is reconciled.

## Risks And Non-Goals

- Ignoring Vite watch paths alone is risky because the imported Studio preset
  list may become stale. It is useful as a guard for runtime-only paths, not as
  the primary architecture.
- Persisting operations only in browser storage is insufficient; browser storage
  is a pointer, not authority.
- Persisting operations only in Vite module memory is insufficient; it fails
  after dev-server restart and cannot classify unknown side effects.
- Retrying mutating direct-control commands after a socket close or page reload
  can launch the wrong map or issue a second Begin Game. Recovery must be
  phase-aware.
- No bridge fallback, raw setup JavaScript, or Studio-owned direct-control
  protocol logic should be added in this lane.
- This report does not claim in-game correctness. It is source/config analysis
  plus Vite behavior analysis; live proof must still be recorded separately.

## Review Responsibility: Remaining Browser-Click Reliability Failure Modes

- P1: A full page reload during operation still breaks click reliability unless
  the new page immediately rehydrates `{ serverId, requestId }` and shows
  authoritative server status.
- P1: A second click after reload still breaks reliability unless the server
  deduplicates by idempotency key and rejects conflicting active operations.
- P1: A Vite dev-server restart after a mutating phase still breaks reliability
  unless the client sees a server-id mismatch and enters `unknown` instead of
  pretending the operation failed safely.
- P1: Operation-time writes to `dist/recipes`, `src/maps/generated`, or
  canonical config JSON still risk reload/reset unless those writes are removed
  from the launch path or the operation status is durable enough to survive
  them.
- P2: Shell-safe readiness still needs to be separated from gameplay telemetry;
  otherwise valid shell/setup states can look like broken Civ7 health and mask
  the real recovery action.
- P2: A long deploy/log-proof wait still needs visible phase progress and
  elapsed time; otherwise the user cannot distinguish a slow launch from a dead
  click.
