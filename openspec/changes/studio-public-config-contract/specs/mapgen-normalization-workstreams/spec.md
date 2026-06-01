## ADDED Requirements

### Requirement: Studio Consumes Morphology Public Schema

MapGen Studio SHALL render and validate Morphology authoring config from the
standard recipe public schema, not from raw internal step/op schemas.

#### Scenario: Studio standard recipe artifacts are generated
- **WHEN** Studio loads the standard Swooper recipe config schema
- **THEN** Morphology stages expose semantic public keys suitable for authoring
- **AND** hidden internal Morphology step ids and op-envelope selectors are not
  present in the Studio schema surface

#### Scenario: Studio default config is validated
- **WHEN** the Studio default/repo-backed config is validated
- **THEN** Morphology config validates through the public schema
- **AND** recipe compilation remains responsible for producing internal step/op
  config
