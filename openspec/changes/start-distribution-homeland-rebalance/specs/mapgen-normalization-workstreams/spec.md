## ADDED Requirements

### Requirement: Homeland Partition Balances Settleable Land Area

The `plot-landmass-regions` step SHALL partition landmasses into the two
homeland regions by an area-balanced split of the settleable-land distribution
(the meridian pair that best halves settleable land on the X-wrapping map),
assigning each landmass whole, instead of by a fixed `bbox-center < width/2`
geometric midline.

#### Scenario: Asymmetric land is split near-evenly by capacity
- **WHEN** settleable land is concentrated on one side of the fixed `width/2`
  midline
- **THEN** the chosen split assigns landmasses so the two regions' settleable
  capacities are as balanced as keeping landmasses whole allows
- **AND** the published region slot space remains `0=none,1=west,2=east` and the
  engine `WEST`/`EAST`/`NONE` region ids are still stamped

#### Scenario: A single dominant continent is split, not collapsed
- **WHEN** one landmass spans more than half the map's settleable capacity
- **THEN** the balanced split cuts the cylinder through that continent so both
  regions contain settleable land (rather than leaving one region empty)

### Requirement: Player Allocation Is Proportional To Region Capacity Within Feasibility

The `plan-starts` op SHALL allocate the total player count across the two
homeland regions in proportion to each region's settleable capacity, clamped to
a per-region feasibility ceiling derived from the official spacing floor, instead
of using fixed per-hemisphere counts from `MapInfo`. The total player count
SHALL be sourced from the adapter alive-major read surface.

#### Scenario: A land-poor region receives fewer players
- **WHEN** one homeland region has materially less settleable capacity than the
  other
- **THEN** it is allocated proportionally fewer starts, never more than its
  feasibility ceiling
- **AND** the other region absorbs the remainder

#### Scenario: Allocation honors feasibility over balance
- **WHEN** a capacity-proportional or balance-biased allocation would assign a
  region more starts than its feasibility ceiling allows
- **THEN** the surplus is redistributed to a region with spare ceiling, and the
  redistribution is recorded as a region relaxation

#### Scenario: Total seats equal the alive major count
- **WHEN** the adapter reports the alive major player ids
- **THEN** the number of seats equals that count and player ids come from the
  alive-major surface (slot-index fallback recorded per seat, never silent)

### Requirement: Starts Disperse Across Landmasses And Space Within A Region

The `plan-starts` selection SHALL spread a region's seats across its constituent
landmasses (per-landmass quotas proportional to capacity) and across the
region's extent (a max-min / farthest-point dispersion objective), in addition to
the existing pairwise spacing floor.

#### Scenario: Multiple landmasses in a region each receive starts
- **WHEN** a homeland region contains more than one viable landmass and is
  allocated more starts than one landmass's quota
- **THEN** starts are seated on each viable landmass according to its quota
  rather than all on the single highest-scoring landmass

#### Scenario: Seats fan out under capacity pressure
- **WHEN** a region is capacity-tight
- **THEN** the selection raises the dispersion weight so seats maximize mutual
  distance rather than clumping in the single best basin, while still respecting
  the spacing floor

### Requirement: Region Rebalancing Is Capacity-Aware And Recorded

Cross-region seat reassignment SHALL trigger on capacity infeasibility (a region
cannot space its allocated seats), not only on a region having zero candidates,
and SHALL record every reassignment as a region relaxation in the fairness
report and per-seat flags.

#### Scenario: An under-supplied region rebalances before clustering
- **WHEN** a region is allocated seats it cannot space at the floor and another
  region has spare capacity
- **THEN** the surplus seats are reassigned to the region with spare capacity and
  each reassignment is recorded (never silent)

### Requirement: Start Region Balance And Spread Are Measurable

Placement diagnostics SHALL report start region balance and spatial spread:
seated starts per region against region capacity, the maximum single-landmass
start share against that landmass's capacity share, and a normalized spatial
spread index.

#### Scenario: Clustering is detectable by a metric
- **WHEN** a generated map seats a disproportionate share of starts on one small
  landmass
- **THEN** the region-balance metric reports `maxSingleLandmassStartShare`
  exceeding that landmass's capacity share (a failing signal the pairwise
  spacing metric alone cannot detect)

### Requirement: Start-Distribution Policy Primitives Are Pure Deterministic Helpers

The Civ7 start-distribution policy SHALL be expressed as pure, deterministic,
zero-dependency primitives in the `@civ7/map-policy` package (`src/starts/`):
the official spacing buffers and homeland model as fact data, a balanced
hemisphere split, a feasibility ceiling, a capacity apportionment, and a
dispersion score. Start-specific orchestration consuming these primitives stays
in the mod.

#### Scenario: Apportionment is deterministic and total-preserving
- **WHEN** `apportionStartsByCapacity` is given region capacities, ceilings, a
  total, and a balance bias
- **THEN** it returns integer per-region counts that sum to the total (or to the
  sum of ceilings when the total exceeds total capacity) and is identical across
  runs for identical inputs

#### Scenario: Primitives carry no Civ7 engine or mod dependency
- **WHEN** the `src/starts/` primitives are imported
- **THEN** they depend only on pure data and the package's own grid helpers (no
  adapter, no mod, no engine state), consistent with `kind:foundation`
