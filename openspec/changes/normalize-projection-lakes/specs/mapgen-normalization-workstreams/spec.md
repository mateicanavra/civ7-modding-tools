## ADDED Requirements

### Requirement: Lake Truth Waits For Adapter Materialization

The lake projection change SHALL provide or cite adapter lake stamping/readback
before enabling fail-hard parity for Hydrology lake intent.

#### Scenario: Lake parity is enforced
- **WHEN** a lake parity gate fails the pipeline on drift
- **THEN** adapter materialization and readback for the planned lake mask are
  already implemented and tested
- **AND** the gate compares planned truth to observed projection evidence

### Requirement: Engine Lake Generation Is Labeled Projection Until Replaced

The lake projection change SHALL label engine-generated lake behavior as
projection or diagnostic behavior until Hydrology intent is stamped and read
back.

#### Scenario: map-hydrology still calls engine lake generation
- **WHEN** engine lake generation remains in use during the migration
- **THEN** docs and artifacts do not call that output deterministic Hydrology
  truth
- **AND** placement does not consume it as final lake intent

### Requirement: Placement Lake Inputs Move After Lake Readback

Placement SHALL consume Hydrology lake truth only after lake intent can be
materialized and read back.

#### Scenario: Placement lake inputs are migrated
- **WHEN** placement input derivation stops consuming projection lake
  diagnostics
- **THEN** Hydrology lake intent has an adapter materialization/readback path
- **AND** the change does not split unrelated placement products
