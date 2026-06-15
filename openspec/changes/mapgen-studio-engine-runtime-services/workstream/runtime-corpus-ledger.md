# D4 Runtime Corpus Ledger

Status: accepted
Date: 2026-06-14

| Surface | Current evidence | D4 target | Risk if omitted | Oracle |
| --- | --- | --- | --- | --- |
| Runtime singleton / engine seam | App closure in `createStudioEngines`; package context injects stateful engine functions. | `@civ7/studio-server` `StudioOperationRuntime`; app composes env/ports only. | hidden app singleton survives behind package router. | handler integration test with real managed runtime and app composition-only test. |
| Server identity | `createStudioEngines` creates `serverInstanceId` / `serverStartedAt`. | `StudioOperationRuntime` owns identity per managed runtime. | status miss/restart truth remains app closure state. | singleton-per-runtime and fresh-runtime tests. |
| Cross-operation gate | `createStudioEngines` checks active Run/Save stores before Run, Save, and Autoplay. | one Effect Semaphore/Queue gate in `StudioOperationRuntime`. | conflicts can diverge by operation path. | cross-operation matrix tests. |
| Run in Game registry | D4 deletes `createRunInGameOperationStore` and its app-local test corpus. | package runtime stores internal Run ADTs and projects public DTOs. | public DTO shape becomes internal mutable state. | ADT projection, export privacy tests, and negative search for app-local store imports. |
| Save/Deploy registry | D4 deletes `createMapConfigSaveDeployOperationStore` and its app-local test corpus. | package runtime stores internal Save ADTs and projects public DTOs. | rollback/failure state remains patch-based. | Save projection, TTL tests, and negative search for app-local store imports. |
| Autoplay lifecycle | `runAutoplayEngine` performs conflict checks and direct-control calls as loose Promise command. | typed immediate command admitted through runtime gate. | Autoplay remains a side channel. | Autoplay conflict/start/stop/verification tests. |
| Background workers | Run/Save start create accepted operation then run async work through manual Promise flow. | runtime-supervised scoped fibers or service-owned fiber registry. | worker outlives runtime or disappears on disposal. | accepted-then-background and disposal tests. |
| Current projection | `operationsCurrent` composes app store lists. | runtime-owned current projection from internal registries. | D6 receives reconstructed app truth. | current projection tests and negative search. |
| Event publication | app engine store updates publish events through callbacks. | runtime-owned transition publication with contained publisher failure. | events drift from state transitions. | event publication failure containment test. |
| TTL/status miss | app stores prune Maps and status engines throw `StudioEngineError` 404. | runtime TTL policy returns D3 lifecycle/not-found failures with identity, including typed expiry before physical prune. | restart/expired outcomes remain status-code bridge residue. | TTL/status miss identity tests and tombstone horizon tests. |
| Disposal | no managed runtime disposal projection for in-flight operations. | interrupt-and-project `runtime-disposed`. | shutdown leaves hanging workers or anonymous failures. | dispose accepted/running worker tests. |
| Package Effect wrapper | router uses Effect around host fns rather than runtime services. | router calls typed Effect services from managed runtime. | Effect remains a boundary wrapper, not lifecycle ownership. | handler integration tests without mocked engine callbacks. |
| Live watcher background timer | package live watcher owns timer outside mutation runtime. | D10 live-game watch service, not D4. | D4 overclaims background workers and tangles live-watch scope. | D4 negative search targets `StudioOperationRuntime`; D10 owns watcher disposal. |
