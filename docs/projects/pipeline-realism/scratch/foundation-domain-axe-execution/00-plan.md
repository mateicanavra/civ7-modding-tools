# 00 Plan — M4 Foundation Domain Axe Cutover

## Charter
Execute the M4 planning-phase deliverables into implementation-ready artifacts:
- hardened milestone,
- local issue pack,
- stack ledger with Graphite slices and gates,
- prework sweep outcomes,
- orchestrator + agent scratchpads.

## Locked Decisions
1. 3-stage topology is fixed:
   - `foundation-substrate-kinematics`
   - `foundation-tectonics-history`
   - `foundation-projection`
2. Lane split is phased, but final state allows no bridges/shims.
3. Dead/inert config and strategy knobs are removed now.
4. Structure-first execution, then dedicated tuning slice.
5. Immediate strict core guardrails (CI/lint/test) posture.

## Required Sequence
1. Draft M4 milestone from spike outcomes.
2. Harden milestone into decision-complete parent issues.
3. Break milestone into local issue docs.
4. Sweep unresolved prework prompts into findings/explicit decisions.
5. Lock milestone as source-of-truth index and issue docs as execution units.

## Output Paths
```yaml
artifacts:
  milestone_doc: docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md
  issues_root: docs/projects/pipeline-realism/issues
  scratch_root: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution
  stack_ledger: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md
  decision_log: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md
```

## Validation Gates
```yaml
gates:
  G0:
    - bun run build
    - bun run lint
    - bun run test:ci
  G1:
    - bun run lint
    - bun run lint:adapter-boundary
    - REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
    - bun run check
  G2:
    - no-op-calls-op scan
    - no-dual-contract-path scan
    - no-shim-surface scan
    - topology-lock scan
  G3:
    - downstream compile success after lane rewires
  G4:
    - deterministic seed suite + intent-fit checks for presets
  G5:
    - no legacy/shadow paths
    - docs/comments/schema parity
    - bun run test:ci
```

## Working Rules
1. All scratch files are append-only.
2. Path-heavy evidence must be represented in YAML blocks.
3. Each scratch file ends with required sections:
   - `Proposed target`
   - `Changes landed`
   - `Open risks`
   - `Decision asks`

## Proposed target
- M4 milestone + issue pack is decision-complete and implementation-ready.

## Changes landed
- This execution charter has been initialized in the execution worktree.

## Open risks
- New top-of-stack branches may appear during planning artifact generation.

## Decision asks
- none

## Execution Run Plan — 2026-02-15

### Objective
Execute M4 implementation end-to-end using the existing hardened milestone/issue pack, with a mandatory integration checkpoint before `S04`.

### Locked run decisions
1. Run `S02/S03` and `S05/S06` in parallel before `S04`.
2. Enforce a hard integration gate (`IG-1`) before unblocking `S04`.
3. At `IG-1`, merge ecology stack first; if stack PR count is `>= 45`, collapse lower stack branches beneath the original starting anchor.
4. Reuse role-aligned agents where useful with explicit context bridging and compacted handoff.

### Immediate startup sequence
```yaml
startup_sequence:
  - append_kickoff_to_master_scratch_decision_log_stack_ledger
  - ensure_agent_scratch_docs_initialized_and_append_only
  - launch_parallel_precheckpoint_work:
      - S02: codex/prr-m4-s02-contract-freeze-dead-knobs
      - S03: codex/prr-m4-s03-tectonics-op-decomposition
      - S05: codex/prr-m4-s05-ci-strict-core-gates
      - S06: codex/prr-m4-s06-test-rewrite-architecture-scans
  - hard_stop_for_IG1_before_S04
```

### Integration gate (`IG-1`) contract
```yaml
integration_gate:
  id: IG-1
  blocks_until:
    - S02_green
    - S03_green
    - S05_green
    - S06_green
  required_actions:
    - merge_ecology_stack
    - evaluate_pr_count_threshold_45
    - collapse_lower_stack_if_threshold_met
    - gt_sync_and_reanchor
    - run_GI1_verification_suite
    - record_user_signoff_in_scratch
```

### Run-completion target
- Deliver `S02..S09` with all milestone/issue acceptance gates satisfied and no legacy/shim surfaces remaining.
