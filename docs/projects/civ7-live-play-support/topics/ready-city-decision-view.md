# Ready City Decision View

Status: `promotable-reference`.

## Frame

City blockers need a read surface between the notification HUD and mutating
shortcuts. `game play ready-city` is that surface. It should answer which city
is relevant, what the live city object says, and which existing command needs
which args. It should not choose production, buy tiles, change growth mode, or
send city operations.

The command is read-only by design:

```bash
civ7 game play ready-city --json
civ7 game play ready-city --compact --json
```

For an explicit city:

```bash
civ7 game play ready-city \
  --city-id '{"owner":0,"id":131073,"type":1}' \
  --json
```

## What It Reads

The direct-control view resolves the requested city, selected city, or
end-turn-blocking notification target. For `NEW_POPULATION` notifications whose
target is empty, it mirrors the official `NewPopulationHandler` fallback by
scanning the local player's cities for `Growth.isReadyToPlacePopulation`.

It returns:

- city summary: name, location, population, town state, growth, worker, yield,
  happiness, and build queue fields that are safely readable;
- legal no-argument city operations and commands;
- actionable production candidates with item kind, args for
  `game play build-production`, and placement plots when BUILD validation
  returns `Plots`;
- town focus options with `{ Type, ProjectType, City }` args for
  `game play set-town-focus`;
- population placement evidence from `Growth.isReadyToPlacePopulation` and
  `Workers.GetAllPlacementInfo()`;
- `populationPlacement.workablePlots` for already-workable worker assignment
  candidates and `populationPlacement.expansionCandidates` for `EXPAND`
  purchase candidates, with map coordinates and best-effort constructible
  labels when the runtime exposes them.

Use `--compact --json` when comparing population placement candidates during
live play. It summarizes city state, assign-worker plots with named current and
next yields, yield deltas, expansion candidates with constructible labels, map
yield facts, terrain/resource labels, and the next candidate command. Yield
summaries use official `GameInfo.Yields` `YieldType` ids such as `YIELD_FOOD`
and `YIELD_DIPLOMACY`, with `populationPlacement.yieldTypeOrder` included as
the positional-array proof. Plain `--json` keeps the full raw placement,
production, town-focus, and validation payloads for debugging.

## Norms

- Use this after `game play notifications --json` identifies a production,
  town focus, or population blocker.
- Use production candidates only as validated live args. Do not rank or choose
  production from this view alone.
- For constructibles, send `game play build-production` with `X` and `Y` when
  the candidate exposes placement plots and the selected plot is still valid.
- For town focus, send `game play set-town-focus` only with a returned option's
  paired `Type` and `ProjectType`, then use `game play consider-town-project`
  only if the UI still needs closeout.
- For population placement, use `game play assign-worker` for the
  already-workable-tile branch and `game play expand-city` for the expansion
  purchase branch. The live city/acquire-tile read decides which branch is
  current: prefer `workablePlots` for `ASSIGN_WORKER { Location }` and
  `expansionCandidates` for `EXPAND { X, Y }`.

## Proof Boundaries

Direct-control runtime evidence is the authority for current legality. Local
SQLite/resource rows can label items, but they do not prove that this city can
build, place, or assign them now.

Read-only live smoke on 2026-06-01 resolved the current blocker city to
`{"owner":0,"id":65536,"type":1}`, returned 21 actionable production
candidates, no town-focus options because the city was not a town, and
`isReadyToPlacePopulation:false`. No operations were sent.

Turn 101 added a population-target fallback proof. The live
`NOTIFICATION_NEW_POPULATION` target was invalid, but `ready-city` resolved
city `{"owner":0,"id":131073,"type":1}` by scanning for
`Growth.isReadyToPlacePopulation:true`. It returned workable plot indexes
`2623` and `2708`, and validate-only `game play assign-worker --player-id 0
--location 2708 --json` succeeded as `ASSIGN_WORKER { Location:2708, Amount:1
}`. This proves city resolution and validation shape, not tile-ranking
correctness for all future turns.

Turn 112 exposed the expansion half of the same read model: a town at `(20,20)`
had `workablePlotIndexes:[]` while `EXPAND` validation returned purchasable
plot indexes and constructible-type values. The direct-control view now maps
that result into `expansionCandidates` so a watcher can send coordinates to the
active agent without manually converting plot indexes.

Official UI anchors:

- `production-chooser-helpers.chunk.js` uses
  `Game.CityOperations.canStartQuery(..., CityQueryType.Constructible|Unit)`
  for buildable constructibles and units.
- The same helper validates ordinary projects with
  `Game.CityOperations.canStart(..., BUILD, { ProjectType })`.
- Town focus uses `Game.CityCommands.canStart(..., CHANGE_GROWTH_MODE,
  { Type: GrowthTypes.PROJECT })` and returned `Projects`.
- `plot-workers-manager.js` reads `city.Workers.GetAllPlacementInfo()`.
- `notification-handlers.js` routes `NEW_POPULATION` into acquire-tile mode.
- `notification-handlers.js` also resolves targetless `NEW_POPULATION`
  notifications by iterating the local player's city ids and selecting the
  first city with `Growth.isReadyToPlacePopulation`.

Open gaps:

- Production ranking or "best build" guidance.
- Purchase mode, repair-all sends, and town upgrade purchase.
