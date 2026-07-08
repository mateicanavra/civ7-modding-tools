## ADDED Requirements

### Requirement: Final Matrix Uses Rendered User Path

MapGen Studio SHALL close the Run in Game remediation only after the rendered
browser path starts the requested generated content in Civ7 for every required
scenario.

#### Scenario: Swooper Earthlike launches from Studio

- **WHEN** the rendered Studio page selects `ToT_BasicModsEnabled.Civ7Cfg`,
  Swooper Earthlike, seed `1538316415`, `MAPSIZE_HUGE`, and 10 players
- **AND** the user clicks Run in Game
- **THEN** Civ7 starts the generated Studio-run content for that request
- **AND** retained evidence connects public status, diagnostics lookup,
  generated artifact, deployed snapshot, setup row, and post-start in-game
  readback
- **AND** retained evidence records setup readback for the exact admitted
  `runArtifactId`, seed, `MAPSIZE_HUGE`, and 10 players
- **AND** retained evidence records balanced resources in the visible UI
  selection, admitted request, generation manifest, and evidence row
- **AND** retained evidence records fresh scripting-log markers and `106x66`
  live snapshot dimensions

#### Scenario: Latest Juicy launches from Studio

- **WHEN** the rendered Studio page selects `ToT_BasicModsEnabled.Civ7Cfg`,
  Latest Juicy, seed `1538316415`, `MAPSIZE_HUGE`, and 10 players
- **AND** the user clicks Run in Game
- **THEN** Civ7 starts the generated Studio-run content for that request
- **AND** retained evidence connects public status, diagnostics lookup,
  generated artifact, deployed snapshot, setup row, and post-start in-game
  readback
- **AND** retained evidence records setup readback for the exact admitted
  `runArtifactId`, seed, `MAPSIZE_HUGE`, and 10 players
- **AND** retained evidence records balanced resources in the visible UI
  selection, admitted request, generation manifest, and evidence row
- **AND** retained evidence records fresh scripting-log markers and `106x66`
  live snapshot dimensions

#### Scenario: Swooper Desert Mountains launches from Studio

- **WHEN** the rendered Studio page selects `ToT_BasicModsEnabled.Civ7Cfg`,
  Swooper Desert Mountains, seed `1538316415`, `MAPSIZE_HUGE`, and 10 players
- **AND** the user clicks Run in Game
- **THEN** Civ7 starts the generated Studio-run content for that request
- **AND** retained evidence connects public status, diagnostics lookup,
  generated artifact, deployed snapshot, setup row, and post-start in-game
  readback
- **AND** retained evidence records setup readback for the exact admitted
  `runArtifactId`, seed, `MAPSIZE_HUGE`, and 10 players
- **AND** retained evidence records balanced resources in the visible UI
  selection, admitted request, generation manifest, and evidence row
- **AND** retained evidence records fresh scripting-log markers and `106x66`
  live snapshot dimensions

#### Scenario: Prior generated row is visible

- **WHEN** setup row readback sees a generated Studio-run row for a prior
  request instead of the exact admitted `runArtifactId`
- **THEN** the final matrix row fails
- **AND** private diagnostics record a generated row mismatch

### Requirement: Final Matrix Includes Recovery And Freshness Rows

MapGen Studio SHALL run the required recovery and freshness checks before
closing the real user path matrix.

#### Scenario: Missed terminal event or browser reload recovers

- **WHEN** a browser-originated operation reaches daemon terminal state
- **AND** the rendered browser misses the terminal event or reloads
- **THEN** the UI adopts terminal state from `studio.operations.current`
- **AND** does not replay `runInGame.start`

#### Scenario: Generated row is missing

- **WHEN** the generated map row is absent during setup readback
- **THEN** the operation terminalizes with a safe public runtime category
- **AND** explicit diagnostics lookup records the specific setup failure reason

#### Scenario: Saved config omits generated mod

- **WHEN** a saved setup config omits or disables the generated Studio-run mod
- **THEN** the operation terminalizes with safe public status
- **AND** explicit diagnostics lookup records the generated-mod mod-set
  mismatch without leaking private detail publicly

#### Scenario: Repeat run uses fresh runtime identities

- **WHEN** the same rendered scenario is run twice with deterministic inputs
- **THEN** the second run has a fresh request id, workspace, generated artifact
  identity, and deployment snapshot identity
- **AND** deterministic source/config digests may match only where the same
  input intentionally produces the same content

#### Scenario: Endpoint-only rows exist

- **WHEN** endpoint-originated checks pass
- **THEN** they are recorded as supporting evidence only
- **AND** do not satisfy the browser-originated final matrix

#### Scenario: Live environment is unavailable

- **WHEN** Civ7, Studio endpoint runtime, or required direct-control state is
  unavailable
- **THEN** the remediation remains open and blocked
- **AND** the next external action is recorded in the workstream evidence
