## 1. Discovery And Framing

- [x] 1.1 Capture the fatal map-generation log failure as a deploy/load boundary.
- [x] 1.2 Identify overlapping Save/Deploy, Browser Run, and Run in Game state.
- [x] 1.3 Open this dedicated OpenSpec/workstream slice.

## 2. Implementation

- [x] 2.1 Remove save-side Civ restart behavior from the Studio save endpoint.
- [x] 2.2 Route Save/Deploy and Run in Game deploys through a shared Studio
  deploy command.
- [x] 2.3 Keep Studio deploy dependency-aware through Turbo while preventing
  Vite reloads from workspace build outputs.
- [x] 2.4 Add a Save/Deploy operation status model.
- [x] 2.5 Disable or guard conflicting Browser Run, Save/Deploy, reroll,
  auto-run, and Run in Game actions.
- [x] 2.6 Surface Save/Deploy status separately from Run in Game status.
- [x] 2.7 Add explicit process-restart recovery action labeling for Run in Game.
- [x] 2.8 Move Save/Deploy status into a server-owned request-id store with a
  status endpoint and reload-resume client polling.
- [x] 2.9 Reject cross-operation API conflicts between Save/Deploy and Run in
  Game instead of relying only on disabled buttons.
- [x] 2.10 Base durable Run in Game materialization on saved/deployed config
  provenance rather than browser-preview dirtiness alone.
- [x] 2.11 Classify fresh map-script load failures during Run in Game
  `starting-game` instead of reducing them to generic setup start timeouts.
- [x] 2.12 Retry Steam launch during explicit process-restart recovery until the
  Civ process is observed or bounded launch attempts are exhausted.

## 3. Verification

- [x] 3.1 Add focused tests for Save/Deploy status and deploy command behavior.
- [x] 3.2 Expand Run in Game tests for process-restart recovery.
- [x] 3.3 Run Mapgen Studio type-check and focused tests.
- [x] 3.4 Run strict OpenSpec validation for this change.
- [x] 3.5 Add focused tests for Save/Deploy request validation and server status
  store behavior.
- [x] 3.6 Restart Studio dev server and collect browser proof.
- [x] 3.7 Probe the live save-route lifecycle rejection and status endpoint.
- [x] 3.8 Add focused operation-state regression for start-phase map-script
  load failures.
- [x] 3.9 Add focused macOS restart-launch retry regressions.

## 4. Closure

- [x] 4.1 Consolidate peer-agent findings into workstream artifacts.
- [x] 4.2 Record proof ledger and review disposition.
- [x] 4.3 Commit a clean Graphite slice.
