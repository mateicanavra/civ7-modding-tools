## ADDED Requirements

### Requirement: The Footer Is The Single Run Console

Mapgen Studio SHALL present exactly one browser-run trigger: the footer run
console's Run button. The recipe panel SHALL NOT render a Run button; its footer
row carries Save & Deploy only. The run handler and its disabled conditions are
the same ones the footer already uses.

#### Scenario: One Run trigger on screen
- **WHEN** the studio renders in its default state
- **THEN** exactly one button with the accessible name "Run" exists
- **AND** it lives in the footer run console next to seed/re-roll/auto-run/Run in Game

#### Scenario: Recipe panel keeps Save & Deploy
- **WHEN** the recipe panel renders
- **THEN** its footer row contains the Save & Deploy menu trigger and no Run button

### Requirement: The Footer Run Carries The Dirty Affordance

When the authored config differs from the last run, the footer Run button SHALL
carry the dirty emphasis (focus-ring-tier contour), alongside the existing
"Modified" status chip.

#### Scenario: Dirty config emphasizes the footer Run
- **WHEN** the user edits config after a run (`isDirty` true)
- **THEN** the footer Run button renders the dirty ring emphasis
- **AND** the footer status chip reads "Modified"

### Requirement: Last-Run Summary Uses Unabbreviated Words

The footer's last-run summary SHALL spell out resource-mode names (e.g.
"Balanced"), so the summary does not read as truncated.

#### Scenario: Balanced resources
- **WHEN** the last run used resource mode `balanced`
- **THEN** the summary renders "Balanced" (not "Bal")
