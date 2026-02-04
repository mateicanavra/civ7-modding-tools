# M1-foundation-maximal-cutover: Basaltic Lid + Mantle Forcing + Evolutionary Tectonics

**Goal:** Land the maximal Foundation engine + downstream Morphology consumption cutover, with deterministic validation and author-facing visualization/tuning support.  
**Status:** Planned  
**Owner:** pipeline-realism  

## Summary

This milestone implements the target architecture in:
- SPEC: `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md`
- Decisions index (normative set): `docs/projects/pipeline-realism/resources/decisions/README.md`

It is **maximal-only**:
- no “optional artifacts”
- no “fast mode”
- break & migrate is expected (legacy contract shapes are not constraints)

This milestone is internally phased using the migration slices (prepare -> cutover -> cleanup):
- `docs/projects/pipeline-realism/resources/spec/migration-slices/slice-01-prepare-new-artifacts-and-viz.md`
- `docs/projects/pipeline-realism/resources/spec/migration-slices/slice-02-cutover-foundation-maximal.md`
- `docs/projects/pipeline-realism/resources/spec/migration-slices/slice-03-cutover-morphology-consumption-and-cleanup.md`

## Objectives

- Implement the full mantle-forced basaltic-lid evolutionary Foundation engine (truth artifacts, era loop, provenance).
- Cut over Morphology to consume the new mandatory Foundation outputs (history + provenance tiles), producing belts without wall-mountains.
- Make validation/observability gates real (determinism + invariants), distinct from visualization.
- Provide an author-facing visualization/tuning loop that lets humans understand causality:
  `config -> mantle -> plates -> events -> provenance -> morphology`.
- Delete legacy semantics (no dual-engine “truth”), leaving only intentional, temporary bridges with deletion targets.

## Acceptance Criteria

### Tier 1 (Must Pass)
- Foundation produces the mandatory mesh-space truth artifacts per SPEC:
  - `artifact:foundation.mantlePotential`
  - `artifact:foundation.mantleForcing`
  - `artifact:foundation.plateMotion`
  - `artifact:foundation.crust`
  - `artifact:foundation.tectonicHistory`
  - `artifact:foundation.tectonicProvenance`
- Foundation produces mandatory projections consumed downstream:
  - `artifact:foundation.tectonicHistoryTiles`
  - `artifact:foundation.tectonicProvenanceTiles`
- Morphology consumes history/provenance tiles as required by:
  - `docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md`
  and emits belts/topography that satisfy belt continuity + age-aware diffusion invariants (no wall-mountains).
- D09r determinism and invariant gates exist and are enforced in CI (at least on a small canonical suite).

### Tier 2 (Strongly Expected)
- Visualization layers exist for the full causal spine (debug + refined), aligned with:
  - `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
  - `docs/projects/pipeline-realism/resources/spec/sections/visualization-and-tuning.md`
- A stable artifact catalog + schema/versioning posture exists and is used by consumers:
  - `docs/projects/pipeline-realism/resources/spec/artifact-catalog.md`
  - `docs/projects/pipeline-realism/resources/spec/schema-and-versioning.md`
- All temporary bridges have explicit deletion targets and are removed by the end of this milestone (no legacy left).

## Scope

### In Scope
- All implementation work required by the maximal Foundation SPEC and its decision packets (D01, D02r, D03r, D04r, D05r, D06r, D07r, D08r, D09r).
- Downstream Morphology contract cutover and cleanup.
- Stage/config alignment required due to recent Morphology/Hydrology changes (stage naming, artifact IDs, wind/current changes), as summarized in:
  - `docs/projects/pipeline-realism/resources/research/stack-integration-morphology-hydrology-wind-current.md`

### Out of Scope (Owned By Later pipeline-realism Milestones)
- Non-Foundation domains (Hydrology/Ecology/Placement/Narrative) beyond what is required for Foundation->Morphology integration correctness.
- Performance optimization beyond meeting the SPEC’s fixed-budget constraints (we will stay bounded, but not micro-optimize).
- Additional strategy profiles (maximal-only).

## Workstreams (Issue Clusters)

Note: issue doc links are populated in Slice 3 of the plan (local issue docs under `docs/projects/pipeline-realism/issues/`).

## Candidate Issues / Deliverables (Index)

These are the intended issue-shaped units for this milestone. Each item becomes a local issue doc under `docs/projects/pipeline-realism/issues/` (using `LOCAL-TBD-...` until real IDs exist).

### Prepare (Slice-01)
- [ ] [`LOCAL-TBD-PR-M1-001`](../issues/LOCAL-TBD-PR-M1-001-publish-new-foundation-truth-artifacts-mesh-tiles-docs-align.md) Publish new mesh-space truth artifacts (mantle/plate/crust/history/provenance) + docs alignment
- [ ] [`LOCAL-TBD-PR-M1-002`](../issues/LOCAL-TBD-PR-M1-002-add-tile-projections-for-tectonic-history-provenance-mandato.md) Add tile projections for history + provenance (new mandatory drivers)
- [ ] [`LOCAL-TBD-PR-M1-003`](../issues/LOCAL-TBD-PR-M1-003-wire-visualization-datatypekeys-minimal-layer-taxonomy-for-c.md) Wire visualization `dataTypeKey`s + minimal layer taxonomy for the causal spine
- [ ] [`LOCAL-TBD-PR-M1-004`](../issues/LOCAL-TBD-PR-M1-004-add-validation-harness-scaffolding-determinism-fingerprints-.md) Add validation harness scaffolding (determinism fingerprints + invariant runners)
- [ ] [`LOCAL-TBD-PR-M1-005`](../issues/LOCAL-TBD-PR-M1-005-compile-time-config-surface-for-maximal-foundation-d08r-sche.md) Compile-time config surface for maximal Foundation (D08r) + schema/versioning posture

### Foundation Engine (Slice-02)
- [ ] [`LOCAL-TBD-PR-M1-006`](../issues/LOCAL-TBD-PR-M1-006-basaltic-lid-init-lithosphere-strength-mantle-coupled.md) Basaltic lid init + lithosphere strength (mantle-coupled)
- [ ] [`LOCAL-TBD-PR-M1-007`](../issues/LOCAL-TBD-PR-M1-007-mantle-potential-generation-derived-forcing-fields-d02r.md) Mantle potential generation + derived forcing fields (D02r)
- [ ] [`LOCAL-TBD-PR-M1-008`](../issues/LOCAL-TBD-PR-M1-008-plate-motion-solver-derived-from-mantle-forcing-d03r.md) Plate motion solver derived from mantle forcing (D03r)
- [ ] [`LOCAL-TBD-PR-M1-009`](../issues/LOCAL-TBD-PR-M1-009-crust-priors-resistance-partition-plategraph-d01.md) Crust priors + resistance partition -> plateGraph (D01)
- [ ] [`LOCAL-TBD-PR-M1-010`](../issues/LOCAL-TBD-PR-M1-010-boundary-segments-regime-classification-source-of-events.md) Boundary segments + regime classification (source of events)
- [ ] [`LOCAL-TBD-PR-M1-011`](../issues/LOCAL-TBD-PR-M1-011-event-engine-subduction-collision-rift-transform-mandatory-f.md) Event engine (D06r): subduction/collision/rift/transform + mandatory force emission
- [ ] [`LOCAL-TBD-PR-M1-012`](../issues/LOCAL-TBD-PR-M1-012-era-loop-field-emission-budgets-d04r-eulerian-outputs.md) Era loop + field emission budgets (D04r Eulerian outputs)
- [ ] [`LOCAL-TBD-PR-M1-013`](../issues/LOCAL-TBD-PR-M1-013-provenance-tracer-system-lineage-scalars-d04r-lagrangian-out.md) Provenance/tracer system + lineage scalars (D04r Lagrangian outputs)

### Morphology Cutover (Slice-03)
- [ ] [`LOCAL-TBD-PR-M1-014`](../issues/LOCAL-TBD-PR-M1-014-morphology-dual-read-accept-history-provenance-tiles-emit-co.md) Morphology dual-read: accept history/provenance tiles + emit comparison diagnostics
- [ ] [`LOCAL-TBD-PR-M1-015`](../issues/LOCAL-TBD-PR-M1-015-morphology-belt-synthesis-from-history-provenance-continuity.md) Morphology belt synthesis from history/provenance (continuity + age-aware diffusion)
- [ ] [`LOCAL-TBD-PR-M1-016`](../issues/LOCAL-TBD-PR-M1-016-cutover-morphology-to-new-drivers-remove-legacy-consumption-.md) Cutover morphology to new drivers + remove legacy consumption paths

### Validation/Observability (Cross-cutting)
- [ ] [`LOCAL-TBD-PR-M1-017`](../issues/LOCAL-TBD-PR-M1-017-determinism-suite-canonical-seeds-stable-fingerprints-float-.md) Determinism suite: canonical seeds + stable fingerprints + float tolerance policy
- [ ] [`LOCAL-TBD-PR-M1-018`](../issues/LOCAL-TBD-PR-M1-018-physics-invariants-mantle-forcing-plate-motion-coupling-resi.md) Physics invariants: mantle forcing (coherence/energy/bounds) + motion coupling residuals
- [ ] [`LOCAL-TBD-PR-M1-019`](../issues/LOCAL-TBD-PR-M1-019-physics-invariants-events-must-change-crust-provenance-belts.md) Physics invariants: events must change crust/provenance + belts must be wide/continuous
- [ ] [`LOCAL-TBD-PR-M1-020`](../issues/LOCAL-TBD-PR-M1-020-morphology-correlation-gates-drivers-belts-no-wall-mountains.md) Morphology correlation gates: drivers -> belts (no wall mountains) + distribution checks

### Authoring/Viz/Tuning (Cross-cutting)
- [ ] [`LOCAL-TBD-PR-M1-021`](../issues/LOCAL-TBD-PR-M1-021-studio-authoring-physics-input-controls-causal-overlays-no-v.md) Studio authoring: physics-input controls + causal overlays (no velocity hacks)
- [ ] [`LOCAL-TBD-PR-M1-022`](../issues/LOCAL-TBD-PR-M1-022-visualization-refinement-debug-vs-refined-layer-sets-era-scr.md) Visualization refinement: debug vs refined layer sets + era scrubber + correlation overlays

### Cleanup (No Legacy Left)
- [ ] [`LOCAL-TBD-PR-M1-023`](../issues/LOCAL-TBD-PR-M1-023-delete-legacy-plate-motion-legacy-tectonics-truth-publicatio.md) Delete legacy plate motion + legacy tectonics truth publication
- [ ] [`LOCAL-TBD-PR-M1-024`](../issues/LOCAL-TBD-PR-M1-024-delete-legacy-morphology-belt-driver-paths-and-bridge-artifa.md) Delete legacy morphology belt driver paths and bridge artifacts
- [ ] [`LOCAL-TBD-PR-M1-025`](../issues/LOCAL-TBD-PR-M1-025-delete-dual-engine-shadow-compute-paths-after-suite-is-green.md) Delete any dual-engine shadow compute paths after suite is green

### A. Prepare (Scaffolding + Plumbing + Visualization Enablement)
- [ ] Implement/extend artifact publication plumbing for new truth + tile artifacts (Foundation and projections).
- [ ] Add canonical visualization dataTypeKeys + layers (debug/refined) per the visualization spec.
- [ ] Add strict validation scaffolding (D09r hooks) without blocking cutover iteration.
- [ ] Add/extend config compilation surfaces required by D08r (physics inputs only; no kinematics hacks).

### B. Foundation Maximal Engine Cutover (Truth)
- [ ] Basaltic lid init + lithosphere strength (mantle-coupled).
- [ ] Mantle potential + derived forcing fields (D02r).
- [ ] Plate motion derived from mantle forcing (D03r).
- [ ] Crust-first resistance priors -> partition -> plateGraph (D01).
- [ ] Boundary regimes + tectonic segments.
- [ ] Event mechanics + force emission (D06r) that update crust + provenance (no fake tectonics).
- [ ] Era loop + mandatory dual outputs (Eulerian era fields + Lagrangian provenance) (D04r).

### C. Morphology Consumption Cutover + Cleanup
- [ ] Wire Morphology to consume history/provenance tiles per D07r.
- [ ] Implement belt synthesis rules that avoid wall mountains (age-aware diffusion + continuity).
- [ ] Remove legacy morphology consumption paths and legacy-only bridge artifacts.

### D. Validation/Observability (D09r) Gates
- [ ] Determinism replay gates (stable fingerprints).
- [ ] Physics-aligned invariants for mantle forcing, plate motion, events, provenance, and morphology consumption correlation.
- [ ] Diagnostics artifacts vs visualization separation (no viewer-dependent correctness).

### E. Authoring/Config Surface (D08r) + Tuning Loop
- [ ] Authoring model: physics inputs only (mantle sources, lithosphere properties, water/heat budgets).
- [ ] Ensure authoring is deterministic and explainable via visualization layers.

### F. Units/Scaling + Artifact Catalog + Schema Versioning
- [ ] Lock units/scaling conventions used by the new engine artifacts.
- [ ] Maintain/update artifact catalog and schema versioning so downstream consumers don’t drift.

### G. Cleanup (No Legacy Left)
- [ ] Remove legacy plate motion and legacy tectonics semantics once maximal truth is authoritative.
- [ ] Remove dual-engine shadow compute paths after validation suite is green.

## Sequencing & Parallelization Plan

**Spine stack (must land first):**
- Prepare scaffolding that lets us publish new artifacts + visualize them early (Workstream A).
- Mantle forcing + plate motion truth artifacts (Workstream B; D02r + D03r).

**Parallel stacks (can proceed after spine is in place):**
- Crust state + partition + segments/events/provenance (Workstream B).
- Validation scaffolding and diagnostics gates (Workstream D).
- Visualization layer taxonomy and Studio integration (Workstream A/E).
- Morphology consumption cutover can begin in dual-read mode once tiles exist (Workstream C).

**Final cutover + cleanup:**
- Morphology output cutover depends on stable history/provenance tiles + belt invariants (Workstream C).
- Legacy deletion depends on gates passing (Workstream G).

## Risks

- **Maximal engine becomes “maximal in name only”:** legacy semantics remain authoritative.
  - Mitigation: enforce “derivedFrom” + explicit audit + deletion targets; D09r gates.
- **Plate motion decouples from mantle forcing:** produces arbitrary kinematics.
  - Mitigation: coupling invariants + residual bounds; visualization correlation layers.
- **Fake tectonics:** belts emitted without material/provenance change.
  - Mitigation: D06r requires crust + provenance updates per event; invariants enforce continent emergence by state transition.
