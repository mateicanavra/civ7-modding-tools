# agent-target-shape.md

## Objective

Define a conceptual refactor target for Ecology aligned with target architecture and the refactor principle:
- “Each feature is a distinct operation; steps orchestrate; ops do not orchestrate.”

This is a target shape for a later refactor (not a sequencing plan).

## Where To Start (Pointers)

- Target domain modeling:
  - `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`
  - `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
- Current ecology ops catalog:
  - `mods/mod-swooper-maps/src/domain/ecology/ops/contracts.ts`
- Current steps/stages:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`

## Proposed Target Shape (Recommended)

### Stage breakdown (keep current two-stage posture)

- **Truth stage:** `ecology` (phase `ecology`)
  - Owns: pure truth artifacts: soils/pedology, biome classification (and refinement), resource basins, feature intents.
  - No adapter calls.

- **Projection stage:** `map-ecology` (phase `gameplay`)
  - Owns: engine-facing writes and `field:*` + `effect:*` tags.

This matches `docs/system/libs/mapgen/reference/domains/ECOLOGY.md` and the standard recipe posture.

### Step boundaries (thin orchestrators)

Truth stage steps should be “one published product per step” where feasible:

1. `pedology`
  - Reads: topography + climateField
  - Calls: `classifyPedology`
  - Publishes: `artifact:ecology.soils`

2. `resource-basins`
  - Reads: pedology + topography + climateField
  - Calls: `planResourceBasins` then `scoreResourceBasins`
  - Publishes: `artifact:ecology.resourceBasins`

3. `biomes-classify`
  - (Option) split current `biomes` step into two explicit steps:
    - `biomes-classify` publishes `artifact:ecology.biomeClassification`.
    - `biomes-refine` either republishes the artifact or publishes a refined artifact.
  - This makes the refinement boundary explicit if needed for future gating.

4. `features-plan-*` (consider splitting)
  - Replace the single “mega-step” `features-plan` with per-family steps:
    - `features-plan-vegetation`
    - `features-plan-wetlands`
    - `features-plan-reefs`
    - `features-plan-ice`
  - Each step calls exactly one op contract and publishes a partial intents artifact.
  - A final `features-plan-merge` step merges partial intents into `artifact:ecology.featureIntents`.

Why: This keeps orchestration visible, makes viz emission and config routing clearer, and aligns with the “each feature is a distinct operation” principle.

Projection stage steps remain:

- `plot-biomes`
  - Binds ecology biomes into engine biome ids; provides `field:biomeId` and `effect:engine.biomesApplied`.

- `features-apply`
  - Applies feature intents to engine; provides `field:featureType` and `effect:engine.featuresApplied`.

- `plot-effects`
  - Applies plot effects via adapter.
  - Decide whether this should provide an effect tag (see drift doc).

### Ops catalog shaping (conceptual)

Maintain the existing op catalog but clarify the split between:

- **Intent planning ops** (produce placement intent lists)
  - `plan-vegetation` / `plan-wetlands` / `plan-reefs` / `plan-ice`

- **Placement-resolution ops** (take intent + constraints and resolve into a final placements list)
  - `planVegetatedFeaturePlacements` / `planWetFeaturePlacements` etc.

Recommended: choose one consistent model for each feature family:
- If we want “owned placement” fully, the “feature placement” ops should become the primary contract, and the older “planX” ops should be either:
  - strategies under the owned placement op, or
  - deprecated/fallback modes (but that is a behavior change story).

For a no-behavior-change refactor, we keep both, but we make the contract usage explicit:
- Step declares both op envelopes in `contract.ops`, and step chooses which to call based on config presence.

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

**Alternative:** keep the single `features-plan` step but fully contract-ize it:
- Add optional placement ops to `features-plan/contract.ts` so the compiler owns their envelopes.
- Remove direct import of `@mapgen/domain/ecology/ops` from `features-plan/index.ts`.

Tradeoff:
- Fewer nodes/steps in plan (simpler).
- Less granular observability and fewer seams for future refactors.

## Open Questions

- Do we want feature-intents as multiple artifacts (per family) or keep one aggregate artifact?
- Should plot-effects become a separately gated guarantee with an effect tag?

## Suggested Next (If We Continue After Spike)

Escalate to feasibility when we decide:
- whether to split steps, and
- whether to republish refined biomes as a separate artifact vs in-place mutation.
