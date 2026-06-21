## MODIFIED Requirements

### Requirement: Habitat Nx Provider

Habitat SHALL expose Nx through a single vendor identity at the provider
boundary.

#### Scenario: Nx provider commands use nx identity

- **WHEN** Habitat requests affected, graph, run-many, or run-target execution
  through `NxProvider`
- **THEN** the provider SHALL request the `nx` workspace tool
- **AND** command materialization SHALL own repo-local Bun execution.

#### Scenario: Legacy target-check metadata remains isolated

- **WHEN** existing rule records use `target-check` as rule ownership vocabulary
- **THEN** this metadata SHALL NOT force `NxProvider` to request a `target-check`
  executable.
