## ADDED Requirements

### Requirement: Cultivated Resource Operation Preserves Per-Resource Coverage

The resource distribution workstream SHALL expose a symbolic cultivated resource
planning operation before cultivated resources claim distribution coverage.

#### Scenario: All cultivated expectation rows are planned
- **WHEN** the cultivated planning op receives the cultivated earthlike
  expectation rows
- **THEN** it emits one planning row each for the 18
  `cultivated-plantation-medicinal` resources
- **AND** every row preserves the `resourceType`, expected count range,
  lane id, condition multipliers, proxy requirements, caveats, and
  `runtimeIdStatus = "unverified"`
- **AND** no output row contains runtime numeric id fields

#### Scenario: Missing rows are visible
- **WHEN** a cultivated expectation row is absent
- **THEN** the operation emits a `missing-expectation` row for that resource
- **AND** the resource appears in `missingResourceTypes`
- **AND** the operation does not silently satisfy group coverage by omitting
  the resource

### Requirement: Cultivated Resource Operation Keeps Blocked Rows Visible

The cultivated resource operation SHALL keep blocked cultivated rows visible
instead of dropping them from group coverage.

#### Scenario: Cloves remain active-zero
- **WHEN** `RESOURCE_CLOVES` is planned
- **THEN** its row has status `blocked`
- **AND** its target intent count and eligible tile count are zero
- **AND** its expected count range remains `0/0/0`
- **AND** it is not reported as missing

### Requirement: Cultivated Resource Operation Keeps Runtime Boundary

The cultivated resource operation SHALL remain a symbolic planning contract and
not a placement materializer.

#### Scenario: No placement behavior changes
- **WHEN** the cultivated operation is added
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

### Requirement: Cultivated Resource Operation Preserves Edge Proxies

The cultivated resource operation SHALL preserve the group's non-generic proxy
families as visible signal fields.

#### Scenario: Coastal and highland proxies survive planning
- **WHEN** `RESOURCE_DYES` is planned
- **THEN** its row can use a coastal or marine signal field
- **AND** the marine/coast proxy requirement remains visible
- **WHEN** `RESOURCE_TEA`, `RESOURCE_COFFEE`, or `RESOURCE_QUININE` is planned
- **THEN** its row can use a highland or relief signal field

#### Scenario: Oasis and wetland proxies survive planning
- **WHEN** `RESOURCE_DATES` is planned
- **THEN** its row can use an oasis or desert-water signal field
- **WHEN** `RESOURCE_RICE` is planned
- **THEN** its row can use a wetland, paddy, river, or floodplain signal field
