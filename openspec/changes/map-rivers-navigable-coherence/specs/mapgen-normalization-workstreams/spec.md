## ADDED Requirements

### Requirement: Navigable River Projection Is Coherent And Visible

`map-rivers` SHALL project a coherent, player-visible navigable river subset
from planned major river intent on normal wet maps, while preserving typed
exceptions for arid or otherwise no-signal maps.

#### Scenario: Normal Earthlike map has major rivers
- **WHEN** a normal Earthlike map has more than 100 planned major-river tiles
- **THEN** projected navigable terrain meets the declared minimum tile or
  connected-chain threshold
- **AND** same-run live terrain readback matches the projected navigable mask
- **AND** product acceptance remains blocked until rendered visibility is proven

#### Scenario: Arid no-signal map has few visible rivers
- **WHEN** an arid or desert control map projects few or no navigable rivers
- **THEN** the proof packet records a typed no-signal status
- **AND** the absence is not treated as a projection failure
