## MODIFIED Requirements

### Requirement: Rule Path Coverage Accuracy

Habitat rule path coverage SHALL describe where a rule's invariant applies,
not merely which project owns the rule executor.

#### Scenario: Exact generated-zone rules avoid workspace-gate coverage

- **WHEN** a file-layer rule protects a generated zone with a declared exact
  path or prefix
- **THEN** the rule SHALL use exact-path coverage for that protected surface
- **AND** the rule SHALL NOT declare `workspace-gate` solely because Habitat
  owns protected-zone execution.

#### Scenario: Command docs checks avoid unrelated project-owner coverage

- **WHEN** a command rule checks a specific docs tree
- **THEN** the rule SHALL use exact-path coverage for that docs tree
- **AND** the rule SHALL NOT declare `project-owner` solely because the command
  lives in Habitat tooling.
