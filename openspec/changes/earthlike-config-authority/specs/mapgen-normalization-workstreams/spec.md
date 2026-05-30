## ADDED Requirements

### Requirement: Earthlike Config Authority Is Single-Posture

Earthlike config authority SHALL keep the shipped map, Studio default, and
first-party test postures aligned unless a change records an intentional
product distinction.

#### Scenario: Earthlike config sources are compared
- **WHEN** Swooper Earthlike, Studio defaults, or realism Earthlike test inputs
  are loaded
- **THEN** tests prove whether they share the same intended recipe posture
- **AND** stale lightweight Earthlike configs cannot silently stand in for the
  shipped map configuration

#### Scenario: Internal projection config appears in Earthlike posture
- **WHEN** a projection or op envelope is produced from compilation defaults or
  knob normalization
- **THEN** Earthlike authored config does not record that internal envelope as
  public map posture
- **AND** tests verify the compiled output without requiring the source config
  to duplicate internal projection details
