## 1. Packet Entrance

- [x] 1.1 Confirm D0-D4 are accepted in `OPENSPEC-PACKET-TRAIN.md`.
- [x] 1.2 Confirm `mapgen-studio-pipeline-effect-services` is absent on the selected base and requires a new OpenSpec change.
- [x] 1.3 Run D5 workflow-corpus, game-wire, testing, hardening, black-ice, TypeScript/schema, and adversarial review lanes.
- [x] 1.4 Record packet entrance proof: dependency install freshness, baseline build/check, `git status --short --branch`, `gt status`, `gt log --no-interactive`, dirty-file quarantine, and selected baseline.

## 2. Packet Scope

- [x] 2.1 Specify `RunInGameWorkflow`, `SaveDeployWorkflow`, and `AutoplayWorkflow` as package-owned Effect services.
- [x] 2.2 Specify supporting ports: `MapConfigStore`, `DeployRunner`, `Civ7ProcessControl`, `ScriptingLog`, `ProofBuilder`, and `Civ7WorkflowControl`.
- [x] 2.3 Specify D4 runtime consumption and prohibit workflow-owned gate/registry/current/event/disposal state.
- [x] 2.4 Specify D3 typed failure usage and prohibit status-code bridge truth.
- [x] 2.5 Specify Run in Game phase/proof/materialization/start/log/exact-authorship behavior.
- [x] 2.6 Specify Save/Deploy path jail/save/deploy/rollback behavior.
- [x] 2.7 Specify Autoplay typed command behavior and failed-outcome separation.
- [x] 2.8 Decide game-wire routing through daemon shared `Civ7TunerSession`.
- [x] 2.9 Specify app host as composition and bounded port implementation only.
- [x] 2.10 Specify public raw-control input guardrails and direct-control descriptor preservation.
- [x] 2.11 Specify Save/Deploy same-request idempotency.
- [x] 2.12 Specify D3/D4 implementation as D5 code-closure entrance prerequisite.
- [x] 2.13 Specify D12 game-door evidence handoff.

## 3. Packet Proof Strategy

- [x] 3.1 Define workflow-corpus ledger coverage and per-surface oracles.
- [x] 3.2 Define Run in Game success/failure scenario tests.
- [x] 3.3 Define Save/Deploy success/failure/rollback scenario tests.
- [x] 3.4 Define Autoplay conflict/unavailable/start/stop/verification tests.
- [x] 3.5 Define D4 runtime integration tests.
- [x] 3.6 Define D3 typed failure and mapper/projection tests.
- [x] 3.7 Define game-wire session owner tests and negative searches.
- [x] 3.8 Define public raw-control and descriptor guard tests.
- [x] 3.9 Define live Play and Save/Deploy implementation proof requirements.
- [x] 3.10 Define app-host engine seam deletion and composition-only tests.
- [x] 3.11 Define control-oRPC and direct-control package gates or untouched dispositions.
- [x] 3.12 Define Save/Deploy same-request idempotency tests.
- [x] 3.13 Define `runInGame.start` open-input raw tunnel adversarial tests.

## 3A. Future Implementation Closure Gates

These are D5 implementation obligations recorded by this packet, not pre-acceptance authoring tasks.

- [ ] 3A.1 Implement package-owned workflow services and port service tags/layers.
- [ ] 3A.2 Move Run in Game orchestration out of app engines into `RunInGameWorkflow`.
- [ ] 3A.3 Move Save/Deploy orchestration out of app engines into `SaveDeployWorkflow`.
- [ ] 3A.4 Move Autoplay command orchestration into `AutoplayWorkflow`.
- [ ] 3A.5 Route all workflow transitions through `StudioOperationRuntime`.
- [ ] 3A.6 Route game-wire calls through the shared `Civ7TunerSession` backed workflow control service.
- [ ] 3A.7 Replace app mutation lifecycle context callbacks with package services and bounded ports.
- [ ] 3A.8 Delete or reduce `createStudioEngines` to composition-only with negative proof.
- [ ] 3A.9 Run package/app/scenario tests, negative searches, and live Play/SaveDeploy proof.

## 4. Verification

- [x] 4.1 `bun run openspec -- validate mapgen-studio-pipeline-effect-services --strict`.
- [x] 4.2 `bun run openspec:validate`.
- [x] 4.3 `git diff --check`.
- [x] 4.4 `bun install --frozen-lockfile`.
- [x] 4.5 Historical pre-settlement packet-authoring base: `bun run build` and `bun run check`.
- [x] 4.6 `git status --short --branch`, `gt status`, and `gt log --no-interactive`.

## 5. Closure

- [x] 5.1 Record review acceptance in `review-disposition-ledger.md`.
- [x] 5.2 Mark D5 accepted in `OPENSPEC-PACKET-TRAIN.md`.
- [x] 5.3 Commit accepted D5 packet through Graphite with clean/quarantined worktree state.
