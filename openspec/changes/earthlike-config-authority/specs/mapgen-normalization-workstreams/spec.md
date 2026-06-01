## ADDED Requirements

### Requirement: Earthlike Config Authority Is Single-Posture

Earthlike config authority SHALL keep shipped map, preset, and first-party test
postures aligned unless a change records an intentional product distinction.

#### Scenario: Earthlike config sources are compared
- **WHEN** Swooper Earthlike, standard Earthlike preset, Studio defaults, or
  realism Earthlike test inputs are loaded
- **THEN** tests prove whether they share the same intended recipe posture
- **AND** stale lightweight Earthlike configs cannot silently stand in for the
  shipped map configuration

#### Scenario: Earthlike defaults affect balance behavior
- **WHEN** a step default affects lakes, projection, terrain, ecology, or
  placement balance proof
- **THEN** the shipped Earthlike config records the intended value explicitly
- **AND** duplicate authored values that are overwritten by knobs are removed or
  aligned
