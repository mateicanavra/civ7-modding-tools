# Pipeline-Realism M1: Implementation Readiness Report

**Milestone:** `M1-foundation-maximal-cutover`  
**Status:** Draft  

## What Exists Now (Ready Inputs)

- Canonical target spec:
  - `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md`
- Canonical milestone index:
  - `docs/projects/pipeline-realism/milestones/M1-foundation-maximal-cutover.md`
- Local issue set (Linear-sync ready via `LOCAL-TBD`):
  - `docs/projects/pipeline-realism/issues/`

## No Gaps Audit (Spec → Issues)

The milestone doc is the canonical “no gaps” map. Use its coverage table as the enforcement mechanism:

- `docs/projects/pipeline-realism/milestones/M1-foundation-maximal-cutover.md` → `## Coverage Table (Spec / Decisions → Issues)`

## Recommended Execution Order (Stacks)

The goal is to preserve the maximal posture while staying deterministic and debuggable. Execute as 3–5 stacks, keeping a single “spine” stack that everything else builds on.

### Stack A (Spine): Publish + Plumb + Validate Harness

These must land first so every later change is observable and gateable:

1. `LOCAL-TBD-PR-M1-001` publish truth artifacts (mesh + tiles)
2. `LOCAL-TBD-PR-M1-004` validation harness scaffolding (fingerprints + invariant runners)
3. `LOCAL-TBD-PR-M1-017` determinism suite (canonical seeds + tolerance policy)
4. `LOCAL-TBD-PR-M1-005` maximal config surface + schema/versioning posture

### Stack B: Foundation Core Physics (Truth Chain)

Implement the causal chain in order:

1. `LOCAL-TBD-PR-M1-006` basaltic lid init + lithosphere strength
2. `LOCAL-TBD-PR-M1-007` mantle potential + derived forcing (D02r)
3. `LOCAL-TBD-PR-M1-008` plate motion derived from forcing (D03r)
4. `LOCAL-TBD-PR-M1-009` crust priors + partition -> plateGraph (D01)
5. `LOCAL-TBD-PR-M1-010` boundary segments + regime classification
6. `LOCAL-TBD-PR-M1-011` event engine + force emission (D06r)
7. `LOCAL-TBD-PR-M1-012` era loop + Eulerian field emission (D04r)
8. `LOCAL-TBD-PR-M1-013` provenance/tracers + lineage scalars (D04r)

Add gates as soon as the relevant artifacts exist:

- `LOCAL-TBD-PR-M1-018` mantle forcing + plate motion coupling invariants
- `LOCAL-TBD-PR-M1-019` event/material-change + belt continuity invariants

### Stack C: Tile Drivers + Morphology Dual-Read -> Cutover

1. `LOCAL-TBD-PR-M1-002` history/provenance tiles (mandatory drivers)
2. `LOCAL-TBD-PR-M1-014` morphology dual-read + comparison diagnostics
3. `LOCAL-TBD-PR-M1-015` morphology belt synthesis from new drivers
4. `LOCAL-TBD-PR-M1-020` morphology correlation gates (drivers -> belts)
5. `LOCAL-TBD-PR-M1-016` morphology cutover + remove legacy consumption paths

### Stack D: Visualization + Authoring (Author-Facing Tuning Loop)

1. `LOCAL-TBD-PR-M1-003` visualization `dataTypeKey`s + minimal layer taxonomy
2. `LOCAL-TBD-PR-M1-021` Studio authoring: physics inputs + causal overlays
3. `LOCAL-TBD-PR-M1-022` visualization refinement: debug/refined sets + era scrubber

### Stack E: Cleanup (No Legacy Left)

Only after gates are green:

1. `LOCAL-TBD-PR-M1-023` delete legacy plate motion + legacy tectonics truth
2. `LOCAL-TBD-PR-M1-024` delete legacy morphology belt drivers/bridges
3. `LOCAL-TBD-PR-M1-025` delete shadow compute paths

## Required Gates (Definition Of Done)

### Determinism

- Canonical suite exists (seed/config set), producing stable fingerprints:
  - same inputs -> identical artifact fingerprints

### Physics Invariants

- Mantle forcing and plate motion remain coupled (residual bounds).
- Events must change material/provenance (no “forces-only” tectonics).
- Belts are corridors, not lines; continuity and width distributions pass.

### Morphology Outcome Constraints (Physics-Aligned)

- Morphology consumes new drivers and passes correlation gates.
- Wall-mountain regressions are prevented by strict-mode checks.

## Drift Anchors (“Do Not Drift”)

These should be treated as single sources of truth:

- Artifact IDs + spaces + shapes:
  - `docs/projects/pipeline-realism/resources/spec/artifact-catalog.md`
- Schema/versioning posture (including viz keys vs schema versions):
  - `docs/projects/pipeline-realism/resources/spec/schema-and-versioning.md`
- Visualization dataTypeKeys and layer taxonomy:
  - `docs/projects/pipeline-realism/resources/spec/sections/visualization-and-tuning.md`
  - `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
- Stage naming / artifact IDs affected by recent Morphology/Hydrology changes:
  - `docs/projects/pipeline-realism/resources/research/stack-integration-morphology-hydrology-wind-current.md`

## Risks (Blocking If Unresolved)

- Legacy semantics remain authoritative (“maximal in name only”):
  - Mitigated by: `LOCAL-TBD-PR-M1-023`, `LOCAL-TBD-PR-M1-024`, `LOCAL-TBD-PR-M1-025` (explicit deletion / no legacy left).
- Plate motion decouples from mantle forcing (implicit authoring intent creeps back):
  - Mitigated by: `LOCAL-TBD-PR-M1-018` (coupling invariants) + `LOCAL-TBD-PR-M1-017` (determinism suite).
- “Fake tectonics” appears (forces-only fields; no crust/provenance evolution; belts not causal):
  - Mitigated by: `LOCAL-TBD-PR-M1-019` (material/provenance change invariants) + `LOCAL-TBD-PR-M1-020` (correlation gates).

If any of these occur, treat as a **hard block** (not a deferral).

## Open Decisions

- None currently tracked.
- If new decisions are discovered during implementation, record them in:
  - `docs/projects/pipeline-realism/triage.md`
