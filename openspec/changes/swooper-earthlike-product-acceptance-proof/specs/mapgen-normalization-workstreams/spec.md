## ADDED Requirements

### Requirement: Earthlike Product Acceptance Uses Same-Run Evidence

Swooper Earthlike product acceptance SHALL pair Studio-visible state,
diagnostics, exact-authorship proof, live readback or classified deltas, and
review disposition for the same seed/config runs.

#### Scenario: Acceptance row is evaluated
- **WHEN** a mountain, river, floodplain, resource, wonder, start, ecology,
  coast, archipelago, or Studio visualization row is evaluated
- **THEN** the row cites same-run evidence
- **AND** it records pass, fail, blocked, or reclassified status with proof
  class labels

#### Scenario: Acceptance row fails
- **WHEN** an acceptance row fails with current exact proof
- **THEN** the recovery lane opens or activates a targeted repair workstream
- **AND** it does not tune from screenshots or numeric tests alone
