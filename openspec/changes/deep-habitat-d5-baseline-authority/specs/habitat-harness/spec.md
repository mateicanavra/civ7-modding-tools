## ADDED Requirements

### Requirement: D5 Baseline Authority Is Resolved Before Implementation

Habitat baselines SHALL be an explicit structural-debt authority with shrink-only default behavior, typed owner/rule relations, and refusal of accidental expansion.

#### Scenario: Existing debt is checked
- **WHEN** a violation matches an accepted baseline row
- **THEN** Habitat reports the baseline decision with owner and rule relation

#### Scenario: New debt appears
- **WHEN** a violation is not covered by an accepted baseline row
- **THEN** Habitat refuses silent expansion and reports the owning remediation path
