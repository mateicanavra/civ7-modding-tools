## ADDED Requirements

### Requirement: The Top Bar Is The Single Game Toolbar

The header SHALL render one Game bar carrying everything that configures,
commands, or observes the live Civ7 game — the saved-config selector, the
live runtime chip with its sync-suggestion bridge, autoplay, Explore, the
save-deploy and run-status chips with retry/diagnostics, Run in Game, and a
trailing icon-only disclosure that expands the game-setup row — and SHALL
render no map/world settings (size, players, resources). This supersedes the
docked-console placement of `mapgen-studio-game-console-dock`; console
content, gating, and state legibility are unchanged.

#### Scenario: Game bar unifies config, status, and commands

- **WHEN** the app shell renders
- **THEN** the header bar contains the saved-config selector, the live
  runtime chip, the autoplay/Explore/Run-in-Game commands and their status
  affordances, in one row with a Game identity
- **AND** no separate game console panel renders anywhere

#### Scenario: No map settings in the top bar

- **WHEN** the header renders
- **THEN** it contains no Size, Players, or Resources controls

#### Scenario: Setup disclosure sits last and expands game setup only

- **WHEN** the trailing setup disclosure (icon-only, accessibly named) is
  activated
- **THEN** a row with Leader, Civilization, Difficulty, and Game speed
  expands beneath the bar (`aria-expanded`/`aria-controls` wired)
- **AND** the expanded row contains no map/world settings

### Requirement: The Bottom Bar Is The World/Map Console

The footer SHALL carry the map authoring controls — Size, Players, and
Resources selects placed left of the Seed input — alongside seed, reroll,
auto-run, Run, and the studio status, and SHALL disable its operation
controls while any studio or game operation is in flight (behavior parity
with the previous placement).

#### Scenario: Map settings author from the footer

- **WHEN** the user changes Size, Players, or Resources in the footer
- **THEN** the same `WorldSettings` state updates as when these selects
  lived in the header

#### Scenario: Shared operation gating extends to the moved selects

- **WHEN** a browser run, Run in Game, or save/deploy is in flight
- **THEN** the Size, Players, and Resources selects are disabled together
  with seed, reroll, auto-run, and Run

### Requirement: Last-Run Stats Collapse Into A History Affordance

The footer SHALL replace the inline last-run text cluster with a single
History control whose hover tooltip presents the last run (seed, size,
players, resources), mirrored onto the control's accessible name, and whose
activation copies the last run's seed to the clipboard.

#### Scenario: History tooltip carries the last run

- **WHEN** the user hovers or focuses the History control after a run
- **THEN** a tooltip presents the last run's seed, size, players, and
  resources
- **AND** the same content is exposed via the control's accessible name

#### Scenario: History click copies the seed

- **WHEN** the user activates the History control
- **THEN** the last run's seed is copied to the clipboard with a toast
  confirmation
