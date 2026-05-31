# App UI Surface Report

Date: 2026-05-31
Lane: App UI Surface Investigator
Runtime state inspected: `65535` / `App UI`
Runtime phase: post-Begin Game, `UI.getGameLoadingState()` = `8` / `GameStarted`

## Summary

`App UI` is a distinct direct-control surface, not a synonym for `Tuner`.
Current evidence shows `App UI` owns the most useful developer-control API:
restart/begin flow, loading state, network/session status, autoplay fields and
mutators, UI status, map reads, player reads, database/catalog reads, and a
large set of UI/world/debug helpers. `Tuner` remains important as a post-Begin
gameplay canary, but `Network`, `UI`, `GameContext`, `WorldBuilder`, `WorldUI`,
and many UI-facing roots are App UI evidence until separately proven elsewhere.

The near-term `@civ7/direct-control` surface should wrap curated read-only App
UI snapshots and a few explicit game-control commands. Deeper map editing,
player operations, world UI effects, save/load, multiplayer/account actions, and
option writes should stay as raw/elevated research commands until each has
bounded runtime proof and a narrow product contract.

## Sources Searched

Repo/project docs:

- `docs/projects/civ7-direct-control/workstream/capability-inventory/investigation-brief.md`
- `docs/projects/civ7-direct-control/workstream/capability-inventory/team-plan.md`
- `docs/projects/civ7-direct-control/workstream/discovery/app-ui-api-inventory.md`
- `docs/projects/civ7-direct-control/workstream/discovery/tuner-api-inventory.md`
- `docs/projects/civ7-direct-control/workstream/discovery/runtime-protocol-report.md`
- `docs/projects/civ7-direct-control/workstream/discovery/public-corpus-report.md`
- `docs/projects/civ7-direct-control/PROJECT-civ7-direct-control.md`
- `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`
- `docs/system/libs/mapgen/reference/OBSERVABILITY.md`

Repo source:

- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-direct-control/README.md`
- `packages/civ7-direct-control/AGENTS.md`
- `packages/civ7-types/index.d.ts`
- `packages/civ7-types/AGENTS.md`

Official resources:

- `.civ7/outputs/resources/Base/modules/base-standard/ui-next/screens/pause-menu/pause-menu-bootstrap.js`
- `.civ7/outputs/resources/Base/modules/base-standard/ui-next/screens/load-screen/load-screen-model.chunk.js`
- `.civ7/outputs/resources/Base/modules/base-standard/ui/tuner-input/tuner-input.js`
- `.civ7/outputs/resources/Base/modules/core/ui/utilities/utilities-tuner.js`
- `.civ7/outputs/resources/Base/modules/base-standard/maps/map-debug-helpers.js`
- `.civ7/outputs/resources/Base/modules/base-standard/maps/*.js`
- `.civ7/outputs/resources/Base/modules/base-standard/ui/debug/hud-debug-widgets.chunk.js`
- `.civ7/outputs/resources/Base/Assets/schema/**`

Commands searched/run:

- `rg --files docs/projects/civ7-direct-control packages/civ7-direct-control packages/civ7-types .civ7/outputs/resources`
- `rg -n "Network\\.restartGame|Autoplay\\.|UI\\.notifyUIReady|WorldBuilder|MapPlots|MapConstructibles|GameplayMap\\.|MapAreas\\.|MapRegions\\.|WorldUI\\.|Game\\.PlayerOperations|tunerUtilities|g_TunerState|UI\\.Debug" .civ7/outputs/resources -g '*.js' -g '*.xml'`
- Read-only live App UI probe through `@civ7/direct-control`:
  `inspectCiv7RuntimeApi({ state: { role: "app-ui" }, roots: [...] })`
- Read-only live App UI snapshot:
  `getCiv7AppUiSnapshot({ timeoutMs: 5000 })`

## App UI Global / Root Inventory

Live root inventory from the selected App UI state:

| Root | Status | Useful surface |
|---|---|---|
| `Network` | confirmed object | session status, player readiness, restart, save/load, multiplayer/account/chat actions |
| `Autoplay` | confirmed object | autoplay status and explicit autoplay mutators |
| `Game` | confirmed object | turn/date/age/hash, manager namespaces, player/unit operation namespaces |
| `UI` | confirmed object | loading state, shell/game state, option reads/writes, clipboard/cursor/icon/audio/debug helpers |
| `GameContext` | confirmed object | local player/observer ids, pause/retire/turn-complete requests |
| `PlayerIds` | confirmed object | `NO_PLAYER`, `WORLD_PLAYER`, `OBSERVER_ID` constants |
| `Players` | confirmed object | player collections, alive/human/AI predicates, player lookup, some grant mutators |
| `GameplayMap` | confirmed object | dimensions, seed, plot facts, owner/reveal/area/region/terrain/resource predicates |
| `GameInfo` | confirmed object | dynamic database table surface; not enumerable by own keys |
| `Database` | confirmed object | hash, SQL/query/table metadata helpers |
| `Configuration` | confirmed object | game/player/map/user/debug config access and edit handles |
| `WorldBuilder` | confirmed object | `MapPlots`, `isActive`, block wrappers; mutation evidence from official tuner UI |
| `WorldUI` | confirmed object | overlays, sprites, models, VFX, camera, markers, assets, screen/world coordinate helpers |
| `MapAreas` | confirmed object | area ids, area plots, area info |
| `MapRegions` | confirmed object | region ids, region plots, region info |
| `MapUnits` | confirmed object | units at plot/layer |
| `MapCities` | confirmed object | city/district lookup at plot |
| `MapConstructibles` | confirmed object | constructible reads plus route/discovery/independent/constructible add/remove commands |
| `Cities` | confirmed object | city lookup by id/location |
| `Districts` | confirmed object | district lookup, locations, free constructible lookup |
| `InterfaceMode` | absent as top-level in live probe | used by official UI modules but not a current App UI global in this probe |
| `Tuner` | absent as top-level in live probe | FireTuner/client concept, not an App UI root observed here |
| `Debug` | absent as top-level in live probe | debug widgets are nested under `UI.Debug` |

Nested App UI roots observed or source-evidenced:

- `UI.Player`, `UI.Debug`, `UI.Control`, `UI.Color`
- `WorldBuilder.MapPlots`
- `WorldUI.ForegroundCamera`
- `Game.PlayerOperations`, `Game.UnitOperations`, `Game.UnitCommands`, and
  other manager namespaces
- `Players.*` manager namespaces such as `Players.Units`, `Players.Districts`,
  `Players.Resources`, `Players.Treasury`

## Useful Reads

Wrap-ready read groups:

| Group | Reads | Evidence |
|---|---|---|
| App UI status | `UI.isInGame()`, `UI.isInShell()`, `UI.isInLoading()`, `UI.getGameLoadingState()` | live snapshot and direct-control package |
| Begin readiness | loading states `WaitingForUIReady` / `WaitingToStart`, `typeof UI.notifyUIReady` | direct-control package and load-screen resource |
| Network/session | `Network.isInSession`, `getNumPlayers()`, `getHostPlayerId()`, `isConnectedToNetwork()`, `isAuthenticated()`, `isLoggedIn()` | live snapshot |
| Autoplay status | `Autoplay.isActive`, `turns`, `isPaused`, `isPausedOrPending`, `observeAsPlayer`, `returnAsPlayer` | live snapshot |
| Game summary | `Game.turn`, `Game.age`, `Game.maxTurns`, `Game.getTurnDate()`, `Game.getHash()` | live snapshot |
| Local context | `GameContext.localPlayerID`, `localObserverID`, `hasRequestedPause()` | live snapshot |
| Player summary | `Players.getAliveIds()`, `getAliveHumanIds()`, `getNumAliveHumans()`, `isAlive()`, `isHuman()`, `isAI()` | live probe |
| Map summary | `GameplayMap.getGridWidth()`, `getGridHeight()`, `getPlotCount()`, `getMapSize()`, `getRandomSeed()` | live snapshot |
| Plot reads | terrain, biome, feature, resource, elevation, rainfall, river, yield, owner, revealed state, tags, area/landmass/region | live probe and official map scripts |
| Areas/regions | `MapAreas.getAreaIds()`, `getAreaPlots()`, `getAreaInfo()`, `MapRegions.*` equivalents | live probe |
| City/unit lookup | `MapCities.getCity()`, `MapCities.getDistrict()`, `MapUnits.getUnits()`, `Cities.getAtLocation()`, `Districts.getAtLocation()` | live probe and official tuner UI |
| Catalog/schema | `Database.getTableNames()`, `getTableData()`, `getPrimaryKeys()`, `Database.makeHash()`, targeted `GameInfo.<Table>` reads | live probe and existing `civ7-types` |

Map-generation development value is highest for map summary, plot facts, area
and region reads, `GameInfo`/`Database` catalog reads, and fresh post-restart
status. These let Studio compare browser-run MapGen truth/artifacts to the
actual loaded Civ7 projection without editing the running game.

## Useful Writes / Commands

Mutation confidence:

| Command family | Examples | Confidence | Notes |
|---|---|---:|---|
| Restart current game | `Network.restartGame()` | confirmed | Live prior proof returned `true`; official pause menu calls it. Already wrapped as `restartCiv7Game()`. |
| Native begin game | `UI.notifyUIReady()` | confirmed | Live prior proof moved App UI to `GameStarted`; official load screen calls it. Already wrapped as `beginCiv7Game()` / restart-and-begin. |
| Autoplay control | `Autoplay.setTurns`, `setReturnAsPlayer`, `setObserveAsPlayer`, `setActive`, `setPause`, `setAsAI`, `setAsHuman` | plausible | Official/runtime methods exist; official automation scripts use the core setters. Keep explicit and bounded. |
| Pause/turn/retire requests | `GameContext.sendPauseRequest`, `sendTurnComplete`, `sendUnreadyTurn`, `sendRetireRequest` | plausible | Method names and pause-menu source indicate state changes. Need bounded proof before wrapping. |
| Map plot edits | `WorldBuilder.MapPlots.setFeature`, `setTerrain`, `setResource`, `setFertility`, `setOwnership`, `setBiome` | plausible | Official tuner input calls them from App UI. Do not wrap until mutation semantics and undo/save boundaries are known. |
| Constructible edits | `MapConstructibles.addRoute`, `removeRoute`, `addDiscoveryType`, `addIndependentType`, `addConstructible`, `addDiscovery` | plausible | Official tuner input uses route/discovery/independent methods. Needs explicit map-edit contract. |
| Create/destroy elements | `Game.PlayerOperations.sendRequest(..., "CREATE_ELEMENT" / "DESTROY_ELEMENT", ...)` | plausible | Official tuner input uses units, towns, districts, improvements, buildings, wonders. High blast radius. |
| City plot purchase | `Cities.get(...).purchasePlot(loc)` | plausible | Official tuner input calls it. Needs live proof and ownership validation. |
| Player grants | `Players.grantYield`, `grantCultureSlot`, `grantGreatWork`, distance mutators | unknown/plausible | Exposed by runtime names, not probed. |
| UI options/profile | `UI.setApplicationOption`, `commitApplicationOptions`, `setOption`, `reloadUI`, `refreshInput` | plausible | Clearly mutating; avoid as direct-control convenience wrappers. |
| Save/load/delete/network/account | `Network.saveGame`, `loadGame`, `deleteGame`, `join*`, `host*`, `sendChat`, `attemptLogin`, URL openers | plausible | Exposed by App UI. Useful for a separate game-control product, not map-generation core. |
| World UI effects | `WorldUI.createOverlayGroup`, `createSpriteGrid`, `triggerVFXAtPlot`, camera/filter/asset methods | plausible | Useful debug visualization but mutates UI scene. Wrap later only with cleanup/lifetime handles. |
| Raw SQL | `Database.query(...)` | unknown | Could be read-only with `SELECT`, but safety depends on accepted SQL and database context. Treat as raw/elevated. |

No new mutating live commands were run for this report.

## Map / Studio / Debug Candidates

Map-generation candidates:

- `getMapSummary()` from `GameplayMap` dimensions, plot count, size hash, seed.
- `getPlotSample(locations | radius | all?)` for terrain, biome, feature,
  resource, elevation, rainfall, river, owner, revealed state, region, area,
  landmass, and plot tags.
- `getAreaRegionSummary()` from `MapAreas`, `MapRegions`, and
  `GameplayMap.getAreaId/getRegionId/getLandmassId`.
- `getResourceFeatureBiomeCounts()` as a direct runtime projection comparator
  against MapGen artifacts and official `map-debug-helpers.js`.
- `getGameInfoRows(tableNames)` using targeted `GameInfo`/`Database` reads for
  map-relevant tables.

Studio workflow candidates:

- After deploy/restart/begin, call one App UI read bundle and one Tuner canary:
  App UI proves UI/session/loading state; Tuner proves gameplay command
  readiness.
- Add a Studio "loaded game summary" endpoint backed by App UI reads:
  seed, dimensions, turn/date, local player, alive players, map size, and
  high-level counts.
- Add a projection-compare endpoint later: sample or count the runtime map and
  compare it to current Studio/MapGen run artifacts. This should remain
  read-only.
- Use `Database.getTableNames/getPrimaryKeys/getTableData` or targeted
  `GameInfo` lookups to populate Studio catalog/debug panels, with provenance
  labels.

Debug candidates:

- `UI.Debug.registerWidget(...)` is official resource evidence for debug widget
  support, but direct-control should not become an in-game debug UI product in
  this slice.
- Official `map-debug-helpers.js` is a good shape reference for textual map
  dumps, but direct-control should prefer structured JSON returns over huge
  console logs.
- `WorldUI` overlay/sprite/VFX APIs could become excellent visual debug tools,
  but only after lifecycle cleanup is proven (`releaseMarker`, asset release,
  overlay group disposal/clear behavior).
- `tunerUtilities` flattens `GameValue` trees in official resources, but it was
  not visible as an App UI global in prior direct probes. Treat it as source
  reference, not a callable root.

## Recommendations

Wrap now:

- Keep `restartCiv7Game()`, `beginCiv7Game()`,
  `restartCiv7GameAndBegin()`, `getCiv7AppUiSnapshot()`, and
  `inspectCiv7RuntimeApi()` as the core App UI API.
- Add typed convenience helpers for read-only summaries:
  `getCiv7MapSummary()`, `getCiv7PlayerSummary()`,
  `getCiv7AreaRegionSummary()`, and `getCiv7PlotFacts(...)`.
- Keep helper names state-explicit where ambiguity matters:
  `getCiv7AppUiSnapshot`, `checkCiv7TunerHealth`, not generic "runtime health".

Raw command:

- `Database.query`, `Configuration.edit*`, `Game.PlayerOperations.*`,
  `WorldBuilder.*`, `MapConstructibles.add*/remove*`, `WorldUI.*`,
  `GameContext.send*`, and `Players.grant*`.
- Advanced `Network` actions other than restart, especially save/load/delete,
  account, chat, invite, kick, multiplayer, URL, and legal-document methods.
- UI option writes and reload/refresh commands.

Research later:

- Bounded autoplay helpers:
  `setAutoplay({ turns, observeAsPlayer, returnAsPlayer })`,
  `startAutoplay()`, `stopAutoplay()`, with explicit max-turn caps and a status
  read before/after.
- Map edit mode using `WorldBuilder.startBlock/endBlock` and
  `WorldBuilder.MapPlots.*`, only in a disposable/restarted session.
- WorldUI debug overlay handles with creation and cleanup proof.
- Structured runtime catalog generation from `Database`/`GameInfo` plus
  selected root introspection.
- Whether `g_TunerState` can be intentionally initialized over direct-control
  without FireTuner panel injection.

Avoid for this workstream:

- FireTuner clone, in-game command console, or broad autocomplete browser.
- Any helper that mixes read-only health polling with mutation.
- Automatic retries/replays for mutating commands.
- Treating App UI roots as available in Tuner or Tuner roots as available in
  App UI without fresh state-scoped proof.
- Broad global dumps in regular CLI/Studio paths; they produce huge payloads
  and can hide state-specific failures.

## Type-Generation Implications

- Runtime introspection is useful for root/method discovery, not full type
  signatures. Native methods report `[native code]`, and `function.length` is
  not reliable enough to generate call contracts.
- Generated catalog entries should carry provenance:
  `state` (`App UI`, `Tuner`, unknown), `source` (runtime probe, official
  resource, repo type, community), `confidence`, and `mutation` classification.
- Existing `packages/civ7-types/index.d.ts` mostly models map-generation and
  base runtime globals. It does not yet model the App UI control surface:
  `Network`, `Autoplay`, full `UI`, `GameContext`, `WorldUI`, `WorldBuilder`,
  `MapAreas`, `MapRegions`, `MapConstructibles`, `Cities`, `Districts`, or full
  `Database`.
- `GameInfo` table names and row types should be generated from official
  resources and/or `Database.getTableNames/getPrimaryKeys/getTableData`, not
  from `Object.getOwnPropertyNames(GameInfo)`, because the runtime object is
  dynamic and its own keys are empty.
- Recommended type output shape:
  - type-only package additions in `packages/civ7-types`
  - generated/provenance catalog data outside the type package, or clearly
    generated source with a reproducible script
  - state-scoped namespaces such as `Civ7AppUiRuntime` and
    `Civ7TunerRuntime` instead of one ambient "everything exists" declaration

## Unknowns And Reframe Triggers

Unknowns:

- Whether App UI root availability changes materially at main menu, before
  Begin Game, during loading, during age transition, in multiplayer, or after
  repeated restarts.
- Whether `WorldBuilder.MapPlots` works safely outside dedicated tuner/world
  builder modes, and whether `startBlock/endBlock` are required for atomicity.
- Whether `WorldUI` resources/overlays can be cleaned up reliably from
  direct-control without leaking visual state.
- Whether `Database.query` is constrained to reads in this context.
- Whether `Configuration.edit*` edits only setup state or can affect a live
  game unpredictably.
- Whether official tuner panel state (`g_TunerState`) can be injected safely
  through direct-control, or whether it depends on FireTuner UI/panel wiring.

Reframe triggers:

- Fresh runtime evidence shows `Network.restartGame()` or `UI.notifyUIReady()`
  moving off App UI or becoming unavailable in a supported lifecycle phase.
- App UI and Tuner state contents diverge by game version or DLC enough that
  helper defaults need version gating.
- Runtime probes show method metadata cannot be made stable enough for useful
  catalogs.
- Useful Studio/debug operations require event/input paths outside
  `CMD:<stateId>:<javascript>`.
- Any mutating map/player command has persistent side effects that survive
  restart or corrupt save/session state.

