## ADDED Requirements

### Requirement: Optional natural wonder shortfalls remain nonfatal

The natural-wonder placement contract SHALL describe optional wonder shortfalls
as reconciliation evidence rather than fatal map-generation failures.

#### Scenario: Natural wonder target cannot be fully satisfied

- **GIVEN** a generated map cannot legally place every requested natural wonder
- **WHEN** the natural-wonder placement step runs
- **THEN** it MUST publish reconciliation evidence
- **AND** it MUST NOT describe that optional shortfall as a fatal placement
  invariant.
