# D5 Prework Ledger - Pipeline Effect Services

Status: draft
Date: 2026-06-14

## Packet-Authoring Prework Completed

- Confirmed the D5 OpenSpec change was absent on the selected base.
- Traced current workflow ownership through `createStudioEngines`, Run in Game helpers, Save/Deploy helpers, package context, and router leaves.
- Chose shared `Civ7TunerSession` as the Studio workflow game-wire route.
- Classified app code as bounded port implementation and composition only.
- Split workflow services from D4 lifecycle primitives and D3 failure taxonomy.

## Implementation-Shaping Prework Completed

### Module Map

The implementation slice uses the packet-pinned module map:

| Kind | Module | Exported owner |
| --- | --- | --- |
| Workflow | `packages/studio-server/src/workflows/RunInGameWorkflow.ts` | `RunInGameWorkflow` service tag/API/Layer |
| Workflow | `packages/studio-server/src/workflows/SaveDeployWorkflow.ts` | `SaveDeployWorkflow` service tag/API/Layer |
| Workflow | `packages/studio-server/src/workflows/AutoplayWorkflow.ts` | `AutoplayWorkflow` service tag/API/Layer |
| Workflow support | `packages/studio-server/src/workflows/workflowTypes.ts` | shared request/result/failure helpers |
| Workflow support | `packages/studio-server/src/workflows/workflowTransitions.ts` | D5 transition commands into D4 |
| Port | `packages/studio-server/src/ports/MapConfigStore.ts` | source config read/write/restore/path-jail port |
| Port | `packages/studio-server/src/ports/DeployRunner.ts` | Swooper build/deploy/regenerate port |
| Port | `packages/studio-server/src/ports/Civ7ProcessControl.ts` | restart/launch readiness OS port |
| Port | `packages/studio-server/src/ports/ScriptingLog.ts` | snapshot/fresh-read/marker/failure polling port |
| Port | `packages/studio-server/src/ports/ProofBuilder.ts` | materialization/exact-authorship proof port |
| Port | `packages/studio-server/src/ports/Civ7WorkflowControl.ts` | shared-session game-call facade |

### Transition Commands

D5 workflows emit transition commands; D4 applies them to operation state, current projection, event publication, TTL, and disposal:

| Command | Workflow producers | D4-owned effect |
| --- | --- | --- |
| `admitRunInGame`, `admitSaveDeploy`, `admitAutoplay` | workflow entrypoints | gate, conflict check, server identity, operation id/fingerprint |
| `recordPhase` | all workflows | append phase state and event projection |
| `recordMaterializationProof` | Run in Game | attach source/config/envelope/request-id proof |
| `recordDeployDiagnostics` | Run in Game, Save/Deploy | attach deploy output and target evidence |
| `recordGameReadiness` | Run in Game, Autoplay | attach shared-session readback evidence |
| `recordRuntimeProof` | Run in Game | attach log marker and exact-authorship evidence |
| `recordRollbackDiagnostics` | Save/Deploy | attach restore/delete result and rollback failure detail |
| `completeOperation` | all workflows | terminal success projection and TTL scheduling |
| `failOperation` | all workflows | terminal typed D3 failure projection and TTL scheduling |
| `disposeOperation` | D4 runtime disposal path | interrupt workflow fiber and project `RuntimeDisposed` |

### Typed Tables

| Workflow | Request contract | Phase/proof table | Failure families |
| --- | --- | --- | --- |
| Run in Game | D2.5 TypeBox closed public DTO; no executable raw tunnel fields | accepted, materializing, deploying, checking-civ, restarting-civ, setup-reload-needed, starting-game, waiting-for-proof, exact-authorship, complete, failed, uncertain, disposed | invalid request, materialization failed, deploy failed, dependency unavailable, setup failed, start failed, proof failed, timeout/uncertain, disposed |
| Save/Deploy | D2.5 TypeBox closed save/deploy DTO; no restart/verifyRestart | accepted, validating, writing, deploying, rollback, complete, failed, disposed | invalid request, path jail failed, save failed, deploy failed, rollback failed, operation blocked, disposed |
| Autoplay | D2.5 TypeBox closed start/stop command DTO | accepted, commanding, verifying, complete, failed, disposed | operation blocked, dependency unavailable, start/stop failed, verification failed, disposed |

### Fixture Plan

Tests use fake ports plus the real D4 runtime:

| Fixture | Required controls |
| --- | --- |
| `FakeMapConfigStore` | path-jail result, durable/disposable write result, previous content, restore/delete result, interruption latch |
| `FakeDeployRunner` | deploy success/failure, deploy diagnostics, regenerate success/failure, interruption latch |
| `FakeCiv7ProcessControl` | restart enabled/disabled branch, restart failure, readiness timeout |
| `FakeScriptingLog` | fresh/stale log snapshots, marker mismatch, mapgen failure sniff, timeout, interruption |
| `FakeProofBuilder` | generated/local/deployed script proof links, request-id embed proof, exact-authorship unresolved links |
| `FakeCiv7WorkflowControl` | shared-session playable/setup/start/autoplay success/failure/readback and post-disposal call counter |
| Real `StudioOperationRuntime` | admission, conflicts, current projection, events, TTL/disposal, same-request idempotency |

### Raw-Field Classification

The implementation slice treats public mutation inputs as closed TypeBox DTOs. Hits for `command`, `operationType`, `rawCommand`, `script`, `javascript`, `rawJs`, `session`, `context`, `stateName`, and generic executable `args` are classified as:

| Classification | Allowed location |
| --- | --- |
| executable public input | no production hits allowed |
| non-executable status/proof evidence | output DTOs only, with sanitized TypeBox shape |
| direct-control package internals | `packages/civ7-direct-control/**` and accepted descriptor metadata |
| tests/historical packet evidence | test fixtures, archived specs, or OpenSpec history only |

### Deploy Baseline

Current packet-authoring evidence still sees Turbo-era deploy names in app code. D5 implementation closure must use the accepted Nx/Habitat deploy/build targets present on the selected implementation base. Turbo-era command strings are evidence of current ownership to delete, not accepted D5 closure authority.

### App Helper Deletion Plan

`createStudioEngines` is deleted or reduced to a composition-only daemon helper. It cannot own phase/failure/session/fingerprint/conflict/registry/background-worker behavior. Router mutations resolve package workflow services from the managed runtime; app code supplies only environment constants and concrete port implementations.

## Implementation Prework Required Before Code Edits

1. Confirm the selected implementation base has D3 typed failures and D4 `StudioOperationRuntime` implemented, not only packet docs accepted. If not, D5 code closure is blocked.
2. Re-run corpus scans over app engines, Run in Game helpers, Save/Deploy helpers, package context/router, D3 failures, D4 runtime services, and direct-control session constructors on the selected implementation base.
3. Instantiate the fake-port fixtures and real D4 runtime harness before moving workflow code.
4. Run game-wire negative searches and session-owner allowlist before moving any direct-control calls.
5. Add poison-callback handler tests before deleting the app engine seam.
6. Fill the live proof capture template for Play and Save/Deploy before implementation closure.

## Peer-Agent Prework Lanes

- **Workflow corpus scout:** enumerate current phase/proof/rollback behavior and target service owners.
- **Game-wire scout:** validate shared-session routing, constructor allowlist, direct-control descriptor guardrails, and D12 handoff.
- **Testing oracle scout:** map each workflow invariant to package/app/scenario/live tests.
- **Black-ice reviewer:** search for optional session policy, broad app adapter wording, bridge residue, proof inflation, and unowned workflow helpers.

## Resolved Black-Ice Decisions

- Studio workflows use shared `Civ7TunerSession`; no Studio workflow code uses `withCiv7DirectControlSession`.
- App code is bounded to port implementations and composition only.
- D5 workflow services cannot own D4 gate/registry/current/event/disposal primitives.
- D5 known failures use D3 typed failures, not thrown bridge errors.
- Live Play and Save/Deploy proof are implementation closure gates, not packet acceptance claims.
- Save/Deploy same-request idempotency is preserved through the D4 runtime projection.
- `runInGame.start` raw-field protection includes session/context/stateName/operationType/args tunnels when the input remains open.

## Remaining Human Decisions

None for packet acceptance. Implementation choices are bounded by this packet and must be resolved from code evidence before edits.
