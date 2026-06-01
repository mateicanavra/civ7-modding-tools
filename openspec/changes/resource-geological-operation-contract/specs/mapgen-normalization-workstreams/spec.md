## ADDED Requirements

### Requirement: Geological Resource Operation Preserves Per-Resource Coverage

The resource distribution workstream SHALL expose a symbolic geological resource
planning operation before geological resources claim distribution coverage.

#### Scenario: All geological expectation rows are planned
- **WHEN** the geological planning op receives the geological earthlike
  expectation rows
- **THEN** it emits one planning row each for the 20
  `geological-mineral-gemstone-industrial` resources
- **AND** every row preserves the `resourceType`, lane id, expected count
  range, condition multipliers, proxy requirements, caveats, and
  `runtimeIdStatus = "unverified"`
- **AND** no output row contains runtime numeric id fields

#### Scenario: Missing rows are visible
- **WHEN** a geological expectation row is absent
- **THEN** the operation emits a `missing-expectation` row for that resource
- **AND** the resource appears in `missingResourceTypes`
- **AND** the operation does not silently satisfy group coverage by omitting
  the resource

### Requirement: Geological Resource Operation Keeps Runtime Boundary

The geological resource operation SHALL remain a symbolic planning contract and
not a placement materializer.

#### Scenario: No placement behavior changes
- **WHEN** the geological operation is added
- **THEN** existing placement resource planning behavior is unchanged
- **AND** the operation does not import adapter runtime modules or
  `ResourceBuilder`
- **AND** the operation does not emit `resourceId`, `numericId`,
  `preferredResourceType`, or tile-level resource placement intents

#### Scenario: Closure remains warning-only
- **WHEN** the operation compares planned target counts to earthlike ranges
- **THEN** its proof status remains `warning-only`
- **AND** inferred earthlike ranges are not promoted to hard count gates
  without runtime-calibrated telemetry

### Requirement: Geological Resource Operation Preserves Strict Proxies

The geological resource operation SHALL preserve non-generic geological proxy
families as visible signal fields.

#### Scenario: Blocked geological rows stay active-zero
- **WHEN** distant-lands gold, distant-lands silver, lapis lazuli, or nickel is
  planned
- **THEN** each row stays visible with `status = "blocked"`
- **AND** each blocked row reports `targetIntentCount = 0`,
  `eligibleTileCount = 0`, and a zero expected range

#### Scenario: Geological source proxies survive planning
- **WHEN** gold, salt, oil, pitch, limestone, tin, or rubies are planned
- **THEN** their rows expose the corresponding geological source signal fields
  and proxy requirements

#### Scenario: Proxy broadening is blocked for narrow rows
- **WHEN** silver is planned
- **THEN** generic hills do not satisfy its source lane without
  tundra/desert-hill exposure or orogenic context
- **WHEN** coal is planned
- **THEN** generic forest or wetland masks do not satisfy its source lane
  without sedimentary or peat-forming basin context
- **WHEN** rubies are planned
- **THEN** generic tropical terrain does not satisfy its source lane without a
  metamorphic, carbonate/marble-hosted, or collision-belt source proxy
- **AND** broad carbonate/limestone signals do not satisfy ruby eligibility
  without a metamorphic or collision-belt source proxy
