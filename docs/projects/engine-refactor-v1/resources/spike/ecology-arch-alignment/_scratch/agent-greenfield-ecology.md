# agent-greenfield-ecology.md

## Objective

Propose a greenfield, physics-first architecture for the **Ecology** portion of the MapGen pipeline that:
- fits the MapGen layers model (domains/ops vs steps vs stages vs recipe) and compile-first posture,
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
  - Reference evapotranspiration (ET0) guidance (FAO-56; Penman-Monteith): https://www.fao.org/4/x0490e/x0490e00.htm
  - Aridity Index definition + common thresholds (AI = mean annual precip / mean annual reference ET0): https://pmc.ncbi.nlm.nih.gov/articles/PMC9287331/
  - Koppen-Geiger climate classification (temperature + precipitation -> climate classes): https://hess.copernicus.org/articles/11/1633/2007/
  - Soil formation factors (CLORPT: climate, organisms, relief, parent material, time): https://geography.as.uky.edu/node/292253
  - Holdridge life zones (compact ecology classification from precipitation/biotemperature/PET ratio): https://epa-dccs.ornl.gov/documents/Holdridge_LifeZones.pdf

## Proposed Greenfield Ecology Architecture

### Recommended Shape (Architecture)

**Keep Ecology as two stages:**
1. `ecology` (truth / physics)
2. `map-ecology` (projection / gameplay + engine materialization)

This matches MapGen's canonical layering and the explicit truth vs projection policy:
- `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
- `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`
- `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`

Greenfield emphasis: define Ecology truth primarily as **continuous physical/ecological state** (energy/water/freeze constraints, vegetation/soil potentials, basin potentials), and defer discrete engine/game choices to the projection/materialization lane.

### Stage Breakdown (Names + Ownership)

#### Stage 1: `ecology` (truth; physics-owned)

Owns:
- deriving ecology-facing **biophysical indices** from Hydrology + Morphology truths,
- biome / potential vegetation classification (engine-agnostic taxonomy),
- soil/pedology classification (engine-agnostic parameters),
- resource basin candidates (engine-agnostic “potential” structures),
- feature **intent fields** (engine-agnostic; no Civ7 feature ids).

Must not own:
- adapter calls, engine ids/objects, or `artifact:map.*` surfaces.
  - See truth vs projection policy: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`.

#### Stage 2: `map-ecology` (projection; gameplay-owned)

Owns:
- projecting truth artifacts into canonical `artifact:map.*` map-facing surfaces,
- resolving intents into **engine-valid** discrete placements under constraints,
- stamping/writing via adapter,
- emitting effect tags for downstream Gameplay/Placement.

Must not own:
- physics truths that other truth stages depend on (no backfeeding into physics).

### Steps vs Ops vs Rules vs Strategies

Use the spec’s boundary definitions:
- **Step**: orchestration + publication/effect boundary (dependencies, artifacts, engine calls). (`docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`)
- **Op**: stable, step-callable pure compute/plan contract (no engine, no artifact store). (`docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`)
- **Strategy**: algorithmic variant of one op with identical I/O; selected by config. (`docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`)
- **Rule**: tiny heuristic internal to an op; never exported as a contract surface. (`docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`)

Greenfield decision: prefer **many focused ops** and continuous truth outputs; keep steps thin and effectful.

#### Proposed step boundaries (truth stage: `ecology`)

1. `eco-indices` (truth)
   - Orchestrates ops that unify upstream climate/terrain into an “ecology-facing” index bundle.
   - Publishes: `artifact:ecology.ecoClimate`.

2. `soils` (truth)
   - Orchestrates soil/pedology ops from ecoClimate + substrate + relief + hydrography.
   - Publishes: `artifact:ecology.soils`.

3. `biomes` (truth)
   - Orchestrates biome + vegetation potential classification from ecoClimate + topography + soils.
   - Publishes: `artifact:ecology.biomeClassification` (+ optionally `artifact:ecology.vegetationPotential`).

4. `resource-basins` (truth)
   - Orchestrates basin identification + scoring from routing basins/landmasses + eco/soil signals.
   - Publishes: `artifact:ecology.resourceBasins`.

5. `features-intent` (truth)
   - Orchestrates habitat suitability + intent generation (forests/wetlands/reefs/ice/etc).
   - Publishes: `artifact:ecology.featureIntents` (engine-agnostic).

If observability/gating matters, split `features-intent` into “one feature family per step” plus `features-merge`, but keep feature planning logic inside ops (not in steps).

#### Proposed step boundaries (projection stage: `map-ecology`)

1. `project-ecology` (projection-only)
   - Produces map-facing `artifact:map.*` surfaces (no adapter writes).

2. `plot-biomes` (materialization)
   - Writes engine biome fields; emits `effect:map.biomesPlotted`.

3. `plot-features` (materialization)
   - Resolves intents into engine features under constraints; emits `effect:map.featuresPlotted`.

4. `plot-effects` (materialization)
   - Applies plot effects derived from truth; emits `effect:map.plotEffectsPlotted`.

Note: Placement currently depends on engine-facing effect tags (see `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`), so effect naming may need a deliberate migration plan.

### Core Ops Catalog (Conceptual)

Conceptual ops (ids illustrative). Each op is stable I/O, pure, and individually testable.

#### A) Eco-climate / indices

- `ecology/derive-eco-climate` (compute)
  - Input: Hydrology climate truths + Morphology topography/coasts.
  - Output: ecology indices bundle (PET proxy, aridity, freeze pressure, growing-season proxy, coastal moisture modifier, etc).
  - Citations:
    - AI = precip / reference ET0 definition + thresholds: https://pmc.ncbi.nlm.nih.gov/articles/PMC9287331/
    - ET0 guidance: https://www.fao.org/4/x0490e/x0490e00.htm

#### B) Biomes + vegetation potential

- `ecology/classify-biomes` (compute)
  - Input: ecoClimate + topography + soils.
  - Output: biome code per tile (engine-agnostic), optionally with mixture/confidence for edges.
  - Strategy inspirations (not prescriptions):
    - Koppen-like thresholds: https://hess.copernicus.org/articles/11/1633/2007/
    - Holdridge-like triplet: https://epa-dccs.ornl.gov/documents/Holdridge_LifeZones.pdf

- `ecology/compute-vegetation-potential` (compute)
  - Input: ecoClimate + soils + hydrography proximity/wetness proxies.
  - Output: potential fractions (tree/shrub/grass), canopy density proxy, wetness stress proxy.

#### C) Pedology / soils

- `ecology/compute-soils` (compute)
  - Input: ecoClimate + substrate (parent material proxy) + relief + wetness.
  - Output: soil depth/texture/drainage/fertility proxies.
  - Framing: soils depend on climate, organisms, relief, parent material, time (CLORPT): https://geography.as.uky.edu/node/292253

#### D) Resource basins

- `ecology/plan-resource-basins` (plan)
  - Input: landmasses + routing basins + eco/soil signals.
  - Output: basin regions (tile membership mask or compact region representation) + stable ids.

- `ecology/score-resource-basins` (compute)
  - Input: basins + ecoClimate + soils + substrate proxies.
  - Output: per-basin potentials + within-basin gradients.

#### E) Feature intents

- `ecology/compute-habitat-suitability` (compute)
  - Input: ecoClimate + hydrography + soils + coast distance + shelf/bathymetry if available.
  - Output: continuous suitability fields per feature family.

- `ecology/plan-feature-intents` (plan)
  - Input: suitability + biome/veg potential + target densities.
  - Output: discrete intents (tileIndex + featureFamily + strength + optional patch id).

#### F) Projection/materialization helpers (gameplay-owned)

These may live outside physics because they can encode engine ids and engine constraints:
- `map-ecology/project-biome-ids` (compute): truth biome -> `artifact:map.biomeIdByTile`
- `map-ecology/resolve-feature-placements` (plan): intents + constraints -> `artifact:map.ecologyFeaturePlan`

### Artifacts + Contracts (Truth vs Projection)

Aligned to:
- policy: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- spec posture (truth artifacts vs projection artifacts vs effects): `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`

#### Truth artifacts (Ecology-owned, `artifact:ecology.*`)

Recommended minimal truth set (tile-first, engine-agnostic):
- `artifact:ecology.ecoClimate` (indices bundle: aridity/freezing/growing-season/PET proxy/etc)
- `artifact:ecology.soils` (soil parameter fields; no engine ids)
- `artifact:ecology.biomeClassification` (engine-agnostic taxonomy; optionally mixture/confidence)
- `artifact:ecology.vegetationPotential` (optional but high leverage for features + placement)
- `artifact:ecology.resourceBasins` (basin regions + potentials)
- `artifact:ecology.featureIntents` (engine-agnostic featureFamily intents + strength/patch id)

Truth artifacts should not contain:
- engine ids, adapter handles, or any `artifact:map.*` derived surfaces.

#### Projection artifacts (Gameplay-owned, `artifact:map.*`)

Recommended derived/recomputable map-facing surfaces:
- `artifact:map.biomeIdByTile` (engine biome id)
- `artifact:map.soilClassByTile` (gameplay soil class id)
- `artifact:map.ecologyFeaturePlan` (engine-facing placement plan)
- `artifact:map.ecologyDiagnostics` (debug overlays: aridity, vegetation density, wetness, etc)

#### Effects (execution guarantees)

Adapter-touching steps emit boolean “stamping happened” effects (spec posture):
- `effect:map.biomesPlotted`
- `effect:map.featuresPlotted`
- `effect:map.plotEffectsPlotted`

Downstream Gameplay/Placement may additionally require legacy engine-facing effects (today: `effect:engine.featuresApplied`; see `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`).

### Fit Within Overall Pipeline (Upstream/Downstream)

Stage order context (standard recipe): `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md` (Ecology after Hydrology truth; before `map-*` projection stages + Placement).

#### Upstream dependencies (truth)

Ecology truth depends on upstream **truth** artifacts only:
- Morphology: topography/substrate/routing/coast metrics/landmasses
  - See contract + invariants: `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`
- Hydrology: climate fields/indices/hydrography/cryosphere
  - See contract + artifacts: `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md`

This matches the Ecology reference contract directionality: `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`.

#### Downstream consumers

- `map-ecology` (projection/materialization):
  - consumes Ecology truth artifacts and publishes engine-facing fields/effects (`docs/system/libs/mapgen/reference/domains/ECOLOGY.md`).
- Gameplay/Placement:
  - currently depends on Ecology materialization effects (`docs/system/libs/mapgen/reference/domains/PLACEMENT.md`),
  - and can also consume Ecology truth artifacts directly (especially `artifact:ecology.resourceBasins`) without coupling to stamping.

## Alternative Shape (If Meaningful)

### Alternative: 3-stage split to isolate stamping

If `map-ecology` becomes too overloaded (projection + adapter writes + effects), split it:
1. `ecology` (truth)
2. `map-ecology` (projection-only; publish `artifact:map.*`; no adapter writes)
3. `plot-ecology` (materialization-only; adapter writes; emits effects)

Tradeoffs:
- Pros: sharp separation; easier to run/debug “projection-only” mode; isolates effect tags.
- Cons: more pipeline nodes and config surface; more recipe ordering overhead.

## Why (Physics-First Reasoning)

Ecology is primarily constrained by **energy**, **water**, and **freeze**, with terrain/substrate modulating those constraints at tile scale.

Physics-first reasoning (used to justify truth artifacts + op boundaries):
- A compact “dryness” regime signal can be captured via **Aridity Index** (AI = precip / reference ET0) which supports broad dry-to-humid splits and is widely used in climate/ecology contexts:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC9287331/
- Reference evapotranspiration (ET0) has canonical compute guidance (FAO-56), giving us a credible conceptual hook even if we approximate it in procedural generation:
  - https://www.fao.org/4/x0490e/x0490e00.htm
- Biome/climate classification can be viewed as a function of long-term temperature + precipitation (thresholded or fuzzy):
  - Koppen-Geiger paper framing: https://hess.copernicus.org/articles/11/1633/2007/
  - Holdridge as an ecology-oriented compact classifier: https://epa-dccs.ornl.gov/documents/Holdridge_LifeZones.pdf
- Soils (pedology) are controlled by the factors we already model upstream: climate + organisms + relief + parent material + time (CLORPT), which maps cleanly onto Hydrology/Morphology + vegetation potential:
  - https://geography.as.uky.edu/node/292253

Architectural consequence:
- publish stable, continuous **truth** artifacts (indices/potentials/basins/intents),
- then let Gameplay/projection steps resolve them into discrete, engine-valid placements (fields/features/effects),
consistent with `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`.

## Open Questions

1. Truth taxonomy: discrete biome code vs mixture weights as canonical truth?
2. Soil model: continuous parameters vs small enum classes?
3. Feature intent shape: what is the minimal engine-agnostic intent schema that still supports constraint-based resolution?
4. Where to host projection helpers: inside Ecology vs a Gameplay/projection module to keep engine ids out of physics?
5. Effect naming migration: Placement depends on engine-facing effects today (`docs/system/libs/mapgen/reference/domains/PLACEMENT.md`); do we standardize on `effect:map.*` for stamping and adjust consumers?
