## ADDED Requirements

### Requirement: Habitat Rule Registry Is A Domain Service

Habitat SHALL load, validate, and select rules through rule-registry and
rule-selection domain services.

#### Scenario: Registry data is malformed

- **WHEN** a `.habitat/rules/**` record is unreadable or schema-invalid
- **THEN** the registry service returns a tagged domain error
- **AND** command/report boundaries render the error
- **AND** registry code does not read files through direct `node:fs` imports
