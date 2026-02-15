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

## 2026-02-15 — Anti-thrash boundary decisions (shared tectonics vs op-local rules)
```yaml
anti_thrash_boundary_decisions:
  - id: M4-D-041
    decision: keep_foundation_shared_tectonics_only_for_cross_op_primitives_types_schemas_constants
    reject:
      - shared_as_primary_home_for_op_specific_rule_logic
  - id: M4-D-042
    decision: require_decomposed_tectonics_ops_to_own_local_rules_implementations
    guardrails:
      - strategy_imports_must_be_local_contract_plus_local_rules
      - no_rule_reexport_shims_from_lib_tectonics
  - id: M4-D-043
    decision: delete_compute_tectonic_history_lib_shim_layer_after_decomposed_cutover
    rationale: disabled_mega_op_should_not_host_active_rule_logic_or_bridge_exports
  - id: M4-D-044
    decision: normalize_worktree_state_with_git_reset_before_integration_review
    rationale: reduce_mm_staged_unstaged_noise_and_restore_single_source_change_view
```

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

## 2026-02-15 — Worker architecture-anchor governance decision
```yaml
worker_governance_decision:
  - id: M4-D-032
    decision: enforce_docs_first_architecture_anchor_protocol_for_all_future_workers
    required_docs:
      - docs/system/mods/swooper-maps/architecture.md
      - docs/system/libs/mapgen/architecture.md
      - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
    enforcement:
      - worker_scratch_must_include_docs_anchor_yaml
      - orchestrator_rejects_unanchored_worker_output
```

## 2026-02-15 — Foundation sentinel hard-cut remediation decisions
```yaml
foundation_sentinel_remediation_decisions:
  - id: M4-D-033
    decision: delete_foundation_compile_sentinel_passthrough_paths_in_S06
    commit: 11ec9525d
    affected_file: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
  - id: M4-D-034
    decision: add_contract_guard_assertions_to_prevent_sentinel_reintroduction
    affected_file: mods/mod-swooper-maps/test/foundation/contract-guard.test.ts
  - id: M4-D-035
    decision: treat_wrong_worktree_worker_outputs_as_invalid_until_replayed_on_target_branch
    enforcement: orchestrator_revalidates_on_target_worktree_before_acceptance
```

## 2026-02-15 — Restack alignment decision
```yaml
restack_alignment_decision:
  - id: M4-D-036
    decision: restack_execution_stack_now_and_continue_from_restacked_heads
    commands:
      - gt sync --no-restack
      - gt restack
    resulting_heads:
      ORCH: 0f868f8b9
      S02: 4def49fbe
      S03: ddf490455
      S05: 72edaac27
      S06: 9f7cfdfc6
```

## 2026-02-15 - Foundation stage architecture cut (public/compile removal)

- Decision: remove Foundation stage `public` surface + stage `compile` logic entirely in favor of framework-default internal stage surface (knobs + step config).
- Rationale: enforce architecture posture that stage compile is not a normalization/merge layer.

```yaml
changed:
  - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts
    action: removed public schema + compile; inlined knobs schema in createStage
  - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json
    action: removed foundation.version/profiles/advanced
  - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/presets/standard/earthlike.json
    action: removed foundation.version/profiles/advanced
  - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/m11-config-knobs-and-presets.test.ts
    action: updated expectations to knobs-first foundation surface
verification:
  - bun run --cwd mods/mod-swooper-maps check
  - bun run --cwd mods/mod-swooper-maps lint
  - bun run --cwd mods/mod-swooper-maps test -- test/m11-config-knobs-and-presets.test.ts test/standard-recipe.test.ts test/foundation/contract-guard.test.ts test/standard-compile-errors.test.ts
  - bun run --cwd mods/mod-swooper-maps test -- test/foundation/no-op-calls-op-tectonics.test.ts test/foundation/m11-tectonic-events.test.ts
  - REFRACTOR_DOMAINS="foundation" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
```

## 2026-02-15 — Future-worker startup discipline decisions
```yaml
future_worker_startup_discipline_decisions:
  - id: M4-D-036
    decision: require_absolute_execution_worktree_paths_in_all_worker_startup_packets
    applies_to:
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails
  - id: M4-D-037
    decision: require_docs_anchor_and_canonical_example_evidence_before_any_worker_code_edits
    required_docs:
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/mods/swooper-maps/architecture.md
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/architecture.md
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
  - id: M4-D-038
    decision: enforce_antipattern_denylist_no_stage_compile_runtime_merge_no_manual_public_internal_translation_no_runtime_stage_defaulting
  - id: M4-D-039
    decision: require_pre_handoff_verification_gate_logs_before_orchestrator_acceptance
    required_commands:
      - bun run --cwd mods/mod-swooper-maps check
      - bun run --cwd mods/mod-swooper-maps lint
      - REFRACTOR_DOMAINS="foundation" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
      - bun run --cwd mods/mod-swooper-maps test -- test/foundation/contract-guard.test.ts test/foundation/no-op-calls-op-tectonics.test.ts test/foundation/m11-tectonic-events.test.ts test/m11-config-knobs-and-presets.test.ts test/standard-recipe.test.ts
  - id: M4-D-040
    decision: enforce_orchestrator_oversight_checklist_and_reject_worker_handoff_on_first_missing_item
    escalation: append_decision_ask_and_stop
```

## Proposed target
- Decision log remains the auditable source for startup-discipline policy changes and exceptions.

## Changes landed
- Added M4-D-036 through M4-D-040 covering path-lock, docs-anchor, anti-pattern denylist, verification gates, and oversight enforcement.

## Open risks
- If gate commands evolve, decision entries must be updated in lockstep with `00-plan.md` and `stack-ledger.md`.

## Decision asks
- none
