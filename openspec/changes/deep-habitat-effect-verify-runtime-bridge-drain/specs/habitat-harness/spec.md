## MODIFIED Requirements

### Requirement: Habitat Verify Runtime Boundary

Habitat verify orchestration SHALL run provider-backed proof-contract programs
through the Habitat service runtime, not through Promise-returning domain
helpers.

#### Scenario: Verify service owns runtime execution

- **GIVEN** the verify service needs base resolution, affected target execution,
  and post-state observation
- **WHEN** it composes the verify workflow
- **THEN** it SHALL call the proof-contract Effect procedures directly
- **AND** host commands SHALL call the verify service rather than proof-contract
  runtime helpers

#### Scenario: Proof-contract domain has no Promise runtime bridge

- **GIVEN** proof-contract modules expose verify behavior
- **WHEN** callers import the proof-contract barrel
- **THEN** the barrel SHALL expose Effect procedures and pure receipt helpers
- **AND** it SHALL NOT export Promise wrappers for base resolution, affected
  execution, or Git status observation
