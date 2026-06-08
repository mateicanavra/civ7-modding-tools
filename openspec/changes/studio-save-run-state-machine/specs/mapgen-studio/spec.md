## ADDED Requirements

### Requirement: Studio Separates Browser Run Save Deploy And Run In Game

Mapgen Studio SHALL model Browser Run, Save/Deploy, and Run in Game as distinct
operation roles.

#### Scenario: Save/deploy is active
- **WHEN** Save/Deploy is writing or deploying a map config
- **THEN** Browser Run and Run in Game controls are disabled or guarded
- **AND** reroll and auto-run do not start browser generation

#### Scenario: Run in Game is active
- **WHEN** Run in Game is materializing, deploying, restarting Civ, preparing
  setup, starting, or waiting for proof
- **THEN** Browser Run and Save/Deploy controls are disabled or guarded
- **AND** Studio does not enqueue another conflicting filesystem or Civ setup
  mutation

#### Scenario: Direct caller bypasses disabled controls
- **WHEN** a Save/Deploy request arrives while Run in Game is active
- **OR** a Run in Game request arrives while Save/Deploy is active
- **THEN** Studio rejects the conflicting request before file writes, deploys,
  or Civ setup mutations are queued
- **AND** the response includes the active request id and phase

### Requirement: Save Deploy Status Is Request Addressable

Mapgen Studio SHALL track Save/Deploy as a request-id keyed operation while the
dev server process is alive.

#### Scenario: Tab reloads during Save/Deploy
- **WHEN** Save/Deploy has a request id and the Studio tab reloads before the
  operation is terminal
- **THEN** Studio can query the Save/Deploy status endpoint by request id
- **AND** the UI resumes the queued, running, complete, or failed phase instead
  of losing operation state

### Requirement: Save Deploy Does Not Own Civ Lifecycle

Mapgen Studio SHALL keep config Save/Deploy from restarting, starting, or
otherwise controlling Civ.

#### Scenario: Save request asks for Civ restart
- **WHEN** a Save/Deploy request includes a Civ restart request
- **THEN** Studio rejects that lifecycle request
- **AND** instructs callers to use Run in Game for Civ lifecycle control

### Requirement: Durable Run In Game Uses Save Deploy Provenance

Mapgen Studio SHALL decide durable Run in Game materialization from repo-backed
config provenance, not browser-preview freshness alone.

#### Scenario: User saves and deploys current authored config
- **WHEN** the selected repo-backed config has a source path
- **AND** the current authored config matches the selected config or the latest
  successful Save/Deploy payload
- **THEN** Run in Game may use durable materialization
- **AND** it does not require an unrelated browser preview run first

### Requirement: Studio Deploy Is Dependency Aware Without Tab Reloads

Mapgen Studio SHALL deploy Swooper map artifacts from the current workspace's
built dependencies while preserving active operation state in the Studio tab.

#### Scenario: Run in Game deploys current artifacts
- **WHEN** Run in Game deploys the Swooper mod
- **THEN** the deploy lane rebuilds required workspace dependencies before the
  mod build
- **AND** Vite does not reload the active Studio tab because dependency `dist`
  or `types` outputs changed

### Requirement: Disposable Setup Row Process Restart Is Explicit Recovery

Mapgen Studio SHALL make process-restart recovery explicit when Civ cannot see a
newly deployed disposable setup row.

#### Scenario: Disposable setup row is not visible
- **WHEN** Run in Game blocks with `reloadBoundary: process-restart-required`
- **THEN** Studio offers `Restart Civ & Run` as the primary launch action
- **AND** the next launch request records explicit process-restart recovery

#### Scenario: Steam launch returns before Civ process is alive
- **WHEN** a process-restart recovery request relaunches Civ through Steam
- **AND** the Steam open command returns without an observable Civ process
- **THEN** Studio retries the Steam launch within a bounded retry window
- **AND** records the launch attempts in the restart status payload
- **AND** fails the operation if Civ still does not start after the bounded
  attempts

### Requirement: Start-Phase Map Script Load Failures Are Classified

Mapgen Studio SHALL preserve the fatal generated-map-script load boundary even
when Civ reports it while Run in Game is still starting the prepared game.

#### Scenario: Civ drops back to shell after failing to load studio-current
- **WHEN** Run in Game fails during `starting-game`
- **AND** the fresh Scripting log contains a generated map script load failure
- **THEN** the operation status records `map-script-load-failed`
- **AND** the recovery actions include `dismiss-civ-notification-and-retry`

#### Scenario: Fatal script load line trails the control timeout
- **WHEN** Run in Game start or proof control returns a timeout
- **AND** Civ writes a generated map script load failure shortly after that
  timeout
- **THEN** Studio waits through a bounded fresh-log grace window before
  classifying the failure
- **AND** records the generated script load boundary instead of a generic
  timeout when that line appears within the grace window

#### Scenario: Civ rewrites Scripting.log at the same byte length
- **WHEN** Run in Game compares the current `Scripting.log` to its pre-run
  snapshot
- **AND** Civ has rewritten the log with a newer modification time but the same
  byte length
- **THEN** Studio treats the rewritten log contents as fresh
- **AND** fatal map-generation lines in that rewritten log can classify the
  operation status
