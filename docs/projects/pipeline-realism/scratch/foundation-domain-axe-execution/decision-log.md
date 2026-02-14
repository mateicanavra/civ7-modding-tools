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
