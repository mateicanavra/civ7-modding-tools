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
- a step receives the value as `deps.initialSetup` only when its `defineStep` contract declares
  that exact authority.

One `MapContext` owns one physical setup for its entire lifetime. `admitMapSetup` refuses
unknown state, map seeds outside the signed 32-bit RNG domain, non-positive or fractional tile
dimensions, grids whose tile count exceeds signed 32-bit indexing, and latitude bounds whose north
edge is not above their south edge. It freezes one exact snapshot;
recipe compilation projects and retains that same value as `plan.setup`.
`createMapContext({ setup: plan.setup, adapter })` refuses adapter dimensions that describe a
different grid, and execution refuses a plan and context that do not share the exact admitted setup.
The complete recipe-owned value and its authority identity are held privately rather than exposed
on `MapContext`; raw setup-shaped values cannot recreate that binding. Recipe `run` methods are
therefore conveniences for an already-bound context, while recipe `execute` methods consume an
already-compiled plan without recompiling or retargeting its setup.

This is the sole physical setup-validation boundary. Stage and step compilation may read the
admitted setup when deriving step configuration, but domain-operation normalization receives only
operation configuration. Steps may project setup-derived values into explicit operation inputs;
operations neither receive `MapContext` nor revalidate dimensions, seed, or latitude state.

The recipe-owned initial value is part of execution-plan identity. Observation policy remains
separate: trace configuration, trace sinks, metrics sinks, and visualization sinks are
execution-owned and do not affect the plan fingerprint.

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
  dimensions: { width: 80, height: 52 },
  latitudeBounds: { topLatitude: 70, bottomLatitude: -70 },
}, config);

const context = createMapContext({ setup: plan.setup, adapter });
physicalOnlyRecipe.execute(context, plan);
```

## Ground truth anchors

- Setup schema: `packages/mapgen-core/src/core/map-setup.ts`
- Recipe initial-setup authority: `packages/mapgen-core/src/authoring/initial-setup/definition.ts`
- Recipe binding: `packages/mapgen-core/src/authoring/recipe/create.ts`
- Declared step access: `packages/mapgen-core/src/authoring/step/dependencies.ts`
- Context construction: `packages/mapgen-core/src/core/map-context.ts`
- Run request and execution plan: `packages/mapgen-core/src/engine/execution-plan.ts`
- Plan fingerprinting: `packages/mapgen-core/src/engine/observability.ts`
