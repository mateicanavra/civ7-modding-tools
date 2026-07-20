<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract"/>
  <item id="lifecycle" title="Lifecycle"/>
  <item id="examples" title="Examples"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Map setup

## Purpose

`MapSetup` is the complete immutable physical setup for one map-generation run. It carries the
initial conditions that affect the generated product, not authoring config or observation policy.

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

One `MapContext` owns one admitted setup for its entire lifetime. `admitMapSetup` refuses
unknown state, map seeds outside the signed 32-bit RNG domain, non-positive or fractional tile
dimensions, grids whose tile count exceeds signed 32-bit indexing, and latitude bounds whose north
edge is not above their south edge. It freezes one exact snapshot;
compilation and `createMapContext({ setup, adapter })` retain that same value. Context construction
also refuses adapter dimensions that describe a different grid, and execution refuses a plan and
context that do not share the exact admitted setup. Admission identity is held privately rather than
as a runtime property. Recipe `run` methods compile once from `context.setup`; recipe `execute`
methods consume an already-compiled plan without recompiling or retargeting its setup.

This is the sole physical setup-validation boundary. Stage and step compilation may read the
admitted setup when deriving step configuration, but domain-operation normalization receives only
operation configuration. Steps may project setup-derived values into explicit operation inputs;
operations neither receive `MapContext` nor revalidate dimensions, seed, or latitude state.

Trace configuration, trace sinks, metrics sinks, and visualization sinks are execution-owned
observation policy. They are intentionally absent from `MapSetup` and do not affect the plan
fingerprint.

## Lifecycle

1. Admit one `MapSetup` from the runtime boundary.
2. Compile recipe config and the immutable execution plan from that setup.
3. Create one `MapContext` from the same setup and adapter.
4. Execute the recipe against that context.
5. Discard the context, its deterministic random ledger, and its artifacts together.

## Examples

```ts
const setup = admitMapSetup({
  mapSeed: 12345,
  dimensions: { width: 80, height: 52 },
  latitudeBounds: { topLatitude: 70, bottomLatitude: -70 },
});

const plan = recipe.compile(setup, config);
const context = createMapContext({ setup, adapter });
recipe.execute(context, plan);
```

## Ground truth anchors

- Setup schema: `packages/mapgen-core/src/core/map-setup.ts`
- Context construction: `packages/mapgen-core/src/core/map-context.ts`
- Run request and execution plan: `packages/mapgen-core/src/engine/execution-plan.ts`
- Plan fingerprinting: `packages/mapgen-core/src/engine/observability.ts`
