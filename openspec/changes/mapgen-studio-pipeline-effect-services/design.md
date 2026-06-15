# Design - Studio Pipeline Effect Services

## Component Role

D5 defines the package-owned workflow layer that sits below the D4 operation runtime and above low-level ports. D4 admits, gates, records, publishes, and disposes operations. D5 executes the domain-specific pipeline: validation, phase sequencing, deploy/materialization, game-wire commands, proof, rollback, cleanup, and typed failure emission.

This packet does not preserve the app-hosted engine island as an implementation boundary. App code can provide concrete ports. It cannot own workflow control flow.

## Target Module Topology

Use a scale-continuous package topology:

```text
packages/studio-server/src/workflows/
  RunInGameWorkflow.ts          # service tag, API, Layer, phase program
  SaveDeployWorkflow.ts         # service tag, API, Layer, save/deploy/rollback program
  AutoplayWorkflow.ts           # service tag, API, Layer, typed command program
  workflowTypes.ts              # shared workflow request/result/failure helpers
  workflowTransitions.ts        # workflow -> StudioOperationRuntime transition commands

packages/studio-server/src/ports/
  MapConfigStore.ts             # source config read/write/restore/path-jail port
  DeployRunner.ts               # Swooper build/deploy/regenerate port
  Civ7ProcessControl.ts         # macOS restart/launch readiness port
  ScriptingLog.ts               # snapshot/fresh-read/marker/failure polling port
  ProofBuilder.ts               # materialization/exact-authorship proof port
  Civ7WorkflowControl.ts        # shared-session direct-control workflow facade
```

These filenames and exported service names are the D5 implementation contract. A rename is a packet violation unless the implementation slice updates this packet and every downstream guard in the same change. Workflows own phase programs; ports own effects at the environment boundary; D4 runtime owns registry/gate/current/events; D3 owns typed failure values and mapping.

## Workflow Service Contracts

Service APIs are Effect services, not host callbacks:

```ts
RunInGameWorkflow.start: Effect.Effect<RunInGameAccepted, RunInGameFailure | StudioOperationFailure, Env>
SaveDeployWorkflow.start: Effect.Effect<SaveDeployAccepted, SaveDeployFailure | StudioOperationFailure, Env>
AutoplayWorkflow.run: Effect.Effect<AutoplayResult, AutoplayFailure | StudioOperationFailure, Env>
```

Workflows emit D4 transition commands rather than mutating public DTOs. Workflow services may compute domain state and proof data, then call `StudioOperationRuntime` transition APIs to record phase/materialization/proof/completion/failure. They must not own Maps, TTL, active operation lookup, server identity, event publication, current projection, or background worker lifetime.

## Run In Game Workflow

`RunInGameWorkflow` owns this ordered program:

1. Validate request and reject executable raw-control fields.
2. Compute config hash, repo envelope, envelope hash, source snapshot proof, and request fingerprint input consumed by D4.
3. Materialize durable or disposable config through `MapConfigStore`.
4. Deploy Swooper Maps through `DeployRunner` with the run request id.
5. Prove generated source, local mod script, deployed mod script, required marker content, and request-id embed before launch.
6. Optionally restart Civ7 through `Civ7ProcessControl`.
7. Check Civ7 readiness through `Civ7WorkflowControl` backed by `Civ7TunerSession`.
8. Ensure setup map row visibility with the accepted reload boundary.
9. Start the configured single-player game.
10. Wait for mapgen log markers and sniff mapgen failure during start/proof windows.
11. Parse log proof and build exact authorship proof.
12. Record runtime/exact-authorship proof through non-terminal D4 transition APIs.
13. Run scoped cleanup finalizers for disposable materialization and source-artifact regeneration through ports.
14. Complete the operation through D4 runtime transition APIs only after cleanup/regeneration succeeds or cleanup failure has been projected as typed/defect-contained failure.

The workflow preserves current product semantics:

- durable mode uses the selected repo-backed id/source path when valid;
- disposable mode uses the `studio-current` materialization target while preserving the selected shell-visible config id in the request/fingerprint/proof path where D4 requires it;
- required materialization markers include request id, config hash, envelope hash, and native-river proof markers;
- a generated bundle without the current request id fails before Civ launch;
- setup row invisibility carries reload boundary diagnostics;
- start/proof timeouts during `starting-game` or `waiting-for-proof` can become uncertain typed outcomes rather than anonymous failures;
- exact authorship proof remains the final success proof boundary.

## Effect Resource Lifetime

D5 workflows are interruption-aware Effect programs. File writes, disposable materialization, deploy work, scripting-log waits, proof waits, and rollback/cleanup are modeled with `Effect.acquireRelease`, `Effect.ensuring`, or scoped finalizers attached to the workflow fiber. D4 may interrupt a workflow on runtime disposal; D5 therefore cannot place cleanup only after the success transition.

Required finalizer semantics:

| Resource window | Acquire point | Finalizer on success | Finalizer on typed failure or interruption |
| --- | --- | --- | --- |
| Disposable Run in Game materialization | `MapConfigStore.materializeRunConfig` | restore/remove disposable source target and regenerate source artifacts before terminal complete | same restore/remove/regenerate path, then transition to typed failed or disposed projection through D4 |
| Run in Game deploy/proof/log wait | `DeployRunner.deployForRun`, `ScriptingLog.waitForMarkers`, `ProofBuilder.buildExactAuthorshipProof` | release timers/read handles and publish proof | interrupt waits, release handles, publish `RuntimeDisposed` or typed timeout/proof failure without launching further game calls |
| Save/Deploy file write | `MapConfigStore.writeEnvelope` after previous-content capture | retain written file only after deploy succeeds | restore previous content or delete new file before publishing failure/disposal |
| Save/Deploy deploy | `DeployRunner.deploySavedConfig` | publish deployed diagnostics | run rollback finalizer before publishing deploy/rollback diagnostics |
| Autoplay game command | `Civ7WorkflowControl.startAutoplay` or `.stopAutoplay` | verify readback and release command scope | release command scope and publish typed unavailable/start/stop/verification/disposed outcome |

`RuntimeDisposed` is not a defect. It is a D4/D5 lifecycle outcome with a public projection that proves no adapter call continued after disposal and no write/deploy cleanup was skipped.

## Save/Deploy Workflow

`SaveDeployWorkflow` owns this ordered program:

1. Validate request and reject restart/verifyRestart flags.
2. Validate map config id, request id, source path, and repo envelope.
3. Enforce the map config path jail under `mods/mod-swooper-maps/src/maps/configs`.
4. Read the previous file content.
5. Write the formatted envelope.
6. Deploy Swooper Maps through `DeployRunner`.
7. Complete through D4 runtime transition APIs.
8. On deploy-phase failure, restore previous content or delete the new file, then emit typed rollback diagnostics.

Save/Deploy must not restart Civ7. It may report deploy output and rollback diagnostics as sanitized TypeBox-backed data; it cannot leak executable command strings as public operation inputs.

Save/Deploy same-request idempotency is preserved as product behavior. If an active Save/Deploy operation exists for the same `requestId`, D4/D5 return the existing runtime projection instead of starting a second write/deploy worker. If an active operation has a different `requestId`, D4 reports a typed conflict.

## Autoplay Workflow

`AutoplayWorkflow` is a typed immediate command behind D4's shared mutation gate. It uses `Civ7WorkflowControl` backed by the daemon shared `Civ7TunerSession` for start/stop and verification readback.

Autoplay failure outcomes are sealed:

- active operation conflict -> D3 `OperationBlocked`;
- direct-control unavailable -> D3 `DependencyUnavailable`;
- start command failed -> D3 `AutoplayStartStopFailed`;
- stop command failed -> D3 `AutoplayStartStopFailed`;
- verification/readback failed -> D3 `AutoplayVerificationFailed`.

Autoplay cannot remain a loose Promise command, cannot perform app-local conflict checks, and cannot emit Run-in-Game-named errors.

## Game-Wire Ownership

D5 chooses the stricter Studio invariant: Studio workflows use the daemon runtime's shared `Civ7TunerSession` for game-facing direct-control calls. `Civ7WorkflowControl` may wrap direct-control atoms, but its implementation resolves `Civ7TunerSession` from the managed runtime and calls atoms with the shared session.

Forbidden owners:

- app engines;
- router leaves;
- local scripts;
- workflow services constructing sessions directly;
- app leaf adapters constructing sessions directly.

Allowed owners:

- `packages/studio-server/src/services/Civ7TunerSession.ts` constructs the daemon shared session;
- `packages/civ7-direct-control/src/session/session.ts` owns the low-level session class and package helper internals.

`withCiv7DirectControlSession` remains a direct-control package helper, not a Studio workflow dependency. D5 Studio workflow/app/router code must not use it. If a later packet changes that invariant, it must update D12 and the exact guard allowlist in the same slice.

`runInGame.start` is the raw-tunnel hotspot because the current contract accepts a broad config payload. D5 closes the public DTO through D2.5 TypeBox schemas: the public request contains only the named run configuration fields, source identity, materialization mode, restart intent, request id, and proof/deploy options sanctioned by the contract. Caller-owned `command`, `rawCommand`, `script`, `javascript`, `rawJs`, `session`, `context`, `stateName`, `operationType`, and generic executable `args` tunnels are absent from the schema and rejected by adversarial parser tests. Status/proof output fields such as process command evidence are classified separately as non-executable evidence.

## App Host Boundary

After D5 implementation, `createStudioEngines` is removed or reduced to a composition-only daemon construction helper. It cannot expose mutation lifecycle engine functions as the package context seam.

App-provided ports are bounded:

- repo root and static environment values;
- filesystem read/write/restore under path-jail checks delegated from package port APIs;
- Swooper deploy command execution;
- macOS Civ process restart OS calls;
- setup catalog loading;
- recipe DAG projection where mod recipe imports remain outside `@civ7/studio-server`.

App ports cannot receive registry/update callbacks, own phase transitions, classify workflow failures, manage request fingerprints, enforce operation conflicts, route direct-control sessions, or start background workers.

## Typed Failure And DTO Discipline

D5 consumes D3 failure constructors and D2.5 TypeBox public DTOs. Known workflow outcomes use `Effect.fail` with typed data. Defects are contained at router/runtime edges and are not part of workflow failure unions.

D5 implementation closure is blocked if workflow code throws known outcomes as `Error`, constructs raw `ORPCError`, reintroduces `StudioEngineError`, or stores unknown `details` as public expected-failure truth.

Implementation entrance is blocked until D3 typed failures and D4 `StudioOperationRuntime` are implemented on the selected base. A branch with accepted packet docs but no runtime/failure implementation is suitable for authoring this D5 packet, not for closing D5 code.

## Packet Blockers

D5 is not accepted while any of the following remain:

- the packet leaves session routing optional;
- app engines remain a valid workflow owner;
- workflow services can bypass D4 operation runtime;
- Run in Game proof/materialization boundaries are not named;
- Save/Deploy rollback behavior is not named;
- Autoplay start/stop and verification failures are not separated;
- public raw command/session/script input guardrails are not executable;
- live proof labels conflate packet acceptance with implementation closure;
- review finds unresolved P1/P2 ambiguity.
