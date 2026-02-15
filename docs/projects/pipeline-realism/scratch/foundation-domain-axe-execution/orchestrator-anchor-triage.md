# Orchestrator Anchor Triage

## Purpose
- Consolidate AR1 and AR2 independent findings into one ranked disposition set before integration.

## Inputs
```yaml
inputs:
  ar1_doc: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-AR1-architecture-red-team.md
  ar2_doc: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-AR2-architecture-docs-red-team.md
  rp1_doc: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-RP1-reanchor-plan.md
```

## Triage rubric
```yaml
triage_policy:
  severity_priorities:
    - P0
    - P1
    - P2
  pre_IG1_requirement:
    must_fix:
      - P0
      - P1
    optional_fix_now:
      - P2_low_risk_high_signal
    deferred_rule:
      - P2_requires_explicit_backlog_entry_and_rationale
```

## Consolidated findings (append-only)
- Pending AR1/AR2 outputs.

## Resolution decisions (append-only)
- Pending.

## Fix owner map (append-only)
- Pending.

## Re-check results (append-only)
- Pending AR1 hotspot re-check after fixes.

## Proposed target
- Single source of truth for anchoring triage, with explicit keep/fix decisions and IG-1 readiness call.

## Changes landed
- Initialized triage framework and disposition policy.

## Open risks
- Pending independent findings may expand mandatory pre-IG1 fix scope.

## Decision asks
- none

## Baseline snapshot (anchoring start)
```yaml
baseline_snapshot:
  timestamp_local: 2026-02-15
  branch: codex/prr-m4-s06d-foundation-scratch-audit-ledger
  stack_state: needs_restack_on_top_branch_only
  agents_spawned:
    AR1: 019c5fba-8360-7693-bf46-1e908bbeaf98
    AR2: 019c5fba-84de-7740-af86-c5f539171317
    RP1: 019c5fba-8669-7411-9303-98d2cfdc53d5
  committed_slice_heads:
    - 4fd2afea4  # docs anchor remediation ledger
    - d4eebc9fd  # test guardrails hardening
    - 2141dab3f  # local tectonics rules
    - a32b97656  # knobs-only stage surface
    - 34e456830  # sentinel compile-path removal
    - bd9f0087a  # S06 structural scans
    - 72edaac27  # S05 strict core CI
    - 4def49fbe  # S02 contract freeze/dead knobs
  pending_working_tree:
    modified:
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/00-plan.md
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/master-scratch.md
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md
    untracked:
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-AR1-architecture-red-team.md
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-AR2-architecture-docs-red-team.md
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-RP1-reanchor-plan.md
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/orchestrator-anchor-triage.md
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/HANDOFF-successor-orchestrator-m4-foundation.md
```

## Consolidated findings (AR1 + AR2 deduplicated)
```yaml
consolidated_findings:
  - id: ANCHOR-F001
    severity: P1
    title: tests_still_call_disabled_compute_tectonic_history
    evidence:
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/foundation/m11-projection-boundary-band.test.ts
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/foundation/mesh-first-ops.test.ts
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/morphology/m11-crust-baseline-consumption.test.ts
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/morphology/m11-hypsometry-continental-fraction.test.ts
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/morphology/m12-mountains-present.test.ts
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts
    disposition: fix_now
    owner: AR1
  - id: ANCHOR-F002
    severity: P1
    title: issue_pack_describes_stage_split_as_landed_while_recipe_still_single_foundation_stage
    evidence:
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-003-stage-topology-compile-surface.md
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/recipe.ts
    disposition: fix_now_docs_sync
    owner: AR2
    note: keep implementation sequencing (S04) unchanged; clarify status text now.
  - id: ANCHOR-F003
    severity: P1
    title: lane_split_artifact_map_star_not_landed_yet
    evidence:
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-004-lane-split-downstream-rewire.md
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts
    disposition: keep_for_S07_with_explicit_rationale
    owner: orchestrator
    note: avoid out-of-order implementation churn; enforce as IG1->S04->S07 gated work.
  - id: ANCHOR-F004
    severity: P2
    title: foundation_reference_doc_still_mentions_removed_compute_tectonic_history_export
    evidence:
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/reference/domains/FOUNDATION.md
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/index.ts
    disposition: fix_now_low_risk
    owner: AR2
  - id: ANCHOR-F005
    severity: P2
    title: disabled_legacy_compute_tectonic_history_stub_contract_still_present
    evidence:
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts
    disposition: keep_temporarily_with_deletion_trigger
    owner: orchestrator
    deletion_trigger: remove_after_all_test_and_consumer_call_sites_are_migrated_and_S04_topology_cut_is_stable
```

## Resolution decisions
```yaml
resolution_decisions:
  mandatory_pre_IG1:
    - ANCHOR-F001
    - ANCHOR-F002
    - ANCHOR-F004
  explicit_keep_with_rationale:
    - id: ANCHOR-F003
      rationale: implementation belongs to locked S07 lane-split slice; do not pull forward and thrash stage sequencing
    - id: ANCHOR-F005
      rationale: temporary guard stub prevents regression while migration completes; remove on trigger
  required_recheck:
    - AR1_hotspot_recheck_after_F001_fixes
```

## Fix owner map
```yaml
fix_owner_map:
  AR1:
    - rewrite_test_callers_away_from_compute_tectonic_history
    - run_targeted_test_subset_for_rewritten_files
  AR2:
    - sync_issue_pack_language_to_actual_current_state
    - update_foundation_reference_doc_for_current_ops_catalog
  orchestrator:
    - maintain_decision_log_and_stack_ledger
    - enforce_no_out_of_order_S07_work
    - run_anchor_completion_gates
```

## Resolution decisions (executed)
```yaml
resolution_execution:
  ANCHOR-F001:
    status: resolved
    implementation:
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/support/tectonics-history-runner.js
      - rewired_legacy_test_callers_off_computeTectonicHistory_run
    validation:
      - bun run --cwd mods/mod-swooper-maps test -- test/foundation/m11-projection-boundary-band.test.ts test/foundation/mesh-first-ops.test.ts test/morphology/m11-crust-baseline-consumption.test.ts test/morphology/m11-hypsometry-continental-fraction.test.ts test/morphology/m12-mountains-present.test.ts
  ANCHOR-F002:
    status: resolved
    implementation:
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-003-stage-topology-compile-surface.md
  ANCHOR-F003:
    status: keep_for_S07
    rationale: preserve locked sequencing; lane split remains post-S04 work
  ANCHOR-F004:
    status: resolved
    implementation:
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/reference/domains/FOUNDATION.md
  ANCHOR-F005:
    status: keep_temporarily
    deletion_trigger: remove legacy stub once migration is complete and IG1+S04 stabilization confirms no call sites
```

## Re-check results
```yaml
ar1_quick_recheck:
  reviewer: AR1
  verdict: pass
  scope:
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/support/tectonics-history-runner.js
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/foundation/m11-projection-boundary-band.test.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/foundation/mesh-first-ops.test.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/morphology/m11-crust-baseline-consumption.test.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/morphology/m11-hypsometry-continental-fraction.test.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/morphology/m12-mountains-present.test.ts
  residual_risk:
    - keep_test_helper_test_only_and_do_not_reintroduce_runtime_mega_op_usage
```

## Anchor verification gates
```yaml
anchor_verification_gates:
  structural:
    no_op_calls_op_regressions: pass
    no_strategy_import_leakage: pass
    no_rule_reexport_shim_regressions: pass
    no_stage_compile_runtime_merge_regressions: pass
  project_checks:
    bun_check: pass
    bun_lint: pass
    foundation_guardrails_full: pass
  focused_suite:
    contract_guard: pass
    no_op_calls_op_tectonics: pass
    m11_tectonic_events: pass
    m11_tectonic_segments_history: pass
    tile_projection_materials: pass
    m11_config_knobs_and_presets: pass
    standard_recipe: pass
    standard_compile_errors: pass
```
