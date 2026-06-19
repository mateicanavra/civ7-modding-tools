## ADDED Requirements

### Requirement: D14 Remains An Authoring Fence

Habitat SHALL treat D14 as a host/product authoring fence and refusal boundary,
not as authorization for generic Habitat to implement product authoring
semantics.

#### Scenario: Generic Habitat sees a product authoring request

- **WHEN** generic Habitat code encounters a MapGen/Civ7 authoring concept
- **THEN** it refuses or routes to an accepted future packet
- **AND** it does not implement recipe, domain, stage, op, or step parser
  semantics in generic runtime modules

### Requirement: D15 Triggers Only For Concrete Command Observations

Habitat SHALL keep D15 dormant unless a consuming packet identifies concrete
shared command-observation records that must change.

#### Scenario: Effect-first internals move behind services

- **WHEN** Effect-first runtime, provider, or domain internals move while public
  command observations are preserved
- **THEN** D15 remains untriggered
- **AND** the packet records the preservation decision

#### Scenario: Shared command observation changes

- **WHEN** a packet changes a shared command-observation record consumed by
  downstream packets
- **THEN** it opens or references the concrete D15 trigger row
- **AND** records the affected compatibility and proof rows
