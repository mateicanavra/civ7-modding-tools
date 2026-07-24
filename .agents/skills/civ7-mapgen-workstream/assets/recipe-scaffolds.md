# Recipe Scaffolds — copy-paste templates for the technical arm

> Open when you are about to *author* a new op, strategy, step, stage, or artifact in the recipe — and want a minimal-correct skeleton plus the exact registration points so the recipe still compiles and runs. This is the technical-arm copy-paste surface; the conceptual map of how these pieces relate lives in `references/pipeline-map.md`.

These skeletons are distilled from LIVE source (the reference op is
`mods/mod-swooper-maps/src/domain/foundation/modules/mesh/ops/compute-mesh/`; the
reference stage is `.../recipes/standard/stages/map/morphology/`). They are not invented —
re-derive any detail from those files if a skeleton looks stale. **Recipe-domain
authoring lands in `mods/mod-swooper-maps/src/{domain,recipes}` — never in
`packages/mapgen-core`** (that is engine substrate). See `references/pipeline-map.md`
for the truth-vs-projection stage split and the vocabulary.

## Authoring import surfaces (do not mix them)

| Import path | What it gives | Used in |
|---|---|---|
| `@swooper/mapgen-core/authoring/schema` | `Type`, `TypedArraySchemas` — schema construction without runtime authoring dependencies | schema declarations in domain models, ops, steps, and artifacts |
| `@swooper/mapgen-core/authoring/contracts` | `defineOp`, `defineStrategy`, `defineStep`, `defineArtifact`, `defineArtifactCatalog`, `defineDomain`, `defineDomainSubdomain` — contracts, strategy definitions, artifact admission, and aggregate assembly | op and domain-module `contract.ts`, domain `contract.ts`, strategy and recipe-step `config.ts`, `*.artifact.ts`, artifact catalogs |
| `@swooper/mapgen-core/authoring` | `createOp`, `createStrategy`, `createStep`, `createStage`, `createRecipe`, `createDomainSubdomainRouter`, `createDomainRouter`, `collectCompileOps` — attach runtime implementations and compose executable routers | op runtime `index.ts`, module and domain `router.ts`, recipe-step `step.ts`, strategy, stage, and recipe files |

`@mapgen/domain/<domain>` is the contract-only domain root. Recipe wiring imports
the executable domain from `@mapgen/domain/<domain>/router`. Artifacts and model
atoms are direct owner surfaces: import an artifact catalog from the exact
`@mapgen/domain/<domain>/modules/<module>/artifacts/index.js` path and a model
atom from its exact module `model/atoms/<atom>.schema.js` path. Do not add a root
`/ops` runtime, aggregate artifact re-export, or alternate compatibility surface.
ESM relative and exact-owner imports use the `.js` extension even though source
files are `.ts`.

---

## (1) New op (shared contract + strategy leaf + registration)

An op lives in
`src/domain/<domain>/modules/<module>/ops/<op-name>/` as a five-file minimum:
the operation `contract.ts` and runtime `index.ts`, the runtime tuple at
`strategies/index.ts`, and one `config.ts` + `index.ts` pair under
`strategies/<semantic-id>/`. Choose the direct semantic module that owns the
operation's policy and outputs; never add a flat domain-wide op cabinet. The
stable op id remains `<domain>/<op-name>` kebab-case (e.g.
`foundation/compute-mesh`) — **never omit the domain prefix**.

The operation contract is the sole owner of shared input and output. Each strategy
leaf owns only its semantic id, authored config, and implementation. Compose leaf
definitions into the operation contract and executable descriptors into the runtime
tuple; do not add an operation-local type-bag file or authored strategy record. These
entrypoints expose default exports only.

A sole strategy is inferred as the default. A multi-strategy operation must declare
`defaultStrategy` explicitly; tuple order never carries default or registration
authority. The generic id `default` is refused because it erases behavioral identity.

**`strategies/measured-response/config.ts`** — `defineStrategy` owns semantic identity
and authored config, but never repeats the operation input or output.
```ts
// src/domain/<domain>/modules/<module>/ops/<op-name>/strategies/measured-response/config.ts
import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

export default defineStrategy({
  id: "measured-response",
  config: Type.Object(
    {
      myParam: Type.Number({
        default: 0.5,
        minimum: 0,
        maximum: 1,
        description: "...",
      }),
    },
    { additionalProperties: false, description: "..." },
  ),
});
```

**`contract.ts`** — `defineOp` owns the shared envelope and admits the exact leaf
definitions implemented by this operation.
```ts
// src/domain/<domain>/modules/<module>/ops/<op-name>/contract.ts
import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import measuredResponseDefinition from "./strategies/measured-response/config.js";

const MyOpContract = defineOp({
  kind: "compute", // "compute" | "plan" | "place" | "score" | ...
  id: "<domain>/my-op-name", // kebab-case, domain-prefixed
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    myInput: TypedArraySchemas.u8({ description: "..." }),
  }),
  output: Type.Object({ myOutput: TypedArraySchemas.u8({ description: "..." }) }),
  strategies: [measuredResponseDefinition],
});

export default MyOpContract;
```

**`strategies/measured-response/index.ts`** — `createStrategy` seals the exact
operation contract + leaf definition pair around the runtime implementation.
```ts
// src/domain/<domain>/modules/<module>/ops/<op-name>/strategies/measured-response/index.ts
import { createStrategy } from "@swooper/mapgen-core/authoring";
import MyOpContract from "../../contract.js";
import StrategyDefinition from "./config.js";

export default createStrategy(MyOpContract, StrategyDefinition, {
  // optional: normalize: (config) => config,
  run: (input, config) => {
    const { width, height } = input;
    const myOutput = new Uint8Array(width * height);
    // ... use config.myParam, input.myInput
    return { myOutput };
  },
});
```

**`strategies/index.ts`** — compose the complete executable strategy tuple.
```ts
import measuredResponse from "./measured-response/index.js";

export default [measuredResponse] as const;
```

**`index.ts`** — `createOp` checks the definition and runtime tuples for exact semantic
and identity symmetry at construction.
```ts
// src/domain/<domain>/modules/<module>/ops/<op-name>/index.ts
import { createOp } from "@swooper/mapgen-core/authoring";
import MyOpContract from "./contract.js";
import strategies from "./strategies/index.js";

export default createOp(MyOpContract, { strategies });
```

**Module registration — the owning module's singular `ops/contract.ts` and
`ops/index.ts` (both, in sync):**
```ts
// src/domain/<domain>/modules/<module>/ops/contract.ts — add to the contract registry:
import MyOpContract from "./my-op-name/contract.js";

const contracts = { /* ...existing..., */ myOpName: MyOpContract } as const;

export default contracts;

// src/domain/<domain>/modules/<module>/ops/index.ts — add to the implementation registry:
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import myOpName from "./my-op-name/index.js";

type Contracts = typeof import("./contract.js").default;

const implementations = { /* ...existing..., */ myOpName } as const
  satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
```
> `DomainOpImplementationsForContracts<Contracts>` is the compile-time guard that
> forces the direct module's singular `ops/contract.ts` registry and runtime
> `ops/index.ts` to stay symmetric.

The op is now part of its direct semantic module. It is not yet *run* by anything —
wire it into a step (section 3) and ensure the module's runtime router reaches the
domain router collected by `compileOpsById` (section 4).

---

## (2) New strategy on an existing op

The op contract already composes at least one semantic leaf definition. A strategy is a
behavioral variant selected at config/compile time — see the multi-strategy op ids
`hydrology/compute-precipitation` (`vector` default, `baseline`, `refine`) and
`ecology/pedology/classify` for live examples.

**Step A — define the leaf** in `strategies/my-variant/config.ts`.
```ts
import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

export default defineStrategy({
  id: "my-variant",
  config: Type.Object(
    { variantStrength: Type.Number({ default: 1, minimum: 0, maximum: 2 }) },
    { additionalProperties: false },
  ),
});
```

**Step B — admit the definition** in the operation `contract.ts`. The operation continues
to own the one shared input/output envelope.
```ts
import measuredResponseDefinition from "./strategies/measured-response/config.js";
import myVariantDefinition from "./strategies/my-variant/config.js";

// Inside defineOp({...}):
defaultStrategy: "measured-response",
strategies: [measuredResponseDefinition, myVariantDefinition],
```

**Step C — implement the leaf** in `strategies/my-variant/index.ts`.
```ts
import { createStrategy } from "@swooper/mapgen-core/authoring";
import MyOpContract from "../../contract.js";
import StrategyDefinition from "./config.js";

export default createStrategy(MyOpContract, StrategyDefinition, {
  run: (input, config) => {
    // config is inferred from the exact StrategyDefinition leaf.
    return { myOutput: new Uint8Array(input.width * input.height) };
  },
});
```

**Step D — extend the runtime tuple** in `strategies/index.ts`:
```ts
import measuredResponse from "./measured-response/index.js";
import myVariant from "./my-variant/index.js";

export default [measuredResponse, myVariant] as const;
```

The operation `index.ts` remains unchanged: its existing
`createOp(MyOpContract, { strategies })` call consumes the complete tuple, while each
sealed descriptor supplies its semantic identity.

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

> Gotchas: `contract.defaultStrategy` is the resolved runtime authority; no strategy is
> renamed to `default`. For a
> stage with `public:`, the public config JSON never carries a `strategy` field; the
> `compile()` function injects it. Only internal stages accept a `strategy` field
> directly in authored config.

---

## (3) New step (contract + implementation)

A step lives under `src/recipes/standard/stages/<semantic-stage-path>/steps/<step-name>/`;
use family nesting when the stage belongs to a larger semantic family. Step id is kebab-case
(`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`). The reference no-ops step is
`map/morphology/steps/plot-continents`; the reference with-ops step is
`morphology/features/steps/landmasses`.

**`config.ts`** — `defineStep`. Import the domain contract from its root and
artifacts from the exact producing module catalog.
```ts
// steps/<step-name>/config.ts
import someDomain from "@mapgen/domain/<domain>";
import { artifacts as myModuleArtifacts } from "@mapgen/domain/<domain>/modules/<module>/artifacts/index.js";
import { artifacts as otherModuleArtifacts } from "@mapgen/domain/<other-domain>/modules/<other-module>/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { Type } from "@swooper/mapgen-core/authoring/schema";

/** Contract and compiled configuration boundary for the example recipe step. */
export const MyStepContract = defineStep({
  id: "my-step-name",
  requires: [] as const,
  provides: [] as const,
  artifacts: {
    requires: [otherModuleArtifacts.someInput],
    provides: [myModuleArtifacts.surfaceMask],
  },
  ops: {
    myOp: someDomain.ops.myOpName,
    // or: myOp: { contract: someDomain.ops.myOpName, defaultStrategy: "my-variant" }
  },
  schema: Type.Object({ /* step-level knobs not covered by ops; omit/empty if none */ }),
});
```

Keep those effect arrays empty unless the step truly needs execution ordering.
When it does, import an existing typed member of
`MAP_PROJECTION_EFFECT_TAGS`, `PLACEMENT_PRODUCT_EFFECT_TAGS`, or
`STANDARD_ENGINE_EFFECT_TAGS` from `../../../../tag-contracts.js`; never author
a raw `effect:*` string. Add a new effect to that registry first when no current
constant expresses the contract.

**`step.ts`** — `createStep`. `run(context, config, ops, deps)`; `config.<opKey>` is the
auto-typed op envelope; artifacts are read/published via `deps.artifacts.<name>`.
```ts
// steps/<step-name>/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { MyStepContract } from "./config.js";

/** Executes the example step against its declared operations and artifacts. */
export const MyStep = createStep(MyStepContract, {
  // optional: normalize: (config, ctx) => config,
  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;
    const input = deps.artifacts.someInput.read(context);
    const output = ops.myOp({ width, height, myInput: input.myData }, config.myOp);
    deps.artifacts.surfaceMask.publish(context, { width, height, landMask: output.myOutput });
  },
});
```

Optional `viz` and `metrics` projectors are siblings of `run` in this same
`createStep` call. They observe the completed return value after artifact
admission; they do not run inside domain logic. Keep one-step projection helpers
in `steps/<step>/viz.ts`; promote helpers shared by multiple owner-stage steps
or external consumers to `stages/<semantic-stage-path>/viz.ts`. Do not create a shared
`steps/viz.ts` hub. The canonical ownership model and migration posture for
legacy direct `context.viz` calls live in
`docs/system/libs/mapgen/reference/VISUALIZATION.md`.

**Registration (two files, same step-id string):**
1. `contract-manifest.ts` — add `MyStepContract` to the stage's contract list in
   `standardStageContractManifest` (position = within-stage execution order).
2. The stage's `index.ts` — add the runtime step to `orderStandardStageSteps(...)`.

> Gotchas: `artifacts.requires` selects artifact contracts, while `artifacts.provides`
> selects artifact modules so the contract and semantic validator have one authoring owner.
> `createStep` binds behavior only and derives publication runtimes from the contract. Do
> NOT add `artifact:` ids to the top-level `requires`/`provides` arrays — `defineStep`
> merges them automatically and throws if you double-list. Op keys in `ops:` must NOT
> collide with any key in `schema:` — `defineStep` throws on collision.
> `orderStandardStageSteps` throws if a runtime step id is absent from the manifest.

---

## (4) New stage (+ recipe registration)

A stage is `createStage({ id, steps, knobsSchema?, public?, compile? })`. Start with only
`id` and `steps`. Add `knobsSchema` only for real stage-wide authoring controls. Add
`public` and `compile` only when the stage intentionally translates a useful public
surface into internal step configuration; `public` without `compile` is refused.

```ts
// src/recipes/standard/stages/<semantic-stage-path>/index.ts
import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { MyStep } from "./steps/<step-name>/step.js";

export default createStage({
  id: "my-stage-id",                 // must be registered in contract-manifest.ts
  steps: orderStandardStageSteps("my-stage-id", { "my-step-name": MyStep }),
} as const);
```

When a real public authoring projection exists, define its semantic schema and
compile it into the exact step config. Do not introduce empty schemas or a
`compile` function whose only result is empty step objects.

**Recipe registration (3 touch points):**
```ts
// 1. contract-manifest.ts — import step contracts; add the stage entry at the
//    pipeline position you want (array order = stage execution order):
import { MyStepContract } from "./stages/my-family/my-stage/steps/my-step-name/config.js";
stage("my-stage-id", [MyStepContract /* , ...in execution order */ ]),

// 2. recipe.ts — import the stage and add it to orderStandardStages({...}).
//    Key order here is irrelevant; the manifest reorders deterministically:
import myStage from "./stages/my-family/my-stage/index.js";
const stages = orderStandardStages({ /* ...existing..., */ "my-stage-id": myStage } as const);

// 3. recipe.ts — if the stage introduces a NEW domain, add its runtime router to collectCompileOps:
import myDomain from "@mapgen/domain/<my-domain>/router";
export const compileOpsById = collectCompileOps(foundationDomain, morphologyDomain, myDomain);
```

> Decide the lane before authoring. Manifest stages 1–15 are adapter-free
> physics/truth (`foundation-*` through `ecology-biomes`, including
> `morphology-shelf`; `foundation-projection` is still physics). `map-*` stages
> are engine-facing projection, `ecology-features` is an adapter-free planner,
> and `placement` mixes product planning with Civ7 materialization. The exact
> 22-stage order is owned by `standardStageContractManifest` in
> `contract-manifest.ts` — read it, do not trust a snapshot. See
> `references/pipeline-map.md`.

---

## (5) New artifact (module owner + direct catalog + publish/read)

Artifacts are typed, write-once causal products shared between steps. Every immutable
product lives with its direct producing semantic module at
`src/domain/<domain>/modules/<module>/artifacts/`, not under a recipe stage or in a
second domain-wide catalog. Each `*.artifact.ts` exports one runtime authority named
`artifact`; that `defineArtifact({ name, id, schema, refine? })` call owns identity,
the complete inline payload schema, and complete admission. Do not export detached
`Schema`, `validate`, contract, module, or handle authorities.

The adjacent module `artifacts/index.ts` exports one direct catalog for producers and
consumers. Current examples are Ecology pedology at
`domain/ecology/modules/pedology/artifacts/` and Foundation plate graph at
`domain/foundation/modules/lithosphere/artifacts/`. The canonical guides are
`docs/system/libs/mapgen/how-to/add-a-new-artifact.md` and
`docs/system/libs/mapgen/reference/ARTIFACTS.md`.

An id MUST start with `artifact:` and MUST NOT carry a `@vN` suffix
(`defineArtifact` throws on both). The runtime `name` is camelCase
(`/^[a-z][a-zA-Z0-9]*$/`). Catalog keys are consumer-facing lookup names and may
differ from runtime artifact names.

**`modules/<module>/artifacts/surface-mask.artifact.ts` — the single complete
artifact authority:**
```ts
import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

type SurfaceMask = Readonly<{
  width: number;
  height: number;
  landMask: Uint8Array;
}>;

/** Registers the write-once surface classification consumed by downstream map stages. */
export const artifact = defineArtifact({
  name: "surfaceMask",
  id: "artifact:<domain>.surfaceMask",
  schema: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map width represented by the mask." }),
      height: Type.Integer({ minimum: 1, description: "Map height represented by the mask." }),
      landMask: TypedArraySchemas.u8({
        description: "One byte per tile in row-major order: 1 for land and 0 for water.",
      }),
    },
    {
      additionalProperties: false,
      description: "Authoritative land/water classification for one complete map surface.",
    }
  ),
  refine: (
    input: unknown,
    context?: ArtifactValidationContext
  ): readonly ArtifactValidationIssue[] => {
    const value = input as SurfaceMask;
    const issues: ArtifactValidationIssue[] = [];
    const expectedSize = value.width * value.height;
    const isMask = appendArtifactTypedArrayIssues(
      issues,
      "surfaceMask.landMask",
      value.landMask,
      Uint8Array,
      expectedSize
    );
    if (
      context?.dimensions &&
      (value.width !== context.dimensions.width || value.height !== context.dimensions.height)
    ) {
      issues.push({ message: "surfaceMask dimensions must match the active map." });
    }
    if (isMask && value.landMask.some((cell) => cell !== 0 && cell !== 1)) {
      issues.push({ message: "surfaceMask.landMask accepts only 0 (water) or 1 (land)." });
    }
    return issues;
  },
});
```

**`modules/<module>/artifacts/index.ts` — the module's only artifact catalog:**
```ts
import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as surfaceMask } from "./surface-mask.artifact.js";

/** Immutable surface evidence owned by this semantic module. */
export const artifacts = defineArtifactCatalog({ surfaceMask });
```

**Wire the same catalog authority through a step (write-once publish, read by
consumers):**
```ts
import { artifacts as myModuleArtifacts } from "@mapgen/domain/<domain>/modules/<module>/artifacts/index.js";

// producing step contract: artifacts: { provides: [myModuleArtifacts.surfaceMask] }
deps.artifacts.surfaceMask.publish(context, { width, height, landMask });

// consuming step contract: artifacts: { requires: [myModuleArtifacts.surfaceMask] }
const value = deps.artifacts.surfaceMask.read(context);
```

`defineArtifact` always performs structural schema admission first and invokes
the optional inline `refine` only after structure succeeds. Refinement owns exact
typed-array constructors, cardinality, cross-field relations, and domain laws the
schema cannot express; a schema-complete artifact omits it. `defineStep` snapshots
the selected artifact authorities, and `createStep` derives the validated
publish/read runtime from that contract while binding behavior only.

> Artifact ids use `artifact:<domain>.<name>` (for example,
> `artifact:morphology.topography`). `effect:<name>` tags express execution guarantees in
> `requires`/`provides`, distinct from `artifact:*` data. Those are the only two dependency
> kinds. Publish is write-once: a second publish of the same artifact in one run is an error.

---

## Where the type-checker catches you (registration symmetry)

| Forget to... | Failure surface |
|---|---|
| add op contract to `modules/<module>/ops/contract.ts` | `satisfies DomainOpImplementationsForContracts` mismatch in the module's `ops/index.ts` |
| add executable strategy to `strategies/index.ts` | `createOp` construction throws: contract definition has no matching runtime descriptor |
| add step to `standardStageContractManifest` | `orderStandardStageSteps` throws (unknown step id) |
| add stage to `recipe.ts` `orderStandardStages` | stage silently absent from the pipeline (no error) — verify the run |
| pass a new domain to `collectCompileOps` | compile-time op resolution fails for that domain's ops |
| keep `default` strategy key | `defineOp`/`buildOpEnvelopeSchema` throws at module load |

After authoring, the technical arm is only half done: a recipe that *compiles* is not a
recipe that produces good maps. Hand the change to the behavioral arm and the in-game
verification gate — see `references/facet-verification.md`,
`assets/earthlike-expectation-ledger.md`, and `assets/live-verification-runbook.md`. The
closure test is the live engine, not a passing build.
