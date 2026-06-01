## ADDED Requirements

### Requirement: Resource Expectations Cover Official Resource Corpus

The resource distribution workstream SHALL define earthlike expectation rows for
every official resource before resource operations claim per-resource coverage.

#### Scenario: Every corpus row has an expectation disposition
- **WHEN** the 55-row official resource corpus is converted into expectations
- **THEN** every `artifact:resources.corpus` resource symbol appears exactly
  once in the expectation contract
- **AND** each expectation row records a status of `expected`, `conditional`,
  or `blocked`
- **AND** blocked rows remain visible rather than being dropped from coverage
- **AND** `expected` status is allowed only for corpus rows whose
  `strategyRequired.status` is `required`
- **AND** corpus-blocked rows remain `blocked` until source-backed placement
  evidence changes their disposition

#### Scenario: Resource groups preserve complete coverage
- **WHEN** resource expectation groups are defined
- **THEN** the groups cover all 55 official resources exactly once
- **AND** `FEATURE_LOTUS` and any other non-resource feature is excluded from
  the resource expectation corpus

### Requirement: Resource Expectations Define Earthlike Placement Envelopes

The resource distribution workstream SHALL define source-backed or
inference-backed earthlike placement envelopes before implementing
per-resource operations.

#### Scenario: Expected resources carry operation obligations
- **WHEN** a resource expectation row has status `expected`
- **THEN** it records an earthlike placement predicate
- **AND** it records a standard earthlike expected count range with
  per-resource `min`, `target`, and `max`
- **AND** it records condition multipliers that explain how map size and
  relevant terrain, biome, coast, river, latitude, relief, or age conditions
  adjust the range
- **AND** it records the stats proof required for later operation slices
- **AND** any derived ecological or geologic predicate names the concrete map
  field or proxy needed to implement and test it
- **AND** missing proxies are recorded as open proof needs instead of silent
  implementation assumptions
- **AND** hard closure gates are not promoted from inferred ranges until
  seed-matrix or in-game telemetry calibrates them against eligible-tile
  denominators

#### Scenario: Evidence strength is explicit
- **WHEN** a resource expectation row records legality, habitat, range, or
  proof claims
- **THEN** each claim identifies its evidence strength as `official`,
  `external`, `inferred`, or `runtime-calibrated`
- **AND** runtime-calibrated claims cite generated-map or in-game telemetry

#### Scenario: Groups are non-gating rollups
- **WHEN** resource expectation groups are used for operation design
- **THEN** each group is treated as a research and implementation rollup
- **AND** closure gates remain per-resource rather than group-aggregate
- **AND** every `resourceType` row owns its own predicate, range, evidence
  strength, gate status, and stats proof

#### Scenario: Official placement lanes are preserved
- **WHEN** a resource row has official placement flags or type tags
- **THEN** the expectation row carries those facts forward
- **AND** `RESOURCE_CRABS` keeps its navigable-river eligibility visible rather
  than becoming coast-only through group assignment

#### Scenario: Ranges preserve evidence strength
- **WHEN** an expected count range is recorded
- **THEN** the row identifies whether the range is `source-backed` or
  `inference-backed`, or whether it has become `runtime-calibrated`
- **AND** inference-backed ranges name the inference rule that produced them
- **AND** the contract does not present inferred ranges as exact real-world
  prevalence

### Requirement: Resource Expectations Preserve Runtime ID Boundary

The resource expectation contract SHALL not convert static official resource
symbols into runtime numeric id claims.

#### Scenario: Runtime ids remain unverified
- **WHEN** resource expectations are recorded before runtime proof exists
- **THEN** expectation rows reference official resource symbols and static
  corpus slots only
- **AND** they do not assign or verify `GameInfo.Resources` numeric ids
- **AND** adapter numeric placement diagnostics are not labeled with resource
  symbols through the expectation contract
