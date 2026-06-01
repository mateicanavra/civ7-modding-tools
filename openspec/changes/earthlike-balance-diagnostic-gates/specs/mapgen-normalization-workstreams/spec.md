## ADDED Requirements

### Requirement: Earthlike Balance Proof Is Multi-Dimensional

Swooper Earthlike balance proof SHALL measure the terrain, pedology, climate,
hydrology, and ecology dimensions that shape product-visible map quality.

#### Scenario: Earthlike balance is evaluated
- **WHEN** Swooper Earthlike runs across representative seeds
- **THEN** proof includes product-visible metrics for mountain coverage, hill
  coverage, terrain relief, continental elevation-profile shape,
  plains/soil/pedology distribution, humidity/aridity, vegetation-family
  density, reef-family density, and atolls
- **AND** nonzero presence alone is insufficient for a terrain or feature class
  that must visibly define the map

#### Scenario: Continents collapse into smooth elevation bulges
- **WHEN** Earthlike terrain relief is evaluated
- **THEN** proof distinguishes broad coast-to-center elevation gradients from
  punctuated mountain belts, foothills, basins, plains, and eroded relief
- **AND** a continent-shaped elevation bulge without visible relief punctuation
  is treated as a balance failure even if total land and elevation ranges pass

#### Scenario: Hydrology changes affect ecology inputs
- **WHEN** hydrology, wind, current, humidity, or aridity behavior changes
- **THEN** pedology, biome classification, and feature-family outputs are
  re-measured in the same balance proof
- **AND** the change cannot close on lake or pipeline completion evidence alone

### Requirement: Earthlike Config Sources Cannot Drift

Swooper Earthlike config sources SHALL remain aligned for intended Earthlike
strategy and tuning values unless a change explicitly records a product reason
for divergence.

#### Scenario: Earthlike config is changed
- **WHEN** any Earthlike recipe config source changes
- **THEN** tests compare the intended shared posture across shipped map config,
  standard preset config, and Studio default config
- **AND** any intentional divergence is named and verified rather than left as
  silent default drift

### Requirement: Balance Runtime Proof Is Product Evidence

Runtime balance proof SHALL record repeated product-relevant map rolls, not only
successful recipe execution.

#### Scenario: FireTuner restart proof is collected
- **WHEN** FireTuner submits `Network.restartGame()` for balance closure
- **THEN** the evidence includes the submitted command timestamp, the bounded
  MapGeneration log window, recipe completion, Swooper error scan, and the
  balance telemetry for the generated map
- **AND** recipe completion without balance telemetry is only pipeline proof
