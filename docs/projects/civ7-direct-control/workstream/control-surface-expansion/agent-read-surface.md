# Read-Surface Design Lane

Date: 2026-05-31  
Lane: Read-surface designer  
Output path: `docs/projects/civ7-direct-control/workstream/control-surface-expansion/agent-read-surface.md`

## Frame

[source] Objective: convert every previously classified wrap-now read candidate into concrete first-class `@civ7/direct-control` contracts for playable status, map summary/grid/plot snapshots, player/unit/city/resource summaries, visibility summaries, `GameInfo`/`Database` reads, and bounded root inspection.

[source] State-role rule: prefer `Tuner` after Begin Game for gameplay and map reads; prefer `App UI` for lifecycle, session, loading, restart/begin readiness, and local-client status. This follows `capability-inventory.md`, `tuner-surface-report.md`, `app-ui-surface-report.md`, and current package exports.

[inference] The first implementation slice should add read-only package helpers before any validator/action wrappers. Reads are the foundation for stale-state detection, Studio runtime comparison, and LLM/player safety policy.

[fresh-live-proof] None collected in this lane. This report uses source review, official resource evidence, and recorded live proof from the prior capability inventory reports.

## Evidence Basis

| Claim | Label | Evidence |
|---|---|---|
| `@civ7/direct-control` currently owns socket framing, state discovery, state-role selection, command execution, App UI snapshot, restart/begin, Tuner health, and log marker proof. | source | `packages/civ7-direct-control/src/index.ts`, `packages/civ7-direct-control/test/direct-control.test.ts` |
| App UI currently owns `Network`, `UI`, `GameContext`, session/loading state, restart, begin, and broad client status. | source / recorded-live-proof | `app-ui-surface-report.md`; `CIV7_RESTART_COMMAND`, `CIV7_BEGIN_GAME_COMMAND`, `buildAppUiSnapshotCommand()` in package source |
| Tuner is not command-ready just because it appears in `LSQ:`; the package must use a read-only Tuner canary. | source / recorded-live-proof | `tuner-surface-report.md`; `checkCiv7TunerHealth()` and its tests |
| Tuner is the stronger post-Begin gameplay read surface for map, player, unit, city, resource, visibility, `GameInfo`, and `Database` reads. | recorded-live-proof | `capability-inventory.md`, `tuner-surface-report.md` |
| Official resources show Civ UI and map scripts using `GameplayMap`, `GameInfo`, `Database.query`, `MapUnits`, `MapCities`, `MapConstructibles`, `Network.restartGame()`, and `UI.notifyUIReady()`. | official-resource | `.civ7/outputs/resources/Base/modules/**`, especially `map-debug-helpers.js`, `plot-tooltip.js`, `tuner-input.js`, pause/load screen resources |
| `@civ7/types` currently models selected map-generation globals and `GameInfoTable<T>`, but not the full direct-control App UI/Tuner surface. | source | `packages/civ7-types/index.d.ts` |
| Native runtime methods do not expose trustworthy argument contracts through current introspection alone. | source / recorded-live-proof | `type-generation-report.md`; package records method `length` and signature sample only |

## Public Read Contracts

### `getCiv7PlayableStatus(options?)`

[source] Owner state role: App UI primary; optional Tuner canary. App UI owns loading/session/local context, and Tuner canary proves post-Begin gameplay command readiness.

Recommended signature:

```ts
export type Civ7PlayableStatusOptions = Civ7DirectControlOptions & {
  includeTuner?: boolean;
};

export type Civ7PlayableStatus = {
  host: string;
  port: number;
  appUiState: Civ7TunerState;
  tunerState?: Civ7TunerState;
  lifecycle: {
    loadingState: Civ7RuntimeProbe<number>;
    loadingStateName: string | null;
    inGame: Civ7RuntimeProbe<boolean>;
    inShell: Civ7RuntimeProbe<boolean>;
    inLoading: Civ7RuntimeProbe<boolean>;
    canBeginGame: Civ7RuntimeProbe<boolean>;
    tunerReady?: boolean;
  };
  session: Civ7AppUiSnapshot["network"];
  game: Civ7AppUiSnapshot["game"];
  localContext: Civ7AppUiSnapshot["gameContext"];
  players: Civ7AppUiSnapshot["players"];
  map: Civ7AppUiSnapshot["map"];
  autoplay: Civ7AppUiSnapshot["autoplay"];
};

export function getCiv7PlayableStatus(
  options?: Civ7PlayableStatusOptions,
): Promise<Civ7PlayableStatus>;
```

[inference] This should compose `getCiv7AppUiSnapshot()` and, when requested, `checkCiv7TunerHealth()`. It should not call restart, begin, autoplay, or any mutation.

Boundedness: fixed-size snapshot only; no root enumeration, map iteration, player object expansion, or `Database` reads.

Tests:

- [source] Mock socket test that `includeTuner: false` only sends App UI snapshot commands.
- [source] Mock socket test that `includeTuner: true` fails closed or returns `tunerReady: false` when Tuner exists but canary fails.
- [inference] Stale-state test: do not reuse a Tuner health result across a new App UI snapshot unless it came from the same call/session window.

CLI/Studio:

- [inference] CLI: `civ7 game status --json` or extend `game health --playable --json`.
- [inference] Studio: server endpoint for loaded-game banner: lifecycle, map dimensions, seed, turn/date, local player, Tuner-ready boolean.

### `getCiv7MapSummary(options?)`

[recorded-live-proof] Owner state role: Tuner preferred post-Begin; App UI fallback should only be allowed if explicitly named in options and documented as weaker.

Recommended signature:

```ts
export type Civ7MapSummaryOptions = Civ7DirectControlOptions & {
  state?: Civ7TunerStateSelection; // default { role: "tuner" }
  includeAreaRegionCounts?: boolean;
};

export type Civ7MapSummary = {
  host: string;
  port: number;
  state: Civ7TunerState;
  map: {
    width: Civ7RuntimeProbe<number>;
    height: Civ7RuntimeProbe<number>;
    plotCount: Civ7RuntimeProbe<number>;
    mapSize: Civ7RuntimeProbe<number | string>;
    randomSeed: Civ7RuntimeProbe<number>;
  };
  game: {
    turn: Civ7RuntimeProbe<number>;
    age: Civ7RuntimeProbe<number>;
    maxTurns: Civ7RuntimeProbe<number>;
    turnDate: Civ7RuntimeProbe<string>;
    hash: Civ7RuntimeProbe<number>;
  };
  areas?: {
    areaIds: Civ7RuntimeProbe<readonly number[]>;
    regionIds: Civ7RuntimeProbe<readonly number[]>;
  };
};
```

Boundedness: no per-plot data. `includeAreaRegionCounts` may return ID arrays only; cap returned IDs with `maxIds` if live data proves arrays can grow unexpectedly.

Tests:

- [source] Mock socket verifies Tuner state selection and JSON parsing.
- [inference] Error-path test where `GameplayMap.getGridWidth()` throws; wrapper must return probes, not fail the whole summary unless JSON is invalid.

CLI/Studio:

- [inference] CLI: `civ7 game map summary --json`.
- [inference] Studio: runtime map summary panel and MapGen-vs-live dimension/seed comparison.

### `getCiv7PlotSnapshot(input, options?)`

[recorded-live-proof] Owner state role: Tuner preferred. `GameplayMap` reads cover terrain, biome, feature, resource, elevation, rainfall, river, owner, visibility, yields, areas, regions, and landmass.

Recommended signature:

```ts
export type Civ7PlotSnapshotInput = {
  x: number;
  y: number;
  playerId?: number;
  fields?: readonly Civ7PlotSnapshotField[];
  includeHidden?: boolean; // default false for player-facing uses
};

export type Civ7PlotSnapshotField =
  | "terrain"
  | "biome"
  | "feature"
  | "resource"
  | "climate"
  | "hydrology"
  | "yields"
  | "owner"
  | "visibility"
  | "areaRegion"
  | "tags"
  | "city"
  | "units";

export type Civ7PlotSnapshot = {
  location: { x: number; y: number; index?: Civ7RuntimeProbe<number> };
  revealedState?: Civ7RuntimeProbe<number | string>;
  facts: Record<string, Civ7RuntimeProbe<unknown>>;
  hiddenInfoPolicy: "include-hidden" | "visibility-filtered" | "not-player-scoped";
};

export function getCiv7PlotSnapshot(
  input: Civ7PlotSnapshotInput,
  options?: Civ7DirectControlOptions,
): Promise<Civ7PlotSnapshot & { host: string; port: number; state: Civ7TunerState }>;
```

Boundedness: exactly one plot. Validate integer `x/y`, check `GameplayMap.isValidXY` or bounds before reading facts, and cap `fields` to a known allowlist.

Hidden-information policy:

- [inference] Default `includeHidden: false` when `playerId` is provided. If `getRevealedState(playerId, x, y)` is not visible/revealed, return visibility status and omit hidden terrain/resource/unit/city facts unless the caller explicitly opts in.
- [unresolved] Exact `RevealedStates` numeric/string mapping should be read from runtime constants and/or official resources before hard-coding names.

Tests:

- [source] Field allowlist test: unknown field fails before command build.
- [inference] Visibility test: hidden plot returns only location + revealed state by default.
- [inference] Fresh selection test: wrapper targets `{ role: "tuner" }` and does not use App UI unless requested.

CLI/Studio:

- [inference] CLI: `civ7 game plot X Y --player-id 0 --fields terrain,resource,visibility --json`.
- [inference] Studio: click-to-inspect live tile, with a visible hidden-info toggle for developer diagnostics.

### `getCiv7MapGrid(input, options?)`

[recorded-live-proof] Owner state role: Tuner preferred. Official `map-debug-helpers.js` shows full-map terrain/elevation/rainfall/biome/feature/resource debug loops, but public direct-control should emit structured bounded JSON rather than broad console dumps.

Recommended signature:

```ts
export type Civ7MapGridInput = {
  bounds?: { x: number; y: number; width: number; height: number };
  locations?: readonly { x: number; y: number }[];
  fields: readonly Civ7PlotSnapshotField[];
  playerId?: number;
  includeHidden?: boolean;
  maxPlots?: number; // default 512, hard cap 10_000 unless lowered by implementation review
};

export type Civ7MapGrid = {
  bounds: { x: number; y: number; width: number; height: number };
  fields: readonly Civ7PlotSnapshotField[];
  plotCount: number;
  omitted: number;
  hiddenInfoPolicy: "include-hidden" | "visibility-filtered" | "not-player-scoped";
  plots: readonly Civ7PlotSnapshot[];
};
```

Boundedness:

- [inference] Require either `bounds` or `locations`; do not default to full map.
- [inference] Default `maxPlots` should be 512. Hard cap can be 10,000 for current standard maps, but must be explicit and reviewed.
- [inference] Return `omitted` when input exceeds `maxPlots`; never silently truncate without metadata.
- [inference] Fields are allowlisted; no arbitrary JS projection callbacks.

Tests:

- Max-plot rejection/truncation behavior.
- Bounds validation for negative coordinates and dimensions.
- Hidden-information filtering with `playerId`.
- Payload shape remains stable when individual probes fail.

CLI/Studio:

- CLI: `civ7 game map grid --bounds 0,0,16,16 --fields terrain,resource --json`.
- Studio: sampled projection comparison; full-map extraction only behind explicit developer action and cap.

### `getCiv7PlayerSummary(input?, options?)`

[recorded-live-proof] Owner state role: Tuner preferred. Tuner exposes `Players.getAliveIds`, human/AI predicates, and `Players.get(playerId)` identity/status fields.

Recommended signature:

```ts
export type Civ7PlayerSummaryInput = {
  playerId?: number;
  includeCounts?: boolean; // default true
  includeNames?: boolean; // default true
  maxPlayers?: number; // default 64, hard cap 128
};

export type Civ7PlayerSummaryEntry = {
  playerId: number;
  exists: Civ7RuntimeProbe<boolean>;
  isAlive: Civ7RuntimeProbe<boolean>;
  isHuman: Civ7RuntimeProbe<boolean>;
  isAI: Civ7RuntimeProbe<boolean>;
  isTurnActive?: Civ7RuntimeProbe<boolean>;
  team?: Civ7RuntimeProbe<number>;
  civilization?: Civ7RuntimeProbe<string | number | null>;
  leader?: Civ7RuntimeProbe<string | number | null>;
  counts?: {
    units?: Civ7RuntimeProbe<number>;
    cities?: Civ7RuntimeProbe<number>;
    resources?: Civ7RuntimeProbe<number>;
    revealedPlots?: Civ7RuntimeProbe<number>;
  };
};
```

Boundedness: if `playerId` is omitted, only iterate alive IDs and cap total players. Do not expand full player objects.

Tests:

- Missing player returns `exists: { ok: true, value: false }` or a typed probe error, not an unstructured throw.
- Alive-ID list is capped and reports omissions if needed.

CLI/Studio:

- CLI: `civ7 game players --json`, `civ7 game player 0 --json`.
- Studio: player list overlay selector for map/unit/city filtering.

### `getCiv7UnitSummary(input?, options?)`

[recorded-live-proof] Owner state role: Tuner preferred. Tuner reports `Players.Units.get(playerId).getUnitIds`, `Units.get(unitId)`, `MapUnits.getUnits`, and unit read helpers.

Recommended signature:

```ts
export type Civ7UnitSummaryInput = {
  playerId?: number;
  plot?: { x: number; y: number };
  unitIds?: readonly number[];
  fields?: readonly ("identity" | "location" | "activity" | "movement" | "visibility" | "operations")[];
  maxUnits?: number; // default 128, hard cap 1_000
};

export type Civ7UnitSummaryEntry = {
  unitId: number;
  playerId?: Civ7RuntimeProbe<number>;
  type?: Civ7RuntimeProbe<number | string>;
  location?: Civ7RuntimeProbe<{ x: number; y: number }>;
  activity?: Civ7RuntimeProbe<unknown>;
  movement?: Civ7RuntimeProbe<unknown>;
  visibleOperationTypes?: Civ7RuntimeProbe<readonly string[]>;
};
```

Boundedness: require one of `playerId`, `plot`, or `unitIds`; do not scan all players and all units by default. Cap unit IDs and operation arrays.

Hidden-information policy:

- [inference] For LLM/player use, expose only local-player units by default or require explicit `includeNonLocalPlayers: true`.
- [unresolved] Need a package-level audience mode: developer diagnostic vs player/LLM-visible. Without it, unit summaries risk hidden-information leaks.

Tests:

- Requires a selector.
- Caps unit count.
- Does not call `getReachableTargets` or pathing-heavy reads unless explicitly requested.

CLI/Studio:

- CLI: `civ7 game units --player-id 0 --json`, `civ7 game units --plot 12,34 --json`.
- Studio: unit overlay for live map comparison.

### `getCiv7CitySummary(input?, options?)`

[recorded-live-proof] Owner state role: Tuner preferred. Tuner reports `Players.Cities.get(playerId).getCityIds`, `Cities.get`, `MapCities.getCity`, `Districts`, and city/district lookup surfaces.

Recommended signature:

```ts
export type Civ7CitySummaryInput = {
  playerId?: number;
  plot?: { x: number; y: number };
  cityIds?: readonly number[];
  includeDistricts?: boolean;
  includeProduction?: boolean;
  maxCities?: number; // default 64, hard cap 256
};

export type Civ7CitySummaryEntry = {
  cityId: number;
  ownerId?: Civ7RuntimeProbe<number>;
  name?: Civ7RuntimeProbe<string | null>;
  location?: Civ7RuntimeProbe<{ x: number; y: number }>;
  isCapital?: Civ7RuntimeProbe<boolean>;
  districtIds?: Civ7RuntimeProbe<readonly number[]>;
  production?: Civ7RuntimeProbe<unknown>;
};
```

Boundedness: require one of `playerId`, `plot`, or `cityIds`; cap IDs. Keep production as optional and probe-shaped until exact semantics are proven.

Tests:

- Empty/no-founded-city session returns empty entries, not command failure.
- Plot lookup must not expand full district/city objects recursively.

CLI/Studio:

- CLI: `civ7 game cities --player-id 0 --json`.
- Studio: city/district overlay and selected city debug panel.

### `getCiv7ResourceSummary(input?, options?)`

[recorded-live-proof] Owner state role: Tuner preferred. Tuner reports `Players.Resources.get(playerId)` assignment reads; official resources and map scripts use `GameInfo.Resources` and `GameplayMap.getResourceType`.

Recommended signature:

```ts
export type Civ7ResourceSummaryInput = {
  playerId?: number;
  bounds?: { x: number; y: number; width: number; height: number };
  includeMapCounts?: boolean;
  includeAssignments?: boolean;
  maxPlots?: number; // default 512 for map counts
};

export type Civ7ResourceSummary = {
  playerId?: number;
  assignments?: Civ7RuntimeProbe<readonly unknown[]>;
  unassignedCount?: Civ7RuntimeProbe<number>;
  importedCount?: Civ7RuntimeProbe<number>;
  mapCounts?: {
    bounds: { x: number; y: number; width: number; height: number };
    plotCount: number;
    byResourceType: Record<string, number>;
    omitted: number;
  };
};
```

Boundedness: resource assignment arrays and map counts must be capped. `includeMapCounts` requires bounds; no implicit full map.

Tests:

- Assignment-only call does not iterate map.
- Map-count call requires bounds and honors `maxPlots`.

CLI/Studio:

- CLI: `civ7 game resources --player-id 0 --json`, `civ7 game resources --bounds 0,0,32,32 --json`.
- Studio: resource distribution overlay and MapGen comparison counts.

### `getCiv7VisibilitySummary(input, options?)`

[recorded-live-proof] Owner state role: Tuner preferred. Tuner/App UI evidence includes `GameplayMap.getRevealedState`, `getRevealedStates`, `Players.LiveOpsStats.get(playerId).numPlotsRevealed`, and unit sight reads.

Recommended signature:

```ts
export type Civ7VisibilitySummaryInput = {
  playerId: number;
  bounds?: { x: number; y: number; width: number; height: number };
  includeGrid?: boolean;
  maxPlots?: number; // default 512
};

export type Civ7VisibilitySummary = {
  playerId: number;
  numPlotsRevealed?: Civ7RuntimeProbe<number>;
  counts?: Record<string, number>;
  grid?: {
    bounds: { x: number; y: number; width: number; height: number };
    plotCount: number;
    omitted: number;
    states: readonly { x: number; y: number; state: Civ7RuntimeProbe<number | string> }[];
  };
};
```

Boundedness: `includeGrid` requires bounds and cap. Summary counts may use `getRevealedStates(playerId)` only if its result shape and payload size are live-proven; otherwise count through bounded bounds.

Hidden-information policy: visibility summaries are safe for player/LLM use when scoped to that `playerId`; they should be used as the guard for plot/grid/unit/city/resource APIs.

Tests:

- Requires `playerId`.
- Grid path requires bounds.
- Counts-only path handles missing `Players.LiveOpsStats` without failing the wrapper.

CLI/Studio:

- CLI: `civ7 game visibility --player-id 0 --bounds 0,0,32,32 --json`.
- Studio: visibility mask overlay and hidden-info toggle guard.

### `getCiv7GameInfoRows(input, options?)`

[official-resource] Official SQL/XML resources define gameplay tables, row identifiers, unit operations, unit commands, maps, resources, terrains, features, and related schemas. [recorded-live-proof] Runtime reports confirm `GameInfo` and `Database` exist in App UI and Tuner, but `GameInfo` is dynamic and own-key enumeration is weak.

Recommended signature:

```ts
export type Civ7GameInfoRowsInput = {
  table: string;
  source?: "GameInfo" | "Database"; // default "GameInfo"
  database?: "gameplay" | "config" | string;
  lookup?: string | number | readonly (string | number)[];
  filter?: { key: string; equals: string | number | boolean };
  limit?: number; // default 100, hard cap 1_000
  offset?: number; // default 0
  includeSchema?: boolean;
  includePrimaryKeys?: boolean;
};

export type Civ7GameInfoRowsResult = {
  table: string;
  source: "GameInfo" | "Database";
  rows: readonly Record<string, unknown>[];
  limit: number;
  offset: number;
  omittedUnknown: boolean;
  schema?: Civ7RuntimeProbe<unknown>;
};
```

Boundedness:

- [inference] `table` must match a conservative identifier regex and/or a generated allowlist from official resources.
- [inference] Do not expose arbitrary SQL in this helper.
- [recorded-live-proof] `Database.getTableNames`, `getTableData`, and `getPrimaryKeys` are candidate read surfaces from the prior reports; expose only these bounded table/metadata reads for `source: "Database"`.
- [inference] `Database.query` should remain raw/elevated until a read-only SQL policy is separately designed. For `source: "GameInfo"`, prefer `GameInfo[table]` iteration, `lookup`, `find`, and generated resource schemas.

Tests:

- Reject table names with punctuation or SQL fragments.
- Enforce `limit`.
- Missing table returns structured empty/error result.
- Do not use `Object.keys(GameInfo)` as the table source.
- Database source path uses table metadata/read helpers only and never builds SQL from caller input.

CLI/Studio:

- CLI: `civ7 game gameinfo Resources --limit 50 --json`, `civ7 game gameinfo Maps --lookup MAPSIZE_STANDARD --json`.
- CLI: `civ7 game database tables --database gameplay --json` can be a thin alias over the same contract if UX wants separate verbs.
- Studio: catalog/debug panels for resources, terrains, features, map sizes, operations.

### `inspectCiv7Root(input, options?)`

[source] Current `inspectCiv7RuntimeApi()` is already root-allowlisted but can still produce large key/method lists. [inference] The public replacement should make boundedness explicit and descriptor-first.

Recommended signature:

```ts
export type Civ7RootInspectionInput = {
  state?: Civ7TunerStateSelection;
  roots: readonly string[];
  maxRoots?: number; // default 16
  maxKeys?: number; // default 100 per root
  maxMethods?: number; // default 100 per root
  includeEnumerableKeys?: boolean;
  includePrototypeKeys?: boolean;
  includeSignatures?: boolean;
};

export type Civ7RootInspection = Civ7RuntimeApiInspection & {
  limits: {
    maxRoots: number;
    maxKeys: number;
    maxMethods: number;
    truncated: boolean;
  };
};
```

Boundedness: require explicit `roots`; reject `globalThis`, `window`, blank roots, dotted paths, and wildcard-like input in the first slice. Cap signatures to the current short sample or lower.

Tests:

- Reject empty roots and unsafe names.
- Truncation metadata appears when key/method cap is exceeded.
- Descriptor getter safety: do not invoke arbitrary getters during inspection unless explicitly added later.

CLI/Studio:

- CLI: keep `game inspect` but add `--max-keys`, `--max-methods`, and truncation metadata.
- Studio: do not expose general root inspection in normal UI; keep as developer diagnostics only.

## Helper Builders Needed

[source] Current package uses ad hoc JS string builders for App UI snapshot, Tuner health, and runtime API inspection. [inference] New read wrappers should share builders to avoid copy/paste bugs, hidden mutation, and stale-state drift.

Recommended internal helpers:

- `jsLiteral(value: unknown): string`: JSON stringify wrapper that rejects unsupported values before command construction.
- `buildProbeHelperSource(): string`: emits the shared `probe(() => ...)` helper exactly once per command.
- `buildReadCommand(body: string): string`: wraps `(() => { ... })()` and `JSON.stringify(...)` consistently.
- `buildLocationValidationSource(varName: string): string`: validates finite integer `x/y`, map bounds, and optional `GameplayMap.isValidXY`.
- `buildFieldAllowlistProjection(fields, registry)`: maps public field names to vetted JS snippets; no caller-supplied JS.
- `buildVisibilityGuardSource({ playerId, location, includeHidden })`: centralizes player-scoped hidden-info filtering.
- `buildBoundedIterationSource({ bounds, locations, maxItems })`: one implementation for plot grids, resource counts, visibility grids, and ID truncation.
- `buildRuntimeProbeParser<T>(resultName)`: package-side parsing and invalid-JSON error handling matching existing App UI/Tuner parsing.
- `buildGameInfoRowsCommand(input)`: table-name validation, limit/offset, lookup/filter support, no arbitrary SQL.
- `buildBoundedRootInspectionCommand(input)`: descriptor-first root inspection with hard caps and truncation metadata.

[inference] These helpers should remain internal until enough wrappers share stable behavior; public API should expose typed results, not JS builder details.

## Review Findings And Guardrails

### Unbounded Dumps

[inference] P1 risk: `getCiv7MapGrid`, `getCiv7GameInfoRows`, and `inspectCiv7Root` can become broad dumps if defaults imply "all". Require explicit bounds/roots/table/limit and return truncation metadata.

[inference] P2 risk: full-map extraction is useful for Studio but should not be the default CLI path. Use explicit `--all` or bounds plus a hard cap, then record plot count and omissions.

### Hidden-Information Leaks

[inference] P1 risk: map, unit, city, and resource APIs can reveal hidden game state to an LLM/player. Add an audience mode or explicit `includeHidden` flag; default to visibility-filtered output when `playerId` is provided.

[unresolved] The exact revealed-state constants should be promoted from runtime/resource evidence before filtering logic maps names like visible/revealed/hidden.

### Overpromised Semantics

[inference] P1 risk: resource, city production, unit operations, and `Database` reads can appear semantically exact while returning opaque game objects. Keep unclear fields as `Civ7RuntimeProbe<unknown>` until sampled and typed.

[source] Existing `@civ7/types` uses `any` catch-alls for some table/object shapes; direct-control public outputs should be narrower DTOs rather than exposing raw runtime object graphs.

### Stale-State Selection

[source] Existing package selects state by role/name per command and Tuner readiness uses a canary. [inference] New wrappers must preserve that pattern and should not cache state IDs as durable identifiers because App UI/Tuner IDs are session observations.

Required tests:

- Repeated call after mock restart where Tuner state id changes still selects by role.
- Wrapper that composes App UI + Tuner snapshots reports both state ids/names and does not hide mismatch.
- Timeout/error from Tuner after App UI status does not turn into a false playable/gameplay-ready claim.

## Implementation Order

1. [inference] Add helper builders and shared bounded read parsing.
2. [inference] Add `getCiv7PlayableStatus()` and `getCiv7MapSummary()` first; these are low-payload and reuse existing snapshot/health logic.
3. [inference] Add `getCiv7PlotSnapshot()` and `getCiv7VisibilitySummary()` together so hidden-info policy has a real guard.
4. [inference] Add bounded `getCiv7MapGrid()` after plot snapshot is stable.
5. [inference] Add player/unit/city/resource summaries with selector requirements and caps.
6. [inference] Add `getCiv7GameInfoRows()` only after table allowlist/schema source is chosen.
7. [inference] Upgrade `inspectCiv7RuntimeApi()` or add `inspectCiv7Root()` with explicit caps.

## Unresolved Runtime Details

- [unresolved] Exact `RevealedStates` values/names and whether `getRevealedStates(playerId)` payload is safe enough for full-map summary counts.
- [unresolved] Exact runtime object shapes for `Units.get`, `Cities.get`, `Players.Resources.get`, and production/resource assignment fields.
- [unresolved] Whether Tuner roots remain stable across age transition, multiplayer, later turns, and repeated restart/begin loops.
- [unresolved] Whether `Database.query` can be constrained to read-only SQL in direct-control; do not make it a first-class read helper yet.
- [unresolved] Whether full-map extraction at maximum supported Civ7 map sizes stays inside socket/time/payload limits.
- [unresolved] Whether App UI fallback for gameplay reads is worth public support or should remain raw command only.

## Exit Recommendation

[inference] Accept all wrap-now read candidates as first-class contracts, but implement them as bounded DTO-producing helpers, not raw object dumps. The contract surface should use App UI for lifecycle/playable status, Tuner for post-Begin gameplay reads, visibility filtering for player/LLM-facing use, and explicit caps for every collection-producing API.
