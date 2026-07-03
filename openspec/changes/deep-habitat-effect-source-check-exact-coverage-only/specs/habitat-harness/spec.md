## MODIFIED Requirements

### Requirement: Source-check plans rule file applicability from registry facts

Habitat source-check execution SHALL use rule registry applicability facts
before invoking generated policy logic.

#### Scenario: Source-check rule applicability requires exact coverage

- **WHEN** source-check evaluates a native source-check rule
- **AND** the rule has no exact path coverage patterns
- **THEN** Habitat SHALL report a structured diagnostic for that rule
- **AND** Habitat SHALL NOT fall back to scan-root-overlap matching for rule
  applicability.

#### Scenario: Scan roots remain collection hints

- **WHEN** source-check evaluates a native source-check rule with exact path
  coverage
- **THEN** Habitat MAY use selected scan roots to collect candidate files
- **AND** exact path coverage SHALL decide whether the rule inspects each
  collected file.
