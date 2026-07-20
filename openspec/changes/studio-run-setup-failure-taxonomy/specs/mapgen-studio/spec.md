## ADDED Requirements

### Requirement: Setup Failures Have Specific Private Reasons

MapGen Studio SHALL classify Civ7 setup-control failures with specific private
diagnostic reasons while preserving safe public categories.

#### Scenario: Generated row is not visible

- **WHEN** Civ7 setup readback cannot find the expected generated row for the
  admitted `{mod-swooper-studio-run}/maps/${runArtifactId}.js`
- **THEN** the operation terminalizes with a safe public runtime category
- **AND** private diagnostics record `setup-map-row-not-visible`
- **AND** private diagnostics include the expected row identity and bounded
  setup context when available

#### Scenario: Generated mod is not enabled

- **WHEN** direct-control active target mod-set readback shows the generated
  Studio-run mod is absent from the active target mod set
- **THEN** the operation terminalizes with a safe public runtime category
- **AND** private diagnostics record `generated-map-mod-not-enabled`
- **AND** private diagnostics include the bounded active mod-set evidence used
  for that classification

#### Scenario: Active mod-set cannot be read

- **WHEN** the generated row is absent
- **AND** active target mod-set readback is unavailable
- **THEN** Studio does not classify the failure as
  `generated-map-mod-not-enabled`
- **AND** diagnostics record the setup readback limitation separately from row
  visibility

#### Scenario: Direct-control transport is unavailable

- **WHEN** the tuner or direct-control transport cannot be reached
- **THEN** the operation terminalizes with the dependency/runtime category owned
  by that phase
- **AND** private diagnostics record the transport failure rather than a setup
  row failure

#### Scenario: Public projection is safe

- **WHEN** any setup-control failure is reported through public status,
  current-operation, events, or UI copy
- **THEN** the payload contains safe category and recovery vocabulary only
- **AND** private row samples, mod-set samples, attribution, and local paths are
  available only through explicit diagnostics lookup
