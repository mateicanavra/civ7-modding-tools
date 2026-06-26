## MODIFIED Requirements

### Requirement: Habitat Owner Nx Targets

Habitat SHALL expose owner `habitat:check` Nx targets whose invalidation inputs
come from the owner's registered Habitat rules.

#### Scenario: Precise owners receive precise owner inputs

- **WHEN** every rule owned by a project has precise path coverage
- **THEN** the project's `habitat:check` target SHALL keep the owner-scoped
  Habitat command
- **AND** the target inputs SHALL be the union of the owned rule inputs.

#### Scenario: Broad owners remain broad

- **WHEN** any rule owned by a project declares `workspace-gate` or
  `unresolved-metadata` path coverage
- **THEN** the project's `habitat:check` target SHALL keep workspace-wide
  Habitat inputs
- **AND** Habitat SHALL NOT pretend the owner check is narrow.

#### Scenario: Full checks stay single-process

- **WHEN** the aggregate Habitat check target is inferred
- **THEN** it SHALL run the single Habitat aggregate command
- **AND** it SHALL NOT fan out into one Habitat subprocess per rule.
