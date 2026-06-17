# Phase 2 — Prework: Exact Authoring Facts (from live source)

> Extracted by 5 parallel agents from LIVE source to close the Phase 1 critic's authoring gaps. Authoritative, copy-paste-grade. Used by the Phase 2 authoring agents. Companion to PHASE-1-DISCOVERY.md.


---

## Strategy keys and strategy-selection mechanism in mod-swooper-maps ops

## Architecture overview

Every op in the domain uses the `defineOp` factory from `@swooper/mapgen-core/authoring/contracts`. The `strategies` field in the `defineOp` call is a record whose keys become the allowed strategy ids. The `default` key is mandatory. `defineOp` immediately calls `buildOpEnvelopeSchema` which builds a TypeBox discriminated union schema: `Type.Union([{ strategy: "default", config: DefaultSchema }, { strategy: "foo", config: FooSchema }, ...])`. This union is stored as `contract.config` and is the TypeScript type for the op envelope.

## Strategy-selection wiring (where config picks a strategy)

The op envelope is a plain object `{ strategy: "<id>", config: { ...strategy-specific props } }`. This object is authored at **step config level** — it is an op-keyed property inside the step's schema. Strategy selection happens in two places:

1. **`compile()` in stage `index.ts` (public stages):** For stages with a `public:` schema, the `compile({ config })` function synthesizes the step configs from the semantic (user-facing) config. It hard-codes the strategy string: `computePrecipitation: { strategy: "default", config: config.precipitation ?? {} }`. The hydrology-climate-baseline stage hardwires `"default"` for all its ops; hydrology-climate-refine hard-wires `strategy: "refine"` for `computePrecipitation`. This is the primary control point for strategy selection in production stages.

2. **`defaultStrategy` on `StepOpUse` (step contract level):** A step can declare an op as `{ contract: SomeContract, defaultStrategy: "refine" }` instead of just `SomeContract`. This causes `defineStep` to call `buildOpEnvelopeSchemaWithDefaultStrategy`, which changes the schema default so the op starts with the named strategy when the author omits the envelope entirely. Example: `climateRefine.contract.ts` declares `computePrecipitation: { contract: hydrology.ops.computePrecipitation, defaultStrategy: "refine" }`.

3. **Map config JSON / direct step config:** For stages without `public:` (internal stages), step configs are authored directly. The op envelope is a top-level key in the step config object. An author can write `{ "computeAtmosphericCirculation": { "strategy": "latitude", "config": { "windJetStreaks": 4 } } }` in the step section of the recipe config. The compile path in `createStage` passes this through directly via `configPart` → `rawSteps`.

## Runtime dispatch

In `createOp` (packages/mapgen-core/src/authoring/op/create.ts), the `run` function reads `cfg.strategy`, looks up the matching `runtimeStrategies[cfg.strategy]` implementation, and calls `selected.run(input, cfg.config)`. Same pattern in `normalize`.

## How to swap or add a strategy

1. **Add the strategy schema** to `defineOp({ ..., strategies: { default: ..., myNewStrategy: MyNewSchema } })` in the op's `contract.ts`.
2. **Add the strategy implementation** as a new file `strategies/my-new-strategy.ts` exporting `{ normalize?, run }`.
3. **Re-export** from `strategies/index.ts`.
4. **Register** in `createOp(contract, { strategies: { default: defaultStrategy, myNewStrategy: myNewStrategy } })` in the op's `index.ts`.
5. **Activate** by either: (a) changing the `strategy:` literal in the stage `compile()` function, (b) setting `defaultStrategy: "myNewStrategy"` on the `StepOpUse` in the step contract, or (c) authoring `{ "strategy": "myNewStrategy", "config": {...} }` in the step's op envelope in the map config.


**Exact facts:**

- `hydrology/compute-atmospheric-circulation strategies` → default (geostrophic-proxy), latitude
- `hydrology/compute-precipitation strategies` → default (vector), basic (baseline), refine
- `hydrology/transport-moisture strategies` → default (vector-advection), cardinal
- `hydrology/compute-ocean-surface-currents strategies` → default (wind-gyre-projection/earthlike), latitude
- `ecology/pedology/classify strategies` → default, coastal-shelf, orogeny-boosted
- `ecology/features-plan-ice strategies` → default, continentality
- `all other ops strategies` → default only (single-strategy ops are the majority)
- `op envelope schema shape` → Type.Union([{ strategy: Literal(id), config: StrategySchema }, ...]) — discriminated on 'strategy' field
- `defaultConfig shape` → { strategy: 'default', config: <defaults from default strategy schema> }
- `strategy selection in public stage compile()` → hard-coded literal: `{ strategy: 'refine', config: config.precipitationRefinement ?? {} }`
- `defaultStrategy on StepOpUse` → changes the schema default so missing envelope starts with named strategy, not 'default'
- `runtime dispatch location` → packages/mapgen-core/src/authoring/op/create.ts line 101-109: `runtimeStrategies[cfg.strategy].run(input, cfg.config)`
- `envelope schema builder` → packages/mapgen-core/src/authoring/op/envelope.ts: buildOpEnvelopeSchema / buildOpEnvelopeSchemaWithDefaultStrategy

**Skeletons / call shapes:**


*defineOp with multiple strategies (contract.ts pattern)* — The strategies record keys become the literal strategy ids in the discriminated union. 'default' is required.

```ts
const MyContract = defineOp({
  kind: "compute",
  id: "domain/my-op",
  input: MyInputSchema,
  output: MyOutputSchema,
  strategies: {
    default: DefaultStrategySchema,   // REQUIRED
    latitude: LatitudeStrategySchema, // additional key
  },
});
export default MyContract;
```

*createOp binding (index.ts pattern)* — Every key in contract.strategies must have a matching key in createOp impl.strategies.

```ts
import { createOp } from "@swooper/mapgen-core/authoring";
import MyContract from "./contract.js";
import { defaultStrategy, latitudeStrategy } from "./strategies/index.js";

const myOp = createOp(MyContract, {
  strategies: { default: defaultStrategy, latitude: latitudeStrategy },
});
export default myOp;
```

*op envelope as authored in step config* — This is the exact shape the step schema accepts. strategy is a literal that discriminates config shape.

```ts
// Inside stage compile() or step config:
{
  computeAtmosphericCirculation: {
    strategy: "latitude",       // must match a key in contract.strategies
    config: {
      windJetStreaks: 4,
      windJetStrength: 1.2,
      windVariance: 0.5,
    },
  },
}
```

*StepOpUse with non-default defaultStrategy (step contract)* — climateRefine.contract.ts:44-46. defaultStrategy only affects the schema default when the author omits the op envelope; the author can still override strategy explicitly.

```ts
// In defineStep ops:
ops: {
  computePrecipitation: {
    contract: hydrology.ops.computePrecipitation,
    defaultStrategy: "refine",   // changes schema default from 'default' to 'refine'
  },
  computeRadiativeForcing: hydrology.ops.computeRadiativeForcing, // bare contract = uses 'default'
}
```

*stage compile() hardwiring strategy* — hydrology-climate-refine/index.ts:51-53. The compile() function maps the public (semantic) config into internal step configs, setting strategy literals explicitly. This is how stages with public: schema control strategy selection.

```ts
// In createStage({ ..., compile: ({ config }) => ... }):
compile: ({ config }) => ({
  "climate-refine": {
    computePrecipitation: {
      strategy: "refine",
      config: config.precipitationRefinement ?? {},
    },
    computeAtmosphericCirculation: {
      strategy: "default",
      config: config.atmosphericCirculation ?? {},
    },
  },
}),
```

*runtime dispatch in createOp* — The strategy field in the envelope is read at runtime to select the implementation. cfg.config is typed to the schema for the selected strategy.

```ts
// packages/mapgen-core/src/authoring/op/create.ts line 100-110
run: (input, cfg) => {
  if (!cfg || typeof cfg.strategy !== "string") {
    throw new Error(`createOp(${contract?.id}) requires config.strategy`);
  }
  const selected = runtimeStrategies[cfg.strategy];
  if (!selected) {
    throw new Error(`createOp(${contract?.id}) unknown strategy "${cfg.strategy}"`);
  }
  return selected.run(input, cfg.config);
}
```

**Key paths:**

- `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-atmospheric-circulation/contract.ts` — op contract with multi-strategy (default=geostrophic-proxy, latitude)
- `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-atmospheric-circulation/strategies/index.ts` — strategy index: exports defaultStrategy and latitudeStrategy
- `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-atmospheric-circulation/index.ts` — createOp binding: { strategies: { default: defaultStrategy, latitude: latitudeStrategy } }
- `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-precipitation/contract.ts` — op contract with 3 strategies: default (vector), basic (baseline), refine
- `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-precipitation/strategies/index.ts` — strategy index: exports basicStrategy, refineStrategy, defaultStrategy
- `mods/mod-swooper-maps/src/domain/ecology/ops/pedology-classify/contract.ts` — ecology op with 3 strategies: default, coastal-shelf, orogeny-boosted
- `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-ice/contract.ts` — ecology op with 2 strategies: default, continentality
- `packages/mapgen-core/src/authoring/op/contract.ts` — defineOp factory — builds envelope schema from strategies record
- `packages/mapgen-core/src/authoring/op/envelope.ts` — buildOpEnvelopeSchema / buildOpEnvelopeSchemaWithDefaultStrategy — discriminated union builder
- `packages/mapgen-core/src/authoring/op/create.ts` — createOp — runtime dispatch: runtimeStrategies[cfg.strategy].run(input, cfg.config)
- `packages/mapgen-core/src/authoring/op/strategy.ts` — OpStrategy / createStrategy types and factory
- `packages/mapgen-core/src/authoring/step/contract.ts` — defineStep — normalizeOpsDecl handles StepOpUse.defaultStrategy wiring
- `packages/mapgen-core/src/authoring/step/ops.ts` — StepOpUse type with optional defaultStrategy field
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/index.ts` — stage compile() hardwires strategy: 'default' for all climate-baseline ops
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/index.ts` — stage compile() sets strategy: 'refine' for computePrecipitation
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/steps/climateBaseline.contract.ts` — step contract: ops declared as bare contracts (strategy defaults to 'default')
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/steps/climateRefine.contract.ts` — step contract: computePrecipitation declared as StepOpUse with defaultStrategy: 'refine'
- `mods/mod-swooper-maps/src/maps/__type_tests__/authoring-sdk.multi-strategy.inference.ts` — type tests locking in discriminated union narrowing for multi-strategy ops

**Caveats:**

- The 'default' strategy key always maps to the geostrophic-proxy implementation in compute-atmospheric-circulation (the const is exported as defaultStrategy from geostrophic-proxy.ts). The file naming (geostrophic-proxy.ts) does not match the key name ('default') — the key name is what matters at runtime.
- The 'default' strategy key in compute-precipitation maps to the vector implementation (strategies/vector.ts exports defaultStrategy). The older 'basic' key maps to baseline.ts.
- features-plan-ice has a 'continentality' strategy key (not just 'default'). This is inside the ecology domain.
- buildOpEnvelopeSchema enforces that 'default' key is present; if missing it throws at module load time.
- For stages that declare both 'public' and 'compile', the public config JSON never contains a 'strategy' field — the strategy is injected by the compile() function. Only internal (non-public) stages can have strategy fields set directly by the author in the recipe config.
- StepOpUse.defaultStrategy only changes the schema-level default (what you get when the envelope is omitted). It does NOT prevent the author from setting strategy to any other valid key in explicit config.
- All ops in the foundation and most morphology domains are single-strategy (default only) — strategy selection only matters for the hydrology, ecology, and a few morphology multi-strategy ops listed in exact[].

---

## Copy-paste scaffolds for new op, strategy, step, stage, and artifact in civ7-modding-tools

## Architecture Overview

The system has two layers:

**Contract layer** (`@swooper/mapgen-core/authoring/contracts`): `defineOp`, `defineStep`, `defineArtifact`, `defineDomain` — pure schema/type declarations, no implementation. Used in `contract.ts` files and imported at recipe DAG/step-contract time.

**Runtime layer** (`@swooper/mapgen-core/authoring`): `createOp`, `createStrategy`, `createDomain`, `createStep`, `implementArtifacts`, `createStage`, `createRecipe`, `collectCompileOps` — attach implementations. Used in `index.ts`/implementation files.

**Path alias** `@mapgen/domain/*` → `src/domain/*` (tsconfig.paths in `mods/mod-swooper-maps/tsconfig.json`). Step contracts import the domain contract (not the runtime) via `@mapgen/domain/<domain>` to reference op contracts. Recipe.ts imports runtime domain ops via `@mapgen/domain/<domain>/ops`.

---

## New Op (full triple)

**File 1: `src/domain/<domain>/ops/<op-name>/contract.ts`**
```ts
import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

export const MyOpConfigSchema = Type.Object(
  {
    myParam: Type.Number({ default: 0.5, minimum: 0, maximum: 1, description: "..." }),
  },
  { additionalProperties: false, description: "..." }
);

const MyOpContract = defineOp({
  kind: "compute",            // "compute" | "plan" | "place" | "score" | ...
  id: "<domain>/my-op-name", // kebab-case, namespaced by domain
  input: Type.Object({
    width:  Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    // ... TypedArraySchemas.u8({ description: "..." }) for typed arrays
  }),
  output: Type.Object({
    result: TypedArraySchemas.u8({ description: "..." }),
  }),
  strategies: {
    default: MyOpConfigSchema,
    // add more named strategy schemas here
  },
});

export default MyOpContract;
```

**File 2: `src/domain/<domain>/ops/<op-name>/types.ts`**
```ts
import type { OpTypeBagOf } from "@swooper/mapgen-core/authoring/contracts";

type Contract = typeof import("./contract.js").default;

export type MyOpTypes = OpTypeBagOf<Contract>;
```

**File 3: `src/domain/<domain>/ops/<op-name>/strategies/default.ts`**
```ts
import { createStrategy } from "@swooper/mapgen-core/authoring";

import MyOpContract from "../contract.js";

export const defaultStrategy = createStrategy(MyOpContract, "default", {
  // optional: normalize: (config, ctx) => config,
  run: (input, config) => {
    const { width, height } = input;
    const size = width * height;
    const result = new Uint8Array(size);
    // ... use config.myParam
    return { result };
  },
});
```

**File 4: `src/domain/<domain>/ops/<op-name>/strategies/index.ts`**
```ts
export { defaultStrategy } from "./default.js";
```

**File 5: `src/domain/<domain>/ops/<op-name>/index.ts`**
```ts
import { createOp } from "@swooper/mapgen-core/authoring";

import MyOpContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const myOp = createOp(MyOpContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default myOp;
```

---

## New Strategy (additional strategy on existing op)

Add a new schema key to the existing op's `defineOp` `strategies` object, then add the implementation to the `createOp` call and the `strategies/` folder.

```ts
// In strategies/my-variant.ts
import { createStrategy } from "@swooper/mapgen-core/authoring";
import MyOpContract from "../contract.js";

export const myVariantStrategy = createStrategy(MyOpContract, "my-variant", {
  run: (input, config) => {
    // config is typed to MyOpContract.strategies["my-variant"]
    return { result: new Uint8Array(input.width * input.height) };
  },
});
```

Then add `"my-variant": MyVariantConfigSchema` to `defineOp(...).strategies` and `"my-variant": myVariantStrategy` to `createOp(...).strategies`.

---

## New Artifact

```ts
// src/recipes/standard/stages/<stage>/artifacts.ts
import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const MyArtifactSchema = Type.Object(
  {
    width:  Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    myData: TypedArraySchemas.u8({ description: "..." }),
  },
  { additionalProperties: false, description: "..." }
);

export const myStageArtifacts = {
  myArtifact: defineArtifact({
    name: "myArtifact",            // camelCase, matches the key
    id:   "artifact:stage.scope.myArtifact", // must start with "artifact:", no @vN suffix
    schema: MyArtifactSchema,
  }),
} as const;
```

---

## New Step (contract + implementation)

**`steps/<step-name>/contract.ts`**
```ts
import someDomain from "@mapgen/domain/<domain>";  // contract-only import
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { myStageArtifacts } from "../artifacts.js";
import { otherArtifacts } from "../../<other-stage>/artifacts.js";

const MyStepContract = defineStep({
  id: "my-step-name",     // kebab-case (validated by regex)
  phase: "morphology",    // GenerationPhase string from engine
  requires: ["effect:some.tag.required"],
  provides: ["effect:some.tag.provided"],
  artifacts: {
    requires: [otherArtifacts.someInput],
    provides: [myStageArtifacts.myArtifact],
  },
  // ops keys must NOT duplicate schema keys:
  ops: {
    myOp: someDomain.ops.myOpName,
    // or with override default strategy:
    // myOp: { contract: someDomain.ops.myOpName, defaultStrategy: "default" }
  },
  schema: Type.Object({
    // step-level knobs not covered by ops
    // leave empty if all config comes from ops
  }),
});

export default MyStepContract;
```

**`steps/<step-name>/index.ts`**
```ts
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { myStageArtifacts } from "../artifacts.js";
import MyStepContract from "./contract.js";

export default createStep(MyStepContract, {
  // Only needed if this step provides artifacts:
  artifacts: implementArtifacts(MyStepContract.artifacts!.provides!, {
    myArtifact: {
      // optional validate: (value) => []
    },
  }),

  // optional: normalize: (config, ctx) => config,

  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;
    const input = deps.artifacts.someInput.read(context);

    const output = ops.myOp(
      { width, height, /* ...inputs from input */ },
      config.myOp         // auto-typed to op envelope { strategy, config }
    );

    deps.artifacts.myArtifact.publish(context, {
      width,
      height,
      myData: output.result,
    });
  },
});
```

---

## New Stage

**`stages/<stage-id>/index.ts`**
```ts
import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { myStep } from "./steps/index.js";

const knobsSchema = Type.Object(
  {
    // knobs are top-level controls collapsed from public config
  },
  { additionalProperties: false, description: "..." }
);

// If using a public schema (requires compile):
const publicSchema = Type.Object(
  {
    myControl: Type.Optional(Type.Number({ default: 1 })),
  },
  { additionalProperties: false, description: "..." }
);

export default createStage({
  id: "my-stage-id",    // must be a StandardStageId registered in contract-manifest.ts
  knobsSchema,
  public: publicSchema, // omit if not using public surface (no compile needed)
  steps: orderStandardStageSteps("my-stage-id", {
    "my-step-name": myStep,
  }),
  compile: ({ config }: { config: Record<string, unknown> }) => ({
    "my-step-name": {
      myOp: { strategy: "default", config: config.myControl ?? {} },
    },
  }),
} as const);
```

---

## Recipe registration

To add a new stage to the standard recipe, three files must be touched:

1. **`contract-manifest.ts`**: add the stage to `standardStageContractManifest` array (determines execution order) and import its step contracts.
2. **`recipe.ts`**: import the stage module and add it to the `orderStandardStages({...})` map.
3. **`recipe.ts` `compileOpsById`**: if the stage introduces a new domain, add `collectCompileOps(..., newDomain)`.

To add a new op to an existing domain, touch:
1. **`ops/<op-name>/`** — create the op files above.
2. **`ops/contracts.ts`** — import the contract and add it to `contracts` map.
3. **`ops/index.ts`** — import the implementation, add to `implementations` object (satisfies `DomainOpImplementationsForContracts<typeof contracts>`).


**Exact facts:**

- `defineOp import path` → @swooper/mapgen-core/authoring/contracts
- `defineStep import path` → @swooper/mapgen-core/authoring/contracts
- `defineArtifact import path` → @swooper/mapgen-core/authoring/contracts
- `defineDomain import path` → @swooper/mapgen-core/authoring/contracts
- `createOp import path` → @swooper/mapgen-core/authoring
- `createStrategy import path` → @swooper/mapgen-core/authoring
- `createDomain import path` → @swooper/mapgen-core/authoring
- `createStep import path` → @swooper/mapgen-core/authoring
- `implementArtifacts import path` → @swooper/mapgen-core/authoring
- `createStage import path` → @swooper/mapgen-core/authoring
- `createRecipe import path` → @swooper/mapgen-core/authoring
- `collectCompileOps import path` → @swooper/mapgen-core/authoring
- `Type, TypedArraySchemas import path` → @swooper/mapgen-core/authoring/contracts
- `OpTypeBagOf import path` → @swooper/mapgen-core/authoring/contracts
- `@mapgen/domain/* tsconfig alias` → src/domain/* (mods/mod-swooper-maps/tsconfig.json paths)
- `artifact id format` → Must start with 'artifact:', no @vN suffix, e.g. 'artifact:map.morphology.coastClassification'
- `artifact name format` → camelCase only, e.g. 'myArtifact'; must match the key in the artifacts map
- `step id format` → kebab-case only, e.g. 'plot-continents'; validated by /^[a-z0-9]+(?:-[a-z0-9]+)*$/ in defineStep
- `stage id format` → kebab-case only, validated the same way; must match a StandardStageId registered in contract-manifest.ts
- `op id format` → <domain>/<op-name> kebab-case, e.g. 'morphology/compute-landmask'
- `strategies must include 'default'` → defineOp strategies object must have at least a 'default' key; type-enforced by Readonly<{ default: TSchema }>
- `createStage with public requires compile` → If 'public' is present, 'compile' MUST also be present; createStage throws if public is set without compile
- `step artifacts mixing restriction` → If artifacts: { requires, provides } is used in defineStep, do NOT also put 'artifact:' tags in top-level requires/provides arrays; defineStep throws if mixed
- `ops key collision restriction` → Op keys in defineStep ops: {} must NOT duplicate any key in schema: Type.Object({}); defineStep throws on collision
- `createOp strategies exhaustiveness` → createOp throws if any strategy key in the contract has no implementation in impl.strategies, and vice-versa
- `DomainOpImplementationsForContracts satisfies check` → ops/index.ts: the implementations object must be typed 'as const satisfies DomainOpImplementationsForContracts<typeof contracts>'
- `orderStandardStageSteps registration` → Every step passed to orderStandardStageSteps must have its contract listed in standardStageContractManifest for that stageId, in order
- `collectCompileOps receives domain runtime modules` → Pass domain runtime modules (from createDomain) to collectCompileOps, not domain contracts

**Skeletons / call shapes:**


*new-op-contract.ts* — Sourced from mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/contract.ts. The id MUST match '<domain>/<op-name>'. Must have at least a 'default' strategy key.

```ts
// src/domain/<domain>/ops/<my-op-name>/contract.ts
import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

export const MyOpConfigSchema = Type.Object(
  {
    myParam: Type.Number({ default: 0.5, minimum: 0, maximum: 1, description: "..." }),
  },
  { additionalProperties: false, description: "..." }
);

const MyOpContract = defineOp({
  kind: "compute",                   // "compute" | "plan" | "place" | "score" etc.
  id: "<domain>/my-op-name",        // kebab-case, prefixed with domain name
  input: Type.Object({
    width:  Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    myInput: TypedArraySchemas.u8({ description: "..." }),
  }),
  output: Type.Object({
    myOutput: TypedArraySchemas.u8({ description: "..." }),
  }),
  strategies: {
    default: MyOpConfigSchema,
  },
});

export default MyOpContract;
```

*new-op-types.ts* — Verbatim pattern from compute-landmask/types.ts. Provides typed input/output/envelope helpers consumed by implementation code.

```ts
// src/domain/<domain>/ops/<my-op-name>/types.ts
import type { OpTypeBagOf } from "@swooper/mapgen-core/authoring/contracts";

type Contract = typeof import("./contract.js").default;

export type MyOpTypes = OpTypeBagOf<Contract>;
```

*new-op-strategy-default.ts* — Pattern from compute-landmask/strategies/default.ts. createStrategy is a typed identity that infers config type from the contract + strategy id.

```ts
// src/domain/<domain>/ops/<my-op-name>/strategies/default.ts
import { createStrategy } from "@swooper/mapgen-core/authoring";

import MyOpContract from "../contract.js";

export const defaultStrategy = createStrategy(MyOpContract, "default", {
  // optional: normalize: (config, ctx) => config,
  run: (input, config) => {
    const { width, height } = input;
    const size = width * height;
    const myOutput = new Uint8Array(size);
    // ... use config.myParam, input.myInput
    return { myOutput };
  },
});
```

*new-op-strategies-index.ts* — Trivial re-export; add more named strategy exports here if needed.

```ts
// src/domain/<domain>/ops/<my-op-name>/strategies/index.ts
export { defaultStrategy } from "./default.js";
```

*new-op-index.ts* — Pattern from compute-landmask/index.ts. createOp throws at runtime if any strategy key is missing or extra.

```ts
// src/domain/<domain>/ops/<my-op-name>/index.ts
import { createOp } from "@swooper/mapgen-core/authoring";

import MyOpContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const myOp = createOp(MyOpContract, {
  strategies: {
    default: defaultStrategy,
    // add more named strategies here (must match contract.strategies keys exactly)
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default myOp;
```

*new-strategy-additional.ts* — To add a second strategy: extend defineOp strategies, implement with createStrategy, register in createOp. Strategy id must be an exact string literal matching the contract key.

```ts
// src/domain/<domain>/ops/<my-op-name>/strategies/my-variant.ts
import { createStrategy } from "@swooper/mapgen-core/authoring";
import MyOpContract from "../contract.js";

export const myVariantStrategy = createStrategy(MyOpContract, "my-variant", {
  run: (input, config) => {
    // config is typed to MyOpContract.strategies["my-variant"]
    return { myOutput: new Uint8Array(input.width * input.height) };
  },
});
// Then in contract.ts, add to strategies: { default: ..., "my-variant": MyVariantSchema }
// Then in index.ts createOp, add: "my-variant": myVariantStrategy
```

*new-artifact.ts* — Pattern from map-morphology/artifacts.ts. 'name' must be camelCase (/^[a-z][a-zA-Z0-9]*$/). 'id' must start with 'artifact:' and must not include @vN. defineArtifact freezes the object.

```ts
// src/recipes/standard/stages/<stage-id>/artifacts.ts
import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const MyArtifactSchema = Type.Object(
  {
    width:  Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    myData: TypedArraySchemas.u8({ description: "..." }),
  },
  { additionalProperties: false, description: "..." }
);

export const myStageArtifacts = {
  myArtifact: defineArtifact({
    name: "myArtifact",                        // camelCase; must match key
    id:   "artifact:<stage>.<scope>.myArtifact", // no @vN suffix
    schema: MyArtifactSchema,
  }),
} as const;
```

*new-step-contract.ts* — Pattern from morphology-features/steps/landmasses.contract.ts (with ops) and map-morphology/steps/plotContinents.contract.ts (no ops). '@mapgen/domain/<domain>' resolves to src/domain/<domain>/index.ts (the contract, not the runtime).

```ts
// src/recipes/standard/stages/<stage-id>/steps/<step-name>/contract.ts
import someDomain from "@mapgen/domain/<domain>";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { myStageArtifacts } from "../../artifacts.js";
import { otherArtifacts } from "../../../<other-stage>/artifacts.js";

const MyStepContract = defineStep({
  id: "my-step-name",     // kebab-case, validated by /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  phase: "morphology",   // GenerationPhase: "morphology"|"hydrology"|"ecology"|"placement"|...
  requires: ["effect:some.required.tag"],
  provides: ["effect:some.provided.tag"],
  artifacts: {
    requires: [otherArtifacts.someInput],
    provides: [myStageArtifacts.myArtifact],
    // artifact ids are auto-merged into requires/provides by defineStep
    // do NOT also add 'artifact:...' tags to the top-level requires/provides arrays
  },
  ops: {
    // Op key must NOT duplicate any key in schema:
    myOp: someDomain.ops.myOpName,
  },
  schema: Type.Object({
    // step-level config fields not covered by ops
    // omit or leave empty if all config is via ops
  }),
});

export default MyStepContract;
```

*new-step-impl.ts* — Pattern from landmasses.ts (ops path) and plotContinents.ts (no ops). implementArtifacts first arg is the provides array from the contract. ops.myOp is a pre-bound function (input, envelopeConfig) => output.

```ts
// src/recipes/standard/stages/<stage-id>/steps/<step-name>/index.ts
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { myStageArtifacts } from "../../artifacts.js";
import MyStepContract from "./contract.js";

export default createStep(MyStepContract, {
  // Required only if this step PROVIDES artifacts:
  artifacts: implementArtifacts(MyStepContract.artifacts!.provides!, {
    myArtifact: {
      // optional validate: (value, context) => [{ message: "..." }],
      // optional satisfies: (context) => boolean,
    },
  }),

  // optional: normalize: (config, ctx) => config,

  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;

    // Read required artifact:
    const input = deps.artifacts.someInput.read(context);

    // Call an op (config.myOp is typed as { strategy, config } envelope):
    const output = ops.myOp(
      { width, height, myInput: input.myData },
      config.myOp
    );

    // Publish provided artifact (write-once):
    deps.artifacts.myArtifact.publish(context, {
      width,
      height,
      myData: output.myOutput,
    });
  },
});
```

*new-stage-index.ts* — Pattern from map-morphology/index.ts and morphology-features/index.ts. compile receives { env, knobs, config } — config is the public schema value minus 'knobs'. knobsSchema is always required (use Type.Object({}) if empty). 'public' + 'compile' must appear together.

```ts
// src/recipes/standard/stages/<stage-id>/index.ts
import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { myStep } from "./steps/index.js";

const knobsSchema = Type.Object(
  {
    // top-level authoring knobs (can be empty)
  },
  { additionalProperties: false, description: "Knobs for <stage-id>." }
);

// Include publicSchema + compile only if the stage exposes a semantic public surface.
// If omitted, each step's schema is exposed directly (internal-step-config layer).
const publicSchema = Type.Object(
  {
    myControl: Type.Optional(Type.Number({ default: 1, description: "..." })),
  },
  { additionalProperties: false, description: "Public config for <stage-id>." }
);

export default createStage({
  id: "my-stage-id",   // must be registered in standardStageContractManifest
  knobsSchema,
  public: publicSchema,  // omit this (and compile) for internal-step-config stages
  steps: orderStandardStageSteps("my-stage-id", {
    "my-step-name": myStep,
    // key = step contract id, value = step runtime module
  }),
  compile: ({ config }: { config: Record<string, unknown> }) => ({
    // Must return one key per step id
    "my-step-name": {
      myOp: { strategy: "default", config: config.myControl ?? {} },
    },
  }),
} as const);
```

*contract-manifest-registration.ts* — The contract-manifest controls BOTH pipeline ordering (stage array position) AND within-stage step ordering. orderStandardStageSteps() throws if a step id in the runtime steps map is not found in the manifest for that stage.

```ts
// In src/recipes/standard/contract-manifest.ts
// 1. Import your new step contract at the top:
import MyStepContract from "./stages/<stage-id>/steps/<step-name>/contract.js";

// 2. Inside standardStageContractManifest array, add or extend a stage entry:
// For a NEW stage:
stage("my-stage-id", [
  MyStepContract,
  // ... other step contracts in execution order
]),

// For an EXISTING stage, append to its contract list:
stage("existing-stage", [
  ExistingStepContract,
  MyStepContract,  // added here
]),
```

*recipe-registration.ts* — recipe.ts uses @mapgen/domain/<domain>/ops (the createDomain runtime), not the contract index. collectCompileOps extracts compile-time op wrappers; pass every domain whose ops are used in any step in the recipe.

```ts
// In src/recipes/standard/recipe.ts
// 1. Import the new stage:
import myStage from "./stages/<stage-id>/index.js";

// 2. Add to orderStandardStages({...}):
const stages = orderStandardStages({
  // ... existing stages ...
  "my-stage-id": myStage,
} as const);

// 3. If the stage introduces a NEW domain, add it to collectCompileOps:
// import myDomain from "@mapgen/domain/<my-domain>/ops";
export const compileOpsById = collectCompileOps(
  foundationDomain,
  morphologyDomain,
  // myDomain,  // add here
);
```

**Key paths:**

- `packages/mapgen-core/src/authoring/op/contract.ts` — defineOp implementation and OpContract type
- `packages/mapgen-core/src/authoring/op/create.ts` — createOp implementation
- `packages/mapgen-core/src/authoring/op/strategy.ts` — createStrategy, OpStrategy, StrategyImplFor types
- `packages/mapgen-core/src/authoring/step/contract.ts` — defineStep implementation, StepContract type, artifact/ops merging logic
- `packages/mapgen-core/src/authoring/step/create.ts` — createStep, createStepFor implementations
- `packages/mapgen-core/src/authoring/stage.ts` — createStage implementation with public/compile logic
- `packages/mapgen-core/src/authoring/artifact/contract.ts` — defineArtifact, ArtifactContract type, id/name validation rules
- `packages/mapgen-core/src/authoring/artifact/runtime.ts` — implementArtifacts, ProvidedArtifactRuntime, publish/read/satisfies logic
- `packages/mapgen-core/src/authoring/domain.ts` — defineDomain, createDomain, DomainModule type
- `packages/mapgen-core/src/authoring/recipe.ts` — createRecipe implementation
- `packages/mapgen-core/src/authoring/contracts.ts` — authoring/contracts re-export entrypoint (defineOp, defineStep, defineArtifact, defineDomain, Type, TypedArraySchemas)
- `packages/mapgen-core/src/authoring/index.ts` — authoring main re-export entrypoint (createOp, createStep, createStage, createRecipe, implementArtifacts, etc.)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/contract.ts` — Reference op contract (defineOp with TypedArray inputs/output, single default strategy)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/index.ts` — Reference op runtime (createOp binding)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/strategies/default.ts` — Reference default strategy implementation (createStrategy)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/types.ts` — Reference types.ts pattern (OpTypeBagOf)
- `mods/mod-swooper-maps/src/domain/morphology/ops/contracts.ts` — Domain contracts aggregation file — add new op contracts here
- `mods/mod-swooper-maps/src/domain/morphology/ops/index.ts` — Domain implementations aggregation — add new op impls here (satisfies DomainOpImplementationsForContracts)
- `mods/mod-swooper-maps/src/domain/morphology/index.ts` — Reference domain contract (defineDomain)
- `mods/mod-swooper-maps/src/domain/hydrology/ops.ts` — Reference domain runtime (createDomain)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/artifacts.ts` — Reference stage artifacts file (defineArtifact with TypedArraySchemas)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotContinents.contract.ts` — Reference step contract (defineStep with artifacts, no ops, empty schema)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotContinents.ts` — Reference step implementation (createStep, implementArtifacts, deps.artifacts.*.publish)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/landmasses.contract.ts` — Reference step contract with ops (defineStep ops field referencing domain.ops.*)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/landmasses.ts` — Reference step impl with ops call (ops.myOp({...}, config.myOp))
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/index.ts` — Reference stage (createStage with public+compile, orderStandardStageSteps)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/index.ts` — Reference stage with knobs+public+compile (full pattern)
- `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts` — Canonical stage/step ordering; orderStandardStageSteps and orderStandardStages implementations
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` — createRecipe entry point; shows collectCompileOps and NAMESPACE usage
- `mods/mod-swooper-maps/tsconfig.json` — Path aliases — @mapgen/domain/* → src/domain/*

**Caveats:**

- REGISTRATION POINT 1 — New op: Add contract to ops/contracts.ts AND add implementation to ops/index.ts (both must stay in sync; the satisfies DomainOpImplementationsForContracts<typeof contracts> type check enforces this at compile time).
- REGISTRATION POINT 2 — New step: Add the step contract to standardStageContractManifest in contract-manifest.ts (the manifest controls execution order). Then add the runtime step to orderStandardStageSteps() in the stage index.ts. Both must use the same step id string.
- REGISTRATION POINT 3 — New stage: Add entry to standardStageContractManifest array in contract-manifest.ts (position determines pipeline order relative to other stages), add to orderStandardStages() map in recipe.ts. If new domain ops are introduced, pass the new domain to collectCompileOps() in recipe.ts.
- Op ids use <domain>/<op-name> namespacing (e.g. 'morphology/compute-landmask'). Do NOT omit the domain prefix.
- Artifact ids must start with 'artifact:' and must NOT include @vN version suffixes (defineArtifact throws on both). Name field must be camelCase matching the key in the artifacts map.
- Step artifact tags: if you declare artifacts: { requires, provides } in defineStep, defineStep will merge the artifact ids into requires/provides automatically for the engine. Do NOT also manually list artifact: tags in the top-level requires/provides arrays — defineStep throws if it detects this.
- When a stage defines 'public', it MUST also define 'compile'. The compile function receives { env, knobs, config } and must return a record keyed by step id with the step's raw config. Missing compile causes createStage to throw.
- knobsSchema in createStage is mandatory even if empty (use Type.Object({})). It is always wrapped under the 'knobs' key in the surfaceSchema.
- createOp validates that every strategy in the contract has an implementation and every implementation key exists in the contract — symmetry is enforced at runtime construction, not just type-time.
- The default strategy name 'default' is required by the OpContract type (Readonly<{ default: TSchema }>). Additional named strategies are optional but must be present both in defineOp.strategies and createOp.impl.strategies.
- Step ops: the config for an op in step run() is accessed as config.<opKey> (e.g. config.landmasses), which is typed as the op's envelope { strategy: string; config: ... }. This envelope is merged into the step schema automatically by buildSchemaWithOps.
- implementArtifacts first argument is the provides array from the contract (MyStepContract.artifacts!.provides!). The second argument is an impl map keyed by artifact name with optional validate and satisfies fields. An empty impl object {} is valid if no validation is needed.
- Domain contract (defineDomain) is the contract-only declaration referencing op contracts (ops/contracts.ts). Domain runtime (createDomain) is the full binding with implementations (ops/index.ts). Step contracts should import domain via '@mapgen/domain/<domain>' which resolves to the domain's contract/index.ts. Recipe.ts imports domain runtime via '@mapgen/domain/<domain>/ops'.

---

## Runnable in-game verification gate — log markers, rejectPattern, proof flow, 9 modes, cold-boot contract, failure classes, recovery branch

## Ordered verification checklist (studio-run-in-game-live, mutating path)

1. **Pre-flight: deploy check.** Run `nx run mod-swooper-maps:deploy` to push built bundles. The verifier SHA-256 compares `mods/mod-swooper-maps/mod/maps/<name>.js` (local) with `~/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/maps/<name>.js` (deployed). It also scans both files for the two required river-materialization markers (`map.rivers.authoredTerrainMaterialization` and `POST-AUTHORED-RIVERS`). Any mismatch produces `unresolvedLinks` and exits code 2 with `recoveryHint: "nx run mod-swooper-maps:deploy"`.

2. **Health check.** `checkCiv7DirectControlHealth` connects to the tuner at `127.0.0.1:4318`. Failure here exits code 2, `failureStage: "health"`.

3. **Setup snapshot.** `getCiv7SetupSnapshot` reads the current Civ7 phase. If not `"shell"` and `--from-running-game` is not `exit-to-shell`, the run aborts. If `exit-to-shell`, it fires `CIV7_EXIT_TO_MAIN_MENU_COMMAND` and polls until `phase === "shell"`.

4. **Map-row visibility.** `getCiv7SetupMapRows({ file: args.mapScript, limit: 25 })` confirms the map script appears in the Civ7 setup UI before any mutation.

5. **Deployed-script identity check** (swooper-maps scripts only). SHA-256 + mtime comparison of local vs deployed JS file, plus marker presence check for `map.rivers.authoredTerrainMaterialization` and `POST-AUTHORED-RIVERS`.

6. **Scripting.log snapshot.** `snapshotFile(scriptingLogPath)` captures the pre-launch log boundary (size + mtime + 4096-byte prefix). Everything below must appear *after* this snapshot offset.

7. **runCiv7SinglePlayerFromSetup.** Fires `prepareCiv7SinglePlayerSetup` (tuner prepare) + `startPreparedCiv7SinglePlayerGame` (Begin Game, waits for Tuner state). `waitForTuner: true` is always passed.

8. **waitForFreshLogMarkers** — the primary success gate. Polls `Scripting.log` from the snapshot offset. Must match (in order): `[mapgen-complete]` then `"seed":<N>`. The `rejectPattern` is `/\[mapgen-failure\]|Map generation failed|\[recipe:[^\]]+\].*fail|StepExecutionError|\b(?:TextEncoder|Uncaught|Exception|Error)\b/i`. Default timeout 90 s, poll interval 1 s (both overridable).

9. **Proof output.** `proofId` is `createCiv7ControlRequestId("studio-run-in-game-live-proof")` = `"studio-run-in-game-live-proof-<Date.now().toString(36)>-<pid.toString(36)>"`. Report printed as JSON to stdout.

---

## 9 verify modes (from `scripts/verify.ts`)

| Mode key | Script | Live? |
|---|---|---|
| `placement-catalogs` (default) | `scripts/placement/verify-manual-catalogs.ts` | no |
| `placement-metrics` | `scripts/placement/placement-metrics.ts` | no |
| `studio-run-in-game-live` | `scripts/live/verify-studio-run-in-game-live.ts` | yes |
| `final-surface-parity` | `scripts/live/verify-final-surface-parity.ts` | yes |
| `resource-delta-feasibility` | `scripts/live/verify-resource-delta-feasibility.ts` | yes |
| `feature-delta-feasibility` | `scripts/live/verify-feature-delta-feasibility.ts` | yes |
| `terrain-edge-live-context` | `scripts/live/verify-terrain-edge-live-context.ts` | yes |
| `placement-live-legality-agreement` | `scripts/placement/verify-live-legality-agreement.ts` | yes |
| `placement-live-required-for-age` | `scripts/placement/verify-live-required-for-age.ts` | yes |

Aliases: `catalogs` → `placement-catalogs`, `metrics` → `placement-metrics`, `studio-run-in-game:live` → `studio-run-in-game-live`.

Invocation: `nx run mod-swooper-maps:verify -- --mode <mode> [flags]` or `bun ./scripts/verify.ts --mode <mode> [flags]`.

---

## final-surface-parity proof flow

After a successful `studio-run-in-game-live` run, retrieve the `requestId` from the JSON proof output. Then:

```
nx run mod-swooper-maps:verify -- --mode final-surface-parity \
  --request-id <id> \
  --studio-url http://127.0.0.1:5174 \
  --output /tmp/parity.json
```

The script POSTs to `${studioUrl}/rpc/runInGame/status` (oRPC, body `{ json: { requestId } }`), extracts `exactAuthorshipProof`, runs `runLocalFinalSurfaceSnapshot` (headless), calls `getCiv7FullMapGrid` (fields: terrain/biome/feature/resource/hydrology, `includeHidden: true`, `maxPlotsPerRead: 512`) + `getCiv7NativeRiverObjects`, and emits a `FinalSurfaceParityProof`. Runtime identity check compares saved vs observed: width, height, plotCount, seed, turn, gameHash. Output `parityStatus: "complete"` → exit 0; anything else → exit 2.

---

## Attempt-1 live-only failure classes (confirmed in placement-realignment 2026-06-11)

1. **`console.warn is not a function`** — Civ7 scripting runtime (`MapGeneration` context) exposes only `console.log`, not `console.warn`. Any placement or pipeline code calling `console.warn()` crashes the step. Fix: replace all `console.warn` call sites with an engine-safe `warnLog` helper. Recovery branch: `placement-realignment-s9-live-compat` (integration commit `409f35de5`).

2. **SIGSEGV on MockAdapter-valid maps without standard write/prep ops** — Maps that pass local headless (`MockAdapter`) validation can still crash the live engine if the standard `write`/`prep` operations are not executed before launch. `runCiv7SinglePlayerFromSetup` handles this; never skip it.

3. **Age-intro overlay blocking OS capture** — After `game visibility --reveal`, the Civ7 game sits behind a blocking notification queue (natural-wonder discovery cinematics, turn-intro). `game appshot` (macOS `screencapture`) captures a stale frame or the cinematic rather than the map. Workaround: drain the notification/cinematic queue via the official handler pattern (activate `fxs-hero-button.cinematic-moment__close-button` from App UI DOM) before requesting screenshot. Additionally, macOS `screencapture` returns pixel-identical stale frames across many seconds — treat as unreliable for snapshot proofs.

---

## firetuner-runtime contract (from `.agents/skills/civ7-operational-debugging/references/firetuner-runtime.md`)

- Default tuner port: `4318`. Host: `127.0.0.1` (never a remote bridge).
- Enable tuner: `AppOptions.txt`, `EnableTuner 1` (no leading semicolon).
- In-game proof boundary for map-gen claims: deployed map/mod file mtime before command; `Scripting.log` mtime before/after; fresh `Creating Context - MapGeneration`; final stage `[50/50] ok mod-swooper-maps.standard.placement.placement`; `Destroying Context - MapGeneration`; no `TextEncoder`, `Uncaught`, `Error`, or `Exception` in fresh log text.
- `Tuner` state (not `App UI`) is command-ready only after Begin Game and is the better canary for gameplay globals (`Game`, `GameplayMap`, `Players`).
- `@civ7/direct-control` is the authoritative package for all runtime probes; raw `civ7 game exec` is debugging only.


**Exact facts:**

- `log_success_markers` → ["[mapgen-complete]", "\"seed\":<N>"] — matched in order from fresh Scripting.log
- `rejectPattern` → /\[mapgen-failure\]|Map generation failed|\[recipe:[^\]]+\].*fail|StepExecutionError|\b(?:TextEncoder|Uncaught|Exception|Error)\b/i
- `required_river_materialization_markers` → ["map.rivers.authoredTerrainMaterialization", "POST-AUTHORED-RIVERS"] — must be present in both local and deployed JS
- `tuner_host` → 127.0.0.1
- `tuner_port` → 4318
- `studio_url_default` → http://127.0.0.1:5174
- `studio_rpc_endpoint` → POST /rpc/runInGame/status — body: { json: { requestId } } — returns envelope { json: { exactAuthorshipProof, ... } }
- `scripting_log_path_darwin` → ~/Library/Application Support/Civilization VII/Logs/Scripting.log
- `deployed_mod_path_darwin` → ~/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/maps/<name>.js
- `local_mod_script_path` → mods/mod-swooper-maps/mod/maps/<name>.js
- `proofId_format` → createCiv7ControlRequestId("studio-run-in-game-live-proof") = "studio-run-in-game-live-proof-<Date.now().toString(36)>-<pid.toString(36)>"
- `SWOOPER_MAP_SCRIPT_PATTERN` → /^\{swooper-maps\}\/maps\/([a-z0-9]+(?:-[a-z0-9]+)*\.js)$/
- `waitForFreshLogMarkers_default_timeoutMs` → 90000
- `waitForFreshLogMarkers_default_pollIntervalMs` → 1000
- `DEFAULT_CIV7_TUNER_STATE_NAME` → App UI
- `CIV7_TUNER_STATE_NAME_gameplay` → Tuner
- `AGREEMENT_GATE_THRESHOLD` → 0.95 (placement-live-legality-agreement)
- `default_mode` → placement-catalogs (no live required)
- `exit_codes` → 0=ok, 1=exception, 2=stage-failure, 3=run-not-verified
- `recovery_branch_attempt1` → placement-realignment-s9-live-compat (integration commit 409f35de5)
- `attempt1_failure_class` → console.warn is not a function at step 50/53 placement.place-resources
- `final_stage_log_pattern` → [50/50] ok mod-swooper-maps.standard.placement.placement
- `fromRunningGame_default` → reject (throws if not in shell phase)

**Skeletons / call shapes:**


*studio-run-in-game-live mutating invocation* — Requires Civ7 running with EnableTuner 1, tuner on 127.0.0.1:4318, mod deployed

```ts
nx run mod-swooper-maps:verify -- --mode studio-run-in-game-live \
  --mutate \
  --map-script "{swooper-maps}/maps/swooper-earthlike.js" \
  --map-size MAPSIZE_HUGE \
  --seed 1337 \
  --game-seed 1337 \
  --player-count 10 \
  --from-running-game exit-to-shell \
  --wait-timeout-ms 120000
```

*final-surface-parity invocation* — Studio must be running; game must still be on the same session (runtime identity check compares seed/turn/gameHash)

```ts
nx run mod-swooper-maps:verify -- --mode final-surface-parity \
  --request-id studio-run-in-game-live-proof-<id> \
  --studio-url http://127.0.0.1:5174 \
  --output /tmp/parity-proof.json
```

*waitForFreshLogMarkers call shape (from verify-studio-run-in-game-live.ts:481-489)* — File: scripts/live/verify-studio-run-in-game-live.ts lines 481-489

```ts
const logProof = await waitForFreshLogMarkers({
  logPath: scriptingLogPath,
  snapshot: scriptingSnapshot,
  markers: ["[mapgen-complete]", `"seed":${args.seed}`],
  timeoutMs: args.waitTimeoutMs,
  pollIntervalMs: args.pollIntervalMs,
  rejectPattern:
    /\[mapgen-failure\]|Map generation failed|\[recipe:[^\]]+\].*fail|StepExecutionError|\b(?:TextEncoder|Uncaught|Exception|Error)\b/i,
});
```

*proofId creation* — File: scripts/live/verify-studio-run-in-game-live.ts line 381

```ts
const proofId = createCiv7ControlRequestId("studio-run-in-game-live-proof");
// result: "studio-run-in-game-live-proof-<Date.now().toString(36)>-<pid.toString(36)>"
```

*REQUIRED_SWOOPER_RIVER_MATERIALIZATION_MARKERS* — File: scripts/live/verify-studio-run-in-game-live.ts lines 105-108

```ts
export const REQUIRED_SWOOPER_RIVER_MATERIALIZATION_MARKERS = [
  "map.rivers.authoredTerrainMaterialization",
  "POST-AUTHORED-RIVERS",
] as const;
```

**Key paths:**

- `mods/mod-swooper-maps/scripts/verify.ts` — Top-level mode dispatcher; defines the 9 verify modes and their script paths
- `mods/mod-swooper-maps/scripts/live/verify-studio-run-in-game-live.ts` — Primary in-game gate: health check, map-row visibility, deployed-script SHA-256 identity, log-marker wait with rejectPattern
- `mods/mod-swooper-maps/scripts/live/verify-final-surface-parity.ts` — Post-run parity proof: fetches exactAuthorshipProof from Studio oRPC, runs headless local snapshot, full-grid getCiv7FullMapGrid + getCiv7NativeRiverObjects
- `mods/mod-swooper-maps/scripts/live/verify-resource-delta-feasibility.ts` — Live ResourceBuilder.canHaveResource probes for resource delta rows from a final-surface-parity proof
- `mods/mod-swooper-maps/scripts/live/verify-feature-delta-feasibility.ts` — Live TerrainBuilder.canHaveFeature probes for feature delta rows from a final-surface-parity proof
- `mods/mod-swooper-maps/scripts/live/verify-terrain-edge-live-context.ts` — Live terrain/hydrology/area readback for terrain edge delta rows; requires terrain, water, lake, riverType, areaId, regionId, landmassId facts
- `mods/mod-swooper-maps/scripts/placement/verify-live-legality-agreement.ts` — Mock-vs-live ResourceBuilder legality agreement probe; AGREEMENT_GATE_THRESHOLD=0.95
- `mods/mod-swooper-maps/scripts/placement/verify-live-required-for-age.ts` — Live ResourceBuilder.isResourceRequiredForAge sweep vs static map-policy tables
- `mods/mod-swooper-maps/scripts/placement/verify-manual-catalogs.ts` — Offline catalog validation (no live game required)
- `packages/civ7-direct-control/src/proof/log-markers.ts` — waitForFreshLogMarkers + snapshotFile implementations; defines DEFAULT_CIV7_SCRIPTING_LOG
- `packages/civ7-direct-control/src/session/constants.ts` — DEFAULT_CIV7_TUNER_PORT=4318, DEFAULT_CIV7_TUNER_HOST=127.0.0.1, state name constants
- `packages/civ7-direct-control/src/session/request-id.ts` — createCiv7ControlRequestId implementation
- `packages/civ7-direct-control/src/setup/run.ts` — runCiv7SinglePlayerFromSetup: shell-phase check, exit-to-shell path, prepare+start+verify
- `.agents/skills/civ7-operational-debugging/references/firetuner-runtime.md` — Tuner discipline reference: port 4318, Scripting.log boundary requirements, state refresh discipline, log sibling files
- `docs/projects/placement-realignment/evidence/milestone-a-2026-06-11.md` — Live proof evidence: attempt-1 failure (console.warn), attempt-2/3 success, telemetry, exact requestIds
- `docs/projects/placement-realignment/evidence/milestone-b-2026-06-11.md` — Live proof evidence B: age-intro overlay blocking OS capture, cinematic dismissal procedure

**Caveats:**

- rejectPattern is applied to the fresh (post-snapshot) Scripting.log segment only, not the full file. If the engine rewrites the log (detected by prefix mismatch), the full text is used instead.
- The two success markers ([mapgen-complete] and "seed":<N>) must appear in order; matchOrderedMarkers advances a cursor so they are sequence-enforced, not just presence-checked.
- waitForFreshLogMarkers default timeout is 90 s but the verify script propagates --wait-timeout-ms from its own args, so the effective timeout for live runs should be set to match expected map-gen duration (Huge maps take 60–90 s on the live engine).
- The deployed-script identity check compares SHA-256 hashes; any build artifact drift (e.g. partial deploy, nx cache returning stale output) will block verification. Always run nx run mod-swooper-maps:deploy immediately before mutating verify.
- The Studio oRPC endpoint for final-surface-parity is POST /rpc/runInGame/status (not the retired REST /api/civ7/run-in-game/status). The response envelope is { json: <payload> }; the payload must contain exactAuthorshipProof directly, at payload.status.exactAuthorshipProof, or at payload.result.exactAuthorshipProof.
- final-surface-parity will return parityStatus: "blocked" if the exactAuthorshipProof has any unresolvedLinks — most commonly sourceSnapshot links are missing when the Studio run-in-game driver did not supply a sourceSnapshot. Headless drivers must include sourceSnapshot in the start request.
- The Tuner state (not App UI) is command-ready only after Begin Game. Probes run before the Tuner state is populated will get empty or stale results. waitForTuner: true in runCiv7SinglePlayerFromSetup handles this.
- OS screenshot capture (civ7 game appshot / macOS screencapture) returns stale frames across many seconds due to a macOS screen-capture caching behavior observed in practice. Age-intro and wonder-discovery cinematics also block the map view. Neither is a verification blocker for the log-marker gate, but both prevent visual QA.
- The SIGSEGV risk (MockAdapter-valid map crashing live engine) is real but not caught by the log-marker gate. The gate only proves mapgen completed successfully; SIGSEGV would prevent Civ7 from loading the map at all, which would be caught as a health-check failure on the subsequent verify run.
- AGREEMENT_GATE_THRESHOLD=0.95 in placement-live-legality-agreement is a constant at file top — not configurable via CLI flags. Live agreement was measured at 0.9863 on the Huge/earthlike reference run.

---

## Studio display-bug edit surface (arm d) vs generation-side dumper

## Display vs Generation Decision Procedure

**Ask: does the raw binary data coming out of generation look correct?**

Run `bun mods/mod-swooper-maps/src/dev/viz/standard-run.ts` to produce a dump under `mods/mod-swooper-maps/dist/visualization/<runId>/`. Open `manifest.json` and inspect the binary blobs with `src/dev/diagnostics/diff-layers.ts`. If the per-tile values in the `.bin` files are wrong, the bug is **generation-side** (fix in `mods/mod-swooper-maps/src/domain/*` or `src/recipes/*`). If the binaries look correct but the canvas renders the wrong color, missing layer, or wrong spatial projection, the bug is **display-side** (fix in `apps/mapgen-studio/src/features/viz/*`).

### Display-side pipeline (Studio, arm d)

1. **Emission** — the browser worker calls `createWorkerVizDumper()` (`browser-runner/worker-viz-dumper.ts`). It fires `trace.event({ type: "viz.layer.emit.v1", layer })` with inline `ArrayBuffer` payloads instead of file paths.
2. **Ingestion** — `recipeRuntime.ts` → worker protocol → `shared/vizEvents.ts` `VizEvent` union → `ingest.ts:ingestVizEvent()` adds each `viz.layer.upsert` entry into the `VizManifestV1` held by `vizStore.ts:VizStore`.
3. **Layer model** — `dataTypeModel.ts:buildStepDataTypeModel()` groups `VizLayerEntryV1[]` from the manifest into `DataTypeModel` trees keyed by `layer.dataTypeKey`. The mapping `dataTypeKey → SpaceModel → RenderModeModel → LayerVariant` is computed entirely here. If a layer is missing from the UI picker, the bug is here.
4. **Selection & render dispatch** — `useVizState.ts:useVizState()` picks the `effectiveLayer` and `overlayLayer`, then calls `renderDeckLayers()` in an effect. Layer default selection prefers a `kind==="grid"` layer in a `tile.*` space.
5. **Color-scale mapping** — `presentation.ts`. All color logic lives here:
   - `writeColorForScalarValue()` is the single call site for every tile/point/segment color
   - `VALUE_RAMP` (viridis-like 5-stop RGBA) for continuous data
   - `buildCategoricalColorMap()` + `generateOpposedPalette()` for `palette==="categorical"` auto-coloring
   - `resolveCategoryColor()` for explicit `meta.categories[]` entries
   - `resolveUnitValue()` applies `valueSpec.transform`, `valueSpec.domain`, `valueSpec.scale` (linear/log/symlog/quantile/piecewise)
   - `legendForLayer()` builds the legend model from the same data
   - `tileBorderColorForFill()` computes tile grout as fill × `TILE_BORDER_FILL_RATIO = 0.55`
6. **deck.gl layer construction** — `deckgl/render.ts:renderDeckLayers()` / `renderSingleLayer()`. Four layer kinds: `grid` → `PolygonLayer` with hex geometry; `points` → `ScatterplotLayer`; `segments` → `LineLayer`; `gridFields` → `PolygonLayer` + optional `LineLayer` arrows. Hex grid geometry is cached by `(spaceId, dims, tileSize)`. Coordinate transform: `oddRTileCenter()` / `oddRPointFromTileXY()` + `orientTilePointNorthUp()` (y-flip). Both `tile.hexOddR` and `tile.hexOddQ` are treated as the same odd-R lattice (see comment lines 80–89).
7. **Canvas** — `DeckCanvas.tsx` holds the raw `Deck` instance. It adds a background grid `LineLayer` (`bg.mesh.grid`) beneath the data layers. No color logic here.

### Generation-side dumper

- **Node/CLI dumper**: `mods/mod-swooper-maps/src/dev/viz/dump.ts` — `createVizDumper()` and `createTraceDumpSink()`. Emits `viz.layer.dump.v1` events; writes binary `.bin` files to `dist/visualization/<runId>/data/`; serialises `manifest.json`.
- **Browser dumper**: `apps/mapgen-studio/src/browser-runner/worker-viz-dumper.ts` — `createWorkerVizDumper()`. Same `VizDumper` interface but uses `{ kind: "inline", buffer: ArrayBuffer }` refs instead of file paths; emits `viz.layer.emit.v1`.
- **Entry point**: `mods/mod-swooper-maps/src/dev/viz/standard-run.ts` wires `createVizDumper` + `createTraceDumpSink` + `standardRecipe.run()`.

### Parity/diagnostics discriminators

- `diff-layers.ts` — binary diff tool comparing two run manifests. Operates on `manifest.json` + `.bin` files. A non-zero Hamming distance here is a **generation bug**.
- `FinalSurfaceParityProof` (in `live-parity.ts`) — proof object comparing local mapgen output against the live Civ7 engine. `proof.unresolvedLinks: ReadonlyArray<string>` is the discriminator: an empty array means `status === "complete"` (generation matches live); non-empty entries name the specific links that failed (seed, dimension, surface mismatch, river metadata, etc.). `buildFinalSurfaceParityProof()` (line 1098) assembles it; `validateExactAuthorshipProofPacket()` (line ~1356) pre-checks the `ExactAuthorshipProofLike` packet and returns its own `unresolvedLinks`. Both are **generation-side** tools — a non-empty `unresolvedLinks` means fix `domain/*` or `recipes/*`, not Studio.

### Bug classification rules

| Symptom | Likely location | Edit target |
|---|---|---|
| Wrong tile color or scale | `presentation.ts` `writeColorForScalarValue` / `VALUE_RAMP` / `buildCategoricalColorMap` | `presentation.ts` |
| Layer absent from picker | `dataTypeModel.ts` `buildStepDataTypeModel` — check `dataTypeKey`, `visibility` filter, or `includeDebug` flag | `dataTypeModel.ts` |
| Wrong spatial projection / hex misalignment | `deckgl/render.ts` `oddRTileCenter`, `tilePoint`, `orientTilePointNorthUp` | `deckgl/render.ts` |
| Layer selection defaults to wrong layer | `useVizState.ts` `activeSelectedLayerKey` useMemo (line ~196) | `useVizState.ts` |
| Overlay not matching base layer | `useVizState.ts` `overlayLayer` useMemo (line ~223) | `useVizState.ts` |
| Legend wrong | `presentation.ts` `legendForLayer` | `presentation.ts` |
| Binary values wrong in manifest | `domain/*` or `recipes/*` step logic | generation side |
| `FinalSurfaceParityProof.unresolvedLinks` non-empty | mapgen domain/recipe logic | generation side |


**Exact facts:**

- `FinalSurfaceParityProof type definition file:line` → mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts:432
- `FinalSurfaceParityProof.unresolvedLinks field line` → mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts:458
- `buildFinalSurfaceParityProof function line` → mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts:1098
- `validateExactAuthorshipProofPacket function line` → mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts:~1356
- `FinalSurfaceParityProof.status discriminator` → status: 'complete' | 'unresolved' — 'complete' iff unresolvedLinks.length === 0
- `diff-layers.ts main entry` → mods/mod-swooper-maps/src/dev/diagnostics/diff-layers.ts — CLI: bun ./src/dev/diagnostics/diff-layers.ts -- <runDirA> <runDirB> [--prefix ...] [--dataTypeKey ...]
- `worker viz-dumper event type (browser)` → viz.layer.emit.v1 (inline ArrayBuffer)
- `node viz-dumper event type (CLI)` → viz.layer.dump.v1 (path ref to .bin file)
- `VizEvent union location` → apps/mapgen-studio/src/shared/vizEvents.ts
- `VALUE_RAMP (viridis-like ramp)` → presentation.ts:374 — 5-stop [[68,1,84,230]...[253,231,37,230]]
- `TILE_BORDER_FILL_RATIO` → presentation.ts:402 — 0.55
- `buildStepDataTypeModel signature` → buildStepDataTypeModel(manifest: { layers: readonly VizLayerEntryV1[] }, stepId: string, opts?: { includeDebug?: boolean }): StepDataTypeModel
- `renderDeckLayers signature` → renderDeckLayers(options: RenderDeckLayersArgs): Promise<RenderDeckLayersResult> — RenderDeckLayersArgs = { manifest, layer, overlayLayer?, overlayOpacity?, showEdgeOverlay, assetResolver?, signal? }
- `hex grid geometry cache key` → `${spaceId}:${width}x${height}:s${tileSize}` — MAX_HEX_GRID_GEOMETRY_CACHE_ENTRIES = 4
- `oddRTileCenter formula` → x = size*sqrt(3)*(col + (row&1 ? 0.5 : 0)); y = size*1.5*row; then y-flip for north-up
- `tile.hexOddQ treatment` → render.ts:76–89 — both tile.hexOddR and tile.hexOddQ render via the SAME odd-R lattice; hexOddQ is documented as a mislabel

**Skeletons / call shapes:**


*writeColorForScalarValue call shape* — presentation.ts:617 — called once per tile/point/segment in render loops inside deckgl/render.ts

```ts
writeColorForScalarValue(colors: Uint8ClampedArray, offset: number, args: {
  seedKey: string;         // `${runId}:${layerKey}`
  rawValue: number;
  categoricalColorMap?: Map<number, RgbaColor>;
  meta?: VizLayerMeta;     // layer.meta
  field?: VizScalarField | null;
  stats?: VizScalarStats | null;
}): void
```

*buildStepDataTypeModel call shape* — dataTypeModel.ts:106 — called by useVizState.ts to build the layer picker tree

```ts
buildStepDataTypeModel(
  manifest: { layers: readonly VizLayerEntryV1[] },
  stepId: string,
  opts?: { includeDebug?: boolean }
): StepDataTypeModel
// StepDataTypeModel.dataTypes[i].dataTypeId === layer.dataTypeKey
// StepDataTypeModel.dataTypes[i].spaces[j].renderModes[k].variants[v].layerKey
```

*FinalSurfaceParityProof discriminator check* — live-parity.ts:1098+1314 — status is set at line 1314: unresolvedLinks.length === 0 ? 'complete' : 'unresolved'

```ts
const proof: FinalSurfaceParityProof = buildFinalSurfaceParityProof({ exactAuthorship, local, live });
// proof.status === 'complete'  →  unresolvedLinks.length === 0  →  generation matches live
// proof.status === 'unresolved'  →  proof.unresolvedLinks contains named failing links
// e.g. 'surface.terrain.mismatch', 'river-metadata.mismatch', 'exact-authorship-proof.runtime-seed.local-seed'
```

*createWorkerVizDumper emission* — worker-viz-dumper.ts:97–127 (grid case); dump.ts:188–210 (node equivalent)

```ts
// browser-runner/worker-viz-dumper.ts — in-browser path
trace.event((): { type: 'viz.layer.emit.v1'; layer: VizLayerEmissionV1 } => ({
  type: 'viz.layer.emit.v1',
  layer: { kind: 'grid', layerKey, dataTypeKey, spaceId, dims, field: inlineField({...}), meta, ... }
}));
// Contrast with node path in dump.ts which uses { type: 'viz.layer.dump.v1' } and pathRef refs
```

**Key paths:**

- `apps/mapgen-studio/src/features/viz/presentation.ts` — COLOR-SCALE OWNER — all color mapping: writeColorForScalarValue, VALUE_RAMP, buildCategoricalColorMap, legendForLayer, tileBorderColorForFill, resolveUnitValue. Fix here for: wrong color, wrong scale, wrong legend, wrong noData handling
- `apps/mapgen-studio/src/features/viz/deckgl/render.ts` — DECK.GL LAYER BUILDER — renderDeckLayers / renderSingleLayer, all 4 layer kinds (grid/points/segments/gridFields), hex polygon geometry, coordinate transforms (oddRTileCenter, orientTilePointNorthUp). Fix here for: wrong projection, hex misalignment, missing layer geometry, wrong spaceId handling
- `apps/mapgen-studio/src/features/viz/dataTypeModel.ts` — LAYER GROUPING MODEL — buildStepDataTypeModel groups VizLayerEntryV1[] by dataTypeKey → SpaceModel → RenderModeModel → LayerVariant. Fix here for: layer absent from picker, wrong grouping, wrong visibility filter
- `apps/mapgen-studio/src/features/viz/useVizState.ts` — VIZ STATE ORCHESTRATOR — effectiveLayer selection, overlayLayer resolution, renderDeckLayers dispatch, legend computation. Fix here for: wrong default layer selection, overlay not co-registering, stale render on step change
- `apps/mapgen-studio/src/features/viz/DeckCanvas.tsx` — CANVAS MOUNT — holds Deck instance, background grid LineLayer (bg.mesh.grid), camera fit logic. Fix here for: camera/fit bugs, background grid issues, canvas sizing
- `apps/mapgen-studio/src/features/viz/vizStore.ts` — VIZ STORE — batched rAF+timeout commit, streamManifest state, selectedStepId/selectedLayerKey defaults during streaming. Fix here for: streaming state bugs, stale manifest after run
- `apps/mapgen-studio/src/features/viz/ingest.ts` — EVENT INGESTOR — ingestVizEvent() maps VizEvent union onto VizManifestV1 mutations (run.started, viz.layer.upsert, run.progress step.start). Fix here for: layers not appearing after emit
- `apps/mapgen-studio/src/features/viz/model.ts` — TYPE ALIASES — VizLayerEntryV1, VizManifestV1, VizAssetResolver, Bounds (re-exports from @swooper/mapgen-viz). Not a logic file.
- `apps/mapgen-studio/src/browser-runner/worker-viz-dumper.ts` — BROWSER-SIDE DUMPER — createWorkerVizDumper() implements VizDumper for in-browser runs using inline ArrayBuffer refs; emits viz.layer.emit.v1. Fix here if browser runs emit wrong layer metadata (not the color — that is presentation.ts)
- `mods/mod-swooper-maps/src/dev/viz/dump.ts` — NODE-SIDE DUMPER — createVizDumper() + createTraceDumpSink() write manifest.json + binary .bin files for CLI runs; emits viz.layer.dump.v1. Generation-side diagnostic only.
- `mods/mod-swooper-maps/src/dev/viz/standard-run.ts` — CLI VIZ ENTRY POINT — wires createVizDumper + createTraceDumpSink + standardRecipe.run; output under dist/visualization/<runId>/. Generation-side diagnostic only.
- `mods/mod-swooper-maps/src/dev/diagnostics/diff-layers.ts` — GENERATION DIAGNOSTIC — binary diff between two run manifests (Hamming / maxAbsDiff). Non-zero diff confirms a generation bug in domain/* or recipes/*.
- `mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts` — PARITY PROOF — FinalSurfaceParityProof type (line 432), buildFinalSurfaceParityProof (line 1098), validateExactAuthorshipProofPacket (~line 1356). proof.unresolvedLinks non-empty = generation bug.
- `mods/mod-swooper-maps/scripts/live/verify-final-surface-parity.ts` — PARITY SCRIPT — CLI wrapper around buildFinalSurfaceParityProof; reads Studio RPC or --proof-file; extracts exactAuthorshipProof via extractExactAuthorshipProof(); writes output JSON.

**Caveats:**

- The VizLayerEntryV1 schema including meta.categories, meta.palette, meta.label, variantKey, dataTypeKey is defined in @swooper/mapgen-viz (packages/mapgen-viz/src/*) — if a layer emits wrong metadata those fields must be fixed in the domain/recipe step that calls viz.dumpGrid/dumpPoints/dumpSegments/dumpGridFields, not in presentation.ts.
- tile.hexOddQ and tile.hexOddR are treated identically by render.ts (both use odd-R lattice) — this is documented as intentional based on audit evidence; if a real odd-Q grid is ever added, isTileSpace() and the geometry functions would need forking.
- The hex grid geometry cache (MAX_HEX_GRID_GEOMETRY_CACHE_ENTRIES=4) evicts by insertion order, not LRU — this can cause unexpected re-builds when cycling through more than 4 map sizes.
- FinalSurfaceParityProof.unresolvedLinks is the canonical discriminator for generation correctness vs live-engine correctness. A 'display bug' never affects this proof because the proof compares raw mapgen output against Civ7 runtime, not rendered Studio pixels.
- Both worker-viz-dumper.ts and dump.ts must emit identical VizLayerEntryV1 shapes for a given recipe step — if they diverge (e.g. different meta fields), Studio rendering may differ from CLI inspection.

---

## Standard Recipe stage list: live vs docs reconciliation

**Verdict: STANDARD-RECIPE.md is current — zero drift from live source.**

The authoritative 17-stage sequence is defined in two complementary live files:
- `contract-manifest.ts` (`standardStageContractManifest`, lines 69–132) — defines the ordered canonical sequence and enforces it at runtime via `orderStandardStages`/`orderStandardStageSteps`.
- `recipe.ts` (lines 34–52) — passes the 17 stage ids as keys to `orderStandardStages`; the manifest reorders them deterministically, so key order in `recipe.ts` does not matter.

`STANDARD-RECIPE.md` § "Stage order (current)" (lines 55–73) lists exactly the same 17 stage ids in exactly the same order as `standardStageContractManifest`. No discrepancies exist.

**Truth-stage vs projection-stage (map-*) split** (confirmed in both STANDARD-RECIPE.md and live code):
- Truth producers (stages 1–10): `foundation`, `morphology-coasts`, `morphology-routing`, `morphology-erosion`, `morphology-features`, `hydrology-climate-baseline`, `hydrology-hydrography`, `hydrology-climate-refine`, `ecology-pedology`, `ecology-biomes`
- Projection/engine-facing stages (stages 11–17): `map-morphology`, `map-hydrology`, `map-elevation`, `map-rivers`, `ecology-features`, `map-ecology`, `placement`
  - Note: `ecology-features` sits between `map-rivers` and `map-ecology` — it is a truth-consumer/planner stage that feeds `map-ecology` projection, not a direct map-* projection itself.

**Residual non-stage dirs in `stages/`**: Two directories exist under `stages/` that are NOT registered pipeline stages:
- `stages/ecology/` — shared artifact helpers (`artifacts.ts`, `artifact-validation.ts`)
- `stages/morphology/` — shared artifact helpers (`artifacts.ts`)
These are imported by neighboring stage modules as shared utilities; they have no `index.ts` stage registration and are not passed to `orderStandardStages`.


**Exact facts:**

- `stage-01` → foundation
- `stage-02` → morphology-coasts
- `stage-03` → morphology-routing
- `stage-04` → morphology-erosion
- `stage-05` → morphology-features
- `stage-06` → hydrology-climate-baseline
- `stage-07` → hydrology-hydrography
- `stage-08` → hydrology-climate-refine
- `stage-09` → ecology-pedology
- `stage-10` → ecology-biomes
- `stage-11` → map-morphology
- `stage-12` → map-hydrology
- `stage-13` → map-elevation
- `stage-14` → map-rivers
- `stage-15` → ecology-features
- `stage-16` → map-ecology
- `stage-17` → placement
- `ordering-authority` → standardStageContractManifest in contract-manifest.ts (lines 69-132)
- `ordering-enforcer` → orderStandardStages() in contract-manifest.ts (lines 150-158)
- `truth-stages` → stages 1-10: foundation through ecology-biomes
- `projection-stages` → stages 11-17: map-morphology through placement (map-* prefix + ecology-features + placement)
- `non-stage-dirs` → stages/ecology/ and stages/morphology/ (shared artifact helpers, not pipeline stages)
- `doc-drift-verdict` → CURRENT — STANDARD-RECIPE.md stage list matches live source exactly

**Key paths:**

- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` — Live recipe — passes 17 stage ids to orderStandardStages (lines 34-52)
- `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts` — Authoritative stage order — standardStageContractManifest array (lines 69-132) + orderStandardStages enforcer
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md` — Documentation — stage order list at lines 55-73; currently in sync with live source
- `docs/system/libs/mapgen/MAPGEN.md` — Doc entrypoint — routes to STANDARD-RECIPE.md; no independent stage list
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology` — Non-stage shared dir — artifact helpers only (artifacts.ts, artifact-validation.ts)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology` — Non-stage shared dir — artifact helpers only (artifacts.ts)

**Caveats:**

- Always verify stage order against contract-manifest.ts (standardStageContractManifest) as the runtime-authoritative source, not recipe.ts — recipe.ts key insertion order is irrelevant because orderStandardStages reorders by manifest position.
- STANDARD-RECIPE.md is currently accurate but the file itself notes it may lag normalization-packet changes during the engine-refactor-v1 workstream — if an OpenSpec change slice lands, re-read contract-manifest.ts before trusting the doc.
- The ecology-features stage (position 15) sits between map-rivers and map-ecology but does NOT carry a map-* prefix; it is a truth-consumer/planner, not a pure projection stage — do not classify it with map-* stages even though it appears after map-rivers.
- stages/ecology/ and stages/morphology/ are shared artifact directories under stages/ but are NOT pipeline stages — they have no index.ts and are not registered in orderStandardStages; treat them as implementation-internal helpers.
- MAPGEN.md contains no independent stage list and does not need to be updated when stage order changes — it only routes to STANDARD-RECIPE.md.
- The mapgen:* cache skills are documented as architecturally outdated; do not use them as a source for stage ordering or architecture — read contract-manifest.ts directly.
