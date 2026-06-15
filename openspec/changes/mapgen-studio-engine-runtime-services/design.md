# Design - Studio Operation Runtime Services

## Component Role

D4 defines the Effect-owned lifecycle substrate for Studio mutation operations. It is not a thin wrapper around existing app stores. It is the package-owned runtime service that admits operations, guards cross-operation mutation, records internal ADT state, supervises background workers, projects public DTOs, publishes operation events, and disposes deterministically with the daemon runtime.

## Target Module Topology

Use a scale-continuous package-owned runtime family:

```text
packages/studio-server/src/runtime/
  StudioOperationRuntime.ts       # service tag, API, Layer construction
  operationTypes.ts               # internal ADTs and operation ids
  operationRegistry.ts            # Ref/SynchronizedRef registry helpers
  operationGate.ts                # Semaphore/Queue admission policy
  operationProjection.ts          # internal ADT -> public DTO projection
  operationEvents.ts              # operation event publication helpers
  operationTtl.ts                 # TTL pruning policy
  operationDisposal.ts            # interrupt-and-project disposal policy
```

Implementation may use different filenames only if it preserves the same ownership split: runtime API, internal state, gate, projection, TTL, events, and disposal are identifiable modules under package ownership. App-host files may provide environment values, configuration, and leaf workflow adapters; they do not own lifecycle primitives.

## Runtime Service Contract

`StudioOperationRuntime` is provided by `Layer.scoped` and consumed through Effect services, not through mutable module variables. Because it owns background fibers, finalizers, lifecycle state, and disposal behavior, `Layer.effect` is not an acceptable construction shape for the runtime service itself. `Layer.effect` is acceptable only for pure helper sublayers that own no fibers, finalizers, mutable lifecycle state, or disposal behavior.

The service owns:

- one server identity: `serverInstanceId`, `serverStartedAt`;
- one cross-operation mutation gate implemented by `Effect.makeSemaphore(1)` or an Effect `Queue` worker;
- Run in Game registry;
- Save/Deploy registry;
- Autoplay command admission state;
- TTL pruning policy;
- current-operation projection;
- operation event publication hooks;
- scoped background worker supervision;
- runtime disposal policy.

The service must be singleton-per-ManagedRuntime, not singleton-per-process by accidental module scope. Tests must prove two runtimes have distinct identity/registries and one runtime exposes stable identity across procedures.

Use `SynchronizedRef` for atomic registry and active-slot transitions. Plain `Ref` is acceptable for immutable identity or simple lifecycle flags. Mutable module-scope `Map` state and app-closure stores are not accepted.

Prefer an Effect `Semaphore(1)` plus atomic active-slot acceptance over a backlog `Queue`. A `Queue` is acceptable only when bounded, scoped, supervised by a `forkScoped` worker, shut down on disposal, and unable to create hidden accepted-but-not-visible backlog.

## Admission And Gate

Run in Game, Save/Deploy, and Autoplay all enter through `StudioOperationRuntime`.

Required semantics:

- exactly one Civ-mutating operation may hold the mutation gate at a time;
- conflicts return D3 `OperationBlocked` failures with the active operation id/phase when available;
- duplicate Run in Game request fingerprints remain idempotent and are owned by `StudioOperationRuntime`, not `createStudioEngines` or app operation stores;
- status procedures never acquire the mutation gate;
- Autoplay is a typed immediate runtime command admitted through the same gate. It has no public TTL registry in D4, but conflict, unavailable, start/stop failed, and verification failed outcomes use D3 `AutoplayFailure`.

No operation may bypass the gate through app-local active-store checks.

Run in Game duplicate fingerprint semantics are preserved as product behavior. If a start request repeats a known request fingerprint, the runtime returns the existing operation projection for accepted/running/terminal records according to D3/D4 status rules. It must not create a second operation, bypass the mutation gate, or keep fingerprint ownership in app-local stores. Expired and daemon-identity-mismatched fingerprints use D3 `OperationExpired` or identity-mismatch failure data, not a silent fresh start.

## Internal ADTs And Public Projection

Runtime registries store closed internal ADTs. Public DTOs are projections.

Run in Game states cover at least:

- `accepted`
- `materializing`
- `deploying`
- `restarting-civ`
- `checking-civ7`
- `reload-needed`
- `preparing-setup`
- `starting-game`
- `waiting-for-proof`
- `complete`
- `blocked`
- `failed`
- `uncertain`
- `runtime-disposed`

Save/Deploy states cover at least:

- `accepted`
- `saving`
- `deploying`
- `rolling-back`
- `complete`
- `failed`
- `runtime-disposed`

Autoplay outcomes cover at least:

- `accepted`
- `starting`
- `stopping`
- `complete`
- `blocked`
- `failed`
- `runtime-disposed`

Projection rules:

- public status DTOs contain TypeBox-backed wire fields only;
- internal workflow-only fields do not escape public exports;
- every internal state variant has a compile-time exhaustive projection;
- recovery actions and failure reason codes come from D3 vocabulary;
- status miss and lifecycle miss projections preserve daemon identity where D3 requires it.

## Accepted-Then-Background Semantics

Start procedures return accepted state promptly after admission and registry write. The long-running worker runs under runtime supervision and mutates registry state afterward.

Implementation must avoid both extremes:

- no synchronous long-running start call that blocks until the game workflow finishes;
- no unsupervised fire-and-forget Promise outside runtime scope.

Background workers are created with `forkScoped` or a service-owned fiber registry with finalizers attached to the runtime scope. Promise APIs are allowed only inside leaf adapters such as filesystem, deploy runner, or direct-control calls.

The runtime lifetime oracle is: start returns accepted, the worker survives response completion under the managed runtime scope, and `runtime.dispose()` interrupts the worker and projects the registry entry to `runtime-disposed`.

D4 can prove runtime worker interruption with Effect-native test workflows immediately. If an implementation still wraps legacy Promise workflow bodies before D5 ports them, it must not claim those leaf Promises are interruptible; the runtime shell still owns acceptance, registry state, finalizers, and deterministic disposal projection.

## Disposal Policy

D4 uses interrupt-and-project. On `ManagedRuntime` disposal, in-flight operation workers are interrupted and each affected registry entry projects deterministically to `runtime-disposed` with D3 `RuntimeDisposed` failure data. Bounded drain is not part of D4.

Disposal has three rules:

- new accepts after disposal starts fail with D3 `RuntimeDisposed`;
- post-disposal admission creates no operation registry entry, publishes no accepted event, and calls no leaf workflow adapter;
- active operations must not remain `running`;
- disposal projection is published as an operation state transition when the event hub is available.

TTL applies to terminal/recent records, not active workers. Expired known request ids project D3 `OperationExpired` before pruning. Implementation must use a tombstone horizon or equivalent typed-expiry mechanism so `expired` does not collapse into `never-known` immediately.

## Event Publication

Runtime-owned state transitions publish operation events through the existing Studio event hub. Event publication failure must not corrupt registry state. It is logged/contained as a defect unless the event hub itself is part of the expected operation result.

D4 does not redesign push transport, but it prevents event payloads from reconstructing truth from browser state or app-local stores. D4 also does not migrate the live-game watcher timer; that lifetime belongs to D10 unless operation runtime code starts owning it accidentally.

## App Host Boundary

After D4 implementation, app code may still provide enumerated leaf adapter ports until D5 ports the full workflow pipelines, but it cannot own:

- server identity;
- operation registries;
- TTL pruning;
- active operation lookup;
- cross-operation queue/mutex;
- current-operation projection;
- lifecycle disposal.

Allowed app leaf adapter ports are bounded to deploy runner, filesystem writes/reads, macOS Civ process restart calls, scripting-log reads, and direct-control calls. App adapters cannot receive registry/update callbacks, own phase transitions, classify workflow failures, manage request fingerprints, enforce operation conflicts, or start background workers.

The package context seam must also stop exposing stateful engine functions as the mutation API. App code may inject the bounded leaf adapter ports above, but router mutation procedures call package-owned Effect services. D5 will move workflow pipeline bodies fully into Effect services; D4 must leave no lifecycle island for D5 to rediscover.

Package handler integration tests must include poison lifecycle callbacks in the app/context seam. Those callbacks throw if invoked; router mutations still succeed by resolving `StudioOperationRuntime` from the managed runtime. This prevents a test suite that passes through mocked app-owned engine callbacks.

## Current-Operation Boundary

D4 owns runtime truth and the mechanics for projecting active/recent operation state from internal ADTs. D6 owns the full public `studio.operations.current` adoption/read-model cleanup. D4 implementation must still ensure the current projection reads runtime state, not app-local stores or browser persistence, so D6 can refine the public surface without rediscovering ownership.

If D2.5 implementation has not already removed app-local public DTO authorities, D4 must do that work before closing. The app status helpers at `apps/mapgen-studio/src/features/runInGame/status.ts` and `apps/mapgen-studio/src/features/mapConfigSave/status.ts` may remain only as thin imported/derived helpers over package TypeBox contracts and runtime projections; they cannot own durable DTO shape, mutation shape, or status truth.

## Export And Mutation Privacy

Internal ADT types are package-private implementation details. Privacy tests must cover every public surface, not only the root export: package `exports`, declared subpaths, generated `.d.ts`, negative type tests for `@civ7/studio-server/runtime`, and negative type tests for direct source-runtime imports. If a runtime test helper needs internal ADTs, it must live inside the package test boundary rather than creating a public subpath.

Runtime registries mutate through typed transition commands. Generic public DTO patching is not allowed as durable runtime state authority. Closure tests must search for `Partial<`, `patch`, and update helpers in the runtime/app operation-state area, and must include a transition API test proving registry mutation goes through closed ADT transition functions.

## Packet Blockers

D4 is not accepted while any of the following remain:

- Autoplay lifecycle shape is undecided;
- disposal policy is anything other than interrupt-and-project;
- accepted-then-background semantics are not testable;
- public DTO projection can still mutate internal state directly;
- package/app ownership split leaves `createStudioEngines` as an alternate lifecycle authority;
- package handler tests can still pass with mocked app-owned engine callbacks instead of a real managed runtime;
- review finds unresolved P1/P2 ambiguity.
