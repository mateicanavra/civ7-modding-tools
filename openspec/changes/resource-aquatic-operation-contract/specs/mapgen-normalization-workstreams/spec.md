## ADDED Requirements

### Requirement: Aquatic Resource Operation Preserves Per-Resource Coverage

The resource distribution workstream SHALL expose a symbolic aquatic resource
planning operation before aquatic resources claim distribution coverage.

#### Scenario: All aquatic expectation rows are planned
- **WHEN** the aquatic planning op receives the six aquatic earthlike
  expectation rows
- **THEN** it emits one planning row each for `RESOURCE_FISH`,
  `RESOURCE_PEARLS`, `RESOURCE_WHALES`, `RESOURCE_CRABS`, `RESOURCE_COWRIE`,
  and `RESOURCE_TURTLES`
- **AND** every row preserves the `resourceType`, expected count range,
  condition multipliers, proxy requirements, caveats, and
  `runtimeIdStatus = "unverified"`
- **AND** no output row contains runtime numeric id fields

#### Scenario: Missing rows are visible
- **WHEN** an aquatic expectation row is absent
- **THEN** the operation emits a `missing-expectation` row for that resource
- **AND** the resource appears in `missingResourceTypes`
- **AND** the operation does not silently satisfy group coverage by omitting
  the resource

### Requirement: Aquatic Resource Operation Keeps Runtime Boundary

The aquatic resource operation SHALL remain a symbolic planning contract and
not a placement materializer.

#### Scenario: No placement behavior changes
- **WHEN** the aquatic operation is added
- **THEN** the existing `placement/ops/plan-resources` behavior is unchanged
- **AND** the new operation does not import adapter runtime modules or
  `ResourceBuilder`
- **AND** the operation does not emit `resourceId`, `numericId`,
  `preferredResourceType`, or tile-level resource placement intents

#### Scenario: Closure remains warning-only
- **WHEN** the operation compares planned target counts to earthlike ranges
- **THEN** its proof status remains `warning-only`
- **AND** inferred earthlike ranges are not promoted to hard count gates
  without runtime-calibrated telemetry

### Requirement: Crabs Preserve Navigable-River Eligibility

The aquatic resource operation SHALL preserve `RESOURCE_CRABS` river-adjacent
eligibility rather than collapsing the group to coast-only logic.

#### Scenario: Navigable-river proxy is retained
- **WHEN** `RESOURCE_CRABS` is planned
- **THEN** its row includes the navigable-river mouth or floodplain proxy
  requirement from the expectation artifact
- **AND** the operation can use a navigable-river-mouth signal field as an
  eligibility source for crabs
