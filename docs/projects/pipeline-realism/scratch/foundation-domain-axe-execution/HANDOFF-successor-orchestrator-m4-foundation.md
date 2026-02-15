# Successor Handoff — M4 Foundation Domain Axe Cutover

## Mission
- Complete M4 architecture-first cutover for Foundation through integration gate `IG-1` and remaining execution slices, enforcing no-legacy/no-shim posture.

## Current stack snapshot
```yaml
handoff_snapshot:
  worktree: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails
  current_branch: codex/prr-m4-s06d-foundation-scratch-audit-ledger
  top_stack:
    - codex/prr-m4-s06d-foundation-scratch-audit-ledger
    - codex/prr-m4-s06c-foundation-guardrails-hardening
    - codex/prr-m4-s06b-foundation-tectonics-local-rules
    - codex/prr-m4-s06a-foundation-knobs-surface
    - codex/prr-m4-s06-test-rewrite-architecture-scans
    - codex/prr-m4-s05-ci-strict-core-gates
    - codex/prr-m4-s03-tectonics-op-decomposition
    - codex/prr-m4-s02-contract-freeze-dead-knobs
  anchor_phase:
    status: in_progress
    active_threads_expected:
      - AR1
      - AR2
      - RP1
```

## What is complete before integration
```yaml
pre_integration_complete:
  - S02_S03_S05_S06_committed_on_stack
  - stage_compile_sentinel_paths_removed
  - foundation_stage_simplified_to_knobs_first_posture
  - startup_discipline_guardrails_added_to_orchestrator_docs
  - anchor_red_team_pass_initialized
```

## Unresolved risks and blocked items
```yaml
open_risks:
  - anchor_findings_pending_from_AR1_AR2
  - pre_IG1_p0_p1_fix_scope_not_finalized
  - ecology_integration_checkpoint_dependencies_can_shift
blocked_items:
  - S04_unblock_until_anchor_triage_and_IG1_readiness_confirmed
```

## Hard policies and invariants (non-negotiable)
```yaml
hard_invariants:
  - no_stage_runtime_merge_or_defaulting
  - no_manual_public_to_internal_schema_translation
  - compile_is_not_runtime_normalization
  - step_orchestrates_ops_no_op_calls_op
  - strategies_inside_ops_with_op_local_rules
  - no_shared_lib_rule_shim_pattern_without_strong_necessity_and_proof
  - no_duplicate_core_helpers_if_mapgen_core_equivalent_exists
  - architecture_over_backward_compatibility_no_legacy_bridges
```

## Agent team operating model
```yaml
agent_operating_model:
  max_open_threads: 6
  required_scratch_root: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution
  scratch_contract:
    - append_only_updates
    - yaml_evidence_blocks_for_path_heavy_sections
    - required_footer_sections
  startup_packet_required:
    - absolute_paths_only
    - docs_first_attestation
    - invariant_attestation
  workflow_note:
    - keep_agents_on_correct_worktree_with_absolute_path_reminders_every_assignment
```

## Worktree + Graphite protocol
```yaml
graphite_protocol:
  - verify_branch_and_worktree_before_assignment
  - isolate_agent_work_on_dedicated_child_branches
  - prefer_gt_move_for_reanchor_alignment
  - avoid_rebase_when_stack_realignment_intent_is_gt_move
  - no_global_restack_from_parallel_worktrees
```

## Required gates around IG-1
```yaml
gates:
  before_IG1:
    - G0
    - G1
    - G2
    - anchor_triage_complete_with_p0_p1_resolved
  IG1:
    - ecology_merge
    - optional_stack_collapse_if_pr_threshold_met
    - reanchor_to_new_tip
    - GI1_validation_suite_green
  after_IG1:
    - S04_then_S07_then_S08_then_S09
    - final_G5_closeout
```

## Canonical planning artifacts
```yaml
planning_artifacts:
  milestone: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md
  issues_dir: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/issues
  orchestrator_plan: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/00-plan.md
  anchor_triage: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/orchestrator-anchor-triage.md
  reanchor_plan: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-RP1-reanchor-plan.md
```

## First 60-minute takeover checklist
1. Verify stack/worktree state with `git status --short`, `git rev-parse --abbrev-ref HEAD`, and `gt ls --stack`.
2. Read AR1/AR2/RP1 scratch docs and `orchestrator-anchor-triage.md`.
3. Confirm `P0/P1` dispositions are complete or create immediate fix queue.
4. Update `master-scratch.md`, `decision-log.md`, and `stack-ledger.md` with takeover timestamp.
5. Re-run pre-IG1 gates for touched areas and capture evidence logs.
6. Sync milestone + impacted issue docs to actual state before unblocking IG-1 actions.

## Proposed target
- Successor can step in immediately with enough context, controls, and next actions to run M4 safely through integration and completion.

## Changes landed
- Initial role-bootstrap handoff created with stack map, invariants, operating model, and 60-minute checklist.

## Open risks
- Anchoring findings are pending; this document must be refreshed after AR1/AR2 triage and pre-IG1 fixes.

## Decision asks
- none

## Anchor pass outcome (2026-02-15)
```yaml
anchor_pass_outcome:
  mandatory_findings:
    ANCHOR-F001: resolved
    ANCHOR-F002: resolved
    ANCHOR-F004: resolved
  kept_with_rationale:
    ANCHOR-F003: deferred_to_S07_to_preserve_slice_order
    ANCHOR-F005: temporary_guard_stub_until_post_IG1_cleanup
  verification:
    check: pass
    lint: pass
    foundation_guardrails_full: pass
    focused_suite: pass
  canonical_artifacts:
    triage: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/orchestrator-anchor-triage.md
    rp1_plan: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-RP1-reanchor-plan.md
```

## Immediate takeover next actions (post-anchor)
1. Ensure top branch restack is clean after committing anchor-pass artifacts.
2. Execute `IG-1` prep/merge script flow from RP1 plan and update checkpoint packet evidence.
3. Keep `S04` blocked until `IG-1` exits green.
