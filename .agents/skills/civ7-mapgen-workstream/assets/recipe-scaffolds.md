# Recipe Scaffolds — copy-paste templates for the technical arm

> Open when you are about to *author* a new op, strategy, step, stage, or artifact in the recipe — and want a minimal-correct skeleton plus the exact registration points so the recipe still compiles and runs. This is the technical-arm copy-paste surface; the conceptual map of how these pieces relate lives in `references/pipeline-map.md`.

These skeletons are distilled from LIVE source (the reference op is
`mods/mod-swooper-maps/src/domain/foundation/modules/mesh/ops/compute-mesh/`; the
reference stage is `.../recipes/standard/stages/morphology/projection/`). They are not invented —
re-derive any detail from those files if a skeleton looks stale. **Recipe-domain
authoring lands in `mods/mod-swooper-maps/src/{domain,recipes}` — never in
`packages/mapgen-core`** (that is engine substrate). See `references/pipeline-map.md`
for the truth-vs-projection stage split and the vocabulary.

## Authoring import surfaces (do not mix them)

| Import path | What it gives | Used in |
|---|---|---|
| `@swooper/mapgen-core/authoring/schema` | `Type`, `TypedArraySchemas` — schema construction without runtime authoring dependencies | schema declarations in domain models, ops, steps, and artifacts |
| `@swooper/mapgen-core/authoring/contracts` | `defineOp`, `defineStrategy`, `defineStep`, `defineArtifact`, `defineArtifactCatalog`, `defineDomain`, `defineDomainSubdomain` — contracts, strategy definitions, artifact admission, and aggregate assembly | op and domain-module `contract.ts`, domain `contract.ts`, strategy and recipe-step `config.ts`, `*.artifact.ts`, artifact catalogs |
| `@swooper/mapgen-core/authoring` | `createOp`, `createStrategy`, `createStep`, `createStage`, `createRecipe`, `createDomainSubdomainRouter`, `createDomainRouter`, `collectOperations` — attach executable implementations and compose canonical operation routers | operation implementation `index.ts`, module and domain `router.ts`, recipe-step `step.ts`, strategy, stage, and recipe files |

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
the operation `contract.ts` and implementation `index.ts`, the executable tuple at
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
operation contract + leaf definition pair around the implementation.
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

**`index.ts`** — `createOp` checks the definition and executable tuples for exact semantic
and identity symmetry at construction.
```ts
// src/domain/<domain>/modules/<module>/ops/<op-name>/index.ts
import { createOp } from "@swooper/mapgen-core/authoring";
import MyOpContract from "./contract.js";
import strategies from "./strategies/index.js";

export default createOp(MyOpContract, { strategies });
```

**Module composition — add the operation directly to the owning module's
declarative contract and executable router:**
```ts
// src/domain/<domain>/modules/<module>/contract.ts
import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import MyOpContract from "./ops/my-op-name/contract.js";

const moduleContract = defineDomainSubdomain({
  id: "<module>",
  ops: { /* ...existing..., */ myOpName: MyOpContract },
});

export default moduleContract;

// src/domain/<domain>/modules/<module>/router.ts
import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import myOpName from "./ops/my-op-name/index.js";

const moduleRouter = createDomainSubdomainRouter(contract, {
  /* ...existing..., */
  myOpName,
});

export default moduleRouter;
```
> `createDomainSubdomainRouter` checks exact operation keys and canonical
> contract identity. Do not add `ops/contract.ts` or `ops/index.ts`
> intermediates; the module contract and router are already the two rightful
> aggregate authorities.

The op is now part of its direct semantic module. It is not yet *run* by anything —
wire it into a step (section 3) and ensure the module's executable router reaches the
domain router collected into the recipe's `operations` registry (section 4).

---

## (2) New strategy on an existing op

The op contract already composes at least one semantic leaf definition. A strategy is a
behavioral variant selected at config/compile time — see the multi-strategy op ids
`hydrology/compute-precipitation` (`vector` default, `baseline`) and
`ecology/pedology/classify` for live examples.

Every strategy must satisfy the operation's exact shared input/output transition. If the
candidate needs materially different inputs, produces a different output vintage, or represents
a later semantic transition, define another operation instead. For example,
`hydrology/refine-precipitation` consumes admitted baseline rainfall plus river evidence; it is
not another `compute-precipitation` strategy.

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

**Step D — extend the executable tuple** in `strategies/index.ts`:
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
There are exactly two authoring paths:

1. **Authored operation envelope** (ordinary stages) - select the strategy
   directly in the step config:
   ```ts
   { myOp: { strategy: "my-variant", config: { /* variant-specific props */ } } }
   ```
2. **Rare inline semantic public override** - only when a concrete stage
   intentionally hides and meaningfully translates the complete internal
   surface:
   ```ts
   export default createStage({
     id: "example",
     public: Type.Object({ profile: ProfileSchema }),
     steps,
     compile: ({ config }) => ({
       "my-step-name": resolveProfile(config.profile),
     }),
   });
   ```

Runtime dispatch (`createOp.run`) reads `cfg.strategy`, looks up
`runtimeStrategies[cfg.strategy]`, and throws on an unknown id.

> Gotchas: the operation contract owns its inferred or explicit default; a step selects that
> canonical contract directly and cannot redefine its default. An authored envelope selects an
> alternate strategy. No strategy is renamed to `default`. A full `public` override is not a
> convenience alias for operation config. It stays inline in the stage definition; external
> `public.config.ts` files are forbidden. Shipped map configs and stage knobs provide ordinary
> product-level convenience without hiding operation envelopes.

---

## (3) New step (contract + implementation)

A step lives under `src/recipes/standard/stages/<semantic-stage-path>/steps/<step-name>/`;
use family nesting when the stage belongs to a larger semantic family. Step id is kebab-case
(`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`). The reference no-ops step is
`morphology/projection/steps/plot-continents`; the reference with-ops step is
`morphology/features/steps/landmasses`.

**`config.ts`** — `defineStep`. Import the domain contract from its root and
artifacts from the exact producing module catalog.
```ts
// steps/<step-name>/config.ts
import someDomain from "@mapgen/domain/<domain>";
import { artifacts as myModuleArtifacts } from "@mapgen/domain/<domain>/modules/<module>/artifacts/index.js";
import { artifacts as otherModuleArtifacts } from "@mapgen/domain/<other-domain>/modules/<other-module>/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/** Contract and compiled configuration boundary for the example recipe step. */
export const config = defineStep({
  id: "my-step-name",
  requires: [otherModuleArtifacts.someInput],
  provides: [myModuleArtifacts.surfaceMask],
  ops: {
    myOp: someDomain.<module>.ops.myOpName,
  },
});
```

Add `schema: Type.Object({ ... })` only when the step owns genuine local
configuration beyond its operation envelopes; omit the property otherwise.

Add a completion to those same arrays only when a downstream step must observe
invisible mutable engine state produced by the completed transaction. Import an
owned typed `CompletionId` constant; never author a raw `completion:*` string.
Do not add a completion for ordinary ordering, trace events, or a provider that
an exact artifact dependency already selects.

**`step.ts`** — `createStep`. `run(context, config, ops, deps)`; `config.<opKey>` is the
auto-typed op envelope; artifacts are read/published via `deps.artifacts.<name>`.
```ts
// steps/<step-name>/step.ts
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

/** Executes the example step against its declared operations and artifacts. */
export const MyStep = createStep(config, {
  // optional: normalize: (stepConfig, ctx) => stepConfig,
  run: (context, stepConfig, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const input = deps.artifacts.someInput.read();
    const output = ops.myOp({ width, height, myInput: input.myData }, stepConfig.myOp);
    deps.artifacts.surfaceMask.publish({ width, height, landMask: output.myOutput });
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
1. `contract-manifest.ts` — import the leaf's `config` with a composition-local
   alias and add it to the stage's contract list in `standardStageContractManifest`
   (position = within-stage execution order).
2. The stage's `index.ts` — add the runtime step to `orderStandardStageSteps(...)`.

> Gotchas: `requires` and `provides` are the sole dependency lists. Exact artifact
> authorities retain identity, schema, admission, and typed `deps.artifacts`
> capabilities; typed completion constants express engine-transaction ordering. `createStep` binds behavior
> only; Core derives exact occurrence-bound `read()` and `publish(value)` capabilities directly
> from the step contract at invocation. Do not replace an artifact authority with
> its raw `artifact:` id. Op keys in `ops:` must NOT
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
// 1. contract-manifest.ts — alias owner-local `config` bindings at composition;
//    add the stage entry at the pipeline position you want:
import { config as myStepConfig } from "./stages/my-family/my-stage/steps/my-step-name/config.js";
stage("my-stage-id", [myStepConfig /* , ...in execution order */ ]),

// 2. recipe.ts — import the stage and add it to orderStandardStages({...}).
//    Key order here is irrelevant; the manifest reorders deterministically:
import myStage from "./stages/my-family/my-stage/index.js";
const stages = orderStandardStages({ /* ...existing..., */ "my-stage-id": myStage } as const);

// 3. recipe.ts — if the stage introduces a NEW domain, add its executable router to collectOperations:
import myDomain from "@mapgen/domain/<my-domain>/router";
import { collectOperations, createRecipe } from "@swooper/mapgen-core/authoring";

const operations = collectOperations(foundationDomain, morphologyDomain, myDomain);

const recipe = createRecipe({
  /* ...existing authorship..., */
  operations,
});
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
(`/^[a-z][a-zA-Z0-9]*$/`). Its catalog key must be that exact name, giving contracts
and step dependencies one property identity. The `artifact:` id remains the globally
unique semantic identity used by the pipeline.

**`modules/<module>/artifacts/surface-mask.artifact.ts` — the single complete
artifact authority:**
```ts
import {
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/** Registers the write-once surface classification consumed by downstream map stages. */
export const artifact = defineArtifact({
  name: "surfaceMask",
  id: "artifact:<domain>.surfaceMask",
  schema: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map width represented by the mask." }),
      height: Type.Integer({ minimum: 1, description: "Map height represented by the mask." }),
      landMask: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "One byte per tile in row-major order: 1 for land and 0 for water.",
      }),
    },
    {
      additionalProperties: false,
      description: "Authoritative land/water classification for one complete map surface.",
    }
  ),
  refine: (value, { dimensions, cellCount, issues }) => {
    if (value.width !== dimensions.width || value.height !== dimensions.height) {
      issues.add("surfaceMask dimensions must match the admitted map.");
    }
    for (let index = 0; index < cellCount; index += 1) {
      const cell = value.landMask[index];
      if (cell !== 0 && cell !== 1) {
        issues.add(`surfaceMask.landMask[${index}] must be 0 (water) or 1 (land).`);
      }
    }
    return undefined;
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

// producing step contract: provides: [myModuleArtifacts.surfaceMask]
deps.artifacts.surfaceMask.publish({ width, height, landMask });

// consuming step contract: requires: [myModuleArtifacts.surfaceMask]
const value = deps.artifacts.surfaceMask.read();
```

`defineArtifact` always performs structural schema admission first and invokes
the optional inline `refine` only after structure and typed-array metadata admission
succeed. Refinement owns cross-field relations and domain laws the schema cannot
express; a schema-complete artifact omits it. Its inferred facilities expose admitted
`dimensions`, derived `cellCount`, and the Core-owned `issues` sink. Use
`issues.add(...)` for semantic findings and `issues.addGridCoordinates(...)` for generic
coordinate bounds/duplication checks; do not import validation framework types or allocate
an issue array. Put exact artifact authorities directly in the step's `requires`
and `provides` arrays; `defineStep` snapshots them. At each invocation,
Core derives frozen `read()` and `publish(value)` capabilities directly from that contract;
there is no authored provider runtime, map, or cache.

> Artifact ids use `artifact:<domain>.<name>` (for example,
> `artifact:morphology.topography`), but authored step dependencies use the exact
> `Artifact` value rather than that raw string. Typed `CompletionId` constants
> express payload-free external-state transaction edges in the same `requires`/`provides`
> lists. Those are the only two dependency kinds. Publish is write-once: a second publish
> of the same artifact in one run is an error.

---

## Where the type-checker catches you (registration symmetry)

| Forget to... | Failure surface |
|---|---|
| add an op contract or implementation to the module `contract.ts` / `router.ts` | `createDomainSubdomainRouter` exact-key or canonical-contract mismatch |
| add executable strategy to `strategies/index.ts` | `createOp` construction throws: contract definition has no matching executable strategy |
| add step to `standardStageContractManifest` | `orderStandardStageSteps` throws (unknown step id) |
| add stage to `recipe.ts` `orderStandardStages` | stage silently absent from the pipeline (no error) — verify the run |
| pass a new domain to `collectOperations` | recipe construction or compilation cannot resolve that domain's operations |
| keep `default` strategy key | `defineOp`/`buildOpEnvelopeSchema` throws at module load |

After authoring, the technical arm is only half done: a recipe that *compiles* is not a
recipe that produces good maps. Hand the change to the behavioral arm and the in-game
verification gate — see `references/facet-verification.md`,
`assets/earthlike-expectation-ledger.md`, and `assets/live-verification-runbook.md`. The
closure test is the live engine, not a passing build.
