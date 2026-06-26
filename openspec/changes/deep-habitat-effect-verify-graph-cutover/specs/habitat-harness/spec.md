## ADDED Requirements

### Requirement: Verify And Graph Use Nx And Git Providers

Habitat SHALL migrate verify, workspace graph, and Nx affected execution onto
Effect services while preserving verify receipt semantics.

#### Scenario: Verify runs

- **WHEN** `habitat verify` runs
- **THEN** Habitat check execution still happens before Nx affected execution
- **AND** affected target scope comes from Nx and Git provider data
- **AND** verify receipt fields remain stable unless a public-contract packet
  changes them

#### Scenario: Workspace graph facts are consumed

- **WHEN** Habitat classifies or verifies targets
- **THEN** target existence is derived from resolved Nx metadata
- **AND** `targetDefaults`, tags, or folder names alone are not treated as
  target proof
