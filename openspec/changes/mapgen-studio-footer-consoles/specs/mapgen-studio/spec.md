## ADDED Requirements

### Requirement: The Footer Separates Studio And Game Consoles

The footer SHALL render exactly two consoles: a centered studio console
carrying studio-runtime status and run controls (status, last-run summary,
seed, reroll, auto-run, Run), and a right-docked, identity-labeled game
console carrying all live-Civ7 information and controls (live runtime chip,
apply-suggestion, autoplay, Run in Game with its status/retry/diagnostics,
save-deploy status).

#### Scenario: Studio controls live in one centered bar
- **WHEN** the footer renders
- **THEN** status, last-run summary, seed input, reroll, auto-run, and Run render in a single centered console
- **AND** no live-game control or chip renders inside it

#### Scenario: Game controls live in the named right console
- **WHEN** the footer renders with live runtime and run-in-game state available
- **THEN** the live chip, autoplay toggle, Run in Game button, its status chip/retry/diagnostics, and the save-deploy chip render in the right-docked console under a visible identity label

#### Scenario: Centering is independent of the game console
- **WHEN** the game console's content width changes
- **THEN** the studio console remains horizontally centered in the viewport

### Requirement: The Console Split Preserves Studio-Game State Legibility

The split SHALL preserve every studio↔game relation cue: staleness emphasis
and the apply-suggestion affordance on the game console, and dirty-state
emphasis on the studio console, with unchanged semantics.

#### Scenario: Stale live game still offers the bridge
- **WHEN** the live game is proved stale relative to the current studio state
- **THEN** the game console shows the warning emphasis and the apply-suggestion affordance exactly as before the split

#### Scenario: Run in Game relation chip survives
- **WHEN** a recorded Run in Game operation exists
- **THEN** its Current/Stale/Previous relation chip renders beside it on the game console

#### Scenario: Studio dirty state stays on the studio console
- **WHEN** current settings differ from the last run
- **THEN** the studio console shows the Modified status and the Run button's dirty ring
