## ADDED Requirements

### Requirement: First-Party Morphology Config Migration Is One-Way

First-party shipped Swooper map configs SHALL be migrated from raw Morphology
step/op envelopes to the semantic Morphology public config surface.

#### Scenario: Shipped config is migrated
- **WHEN** a first-party shipped map config previously contains raw Morphology
  op envelopes
- **THEN** each known stale envelope path is mapped to a semantic public key
- **AND** the resulting config validates against the public recipe schema

#### Scenario: Raw envelope remains after migration
- **WHEN** shipped map config validation scans Morphology stages after migration
- **THEN** raw internal Morphology step ids and op envelope keys are rejected
- **AND** runtime compilation is not used as a silent compatibility lane
