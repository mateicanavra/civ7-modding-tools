## ADDED Requirements

### Requirement: Dev Deploy Does Not Restart The Daemon

In the Studio two-process dev topology, Play and Save&Deploy SHALL NOT mutate
files in the Bun daemon's watched import graph during their own deploy phase.
The daemon may hot-restart for developer source edits, but operation-time mod
build/deploy output writes must stay outside the daemon import graph so the
daemon-owned operation registry survives until the operation reaches a terminal
status.

#### Scenario: Recipe DAG does not import deploy-written recipe dist

- **WHEN** the daemon constructs the recipe-DAG service
- **THEN** it imports Swooper recipe stage contracts from source files under
  `mods/mod-swooper-maps/src/recipes/**`
- **AND** it does not import `mod-swooper-maps/recipes/*` package exports that
  resolve to `mods/mod-swooper-maps/dist/recipes/**`

#### Scenario: Operation deploy avoids dependency output replay

- **WHEN** Play or Save&Deploy builds the Swooper Maps mod during a Studio dev
  operation
- **THEN** the build command runs the `mod-swooper-maps` build task only
- **AND** it does not run or replay dependency build outputs while the daemon
  process owns the active operation

#### Scenario: Deploy output writes preserve daemon identity

- **WHEN** a developer starts Play or Save&Deploy in Studio dev mode
- **THEN** the daemon `serverInstanceId` observed before deploy remains the
  daemon `serverInstanceId` after deploy
- **AND** the operation registry still reports the active operation until it
  reaches a terminal status
