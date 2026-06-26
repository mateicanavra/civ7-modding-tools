## ADDED Requirements

### Requirement: Structural Checks Use Structural Providers

Habitat structural rule execution SHALL NOT include active `target-check` rules
whose implementation is a package architecture test target.

#### Scenario: default Habitat check excludes package architecture wrappers

- **GIVEN** the active Habitat rule registry
- **WHEN** a default `habitat check` resolves rule execution
- **THEN** no current rule has `ownerTool: "target-check"`
- **AND** package architecture tests remain available through package targets.

### Requirement: Source-Shape Invariants Move To Source-Check

Former package architecture tests that enforce source-shape constraints SHALL be
represented by source-check pattern rules before their `target-check` row is
removed.

#### Scenario: source-shape replacements are active

- **GIVEN** the former core purity, RNG authority, ecology import, and cutover
  source-shape wrappers
- **WHEN** `habitat check --tool pattern-check` runs
- **THEN** `mapgen-core-runtime-civ7`, `rng-authority-static`,
  `ecology-step-imports`, and `cutover-source-guardrails` own those source
  diagnostics.
