## ADDED Requirements

### Requirement: Final Surface Parity Classifies Every Delta

Swooper recovery SHALL classify every final local/Studio versus live Civ
terrain, biome, feature, and resource delta before claiming product parity.

#### Scenario: Full-grid parity proof runs
- **WHEN** final-surface parity proof compares local and live grids
- **THEN** every mismatch is classified as repo-owned policy gap,
  repo-owned pipeline/materialization gap, accepted Civ materialization policy,
  Studio visualization mismatch, direct-control readback limitation, or product
  blocker

#### Scenario: A P1 or P2 delta is unclassified
- **WHEN** a material final-surface delta remains unclassified
- **THEN** parity closure is blocked
- **AND** product acceptance cannot treat the run as proof of final surface
  correctness
