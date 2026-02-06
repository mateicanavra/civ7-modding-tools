# IMPLEMENTATION PLAN — No-legacy Foundation ↔ Morphology refactor (2026-02-05)

Last hardened: 2026-02-06

## Canonical Sources (Normative)

Treat these as the source of truth for “what maximal means”:

- Canonical target architecture: `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md`
- Decision set index (normative): `docs/projects/pipeline-realism/resources/decisions/README.md`
- Spec-to-code delta diagnosis: `docs/projects/pipeline-realism/resources/research/SPIKE-m1-foundation-realism-regression-2026-02-04.md`
- Milestone plan-of-record (what we tried to land in M1; useful for scope/acceptance framing, not a “remaining work” checklist):
  - `docs/projects/pipeline-realism/milestones/M1-foundation-maximal-cutover.md`
- Migration slices (historical M1 landing sequence; **not** a current TODO list, and the checkboxes inside may be stale):
  - `docs/projects/pipeline-realism/resources/spec/migration-slices/slice-01-prepare-new-artifacts-and-viz.md`
  - `docs/projects/pipeline-realism/resources/spec/migration-slices/slice-02-cutover-foundation-maximal.md`
  - `docs/projects/pipeline-realism/resources/spec/migration-slices/slice-03-cutover-morphology-consumption-and-cleanup.md`

If you are executing this plan, prefer the phase sections below + the Execution Checklist, and treat the migration-slices docs as rationale/intent only.

## Root Problem (Why This Exists)

The original problem is a **causality/realism break** at the Foundation → Morphology seam:

- The pipeline can emit “tectonic-looking fields,” but **events do not reliably produce material evolution** (crust truth + provenance) that downstream can consume to generate coherent continents and belts.
- The regression spike shows the failure mode of partial maximalism: a **field emission system without the material-evolution half**, plus a **hybrid seam** where mountains/belts use new drivers but the landmask remains noise/threshold-driven, yielding speckled, spread-out landforms.

### Spec vs Code Delta (Maximal Intent vs Current Behavior)

See the spike doc for the full divergence matrix. The load-bearing deltas that define our work are:

| Area | Maximal intent (docs) | Current behavior (code truth) | Impact |
| --- | --- | --- | --- |
| Crust evolution (D05r) | Events + eras update crust truth (maturity/thickness/thermal age/damage) and provenance | History/provenance exist, but crust truth can remain degenerate/saturated and/or not driven by evolution semantics | Continents do not “emerge” as state; downstream continent expectations are unsatisfiable |
| Landmask consumption (D07r) | Landmask/continents are grounded in crust truth + provenance (same causal spine as belts) | Landmask can be driven primarily by thresholding + noise, while mountains use history/provenance | Hybrid incoherence: “new belts on old continents” |
| Observability (D09r) | Determinism + invariants are enforcement gates, not optional diagnostics | Diagnostics exist but must be promoted to phase gates + CI strict posture | Regressions can slip as “looks OK” diffs |

## North Star (Maximal, Forward-Only, No-Legacy)

Ship exactly one tectonics reality:

- **Basaltic-lid + mantle-forced evolutionary physics** whose events update crust truth and provenance.
- Morphology landmask + belts consume that same causal spine (mandatory history/provenance tile projections and/or coherently projected crust truth).

This is a **hard cutover** plan:

- No legacy compatibility, no legacy shims.
- Any temporary bridge must be explicitly derived from the new truth, and must ship with a deletion trigger + a named deletion slice.
- Determinism + invariants are phase gates, and CI gates (not “debug tools”).

## Summary (What We’re Doing)

This plan converts the current “looks wired but behaves unchanged” posture into a **single causal spine**:

- **Foundation** produces non-degenerate continent/basin truth and era/provenance fields that materially affect downstream outcomes.
- **Morphology** consumes Foundation truth as the primary driver for continents and landmask coherence; belts/drivers modulate and refine, and noise is strictly secondary flavor.
- **Observability** becomes a correctness harness: dumps + metrics gate degeneracy and dead-lever regressions.

## Implementation Phases (Start Here)

Only future-facing implementation work remains. Each phase is **forward-only** (no dual semantics) and ends with explicit gates.

### Phase 0 — No-dual-engine / no-shadow / no-compare preflight gate

Objective: ensure we have **exactly one causal spine** (no legacy fallback/compare/shadow path can mask causality), before we attempt Phase A/B changes.

- Why this phase exists:
  - Review evidence indicates shadow/dual/compare surfaces can persist even after “no-legacy” posture was adopted.
  - If any shadow/compare/fallback path exists, Phase A/B work can look “wired” while producing unchanged downstream outcomes.

- 0.0 Gate (blocking): prove the standard pipeline contains no shadow/dual/compare surfaces.
  - Run: `bun run --cwd mods/mod-swooper-maps test test/pipeline/no-shadow-paths.test.ts`
  - Acceptance: test is green.

- 0.1 If the gate fails: delete or rename the surfaced symbols (do not add compatibility shims).
  - Re-run the test until green.

### Phase A — Foundation truth normalization + degeneracy elimination

Objective: make the material evolution half real (crust truth + provenance are causal and non-degenerate).

- Why this phase exists (current failure modes):
  - `foundation.crustTiles.type` can be uniform/degenerate (no continent truth signal).
  - Events/eras can emit fields and update provenance scalars, but still fail to update crust truth in a way that changes downstream continents.
  - When crust truth is degenerate, any downstream “continent constraints” become unsatisfiable and landmask devolves to noise thresholding.

- A0. Re-establish baseline probe evidence bundle:
  - `bun run --cwd mods/mod-swooper-maps diag:dump -- 106 66 1337 --label probe-baseline`
  - `bun run --cwd mods/mod-swooper-maps diag:analyze -- <runDir>`
  - Capture: `foundation.crustTiles.type` stats + provenance reset counts.
- A1. Make crust truth continuous and non-degenerate for canonical probes (no `min=max` degenerate projections).
- A2. Ensure crust evolution scalars + provenance resets are materially present and calibrated to observed driver ranges (no “events emit fields but don’t change state”).
- A3. Promote Phase A invariants to enforcement (Tier 1 gates) and wire their evidence bundle to the Phase A review threads.

### Phase B — Morphology landmask re-grounding on Foundation truth

Objective: continents emerge from crust truth and provenance, not from noise thresholding.

- Why this phase exists (current failure modes):
  - Landmask can be driven by threshold/noise in a narrow elevation distribution, producing speckle and high component counts.
  - Mountains/belts can consume history/provenance while landmask does not, producing hybrid incoherence (“new belts on old continents”).

- B0. Define and implement a continent potential grounded in crust truth + provenance stability (low-frequency, physics-first).
- B1. Replace threshold/noise-dominant landmask behavior with the crust-truth-driven classifier.
- B2. Delete/redefine any “basin separation truth” or land/water reclassification that isn’t derived from Foundation truth.
- B3. Gate: landmask coherence improves for canonical probes (components down, largestLandFrac up).

### Phase C — Belt-driver modulation cleanup

Objective: belts remain modifiers for mountains/coasts/islands, not the primary landmass generator.

- C0. Enforce positive-intensity seeding semantics for belt diffusion (zero-intensity must not seed).
- C1. Confirm belts modulate relief/coasts/mountains but do not create continents.
- C2. Reconcile “segments seed belts” semantics with current implementation as either a Phase C change or an explicit deferral with deletion trigger.

### Phase D — Observability hardening as enforcement

Objective: make maximalism *enforced* via determinism + invariants, and make diffs legible.

- D0. Define and enforce gate tiers:
  - Tier 1: contract + cross-artifact agreement
  - Tier 1: fixed budgets
  - CI: strict determinism double-run equivalence (fingerprint report)
  - CI: strict promoted subset (mantle structure, plate-fit residuals, belts continuity/flicker)
- D1. Clarify “viewer aids” vs correctness gates; the fingerprint report is the authoritative diff artifact.

## Execution Checklist (Per Slice)

This is the execution loop for each Phase A–D slice. The goal is to keep every slice reviewable and forward-only.

1. `gt sync --no-restack`
2. Create/enter a Graphite slice branch (insert where needed; do not edit legacy branches in place).
3. Implement the minimal forward-only change (include deletions; no compatibility shims).
4. Validation:
   - `bun run --cwd mods/mod-swooper-maps check`
   - `bun run --cwd mods/mod-swooper-maps test`
   - `bun run --cwd mods/mod-swooper-maps diag:dump -- 106 66 1337 --label <slice-label>`
5. Record evidence:
   - Paste run IDs + key metrics into the slice PR description or a phase evidence section.
6. Restack + submit upstack: `gt restack --upstack` then `gt submit --stack --no-edit`
7. Close the phase’s review threads only when the phase gate bundle is attached and pass conditions are met.

## Non-negotiables (physics-first, maximal realism)

- Foundation is the only source of tectonic “truth”.
- Morphology must be grounded in Foundation (no parallel legacy truth).
- Hard cutover: no legacy compatibility and no legacy shims; any temporary bridge must have an explicit deletion trigger + named deletion slice.
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

## Phase criteria (aligned to Implementation Phases)

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

## Canonical phase mapping — six remaining open review threads

These six open review threads are integrated into phase execution and stay open until their phase closure gates are met.

### Phase A threads (Foundation config/runtime semantics)

| PR / Thread | Acceptance target | Verification commands | Closure trigger |
| --- | --- | --- | --- |
| #1077 / `PRRT_kwDOOOKvrc5swnXi` | When `foundation.knobs.plateCount` is omitted, compile-time plate count inherits the selected profile baseline; when explicitly provided, the knob value wins. | `bun run --cwd mods/mod-swooper-maps test test/m11-config-knobs-and-presets.test.ts`<br>`bun run --cwd mods/mod-swooper-maps diag:dump -- 106 66 1337 --label phase-a-1077-profile-default --override '{"foundation":{"profiles":{"resolutionProfile":"coarse"},"knobs":{}}}'`<br>`bun run --cwd mods/mod-swooper-maps diag:dump -- 106 66 1337 --label phase-a-1077-explicit-override --override '{"foundation":{"profiles":{"resolutionProfile":"coarse"},"knobs":{"plateCount":31}}}'` | Leave thread open until Phase A evidence bundle is posted in-thread (pass/fail output + run IDs) and checklist item is complete. |
| #1078 / `PRRT_kwDOOOKvrc5swoFn` | Lithosphere scalars (`yieldStrength01`, `mantleCoupling01`) are consumed as direct 0..1 levers; no narrow remap that prevents true weakening at 0. | `bun run --cwd mods/mod-swooper-maps test test/m11-config-knobs-and-presets.test.ts`<br>`bun run --cwd mods/mod-swooper-maps test test/foundation/m11-plate-graph-resistance.test.ts`<br>`rg -n "yieldStrength01|mantleCoupling01|\\*\\s*0\\.3|\\*\\s*0\\.2" mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts` | Leave thread open until Phase A evidence bundle is posted in-thread (scalar-semantics proof) and checklist item is complete. |
| #1083 / `PRRT_kwDOOOKvrc5swl4c` | `beltInfluenceDistance` and `beltDecay` are consumed by runtime belt-field generation; authored values are not ignored/replaced by fixed constants. | `bun run --cwd mods/mod-swooper-maps test test/foundation/m11-tectonic-events.test.ts`<br>`bun run --cwd mods/mod-swooper-maps test test/morphology/belt-synthesis-history-provenance.test.ts`<br>`rg -n "beltInfluenceDistance|beltDecay|EMISSION_RADIUS|EMISSION_DECAY" mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts` | Leave thread open until Phase A evidence bundle is posted in-thread (config-consumption proof) and checklist item is complete. |

### Phase C thread (belt diffusion seeding semantics)

| PR / Thread | Acceptance target | Verification commands | Closure trigger |
| --- | --- | --- | --- |
| #1087 / `PRRT_kwDOOOKvrc5swmNO` | Diffusion seeding starts only from positive-intensity belt sources; zero-intensity belt tiles must not seed. | `bun run --cwd mods/mod-swooper-maps test test/morphology/belt-synthesis-history-provenance.test.ts`<br>`bun run --cwd mods/mod-swooper-maps test test/pipeline/foundation-gates.test.ts`<br>`rg -n "computeDistanceField|beltMask|beltIntensity|>\\s*0" mods/mod-swooper-maps/src/domain/morphology/ops/derive-belt-drivers-from-history/index.ts` | Leave thread open until Phase C evidence bundle is posted in-thread (positive-intensity seeding proof) and checklist item is complete. |

### Phase D threads (observability and gate correctness)

| PR / Thread | Acceptance target | Verification commands | Closure trigger |
| --- | --- | --- | --- |
| #1080 / `PRRT_kwDOOOKvrc5swnAd` | `plateFitP90` reflects uncapped residual distribution (can exceed `residualNorm` where warranted); no histogram reconstruction cap artifact. | `bun run --cwd mods/mod-swooper-maps test test/foundation/m11-plate-motion.test.ts`<br>`bun run --cwd mods/mod-swooper-maps test test/pipeline/foundation-gates.test.ts`<br>`rg -n "plateFitP90|residualNorm|histogramBins|Math\\.min" mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-motion/index.ts` | Leave thread open until Phase D evidence bundle is posted in-thread (uncapped-P90 proof) and checklist item is complete. |
| #1092 / `PRRT_kwDOOOKvrc5swmzA` | Morphology correlation gate evaluates using recipe-normalized runtime mountain config, not static `defaultConfig` replay. | `bun run --cwd mods/mod-swooper-maps test test/pipeline/foundation-gates.test.ts`<br>`bun run --cwd mods/mod-swooper-maps test test/morphology/m11-mountains-physics-anchored.test.ts`<br>`rg -n "planRidgesAndFoothills\\.defaultConfig|runtime.*config|normalize" mods/mod-swooper-maps/test/support/foundation-invariants.ts mods/mod-swooper-maps/src/domain/morphology/ops/plan-ridges-and-foothills/index.ts` | Leave thread open until Phase D evidence bundle is posted in-thread (runtime-config gate proof) and checklist item is complete. |

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

## Phase-end PR thread closure checklist

- Revisit the six planned-via-runbook threads after executing each owning phase: `PRRT_kwDOOOKvrc5swnXi`, `PRRT_kwDOOOKvrc5swoFn`, `PRRT_kwDOOOKvrc5swl4c`, `PRRT_kwDOOOKvrc5swmNO`, `PRRT_kwDOOOKvrc5swnAd`, `PRRT_kwDOOOKvrc5swmzA`.
- Post final in-thread evidence (acceptance target met + verification command output + run identifiers) before any resolution action.
- Resolve a thread only when evidence is present in-thread and the owning phase acceptance target is explicitly satisfied.
