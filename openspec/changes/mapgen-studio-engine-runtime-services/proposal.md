# MapGen Studio Engine Runtime Services

## Why

D3 accepted the typed error spine. D4 consumes it by moving Studio mutation lifecycle ownership out of app-hosted closures and into an Effect-owned runtime service. The product outcome is one reliable daemon runtime that owns admission, concurrency, identity, registries, TTL, current-operation projection, background worker lifetime, and disposal semantics.

Today `createStudioEngines` owns process-singleton state with app-local Maps, manual queue/mutex checks, server identity strings, TTL pruning, current-operation projection, and background Promise workers. Run in Game and Save/Deploy operation stores mutate public status shapes directly. Autoplay performs conflict checks as a loose Promise command. That was a useful extraction step, but it is no longer the target architecture.

## Authority

- `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md`
- `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md`
- `openspec/changes/mapgen-studio-engine-effect-corpus/`
- `openspec/changes/mapgen-studio-contract-typebox-spine/`
- `openspec/changes/mapgen-studio-error-spine/`
- Current evidence:
  - `apps/mapgen-studio/src/server/studio/engines.ts`
  - `apps/mapgen-studio/src/server/runInGame/operationState.ts`
  - `apps/mapgen-studio/src/server/mapConfigs/operationState.ts`
  - `apps/mapgen-studio/src/server/studio/context.ts`
  - `packages/studio-server/src/context.ts`
  - `packages/studio-server/src/router/index.ts`

## What Changes

- Add the D4 OpenSpec packet for `mapgen-studio-engine-runtime-services`.
- Specify `StudioOperationRuntime` as a lifecycle-owning Effect service provided by `Layer.scoped`; `Layer.effect` is allowed only for pure helper sublayers that own no fibers, finalizers, mutable lifecycle state, or disposal behavior.
- Move operation admission, cross-operation mutation gate, active-slot checks, server identity, TTL metadata, operation registries, current-operation projection, event publication hooks, and disposal policy into package-owned runtime services.
- Require Run in Game and Save/Deploy internal operation state to be closed ADTs. Public DTOs are projections, not the mutation storage shape.
- Preserve Run in Game duplicate request fingerprint idempotency as runtime-owned behavior: duplicate starts with the same request fingerprint return the existing accepted/running/terminal operation projection according to the D3/D4 status rules instead of creating a second operation or bypassing the mutation gate.
- Specify Autoplay as a typed immediate runtime command admitted through the same mutation gate and D3 failure vocabulary. It does not get a public TTL registry in D4.
- Require accepted-then-background semantics: start calls record/return accepted operation state promptly, then scoped workers update registry and publish events.
- Require deterministic runtime disposal semantics: in-flight workers are interrupted on `ManagedRuntime` disposal and projected as `runtime-disposed` with D3 `RuntimeDisposed` data.
- Require D4 implementation to delete app-local registry/queue/server-identity ownership from `createStudioEngines`; app code may remain as environment and leaf workflow adapters until D5.
- Require package handler integration tests to prove router procedures call the package-owned runtime service through one managed runtime, not mocked app-owned engine callbacks.

## Non-Goals

- No D5 port of the full Run in Game / SaveDeploy pipeline internals into Effect workflow services.
- No D6 public current-operation contract redesign beyond projecting from the new runtime service.
- No D8/D9 event transport redesign beyond publishing operation events from runtime-owned state transitions.
- No D10 live-game watcher lifetime migration. Existing live watcher timers are outside the D4 operation-runtime scope unless they are accidentally wired into operation lifecycle.
- No dev-process/Nx task-runner rewrite.
- No alternate runtime library, Arc adoption, Promise queue shim, dual registry path, or app-owned lifecycle fallback.

## Future Implementation Write Set

- `packages/studio-server/src/runtime/**`
- `packages/studio-server/src/services/**`
- `packages/studio-server/src/context.ts`
- `packages/studio-server/src/router/**`
- `packages/studio-server/src/contract/**` only where projection DTO composition requires D2.5/D3 alignment
- `apps/mapgen-studio/src/server/studio/engines.ts`
- `apps/mapgen-studio/src/server/studio/context.ts`
- `apps/mapgen-studio/src/server/runInGame/operationState.ts`
- `apps/mapgen-studio/src/server/mapConfigs/operationState.ts`
- `apps/mapgen-studio/test/**`
- `packages/studio-server/test/**`

Protected paths:

- D5-D12 OpenSpec packets except downstream realignment notes.
- Direct-control atom implementations unless D4 implementation touches command routing; if untouched, record negative scans.
- Generated mod/app artifacts.

## Verification Gates

### Packet Acceptance Gates

- `bun install --frozen-lockfile`
- Current packet-authoring base: `bun run build` and `bun run check`
- `git status --short --branch`
- `gt status`
- `gt log --no-interactive`
- `bun run openspec -- validate mapgen-studio-engine-runtime-services --strict`
- `bun run openspec:validate`
- `git diff --check`
- Runtime-corpus, Effect/lifecycle, TypeScript/schema, testing/parity, hardening/prework, black-ice, and adversarial residue reviews have no unresolved P1/P2 findings.

### Future Implementation Closure Gates

- Package/app gates:
  - `bun run --cwd packages/studio-server test`
  - `bun run --cwd packages/studio-server check`
  - `bun run --cwd packages/studio-server build`
  - `bun run --cwd apps/mapgen-studio test -- test/server/engineRuntimeServices.test.ts test/server/studioRuntimeComposition.test.ts`
  - `bun run --cwd apps/mapgen-studio check`
  - `bun run --cwd apps/mapgen-studio build`
- Singleton-per-runtime tests.
- Cross-operation mutation gate tests covering Run in Game, Save/Deploy, and Autoplay.
- Duplicate Run in Game request fingerprint table tests covering accepted, running, complete, failed, expired, and identity-mismatched cases, with fingerprint ownership inside `StudioOperationRuntime`.
- Accepted-then-background execution tests.
- Runtime disposal tests for accepted/running workers and post-disposal admission.
- Handler integration tests using one real `createStudioRpcHandler` and one `ManagedRuntime`, proving router calls hit package services instead of mocked `StudioServerContext` engine callbacks.
- Poison-callback handler tests: app/context lifecycle callbacks throw if invoked, while router mutations still pass through the managed runtime service.
- App daemon composition tests proving app code supplies env/config/ports and does not create registries, queues, status truth, or lifecycle identity.
- TTL/status-miss and daemon-restart truth tests.
- Compile-time exhaustiveness tests for internal ADT projection.
- Table-driven projection tests from every Run in Game, Save/Deploy, and Autoplay internal phase/outcome to public DTOs.
- Public export/privacy tests proving internal ADT types are absent from every public package surface: root exports, declared subpaths, generated `.d.ts`, package `exports`, and negative type tests for runtime/source imports.
- D2.5 DTO authority closeout gate: either D2.5 implementation has already removed app-local DTO authorities, or D4 must rewrite/delete the app operation-state tests and prove app feature status modules derive from package TypeBox DTO/projection contracts instead of preserving public DTO mirrors.
- Negative searches:
  - no app-local registry, active-slot, TTL, queue, or server identity ownership in `createStudioEngines`;
  - no app-local Run in Game fingerprint store or duplicate-start owner in `createStudioEngines`;
  - no mutation lifecycle engine functions (`runRunInGameStartEngine`, `runRunInGameStatusEngine`, `runSaveDeployEngine`, `runSaveDeployStatusEngine`, `runAutoplayEngine`) remain as the package context seam;
  - no app-local `runAutoplayEngine` conflict checks or Run-in-Game-named errors;
  - no partial-patch operation state mutation helper, generic `Partial<...>` state update, or `patch` helper as durable runtime state authority;
  - no app-local public DTO status authority in `apps/mapgen-studio/src/features/runInGame/status.ts` or `apps/mapgen-studio/src/features/mapConfigSave/status.ts` unless it is purely imported/derived from package contracts;
  - no unscoped background `Promise`, `setTimeout`, or daemon-worker ownership in `StudioOperationRuntime`;
  - no production status-code bridge resurrection from D3;
  - no new `effect-orpc` imports outside router/runtime ownership.
