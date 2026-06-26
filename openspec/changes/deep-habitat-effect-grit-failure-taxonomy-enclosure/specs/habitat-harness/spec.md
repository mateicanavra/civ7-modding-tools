## MODIFIED Requirements

### Requirement: Grit Adapter Failure Ownership

Habitat SHALL keep Grit-specific adapter failure taxonomy inside the Grit
adapter/provider boundary and SHALL expose it to diagnostic consumers without a
second active literal list.

#### Scenario: Diagnostic catalog consumes provider-owned Grit failures

- **WHEN** diagnostic outcomes need to identify a Grit adapter failure
- **THEN** the accepted failure kinds SHALL come from the Grit provider failure
  vocabulary
- **AND** diagnostic catalog exports SHALL preserve their existing names for
  consumers
- **AND** Habitat SHALL NOT maintain a duplicate Grit failure literal list in
  the diagnostic catalog.
