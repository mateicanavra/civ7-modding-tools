# Sieve Engine Reference

Status: Normative

Audience: agents working on placement, `@civ7/direct-control`, CLI game
commands, Studio runtime proof, or Civ7 operational debugging.

This document records the operational facts discovered while probing live map
mutation, save/load boundaries, and native WorldBuilder command objects. It is
an implementation reference, not a project log. Use it to decide what belongs
in the direct-control package and CLI, what belongs in placement/map-generation
code, and what remains a research-only native bridge.

In this reference, "sieve engine" means the direct-control-driven operational
loop that connects to a live Civ7 process, selects a scripting state, executes a
bounded probe or mutation, waits for the relevant command boundary, and rereads
runtime state to classify what actually changed. It is a proof and debugging
surface, not a replacement for placement or MapGen source authority.

## Authority

`@civ7/direct-control` owns runtime control of a running Civ7 process through
the tuner socket. CLI, Studio, placement proof tooling, and agent workflows must
call direct-control package helpers instead of owning raw socket frames or
caller-local JavaScript snippets.

Placement and MapGen code own map truth, recipes, deterministic artifacts, and
map-script authoring. They must not depend on live WorldBuilder or native binary
mutation to make generated maps correct.

Official resources, Civ7 logs, live tuner reads, and binary inspection are
evidence. They do not by themselves define a public repo API. Promote a runtime
primitive into `@civ7/direct-control` only when the package can provide:

- a state-scoped wrapper (`App UI` vs `Tuner`);
- bounded inputs and structured JSON output;
- mutation classification;
- command-boundary readback;
- postcondition proof for writes;
- no automatic replay after failed or unverified mutation.

## Runtime Surfaces

Civ7 exposes separate scripting states. Do not treat globals from one state as
available in another without a fresh probe.

| State | Role | Useful roots observed |
|---|---|---|
| `App UI` | Lifecycle, UI, save/load, WorldBuilder, many developer controls | `Network`, `UI`, `GameContext`, `Autoplay`, `WorldBuilder`, `WorldBuilderContext`, `GameplayMap`, `Players`, `Game`, `Database`, `GameInfo` |
| `Tuner` | Gameplay/map canary and map-builder surface after Begin Game | `GameplayMap`, `TerrainBuilder`, `AreaBuilder`, `MapRivers`, `Game`, `Players`, `Autoplay` |

Command execution has a frame boundary. Some native/UI mutations are stale when
read back inside the same JavaScript command. After writes, direct-control
wrappers must reread in a later command before reporting a postcondition.

## Useful Direct-Control And CLI Endpoints

These endpoints are useful enough to keep or promote into core direct-control
and CLI surfaces. Names below distinguish repo commands from Civ7 runtime
methods.

| Endpoint | State | Use | Normative handling |
|---|---|---|---|
| `civ7 game health --json` | socket / state discovery | Check listener and available states. | Keep as first diagnostic gate. |
| `civ7 game health --tuner --json` | `Tuner` | Verify post-Begin gameplay command readiness. | Use before `GameplayMap`, `TerrainBuilder`, or `MapRivers` probes. |
| `civ7 game exec "<js>" --state ... --json` | chosen state | Raw research/probe transport. | Keep diagnostic-only; do not make it the product API for repeated workflows. |
| `civ7 game restart --begin --wait-tuner --json` | `App UI` then `Tuner` | Restart current setup, run Begin Game, wait for gameplay canary. | Keep as core operational loop for disposable map runs. |
| `civ7 game map ... --json` | package wrapper | Structured map summaries, plot snapshots, grids. | Prefer over raw `GameplayMap` snippets in CLI/Studio. |
| `civ7 game visibility ... --json` | package wrapper | Structured visibility reads and disposable reveal control. | Keep player-scoped and proof-returning. |
| `civ7 game catalog --json` | package wrapper | Runtime/static capability catalogue. | Catalogue entries must carry state, provenance, confidence, and mutation class. |
| `Network.saveGame(params)` | `App UI` | Save a game/config/state for sandboxing and reload-boundary tests. | Promote as an explicit game-control wrapper, not a gameplay action. Wait for completion evidence when possible. |
| `Network.loadGame(params, serverType)` | `App UI` | Load a saved game/config/state. | Promote as an explicit game-control wrapper. Treat the tuner listener/states as unstable until rediscovered. |
| `UI.reloadUI()` | `App UI` | Reload UI modules/resources. | Keep as raw/elevated debugging unless a narrow UI recovery wrapper needs it. It does not rebuild GameCore map state. |

### Save And Load Parameters

Official resources use object parameters rather than positional filenames:

```js
Network.saveGame({
  Location: SaveLocations.LOCAL_STORAGE,
  LocationCategories: SaveLocationCategories.NORMAL,
  Type: SaveTypes.SINGLE_PLAYER,
  ContentType: SaveFileTypes.GAME_STATE,
  FileName: "example-save-name"
});

Network.loadGame(params, ServerType.SERVER_TYPE_NONE);
```

Official save/load UI code also passes `DisplayName`, `Slot`, and
`AdditionalInfo` when loading selected saves. Automation scripts show the same
core shape with `Location`, `Type`, `FileName`, and sometimes `Directory`.

`Network.saveGame` and `Network.loadGame` are operationally important because
they create a hard reload boundary. They are not a generic rebuild trigger. Live
river probes showed that a terrain edit persisted through save/load while the
native river graph did not materialize.

## WorldBuilder And Map Mutation Endpoints

WorldBuilder plot setters are real live mutation endpoints in `App UI`, even
when `WorldBuilder.isActive` is false in the observed session.

Observed `WorldBuilder.MapPlots` methods:

- `setTerrain(type, loc)`
- `setFeature(type, loc)`
- `setFertility(type, loc)`
- `setResource(type, loc)`
- `setRevealed(playerId, loc, revealed)`
- `setAllRevealed(playerId, revealed)`
- `setOwnership(playerId, loc)`
- `setBiome(type, loc)`

Use `WorldBuilder.startBlock()` / `WorldBuilder.endBlock()` when testing a
batch, but do not assume the block wrapper proves atomicity or editor-mode
safety until a wrapper has explicit before/after proof.

Known command-boundary behavior:

- `WorldBuilder.MapPlots.setTerrain(terrain, loc)` can return before
  `GameplayMap.getTerrainType` reflects the change in the same command.
- A later command can observe the terrain mutation.
- For river stamping, setting terrain to `TERRAIN_NAVIGABLE_RIVER` changes only
  the terrain row; it does not make the plot a native river plot.

## TerrainBuilder, Map Scripts, And River Stamping

Map scripts should use the official TerrainBuilder river sequence during map
generation. The currently useful sequence is:

```js
TerrainBuilder.setRiverValidationValues(5, 15);
TerrainBuilder.modelRivers(5, 15, 5);
TerrainBuilder.validateAndFixTerrain();
TerrainBuilder.defineNamedRivers();
TerrainBuilder.addFloodplains(4, 10);
TerrainBuilder.validateAndFixTerrain();
AreaBuilder.recalculateAreas();
TerrainBuilder.storeWaterData();
```

`setRiverValidationValues` is a two-argument void binding. Do not call it with
the three-argument `modelRivers` shape.

The sequence above is a bulk map-script/native modeling path. It is not a
targeted live river-graph editor. In live probes, it changed global river counts
and `MapRivers.numRivers`, but selected stamped plots still read:

```text
riverType: -1
isRiver: false
isNavigableRiver: false
```

`TerrainBuilder.setTerrainType(x, y, 5)` and
`WorldBuilder.MapPlots.setTerrain(5, { x, y })` can make a live plot read as
`TERRAIN_NAVIGABLE_RIVER`. That is not sufficient for navigation, river naming,
fresh-water, river adjacency, floodplain membership, or any other GameCore river
graph behavior.

Placement-stack implication: if a map needs real navigable rivers, author the
terrain and topology before or during the official map-generation river
modeling phase. Do not rely on live post-generation stamping to repair native
river membership.

## Native River Data Model

Official WorldBuilder schema stores terrain and river graph data separately.
Relevant tables:

- `PlotRivers(ID, Size, Outflow, NEInflow, EInflow, SEInflow, SWInflow, WInflow, NWInflow)`
- `RiverInstance(ID, Type, DiscoveringCiv, CustomName)`
- `RiverPlot(ID, PlotIndex)`
- `RiverFloodplain(ID, PlotIndex)`

Runtime reads expose this separation:

- `GameplayMap.getTerrainType(x, y)` reports the terrain row.
- `GameplayMap.getRiverType(x, y)`, `GameplayMap.isRiver(x, y)`, and
  `GameplayMap.isNavigableRiver(x, y)` report native river graph membership.
- `MapRivers` exposes read-side helpers such as `getRiver`,
  `getRiverPlots`, `getRiverIDByIndex`, `getRiverTypeByIndex`, and
  `isRiverConnectedToOcean`.

`MapRivers` is read-only in the observed JS/Tuner surface. No exposed
`MapRivers` setter, `WorldBuilder.MapPlots.editRiver`, `setRiver`,
`setRiverType`, `addRiver`, or equivalent targeted graph writer was found.

## Reload Boundaries

Reload boundaries were tested specifically to see whether Civ rebuilds the
native river graph from `TERRAIN_NAVIGABLE_RIVER`.

| Boundary | Result |
|---|---|
| `UI.reloadUI()` | Reloaded UI only; stamped plots remained terrain `5` and native river flags stayed false. |
| `Network.saveGame(...)` then `Network.loadGame(...)` | Terrain edit persisted through save/load; `riverType`, `isRiver`, and `isNavigableRiver` stayed unchanged. |
| `WorldBuilderContext.save()` | Callable surface exists, but zero-argument call logged a native/JS argument error and did not change river state. |

Normative conclusion: do not use reload, save/load, or UI reload as a river
graph rebuild strategy. Save/load is still valuable for sandboxing and proving
serialization boundaries.

## Native Binary Command Objects

Binary inspection found a native WorldBuilder command family. The relevant
river command exists:

- `GameCore::WorldBuilder::Map::CommandEditRiver`
- command id `6`
- neighboring command ids observed: route `5`, cliff `7`, revealed `8`
- constructor stores the base target plot index plus one integer and one
  boolean

This does not make `CommandEditRiver` a usable JS/Tuner command. The App UI
`WorldBuilder.MapPlots` registration surface exposes terrain, feature,
fertility, resource, reveal, ownership, and biome setters, but no river edit
binding.

Native-call findings:

- LLDB attach to the Civ7 process was technically possible in the local macOS
  environment.
- Calling the `CommandEditRiver` constructor directly with a guessed ABI/layout
  caused an `EXC_BAD_ACCESS`; LLDB rolled back the expression and the game
  remained healthy.
- Manually constructing the command object layout from the vtable and fields,
  then calling the observed validation and execute slots, returned `1` from
  both calls.
- That successful native function call did not mutate `PlotRivers`,
  `RiverPlot`, `GameplayMap.getRiverType`, `GameplayMap.isRiver`, or
  `GameplayMap.isNavigableRiver`.
- Disassembly of the observed execute slot showed it reaching a manager getter
  and toggling the command object's own boolean, not visibly writing plot river
  metadata.

Normative rule: native binary command object calls are research tools, not a
direct-control product surface. A native call returning success is not proof of
game-state mutation. Every native bridge experiment must verify state through
public gameplay reads across a command boundary.

Do not bake LLDB expressions, absolute binary addresses, ASLR slides, vtable
slots, or guessed object layouts into `@civ7/direct-control` or CLI. A native
river bridge would require a purpose-built injected/native layer with version
gating, symbol discovery, argument schema, crash containment, and postcondition
proof. Until then, the direct-control package should expose the negative
capability clearly rather than offering a fake river-stamp wrapper.

## Operational Debugging Rules

Use this checklist for sieve/direct-control debugging:

1. Start with `civ7 game health --json`; confirm the listener and state names.
2. Use `App UI` for lifecycle, save/load, UI, WorldBuilder, and `Network`.
3. Use `Tuner` for post-Begin gameplay/map builder canaries.
4. After a mutation, wait for a separate command boundary before readback.
5. Record seed, dimensions, target plots, and pre/post counts for map probes.
6. For river probes, record both terrain and native graph fields:
   `terrain`, `riverType`, `riverName`, `isRiver`, `isNavigableRiver`,
   `isWater`, `isFreshWater`, `areaId`, `landmassId`, and adjacency.
7. Bound log reads after the action. On macOS, the active local path observed
   for this install was `~/Library/Application Support/Civilization VII/Logs`.
8. Treat official resources as game evidence and the repo submodule pointer as
   repo state. If latest resources are needed only for investigation, inspect a
   scratch checkout or installed resources without leaving the submodule dirty.
9. If a game restart or load happens, rediscover tuner states before the next
   command; process/listener ids can change.
10. Close claims with evidence labels: resource-backed, tuner-exercised,
    in-game observed, logged, unresolved.

## Promotion Guidance

Bake these into core direct-control/CLI:

- state-scoped health and readiness gates;
- explicit save-game and load-game wrappers with completion/readiness proof;
- structured map and plot readbacks that include hydrology/native river fields;
- a disposable-session WorldBuilder plot edit wrapper only if it reports delayed
  readback and mutation class honestly;
- a negative-capability result for targeted native river stamping until a real
  graph writer is exposed or built.

Keep these as raw/elevated research:

- arbitrary `game exec` mutation snippets;
- `WorldBuilderContext.save()` until its required signature and editor mode are
  proven;
- `UI.reloadUI()` except for explicit UI recovery/debugging;
- native command object construction or LLDB injection;
- any wrapper that claims to create a navigable river from terrain-only writes.

Do not add:

- caller-local tuner socket implementations outside `@civ7/direct-control`;
- placement logic that depends on live WorldBuilder edits;
- silent same-command readback after native/UI mutations;
- automatic retries for save/load, WorldBuilder writes, or native bridge calls;
- a "river stamp" CLI command unless it can prove native graph membership.
