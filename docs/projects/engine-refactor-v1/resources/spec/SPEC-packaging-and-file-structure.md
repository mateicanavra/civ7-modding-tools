# SPEC: Target Architecture (Canonical)

## 2. Target Packaging & File Structure (Core SDK + Standard Content Package)

### 2.0 Notation

- `CORE_SDK_ROOT` — the Core SDK package root (runtime + authoring + validation).
- `STANDARD_CONTENT_ROOT` — the standard content package root (mod-owned content).
- `MOD_CONTENT_ROOT` — a generic mod content package root (any mod).

### 2.1 Package boundaries and import rules

- `CORE_SDK_ROOT` must not import from `MOD_CONTENT_ROOT/**`.
- `STANDARD_CONTENT_ROOT/src/domain/**` is a recipe-independent library:
  - It may be imported by `recipes/**` and `maps/**`.
  - It must not import from `recipes/**` or `maps/**`.
- `STANDARD_CONTENT_ROOT/src/recipes/**` owns content wiring:
  - It may import from `domain/**` and `@swooper/mapgen-core/*`.
  - It must not import from `maps/**`.
- `STANDARD_CONTENT_ROOT/src/maps/**` owns map/preset entrypoints and Civ7 runner glue:
  - Maps may import recipes and domain libs.

Path aliasing:
- Use stable aliases for cross-module imports:
  - `@mapgen/domain/*` → `STANDARD_CONTENT_ROOT/src/domain/*`
- Authoring imports use `@swooper/mapgen-core/authoring` (no content-local authoring alias).
- Keep relative imports inside a single op or step directory.

### 2.2 Core SDK (`CORE_SDK_ROOT`) target layout (collapsed)

```text
CORE_SDK_ROOT/
├─ src/
│  ├─ engine/                        # orchestration runtime (compile + execute + registries)
│  ├─ core/                          # engine-owned context + platform contracts
│  ├─ authoring/                     # authoring ergonomics (factories)
│  │  ├─ op/                         # contract-first op authoring
│  │  │  ├─ contract.ts
│  │  │  ├─ strategy.ts
│  │  │  ├─ create.ts
│  │  │  └─ index.ts
│  │  ├─ step/                       # contract-first step authoring
│  │  │  ├─ contract.ts
│  │  │  ├─ create.ts
│  │  │  └─ index.ts
│  ├─ lib/                           # neutral utilities (engine-owned)
│  ├─ trace/                         # tracing primitives
│  ├─ dev/                           # diagnostics (not part of runtime contract)
│  ├─ polyfills/
│  ├─ shims/
│  └─ index.ts                       # package entrypoint
└─ test/
   ├─ engine/
   └─ authoring/
```

**Forbidden in the target core SDK:**
- `CORE_SDK_ROOT/src/config/**`
- `CORE_SDK_ROOT/src/bootstrap/**`
- `CORE_SDK_ROOT/src/base/**`
- any imports from `MOD_CONTENT_ROOT/**`

### 2.3 Standard content package (`STANDARD_CONTENT_ROOT`) target layout (collapsed)

```text
STANDARD_CONTENT_ROOT/
├─ src/
│  ├─ mod.ts                         # exports recipes; no global step catalog
│  ├─ maps/                          # map/preset entrypoints (config instances live here)
│  │  ├─ *.ts
│  │  └─ _runtime/                   # Civ7 runner glue (mod-owned)
│  ├─ recipes/
│  │  └─ standard/
│  │     ├─ recipe.ts
│  │     ├─ runtime.ts
│  │     └─ stages/
│  │        └─ <stageId>/
│  │           ├─ index.ts
│  │           ├─ steps/             # step modules (standardized contract + implementation pairing)
│  │           │  ├─ index.ts
│  │           │  └─ <stepId>/
│  │           │     ├─ contract.ts
│  │           │     ├─ index.ts
│  │           │     └─ lib/
│  │           │        └─ <helper>.ts
│  │           └─ *.ts               # stage-scoped helpers/contracts (optional)
│  └─ domain/
│     ├─ <domain>/
│     │  ├─ index.ts
│     │  ├─ ops.ts
│     │  ├─ model/
│     │  │  ├─ config/
│     │  │  │  └─ <part>.config.ts   # one exported domain authoring config object
│     │  │  ├─ policy/
│     │  │  │  └─ <concern>.ts       # domain model policy
│     │  │  └─ data/
│     │  │     └─ <collection>/
│     │  │        └─ <clear-name>.ts # domain-owned data / expectation table
│     │  └─ ops/
│     │     └─ <op-slug>/
│     │        ├─ contract.ts
│     │        ├─ types.ts
│     │        ├─ rules/
│     │        │  ├─ <rule>.ts
│     │        │  └─ index.ts
│     │        ├─ strategies/
│     │        │  ├─ default.ts
│     │        │  ├─ <strategy>.ts
│     │        │  └─ index.ts
│     │        └─ index.ts
│     └─ **/**                       # explicit domain-owned slots only
└─ test/
   └─ **/**
```

**Forbidden in the target standard content package:**
- `STANDARD_CONTENT_ROOT/src/config/**` (central config module)
- Any recipe-root “catalog” modules that aggregate unrelated domains (e.g. `recipes/standard/tags.ts`, `recipes/standard/artifacts.ts`)

### 2.4 Colocation and export rules (avoid centralized aggregators)

**Step modules (`stages/<stageId>/steps/<stepId>/`)**
- Steps are standardized as a directory with a contract + implementation entry:
  - `contract.ts` — step-owned contract metadata (schema + derived config type, step-local tag IDs/arrays, and step-owned artifact helpers/validators).
  - `index.ts` — step implementation via `createStep(contract, { resolveConfig?, run })`, importing the contract and domain logic.
  - `lib/**` — step-local helpers (pure or orchestration helpers), no registry awareness.
- `contract.ts` is the ownership surface for step contracts. `index.ts` is orchestration only.
- If a step’s contract is large, split into additional colocated files under the step directory (e.g., `schema.ts`, `tags.ts`, `artifacts.ts`) while keeping ownership local.
  - `createStep` is imported from `@swooper/mapgen-core/authoring` and defaults to `ExtendedMapContext`; use `createStepFor<TContext>()` only for non-standard contexts.

**Stage scope (`stages/<stageId>/**`)**
- Stage-scoped helpers and contracts shared across multiple steps live at the stage root as explicit modules (e.g., `producer.ts`, `placement-inputs.ts`, `shared.model.ts`).
- Stage files must remain stage-scoped and must not accumulate cross-stage contracts.

**Domain scope (`src/domain/**`)**
- Domain is the home for:
  - domain algorithms
  - operation modules under `<domain>/ops/<op>/` with `contract.ts`, `types.ts`, `rules/**` + `rules/index.ts`, and `strategies/**` + `strategies/index.ts`
  - domain model config objects under `<domain>/model/config/*.config.ts` when owned by the domain model
  - domain model policy under `<domain>/model/policy/*.ts` when it is domain-owned interpretation, classification, scoring, or selection policy
  - domain model data under `<domain>/model/data/<collection>/<clear-name>.ts` only for domain-owned authored data or expectation tables
- Domain modules may be used by a single step; reuse is not the criterion for domain placement. The criterion is recipe-independence and a clean separation between step orchestration and content logic.
- Domain must not import from `recipes/**` or `maps/**`.
- Dependency IDs (tags/artifacts/effects) are recipe-owned; domain modules must not re-export recipe shims.
- Reusable/generated Civ7 policy tables, shared resource/feature catalogs, engine declarations, and adapter behavior are not domain model data. They belong to `@civ7/map-policy`, `@civ7/types`, or `@civ7/adapter` by owner.
- Rules never import `contract.ts` and never export types; shared op types live in `types.ts`.

**Barrels (`index.ts`)**
- Barrels must be explicit, thin re-exports only (no side-effect registration, no hidden aggregation).
- Recipe-level assembly (`recipe.ts` + `runtime.ts`) composes stages; it does not define cross-domain catalogs.

**Schemas**
- Step config schemas are step-owned (`stages/<stageId>/steps/<stepId>/contract.ts`).
- Shared config schema fragments live with the *closest* real owner:
  - stage scope when shared within a stage (`stages/<stageId>/shared/**`)
  - domain model scope when shared across stages/recipes (prefer `src/domain/<domain>/model/config/<part>.config.ts` for config-oriented fragments)
- Step schemas must not depend on a centralized “global runtime config blob” module.
- Target config imports point at named domain model config surfaces, not a mod-wide config barrel.
- Domain config schemas must not use open-ended “unknown bag” fields or internal-only metadata fields.

---
