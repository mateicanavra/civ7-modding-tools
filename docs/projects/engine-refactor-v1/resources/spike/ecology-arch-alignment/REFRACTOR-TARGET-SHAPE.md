# REFRACTOR TARGET SHAPE: Ecology (Maximal Modularity, Behavior-Preserving)

## Objective

Define a conceptual refactor target for Ecology that:
- aligns with the target architecture (steps/stages vs ops/strategies/rules; truth vs projection),
- preserves behavior (no algorithm changes),
- and explicitly follows the locked directives:
  - **atomic per-feature ops**
  - **compute substrate (compute ops vs plan ops)**
  - **maximal modularity**

This is a target shape for a later refactor (not a sequencing plan).

## Where To Start (Pointers)

- Target domain modeling:
  - `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`
  - `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
- Reference pattern for compute substrate + planning (in-repo):
  - `mods/mod-swooper-maps/src/domain/morphology/ops/contracts.ts`
  - `mods/mod-swooper-maps/src/domain/morphology/ops/compute-substrate/contract.ts`
- Current ecology ops catalog:
  - `mods/mod-swooper-maps/src/domain/ecology/ops/contracts.ts`
- Current steps/stages:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`

## Locked Directives (No Ambiguity)

- **Atomic per-feature ops:** each feature family is represented as distinct op(s). No bulk/multi-feature ops.
- **Compute substrate:** separate **compute** layers from **plan** outputs; compute results are shared substrate reused across feature families.
- **Maximal modularity:** target the maximal ideal modular structure; do not pre-optimize (recover performance via substrate reuse + caching).

See `GREENFIELD.md` for an ideal physics-first organization consistent with these directives.

## Proposed Target Shape (Recommended)

### Stage breakdown (keep current two-stage posture)

- **Truth stage:** `ecology` (phase `ecology`)
  - Owns: pure truth artifacts: compute substrate (eco indices), soils/pedology, biome classification (and refinement), resource basins, feature intents.
  - No adapter calls.

- **Gameplay stage:** `map-ecology` (phase `gameplay`)
  - Owns: projection artifacts (`artifact:map.*`) and engine-facing writes (`field:*` + `effect:*` tags).

This matches `docs/system/libs/mapgen/reference/domains/ECOLOGY.md` and the standard recipe posture.

### Step boundaries (thin orchestrators)

Truth stage steps should be “one published product per step” where feasible, and should explicitly follow a compute-substrate-first posture:

1. `eco-indices` (optional new step; compute substrate)
  - Calls compute ops that build shared ecology indices (aridity/freezing/moisture/energy proxies).
  - Publishes a truth artifact bundle (name TBD; see `GREENFIELD.md` for options).

2. `pedology`
  - Reads: topography + climateField
  - Calls: `classifyPedology` (+ optional compute substrate ops if we keep `eco-indices` internal to steps)
  - Publishes: `artifact:ecology.soils`

3. `resource-basins`
  - Reads: pedology + topography + climateField
  - Calls: `planResourceBasins` then `scoreResourceBasins`
  - Publishes: `artifact:ecology.resourceBasins`

4. `biomes` (+ explicit refinement boundary)
  - Keep `biomes` and `biome-edge-refine` as explicit boundaries, but remove implicit mutability ambiguity by documenting (or adjusting) artifact posture:
    - either `biome-edge-refine` republishes a refined artifact, or
    - `artifact:ecology.biomeClassification` is explicitly documented as publish-once mutable handle.

5. `features-plan-*` (maximal-modularity target)
  - Keep feature planning fully modular by expressing each feature family as atomic op(s) with an explicit compute-vs-plan split:
    - compute suitability layers (compute ops; shared substrate)
    - plan discrete intents (plan ops; one family per op contract)
  - Orchestrate per-family in steps (preferred for maximal modularity):
    - `features-plan-vegetation`
    - `features-plan-wetlands`
    - `features-plan-reefs`
    - `features-plan-ice`
  - Merge in a final step into `artifact:ecology.featureIntents`.

Why: This keeps orchestration visible, makes viz emission and config routing clearer, and aligns with the “each feature is a distinct operation” principle.

Projection stage steps remain:

- `plot-biomes`
  - Binds ecology biomes into engine biome ids; provides `field:biomeId` and `effect:engine.biomesApplied`.

- `features-apply`
  - Applies feature intents to engine; provides `field:featureType` and `effect:engine.featuresApplied`.

- `plot-effects`
  - Applies plot effects via adapter.
  - Provide an explicit effect tag for the adapter write boundary (see `DRIFT.md`).

### Ops catalog shaping (conceptual)

Maintain the existing op catalog but make the compute-vs-plan split explicit and more modular:

- **Compute substrate ops** (produce reusable layers)
  - examples (names illustrative): `compute-eco-climate`, `compute-vegetation-potential`, `compute-habitat-suitability/<featureFamily>`

- **Plan ops (atomic per feature family)** (produce discrete intents/placements)
  - `plan-vegetation` / `plan-wetlands` / `plan-reefs` / `plan-ice`
  - placement-resolution ops remain explicit and contractized (no direct imports from steps):
    - `planVegetatedFeaturePlacements` / `planWetFeaturePlacements` etc.

Recommended: choose one consistent model for each feature family:
- If we want “owned placement” fully, the “feature placement” ops should become the primary contract, and the older “planX” ops should be either:
  - strategies under the owned placement op, or
  - deprecated/fallback modes (but that is a behavior change story).

For a no-behavior-change refactor, we keep behavior but must be careful about compiler semantics:
- Declaring an op in `contract.ops` causes the compiler to **prefill** `defaultConfig` when the author omits that key.
  - This means “config presence” is not a safe signal for optionality once an op is declared.
- Feasibility-stage default (locked):
  - treat legacy “advanced planner” keys as **step-owned orchestration config**, and
  - translate them into internal per-feature op envelopes (defaulting to “disabled”) in stage.compile or step.normalize,
  - see: `FEASIBILITY.md` and `DECISIONS/DECISION-features-plan-advanced-planners.md`.

### Artifacts and mutability

- Treat `artifact:ecology.biomeClassification` as one of:
  - (A) immutable snapshot (refinement republishes a new artifact), or
  - (B) publish-once mutable handle (explicitly documented).

Given current in-place mutation, (B) matches reality, but (A) is easier to reason about for downstream gating.

Feature intents artifact should remain the single “truth” surface for planned placements:
- `artifact:ecology.featureIntents`

### Shared semantics location

- Keep semantic enums/keys (FeatureKey, BiomeSymbol, PlotEffectKey) in `mods/mod-swooper-maps/src/domain/ecology/types.ts` and exported via the domain index.
- Keep op ids and contracts defined in op modules (contract-first).

## Alternative Shape (If Meaningful)

**Transitional alternative:** keep the single `features-plan` step but fully contract-ize it:
- Add optional placement ops to `features-plan/contract.ts` so the compiler owns their envelopes.
- Remove direct import of `@mapgen/domain/ecology/ops` from `features-plan/index.ts`.

Tradeoff:
- Fewer nodes/steps in plan (simpler).
- Less granular observability and fewer seams for future refactors.

Note:
- “Optional placement ops” must be modeled with explicit disabled/fallback semantics; otherwise compiler default-prefill can accidentally turn them on.

## Open Questions

- Do we want feature intents as multiple truth artifacts (per family) or keep one aggregate truth artifact (recommended for compatibility)?
- Should plot-effects become a separately gated guarantee with an explicit effect tag?

## Suggested Next (If We Continue After Spike)

Escalate to feasibility when we decide:
- whether to split steps, and
- whether to republish refined biomes as a separate artifact vs in-place mutation.
