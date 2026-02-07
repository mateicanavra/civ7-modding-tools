# agent-greenfield-ecology.md

## Objective

Propose a greenfield, physics-first architecture for the **Ecology** portion of the MapGen pipeline that:
- fits the current MapGen layers model (domains/ops vs steps vs stages vs recipe) and compile-first posture,
- respects the truth vs projection boundary,
- and yields stable artifacts for downstream consumers (projection + gameplay/placement).

This is an architecture proposal (model + boundaries), not an implementation plan. It intentionally avoids tuning and engine-specific constants.

## Sources Consulted

- Repo:
  - MapGen architecture + layering: `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
  - Domain modeling definitions (ops vs steps): `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`
  - Ecology domain reference (current contract + stage split): `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`
  - Standard pipeline stage order: `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
  - Policy: Truth vs projection: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
  - Spec: step/op/strategy/rule boundaries + artifact/effect posture:
    - `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
  - Upstream/downstream contracts to anchor dependencies:
    - `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`
    - `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md`
    - `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`
- Web:
  - FAO-56 reference evapotranspiration (ET0) guidance (Penman-Monteith): [FAO Irrigation and Drainage Paper 56](https://www.fao.org/4/x0490e/x0490e00.htm)
  - Aridity Index (AI) definition and common thresholds (AI = precipitation / reference ET0): [Version 3 of the Global Aridity Index and Potential Evapotranspiration Database](https://pmc.ncbi.nlm.nih.gov/articles/PMC9287331/)
  - Climate classification as a thresholded function of long-term temperature + precipitation: [Peel et al. 2007, Updated world map of the Koppen-Geiger climate classification](https://hess.copernicus.org/articles/11/1633/2007/)
  - Soil formation factors (CLORPT: climate, organisms, relief, parent material, time): [UKy Geography CLORPT summary](https://geography.as.uky.edu/node/292253)
  - Holdridge life zones as a compact ecology classification using simple climate variables (annual precipitation, biotemperature, PET ratio): [Lugo et al. 1999 (Holdridge Life Zones PDF)](https://epa-dccs.ornl.gov/documents/Holdridge_LifeZones.pdf)

## Proposed Greenfield Ecology Architecture

### Recommended Shape (Architecture)

**Keep Ecology as two stages:**
1. `ecology` (truth / physics)
2. `map-ecology` (projection / gameplay + engine materialization)

This directly matches MapGen's layer model (domains own ops; steps orchestrate; stages group/configure; recipes order stages) and the explicit truth vs projection policy. See: `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`, `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`, `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`.

The key greenfield change is *what we treat as "truth"*: Ecology truth should primarily be **continuous physical/ecological state** (energy/water constraints, vegetation/soil potentials, and region-scale basins), with discrete gameplay/engine choices deferred to projection/materialization steps. This keeps the physics lane engine-agnostic, and it makes projection outputs explicitly recomputable. (Truth/projection posture: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`.)

### Stage Breakdown (Names + Ownership)

#### Stage 1: `ecology` (truth; physics-owned)

**Owns:**
- deriving ecology-relevant *biophysical indices* from upstream climate/terrain truths (not engine fields),
- biome / potential vegetation classification (engine-agnostic taxonomy),
- soil/pedology classification (engine-agnostic parameters),
- resource basin candidates (engine-agnostic "potential" structures),
- feature *intent fields* (engine-agnostic; avoid Civ7 feature ids).

**Must not own:**
- engine field ids, adapter calls, or any `artifact:map.*` surfaces. (Truth vs projection policy: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`.)

#### Stage 2: `map-ecology` (projection; gameplay-owned)

**Owns:**
- projection from truth artifacts into canonical `artifact:map.*` "map-facing" surfaces (including debug overlays),
- choosing discrete, engine-valid placements based on engine constraints,
- applying/stamping to the Civ7 adapter/engine fields,
- emitting effect tags that downstream gameplay steps (Placement) can depend on.

**Must not own:**
- new physics truths that downstream physics depends on (no backfeeding into truth). (Directionality: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`.)

### Steps vs Ops vs Rules vs Strategies

Use the spec's boundary definitions:
- **Step**: orchestration + publication/effect boundary (dependencies, artifacts, engine calls). (`docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`)
- **Op**: stable, step-callable pure compute/plan contract (no engine, no artifact store). (`docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`)
- **Strategy**: algorithmic variant of one op with identical I/O; selected via op config envelope. (`docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`)
- **Rule**: small heuristic used internally by an op; never exported as a contract surface. (`docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`)

Greenfield boundary decision: prefer **many focused ops** over mega-ops, and prefer **continuous truth outputs** (fields + potentials) over discrete engine placements until the projection lane.

#### Proposed step boundaries (truth stage)

1. `eco-indices` step (truth)
   - Orchestrates ops that derive a coherent ecology index bundle from Hydrology + Morphology truths.
   - Publishes `artifact:ecology.ecoClimate` (see artifact section).

2. `soils` step (truth)
   - Orchestrates soil/pedology ops from ecoClimate + substrate + relief + hydrography.
   - Publishes `artifact:ecology.soils`.

3. `biomes` step (truth)
   - Orchestrates biome + vegetation potential classification ops from ecoClimate + topography + soils.
   - Publishes `artifact:ecology.biomeClassification` and optionally `artifact:ecology.vegetationPotential`.

4. `resource-basins` step (truth)
   - Orchestrates basin identification + scoring ops using routing basins/landmasses + eco/soil signals.
   - Publishes `artifact:ecology.resourceBasins`.

5. `features-intent` step (truth)
   - Orchestrates habitat suitability + intent generation ops (forests/wetlands/reefs/ice/etc).
   - Publishes `artifact:ecology.featureIntents` as engine-agnostic intents.

Notes:
- If we need better observability/gating, split `features-intent` into multiple steps (one per feature family) plus a merge step, but keep each step thin and contract-driven (step vs op rules). (`docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`)

#### Proposed step boundaries (projection stage)

1. `project-ecology` step (projection)
   - Pure projection into `artifact:map.*` surfaces (no adapter writes).
   - Publishes map-facing tile fields (biome id, soil class, feature candidates, diagnostics).

2. `plot-biomes` step (materialization)
   - Writes engine biome fields from `artifact:map.*` (or directly from truth if we skip the intermediate).
   - Provides `effect:map.biomesPlotted` (recommended naming posture) and/or the legacy-equivalent effect tag that Placement currently depends on (see `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`).

3. `plot-features` step (materialization)
   - Chooses discrete engine-valid features from intents + map constraints, applies via adapter.
   - Provides `effect:map.featuresPlotted` (or equivalent).

4. `plot-effects` step (materialization)
   - Applies plot effects/yields/etc derived from truth (biomes/soils/vegetation).
   - Provides `effect:map.plotEffectsPlotted` (or equivalent).

### Core Ops Catalog (Conceptual)

This is a conceptual catalog (ids illustrative). Each op should have a stable I/O contract and be independently testable (op posture: `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`).

#### A) Eco-climate / indices (truth)

- `ecology/derive-eco-climate` (compute)
  - Input: Hydrology climate truth (`artifact:climateField`, `artifact:hydrology.climateIndices`, `artifact:hydrology.climateSeasonality`, `artifact:hydrology.cryosphere`) + Morphology topography/coasts.
  - Output: a compact set of ecology-facing indices (PET, aridity, freeze pressure, growing-season proxy, coastal moisture modifier, etc).
  - Strategies:
    - `minimal` (consume hydrology indices as-is, normalize into one bundle)
    - `topographyAware` (apply lapse-rate / rain-shadow style corrections if available)
  - Rules (internal): clamp/normalize, seasonal aggregation.

#### B) Biomes + potential vegetation (truth)

- `ecology/classify-biomes` (compute)
  - Input: `ecoClimate` indices + topography + soils.
  - Output: biome code per tile (engine-agnostic), plus optional confidence/probabilities for edge blending.
  - Strategies:
    - `koppenLike` (thresholds on temperature/precip seasonality) inspired by Koppen-Geiger style classification. [Peel et al. 2007](https://hess.copernicus.org/articles/11/1633/2007/)
    - `holdridgeLike` (uses precipitation, biotemperature, PET ratio) inspired by Holdridge life zones. [Lugo et al. 1999](https://epa-dccs.ornl.gov/documents/Holdridge_LifeZones.pdf)
    - `continuousFuzzy` (outputs biome mixture weights; projection chooses discrete id later)
  - Rules: edge scoring, neighbor blending, tie-breakers.

- `ecology/compute-vegetation-potential` (compute)
  - Input: ecoClimate + soils + hydrography proximity.
  - Output: potential fractions (tree/shrub/grass), canopy density proxy, wetness stress proxy.
  - Strategies:
    - `pft3` (3 functional types)
    - `pftN` (extensible list of functional types)

#### C) Pedology / soils (truth)

- `ecology/compute-soils` (compute)
  - Input: ecoClimate + Morphology substrate + relief proxies (slope/roughness) + Hydrology hydrography/wetness proxies.
  - Output: soil depth/texture/drainage/fertility proxies (engine-agnostic).
  - Physics-first justification: soils are a function of climate, organisms, relief, parent material, and time (CLORPT). [UKy CLORPT](https://geography.as.uky.edu/node/292253)
  - Strategies:
    - `simple` (few soil classes)
    - `parameterized` (continuous soil properties)
  - Rules: drainage class selection, erosion/deposition adjustments.

#### D) Resource basins (truth)

- `ecology/plan-resource-basins` (plan)
  - Input: landmasses + routing basins + eco/soil signals.
  - Output: basin polygons/regions (tile sets or bbox + membership mask) with stable ids.
  - Strategies:
    - `watershed` (basins from routing accumulation + watershed partition)
    - `landmassGrid` (fallback partitioning on landmasses)

- `ecology/score-resource-basins` (compute)
  - Input: basins + ecoClimate + soils + geology/substrate proxies.
  - Output: per-basin potentials (fertility, biomass, minerals, etc) and per-tile "within basin" gradients.
  - Rule examples: normalize potentials by basin area, penalize steep slope, boost floodplains.

#### E) Feature intent generation (truth)

Key goal: publish **engine-agnostic intents**, not "Civ7 FeatureType = X".

- `ecology/compute-habitat-suitability` (compute)
  - Input: ecoClimate + hydrography + soils + coast distance + bathymetry shelf mask (if available).
  - Output: continuous suitability fields for feature families (forest, wetland, reef, ice, etc).

- `ecology/plan-feature-intents` (plan)
  - Input: suitability fields + biome/veg potential + target densities.
  - Output: discrete intents (tileIndex + featureFamily + strength + optional patch id).
  - Strategies:
    - `patchFirst` (generate contiguous patches then sample tiles)
    - `sampleFirst` (Poisson/blue-noise sampling then optionally grow patches)
  - Rules: min spacing, coast adjacency, elevation band constraints.

#### F) Projection/materialization helpers (gameplay-owned ops, optional)

These can live in a gameplay/projection domain (not physics) because they may encode engine-facing identifiers.

- `map-ecology/project-biome-ids` (compute)
  - Input: `artifact:ecology.biomeClassification` (+ debug knobs).
  - Output: `artifact:map.biomeIdByTile` (engine-facing ids).

- `map-ecology/resolve-feature-placements` (plan)
  - Input: `artifact:ecology.featureIntents` + engine constraint surfaces (tile validity masks, reserved tiles).
  - Output: `artifact:map.featurePlacementPlan` (engine-facing placement list).

### Artifacts + Contracts (Truth vs Projection)

This section is about "what is authoritative" vs "recomputable," aligned to:
- policy: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- spec: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`

#### Truth artifacts (Ecology-owned, `artifact:ecology.*`)

Recommended minimal truth set (tile-first, engine-agnostic):

1. `artifact:ecology.ecoClimate`
   - Tile-indexed ecology indices bundle.
   - Should include enough to classify biomes and compute vegetation/soils without re-reading multiple upstream artifacts.

2. `artifact:ecology.biomeClassification`
   - Tile-indexed biome code in an internal taxonomy (not Civ7 ids).
   - Optional: mixture weights/confidence to support fuzzy boundaries; helps projection avoid ugly hard edges.

3. `artifact:ecology.vegetationPotential` (optional but recommended)
   - Tile-indexed potential vegetation fractions + canopy density proxy.
   - Useful as a stable input for both feature intents and gameplay placement heuristics.

4. `artifact:ecology.soils`
   - Tile-indexed soil parameters (depth/drainage/fertility proxies).
   - Avoid direct yield numbers here; those are gameplay projections.

5. `artifact:ecology.resourceBasins`
   - Basin-level + tile membership + potentials.
   - Critical downstream input to gameplay placement (`docs/system/libs/mapgen/reference/domains/PLACEMENT.md`).

6. `artifact:ecology.featureIntents`
   - Engine-agnostic "what nature wants here" intents (featureFamily + strength), plus optional patch ids.
   - The projection lane decides which become actual engine features under engine constraints.

Truth artifacts should not contain:
- engine ids, adapter handles, or `artifact:map.*` derived surfaces. (`docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`)

#### Projection artifacts (Gameplay-owned, `artifact:map.*`)

Recommended map-facing surfaces (examples):
- `artifact:map.biomeIdByTile` (engine biome id)
- `artifact:map.soilClassByTile` (gameplay soil class id)
- `artifact:map.ecologyFeaturePlan` (engine-facing feature placement plan)
- `artifact:map.ecologyDiagnostics` (debug overlays: aridity index, vegetation density, wetness)

These are explicitly derived/recomputable and should be safe to regenerate from truth.

#### Effects (execution guarantees)

Materialization steps that call the engine adapter must emit boolean effects (effect posture: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`), e.g.:
- `effect:map.biomesPlotted`
- `effect:map.featuresPlotted`
- `effect:map.plotEffectsPlotted`

Downstream gameplay currently depends on engine-facing effect tags (see `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`). In a greenfield posture, prefer `effect:map.*` effects for "stamping happened," and reserve `effect:engine.*` for truly engine-derived guarantees.

### Fit Within Overall Pipeline (Upstream/Downstream)

Stage order context (standard recipe): Ecology runs after Hydrology truth stages and before the projection stages + Placement (`docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`).

#### Upstream dependencies (truth)

Ecology truth should depend on upstream **truth artifacts** only:
- From Morphology (terrain + substrate + routing + coast metrics):
  - `artifact:morphology.topography`, `artifact:morphology.substrate`, `artifact:morphology.routing`, `artifact:morphology.coastlineMetrics`, `artifact:morphology.landmasses` (see `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`).
- From Hydrology (climate + hydrography + indices):
  - `artifact:climateField`, `artifact:hydrology.hydrography`, `artifact:hydrology.climateIndices`, `artifact:hydrology.cryosphere` (see `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md`).

This matches the current Ecology contract directionality (Hydrology + Morphology -> Ecology) and enforces the "projection never feeds truth" rule (`docs/system/libs/mapgen/reference/domains/ECOLOGY.md`, `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`).

#### Downstream consumers

1. `map-ecology` projection/materialization
   - Consumes Ecology truth artifacts and publishes engine-facing fields/effects (as a projection stage; see `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`).

2. Gameplay/Placement
   - Placement is gameplay-owned and explicitly depends on Ecology materialization effects (today: `effect:engine.featuresApplied`) (`docs/system/libs/mapgen/reference/domains/PLACEMENT.md`).
   - In addition, Gameplay planning (resources/wonders/starts) can consume Ecology truth artifacts directly (especially `artifact:ecology.resourceBasins`, and optionally soils/biomes) without coupling to engine stamping.

#### Key invariants to keep stable

- Determinism: ops are pure; steps own all side effects and must run deterministically given inputs. (`docs/system/libs/mapgen/explanation/ARCHITECTURE.md`)
- Truth vs projection: projection outputs remain derived/recomputable and are never used as physics truth. (`docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`)

## Alternative Shape (If Meaningful)

### Alternative: 3-stage split to isolate stamping

If we find `map-ecology` is doing too much (projection + adapter writes + gameplay effects), split projection from stamping:
1. `ecology` (truth)
2. `map-ecology` (projection only; publishes `artifact:map.*` surfaces; no adapter writes)
3. `plot-ecology` (materialization only; adapter writes; emits effects)

Tradeoffs:
- Pros: sharper boundaries; easier to run "no-engine" projections for debugging; isolates effect tags to a small stage.
- Cons: adds pipeline nodes/tags; more config surface; more recipe ordering overhead.

This still respects the same architecture layers model (stages group steps; steps own effects; ops remain pure) but may be overkill unless we repeatedly need "map artifacts without stamping." (Layering: `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`.)

## Why (Physics-First Reasoning)

Ecology is primarily constrained by **energy**, **water**, and **freeze** limits, with **terrain** and **substrate** modulating those constraints at tile scale.

Physics-first modeling stance:
- Treat long-term climate as the driver and derive compact indices that "explain" most of biome/vegetation variation.
  - Example: aridity expressed as an index using precipitation and reference evapotranspiration (AI = P / ET0) is a common dryness measure and supports broad dry-to-humid regime splits. [Global Aridity Index v3 (AI = MA_Prec / MA_ET0)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9287331/)
  - Reference evapotranspiration (ET0) is commonly computed via FAO-56 Penman-Monteith guidance. [FAO-56](https://www.fao.org/4/x0490e/x0490e00.htm)
- Use a climate-classification-like mapping (thresholded or fuzzy) as the stable "biome code" generator, grounded in temperature and precipitation seasonality.
  - Koppen-Geiger is an example of a temperature + precipitation threshold classifier used for global climate types. [Peel et al. 2007](https://hess.copernicus.org/articles/11/1633/2007/)
  - Holdridge is an example of a compact ecology classification tied to annual precipitation, biotemperature, and PET ratio. [Lugo et al. 1999](https://epa-dccs.ornl.gov/documents/Holdridge_LifeZones.pdf)
- Treat soils/pedology as a function of the factors we can actually observe in the pipeline:
  - Climate (hydrology), organisms (vegetation potential), relief (topography/slope/routing), parent material (substrate), and time (approximated via geomorphology proxies if available). This is the CLORPT framing. [UKy CLORPT](https://geography.as.uky.edu/node/292253)

Architecturally, a physics-first posture naturally yields:
- continuous truth artifacts (indices/potentials) that are stable and engine-agnostic,
- and a separate projection/materialization lane that turns those truths into discrete, engine-valid gameplay outputs (features/fields/effects), consistent with the MapGen truth vs projection contract. (`docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`.)

## Open Questions

1. Truth taxonomy: do we want a discrete biome code (single id) or a mixture model (weights) as the canonical truth? Mixture improves transitions but complicates downstream consumers.
2. Soil model granularity: should `artifact:ecology.soils` be continuous (preferred for flexibility) or a small enum for performance/authoring simplicity?
3. Feature intents: what is the minimal "engine-agnostic" intent shape that still supports engine constraint resolution in projection (spacing rules, adjacency constraints, feature conflicts)?
4. Ownership of projection ops: should truth->map projection helpers live in Ecology, or in a Gameplay/projection domain to keep engine-facing ids out of physics domains?
5. Effect naming: Placement currently depends on engine-facing effect tags (see `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`). Do we standardize on `effect:map.*` for stamping and adjust consumers, or keep `effect:engine.*` where the guarantee is "engine state was mutated"?
