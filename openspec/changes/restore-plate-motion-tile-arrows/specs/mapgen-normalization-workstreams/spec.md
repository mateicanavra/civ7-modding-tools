## ADDED Requirements

### Requirement: Studio Plate Motion Uses Tile Arrow Surface

Studio SHALL keep product-facing plate-motion diagnostics on the tile-projected
map surface with directional arrows, while lower-level world-space vector
diagnostics remain debug-only.

#### Scenario: Default Studio layers are built
- **WHEN** the standard Swooper Maps recipe emits foundation plate-motion
  diagnostics
- **THEN** the default-visible plate-motion surface is tile-space data with a
  directional arrow render mode
- **AND** raw world-space plate-motion vector segments are not part of the
  default Studio layer set
