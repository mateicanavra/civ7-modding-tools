## ADDED Requirements

### Requirement: Player-Scoped Setup Parameters

`@civ7/direct-control` SHALL expose player-scoped setup parameter snapshots for
local leader, civilization, and difficulty.

#### Scenario: Read player setup choices

- **WHEN** a setup snapshot is read
- **THEN** the result includes local player parameter snapshots for
  `PlayerLeader`, `PlayerCivilization`, and `PlayerDifficulty`

### Requirement: Setup Option Readback

`@civ7/direct-control` SHALL verify every requested setup game option and player
option after setup preparation.

#### Scenario: Requested option is not retained

- **WHEN** a setup preparation request includes a game or player option
- **AND** the after snapshot does not contain the same value
- **THEN** the wrapper fails with `setup-readback-mismatch`
