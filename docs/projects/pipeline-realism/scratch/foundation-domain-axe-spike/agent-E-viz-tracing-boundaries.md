# Agent E — Visualization and Tracing Boundaries

## Axis Ownership
Define how visualization/tracing should align with target Foundation boundaries without leaking orchestration or contract concerns across layers.

## Deliverables
1. Current coupling/bleed inventory (stage/step/op -> viz/tracing).
2. Target boundary model for debug/observability surfaces.
3. Recommended organization of viz/tracing ownership in refactored structure.

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

### 2026-02-14 — Agent E viz/tracing boundary pass

#### Working Notes (append-only)
- Foundation still executes as a single stage (`id: "foundation"`) with all 10 step contracts under one stage envelope, and runtime full step ids are derived as `<namespace>.<recipe>.<stageId>.<stepId>`. This means observability identity currently inherits stage topology directly. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:557`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:771`, `packages/mapgen-core/src/authoring/recipe.ts:58`, `packages/mapgen-core/src/authoring/recipe.ts:65`]
- Foundation viz emission is step-owned (not op-owned) and concentrated in two heavy steps: `projection.ts` (~28 emission/trace callsites) and `tectonics.ts` (~22), with lighter emissions spread across the other 8 steps. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:111`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:475`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:84`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:381`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mesh.ts:51`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateMotion.ts:123`]
- `tectonics.ts` interleaves orchestration + publication + dense viz emission for both current tensors and per-era history variants, including repeated boundary-type category definitions local to the step. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:55`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:79`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:84`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:18`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:320`]
- `projection.ts` does the same for tile projection artifacts plus diagnostics; it emits many tile layers and also emits a custom ASCII trace event payload (`kind: foundation.plates.ascii.boundaryType`) outside the viz-layer envelope. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:90`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:105`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:111`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:355`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:475`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:490`]
- Foundation uses one local viz helper module (`steps/viz.ts`) for geometry conversion across both mesh/world and tile-topology emissions; helper ownership is currently by step folder, not by domain lane. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/viz.ts:1`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/viz.ts:25`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/viz.ts:76`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/viz.ts:92`]
- Core interfaces couple viz to tracing by design: `ExtendedMapContext` carries both `trace` and `viz`, `VizDumper.dump*` requires `TraceScope`, and `PipelineExecutor` replaces `context.trace` per step. [evidence: `packages/mapgen-core/src/core/types.ts:213`, `packages/mapgen-core/src/core/types.ts:275`, `packages/mapgen-core/src/engine/PipelineExecutor.ts:124`, `packages/mapgen-core/src/engine/PipelineExecutor.ts:126`]
- Dump emission is currently tied to `trace.isVerbose`; each `dump*` call emits a `step.event` payload and layer identity is keyed with `trace.stepId`. [evidence: `mods/mod-swooper-maps/src/dev/viz/dump.ts:153`, `mods/mod-swooper-maps/src/dev/viz/dump.ts:154`, `mods/mod-swooper-maps/src/dev/viz/dump.ts:162`, `mods/mod-swooper-maps/src/dev/viz/dump.ts:175`, `mods/mod-swooper-maps/src/dev/viz/dump.ts:211`, `mods/mod-swooper-maps/src/dev/viz/dump.ts:270`]
- The sink indexes manifests by step identity and only materializes viz layers when `event.data.type === "viz.layer.dump.v1"`; custom step events remain trace-only. [evidence: `mods/mod-swooper-maps/src/dev/viz/dump.ts:101`, `mods/mod-swooper-maps/src/dev/viz/dump.ts:105`, `mods/mod-swooper-maps/src/dev/viz/dump.ts:111`, `mods/mod-swooper-maps/src/dev/viz/dump.ts:114`, `mods/mod-swooper-maps/src/dev/viz/dump.ts:117`]
- Contract-level identity also bakes in step topology: `VizLayerIdentityV1` stores `stepId`, and `createVizLayerKey` includes `stepId` in the canonical key material. [evidence: `packages/mapgen-viz/src/index.ts:102`, `packages/mapgen-viz/src/index.ts:107`, `packages/mapgen-viz/src/index.ts:204`, `packages/mapgen-viz/src/index.ts:213`]
- Foundation ops themselves appear instrumentation-free today (no `TraceScope`, `context.trace`, `VizDumper`, or `dump*` references in `mods/mod-swooper-maps/src/domain/foundation/ops`), so observability responsibility is currently step-only. [evidence: `mods/mod-swooper-maps/src/domain/foundation/ops` directory scan for `context.trace|TraceScope|VizDumper|dumpGrid|dumpPoints|dumpSegments` returned no matches]
- Observable lane bleed already exists in naming/ownership: Foundation projection publishes tile/map-facing artifacts (`foundation.plates`, `foundation.crustTiles`, `foundation.tectonicHistoryTiles`, `foundation.tectonicProvenanceTiles`) while a separate gameplay-owned `artifact:map.*` namespace already exists for projection metadata/materialization. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:21`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts:770`, `mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts:31`, `mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts:34`]
- Checkpoint context to preserve in this axis: lane split is contested (keep Foundation projection vs move map-facing projection to `artifact:map.*`), and topology split is contested (2-stage vs 3-stage, with 3-stage preferred in stage analysis). [evidence: `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/master-scratch.md:40`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/master-scratch.md:41`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/master-scratch.md:46`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/master-scratch.md:47`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md:47`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md:57`]
- Op decomposition pressure materially affects this axis: `compute-tectonic-history` decomposition proposals keep warning that `tectonics` viz currently expects one aggregated `historyResult` compose point. [evidence: `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:34`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:78`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:178`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:67`]

#### Boundary-bleed hotspots
- Bleed A: runtime observability enablement is coupled to trace verbosity, so there is no independent viz gate in the current contract surface. [evidence: `packages/mapgen-core/src/trace/index.ts:177`, `mods/mod-swooper-maps/src/dev/viz/dump.ts:154`, `docs/system/libs/mapgen/pipeline-visualization-deckgl.md:81`, `docs/system/libs/mapgen/pipeline-visualization-deckgl.md:82`]
- Bleed B: visualization identity is coupled to orchestration topology (`stepId` in `layerKey` + manifest step list), so stage-id changes become viz-contract changes even when data semantics (`dataTypeKey`) are unchanged. [evidence: `packages/mapgen-viz/src/index.ts:12`, `packages/mapgen-viz/src/index.ts:107`, `packages/mapgen-viz/src/index.ts:213`, `mods/mod-swooper-maps/src/dev/viz/dump.ts:105`, `mods/mod-swooper-maps/src/dev/viz/dump.ts:162`]
- Bleed C: truth/projection concerns co-reside in Foundation naming and emission (`foundation.history.*` appears in world-space tectonics and tile-space projection), which blurs ownership boundaries for observability catalogs. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:320`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:355`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:21`]
- Bleed D: legend/category metadata for similar concepts is duplicated across steps (example: boundary type category arrays in both `tectonics.ts` and `projection.ts`). [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:18`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:132`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:365`]
- Bleed E: custom debug traces (ASCII summaries) are embedded in projection step orchestration and bypass the typed viz-layer path, fragmenting observability shapes. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:475`, `mods/mod-swooper-maps/src/dev/viz/dump.ts:114`]

## Proposed target model
- Ownership split by boundary, not by file size:
  1. **Trace transport ownership (`mapgen-core`)**: keep `TraceSession`/`TraceScope` and sink mechanics as the shared transport spine. [evidence: `packages/mapgen-core/src/trace/index.ts:43`, `packages/mapgen-core/src/engine/PipelineExecutor.ts:99`]
  2. **Lane observability ownership (`mods/mod-swooper-maps`)**:
     - Foundation truth-lane observability owns mesh/world emissions for physics truth artifacts (mesh, plate graph/motion, tectonics, crust truth).
     - Projection/materialization observability owns tile/map emissions and map-facing projection artifacts (targeting `artifact:map.*` posture when lane split is approved). [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts:19`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:21`, `mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts:34`]
  3. **Step orchestration ownership**: steps remain the callsite owners, but emission assembly should move to lane-owned emitter modules so compute orchestration and observability formatting are not interleaved in monolithic step bodies. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:55`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:80`]
- Stage topology recommendation for this axis: align with 3-stage split (`substrate-kinematics`, `tectonics-history`, `projection`) because it isolates the two highest-emission boundaries (`tectonics`, `projection`) into dedicated stage envelopes; this improves trace filtering and ownership clarity more than a 2-stage split. [evidence: `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md:57`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md:67`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:1`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:1`]
- Op decomposition posture for observability: preserve **step-level public emit boundaries** while allowing internal op decomposition; add optional op-tagged sub-events under `step.event` only when needed for diagnosis, but keep manifest layer publication at step compose points to avoid layer-key explosion. [evidence: `packages/mapgen-core/src/trace/index.ts:14`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:160`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:178`]
- Data identity policy: keep `dataTypeKey` as semantic owner identity and treat `layerKey` as transport identity; lane split should change semantic ownership prefixes intentionally (e.g. Foundation truth vs map projection) rather than implicitly via stage-id churn. [evidence: `packages/mapgen-viz/src/index.ts:17`, `packages/mapgen-viz/src/index.ts:204`, `docs/projects/mapgen-studio/VIZ-SDK-V1.md:38`, `docs/projects/mapgen-studio/VIZ-SDK-V1.md:203`]

## Breaking-change inventory
- Stage split (2-stage or 3-stage) changes full `stepId` strings because step id includes `stageId`; this cascades into trace step keys and viz `layerKey` values. [evidence: `packages/mapgen-core/src/authoring/recipe.ts:65`, `packages/mapgen-viz/src/index.ts:213`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:557`]
- Dump manifest step inventory and layer `stepIndex` ordering will change with stage topology changes, even if `dataTypeKey` remains stable. [evidence: `mods/mod-swooper-maps/src/dev/viz/dump.ts:103`, `mods/mod-swooper-maps/src/dev/viz/dump.ts:117`, `packages/mapgen-viz/src/index.ts:200`]
- Any explicit `env.trace.steps` pinning by step id must be updated after stage split; current dev tooling derives this dynamically from plan nodes, but static configs/scripts would break. [evidence: `packages/mapgen-core/src/core/env.ts:18`, `mods/mod-swooper-maps/src/dev/viz/standard-run.ts:50`, `mods/mod-swooper-maps/src/dev/viz/foundation-run.ts:47`]
- If lane split moves tile/map-facing projection out of Foundation namespace, downstream morphology and any consumers requiring `foundation.plates`/tile tensors need contract rewiring (or hard cutover). [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/islands.contract.ts:16`, `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts:16`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:22`]
- Op decomposition that introduces new steps (instead of step-internal composition) would further multiply step-id/layer-key churn; step-internal decomposition avoids this specific external observability break. [evidence: `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:159`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:160`]

## Open risks
- Highest risk: unintentional observability drift where the same semantic field appears under mixed lane ownership (`foundation.*` + `map.*`) during migration, confusing Studio grouping and historical diffing. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:111`, `mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts:34`, `docs/projects/mapgen-studio/VIZ-SDK-V1.md:200`]
- Topology churn risk: because `layerKey` is step-bound, historical cross-run comparisons by layer key will fragment after stage renames unless comparison tooling pivots to `dataTypeKey/space/variant`. [evidence: `packages/mapgen-viz/src/index.ts:213`, `docs/projects/mapgen-studio/VIZ-SDK-V1.md:34`, `docs/projects/mapgen-studio/VIZ-SDK-V1.md:51`]
- Decomposition risk: if tectonics decomposition removes the single aggregate compose point too early, viz emissions can become partial/inconsistent across eras and break expected manifests. [evidence: `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:178`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:314`]
- Operability risk: viz is currently `verbose`-gated; large decomposition or extra sub-events can sharply increase trace volume and dump size if no boundary policy is enforced. [evidence: `packages/mapgen-core/src/trace/index.ts:177`, `mods/mod-swooper-maps/src/dev/viz/dump.ts:154`, `mods/mod-swooper-maps/src/dev/viz/dump.ts:87`]

## Decision asks for orchestrator
- Confirm boundary posture: adopt the 3-stage split for observability ownership (`substrate-kinematics`, `tectonics-history`, `projection`) vs 2-stage. Recommendation: 3-stage for cleaner viz/tracing ownership boundaries. [evidence: `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md:57`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md:67`]
- Confirm lane posture: approve hard truth/projection lane split for map-facing products (`artifact:map.*`) or keep Foundation owning tile projections for this migration slice. [evidence: `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/master-scratch.md:40`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/master-scratch.md:41`, `mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts:31`]
- Confirm identity policy during split: accept `layerKey` churn as expected (step-bound contract) or queue a viz-contract evolution to decouple layer identity from step id in a later version. [evidence: `packages/mapgen-viz/src/index.ts:12`, `packages/mapgen-viz/src/index.ts:213`, `docs/projects/mapgen-studio/VIZ-SDK-V1.md:19`]
- Confirm decomposition posture for observability: keep op decomposition step-internal at first (stable public step emits) vs introducing new intermediate steps with finer-grained trace/viz surfaces. [evidence: `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/master-scratch.md:54`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:159`]
- Confirm trace/viz gating policy: keep current verbose-only viz gate, or define a separate viz gate to reduce coupling and control dump size during decomposition-heavy iterations. [evidence: `packages/mapgen-core/src/trace/index.ts:177`, `docs/system/libs/mapgen/pipeline-visualization-deckgl.md:82`]

### 2026-02-14 — Parseability Addendum (YAML)

```yaml
observability_coupling:
  step_id_shapes_viz_identity:
    evidence_paths:
      - packages/mapgen-core/src/authoring/recipe.ts:65
      - packages/mapgen-viz/src/index.ts:213
      - mods/mod-swooper-maps/src/dev/viz/dump.ts:105
  viz_gate_is_trace_verbose:
    evidence_paths:
      - packages/mapgen-core/src/trace/index.ts:177
      - mods/mod-swooper-maps/src/dev/viz/dump.ts:154
      - docs/system/libs/mapgen/pipeline-visualization-deckgl.md:82

hotspots:
  tectonics_step_density:
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:84
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:381
  projection_step_density:
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:111
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:475

boundary_bleed:
  truth_projection_lane_mix:
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:21
      - mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts:34
  duplicated_boundary_legends:
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:18
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:132

recommendation:
  stage_topology_for_viz:
    value: foundation_substrate_kinematics__foundation_tectonics_history__foundation_projection
    evidence_paths:
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md:57
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md:67
  compose_point_policy:
    value: keep_public_emit_boundaries_at_step_level_during_op_decomposition
    evidence_paths:
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:159
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:178
```
