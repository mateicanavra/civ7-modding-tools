## ADDED Requirements

### Requirement: Starts And Discoveries Acceptance Has Live Readback Proof

Starts and discoveries acceptance SHALL use same-run diagnostics and live
readback or an explicit readback-surface gap before claiming product closure.

#### Scenario: Start viability is evaluated
- **WHEN** a start viability row is evaluated
- **THEN** the row cites generated map diagnostics, exact-authorship proof, and
  live readback or a classified readback limitation

#### Scenario: Readback surface is missing
- **WHEN** current package reads cannot observe the start or discovery surface
  required for proof
- **THEN** the workstream adds a package-owned readback wrapper before claiming
  acceptance
- **AND** it does not use caller-local scripts as the proof surface
