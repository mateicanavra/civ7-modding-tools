## ADDED Requirements

### Requirement: Workspace Orientation Separates Nx Facts From Habitat Routing

Habitat SHALL consume Nx graph and target facts through `NxProvider` and project
those facts into Habitat classification language through a domain service.

#### Scenario: A path is classified

- **WHEN** Habitat classifies a path or diff
- **THEN** Nx provider supplies project and target facts
- **AND** the workspace graph integration domain decides Habitat routing
- **AND** unresolved targets are reported as unavailable facts rather than
  runnable commands
