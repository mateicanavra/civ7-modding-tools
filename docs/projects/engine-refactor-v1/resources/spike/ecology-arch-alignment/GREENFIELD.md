# GREENFIELD: Ecology (Physics-First, Maximal Modularity)

## Objective

Define an ideal, greenfield organization for **Ecology** that:
- matches MapGen's domain modeling (stages/steps vs ops/strategies/rules),
- respects the **truth vs projection** boundary,
- and models ecology as **compute substrate + atomic per-feature planning**.

This is an architecture target description, not an implementation plan.

## Locked Directives (No Ambiguity)

- **Atomic per-feature ops:** each feature family is its own op(s); avoid bulk/multi-feature mega-ops.
- **Compute substrate model:** separate **compute ops** (shared compute layers) from **plan ops** (discrete intents/placements). Use compute outputs as shared substrate.
- **Maximal modularity:** target the maximal ideal modular architecture; don't pre-optimize performance (use the substrate to recover performance later).

Reference pattern (in-repo): Morphology ops are explicitly split into `compute-*` substrate ops plus `plan-*` ops:
- `mods/mod-swooper-maps/src/domain/morphology/ops/contracts.ts`
- example compute op: `mods/mod-swooper-maps/src/domain/morphology/ops/compute-substrate/contract.ts`

## Where Ecology Fits In The Pipeline

In the standard recipe, Ecology sits after Hydrology + Morphology truth and before Gameplay/materialization consumers.

Upstream (truth-only inputs):
- `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`
- `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md`

Downstream (consumers of projected/materialized outputs):
- `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`

## Recommended Stage Breakdown (Truth vs Projection)

Keep two stages:
1. `ecology` (truth / physics)
2. `map-ecology` (gameplay projection + materialization)

This matches:
- `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`

Viable alternative (only if it reduces coupling): split `map-ecology` into:
- `map-ecology` (projection-only; publishes `artifact:map.*`, no adapter calls)
- `plot-ecology` (materialization-only; adapter writes; emits `effect:*`)

## Steps vs Ops vs Strategies vs Rules (Boundaries)

Use the spec-defined boundaries:
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`

Summary:
- **Steps** orchestrate, publish artifacts, and perform side effects (adapter writes).
- **Ops** are stable pure contracts (`run(input, config) -> output`).
- **Strategies** are algorithm variants of one op with identical I/O.
- **Rules** are internal heuristics inside ops; never exported as step-callable surfaces.

## Proposed Step Breakdown (Truth Stage: `ecology`)

The "maximal modularity" target prefers thin orchestration steps with shared compute substrate.

1. `eco-indices` (truth)
   - computes the ecology-facing index bundle (shared substrate: moisture/energy/freeze proxies)
   - publishes: `artifact:ecology.ecoClimate` (or a similarly named truth artifact)

2. `soils` (truth)
   - consumes: `ecoClimate` + morphology substrate/topography
   - publishes: `artifact:ecology.soils`

3. `biomes` (truth)
   - consumes: `ecoClimate` + soils + cryosphere/hydrography
   - publishes: `artifact:ecology.biomeClassification`

4. `resource-basins` (truth)
   - consumes: `ecoClimate` + soils + routing/landmasses
   - publishes: `artifact:ecology.resourceBasins`

5. `feature-intents-*` (truth; per feature family)
   - per-family orchestration calling exactly one per-feature op contract each:
     - `feature-intents-vegetation`
     - `feature-intents-wetlands`
     - `feature-intents-reefs`
     - `feature-intents-ice`
   - publishes partial intents (either per-family artifacts or a mergeable structure)

6. `feature-intents-merge` (truth)
   - merges into the single canonical truth surface:
   - publishes: `artifact:ecology.featureIntents`

Note: a behavior-preserving refactor may keep current step ids but still adopt this internal structure by calling atomic ops from a single orchestration step.

## Proposed Step Breakdown (Gameplay Stage: `map-ecology`)

Gameplay owns projection artifacts + adapter stamping/effects.

1. `project-ecology` (projection-only)
   - publishes `artifact:map.*` (biome ids, soil classes, feature plan, debug overlays)

2. `plot-biomes` (materialization)
   - adapter writes; provides biome fields + effect tag

3. `plot-features` (materialization)
   - adapter writes; provides feature fields + effect tag

4. `plot-effects` (materialization)
   - adapter writes; provides plot-effect completion effect tag

## Ops Catalog (Conceptual, Grouped By Kind)

This is an *ideal* catalog organized around substrate reuse and atomic per-feature planning.

### A) Compute substrate ops (shared layers)

Compute ops produce reusable layers/fields (often tile-indexed typed arrays) consumed by many downstream plan ops:

- `ecology/compute-eco-climate` (compute)
  - aridity/freeze/growing-season style indices (physics-first framing; implementation can be approximate)

- `ecology/compute-vegetation-potential` (compute)
  - continuous vegetation potential layers used by biomes and feature planners

- `ecology/compute-soils` (compute)
  - soil parameter fields (depth/texture/drainage/fertility proxies)

- `ecology/compute-habitat-suitability/<featureFamily>` (compute)
  - per-feature-family suitability fields derived from shared substrate

### B) Plan ops (atomic per feature family)

Plan ops consume compute layers and produce discrete intent/placement outputs:

- `ecology/plan-feature-intents/<featureFamily>` (plan)
  - output: list of intents (tileIndex + family + strength + patch id, etc.)

### C) Projection/materialization helpers (Gameplay-owned)

These can encode engine ids/constraints and should not leak into Physics truth:

- `map-ecology/project-biome-ids` (compute)
- `map-ecology/resolve-feature-placements` (plan)

## Artifacts (Truth vs Projection)

Truth artifacts (`artifact:ecology.*`) are physics-owned and engine-agnostic; projection artifacts (`artifact:map.*`) are gameplay-owned.

Suggested minimal truth set:
- `artifact:ecology.ecoClimate` (compute substrate bundle)
- `artifact:ecology.soils`
- `artifact:ecology.biomeClassification`
- `artifact:ecology.resourceBasins`
- `artifact:ecology.featureIntents`

Suggested derived/projection set:
- `artifact:map.biomeIdByTile`
- `artifact:map.soilClassByTile`
- `artifact:map.ecologyFeaturePlan`
- `artifact:map.ecologyDiagnostics`

## External "Physics-First" Anchors (Optional Reading)

These are conceptual anchors for the "physics-first" framing; we should still keep implementations aligned with MapGen constraints and existing behavior until we're explicitly changing behavior:
- Aridity Index framing: https://pmc.ncbi.nlm.nih.gov/articles/PMC9287331/
- FAO-56 reference ET0: https://www.fao.org/4/x0490e/x0490e00.htm
- Koppen-Geiger climate classification framing: https://hess.copernicus.org/articles/11/1633/2007/
- Holdridge life zones: https://epa-dccs.ornl.gov/documents/Holdridge_LifeZones.pdf
- CLORPT soil formation factors: https://geography.as.uky.edu/node/292253

## Open Questions (Still Legitimate)

- Truth taxonomy: discrete biome code vs mixture weights/confidence as canonical truth?
- Artifact mutability: should `artifact:ecology.biomeClassification` be immutable snapshots or a publish-once mutable handle?
- Effect naming: should `plot-effects` provide an explicit effect tag (and what should it be called)?

## Related Spike Docs

- `CURRENT.md` (as-implemented mental map)
- `TARGET.md` (ecology-scoped target architecture interpretation)
- `DRIFT.md` (evidence-backed divergences)
- `REFRACTOR-TARGET-SHAPE.md` (target refactor shape consistent with directives)
- `DECKGL-VIZ.md` (viz key compatibility surface)
