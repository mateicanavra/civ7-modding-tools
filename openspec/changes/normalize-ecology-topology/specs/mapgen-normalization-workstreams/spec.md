## ADDED Requirements

### Requirement: Ecology Topology Fold Preserves Observable Feature Products

The ecology topology change SHALL prove that folded feature-family wrappers
preserve feature plans, occupancy, and projection inputs unless the proposal
records an intentional product change.

#### Scenario: Feature-family wrappers are folded
- **WHEN** `ecology-ice`, `ecology-reefs`, `ecology-wetlands`, or
  `ecology-vegetation` logic is folded into `ecology-features`
- **THEN** output-equivalence or golden checks cover feature planning,
  occupancy cascade, and final projection inputs
- **AND** any output drift is explicitly classified as intentional or blocking

### Requirement: map-ecology Does Not Own Truth

The ecology topology change SHALL keep `map-ecology` limited to projection,
materialization, effects, diagnostics, and parity evidence.

#### Scenario: map-ecology retains a step
- **WHEN** a `map-ecology` step remains after topology normalization
- **THEN** its contract consumes upstream ecology truth artifacts
- **AND** it writes only engine-facing fields, effects, diagnostics, or
  projection evidence
