# agent-target-shape.md

## Objective

Propose an **ideal (greenfield-ish) target architecture shape** for the Ecology domain that:
- aligns with the canonical **ops/strategies/rules/steps** model,
- respects **truth vs projection** boundaries (`ecology` truth stage vs `map-ecology` projection/materialization lane),
- and makes feature authoring legible under the principle:
  - **each feature is owned by a distinct operation** when it is a real, independently-tunable concept,
  - while allowing **cohesive families** to stay bundled when the split would be pure ceremony or a perf trap.

This is **conceptual only** (no sequencing/task plan; no production refactors).

## Where To Start (Pointers)

- Target architecture + modeling:
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
  - `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/00-fundamentals.md`
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-standard-content-package.md`
  - `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-029-mutation-modeling-policy.md`
  - `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- Ecology reference + current anchors:
  - `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`
  - `mods/mod-swooper-maps/src/domain/ecology/types.ts`
  - `mods/mod-swooper-maps/src/domain/ecology/ops/contracts.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/*`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/*`
  - `mods/mod-swooper-maps/src/recipes/standard/tags.ts`

## Findings (Grounded)

- Ecology is modeled as a **truth stage** plus a **projection/materialization stage**:
  - `ecology` truth stage: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts`
  - `map-ecology` projection lane (gameplay phase): `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`
  - Reference posture: `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`
- Current “feature intent” truth artifact is **grouped by concern**, not by concrete feature id:
  - `artifact:ecology.featureIntents` schema: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts`
  - shape: `{ vegetation: Placement[], wetlands: Placement[], reefs: Placement[], ice: Placement[] }`
- The `features-plan` truth step already behaves like an **orchestrator**:
  - reads truth artifacts: biome classification + pedology + topography + hydrography
  - calls multiple ops and publishes `artifact:ecology.featureIntents`
  - code: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`
- The Ecology domain already contains **two different “shapes”** for feature planning:
  - “bundle planners” (coarse): `ecology/features/plan-vegetation`, `.../plan-wetlands`, `.../plan-reefs`, `.../plan-ice`
    - contracts: `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-*/contract.ts`
  - “placement planners” (feature-key aware, chance tables): `ecology/features/vegetated-placement`, `.../wet-placement`, `.../aquatic-placement`, `.../ice-placement`
    - contracts: `mods/mod-swooper-maps/src/domain/ecology/ops/plan-*-feature-placements/contract.ts`
- Map projection/materialization currently writes to **engine adapter + mutable fields** and gates via `field:*` + `effect:*` dependency tags:
  - plot biomes: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.ts`
  - apply features: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/index.ts`
  - tag ids: `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
- The `applyFeatures` op is **not “apply to engine”**; it’s a **pure merge/limit** before stamping:
  - op id `ecology/features/apply`: `mods/mod-swooper-maps/src/domain/ecology/ops/features-apply/contract.ts`
  - used by stamping step `features-apply`: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/index.ts`

## Drift / Issues Noted

- **Truth artifact schemas are permissive where runtime expects typed arrays**, creating a “schema says Any, code assumes TypedArray” seam:
  - permissive schemas: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts`
  - runtime validators: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifact-validation.ts`
  - target posture (“domains own artifact shapes + validators”): `docs/projects/engine-refactor-v1/resources/spec/SPEC-standard-content-package.md`
- **Feature planning currently has multiple overlapping op surfaces**, forcing the step to carry branching/selection complexity:
  - step contract builds a strategy-selection schema manually: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts`
  - step runtime picks between `planVegetatedFeaturePlacements` vs `planVegetation`: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`
  - target modeling guidance favors “one obvious op per responsibility” (avoid mega-ops and avoid strategy misuse): `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
- **Effect tag posture is mixed**:
  - many Gameplay stamping steps provide `effect:map.*` (e.g. coasts/continents): `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
  - ecology map-steps provide `effect:engine.*` for biomes/features: `mods/mod-swooper-maps/src/recipes/standard/tags.ts`, `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts`, `.../features-apply/contract.ts`
  - target guidance says “stamping happened” should be modeled as `effect:map.<thing><Verb>` (single path): `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
- `plot-effects` (map-ecology) mutates engine adapter but does not provide an explicit effect dependency key:
  - step: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/index.ts`
  - modeling guidance (effects as verified milestones): `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
- Mutation semantics are currently expressed as `field:*` tags, but target ADR is pushing toward an explicit “mutable canvas” concept (`buffer:*`):
  - current: `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
  - target ADR: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-029-mutation-modeling-policy.md`

## Open Questions

- Should ecology projection continue to lean on **engine effect tags** (`ENGINE_EFFECT_TAGS.*`) for verification, or should the canonical gating key become `effect:map.*` (with engine verification as internal step logic)?
- For `artifact:ecology.featureIntents`, do we want the canonical truth to be:
  - placements-by-family (today), or
  - placements-by-FeatureKey (ownership clarity), or
  - a tile-indexed field (`featureKeyIndexByTile`) plus provenance (most compact)?
- Is `planPlotEffects` conceptually “ecology truth” or “map-ecology projection”?
  - today it lives in the ecology domain but is used only by a gameplay/projection step: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/*`
- Do we need story-driven feature embellishments in the **standard recipe** (paradise/volcanic), and if so what should they depend on?
  - narrative hotspot posture: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-024-hotspot-categories-live-in-a-single-narrative-hotspots-artifact-no-split-artifacts-in-v1.md`

## Suggested Refactor Shapes (Conceptual Only)

### Recommended Shape: “Feature-Family Ops (Single-Pass) + Resolve + Gameplay Stamping”

This is a **performance-friendly** shape that still respects “feature as a distinct op” by ensuring:
- each concrete `FeatureKey` is owned by exactly **one** feature-family op (no cross-op competition),
- conflict-resolution is explicit (one op), and
- story embellishment is modeled as its own op family (not hidden inside mega-planners).

It leans into the existing “placement planner” ops as the canonical surfaces, and deprecates the coarse bundle planners over time.

#### Op Catalog (Ecology)

Non-feature ops (existing; already aligned with the target model):
- `ecology/classify-biomes` (kind: `compute`/`plan` depending on final posture)
  - current contract: `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/contract.ts`
- `ecology/refine-biome-edges`
  - current contract: `mods/mod-swooper-maps/src/domain/ecology/ops/refine-biome-edges/contract.ts`
- `ecology/pedology/classify` + `ecology/pedology/aggregate`
  - current: `mods/mod-swooper-maps/src/domain/ecology/ops/pedology-classify/contract.ts`,
    `mods/mod-swooper-maps/src/domain/ecology/ops/pedology-aggregate/contract.ts`
- `ecology/resources/plan-basins` + `ecology/resources/score-balance`
  - current: `mods/mod-swooper-maps/src/domain/ecology/ops/resource-plan-basins/contract.ts`,
    `mods/mod-swooper-maps/src/domain/ecology/ops/resource-score-balance/contract.ts`

Feature planning ops (canonical “one pass per cohesive family”):
- Vegetated (owns: `FEATURE_FOREST`, `FEATURE_RAINFOREST`, `FEATURE_TAIGA`, `FEATURE_SAVANNA_WOODLAND`, `FEATURE_SAGEBRUSH_STEPPE`)
  - op: `ecology/features/vegetated-placement`
  - contract: `mods/mod-swooper-maps/src/domain/ecology/ops/plan-vegetated-feature-placements/contract.ts`
- Wet (owns: `FEATURE_MARSH`, `FEATURE_TUNDRA_BOG`, `FEATURE_MANGROVE`, `FEATURE_OASIS`, `FEATURE_WATERING_HOLE`)
  - op: `ecology/features/wet-placement`
  - contract: `mods/mod-swooper-maps/src/domain/ecology/ops/plan-wet-feature-placements/contract.ts`
- Aquatic (owns: `FEATURE_REEF`, `FEATURE_COLD_REEF`, `FEATURE_ATOLL`, `FEATURE_LOTUS`)
  - op: `ecology/features/aquatic-placement`
  - contract: `mods/mod-swooper-maps/src/domain/ecology/ops/plan-aquatic-feature-placements/contract.ts`
- Ice (owns: `FEATURE_ICE`)
  - op: `ecology/features/ice-placement`
  - contract: `mods/mod-swooper-maps/src/domain/ecology/ops/plan-ice-feature-placements/contract.ts`

Feature embellishment ops (optional, depend on narrative/morphology truths; still pure):
- `ecology/features/reef-embellishments`
  - contract: `mods/mod-swooper-maps/src/domain/ecology/ops/plan-reef-embellishments/contract.ts`
- `ecology/features/vegetation-embellishments`
  - contract: `mods/mod-swooper-maps/src/domain/ecology/ops/plan-vegetation-embellishments/contract.ts`

Feature resolution op (pure; today mislabeled as “apply”):
- `ecology/features/resolve-placements`
  - current id: `ecology/features/apply` (but behavior is “merge/limit”, not engine application)
  - contract: `mods/mod-swooper-maps/src/domain/ecology/ops/features-apply/contract.ts`

Note: This catalog is “feature-distinct” by **ownership**:
- each `FeatureKey` appears in exactly one op’s output contract (family op),
- so it’s observable/tunable and doesn’t rely on step-level arbitration between independent planners.

#### Step Breakdown (Orchestration Only)

Truth stage `ecology` (no adapter calls; publishes truth artifacts):
- `pedology` step
  - reads hydrology/morphology truths; calls pedology ops; provides `artifact:ecology.soils`
  - current: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/*`
- `resource-basins` step
  - provides `artifact:ecology.resourceBasins`
  - current: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/*`
- `biomes` + `biome-edge-refine` steps
  - provide `artifact:ecology.biomeClassification` (and refined variants)
  - current: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/*`,
    `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/*`
- `features-plan` step (or rename to `feature-intents`)
  - builds shared input signals (masks, adjacency fields, seed)
  - calls the four feature-family placement ops
  - optionally calls embellishment ops (if narrative/morphology story artifacts exist)
  - calls the resolve op to enforce max-per-tile + precedence
  - publishes `artifact:ecology.featureIntents`
  - anchor: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`

Projection/materialization lane `map-ecology` (gameplay; adapter reads/writes; mutable fields; emits effects):
- `plot-biomes`
  - reads `artifact:ecology.biomeClassification` (+ topography landmask)
  - writes adapter biome type + `field:biomeId` + related fields
  - should provide a single canonical effect key (target naming: `effect:map.biomesPlotted`)
  - anchor: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.ts`
- `plot-features` (rename of `features-apply`)
  - reads `artifact:ecology.featureIntents`
  - (pure) resolves/filters to engine-supported keys (or pre-resolve earlier) and stamps to adapter
  - reifies `field:featureType`
  - should provide canonical effect key (target naming: `effect:map.featuresPlotted`)
  - anchors:
    - step: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/index.ts`
    - engine binding helper: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features/feature-keys.ts`
- `plot-effects`
  - reads ecology/morphology truth fields, plans placements via op, applies to adapter
  - should emit a canonical effect key (target naming: `effect:map.plotEffectsPlotted`)
  - anchors: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/*`

This keeps orchestration in steps, and ops pure, matching:
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
- `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/00-fundamentals.md`

#### Artifact Boundaries (Truth vs Projection)

Truth (Physics-owned, engine-agnostic):
- `artifact:ecology.biomeClassification`
- `artifact:ecology.soils`
- `artifact:ecology.resourceBasins`
- `artifact:ecology.featureIntents`

Projection/materialization lane (Gameplay-owned):
- mutable fields (`field:*`) are the canonical “engine-facing canvases” (per current system):
  - e.g., `field:biomeId`, `field:featureType` in `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
  - aligns conceptually with “buffers for mutation” posture: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-029-mutation-modeling-policy.md`
- effect keys represent “stamping happened” milestones:
  - target posture prefers `effect:map.<thing><Verb>` (single-path): `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`

#### Shared Semantics (Ids / Knobs / Types)

Stable ids + enums (domain-owned; imported by steps):
- `FeatureKey`, `FEATURE_PLACEMENT_KEYS`, and canonical ordering/index:
  - `mods/mod-swooper-maps/src/domain/ecology/types.ts`
- biome symbols + mapping helpers:
  - `mods/mod-swooper-maps/src/domain/ecology/types.ts`
- step op binding uses only the domain public surface:
  - `mods/mod-swooper-maps/src/domain/ecology/index.ts`
  - enforced by the ops-module contract and domain layering: `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`,
    `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/00-fundamentals.md`

Knobs (coarse, cross-cutting) should live in domain shared modules and be surfaced by stage `knobsSchema`:
- posture: `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`
- today ecology knobs are empty: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts`

Artifact shapes + validators should be domain-owned in the target posture:
- spec: `docs/projects/engine-refactor-v1/resources/spec/SPEC-standard-content-package.md`
- today they’re stage-owned: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts`

---

### Alternative Shape (Meaningful Tradeoff): “One Op Per FeatureKey”

**When to choose it:** maximum modularity, per-feature testability, or per-feature opt-in/out is more important than minimizing passes.

Core idea:
- Each concrete `FeatureKey` becomes its own op:
  - `ecology/features/plan-forest`, `.../plan-rainforest`, `.../plan-taiga`, etc
- Each op outputs placements only for that feature (no mixed feature outputs).
- `features-plan` step orchestrates:
  - build shared signals once (masks, moisture normalization, adjacency, etc),
  - call each feature op,
  - call `resolve-placements` once.

Tradeoffs:
- Pros:
  - true “one feature = one op” alignment (strong observability + tuning boundaries),
  - simpler per-feature contract evolution,
  - easier to delete/replace a feature without touching other feature logic.
- Cons:
  - naive implementations imply **many full-map passes** (perf risk),
  - pushes more data plumbing into the step (inputs repeated unless you add a shared “signals” artifact),
  - may require an additional “feature signals” op/artifact to keep it sane.

Perf mitigation (if this shape is chosen):
- Introduce a single compute op (truth) that produces shared intermediate signals once:
  - `artifact:ecology.featureSignals` (e.g., normalized moisture bands, river adjacency masks, latitude bands, etc)
- Per-feature ops consume `featureSignals` rather than recomputing gating inputs.

This alternative is “more correct by principle”, but more expensive unless we intentionally design for shared signals.
