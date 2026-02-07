# agent-domain.md

## Objective

Inventory ecology op modules for compliance with the “operation module” spec, check rule/strategy boundaries, and identify any ops that are effectively mega-ops or orchestration-in-disguise.

## Where To Start (Pointers)

- Spec: `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
- Ecology domain entrypoints:
  - `mods/mod-swooper-maps/src/domain/ecology/index.ts`
  - `mods/mod-swooper-maps/src/domain/ecology/ops.ts`
  - `mods/mod-swooper-maps/src/domain/ecology/ops/contracts.ts`
  - `mods/mod-swooper-maps/src/domain/ecology/ops/index.ts`
- Op module directories: `mods/mod-swooper-maps/src/domain/ecology/ops/*`

## Findings (Grounded)

### 1) Op-module structure compliance (high confidence)

All ecology op modules under `mods/mod-swooper-maps/src/domain/ecology/ops/*` appear to follow the canonical module layout:
- each op directory contains `contract.ts`, `types.ts`, `index.ts`, plus `rules/` and `strategies/` directories.

Evidence: quick structural scan (manual) of:
- `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/*`
- `mods/mod-swooper-maps/src/domain/ecology/ops/pedology-classify/*`
- `mods/mod-swooper-maps/src/domain/ecology/ops/resource-plan-basins/*`
- `mods/mod-swooper-maps/src/domain/ecology/ops/features-apply/*`
- and the rest of the `ops/*` directories.

### 2) No obvious runtime coupling inside ops

A grep for `@civ7/adapter`, `context.adapter`, and `deps.artifacts` inside `mods/mod-swooper-maps/src/domain/ecology/ops/**` yielded no matches.

This strongly suggests ecology ops are currently pure (no artifact store access and no adapter coupling), which aligns with the target posture.

### 3) Step code does not import op-local rules/strategies directly

Search for imports of `domain/ecology/ops/.../rules` or `.../strategies` from the recipe code yields no results.
This is aligned with the contract rule: steps should only call ops via step contracts, not rule modules.

## Drift / Issues Noted

### A) “Operation per feature” principle is partially implemented but not end-to-end

We already have multiple feature-related planning ops (good split):
- `ecology/features/plan-vegetation` (op contract: `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-vegetation/contract.ts`)
- `ecology/features/plan-wetlands` (op contract: `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-wetlands/contract.ts`)
- `ecology/features/plan-reefs` (op contract: `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-reefs/contract.ts`)
- `ecology/features/plan-ice` (op contract: `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-ice/contract.ts`)

But the step `features-plan` orchestrates many of these in one step, and also optionally calls additional placement ops:
- `planVegetatedFeaturePlacements`, `planWetFeaturePlacements` (see `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`).

This might be OK (steps are allowed to orchestrate), but the *refactor principle* suggests each feature should be a distinct operation.
The current state is a mixed model: some planning is in ops, some planning is in a step-level “multi-feature planner.”

### B) Potential “mega-step” rather than “mega-op”

The orchestration currently seems to live primarily in the step (not in a single op), which is architecturally acceptable, but it might still be too bundled for observability/config hygiene.
The spike should evaluate whether we want to split the step into multiple feature-focused steps (or use multiple operations and keep a single orchestration step that is thin).

## Open Questions

- Do we want to promote “feature planning” into multiple steps (one per feature category), or keep one step that orchestrates multiple ops?
  - Tradeoff: more step-level observability and gating vs more nodes in the plan.
- The optional “placement ops” (`planVegetatedFeaturePlacements`, `planWetFeaturePlacements`) are richer and appear closer to “owned feature placement.”
  - Should these become the primary path (with the older `planVegetation`/`planWetlands` as legacy/fallback), or should both exist as distinct ops with a clear contract?

## Suggested Refactor Shapes (Conceptual Only)

- Keep op module structure (already good).
- Move toward a more uniform “planning ops” approach:
  - Each feature category has a single op contract (or a small set) with strategies for variants.
  - Steps become thin orchestrators: read artifacts, build inputs, call exactly one op per “feature intent family,” publish outputs.
- If we need finer visibility or gating, split `features-plan` into:
  - `features-plan-vegetation`, `features-plan-wet`, `features-plan-reef`, `features-plan-ice` steps, each calling a single op and publishing partial intents, then a final `features-plan-merge` step that publishes `artifact:ecology.featureIntents`.
