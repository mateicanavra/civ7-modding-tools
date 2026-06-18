## ADDED Requirements

### Requirement: D15 Execution Provenance Trigger Is Resolved Before Implementation

Habitat SHALL treat execution provenance substrate adoption as a packet-local trigger decision, not a default migration, and SHALL require concrete orchestration states that cannot be represented safely by simpler local TypeScript contracts.

#### Scenario: Trigger is not met
- **WHEN** a packet can model command outcomes, failures, cleanup, and receipts with simpler local contracts
- **THEN** D15 remains non-implementing and no substrate migration is authorized

#### Scenario: Trigger is met
- **WHEN** a packet proves local contracts cannot represent required orchestration states
- **THEN** a separate accepted OpenSpec change names the substrate decision, public impact, and migration plan before implementation
