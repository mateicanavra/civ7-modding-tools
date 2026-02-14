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
