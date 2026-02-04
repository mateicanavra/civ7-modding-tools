# SPIKE: M1 “Pipeline Realism” Regression — Foundation ↔ Morphology ↔ Viz

Date: 2026-02-04  
Branch audited: `agent-URSULA-M1-LOCAL-TBD-PR-M1-025-delete-dual-engine-shadow-compute-paths-after-suite_is_green`  
Preset lens: `mods/mod-swooper-maps/src/presets/standard/earthlike.json` (`maximal-basaltic-lid-v1`, `maximal-potential-v1`)

## 1) Objective

Diagnose why the post-M1 “pipeline realism” output regressed (spread-out landforms, weak tectonic character, plate movement/history not visible), by comparing:

- **Intended model** (M1 milestone + canonical SPEC/decisions + original proposal packets), vs
- **Actual implementation** currently running in the pipeline (Foundation + Morphology + Studio viz taxonomy).

This is **diagnosis only** (no fixes).

## 2) What we intended (normative requirements)

Primary sources:

- Milestone: `docs/projects/pipeline-realism/milestones/M1-foundation-maximal-cutover.md`
- Canonical SPEC: `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md`
- Key decisions:
  - D01 ordering: `docs/projects/pipeline-realism/resources/decisions/d01-ordering-crust-vs-plates.md`
  - D05r crust truth + evolution: `docs/projects/pipeline-realism/resources/decisions/d05r-crust-state-canonical-variables.md` and `docs/projects/pipeline-realism/resources/spec/sections/crust-state.md`
  - D06r events are causal + must update state: `docs/projects/pipeline-realism/resources/decisions/d06r-event-mechanics-and-force-emission.md`
  - D07r Morphology consumption: `docs/projects/pipeline-realism/resources/decisions/d07r-morphology-consumption-contract.md` and `docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md`
- Proposal packets (why cratons/differentiation matter):
  - Authoritative proposal D: `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/foundation-refactor-proposal.md`
  - “First-principles crustal evolution”: `docs/projects/pipeline-realism/resources/packets/foundation-proposals/first-principles-crustal-evolution.md`
  - Comparison scaffold: `docs/projects/pipeline-realism/resources/spec/proposal-comparison-foundation-evolutionary-refactor.md`

**Intent checklist (condensed):**

1. **Start from an ocean world basaltic lid** (oceanic crust everywhere at t=0; `maturity=0`, `thermalAge=0`, `type=oceanic`).  
   (D05r + `spec/sections/crust-state.md`)
2. **Continents emerge by evolution**, not pre-painting: subduction/arc accretion + collisions create cratons; rifts reset; transforms damage; plumes thicken basaltic plateaus.  
   (proposal + D05r + D06r)
3. **Eras are first-class and bounded** (per-era budgets, deterministic).  
   (SPEC + M1 milestone)
4. **Events are causal**: event semantics must drive (a) era fields and (b) **state changes**, including crust truth and provenance.  
   (D06r)
5. **Morphology landmask + belts** should read the new **era + provenance** projections to produce coherent continents and belt-like orogeny (no wall mountains).  
   (D07r + `spec/sections/morphology-contract.md`)
6. **Viz is part of the causal spine**: it must let authors see `config → mantle → plates → events → provenance → morphology`.  
   (M1 milestone + `spec/sections/visualization-and-tuning.md`)

## 3) What the pipeline actually does today (code truth)

### 3.1 Foundation: mantle forcing + plate motion + history exist, but crust evolution does not

**Stage ordering matches the new spine** (Foundation is now “mesh → mantlePotential → mantleForcing → crust → plateGraph → plateMotion → tectonics → projection”):

- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`

**Crust truth exists as fields but is effectively “t=0 only” and cannot produce continents:**

- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts`
  - `maturitySeed = ... * 0.25` (hard cap: `maturity ≤ 0.25`) and `type = (maturity ≥ 0.55) ? 1 : 0`
    - This makes `crust.type` **always oceanic** for the default strategy.
  - `thermalAge` is initialized to `0` for all cells, and there is no per-era aging path here.

**Tectonic history emits per-era fields + provenance resets, but does not update crust truth variables (`maturity/thickness/thermalAge/damage`) at all:**

- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts`
  - Enforces `ERA_COUNT_TARGET = 5` (minimum) and builds 5 eras from events.
  - Builds events (subduction/collision/rift/transform/hotspot), emits per-era fields, and updates provenance scalars (`originEra`, `lastBoundary*`), but **does not write back into crust**.

**Plate graph partitioning is “resistance aware”, but with a uniform crust it degenerates toward the old look:**

- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts`
  - Resistance is derived from `crust.strength` and seed quality uses `crust.strength/maturity`.
  - With crust state not evolving and (effectively) not producing stable cratons, the partition looks like “plates exist, but not because continents evolved.”

### 3.2 Projection: movement/history/provenance are present, but many are “debug” visibility

Plate tensor projection includes **movement** fields (`movementU/movementV/rotation`) and history/provenance tiles are produced:

- Model projection: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts`
- Stage dumping + viz meta: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts`
  - `foundation.plates.tileMovement*` layers are emitted with `visibility: "debug"`.

### 3.3 Morphology: hybrid cutover (mountains use history/provenance; landmask does not)

**Landmask/topography seeding still consumes only legacy tile drivers (`foundation.plates`, `foundation.crustTiles`):**

- Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts`
- Implementation: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.ts`

This step:

1. Builds base elevation from `crustTiles.baseElevation` plus boundary uplift/rift/closeness plus noise:
   - `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/rules/index.ts`
2. Computes sea level under constraints that include `continentalFraction`, which depends on `crustType==1`:
   - `mods/mod-swooper-maps/src/domain/morphology/ops/compute-sea-level/rules/index.ts`

Given `compute-crust` makes `crust.type` effectively always oceanic, the **continental constraint becomes unsatisfiable**, and the resulting landmask is driven primarily by a narrow elevation distribution + noise + boundary bias.

**Mountains/belts, however, now use history/provenance (D07r partially landed):**

- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains.contract.ts` (requires `foundation.tectonicHistoryTiles`, `foundation.tectonicProvenanceTiles`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains.ts` (derives belts via `beltDrivers.ts`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/beltDrivers.ts`

Net: **mountain belts can be “new-model” while continents/landmask are still “old-model”**, producing incoherent results (belts with weak coupling to landmass).

## 4) Divergence matrix (intent vs reality)

| Area | Intended (docs) | Actual (code) | Impact / symptom |
|---|---|---|---|
| Basaltic lid init | Uniform oceanic lid at t=0; *continents emerge later* | `compute-crust` seeds nonzero maturity/damage but hard-caps maturity ≤ 0.25; `type` never becomes continental | No cratons/continents can ever exist “as crust”; morphology’s continental expectations fail |
| Crust evolution over eras | D05r event hooks update `maturity/thickness/thermalAge/damage` every era (`spec/sections/crust-state.md`) | `compute-tectonic-history` emits events/fields/provenance but never updates crust truth arrays | “Physics-first” story isn’t realized: events have no material consequences |
| Per-cell age semantics | Thermal age increments and resets under rift/subduction; should be visible in oceans | `thermalAge` is 0 everywhere; provenance `crustAge` is derived from `originEra` (a different semantic) | Age signals are degenerate/misleading; morphology substrate/sea-level constraints behave oddly |
| Era count control | “Manage eras/iterations” (SPEC posture) | `compute-tectonic-history` enforces `eraCount >= 5` (ERA_COUNT_TARGET) | Authoring can’t reduce era budgets; harder to tune/debug quickly |
| Morphology landmask uses history | Morphology should consume history+provenance tiles (D07r + migration slice 03) | Landmask/topography seeding uses only `foundation.plates` + `foundation.crustTiles` | Continents don’t reflect tectonic history; land becomes noise-thresholded and “spread out” |
| Morphology belts use history | Belt synthesis should use eras+provenance | Mountains do use `tectonicHistoryTiles` + `tectonicProvenanceTiles` | Hybrid outputs: belts “new”, landmask “old” → incoherent macro geography |
| Plate movement visibility | Authors should be able to see motion | Movement layers exist but are tagged debug in projection; Studio hides debug layers by default | “I can’t see plates move” even when fields exist |

## 5) Why the map looks “spread out” (explicit causal chain)

The regression is a predictable outcome of the basaltic-lid cutover **without** the matching D05r+D07r wiring:

1. `compute-crust` produces an essentially uniform basaltic lid and **never crosses the continent threshold** (`maturity` capped; `type` always oceanic).  
   → downstream sees “no continents” in crust drivers.
2. `compute-base-topography` maps `crustTiles.baseElevation` (narrow range) into a narrow `Int16` elevation field, then adds boundary bias + noise.  
   → elevation distribution becomes **noise-dominated** at macro scale.
3. `compute-sea-level` tries to hit `targetWaterPercent` and optional constraints like `continentalFraction`. With `crustType==1` absent, the continental constraint can’t be satisfied.  
   → sea level becomes largely a quantile of a narrow/noisy field.
4. `compute-landmask` thresholds elevation vs sea level.  
   → land appears as scattered regions around noise peaks / boundary-biased corridors (“spread out landforms”), not as coherent merged continents.
5. Separately, mountains/belts can look “somewhat tectonic” because they now read history/provenance, but they’re being applied atop a landmask that was not derived from the same causal drivers.  
   → reduced realism and “tacked-on” tectonic character.

## 6) Why plates/history feel invisible (viz diagnosis)

Two distinct issues are conflated in the symptoms:

1. **Visibility gating:** MapGen Studio hides `visibility: "debug"` layers unless the user toggles “Show debug layers”.
   - Default is `showDebugLayers = false`: `apps/mapgen-studio/src/features/viz/vizStore.ts`
   - Debug layers are filtered out when the toggle is off: `apps/mapgen-studio/src/features/viz/useVizState.ts`
   - The UI exposes a bug-icon toggle: `apps/mapgen-studio/src/ui/components/ExplorePanel.tsx`
   - Many plate motion layers are marked debug: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts`
2. **Degenerate/unfinished physics:** even if you show debug layers, you won’t see continent emergence or meaningful per-cell crust aging because crust evolution is not implemented.

## 7) “Was the fundamental mistake the spec (plate partitioning) vs craton formation?”

### What the original research/proposals said

Both the authoritative proposal and the crustal evolution packet are explicit:

- Continents/cratons are **manufactured by evolution**, primarily via subduction-related differentiation + arc accretion, then collision welding.  
  (`.../foundation-refactor-proposal.md`, `.../first-principles-crustal-evolution.md`)

### What the chosen SPEC/decisions require

The current canonical decision set is already **craton-first / crust-first in spirit**:

- D01 chooses **crust-first resistance partition** (weak zones guide boundaries; cratons resist splitting).
- D05r requires crust truth to **evolve across eras** via event hooks, and includes explicit distribution invariants requiring non-zero continent/craton fractions.  
  (`docs/projects/pipeline-realism/resources/spec/sections/crust-state.md`)
- D06r explicitly requires event semantics to drive **state updates**, not just fields.

### What the implementation actually behaves like

In practice, today’s implementation is closer to the failure mode you’re worried about:

- It **has partitioning** and **has per-era fields**, but
- it does **not** have craton/continent formation because crust truth never evolves, and maturity is hard-capped such that “continental type” never appears.

So the deepest problem is not that the canonical SPEC forbids craton formation; it’s that the current code path effectively **implements a plate-partitioning + field-emission system without the material-evolution half** that makes continents/tectonic realism emerge.

If you still believe “partitioning first” is architecturally wrong, the best-supported critique (from the packets) is:

- Without a material evolution model (cratons that are buoyant/strong and persist), resistance-aware partitioning cannot produce Earthlike continent behavior; it will always be a segmentation algorithm on a lid.
- Therefore *even a correct partitioner* can’t recover realism unless craton/differentiation is implemented as first-class and feeds both partitioning and morphology.

## 8) Risks and open questions

1. **Is the `maturitySeed * 0.25` cap intentionally a “lid-only placeholder” or an accidental permanent clamp?**  
   If it’s a placeholder, Morphology must not rely on crust-derived continental constraints until evolution is implemented.
2. **Should `crustTiles` project additional truth fields (maturity/thickness/thermalAge/damage) to support Morphology landmask and substrate?**  
   D05r + visualization spec suggest “yes”, but current projection only includes derived drivers.
3. **Do we want `eraCount` hard-min=5 in compute-tectonic-history, or should authoring allow fewer eras for iteration?**
4. **Hybrid coherence:** mountains can now be “new driver”, but landmask is not; until landmask consumes the same causal spine, the end result will keep feeling fake.

## 9) Minimal experiments (to validate the diagnosis quickly)

No code changes required:

1. In MapGen Studio, toggle **Show debug layers** and inspect:
   - `foundation.plates.tileMovement` (vector field)
   - `foundation.crustTiles.type` (expect all oceanic if `maturity` never crosses threshold)
2. Run a local viz dump (writes under `mods/mod-swooper-maps/dist/visualization/`):
   - `bun run --cwd mods/mod-swooper-maps viz:foundation 106 66 123`
   - Validate:
     - `continent fraction = count(crustTiles.type==1)/N` (expected ~0 under current compute-crust)
     - landmask connected component size distribution (expected many small components)

