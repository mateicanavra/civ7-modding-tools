# Live Sync Designer Report

## Scope And Evidence

- [source-proven] This report designs the bounded Studio live-runtime sync surface for `docs/projects/civ7-direct-control/workstream/studio-run-in-game/`.
- [source-proven] `@civ7/direct-control` owns tuner socket framing, state discovery, reconnect polling, and direct Civ7 runtime reads; Studio and CLI callers must stay above that package.
- [source-proven] MapGen Studio currently owns browser-run visualization state, authored `pipelineConfig`, save/deploy/restart calls, and UI rendering in `apps/mapgen-studio/src/App.tsx`.
- [source-proven] Existing Studio dev-server endpoints are `GET /api/civ7/status`, `GET /api/civ7/map-summary`, `GET /api/civ7/gameinfo`, and `POST /api/map-configs`.
- [source-proven] Existing direct-control reads include playable/status, App UI snapshot, Tuner health, map summary, plot snapshot, bounded map grid, player summary, unit summary, city summary, visibility summary, targeted `GameInfo` rows, autoplay status, and turn-completion status.
- [source-proven] Existing direct-control mutating wrappers rely on bounded
  inputs, validator/status checks where available, postcondition evidence, and
  no automatic replay after uncertain mutation results.
- [source-proven] The phase ledger has no fresh live proof entries yet.
- [live-proven] No live sync claim in this report is live-proven by this phase.
- [inferred] The useful Studio surface is a runtime observation layer keyed by Civ turn/hash and Studio run identity, not a second authoring model.
- [rejected] Studio must not implement raw socket commands, fallback transports, autonomous gameplay controls, or silent runtime-to-`pipelineConfig` rewrites.

## Useful Live Read Surfaces

| Surface | Implemented direct-control read | Proposed Studio use |
|---|---|---|
| [source-proven] Readiness | `getCiv7PlayableStatus`, `checkCiv7TunerHealth`, `getCiv7AppUiSnapshot` | [inferred] Show connection state, shell/loading/game state, Tuner readiness, and stale/error badges before polling map details. |
| [source-proven] Turn key | `getCiv7MapSummary` returns map dimensions, map size, random seed, turn/date/age/maxTurns/hash, optional area/region ids | [inferred] Use `{turn, hash, randomSeed, dimensions}` as the primary runtime snapshot key and as the cheapest change detector. |
| [source-proven] Plot facts | `getCiv7PlotSnapshot` and `getCiv7MapGrid` read bounded terrain, biome, feature, resource, climate, hydrology, yields, owner, visibility, area/region, tags, city, and units fields | [inferred] Render developer overlays for selected bounds, viewport windows, sampled points, and current mismatch hotspots. |
| [source-proven] Visibility | `getCiv7VisibilitySummary` reads per-player revealed/visible counts and optional bounded grid | [inferred] Render fog/revealed overlays and compare authored placement assumptions against player-visible reality during autoplay. |
| [source-proven] Players | `getCiv7PlayerSummary` reads alive/player metadata plus unit and city id probes | [inferred] Provide compact per-player side summaries and owner filters for overlays. |
| [source-proven] Units | `getCiv7UnitSummary` reads bounded unit ids, owner, name/type, location, health/damage, movement, and activity | [inferred] Render unit markers and turn-to-turn movement deltas, capped by player/filter. |
| [source-proven] Cities | `getCiv7CitySummary` reads bounded city ids, owner, name, location, population, growth, and production | [inferred] Render city markers and settlement growth deltas. |
| [source-proven] Static/runtime catalog | `getCiv7GameInfoRows` reads targeted `GameInfo` tables with validated table/filter identifiers and hard limits | [inferred] Resolve labels for resource/terrain/biome/feature/unit ids and verify map row presence without exposing arbitrary SQL. |
| [source-proven] Autoplay | `getCiv7AutoplayStatus` reads native autoplay state; bounded wrappers can configure/start/stop autoplay | [inferred] Live sync should observe autoplay progression and expose manual controls only through explicit direct-control actions outside the read loop. |
| [source-proven] Turn completion | `getCiv7TurnCompletionStatus` reads local player turn readiness | [inferred] This is useful for diagnosing stalled autoplay/turn progression, but it should not drive autonomous gameplay UI in this workstream. |

## Endpoint Contracts

- [source-proven] The implemented Studio endpoints are narrow and call `@civ7/direct-control` directly from Vite middleware.
- [inferred] Add proposed endpoint `GET /api/civ7/live/status` as a Studio-facing aggregate over implemented reads, returning readiness, App UI loading state, Tuner health, map summary, autoplay status, and server timestamp.
- [inferred] Add proposed endpoint `GET /api/civ7/live/snapshot?bounds=x,y,w,h&playerId=0&fields=terrain,biome,feature,resource,visibility,areaRegion&maxPlots=512` for bounded overlay windows.
- [inferred] Add proposed endpoint `GET /api/civ7/live/entities?playerId=0&include=players,units,cities&maxItems=128` for marker overlays and summaries.
- [inferred] Add proposed endpoint `GET /api/civ7/live/gameinfo?tables=Terrains,Biomes,Features,Resources,Maps&limit=200` for label dictionaries and map-row verification.
- [inferred] Add proposed endpoint `POST /api/civ7/live/poll-plan` only if the UI needs server-side normalization of available read surfaces; otherwise keep polling orchestration client-side with direct endpoint calls.
- [rejected] Do not add any endpoint that accepts arbitrary JavaScript, raw tuner state names, raw socket commands, broad `GameInfo` dumps, or write-capable runtime instructions.
- [rejected] Do not let any live endpoint call `setPipelineConfig`, mutate saved presets, rewrite repo config files, regenerate mods, deploy mods, or restart Civ as a side effect.
- [source-proven] `POST /api/map-configs` currently writes a repo-backed config, deploys Swooper Maps, and requests Civ restart.
- [inferred] Run-in-game materialization belongs to a separate explicit action path from live sync; live sync endpoints should be read-only even when the selected Studio config is dirty.

## Store Contract

- [inferred] Add a separate Studio store slice named `liveRuntime`, not fields inside the authored config model.
- [inferred] `liveRuntime.connection` should include `{status, host, port, readiness, appUiLoadingState, tunerReady, lastError, lastSeenAt}`.
- [inferred] `liveRuntime.runBinding` should include `{studioRunId, recipeId, presetKey, seed, mapSizeId, configHash, mapRowId, launchedAt}` when Run in Game has proof inputs.
- [inferred] `liveRuntime.snapshotsByKey` should be keyed by `{turn, hash}` and hold map summary, player summaries, entity summaries, overlay windows, GameInfo dictionaries, and fetch metadata.
- [inferred] `liveRuntime.activeSnapshotKey` should track the latest complete snapshot while retaining a small ring buffer for turn comparison.
- [inferred] `liveRuntime.overlayRequests` should track viewport/bounds, fields, player id, max plot cap, status, abort controller id, and result key.
- [inferred] `liveRuntime.suggestions` should hold explicit runtime-to-config suggestion records, never patch objects.
- [rejected] Do not store live runtime fields under `pipelineConfig`, `lastRunSnapshot.pipelineConfig`, built-in preset overrides, or local preset persistence.
- [inferred] If `configHash` or Swooper log proof is unavailable, the store should mark authored-vs-runtime comparison as `unbound` rather than infer that the runtime map reflects the current Studio config.

## UI Integration Plan

- [inferred] Add a compact Live panel near existing Run/Save controls with connection state, latest turn/hash/seed, autoplay state, and last refresh age.
- [inferred] Add a runtime overlay group to the existing Explore panel so developers can toggle Civ terrain, biome, feature, resource, visibility, owner, unit, city, and mismatch overlays alongside generated MapGen layers.
- [inferred] Use turn-keyed tabs or a two-snapshot compare selector for "authored preview", "live turn N", and "live turn N-1" rather than replacing the current browser-run view.
- [inferred] Overlay mismatch cards should name the evidence boundary: config binding proven, unbound runtime, stale poll, partial grid, hidden-info filtered, or read failed.
- [inferred] Selecting a tile should show authored layer facts and live plot facts side by side with probe errors preserved.
- [inferred] Player/unit/city summaries should be dense side-panel tables with filters, not an autonomous gameplay console.
- [inferred] A "Suggest config changes" action may collect suggestions from current live observations, but applying a suggestion must require an explicit user edit/accept flow through the normal config form.
- [rejected] Do not auto-open config sections, auto-change sliders, auto-save presets, or silently switch the selected preset based on runtime observations.

## Polling, Backoff, And Cancel

- [inferred] Poll `GET /api/civ7/live/status` every 1000 ms while connected and visible; back off to 3000 ms when Civ is loading/shell/unavailable; back off to 5000-10000 ms after repeated transport failures.
- [inferred] Use `mapSummary.game.turn` and `mapSummary.game.hash` as the cheap invalidation key before fetching heavier grids/entities.
- [inferred] Fetch bounded overlay grids only when the selected live overlay, viewport/bounds, player id, fields, or turn/hash changes.
- [inferred] Fetch entity summaries no more than once per turn/hash unless the user changes filters.
- [inferred] Cache `GameInfo` dictionaries per session/map row and refresh on explicit request, map row change, or missing id labels.
- [inferred] Use `AbortController` for every overlay/entity request and cancel superseded requests on viewport movement, field toggles, mode switches, and component unmount.
- [inferred] Treat a new turn/hash as canceling stale in-flight overlay requests unless the UI is explicitly comparing an older turn.
- [inferred] Pause live polling when the Studio tab is hidden, when world mode is dump-only and live sync is disabled, or when the user toggles Live off.
- [rejected] Do not poll full-map grids by default and do not poll raw `GameInfo` table dumps as a heartbeat.

## Performance Bounds

- [source-proven] Direct-control grid reads have `DEFAULT_CIV7_MAP_GRID_MAX_PLOTS = 512` and `HARD_CIV7_MAP_GRID_MAX_PLOTS = 10000`.
- [source-proven] Direct-control `GameInfo` reads have `DEFAULT_CIV7_GAMEINFO_LIMIT = 100` and `HARD_CIV7_GAMEINFO_LIMIT = 1000`.
- [source-proven] Player summary defaults to 64 max items; unit and city summaries default to 128 max items and cap at 1000.
- [inferred] Studio should use 512 plots as the normal overlay window cap and require an explicit "expanded diagnostic sample" affordance for higher caps.
- [inferred] Full-map overlays should be synthesized from tiled requests only after live proof shows acceptable Civ and Studio cost; initial implementation should restrict to selected bounds or viewport windows.
- [inferred] Keep at most 3-5 turn snapshots in memory by default, with a manual pin for longer investigations.
- [inferred] Overlay rendering should reuse existing deck.gl layer machinery and avoid regenerating authored MapGen layers when only live runtime layers update.
- [rejected] A broad live debug console, continuous full-grid polling, or unbounded per-unit/city refresh during autoplay is too expensive for this workstream.

## Runtime-To-Config Suggestion Model

- [source-proven] The workstream foreground says live runtime state is observational and must never auto-write authored `pipelineConfig`.
- [inferred] Suggestions should be plain records: `{id, snapshotKey, sourceEvidence, targetPath, proposedValue, confidence, rationale, status}`.
- [inferred] `sourceEvidence` should link to bounded read results, such as plot samples, resource counts, visibility gaps, area/region ids, or GameInfo lookup rows.
- [inferred] `targetPath` should reference the normal config form path, but the suggestion should not carry an executable patch.
- [inferred] Suggestion statuses should be `new`, `dismissed`, `accepted-to-form`, and `superseded`; only `accepted-to-form` may call existing `onConfigChange`.
- [inferred] Low-confidence suggestions should prefer diagnostic text over proposed numeric changes when the direct-control reads do not reveal enough causal shape.
- [rejected] Do not infer recipe-stage causality from Civ plot facts alone when authored artifacts, config hash, or Swooper generation proof is missing.
- [rejected] Do not encode automatic "fix terrain/resources/visibility" recipes in live sync.

## Tests And Proof

- [source-proven] Existing direct-control tests cover bounded map/plot reads, grid caps, visibility, reveal safeguards, and `GameInfo` validation.
- [inferred] Add direct-control tests only when new wrapper contracts are introduced; pure Studio aggregate endpoints can mock existing direct-control functions.
- [inferred] Add Studio endpoint tests for successful aggregate reads, direct-control failures, invalid query parameters, max cap normalization, and no side-effect calls to save/deploy/restart.
- [inferred] Add store reducer/hook tests proving live snapshots are keyed by turn/hash, stale requests are ignored, and suggestions do not mutate `pipelineConfig`.
- [inferred] Add UI tests proving Live off stops polling, viewport changes cancel stale grid fetches, and accepted suggestions require an explicit action before config changes.
- [unresolved] Fresh live proof is still required that the implemented reads provide enough shape during autoplay to build useful overlays and summaries.
- [unresolved] Fresh live proof is still required for practical polling intervals and grid caps on real Civ maps.
- [unresolved] Fresh live proof is still required to connect a launched Studio config/hash to the observed runtime map without overstating certainty.

## P1 Risks

- [P1][rejected] Any design that writes `pipelineConfig`, preset storage, repo config files, generated outputs, or deployed mods from live polling must be blocked.
- [P1][rejected] Any Studio-side raw tuner socket or arbitrary JavaScript endpoint bypassing `@civ7/direct-control` must be blocked.
- [P1][unresolved] If direct-control reads cannot provide stable turn/hash, bounded grid facts, or entity summaries during autoplay, the workstream hits the user-defined reframe trigger.
- [P1][inferred] Full-map polling during autoplay can make Studio too expensive and should be blocked until measured live proof exists.
- [P1][inferred] Unbound authored/runtime comparison can mislead developers; the UI must visibly distinguish proven launch binding from merely connected runtime observation.

## P2 Risks

- [P2][inferred] Runtime id labels may be hard to read without cached `GameInfo` dictionaries; missing labels should degrade to ids plus unresolved badges.
- [P2][inferred] Visibility-filtered reads can hide facts and create false mismatch diagnoses; overlays must show hidden-info policy.
- [P2][inferred] Autoplay can advance turns while overlay requests are in flight; snapshot keys and cancellation are required to prevent cross-turn mixing.
- [P2][inferred] Existing `App.tsx` is already a large coordination file; implementation should split live sync hooks/components rather than adding broad state directly into the main component.
- [P2][inferred] Suggestion UX can become a hidden config authoring path; every suggestion must route through visible accept/dismiss controls and normal dirty-state behavior.

## Concrete Next Steps

1. [inferred] Define `LiveRuntimeSnapshot`, `LiveOverlayRequest`, and `LiveRuntimeSuggestion` TypeScript contracts under a new Studio live-sync feature folder.
2. [inferred] Add read-only Studio endpoints for live status, bounded overlay snapshots, entity summaries, and GameInfo dictionaries using only implemented `@civ7/direct-control` reads.
3. [inferred] Implement a `useCiv7LiveRuntime` hook with polling, turn/hash invalidation, abort cancellation, backoff, and Live on/off state.
4. [inferred] Add a minimal Live panel and runtime overlay toggles that render current turn/hash, readiness, and bounded Civ plot/entity overlays without touching authored config.
5. [inferred] Add suggestion records as explicit UI artifacts with accept/dismiss actions and tests proving no automatic config mutation.
6. [unresolved] Run live Civ proof during autoplay to validate read stability, overlay usefulness, polling cost, and the reframe trigger.
7. [inferred] Feed accepted contracts into the `studio-live-civ7-map-sync` OpenSpec change before implementation slices touch production code.
