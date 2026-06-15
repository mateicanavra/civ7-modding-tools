## ADDED Requirements

### Requirement: Generated-Zone Verification Uses Scoped Restoration

Generated-zone verification SHALL use scoped services for snapshotting,
regeneration, diff checks, restoration, and cleanup while preserving the
current drift diagnostics and final worktree cleanliness behavior.

#### Scenario: Map artifact verification restores tracked files
- **WHEN** generated-zone verification regenerates map artifacts
- **THEN** tracked map artifact contents are restored before command
  completion even when regeneration or diff checks fail
- **AND** untracked map artifacts created by the verification run are removed
- **AND** drift diagnostics continue to identify changed generated artifacts

#### Scenario: Policy-table verification remains check-only
- **WHEN** generated-zone verification checks Civ7 map-policy tables
- **THEN** Habitat runs the established check-only policy-table gate
- **AND** the command leaves the worktree clean across all generated target
  inputs

### Requirement: Generated-Zone Staged Guards Remain Enforcement Data

Generated-zone staged hand-edit detection SHALL remain a Habitat rule/check
surface, not an unscoped side effect of the verifier migration.

#### Scenario: Staged hand-edit still fails check
- **WHEN** a staged change edits a protected generated zone by hand
- **THEN** `habitat check --staged` fails with the owning regenerate command as
  remediation
- **AND** the Effect migration does not add baseline entries or mutate the
  staged file to hide the finding
