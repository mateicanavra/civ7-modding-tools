## ADDED Requirements

### Requirement: Earthlike Terrain Has Visible Relief Structure

Swooper Earthlike terrain SHALL produce visible mountain belts, foothill/rough
terrain support, and varied continental relief instead of relying on smooth
continent-center elevation gradients.

#### Scenario: Earthlike mountain coverage is evaluated
- **WHEN** representative Swooper Earthlike seeds run
- **THEN** planned non-volcano mountain belts meet a visible coverage floor
- **AND** volcano-stamped mountain terrain is reported separately from ridge
  mountain truth

#### Scenario: Active margins miss land
- **WHEN** active tectonic boundary signal is mostly underwater or off-continent
- **THEN** Earthlike terrain proof fails before feature or placement tuning can
  claim map balance
- **AND** repairs remain driver-anchored rather than noise-only fills

#### Scenario: Continents form smooth bulges
- **WHEN** elevation is summarized by shore distance or continent interior
- **THEN** the metrics detect broad unpunctuated elevation domes
- **AND** such domes fail Earthlike relief balance even when land/water budgets
  pass
