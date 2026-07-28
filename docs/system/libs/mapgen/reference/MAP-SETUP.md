<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract"/>
  <item id="lifecycle" title="Lifecycle"/>
  <item id="examples" title="Examples"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Map setup

## Purpose

`MapSetup` is the immutable physical setup shared by every map-generation recipe: map seed,
dimensions, and latitude bounds. A recipe that needs additional launch facts owns one
`InitialSetupDefinition`; Core admits that complete value and privately binds it to the physical
`MapSetup` projected from it.

This keeps Core generic without forcing product setup into authored recipe config or ambient
runtime reads. Recipe config describes author intent; initial setup describes the exact game/map
invocation being executed.

## Contract

```ts
type MapSetupInput = Readonly<{
  mapSeed: number;
  dimensions: Readonly<{ width: number; height: number }>;
  latitudeBounds: Readonly<{
    topLatitude: number;
    bottomLatitude: number;
  }>;
}>;

type MapSetup = Admitted<MapSetupInput>;
```

`defineInitialSetup({ id, schema, refine, physical })` adds a recipe-specific authority:

- `schema` admits and deeply freezes the complete portable launch value,
- optional `refine(value, { issues })` owns cross-field semantic laws,
- `physical(value)` projects the sole `MapSetup`, and
- a step receives the already-admitted value as immutable
  `context.initialSetup` only when its `defineStep` contract declares that exact
  authority. The declaration selects an invocation-context type; it is not a
  dependency edge or runtime reader capability.

One `MapContext` owns one physical setup for its entire lifetime. `admitMapSetup` refuses
unknown state, map seeds outside the signed 32-bit RNG domain, non-positive or fractional tile
dimensions, grids whose tile count exceeds signed 32-bit indexing, and latitude bounds whose north
edge is not above their south edge. It freezes one exact snapshot;
recipe compilation projects and retains that same value as `plan.setup`.
`createMapContext({ setup: plan.setup, adapter })` refuses adapter dimensions that describe a
different grid, and execution refuses a plan and context that do not share the exact admitted setup.
The complete recipe-owned value and its authority identity remain privately
bound to the physical setup. The executor-owned root `MapContext` exposes only
that physical setup; an authentic active-step facade projects the exact bound
value only for a step declaring the matching authority. Raw setup-shaped values
cannot recreate that binding. Recipe `run` methods are therefore conveniences
for an already-bound context, while recipe `execute` methods consume an
already-compiled plan without recompiling or retargeting its setup.

This is the sole physical setup-validation boundary. Stage and step compilation may read the
admitted setup when deriving step configuration, but domain-operation normalization receives only
operation configuration. Steps may project setup-derived values into explicit operation inputs;
operations neither receive `MapContext` nor revalidate dimensions, seed, or latitude state.

The recipe-owned initial value is part of execution-plan identity. Observation policy remains
separate: trace configuration, trace sinks, metrics sinks, and visualization sinks are
execution-owned and do not affect the plan fingerprint.

`recipe.inspectPlan(plan)` is the public evidence boundary for that identity. It refuses plans from
another recipe runtime and returns the recipe's literal id, the plan fingerprint, the exact initial
setup authority id, and the deeply immutable admitted initial value. Runtime integrations should
derive downstream setup from this retained evidence rather than keeping an independent copy of the
pre-compilation request.

### Standard recipe authority

The Standard Swooper recipe owns a complete Civ7 map-generation invocation, not an enlarged Core
`MapSetup`. Its initial value includes:

- distinct `mapSeed` and `gameSeed` values,
- one exact official-preset or explicit-custom map selection, including dimensions, `GameInfo.Maps`
  evidence, and start-slot capacity,
- exact ordered alive-major player ids, and
- complete ordered map, game, and per-player option evidence for the generated Civ7 descriptors.

Map physics derives entropy from `mapSeed`. Gameplay-facing placement, including player-seat
assignment, derives its entropy from `gameSeed`. Neither is an ambient adapter read inside a step or
operation.

Inside Civ7, the SDK captures the engine's launch surfaces once when `GenerateMap` begins, then the
map declaration's projector creates the Standard initial value. In Studio, the portable browser
setup is projected into the same authority before compilation. Both paths therefore execute plans
that carry the same kind of admitted evidence instead of reconstructing setup during generation.

## Lifecycle

1. Capture the exact launch facts once at the runtime boundary.
2. Compile the recipe from its complete initial-setup input.
3. Create one `MapContext` from `plan.setup` and the adapter.
4. Execute the recipe against that context.
5. Discard the context, its deterministic random ledger, and its artifacts together.

## Examples

```ts
const plan = physicalOnlyRecipe.compile({
  mapSeed: 12345,
  dimensions: { width: 60, height: 38 },
  latitudeBounds: { topLatitude: 70, bottomLatitude: -70 },
}, config);

const context = createMapContext({ setup: plan.setup, adapter });
physicalOnlyRecipe.execute(context, plan);
```

## Ground truth anchors

- Setup schema: `packages/mapgen-core/src/core/map-setup.ts`
- Recipe initial-setup authority: `packages/mapgen-core/src/authoring/initial-setup/definition.ts`
- Recipe binding: `packages/mapgen-core/src/authoring/recipe/create.ts`
- Standard initial-setup authority: `plugins/mod/map/swooper-physics/src/recipes/standard/initial-setup.ts`
- Civ7 one-shot setup capture: `packages/civ7-adapter/src/map-generation-setup.ts`
- SDK map-loader integration: `packages/sdk/src/mapgen/createMap.ts`
- Declared step context type: `packages/mapgen-core/src/authoring/step/types.ts`
- Exact step-context binding assertion: `packages/mapgen-core/src/authoring/step/context.ts`
- Context construction and projection: `packages/mapgen-core/src/core/map-context.ts`
- Run request and execution plan: `packages/mapgen-core/src/engine/execution-plan.ts`
- Plan fingerprinting: `packages/mapgen-core/src/engine/observability.ts`
