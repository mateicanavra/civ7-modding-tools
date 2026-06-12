# Integration/Cleanup Lane Report

Date: 2026-05-31
Lane: Integration/cleanup auditor
Output contract: map CLI, Studio, docs, tests, and legacy references for the
expanded `@civ7/direct-control` surface; identify obsolete FireTuner/Windows
bridge or duplicated direct-control behavior to remove or quarantine once
parity/better coverage is proven.

## Evidence Labels

- `[source]`: repo source, package docs, workstream docs, OpenSpec records, or
  local search results inspected in this lane.
- `[official-resource]`: checked-in official Civ7 resource mirror evidence.
- `[recorded-live-proof]`: live proof recorded in prior workstream artifacts.
- `[fresh-live-proof]`: live proof newly collected by this lane. None was
  collected; this lane was source/documentation analysis only.
- `[inference]`: recommendation derived from labeled evidence.
- `[unresolved]`: still needs implementation, proof, or owner decision.

## Summary

- `[source]` The current implementation already routes CLI game commands through
  `@civ7/direct-control`: `game restart`, `game exec`, `game health`, and
  `game inspect` import package APIs from `packages/civ7-direct-control/src/index.ts`.
- `[source]` Studio's Vite dev endpoint in `apps/mapgen-studio/vite.config.ts`
  imports `restartCiv7GameAndBegin`, `snapshotFile`, and
  `waitForFreshLogMarkers` from `@civ7/direct-control`; it does not implement
  raw socket framing locally.
- `[source]` Active cleanup specs explicitly forbid a FireTuner/Windows bridge
  fallback and preserve FireTuner only as reference-client evidence:
  `openspec/changes/remove-firetuner-bridge-legacy/**` and
  `packages/civ7-direct-control/README.md`.
- `[recorded-live-proof]` The prior direct-control surface workstream records
  direct listener discovery, App UI restart/begin, `GameStarted`, Tuner health,
  and fresh `Scripting.log` proof in
  `openspec/changes/remove-firetuner-bridge-legacy/workstream/cutover-note.md`
  and the `civ7-direct-control-surface` verification artifacts.
- `[inference]` The integration slice should not rebuild transport. It should
  add thin CLI/Studio consumers over new package wrappers, add focused tests for
  those consumers, and delete or quarantine any remaining active guidance that
  tells tools or agents to use bridge fallback behavior.

## Files Inspected

- `[source]` `packages/cli/AGENTS.md`
- `[source]` `packages/cli/src/commands/game/restart.ts`
- `[source]` `packages/cli/src/commands/game/exec.ts`
- `[source]` `packages/cli/src/commands/game/health.ts`
- `[source]` `packages/cli/src/commands/game/inspect.ts`
- `[source]` `packages/cli/test/commands/game.control.test.ts`
- `[source]` `packages/cli/test/commands/game.restart.test.ts`
- `[source]` `apps/mapgen-studio/vite.config.ts`
- `[source]` relevant Studio source references from `rg` under
  `apps/mapgen-studio/**`
- `[source]` `packages/civ7-direct-control/README.md`
- `[source]` `packages/civ7-direct-control/AGENTS.md`
- `[source]` `packages/civ7-direct-control/src/index.ts`
- `[source]` `packages/civ7-direct-control/test/direct-control.test.ts`
- `[source]` `docs/system/cli/overview.md`
- `[source]` `docs/projects/civ7-direct-control/**`
- `[source]` `openspec/changes/remove-firetuner-bridge-legacy/**`
- `[source]` targeted `rg` results for `FireTuner`, `firetuner`, `bridge`,
  `direct-control`, `DirectControl`, `CIV7_FIRETUNER`, `firetunerBridge`, and
  `firetunerSocket`

## Current Integration Map

### Direct-Control Package

- `[source]` `@civ7/direct-control` currently owns default host/port config,
  host discovery, `LSQ:` state discovery, `CMD:<stateId>:<javascript>`
  execution, framed socket parsing/encoding, persistent sessions, state
  selection by role/name/id, App UI snapshots, Tuner readiness, restart/begin,
  health polling, and fresh log marker proof helpers.
- `[source]` Public package helpers already include
  `executeCiv7Command`, `executeCiv7AppUiCommand`,
  `executeCiv7TunerCommand`, `inspectCiv7RuntimeApi`,
  `getCiv7AppUiSnapshot`, `beginCiv7Game`, `restartCiv7Game`,
  `restartCiv7GameAndBegin`, `checkCiv7DirectControlHealth`,
  `checkCiv7TunerHealth`, `waitForCiv7DirectControl`,
  `waitForCiv7TunerReady`, `snapshotFile`, and `waitForFreshLogMarkers`.
- `[inference]` All expanded wrappers should land here first. CLI, Studio, and
  agent workflows should consume package-level read/action APIs instead of
  embedding JavaScript command strings or protocol handling locally.

### CLI

- `[source]` `game restart` is a direct App UI lifecycle wrapper around
  `Network.restartGame()`, with `--begin` and `--wait-tuner`.
- `[source]` `game exec` is the raw expert escape hatch for arbitrary command
  execution against a selected state.
- `[source]` `game health` checks listener/state readiness and has `--tuner`
  for the post-Begin Tuner gameplay canary.
- `[source]` `game inspect` exposes bounded root inspection and
  `--app-ui-snapshot`.
- `[source]` CLI tests mock the framed tuner socket directly in tests, but the
  command implementations use `@civ7/direct-control`; the duplicate protocol
  code is test fixture code, not production transport.
- `[inference]` New CLI commands should be presentation layers over wrapper
  APIs, not new raw command builders. Keep `game exec` for expert debugging,
  but do not make it the normal path for Studio, mapgen proof, or agents.

### Studio

- `[source]` The current Studio dev server endpoint writes a repo map config,
  runs `mods/mod-swooper-maps deploy`, calls package restart/begin/Tuner-ready
  helpers, and optionally waits for fresh log markers.
- `[source]` Studio UI code currently treats restart as part of save/deploy
  success/failure messaging. `rg` found no active Studio-owned FireTuner bridge
  code outside the Vite endpoint's direct-control imports.
- `[inference]` Studio should receive new direct-control behavior as explicit
  dev server API endpoints, not browser-side socket access. Browser code should
  call local `/api/*` endpoints; Vite/server code should call
  `@civ7/direct-control`.

### Docs And Workstream Records

- `[source]` Active direct-control docs say FireTuner is reference-client
  evidence only, not a required runtime. The bridge removal OpenSpec says no
  fallback, no FireTuner clone, and no deletion of official FireTuner binaries.
- `[source]` `.agents/skills/civ7-operational-debugging/**` still has
  FireTuner-named reference material, but the inspected active guidance routes
  runtime commands to `civ7 game restart`, `game exec`, and `game health`.
- `[source]` `docs/_archive/**` and old engine-refactor archive/project files
  contain unrelated or historical uses of "bridge" and some old FireTuner
  references.
- `[inference]` Active docs should be tightened when wrappers land. Historical
  archives should not be mass-deleted; at most add archive context if a live
  path links to stale bridge guidance as current instruction.

## Recommended CLI Command/API Shape

### Package API First

- `[inference]` Add read-only wrappers in `@civ7/direct-control` before CLI:
  `getCiv7PlayableStatus()`, `getCiv7MapSummary()`,
  `getCiv7PlotSnapshot(x, y, playerId?)`, `getCiv7MapGrid({ fields, bounds })`,
  `getCiv7PlayerSummary(playerId?)`, `getCiv7UnitSummary(playerId?)`,
  `getCiv7CitySummary(playerId?)`, `getCiv7VisibilitySummary(playerId)`, and a
  bounded `inspectCiv7Root({ state, root, maxKeys })`.
- `[inference]` Keep lifecycle methods App UI-owned:
  `restartCiv7Game()`, `beginCiv7Game()`,
  `restartCiv7GameAndBegin({ waitForTuner })`.
- `[inference]` Keep Tuner gameplay reads Tuner-preferred after
  `waitForCiv7TunerReady()`. Do not route restart/begin through Tuner.
- `[inference]` Mutating wrappers should be validator-first and explicit:
  `getAutoplayStatus()`, `setAutoplay({ turns, observeAsPlayer, returnAsPlayer })`,
  `stopAutoplay()`, then later `canStart*Operation` before any `request*Operation`.
  Mutating wrappers must not auto-retry after reconnect or socket failure.

### CLI Presentation

- `[inference]` Add read commands as stable JSON-first surfaces:
  - `civ7 game status --json`
  - `civ7 game map summary --json`
  - `civ7 game map plot <x> <y> --player <id> --json`
  - `civ7 game map grid --fields terrain,biome,feature,resource --bounds x,y,w,h --json`
  - `civ7 game player summary [playerId] --json`
  - `civ7 game unit summary [playerId] --json`
  - `civ7 game city summary [playerId] --json`
  - `civ7 game map visibility summary <playerId> --json`
- `[inference]` Add catalog/inspection commands after the package catalog
  schema exists:
  - `civ7 game inspect root <root> --state Tuner --max-keys <n> --json`
  - `civ7 game catalog snapshot --state Tuner --out <path>`
- `[inference]` Add mutating commands only after package wrappers and proof:
  - `civ7 game autoplay status --json`
  - `civ7 game autoplay start --turns <n> --observe-as <id> --return-as <id> --json`
  - `civ7 game autoplay stop --json`
  - later validator-first `game action can-start ...` commands before any
    `game action request ...`.
- `[source]` Existing public commands and flags should remain compatible:
  `game restart`, `game exec`, `game health`, and `game inspect`.
- `[inference]` Compatibility concern: avoid changing existing JSON envelope
  fields (`ok`, `request`, `response`, `health`, `inspection`, `snapshot`) in
  place. Add new command surfaces or additive fields instead.

## Studio Endpoint Candidates

- `[inference]` Add Vite dev server endpoints that call package wrappers:
  - `GET /api/civ7/status`: wraps `getCiv7PlayableStatus()`.
  - `GET /api/civ7/map/summary`: wraps `getCiv7MapSummary()`.
  - `GET /api/civ7/map/plot?x=&y=&playerId=`: wraps `getCiv7PlotSnapshot`.
  - `POST /api/civ7/map/grid`: bounded fields/bounds request for
    `getCiv7MapGrid`.
  - `GET /api/civ7/player/:id/summary`: wraps player summary.
  - `POST /api/civ7/compare/mapgen-runtime`: later endpoint that compares
    MapGen browser-run artifacts to runtime grid/summary reads.
- `[inference]` Keep save/deploy/restart as the current queued POST flow, but
  extract the direct-control restart/log proof logic behind named server helpers
  if more endpoints are added. Avoid duplicating marker definitions and error
  envelope construction across endpoints.
- `[inference]` Studio endpoints should return bounded JSON and treat direct
  runtime reads as development-only proof surfaces. They should not expose
  `game exec`-style arbitrary JavaScript from the browser.
- `[unresolved]` Whether Studio needs persistent polling/streaming for runtime
  comparison is not yet proven. Start with request/response endpoints and add
  streaming only if grid extraction latency demands it.

## Docs Updates Needed

- `[source]` `packages/civ7-direct-control/README.md` currently documents the
  existing transport, state surfaces, common calls, CLI examples, and bridge
  policy.
- `[inference]` When new read wrappers land, update the README with:
  state ownership, wrapper list, read-only vs mutating labels, proof class, and
  examples for `getCiv7PlayableStatus`, map/player/plot/grid summaries, and
  bounded root inspection.
- `[source]` `packages/cli/AGENTS.md` already lists direct game commands.
- `[inference]` Update `packages/cli/AGENTS.md` after CLI expansion so agents
  know normal usage is wrapper commands, while `game exec` stays expert/debug
  escape hatch.
- `[source]` `docs/system/cli/overview.md` currently appears to be a
  mini-roadmap/feature tracker rather than a concise CLI system overview.
- `[inference]` Reconcile `docs/system/cli/overview.md` with actual CLI
  command surface. Avoid promising implemented wrapper commands before package
  APIs and CLI tests exist.
- `[source]` `docs/system/mods/swooper-maps/architecture.md` already describes
  direct control as the rapid iteration path and FireTuner as reference-client
  evidence.
- `[inference]` Add Studio/runtime comparison guidance there only after live map
  summary/grid wrappers are implemented and tested.
- `[inference]` Keep `openspec/changes/remove-firetuner-bridge-legacy/**` as
  the active cleanup record until all bridge-removal follow-through is closed;
  do not promote old bridge instructions into canonical docs.

## Cleanup Manifest

| Path/pattern | Evidence | Disposition | Rationale |
|---|---|---|---|
| `packages/cli/src/utils/firetunerBridge.ts` | `[source]` listed in removal spec, absent in current tree | delete/keep deleted | Old bridge utility must not return. |
| `packages/cli/test/utils/firetunerBridge.test.ts` | `[source]` listed in removal spec, absent in current tree | delete/keep deleted | Test should not preserve bridge contract. |
| `packages/cli/src/utils/firetunerSocket.ts` | `[source]` mentioned in dirty `NOTE-TO-DRA.md`, absent in current tree | unresolved-check/keep deleted if absent | Verify history only if needed; do not recreate socket utility outside package. |
| CLI `--transport bridge`, `--bridge-log`, `CIV7_FIRETUNER_*` flags/env | `[source]` removal spec and rg show no active CLI matches | delete/keep deleted | No bridge fallback where direct control covers behavior. |
| `packages/cli/test/commands/game.*.test.ts` local socket fixtures | `[source]` tests implement fake server frame parsing | keep | Test-only fixture. It validates direct-control command behavior without production duplicate transport. |
| `packages/civ7-direct-control/src/index.ts` socket framing/session code | `[source]` package owner | keep | Canonical owner of direct tuner-socket behavior. |
| `apps/mapgen-studio/vite.config.ts` direct-control imports | `[source]` current Studio endpoint | keep/extend | Correct boundary: server-side Studio endpoint consumes package APIs. |
| Studio browser code exposing save/deploy/restart UI | `[source]` App.tsx only consumes endpoint result | keep | UI presentation, not transport ownership. |
| `packages/civ7-direct-control/README.md` bridge policy | `[source]` explicit no-bridge policy | keep/update | Canonical package-level guidance. |
| `openspec/changes/remove-firetuner-bridge-legacy/**` | `[source]` active cleanup spec | keep until accepted/closed | Implementation-control record; not obsolete yet. |
| `openspec/changes/civ7-direct-control-surface/**` | `[source]` downstack implementation record | keep | Recorded proof and decisions for parity. |
| `.agents/skills/civ7-operational-debugging/references/firetuner-runtime.md` | `[source]` FireTuner-named but direct-control-first guidance | replace selectively | Rename or reframe later if the filename causes routing confusion; preserve FireTuner reference-client notes. |
| `docs/_archive/**` FireTuner/bridge references | `[source]` archive rg results | archive/leave | Historical material. Do not mass edit unless linked as current guidance. |
| `docs/projects/engine-refactor-v1/**` unrelated "bridge" references | `[source]` rg results | keep | Mostly MapGen architecture/migration bridge language, not FireTuner runtime bridge. |
| `.civ7/outputs/resources/**` tuner files | `[official-resource]` official resource mirror | keep/read-only | Official game resource evidence; never cleanup-delete. |
| External Civ7 Development Tools/FireTuner binaries | `[source]` removal spec says preserve | keep | Development tools and reference-client evidence, not repo-owned runtime code. |
| `NOTE-TO-DRA.md` | `[source]` pre-existing untracked dirty file | quarantine/do not edit here | User/watcher dirty file; not part of this lane's write set. |

## Tests Needed

- `[inference]` Package unit tests for each read wrapper using the existing fake
  tuner server fixture: assert state selection, command payload, bounded output,
  parse failures, and classified errors.
- `[inference]` Package tests for map/grid wrappers must cover bounds limits,
  field allowlists, output-size controls, and failed/partial probes.
- `[inference]` CLI command tests should mirror current
  `game.control.test.ts`: run commands against a fake tuner server and assert
  they call wrapper behavior rather than exposing bridge flags or raw
  production socket code.
- `[inference]` Studio endpoint tests should exercise the Vite middleware
  handler shape without requiring a browser: valid payload, invalid bounds,
  direct-control failure envelope, and no arbitrary JavaScript endpoint.
- `[inference]` Add regression `rg`/guard check for active bridge fallback
  strings in CLI/Studio/package docs: `firetunerBridge`, `firetunerSocket`,
  `--transport bridge`, `--bridge-log`, `CIV7_FIRETUNER`, and "fallback to
  FireTuner" outside archives or explicit reference-client docs.
- `[inference]` For mutating wrappers, require fresh live proof in a disposable
  game state: before snapshot, command result, after snapshot, and no
  auto-retry after reconnect. Mock tests alone should not claim runtime safety.
- `[recorded-live-proof]` Existing restart/begin/Tuner health proof can support
  continued lifecycle behavior, but it does not prove new map/player/action
  wrappers.
- `[fresh-live-proof]` None collected by this lane.

## Graphite Slice Sequencing

1. `[inference]` Direct-control read wrapper slice:
   package APIs, package tests, README update. No CLI/Studio changes except
   compile fixes if required.
2. `[inference]` CLI read command slice:
   add JSON-first commands over package wrappers, CLI tests, CLI docs/AGENTS
   updates. Preserve existing command compatibility.
3. `[inference]` Studio runtime-read slice:
   add `/api/civ7/*` read endpoints and UI consumers for map/runtime comparison
   only after package wrappers exist. Include endpoint tests or build-level
   verification plus manual/local proof notes.
4. `[inference]` Catalog/inspection slice:
   TypeBox catalog schema and bounded root/catalog snapshot command; update
   docs with evidence classes.
5. `[inference]` Mutating wrapper slice:
   autoplay first, then validator-only operation checks, then one narrow
   request operation if live proof succeeds. Each mutating slice needs fresh
   live proof or stays source-only.
6. `[inference]` Cleanup guard slice:
   add active-string guard/tests and remove or quarantine any active stale
   bridge guidance discovered during the above work. Do not edit archives or
   official resources as cleanup.

## Review Findings And Risks

- `[source]` No active production duplicate socket logic was found in CLI or
  Studio. The duplicate frame parsing in CLI tests is a local fake server
  fixture and should stay test-only.
- `[source]` No active CLI FireTuner bridge flags or bridge utility files were
  found by targeted search.
- `[source]` Active docs mostly present direct-control-first guidance, but some
  FireTuner-named operational references remain and should be reviewed for
  reader confusion during cleanup.
- `[inference]` The largest false-promise risk is documenting map/player/action
  wrappers as implemented before package APIs, tests, and fresh runtime proof
  exist.
- `[inference]` The largest compatibility risk is reshaping existing `game`
  command JSON outputs. Add commands or additive fields rather than changing
  existing envelopes.
- `[inference]` The largest cleanup risk is overbroad deletion: official
  FireTuner development tools, `.civ7/outputs/resources/**`, and historical
  archive material are evidence or history, not runtime bridge fallbacks.

## Open Items

- `[unresolved]` Exact package wrapper names may shift during the state-role,
  read-surface, and action-surface lanes; CLI/Studio should follow the final
  package API names.
- `[unresolved]` Studio runtime comparison UX is not specified. Endpoint shape
  can be implemented before detailed UI, but user-facing panels need a separate
  design pass.
- `[unresolved]` Direct-control map/grid performance limits need empirical data
  against real map sizes before Studio should poll or stream them.
- `[unresolved]` Mutating wrappers beyond restart/begin need fresh live proof
  in disposable sessions before being documented as supported behavior.
