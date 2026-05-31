# Agent Catalog/Types Report

Date: 2026-05-31
Lane: Catalog/types
Status: report only; no package code changed

## Frame

Objective: design the provenance-aware TypeBox catalog and generation path for
`@civ7/direct-control`, plus the reviewed declaration path into `@civ7/types`.

Selection: catalog runtime roots, methods, constants, operation metadata, and
official-resource tables that are useful for developers, Studio/mapgen, players,
and LLM agents. Foreground provenance, confidence, state role, side-effect risk,
and review gates. Exterior: generated high-level wrappers, blind ambient
declarations, native signature claims derived only from `Function.length`, and
generated-output hand edits.

Structural alternative considered: generate `.d.ts` declarations directly from
runtime root dumps. Rejected because [source] current runtime inspection records
presence, keys, owner, `length`, and signature samples, but [recorded-live-proof]
the inventory says native functions commonly expose weak metadata such as
`length: 0` and `[native code]`.

Reframe trigger: fresh runtime proof exposes reliable native signature metadata,
or official resources ship complete declaration metadata for runtime globals.

## Evidence Ledger

- [source] `packages/civ7-direct-control/src/index.ts` owns tuner socket framing,
  state discovery, command execution, App UI snapshots, Tuner health, runtime
  root inspection, and restart/begin lifecycle helpers.
- [source] `packages/civ7-direct-control/package.json` has no TypeBox dependency
  yet; adding the catalog schema implies a package dependency on `typebox`.
- [source] `packages/civ7-types/index.d.ts` is type-only, but current public
  declarations include `any` in `GameInfoTable<T = any>`, row catch-alls,
  `engine.call(...): any`, and `/base-standard/*` catch-all exports.
- [source] `packages/civ7-types/AGENTS.md` requires no runtime code in
  `@civ7/types`.
- [source] mapgen-core uses TypeBox as schema artifacts with `Static`, strict
  object `additionalProperties: false`, schema-default helpers, and narrowly
  documented `Type.Unsafe` escapes for typed arrays.
- [official-resource] `.civ7/outputs/resources/Base/Assets/schema/gameplay/01_GameplaySchema.sql`
  declares table columns, defaults, primary keys, and foreign keys for `Maps`,
  `MapIslandBehavior`, `Types`, `Terrains`, `Biomes`, `Features`, `Resources`,
  `UnitCommands`, and `UnitOperations`.
- [official-resource] `maps.xml`, `unit-commands.xml`, and
  `unit-operations.xml` provide row identifiers and UI metadata such as
  `MAPSIZE_*`, `UNITCOMMAND_*`, and `UNITOPERATION_*`.
- [official-resource] `tuner-input.js` shows worldbuilder and player-operation
  call patterns including `WorldBuilder.MapPlots.*`,
  `MapConstructibles.*`, and `Game.PlayerOperations.sendRequest(...)`.
- [recorded-live-proof] `capability-inventory.md` records App UI and Tuner as
  distinct surfaces: App UI owns lifecycle/client control, while Tuner becomes
  the stronger gameplay/map surface after Begin Game.
- [fresh-live-proof] none collected in this lane.

## Recommended Shape

Create a new source-owned schema module in `@civ7/direct-control`:

```text
packages/civ7-direct-control/src/catalog/schema.ts
packages/civ7-direct-control/src/catalog/types.ts
packages/civ7-direct-control/src/catalog/runtime-snapshot.ts
packages/civ7-direct-control/src/catalog/resources.ts
packages/civ7-direct-control/src/catalog/merge.ts
packages/civ7-direct-control/src/catalog/report.ts
```

Use TypeBox for the catalog contract, not for ambient Civ7 globals. Export schema
values and inferred types in the mapgen-core style:

```ts
export const Civ7ControlCatalogV1Schema = Type.Object({...}, {
  additionalProperties: false,
});
export type Civ7ControlCatalogV1 = Static<typeof Civ7ControlCatalogV1Schema>;
```

Core schema entities:

- `Catalog`: `schemaVersion`, `generatedAt`, `generator`, `resourceSource`,
  `runtimeSnapshots`, `symbols`, `resourceTables`, `conflicts`, `unknowns`.
- `EvidenceRef`: `class`, `path`, `line`, `probeId`, `stateRole`, `phase`,
  `command`, `observedAt`, `notes`.
- `Symbol`: `id`, `path`, `kind`, `surface`, `access`, `risk`, `availability`,
  `runtime`, `resource`, `declaration`, `confidence`, `provenance`,
  `wrapperRecommendation`.
- `RuntimeMember`: descriptor-first metadata: `owner`, `typeof`, `own`,
  `prototype`, `enumerable`, `configurable`, `writable`, getter/setter flags,
  method fingerprint.
- `ResourceTable`: SQL/XML table shape: columns, primary keys, foreign keys,
  defaults, source rows, row-count per module set.

Keep type complexity shallow: use discriminated unions for evidence classes,
access, risk, and symbol kind; avoid recursive conditional types in public
exports. Opaque runtime samples should be `unknown` inside parsed catalog types,
not `any`.

## Generated Files

Source-owned files:

- `src/catalog/schema.ts`: TypeBox schemas and `Static` types.
- `src/catalog/runtime-snapshot.ts`: package-owned runtime probes.
- `src/catalog/resources.ts`: official resource parser.
- `src/catalog/merge.ts`: deterministic merge and conflict classification.
- `src/catalog/report.ts`: human-readable report generation.

Generated files:

- `src/catalog/generated/catalog.generated.json`: normalized catalog, committed
  only if review decides package distribution needs a checked-in snapshot.
- `src/catalog/generated/catalog.generated.d.ts`: optional generated catalog
  consumer types if `tsup --dts` is not sufficient.
- `src/catalog/generated/gameinfo.generated.d.ts`: candidate declarations for
  review, not imported blindly by `@civ7/types`.
- `src/catalog/generated/operation-ids.generated.ts`: const arrays/literal
  unions for operation and command identifiers, if package APIs need them.
- `src/catalog/generated/type-generation-report.md`: review diff against
  `packages/civ7-types/index.d.ts`.

Do not treat `packages/civ7-direct-control/dist/**`, official resources, or
deployed mod artifacts as source-owned. `dist/` remains generated build output.

## Runtime Snapshot Command Shape

Package API:

```ts
generateCiv7RuntimeSnapshot({
  states?: ["app-ui", "tuner"],
  roots?: { "app-ui"?: string[]; tuner?: string[] },
  phase?: "shell" | "loading" | "waiting-ui-ready" | "post-begin" | "worldbuilder-active" | "unknown",
  maxDepth?: number,
  maxKeysPerObject?: number,
  includeSamples?: boolean,
  timeoutMs?: number,
}): Promise<Civ7RuntimeSnapshotV1>
```

CLI shape:

```bash
civ7 game catalog snapshot --state app-ui --roots Network,UI,GameContext --json
civ7 game catalog snapshot --state tuner --phase post-begin --roots Game,GameplayMap,Players,GameInfo --json
civ7 game catalog generate --resources .civ7/outputs/resources --states app-ui,tuner --out packages/civ7-direct-control/src/catalog/generated/catalog.generated.json
civ7 game catalog report --catalog .../catalog.generated.json --types packages/civ7-types/index.d.ts
```

Snapshot probes must be descriptor-first and bounded. They should use
`Object.getOwnPropertyDescriptors`, avoid invoking getters by default, record
accessor presence, and only run allowlisted read-only samples.

## Official Resource Merge Strategy

Merge lanes should remain distinct until the final normalized symbol:

1. Parse SQL schemas from `Base/Assets/schema/**` into table definitions.
2. Parse XML rows from Base and DLC/module trees into row sets with module
   provenance and deterministic load-order metadata. If load order is not yet
   implemented, mark row counts [unresolved] instead of final.
3. Extract JS call-pattern hints from official scripts as usage evidence only.
4. Join resource tables to runtime paths by explicit mapping, for example
   `Maps -> GameInfo.Maps`, `UnitOperations -> GameInfo.UnitOperations`.
5. Compare generated resource row interfaces with `@civ7/types`.
6. Emit conflicts rather than resolving silently when declarations, resources,
   and runtime observations disagree.

Resource evidence can promote data ids and table columns; it cannot prove runtime
availability, side-effect safety, or native function signatures.

## Confidence And Provenance

Use two fields, not one:

- `confidence`: `fresh-live-proof`, `recorded-live-proof`, `source`,
  `official-resource`, `declared`, `inference`, `unresolved`.
- `provenance`: array of evidence refs with path/probe/line/phase details.

Recommended symbol classifications:

- `access`: `read`, `write`, `command`, `data`, `event`, `constructor`,
  `unknown`.
- `risk`: `none`, `read-only`, `local-ui`, `game-state`, `file-save-load`,
  `network-account`, `destructive`, `unknown`.
- `wrapperRecommendation`: `wrap-now`, `wrap-carefully`, `raw`, `research`,
  `avoid`.

Do not upgrade a symbol from `source` or `official-resource` to
`fresh-live-proof` without a probe record from this generation run.

## Selected Defaults

Default runtime roots:

- App UI: `Network`, `UI`, `GameContext`, `Game`, `Autoplay`, `Players`,
  `PlayerIds`, `GameplayMap`, `Camera`, `WorldUI`, `Visibility`.
- Tuner: `Game`, `Autoplay`, `GameplayMap`, `Players`, `PlayerIds`,
  `GameInfo`, `Database`, `Units`, `Cities`, `MapUnits`, `MapCities`,
  `MapAreas`, `MapRegions`, `MapConstructibles`, `Visibility`,
  `TerrainBuilder`, `ResourceBuilder`, `FertilityBuilder`, `WorldBuilder`.

Default constants and ids:

- lifecycle/loading: `CIV7_UI_LOADING_STATES`, `UIGameLoadingState`.
- operation ids: `UNITOPERATION_*`, `UNITCOMMAND_*`.
- map/data ids: `MAPSIZE_*`, terrain, biome, feature, resource, continent,
  fertility, player, visibility, landmass/region identifiers where resources or
  runtime constants corroborate them.

Default resource tables:

- mapgen/Studio: `Maps`, `MapIslandBehavior`,
  `MapResourceMinimumAmountModifier`, `Terrains`, `Biomes`, `Features`,
  `Resources`, `Resource_Distribution`, start-bias tables.
- developer/player/agent: `UnitOperations`, `UnitCommands`, `CityCommands`,
  `Types`, `Kinds`, `Players`-adjacent operation/catalog tables where present.
- keep raw/research: worldbuilder/editor mutation surfaces and account/network
  tables unless a later product slice explicitly needs them.

## Reviewed Declaration Path Into `@civ7/types`

`@civ7/types` should receive reviewed declarations, not raw generator output.

Proposed flow:

1. Generate candidate declarations from catalog/resource slices into
   `packages/civ7-direct-control/src/catalog/generated/*.d.ts`.
2. Emit a diff report against `packages/civ7-types/index.d.ts` that flags new
   symbols, changed property types, removed catch-alls, and remaining unknowns.
3. Review slices by table/root family.
4. Copy or promote accepted declarations into `packages/civ7-types/index.d.ts`
   or future split type-only files.
5. Keep provenance comments concise at declaration boundaries, for example
   `// Generated from GameplaySchema.sql + maps.xml; reviewed 2026-05-31`.
6. Run `bun run --cwd packages/civ7-types check`.

Recommended cleanup direction:

- Replace public `any` with `unknown` or narrower generated row types.
- Keep catch-alls only where intentionally reviewed and label them as
  unresolved compatibility surfaces.
- Avoid ambient declarations for state-specific availability unless the comment
  clearly says the declaration is not a readiness guarantee.

## Tests And Gates

Direct-control:

- Schema validation tests for minimal/representative catalogs.
- Merge tests for conflicting runtime/resource/declaration evidence.
- Snapshot command tests with a fake tuner server that returns descriptor-rich
  root data and verifies bounded roots/depth.
- Resource parser tests against small SQL/XML fixtures and selected official
  files.
- Report tests ensuring conflicts and `any`/`unknown` leakage are surfaced.
- `bun run --cwd packages/civ7-direct-control test`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`

Types:

- Generated declaration diff test or report snapshot.
- `bun run --cwd packages/civ7-types check`

OpenSpec/workstream:

- `bun run openspec:validate` when an OpenSpec change is added.

Fresh live proof gate:

- Runtime snapshots can be generated without mutating game state.
- Any command/mutation wrapper remains blocked until separate before/after proof
  exists and the wrapper contract has explicit validation.

## Review Checklist

- Type-value drift: every exported catalog type must derive from TypeBox schema
  or literal source values; no parallel hand-authored interfaces for generated
  payloads.
- Public `any` leakage: generated/public surfaces should use `unknown` for
  opaque runtime samples and typed rows for reviewed `GameInfo` tables. Existing
  `@civ7/types` `any` should be treated as debt to narrow, not copied.
- Type complexity: prefer simple discriminated unions and data-first APIs.
  Avoid deep conditional types, overload webs, and schema-to-wrapper metatypes.
- Native signatures: `Function.length` and `toString()` are fingerprints only.
  They may support drift detection; they do not define argument schemas.
- Source versus generated: schema modules, parsers, merge logic, and CLI command
  code are source-owned. Catalog JSON, declaration candidates, operation id
  arrays, reports, `dist/`, and official resources are generated/evidence.
- Wrapper generation: do not generate high-level wrappers from the catalog.
  Wrapper APIs remain deliberate code with state, timeout, idempotency,
  validation, and postcondition contracts.

## Next Slice

Open an implementation spec for the catalog foundation only:

1. Add TypeBox dependency to `@civ7/direct-control`.
2. Add `src/catalog/schema.ts` and schema validation tests.
3. Add descriptor-first runtime snapshot generation for the selected default
   roots.
4. Add a resource parser for `Maps`, `Types`, `UnitCommands`, and
   `UnitOperations`.
5. Emit a report comparing generated facts to `@civ7/types`, without promoting
   declarations until review.
