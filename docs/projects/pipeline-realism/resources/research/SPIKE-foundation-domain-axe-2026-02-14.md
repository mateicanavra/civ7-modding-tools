# SPIKE: Foundation Domain Axe Investigation (Ops + Stages + Boundaries)

Date: 2026-02-14
Scope type: research-only (`/dev-spike`), no production refactor in this document

## 1) Objective and Non-Goals

### Objective
Define a decision-ready target architecture for Foundation so stage/step/op/strategy/rule boundaries align with domain modeling guidelines, while preserving pragmatic delivery sequencing and supporting visualization/tracing.

### Non-goals
- No production implementation changes in this spike.
- No compatibility shims or dual-path runtime recommendations.
- No "soft" migration plan that leaves legacy structures in place indefinitely.

```yaml
source_of_truth:
  primary_spec:
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
  agent_research_inputs:
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-A-boundaries-structure.md
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-D-integration-wiring-contracts.md
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-E-viz-tracing-boundaries.md
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-F-testing-docs-guardrails.md
```

## 2) Current-State Structural Inventory (Stages/Steps/Ops/Strategies/Rules)

Foundation is currently one monolithic stage (`id: foundation`) with 10 sequential steps. Ops are present, but major compute concerns are concentrated in large files and there is limited explicit `rules/` and `strategies/` factoring in Foundation.

```yaml
current_foundation_shape:
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
  key_inventory_evidence:
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:539
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:771

heavy_surfaces:
  mega_op:
    path: mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts
    notes:
      - large mixed-responsibility op
      - contains op-calls-op behavior
  heavy_steps:
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts

downstream_contract_pressure:
  morphology_reads_foundation_projection_artifacts:
    - mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts:16
    - mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/islands.contract.ts:16
    - mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes.contract.ts:15
```

## 3) Boundary Violations and Anti-Patterns

The current model violates guideline intent across stage compile boundaries, step orchestration boundaries, op composition boundaries, and strategy config truthfulness.

```yaml
violations:
  - id: BV-1
    title: dual compile path in stage boundary
    summary: foundation compile has canonical lowering plus sentinel bypass branches
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:552
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:570
      - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:170
  - id: BV-2
    title: step contains direct compute logic (op boundary leak)
    summary: plate-topology compute is implemented step-local instead of as a domain op contract
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.ts:12
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.ts:52
  - id: BV-3
    title: op-calls-op composition inside mega-op
    summary: compute-tectonic-history calls compute-tectonic-segments internally
    evidence_paths:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:7
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1183
      - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:25
  - id: BV-4
    title: contract drift (input passed but ignored)
    summary: history input.segments is passed by step but ignored by op runtime
    evidence_paths:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts:206
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:74
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1184
  - id: BV-5
    title: dead strategy/config knobs
    summary: multiple declared knobs are inert at runtime
    evidence_paths:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts:14
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:63
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract.ts:59
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:40
  - id: BV-6
    title: truth/projection lane bleed
    summary: foundation currently owns tile/map-facing projection artifacts
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:21
      - mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts:34
      - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:185
```

## 4) Target Stage Model Options and Chosen Recommendation

### Option A: 2-stage split
- `foundation-physics`
- `foundation-projection`

### Option B: 3-stage split (recommended)
- `foundation-substrate-kinematics`
- `foundation-tectonics-history`
- `foundation-projection`

Chosen recommendation: Option B.

Rationale: it creates tighter semantic gates around the highest-volatility boundaries (`tectonics` and `projection`) and maps directly to the artifact handoff clusters discovered in the current dependency DAG.

```yaml
stage_options:
  option_A:
    stages:
      - foundation-physics
      - foundation-projection
    tradeoff: lower migration churn, weaker long-term boundary clarity
  option_B:
    stages:
      - foundation-substrate-kinematics
      - foundation-tectonics-history
      - foundation-projection
    tradeoff: higher migration churn, stronger long-term boundary clarity

chosen_recommendation:
  option: option_B
  evidence_paths:
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:1
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:1
```

## 5) Target Op Catalog and Decomposition Map

Primary decomposition target is `compute-tectonic-history`: split into focused ops and move sequencing into the step layer.

```yaml
tectonics_decomposition:
  current_op:
    - foundation/compute-tectonic-history
  target_ops:
    - foundation/compute-era-plate-membership
    - foundation/compute-segment-events
    - foundation/compute-hotspot-events
    - foundation/compute-era-tectonic-fields
    - foundation/compute-tectonic-history-rollups
    - foundation/compute-tectonics-current
    - foundation/compute-tracer-advection
    - foundation/compute-tectonic-provenance
  orchestration_owner: foundation step layer (tectonics)
  evidence_paths:
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:25

secondary_decomposition_candidates:
  - from: foundation/compute-plate-graph
    to:
      - foundation/plan-plate-seeds
      - foundation/compute-plate-membership
  - from: foundation/compute-plate-motion
    to:
      - foundation/compute-plate-motion-fit
      - foundation/score-plate-motion-fit
  - from: foundation/compute-plates-tensors
    to:
      - foundation/compute-tile-to-cell-index
      - foundation/project-crust-tiles
      - foundation/project-tectonic-history-tiles
      - foundation/project-tectonic-provenance-tiles
      - foundation/project-plates-tiles
```

## 6) Strategy and Rules Factoring Model

Adopt strict layering:
- Step orchestrates ops.
- Op implements stable I/O boundary.
- Strategy varies algorithm without changing I/O.
- Rules hold small policy decisions internal to op.

```yaml
factoring_contract:
  strategies:
    requirement: every declared strategy field must affect runtime
    action_on_dead_knob: remove field or implement semantics (no inert knobs)
  rules:
    location: op-local rules/**
    scope: non-exported policy units (thresholds, scoring, selection)
  op_contracts:
    requirement: no op-internal peer op run(...) calls
  evidence_paths:
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:75
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:77
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:243
```

## 7) Visualization/Tracing Boundary Model

Observability remains step-owned at public boundaries, but emission assembly should be moved into lane-owned helper modules to avoid monolithic step files. During op decomposition, keep existing step-level compose points so external viz contracts do not explode.

```yaml
viz_tracing_model:
  retain:
    - step-level public emit boundaries
    - trace transport in mapgen-core
  change:
    - move emission formatting into lane-owned emitter modules
    - centralize duplicated legend/category metadata
  stage_alignment:
    - foundation-substrate-kinematics
    - foundation-tectonics-history
    - foundation-projection
  identity_note:
    - layerKey is step-id bound today; stage-id changes will churn layer keys
  evidence_paths:
    - packages/mapgen-viz/src/index.ts:213
    - mods/mod-swooper-maps/src/dev/viz/dump.ts:105
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-E-viz-tracing-boundaries.md
```

## 8) Breaking-Change Contract Matrix (Ops/Artifacts/Steps/Stage Config)

```yaml
breaking_change_matrix:
  - id: D-BC1
    surface: ops
    change: remove compute-tectonic-history input.segments + internal recomputation
    impact: tectonics step contract and tests
  - id: D-BC2
    surface: ops
    change: split mega-op history into focused ops and step orchestration
    impact: op registry, contracts.ts, step wiring
  - id: D-BC3
    surface: ops_and_stage_config
    change: remove dead config fields (crust-evolution knobs, plate-graph tangential knobs, inert stage fields)
    impact: authored configs, presets, docs, type tests
  - id: D-BC4
    surface: stage_compile
    change: remove sentinel compile branches; keep one canonical lowering path
    impact: producer payload shape and Studio compatibility payloads
  - id: D-BC5
    surface: stages_and_steps
    change: split foundation stage ids (3-stage model)
    impact: full step IDs, recipe config keys, snapshot tooling
  - id: D-BC6
    surface: artifacts
    variants:
      strict_now: move projection artifacts to artifact:map.* in same stack
      phased_recommended: keep IDs stable through phases 1-2, then hard lane split in phase 3
    impact: morphology contracts and downstream artifact consumers

matrix_evidence_paths:
  - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-D-integration-wiring-contracts.md
  - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-A-boundaries-structure.md
  - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md
```

## 9) Legacy Deletion Plan (100% No Shims)

No dual publish, no compatibility aliases, no temporary mirror surfaces in the target implementation stack.

```yaml
legacy_deletion_plan:
  remove:
    - stage compile sentinel paths
    - dead strategy/stage knobs
    - op-internal op chaining in foundation mega-op
  prohibit:
    - dual contract requirements in step contracts
    - shadow/compare/dual runtime paths
    - compatibility aliases for deprecated stage IDs and artifact IDs
  enforcement:
    - hard CI gate for no-shim/no-dual-path checks
    - explicit denylist manifest tests
  evidence_paths:
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:192
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-F-testing-docs-guardrails.md
```

## 10) Test and Guardrail Plan

Add a required CI job (`architecture-cutover-guardrails`) that blocks merge on boundary regressions.

```yaml
required_ci_job:
  name: architecture-cutover-guardrails
  commands:
    - bun run lint
    - bun run lint:adapter-boundary
    - REFRACTOR_DOMAINS=foundation,morphology,hydrology,ecology,placement,narrative DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
    - run no-shim/no-dual-path structural tests (existing + new)
    - bun run check

new_structural_tests:
  - foundation-topology.contract-guard.test.ts
  - no-dual-contract-paths.test.ts
  - no-shim-surfaces.test.ts (expanded scope)
  - foundation-step-boundary-guard.test.ts
  - validation-artifacts.contract.test.ts
  - foundation-legacy-absence.test.ts
  - foundation-tag-freeze.test.ts
  - no-op-calls-op-tectonics.test.ts

docs_updates:
  - docs/system/TESTING.md
  - docs/projects/pipeline-realism/resources/spec/no-shim-cutover-guardrails.md
```

## 11) Migration Risks and Mitigation

```yaml
migration_risks:
  - id: R-1
    risk: hidden step-id consumers break after stage split
    mitigation: pre-cut inventory + explicit updates in traces/snapshots/scripts
  - id: R-2
    risk: determinism drift during op decomposition
    mitigation: gate with determinism suite and fixed compose-point contracts
  - id: R-3
    risk: observability churn due to step-bound layerKey identity
    mitigation: treat as expected break, rely on semantic dataTypeKey for diffing where possible
  - id: R-4
    risk: CI/runtime time increase from strict guardrails
    mitigation: split fast static checks from heavier suites and make strict set required
  - id: R-5
    risk: policy conflict (strict no-shim vs temporary bridge language)
    mitigation: explicit precedence decision before implementation starts

risk_evidence_paths:
  - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md
  - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-E-viz-tracing-boundaries.md
  - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-F-testing-docs-guardrails.md
```

## 12) Execution-Plan Handoff Inputs

Recommended execution sequencing is intentionally no-shim and hard-cut per phase.

```yaml
execution_handoff:
  recommended_sequence:
    - phase_1_contract_cleanup_and_op_decomposition
    - phase_2_foundation_three_stage_split
    - phase_3_lane_namespace_hard_split_to_artifact_map
    - phase_4_ci_guardrail_lock_and_docs_normativity

required_pre_implementation_decisions:
  - lane_policy: strict_now vs phased_hard_split
  - dead_knob_policy: remove_now vs implement_then_keep
  - stage_split_timing: same_stack_as_decomposition vs followup_stack
  - policy_precedence: strict_no_shim_vs_temporary_bridge_language

acceptance_criteria_for_next_phase:
  - all foundation boundaries mapped to stage/step/op/strategy/rule model
  - breaking-change matrix approved
  - no-shim guardrail suite defined and accepted
  - no unresolved ownership ambiguity for viz/tracing boundaries
```

## Recommended Decisions (Integrator Call)

1. Approve 3-stage topology (`foundation-substrate-kinematics`, `foundation-tectonics-history`, `foundation-projection`).
2. Approve immediate decomposition of `compute-tectonic-history` and step-owned orchestration.
3. Approve sequencing: contract cleanup/decomposition first, stage split second, lane namespace hard split third.
4. Approve strict no-shim policy as governing posture for implementation stacks.

