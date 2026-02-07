# agent-integration.md

## Objective

Map ecology’s upstream inputs and downstream consumers (artifacts, tags/effects, viz), and surface any hidden couplings.

## Where To Start (Pointers)

- Standard recipe composition:
  - `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
  - `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- Ecology truth stage:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/**`
- Map ecology projection stage:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/**`
- Tags/effects registry:
  - `mods/mod-swooper-maps/src/recipes/standard/tags.ts`

## Findings (Grounded)

### 1) Ecology in the pipeline

Standard stage ordering places ecology after hydrology climate refine and before map-projection stages:
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`

Order (relevant slice):
- `hydrology-climate-baseline` -> `hydrology-hydrography` -> `hydrology-climate-refine` -> `ecology` -> `map-*` -> `placement`

### 2) Upstream dependencies (truth inputs)

Ecology step contracts explicitly depend on:

- Hydrology climate field (`artifact:climateField`):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts`

- Hydrology cryosphere (`artifact:hydrology.cryosphere`) via hydrology-climate-refine artifacts:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts`

- Hydrology hydrography (`artifact:hydrology.hydrography`):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts`

- Morphology topography (`artifact:morphology.topography`):
  - used by all ecology steps (biomes, pedology, resource basins, features plan, biome edge refine)
  - contracts: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/*/contract.ts`

### 3) Downstream consumers

Map-ecology stage consumes ecology truth artifacts and writes engine-facing state:

- `plot-biomes` consumes `artifact:ecology.biomeClassification` + `artifact:morphology.topography` and writes engine biome type + `field:biomeId`.
  - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts`
  - Implementation: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.ts`

- `features-apply` consumes `artifact:ecology.featureIntents` and writes engine feature type + `field:featureType`.
  - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts`
  - Implementation: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/index.ts`

- `plot-effects` consumes `artifact:ecology.biomeClassification` (+ topography heightfield) and writes plot effects via adapter.
  - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts`
  - Implementation: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/index.ts`

Placement stage likely consumes `field:*` tags (and engine effects) rather than ecology truth artifacts directly.

### 4) Viz consumers

Studio groups visualization by `dataTypeKey` and renders tile-space grids/points.
Ecology emits keys under `ecology.*` and `map.ecology.*`.
Relevant emissions are enumerated in `_scratch/agent-deckgl.md`.

## Hidden Couplings / Surprises

- `features-plan` step imports `@mapgen/domain/ecology/ops` directly (bypassing injected ops) for optional placement ops normalization/run.
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`

- `biome-edge-refine` mutates the previously published `artifact:ecology.biomeClassification` in place.
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts`
  - This creates a hidden “artifact is mutable” coupling for downstream consumers.

- `plot-effects` applies adapter writes but does not declare a provides effect tag (unlike plot-biomes/features-apply).
  - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts` (provides: [])
  - Implementation: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/index.ts` (calls `context.adapter.addPlotEffect`).

## Open Questions

- Should `plot-effects` provide an effect tag to make it a first-class guarantee?
- Should `biome-edge-refine` republish a separate artifact (immutable) to avoid in-place mutation coupling?
- Is `artifact:climateField` treated as a publish-once handle that can be refined in-place (seems yes), and if so do we want similar posture for `artifact:ecology.biomeClassification`?

## Suggested Refactor Shapes (Conceptual Only)

- Make all op usage explicit in step contracts (remove direct domain imports in step implementations).
- Decide and document artifact mutability posture for ecology artifacts.
- Consider promoting `plot-effects` to a tagged effect guarantee if it becomes a stable downstream dependency.
