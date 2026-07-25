## ADDED Requirements

### Requirement: Morphology Public Config Is Semantic And Flat

The standard Swooper Morphology stages SHALL expose flat product-facing public
config keys and SHALL compile those keys into internal step/op envelopes before
execution.

#### Scenario: Morphology schema is generated
- **WHEN** the standard recipe config schema is derived
- **THEN** `morphology-coasts`, `morphology-routing`,
  `morphology-erosion`, and `morphology-features` expose `knobs` plus
  semantic public keys
- **AND** those public stage schemas do not expose raw op-envelope
  `strategy/config` selectors

#### Scenario: Morphology config is compiled
- **WHEN** a shipped map config supplies Morphology public config
- **THEN** recipe compilation emits declared Morphology step ids with default
  op envelopes for runtime execution
- **AND** omitted public keys are defaulted by the compiler rather than
  persisted as hidden internal config

### Requirement: Shipped Morphology Configs Use Only The Public Surface

First-party shipped map configs SHALL persist Morphology config only through the
public Morphology authoring surface.

#### Scenario: Shipped map configs are validated
- **WHEN** shipped Swooper map configs are validated against the standard recipe
  schema
- **THEN** Morphology stages contain semantic public keys
- **AND** raw internal step ids and op envelopes are absent from persisted
  Morphology config
