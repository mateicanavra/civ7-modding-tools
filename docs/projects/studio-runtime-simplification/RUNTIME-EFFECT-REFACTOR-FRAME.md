# Studio Runtime Effect Refactor Frame

Status: normative spike frame
Date: 2026-06-14
Scope: Mapgen Studio runtime simplification closeout and Effect-based mutation runtime refactor

Current-main reconciliation, 2026-06-16: the D0-D12 runtime stack has landed on
`origin/main` through PR `#1748`. The domino descriptions below remain the
normative frame and historical proof plan for the stack, but the "Immediate Next
Work" section is superseded by current OpenSpec workstream records. Current
known open runtime-record work is D10's narrowed live-game watcher-specific
Civ7 proof gap plus any later docs/OpenSpec realignment slice, not reopening D2
or D3.

## Purpose

The product outcome is a strong, reliable Mapgen Studio core: the daemon owns ephemeral runtime truth, game-facing mutations are orchestrated through typed Effect services, public contracts are TypeBox-owned, and the local development loop is boring enough that Play and Save/Deploy do not destabilize the server that is reporting their state.

This frame closes the gap left by the first runtime simplification pass. That pass correctly consolidated transport and moved read/control surfaces toward one daemon runtime, but it deliberately preserved the dangerous stateful mutation engines. That preservation is no longer acceptable as an open-ended carveout. The remaining work is not "port Run in Game"; it is to finish runtime ownership across Run in Game, Save/Deploy, Autoplay, operation-current state, event publication, schema origin, and dev-process ownership.

## Decision

Adopt a hybrid Effect architecture:

- `StudioOperationRuntime` owns lifecycle primitives: one mutation gate, operation registries, server identity, TTL pruning, current-operation projection, accepted-then-background execution, event publication, and runtime disposal semantics. It is an Effect service backed by `Layer`, `Ref`/`SynchronizedRef`, `Semaphore` or `Queue`, scoped fibers, and `ManagedRuntime` disposal.
- `RunInGameWorkflow`, `SaveDeployWorkflow`, and `AutoplayWorkflow` own domain-specific phases, proof, rollback, validation, recovery hints, and typed failure classification.
- `Civ7TunerSession` remains the daemon runtime's shared game-wire session for normal reads and watcher/status paths.
- `@civ7/direct-control` remains the Effect-free transport atom for socket/session/protocol/runtime primitives. Studio code must not rebuild raw game transport or construct local session paths outside sanctioned owners.
- `@civ7/studio-server` contract schemas move to TypeBox as the single runtime schema origin for Studio public DTOs.
- Nx owns dev task orchestration on the accepted migrated Nx/Habitat baseline. The app should not maintain a nested process-manager shape for "start backend, watch backend, start frontend, tee logs, keep shell alive" once Nx continuous tasks/watch targets express that workflow.

This is a completion strategy. Any interim bridge introduced by an implementation slice must name its deletion slice in the same OpenSpec change. `RunInGameHttpError` has no long-term role.

## Present System Diagnosis

The existing code already has useful foundations:

- `@civ7/studio-server` builds one `ManagedRuntime` with `StudioConfig`, `Civ7TunerSession`, and `Civ7TunerClient`.
- The Studio router is already Effect/oRPC-shaped and exposes one `/rpc` surface after the one-mount work.
- `Civ7TunerSession` is the current canonical long-lived resource pattern: scoped acquisition, shared direct-control session, explicit runtime disposal.
- `@civ7/control-orpc` already has typed mutation middleware for readiness and proof-boundary checks.
- `@civ7/direct-control` already owns the game socket/session/protocol atom and TypeBox-backed procedure validation.

The weak point is the stateful Studio mutation runtime:

- `apps/mapgen-studio/src/server/studio/engines.ts` owns a process-local server instance id, one hand-rolled Promise queue, two in-memory operation stores, and five engine functions.
- Run in Game writes source config files, generates/deploys mod artifacts, optionally restarts Civ7, manipulates setup state, starts a game, waits for logs, and assembles exact authorship proof.
- Save/Deploy writes repo-backed config files, deploys generated artifacts, rolls back on deploy failure, and exposes a separate status store.
- Autoplay is a direct-control mutation with cross-operation conflict checks but no first-class operation lifecycle.
- Router leaves wrap these host engines in `Effect.tryPromise`, so Effect is a boundary wrapper, not the owner of orchestration.
- `RunInGameHttpError` is a transport-shaped exception bridge used beyond Run in Game, including Autoplay and Save/Deploy failure paths.
- Client operation truth is split across TanStack polling, Zustand persisted state, legacy localStorage keys, manual watchdog logic, and hidden completion loops.
- Dev mode still has too many process layers for a standard Nx workspace: shell/tmux wrappers outside the app, `bun run dev`, an app-local supervisor, a Bun watcher for the daemon, and Vite for the frontend.

The structural failure is not that one endpoint has a bad branch. The failure is that the old app-hosted engine island still owns lifecycle, queueing, failure mapping, and operation truth after the rest of the runtime has moved around it.

## Runtime Ownership Model

### Package Boundaries

`@civ7/direct-control`

- Owns tuner socket/session lifecycle, listener multiplexing, raw command/query execution, request timeouts, direct game operation atoms, and low-level typed transport errors.
- Stays TypeBox-first and Effect-free.
- Must not grow Studio operation stores, Studio queueing, oRPC transport policy, or app-specific recovery state.

`@civ7/control-orpc`

- Owns native oRPC procedure contracts, TypeBox schemas, mutation readiness, proof-boundary policy, controller-proof admission, and semantic procedure projection over direct-control.
- May gain a small Effect helper layer for shared mutation execution/readiness/proof/error decoration.
- Must not collapse per-procedure domain contracts into a generic raw mutation tunnel.

`@civ7/studio-server`

- Owns the Studio daemon runtime, Studio public oRPC contract, Effect service graph, operation runtime, workflow services, event hub, and live-game watcher.
- Owns TypeBox DTO schemas for Studio public wire shapes.
- Should depend on app host only for concrete environment/configuration ports, not for stateful engine functions.

`apps/mapgen-studio`

- Owns the app composition root, local environment values, process entrypoints, frontend UX, and adapters for repo-root paths or host-only commands.
- Must stop owning operation queue/state/phase machines as manual closures.

`mods/mod-swooper-maps`

- Owns map source and generated game-facing scripts. Generated/deployed outputs are proof and build artifacts, not hand-edited source.

### Target Layer Graph

```text
ManagedRuntime
  StudioConfig / StudioEnv
  StudioServerInfo
  Civ7TunerSession
  Civ7TunerClient
  StudioOperationRuntime
  StudioEventHub
  RunInGameWorkflow
  SaveDeployWorkflow
  AutoplayWorkflow
  LiveGameWatcher
  supporting ports:
    MapConfigStore
    DeployRunner
    Civ7ProcessControl
    ScriptingLog
    ProofBuilder
    ResourceCatalog
    SavedConfigStore
```

Procedure flow:

```text
Typed oRPC client call
  -> effect-orpc router leaf
    -> typed Effect service method
      -> StudioOperationRuntime accepts, guards, records, enqueues
        -> workflow fiber updates registry and publishes events
          -> low-level Civ7 calls go through Civ7TunerSession or a sanctioned direct-control wrapper
```

Status/current/watch procedures read daemon-owned runtime services. They do not reconstruct operation truth from browser persistence.

`StudioOperationRuntime` implementation contract:

- The lifecycle-owning service is provided by `Layer.scoped`. `Layer.effect` is allowed only for pure helper sublayers that own no fibers, finalizers, mutable lifecycle state, or disposal behavior.
- Operation registries, active slots, TTL metadata, and server identity live in `Ref` or `SynchronizedRef`, not mutable module variables or app closures.
- The cross-operation mutation gate is implemented with `Effect.makeSemaphore(1)` or an Effect `Queue` worker. Promise chaining is allowed only inside leaf adapters.
- Background workers are supervised by the runtime service through `forkScoped` or a service-owned fiber registry with explicit finalizers.
- Disposing the `ManagedRuntime` interrupts in-flight workers and projects deterministic `runtime-disposed` state with D3 `RuntimeDisposed` data. Post-disposal admission fails with D3 `RuntimeDisposed`, creates no registry entry, publishes no accepted event, and calls no leaf workflow adapter.

## Internal State Model

Use closed internal ADTs for operation state. Public status DTOs are projections from those ADTs.

Run in Game internal state must preserve phase semantics for at least:

- accepted
- materializing
- deploying
- restarting-civ, when requested
- checking-civ7
- reload-needed
- preparing-setup
- starting-game
- waiting-for-proof
- complete
- blocked
- failed
- uncertain

Save/Deploy internal state must preserve:

- accepted
- saving
- deploying
- rolling-back, where applicable
- complete
- failed

Autoplay must either be a first-class operation or a typed immediate runtime command that uses the same mutation gate, session routing, and failure classification rules. It cannot remain a loose Promise command with Run-in-Game-named errors.

The operation runtime must preserve the accepted-then-background semantics: start calls return an accepted/current operation promptly, then workers update daemon state after the response.

## Error And Failure Model

Expected runtime failures must be typed values internally and declared oRPC tagged errors at the boundary. Throwing should represent defects, unexpected adapter failures, or invariant violations.

Expected workflow failure families exclude defects:

- `RunInGameFailure`: invalid request, active operation conflict, direct-control unavailable, materialization proof missing, deploy failed, restart unsupported/failed, setup row unavailable, start-game failed, log proof missing, exact authorship mismatch, timeout/uncertain.
- `SaveDeployFailure`: invalid request, path jail rejection, active operation conflict, save failed, deploy failed, rollback failed, status not found.
- `AutoplayFailure`: active operation conflict, direct-control unavailable, start/stop failed, verification failed.
- `StudioOperationFailure`: status not found, expired operation, daemon identity mismatch, runtime disposed, unsupported operation type.

Example service signatures:

```ts
RunInGameWorkflow.start: Effect.Effect<RunInGameAccepted, RunInGameFailure | StudioOperationFailure, Env>
SaveDeployWorkflow.start: Effect.Effect<SaveDeployAccepted, SaveDeployFailure | StudioOperationFailure, Env>
AutoplayWorkflow.start: Effect.Effect<AutoplayResult, AutoplayFailure | StudioOperationFailure, Env>
```

Defects, invariant violations, and unexpected adapter exceptions are not public workflow variants. Router-edge containment may map them to sanitized internal oRPC errors, but expected workflow tests must not depend on thrown `Error` objects.

`RunInGameHttpError` policy:

- It must be deleted from production code in the error-spine slice.
- No engine should import it.
- No context mapper should branch on `instanceof RunInGameHttpError`.
- Contract comments should describe declared oRPC errors and failure data, not `RunInGameHttpError.details`.
- Final closeout must negative-search for it.

Unknown exception handling may remain at the router edge as defect containment. It must not be a supported path for known runtime outcomes.

## TypeScript And Schema Strategy

TypeBox is the single runtime schema origin for this refactor.

Rules:

- Studio public contracts move from Zod to TypeBox with Standard Schema adapters.
- App-local wire type mirrors for Run in Game and Save/Deploy are deleted or reduced to UI-only presentation helpers.
- Direct-control continues to validate with TypeBox and reject context-owned/raw tunnel fields.
- effect-orpc remains isolated to router modules. Contracts and services should not import effect-orpc builders.
- Expected failure data exposed over oRPC must be TypeBox-backed and sanitized.
- TypeScript static public types must be at least as constrained as runtime validation.
- Zod is removed from `@civ7/studio-server` when contract migration is complete.
- TypeBox schemas are never passed to oRPC as if they were native Standard Schema. Inputs, outputs, and error data use the owned `toStandardSchema(TypeBoxSchema)` adapter.
- The adapter must preserve recoverability of the source TypeBox `TSchema` for tests and introspection. A Standard Schema wrapper that cannot prove its TypeBox origin is not accepted for Studio public DTOs.
- effect-orpc tagged errors expose expected failure data through TypeBox-backed Standard Schema data.

The clearest contract cleanup path is:

1. Convert `packages/studio-server/src/contract/*` from Zod to TypeBox.
2. Share or converge the TypeBox-to-StandardSchema adapter pattern already present in `@civ7/control-orpc` and recipe DAG.
3. Move Run in Game and Save/Deploy status/request DTO ownership into `@civ7/studio-server`.
4. Make operation-state ADTs internal and project public DTOs explicitly.
5. Delete app-local DTO mirrors and legacy `/api` operation paths once the oRPC contract is the only client path.

## Dev Runtime Strategy

The Studio dev loop should be expressed as Nx task orchestration, not as app-local process management.

Current vendor alignment:

- Effect is appropriate for runtime service ownership, expected errors, fibers, async effects, and finalizer cleanup.
- effect-orpc is appropriate for Effect-native oRPC procedures with service injection and tagged errors.
- Nx continuous tasks are appropriate for long-lived backend/frontend dev tasks and task-pipeline dependencies.
- Nx workspace watching is appropriate for rebuilding dependent projects during development.
- Arc is not part of this refactor's implementation plan. If an existing host-side boot composition seam already uses Arc, it may remain outside the Effect service graph, but new Studio runtime composition should use Effect `Layer`/`ManagedRuntime` and Nx should own dev task orchestration. Do not add Arc to solve service lifetime, process supervision, watches, or runtime state.

Target dev shape:

- One Nx-facing Studio dev command starts backend and frontend continuous tasks.
- Backend serving is a daemon target, not a daemon supervised by a daemon-named app script.
- Frontend dev depends on backend serve through Nx continuous task configuration.
- Build/watch of dependent generated libraries is expressed through Nx watch or target dependencies.
- Deploy operations do not write files inside the backend watch import graph.
- Generated and deployed output directories are ignored or kept outside watch-owned source graphs.

The dev-watch deploy isolation slice remains an early prerequisite because live runtime proofs are unreliable while deploy/build writes can restart the daemon mid-operation.

## Complete Domino Sequence

Each domino is one OpenSpec change and one Graphite branch. Branch names should match change ids where practical. Do not merge lower slices just to make the next slice "truth"; stack the branches and drain when integration is needed outside the stack.

### D0 - Baseline One Mount

OpenSpec change: `mapgen-studio-runtime-one-mount`

Objective: confirm the stack starts from the one `/rpc` runtime handler with Studio/control/recipe DAG namespaces unified.

Required gates:

- `bun run openspec -- validate mapgen-studio-runtime-one-mount --strict`
- artifact classification ledger: run `bun run openspec -- list`, `git status --short --branch`, `gt status`, and `gt log --no-interactive`, then classify every existing runtime-simplification OpenSpec change as accepted baseline, active branch in this stack, dirty/local evidence only, superseded/archive, or blocked by accepted findings
- active orchestrator classification: prove the selected implementation base has the accepted Nx/Habitat baseline, including `nx.json`, repo-local Nx availability, `bun run nx show project mapgen-studio --json`, and the targets needed by later dev-runner slices. If the checkout is pre-Nx, D0 records a stop/reroute condition; it is not an implementation lane for runtime packets that depend on Nx/Habitat gates
- one `/rpc` route proof
- old satellite client/path negative search
- Graphite stack status recorded

### D1 - Dev-Watch Deploy Isolation

OpenSpec change: `mapgen-studio-dev-watch-deploy-isolation`

Objective: stop Play and Save/Deploy from rebuilding files inside the daemon watch/import graph.

Required gates:

- `bun run openspec -- validate mapgen-studio-dev-watch-deploy-isolation --strict`
- focused recipe-DAG import graph tests
- focused deploy-command tests
- `bun run nx run mapgen-studio:check`, once the accepted Nx baseline is present
- live Play proof: stable `serverInstanceId` across deploy
- live Save/Deploy proof: stable `serverInstanceId` across deploy

### D2 - Engine Corpus And Effect Boundary

OpenSpec change: `mapgen-studio-engine-effect-corpus`

Objective: create the exact source corpus and service map before code migration so no runtime engine is left outside the plan.

Must enumerate:

- Autoplay
- Run in Game start/status
- Save/Deploy start/status
- every production `@civ7/control-orpc` procedure that uses `civ7ControlOrpcMutationProcedure`, calls direct-control mutation methods, uses acquire/release cleanup, suspends/resumes queues, restores/release state, closes/dismisses UI queues, focuses camera, captures clean frames, or manages visibility grants
- operation queues and stores
- server identity
- map config store
- deploy runner
- Civ process control
- direct-control/session ownership
- scripting log
- proof builder
- event hub
- live-game watcher

Required gates:

- `bun run openspec -- validate mapgen-studio-engine-effect-corpus --strict`
- inventory scan over `engines.ts`, operation stores, `StudioConfig`, `studio-server`, `control-orpc`, and `direct-control`
- classification ledger for each `@civ7/control-orpc` runtime surface: in scope for this refactor, retained under existing package authority, or deferred to a named OpenSpec change with owner, risk, and re-entry trigger
- review assertion that no manual engine is omitted

### D2.5 - Studio Contract TypeBox Spine

OpenSpec change: `mapgen-studio-contract-typebox-spine`

Objective: make `@civ7/studio-server` public DTO and declared error schemas TypeBox-owned before failure/current/event DTOs stabilize.

Implementation focus:

- convert `packages/studio-server/src/contract/*` success inputs, outputs, and declared error data from Zod to TypeBox
- use one owned TypeBox-to-StandardSchema adapter, shared or converged with `@civ7/control-orpc`
- preserve existing oRPC codes, statuses, and default/coercion behavior unless the change explicitly documents a behavior change
- move Run in Game and Save/Deploy public request/status DTO ownership into `@civ7/studio-server`
- reduce app-local Run in Game and Save/Deploy status/request modules to UI-only helpers, or delete them
- keep effect-orpc imports isolated to router/contract-builder modules

Required deletions:

- Zod schemas in `packages/studio-server/src/contract/*`
- `z.infer` usage in `@civ7/studio-server` public contract modules
- app-local wire DTO exports for Run in Game and Save/Deploy
- client casts from oRPC responses into app-local operation status types
- legacy `/api` Run in Game and Save/Deploy operation clients/routes once the oRPC route is the only supported path
- public generic raw operation inputs such as `operationType + args` when semantic operation leaves exist

Required gates:

- `bun run openspec -- validate mapgen-studio-contract-typebox-spine --strict`
- TypeBox `Value.Check` contract tests for Run in Game, Save/Deploy, live status, setup/config reads, operations-current, and declared error data
- Standard Schema adapter tests proving TypeBox remains the recoverable schema origin
- contract parity tests proving defaults/coercion behavior intentionally matches or intentionally changes from Zod
- negative search for `zod` imports in `packages/studio-server/src/contract`
- negative search for `z.infer` in `@civ7/studio-server` public contract modules
- negative search for direct `/api` Run in Game/Save/Deploy client calls and route handlers
- negative search for public raw operation fields: `operationType`, `rawCommand`, `command`, `script`, `javascript`, `session`, `stateName`
- app type-check proving frontend request/status types are derived from the `@civ7/studio-server` oRPC contract

### D3 - Error Spine And Bridge Deletion

OpenSpec change: `mapgen-studio-error-spine`

Objective: replace host status-code exceptions with sealed Studio failure unions and exhaustive oRPC mapping.

Required deletions:

- `RunInGameHttpError` class
- production imports/throw sites
- context `instanceof RunInGameHttpError` mapping
- contract comments describing the bridge
- tests that construct the bridge instead of typed failures

Required gates:

- `bun run openspec -- validate mapgen-studio-error-spine --strict`
- table-driven failure mapping tests
- exhaustiveness tests mapping every expected failure variant to declared TypeBox-backed oRPC error data
- negative tests proving known runtime outcomes do not reach the router as thrown `Error`
- router-edge defect-containment test with sanitized generic internal error data
- negative search for expected-outcome host status-code exceptions in workflow services
- procedure tests for Autoplay, Run in Game start/status, Save/Deploy start/status failure paths
- negative search for `RunInGameHttpError` in production app/package code
- package checks for `mapgen-studio`, `@civ7/studio-server`, `@civ7/control-orpc`, and `@civ7/direct-control`

### D4 - Studio Operation Runtime Service

OpenSpec change: `mapgen-studio-engine-runtime-services`

Objective: move lifecycle ownership out of app closures and into Effect runtime services.

Implementation focus:

- `StudioOperationRuntime`
- operation gate implemented with Effect `Semaphore` or `Queue`
- Run in Game registry
- Save/Deploy registry
- Autoplay lifecycle decision record: either a first-class operation slot or a typed immediate command service. In both cases Autoplay uses `StudioOperationRuntime`'s mutation gate, `AutoplayFailure`, sanctioned session routing, and has negative-search proof that app-local `runAutoplayEngine` no longer owns conflict checks or Run-in-Game-named errors.
- server identity
- TTL pruning
- current-operation projection
- runtime disposal behavior

Required gates:

- `bun run openspec -- validate mapgen-studio-engine-runtime-services --strict`
- singleton-per-runtime tests
- cross-operation mutex tests
- accepted-then-background execution tests
- disposal test: accept an operation, prove the start call returns, dispose the runtime, and assert the worker is interrupted and registry projection is `runtime-disposed` with D3 `RuntimeDisposed` data
- post-disposal admission tests for Run in Game, Save/Deploy, and Autoplay: starts fail with D3 `RuntimeDisposed`, create no registry entry, publish no accepted event, and call no leaf workflow adapter
- compile-time exhaustiveness check for each internal operation ADT projection
- table-driven projection tests from every Run in Game, Save/Deploy, and Autoplay internal phase to its public DTO
- public export/privacy test proving internal operation ADT types are absent from every public package surface: root exports, declared subpaths, generated `.d.ts`, package `exports`, `@civ7/studio-server/runtime`, and source-runtime imports
- test that public status DTOs contain only TypeBox-backed wire fields and no internal workflow-only fields
- TTL/status miss tests
- daemon restart truth test: new runtime starts empty
- negative search that `createStudioEngines` no longer owns registries, queue, or identity as app-local closures
- negative search for partial-patch operation state mutation helpers after the ADT migration
- no unscoped background `Promise`, `setTimeout`, or `forkDaemon` worker ownership in `StudioOperationRuntime`

### D5 - Effect Workflow Pipelines And Game-Wire Door

OpenSpec change: `mapgen-studio-pipeline-effect-services`

Objective: port the mutation pipelines into typed Effect workflow services while preserving product behavior and enforcing direct-control ownership.

Implementation focus:

- `RunInGameWorkflow`
- `SaveDeployWorkflow`
- `AutoplayWorkflow`
- `MapConfigStore`
- `DeployRunner`
- `Civ7ProcessControl`
- `ScriptingLog`
- `ProofBuilder`
- direct-control/tuner session routing

Session decision:

- Preferred invariant: reads, watchers, and status paths use the daemon runtime's shared `Civ7TunerSession`.
- Bounded workflows may use `@civ7/direct-control`'s scoped wrapper only if that is documented as a permanent ownership boundary and enforced by guard tests.
- Forbidden: app engines, router leaves, or local scripts constructing `new Civ7DirectControlSession(...)`.

Required gates:

- `bun run openspec -- validate mapgen-studio-pipeline-effect-services --strict`
- focused Run in Game success/failure tests
- focused Save/Deploy success/failure tests
- focused Autoplay tests
- direct-control unavailable/timeout classification tests
- no unsanctioned direct session construction
- no public Studio/control-oRPC route accepts raw command/script/session fields
- direct-control procedure descriptors still reject context-owned fields from public input
- mutation procedures preserve validator-first, send-receipt, post-read proof classification, and no-repeat-after-unverified metadata
- sent-but-unverified and confirmed-success cases remain distinct in public status/proof DTOs
- static public DTO types are schema-derived and no broader than TypeBox runtime validation for touched mutation routes
- Autoplay conflict tests go through `StudioOperationRuntime`
- negative search for `runRunInGameStartEngine`, `runRunInGameStatusEngine`, `runSaveDeployEngine`, `runSaveDeployStatusEngine`, `runAutoplayEngine`, and `studioOperationQueue` in production app code, unless the remaining name is a thin composition adapter with no queue, registry, phase transition, direct-control/session routing, or failure classification ownership
- if `createStudioEngines` remains, a test or source assertion proves it is composition-only and delegates to `@civ7/studio-server` Effect services
- live Play proof with branch/commit/API path/timestamps/log pointers
- live Save/Deploy proof with branch/commit/API path/timestamps/log pointers

### D6 - Operations Current

OpenSpec change: `mapgen-studio-operations-current`

Objective: expose daemon-owned operation truth through `studio.operations.current` and delete browser-owned operation recovery.

Required deletions:

- Run in Game request-id localStorage recovery
- Run in Game snapshot localStorage recovery
- last Run in Game source localStorage recovery
- Save/Deploy request-id localStorage recovery
- `sourceSnapshotStorage.ts`, unless reduced to non-recovery UI helper with explicit rationale

Required gates:

- `bun run openspec -- validate mapgen-studio-operations-current --strict`
- fresh daemon reports no operations
- active/recent operations appear through daemon current
- TTL pruning affects current and status consistently
- status miss returns typed not-found with daemon identity where specified
- negative search for operation recovery keys/modules

### D7 - Stream Spike

OpenSpec change: `mapgen-studio-stream-spike`

Objective: confirm the event transport shape before production EventHub adoption.

Selected direction:

- effect-orpc `.effect()` procedure returning `eventIterator(...)`
- Effect `PubSub` subscription acquired in a `Scope` and exposed through a scoped async iterator/Stream bridge; iterator close and fiber interruption both close the scope
- one `/rpc` path
- no parallel SSE route
- actual retry policy configured for the watch call/link

Required gates:

- `bun run openspec -- validate mapgen-studio-stream-spike --strict`
- event delivery test
- iterator close cleanup test
- cancellation test: interrupt or disconnect the watch fiber and assert the subscription finalizer runs
- repeated subscribe/close test: no subscriber/dequeue growth across repeated watch connections
- Vite `/rpc` stream passthrough test
- spike fixture deletion or promotion target

### D8 - Event Hub

OpenSpec change: `mapgen-studio-event-hub`

Objective: add daemon-owned `StudioEventHub` and `studio.events.watch` without deleting polling yet.

Implementation focus:

- TypeBox event union: `hello | operation | live-game`
- Effect `PubSub`
- scoped subscription ownership: the bridge must not retain a dequeue/subscriber after client disconnect
- immediate `hello` with daemon identity
- client subscription hook using the selected stream transport
- reconnect `hello` triggers `studio.operations.current` adoption

Required gates:

- `bun run openspec -- validate mapgen-studio-event-hub --strict`
- subscribe receives `hello`
- iterator close releases subscription
- cancellation releases subscription
- one `/rpc` watch route
- retry policy is nonzero on the actual watch path
- reconnect adoption test

### D9 - Operations Push

OpenSpec change: `mapgen-studio-operations-push`

Objective: publish operation transitions through EventHub and delete operation polling/watchdog authority.

Required deletions:

- `useOperationStatusPolls`
- synthetic polling-only 404 handling in `StudioShell`
- hidden Save/Deploy completion loop
- `useDaemonInstanceWatchdog`

Required gates:

- `bun run openspec -- validate mapgen-studio-operations-push --strict`
- publisher path falsification test
- client pushed Run in Game state test
- client pushed Save/Deploy state test
- terminal toast parity test
- negative searches for deleted polling/watchdog symbols

### D10 - Live Game Watch

OpenSpec change: `mapgen-studio-live-game-watch`

Objective: move live Civ7 status cadence from browser timers into daemon runtime and publish `live-game` events.

Implementation focus:

- daemon-side watcher under runtime lifecycle
- reads through `Civ7TunerSession`
- live-game key excludes clock-only fields
- publish first/change only
- client applies pushed live-game state
- setup/snapshot reads remain request-response reads triggered by pushed events

Required deletions:

- browser live-status `setTimeout` loop
- `nextLiveRuntimePollDelayMs`

Required gates:

- `bun run openspec -- validate mapgen-studio-live-game-watch --strict`
- watcher publishes first state
- watcher publishes changed key
- watcher stays quiet on unchanged state
- client live-game event test
- negative searches for deleted browser cadence symbols
- live proof with Civ7 available: watcher publishes first/change, stays quiet on unchanged, uses shared `Civ7TunerSession`, and the browser live-status cadence remains deleted
- if Civ7 is unavailable, D10 cannot close green; write `next-packet.md` with exact missing live proof, environment prerequisite, and re-entry command/log checklist

### D11 - Nx Dev Runner

OpenSpec change: `mapgen-studio-nx-dev-runner`

Objective: replace app-local nested dev supervision with Nx continuous task orchestration and workspace-watch/dependency rebuild ownership.

D11 assumes the accepted Nx/Habitat baseline already exists. It proves the baseline before deleting app-local supervision, then replaces the remaining nested Studio dev process shape with Nx continuous task orchestration. A pre-Nx checkout blocks D11 acceptance rather than becoming a migration fallback inside the runtime train.

Implementation focus:

- backend serve target marked continuous
- frontend dev target depends on backend serve
- dependent generated/build targets modeled through Nx watch or explicit target dependencies
- app-local `devLive.ts` supervisor removed or reduced to a single server entrypoint with no child process supervision
- watcher ignore rules and import graph stay aligned with D1

Required gates:

- `bun run openspec -- validate mapgen-studio-nx-dev-runner --strict`
- dependency install freshness proof on the selected worktree
- accepted Nx/Habitat baseline proof: `bun run nx --version`, `bun run nx show project mapgen-studio --json`, and the repo-local Habitat/classification command relevant to the packet write set
- Nx graph/task proof for frontend dev depending on backend serve
- process proof showing one backend and one frontend process under Nx orchestration
- no Bun watcher launched from inside the daemon process
- negative search for `apps/mapgen-studio/src/server/daemon/devLive.ts`, `"dev": "bun src/server/daemon/devLive.ts"`, `bun --watch` in app dev scripts, root `turbo run dev --filter=mapgen-studio`, `bunx turbo`, and `bun x turbo` in active runtime dev specs when Nx is the chosen final owner
- Play and Save/Deploy keep daemon `serverInstanceId` stable in dev

### D12 - Game Door Invariant And Runtime Closeout

OpenSpec change: `mapgen-studio-game-door-invariant`

Objective: close the runtime simplification program by turning ownership into guardrails and deleting every orphaned bridge.

Implementation focus:

- evergreen game-door invariant doc
- guard test for sanctioned `new Civ7DirectControlSession(...)` owners
- stale docs/comments removed
- tuner-session deferred tasks resolved by name:
  - Run-in-game per-flow session ownership is either converged onto `Civ7TunerSession` or permanently assigned to a sanctioned `@civ7/direct-control` scoped wrapper, with guard tests
  - Restart Civ7 recovery affordance is either implemented, explicitly rejected by product authority, or moved to a canonical deferral with owner, risk, and re-entry trigger
- final negative search confirms the TypeBox spine stayed intact
- final `@civ7/control-orpc` runtime surface classification ledger proves no unclassified game-action/effect surface remains
- final residue ledger

Required gates:

- `bun run openspec -- validate mapgen-studio-game-door-invariant --strict`
- `bun run openspec -- validate mapgen-studio-tuner-session --strict`
- `bun run openspec:validate`
- repo-local Nx/Habitat-selected package/app check, test, and build gates
- negative search for:
  - `RunInGameHttpError`
  - Zod imports in `packages/studio-server/src/contract`
  - browser operation recovery keys
  - `useOperationStatusPolls`
  - `useDaemonInstanceWatchdog`
  - `nextLiveRuntimePollDelayMs`
  - unsanctioned `new Civ7DirectControlSession(`
  - old satellite client/path symbols
  - public `operationType + args` generic mutation routes
  - public `Record<string, number>` mutation arg DTOs where the runtime schema is a closed semantic union
  - direct-control runtime-port aliases exported from public root packages
  - active runtime docs/OpenSpec text that says Run-in-game convergence is out of scope without an accepted disposition
- Graphite stack submitted, merged bottom-to-top, synced/drained

## Review Loop Design

Use an orchestrator plus specialized reviewers for every implementation slice.

Required review lanes:

- Architecture boundary reviewer: package ownership, runtime service boundaries, generated/source imports, no shared utility drift.
- Direct-control reviewer: session ownership, game-wire routing, raw protocol boundaries, controller-proof admission.
- Product/runtime reviewer: Play, Save/Deploy, Autoplay, live runtime, recovery hints, terminal toasts, user-visible state.
- TypeScript/schema reviewer: TypeBox origin, contract privacy, DTO derivation, typed failure exhaustiveness, no Zod residue.
- Dev-platform reviewer: Nx continuous task/watch alignment, process tree, watch graph isolation.
- Adversarial orphan reviewer: no "for now", no unowned bridge, no stale comments, no deleted-path survivors.

Accepted P1/P2 findings block closure until repaired or explicitly rejected with path-grounded rationale in the review disposition ledger.

## Always-On Proof Gates

Every OpenSpec slice:

- dependency install freshness proof for the selected worktree, such as `bun install --frozen-lockfile`
- baseline build/check proof before packet-specific validation results are trusted
- `bun run habitat classify <path-or-diff>` or the accepted migrated-baseline equivalent, with resulting Habitat/Nx/Biome/GritQL gates recorded when relevant to the write set
- `bun run openspec -- validate <change-id> --strict`
- `git diff --check`
- `gt status`
- `gt log --no-interactive`
- clean or explicitly quarantined worktree state
- one logical change per Graphite branch

Runtime code slices:

- repo-local Nx `check`, `test`, and `build` targets selected by Habitat/classification for touched packages
- repo-local Nx `check`, `test`, and `build` targets selected by Habitat/classification for touched app code
- direct package-local scripts may be run as focused additional evidence when useful, but they do not substitute for Nx/Habitat-selected gates on the settled baseline
- backend endpoint/in-process router tests for Play/Save/Deploy/Autoplay behavior
- no browser automation for backend endpoint truth

Live slices:

- Play through `/rpc`, with stable `serverInstanceId`
- Save/Deploy through `/rpc`, with stable `serverInstanceId`
- no daemon restart mid-operation
- Civ7 is not restarted unless requested by product behavior
- proof record includes branch, commit, timestamp, API path, payload class, operation id, and log pointers
- if Civ7 is unavailable, the slice cannot close green; it must leave a `next-packet.md` with the exact missing live proof and re-entry commands

## Non-Negotiable Deletion Policies

- No `RunInGameHttpError` after the error-spine slice.
- No Zod in `@civ7/studio-server` contracts after the TypeBox spine lands.
- No app-local operation engine ownership after runtime services land.
- No browser-owned operation recovery once `studio.operations.current` exists.
- No operation polling/watchdog authority after operations push lands.
- No browser live-status cadence after live-game watch lands.
- No app-local process supervisor once Nx dev runner lands.
- No unsanctioned direct-control session construction after game-door closeout.
- No fallback or dual-path shortcut without a named deletion slice and a guard test proving it is gone.

## External Alignment Notes

- Effect's runtime is explicitly responsible for executing effects, handling expected and unexpected errors, managing concurrency, ensuring finalizer cleanup, and handling async callbacks uniformly: <https://effect.website/docs/runtime/>.
- effect-orpc supports Effect-native oRPC procedures with service injection and tagged errors: <https://utopyin-effect-orpc.mintlify.app/introduction>.
- Nx continuous tasks model long-lived dev targets that other tasks can depend on without waiting for them to exit: <https://nx.dev/blog/nx-21-continuous-tasks>.
- Nx workspace watching can rebuild dependent projects during development: <https://nx.dev/docs/guides/tasks--caching/workspace-watching>.
- Arc is not part of this refactor's implementation plan; it is not a task runner, build tool, process manager, or reactive state library: <https://arc.tsdk.dev/>.

## Immediate Next Work

This section is historical. It described the next work as of 2026-06-14 before
the runtime stack landed on `origin/main` through `#1748`. Use the current
OpenSpec workstream records and packet train status instead of reopening these
early dominoes by default.

1. Confirm the active runtime stack base and whether the tactical `dev-watch-deploy-isolation`/dev-host cleanup branches are merged, pending, or dirty.
2. Open D2 (`mapgen-studio-engine-effect-corpus`) if the corpus is not already represented in a live OpenSpec change.
3. Open D2.5 (`mapgen-studio-contract-typebox-spine`) unless the accepted base already proves the TypeBox spine.
4. Open or repair D3 (`mapgen-studio-error-spine`) so `RunInGameHttpError` deletion is explicit and blocks closure.
5. Proceed through the domino chain as one Graphite stack unless a lower slice must be drained to unblock other stacks.
