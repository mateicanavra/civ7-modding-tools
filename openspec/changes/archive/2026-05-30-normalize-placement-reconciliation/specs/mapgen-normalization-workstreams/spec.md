## ADDED Requirements

### Requirement: Resource And Discovery Reconciliation Uses Typed Outcomes

Resource and discovery placement SHALL reconcile planned intent against typed
projection outcomes instead of comparing total planned and placed counts.

#### Scenario: Engine rejects a planned resource or discovery
- **WHEN** the engine does not place a planned resource or discovery
- **THEN** the reconciliation records a typed rejection reason
- **AND** the pipeline fails only if the rejection is untyped, unexplained, or
  contradicts the planned type/location contract

### Requirement: Official Generator Output Is Not Silent Truth

The reconciliation change SHALL update authority records when official
generator output is no longer accepted as silent placement truth.

#### Scenario: Docs still call official generator output authoritative
- **WHEN** implementation owns typed placement intent and reconciliation
- **THEN** docs, ADRs, or deferrals that describe best-effort official
  generator output as accepted truth are updated or superseded
