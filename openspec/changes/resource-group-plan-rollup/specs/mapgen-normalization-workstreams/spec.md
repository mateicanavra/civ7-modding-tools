## ADDED Requirements

### Requirement: Resource Group Plans Publish A Rollup Artifact

The resource distribution workstream SHALL expose a symbolic group-plan rollup
before downstream resource intent merge, stats, or runtime proof consumes group
strategy outputs.

#### Scenario: All group plans are rolled up
- **WHEN** the rollup receives aquatic, cultivated, terrestrial, and geological
  group planning outputs
- **THEN** it publishes `artifact:resources.groupPlans`
- **AND** the artifact records one summary row for each of the four resource
  groups
- **AND** each summary row carries its per-resource planning rows
- **AND** the artifact records total resource, planned, blocked, proxy-gap, and
  missing-expectation counts
- **AND** the artifact preserves `runtimeIdStatus = "unverified"` and
  `proofStatus = "warning-only"`

#### Scenario: Missing rows remain visible across groups
- **WHEN** any group plan reports missing expectation rows
- **THEN** the rollup includes those resource types in the group summary and in
  the artifact-level `missingResourceTypes`
- **AND** the rollup does not treat aggregate counts as satisfying coverage

### Requirement: Resource Group Rollup Does Not Materialize Resources

The group-plan rollup SHALL remain a symbolic artifact boundary and not a
placement or adapter step.

#### Scenario: No placement behavior changes
- **WHEN** the rollup operation is added
- **THEN** existing resource placement behavior is unchanged
- **AND** the operation does not import adapter runtime modules or
  `ResourceBuilder`
- **AND** the operation does not emit `resourceId`, `numericId`,
  `preferredResourceType`, or tile-level resource placement intents

### Requirement: Resource Group Rollup Exposes Wiring Errors

The group-plan rollup SHALL preserve group ownership problems as explicit
blockers.

#### Scenario: Duplicate ownership is visible
- **WHEN** a symbolic resource appears in more than one group plan
- **THEN** the rollup reports the duplicate resource type
- **AND** the artifact records a blocker naming the conflicting groups
- **WHEN** a symbolic resource appears more than once inside one group plan
- **THEN** the rollup reports the duplicate resource type
- **AND** the artifact records a blocker naming the repeated group

#### Scenario: Group input is miswired
- **WHEN** a required input field carries a different group id than expected
- **THEN** the rollup records a blocker for the mismatched field and group id
- **AND** the rollup still emits one stable summary for each expected group
  boundary
- **AND** the rollup does not promote the artifact to hard proof
