## ADDED Requirements

### Requirement: Studio Effect Recovery Closeout Preserves Proof Labels

MapGen Studio SHALL close the recovery workstream only when packet evidence, review findings, and proof labels are current and non-substituted.

#### Scenario: Closure has no unresolved accepted P1/P2 findings

- **WHEN** the workstream is marked closed
- **THEN** every accepted P1/P2 finding is repaired, rejected with evidence, invalidated by later evidence, or outside the closure claim
- **AND** every scenario row has a final status and proof label

#### Scenario: Product proof is explicitly earned

- **WHEN** product proof is claimed
- **THEN** browser and live proof labels support that claim
- **AND** tests, builds, deploys, logs, or Graphite state alone are not used as product proof
