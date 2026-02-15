# Agent I — Integration Checkpoint Specialist

## Ownership
- Own the mandatory pre-`S04` integration checkpoint (`IG-1`): ecology merge readiness, overlap/conflict audit, threshold policy application, and post-merge stabilization packet.

## Plan
1. Prepare merge-readiness packet before `IG-1`:
   - slice status (`S02/S03/S05/S06`), gate outcomes, unresolved risks.
2. Build overlap/conflict inventory for ecology + foundation execution surfaces.
3. Execute and document checkpoint flow with orchestrator + user:
   - ecology merge first,
   - apply PR-threshold policy (`>=45`) for lower-stack collapse,
   - re-anchor + sync,
   - run `GI-1` gates.
4. Produce reconciliation note with explicit decisions and residual risks.

## Working Notes
- 2026-02-15 kickoff: initialized as integration specialist for `IG-1`.

## Evidence map
```yaml
checkpoint_sources:
  milestone:
    - docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md
  stack_ledger:
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md
  decision_log:
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md
  merge_timing_review:
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-T-ecology-merge-timing-review.md
```

## Proposed target
- `IG-1` is decision-complete and execution-safe: merged base validated, policy applied, user sign-off recorded, `S04` unblocked.

## Changes landed
- Integration specialist scratch initialized with ownership, plan, and source map.

## Open risks
- Ecology and foundation may introduce non-trivial conflicts in shared recipe/config/diagnostics surfaces.

## Decision asks
- none

## Context bridge
- IG-1 sits between the parallel S02/S03/S05/S06 workstreams and the S04 slice; the checkpoint must surface ecology merge readiness, PR-pressure policy compliance, and GI-1 verification before we unstop S04.
- Integration slice plan: coordinate S02/S03 artifacts for merge readiness, pull in S05/S06 test hardening, confirm ecology merge steps, apply the `>=45` PR-count collapse policy, lock the re-anchor sync, then run GI-1 commands that gate the S04+ backlog slices.

### Assumptions
- The ecology stack merge adds no new blockers once we re-anchor at the current `stack-anchor` reference.
- The PR-count threshold is measurable from the upper stack repo history and can be enforced via the orchestrator merge script.
- GI-1 verification only needs the commands documented in the GI-1 matrix below; additional gates would be handled post-IG-1.

### Verification matrix
```yaml
verification_matrix:
  ecology_merge:
    command: ./scripts/verify-ecology-merge.sh
    success_criteria: merge_clean && no_conflicting_artifacts
  pr_threshold:
    command: ./scripts/check-pr-threshold.sh --min 45
    success_criteria: reported_pr_count >= 45
  reanchor:
    command: ./scripts/reanchor-stack.sh
    success_criteria: tree_hash == anchor_hash_after_merge
  gi1_gate:
    command: git log -1 && bun test --filter gi-1
    success_criteria: exit_code == 0
```

### Evidence paths
```yaml
evidence_paths:
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-I-integration-checkpoint.md
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/ig-1-checkpoint-packet-template.md
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md
```

## 2026-02-15 IG-1 entry refresh (post-restack)
```yaml
slice_commit_snapshot:
  S02:
    branch: codex/prr-m4-s02-contract-freeze-dead-knobs
    commit: 9b65ae462
    state: committed
  S03:
    branch: codex/prr-m4-s03-tectonics-op-decomposition
    commit: 8a596087a
    state: committed
  S05:
    branch: codex/prr-m4-s05-ci-strict-core-gates
    commit: 5b066753a
    state: committed
  S06:
    branch: codex/prr-m4-s06-test-rewrite-architecture-scans
    commit: 6cee8de01
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

checkpoint_readiness:
  at_integration_point: true
  S04_unblocked: false
  required_next_actions:
    - merge_ecology_stack
    - evaluate_pr_count_threshold_and_collapse_if_gte_45
    - reanchor_execution_stack
    - run_GI_1_matrix_on_integrated_base
```

## Proposed target
- `IG-1` is decision-complete and execution-safe: merged base validated, policy applied, user sign-off recorded, and `S04` unblocked.

## Changes landed
- Added IG-1 entry packet refresh with current S02/S03/S05/S06 commit snapshot.
- Recorded pre-IG1 gate matrix results from aligned stack state.
- Confirmed orchestrator is at the mandatory integration checkpoint before `S04`.

## Open risks
- Full-profile domain guardrails remain red due pre-existing ecology canonical-module debt until ecology merge/remediation is applied.
- Shared recipe/diagnostics files may conflict during ecology merge and require a dedicated conflict-fix slice before `S04`.

## Decision asks
- none
