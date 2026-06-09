## ADDED Requirements

### Requirement: Hydrology Owns Drainage Routing Truth

Hydrology SHALL own the canonical drainage route graph used for discharge,
river classification, lake intent, and downstream river projection.

#### Scenario: Hydrography computes route truth
- **WHEN** Hydrology hydrography runs on Morphology topography
- **THEN** it computes depression-conditioned `flowDir` from a Hydrology routing op
- **AND** discharge accumulation uses that route graph
- **AND** Hydrology publishes basin, terminal, and conditioning diagnostics
- **AND** it does not compute a separate raw steepest-descent route in the recipe step

#### Scenario: Routing is invalid
- **WHEN** a route graph contains cycles or invalid receivers
- **THEN** Hydrology validation fails or throws
- **AND** discharge accumulation does not silently cut cycles into terminal sinks

### Requirement: Map Rivers Does Not Repair Upstream Drainage

`map-rivers` SHALL materialize Hydrology-authored major-river intent and SHALL
not create projection-only route connectors to satisfy visible-river budgets.

#### Scenario: Routed major-river signal is too fragmented
- **WHEN** Hydrology major-river intent contains no route-valid chain meeting the
  projection eligibility criteria
- **THEN** `map-rivers` selects no such fallback chain
- **AND** the selected-vs-target shortfall remains visible in projection metrics
- **AND** downstream projection cannot count disconnected fallback corridors as
  Hydrology truth
