## ADDED Requirements

### Requirement: D4 Orientation And Routing Is Resolved Before Implementation

Habitat orientation SHALL explain path or diff ownership, supported actions, refusals, and next safe commands from typed rule and graph facts rather than from current module placement alone.

#### Scenario: Supported path is classified
- **WHEN** a supported repo path is classified
- **THEN** Habitat reports owner, relevant checks, supported next actions, and command guidance backed by current metadata

#### Scenario: Unsupported path is classified
- **WHEN** a path is outside supported Habitat scenarios
- **THEN** Habitat returns a refusal reason and recovery guidance rather than generic or speculative commands
