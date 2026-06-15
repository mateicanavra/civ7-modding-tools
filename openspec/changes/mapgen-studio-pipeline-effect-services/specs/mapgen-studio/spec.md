## ADDED Requirements

### Requirement: Studio Workflow Pipelines Are Package-Owned Effect Services

D5 SHALL move Run in Game, Save/Deploy, and Autoplay orchestration into `@civ7/studio-server` Effect workflow services.

#### Scenario: Workflows consume the operation runtime

- **WHEN** Run in Game, Save/Deploy, or Autoplay starts
- **THEN** the procedure resolves a package-owned workflow service from the managed runtime
- **AND** admission, conflicts, registry updates, current projection, events, TTL, and disposal flow through `StudioOperationRuntime`
- **AND** app-host engine callbacks do not own workflow lifecycle, phase transitions, failures, registries, queues, or background workers

#### Scenario: Workflow services own domain phases

- **WHEN** a workflow moves through materializing, saving, deploying, restarting, setup, start, proof, rollback, complete, failed, blocked, or uncertain states
- **THEN** the workflow emits typed transition commands to `StudioOperationRuntime`
- **AND** public DTOs are projections from D4/D2.5 state rather than workflow-local public-shape mutation stores

### Requirement: Run In Game Workflow Preserves Product Proof Boundaries

D5 SHALL preserve the Run in Game success and failure semantics while moving orchestration into Effect.

#### Scenario: Run in Game proves materialization before launch

- **WHEN** Run in Game materializes and deploys a map config
- **THEN** the workflow proves generated source script identity, local mod script identity, deployed mod script identity when available, required marker content, and current request-id embed before Civ launch
- **AND** missing marker or request-id proof fails with a D3 typed `MaterializationFailed` or `ProofFailed` outcome

#### Scenario: Run in Game starts from setup and proves runtime completion

- **WHEN** Civ7 is ready and setup row visibility has been proven
- **THEN** the workflow starts the configured single-player game through the sanctioned game-wire service
- **AND** it waits for fresh `[mapgen-proof]` and `[mapgen-complete]` log markers matching request id, config hash, envelope hash, and seed
- **AND** it builds exact authorship proof before completing the operation

#### Scenario: Run in Game cleanup is deterministic

- **WHEN** disposable materialization is used
- **THEN** cleanup restores or removes the repo config through `MapConfigStore`
- **AND** source artifacts are regenerated through `DeployRunner`
- **AND** cleanup failure is typed or defect-contained according to D3/D4 ownership, not silently swallowed as success

### Requirement: Save Deploy Workflow Preserves Save, Deploy, And Rollback Semantics

D5 SHALL move Save/Deploy orchestration into an Effect workflow service with explicit rollback behavior.

#### Scenario: Save Deploy path jail is enforced

- **WHEN** a Save/Deploy request names a target source path
- **THEN** the path resolves under `mods/mod-swooper-maps/src/maps/configs`
- **AND** the target ends in `.config.json`
- **AND** path-jail failure is a typed D3 `InvalidRequest`

#### Scenario: Save Deploy rolls back deploy-phase failure

- **GIVEN** Save/Deploy has written the target config
- **WHEN** deploy fails
- **THEN** the workflow restores the previous file content or deletes the new file
- **AND** rollback failure is captured as typed deploy/rollback diagnostics
- **AND** the operation completes as failed, not partially successful

#### Scenario: Save Deploy preserves same-request idempotency

- **GIVEN** a Save/Deploy operation is active for a request id
- **WHEN** Save/Deploy starts again with the same request id
- **THEN** the workflow returns the existing runtime projection
- **AND** it does not start a second file write, deploy worker, or rollback owner
- **AND** a different active request id is reported as a typed D3 `OperationBlocked`

#### Scenario: Save Deploy does not own Civ lifecycle

- **WHEN** a Save/Deploy request includes restart or verifyRestart intent
- **THEN** the workflow rejects it with typed invalid-request data
- **AND** it does not restart Civ7 or route through Run in Game recovery behavior

### Requirement: Autoplay Is A Typed Workflow Command

D5 SHALL implement Autoplay as a typed workflow command behind `StudioOperationRuntime`.

#### Scenario: Autoplay uses shared mutation gate and typed failures

- **WHEN** Autoplay starts or stops
- **THEN** it is admitted through the D4 mutation gate
- **AND** active Run in Game or Save/Deploy conflicts map to D3 `OperationBlocked`
- **AND** direct-control unavailable, start failed, stop failed, and verification failed outcomes map to their D3 Autoplay failure variants

### Requirement: Studio Game-Wire Calls Use Sanctioned Session Ownership

D5 SHALL route Studio workflow game calls through the daemon runtime's shared `Civ7TunerSession`.

#### Scenario: Workflows use shared session service

- **WHEN** Run in Game checks playable status, ensures setup row visibility, starts a game, or Autoplay starts/stops
- **THEN** the call is made through a package-owned workflow control service backed by `Civ7TunerSession`
- **AND** workflow/app/router code does not construct `Civ7DirectControlSession`
- **AND** workflow/app/router code does not call `withCiv7DirectControlSession`

#### Scenario: Public routes reject raw control tunnels

- **WHEN** public Studio or control-oRPC mutation inputs in the D5 corpus are validated
- **THEN** executable raw fields such as `command`, `operationType`, `rawCommand`, `script`, `javascript`, `rawJs`, `session`, `context`, `stateName`, or generic executable `args` tunnel fields are rejected or absent
- **AND** `runInGame.start` is closed through D2.5 TypeBox schemas rather than an open caller-owned config tunnel
- **AND** direct-control procedure descriptors preserve validator-first, send-receipt, post-read proof, no-repeat-after-unverified, and context-owned-input exclusion metadata

#### Scenario: D12 receives game-door evidence

- **WHEN** D5 implementation closes
- **THEN** it records the final allowed session constructor owners, workflow game-call routing, raw-field search classification, direct-control metadata proof, and live Play/SaveDeploy proof pointers for D12

### Requirement: App Host Is Composition And Port Implementation Only

D5 SHALL remove app-hosted workflow authority from the package context seam.

#### Scenario: Context seam exposes services and ports, not engines

- **WHEN** the Studio daemon composes the RPC handler
- **THEN** app code supplies env/config/ports and concrete adapters
- **AND** `StudioServerContext` no longer exposes mutation lifecycle engine callbacks for Run in Game, Save/Deploy, Autoplay, or operations-current workflow truth
- **AND** any remaining `createStudioEngines` code is composition-only and owns no workflow control flow
