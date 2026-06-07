## ADDED Requirements

### Requirement: Swooper Recovery Product Closure Reconciles Proof And Repo State

Swooper recovery SHALL close only after proof records, OpenSpec task state,
review findings, Graphite/PR state, remote predecessor disposition, and
downstream docs agree.

#### Scenario: Product closure is requested
- **WHEN** the recovery lane is ready to close
- **THEN** exact-authorship proof, final-surface parity, product acceptance, and
  activated targeted repairs are closed or explicitly out of scope
- **AND** accepted P1/P2 findings are repaired, rejected with evidence, or
  outside the closure claim

#### Scenario: Repo or remote state is ambiguous
- **WHEN** relevant worktree, Graphite, PR, or remote predecessor state is
  ambiguous
- **THEN** product closure is blocked
- **AND** the closure packet records the next exact repo-state action
