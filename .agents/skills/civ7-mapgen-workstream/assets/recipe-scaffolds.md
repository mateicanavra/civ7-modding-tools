# Recipe Scaffolds — copy-paste templates for the technical arm

> Open when you are about to *author* a new op, strategy, step, stage, or artifact in the recipe — and want a minimal-correct skeleton plus the exact registration points so the recipe still compiles and runs. This is the technical-arm copy-paste surface; the conceptual map of how these pieces relate lives in `references/pipeline-map.md`.

These skeletons are distilled from LIVE source (the reference op is
`mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/`; the reference
stage is `.../recipes/standard/stages/map/morphology/`). They are not invented —
re-derive any detail from those files if a skeleton looks stale. **Recipe-domain
authoring lands in `mods/mod-swooper-maps/src/{domain,recipes}` — never in
`packages/mapgen-core`** (that is engine substrate). See `references/pipeline-map.md`
for the truth-vs-projection stage split and the vocabulary.

## Authoring import surfaces (do not mix them)

| Import path | What it gives | Used in |
|---|---|---|
| `@swooper/mapgen-core/authoring/schema` | `Type`, `TypedArraySchemas` — schema construction without runtime authoring dependencies | schema declarations in domain models, ops, steps, and artifacts |
| `@swooper/mapgen-core/authoring/contracts` | `defineOp`, `defineStep`, `defineArtifact`, `defineArtifactValidator`, `defineArtifactCatalog`, `defineDomain`, `OpTypeBagOf` — contracts, artifact admission, types, and catalog assembly | op `contract.ts`, recipe-step `config.ts`, `*.artifact.ts`, artifact catalogs, domain contract `index.ts` |
| `@swooper/mapgen-core/authoring` | `createOp`, `createStrategy`, `createStep`, `createStage`, `createRecipe`, `createDomain`, `collectCompileOps` — attach runtime implementations | op runtime `index.ts`, recipe-step `step.ts`, strategy files, stage/recipe files |

`@mapgen/domain/*` is a transitional tsconfig alias over the existing domain
roots. Until the package-surface migration removes it, use only the already
admitted root and `/ops` forms shown by live source; do not add alias mappings or
new deep-import surfaces. Step contracts currently import the `defineDomain`
root and `recipe.ts` currently imports the `createDomain` `/ops` root. Slice 7
of the package-ownership migration replaces this compatibility graph with real
owner surfaces. ESM relative imports use the `.js` extension even though the
files are `.ts`.

---

## (1) New op (full triple + registration)

An op lives in `src/domain/<domain>/ops/<op-name>/` as a 5-file unit. Op id is
`<domain>/<op-name>` kebab-case (e.g. `morphology/compute-landmask`) — **never omit
the domain prefix**.

**`contract.ts`** — `defineOp`; the `strategies` record keys become the allowed semantic
strategy ids. A sole strategy is inferred as the default. A multi-strategy operation must
declare `defaultStrategy` explicitly; object order never carries authority. The generic id
`default` is refused because it erases behavioral identity.
```ts
// src/domain/<domain>/ops/<op-name>/contract.ts
import { defineOp } from "@swooper/mapgen-core/authoring/contracts";
import { Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

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
  strategies: { "measured-response": MyOpConfigSchema },
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

**`strategies/measured-response.ts`** — the filename, export, and strategy id preserve the
behavioral identity; `createStrategy` infers `config` from the contract key.
```ts
// src/domain/<domain>/ops/<op-name>/strategies/measured-response.ts
import { createStrategy } from "@swooper/mapgen-core/authoring";
import MyOpContract from "../contract.js";

export const measuredResponseStrategy = createStrategy(MyOpContract, "measured-response", {
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
export { measuredResponseStrategy } from "./measured-response.js";
```

**`index.ts`** — `createOp` binds every contract strategy key to an implementation;
it throws at construction if a key is missing OR extra (symmetry enforced).
```ts
// src/domain/<domain>/ops/<op-name>/index.ts
import { createOp } from "@swooper/mapgen-core/authoring";
import MyOpContract from "./contract.js";
import { measuredResponseStrategy } from "./strategies/index.js";

const myOp = createOp(MyOpContract, {
  strategies: { "measured-response": measuredResponseStrategy },
});

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

The op already has a `strategies` record with at least one semantic identity. A strategy is a behavioral
variant selected at config/compile time — see the multi-strategy ops
`hydrology/compute-precipitation` (`vector` default, `baseline`, `refine`) and
`ecology/pedology/classify` for live examples.

**Step A — schema** in `contract.ts`: add a key to the `strategies` record.
```ts
strategies: {
  "measured-response": MyOpConfigSchema,
  "my-variant": MyVariantConfigSchema,   // new strategy id (string literal)
},
defaultStrategy: "measured-response",
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
  strategies: {
    "measured-response": measuredResponseStrategy,
    "my-variant": myVariantStrategy,
  },
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

**`config.ts`** — `defineStep`. Existing code temporarily imports the domain
contract through the admitted `@mapgen/domain/<domain>` root; do not extend that
alias or deep-import through it.
```ts
// steps/<step-name>/config.ts
import someDomain from "@mapgen/domain/<domain>";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { Type } from "@swooper/mapgen-core/authoring/schema";

import { artifactModules as myDomainArtifactModules } from "@mapgen/domain/<domain>";
import { artifacts as otherDomainArtifacts } from "@mapgen/domain/<other-domain>";

/** Contract and compiled configuration boundary for the example recipe step. */
export const MyStepContract = defineStep({
  id: "my-step-name",
  requires: [] as const,
  provides: [] as const,
  artifacts: {
    requires: [otherDomainArtifacts.someInput],
    provides: [myDomainArtifactModules.surfaceMask],
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

// 3. recipe.ts — if the stage introduces a NEW domain, add it to collectCompileOps
//    (pass the domain RUNTIME from @mapgen/domain/<domain>/ops, not the contract):
import myDomain from "@mapgen/domain/<my-domain>/ops";
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

## (5) New artifact (module + catalog + publish/read)

Artifacts are typed, write-once causal products shared between steps. Every immutable product
lives in its owning domain's `artifacts/` catalog, not under a recipe stage. Each artifact module
exports exactly one contract and one validator bound to that contract. The sibling
`domain/<domain>/artifacts/index.ts` builds the single catalog authority and derives both
`artifactModules` (runtime producers) and `artifacts` (step contracts/consumers) from it.
Engine observation and metrics, visualization, and trace evidence remain their respective
capabilities; do not preserve them as causal artifacts.

An id MUST start with `artifact:` and MUST NOT carry a `@vN` suffix (`defineArtifact` throws on
both). The runtime `name` is camelCase (`/^[a-z][a-zA-Z0-9]*$/`). Catalog keys are
consumer-facing lookup names and may differ from runtime artifact names. Reference:
`domain/morphology/artifacts/`.

**`artifacts/surface-mask.artifact.ts` — contract and complete admission validator:**
```ts
import type {
  ArtifactValidationContext,
  ArtifactValidationIssue,
} from "@swooper/mapgen-core/authoring/contracts";
import {
  defineArtifact,
  defineArtifactValidator,
} from "@swooper/mapgen-core/authoring/contracts";
import {
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/schema";

export const Schema = Type.Object(
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
  },
);

/** Registers the write-once surface classification consumed by downstream map stages. */
export const artifact = defineArtifact({
  name: "surfaceMask",
  id: "artifact:<domain>.surfaceMask",
  schema: Schema,
});

/**
 * Validates map-dimension agreement, one mask cell per tile, and the binary land/water value
 * domain after Core admits the closed TypeBox schema.
 */
function validateLocal(
  value: unknown,
  context?: ArtifactValidationContext,
): readonly ArtifactValidationIssue[] {
  const { width, height, landMask } = value as Static<typeof Schema>;

  const issues: ArtifactValidationIssue[] = [];
  const expectedSize = width * height;
  if (landMask.length !== expectedSize) {
    issues.push({ message: `surfaceMask.landMask must contain ${expectedSize} cells.` });
  }
  if (
    context?.dimensions &&
    (width !== context.dimensions.width || height !== context.dimensions.height)
  ) {
    issues.push({ message: "surfaceMask dimensions must match the active map." });
  }
  if (landMask.some((cell) => cell !== 0 && cell !== 1)) {
    issues.push({ message: "surfaceMask.landMask accepts only 0 (water) or 1 (land)." });
  }
  return Object.freeze(issues);
}

/** Admits structurally valid map-sized binary surface classifications. */
export const validate = defineArtifactValidator(artifact, validateLocal);
```

**`artifacts/index.ts` — the only catalog/handle registry:**
```ts
import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as surfaceMask from "./surface-mask.artifact.js";

const catalog = defineArtifactCatalog({ surfaceMask });

/** Domain artifact modules pairing every contract with its complete admission validator. */
export const artifactModules = catalog.modules;

/** Domain artifact handles derived from the same catalog for contracts and consumers. */
export const artifacts = catalog.artifacts;
```

**Wire the same module authority through a step (write-once publish, read by consumers):**
```ts
// producing step contract: artifacts: { provides: [myDomainArtifactModules.surfaceMask] }
deps.artifacts.surfaceMask.publish(context, { width, height, landMask });

// consuming step contract: artifacts: { requires: [myDomainArtifacts.surfaceMask] }
const value = deps.artifacts.surfaceMask.read(context);
```

`defineArtifactValidator` always performs the artifact schema check first and invokes the optional
local validator only after structural admission succeeds. Local validators own relational or
domain invariants only; they never repeat TypeBox validation. `defineStep` admits and snapshots
the selected modules; `createStep` derives producer runtimes from that contract while binding
behavior only. The lower-level
`implementArtifactModules` helper is Core runtime/test support, not normal recipe authoring.

> Artifact ids use `artifact:<domain>.<name>` (for example,
> `artifact:morphology.topography`). `effect:<name>` tags express execution guarantees in
> `requires`/`provides`, distinct from `artifact:*` data. Those are the only two dependency
> kinds. Publish is write-once: a second publish of the same artifact in one run is an error.

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
