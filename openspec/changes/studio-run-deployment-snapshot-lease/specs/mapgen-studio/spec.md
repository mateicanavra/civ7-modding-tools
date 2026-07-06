## ADDED Requirements

### Requirement: Run In Game Deployment Is Copy And Snapshot

MapGen Studio SHALL deploy Run in Game by copying a generated mod and recording
the deployed snapshot.

#### Scenario: Deployment succeeds

- **WHEN** Run in Game deployment starts with a generated mod
- **THEN** Studio copies it to deployed mod id `mod-swooper-studio-run`
- **AND** records `RunDeployment` and `DeployedModSnapshot` after the copy
- **AND** public status advances past deployment

### Requirement: Runtime Lease Protects Shared Mod And Civ7 Control

MapGen Studio SHALL use the runtime ownership lease acquired at operation
admission while Run in Game writes or observes the deployed mod and Civ7
setup/start state.

#### Scenario: Save and Deploy races Run in Game

- **WHEN** Save/Deploy attempts a deployed-mod write while Run in Game holds the
  runtime lease
- **THEN** Save/Deploy reports public category `ownership`
- **AND** Run in Game keeps ownership until terminal cleanup completes
