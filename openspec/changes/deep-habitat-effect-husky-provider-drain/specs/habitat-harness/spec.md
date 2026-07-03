## MODIFIED Requirements

### Requirement: External Tools Are Habitat Providers

Habitat SHALL only expose external tool provider services for capabilities that
are consumed by Habitat runtime, service, domain, host, or test-layer
composition.

#### Scenario: Static Husky delegators are not provider services

- GIVEN `.husky/pre-commit` and `.husky/pre-push` delegate to `habitat hook`
- WHEN Habitat composes runtime and service test layers
- THEN it SHALL NOT include a Husky provider or fake Husky provider layer
- AND hook behavior SHALL remain owned by the hook service and `.husky`
  entrypoints
