## ADDED Requirements

### Requirement: Check And Baseline Cutover Preserves Report And Ratchet Semantics

Habitat SHALL migrate check execution and baseline authority onto the
Effect/provider substrate without changing CheckReport v1 or shrink-only
baseline semantics.

#### Scenario: Check report is produced

- **WHEN** `habitat check --json` runs after the cutover
- **THEN** it emits CheckReport schema version 1
- **AND** selected rules, diagnostics, baseline application, and enforcement
  status match the pre-cutover contract

#### Scenario: Baseline growth is attempted

- **WHEN** a baseline would grow for an existing rule
- **THEN** BaselineAuthority refuses the change through typed refusal data
- **AND** direct baseline file writes cannot bypass the refusal path
