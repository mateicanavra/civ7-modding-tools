## ADDED Requirements

### Requirement: Lake Truth Waits For Adapter Materialization

The lake projection change SHALL provide or cite adapter lake stamping/readback
before enabling fail-hard parity for Hydrology lake intent.

#### Scenario: Lake parity is enforced
- **WHEN** a lake parity gate fails the pipeline on drift
- **THEN** adapter materialization and readback for the planned lake mask are
  already implemented and tested
- **AND** the gate compares planned truth to observed projection evidence

### Requirement: Engine Lake Generation Is Replaced By Stamping

The lake projection change SHALL stamp Hydrology lake intent through an
adapter capability instead of calling Civ7 engine lake generation from the
standard recipe.

#### Scenario: map-hydrology projects lake intent
- **WHEN** `map-hydrology/lakes` materializes lakes
- **THEN** it calls `stampLakes(...)` with `artifact:hydrology.lakePlan`
- **AND** it does not call `generateLakes(...)`
- **AND** rejected/stamped lake masks are recorded as projection evidence

### Requirement: Placement Lake Inputs Move After Lake Readback

Placement SHALL consume Hydrology lake truth only after lake intent can be
materialized and read back.

#### Scenario: Placement lake inputs are migrated
- **WHEN** placement input derivation stops consuming projection lake
  diagnostics
- **THEN** Hydrology lake intent has an adapter materialization/readback path
- **AND** the change does not split unrelated placement products
