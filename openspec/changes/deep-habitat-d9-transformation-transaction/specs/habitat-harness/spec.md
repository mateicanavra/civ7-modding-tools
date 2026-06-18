## ADDED Requirements

### Requirement: D9 Transformation Transaction Is Resolved Before Implementation

Habitat transformation apply SHALL model dry-run, live-write, rollback, formatting, protected-zone refusal, and recovery states as an explicit transaction rather than a boolean success plus artifact side channel.

#### Scenario: Dry run is requested
- **WHEN** an apply command runs without write permission
- **THEN** Habitat reports planned edits and refuses to mutate files

#### Scenario: Live apply fails after writes
- **WHEN** a transaction cannot complete cleanly
- **THEN** Habitat reports rollback state and recovery instructions
