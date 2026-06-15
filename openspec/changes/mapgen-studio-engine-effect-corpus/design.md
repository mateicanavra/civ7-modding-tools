# Design - Engine Effect Corpus

## Component Role

D2 is the runtime ownership map. It does not move code. It names the code that must move, the code that must remain under existing package authority, and the later domino that owns each migration or deletion.

The target system has one Studio operation runtime in `@civ7/studio-server`. App code composes the runtime, supplies host resources, and mounts `/rpc`; it does not own operation registries, mutation gates, background workers, failure unions, or live event publication as ad hoc closures.

## Classification Model

Every corpus row has:

- source path and symbol;
- current owner;
- target owner;
- classification;
- next domino;
- risk if omitted;
- proof oracle.

The classifications are normative:

- `studio-runtime-scope`: must be migrated into Studio Effect services.
- `retained-package-authority`: already belongs to a package outside Studio operation runtime; D2 records it so future slices do not steal it.
- `future-domino`: D2 records the owner domino but does not require immediate migration.
- `delete-or-collapse`: the source should disappear or become composition-only after its owner domino lands.

## Studio Runtime Scope

The following are in Studio runtime scope:

- `createStudioEngines` and `StudioEngines` host closure surface.
- `studioOperationQueue`.
- `runInGameOperations` and `saveDeployOperations`.
- `serverInstanceId` and `serverStartedAt`.
- `runAutoplayEngine`.
- `runRunInGameStartEngine` and `runRunInGameStatusEngine`.
- `runSaveDeployEngine` and `runSaveDeployStatusEngine`.
- `currentOperations`.
- `deploySwooperMaps`, `deploySwooperMapsForRun`, and `buildSwooperMapsStudioDeployPlan` consumption.
- map config materialization, restore, rollback, generated artifact regeneration, and path guards.
- Civ process restart helpers used by Run in Game.
- scripting-log snapshot/read/failure polling.
- exact-authorship proof building and materialization proof assembly.
- operation event publication from engine stores.
- `StudioServerContext` host-injected stateful function fields.

## Retained Package Authority

The following stay under existing package authority:

- `@civ7/direct-control`: raw FireTuner/session/protocol atoms, setup/run/autoplay functions, proof policies, clean-frame/camera/window-capture atoms, and game UI mutation atoms.
- `@civ7/control-orpc`: native oRPC procedure contracts, TypeBox schemas, mutation readiness/proof-boundary middleware, semantic game UI procedures, controller ingress, and behavior-based display/view state machines such as explore grants, display queue close/current, camera focus, and appshot capture.
- Existing `@civ7/studio-server` read services: `Civ7TunerSession`, `Civ7TunerClient`, and live read model functions remain package-owned, but D10 may change watcher lifecycle ownership.
- `StudioEventHub` is already an Effect-backed package service; D8 owns whether app-local publishers collapse into a package-owned operation event publisher.

## Service Map For Later Dominoes

- D2.5 `mapgen-studio-contract-typebox-spine`: public DTO and error schema origin.
- D3 `mapgen-studio-error-spine`: sealed failure union and active `StudioEngineError`/status-code transport bridge deletion, including any stale historical `RunInGameHttpError` residue if present on a target baseline.
- D4 `mapgen-studio-engine-runtime-services`: operation runtime, gate, registries, server identity, TTL, worker disposal, Autoplay decision.
- D5 `mapgen-studio-pipeline-effect-services`: deploy runner, map config materialization, Civ process control, scripting log, proof builder as Effect services.
- D6 `mapgen-studio-operations-current`: current operation projection and daemon-truth adoption.
- D7 `mapgen-studio-stream-spike`: streaming/push proof spike if retained after D6.
- D8 `mapgen-studio-event-hub`: operation event publisher service and event hub ownership.
- D9 `mapgen-studio-operations-push`: operation push transport over the accepted event hub.
- D10 `mapgen-studio-live-game-watch`: live-game watcher lifetime and polling service.
- D11 `mapgen-studio-nx-dev-runner`: dev process ownership.
- D12 `mapgen-studio-game-door-invariant`: final negative-search closeout across raw runtime doors.

## Testing Strategy

D2 tests the corpus, not migrated behavior. Its proofs are inventory and omission guards:

- static positive scans for stateful engine symbols and host-injected function fields;
- static positive scan for `civ7ControlOrpcMutationProcedure` procedure declarations;
- static positive scan for retained behavior-based `@civ7/control-orpc` state machines that coordinate display queue, visibility grant, clean-frame, camera, or capture state without using the mutation helper;
- ledger coverage test or script that fails when a discovered symbol/procedure lacks a row;
- review assertion that every D2 frame-required item maps to a ledger row;
- shortcut scan proving D2 does not encode implementation fallback/dual-path language.

Implementation packets that consume D2 may replace the static corpus script with a Habitat/GritQL rule. D2 records the desired rule shape but does not require the enforcement migration.
