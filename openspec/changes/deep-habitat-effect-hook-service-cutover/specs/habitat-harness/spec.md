## MODIFIED Requirements

### Requirement: Habitat hooks compose vendor execution through providers

Habitat hook execution SHALL use the service/router implementation as the
single active pre-commit implementation.

#### Scenario: Pre-commit has no synchronous command compatibility lane

- **WHEN** Habitat executes or tests `pre-commit`
- **THEN** execution SHALL flow through the hook service/router implementation
- **AND** staged Habitat checks SHALL be represented as in-process
  `StructuralCheck` reports
- **AND** Biome execution SHALL be represented as `BiomeProvider` requests
- **AND** Habitat SHALL NOT retain a second exported synchronous pre-commit
  implementation that spawns staged Habitat check commands.
