## MODIFIED Requirements

### Requirement: Root commands expose distinct structural, graph, and verification loops

Habitat root scripts SHALL keep ordinary structural health checks distinct from
affected graph validation and the heavier verification aggregate while
preserving CI authority.

#### Scenario: Check runs the ordinary structural health loop

- **WHEN** a developer runs `bun run check`
- **THEN** Habitat runs the diagnostic structural rule aggregate
- **AND** the command does not include package build/test or heavier verify
  targets.

#### Scenario: Graph check remains explicit

- **WHEN** a developer runs `bun run check:graph`
- **THEN** Nx runs affected build, check, lint, test, and structural validation
  targets
- **AND** graph validation remains a named command rather than hidden inside
  ordinary check.

#### Scenario: Verify remains explicit

- **WHEN** a developer runs `bun run verify`
- **THEN** Nx runs repo-wide verification targets
- **AND** verification remains a named command rather than hidden inside
  ordinary check.

#### Scenario: CI composes both loops

- **WHEN** CI runs the repository validation script
- **THEN** it runs the full repo-wide build, check, lint, test, verify, and
  structural validation aggregate
- **AND** CI remains authoritative for full graph validation.
