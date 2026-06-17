# Studio Effect State-Machine Recovery Packet Train

Date: 2026-06-16
Status: accepted for sequential packet implementation after clean packet-design commit

This packet train is the implementation-design gate for the active objective. It translates the prework frame, scenario corpus, error-boundary ledger, problem classification, and review dispositions into sequential packets. Runtime implementation begins only after this accepted train is committed cleanly as a packet-design layer that excludes unrelated worktree state.

## Governing Rules

- One packet maps to one OpenSpec change and one Graphite branch. Pre-code review is the only place this train can be split or folded.
- Packet implementation starts by creating or updating its OpenSpec records. Code changes wait until the full train is accepted.
- Source tests, builds, generated output, deploy, tuner exercise, logs, in-game observation, Graphite submission, and product proof stay separate labels.
- FireTuner/Civ7 unavailability blocks only live proof labels; it does not authorize inferred live proof.
- Generated outputs and deployed files are evidence surfaces, not hand-edit surfaces.
- The pre-existing untracked `docs/projects/mapgen-workstream-skill/` directory remains outside this train.

## Train-Level Falsifier And Reframe Gate

Each packet entrance and review checks the frame falsifier. The train halts and reframes if current evidence shows the failures are isolated to one local handler without cross-surface state-machine gaps, or if any packet starts substituting tests, builds, generated output, deploy, quiet logs, or source inspection for a distinct live/user proof label.

The reported blocker `Civ7 setup cannot see {swooper-maps}/maps/studio-current.js` is a priority falsifier for OP-04/PROOF-02/PROOF-03. If that file is not generated locally, deployed to the resolved Civ7 Mods target, visible to Civ7 setup, and tied to the current Run in Game request id, the workstream cannot claim Run in Game or product closure.

## Packet Overview

| Packet | OpenSpec change id | Graphite branch | Primary outcome | Depends on |
|---|---|---|---|---|
| SMR-01 | `studio-effect-rpc-boundary-completion` | `codex/studio-effect-rpc-boundary-completion` | Server RPC and handler error boundaries are exhaustively declared and tested. | Current prework |
| SMR-02 | `studio-operation-lifecycle-failure-classification` | `codex/studio-operation-lifecycle-failure-classification` | Run in Game and operation workflow failures project phase-specific runtime state. | SMR-01 |
| SMR-03 | `studio-browser-defined-error-projection` | `codex/studio-browser-defined-error-projection` | Browser API clients preserve or intentionally simplify defined errors consistently. | SMR-01, SMR-02 |
| SMR-04 | `studio-event-recovery-and-adoption` | `codex/studio-event-recovery-and-adoption` | Event stream recovery, operation adoption, daemon identity, and busy gates are user-coherent. | SMR-02, SMR-03 |
| SMR-05 | `studio-dev-startup-proof` | `codex/studio-dev-startup-proof` | Dev startup on isolated ports is reproducible and not confused with runtime/Civ7 failures. | SMR-01 |
| SMR-06 | `studio-browser-scenario-proof` | `codex/studio-browser-scenario-proof` | Browser scenario tests/manual gates cover setup, Run in Game, diagnostics, retry/restart, and stream recovery. | SMR-03, SMR-04, SMR-05 |
| SMR-07 | `studio-live-civ7-proof-gates` | `codex/studio-live-civ7-proof-gates` | Live Civ7 proof gates separate generated, deployed, tuner, log, and in-game evidence. | SMR-02, SMR-05 |
| SMR-08 | `studio-effect-state-machine-closeout` | `codex/studio-effect-state-machine-closeout` | Downstream docs, proof ledgers, OpenSpec tasks, Graphite state, and closure claims are realigned. | SMR-01 through SMR-07 |

## SMR-01 - Server RPC Boundary Completion

Objective: make every Studio server RPC boundary prove the difference between declared expected runtime failures and unexpected defects.

Write set:

- `openspec/changes/studio-effect-rpc-boundary-completion/**`
- `packages/studio-server/src/router/index.ts`
- `packages/studio-server/src/contract/index.ts`
- `packages/studio-server/src/handler.ts`
- `packages/studio-server/src/errors/**`
- `packages/studio-server/src/services/Civ7TunerClient.ts`
- `packages/studio-server/src/services/Civ7TunerSession.ts`
- `packages/studio-server/src/liveGame/statusRead.ts`
- `packages/studio-server/src/recipeDag/**`
- `packages/studio-server/test/handler.test.ts`
- `packages/studio-server/test/errorSpine.test.ts`
- `packages/studio-server/test/workflowSessionGraph.test.ts`

Protected paths:

- `mods/mod-swooper-maps/mod/**`
- `mods/mod-swooper-maps/src/maps/generated/**`
- `.civ7/outputs/**`
- No `apps/mapgen-studio/src/**` app source edits. Test fixtures under `apps/mapgen-studio/test/**` require an exact file list in the SMR-01 phase record before use.

Expected behavior:

- Read RPCs keep their declared non-uniform status codes and data shapes.
- `civ7.live.status` keeps 200-with-embedded-field-errors parity.
- `civ7.live.snapshot`, `civ7.live.entities`, and `civ7.live.gameInfo` map failed reads to declared 400 errors.
- `recipeDag.get` maps missing recipes to `RECIPE_DAG_RECIPE_NOT_FOUND`, unavailable recipe loading to `RECIPE_DAG_UNAVAILABLE`, and unexpected defects to defect logging without pretending they are expected user failures.
- Stateful RPCs map `StudioRuntimeFailure` to declared operation errors and unexpected defects to namespace `*_FAILED`.
- Server `onError` suppresses expected declared errors and logs unexpected defects exactly once.
- `Civ7TunerSession.use` source authority is current code/tests: original rejection cause is preserved.
- Merged `@civ7/control-orpc` procedures under `civ7.*` are exterior to SMR-01 implementation except for shared handler/onError behavior and browser OP-09 projection. Broader control-oRPC contracts remain under control-oRPC authority.

Scenario and boundary rows:

- READ-01 through READ-06
- RPC-01
- LIVE-01 through LIVE-04
- EB-01 through EB-04
- EB-16
- EB-08 status/error mapping portions

Required tests and gates:

- `nx run @civ7/studio-server:test --outputStyle=static`
- Focused handler tests for read/live unavailable paths, `recipeDag.get` declared errors/defects, declared-vs-defect `onError`, and `civ7.live.status` partial-field behavior.
- Focused error-spine tests for every operation namespace/code/status family.
- `nx run @civ7/studio-server:build --outputStyle=static`
- `bun run openspec -- validate studio-effect-rpc-boundary-completion --strict`
- `bun run openspec:validate`

Proof labels available from this packet:

- `tested`
- `built`
- OpenSpec validation

Proof labels not claimed:

- `deployed`
- `tuner-exercised` happy path
- `logged`
- `in-game observed`
- product proof

Review lanes:

- Server/router error-boundary review.
- Effect/oRPC contract review.
- Test coverage review.

Stop conditions:

- Any router leaf remains unenumerated.
- A declared error still reaches `onError` as unexpected.
- A defect is normalized into a declared expected failure without `UnexpectedDefect` data.
- Non-uniform legacy status parity is changed without explicit product authority.

## SMR-02 - Operation Lifecycle Failure Classification

Objective: make stateful operations classify admission, worker, phase, cleanup, runtime-disposed, duplicate, expired, and daemon-mismatch states without converting plain background exceptions into misleading validation failures.

Write set:

- `openspec/changes/studio-operation-lifecycle-failure-classification/**`
- `packages/studio-server/src/workflows/RunInGameWorkflow.ts`
- `packages/studio-server/src/workflows/SaveDeployWorkflow.ts`
- `packages/studio-server/src/workflows/AutoplayWorkflow.ts`
- `packages/studio-server/src/operationRuntime/**`
- `packages/studio-server/src/ports/Civ7WorkflowControl.ts`
- `packages/studio-server/src/errors/**`
- `packages/studio-server/test/operationRuntime.test.ts`
- `packages/studio-server/test/errorSpine.test.ts`
- `packages/studio-server/test/workflowSessionGraph.test.ts`

Protected paths:

- Browser UI files. Type-only browser contract import tests require an exact file list in the SMR-02 phase record before use.
- Generated/deployed mod output.

Expected behavior:

- Run in Game plain `Error` failures from materialization, deploy, restart, playable check, setup row, game start, log proof, exact-authorship proof, and cleanup become phase-appropriate `StudioRuntimeFailure` values.
- Unknown worker failures do not become `InvalidRequest`. `InvalidRequest` remains reserved for true pre-admission input validation failures.
- Save/Deploy keeps phase-aware deploy, rollback, and cleanup failure projection.
- Autoplay unavailable/start/stop/verification failures preserve declared operation family.
- Duplicate active/terminal Run in Game fingerprints remain existing-operation DTOs.
- Runtime disposal fails active operations and prevents new leaf-port calls.
- `studio.operations.current` remains registry truth even if event publishing fails.

Scenario and boundary rows:

- OP-01 through OP-08
- STUDIO-01
- EB-05 through EB-08

Required tests and gates:

- `nx run @civ7/studio-server:test --outputStyle=static`
- Focused tests for Run in Game materialize/deploy/check/setup/start/log/proof/cleanup plain `Error` classification.
- Focused tests for restart plain `Error` classification and terminal DTO diagnostics that do not collapse into `InvalidRequest`.
- Focused tests for runtime-disposed active worker status and new start rejection.
- Focused tests for save/deploy rollback and cleanup parity.
- `nx run @civ7/studio-server:build --outputStyle=static`
- `bun run openspec -- validate studio-operation-lifecycle-failure-classification --strict`
- `bun run openspec:validate`

Proof labels available from this packet:

- `tested`
- `built`

Proof labels not claimed:

- browser proof
- `tuner-exercised`
- `logged`
- `in-game observed`
- product proof

Review lanes:

- Operation runtime state-machine review.
- Failure taxonomy review.
- Regression-test review.

Stop conditions:

- Plain worker exceptions still map to `InvalidRequest` by default.
- A terminal worker failure does not release the active mutation gate.
- Duplicate operation behavior changes without explicit user-scenario proof.
- Cleanup failure semantics erase the original failure in a way that makes diagnostics unusable.

## SMR-03 - Browser Defined Error Projection

Objective: make browser-facing API clients consistently preserve defined oRPC errors or intentionally simplify them with tested user-facing behavior.

Write set:

- `openspec/changes/studio-browser-defined-error-projection/**`
- `apps/mapgen-studio/src/features/runInGame/api.ts`
- `apps/mapgen-studio/src/features/mapConfigSave/api.ts`
- `apps/mapgen-studio/src/features/civ7Setup/api.ts`
- `apps/mapgen-studio/src/lib/orpc.ts`
- New shared browser error projection helper at `apps/mapgen-studio/src/lib/studioDefinedError.ts`
- `apps/mapgen-studio/test/runInGame/**`
- `apps/mapgen-studio/test/mapConfigSave/**`
- `apps/mapgen-studio/test/civ7Setup/**`

Protected paths:

- Server runtime internals. An SMR-01/SMR-02 blocker discovered here stops SMR-03 and reopens the owning packet record.
- Generated/deployed mod output.

Expected behavior:

- Run in Game keeps code/details projection for declared errors.
- Save/Deploy declared errors preserve code/data sufficient for UI diagnostics instead of message-only flattening.
- Autoplay declared errors preserve code/data or document a tested intentional simplification.
- Setup config unavailable preserves `SETUP_CONFIG_UNAVAILABLE` and `observedAt`.
- Browser API return shapes are either contract-derived or locally sealed with tests.

Scenario and boundary rows:

- READ-01 through READ-06 browser projection portions
- UI-01
- UI-06
- OP-06 through OP-09 browser projection portions
- EB-09 through EB-11
- EB-13 projection portion

Required tests and gates:

- `nx run mapgen-studio:test --outputStyle=static`
- Focused unit tests for defined errors returned by `runCurrentConfigInGame`, `saveRepoBackedConfig`, `requestCiv7Autoplay`, and `fetchCiv7SetupConfig`.
- `nx run mapgen-studio:build:vite --outputStyle=static`
- `bun run openspec -- validate studio-browser-defined-error-projection --strict`
- `bun run openspec:validate`

Proof labels available from this packet:

- `tested`
- browser API projection proof
- `built`

Proof labels not claimed:

- browser rendered flow proof
- live Civ7 proof
- product proof

Review lanes:

- Browser error UX review.
- Contract/client boundary review.
- Test adequacy review.

Stop conditions:

- A browser wrapper claims typed oRPC errors but drops code/data unintentionally.
- Return shapes drift from UI consumers without tests.
- Defined error simplification is undocumented or untested.

## SMR-04 - Event Recovery And Operation Adoption

Objective: make event-stream recovery, daemon identity, operation adoption, and busy gates coherent after errors, reconnects, reloads, and competing operations.

Write set:

- `openspec/changes/studio-event-recovery-and-adoption/**`
- `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts`
- `apps/mapgen-studio/src/app/studioEventRecovery.ts`
- `apps/mapgen-studio/src/app/operationAdoption.ts`
- `apps/mapgen-studio/src/app/hooks/useRunInGameTerminalToast.ts`
- `apps/mapgen-studio/src/app/StudioShell.tsx`
- `apps/mapgen-studio/src/features/runInGame/status.ts`
- `apps/mapgen-studio/src/features/mapConfigSave/status.ts`
- `apps/mapgen-studio/test/studioEvents/**`
- `apps/mapgen-studio/test/runInGame/**`
- `apps/mapgen-studio/test/ui/**`
- `packages/studio-server/test/handler.test.ts` for server event payload and subscription regression coverage.

Protected paths:

- Router/error-spine internals. Blocker fixes found here stop SMR-04 and reopen SMR-01 or SMR-02.
- Generated/deployed mod output.

Expected behavior:

- Event-stream query errors set a local error, but a subsequent hello/current/live event clears stale error state when recovery is proven.
- `studio.operations.current` adoption after hello/current uses daemon identity and does not overwrite newer local terminal state incorrectly. Browser logic uses the identity already exposed by hello/current and operations-current; expanding operation event contracts is a blocker that reopens SMR-01/SMR-02.
- Reload/reconnect adopts active/recent Run in Game and Save/Deploy operations.
- Run, save/deploy, autoplay, and explore busy gates provide visible feedback rather than silent returns.
- Event publish failure never changes registry truth.

Scenario and boundary rows:

- STUDIO-01 through STUDIO-03
- UI-03 through UI-05
- EB-12
- EB-13 busy/error portions

Required tests and gates:

- `nx run mapgen-studio:test --outputStyle=static`
- Focused pure coordinator tests for stream error -> hello/current recovery -> local-error clear, live-event clear, cancellation, and identity mismatch.
- Focused hook/unit tests proving `useStudioEvents` delegates to the coordinator without stale local errors.
- Focused operation adoption tests for daemon restart identity and active/recent adoption.
- Focused UI tests for autoplay/explore busy feedback.
- `nx run @civ7/studio-server:test --outputStyle=static` if server event payload behavior changes.
- `nx run mapgen-studio:build:vite --outputStyle=static`
- `bun run openspec -- validate studio-event-recovery-and-adoption --strict`
- `bun run openspec:validate`

Proof labels available from this packet:

- `tested`
- browser state proof
- `built`

Proof labels not claimed:

- live Civ7 proof
- in-game observation
- product proof

Review lanes:

- Browser state-machine review.
- Operation adoption review.
- User-flow UX review.

Stop conditions:

- Stale local errors can survive a proven reconnect/current adoption.
- Busy gates remain silent for user-invoked actions.
- Daemon identity mismatch is hidden from diagnostics.

## SMR-05 - Dev Startup Proof

Objective: make Studio dev startup reproducible on isolated ports and classify startup failures without conflating Nx/process state, port conflicts, daemon/Vite startup, ORPC handler availability, direct-control availability, or generated-output churn.

Write set:

- `openspec/changes/studio-dev-startup-proof/**`
- `apps/mapgen-studio/src/server/daemon/**`
- `apps/mapgen-studio/vite.config.ts`
- `apps/mapgen-studio/package.json`
- `package.json`
- `nx.json`
- `apps/mapgen-studio/test/devServer/**`
- `apps/mapgen-studio/test/server/**`
- `openspec/changes/studio-dev-startup-proof/workstream/dev-startup-proof-ledger.md`
- Rollup notes in this project workstream directory.

Protected paths:

- Generated/deployed mod output. Command-regenerated evidence is restored before closure. The SMR-05 phase record must name the exact owned generated artifact before any generated evidence stays in a commit.
- Habitat stack authority files. A failing required check that implicates habitat authority stops SMR-05 and creates a downstream finding instead of local mutation.

Expected behavior:

- `bun run dev:mapgen-studio` remains the root/Nx orchestration entrypoint.
- `STUDIO_DEV_PORT`, `STUDIO_DAEMON_PORT`, and `STUDIO_DEV_RPC_TARGET` work for isolated local runs.
- Existing Nx process/concurrency failures are reported as operational state, not runtime error-boundary failures.
- Dev proof records daemon URL, Vite URL, server identity, `/rpc` reachability, and whether direct-control/Civ7 is unavailable.
- Dev runs do not leave unexplained generated-output dirt.

Scenario and boundary rows:

- DEV-01 and DEV-02
- PROOF-01 generated/build hygiene portion
- EB-14 dev/browser proof distinction
- EB-15 generated-output handling

Required tests and gates:

- `nx run mapgen-studio:test --outputStyle=static`
- `nx run mapgen-studio:build:vite --outputStyle=static`
- Focused dev-server tests for daemon port/RPC target/proxy behavior.
- `STUDIO_DAEMON_PORT=5274 STUDIO_DEV_PORT=5273 STUDIO_DEV_RPC_TARGET=http://127.0.0.1:5274 bun run dev:mapgen-studio`, bounded by recorded process cleanup.
- `git status --short --branch` before and after dev proof.
- `bun run openspec -- validate studio-dev-startup-proof --strict`
- `bun run openspec:validate`

Proof labels available from this packet:

- `tested`
- `built`
- dev startup observed when the bounded daemon/Vite/RPC run succeeds. This is a dev-only evidence label and does not substitute for generated, deployed, tuner, logged, in-game, or product proof.

Proof labels not claimed:

- live tuner success
- generated/deployed/in-game proof
- product proof

Review lanes:

- Habitat/Nx/dev-platform review.
- Generated-output hygiene review.
- Operational proof review.

Stop conditions:

- Dev run cannot be bounded or cleaned up.
- Startup proof depends on package-local Vite while bypassing daemon/Nx dependency freshness.
- Generated output dirt is unexplained.
- Existing process conflicts are ignored rather than classified.

## SMR-06 - Browser Scenario Proof

Objective: exercise user-visible Studio state-machine flows in the browser after server, operation, projection, event, and dev-startup packets are in place.

Write set:

- `openspec/changes/studio-browser-scenario-proof/**`
- `apps/mapgen-studio/test/**` scenario/e2e files.
- `apps/mapgen-studio/src/**` testability seams named in the SMR-06 phase record before edits.
- `openspec/changes/studio-browser-scenario-proof/workstream/browser-proof-ledger.md`
- Project workstream browser-proof rollup.

Protected paths:

- Server runtime changes. Scenario-discovered server blockers reopen the owning prior packet.
- Generated/deployed mod output.

Expected behavior:

- Setup loading unavailable path renders actionable diagnostics.
- Run in Game button starts or adopts operation and shows phase transitions.
- Terminal failure exposes diagnostics, copy, retry, and restart affordances as designed.
- Event-stream drop/reconnect recovers UI state.
- Daemon restart identity mismatch is visible enough for the user to recover.
- The reported setup-load and Run in Game paths are exercised as rendered Studio shell flows, not only API helpers.

Scenario and boundary rows:

- READ-01 through READ-06 rendered browser portions
- UI-01 through UI-06
- STUDIO-02 through STUDIO-03
- DEV-01 browser URL portion

Required tests and gates:

- `nx run mapgen-studio:test --outputStyle=static`
- Existing Vitest/component tests for deterministic UI units.
- Documented manual browser protocol against the dev server for full-shell flows, including setup unavailable, Run in Game terminal failure, retry, restart, event reconnect, and daemon identity mismatch. Adding Playwright or another browser automation dependency is outside SMR-06; a later accepted authority decision would create a separate test-stack packet.
- Screenshots, copied diagnostics, and browser console/server logs are manual browser evidence only, not automated proof or product proof.
- `nx run mapgen-studio:build:vite --outputStyle=static`
- `bun run openspec -- validate studio-browser-scenario-proof --strict`
- `bun run openspec:validate`

Proof labels available from this packet:

- manual browser scenario evidence
- `tested`
- `built`

Proof labels not claimed:

- live Civ7 loaded/in-game proof
- product proof

Review lanes:

- Browser scenario review.
- UI recovery review.
- Test harness review.

Stop conditions:

- A basic reported user flow cannot be reproduced and verified.
- Browser proof only exercises API functions without rendering/adoption state.
- UI success is inferred from server tests.

## SMR-07 - Live Civ7 Proof Gates

Objective: prove, when Civ7/FireTuner is available, the live-dependent rows without substituting generated/deployed/source tests for tuner/log/in-game observation.

Write set:

- `openspec/changes/studio-live-civ7-proof-gates/**`
- `apps/mapgen-studio/src/server/runInGame/**`
- `apps/mapgen-studio/src/server/studio/engines.ts`
- `packages/studio-server/src/services/**` proof-surface defects named in the SMR-07 phase record before edits.
- `mods/mod-swooper-maps/mod/maps/studio-current.js` command-regenerated evidence when the SMR-07 phase record owns it.
- `mods/mod-swooper-maps/src/maps/generated/studio-current.ts` command-regenerated evidence when the SMR-07 phase record owns it.
- `mods/mod-swooper-maps/src/maps/configs/studio-current.config.json` command-regenerated evidence when the SMR-07 phase record owns it.
- `openspec/changes/studio-live-civ7-proof-gates/workstream/live-proof-ledger.md`
- Project workstream live-proof rollup.

Protected paths:

- Direct-control transport ownership remains in `@civ7/direct-control`; do not add caller-local transports.
- Logs and deployed Mods files are evidence only.

Expected behavior:

- Build, generated local, deployed copy, deployed identity, direct tuner health, setup row, setup start, fresh bounded log, runtime readback, and exact-authorship proof are separate rows.
- Unavailable FireTuner/Civ7 produces explicit unresolved live labels, not inferred success or failure of source code.
- Happy-path live gates tie observations to branch, commit, command, request id, timestamps, log offset, and payload markers. If Civ7/FireTuner is unavailable, the packet records unresolved live labels and does not close happy-path proof.
- The Run in Game lifecycle completes only when materialize, deploy, direct-control setup/start, fresh log markers, and exact-authorship proof agree.
- The priority reported blocker is closed only when `{swooper-maps}/maps/studio-current.js` is proven at all four boundaries: local mod bundle, deployed Mods target, Civ7 setup row visibility after `preparing-setup`, and bounded runtime log/readback for the same request id.
- Listener/LSQ availability alone is readiness evidence; it is not `tuner-exercised` until direct-control commands record host, port, state id/name, command, result, request id, and timestamps.
- Prior proof ledgers are historical evidence only. SMR-07 labels must be re-earned on the current branch, commit, request id, and deployed target.

Scenario and boundary rows:

- LIVE-01 through LIVE-04
- OP-04 live portions
- PROOF-01 through PROOF-06
- EB-14
- EB-15
- EB-17

Required tests and gates:

- `nx run mod-swooper-maps:test:studio-run-in-game --outputStyle=static`
- `nx run mod-swooper-maps:build:studio-recipes --outputStyle=static`
- `nx run mod-swooper-maps:build:studio-deploy --outputStyle=static` with `SWOOPER_INCLUDE_STUDIO_CURRENT=1` and `SWOOPER_STUDIO_RUN_ID=<requestId>` recorded for Run in Game materialization proof.
- `nx run mod-swooper-maps:gen:maps --outputStyle=static` when the SMR-07 phase record names generated artifacts as packet-owned evidence.
- Deployed copy proof through the repo-owned `@civ7/plugin-mods` deploy path or `nx run mod-swooper-maps:deploy --outputStyle=static`, with resolved Civ7 Mods dir, target dir, `filesCopied`, and `maps/studio-current.js` sha/mtime/marker evidence recorded.
- Direct tuner health/readiness and setup/start commands through existing `@civ7/direct-control` tooling, with host, port, state id/name, command, result, request id, and timestamps.
- Bounded `Scripting.log` before/after proof for mapgen markers, plus sibling `Modding.log`, `Database.log`, and `UI.log` ranges when deploy/load/UI visibility is part of the claim.
- In-game observation/readback for setup visibility and created-game state. If Civ7 is unavailable, record unresolved live labels and keep happy-path live proof open.
- `git status --short --branch` and generated-output audit after every operational command.
- `bun run openspec -- validate studio-live-civ7-proof-gates --strict`
- `bun run openspec:validate`

Proof labels available from this packet:

- `tested`
- `built`
- `generated`
- `deployed`
- `tuner-exercised`
- `logged`
- `in-game observed`

Proof labels not claimed until recorded evidence exists:

- product proof
- Graphite submitted

Review lanes:

- Operational debugging/live proof review.
- Direct-control authority review.
- Generated/deploy hygiene review.

Stop conditions:

- Live proof is inferred from build, deploy, or quiet logs.
- A log line is not bounded to the current action.
- Deployed copy proof is treated as game-loaded proof.
- Civ7 setup cannot see `{swooper-maps}/maps/studio-current.js` after `preparing-setup`.
- `maps/studio-current.js` is missing, stale, or lacks current request markers in either the local mod bundle or deployed target.
- FireTuner is unavailable and the packet still claims happy-path live success.

## SMR-08 - State-Machine Closeout

Objective: close the full workstream only after all packets have current records, proofs, review dispositions, downstream realignment, and Graphite state labels.

Write set:

- `openspec/changes/studio-effect-state-machine-closeout/**`
- This project workstream directory.
- Affected completed packet workstream files.
- Canonical docs named by an accepted authority review promotion finding.

Protected paths:

- Runtime implementation files. Stale implementation comments or proof records found at closeout reopen the owning packet instead of becoming SMR-08 code edits.
- Generated/deployed output.

Expected behavior:

- Every scenario corpus row has a final status and proof label.
- Every accepted P1/P2 review finding is repaired, rejected with evidence, invalidated with later evidence, or explicitly outside closure claim.
- OpenSpec validation and packet-specific checks are green or explicitly unresolved with proof labels that do not overclaim.
- Graphite branches and worktrees are laid out intelligibly for review.
- Product proof requires browser and live proof support.

Scenario and boundary rows:

- All rows.

Required tests and gates:

- `bun run openspec:validate`
- `bun run habitat classify <changed paths>` and returned targets.
- Packet-specific source tests/builds that changed since packet closure.
- `git status --short --branch`
- `gt status`
- `git worktree list`
- `gt ls`
- `gt log short`

Proof labels available from this packet:

- Closeout evidence only.
- Graphite submitted only after an actual successful `gt submit --stack --ai` or accepted local non-submit disposition.
- Product proof

Review lanes:

- Full workstream closure review.
- Proof-ledger audit.
- Graphite/worktree review.
- Downstream realignment review.

Stop conditions:

- Any scenario row has ambiguous final proof label.
- Any accepted P1/P2 finding remains open.
- Worktree or generated-output dirt is unexplained.
- Graphite/PR/product proof labels are inferred rather than observed.

## Corpus Coverage Matrix

| Corpus group | Owning packet(s) |
|---|---|
| READ-01 through READ-06 | SMR-01, SMR-03, SMR-06 |
| RPC-01 | SMR-01 |
| LIVE-01 through LIVE-04 | SMR-01, SMR-07 |
| OP-01 through OP-08 | SMR-02, SMR-03, SMR-04 |
| OP-09 | SMR-03, SMR-04 |
| STUDIO-01 through STUDIO-03 | SMR-02, SMR-04, SMR-06 |
| UI-01 through UI-06 | SMR-03, SMR-04, SMR-06 |
| DEV-01 through DEV-02 | SMR-05, SMR-06 |
| PROOF-01 through PROOF-06 | SMR-05, SMR-07, SMR-08 |
| EB-01 through EB-04 | SMR-01 |
| EB-05 through EB-08 | SMR-02 |
| EB-09 through EB-13 | SMR-03, SMR-04 |
| EB-14 through EB-15 | SMR-05, SMR-07, SMR-08 |
| EB-16 | SMR-01 |
| EB-17 | SMR-07 |

## Review Gate

This accepted train received these review lanes before implementation:

- Frame/packet integrity review.
- Server/runtime code-path review.
- Browser/UI scenario review.
- Operational proof review.
- Graphite/OpenSpec/worktree review.

Accepted P1/P2 findings are repaired in `PACKET-REVIEW-DISPOSITION.md`. SMR-01 implementation remains blocked until this packet-design package is committed cleanly and the implementation branch starts from that accepted layer.
