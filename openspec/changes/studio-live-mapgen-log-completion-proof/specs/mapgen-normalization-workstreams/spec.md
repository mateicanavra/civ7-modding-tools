## ADDED Requirements

### Requirement: Live Studio launch proof waits for fresh mapgen completion

The live Studio run verifier SHALL prove a fresh Civ7 map generation completion
for the requested seed through `Scripting.log` markers.

#### Scenario: Civ7 launch returns before mapgen completes

- **GIVEN** Studio starts a game through direct control
- **WHEN** the launch request returns
- **THEN** the verifier MUST continue watching the scripting log until a fresh
  completion marker for the requested seed appears
- **AND** fresh mapgen failure markers MUST fail the verifier.
