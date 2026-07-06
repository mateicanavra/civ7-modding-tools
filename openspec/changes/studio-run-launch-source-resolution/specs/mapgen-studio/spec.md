## ADDED Requirements

### Requirement: Run In Game Source Input Is Closed

MapGen Studio SHALL accept Run in Game start requests through explicit catalog
or editor launch sources.

#### Scenario: Catalog source is submitted

- **WHEN** start receives a catalog launch source
- **THEN** the server resolves it through the Swooper catalog source index
- **AND** produces a resolved launch source, launch envelope, source digest, and
  envelope digest

#### Scenario: Editor source is submitted

- **WHEN** start receives an editor launch source
- **THEN** the server resolves it from the editor payload
- **AND** does not write catalog source files

#### Scenario: Unsupported source fields are submitted

- **WHEN** start receives fields outside the closed launch-source union
- **THEN** request validation rejects the input with the public error/status
  payload shape from the target vocabulary
