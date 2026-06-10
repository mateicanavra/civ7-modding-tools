## ADDED Requirements

### Requirement: Visible River Repairs Are Evidence-Gated

Visible river and floodplain repairs SHALL start only from a current failing
proof row that identifies whether the owner is hydrology truth, ecology policy,
projection/materialization, Studio visualization, or Civ policy.

#### Scenario: River failure row exists
- **WHEN** product acceptance records a failing river or floodplain row
- **THEN** the repair workstream classifies the owner before code changes
- **AND** it adds a failing-row test or diagnostic for the proven owner

#### Scenario: Failure row is stale or unclassified
- **WHEN** the river/floodplain failure row is stale or unclassified
- **THEN** implementation is blocked
- **AND** the workstream returns to exact proof or parity classification

### Requirement: River Projection Separates Navigable Terrain From Minor Metadata

MapGen SHALL keep hydrology truth, navigable river terrain projection, and Civ
river metadata readback as separate proof classes.

#### Scenario: Navigable river projection is materialized
- **WHEN** `map-rivers` selects a navigable-river trunk from hydrology
  `riverClass>=2` discharge and flow direction
- **THEN** it publishes the selected navigable mask as MapGen projection truth
- **AND** it publishes planned minor and planned major masks separately from the
  projected navigable terrain mask
- **AND** it publishes adapter readback for `TERRAIN_NAVIGABLE_RIVER`, Civ
  `isRiver`, Civ `isNavigableRiver`, and Civ `getRiverType`
- **AND** it reports rejected selected tiles and extra raw engine navigable-river
  terrain tiles

#### Scenario: Minor river metadata remains separate from terrain projection
- **WHEN** hydrology contains `riverClass=1` minor river tiles
- **THEN** MapGen publishes those tiles as planned minor-river intent
- **AND** MapGen does not promote those tiles into `TERRAIN_NAVIGABLE_RIVER`
- **AND** per-tile minor-river authoring remains unclaimed unless a dedicated
  writer surface is proven by disposable-session readback
- **AND** any bulk native `RIVER_MINOR` metadata produced by Civ river modeling
  is reported as engine materialization/readback
- **AND** authored minor-river success is not claimed unless same-run evidence
  classifies native minor river objects against Hydrology truth

### Requirement: River/Lake Physical Benchmarks Are Falsification-First

River and lake acceptance SHALL be judged by hard drainage invariants before
visual tuning.

#### Scenario: Drainage graph legality is evaluated
- **WHEN** a fixture or generated map is evaluated
- **THEN** each land tile has zero or one downstream receiver
- **AND** downstream paths either reach ocean, reach a lake/sink, or terminate in
  a typed closed-basin exception
- **AND** flow accumulation never decreases across a confluence

#### Scenario: Coupled lake and river behavior is evaluated
- **WHEN** rainfall, relief, and closed basins create lake-prone terrain
- **THEN** lake sinks collect upstream drainage
- **AND** spill/saddle fixtures route overflow downstream instead of creating
  isolated impossible river fragments
- **AND** arid closed basins can remain endorheic without forcing ocean outlets
- **AND** final placement-surface lake readback counters are exposed in a
  named parity proof surface so accepted lakes cannot drift silently

#### Scenario: Knobs decouple physical concerns
- **WHEN** a river/lake knob changes
- **THEN** `hydrology-hydrography.knobs.riverDensity` changes physical river
  classification/projection thresholds without changing precipitation routing
  truth or Civ-visible navigable terrain projection
- **AND** `map-rivers.knobs.navigableRiverDensity` changes Civ-visible
  navigable-river trunk projection without changing physical river
  classification thresholds
- **AND** lake-oriented knobs change sink persistence/lake projection without
  moving drainage divides
- **AND** dryness/aridity changes runoff supply without rewriting river geometry
  except through physically explained discharge thresholds

### Requirement: Studio And Civ River Parity Is Same-Run Evidence

Studio river display and Civ runtime readback SHALL be compared from the same
authored map artifacts, not from screenshots or unrelated seeds.

#### Scenario: Same-run parity is available
- **WHEN** a river acceptance proof is run
- **THEN** Studio uses `artifact:map.rivers.projectedNavigableRivers` and
  `artifact:map.rivers.engineProjectionRivers`
- **AND** Civ readback reports terrain, river type, any-river mask,
  navigable-river mask, and minor-river mask for the same dimensions/seed
- **AND** mismatches are classified as projection, visualization, or runtime
  materialization before tuning changes are accepted
