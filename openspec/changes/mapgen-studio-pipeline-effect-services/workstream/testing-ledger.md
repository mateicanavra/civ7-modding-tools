# D5 Testing Ledger

Status: draft
Date: 2026-06-14

| Layer | Required proof | Adequacy criterion |
| --- | --- | --- |
| Workflow service unit | fake ports plus real transition command assertions | each workflow emits expected domain transition commands and typed success/failure values |
| Managed runtime integration | real D4 `StudioOperationRuntime` with fake ports | admission, conflicts, current projection, events, TTL, disposal interruption, post-disposal rejection, and same-request idempotency are exercised through the real D4 service |
| Run in Game success | controlled materialization/deploy/setup/log/proof fakes through real runtime | accepted -> materializing -> deploying -> checking/restart/setup/start/proof -> complete with exact proof |
| Run in Game phase/proof matrix | table over every D4 ADT phase and proof link | reload-needed, blocked, uncertain, restart on/off, setup-row reload boundary, marker mismatch, request-id mismatch, setup readback mismatch, and exact-authorship unresolved-link cases map to typed terminal projections |
| Run in Game failure | table over validation, materialization, deploy, restart, setup row, start-game, log proof, exact authorship, timeout, disposal interruption | each failure maps to D3 tag/reason/recovery and no known outcome throws bridge errors |
| Save/Deploy success | fake file store and deploy runner | write then deploy completes with path/deploy diagnostics |
| Save/Deploy rollback | deploy fails after write | previous content restored or new file removed; rollback failure is typed diagnostics |
| Save/Deploy idempotency | same request id active-operation test | same active request returns existing projection; different active request produces D3 `OperationBlocked` |
| Autoplay | fake workflow control and runtime gate | conflict, unavailable, start failed, stop failed, verification failed, and success all use D3/D4 semantics |
| D4 integration | real `StudioOperationRuntime` with fake ports | workflows enter through runtime transition APIs and own no gate/registry/current/event/disposal/idempotency state |
| Game-wire | fake `Civ7TunerSession` | workflow game calls use shared session facade; constructor and per-flow helper scans pass |
| Public raw-control guard | adversarial request samples and descriptor tests | all public Studio/control-oRPC mutation inputs in the D5 corpus reject executable raw command/session/script fields or have explicit untouched-route dispositions; control descriptors retain mutation metadata |
| Handler/context | poison app callbacks | router mutations resolve package workflow services, not app engine callbacks; post-disposal requests do not invoke app adapters |
| Live proof | Play and Save/Deploy against Studio daemon | proof records branch, commit, API path, timestamps, operation id, server identity, log/deploy evidence |
| Negative searches | lifecycle/session/bridge scans | no app workflow authority, no status-code bridge, no unsanctioned session owner, no raw tunnel |

## Run In Game Phase And Proof Matrix

Implementation tests must cover the D4 ADT projections below, not only a happy-path operation:

| Phase or terminal class | Required falsifier |
| --- | --- |
| `accepted` / `blocked` | active operation conflict rejects before materialization and emits D3 `OperationBlocked` |
| `materializing` | invalid source path, failed disposable write, and cleanup interruption restore/remove through `MapConfigStore` |
| `deploying` | deploy failure before launch and deploy interruption run scoped cleanup/finalizer |
| `checking-civ` | direct-control unavailable through shared `Civ7TunerSession` emits D3 dependency failure |
| `restarting-civ` | restart enabled and restart disabled branches both preserve readiness proof boundaries |
| `setup-reload-needed` | invisible setup row records reload diagnostics and does not start the game before reload/readback proof |
| `starting-game` | start command failure and start timeout become typed outcomes with no anonymous thrown bridge errors |
| `waiting-for-proof` | stale log, missing `[mapgen-proof]`, missing `[mapgen-complete]`, marker mismatch, request-id mismatch, config/envelope hash mismatch, seed mismatch |
| `exact-authorship` | generated-source, local-script, deployed-script, materialization-marker, log-marker, and setup-readback links each have an unresolved-link falsifier |
| `uncertain` | proof timeout during start/proof windows projects uncertainty instead of success |
| `disposed` | D4 runtime disposal interrupts waits and no port/game adapter receives calls after disposal |
| `complete` | exact authorship proof is present before success projection |

## Managed Runtime Integration Matrix

These tests use the real D4 `StudioOperationRuntime` service and fake D5 ports:

| Workflow | Runtime property |
| --- | --- |
| Run in Game | admission, active conflict, transition ordering, current projection, event publication, disposal interruption, post-disposal no-game-call |
| Save/Deploy | same-request idempotency, different-request conflict, write/deploy rollback finalizer, current projection, event publication, post-disposal no-write/deploy |
| Autoplay | mutation gate conflict, unavailable/start/stop/verification failures, event publication, post-disposal no-command |

## Packet Acceptance Commands

```bash
bun install --frozen-lockfile
bun run build
bun run check
git status --short --branch
gt status
gt log --no-interactive
bun run openspec -- validate mapgen-studio-pipeline-effect-services --strict
bun run openspec:validate
git diff --check
```

## Future Implementation Commands

```bash
bun run nx run @civ7/studio-server:test --outputStyle=static
bun run nx run @civ7/studio-server:check --outputStyle=static
bun run nx run @civ7/studio-server:build --outputStyle=static
bun run nx run mapgen-studio:test --outputStyle=static
bun run nx run mapgen-studio:check --outputStyle=static
bun run nx run mapgen-studio:build --outputStyle=static
bun run nx run @civ7/control-orpc:check --outputStyle=static
bun run nx run @civ7/control-orpc:test --outputStyle=static
bun run nx run @civ7/control-orpc:build --outputStyle=static
bun run nx run @civ7/direct-control:check --outputStyle=static
bun run nx run @civ7/direct-control:test --outputStyle=static
bun run nx run @civ7/direct-control:build --outputStyle=static
```

Focused file evidence should include pipelineEffectServices, Run in Game,
SaveDeploy, and Autoplay workflow paths, but repo-local Nx targets remain the
closure commands. Direct package-local scripts are supporting evidence only.

Implementation negative-search gates:

```bash
rg -n "runRunInGameStartEngine|runRunInGameStatusEngine|runSaveDeployEngine|runSaveDeployStatusEngine|runAutoplayEngine|studioOperationQueue" apps/mapgen-studio/src packages/studio-server/src -g "*.{ts,tsx}"
rg -n "createStudioEngines|createRunInGameOperationStore|createMapConfigSaveDeployOperationStore|findActive\\(|new Map<|Partial<|patch|update.*State" apps/mapgen-studio/src/server packages/studio-server/src -g "*.{ts,tsx}"
rg -n "StudioEngineError|RunInGameHttpError|statusCode|details\\?: unknown|Type\\.Unknown\\(\\)" apps/mapgen-studio/src/server packages/studio-server/src -g "*.{ts,tsx}"
rg -n "new\\s+Civ7DirectControlSession\\(" apps packages -g "*.{ts,tsx}"
rg -n "withCiv7DirectControlSession" apps/mapgen-studio packages/studio-server -g "*.{ts,tsx}"
rg -n "\\bcommand\\b|operationType|rawCommand|script|javascript|session|stateName|rawJs|context|\\bargs\\b" packages/studio-server/src/contract packages/civ7-control-orpc/src/modules apps/mapgen-studio/src/server -g "*.{ts,tsx}"
rg -n "turbo run|bun x turbo|mod-swooper-maps#build|buildSwooperMapsStudioDeployPlan" apps/mapgen-studio/src packages/studio-server/src -g "*.{ts,tsx}"
```

Hits are not automatically failures. D5 implementation must classify them as sanctioned package owner, bounded port adapter, non-executable status/proof evidence, test fixture, historical evidence, or blocker.
