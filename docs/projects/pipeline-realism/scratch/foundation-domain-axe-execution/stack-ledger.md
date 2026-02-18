# Stack Ledger — M4 Foundation Domain Axe Execution

## Planned stacks
```yaml
stacks:
  - id: A
    slices: [S00, S01]
    branches:
      - codex/prr-m4-s00-plan-scratch-pack
      - codex/prr-m4-s01-harden-milestone-breakout-issues
  - id: B
    slices: [S02, S03, S04]
    branches:
      - codex/prr-m4-s02-contract-freeze-dead-knobs
      - codex/prr-m4-s03-tectonics-op-decomposition
      - codex/prr-m4-s04-stage-split-compile-cutover
  - id: C
    slices: [S05, S06]
    branches:
      - codex/prr-m4-s05-ci-strict-core-gates
      - codex/prr-m4-s06-test-rewrite-architecture-scans
  - id: D
    slices: [S07]
    branches:
      - codex/prr-m4-s07-lane-split-map-artifacts-rewire
  - id: E
    slices: [S08, S09]
    branches:
      - codex/prr-m4-s08-config-redesign-preset-retune
      - codex/prr-m4-s09-docs-comments-schema-legacy-purge
```

## Status
- pending

## Proposed target
- Complete branch-to-slice traceability with explicit gates and dependencies.

## Changes landed
- Initial stack and branch map recorded.

## Open risks
- Additional upstack branches could require stack parent realignment.

## Decision asks
- none

## 2026-02-15 — Hygiene and scope-lock snapshot
```yaml
scope_lock_snapshot:
  decomposed_tectonics_ops:
    - compute-era-plate-membership
    - compute-segment-events
    - compute-hotspot-events
    - compute-era-tectonic-fields
    - compute-tectonic-history-rollups
    - compute-tectonics-current
    - compute-tracer-advection
    - compute-tectonic-provenance
  enforced_shape:
    strategies_import_only_local_contract_and_rules: true
    local_rules_reexporting_lib_tectonics: false
  removed_bridge_layer:
    - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib
```

```yaml
verification_snapshot_post_scope_lock:
  check: pass
  lint: pass
  foundation_guardrails_full: pass
  focused_tests:
    - test/foundation/contract-guard.test.ts
    - test/foundation/no-op-calls-op-tectonics.test.ts
    - test/foundation/m11-tectonic-events.test.ts
    - test/foundation/m11-tectonic-segments-history.test.ts
    - test/foundation/tile-projection-materials.test.ts
    - test/m11-config-knobs-and-presets.test.ts
    - test/standard-recipe.test.ts
    - test/standard-compile-errors.test.ts
  focused_tests_status: pass
```

## Issue to Slice to Gate Map
```yaml
issue_slice_gate_map:
  LOCAL-TBD-PR-M4-001:
    slices: [S00, S01]
    gates: [planning_artifacts_complete]
  LOCAL-TBD-PR-M4-002:
    slices: [S02, S03]
    gates: [G0]
  LOCAL-TBD-PR-M4-003:
    slices: [S04]
    gates: [G0]
  LOCAL-TBD-PR-M4-005:
    slices: [S05, S06]
    gates: [G1, G2]
  LOCAL-TBD-PR-M4-004:
    slices: [S07]
    gates: [G3]
  LOCAL-TBD-PR-M4-006:
    slices: [S08, S09]
    gates: [G4, G5]
```

## Current state
- M4 milestone and issue docs drafted.
- Awaiting specialist agent integration pass before final hardening commit.

## 2026-02-15 — Active execution run ledger
```yaml
active_run:
  precheckpoint_phase:
    slices:
      - S02
      - S03
      - S05
      - S06
    mode: parallel
  checkpoint:
    id: IG-1
    required_before_slice: S04
    merge_policy:
      - merge_ecology_stack_first
      - if_pr_count_gte_45_then_collapse_lower_stack_below_start_anchor
      - reanchor_and_sync_after_merge
  postcheckpoint_phase:
    slices:
      - S04
      - S07
      - S08
      - S09
```

## IG-1 Integration Gate (Pre-S04 stop)
```yaml
ledger_update:
  checkpoint_id: IG-1
  template: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/ig-1-checkpoint-packet-template.md
  ecology_merge_status: pending
  pr_threshold_policy: awaiting_verification
  reanchor_status: pending
  verification_matrix: pending
  user_sign_off: pending
  next_actions:
    - run ./scripts/verify-ecology-merge.sh
    - run ./scripts/check-pr-threshold.sh --min 45
    - run ./scripts/reanchor-stack.sh --verify
    - execute GI-1 verification commands per template
```

## Active Slice Runtime Snapshot — 2026-02-15
```yaml
runtime_snapshot:
  stack_B:
    S02:
      branch: codex/prr-m4-s02-contract-freeze-dead-knobs
      head: 61ce7ffef
      state: in_progress
  stack_C:
    S05:
      branch: codex/prr-m4-s05-ci-strict-core-gates
      head: 6193ee133
      state: committed
    S06:
      branch: codex/prr-m4-s06-test-rewrite-architecture-scans
      head: e5beccd72
      state: committed
  next_gate_blocker:
    required_for_IG1_entry:
      - S02_committed_and_verified
      - S03_committed_and_verified
```

## Runtime Snapshot Update — 2026-02-15 (post-S02 commit)
```yaml
runtime_snapshot_post_s02:
  stack_B:
    S02:
      branch: codex/prr-m4-s02-contract-freeze-dead-knobs
      head: 334b3a24d
      state: committed
    S03:
      branch: codex/prr-m4-s03-tectonics-op-decomposition
      state: pending_start
  stack_C:
    S05:
      branch: codex/prr-m4-s05-ci-strict-core-gates
      head: 6193ee133
      state: committed
    S06:
      branch: codex/prr-m4-s06-test-rewrite-architecture-scans
      head: e5beccd72
      state: committed

IG1_entry_readiness:
  S02: true
  S03: false
  S05: true
  S06: true
```

## Runtime Snapshot Update — 2026-02-15 (post-S03 + restack)
```yaml
runtime_snapshot_post_s03_restack:
  stack_B:
    S02:
      branch: codex/prr-m4-s02-contract-freeze-dead-knobs
      head: 9b65ae462
      state: committed
    S03:
      branch: codex/prr-m4-s03-tectonics-op-decomposition
      head: 8a596087a
      state: committed
  stack_C:
    S05:
      branch: codex/prr-m4-s05-ci-strict-core-gates
      head: 5b066753a
      parent: codex/prr-m4-s03-tectonics-op-decomposition
      state: committed
    S06:
      branch: codex/prr-m4-s06-test-rewrite-architecture-scans
      head: 6cee8de01
      parent: codex/prr-m4-s05-ci-strict-core-gates
      state: committed

pre_ig1_gate_summary:
  G0_build: pass
  G0_lint: pass
  G1_adapter_boundary: pass
  G1_full_domain_guardrails: fail_external_ecology_debt
  G1_check: pass
  G2_no_op_calls_op: pass
  G2_no_dual_contract_paths: pass
  G2_no_shim_surfaces: pass
  G2_foundation_topology_lock: pass

IG1_entry_readiness:
  S02: true
  S03: true
  S05: true
  S06: true
  gate_status: ready_with_external_blocker_documented
```

## Runtime Snapshot Update — 2026-02-15 (post-foundation-sentinel-cut)
```yaml
runtime_snapshot_post_foundation_sentinel_cut:
  stack_B:
    S02:
      branch: codex/prr-m4-s02-contract-freeze-dead-knobs
      head: 9b65ae462
      state: committed
    S03:
      branch: codex/prr-m4-s03-tectonics-op-decomposition
      head: 8a596087a
      state: committed
  stack_C:
    S05:
      branch: codex/prr-m4-s05-ci-strict-core-gates
      head: 5b066753a
      state: committed
    S06:
      branch: codex/prr-m4-s06-test-rewrite-architecture-scans
      head: e443c45a6
      state: committed
      note: foundation_compile_sentinel_passthrough_removed

verification_delta:
  targeted_check: pass
  targeted_tests: pass
  reviewer_verdict: pass

IG1_entry_readiness:
  S02: true
  S03: true
  S05: true
  S06: true
  gate_status: ready_with_external_ecology_guardrail_blocker_only
```

## Runtime Snapshot Update — 2026-02-15 (post-restack)
```yaml
runtime_snapshot_post_restack:
  stack_B:
    S02:
      branch: codex/prr-m4-s02-contract-freeze-dead-knobs
      head: 4def49fbe
      state: committed
    S03:
      branch: codex/prr-m4-s03-tectonics-op-decomposition
      head: ddf490455
      state: committed
  stack_C:
    S05:
      branch: codex/prr-m4-s05-ci-strict-core-gates
      head: 72edaac27
      state: committed
    S06:
      branch: codex/prr-m4-s06-test-rewrite-architecture-scans
      head: 9f7cfdfc6
      state: committed
  orchestrator:
    branch: codex/agent-ORCH-foundation-domain-axe-execution
    head: 0f868f8b9

IG1_entry_readiness:
  S02: true
  S03: true
  S05: true
  S06: true
  integration_gate_required_before_S04: true
```

## 2026-02-15 - Hotspot remediation wave (architecture-first)

```yaml
slices_impacted:
  - codex/prr-m4-s03-tectonics-op-decomposition
  - codex/prr-m4-s05-ci-strict-core-gates
  - codex/prr-m4-s06-test-rewrite-architecture-scans
notable_changes:
  - foundation stage simplified to knobs-only createStage (no public/compile)
  - compute-tectonic-history op converted to disabled guardrail surface
  - tectonics step relies on declared config envelopes only
  - no-op-calls-op and stage-merge guard tests hardened
status:
  check: pass
  lint_mod: pass
  foundation_guardrails_full: pass
  hotspot_tests: pass
```

## 2026-02-15 — Worker Startup Governance Overlay
```yaml
worker_governance_overlay:
  applies_to_slices:
    - S04
    - S07
    - S08
    - S09
    - future_child_slices
  startup_gate:
    id: WG-STARTUP
    required_checks:
      - worker_prompt_uses_absolute_paths_only
      - execution_worktree_matches_/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails
      - docs_anchor_yaml_block_present
      - canonical_example_paths_present
      - antipattern_attestation_present
  handoff_gate:
    id: WG-HANDOFF
    required_checks:
      - check_command_log_present
      - lint_command_log_present
      - foundation_guardrails_full_log_present
      - hotspot_test_log_present
      - changed_file_inventory_uses_absolute_paths
      - decision_log_and_master_scratch_updates_linked
  rejection_policy:
    on_missing_check: reject_and_return_to_worker
    requires_decision_log_entry_for_exceptions: true
```

## Oversight checklist snapshot
```yaml
oversight_checklist_snapshot:
  owner: orchestrator
  checklist:
    - verify_worker_startup_gate_passed_before_first_edit
    - verify_docs_anchor_paths_are_absolute_and_repo_local
    - verify_antipattern_denylist_explicitly_passed
    - verify_handoff_gate_passed_before_integration
    - verify_rejections_are_recorded_in_master_scratch
  current_state: active
```

## Proposed target
- Ledger enforces startup and handoff governance gates as first-class blockers for all downstream slices.

## Changes landed
- Added `WG-STARTUP` and `WG-HANDOFF` governance gates plus an orchestrator oversight checklist snapshot.

## Open risks
- Reused worker templates may still contain relative-path examples and need one-time cleanup.

## Decision asks
- none

## Anchoring lane — 2026-02-15
```yaml
anchoring_lane:
  stage: pre_IG1
  status: in_progress
  threads:
    AR1: architecture_red_team
    AR2: architecture_docs_red_team
    RP1: reanchor_planning
  exit_criteria:
    - orchestrator_anchor_triage_complete
    - p0_p1_disposition_complete
    - milestone_and_issue_docs_synced
    - successor_handoff_doc_ready
  notes:
    - do_not_unblock_S04_until_anchor_lane_exit_criteria_are_met
```

## Anchoring lane closeout — 2026-02-15
```yaml
anchoring_lane_closeout:
  status: complete
  required_outputs:
    ranked_findings_pack: complete
    pre_IG1_fix_list: complete
    revised_reanchor_plan: complete
    successor_handoff_bootstrap: complete
  gate_status:
    structural: pass
    project_checks: pass
    focused_suite: pass
  forward_state:
    next_gate: IG1_integration_checkpoint
    S04_unblocked: false
    unblock_condition: IG1_complete
```
