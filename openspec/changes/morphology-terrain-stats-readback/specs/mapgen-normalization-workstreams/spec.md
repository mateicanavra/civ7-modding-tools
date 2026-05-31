## ADDED Requirements

### Requirement: Terrain Relief Diagnostics Separate Roughness Buckets

World-balance terrain relief diagnostics SHALL report planned Morphology
terrain intent separately from final engine-projected terrain readback.

#### Scenario: Planned and final rough terrain are measured
- **WHEN** local world-balance stats are collected for a terrain morphology
  workstream
- **THEN** the stats report planned mountain, planned hill, final mountain, and
  final hill tile counts and shares
- **AND** the stats report connected-component counts and largest-component
  sizes for planned and final mountain and hill masks
- **AND** the stats report rough-terrain shares derived from mountain plus hill
  buckets rather than relying only on final flatland share

#### Scenario: Volcano-stamped mountains are measured separately
- **WHEN** local world-balance stats include volcano planning and final terrain
  projection
- **THEN** the stats report planned volcano counts by tectonic kind
- **AND** the stats report final volcano-feature tiles and final mountain tiles
  carrying volcano features
- **AND** the stats report final non-volcano mountain and non-volcano rough
  shares so volcano stamping cannot hide under-authored ridge or hill terrain

#### Scenario: Current failures remain diagnostic
- **WHEN** the diagnostic test runs before terrain behavior has been tuned
- **THEN** it validates accounting invariants only
- **AND** it does not encode the predeclared future Earthlike success bands as
  passing expectations for the currently failing output
