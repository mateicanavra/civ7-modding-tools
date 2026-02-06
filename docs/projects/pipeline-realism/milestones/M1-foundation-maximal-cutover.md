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

## Issues (Canonical Checklist)

These 25 issue docs are the **canonical milestone checklist**. Do not duplicate them as additional checkbox sections; use the narrative sections below for workstream framing and sequencing.

### Prepare (Slice-01)
- [x] [`LOCAL-TBD-PR-M1-001`](../issues/LOCAL-TBD-PR-M1-001-publish-new-foundation-truth-artifacts-mesh-tiles-docs-align.md) Publish new Foundation truth artifacts (mesh + tiles) + docs alignment — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-001-publish-foundation-truth-artifacts`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1073; review: `agent-BURAKA-LOCAL-TBD-PR-M1-001-review-publish-foundation-truth-artifacts` (PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1099)
- [x] [`LOCAL-TBD-PR-M1-002`](../issues/LOCAL-TBD-PR-M1-002-add-tile-projections-for-tectonic-history-provenance-mandato.md) Add tile projections for tectonic history + provenance (mandatory drivers) — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-002-project-tectonic-history-provenance-tiles`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1074; review: `agent-BURAKA-LOCAL-TBD-PR-M1-002-review-project-tectonic-history-provenance-tiles` (PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1100)
- [x] [`LOCAL-TBD-PR-M1-003`](../issues/LOCAL-TBD-PR-M1-003-wire-visualization-datatypekeys-minimal-layer-taxonomy-for-c.md) Wire visualization `dataTypeKey`s + minimal layer taxonomy for the causal spine — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-003-wire-viz-datatypekeys-causal-spine`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1075; review: `agent-BURAKA-LOCAL-TBD-PR-M1-003-review-wire-viz-datatypekeys-causal-spine` (PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1101)
- [x] [`LOCAL-TBD-PR-M1-004`](../issues/LOCAL-TBD-PR-M1-004-add-validation-harness-scaffolding-determinism-fingerprints-.md) Add validation harness scaffolding (determinism fingerprints + invariant runners) — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-004-validation-harness-scaffolding`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1076; review branch: `agent-BURAKA-LOCAL-TBD-PR-M1-004-review-validation-harness-scaffolding`; review PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1102
- [x] [`LOCAL-TBD-PR-M1-005`](../issues/LOCAL-TBD-PR-M1-005-compile-time-config-surface-for-maximal-foundation-d08r-sche.md) Compile-time config surface for maximal Foundation (D08r) + schema/versioning posture — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-005-compile-config-surface`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1077; review branch: `agent-BURAKA-LOCAL-TBD-PR-M1-005-review-compile-config-surface`; review PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1103

### Foundation Engine (Slice-02)
- [x] [`LOCAL-TBD-PR-M1-006`](../issues/LOCAL-TBD-PR-M1-006-basaltic-lid-init-lithosphere-strength-mantle-coupled.md) Basaltic lid init + lithosphere strength (mantle-coupled) — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-006-basaltic-lid-init-lithosphere-strength-mantle-coupled`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1078; review branch: `agent-BURAKA-LOCAL-TBD-PR-M1-006-review-basaltic-lid-init-lithosphere-strength-mantle-coupled`; review PR: pending
- [x] [`LOCAL-TBD-PR-M1-007`](../issues/LOCAL-TBD-PR-M1-007-mantle-potential-generation-derived-forcing-fields-d02r.md) Mantle potential generation + derived forcing fields (D02r) — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-007-mantle-potential-generation-derived-forcing-fields-d02r`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1079
- [x] [`LOCAL-TBD-PR-M1-008`](../issues/LOCAL-TBD-PR-M1-008-plate-motion-solver-derived-from-mantle-forcing-d03r.md) Plate motion solver derived from mantle forcing (D03r) — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-008-plate-motion-solver-derived-from-mantle-forcing-d03r`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1080
- [x] [`LOCAL-TBD-PR-M1-009`](../issues/LOCAL-TBD-PR-M1-009-crust-priors-resistance-partition-plategraph-d01.md) Crust priors + resistance partition -> plateGraph (D01) — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-009-crust-priors-resistance-partition-plategraph-d01`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1081
- [x] [`LOCAL-TBD-PR-M1-010`](../issues/LOCAL-TBD-PR-M1-010-boundary-segments-regime-classification-source-of-events.md) Boundary segments + regime classification (source of events) — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-010-boundary-segments-regime-classification-source-of-events`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1082
- [x] [`LOCAL-TBD-PR-M1-011`](../issues/LOCAL-TBD-PR-M1-011-event-engine-subduction-collision-rift-transform-mandatory-f.md) Event engine: subduction/collision/rift/transform + mandatory force emission (D06r) — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-011-event-engine-subduction-collision-rift-transform-mandatory-f`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1083
- [x] [`LOCAL-TBD-PR-M1-012`](../issues/LOCAL-TBD-PR-M1-012-era-loop-field-emission-budgets-d04r-eulerian-outputs.md) Era loop + field emission budgets (D04r Eulerian outputs) — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-012-era-loop-field-emission-budgets-d04r-eulerian-outputs`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1084
- [x] [`LOCAL-TBD-PR-M1-013`](../issues/LOCAL-TBD-PR-M1-013-provenance-tracer-system-lineage-scalars-d04r-lagrangian-out.md) Provenance tracer system + lineage scalars (D04r Lagrangian outputs) — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-013-provenance-tracer-system-lineage-scalars-d04r-lagrangian-outputs`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1085

### Morphology Cutover (Slice-03)
- [x] [`LOCAL-TBD-PR-M1-014`](../issues/LOCAL-TBD-PR-M1-014-morphology-dual-read-accept-history-provenance-tiles-emit-co.md) Morphology dual-read: accept history/provenance tiles + emit comparison diagnostics — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-014-morphology-dual-read-history-provenance-diagnostics`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1086; review branch: `agent-BURAKA-LOCAL-TBD-PR-M1-014-review-morphology-dual-read-history-provenance-diagnostics`; review PR: pending
- [x] [`LOCAL-TBD-PR-M1-015`](../issues/LOCAL-TBD-PR-M1-015-morphology-belt-synthesis-from-history-provenance-continuity.md) Morphology belt synthesis from history/provenance (continuity + age-aware diffusion) — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-015-morphology-belt-synthesis-history-provenance`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1087; review branch: `agent-BURAKA-LOCAL-TBD-PR-M1-015-review-morphology-belt-synthesis-history-provenance`; review PR: pending
- [x] [`LOCAL-TBD-PR-M1-016`](../issues/LOCAL-TBD-PR-M1-016-cutover-morphology-to-new-drivers-remove-legacy-consumption-.md) Cutover Morphology to new drivers + remove legacy consumption paths — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-016-cutover-morphology-new-drivers`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1088; review branch: `agent-BURAKA-LOCAL-TBD-PR-M1-016-review-cutover-morphology-new-drivers`; review PR: pending

### Validation / Observability (Cross-cutting)
- [x] [`LOCAL-TBD-PR-M1-017`](../issues/LOCAL-TBD-PR-M1-017-determinism-suite-canonical-seeds-stable-fingerprints-float-.md) Determinism suite: canonical seeds + stable fingerprints + float tolerance policy — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-017-determinism-suite-canonical-seeds`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1089
- [x] [`LOCAL-TBD-PR-M1-018`](../issues/LOCAL-TBD-PR-M1-018-physics-invariants-mantle-forcing-plate-motion-coupling-resi.md) Physics invariants: mantle forcing coherence + motion coupling residuals — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-018-physics-invariants-mantle-forcing-plate-motion-coupling-resi`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1090; review: `agent-BURAKA-LOCAL-TBD-PR-M1-018-review-physics-invariants-mantle-forcing-plate-motion-coupling-resi` (PR: pending)
- [x] [`LOCAL-TBD-PR-M1-019`](../issues/LOCAL-TBD-PR-M1-019-physics-invariants-events-must-change-crust-provenance-belts.md) Physics invariants: events must change crust/provenance + belts must be wide/continuous — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-019-physics-invariants-events-must-change-crust-provenance-belts`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1091; review: `agent-BURAKA-LOCAL-TBD-PR-M1-019-review-physics-invariants-events-must-change-crust-provenance-belts` (PR: pending)
- [x] [`LOCAL-TBD-PR-M1-020`](../issues/LOCAL-TBD-PR-M1-020-morphology-correlation-gates-drivers-belts-no-wall-mountains.md) Morphology correlation gates: drivers -> belts (no wall mountains) + distribution checks — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-020-morphology-correlation-gates-drivers-belts-no-wall-mountains`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1092; review: `agent-BURAKA-LOCAL-TBD-PR-M1-020-review-morphology-correlation-gates-drivers-belts-no-wall-mountains` (PR: pending)

### Studio / Viz / Tuning (Cross-cutting)
- [x] [`LOCAL-TBD-PR-M1-021`](../issues/LOCAL-TBD-PR-M1-021-studio-authoring-physics-input-controls-causal-overlays-no-v.md) Studio authoring: physics-input controls + causal overlays (no velocity hacks) — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-021-studio-authoring-physics-input-controls-causal-overlays-no-v`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1093; review: `agent-BURAKA-LOCAL-TBD-PR-M1-021-review-studio-authoring-physics-input-controls-causal-overlays-no-v` (PR: pending)
- [x] [`LOCAL-TBD-PR-M1-022`](../issues/LOCAL-TBD-PR-M1-022-visualization-refinement-debug-vs-refined-layer-sets-era-scr.md) Visualization refinement: debug vs refined layer sets + era scrubber + correlation overlays — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-022-visualization-refinement-debug-vs-refined-layer-sets-era-scr`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1094; review: `agent-BURAKA-LOCAL-TBD-PR-M1-022-review-visualization-refinement-debug-vs-refined-layer-sets-era-scr` (PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1123)

### Cleanup (No Legacy Left)
- [x] [`LOCAL-TBD-PR-M1-023`](../issues/LOCAL-TBD-PR-M1-023-delete-legacy-plate-motion-legacy-tectonics-truth-publicatio.md) Delete legacy plate motion + legacy tectonics truth publication — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-023-delete-legacy-plate-motion-legacy-tectonics-truth-publicatio`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1095; review: `agent-BURAKA-LOCAL-TBD-PR-M1-023-review-delete-legacy-plate-motion-legacy-tectonics-truth-publicatio` (PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1124)
- [x] [`LOCAL-TBD-PR-M1-024`](../issues/LOCAL-TBD-PR-M1-024-delete-legacy-morphology-belt-driver-paths-and-bridge-artifa.md) Delete legacy Morphology belt-driver paths and bridge artifacts — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-024-delete-legacy-morphology-belt-driver-paths-and-bridge-artifa`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1096
- [x] [`LOCAL-TBD-PR-M1-025`](../issues/LOCAL-TBD-PR-M1-025-delete-dual-engine-shadow-compute-paths-after-suite-is-green.md) Delete dual-engine shadow compute paths (after suite is green) — branch: `agent-URSULA-M1-LOCAL-TBD-PR-M1-025-delete-dual-engine-shadow-compute-paths-after-suite-is-green`; PR: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1097

## Issue Summaries (Why/What)

| Issue | Summary |
|---|---|
| [`LOCAL-TBD-PR-M1-001`](../issues/LOCAL-TBD-PR-M1-001-publish-new-foundation-truth-artifacts-mesh-tiles-docs-align.md) | Make the new maximal Foundation artifacts first-class: registered, emitted, and documented so consumers can rely on stable IDs and schemas (not ad-hoc exports). |
| [`LOCAL-TBD-PR-M1-002`](../issues/LOCAL-TBD-PR-M1-002-add-tile-projections-for-tectonic-history-provenance-mandato.md) | Add mandatory mesh→tile projections for history + provenance so Morphology can consume causal drivers deterministically without reading mesh artifacts. |
| [`LOCAL-TBD-PR-M1-003`](../issues/LOCAL-TBD-PR-M1-003-wire-visualization-datatypekeys-minimal-layer-taxonomy-for-c.md) | Establish stable `dataTypeKey` identities and a minimal taxonomy for the causal spine (mantle→plates→events→provenance→belts) so Studio can group layers predictably. |
| [`LOCAL-TBD-PR-M1-004`](../issues/LOCAL-TBD-PR-M1-004-add-validation-harness-scaffolding-determinism-fingerprints-.md) | Create the scaffolding for D09r validation: determinism fingerprints + invariant runner wiring that can be expanded issue-by-issue. |
| [`LOCAL-TBD-PR-M1-005`](../issues/LOCAL-TBD-PR-M1-005-compile-time-config-surface-for-maximal-foundation-d08r-sche.md) | Implement the D08r authoring/config surface so maximal physics inputs compile deterministically, and lock schema/versioning posture to prevent drift during the cutover. |
| [`LOCAL-TBD-PR-M1-006`](../issues/LOCAL-TBD-PR-M1-006-basaltic-lid-init-lithosphere-strength-mantle-coupled.md) | Replace “initial crust” assumptions with a basaltic-lid t=0 model and lithosphere strength fields that participate in mantle/plate coupling (not a static seed). |
| [`LOCAL-TBD-PR-M1-007`](../issues/LOCAL-TBD-PR-M1-007-mantle-potential-generation-derived-forcing-fields-d02r.md) | Introduce mantle potential as a truth artifact and derive forcing fields (D02r) that will drive plate motion and event mechanics with bounded budgets. |
| [`LOCAL-TBD-PR-M1-008`](../issues/LOCAL-TBD-PR-M1-008-plate-motion-solver-derived-from-mantle-forcing-d03r.md) | Implement plate motion as a derived solution from mantle forcing (D03r), with coupling invariants that prevent “authoring kinematics by accident.” |
| [`LOCAL-TBD-PR-M1-009`](../issues/LOCAL-TBD-PR-M1-009-crust-priors-resistance-partition-plategraph-d01.md) | Establish crust-first priors and resistance partition (D01) that produce a plate graph consistent with lithosphere and forcing (not arbitrary Voronoi). |
| [`LOCAL-TBD-PR-M1-010`](../issues/LOCAL-TBD-PR-M1-010-boundary-segments-regime-classification-source-of-events.md) | Make boundary segments + regime classification the authoritative “where events happen” surface used by history + event engine (no duplicated boundary inference). |
| [`LOCAL-TBD-PR-M1-011`](../issues/LOCAL-TBD-PR-M1-011-event-engine-subduction-collision-rift-transform-mandatory-f.md) | Implement D06r event mechanics that materially update crust + provenance and emit per-era force corridors consumed by Morphology (no “force-only tectonics”). |
| [`LOCAL-TBD-PR-M1-012`](../issues/LOCAL-TBD-PR-M1-012-era-loop-field-emission-budgets-d04r-eulerian-outputs.md) | Implement the bounded era loop (D04r Eulerian outputs): per-era fields + rollups with explicit iteration budgets and stable semantics. |
| [`LOCAL-TBD-PR-M1-013`](../issues/LOCAL-TBD-PR-M1-013-provenance-tracer-system-lineage-scalars-d04r-lagrangian-out.md) | Implement D04r Lagrangian provenance/tracers so Morphology can reason about lineage/age and the system can validate “events caused material change.” |
| [`LOCAL-TBD-PR-M1-014`](../issues/LOCAL-TBD-PR-M1-014-morphology-dual-read-accept-history-provenance-tiles-emit-co.md) | Add a dual-read pathway so Morphology can compare legacy drivers vs the new history/provenance tiles while instrumentation proves causality. |
| [`LOCAL-TBD-PR-M1-015`](../issues/LOCAL-TBD-PR-M1-015-morphology-belt-synthesis-from-history-provenance-continuity.md) | Produce belts from history/provenance with continuity + age-aware diffusion; explicitly avoid “wall mountains” by construction and by gates. |
| [`LOCAL-TBD-PR-M1-016`](../issues/LOCAL-TBD-PR-M1-016-cutover-morphology-to-new-drivers-remove-legacy-consumption-.md) | Cut over Morphology to the new mandatory drivers and remove legacy consumption paths so the new causal spine is authoritative. |
| [`LOCAL-TBD-PR-M1-017`](../issues/LOCAL-TBD-PR-M1-017-determinism-suite-canonical-seeds-stable-fingerprints-float-.md) | Make determinism a CI-enforced reality via canonical seeds + stable fingerprints and an explicit float tolerance policy (if any). |
| [`LOCAL-TBD-PR-M1-018`](../issues/LOCAL-TBD-PR-M1-018-physics-invariants-mantle-forcing-plate-motion-coupling-resi.md) | Add physics-aligned invariants for forcing coherence and motion coupling so “decoupled kinematics” is caught immediately. |
| [`LOCAL-TBD-PR-M1-019`](../issues/LOCAL-TBD-PR-M1-019-physics-invariants-events-must-change-crust-provenance-belts.md) | Add invariants that prove events change material/provenance and that downstream belts correlate to those changes (not aesthetic-only validation). |
| [`LOCAL-TBD-PR-M1-020`](../issues/LOCAL-TBD-PR-M1-020-morphology-correlation-gates-drivers-belts-no-wall-mountains.md) | Add belt correlation gates and distribution checks that enforce “no wall mountains” and validate causal drivers against belt outputs. |
| [`LOCAL-TBD-PR-M1-021`](../issues/LOCAL-TBD-PR-M1-021-studio-authoring-physics-input-controls-causal-overlays-no-v.md) | Add Studio affordances for authoring physics inputs and causal overlays that explain changes end-to-end without velocity hacks. |
| [`LOCAL-TBD-PR-M1-022`](../issues/LOCAL-TBD-PR-M1-022-visualization-refinement-debug-vs-refined-layer-sets-era-scr.md) | Provide a debug-vs-refined layer set split, era scrubber support, and correlation overlays that let humans see causal chains quickly. |
| [`LOCAL-TBD-PR-M1-023`](../issues/LOCAL-TBD-PR-M1-023-delete-legacy-plate-motion-legacy-tectonics-truth-publicatio.md) | Delete legacy plate motion and legacy tectonics truth publication once the new suite is green, removing dual-authoritative semantics. |
| [`LOCAL-TBD-PR-M1-024`](../issues/LOCAL-TBD-PR-M1-024-delete-legacy-morphology-belt-driver-paths-and-bridge-artifa.md) | Delete legacy Morphology belt driver paths and bridge artifacts to prevent regressions that “quietly switch back” to legacy drivers. |
| [`LOCAL-TBD-PR-M1-025`](../issues/LOCAL-TBD-PR-M1-025-delete-dual-engine-shadow-compute-paths-after-suite-is-green.md) | Delete any remaining dual-engine shadow compute paths after validation gates are green so the cutover is final and auditable. |

## Coverage Table (Spec / Decisions → Issues)

| Spec section / decision | Owner issue(s) |
|---|---|
| `foundation-evolutionary-physics-SPEC.md` (overall) | `LOCAL-TBD-PR-M1-001..025` |
| Migration Slice 01 (prepare) | `LOCAL-TBD-PR-M1-001..005` |
| Migration Slice 02 (foundation maximal cutover) | `LOCAL-TBD-PR-M1-006..013` |
| Migration Slice 03 (morphology cutover + cleanup) | `LOCAL-TBD-PR-M1-014..016`, `LOCAL-TBD-PR-M1-023..025` |
| D01 ordering (crust vs plates) | `LOCAL-TBD-PR-M1-009` |
| D02r mantle forcing as potential + derived | `LOCAL-TBD-PR-M1-007` |
| D03r plate motion derived from mantle | `LOCAL-TBD-PR-M1-008` |
| D04r dual outputs (Eulerian eras + Lagrangian provenance) | `LOCAL-TBD-PR-M1-012`, `LOCAL-TBD-PR-M1-013` |
| D05r crust state canonical variables | `LOCAL-TBD-PR-M1-006`, `LOCAL-TBD-PR-M1-009` |
| D06r events + force emission | `LOCAL-TBD-PR-M1-010`, `LOCAL-TBD-PR-M1-011` |
| D07r morphology consumption contract | `LOCAL-TBD-PR-M1-014..016` |
| D08r authoring + config surface | `LOCAL-TBD-PR-M1-005`, `LOCAL-TBD-PR-M1-021` |
| D09r validation + observability | `LOCAL-TBD-PR-M1-004`, `LOCAL-TBD-PR-M1-017..020` |
| Visualization/tuning spec | `LOCAL-TBD-PR-M1-003`, `LOCAL-TBD-PR-M1-022` |
| Artifact catalog + schema/versioning | `LOCAL-TBD-PR-M1-001`, `LOCAL-TBD-PR-M1-005` |
| Units + scaling / budgets | `LOCAL-TBD-PR-M1-005`, `LOCAL-TBD-PR-M1-012`, `LOCAL-TBD-PR-M1-017` |

## Sequencing & Parallelization Plan (Graphite Stacks)

Milestone “what” is tracked by issues; Graphite stacks describe “how we land it” as reviewable layers. Suggested stacks:

**Stack A — Scaffolding (must land first)**
- `LOCAL-TBD-PR-M1-001` → `002` → `003` → `004` → `005`

**Stack B — Foundation engine core (depends on Stack A’s contracts where relevant)**
- `LOCAL-TBD-PR-M1-006` → `007` → `008` → `009` → `010` → `011` → `012` → `013`

**Stack C — Morphology cutover (starts once projections exist and at least one minimal history+provenance path is in place)**
- `LOCAL-TBD-PR-M1-014` → `015` → `016`

**Stack D — Gates (should be developed alongside B/C; must be green before cleanup)**
- `LOCAL-TBD-PR-M1-017` → `018` → `019` → `020`

**Stack E — Studio/Viz (can proceed once `dataTypeKey` taxonomy exists; blocks nothing but unblocks iteration speed)**
- `LOCAL-TBD-PR-M1-021` → `022`

**Stack F — Cleanup (explicitly blocked on Stack D gates being green in CI)**
- `LOCAL-TBD-PR-M1-023` → `024` → `025`

## Risks

- **Maximal engine becomes “maximal in name only”:** legacy semantics remain authoritative.
  - Mitigation: enforce “derivedFrom” + explicit audit + deletion targets; D09r gates.
- **Plate motion decouples from mantle forcing:** produces arbitrary kinematics.
  - Mitigation: coupling invariants + residual bounds; visualization correlation layers.
- **Fake tectonics:** belts emitted without material/provenance change.
  - Mitigation: D06r requires crust + provenance updates per event; invariants enforce continent emergence by state transition.
