# Agent B: Steps/Stages + Compiler Binding (features-plan Seam)

## Objective

Harden the plan for the **compiler-owned op binding + normalization** refactor, with special focus on the `features-plan` seam:
- eliminate direct `@mapgen/domain/ecology/ops` imports from steps
- ensure ops used by steps are declared through `contract.ops` where appropriate
- preserve existing behavior for optional/advanced planners (`vegetatedFeaturePlacements`, `wetFeaturePlacements`) without triggering compiler default-prefill footguns

This is plan hardening, not implementation.

## Deliverable (write here)

1. **Current wiring summary** (what imports what, where the contract drift is).
2. **Target contract shape**:
   - which config keys remain step-owned orchestration config
   - which per-feature ops are declared in `contract.ops`
   - how stage.compile / step.normalize translates legacy advanced planner config into internal op envelopes
3. **Verification gates** that prevent accidental “always on” ops due to compiler prefill.
4. **File touch list** (YAML `files:` list) for the eventual implementation.

For each non-obvious claim: include a file pointer.

## Starting Pointers

Feasibility/decisions:
- `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/FEASIBILITY.md`
- `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/DECISIONS/DECISION-features-plan-advanced-planners.md`

Step contract + implementation:
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`

Compiler semantics:
- `packages/mapgen-core/src/authoring/step/contract.ts` (schema merge / collisions)
- `packages/mapgen-core/src/compiler/recipe-compile.ts` (op prefill)
- `packages/mapgen-core/src/compiler/normalize.ts`

## Constraints

- Do not reindex Narsil MCP.
- Avoid ADRs as primary references.
- Use locked directives to resolve ambiguity where applicable.

## Findings (Draft, Evidence-Backed)

### 1) Current wiring summary (why `features-plan` is the seam)

`features-plan` bypasses compiler-owned binding/normalization in two ways:

1. Direct import of op implementations:
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`
  - `import ecologyOps from "@mapgen/domain/ecology/ops";`
  - calls `.normalize(...)` and `.run(...)` on op implementations directly

2. Hand-rolled selection schema (not compiler-generated envelope schema):
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts`
  - `createOpSelectionSchema(...)` builds unions from `op.strategies` manually

This defeats the pipeline guarantee that:
- op envelopes are declared via `contract.ops` and validated/normalized by the compiler

### 2) What the compiler actually does (why defaults are a footgun)

Compile flow (high-level):
- validate stage config against `stage.surfaceSchema`
- `stage.compile/toInternal` returns internal step configs (raw)
- **prefill op defaults** (`prefillOpDefaults`) for declared `contract.ops`
- strict-validate against step schema
- run `step.normalize` (must be shape-preserving)
- **normalize ops** (`normalizeOpsTopLevel`) by calling each op’s `.normalize` at compile time

Evidence:
- `packages/mapgen-core/src/compiler/recipe-compile.ts`
- `packages/mapgen-core/src/compiler/normalize.ts`

Key implication:
- Declaring an op in `contract.ops` means it will be default-prefilled via `contract.defaultConfig` when omitted.

### 3) The correct modeling for “optional planners”

We need optional planners to be declared (so the compiler owns their envelopes), but to default to “off”.

Core mechanism we should use (no new infra required):
- `StepOpUse.defaultStrategy`
  - allows a step to override which strategy is used for default envelope prefill
  - implemented by rebuilding the op envelope schema with a different default strategy

Evidence:
- `packages/mapgen-core/src/authoring/step/ops.ts` (`StepOpUse`)
- `packages/mapgen-core/src/authoring/step/contract.ts` (`normalizeOpsDecl` uses `buildOpEnvelopeSchemaWithDefaultStrategy`)
- `packages/mapgen-core/src/authoring/op/envelope.ts` (`buildOpEnvelopeSchemaWithDefaultStrategy`)

Plan decision (spec-ready):
- Every internal per-feature op that is “optional” must have:
  - a `disabled` strategy in its op contract (pure no-op; returns empty placements)
  - step declares it via `{ contract: <op>, defaultStrategy: "disabled" }`

This makes compiler default-prefill safe: omitted config means “disabled”, not “always on”.

### 4) Target contract shape for `features-plan`

Locked decision (see decision packet):
- `vegetatedFeaturePlacements` and `wetFeaturePlacements` remain public step-owned orchestration keys.
- Stage `ecology.compile` translates those public keys into internal per-feature op envelopes.

Therefore:
- We should decouple stage public schema from internal step schema.
  - today: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts` uses step schemas directly as the public schema
  - target: stage public schema remains stable; internal step schema can add per-feature ops

### 5) Verification gates (to prevent “always on” regressions)

Minimum targeted checks:

1. Compile with advanced keys omitted:
- `featuresPlan.vegetatedFeaturePlacements` absent
- `featuresPlan.wetFeaturePlacements` absent
- Expected: internal per-feature ops have `strategy: "disabled"` after compile

2. Compile with advanced keys present:
- Expected: internal per-feature ops are enabled per compile translation mapping and normalize cleanly

3. Ensure no step runtime imports:
- `rg` gates (see M2 Gate G1/G2)

### 6) Likely files to touch (eventual implementation)

```yaml
files:
  - path: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts
    notes: decouple public schema + add compile translation
  - path: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts
    notes: internal step contract; declare internal per-feature ops with defaultStrategy disabled
  - path: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts
    notes: remove direct op imports; call injected runtime ops only
  - path: packages/mapgen-core/src/authoring/step/contract.ts
    notes: no changes expected; this is the mechanism we rely on
```
