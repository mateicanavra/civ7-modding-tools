## ADDED Requirements

### Requirement: Formatter-Stable Catalog Ownership Proofs

Habitat H4 proof repairs SHALL preserve exact architectural ownership checks
while avoiding assertions whose only failure mode is formatter-controlled
ordering.

#### Scenario: Domain config facade exports are checked as an exact set
- **WHEN** the Swooper Maps morphology catalog ownership proof reads the domain
  config facade
- **THEN** it accepts the allowed recipe-facing knob exports in any
  formatter-produced order
- **AND** it still fails for any missing export
- **AND** it still fails for any extra export from op strategy schemas,
  implementation modules, or unrelated domain surfaces
