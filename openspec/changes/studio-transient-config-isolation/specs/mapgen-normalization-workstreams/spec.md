## ADDED Requirements

### Requirement: Studio transient map configs stay outside shipped preset generation

MapGen Studio SHALL treat live-run map configs such as
`studio-current.config.json` as transient runtime inputs, not canonical shipped
map presets.

#### Scenario: Studio current config exists while generating recipe artifacts

- **GIVEN** `mods/mod-swooper-maps/src/maps/configs/studio-current.config.json`
  exists from a previous Studio launch
- **WHEN** the standard recipe artifact generator validates shipped map configs
- **THEN** it MUST ignore `studio-current.config.json`
- **AND** it MUST continue to validate the canonical shipped map configs.

#### Scenario: Studio writes a live-run config

- **GIVEN** Studio saves an ad hoc current map config for launching Civ
- **WHEN** Git status is checked
- **THEN** the live-run config MUST NOT appear as an untracked source file.
