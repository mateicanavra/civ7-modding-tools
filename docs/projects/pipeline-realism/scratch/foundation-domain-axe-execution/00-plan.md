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

## Worker Architecture Anchor Protocol (Mandatory)
1. Before any worker edits code, the worker must read and cite:
   - `docs/system/mods/swooper-maps/architecture.md`
   - `docs/system/libs/mapgen/architecture.md`
   - `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
2. Before any worker edits code, the worker must inspect at least one in-repo canonical example and cite file path(s) in scratch.
3. Worker handoffs must include a `docs_anchor` YAML block with:
   - `docs_read`
   - `canonical_examples`
   - `architecture_constraints_applied`
4. If a worker cannot map the requested change to documented architecture constraints, it must stop and raise a decision ask instead of editing.
5. Orchestrator cannot accept worker output without explicit architecture-anchor evidence in scratch.

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

## Execution Run Plan - 2026-02-15 Hotspot Correction Loop

```yaml
objective: remediate architecture risks in highest-churn M4 implementation files
constraints:
  - no rebase
  - no shim/dual-path outcomes
  - agents must use absolute worktree paths
  - agents must anchor in domain modeling + architecture docs first
sequence:
  - launch file-owned workers
  - require append-only scratch updates per worker
  - integrate + patch conflicts
  - run focused then full verification gates
```

## 2026-02-15 — Future Worker Startup Discipline (Mandatory)

### Worker startup packet (absolute paths only)
```yaml
worker_startup_packet:
  required_paths:
    repo_root: /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools
    execution_worktree: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails
    scratch_root: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution
  reject_conditions:
    - any_relative_path_in_worker_prompt_or_handoff
    - execution_worktree_path_mismatch
    - missing_docs_anchor_block
```

### Architecture/spec anchor before edits
```yaml
docs_anchor_contract:
  required_docs:
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/mods/swooper-maps/architecture.md
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/architecture.md
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
  required_canonical_example:
    minimum_examples: 1
    example_sources:
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/packages/mapgen-core/src/authoring/stage.ts
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps
  worker_must_record:
    - docs_read
    - canonical_examples
    - architecture_constraints_applied
```

### Anti-pattern checklist (hard denylist)
```yaml
anti_patterns_forbidden:
  - no_stage_compile_runtime_merging
  - no_manual_public_to_internal_schema_translation
  - no_runtime_defaulting_inside_stage
  - no_peer_op_orchestration_inside_op_runtime
  - no_unanchored_changes_without_docs_first_packet
```

### Required verification gates before handoff
```yaml
handoff_verification_gates:
  required_commands:
    - bun run --cwd mods/mod-swooper-maps check
    - bun run --cwd mods/mod-swooper-maps lint
    - REFRACTOR_DOMAINS="foundation" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
    - bun run --cwd mods/mod-swooper-maps test -- test/foundation/contract-guard.test.ts test/foundation/no-op-calls-op-tectonics.test.ts test/foundation/m11-tectonic-events.test.ts test/m11-config-knobs-and-presets.test.ts test/standard-recipe.test.ts
  handoff_rejected_if_missing:
    - command_log
    - nonzero_exit_resolution_note
    - changed_file_inventory_with_absolute_paths
```

### Orchestrator oversight checklist
```yaml
oversight_checklist:
  - startup_packet_has_absolute_worktree_paths
  - docs_anchor_yaml_present_and_complete
  - anti_pattern_checklist_marked_pass
  - verification_gates_logged_with_exit_codes
  - decision_log_updated_for_new_policy_or_exceptions
  - stack_ledger_gate_state_updated_before_handoff_acceptance
enforcement:
  reject_worker_handoff_on_first_missing_item: true
  escalation_path: append_decision_ask_in_scratch_and_stop
```

## Proposed target
- Future worker launches are architecture-anchored, path-locked, and gate-verified before any handoff is accepted.

## Changes landed
- Added mandatory startup packet, anti-pattern denylist, verification gates, and orchestrator oversight checklist for all future workers.

## Open risks
- Guardrail command scope may need expansion when non-foundation slices become active again.

## Decision asks
- none
