## ADDED Requirements

### Requirement: Dev Deploy Does Not Restart The Daemon

In Studio dev mode, Play and Save&Deploy SHALL NOT mutate files in the daemon's watched import graph during their own deploy phase. The daemon may restart for developer source edits, but operation-time build/deploy output writes MUST stay outside the daemon import graph so daemon-owned operation state survives until terminal status.

#### Scenario: Recipe DAG imports contract-only source stage data

- **WHEN** the daemon constructs the recipe-DAG service
- **THEN** it imports Swooper recipe stage contracts from the package-owned Studio contract entrypoint under `mods/mod-swooper-maps/src/recipes/studio-contracts/**`
- **AND** that contract entrypoint exports only recipe ids, stage order, TypeBox schemas, public authoring metadata, and artifact metadata needed by Studio recipe-DAG views
- **AND** it does not import `mod-swooper-maps/recipes/*` package exports, generated files under `mods/mod-swooper-maps/dist/**`, deployable mod files under `mods/mod-swooper-maps/mod/**`, generated map files under `mods/mod-swooper-maps/src/maps/generated/**`, full recipe runtime modules, or recipe default constructors

#### Scenario: Daemon import graph is disjoint from deploy writes

- **WHEN** D1 traces the transitive daemon import graph from daemon entrypoints and daemon-owned service entrypoints
- **AND** it records the operation deploy write-set for the accepted mod package build target
- **THEN** no path in the daemon import graph is under the operation-written output roots `mods/mod-swooper-maps/dist/**`, `mods/mod-swooper-maps/mod/**`, or `mods/mod-swooper-maps/src/maps/generated/**`
- **AND** the proof fails if a daemon import reaches those roots directly or transitively

#### Scenario: Operation deploy uses the mod package build target

- **WHEN** Play or Save&Deploy builds the Swooper Maps mod during a Studio dev operation
- **THEN** the build command is `bun run nx run mod-swooper-maps:build:studio-deploy --outputStyle=static` through the repo-local accepted Nx/Habitat baseline
- **AND** it does not run broad root build orchestration, the broad mod package build target, generated recipe targets, Turbo commands, global-only/on-the-fly Nx commands, direct binary Nx commands, shimmed Nx commands, or dual-path command selection while the daemon process owns an active operation

#### Scenario: Deploy output writes preserve daemon identity

- **WHEN** a developer starts Play or Save&Deploy in Studio dev mode
- **THEN** `/rpc` status samples for the same operation id record accepted, deploy-entered, deploy-exited, and terminal phases
- **AND** the daemon `serverInstanceId` observed before deploy remains the daemon `serverInstanceId` during every sample
- **AND** the deploy command and log pointer for that operation are recorded
- **AND** the operation registry still reports the same active operation until it reaches terminal status
- **AND** browser persistence, daemon restart recovery, or a second accepted operation id cannot satisfy the proof

### Requirement: Watch-Graph Isolation Is A Source Boundary

The isolation SHALL be enforced by source/import ownership first and watcher ignores second. Watch-ignore rules MAY protect deploy-written output paths from frontend dev churn, but they MUST NOT be the primary mechanism that keeps generated recipe artifacts out of the daemon import graph.

#### Scenario: Watch ignores are not the source of truth

- **WHEN** deploy-written mod output paths are listed in frontend watch-ignore configuration
- **THEN** tests still prove the daemon import graph avoids operation-written output roots directly and transitively
- **AND** removing a watch-ignore entry would not make the daemon import generated recipe artifacts, generated map outputs, or deployable mod outputs
