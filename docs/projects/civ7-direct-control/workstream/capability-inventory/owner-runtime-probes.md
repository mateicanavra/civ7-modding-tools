# Owner Runtime Probe Notes

Date: 2026-05-31

## Commands

Live probes were run through the committed CLI/direct-control path against the
current started Civ7 game:

```bash
bun run --cwd packages/cli dev -- game inspect --state "App UI" --roots "Network,Autoplay,Game,UI,GameContext,Players,GameplayMap,GameInfo,Units,Cities,MapUnits,MapCities,MapFeatures,WorldBuilder,TerrainBuilder,MapPlotEffects,Camera,ComponentID,UnitFlagManager,engine,Configuration,Database,Online" --json
bun run --cwd packages/cli dev -- game inspect --state "Tuner" --roots "Network,Autoplay,Game,UI,GameContext,Players,GameplayMap,GameInfo,Units,Cities,MapUnits,MapCities,MapFeatures,WorldBuilder,TerrainBuilder,MapPlotEffects,Camera,ComponentID,UnitFlagManager,engine,Configuration,Database,Online" --json
bun run --cwd packages/cli dev -- game exec 'JSON.stringify(Object.getOwnPropertyNames(globalThis).sort())' --state "App UI" --json
bun run --cwd packages/cli dev -- game exec 'JSON.stringify(Object.getOwnPropertyNames(globalThis).sort())' --state "Tuner" --json
```

Additional read-only probes inspected `GameInfo`, operation enum globals,
builder roots, `Visibility`, and nested `Game.*Operations` routers.

## Surface Size

| State | Top-level global names | Notes |
|---|---:|---|
| `App UI` | 549 | Includes DOM/UI/browser-like globals, `Network`, `UI`, `Camera`, `Online`, `Automation`, gameplay read roots, and operation enums. |
| `Tuner` | 227 | Smaller gameplay/map scripting surface. Lacks `Network`, `UI`, `GameContext`, `Camera`, and `Online`, but includes map builders and gameplay operations. |

## App UI Highlights

| Root | Status | Useful capability |
|---|---|---|
| `Network` | 145 methods | Restart, save/load/sync, lobby/network/session reads. `restartGame()` is confirmed. |
| `UI` | 134 methods | Loading state, Begin Game via `notifyUIReady()`, clipboard, profiling, UI shell/game status. |
| `GameContext` | 9 methods | Turn complete/unready, pause/retire requests, local player/observer ids. |
| `Autoplay` | 8 methods | `setActive`, `setTurns`, `setReturnAsPlayer`, `setObserveAsPlayer`, AI/human toggles. Mutating; should be explicit wrappers. |
| `Camera` | 34 methods | Plot/world picking and camera movement/focus; useful for Studio/debug UI, not core map proof. |
| `Automation` | 25 methods | Test/automation parameter and log helpers; useful to research before wrapping. |
| `Visibility` | 10 methods | Reveal/visibility counts and `revealAllPlots`; high-value but mutating. |
| `GameplayMap`, `Players`, `Units`, `Cities`, `MapUnits`, `MapCities` | present | Read gameplay/map/city/unit state. |

App UI does not expose `TerrainBuilder`, `ResourceBuilder`, `FertilityBuilder`,
or `AreaBuilder` in this run.

## Tuner Highlights

| Root | Status | Useful capability |
|---|---|---|
| `GameplayMap` | 74 methods | Map dimensions, terrain/biome/feature/resource/elevation/rainfall/yields, revealed state, ownership, distances. |
| `TerrainBuilder` | 21 methods | Map mutation: terrain, biome, feature, rainfall, plot tags, rivers, elevation, validation. |
| `ResourceBuilder` | 10 methods | Resource counts/eligibility/generated resources and `setResourceType`. |
| `FertilityBuilder` | 2 methods | Fertility recalculation and `setFertilityType`. |
| `AreaBuilder` | 5 methods | Area/continent analysis and `recalculateAreas`. |
| `Visibility` | 10 methods | Reveal and visibility manipulation. |
| `Game.PlayerOperations` | `canStart`, `sendRequest` | Player-level actions such as tech/culture targets, resource assignment, diplomacy, turn-like decisions. |
| `Game.UnitOperations` | `canStart`, `canStartAny`, `sendRequest` | Unit operations such as move, attack, fortify, found city, automate explore. |
| `Game.UnitCommands` | `canStart`, `sendRequest` | Unit commands such as promote, wake, delete, upgrade, automate. |
| `Game.CityOperations`, `Game.CityCommands` | `canStart`, `canStartQuery`, `sendRequest` | City build/purchase/manage/focus style actions. |
| `GameInfo`, `Database` | present | Dynamic table access. `GameInfo.Resources.length` returned `55`; first row was `RESOURCE_COTTON`. |

Tuner lacks `Network`, `UI`, `GameContext`, `Camera`, and `Online` in this run.

## Enum/Operation Evidence

Operation enum globals are present in both states, with richer practical use in
Tuner because `Game.*Operations` routers are present there. Examples observed:

- `UnitOperationTypes.MOVE_TO`, `RANGE_ATTACK`, `FORTIFY`, `FOUND_CITY`,
  `AUTOMATE_EXPLORE`, `SKIP_TURN`, `SLEEP`, `REPAIR`, `PILLAGE`.
- `UnitCommandTypes.PROMOTE`, `WAKE`, `DELETE`, `UPGRADE`, `AUTOMATE`,
  `STOP_AUTOMATION`.
- `PlayerOperationTypes.SET_TECH_TREE_NODE`, `SET_CULTURE_TREE_NODE`,
  `ASSIGN_RESOURCE`, `DECLARE_WAR`, `MAKE_PEACE`, `EXTEND_GAME`.
- `CityOperationTypes.BUILD`; `CityCommandTypes.PURCHASE`, `SET_FOCUS`,
  `EXPAND`, `RANGE_ATTACK`.

Official UI resources corroborate the operation pattern:
`Game.<Domain>Operations.canStart(...)` followed by
`Game.<Domain>Operations.sendRequest(...)`, and similar
`Game.<Domain>Commands.canStart/sendRequest`.

## Initial Wrap Recommendations

- Wrap now: state-aware health, App UI status, Tuner map summary, map grid
  sampling, player summary, GameInfo table samples, reveal status summaries,
  and operation enum catalog export.
- Wrap carefully: `restartGame`, `notifyUIReady`, autoplay controls,
  `Visibility.revealAllPlots`, turn-complete, and operation `canStart` queries.
- Keep raw until proven: operation `sendRequest`, `TerrainBuilder`/`ResourceBuilder`
  mutation, save/load/network methods, direct unit/city creation or damage.
- Avoid by default: multiplayer/account/online methods, destructive save/delete,
  broad map mutation in a normal game session, and unsupported UI internals.
