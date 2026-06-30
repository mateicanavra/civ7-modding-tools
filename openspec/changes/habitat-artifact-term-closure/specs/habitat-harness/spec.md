## ADDED Requirements

### Requirement: Habitat Does Not Own Generic Artifact Authority

Habitat SHALL NOT describe its rule categories, support files, path roots, or
project identity as artifacts.

#### Scenario: Habitat authority docs are read

- **WHEN** an agent reads current `.habitat` authority docs
- **THEN** rule operation kinds and support files are the active vocabulary
- **AND** generic Habitat artifact authority is not presented as current

### Requirement: Product Artifact Vocabulary Remains Intact

Civ7/MapGen product artifact vocabulary SHALL remain available outside Habitat
generic authority.

#### Scenario: Product artifact term is present

- **WHEN** code or docs refer to recipe artifacts, `artifact:*` dependency
  tags, `defineArtifact`, `deps.artifacts`, or generated map artifacts
- **THEN** this change does not rename that product vocabulary
