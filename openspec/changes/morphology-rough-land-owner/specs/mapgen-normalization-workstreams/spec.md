## ADDED Requirements

### Requirement: Rough Land Has A Dedicated Morphology Owner

Earthlike rough-land hills SHALL be planned by a Morphology-owned operation
that is separate from ridge mountains, ridge-skirt foothills, volcano stamping,
and map projection.

#### Scenario: Rough-land hills are authored
- **WHEN** morphology-features publishes mountain-family terrain intent
- **THEN** it publishes ridge mountain intent, foothill hill intent, non-foothill
  rough-land hill intent, and a combined hill mask
- **AND** rough-land hill intent is derived from Morphology inputs such as
  topography, belt drivers, routing, coastline distance, and substrate
- **AND** map projection only materializes the combined Morphology hill mask
  into engine terrain

#### Scenario: Earthlike flatness is repaired locally
- **WHEN** Swooper Earthlike terrain relief is measured on the scout seed and
  stable local seed matrix
- **THEN** planned and final hills are above the predeclared hard-fail band
- **AND** final flat terrain is below the predeclared hard-fail ceiling
- **AND** the proof records broad world-balance failures separately from terrain
  relief proof
