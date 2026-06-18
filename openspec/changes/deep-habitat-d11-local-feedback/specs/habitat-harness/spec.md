## ADDED Requirements

### Requirement: D11 Local Feedback Is Resolved Before Implementation

Habitat hooks SHALL provide local feedback by orchestrating owned checks and guards while explicitly refusing to claim CI, review approval, full verification, or safe-apply completion.

#### Scenario: Hook passes locally
- **WHEN** a local hook completes all configured local checks
- **THEN** Habitat reports local feedback scope and non-claims

#### Scenario: Hook cannot run a required local check
- **WHEN** a local dependency or protected-zone decision is unavailable
- **THEN** Habitat reports blocked local feedback rather than success
