## ADDED Requirements

### Requirement: Classify Runs Through Habitat Service

Habitat SHALL expose classify/orientation as an owned Habitat service module
while preserving the existing classify command JSON contract.

#### Scenario: Classify CLI runs

- **WHEN** a user runs `habitat classify <path-or-diff>`
- **THEN** the command calls the in-process Habitat service client
- **AND** the classify service module owns the procedure boundary and target
  classification orchestration
- **AND** the CLI handles only argument parsing and output rendering
- **AND** the emitted payload conforms to `ClassifyResultSchema`

#### Scenario: Classify service uses current implementation material

- **WHEN** the classify service needs workspace graph orientation data
- **THEN** it calls the current classify implementation material
- **AND** it preserves path, diff, malformed-diff, unresolved-owner, and
  graph-refusal states
- **AND** it does not make providers own Habitat orientation wording
