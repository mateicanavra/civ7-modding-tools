# Civ7 Direct-Control Capability Inventory

Date: 2026-05-31

## Executive Summary

App UI and Tuner are not parity surfaces. They overlap on some gameplay reads,
but they should be modeled as separate domains:

- `App UI` owns lifecycle and client control: `Network.restartGame()`,
  `UI.notifyUIReady()`, loading status, session/network status, camera/UI
  helpers, automation helpers, and App UI-facing map/player reads.
- `Tuner` is command-ready only after Begin Game, and then becomes the stronger
  gameplay/map surface: `GameplayMap`, `Players`, `Units`, `Cities`,
  `MapUnits`, `MapCities`, `MapAreas`, `MapRegions`, `MapConstructibles`,
  `Database`, `GameInfo`, `TerrainBuilder`, `ResourceBuilder`,
  `FertilityBuilder`, operation routers, and operation constants.
- Restart/begin stays App UI-owned. Tuner should be used for post-Begin
  gameplay readiness, live map reads, map-generation diagnostics, and carefully
  bounded gameplay command research.
- We can generate a useful TypeScript-adjacent catalog, but not perfect
  function signatures from runtime alone. The right artifact is a
  provenance-aware hybrid catalog that records runtime availability, official
  resource/schema evidence, current `@civ7/types` declarations, and confidence.
- Direct-control is already credible for developer automation and supervised
  gameplay assistance. It is not yet an autonomous AI player API because legal
  action schemas, end-turn control, event feedback, visibility filtering, and
  mutation safety are not fully proven.

## Evidence Base

This consolidation uses:

- live read-only `game inspect` and `game exec` probes through the committed
  CLI/direct-control path;
- `app-ui-surface-report.md`;
- `tuner-surface-report.md`;
- `type-generation-report.md`;
- `automation-playability-report.md`;
- official resources under `.civ7/outputs/resources`;
- current `packages/civ7-direct-control` and `packages/civ7-types`.

No broad gameplay mutations were run for this inventory.

## Surface Matrix

| Capability family | App UI | Tuner | Practical owner |
|---|---|---|---|
| State discovery | `LSQ:` lists states | `LSQ:` lists states | Package transport |
| Restart | `Network.restartGame()` confirmed | absent | App UI |
| Begin Game | `UI.notifyUIReady()` confirmed | absent | App UI |
| Loading/shell status | `UI.isInGame`, `isInLoading`, `getGameLoadingState` | absent | App UI |
| Tuner readiness | can see state, not enough by itself | read-only canary confirmed post-Begin | Tuner |
| Network/session | rich `Network` surface | absent | App UI |
| Autoplay | fields and mutators | fields and mutators | App UI first, Tuner plausible |
| Map reads | present | stronger gameplay surface | Tuner preferred post-Begin |
| Map generation builders | mostly absent except some WorldBuilder evidence | `TerrainBuilder`, `ResourceBuilder`, `FertilityBuilder`, `AreaBuilder` | Tuner research/raw |
| Visibility/reveal | `Visibility` present; reads/writes plausible | `Visibility` present; reads/writes plausible | read wrappers now, reveal research later |
| Units/cities | present | richer gameplay command/read surface | Tuner |
| Game operations | present in source/runtime roots | `Game.*Operations` and `Game.*Commands` confirmed | Tuner research first |
| Camera/UI overlays | `Camera`, `WorldUI`, `UI.Debug` evidence | absent | App UI research later |
| GameInfo/Database | present; dynamic | present; dynamic | Tuner preferred for post-Begin catalogs |
| Online/account/multiplayer | present | absent | Avoid by default |

## Wrap Now

These are good first-class `@civ7/direct-control` candidates because they are
read-only or already proven lifecycle controls.

| Wrapper | State | Why |
|---|---|---|
| `getCiv7PlayableStatus()` | App UI + optional Tuner | One developer status call: states, selected roles, loading, turn/date, local player, map size, Tuner readiness. |
| `getCiv7MapSummary()` | Tuner preferred | Dimensions, seed, plot count, map size, age, optional area/region counts. |
| `getCiv7PlotSnapshot(x, y, playerId?)` | Tuner preferred | Terrain, biome, feature, resource, elevation, rainfall, yields, owner, revealed state, area/region/landmass. |
| `getCiv7MapGrid({ fields, bounds })` | Tuner preferred | Bounded structured map extraction for Studio/debug comparison. |
| `getCiv7PlayerSummary(playerId?)` | Tuner preferred | Alive/human/AI flags, civ/leader, team, current-turn flags, resource/unit/city counts where bounded. |
| `getCiv7UnitSummary(playerId?)` | Tuner preferred | Unit ids/locations/activity/visible action facts. Keep output bounded. |
| `getCiv7CitySummary(playerId?)` | Tuner preferred | City ids, capital, locations, district facts, production-read facts where available. |
| `getCiv7VisibilitySummary(playerId)` | Tuner preferred | Revealed/visible counts and optionally a bounded revealed-state grid. |
| `getCiv7GameInfoRows(table, options)` | Tuner preferred | Targeted `GameInfo`/`Database` rows for resources, terrain, features, maps, operations. |
| `inspectCiv7Root({ state, root, maxKeys })` | Both | Bounded, safer replacement for huge root dumps. |

Keep the existing lifecycle wrappers:

- `restartCiv7Game()`
- `beginCiv7Game()`
- `restartCiv7GameAndBegin({ waitForTuner })`
- `checkCiv7TunerHealth()`
- `waitForCiv7TunerReady()`

## Wrap Carefully

These should be explicit mutating APIs with no automatic replay after socket
failures and with before/after or postcondition evidence.

| Wrapper | State | Contract needed |
|---|---|---|
| `setAutoplay({ turns, observeAsPlayer, returnAsPlayer })` | App UI or Tuner | Max-turn cap, status before/after, explicit stop. |
| `startAutoplay()` / `stopAutoplay()` | App UI or Tuner | No silent long runs; caller accepts simulation mutation. |
| `revealAllPlots(playerId)` | likely App UI/Tuner `Visibility` | Disposable-session proof first; high cheating risk. |
| `sendTurnComplete()` | App UI `GameContext` | Needs stable end-turn semantics and blocking-choice handling. |
| `canStartUnitOperation(...)` | Tuner | Read-only validator first, then optional mutating counterpart. |
| `requestUnitOperation(...)` | Tuner | Requires prior `canStart` result or explicit `force`. |
| `canStartCityOperation(...)` / `requestCityOperation(...)` | Tuner | Same validator-first split. |
| `canStartPlayerOperation(...)` / `requestPlayerOperation(...)` | Tuner | High blast radius; approval-friendly output. |

## Keep Raw For Now

Keep these behind `executeCiv7Command` / `executeCiv7TunerCommand` until a
specific wrapper earns a contract.

- `Game.*Operations.sendRequest` and `Game.*Commands.sendRequest`.
- `Units.create`, `Units.setLocation`, `Units.setDamage`,
  `Units.restoreMovement`, `Units.changeExperience`.
- `TerrainBuilder.*`, `ResourceBuilder.setResourceType`,
  `FertilityBuilder.setFertilityType`, `AreaBuilder.recalculateAreas`.
- `MapConstructibles.add*` / `remove*`.
- `Players.grantYield`, `grantGreatWork`, `grantCultureSlot`.
- `Database.query`, except possibly a read-only `SELECT` helper after safety
  proof.
- `Configuration.edit*`.
- `WorldUI.*`, `UI.Debug.*`, camera/overlay/VFX helpers.
- `Network.saveGame`, `loadGame`, `deleteGame`, `syncGame`, multiplayer,
  account, invite, chat, kick, URL, and QR flows.

## Useful For Map Generation And Studio

Highest-value direct-control additions for this repo:

1. Live map summary and plot/grid extraction after Studio deploy/restart.
2. Runtime-vs-MapGen projection comparison: terrain, biome, feature, resource,
   elevation, rainfall, river, yield, area, region, landmass, and tags.
3. Resource/table catalog reads from `GameInfo` and official resources:
   resources, terrains, biomes, features, maps, operations, commands.
4. Visibility summaries for "what would a player actually see?" debugging.
5. Player/unit/city overlays for Studio debug panels.
6. Bounded autoplay for smoke tests after map generation once explicit safety is
   proven.
7. Optional disposable-session map-edit experiments for `TerrainBuilder` and
   `ResourceBuilder`, not normal Studio save flows.

## AI / LLM Play Feasibility

Direct-control can support an assistant that observes, summarizes, plans, and
executes approved actions. It cannot yet safely support a fully autonomous Civ7
player.

| Tier | Status | Description |
|---|---|---|
| Developer status assistant | ready | Health, states, restart/begin, snapshots, root inspection. |
| Map/Studio automation assistant | ready/near-term | Restart loops, map summaries, proof logs, runtime comparison. |
| Supervised gameplay advisor | feasible next | Read map/player/unit/city state and propose actions. |
| Supervised command executor | feasible after validators | Execute one approved validated action at a time. |
| Bounded autoplay runner | feasible after wrapper | Run AI/autoplay N turns and report status. |
| Autonomous playable agent | not ready | Missing full state model, end-turn path, action schemas, event feedback, and safety policy. |

Blocking gaps for autonomous play:

- richer playable snapshots;
- local-player visibility filters to avoid hidden-information reads;
- operation argument schemas;
- stable end-turn path;
- notification/blocking-choice detection;
- operation result/event feedback;
- save/load or rollback sandboxing;
- explicit safety policy for diplomacy, war, deletes, account/network, and
  world-edit operations.

## Type And Catalog Strategy

Do not try to generate high-level wrappers directly from runtime methods. Native
methods often report weak metadata such as `length: 0` and `[native code]`.

Recommended next architecture:

1. Add a TypeBox-validated capability catalog schema in `@civ7/direct-control`.
2. Generate runtime availability snapshots by state/phase with root allowlists,
   descriptor-first metadata, method names, native/source fingerprints, and
   selected read-only sample results.
3. Parse official SQL/XML resources for `GameInfo` tables, operation rows,
   command rows, enum-like identifiers, and row schemas.
4. Compare the generated catalog with `packages/civ7-types/index.d.ts`.
5. Emit a human-readable reference sheet and, later, reviewed `.d.ts` slices for
   `@civ7/types`.

Each catalog symbol should carry:

- state role/name/id and phase;
- path, kind, access classification, risk classification;
- runtime observed type/descriptors;
- official resource/type provenance;
- confidence (`runtime-observed`, `official-resource`, `declared`,
  `public-hint`, or merged);
- wrapper recommendation (`wrap-now`, `wrap-carefully`, `raw`, `research`,
  `avoid`).

## Next Implementation Slices

Recommended order:

1. Read-only snapshot wrappers for Tuner map/player/plot summaries.
2. Bounded root inspection and catalog snapshot command.
3. Hybrid capability catalog schema and generator spike.
4. Autoplay wrapper with max-turn and stop semantics.
5. `canStart` validators for unit/city/player operations, no send yet.
6. One disposable-session mutating proof, likely a low-risk unit skip/sleep or
   autoplay run, with before/after evidence.
7. Optional Studio endpoint for live map summary and runtime comparison.

## Reframe Triggers

- App UI or Tuner root availability changes materially across fresh restarts,
  phases, or game versions.
- Useful gameplay actions require UI event/input state that cannot be produced
  through `CMD:<stateId>:<javascript>`.
- `GameInfo`/`Database` result sizes or query semantics are too unstable for
  bounded wrappers.
- Direct mutation helpers bypass validation and corrupt save/session state.
- Runtime metadata proves too weak for a useful generated catalog without
  official declarations or a better reflection hook.
