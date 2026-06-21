## MODIFIED Requirements

### Requirement: Nx Owns Habitat Project-Plane Boundaries

Habitat SHALL delegate project-plane import legality to the Nx `boundaries`
target and SHALL make its own durable internal roots visible to that target
when those roots are intended to behave as architectural modules.

#### Scenario: Habitat architecture roots are Nx-visible

- **WHEN** Nx builds the workspace project graph
- **THEN** Habitat's substrate, adapters, core, service, workspace, and host
  architecture roots SHALL appear as inferred Nx projects
- **AND** those projects SHALL carry `kind:tooling` plus a specific
  `habitat:*` tag.

#### Scenario: Cross-root Habitat imports use scoped package subpaths

- **WHEN** code in one Habitat internal root imports code from another Habitat
  internal root
- **THEN** the import SHALL use an `@internal/habitat-harness/...` package
  subpath
- **AND** same-root implementation imports MAY remain relative.

#### Scenario: Nx is the import-legality authority

- **WHEN** `@internal/habitat-harness:boundaries` runs
- **THEN** `@nx/enforce-module-boundaries` SHALL enforce the `kind:*` and
  `habitat:*` dependency constraints
- **AND** `validate:boundary-taxonomy` SHALL validate taxonomy/config/tag drift
  without replaying import-edge legality as a second enforcement engine.
