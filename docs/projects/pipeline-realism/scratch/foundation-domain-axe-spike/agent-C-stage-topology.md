# Agent C — Foundation Stage Topology

## Axis Ownership
Investigate how Foundation should be split/reorganized into stages (and step sequences) to produce a maintainable architecture and better operation ergonomics.

## Deliverables
1. Current stage/step topology diagnosis.
2. Candidate target stage topologies (at least 2 options).
3. Chosen recommended topology with rationale and gating boundaries.

## Working Notes (append-only)
- 

## Proposed target model
- 

## Breaking-change inventory
- 

## Open risks
- 

## Decision asks for orchestrator
- 

### 2026-02-14 - Agent C topology diagnosis

#### Current topology (single stage, 10 ordered steps)
- Foundation is authored as one stage (`id: "foundation"`) and declares 10 step ids: `mesh`, `mantle-potential`, `mantle-forcing`, `crust`, `plate-graph`, `plate-motion`, `tectonics`, `crust-evolution`, `projection`, `plate-topology`. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:539`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:557`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:771`]
- Recipe order is stage order from `recipe.ts`, with `foundation` first, then morphology/hydrology/ecology/map/placement stages. [evidence: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts:29`, `mods/mod-swooper-maps/src/recipes/standard/recipe.ts:30`, `mods/mod-swooper-maps/src/recipes/standard/recipe.ts:43`]
- Runtime execution is linear in compiled recipe node order; there is no runtime topological reordering pass. [evidence: `packages/mapgen-core/src/engine/execution-plan.ts:96`, `packages/mapgen-core/src/engine/PipelineExecutor.ts:107`]

#### Effective in-stage dependency DAG (from step contracts)
- `mesh` -> `mantle-potential` -> `mantle-forcing` -> `crust` -> (`plate-graph`, `plate-motion`) -> `tectonics` -> `crust-evolution` -> `projection` -> `plate-topology`. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mesh.contract.ts:12`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mantlePotential.contract.ts:12`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mantleForcing.contract.ts:12`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crust.contract.ts:12`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateGraph.contract.ts:12`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateMotion.contract.ts:12`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts:12`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crustEvolution.contract.ts:12`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:12`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.contract.ts:11`]
- Handoff to Morphology currently happens through projection outputs (`foundation.plates`, `foundation.crustTiles`, `foundation.tectonicHistoryTiles`, `foundation.tectonicProvenanceTiles`). [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts:16`, `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/islands.contract.ts:16`, `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes.contract.ts:15`]

#### Topology pain points in current single-stage model
1. The stage authoring surface is overloaded (profiles + 5 advanced sub-surfaces + knobs + studio sentinel compatibility in one module), making the stage a broad coordination point instead of a narrow contract boundary. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:38`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:57`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:108`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:147`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:172`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:223`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:236`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:272`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:552`]
2. Knob/config normalization for plate count is duplicated across stage compile and two step normalizers, increasing drift risk when one side changes. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:586`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:688`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:731`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mesh.ts:17`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateGraph.ts:17`]
3. Late-stage concentration is very high: `tectonics.ts` (395 lines) and `projection.ts` (497 lines) are heavy orchestrators with dense viz emission, while they are still inside one stage label (`foundation`). [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:1`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:395`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:1`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:497`]
4. `plate-topology` is a derived, configless analytics step over already projected tile plates, but it currently shares the same stage-level lifecycle as deep physics generation. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.contract.ts:11`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.contract.ts:14`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.ts:35`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.ts:39`]
5. Validation logic for Foundation artifacts is centralized in one large file (708 lines), which increases edit collision probability and slows local reasoning when touching any one artifact boundary. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts:6`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts:708`]
6. Stage boundaries have proven ergonomics value elsewhere in this repo (Morphology split ADR): explicit stage boundaries improved legibility and knob scoping at the cost of step-id churn. Foundation is exhibiting similar symptoms today. [evidence: `docs/system/ADR.md:117`, `docs/system/ADR.md:131`, `docs/system/ADR.md:132`, `docs/system/ADR.md:129`]

### Candidate target stage topologies

#### Candidate A: 2-stage split (physics spine + projection/topology)
- `foundation-physics`:
  - steps: `mesh`, `mantle-potential`, `mantle-forcing`, `crust`, `plate-graph`, `plate-motion`, `tectonics`, `crust-evolution`.
- `foundation-projection`:
  - steps: `projection`, `plate-topology`.

Assessment:
- Pros: minimal graph change, clear mesh-space -> tile-space cut, preserves existing physics chain intact. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:12`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.contract.ts:11`]
- Cons: first stage is still large (8 steps), so configuration and ergonomics pressure remains concentrated. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:771`]

#### Candidate B: 3-stage split (substrate/kinematics -> tectonic history -> projection/topology)
- `foundation-substrate-kinematics`:
  - steps: `mesh`, `mantle-potential`, `mantle-forcing`, `crust`, `plate-graph`, `plate-motion`.
- `foundation-tectonics-history`:
  - steps: `tectonics`, `crust-evolution`.
- `foundation-projection`:
  - steps: `projection`, `plate-topology`.

Assessment:
- Pros: aligns stage boundaries with artifact handoff clusters (kinematics products, tectonic products, tile products) and keeps each stage semantically coherent. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateMotion.contract.ts:13`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts:19`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crustEvolution.contract.ts:19`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:21`]
- Pros: naturally isolates the largest/most volatile orchestration files into separate stages (`tectonics.ts`, `projection.ts`). [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:1`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:1`]
- Cons: more migration churn than Candidate A (more stage-id and config-key changes). [evidence: `packages/mapgen-core/src/authoring/recipe.ts:58`, `docs/system/ADR.md:129`]

#### Candidate comparison summary
- Candidate A optimizes for lower migration cost.
- Candidate B optimizes for clearer architecture boundaries and future sliceability.
- Given current pain concentration around tectonic/projection boundaries, Candidate B gives better long-term maintainability for only moderate extra migration cost.

### Recommended topology and gating rationale

Recommendation: adopt **Candidate B (3-stage split)**.

Proposed sequencing and gates:
1. Gate after `foundation-substrate-kinematics`: require `foundationMesh`, `foundationMantleForcing`, `foundationCrustInit`, `foundationPlateGraph`, `foundationPlateMotion`. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mesh.contract.ts:12`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mantleForcing.contract.ts:13`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crust.contract.ts:13`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateGraph.contract.ts:13`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateMotion.contract.ts:13`]
2. Gate after `foundation-tectonics-history`: require `foundationTectonics`, `foundationTectonicSegments`, `foundationTectonicHistory`, `foundationTectonicProvenance`, `foundationCrust`. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts:19`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crustEvolution.contract.ts:19`]
3. Gate after `foundation-projection`: require `foundationPlates`, `foundationTileToCellIndex`, `foundationCrustTiles`, `foundationTectonicHistoryTiles`, `foundationTectonicProvenanceTiles`, `foundationPlateTopology` before morphology start. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:21`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.contract.ts:12`, `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts:16`, `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/islands.contract.ts:16`]

Operation ergonomics impact:
- Better stage-level observability and Studio legibility because semantics move from one broad `foundation` bucket into three narrower stage addresses (same rationale already accepted for morphology split). [evidence: `docs/system/ADR.md:117`, `docs/system/ADR.md:131`, `docs/system/ADR.md:133`]
- Reduced merge-collision surface in stage compile modules by shrinking the single giant stage file and concentrating each stage’s compile/default logic by concern. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:1`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:772`]
- Clearer knob ownership:
  - substrate/kinematics knobs (plateCount-related) stay in stage 1,
  - projection activity multiplier knobs stay in stage 3 (`computePlates` normalize). [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mesh.ts:17`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateGraph.ts:17`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:56`]

Future maintainability impact:
- Preserves op contracts/artifact ids while improving composition boundaries (domain contracts remain reusable, stage contracts become clearer). [evidence: `mods/mod-swooper-maps/src/domain/foundation/ops/contracts.ts:12`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts:739`]
- Matches the domain-modeling guideline that steps are orchestration boundaries and composition should avoid broad, conflated units. [evidence: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:13`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:22`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:30`]

## Proposed target model
- Adopt a 3-stage Foundation topology:
  1. `foundation-substrate-kinematics` -> `mesh`, `mantle-potential`, `mantle-forcing`, `crust`, `plate-graph`, `plate-motion`.
  2. `foundation-tectonics-history` -> `tectonics`, `crust-evolution`.
  3. `foundation-projection` -> `projection`, `plate-topology`.
- Keep current op ids and artifact ids unchanged (`foundation.*`) to minimize downstream dependency churn. [evidence: `mods/mod-swooper-maps/src/domain/foundation/ops/contracts.ts:12`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts:739`]
- Keep recipe ordering explicit in `recipe.ts`, with the three Foundation stages still preceding morphology. [evidence: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts:29`, `mods/mod-swooper-maps/src/recipes/standard/recipe.ts:31`]

## Breaking-change inventory
- Full step ids will change because step ids are namespaced by stage id in recipe assembly (`<namespace>.<recipe>.<stage>.<step>`). [evidence: `packages/mapgen-core/src/authoring/recipe.ts:58`, `packages/mapgen-core/src/authoring/recipe.ts:65`, `docs/system/ADR.md:129`]
- Stage config keys will change from one `foundation` config block to multiple Foundation stage blocks (compile schema keyed by stage id). [evidence: `packages/mapgen-core/src/compiler/recipe-compile.ts:81`, `packages/mapgen-core/src/compiler/recipe-compile.ts:83`]
- Any tooling/tests/docs that reference old `foundation` stage id or full step ids need updates (same class of break observed in morphology split). [evidence: `docs/system/ADR.md:134`]
- If stage-level labels are surfaced in Studio, uiMeta stage names likely need updates to preserve author readability after split. [evidence: `docs/system/ADR.md:133`]

## Open risks
- Hidden consumers may rely on hard-coded Foundation full step ids in traces/snapshots/scripts; this is not fully inventoried in this pass. [evidence: `packages/mapgen-core/src/authoring/recipe.ts:58`]
- If split execution order is miswired, runtime will fail fast with missing dependency errors; there is no runtime reorder fallback. [evidence: `packages/mapgen-core/src/engine/PipelineExecutor.ts:113`, `packages/mapgen-core/src/engine/PipelineExecutor.ts:117`]
- `plate-topology` currently depends on projected tile plates only; moving it earlier would violate dependency reality. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.contract.ts:11`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:22`]
- Validation logic remains centralized in one large module; stage split alone does not solve validator collision pressure. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts:6`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts:708`]

## Decision asks for orchestrator
- Confirm split granularity: approve Candidate B (3-stage) vs Candidate A (2-stage).
- Confirm final stage ids (`foundation-substrate-kinematics`, `foundation-tectonics-history`, `foundation-projection`) or provide naming edits.
- Confirm cutover posture for config/tests/docs: hard cutover in one stack (no compatibility aliases), consistent with prior stage-split posture.
- Confirm whether `plate-topology` should remain bundled with projection or become a later optional analytics stage in a follow-up slice.
- Confirm whether to keep all current per-step viz emissions in place during topology split, or pair split with a follow-up viz-thinning task.

### 2026-02-14 — Parseability Addendum (YAML)

```yaml
current_topology:
  stage_id: foundation
  ordered_steps:
    - mesh
    - mantle-potential
    - mantle-forcing
    - crust
    - plate-graph
    - plate-motion
    - tectonics
    - crust-evolution
    - projection
    - plate-topology
  evidence_paths:
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:539
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:771

candidate_models:
  A_two_stage_split:
    stages:
      - foundation-physics
      - foundation-projection
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:12
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.contract.ts:11
  B_three_stage_split:
    stages:
      - foundation-substrate-kinematics
      - foundation-tectonics-history
      - foundation-projection
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateMotion.contract.ts:13
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts:19
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:21

recommended_model:
  id: candidate_B_three_stage_split
  reasons:
    - isolates volatile tectonics/projection orchestration
    - aligns stage gates to artifact handoff clusters
    - improves stage-level legibility for tracing and Studio
  evidence_paths:
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:1
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:1
    - docs/system/ADR.md:117
    - docs/system/ADR.md:131

migration_impact:
  changed_full_step_ids:
    - packages/mapgen-core/src/authoring/recipe.ts:65
  changed_stage_config_keys:
    - packages/mapgen-core/src/compiler/recipe-compile.ts:81
  known_break_surface_examples:
    - mods/mod-swooper-maps/src/maps/__type_tests__/createMap-config.inference.ts:15
    - docs/system/ADR.md:134
```
