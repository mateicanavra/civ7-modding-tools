## ADDED Requirements

### Requirement: Start Seat Selection Is Owned By The plan-starts Op As A Never-Throw Ladder

The `placement/plan-starts` operation SHALL own start seat selection end to
end, emitting per-player typed seat intents through a four-rung fallback
ladder (regional → open-pool → quality-relaxed → spacing-relaxed) in which
every rung is scored, every degradation is recorded per seat
(`status: full|degraded`, rung, flags), and no rung throws. An unfillable
seat SHALL be returned as degraded data (`plotIndex: -1`); the only hard
failure is a map with zero settleable land candidates while seats are
requested. The recipe materializer SHALL only stamp the emitted seats via
the adapter, surface degradations loudly, and publish the artifact.

#### Scenario: Regional seats are full status at or above the floor
- **WHEN** a region has spaced candidates for all its seats
- **THEN** every seat records rung `regional`, status `full`, and
  `achievedSpacing >=` the hard floor

#### Scenario: Exhausted maps degrade instead of throwing
- **WHEN** fewer settleable tiles exist than requested seats
- **THEN** the plan returns unseated seats flagged `unseated` with status
  `degraded` and the run completes

#### Scenario: The last resort is still scored
- **WHEN** a seat can only be placed below the spacing floor
- **THEN** the chosen tile still carries a positive blended quality score and
  the seat is flagged `spacing-below-floor`

### Requirement: Start Records Carry Component Vectors, Identity, And A Fairness Report

The published start assignment SHALL carry one `StartRecord` per configured
seat — component vector (freshwater, fertility, expansion, climate,
resource, roughness), tier, fixed-normalization 0..1 score, achieved
spacing, rung, status, imputed flags, and playerId with its source — plus a
`fairnessReport` with the parity frame, `worstPairGap`, balanced verdict,
swaps, and every spacing/region/quality relaxation. Optional inputs SHALL be
asserted for coverage: imputed inputs are reported in `inputCoverage` and
flag every seat, never silently neutral-defaulted. The artifact SHALL
register a validate hook enforcing seat/position alignment, rung/status
consistency, unique plots, and fairness coherence.

#### Scenario: Imputed inputs are surfaced
- **WHEN** an optional scoring input (e.g. aridityIndex) is absent
- **THEN** `inputCoverage` reports it `imputed` and every seat's
  `imputedFlags` carries the affected component

#### Scenario: Fairness verdict matches the gap
- **WHEN** the fairness report is published
- **THEN** `balanced` is true exactly when `worstPairGap <= tolerance`, and
  every balancing swap and relaxation taken during selection is listed

### Requirement: Seat Identity Maps Through The Adapter Alive-Majors Read Surface

The engine adapter SHALL expose `getAliveMajorIds()` as a read-only surface
(no seating decisions in the adapter); the plan-starts op SHALL own the
slot→player mapping at a single policy point, seating west seats then east
seats, using alive ids where they cover the seat and the slot index
otherwise — recorded per seat as `playerIdSource`. The materializer SHALL
stamp `setStartPosition` with the op's playerId.

#### Scenario: Alive ids seat verbatim
- **WHEN** the adapter reports alive major ids covering all seats
- **THEN** every seat's playerId equals the alive id at its seat index with
  source `alive-majors`

#### Scenario: Uncovered seats are flagged, not silent
- **WHEN** the alive-majors list is shorter than the seat count
- **THEN** uncovered seats use the slot index with source `slot-index`

### Requirement: Start Spacing Honors Official Buffers And Sector Machinery Is Removed

Start selection SHALL enforce the official 6-tile required buffer as a hard
spacing floor for all rungs above the last resort, treat the official
12-tile desired buffer as a score taper and relaxation start (not a floor),
and record every relaxation step. The inert start-sector machinery (knobs,
contract fields, runtime plumbing, public-config force-override, sector grid
viz) SHALL be removed; landmass-region slots remain the regional mechanism
(divergence from official `chooseStartSectors` recorded in the ADR). A
configured region with zero start candidates SHALL have its seats reassigned
to the other region before the ladder, recorded as a region relaxation plus
a per-seat `region-reassigned` flag with degraded status.

#### Scenario: Hard floor holds across seeds
- **WHEN** the metrics harness runs the 20-seed standard window
- **THEN** no start pair sits closer than 6 tiles

#### Scenario: Sector knobs are gone
- **WHEN** the public placement schema and compiled step configs are derived
- **THEN** no `startSectors`/`startSectorRows`/`startSectorCols` key exists
  anywhere in the public surface, compiled configs, or emitted viz keys

#### Scenario: Nonexistent regions reassign loudly
- **WHEN** a map's land yields zero candidates for one configured region
- **THEN** that region's seats seat in the other region with the
  `region-reassigned` flag, a recorded region relaxation, and a warn trace

### Requirement: Start Scoring Includes Climate Comfort And Official Start-Bias Hooks

Start viability scoring SHALL include a climate-comfort component and an
extreme-decile penalty computed in the same land-decile frame as the E1.8
expectation (top aridity decile, outer temperature deciles, rank-relative
over land tiles), a land-only radius-2 fertility frame, coastal/river
start-preference knobs, and a per-seat official StartBias scoring hook
(river/lake/adjacentToCoast resolvable offline; absent bias rows default to
neutral; per-civ resolution deferred to live data).

#### Scenario: Climate extremes repel starts
- **WHEN** the 20-seed standard window is measured
- **THEN** at most 10% of starts sit in the top land aridity decile or outer
  land temperature deciles

#### Scenario: Bias rows shift seat ranking offline
- **WHEN** a seat carries a riverine StartBias row and river-adjacent
  candidates exist
- **THEN** that seat ranks river-adjacent candidates above otherwise-equal
  non-river candidates, and seats without bias rows are unaffected
