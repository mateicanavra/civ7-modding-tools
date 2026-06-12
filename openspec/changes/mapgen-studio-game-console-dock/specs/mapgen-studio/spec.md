## ADDED Requirements

### Requirement: The Game Console Docks Beneath The World Bar

The game console SHALL render in the header zone as a centered row directly
associated with the world-config bar (after the transient setup panel when it
is open), expressing the vertical zoning top = game, bottom = studio. This
supersedes the footer placement scenarios of the Pass-3 console split; the
console's content, identity label, and modularity are unchanged.

#### Scenario: Game console renders under the world bar
- **WHEN** the app shell renders
- **THEN** the game console (identity label, live chip, autoplay, Run in Game and its status affordances, save-deploy chip) renders in the header zone beneath the world-config bar
- **AND** no live-game control or chip renders in the footer

#### Scenario: Setup panel stays attached to its disclosure
- **WHEN** the Setup disclosure is opened
- **THEN** the setup panel renders directly beneath the world bar, above the game console

#### Scenario: Side panels reflow under the taller header
- **WHEN** the game console row (or open setup panel) increases the header height
- **THEN** the left and right docks begin below the measured header, without overlap

### Requirement: The Footer Carries Only The Studio Console

The footer SHALL render exactly one console: the centered studio console
(status, last-run summary, seed, reroll, auto-run, Run), and SHALL keep
disabling its operation controls while a game-side operation (Run in Game,
save/deploy) is in flight.

#### Scenario: Studio console is centered alone
- **WHEN** the footer renders
- **THEN** the studio console renders horizontally centered and is the footer's only console

#### Scenario: Shared operation gating is preserved
- **WHEN** Run in Game or config save/deploy is running
- **THEN** the seed input, reroll, auto-run, and Run controls are disabled exactly as before the dock move
