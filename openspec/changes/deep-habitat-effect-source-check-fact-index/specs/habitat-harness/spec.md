## MODIFIED Requirements

### Requirement: Source-check plans rule file applicability from registry facts

Habitat source-check execution SHALL use rule registry applicability facts
before invoking generated policy logic.

#### Scenario: Source-check runtime indexes parsed file facts once

- **WHEN** source-check evaluates multiple native rules against the same parsed
  source file
- **THEN** common syntax facts SHALL be derived from a shared per-file runtime
  index
- **AND** rule modules SHALL consume the existing runtime helper API
- **AND** Habitat SHALL NOT require each helper family to traverse the same
  parsed file independently.
