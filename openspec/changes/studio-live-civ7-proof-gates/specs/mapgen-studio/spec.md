## ADDED Requirements

### Requirement: Live Run In Game Proof Separates Deployed File Visibility From Build Success

MapGen Studio SHALL not close live Run in Game proof unless generated, deployed, tuner, log, and in-game observations are separately recorded.

#### Scenario: Studio current map is visible to Civ7 setup

- **WHEN** Run in Game reaches setup preparation for request id `<requestId>`
- **THEN** `mods/mod-swooper-maps/mod/maps/studio-current.js` exists with current markers
- **AND** the deployed Civ7 Mods target contains `maps/studio-current.js` with matching current markers
- **AND** Civ7 setup can see `{swooper-maps}/maps/studio-current.js`
- **AND** the subsequent bounded log and readback evidence are tied to the same request id

#### Scenario: Live prerequisite is unavailable

- **WHEN** Civ7 or FireTuner is unavailable
- **THEN** live labels remain unresolved
- **AND** source tests, build success, deploy success, or quiet logs do not substitute for in-game proof
