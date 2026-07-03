## MODIFIED Requirements

### Requirement: Habitat Nx Provider

Habitat SHALL expose Nx through a single vendor identity at the provider,
rule-registry, graph, and command-materialization boundaries.

#### Scenario: Graph-backed rules use nx ownership

- **WHEN** a Habitat rule delegates to an Nx graph target
- **THEN** the rule record SHALL use `ownerTool: "nx"`
- **AND** it SHALL provide a structured `graphTarget`.

#### Scenario: No target-check alias remains

- **WHEN** Habitat materializes workspace tool commands
- **THEN** the workspace tool policy SHALL include the real `nx` tool
- **AND** it SHALL NOT include a `target-check` alias.

#### Scenario: Missing graph target is rejected for nx rules

- **WHEN** a rule record declares `ownerTool: "nx"` without a `graphTarget`
- **THEN** the registry schema SHALL reject the record.
