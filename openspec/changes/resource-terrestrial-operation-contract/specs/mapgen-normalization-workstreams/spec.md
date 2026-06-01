## ADDED Requirements

### Requirement: Terrestrial Resource Operation Preserves Per-Resource Coverage

The resource distribution workstream SHALL expose a symbolic terrestrial
resource planning operation before terrestrial resources claim distribution
coverage.

#### Scenario: All terrestrial expectation rows are planned
- **WHEN** the terrestrial planning op receives the terrestrial earthlike
  expectation rows
- **THEN** it emits one planning row each for the 11
  `terrestrial-animal-forest-wild` resources
- **AND** every row preserves the `resourceType`, lane id, expected count
  range, condition multipliers, proxy requirements, caveats, and
  `runtimeIdStatus = "unverified"`
- **AND** no output row contains runtime numeric id fields

#### Scenario: Missing rows are visible
- **WHEN** a terrestrial expectation row is absent
- **THEN** the operation emits a `missing-expectation` row for that resource
- **AND** the resource appears in `missingResourceTypes`
- **AND** the operation does not silently satisfy group coverage by omitting
  the resource

### Requirement: Terrestrial Resource Operation Keeps Runtime Boundary

The terrestrial resource operation SHALL remain a symbolic planning contract and
not a placement materializer.

#### Scenario: No placement behavior changes
- **WHEN** the terrestrial operation is added
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

### Requirement: Terrestrial Resource Operation Preserves Edge Proxies

The terrestrial resource operation SHALL preserve the group's non-generic proxy
families as visible signal fields.

#### Scenario: Woodland and highland proxies survive planning
- **WHEN** `RESOURCE_TRUFFLES` is planned
- **THEN** its row can use a woodland or host-tree signal field
- **AND** the woodland or host-tree proxy requirement remains visible
- **WHEN** `RESOURCE_LLAMAS` is planned
- **THEN** its row can use a tropical highland signal field
- **AND** the tropical hill or highland candidate histogram requirement remains
  visible

#### Scenario: Hardwood caveat survives planning
- **WHEN** `RESOURCE_HARDWOOD` is planned
- **THEN** its row preserves the caveat that temperate forests must not be
  broadened into eligibility without official or runtime proof

#### Scenario: Proxy broadening is blocked for narrow rows
- **WHEN** `RESOURCE_TRUFFLES` is planned
- **THEN** generic grass or tundra masks do not satisfy its woodland-host proxy
- **WHEN** `RESOURCE_LLAMAS` is planned
- **THEN** generic highland masks do not satisfy its tropical highland proxy
- **WHEN** `RESOURCE_IVORY` is planned
- **THEN** broad tropical forest masks do not satisfy its savanna or forest-edge
  proxy
