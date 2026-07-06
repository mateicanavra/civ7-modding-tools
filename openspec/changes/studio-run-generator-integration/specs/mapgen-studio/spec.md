## ADDED Requirements

### Requirement: Run In Game Invokes Manifest Generation

MapGen Studio SHALL generate Run in Game request artifacts by invoking the
manifest-only Swooper generator.

#### Scenario: Generation succeeds

- **WHEN** source resolution and manifest writing succeed
- **THEN** Studio invokes the generator with the manifest path
- **AND** records generated mod metadata privately
- **AND** public status advances past artifact generation

#### Scenario: Generation fails

- **WHEN** the manifest generator fails
- **THEN** Studio terminalizes the operation with public category
  `artifact-generation`
- **AND** records private diagnostics

