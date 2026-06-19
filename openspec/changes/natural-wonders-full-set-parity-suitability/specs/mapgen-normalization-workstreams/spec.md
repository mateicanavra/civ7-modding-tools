## ADDED Requirements

### Requirement: Every Natural Wonder In Game Data Is Placement-Eligible

The natural-wonder catalog SHALL expose every wonder defined in official game
data. No wonder may be excluded by a missing placement-class footprint, an
unhandled placement tag, or a `placeFirst && tiles>1` guard. The eligible count
SHALL be asserted as a relative invariant (catalog length equals the count of
`naturalWonderTiles` rows in the generated tables), not a hardcoded number.

#### Scenario: Full set is catalog-eligible

- **WHEN** `NATURAL_WONDER_CATALOG` is built from the generated policy tables
- **THEN** every `Feature_NaturalWonders` row is present (catalog length equals
  the generated `naturalWonderTiles` row count)
- **AND** no wonder is dropped by a null footprint for `FOURPARALLELAGRM`,
  `FOURADJACENT`, or `FOURL`
- **AND** no wonder is dropped because a declared placement tag is absent from
  the supported-tag allowlist
- **AND** no multi-tile `placeFirst` wonder is dropped by the `placeFirst &&
  tiles>1` guard

#### Scenario: A wonder would be silently dropped

- **WHEN** any wonder in the game data fails the support filter
- **THEN** catalog construction surfaces the wonder and the exact failing reason
- **AND** the catalog and its mirror consistency check (the manual-catalog
  verifier) agree, because both derive from one shared support predicate

### Requirement: Multi-Tile Footprints Match The Live Engine On Both Row Parities

Natural-wonder footprint geometry SHALL be parity-aware (odd-R, resolved at the
anchor by `y & 1`) and SHALL match the live engine's stamped cells on both an
even-row and an odd-row anchor for every placement class, including the 4-tile
classes. The parity offset tables SHALL preserve the footprint direction-index
convention (swapping only the parity-dependent diagonals) and SHALL be defined
within the policy package, consistent with the in-package odd-R neighbor table.

#### Scenario: Even-row footprint matches engine readback

- **WHEN** a multi-tile wonder is placed at an even-row anchor
- **THEN** the offline footprint cells equal the cells stamped by the engine
  (verified by `getFeatureType` readback)
- **AND** the same equality holds at an odd-row anchor
- **AND** odd-row placements that work today (e.g. Redwood, Fuji direction 2,
  Vihren direction 1) are unchanged

#### Scenario: Footprint parity is resolved at the concrete anchor

- **WHEN** the planner evaluates a candidate anchor or reserves footprint spacing
- **THEN** footprint cells are taken from the parity-keyed offsets that match the
  anchor row (`(anchorY & 1) ? odd : even`)
- **AND** no single parity-agnostic offset set is applied across both row
  parities

### Requirement: Footprint Parity Is Proven By Live Readback, Not By The Mock Adapter

The shared footprint function SHALL be the single source of footprint geometry
for both the live and mock adapters, and SHALL be unit-tested on both row
parities against probe-confirmed engine cells. Footprint-parity correctness
SHALL NOT be claimed from mock-adapter behavior, because the mock write-and-
echoes the cells it computes; only the live engine readback proves parity.

#### Scenario: Mock cannot certify parity

- **WHEN** a footprint is computed under the mock adapter
- **THEN** the mock uses the same shared footprint function as the live adapter
- **AND** a parity regression is caught by the shared function's even-row unit
  test or by live readback, not by the mock's write-and-echo result

### Requirement: Natural-Wonder Selection Is Physically Grounded And Deterministic

Natural-wonder selection SHALL rank candidate tiles by a per-wonder, biome-aware
physical-suitability score, and SHALL choose WHICH wonders are placed by ranking
wonders on their best achievable suitability for the specific map. Selection
SHALL be deterministic given the input physical artifacts (themselves
seed-derived) and SHALL contain no random number generation.

#### Scenario: Which wonders are placed depends on terrain

- **WHEN** the planner selects wonders for a map
- **THEN** each wonder's inclusion is decided by its best achievable suitability
  on that map (with `placeFirst` wonders pinned ahead among those clearing a
  minimum suitability threshold)
- **AND** a wonder physically unsuited to the map is not forced into the
  selection
- **AND** maps generated from different seeds (different physical configuration)
  yield different selected wonder sets

#### Scenario: Determinism with no RNG

- **WHEN** the planner runs twice on the same input physical artifacts
- **THEN** the selected wonders, their tiles, and their order are identical
- **AND** no random number generator is consulted during scoring or selection

#### Scenario: Suitability output is preserved and bounded

- **WHEN** a placement is emitted
- **THEN** its `priority` output field carries the placed tile's per-wonder
  suitability in `[0,1]`
- **AND** downstream telemetry, diagnostics, and live-parity consumers continue
  to receive a valid bounded `priority`

### Requirement: The Engine Is The Final Legality Authority For Placement

Offline footprint geometry and adjacency-predicate checks SHALL act only as
conservative pre-filters. Final placement legality SHALL be decided by the engine
(`canHaveFeatureParam`) and confirmed by post-placement readback; the mod SHALL
NOT maintain a competing offline legality source.

#### Scenario: Predicate pre-filter then engine confirmation

- **WHEN** a wonder carries an adjacency predicate tag (coast, same-terrain,
  not-adjacent-to-land, cliff, or no-land-opposite-cliff)
- **THEN** the planner applies a conservative odd-R pre-filter to choose
  candidates
- **AND** the engine `canHaveFeatureParam` plus readback decide whether the
  wonder actually places

#### Scenario: Probe pins uncertain geometry before reliance

- **WHEN** 4-tile footprint geometry or cliff direction/opposite semantics are
  not derivable from data
- **THEN** they are pinned by a live `getAdjacentPlotLocation` and
  place-then-readback probe recorded in the live-proof ledger
- **AND** the implementation encodes the probe-confirmed result rather than an
  unverified assumption

### Requirement: Vanilla Wonder Effects Activate On Correct Placement

For the 20 vanilla wonders, placement SHALL go through the engine
`setFeatureType` path so that data-driven effects activate without explicit
effect wiring. Closure SHALL verify placement-time effects; city-acquisition-
time effects are out of map-generation scope.

#### Scenario: Placement-time effects manifest

- **WHEN** a vanilla wonder is placed via the adapter at a legal tile
- **THEN** placement uses `TerrainBuilder.setFeatureType`, not a path that
  bypasses effect activation
- **AND** placement-time effects are present (on-tile yields, volcano-wonder
  eruptibility registration, Everest reveal-on-discovery registration)

#### Scenario: City-acquisition-time effects are not required at map-gen

- **WHEN** closure evidence is gathered at map generation
- **THEN** the free Expedition Base and per-city/adjacency yields are not
  required, because they manifest only when a city owns or borders the (Impassable)
  wonder tile
- **AND** their absence at map-gen does not block closure

### Requirement: Natural-Wonder Closure Requires Live Multi-Wonder Proof

This change SHALL NOT close on source tests or mock-adapter evidence alone.
Closure requires a live in-game render proving multiple distinct wonders place
correctly across more than one seed, with even-row footprints matching engine
readback and placement-time effects present.

#### Scenario: Live closure evidence is recorded

- **WHEN** closure is claimed
- **THEN** the live-proof ledger records ≥2 seeds each placing multiple distinct
  wonders, including at least one previously-dropped wonder and one multi-tile
  even-row placement readback-matched to the offline footprint
- **AND** unavailable live labels remain unresolved rather than inferred from
  source tests or mock runs
