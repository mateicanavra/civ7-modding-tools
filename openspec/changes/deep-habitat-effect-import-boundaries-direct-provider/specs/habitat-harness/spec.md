## MODIFIED Requirements

### Requirement: Habitat Structural Rule Execution

Habitat SHALL execute structural rules through the owner that matches the rule's
actual vendor or domain responsibility.

#### Scenario: Import boundaries run through direct command materialization

- **WHEN** Habitat executes the `import-boundaries` structural rule
- **THEN** it SHALL run the rule through Habitat command materialization
- **AND** it SHALL NOT call an inferred Nx `boundaries` target from inside the
  Habitat check.

#### Scenario: Import boundaries preserve ESLint cache behavior

- **WHEN** Habitat materializes the `import-boundaries` workspace tool
- **THEN** the command SHALL include ESLint content-cache flags equivalent to
  the standalone `boundaries` target.

#### Scenario: Standalone boundaries target remains available

- **WHEN** Nx infers the Habitat harness project targets
- **THEN** the standalone `boundaries` target SHALL remain available for callers
  that explicitly request that leaf workspace gate.
