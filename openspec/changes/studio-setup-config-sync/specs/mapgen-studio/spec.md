## ADDED Requirements

### Requirement: Studio Setup Config Preservation

Mapgen Studio SHALL persist and launch a bounded Civ7 setup config containing
map override, main game options, custom difficulty options, and local player
leader/civilization/difficulty.

#### Scenario: Launch preserves setup choices

- **WHEN** Studio runs a map in game
- **THEN** the Run in Game payload includes the current bounded setup config
- **AND** direct-control applies those setup choices before starting the game

### Requirement: Live Setup Re-Sync

Mapgen Studio SHALL be able to query the current Civ7 setup snapshot and re-sync
Studio setup state from it.

#### Scenario: User syncs from live game

- **WHEN** the user invokes Sync from Live
- **THEN** Studio updates seed when available
- **AND** Studio updates setup config from the live setup snapshot, including
  map row, leader, civilization, and difficulty
