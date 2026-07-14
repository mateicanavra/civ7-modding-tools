## ADDED Requirements

### Requirement: Studio Dev Startup Proof Separates Process And Runtime State

MapGen Studio SHALL prove dev startup with isolated ports without treating process or port failures as Civ7 runtime failures.

#### Scenario: Isolated dev startup is observed

- **WHEN** Studio starts through `nx run mapgen-studio:dev` with isolated daemon,
  frontend, and RPC target ports
- **THEN** proof records daemon URL, Vite URL, RPC reachability, server identity, and cleanup
- **AND** direct-control or Civ7 unavailability is recorded as separate runtime readiness state

#### Scenario: Startup dirt is classified

- **WHEN** dev startup or related probes change generated-output surfaces
- **THEN** the phase record names the exact artifact owner or restores unrelated generated dirt before closure
