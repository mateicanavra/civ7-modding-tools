## ADDED Requirements

### Requirement: Studio Dev Uses Nx Continuous Task Orchestration

MapGen Studio SHALL use Nx as the owner of local dev backend/frontend
orchestration.

#### Scenario: Nx baseline is required

- **WHEN** D11 implementation begins
- **THEN** the selected worktree proves the accepted Nx/Habitat baseline with
  repo-local Nx and Habitat/classification commands
- **AND** a pre-Nx checkout blocks D11 implementation closure instead of
  introducing a parallel Turbo or app-supervisor path

#### Scenario: Backend serve is continuous

- **WHEN** Nx project metadata for `mapgen-studio` is inspected
- **THEN** the backend daemon serve target is marked continuous
- **AND** the target starts exactly one daemon backend entrypoint
- **AND** the daemon entrypoint does not start `bun --watch`

#### Scenario: Frontend dev depends on backend serve

- **WHEN** the `mapgen-studio:dev` target graph is inspected
- **THEN** frontend dev depends on the backend serve target
- **AND** generated/build prerequisites required by Studio are represented as
  Nx dependencies or workspace-watch ownership
- **AND** Vite proxies `/rpc` to the backend target without owning backend
  lifecycle

### Requirement: App-Local Dev Supervision Is Deleted

MapGen Studio SHALL remove app-local child-process supervision from the dev
path.

#### Scenario: DevLive supervisor is absent from active dev path

- **WHEN** D11 implementation is complete
- **THEN** root `dev:mapgen-studio` routes through repo-local Nx
- **AND** app `dev` scripts do not call `bun src/server/daemon/devLive.ts`
- **AND** no active dev command starts both daemon and Vite through an app-local
  child-process supervisor
- **AND** `apps/mapgen-studio/src/server/daemon/devLive.ts` no longer exists as
  an active dev-supervisor file

#### Scenario: Daemon does not watch itself

- **WHEN** Studio dev is running under Nx
- **THEN** no daemon-launched child process command includes
  `bun --watch src/server/daemon/daemon.ts`
- **AND** the visible process tree contains Nx-owned backend and frontend
  processes rather than a nested app supervisor

### Requirement: Dev Operations Preserve Daemon Identity

MapGen Studio SHALL preserve daemon identity for Play and Save&Deploy while
running under Nx dev orchestration.

#### Scenario: Play keeps server identity stable

- **WHEN** Play runs while `mapgen-studio:dev` is active
- **THEN** accepted, deploy-entered, deploy-exited, and terminal operation
  samples keep the same `serverInstanceId`
- **AND** proof records branch, commit, operation id, command/API path,
  timestamps, and log pointers
- **AND** operation completion is not explained by daemon restart recovery,
  browser reload, or operation adoption after a new daemon starts

#### Scenario: Save and Deploy keeps server identity stable

- **WHEN** Save&Deploy runs while `mapgen-studio:dev` is active
- **THEN** accepted, deploy-entered, deploy-exited, and terminal operation
  samples keep the same `serverInstanceId`
- **AND** proof records branch, commit, operation id, command/API path,
  timestamps, and log pointers
- **AND** deploy/build writes do not restart the daemon
- **AND** D1 import-graph/write-set isolation remains true

#### Scenario: Live Civ7 is unavailable for proof

- **WHEN** D11 implementation cannot access live Civ7
- **THEN** D11 implementation closure is not green for live operation behavior
- **AND** `workstream/next-packet.md` records the exact missing proof,
  environment prerequisite, re-entry commands, log paths, and blocked closure
  claim
