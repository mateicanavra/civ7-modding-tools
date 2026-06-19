## ADDED Requirements

### Requirement: Hook Runtime Uses Effect Services And Remains Local Feedback

Habitat SHALL migrate hook runtime behavior onto Effect services while keeping
Husky as a delegator and hook results as local workstation feedback only.

#### Scenario: Pre-commit runs

- **WHEN** `bun run habitat hook pre-commit` runs
- **THEN** staged path discovery, partial-staging refusal, Biome formatting,
  formatter restage, Grit staged scan, and resource policy are typed steps
- **AND** formatter restage touches formatter-changed files only
- **AND** the hook record states local-only non-claims

#### Scenario: Pre-push runs

- **WHEN** `bun run habitat hook pre-push` runs
- **THEN** base selection and Nx affected execution consume Git and Nx provider
  data
- **AND** CI remains authoritative
