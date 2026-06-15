## ADDED Requirements

### Requirement: Studio Operation Runtime Owns Lifecycle State

D4 SHALL move Studio mutation lifecycle ownership into a package-owned Effect service.

#### Scenario: Runtime service owns singleton state

- **WHEN** the Studio daemon builds its managed runtime
- **THEN** `StudioOperationRuntime` owns server identity, operation registries, active slots, TTL metadata, current-operation projection, mutation gate, and worker supervision
- **AND** those values live in Effect runtime state such as `Ref`, `SynchronizedRef`, `Semaphore`, `Queue`, scoped fibers, or service-owned fiber registries
- **AND** app-local closures do not own alternate registries, active slots, TTL pruning, server identity, or queue semantics
- **AND** operation transition events originate from runtime-owned state transitions
- **AND** the runtime service is provided by a lifecycle-owning `Layer.scoped`

#### Scenario: One runtime has one identity

- **WHEN** multiple procedures use the same managed runtime
- **THEN** they observe the same `serverInstanceId` and `serverStartedAt`
- **AND** two separately created runtimes have distinct identity and empty registries

#### Scenario: Handler uses package runtime service

- **WHEN** Studio mutation procedures are called through the package RPC handler
- **THEN** they resolve `StudioOperationRuntime` from the managed runtime
- **AND** they do not call app-owned lifecycle engine callbacks supplied through `StudioServerContext`

### Requirement: Mutation Admission Uses One Effect Gate

D4 SHALL route Run in Game, Save/Deploy, and Autoplay mutation admission through one Effect-owned gate.

#### Scenario: Cross-operation conflicts are runtime-owned

- **GIVEN** a Run in Game, Save/Deploy, or Autoplay mutation is active
- **WHEN** another Civ-mutating operation starts
- **THEN** `StudioOperationRuntime` rejects it with a D3 `OperationBlocked` failure
- **AND** app-host engines do not perform their own active-store conflict checks

#### Scenario: Duplicate Run in Game fingerprints are runtime-owned

- **GIVEN** a Run in Game request fingerprint is known to `StudioOperationRuntime`
- **WHEN** the same fingerprint starts again
- **THEN** the runtime returns the existing operation projection for accepted, running, complete, or failed records according to D3/D4 status rules
- **AND** it does not create a second operation
- **AND** fingerprint ownership does not live in `createStudioEngines` or app-local operation stores
- **AND** expired or daemon-identity-mismatched fingerprints return the applicable D3 failure data instead of silently becoming a new operation

#### Scenario: Autoplay is a typed immediate command

- **WHEN** Autoplay starts or stops
- **THEN** it is admitted through the shared runtime gate
- **AND** it uses D3 `AutoplayFailure` outcomes
- **AND** it does not remain a loose Promise command with Run-in-Game-named errors

### Requirement: Runtime Stores Internal ADTs And Projects Public DTOs

D4 SHALL store closed internal operation ADTs and project TypeBox-backed public DTOs.

#### Scenario: Projection is exhaustive

- **WHEN** any Run in Game, Save/Deploy, or Autoplay internal state variant is projected
- **THEN** the projection is compile-time exhaustive
- **AND** the public DTO contains only TypeBox-backed wire fields
- **AND** internal workflow-only fields are absent from every public package surface, including root exports, declared subpaths, generated `.d.ts`, package `exports`, `@civ7/studio-server/runtime`, and source-runtime imports

#### Scenario: Status misses preserve daemon identity

- **WHEN** Run in Game or Save/Deploy status receives an unknown, expired, or identity-mismatched request id
- **THEN** the projected D3 failure data includes current daemon identity where required
- **AND** a fresh runtime starts with empty registries

#### Scenario: Current projection reads runtime truth

- **WHEN** `studio.operations.current` reads active or recent operation state during D4 implementation
- **THEN** the source of truth is `StudioOperationRuntime`
- **AND** app-local operation stores, browser persistence, or mocked context callbacks cannot reconstruct operation truth

#### Scenario: Operation events originate from runtime transitions

- **WHEN** a runtime-owned operation state transition occurs
- **THEN** `StudioOperationRuntime` publishes the operation event from the runtime projection
- **AND** event publisher failure does not corrupt registry state
- **AND** D8/D9 remain responsible for transport and push delivery shape

#### Scenario: Expired operations are typed before pruning

- **GIVEN** a terminal retained operation whose request id is known to the runtime
- **WHEN** the operation ages past its status TTL
- **THEN** status lookup projects D3 `OperationExpired` with current daemon identity before the record is physically pruned
- **AND** active workers are not pruned as stale terminal records

### Requirement: Start Calls Are Accepted Then Backgrounded

D4 SHALL preserve accepted-then-background operation semantics under Effect supervision.

#### Scenario: Start returns accepted state promptly

- **WHEN** Run in Game or Save/Deploy start is admitted
- **THEN** the runtime records and returns accepted operation state before the long-running worker completes
- **AND** the worker updates registry state under runtime supervision after the response

#### Scenario: Background workers are scoped

- **WHEN** a long-running operation worker is started
- **THEN** it is supervised by `StudioOperationRuntime` through scoped Effect fibers or an explicit service-owned fiber registry
- **AND** no unscoped Promise worker is the durable owner of operation lifecycle

#### Scenario: App daemon is composition only

- **WHEN** the app daemon mounts the Studio RPC handler
- **THEN** it supplies env/config/ports and leaf adapters only
- **AND** it does not create operation registries, queues, status truth, lifecycle identity, or disposal ownership
- **AND** app adapters cannot receive registry/update callbacks, own phase transitions, classify workflow failures, manage request fingerprints, enforce operation conflicts, or start background workers

### Requirement: Runtime Disposal Is Deterministic

D4 SHALL define deterministic behavior when the managed runtime is disposed with in-flight operations.

#### Scenario: Disposal projects runtime-disposed state

- **GIVEN** an accepted or running operation
- **WHEN** the managed runtime is disposed
- **THEN** the runtime interrupts the worker
- **AND** the operation registry projects a deterministic `runtime-disposed` state using D3 `RuntimeDisposed` failure data
- **AND** the result is not an anonymous defect or dropped operation

#### Scenario: Disposal rejects new admission

- **GIVEN** the managed runtime has started disposal or has completed disposal
- **WHEN** Run in Game, Save/Deploy, or Autoplay start is requested
- **THEN** admission fails with D3 `RuntimeDisposed`
- **AND** no operation registry entry is created
- **AND** no accepted event is published
- **AND** no leaf workflow adapter is called
