# Recipe Scaffolds — copy-paste templates for the technical arm

> Open when you are about to *author* a new op, strategy, step, stage, or artifact in the recipe — and want a minimal-correct skeleton plus the exact registration points so the recipe still compiles and runs. This is the technical-arm copy-paste surface; the conceptual map of how these pieces relate lives in `references/pipeline-map.md`.

These skeletons are distilled from LIVE source (the reference op is
`mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/`; the reference
stage is `.../recipes/standard/stages/map-morphology/`). They are not invented —
re-derive any detail from those files if a skeleton looks stale. **Recipe-domain
authoring lands in `mods/mod-swooper-maps/src/{domain,recipes}` — never in
`packages/mapgen-core`** (that is engine substrate). See `references/pipeline-map.md`
for the truth-vs-projection stage split and the vocabulary.

## Two import surfaces (do not mix them)

| Import path | What it gives | Used in |
|---|---|---|
| `@swooper/mapgen-core/authoring/contracts` | `defineOp`, `defineStep`, `defineArtifact`, `defineDomain`, `Type`, `TypedArraySchemas`, `OpTypeBagOf` — pure schema/type declarations, NO implementation | every `contract.ts`, `artifacts.ts`, domain `index.ts` |
| `@swooper/mapgen-core/authoring` | `createOp`, `createStrategy`, `createStep`, `createStage`, `createRecipe`, `createDomain`, `implementArtifacts`, `collectCompileOps` — attach implementations | every runtime `index.ts`, strategy file, stage/recipe file |

`@mapgen/domain/*` → `src/domain/*` (tsconfig path alias). Step **contracts** import the
domain contract via `@mapgen/domain/<domain>` (the `defineDomain` index). `recipe.ts`
imports the domain **runtime** via `@mapgen/domain/<domain>/ops` (the `createDomain` module).
ESM relative imports use the `.js` extension even though the files are `.ts`.

---

## (1) New op (full triple + registration)

An op lives in `src/domain/<domain>/ops/<op-name>/` as a 5-file unit. Op id is
`<domain>/<op-name>` kebab-case (e.g. `morphology/compute-landmask`) — **never omit
the domain prefix**.

**`contract.ts`** — `defineOp`; the `strategies` record keys become the allowed strategy
ids; `default` is mandatory (`defineOp` throws at module load if missing).
```ts
// src/domain/<domain>/ops/<op-name>/contract.ts
import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

export const MyOpConfigSchema = Type.Object(
  { myParam: Type.Number({ default: 0.5, minimum: 0, maximum: 1, description: "..." }) },
  { additionalProperties: false, description: "..." },
);

const MyOpContract = defineOp({
  kind: "compute",              // "compute" | "plan" | "place" | "score" | ...
  id: "<domain>/my-op-name",    // kebab-case, domain-prefixed
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    myInput: TypedArraySchemas.u8({ description: "..." }),
  }),
  output: Type.Object({ myOutput: TypedArraySchemas.u8({ description: "..." }) }),
  strategies: { default: MyOpConfigSchema }, // REQUIRED key
});

export default MyOpContract;
```

**`types.ts`** — typed input/output/envelope helpers.
```ts
// src/domain/<domain>/ops/<op-name>/types.ts
import type { OpTypeBagOf } from "@swooper/mapgen-core/authoring/contracts";
type Contract = typeof import("./contract.js").default;
export type MyOpTypes = OpTypeBagOf<Contract>;
```

**`strategies/default.ts`** — `createStrategy` infers `config` type from `(contract, "default")`.
```ts
// src/domain/<domain>/ops/<op-name>/strategies/default.ts
import { createStrategy } from "@swooper/mapgen-core/authoring";
import MyOpContract from "../contract.js";

export const defaultStrategy = createStrategy(MyOpContract, "default", {
  // optional: normalize: (config, ctx) => config,
  run: (input, config) => {
    const { width, height } = input;
    const myOutput = new Uint8Array(width * height);
    // ... use config.myParam, input.myInput
    return { myOutput };
  },
});
```

**`strategies/index.ts`** — re-export.
```ts
export { defaultStrategy } from "./default.js";
```

**`index.ts`** — `createOp` binds every contract strategy key to an implementation;
it throws at construction if a key is missing OR extra (symmetry enforced).
```ts
// src/domain/<domain>/ops/<op-name>/index.ts
import { createOp } from "@swooper/mapgen-core/authoring";
import MyOpContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const myOp = createOp(MyOpContract, { strategies: { default: defaultStrategy } });

export type * from "./contract.js";
export type * from "./types.js";
export default myOp;
```

**Registration — `ops/contracts.ts` AND `ops/index.ts` (both, in sync):**
```ts
// src/domain/<domain>/ops/contracts.ts — add to the contracts record:
import MyOpContract from "./my-op-name/contract.js";
export const contracts = { /* ...existing..., */ myOpName: MyOpContract } as const;

// src/domain/<domain>/ops/index.ts — add to the implementations record:
import myOpName from "./my-op-name/index.js";
const implementations = { /* ...existing..., */ myOpName } as const
  satisfies DomainOpImplementationsForContracts<typeof contracts>;
```
> The `satisfies DomainOpImplementationsForContracts<typeof contracts>` line is the
> compile-time guard that forces `contracts.ts` and `index.ts` to stay symmetric.

The op is now part of the domain. It is not yet *run* by anything — wire it into a step
(section 3) and ensure its domain reaches `compileOpsById` (section 4).

---

## (2) New strategy on an existing op

The op already has a `strategies` record with `default`. A strategy is a behavioral
variant selected at config/compile time — see the multi-strategy ops
`hydrology/compute-precipitation` (default=vector, basic=baseline, refine) and
`ecology/pedology/classify` (default, coastal-shelf, orogeny-boosted) for live examples.

**Step A — schema** in `contract.ts`: add a key to the `strategies` record.
```ts
strategies: {
  default: MyOpConfigSchema,
  "my-variant": MyVariantConfigSchema,   // new strategy id (string literal)
},
```

**Step B — implementation** `strategies/my-variant.ts`: id must match the contract key exactly.
```ts
import { createStrategy } from "@swooper/mapgen-core/authoring";
import MyOpContract from "../contract.js";

export const myVariantStrategy = createStrategy(MyOpContract, "my-variant", {
  run: (input, config) => {
    // config is typed to MyOpContract.strategies["my-variant"]
    return { myOutput: new Uint8Array(input.width * input.height) };
  },
});
```

**Step C — re-export** in `strategies/index.ts`:
```ts
export { myVariantStrategy } from "./my-variant.js";
```

**Step D — register** in `index.ts` `createOp`:
```ts
const myOp = createOp(MyOpContract, {
  strategies: { default: defaultStrategy, "my-variant": myVariantStrategy },
});
```

**Step E — ACTIVATE (the strategy is inert until selected).** The op envelope is
`{ strategy: "<id>", config: {...} }` (a TypeBox discriminated union on `strategy`).
There are exactly three selection paths:

1. **Stage `compile()` literal** (public stages) — synthesize the envelope:
   ```ts
   compile: ({ config }) => ({
     "my-step-name": { myOp: { strategy: "my-variant", config: config.myControl ?? {} } },
   }),
   ```
2. **`defaultStrategy` on the step contract `StepOpUse`** — changes the *schema default*
   so an omitted envelope starts on the named strategy (the author can still override):
   ```ts
   ops: { myOp: { contract: someDomain.ops.myOpName, defaultStrategy: "my-variant" } },
   ```
3. **Authored envelope in map/step config** (internal, non-`public` stages only):
   ```ts
   { myOp: { strategy: "my-variant", config: { /* variant-specific props */ } } }
   ```

Runtime dispatch (`createOp.run`) reads `cfg.strategy`, looks up
`runtimeStrategies[cfg.strategy]`, and throws on an unknown id.

> Gotchas: the `default` key name is what matters at runtime, **not** the file name —
> e.g. `compute-precipitation/strategies/vector.ts` exports `defaultStrategy`. For a
> stage with `public:`, the public config JSON never carries a `strategy` field; the
> `compile()` function injects it. Only internal stages accept a `strategy` field
> directly in authored config.

---

## (3) New step (contract + implementation)

A step lives under `src/recipes/standard/stages/<stage-id>/steps/<step-name>/`. Step id
is kebab-case (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`). The reference no-ops step is
`map-morphology/steps/plotContinents`; the reference with-ops step is
`morphology-features/steps/landmasses`.

**`contract.ts`** — `defineStep`. Import the domain *contract* via `@mapgen/domain/<domain>`.
```ts
// steps/<step-name>/contract.ts
import someDomain from "@mapgen/domain/<domain>";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { myStageArtifacts } from "../../artifacts.js";
import { otherArtifacts } from "../../../<other-stage>/artifacts.js";

const MyStepContract = defineStep({
  id: "my-step-name",
  phase: "morphology",          // GenerationPhase: morphology | hydrology | ecology | placement | ...
  requires: ["effect:some.required.tag"],
  provides: ["effect:some.provided.tag"],
  artifacts: {
    requires: [otherArtifacts.someInput],
    provides: [myStageArtifacts.myArtifact],
  },
  ops: {
    myOp: someDomain.ops.myOpName,
    // or: myOp: { contract: someDomain.ops.myOpName, defaultStrategy: "my-variant" }
  },
  schema: Type.Object({ /* step-level knobs not covered by ops; omit/empty if none */ }),
});

export default MyStepContract;
```

**`index.ts`** — `createStep`. `run(context, config, ops, deps)`; `config.<opKey>` is the
auto-typed op envelope; artifacts are read/published via `deps.artifacts.<name>`.
```ts
// steps/<step-name>/index.ts
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { myStageArtifacts } from "../../artifacts.js";
import MyStepContract from "./contract.js";

export default createStep(MyStepContract, {
  // Required ONLY if this step provides artifacts:
  artifacts: implementArtifacts(MyStepContract.artifacts!.provides!, {
    myArtifact: { /* optional validate: (value, ctx) => [], satisfies: (ctx) => true */ },
  }),
  // optional: normalize: (config, ctx) => config,
  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;
    const input = deps.artifacts.someInput.read(context);
    const output = ops.myOp({ width, height, myInput: input.myData }, config.myOp);
    deps.artifacts.myArtifact.publish(context, { width, height, myData: output.myOutput });
  },
});
```

**Registration (two files, same step-id string):**
1. `contract-manifest.ts` — add `MyStepContract` to the stage's contract list in
   `standardStageContractManifest` (position = within-stage execution order).
2. The stage's `index.ts` — add the runtime step to `orderStandardStageSteps(...)`.

> Gotchas: do NOT add `artifact:` ids to the top-level `requires`/`provides` arrays when
> you also use `artifacts: { requires, provides }` — `defineStep` merges artifact ids
> automatically and throws if you double-list. Op keys in `ops:` must NOT collide with
> any key in `schema:` — `defineStep` throws on collision. `orderStandardStageSteps`
> throws if a runtime step id is absent from the manifest for that stage.

---

## (4) New stage (+ recipe registration)

A stage is `createStage({ id, knobsSchema, steps, public?, compile? })`. `knobsSchema`
is mandatory even when empty (`Type.Object({})`). If `public:` is present, `compile:`
MUST also be present (`createStage` throws otherwise). Reference stages:
`map-morphology` (public+compile) and `morphology-features` (knobs+public+compile).

```ts
// src/recipes/standard/stages/<stage-id>/index.ts
import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import myStep from "./steps/<step-name>/index.js";

const knobsSchema = Type.Object({}, { additionalProperties: false, description: "Knobs for <stage-id>." });

// Include public + compile ONLY if the stage exposes a semantic surface;
// omit both for an internal-step-config stage (each step schema is exposed directly).
const publicSchema = Type.Object(
  { myControl: Type.Optional(Type.Number({ default: 1, description: "..." })) },
  { additionalProperties: false, description: "Public config for <stage-id>." },
);

export default createStage({
  id: "my-stage-id",                 // must be registered in contract-manifest.ts
  knobsSchema,
  public: publicSchema,
  steps: orderStandardStageSteps("my-stage-id", { "my-step-name": myStep }),
  compile: ({ config }: { config: Record<string, unknown> }) => ({
    // one key per step id; synthesize each step's op envelopes here
    "my-step-name": { myOp: { strategy: "default", config: config.myControl ?? {} } },
  }),
} as const);
```

**Recipe registration (3 touch points):**
```ts
// 1. contract-manifest.ts — import step contracts; add the stage entry at the
//    pipeline position you want (array order = stage execution order):
import MyStepContract from "./stages/my-stage-id/steps/my-step-name/contract.js";
stage("my-stage-id", [MyStepContract /* , ...in execution order */ ]),

// 2. recipe.ts — import the stage and add it to orderStandardStages({...}).
//    Key order here is irrelevant; the manifest reorders deterministically:
import myStage from "./stages/my-stage-id/index.js";
const stages = orderStandardStages({ /* ...existing..., */ "my-stage-id": myStage } as const);

// 3. recipe.ts — if the stage introduces a NEW domain, add it to collectCompileOps
//    (pass the domain RUNTIME from @mapgen/domain/<domain>/ops, not the contract):
import myDomain from "@mapgen/domain/<my-domain>/ops";
export const compileOpsById = collectCompileOps(foundationDomain, morphologyDomain, myDomain);
```

> Decide truth vs projection before authoring: TRUTH stages (foundation..ecology-biomes)
> compute and publish `artifact:<domain>.*`; PROJECTION stages (`map-*` + placement) only
> project truth artifacts onto engine terrain via the adapter. The canonical 17-stage
> order is owned by `standardStageContractManifest` in `contract-manifest.ts` — read it,
> do not trust a snapshot. See `references/pipeline-map.md`.

---

## (5) New artifact (defineArtifact + publish/read)

Artifacts are the typed data-flow contract between steps/stages. Declare them in a
stage's `artifacts.ts`. Id MUST start with `artifact:` and MUST NOT carry a `@vN` suffix
(`defineArtifact` throws on both). `name` is camelCase (`/^[a-z][a-zA-Z0-9]*$/`) and must
match its key in the record. Reference: `map-morphology/artifacts.ts`.

```ts
// src/recipes/standard/stages/<stage-id>/artifacts.ts
import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const MyArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    myData: TypedArraySchemas.u8({ description: "..." }),
  },
  { additionalProperties: false, description: "..." },
);

export const myStageArtifacts = {
  myArtifact: defineArtifact({
    name: "myArtifact",                          // camelCase; must match the key
    id: "artifact:<stage>.<scope>.myArtifact",   // no @vN suffix; map-level uses artifact:map.<name>
    schema: MyArtifactSchema,
  }),
} as const;
```

**Wire it through a step (write-once publish, read by consumers):**
```ts
// producing step contract: artifacts: { provides: [myStageArtifacts.myArtifact] }
//   + index.ts: implementArtifacts(MyStepContract.artifacts!.provides!, { myArtifact: {} })
deps.artifacts.myArtifact.publish(context, { width, height, myData });

// consuming step contract: artifacts: { requires: [myStageArtifacts.myArtifact] }
const value = deps.artifacts.myArtifact.read(context);
```

> Id namespaces seen in live source: `artifact:<domain>.<name>` (e.g.
> `artifact:morphology.topography`, `artifact:ecology.biomeClassification`) for truth
> artifacts, and `artifact:map.<name>` (e.g. `artifact:map.morphology.coastClassification`)
> for map-level/projection artifacts. There are also `field:<name>` and `effect:<name>`
> tags — `effect:*` tags express ordering dependencies in `requires`/`provides`, distinct
> from `artifact:*` data. Publish is write-once: a second publish of the same artifact in
> one run is an error.

---

## Where the type-checker catches you (registration symmetry)

| Forget to... | Failure surface |
|---|---|
| add op contract to `ops/contracts.ts` | `satisfies DomainOpImplementationsForContracts` mismatch in `ops/index.ts` |
| bind a strategy in `createOp` | construction throws: strategy key present in contract, missing impl |
| add step to `standardStageContractManifest` | `orderStandardStageSteps` throws (unknown step id) |
| add stage to `recipe.ts` `orderStandardStages` | stage silently absent from the pipeline (no error) — verify the run |
| pass a new domain to `collectCompileOps` | compile-time op resolution fails for that domain's ops |
| keep `default` strategy key | `defineOp`/`buildOpEnvelopeSchema` throws at module load |

After authoring, the technical arm is only half done: a recipe that *compiles* is not a
recipe that produces good maps. Hand the change to the behavioral arm and the in-game
verification gate — see `references/facet-verification.md`,
`assets/earthlike-expectation-ledger.md`, and `assets/live-verification-runbook.md`. The
closure test is the live engine, not a passing build.
