# Decision Log — M4 Foundation Domain Axe Execution

## Locked at kickoff
```yaml
decisions:
  - id: M4-D-001
    decision: lock_3_stage_foundation_model
  - id: M4-D-002
    decision: phased_lane_split_with_no_bridges_in_final_state
  - id: M4-D-003
    decision: remove_dead_inert_knobs_now
  - id: M4-D-004
    decision: structure_first_then_tuning
  - id: M4-D-005
    decision: immediate_strict_core_guardrails
```

## Rolling decisions
- pending

## Proposed target
- Every material architecture choice is explicit, timestamped, and linked to artifact updates.

## Changes landed
- Kickoff decisions recorded.

## Open risks
- Hidden implied decisions in legacy docs may conflict with locked decisions.

## Decision asks
- none

## 2026-02-14 — Planning decisions captured during execution kickoff
```yaml
new_decisions:
  - id: M4-D-006
    decision: milestone_form_is_new_M4_pack
  - id: M4-D-007
    decision: guardrail_rollout_is_immediate_strict_core
  - id: M4-D-008
    decision: linear_sync_mode_is_milestone_plus_issue_docs_now
  - id: M4-D-009
    decision: tuning_mode_is_structure_first_then_tuning_slice
```

## 2026-02-14 — Rolling decisions consolidated from agent streams
```yaml
rolling_decisions_consolidated:
  - id: M4-D-010
    decision: contract_truth_policy_is_strict_required_inputs_must_be_runtime_consumed
    owner_issue: LOCAL-TBD-PR-M4-001
    source: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-A-core-spine.md
  - id: M4-D-011
    decision: orchestration_ownership_is_step_only_ops_do_not_call_peer_ops
    owner_issue: LOCAL-TBD-PR-M4-002
    source: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-A-core-spine.md
  - id: M4-D-012
    decision: stage_topology_cutover_is_hard_three_stage_with_no_aliases
    owner_issue: LOCAL-TBD-PR-M4-003
    source: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-B-stage-topology.md
  - id: M4-D-013
    decision: stage_compile_surface_must_remove_sentinel_paths_and_inert_fields_in_same_cut
    owner_issue: LOCAL-TBD-PR-M4-003
    source: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-B-stage-topology.md
  - id: M4-D-014
    decision: lane_split_is_single_hard_cut_to_artifact_map_foundation_star_with_zero_dual_publish
    owner_issue: LOCAL-TBD-PR-M4-004
    source: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-C-lane-and-downstream.md
  - id: M4-D-015
    decision: strict_core_ci_is_required_early_with_full_domain_guardrail_profile_only
    owner_issue: LOCAL-TBD-PR-M4-005
    source: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-D-testing-guardrails.md
  - id: M4-D-016
    decision: g2_requires_structural_architecture_tests_for_no_op_calls_op_no_dual_paths_no_shims_topology_lock
    owner_issue: LOCAL-TBD-PR-M4-005
    source: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-D-testing-guardrails.md
  - id: M4-D-017
    decision: stepid_stageid_churn_is_allowed_but_semantic_viz_identity_surfaces_must_remain_stable
    owner_issue: LOCAL-TBD-PR-M4-003
    source: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-E-viz-tracing.md
  - id: M4-D-018
    decision: lane_split_must_not_rename_semantic_datatypekeys_due_to_emitter_relocation
    owner_issue: LOCAL-TBD-PR-M4-004
    source: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-E-viz-tracing.md
  - id: M4-D-019
    decision: config_surface_is_physics_input_first_math_params_internal_only
    owner_issue: LOCAL-TBD-PR-M4-006
    source: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-F-docs-config.md
  - id: M4-D-020
    decision: earthlike_measurable_intent_checks_and_docs_schema_parity_are_blocking_for_s09
    owner_issue: LOCAL-TBD-PR-M4-006
    source: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-F-docs-config.md
```

## 2026-02-14 — Reviewer R remediation decisions
```yaml
reviewer_r_findings_resolution:
  - finding: tier2_viz_tracing_ownership_gap
    resolution: assigned_to_LOCAL-TBD-PR-M4-003_with_executable_commands
  - finding: m4_006_earthlike_and_docs_parity_under_enforced
    resolution: acceptance_and_verification_upgraded_in_LOCAL-TBD-PR-M4-006
  - finding: m4_005_s09_ownership_inconsistency
    resolution: clarified_S05_S06_scope_and_G5_handoff_to_M4-006
  - finding: central_decision_log_incomplete
    resolution: consolidated_agent_A_to_F_decisions_into_central_log
```

## 2026-02-15 — Execution kickoff decisions
```yaml
execution_kickoff_decisions:
  - id: M4-D-021
    decision: pre_s04_integration_gate_is_mandatory
    owner_issue: LOCAL-TBD-PR-M4-003
  - id: M4-D-022
    decision: precheckpoint_parallel_execution_set_is_S02_S03_S05_S06
    owner_issue: LOCAL-TBD-PR-M4-002_and_LOCAL-TBD-PR-M4-005
  - id: M4-D-023
    decision: integration_gate_merges_ecology_first_then_applies_pr_threshold_45_policy
    owner_issue: LOCAL-TBD-PR-M4-001
  - id: M4-D-024
    decision: if_integration_gate_fails_add_dedicated_conflict_fix_slice_before_S04
    owner_issue: LOCAL-TBD-PR-M4-003
  - id: M4-D-025
    decision: agent_reuse_requires_compact_ack_and_context_bridge_before_new_slice_assignment
    owner_issue: LOCAL-TBD-PR-M4-001
```

## 2026-02-15 — Stack repair decision (execution safety)
```yaml
execution_repair_decision:
  - id: M4-D-026
    decision: enforce_non_rebase_stack_repair_using_gt_move_track_and_stash_restore
    rationale: preserve_in_flight_slice_work_without_history_rewrites_during_active_parallel_execution
    applies_to:
      - codex/prr-m4-s02-contract-freeze-dead-knobs
      - codex/prr-m4-s05-ci-strict-core-gates
      - codex/prr-m4-s06-test-rewrite-architecture-scans
```

## 2026-02-15 — Slice progression decisions
```yaml
slice_progression_decisions:
  - id: M4-D-027
    decision: accept_S02_contract_cleanup_commit_and_advance_to_S03
    commit: 334b3a24d
  - id: M4-D-028
    decision: keep_S05_S06_as_committed_guardrail_scaffold_with_known_debt_to_be_consumed_by_core_refactor
    commits:
      - 6193ee133
      - e5beccd72
```

## 2026-02-15 — Pre-IG1 alignment and gate decisions
```yaml
pre_ig1_alignment_and_gate_decisions:
  - id: M4-D-029
    decision: align_S05_S06_on_top_of_S03_using_gt_move_without_rebase
    command: gt move --source codex/prr-m4-s05-ci-strict-core-gates --onto codex/prr-m4-s03-tectonics-op-decomposition
    resulting_commits:
      S05: 5b066753a
      S06: 6cee8de01
  - id: M4-D-030
    decision: accept_pre_IG1_gate_matrix_as_green_except_external_ecology_guardrail_debt
    gate_summary:
      G0_build: pass
      G0_lint: pass
      G1_adapter_boundary: pass
      G1_full_domain_guardrails: fail_external_ecology_debt
      G1_check: pass
      G2_no_op_calls_op: pass
      G2_no_dual_contract_paths: pass
      G2_no_shim_surfaces: pass
      G2_foundation_topology_lock: pass
  - id: M4-D-031
    decision: mark_IG1_entry_ready_and_hold_S04_until_ecology_merge_checkpoint_is_completed
    owner_issue: LOCAL-TBD-PR-M4-003
```
