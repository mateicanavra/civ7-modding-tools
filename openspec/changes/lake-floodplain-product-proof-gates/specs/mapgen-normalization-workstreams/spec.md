## ADDED Requirements

### Requirement: Lake And Floodplain Product Gates Require Active Exact Evidence

Lake and floodplain product acceptance SHALL require exact, active evidence
rather than stale counters, missing logs, or inactive zero-count rows.

#### Scenario: Lake readback is claimed
- **WHEN** accepted lakes are claimed to survive final placement
- **THEN** exact proof includes accepted lake count, final water drift, and final
  classification drift
- **AND** missing exact counters keep lake proof unresolved

#### Scenario: Floodplain row is claimed
- **WHEN** floodplain product visibility is claimed
- **THEN** the proof uses an active floodplain-producing seed
- **AND** live readback includes nonzero floodplain-family features

### Requirement: River Lake Product Closure Uses A Scenario Matrix

River/lake product closure SHALL require a scenario matrix with proof labels and
reviewer disposition for normal, holdout, contrast, floodplain-active, and
no-signal cases.

#### Scenario: Product closure is requested
- **WHEN** an agent requests product closure for rivers/lakes
- **THEN** every scenario row has pass, fail, or scoped-out disposition
- **AND** no technical subclaim substitutes for rendered visibility or product
  acceptance
