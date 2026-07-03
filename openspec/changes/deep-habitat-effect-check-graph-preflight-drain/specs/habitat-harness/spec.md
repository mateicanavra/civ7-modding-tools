## ADDED Requirements

### Requirement: Provider-Owned Graph-Backed Check Execution

Habitat structural checks SHALL execute graph-backed rules through their owning
provider without a separate check-time workspace graph preflight.

#### Scenario: Graph-backed rule executes through provider target

- **WHEN** a selected rule resolves to a graph-backed provider target
- **THEN** Habitat executes the provider target directly
- **AND** Habitat does not perform a separate workspace graph preflight refusal
  before target execution

#### Scenario: Provider target failure surfaces as rule failure

- **WHEN** the provider target cannot execute
- **THEN** Habitat reports the provider failure through the consuming rule
- **AND** the rule diagnostic keeps the rule's lane and message semantics

#### Scenario: Graph planning remains available outside check execution

- **WHEN** classify or verify planning needs workspace graph state
- **THEN** those workflows may still read the workspace graph through their
  owning graph integration paths
