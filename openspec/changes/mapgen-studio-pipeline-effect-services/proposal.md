# MapGen Studio Pipeline Effect Services

## Why

D4 accepts the operation runtime shell. D5 moves the domain mutation pipelines themselves into package-owned Effect workflow services so Play, Save/Deploy, and Autoplay stop depending on app-hosted Promise engines for validation, phase sequencing, failure classification, proof construction, rollback, or game-wire routing.

The current baseline concentrates product-critical behavior in `apps/mapgen-studio/src/server/studio/engines.ts`: Run in Game materializes a config, builds/deploys the mod, proves generated script identity, optionally restarts Civ7, prepares setup, starts a game, waits for log proof, and assembles exact authorship proof. Save/Deploy writes config files, deploys artifacts, and rolls back on deploy failure. Autoplay performs game mutation through direct-control while conflict checks live beside operation stores. D5 preserves those product behaviors while moving orchestration authority into Effect services under `@civ7/studio-server`.

## Authority

- `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md`
- `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md`
- `openspec/changes/mapgen-studio-engine-effect-corpus/`
- `openspec/changes/mapgen-studio-contract-typebox-spine/`
- `openspec/changes/mapgen-studio-error-spine/`
- `openspec/changes/mapgen-studio-engine-runtime-services/`
- Current evidence:
  - `apps/mapgen-studio/src/server/studio/engines.ts`
  - `apps/mapgen-studio/src/server/runInGame/**`
  - `apps/mapgen-studio/src/server/mapConfigs/**`
  - `apps/mapgen-studio/src/server/studio/context.ts`
  - `packages/studio-server/src/context.ts`
  - `packages/studio-server/src/router/index.ts`
  - `packages/studio-server/src/services/Civ7TunerSession.ts`
  - `packages/civ7-direct-control/src/procedure-core.ts`

## What Changes

- Add the D5 OpenSpec packet for `mapgen-studio-pipeline-effect-services`.
- Specify package-owned `RunInGameWorkflow`, `SaveDeployWorkflow`, and `AutoplayWorkflow` Effect services.
- Specify supporting package-owned ports for `MapConfigStore`, `DeployRunner`, `Civ7ProcessControl`, `ScriptingLog`, `ProofBuilder`, and `Civ7WorkflowControl`.
- Require workflow services to consume D4 `StudioOperationRuntime` admission/transition APIs and D3 typed failure values. Workflows own domain phases; D4 owns registry/gate/current/events.
- Decide the D5 game-wire invariant: Studio workflow services use the daemon runtime's shared `Civ7TunerSession` for direct-control game calls. App code, router leaves, workflow services, and local scripts must not construct `Civ7DirectControlSession`; Studio workflow code must not call `withCiv7DirectControlSession`.
- Preserve Run in Game product behavior: request validation and raw-control rejection, durable/disposable materialization, request fingerprint semantics from D4, marker proof before launch, generated-source/local/deployed script identity, request-id embed proof, optional Civ restart, setup row visibility/reload boundary, setup/start command, mapgen failure sniffing, log marker proof, exact authorship proof, cleanup, and artifact regeneration.
- Preserve Save/Deploy product behavior: request validation, no restart semantics, path jail, envelope validation, previous-file capture, save, deploy, rollback on deploy-phase failure, and deploy diagnostics.
- Preserve Save/Deploy same-request idempotency: an active Save/Deploy with the same `requestId` returns the existing runtime projection and does not start a second write/deploy operation.
- Specify Autoplay as a workflow command behind D4's shared gate with typed `AutoplayFailure` outcomes for conflict, dependency unavailable, start/stop failed, and verification failed.
- Replace mutation lifecycle engine callbacks in `StudioServerContext` with package workflow services and bounded leaf adapter ports.

## Non-Goals

- No D6 browser/current-operation adoption cleanup.
- No D8/D9 push transport redesign beyond workflow transition events flowing through D4/D8 ownership.
- No D10 live-game watcher lifetime migration.
- No D11 dev-process/Nx runner rewrite.
- No raw direct-control procedure redesign inside `@civ7/direct-control`.
- No alternate app-owned workflow bridge, status-code bridge, Promise queue, app registry, or public raw command tunnel.

## Future Implementation Write Set

- `packages/studio-server/src/workflows/**`
- `packages/studio-server/src/ports/**`
- `packages/studio-server/src/services/**`
- `packages/studio-server/src/context.ts`
- `packages/studio-server/src/router/**`
- `packages/studio-server/src/contract/**` only where D2.5/D3 projection closure requires alignment
- `apps/mapgen-studio/src/server/studio/engines.ts`
- `apps/mapgen-studio/src/server/studio/context.ts`
- `apps/mapgen-studio/src/server/runInGame/**`
- `apps/mapgen-studio/src/server/mapConfigs/**`
- `apps/mapgen-studio/src/server/daemon/daemon.ts`
- `apps/mapgen-studio/test/**`
- `packages/studio-server/test/**`
- `packages/civ7-control-orpc/test/**` and `packages/civ7-direct-control/test/**` only when D5 touches game-door guardrails

Protected paths:

- Generated mod/app artifacts.
- D6-D12 OpenSpec packets except explicit downstream realignment notes.
- `@civ7/direct-control` transport/session atoms unless a direct-control package guard test or descriptor metadata update is required by D5.

## Verification Gates

### Packet Acceptance Gates

- `bun install --frozen-lockfile`
- Current packet-authoring base: `bun run build` and `bun run check`
- `git status --short --branch`
- `gt status`
- `gt log --no-interactive`
- `bun run openspec -- validate mapgen-studio-pipeline-effect-services --strict`
- `bun run openspec:validate`
- `git diff --check`
- Workflow-corpus, game-wire/direct-control, TypeScript/schema, testing/parity, hardening/prework, black-ice, and adversarial residue reviews have no unresolved P1/P2 findings.

### Future Implementation Closure Gates

- Package/app gates:
  - `bun run --cwd packages/studio-server test`
  - `bun run --cwd packages/studio-server check`
  - `bun run --cwd packages/studio-server build`
  - `bun run --cwd apps/mapgen-studio test -- test/server/pipelineEffectServices.test.ts test/server/runInGameWorkflow.test.ts test/server/saveDeployWorkflow.test.ts test/server/autoplayWorkflow.test.ts`
  - `bun run --cwd apps/mapgen-studio check`
  - `bun run --cwd apps/mapgen-studio build`
- Focused Run in Game success/failure tests for each phase boundary and D3 failure family.
- Focused Save/Deploy success/failure/rollback tests.
- Focused Autoplay conflict, unavailable, start failed, stop failed, and verification failed tests.
- D4 integration tests proving workflows enter through `StudioOperationRuntime` and do not create their own gate, registry, active lookup, or background worker owner.
- D3 mapper/projection tests proving workflow failures are typed values and no known workflow outcome is thrown as `Error`, `StudioEngineError`, raw `ORPCError`, or status-code truth.
- Game-wire tests proving workflow game calls route through `Civ7TunerSession` or a package-owned service backed by it.
- Direct-control package gates for `@civ7/control-orpc` and `@civ7/direct-control`, or explicit untouched-package dispositions backed by negative scans. When touched, run check/test/build for both packages.
- Direct-control descriptor guard tests remain green: validator-first, send-receipt, post-read proof, no-repeat-after-unverified metadata, no context-owned public inputs, and raw command tunnel rejection.
- Static public DTO types remain schema-derived and no broader than TypeBox runtime validation for touched routes.
- Live Play proof with branch, commit, API path, timestamps, operation id, server identity, materialization proof, setup proof, log proof, and game/map evidence.
- Live Save/Deploy proof with branch, commit, API path, timestamps, operation id, deployed target, and rollback disposition when tested.
- Negative searches:
  - no `runRunInGameStartEngine`, `runRunInGameStatusEngine`, `runSaveDeployEngine`, `runSaveDeployStatusEngine`, `runAutoplayEngine`, or `studioOperationQueue` remains as production workflow authority;
  - no app-local workflow phase transition, workflow failure classification, request fingerprint ownership, registry callback, operation conflict check, or background worker owner;
  - no production `StudioEngineError` / `RunInGameHttpError` construction, catch, import, or mapping;
  - no `new Civ7DirectControlSession` outside sanctioned package owners;
  - no `withCiv7DirectControlSession` use in Studio workflow/app/router code;
  - no public Studio/control-oRPC route accepts executable raw `command`, `operationType`, `rawCommand`, `script`, `javascript`, `rawJs`, `session`, `context`, `stateName`, or generic `args` tunnel fields;
  - `runInGame.start` rejects caller-owned `session`, `context`, `stateName`, `operationType`, and generic `args` tunnels in addition to existing raw command/script keys;
  - no direct `@civ7/direct-control` game-call imports in app workflow orchestration after D5; Studio game calls route through `Civ7WorkflowControl` backed by shared `Civ7TunerSession`.
