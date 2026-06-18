## ADDED Requirements

### Requirement: Host Policy Boundary Gate Is Resolved Before Implementation

Habitat host-specific policy SHALL be declared at an explicit host boundary before generic Habitat commands enforce protected paths, generated zones, or host-specific refusal behavior.

#### Scenario: Host policy applies
- **WHEN** a path belongs to a host-specific protected or generated surface
- **THEN** Habitat reports the host policy owner and generic command implication

#### Scenario: Host policy is absent
- **WHEN** generic Habitat cannot identify a host declaration for host-specific behavior
- **THEN** Habitat refuses to claim generic enforcement and points to host-policy authoring
