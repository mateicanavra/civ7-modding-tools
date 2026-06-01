## ADDED Requirements

### Requirement: Morphology Public Boundary Is Guarded By Contract Tests

Morphology public-boundary tests SHALL prove schema and compiler ownership
without pinning mutable tuning values.

#### Scenario: Public schema is tested
- **WHEN** standard recipe public schema tests inspect Morphology stages
- **THEN** they assert semantic public keys and absence of raw internal
  step/op envelope paths
- **AND** they do not assert product tuning constants as boundary proof

#### Scenario: Compiler output is tested
- **WHEN** public Morphology config is compiled
- **THEN** internal step/op envelopes exist in compiled config for execution
- **AND** the test distinguishes compiled internal shape from persisted public
  config
