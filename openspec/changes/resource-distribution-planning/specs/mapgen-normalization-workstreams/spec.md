## ADDED Requirements

### Requirement: Resource Distribution Planning Requires Stage Architecture Review

Resource distribution recovery SHALL treat current `placement/plan-resources`
topology as implementation evidence rather than target authority.

#### Scenario: Resource distribution work is planned
- **WHEN** a resource distribution recovery workstream is drafted
- **THEN** the planning record includes a resource-stage architecture slice
  that evaluates a dedicated resource stage with resource-group steps
- **AND** keeping all resource behavior inside the current placement step is
  allowed only when the architecture slice records a specific blocker

#### Scenario: Resource group steps are proposed
- **WHEN** a resource group is proposed as a stage step
- **THEN** the group names consumed input artifacts, a published output
  artifact, a shared invariant, a downstream consumer, and a verification
  boundary
- **AND** groups that cannot name those fields remain discovery or research
  buckets rather than step candidates

### Requirement: Resource Corpus Proof Separates Static File Order From Runtime IDs

Resource corpus proof SHALL distinguish static official resource file/load order
from runtime `GameInfo.Resources` id order.

#### Scenario: Official resources are cataloged
- **WHEN** resource distribution work cites official resource ids
- **THEN** the corpus records the static official file-order slot separately
  from runtime id verification status
- **AND** runtime id order must be verified, mismatched, or blocked with
  rationale before strategy implementation relies on numeric ids

#### Scenario: Resource strategy coverage is planned
- **WHEN** a resource is added to the strategy coverage matrix
- **THEN** the corpus records valid ages, class and age overrides, official
  placement constraints, placeability status, strategy-required status, and
  rationale
- **AND** resources that are not map-placed are excluded only with explicit
  source evidence and owner disposition

### Requirement: Resource Recovery Closure Requires Per-Resource Evidence

Resource distribution recovery SHALL close on per-resource evidence instead of
aggregate planned or placed counts.

#### Scenario: Local resource stats are evaluated
- **WHEN** local stats are used to support a resource distribution claim
- **THEN** stats include planned, placed, rejected, and mismatch counts grouped
  by resource id, status, and rejection reason
- **AND** aggregate resource counts alone are insufficient for closure

#### Scenario: Runtime resource proof is collected
- **WHEN** game restart and scripting logs are used for runtime proof
- **THEN** evidence includes the submitted restart command, bounded
  MapGeneration log window, map script selection, placement step completion,
  error scan, and resource telemetry for the generated map
- **AND** recipe completion without resource telemetry is only pipeline proof
