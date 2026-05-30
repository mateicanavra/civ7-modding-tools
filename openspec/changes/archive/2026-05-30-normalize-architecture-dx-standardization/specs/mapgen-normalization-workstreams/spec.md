## ADDED Requirements

### Requirement: Residual Standardization Removes Compensation Paths

Follow-on normalization work SHALL remove old owner paths after the rightful
owner exists, rather than preserving aliases, fallbacks, dual ids, or
compatibility wrappers.

#### Scenario: A config or artifact owner moves
- **WHEN** a persisted config key, artifact id, or helper path moves to the
  normalized owner
- **THEN** active first-party callers, configs, docs, and tests use the new
  owner
- **AND** the old owner is not kept as an alias or fallback

### Requirement: Projection Evidence Is Projection-Owned

Projection/readback artifacts SHALL be owned by the stage or product boundary
that materializes or observes engine state, not by the upstream truth domain.

#### Scenario: map-hydrology records engine readback
- **WHEN** map-hydrology stamps lakes or models rivers and records observed
  engine state
- **THEN** the projection artifact ids use a `artifact:map.hydrology.*`
  namespace
- **AND** Hydrology hydrography artifacts remain truth-only

### Requirement: map-* Stages Do Not Plan Domain Truth

`map-*` stages SHALL consume upstream truth artifacts and project them into
engine state, effects, map artifacts, and readback evidence.

#### Scenario: A projection step needs ridge or foothill masks
- **WHEN** map-morphology stamps mountains, ridges, or foothills
- **THEN** Morphology truth stages produce the ridge/foothill intent first
- **AND** map-morphology only materializes that intent into engine terrain and
  projection evidence

### Requirement: Placement Product Effects Have Step Owners

Placement product/effect contracts SHALL be represented as explicit steps when
they own a distinct gameplay product or engine effect.

#### Scenario: Placement applies resources, starts, discoveries, or advanced starts
- **WHEN** a placement product writes engine state or publishes typed outcomes
- **THEN** the product has a named step contract with its own provides/effects
- **AND** the final placement summary consumes those product results instead of
  re-running the product logic through a broad monolith

### Requirement: Strategy Config Schemas Stay With Real Owners

Operation, strategy, or family-specific config schemas SHALL live with the
owning op/strategy contract or a named family invariant, while domain-root
config surfaces remain thin facades unless a shared invariant is documented.

#### Scenario: A domain-root config file contains strategy schemas
- **WHEN** the schemas are specific to separate narrative, morphology, ecology,
  hydrology, or placement concerns
- **THEN** the schemas move to the owning concern or named family owner
- **AND** the domain-root config file only aggregates or documents a concrete
  shared invariant with concrete consumers
