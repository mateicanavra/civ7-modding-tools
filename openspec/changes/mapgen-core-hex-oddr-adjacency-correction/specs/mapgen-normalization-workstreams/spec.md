## ADDED Requirements

### Requirement: MapGen Hex Adjacency Matches The Engine Grid

`@swooper/mapgen-core` SHALL model the plot grid with the same offset convention
the Civ7 engine applies (pointy-top, row-offset / odd-R, neighbor parity keyed on
row parity), so that adjacency-derived surfaces it authors agree with
`GameplayMap.getAdjacentPlotLocation`.

#### Scenario: Neighbor query agrees with the engine
- **WHEN** mapgen-core enumerates the six neighbors of a tile `(x, y)`
- **THEN** the returned neighbor set equals the engine's six adjacent plots for
  that tile under both row parities
- **AND** the neighbor selector uses row parity, not column parity

#### Scenario: The exact table is pinned by the live engine
- **WHEN** the adjacency table is established or changed
- **THEN** it is confirmed against a live `getAdjacentPlotLocation` probe
- **AND** it is not validated solely by the MockAdapter or the diagnostics dump,
  which share the model and cannot reveal a model mismatch

### Requirement: One Canonical Hex Adjacency Model

mapgen-core SHALL expose a single canonical hex adjacency/projection/cube
implementation. Any other neighbor or hex-space definition (vector-field,
`@civ7/map-policy`) MUST derive from or match that canonical model.

#### Scenario: Duplicate definitions are reconciled
- **WHEN** a module needs hex neighbors, hex-space projection, cube coordinates,
  or hex distance
- **THEN** it uses the canonical grid implementation or a table proven equal to
  it
- **AND** no second adjacency convention (a different parity axis or diagonal
  pair) remains live in the codebase

### Requirement: Adjacency-Derived Truth Stays Adjacency-Only

Correcting the adjacency model SHALL change only adjacency-derived classification
and topology (coast, components, distance, routing, vector fields, spacing). It
MUST NOT change per-tile land/water truth ownership.

#### Scenario: Land/water truth is preserved
- **WHEN** the adjacency model is migrated from odd-Q to odd-R
- **THEN** per-tile land/water mask totals authored by Morphology are unchanged
- **AND** only coast/ocean reclassification and adjacency topology may differ

### Requirement: Per-Consumer Adjacency Supersets Are Not Permanent Truth

A convention-agnostic neighbor superset (for example a Moore-8 coast ring) SHALL
be used only as an OR-reduction safety net, and SHALL be reconciled to the
canonical adjacency once the model is correct. Such a superset MUST NOT be relied
on to mask the model defect for exact-set consumers such as flow routing or
vector fields.

#### Scenario: The coast-ring superset is reconciled
- **WHEN** the canonical adjacency model is corrected to the engine convention
- **THEN** the coast-ring step computes its ring with the canonical adjacency
- **AND** the eight-offset superset widening is removed
- **AND** the corrected six-neighbor ring leaves no land tile bordering deep
  ocean

### Requirement: Land Never Borders Deep Ocean Without A Coast Ring

The standard recipe SHALL guarantee that every authored land tile has a coast
ring, independent of how the land was introduced, using the canonical engine
adjacency. Land MUST NOT be authored directly against deep ocean.

#### Scenario: Late-injected island gets a coast ring
- **WHEN** island peaks are injected into the land mask after coastline metrics
  are computed
- **THEN** `plotCoasts` promotes every engine-adjacent ocean tile around that
  land to coast
- **AND** the no-water-drift projection has no coastless island land to revert
- **AND** the live engine renders island coastlines with no notch

### Requirement: Adjacency Correctness Is Proven At Runtime

Adjacency-model correctness SHALL be proven by a live-engine probe and an
in-game render, recorded as a runtime proof class separate from unit tests,
dump statistics, golden deltas, and OpenSpec validation.

#### Scenario: Closure requires live proof
- **WHEN** the workstream claims the adjacency correction is complete
- **THEN** it cites a live `getAdjacentPlotLocation` probe and a live in-game
  render with no notch and no floating plateaus
- **AND** it does not claim in-game correctness from generated arrays, terrain
  readback, or Studio display alone
