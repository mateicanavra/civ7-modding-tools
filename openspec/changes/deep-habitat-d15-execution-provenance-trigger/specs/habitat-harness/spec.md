## ADDED Requirements

### Requirement: D15 Execution Provenance Trigger Is Resolved Before Implementation

Habitat SHALL treat shared command-observation substrate adoption as a
packet-local trigger decision, not a default migration, and SHALL require
concrete orchestration states that cannot be represented safely by local
TypeScript DTOs or projections.

#### Scenario: Trigger is not met
- **WHEN** a packet can model command outcomes, failures, cleanup, and receipts
  with local contracts
- **THEN** D15 remains non-implementing and no substrate migration is authorized

#### Scenario: Trigger request is incomplete
- **WHEN** a packet asks for D15 without naming the command family,
  contradictory state, local DTO sufficiency artifact, required command
  observation fields, field-level ownership map, public impact, D0/D1 handling,
  write set, validation gates, and rollback plan
- **THEN** D15 remains dormant

#### Scenario: Local DTO sufficiency is not demonstrated
- **WHEN** a packet asks for D15 using only prose that local DTOs are
  insufficient
- **THEN** D15 remains dormant
- **AND** the packet SHALL publish the attempted local discriminated union,
  typestate, or projection shape; the remaining contradictory state; a negative
  fixture or typed example; the rejected safe TypeScript alternatives; and the
  proposed shared discriminants before D15 can leave `dormant`.

#### Scenario: Trigger is met
- **WHEN** a packet records all trigger request fields and final review accepts
  that local contracts cannot represent required command-observation states
- **THEN** a separate accepted OpenSpec change names the substrate decision,
  public impact, owner boundary, concrete D0 compatibility rows, D1
  output-family/non-claim handling, validation gates, and migration plan before
  implementation

#### Scenario: Complete trigger request is rejected
- **WHEN** final review accepts that a complete trigger request can be represented
  by local DTOs/projections
- **THEN** D15 returns to `dormant`
- **AND** no shared command-observation substrate owner packet is created

#### Scenario: Accepted upstream packets are sufficient
- **WHEN** D6, D7, D9, D11, or G-HOST can represent command observations through
  their accepted local DTOs/projections
- **THEN** D15 remains dormant
- **AND** those packets SHALL NOT introduce shared command-observation substrate
  work.
