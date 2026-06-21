## ADDED Requirements

### Requirement: Public Surface Guard Logic Has An Owned Source Module

Habitat public-surface guard logic SHALL live in an owned Habitat source module
instead of only inside a root lint script.

#### Scenario: current-tree guard still runs through the lint script

- **GIVEN** the existing `.habitat` public-surface guard rules
- **WHEN** `scripts/lint/lint-habitat-public-surface-guards.mjs` runs
- **THEN** it delegates to the owned guard module
- **AND** it preserves pass/fail exit behavior.

#### Scenario: unit tests exercise the guard model directly

- **GIVEN** injected fixture files for public-surface guard cases
- **WHEN** `public-surface-guards.test.ts` runs
- **THEN** it calls the guard module directly
- **AND** it does not shell the root lint script to test fixture behavior.
