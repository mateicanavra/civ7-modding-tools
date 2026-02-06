# PLAN — No-legacy Foundation ↔ Morphology refactor (2026-02-05)

## Summary

This plan converts the current “looks wired but behaves unchanged” posture into a **single causal spine**:

- **Foundation** produces a non-degenerate continent/basin truth signal and era/provenance fields that materially affect downstream outcomes.
- **Morphology** consumes Foundation truth as the primary driver for continents and landmask coherence; tectonic belts/drivers modulate and refine, and noise is strictly secondary flavor.
- **Observability** becomes a correctness harness: dumps + metrics gate degeneracy and dead-lever regressions.

This plan is intentionally **no-legacy**: any legacy-independent “truth” (ocean basin separation, noise-first landmask) is deleted or redefined as a derived view of Foundation truth.

## Forward Runbook (Start Here)

Only future-facing implementation work remains:

### Phase A — Foundation truth normalization + degeneracy elimination
- Make crust truth continuous and non-degenerate for canonical probes.
- Ensure provenance resets are materially present and calibrated to observed forcing ranges.

### Phase B — Morphology landmask re-grounding on Foundation truth
- Replace threshold/noise-dominant landmask behavior with crust-truth-driven continent potential.
- Ensure coherence gates (components and largestLandFrac) become pass conditions.

### Phase C — Belt-driver modulation cleanup
- Keep belts as modifiers for mountains/coasts/islands, not the primary landmass generator.
- Remove or constrain any hidden re-thresholding that shreds land connectivity.

### Phase D — Observability hardening as enforcement
- Use diagnostics tooling as regression gates.
- Promote required acceptance checks into routine verification for each refactor slice.

## Execution Baseline

Deterministic probe (`106×66 seed=1337`) demonstrates:
- `morphology-coasts.landmass-plates` landmask components: **434** (high speckle)
- `foundation.crustTiles.type` stats: `min=max=1` (continent signal saturated / degenerate)

Use these commands for verification/regression checks:
- `bun run --cwd mods/mod-swooper-maps diag:dump -- 106 66 1337 --label probe-baseline`
- `bun run --cwd mods/mod-swooper-maps diag:analyze -- <runDir>`
- `bun run --cwd mods/mod-swooper-maps diag:list -- <runDir> --dataTypeKey foundation.crustTiles.type`

## Non-negotiables (physics-first, maximal realism)

- Foundation is the only source of tectonic “truth”.
- Morphology must be grounded in Foundation (no parallel legacy truth).
- Noise is allowed only as *secondary* diversity; it must not create continents.
- Every authored input must be either:
  - physics input (initial conditions / constitutive parameters / simulation horizon), or
  - a semantic “knob” scaling physics inputs (never output sculpting).
- Every Foundation output is either:
  - consumed correctly downstream, or
  - deleted, or
  - explicitly deferred with trigger + rationale.

## Contract vNext (decision-complete)

### Foundation “crust truth” contract

Foundation must expose **continuous** crust truth fields, and all categorical labels must be derived:

- Canonical continuous truth (examples; exact names may map to existing arrays):
  - `maturity01` (0..1)
  - `thickness01` (0..1)
  - `thermalAge01` (0..1) or age proxy
  - `damage01` (0..1)
  - `buoyancy01` (0..1)
  - `strength01` (0..1)

- Derived labels (views, not truth):
  - `isContinental` derived from `maturity01` + `buoyancy01` + `strength01`
  - `cratonCoreMask` derived from high maturity + low disruption + long provenance age

**Invariant:** derived labels must be non-degenerate for earthlike presets (no `min=max` for tile projections).

### Foundation provenance contract

Provenance is a first-class physics constraint, not just metadata:
- `originEra`, `originPlateId`, `lastBoundaryEra`, `lastBoundaryType`, `driftDistance`
- Resets must trigger at realistic rates (rift/subduction/collision thresholds calibrated to observed driver ranges).

**Invariant:** provenance resets must occur in every canonical probe run (non-zero count; non-trivial spatial structure).

### Morphology consumption contract

Morphology must treat:
- crust truth + provenance as the **primary** landmass/continent/basin structure
- belt/tectonic drivers as modifiers (mountains, rugged coasts, island chains)

Morphology may not:
- use pure elevation thresholding on noise-dominated fields as the primary land/water classifier
- invent independent “basin separation truth” not grounded in Foundation

## What must be removed (explicit, no hand-waving)

### Legacy / noise-first landmask posture

Remove or redefine (as derived post-process) any logic where:
- the landmask is primarily a local threshold on a noisy elevation field, and/or
- continent-scale structure is not anchored to crust truth.

Primary targets (anchors for the refactor):
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/strategies/default.ts`
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/strategies/default.ts` (noise terms must be demoted to secondary flavor)

### Hidden reclassification of land/water during erosion

Constrain or remove geomorphology behavior that shreds connectivity by re-thresholding land/water as a side effect.

Anchor:
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/steps/geomorphology.ts`

### Dead-lever class (normalization traps)

Remove or redesign parameter surfaces where amplitude knobs are canceled out by normalization.

Anchor example:
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-mantle-potential/index.ts` (`normalizeSigned`)

## What must be replaced (explicit replacements)

### Replace discrete `crust.type` as truth

Current issue: `foundation.crustTiles.type` is saturated (uniform).

Replacement:
- Treat discrete `type` as a **derived view** over continuous fields.
- Recalibrate crust evolution so that:
  - maturity is not dominated globally by “materialAge” without disruptive suppression,
  - disruption signals meaningfully suppress maturity and increase damage,
  - provenance resets (rift/subduction/collision) occur at observed driver magnitudes.

Primary anchor:
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts` (maturity formula + threshold)

### Replace landmask algorithm with a continent-scale classifier grounded in crust truth

Replacement algorithm posture (decision-complete, implementation-independent):
1) Define a **continent potential field** as a low-frequency function of crust truth:
   - dominated by `buoyancy01`, `maturity01`, `thickness01`, and provenance stability
   - explicitly *not* dominated by local noise
2) Choose sea level against that potential (physics-first targets are allowed only as derived from crust truth).
3) Produce landmask from the low-frequency potential first; then apply high-frequency flavor (noise) only to coast shaping.
4) Ensure belts and uplift drivers modulate topography after land is coherently established (no “belts on noise continents”).

## What must be rethought from first principles

### “Continent emergence” mechanism

The current behavior implies a mismatch between intended emergent continents and the implemented maturity/provenance dynamics.

First-principles posture:
- continents emerge from long-lived, stable, thickened crust (craton cores) + buoyancy
- disruption (rift, shear, subduction recycling) prevents uniform maturation

This requires:
- a provenance reset model calibrated to actual driver signals
- a maturity evolution model that yields multi-modal distributions (oceanic vs continental vs craton cores), not saturation

## Phase criteria (aligned to Forward Runbook)

Each phase deletes legacy paths as it lands; no dual implementation paths.

### Phase A — Foundation truth normalization + degeneracy gates
- Make `crust.type` derived (or delete it as a primary state); ensure tile projections are non-degenerate.
- Add invariants:
  - `foundation.crustTiles.type` not uniform
  - maturity/age distributions non-trivial
  - provenance reset frequency non-zero

### Phase B — Morphology landmask grounded in crust truth
- Replace the primary landmask classifier with the continent potential posture above.
- Ensure geomorphology cannot silently destroy connectivity unless explicitly intended.
- Gate: connected-components and largestLandFrac must improve for earthlike baselines.

### Phase C — Belt drivers as modifiers (unified spine)
- Ensure beltDrivers modulate mountain building and ruggedness without becoming the primary land/water generator.
- Confirm consumers (coasts/features/mountains) all consume the same beltDrivers artifact.

### Phase D — Observability hardening
- Make dump-first metrics a required harness for regression prevention:
  - store canonical probe run commands in docs
  - add CI-adjacent checks for degeneracy gates

## Matrix — Foundation outputs → consumers → disposition

Legend:
- **Class**: `truth` | `derived` | `projection` | `legacy`
- **Disposition**: `keep` | `delete` | `defer`

| Output (artifact) | Class | Primary consumers | Disposition | Notes |
|---|---|---|---|---|
| `foundationArtifacts.mesh` | truth | Foundation ops/steps | keep | canonical mesh space |
| `foundationArtifacts.mantlePotential` | truth | mantleForcing | keep | watch for normalization traps |
| `foundationArtifacts.mantleForcing` | truth | crust, plateMotion, tectonics | keep | must be causal |
| `foundationArtifacts.crustInit` | truth | plateGraph, tectonics, crustEvolution | keep | t=0 basaltic lid |
| `foundationArtifacts.crust` | truth | projection (crustTiles), downstream via projection | keep | continuous truth is canonical |
| `foundationArtifacts.plateGraph` | derived | plateMotion, tectonics, projection | keep | segmentation should be conditioned by crust truth |
| `foundationArtifacts.plateMotion` | derived | tectonics, projection | keep | ensure morphology consumes only derived projections, not raw tensors |
| `foundationArtifacts.tectonicSegments` | derived | tectonics | keep | intermediate for event mechanics |
| `foundationArtifacts.tectonicHistory` | truth/derived | crustEvolution, projection | keep | must materially affect crust truth |
| `foundationArtifacts.tectonicProvenance` | truth/derived | crustEvolution, projection | keep | resets must be non-trivial |
| `foundationArtifacts.tectonics` | derived | crustEvolution, projection | keep | mesh-space drivers |
| `foundationArtifacts.plates` | projection | projection, morphology-features (islands/volcanoes), foundation plateTopology | keep | ensure semantics align with beltDrivers posture |
| `foundationArtifacts.tileToCellIndex` | projection | projection | keep | keep as a canonical projection/debug seam (tile↔cell mapping) |
| `foundationArtifacts.crustTiles` | projection | morphology-coasts landmass | keep | must be non-degenerate; `type` becomes derived view |
| `foundationArtifacts.tectonicHistoryTiles` | projection | morphology-coasts landmass | keep | era-indexed drivers |
| `foundationArtifacts.tectonicProvenanceTiles` | projection | morphology-coasts landmass | keep | provenance stability inputs |
| `foundationArtifacts.plateTopology` | derived | foundation-only | defer | defer unless a downstream consumer requires explicit topology; trigger: morphology or other domains need stable plate adjacency not already encoded in `plates.*` projections |

## Consumer map (code-anchored)

This map captures “who reads what” in `mods/mod-swooper-maps`:

- `foundationArtifacts.mesh`
  - required by: `foundation/steps/{mantlePotential,mantleForcing,crust,plateGraph,plateMotion,tectonics,crustEvolution,projection}.*`
  - provided by: `foundation/steps/mesh.*`
- `foundationArtifacts.mantlePotential`
  - provided by: `foundation/steps/mantlePotential.*`
  - consumed by: `foundation/steps/mantleForcing.*`
- `foundationArtifacts.mantleForcing`
  - provided by: `foundation/steps/mantleForcing.*`
  - consumed by: `foundation/steps/{crust,plateMotion,tectonics}.*`
- `foundationArtifacts.crustInit`
  - provided by: `foundation/steps/crust.*`
  - consumed by: `foundation/steps/{plateGraph,tectonics,crustEvolution}.*`
- `foundationArtifacts.crust`
  - provided by: `foundation/steps/crustEvolution.*`
  - consumed by: `foundation/steps/projection.*` (via `compute-plates-tensors`)
- `foundationArtifacts.plateGraph`
  - provided by: `foundation/steps/plateGraph.*`
  - consumed by: `foundation/steps/{plateMotion,tectonics,projection}.*`
- `foundationArtifacts.plateMotion`
  - provided by: `foundation/steps/plateMotion.*`
  - consumed by: `foundation/steps/{tectonics,projection}.*`
- `foundationArtifacts.tectonicSegments`
  - provided/consumed within: `foundation/steps/tectonics.*` (intermediate artifact required by the step)
- `foundationArtifacts.tectonicHistory`
  - produced by: `foundation/steps/tectonics.*`
  - consumed by: `foundation/steps/{crustEvolution,projection}.*`
- `foundationArtifacts.tectonicProvenance`
  - produced by: `foundation/steps/tectonics.*`
  - consumed by: `foundation/steps/{crustEvolution,projection}.*`
- `foundationArtifacts.tectonics`
  - produced by: `foundation/steps/tectonics.*`
  - consumed by: `foundation/steps/{crustEvolution,projection}.*`
- `foundationArtifacts.plates`
  - produced by: `foundation/steps/projection.*` (tile-space driver tensors)
  - consumed by:
    - `foundation/steps/plateTopology.*`
    - `morphology-features/steps/{islands,volcanoes}.*`
- `foundationArtifacts.crustTiles`, `foundationArtifacts.tectonicHistoryTiles`, `foundationArtifacts.tectonicProvenanceTiles`
  - produced by: `foundation/steps/projection.*`
  - consumed by: `morphology-coasts/steps/landmassPlates.*`
- `foundationArtifacts.tileToCellIndex`
  - produced by: `foundation/steps/projection.*`
  - currently only used as a projection/debug seam (no downstream consumers found)
- `foundationArtifacts.plateTopology`
  - produced by: `foundation/steps/plateTopology.*`
  - currently no downstream consumers found

## Matrix — Morphology inputs → source classification → action

| Step / op seam | Inputs | Source | Classification | Required action |
|---|---|---|---|---|
| `morphology-coasts.landmass-plates` | `crustTiles`, `tectonicHistoryTiles`, `tectonicProvenanceTiles`, `beltDrivers` | Foundation projections + Morphology artifact | physics-backed (+ derived) | Make continent potential/crust truth the **primary** driver for land/water; treat beltDrivers as modifiers; ensure outputs are coherence-gated. |
| `morphology-coasts.rugged-coasts` | `beltDrivers`, `topography` | Morphology artifact + Morphology truth | derived | Keep; ensure ruggedness follows beltDrivers and cannot dominate land/water classification. |
| `map-morphology.plot-mountains` | `beltDrivers`, `topography` | Morphology artifact + Morphology truth | derived | Keep; mountains are a modifier layered on coherent continents (no “belts on noise land”). |
| `morphology-features.islands` | `foundation.plates`, `topography` | Foundation projection + Morphology truth | physics-backed (+ derived) | Keep; ensure island generation is constrained by tectonic drivers and coast context (not random-only). |
| `morphology-features.volcanoes` | `foundation.plates`, `topography` | Foundation projection + Morphology truth | physics-backed (+ derived) | Keep; ensure volcanism follows rift/subduction driver fields. |
| `compute-base-topography` | `crustTiles.{baseElevation,buoyancy,strength,type}` (+ modifiers) | Foundation projection | physics-backed | Demote noise to secondary; base topography must reflect continent potential as low-frequency structure. |
| `compute-landmask` | elevation + sea level | Morphology derived | derived | Replace threshold-first posture: landmask must be grounded in crust truth potential; avoid noise-dominated thresholding. |
| `geomorphology` (erosion) | topography | Morphology derived | derived | Constrain reclassification: erosion should sculpt; land/water should not silently fragment as a side effect. |

## Required dump-first acceptance checks

These are mandatory for verifying the refactor:

- `foundation.crustTiles.type` not uniform (`min != max`)
- landmask coherence improves vs current baseline:
  - landmass-plates components drop materially
  - largestLandFrac rises materially
- meaningful knob/physics changes produce non-trivial A/B hamming where expected (dead levers eliminated)
