# Tuner Surface Report

Date: 2026-05-31

## Scope

This report inventories the `Tuner` scripting state as a gameplay API surface
after Begin Game. `App UI` is referenced only for contrast. FireTuner/resource
panel code is treated as reference-client evidence, not repo-owned runtime
authority.

## Sources Searched

- Repo source:
  - `packages/civ7-direct-control/src/index.ts`
  - `packages/civ7-direct-control/README.md`
  - `packages/civ7-direct-control/AGENTS.md`
  - `packages/cli/src/commands/game/health.ts`
  - `packages/cli/src/commands/game/inspect.ts`
  - `packages/cli/src/commands/game/exec.ts`
  - `packages/civ7-types/index.d.ts`
- Prior direct-control discovery:
  - `docs/projects/civ7-direct-control/workstream/discovery/tuner-api-inventory.md`
  - `docs/projects/civ7-direct-control/workstream/discovery/app-ui-api-inventory.md`
  - `docs/projects/civ7-direct-control/workstream/capability-inventory/investigation-brief.md`
  - `docs/projects/civ7-direct-control/workstream/capability-inventory/team-plan.md`
- Official resource mirror:
  - `.civ7/outputs/resources/Base/modules/base-standard/ui/tuner-input/tuner-input.js`
  - `.civ7/outputs/resources/Base/modules/core/ui/utilities/utilities-tuner.js`
  - `.civ7/outputs/resources/Base/modules/base-standard/maps/map-debug-helpers.js`
  - selected `Base/modules/base-standard/ui/**` usages of `Game.*Operations`,
    `Game.*Commands`, `GameplayMap.getRevealedState`, `MapUnits`, `MapCities`,
    and `Autoplay`
  - selected `Base/modules/base-standard/maps/**` map builder/debug usages
- Live read-only runtime commands:
  - `bun run --cwd packages/cli dev game health --tuner --json`
  - `bun run --cwd packages/cli dev game inspect --state Tuner --roots ... --json`
  - `bun run --cwd packages/cli dev game exec <read-only nested-key probe> --state Tuner --json`

No broad game-state mutations, autoplay, map edits, player commands, or unit
commands were executed for this report.

## Readiness Boundary

`LSQ:` can list both `App UI` and `Tuner` before `Tuner` is command-ready. Prior
direct-control evidence recorded `CMD:1:1+1` and basic global probes timing out
before Begin Game. After `App UI` reaches native Begin Game completion
(`UI.notifyUIReady()` and `GameStarted`), the current live `Tuner` canary
returns:

```json
{
  "state": { "id": "1", "name": "Tuner" },
  "ready": true,
  "globals": {
    "Game": "object",
    "Autoplay": "object",
    "GameplayMap": "object",
    "Players": "object",
    "Network": "undefined"
  },
  "turn": 1,
  "turnDate": "4000 BCE",
  "map": "84x54",
  "aliveIds": [0, 1, 2, 3, 4, 5, 6, 7],
  "aliveHumanIds": [0]
}
```

Conclusion: package readiness checks must execute a read-only Tuner command
canary. State discovery alone is insufficient.

## Tuner Global/Root Inventory

Confirmed post-Begin roots from live read-only inspection:

| Root | Status in `Tuner` | Useful surface |
|---|---|---|
| `Game` | confirmed | turn/date/hash plus `UnitCommands`, `UnitOperations`, `CityCommands`, `CityOperations`, `PlayerOperations`, `Resources`, `Diplomacy`, `ProgressionTrees`, `Unlocks`, many domain managers |
| `Autoplay` | confirmed | status fields plus mutators such as `setTurns`, `setActive`, `setPause`, `setAsAI`, `setAsHuman` |
| `Players` | confirmed | alive/player classification reads plus player component gateways |
| `GameplayMap` | confirmed | broad map read API: dimensions, coordinates, terrain, biome, features, resources, yields, ownership, visibility, areas, regions |
| `GameInfo` | confirmed but non-enumerable | dynamic DB table gateway; own-key enumeration does not reveal table names |
| `PlayerIds` | confirmed | `NO_PLAYER`, `WORLD_PLAYER`, `OBSERVER_ID` |
| `MapUnits` / `Units` | confirmed | unit lookup, path/reachable target reads, and direct mutation helpers on `Units` |
| `MapCities` / `Cities` / `Districts` | confirmed | city/district lookup by id/location; city objects require founded cities |
| `MapAreas` / `MapRegions` | confirmed | area/region ids, plots, info, counts |
| `MapConstructibles` | confirmed | constructible reads plus route/discovery/independent/add mutation methods |
| `Database` | confirmed | table names/data/query/hash helpers |
| `Configuration` | confirmed | game/map/player config reads |
| `UnitOperationTypes`, `UnitCommandTypes`, `CityOperationTypes`, `CityCommandTypes`, `PlayerOperationTypes`, `RevealedStates`, `ConstructibleClasses` | confirmed | constants needed for typed command wrappers and read classification |
| `Network` | absent | App UI-only in current evidence |
| `UI`, `GameContext`, `WorldUI`, `Automation`, `WorldBuilder` | absent | App UI/panel/runtime-only in current evidence |

Important difference from `App UI`: `Tuner` has deeper gameplay roots such as
`Units`, operation constants, `Database`, and command manager families, but it
does not expose `Network.restartGame()`, `UI.notifyUIReady()`, `GameContext`, or
`WorldBuilder` in the observed post-Begin session.

## Useful Reads

### Game And Session

- `Game.turn`, `Game.age`, `Game.maxTurns`, `Game.getTurnDate()`, `Game.getHash()`.
- `Configuration.getGameValue`, `getGameValues`, `getMapValue`, `getMapValues`,
  `getPlayerValue`, `getPlayerValues`.
- `Database.getTableNames`, `getTableData`, `getPrimaryKeys`, `query`,
  `makeHash`.

Wrap-now candidate: `getTunerGameSnapshot()` with turn/date, map config, table
names, current age, and hash. Keep DB queries bounded and explicit.

### Map Introspection

`GameplayMap` in `Tuner` exposes all high-value map reads observed in App UI,
plus current inspection confirmed methods including:

- Dimensions/identity: `getGridWidth`, `getGridHeight`, `getPlotCount`,
  `getMapSize`, `getRandomSeed`.
- Coordinates: `getIndexFromXY`, `getIndexFromLocation`,
  `getLocationFromIndex`, `getAdjacentPlotLocation`, `getPlotDistance`,
  `getPlotIndicesInRadius`, `isValidXY`, `isValidIndex`, `isValidLocation`.
- Terrain/climate/ecology: `getTerrainType`, `getBiomeType`,
  `getFeatureType`, `getFeatureClassType`, `getResourceType`,
  `getFertilityType`, `getElevation`, `getRainfall`, `getPlotLatitude`,
  `getAppeal`.
- Hydrology/geography: `getRiverType`, `getRiverName`, `isRiver`,
  `isNavigableRiver`, `isFreshWater`, `isLake`, `isWater`, `isCoastalLand`,
  `isMountain`, `isCliffCrossing`, `isImpassable`, `isFerry`.
- Ownership/visibility: `getOwner`, `getOwnerName`, `getOwnerHostility`,
  `getOwningCityFromXY`, `getRevealedState`, `getRevealedStates`.
- Areas/regions: `getAreaId`, `getAreaIsWater`, `getLandmassId`,
  `getLandmassRegionId`, `getRegionId`, `getContinentType`,
  `getHemisphere`, `getPrimaryHemisphere`, `findSecondContinent`.
- Yields/properties/tags: `getYield`, `getYields`, `getYieldWithCity`,
  `getYieldsWithCity`, `getPlotTag`, `hasPlotTag`, `getProperty`.

Official `map-debug-helpers.js` confirms the same read families are useful for
terrain/elevation/rainfall/biome/feature/resource/continent debug dumps.

Wrap-now candidates:

- `getTunerMapSummary()`
- `getTunerPlotSnapshot(x, y, playerId?)`
- `getTunerMapGrid({ fields })` for bounded read-only extraction
- `getTunerVisibilitySummary(playerId)` using `getRevealedStates`
- `getTunerAreaRegionSummary()`

### Players, Units, Cities, Resources

Useful confirmed reads:

- `Players.getAliveIds`, `getAliveHumanIds`, `getAliveMajorIds`,
  `getAliveMinorIds`, `getAliveIndependentIds`, `getAliveBarbarianIds`,
  `getNumAliveHumans`, `isHuman`, `isAI`, `isObserver`, `isAlive`,
  `isParticipant`, `isValid`, `get`.
- `Players.get(playerId)` exposes identity/status fields: `id`, `name`,
  civilization/leader names/types, `team`, `isHuman`, `isAI`, `isAlive`,
  `isTurnActive`, `controlType`, `isMajor`, `isMinor`, `isIndependent`.
- `Players.Units.get(playerId)` exposes `getUnitIds`, `getUnits`,
  `getNumUnitsOfType`, `getCost`, `canEverTrain`, `isUnitUnlocked`,
  `getUnitShadows`.
- `Units.get(unitId)` exposes unit identity/location/status fields and reads
  such as `getSightPlots`, `getActivationPlots`, `getOperationParameters`,
  `getOperationTargets`, `getReachableMovement`, `getPathTo`,
  `getReachableTargets`, `getReachableTargetsRanged`, `hasAbility`.
- `MapUnits.getUnits(x, y)` and `getUnitsOnLayer(x, y, layer)` support
  plot-level unit lookup.
- `Players.Cities.get(playerId)` exposes `getCityIds`, `getCities`,
  `getCapital`, `getCountOfCities`, `findClosest`, `getCityLimit`.
- `Cities.get`, `getAtLocation`, `getIdAtLocation`; `MapCities.getCity`,
  `getDistrict`; `Districts.get`, `getAtLocation`, `getIdAtLocation`,
  `getLocations`, `getFreeConstructible`.
- `Players.Resources.get(playerId)` exposes resource assignment reads:
  `getResources`, `getCityIDAssigned`, `getCountImportedResources`,
  `getCountResourcesToAssign`, `getUnassignedResourceYieldBonus`.
- `Players.LiveOpsStats.get(playerId).numPlotsRevealed` is useful for
  exploration/progress diagnostics.

Wrap-now candidates:

- `getTunerPlayerSummary(playerId?)`
- `getTunerUnitSummary(playerId?)`
- `getTunerCitySummary(playerId?)`
- `getTunerResourceSummary(playerId?)`

## Useful Writes And Commands

No write was executed during this report. Status labels below mean:

- `confirmed`: live Tuner exposes the method and official UI/resource code shows
  a real call shape, but this report did not execute it unless noted.
- `plausible`: live Tuner exposes the method, but call shape/safety needs
  targeted proof.
- `unknown`: source evidence exists elsewhere, but raw Tuner availability or
  post-Begin behavior is not proven.

| Capability | Surface | Status | Notes |
|---|---|---|---|
| Autoplay control | `Autoplay.setTurns`, `setActive`, `setPause`, `setObserveAsPlayer`, `setReturnAsPlayer`, `setAsAI`, `setAsHuman`, `setAsLocalPlayer` | confirmed | Official automation UI uses these. Mutating but bounded; good explicit command surface after safety gates. |
| Unit commands/operations | `Game.UnitCommands.canStart/sendRequest`, `Game.UnitOperations.canStart/canStartAny/sendRequest` | confirmed | Operation constants are available in Tuner. Wrap only after command-specific canStart+request contracts are proven. |
| City commands/operations | `Game.CityCommands.canStart/canStartQuery/sendRequest`, `Game.CityOperations.canStart/canStartQuery/sendRequest` | confirmed | Useful for production, purchase, growth, expand, ranged attack, WMD. Mutating gameplay actions. |
| Player operations | `Game.PlayerOperations.canStart/sendRequest` | confirmed | Official UI and tuner-input use this for many actions, including `CREATE_ELEMENT`, `DESTROY_ELEMENT`, `ASSIGN_RESOURCE`, diplomacy, religion, progression, advanced start. Very broad mutation surface. |
| Tuner element creation/destruction | `Game.PlayerOperations.sendRequest(..., CREATE_ELEMENT/DESTROY_ELEMENT, args)` | confirmed | Official `tuner-input.js` uses for units, towns/cities, districts, constructibles. Powerful developer/debug API; keep raw/research until scoped wrappers exist. |
| Unit direct mutation | `Units.create`, `setLocation`, `setDamage`, `changeDamage`, `restoreMovement`, `changeExperience`, `setActivity` | plausible | Exposed in Tuner. Needs targeted proof and guardrails; bypasses normal canStart/sendRequest path. |
| Map constructibles | `MapConstructibles.addRoute/removeRoute/addDiscovery/addDiscoveryType/addIndependentType/addConstructible` | confirmed | Official map scripts use `addDiscovery`; tuner input uses route/discovery/independent variants. Mutates map. |
| Unlock forcing | `Game.Unlocks.setForceUnlockedForPlayer`, `clearForceUnlockedForPlayer` | plausible | Exposed in Tuner; useful for debugging tech/civic/unlock gates, but mutation semantics need proof. |
| Progression reveal | `Game.ProgressionTrees.revealTree` | plausible | Exposed in Tuner; name implies mutation or hidden-state side effect. Keep raw/research. |
| Player grants | `Players.grantYield`, `grantGreatWork`, `grantCultureSlot`, `increaseMaxTradeDistance` | plausible | Exposed in Tuner; likely mutating developer/debug helpers. |
| Map plot editing through `WorldBuilder.MapPlots` | `WorldBuilder.MapPlots.setFeature/setTerrain/setResource/setFertility/setOwnership/setBiome` | unknown in raw Tuner | Official `tuner-input.js` uses these in App UI event handlers, but `WorldBuilder` was absent from live Tuner. Do not wrap as Tuner API unless a targeted state/panel setup proves availability. |
| Restart/begin | `Network.restartGame()`, `UI.notifyUIReady()` | not Tuner | Confirmed App UI-only in current evidence. Keep outside Tuner wrappers. |

## Map, Studio, Debug, Gameplay Candidates

### Map/Studio Debug

Best immediate value is read-only map extraction from Tuner:

- full-grid terrain/biome/feature/resource/elevation/rainfall/yield snapshots;
- visibility overlays with `getRevealedStates(playerId)`;
- area/region/continent overlays with `MapAreas`, `MapRegions`, and
  `GameplayMap` ids;
- unit/city/district overlays with `MapUnits`, `MapCities`, `Cities`,
  `Districts`;
- resource assignment overlays from `Players.Resources`.

This gives MapGen Studio a live post-Begin inspection channel without relying
on FireTuner panels or mutating map state.

### Map Reveal/Explore

Read side is confirmed:

- `GameplayMap.getRevealedState(playerId, x, y)`
- `GameplayMap.getRevealedStates(playerId)`
- `Players.LiveOpsStats.get(playerId).numPlotsRevealed`
- unit sight: `Units.get(...).getSightPlots()`

Write side is not yet a clean map-reveal API. Search found official UI reads and
events around revealed states, but no proven raw Tuner `revealMap` or
`setRevealedState` equivalent. Practical exploration can likely be driven by
unit movement/autoplay, but direct reveal should remain research-later.

### Player/Turn/Unit Actions

The Tuner state looks capable enough for conservative gameplay action wrappers:

- query `canStart` first;
- issue `sendRequest` only for a named command/operation;
- return the immediate command result plus a follow-up read snapshot.

The first viable research targets are low-blast-radius actions:

- unit wait/skip/sleep/fortify/automate explore;
- unit move to a validated reachable plot;
- city production query/read-only first, then set/build only in a disposable
  test session;
- resource assignment only after canStart and argument proof.

Avoid generic `sendRequest(op, args)` wrappers as product API. They are useful
as raw escape hatches, not stable helpers.

### General Developer Control

Tuner is a good state for:

- post-Begin readiness and health;
- live gameplay snapshots;
- bounded DB/config/table reads;
- debug catalog extraction for constants and native root keys;
- explicit autoplay control, once marked as mutating.

Tuner is not the right state for restart/load/begin/network lifecycle. Keep
those on App UI.

## Recommendations

### Wrap Now

- `waitForCiv7TunerReady()` / `checkCiv7TunerHealth()` already exists and should
  remain the readiness canary.
- Add read-only wrappers:
  - `getTunerGameSnapshot()`
  - `getTunerMapSummary()`
  - `getTunerPlotSnapshot(x, y, playerId?)`
  - `getTunerPlayerSummary(playerId?)`
  - `getTunerUnitSummary(playerId?)`
  - `getTunerCitySummary(playerId?)`
  - `getTunerAreaRegionSummary()`
  - `getTunerVisibilitySummary(playerId)`
- Add `inspectTunerApiRoots(roots)` as a named convenience over existing
  `inspectCiv7RuntimeApi({ state: { role: "tuner" } })`.

### Raw Command For Now

- `Database.query` and arbitrary `GameInfo` table reads, until query result
  shapes and data volume are bounded.
- `Game.*Commands.canStart` and `Game.*Operations.canStart` for exploratory
  command feasibility.
- Narrow `sendRequest` experiments in disposable sessions.
- `Autoplay` mutators, unless the caller is using an explicit
  `setAutoplay...` helper that states mutation clearly.

### Research Later

- Direct reveal/explore mutation.
- Safe first-class unit movement/action wrappers.
- City production/purchase wrappers.
- Resource assignment wrappers.
- `Units.*` direct mutation methods.
- `MapConstructibles.*` debug placement wrappers.
- Whether `WorldBuilder` can be made available to raw `Tuner` via specific
  panel/setup state, or whether it is App UI-only.
- Whether `g_TunerState`, `g_TunerInput`, or `tunerUtilities` can be accessed
  from direct-control states after FireTuner panel injection.

### Avoid

- Do not expose generic Tuner `sendRequest` as a safe high-level API.
- Do not treat FireTuner panel globals as raw `Tuner` globals without live proof.
- Do not retry mutating commands automatically after socket failures.
- Do not route restart/begin through `Tuner`; current evidence keeps those on
  `App UI`.
- Do not infer function arity from native `length`; observed native functions
  commonly report `0`.

## Type-Generation Implications

- `packages/civ7-types/index.d.ts` currently focuses on map-generation globals
  and is incomplete for post-Begin Tuner gameplay APIs. It lacks many confirmed
  roots such as `Units`, `MapUnits`, `MapCities`, `Cities`, `Districts`,
  `MapAreas`, `MapRegions`, `MapConstructibles`, `Autoplay`, `Database`, and
  command/operation constants.
- Runtime introspection can generate a useful root/method catalog, but not a
  trustworthy full type surface by itself:
  - native functions report `[native code]` and usually `length: 0`;
  - `GameInfo` is dynamic and non-enumerable through own-key inspection;
  - return object shapes require targeted sample calls;
  - method names alone do not classify mutation safety.
- Best path is hybrid:
  - runtime-generated catalog for roots, constants, and method names;
  - official resource usage for call shapes;
  - targeted read-only samples for object shapes;
  - manual safety labels for read/write/unknown;
  - generated docs/types marked by evidence level.
- Split ambient types by state/surface if possible:
  - map-generation script globals;
  - App UI control globals;
  - post-Begin Tuner gameplay globals.

## Unknowns And Reframe Triggers

- Unknown: whether `Tuner` exposes the same roots in multiplayer, later turns,
  age transition, or after leaving/re-entering the game.
- Unknown: direct map reveal mutation path. Existing evidence proves visibility
  reads, not reveal writes.
- Unknown: whether some Tuner roots are hidden until a FireTuner panel or
  `g_TunerState` payload is injected.
- Unknown: which write methods are safe in a normal save versus only worldbuilder
  or debug sessions.
- Unknown: exact argument contracts for most `sendRequest`, `Units.*`, and
  `MapConstructibles.*` writes.
- Reframe if runtime introspection becomes unstable across sessions or patches.
- Reframe if `GameInfo`/`Database` queries are too large or unsafe for generic
  wrappers.
- Reframe if command wrappers require UI selection/input state outside the
  tuner socket.
- Reframe if mutation proof shows direct `Units.*` or `MapConstructibles.*`
  bypasses simulation validation in ways that corrupt saves.
