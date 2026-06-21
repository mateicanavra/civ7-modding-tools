## MODIFIED Requirements

### Requirement: Nx Project Boundary Enforcement

Habitat SHALL expose project-plane import boundary enforcement through the Nx
target that owns that enforcement.

#### Scenario: Habitat boundary rule routes through Nx

- **WHEN** `import-boundaries` is selected as a Habitat rule
- **THEN** the rule SHALL execute the graph-backed
  `@internal/habitat-harness:boundaries` target
- **AND** the `boundaries` target SHALL remain the owner of
  `@nx/enforce-module-boundaries` execution
- **AND** Habitat SHALL NOT keep a separate `import-boundaries` executable
  policy.
