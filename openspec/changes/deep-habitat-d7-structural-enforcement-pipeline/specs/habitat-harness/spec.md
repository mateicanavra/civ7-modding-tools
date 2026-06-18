## ADDED Requirements

### Requirement: D7 Structural Enforcement Pipeline Is Resolved Before Implementation

Habitat structural enforcement SHALL aggregate typed registry, graph, diagnostic, baseline, and protected-zone decisions into a check result without recomputing adjacent domain authority or reporting unavailable checks as passing.

#### Scenario: All required inputs are available
- **WHEN** Habitat check runs for a supported repo state
- **THEN** the result reports structural pass/fail from consumed domain decisions

#### Scenario: An input authority is unavailable
- **WHEN** registry, graph, diagnostic, baseline, or protected-zone facts cannot be resolved
- **THEN** the check reports blocked or failed state rather than false green
