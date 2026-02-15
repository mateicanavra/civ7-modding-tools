# IG-1 Checkpoint Packet (Pre-S04 Hard Stop)

## Packet metadata
```yaml
packet:
  id: IG-1
  purpose: pre-S04 integration checkpoint (ecology merge + stack re-anchor + GI-1 verification)
  orchestrator_worktree: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-agent-ORCH-foundation-domain-axe-execution
  date: 2026-02-15
```

## Current pre-checkpoint state
```yaml
precheckpoint_slices:
  S02:
    branch: codex/prr-m4-s02-contract-freeze-dead-knobs
    head: 9b65ae462
    state: committed
  S03:
    branch: codex/prr-m4-s03-tectonics-op-decomposition
    head: 8a596087a
    state: committed
  S05:
    branch: codex/prr-m4-s05-ci-strict-core-gates
    head: 5b066753a
    state: committed
  S06:
    branch: codex/prr-m4-s06-test-rewrite-architecture-scans
    head: e443c45a6
    state: committed
```

## Architecture remediation status (Foundation)
```yaml
foundation_remediation:
  code_commit: 11ec9525d
  docs_commit: e443c45a6
  changes:
    - removed_advanced_stepid_sentinel_passthrough
    - removed_profiles_studio_sentinel_passthrough
    - added_contract_guard_assertions_against_sentinel_token_reintroduction
  verification:
    - bun run --cwd mods/mod-swooper-maps check
    - bun run --cwd mods/mod-swooper-maps test test/foundation/contract-guard.test.ts test/standard-compile-errors.test.ts
    - bun run --cwd mods/mod-swooper-maps test -- test/foundation/no-op-calls-op-tectonics.test.ts test/pipeline/no-dual-contract-paths.test.ts test/pipeline/no-shim-surfaces.test.ts test/pipeline/foundation-topology-lock.test.ts
  reviewer_verdict: pass
```

## Pre-IG1 gate snapshot
```yaml
gate_snapshot:
  G0_build: pass
  G0_lint: pass
  G1_adapter_boundary: pass
  G1_full_domain_guardrails: fail_external_ecology_debt
  G1_check: pass
  G2_no_op_calls_op: pass
  G2_no_dual_contract_paths: pass
  G2_no_shim_surfaces: pass
  G2_foundation_topology_lock: pass
  only_blocker:
    domain: ecology
    class: canonical_op_module_file_completeness
```

## Entry criteria status
```yaml
entry_criteria:
  S02_S03_S05_S06_committed: true
  precheckpoint_verification_recorded: true
  foundation_smell_remediated: true
  ecology_merge_completed: false
  pr_threshold_checked: false
  reanchor_completed: false
  user_checkpoint_signoff_recorded: false
```

## IG-1 actions (no-rebase policy)
```yaml
ig1_actions:
  hard_rules:
    - no_rebase
    - no_history_rewrite
    - use_gt_move_or_gt_sync_no_restack_only
  sequence:
    - merge_ecology_stack_into_execution_stack
    - evaluate_pr_count_threshold_gte_45
    - if_threshold_met_collapse_lower_stack_below_start_anchor
    - reanchor_execution_stack_at_resulting_tip
    - run_GI_1_verification_matrix
    - record_user_signoff
```

## GI-1 verification matrix
```yaml
gi1_verification:
  commands:
    - bun run build
    - bun run lint
    - bun run lint:adapter-boundary
    - REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
    - bun run check
    - bun run --cwd packages/mapgen-viz build
    - bun run --cwd apps/mapgen-studio build
    - bun run --cwd mods/mod-swooper-maps test test/pipeline/viz-emissions.test.ts
    - bun run --cwd mods/mod-swooper-maps test test/morphology/tracing-observability-smoke.test.ts
    - bun run --cwd mods/mod-swooper-maps test test/ecology/earthlike-balance-smoke.test.ts
    - bun run --cwd mods/mod-swooper-maps test test/standard-recipe.test.ts
  pass_condition: all_commands_exit_zero
```

## Sign-off block
```yaml
user_signoff:
  responsible_user: pending
  date_iso: pending
  acknowledgment: pending
```
