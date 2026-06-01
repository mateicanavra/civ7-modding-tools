## ADDED Requirements

### Requirement: Resource Earthlike Expectations Artifact Publishes Typed Contract

The resource distribution workstream SHALL publish a typed source artifact for
earthlike resource expectations before resource operations consume expectation
rows.

#### Scenario: Artifact is registered
- **WHEN** the resource artifact catalog is loaded
- **THEN** it exposes `artifact:resources.earthlikeExpectations`
- **AND** the artifact name is `resourceEarthlikeExpectations`
- **AND** no resource stage shell or recipe order change is introduced by this
  artifact registration

#### Scenario: Artifact covers the official corpus
- **WHEN** earthlike expectations are published
- **THEN** the artifact contains exactly the 55 official resource corpus symbols
  in official corpus order
- **AND** every row references its official resource symbol, static resource row
  slot, and `runtimeIdStatus = "unverified"`
- **AND** no `FEATURE_*` symbol appears in the artifact

#### Scenario: Blocked rows stay active-zero
- **WHEN** a corpus row has `strategyRequired.status = "blocked"`
- **THEN** its earthlike expectation row has `status = "blocked"`
- **AND** its active range is `min = 0`, `target = 0`, and `max = 0`
- **AND** it has no active condition multipliers
- **AND** it does not present a future nonzero range as an active expectation

### Requirement: Resource Earthlike Expectations Schema Rejects Overclaims

The resource earthlike expectations artifact schema SHALL reject malformed or
overclaiming expectation rows.

#### Scenario: Runtime id overclaims are rejected
- **WHEN** an expectation row includes runtime numeric id fields such as
  `runtimeId`, `resourceId`, or `numericId`
- **THEN** schema validation fails

#### Scenario: Feature leakage is rejected
- **WHEN** an expectation row uses a `FEATURE_*` symbol
- **THEN** schema validation fails

#### Scenario: Blocked-row leakage is rejected
- **WHEN** a blocked row has a nonzero active range or non-blocked range evidence
- **THEN** schema validation fails

### Requirement: Resource Earthlike Expectations Preserve Placement Boundary

The resource earthlike expectations artifact SHALL remain a data contract and
not a placement behavior change.

#### Scenario: Placement behavior is not moved
- **WHEN** the artifact source is added
- **THEN** it does not import adapter runtime modules, `ResourceBuilder`,
  placement ops, or placement materialization code
- **AND** current placement resource planning behavior remains unchanged
