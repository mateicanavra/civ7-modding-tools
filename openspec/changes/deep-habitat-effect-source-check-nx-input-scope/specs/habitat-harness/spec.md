## MODIFIED Requirements

### Requirement: Source-check plans rule file applicability from registry facts

Habitat source-check execution SHALL use rule registry applicability facts
before invoking generated policy logic.

#### Scenario: Nx source-check target inputs prefer exact coverage

- **WHEN** Habitat generates Nx targets for source-check rules
- **AND** a source-check rule declares exact path coverage
- **THEN** generated target inputs SHALL include those exact path coverage
  patterns
- **AND** generated target inputs SHALL NOT broaden the same rule with scan-root
  inputs.

#### Scenario: Nx source-check target inputs fall back for incomplete metadata

- **WHEN** Habitat generates Nx targets for a source-check rule without exact
  path coverage
- **THEN** generated target inputs MAY include declared scan roots as a fallback
  cache scope
- **AND** source-check runtime execution SHALL still fail closed before native
  rule execution if exact coverage is missing.
