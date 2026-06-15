# D4 Testing Ledger

Status: accepted; implementation proof pass complete and committed on current branch tip
Date: 2026-06-14; implementation refresh 2026-06-15

| Layer | Required proof | Adequacy criterion |
| --- | --- | --- |
| Runtime singleton | construct two managed runtimes | same runtime identity is stable; separate runtimes have distinct identity and empty registries |
| Handler integration | one `createStudioRpcHandler` plus one managed runtime and poison app callbacks | router mutation procedures hit package runtime services, not mocked app-owned engine callbacks |
| App composition | daemon composition tests | app supplies env/config/ports only and creates no registries, queues, status truth, lifecycle identity, or disposal ownership |
| Mutation gate | cross-operation table tests | Run in Game, Save/Deploy, and Autoplay all conflict through the same runtime gate |
| Duplicate fingerprints | Run in Game fingerprint table tests | duplicate starts for accepted/running/complete/failed records return the existing runtime projection; expired or identity-mismatched fingerprints use D3 failure data; app code owns no fingerprint store |
| Accepted/background | controlled worker tests | start returns accepted state before worker completes; worker completion updates registry later |
| Disposal | scoped worker interruption and post-disposal admission tests | disposing runtime with accepted/running operation projects deterministic `runtime-disposed` state; post-disposal starts fail with `RuntimeDisposed`, create no registry entry, publish no accepted event, and call no leaf adapter |
| Internal ADT projection | compile-time exhaustiveness plus table tests | every Run, Save, and Autoplay variant projects to public DTO; adding a variant fails until projected |
| Public export privacy | package export/type tests | internal ADTs are absent from root exports, declared subpaths, generated `.d.ts`, package `exports`, `@civ7/studio-server/runtime`, and source-runtime imports |
| TypeBox DTO boundary | Value.Check/Parse samples | projected public DTOs validate against D2.5 TypeBox schemas and contain no workflow-only fields |
| TTL/status miss | fake-clock tests | expired/missing/identity-mismatched status outcomes include required D3 daemon identity data; terminal expiry has a typed tombstone horizon before physical prune; active records are not pruned |
| Event publication | fake hub tests | every state transition publishes expected event; publisher failure does not corrupt registry state |
| D4/D6 boundary | current projection source test | runtime state is the source of truth while D6 remains responsible for public adoption/read-model cleanup |
| Negative searches | lifecycle ownership scans | no app-local registry/gate/identity/current truth, partial-patch state authority, app-local DTO status authority, unscoped worker owner, D3 bridge resurrection, or effect-orpc import drift |

## Packet Acceptance Commands

```bash
bun install --frozen-lockfile
bun run build
bun run check
git status --short --branch
gt status
gt log --no-interactive
bun run openspec -- validate mapgen-studio-engine-runtime-services --strict
bun run openspec:validate
git diff --check
```

## Future Implementation Commands

```bash
bun run --cwd packages/studio-server test
bun run --cwd packages/studio-server check
bun run --cwd packages/studio-server build
bun run --cwd apps/mapgen-studio test -- test/server/engineRuntimeServices.test.ts test/server/studioRuntimeComposition.test.ts
bun run --cwd apps/mapgen-studio check
bun run --cwd apps/mapgen-studio build
```

Implementation negative-search gates:

```bash
rg -n "serverInstanceId|serverStartedAt|createRunInGameOperationStore|createMapConfigSaveDeployOperationStore|findActive\\(|new Map<|RUN_IN_GAME_OPERATION_TTL_MS|operation queue|mutex|queue" apps/mapgen-studio/src/server/studio apps/mapgen-studio/src/server/runInGame apps/mapgen-studio/src/server/mapConfigs -g "*.{ts,tsx}"
rg -n "requestFingerprint|fingerprint|duplicate|existingOperation|operationByRequest" apps/mapgen-studio/src/server/studio apps/mapgen-studio/src/server/runInGame apps/mapgen-studio/src/server/mapConfigs -g "*.{ts,tsx}"
rg -n "runAutoplayEngine|runRunInGameStartEngine|runRunInGameStatusEngine|runSaveDeployEngine|runSaveDeployStatusEngine|run-in-game-operation-active|save-deploy-operation-active" apps/mapgen-studio/src/server/studio packages/studio-server/src/context.ts -g "*.{ts,tsx}"
rg -n "Partial<|patch|update.*State|merge.*State|\\.\\.\\.previous|\\.\\.\\.state" apps/mapgen-studio/src/server/runInGame apps/mapgen-studio/src/server/mapConfigs packages/studio-server/src/runtime packages/studio-server/src/services -g "*.{ts,tsx}"
rg -n "RunInGame.*Status|MapConfig.*Status|public.*status|status.*DTO|Type\\.Object|Type\\.Union" apps/mapgen-studio/src/features/runInGame/status.ts apps/mapgen-studio/src/features/mapConfigSave/status.ts -g "*.{ts,tsx}"
rg -n "new Promise|setTimeout|forkDaemon|void .*Promise|\\.then\\(" packages/studio-server/src/runtime packages/studio-server/src/services -g "*.{ts,tsx}"
rg -n "StudioEngineError|RunInGameHttpError|statusCode|details\\?: unknown|Type\\.Unknown\\(\\)" apps/mapgen-studio/src/server packages/studio-server/src -g "*.{ts,tsx}"
rg -n "from ['\\\"]effect-orpc['\\\"]|effect-orpc" packages/studio-server/src -g "*.ts"
rg -n "\"exports\"|@civ7/studio-server/runtime|src/runtime|operationTypes|runtime-disposed" packages/studio-server/package.json packages/studio-server/src packages/studio-server/test -g "*.{json,ts,tsx,d.ts}"
```

Hits are not automatically failures. D4 implementation must classify them as removed lifecycle ownership, leaf adapter code, router/runtime ownership, D10 live-watcher ownership, historical evidence, or a blocker. Do not run background-worker searches globally against the existing live-game watcher and treat that as a D4 blocker unless D4 code starts owning it.

## Implementation Proof Results

Passed on 2026-06-15:

```bash
bun run --cwd packages/studio-server check
bun run --cwd packages/studio-server test
bun run --cwd packages/studio-server test -- test/operationRuntime.test.ts test/handler.test.ts
bun run --cwd packages/studio-server test -- test/operationRuntime.test.ts -t "returns duplicate Run in Game fingerprint after a failed terminal record"
bun run --cwd packages/studio-server build
bun run --cwd apps/mapgen-studio check
bun run --cwd apps/mapgen-studio build
bun run --cwd apps/mapgen-studio test -- test/server/oneMount.test.ts test/server/engineEffectCorpus.test.ts test/runInGame/proofIdentity.test.ts
```

Exact public declaration privacy proof after `packages/studio-server` build:

```bash
rg --pcre2 -n "\b(RunInGameInternalOperation|SaveDeployInternalOperation|RegistryState|RuntimeActiveSlot|RuntimeTombstone|RuntimeRegistry|StudioOperationRuntime|StudioOperationRuntimeApi|makeStudioOperationRuntimeLayer)\b" packages/studio-server/dist/index.d.ts packages/studio-server/dist/contract/index.d.ts packages/studio-server/dist/liveGame/model.d.ts packages/studio-server/dist/index-*.d.ts packages/studio-server/package.json
```

Result: zero hits. The bundled public DTS still exports the host leaf-port type
`StudioOperationRuntimePorts`; that is the app-to-package port contract, not an
internal registry/state ADT or the private `StudioOperationRuntime` service
graph. `packages/studio-server/package.json` declares only `.`, `./contract`,
and `./live-game` exports; there is no `./runtime` or `./operationRuntime`
public package subpath.

Lifecycle-island scan:

```bash
rg -n "createStudioEngines|StudioEngines|createRunInGameOperationStore|createMapConfigSaveDeployOperationStore|studioOperationQueue|runRunInGameStartEngine|runRunInGameStatusEngine|runSaveDeployEngine|runSaveDeployStatusEngine|runAutoplayEngine|operationsCurrent\(|publishOperation|operationEvent" apps/mapgen-studio/src/server/studio apps/mapgen-studio/src/server/daemon -g "*.ts" -g "*.tsx"
```

Result: zero hits. The old app operation-state source/tests are deletion
evidence in this slice, not retained proof truth.

Runtime-private import scan:

```bash
rg -n "@civ7/studio-server/(operationRuntime|runtime)|src/operationRuntime|src/runtime|@civ7/studio-server/runtime" apps/mapgen-studio packages -g "*.ts" -g "*.tsx" -g "*.d.ts" -g "package.json"
```

Result/classification: app code has no private package-runtime imports. Hits are
limited to D4 corpus tests/ledgers, package-local runtime tests, and unrelated
`@civ7/direct-control` runtime source names.

Bridge-residue scan:

```bash
rg -n "RunInGameHttpError|StudioEngineError|run-in-game-operation-active|save-deploy-operation-active|details\?: unknown|Type\.Unknown\(\)" apps/mapgen-studio/src/server packages/studio-server/src -g "*.ts" -g "*.tsx"
```

Result/classification: no D3 bridge error hits. Remaining `Type.Unknown()`
hits are D2.5 public contract open-value fields such as setup/config/envelope
payloads, not the old `details?: unknown` error bridge.

Browser-runner / preview residual scan:

```bash
rg -n "browser-runner|watchdog|poll|preview|devLive|browser test|browser-test|browserTest" apps/mapgen-studio/src apps/mapgen-studio/test packages/studio-server/src openspec/changes/mapgen-studio-engine-runtime-services -g "*.ts" -g "*.tsx" -g "*.md"
```

Result/classification: browser-runner/preview/devLive residue remains outside
D4. D4 claims only removal of the old app operation lifecycle island and package
operation-runtime ownership; D6, D9, D10, and D12 own browser recovery,
poll/watchdog, live-status cadence, and final residue classification.

Live Civ7 Play/Save&Deploy proof is not claimed by D4.
