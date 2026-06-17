## ADDED Requirements

### Requirement: Studio Browser Scenario Evidence Exercises Rendered State

MapGen Studio SHALL distinguish rendered browser scenario evidence from API-only and server-only proof.

#### Scenario: Reported user flow is exercised in the shell

- **WHEN** a browser scenario packet claims setup or Run in Game proof
- **THEN** the evidence includes rendered Studio shell behavior, user-visible diagnostics, and recovery affordances
- **AND** the claim does not infer browser behavior from server tests alone
