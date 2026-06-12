## ADDED Requirements

### Requirement: River Lake Proof Packets Use Labeled Claims

River and lake proof packets SHALL report independent labeled proof claims for
authorship, hydrology truth, projection, terrain readback, metadata readback,
Studio visibility, Civ rendered visibility, lakes, floodplains, and product
acceptance.

#### Scenario: Terrain readback passes while metadata diverges
- **WHEN** projected navigable terrain equals live `TERRAIN_NAVIGABLE_RIVER`
  terrain but Civ river metadata reports no river
- **THEN** the `terrain-readback` claim is `pass`
- **AND** the `metadata-readback` claim is `fail` or `out-of-scope` with a
  reason
- **AND** `product-acceptance` remains unresolved unless metadata is explicitly
  outside the accepted product claim

#### Scenario: Exact authorship passes before visual proof
- **WHEN** a Studio run is exactly tied to a live Civ session but no screenshot
  or visible-state verdict exists
- **THEN** `exact-authorship` MAY be `pass`
- **AND** `civ-rendered` MUST remain unresolved
- **AND** product closure MUST remain blocked
