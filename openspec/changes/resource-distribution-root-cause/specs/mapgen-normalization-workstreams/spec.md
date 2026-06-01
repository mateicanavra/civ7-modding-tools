## ADDED Requirements

### Requirement: Resource Root-Cause Diagnostics Expose Per-Resource Outcomes

Resource placement diagnostics SHALL expose planned, placed, and rejected
outcomes grouped by adapter numeric resource id and by typed rejection reason
without changing placement strategy behavior. The artifact schema SHALL retain
mismatch fields for typed reconciliation, but resource mismatches remain
fail-hard and abort before a mismatched artifact is published.

#### Scenario: Resource intents are materialized
- **WHEN** deterministic resource intents are passed to the adapter
- **THEN** the resource placement outcome artifact records aggregate
  planned/placed/rejected/mismatch counts
- **AND** it records the same counts grouped by adapter numeric `resourceType`
- **AND** it records rejection reasons grouped by reason
- **AND** it preserves raw per-intent outcomes for detailed inspection

#### Scenario: Resource readback mismatches the intent
- **WHEN** adapter readback reports a different resource type than the planned
  intent
- **THEN** placement fails hard before publishing a misleading success artifact
- **AND** mismatch fields remain part of the diagnostic schema for the typed
  reconciliation contract

#### Scenario: World-balance stats are collected
- **WHEN** world-balance stats run a shipped map identity or representative seed
- **THEN** stats include the resource outcome summary fields from the placement
  artifact
- **AND** stats tests verify internal consistency of aggregate, by-resource, and
  by-reason totals
- **AND** aggregate placement success alone is not treated as resource balance
  closure

#### Scenario: Numeric resource ids are interpreted
- **WHEN** diagnostics report `resourceType` values
- **THEN** those values are labeled as adapter/runtime numeric ids
- **AND** the diagnostics do not claim a verified official resource name until a
  runtime `GameInfo.Resources` id verification slice proves the mapping
