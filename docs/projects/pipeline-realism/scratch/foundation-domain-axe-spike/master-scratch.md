# Master Scratch — Foundation Domain Axe Spike

## Snapshot
- Base branch: `agent-SWANKO-PRR-s112-c01-fix-driverStrength-proportional`
- Orchestrator branch: `codex/agent-ORCH-foundation-domain-axe-spike`
- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-agent-ORCH-foundation-domain-axe-spike`

## Confirmed Facts (seed)
1. Foundation stage is monolithic (`id: foundation`) with 10 sequential steps.
2. Foundation ops currently have no `rules/` directories.
3. Foundation ops currently have no dedicated `strategies/` directories.
4. `compute-tectonic-history/index.ts` is 1489 lines and includes op-calls-op behavior.

## Integration Ledger

### Checkpoint 0 (seed)
- Agents launched: pending
- Consolidated decisions: pending
- Cross-agent conflicts: pending

## Decision Candidates (rolling)
- pending

## Conflicts to Resolve (rolling)
- pending

### Checkpoint 1 (A/B/C complete)
- Agents launched: A, B, C
- Status: complete

#### Confirmed facts
1. Foundation stage compile includes dual-path sentinel behavior (Studio sentinel + canonical lowering).
2. `plate-topology` compute logic is step-local (no op contract), violating strict op-per-concern posture.
3. `compute-tectonic-history` is a mega-op and directly calls `compute-tectonic-segments` internally.
4. Multiple strategy-contract drifts exist (`compute-crust-evolution` config ignored; dead knobs in `compute-plate-graph`).
5. Foundation currently mixes physics truth and tile projection concerns.

#### Consolidated decision candidates
1. Lane split posture:
- Option A: keep Foundation owning projection tensors.
- Option B (preferred by A): move map-facing projection ownership to Gameplay lane (`artifact:map.*`) with hard cutover.
2. Tectonic history refactor posture:
- Option A (preferred by B): decompose now into multiple focused ops and move orchestration to steps.
- Option B: transitional wrapper/defer split.
3. Stage topology posture:
- Option A: 2-stage split (physics + projection).
- Option B (preferred by C): 3-stage split (substrate/kinematics -> tectonics/history -> projection).
4. Dead config surface cleanup:
- Option A: immediate breaking removal/fix of dead knobs.
- Option B: temporary compatibility window.

#### Cross-agent conflict notes
1. A recommends strict truth-vs-map lane split; C recommends keeping existing artifact IDs initially to reduce churn.
2. B proposes large op decomposition while C proposes stage split that can be done with op IDs mostly stable first.
3. Ordering question: should lane split and op decomposition happen together or staged.

### Checkpoint 2 (D/E/F complete)
- Agents launched: A, B, C, D, E, F
- Status: complete

#### Confirmed facts
1. Foundation integration has multiple contract drifts: passed-but-unused inputs, dead config fields, and dual compile-path sentinel behavior.
2. Observability identity is tightly coupled to step IDs (`layerKey`/manifest keyed by step identity), so stage-id changes propagate to tracing/viz artifacts.
3. CI does not currently enforce strict no-shim/no-dual-path guardrails (`lint:adapter-boundary`, strict domain guardrails, and `check` are not mandatory today).
4. Structural decomposition can be done without introducing shims, but sequence matters to control blast radius.

#### Consolidated decision candidates
1. Stage model:
- Option A: 2-stage split.
- Option B (recommended): 3-stage split (`foundation-substrate-kinematics` -> `foundation-tectonics-history` -> `foundation-projection`).
2. Tectonics operation model:
- Option A (recommended): decompose `compute-tectonic-history` into focused ops and move orchestration fully to step layer.
- Option B: keep mega-op shape and defer decomposition.
3. Lane policy:
- Option A: strict lane split now (`artifact:map.*` hard cut).
- Option B: keep artifact IDs stable through topology+op cleanup, then hard lane split in next stack.
4. Guardrail policy:
- Option A (recommended): strict no-shim policy takes precedence now with required CI job.
- Option B: temporary bridge allowances from migration note.

#### Cross-agent conflict notes
1. A favors immediate strict lane split; C favors staged topology with artifact-id stability first.
2. B favors immediate decomposition; E warns to preserve step-level emit compose points during decomposition to reduce viz breakage.
3. F calls out policy conflict between strict no-shim posture and migration-note temporary bridges.

#### Orchestrator synthesis (proposed sequence)
1. Phase 1: Contract cleanup + mega-op decomposition + single compile path (`D-BC1/2/3/4`) while preserving current projection artifact IDs.
2. Phase 2: 3-stage topology split with full step-id/config migration.
3. Phase 3: hard lane namespace split to `artifact:map.*` in dedicated breaking stack.
4. Throughout: enforce no-shim guardrails as required CI status checks.

## Parseability Addendum (YAML)

```yaml
checkpoint_2:
  completed_agents:
    - agent-A-boundaries-structure.md
    - agent-B-ops-strategies-rules.md
    - agent-C-stage-topology.md
    - agent-D-integration-wiring-contracts.md
    - agent-E-viz-tracing-boundaries.md
    - agent-F-testing-docs-guardrails.md

core_conflicts:
  lane_policy:
    option_A: strict_lane_split_now
    option_B: artifact_id_stability_then_lane_split
    evidence_paths:
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-A-boundaries-structure.md
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-D-integration-wiring-contracts.md
  decomposition_vs_observability:
    requirement: keep_step_level_emit_compose_points_during_op_decomposition
    evidence_paths:
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-E-viz-tracing-boundaries.md
  no_shim_policy_precedence:
    conflict: strict_spec_posture_vs_migration_note_temporary_bridges
    evidence_paths:
      - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:192
      - docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md:241
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-F-testing-docs-guardrails.md

recommended_sequence:
  - phase_1_contract_cleanup_and_decomposition
  - phase_2_three_stage_split
  - phase_3_lane_namespace_split
  - phase_4_guardrail_lock_in_ci
```
