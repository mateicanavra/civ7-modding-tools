# Spec/Test Peer Report

## Findings

### P1: Cross-operation exclusion is specified but not yet protected at the API boundary

- **Evidence:** `openspec/changes/studio-save-run-state-machine/specs/mapgen-studio/spec.md:8` through `:18` requires Save/Deploy, Browser Run, and Run in Game to be distinct and guarded. `openspec/changes/studio-save-run-state-machine/design.md:15` through `:18` says they share a serial server queue. `openspec/changes/studio-save-run-state-machine/tasks.md:15` through `:17` marks the guard/status work complete.
- **Current tests:** `apps/mapgen-studio/test/runInGame/AppFooter.test.tsx:124` through `:157` checks rendered footer disabled text while Save/Deploy is running. `apps/mapgen-studio/test/runInGame/operationState.test.ts:44` through `:51` checks duplicate active Run in Game operations inside the Run in Game store.
- **Gap:** There is no route-level or extracted-controller test proving `/api/map-configs` and `/api/civ7/run-in-game` share one exclusion gate. A browser-disabled button does not protect against stale tabs, direct HTTP calls, retry races, or a refresh during deploy. This is the highest-value falsification test for the fatal deploy/load boundary.
- **Needed acceptance:** Add tests that start Save/Deploy, then POST Run in Game and assert no materialize/deploy/Civ mutation is queued; start Run in Game, then POST Save/Deploy and assert save/deploy is blocked or queued according to the chosen contract; assert the response includes structured conflict diagnostics with the active request id and phase.

### P1: Save/Deploy lifecycle separation is specified, but restart rejection is not proven at the save route

- **Evidence:** `openspec/changes/studio-save-run-state-machine/specs/mapgen-studio/spec.md:20` through `:28` requires Save/Deploy to reject Civ lifecycle requests. `openspec/changes/studio-save-run-state-machine/design.md:35` through `:38` repeats that Save/Deploy does not restart Civ. `docs/projects/civ7-direct-control/workstream/studio-save-run-state-machine/review-ledger.md:5` through `:10` records the finding as accepted.
- **Current tests:** `apps/mapgen-studio/test/mapConfigSave/status.test.ts:10` through `:37` covers status helper behavior. `apps/mapgen-studio/test/mapConfigSave/deployCommand.test.ts:5` through `:23` covers deploy command construction. `apps/mapgen-studio/test/runInGame/requestValidation.test.ts:64` through `:75` proves Run in Game can carry explicit process-restart recovery.
- **Gap:** No test sends a Save/Deploy payload with `restart` or `verifyRestart` and proves the save endpoint rejects it before filesystem/deploy or direct-control work. The current coverage proves helper intent, not the public contract.
- **Needed acceptance:** Add a route/controller test for `/api/map-configs` that rejects `restart: true` and `verifyRestart: true`, returns a clear "use Run in Game" diagnostic, and proves no deploy command or Civ control function was invoked.

### P2: Process-restart recovery is label-level, not workflow-level, in the tests

- **Evidence:** `openspec/changes/studio-save-run-state-machine/specs/mapgen-studio/spec.md:42` through `:50` requires `Restart Civ & Run` when `reloadBoundary: process-restart-required` appears. `openspec/changes/studio-save-run-state-machine/design.md:40` through `:45` says the next launch request records explicit process-restart recovery.
- **Current tests:** `apps/mapgen-studio/test/runInGame/operationState.test.ts:66` through `:78`, `apps/mapgen-studio/test/runInGame/status.test.ts:56` through `:75`, and `apps/mapgen-studio/test/runInGame/AppFooter.test.tsx:90` through `:107` prove recovery actions and button labels.
- **Gap:** No test proves the follow-up "Restart Civ & Run" request actually carries `recovery.restartCivProcess`, enters the `restarting-civ` phase, and then continues through setup/start without silently replaying a prior uncertain mutation.
- **Needed acceptance:** Add a route/controller test for the blocked-to-restart flow: blocked operation with `process-restart-required` -> user action -> new request with restart recovery -> phase includes `restarting-civ` before setup -> no reuse/replay of the old request id.

### P2: Dependency-aware deploy and no-tab-reload are requirements, but current tests only prove command strings

- **Evidence:** `openspec/changes/studio-save-run-state-machine/specs/mapgen-studio/spec.md:30` through `:40` requires dependency-aware deploy while preserving Studio tab state. `openspec/changes/studio-save-run-state-machine/design.md:47` through `:52` says Turbo rebuilds dependencies and Vite ignores `packages/*/dist` and `packages/*/types`. `openspec/changes/studio-save-run-state-machine/tasks.md:26` leaves browser proof unchecked.
- **Current tests:** `apps/mapgen-studio/test/mapConfigSave/deployCommand.test.ts:6` through `:23` checks the deploy command and optional `SWOOPER_STUDIO_RUN_ID` marker.
- **Gap:** There is no test or proof artifact showing Vite does not reload the active tab during the deploy lane, and no test proving the deploy lane preserves in-flight operation status across build output writes.
- **Needed acceptance:** Add a browser/dev-server proof or automated smoke test that starts an operation, touches/builds dependency outputs through the Studio deploy lane, and verifies the same Studio tab still shows the same operation request id and phase.

### P2: The fatal map-generation failure is captured, but deploy/load proof is not falsified

- **Evidence:** `openspec/changes/studio-save-run-state-machine/design.md:20` through `:31` and `docs/projects/civ7-direct-control/workstream/studio-save-run-state-machine/proof-ledger.md:3` through `:11` classify the fatal error as a missing deployed/loadable `studio-current.js` file. `docs/projects/civ7-direct-control/workstream/studio-save-run-state-machine/proof-ledger.md:13` through `:21` lists proof targets for deploy coherence.
- **Current tests:** Existing tests do not assert deployed mod contents, GameInfo row visibility, Swooper request markers, or log proof for `studio-current.js`.
- **Gap:** The slice can pass while still failing the exact runtime symptom: Civ setup sees or selects a map row whose script file is not present in the deployed mod. That is a deployment/load invariant, not just a UI-state invariant.
- **Needed acceptance:** Add proof criteria that Run in Game does not proceed past deploy until the expected map script path exists in the built/deployed mod output, and live proof records either setup row visibility plus script load success or a structured blocked state.

### P3: Task state is mostly honest but not closure-ready

- **Evidence:** `openspec/changes/studio-save-run-state-machine/tasks.md:22` through `:25` marks focused tests, type-check, and strict validation done; those gates passed in this peer pass. `openspec/changes/studio-save-run-state-machine/tasks.md:26` and `:30` through `:32` remain unchecked for browser proof, peer consolidation, proof/review disposition, and clean Graphite commit.
- **Gap:** The implementation task boxes are checked before the missing API-boundary tests above are represented in the task list. If those tests are accepted as required, tasks `2.5`, `3.1`, and `3.2` should either be reopened or paired with new explicit tasks.

## Risks

- UI-only guards can regress into the same failure class if a stale tab, direct endpoint call, retry, or interrupted request bypasses disabled controls.
- Save/Deploy restart rejection can silently regress because current tests do not exercise the public save route.
- Process-restart recovery can look correct in the footer while failing to pass the restart intent through the launch request.
- The fatal Civ error can recur if deploy success is treated as load proof without checking the map script artifact and setup-visible row together.
- The OpenSpec change may close with green helper tests while the real state-machine seam remains under-tested.

## Verdict

The slice is valid and directionally correct, but not closure-ready as the spec/test peer. I verified:

- `bun run openspec -- validate studio-save-run-state-machine --strict` passed.
- `bun run --cwd apps/mapgen-studio test -- mapConfigSave runInGame` passed: 7 files, 27 tests.
- `bun run --cwd apps/mapgen-studio check` passed.

The OpenSpec should add explicit API-boundary and deploy/load proof requirements before closure. Minimum blocking additions: shared Save/Deploy vs Run in Game exclusion tests, save-route restart rejection tests, blocked-to-process-restart workflow tests, and proof that a setup-visible disposable row has its deployed script file available before Civ launch is considered proved.
