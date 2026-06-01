# Tuner API Inventory

Date: 2026-05-31

## State Identity

Direct `LSQ:` state discovery against the running macOS Civ7 listener returned:

| id | name | direct-control status |
| --- | --- | --- |
| `65535` | `App UI` | `CMD:<id>:<js>` works and returns values |
| `1` | `Tuner` | listed before Begin Game; command-ready after native Begin Game completes |

This means `Tuner` is a real scripting state, but `LSQ:` presence is not enough
to prove readiness. Before Begin Game, `CMD:1:<js>` timed out. After the game
entered a fresh started session and the native Begin Game action completed,
`CMD:1:1+1` returned `2`, and gameplay globals responded.

## Probe Method

Evidence was collected through `@civ7/direct-control` using direct socket
commands only:

- `checkCiv7DirectControlHealth({ state: { role: "tuner" } })`
- `executeCiv7Command({ state: { role: "app-ui" }, command: <read-only inspection> })`
- `executeCiv7Command({ state: { role: "tuner" }, command: <read-only inspection> })`

No autoplay, map edits, player operations, or mutating tuner actions were
invoked. Tuner-state commands were read-only eval probes such as `1+1`,
`typeof Game`, `GameplayMap.getGridWidth()`, and `Players.getAliveIds()`.

Reference files inspected:

- `.civ7/outputs/resources/Base/modules/base-standard/ui/tuner-input/tuner-input.js`
- `.civ7/outputs/resources/Base/modules/core/ui/utilities/utilities-tuner.js`
- `packages/civ7-types/index.d.ts`

## Root Availability Matrix

| root | App UI direct probe | Tuner direct probe |
| --- | --- | --- |
| `Game` | object; 29 own keys, 7 prototype keys | object after Begin Game |
| `Autoplay` | object; state fields plus prototype mutators | object after Begin Game |
| `Players` | object; 40 own keys, 29 prototype keys | object after Begin Game |
| `GameplayMap` | object; 73 prototype query methods | object after Begin Game |
| `Map` | JavaScript built-in `Map` function | unimportant built-in |
| `UI` | object; `Player`, `Debug`, `Control`, `Color`, 135 prototype keys | not part of post-Begin Tuner canary |
| `PlayerIds` | object; `NO_PLAYER`, `WORLD_PLAYER`, `OBSERVER_ID` | not part of post-Begin Tuner canary |
| `GameInfo` | object; dynamic database table surface | not part of post-Begin Tuner canary |
| `Debug` | undefined as global; `UI.Debug` exists | not part of post-Begin Tuner canary |
| `Tuner` | undefined as global | not part of post-Begin Tuner canary |
| `Network` | object; includes `restartGame` on prototype | undefined after Begin Game |

Observed Tuner errors before Begin Game:

```text
Timed out waiting for Civ7 tuner response to CMD:1:1+1
Timed out waiting for Civ7 tuner response to CMD:1:typeof globalThis
Timed out waiting for Civ7 tuner response to CMD:1:typeof Game
Timed out waiting for Civ7 tuner response to CMD:1:Object.getOwnPropertyNames(Game).slice(0,5).join(",")
```

Observed Tuner success after Begin Game:

```json
{
  "evalOk": 2,
  "globals": {
    "Game": "object",
    "Autoplay": "object",
    "GameplayMap": "object",
    "Players": "object",
    "Network": "undefined"
  },
  "turn": { "ok": true, "value": 1 },
  "turnDate": { "ok": true, "value": "4000 BCE" },
  "width": { "ok": true, "value": 84 },
  "height": { "ok": true, "value": 54 },
  "aliveHumanIds": { "ok": true, "value": [0] }
}
```

Native restart/begin proof from 2026-05-31:

- `Network.restartGame()` on `App UI` returned `true`.
- App UI loading states progressed through `WaitingForGameplayData`,
  `WaitingForLoadingCurtain`, `WaitingForGameCore`,
  `WaitingForVisualization`, and `WaitingForUIReady`.
- `UI.notifyUIReady()` returned `null`.
- The next App UI status was `GameStarted`.
- The Tuner canary above passed.
- Fresh `Scripting.log` markers were observed after the run:
  `Creating Context -  MapGeneration`, `[SWOOPER_MOD]`, and
  `Destroying Context -  MapGeneration`.

## Gameplay/Map API

The confirmed direct-control surface for gameplay/map queries is now both
`App UI` and `Tuner` after Begin Game. `App UI` remains the required state for
`Network.restartGame()` and `UI.notifyUIReady()`. `Tuner` is the better canary
for "the game is really running and gameplay globals are available."

`App UI` exposes `GameplayMap` read APIs such as:

- dimensions and identity: `getGridWidth`, `getGridHeight`, `getPlotCount`,
  `getMapSize`, `getRandomSeed`
- coordinate conversion: `getIndexFromXY`, `getIndexFromLocation`,
  `getLocationFromIndex`, `isValidLocation`, `isValidXY`, `isValidIndex`
- plot facts: `getTerrainType`, `getBiomeType`, `getFeatureType`,
  `getResourceType`, `getElevation`, `getRainfall`, `getRiverType`, `getYield`
- predicates: `isWater`, `isMountain`, `isLake`, `isRiver`,
  `isCoastalLand`, `isFreshWater`, `isNaturalWonder`, `isImpassable`
- regions: `getAreaId`, `getLandmassId`, `getRegionId`, `getAreaIsWater`,
  `getContinentType`, `getHemisphere`, `getPrimaryHemisphere`

Official tuner input code also uses map/player mutation APIs from the App UI
runtime:

- `WorldBuilder.MapPlots.setFeature`
- `WorldBuilder.MapPlots.setTerrain`
- `WorldBuilder.MapPlots.setResource`
- `WorldBuilder.MapPlots.setFertility`
- `WorldBuilder.MapPlots.setOwnership`
- `WorldBuilder.MapPlots.setBiome`
- `MapConstructibles.addRoute` / `removeRoute`
- `MapConstructibles.addDiscoveryType`
- `MapConstructibles.addIndependentType`

These are not safe helper candidates until wrapped behind explicit mutating
contracts and live-game proof.

## Player/Game API

`App UI` exposes `Game`, `Players`, `Cities`, `Districts`, `MapCities`, and
`MapUnits`.

Useful read-only candidates:

- `Players.getAliveIds`
- `Players.getAliveHumanIds`
- `Players.getAliveMajorIds`
- `Players.isAlive`
- `Players.isHuman`
- `Cities.get`, `Cities.getAtLocation`, `Cities.getIdAtLocation`
- `Districts.get`, `Districts.getAtLocation`, `Districts.getIdAtLocation`
- `MapCities.getCity`
- `MapUnits.getUnits`
- `Game.turn`, `Game.maxTurns`, `Game.age`, `Game.getTurnDate`

Official tuner input code creates/destroys units, towns, districts, buildings,
improvements, wonders, and constructibles through
`Game.PlayerOperations.sendRequest(...)`; those are mutating candidates only.

## Other Useful Roots

Confirmed in `App UI`:

- `WorldBuilder`: `MapPlots`, `isActive`, `startBlock`, `endBlock`
- `WorldUI`: model, overlay, sprite, VFX, marker, camera, and asset helpers
- `MapAreas`: `numAreas`, `getAreaIds`, `getAreaPlots`, `getAreaInfo`
- `MapRegions`: `numRegions`, `getRegionIds`, `getRegionPlots`,
  `getRegionInfo`
- `UI.Debug`: debug widget surface nested under `UI`
- `Network`: session/save/restart/online helpers, including `restartGame`

Official `utilities-tuner.js` defines `tunerUtilities` for flattening
`GameValue` display trees, but `tunerUtilities` was not visible as a global from
the App UI direct probe.

## Safe Helper Candidates

Near-term helpers should keep state roles explicit:

- `inspectAppUiApiRoots(roots)` with own/prototype/enumerable key metadata
- `checkCiv7TunerHealth()` using read-only `Game`, `GameplayMap`, and `Players`
  probes after Begin Game
- `getMapSummary()` from `GameplayMap` dimensions, plot count, map size, seed
- `getPlayerSummary()` from `Players` read-only APIs
- `getAreaRegionSummary()` from `MapAreas` and `MapRegions`
- `getAutoplayStatus()` from `Autoplay` fields only, with mutators separate
- `getNetworkStatus()` from read-only `Network` predicates only

Any helper that calls a function should document whether it is read-only,
mutating, or unknown. Avoid automatic retries for mutating commands.

## Unsafe/Mutating Candidates

These are useful but must not be surfaced as casual eval/autocomplete helpers:

- `Network.restartGame()`
- `Autoplay.setActive`, `setTurns`, `setPause`, `setAsAI`, `setAsHuman`
- `WorldBuilder.MapPlots.*` setters
- `MapConstructibles.add*` / `remove*`
- `Game.PlayerOperations.sendRequest(...)`
- `Cities.get(...).purchasePlot(...)`
- `WorldUI.create*`, `trigger*`, `loadAsset`, marker/model/VFX operations
- `UI.setApplicationOption`, `UI.commitApplicationOptions`

## Gaps/Risks

- The `Tuner` state can be listed before it is command-ready. Health checks must
  execute a read-only Tuner canary, not stop at `LSQ:`.
- Repeated one-shot socket probes can leave Civ7's listener unresponsive even
  while the port is open. Restart/begin/readiness loops should use a persistent
  session and reconnect only across Civ7 listener transitions.
- The deeper tuner controls appear, from official resources, to be UI-driven
  App UI behavior around `g_TunerState` and custom `tuner-user-action-*`
  events. That is separate from the proven `Tuner` eval canary.
- `g_TunerState` was undefined in the App UI probe, likely because no FireTuner
  panel state was injected/active. Tuner-panel behavior may require panel state
  setup before action dispatch is meaningful.
- `GameInfo` is a dynamic table surface; `Object.getOwnPropertyNames(GameInfo)`
  does not enumerate table names. Type generation should use official resources
  or targeted lookups rather than assuming runtime own keys reveal the schema.
- The control package should keep App UI and Tuner as separate state roles:
  App UI owns network/load UI operations; Tuner owns post-Begin gameplay canary
  and deeper gameplay inspection.
