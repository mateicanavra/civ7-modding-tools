## ADDED Requirements

### Requirement: Start Candidates Exclude Impassable And Wonder-Occupied Tiles

The plan-starts op SHALL exclude mountain tiles, volcano tiles, and tiles
occupied by placed natural wonders from start candidacy using pipeline
artifacts (morphology mountain/volcano masks, natural-wonder placement
outcomes), recording each exclusion under a typed rejection reason, and the
assign-starts materializer SHALL apply the same exclusions to its
last-resort fallback selection.

#### Scenario: Mountain, volcano, and wonder tiles are rejected as candidates
- **WHEN** plan-starts evaluates a land tile flagged by the morphology
  mountain mask, the morphology volcano mask, or the placed natural-wonder
  plot set
- **THEN** the tile is excluded from start candidacy with rejection reason
  `mountain`, `volcano`, or `natural-wonder` respectively

#### Scenario: Desperation fallback cannot seat an unsettleable tile
- **WHEN** regional and open-pool selection cannot seat every player and the
  desperation fallback selects from raw slotted land
- **THEN** tiles in the exclusion mask (mountain/volcano/wonder) are not
  eligible desperation candidates

#### Scenario: Hard invariant holds on baseline seeds
- **WHEN** the placement metrics harness runs the 5 S0 baseline seeds at
  standard size
- **THEN** E1.1 reports 0% starts on mountain/volcano/wonder/lake tiles

### Requirement: Studio Runs Seat The Configured Player Count

The studio browser-runner worker SHALL treat `PlayersLandmass1/2` as
per-hemisphere counts and split the configured total player count across
them, so a studio run seats exactly the configured number of players.

#### Scenario: Player count is split across hemispheres
- **WHEN** the studio worker builds mock-adapter mapInfo for a run configured
  with N players
- **THEN** `PlayersLandmass1 = ceil(N/2)` and `PlayersLandmass2 = floor(N/2)`
- **AND** the run seats exactly N starts (verified by the harness
  `--studio-mapinfo` probe)

### Requirement: Start Fallback Seating Is Surfaced Loudly

Start assignment SHALL surface every openPool or desperation seating through
a warning (console + warn-tagged trace event) and SHALL record the assignment
path of every seat in the start assignment artifact.

#### Scenario: Fallback fires visibly
- **WHEN** any seat is filled by the openPool or desperation path
- **THEN** a `console.warn` naming the path and affected seat indices is
  emitted and a warn-tagged trace event (`placement.starts.fallback`) is
  emitted in traced runs

#### Scenario: Per-seat path is recorded
- **WHEN** the startAssignment artifact is published
- **THEN** it contains `seatPaths` aligned with `positions`, each entry one of
  `regional|openPool|desperation`

### Requirement: Resource Fallback Preserves The Authored Spacing Floor

Resource assignment SHALL NOT place resources below the authored
`minSpacingTiles`; when a target count cannot be met without violating the
floor, the unmet remainder SHALL be recorded as a typed shortfall in the
resource placement outcomes artifact and surfaced via telemetry and a warn
trace event, instead of forcing placement at relaxed spacing.

#### Scenario: Spacing never decays below the authored floor
- **WHEN** no remaining plot satisfies the authored spacing floor for any
  candidate resource type
- **THEN** assignment stops instead of relaxing spacing toward 0

#### Scenario: Shortfall is recorded, not silent
- **WHEN** assignment ends below the planned target count
- **THEN** `assignment.spacingShortfallCount` records the unmet remainder in
  the `resourcePlacementOutcomes` artifact
- **AND** a warn trace event (`placement.resources.spacingShortfall`) and a
  `console.warn` surface the shortfall
