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
