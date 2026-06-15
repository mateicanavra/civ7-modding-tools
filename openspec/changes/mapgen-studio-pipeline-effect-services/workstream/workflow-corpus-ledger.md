# D5 Workflow Corpus Ledger

Status: draft corpus
Date: 2026-06-14

| Surface | Current evidence | D5 target | Risk if omitted | Oracle |
| --- | --- | --- | --- | --- |
| Run in Game orchestrator | `engines.ts` `runRunInGameStartEngine` validates, materializes, deploys, restarts, starts game, waits proof, completes/fails store. | `RunInGameWorkflow` Effect service with typed transitions and failures. | Play remains an app Promise engine. | Package workflow tests and negative search for engine authority. |
| Run in Game validation/raw guard | `runInGame/requestValidation.ts` throws `Error`, rejects raw command/script keys. | Package-owned parse/validation returning typed `InvalidRequest`; raw guard remains exhaustive. | Raw command tunnel or throwable validation survives. | Parser/adversarial raw-field tests. |
| Materialization store | `materializeRunInGameConfig`, `restoreRepoConfig`, path jail, disposable cleanup. | `MapConfigStore` port plus package workflow policy. | Config writes remain app-owned and rollback cleanup drifts. | Path-jail, durable/disposable, cleanup tests. |
| Deploy runner | `deploySwooperMaps`, `deploySwooperMapsForRun`, `regenerateSwooperMapArtifacts`. | `DeployRunner` port with run-id env proof and deploy diagnostics. | Deploy graph can bypass D1/D11 proof or lose run-id embed. | Deploy runner fake tests and live proof. |
| Proof builder | `proofIdentity.ts` helpers plus inline exact-authorship assembly. | `ProofBuilder` port/service with materialization and exact-authorship proof APIs. | Play can launch stale scripts or lose exact proof. | Marker, request-id embed, log proof, exact-authorship tests. |
| Scripting log | `snapshotFile`, `readFreshLogText`, `waitForFreshLogMarkers`, `waitForCiv7MapgenLogFailure`. | `ScriptingLog` port with fake-clock/fake-log tests. | Timeouts/mapgen failures collapse into defects. | Start/proof failure sniffing tests. |
| Civ process restart | `restartCiv7ProcessViaSteam`, `macosProcessRestart.ts`. | `Civ7ProcessControl` port with platform/timeout typed failures. | Restart recovery remains app-local or untestable. | macOS restart adapter tests and non-mac unsupported test. |
| Civ setup/start/autoplay calls | direct imports from `@civ7/direct-control` in app engines. | `Civ7WorkflowControl` backed by shared `Civ7TunerSession`. | Unsanctioned sessions and wedge-prone routing return. | Session-owner negative searches and fake shared-session tests. |
| Save/Deploy orchestrator | `runSaveDeployEngine` validates, writes, deploys, rolls back, updates store. | `SaveDeployWorkflow` Effect service with typed rollback diagnostics. | Save/Deploy remains app workflow island. | Save/deploy/rollback tests and engine negative search. |
| Save/Deploy same-request idempotency | `runSaveDeployEngine` returns the active operation when `requestId` matches. | D4/D5 runtime projection returns existing operation without starting a second worker. | Duplicate save/deploy writes can race or old idempotency disappears. | Same-request and different-request active-operation tests. |
| Autoplay command | `runAutoplayEngine` conflict checks and direct-control call. | `AutoplayWorkflow` typed command through D4 gate and shared session. | Autoplay remains side channel. | Conflict/unavailable/start/stop/verification tests. |
| Package context seam | `StudioServerContext` exposes autoplay/run/save/status/current callbacks. | Package services resolved from managed runtime; app supplies ports. | Router still delegates to app engines. | Poison-callback handler tests and context type scan. |

## Public Mutation Guard Corpus

D5's raw-control guard corpus is every public Studio mutation in the workflow migration plus every control-oRPC procedure whose descriptor declares `risk: "mutation"`. D5 does not redesign unrelated control-oRPC business semantics, but implementation closure must prove these public mutation inputs do not accept executable raw tunnel fields or record an explicit untouched-route disposition backed by the same generated/adversarial scan.

### Studio Mutations

| Public mutation | D5 disposition |
| --- | --- |
| `runInGame.start` | closed D2.5 TypeBox DTO; rejects `command`, `operationType`, `rawCommand`, `script`, `javascript`, `rawJs`, `session`, `context`, `stateName`, and generic executable `args` |
| `mapConfigs.saveDeploy` | closed D2.5 TypeBox DTO; rejects restart/verifyRestart and raw tunnel fields |
| `civ7.autoplay` start/stop command | closed D2.5 TypeBox DTO; no raw direct-control tunnel |

### Control-oRPC Risk Mutations

| Module | Procedure keys |
| --- | --- |
| `notifications` | `notifications.dismiss.request`, `notifications.advisorWarning.viewed.request`, `notifications.queue.dismiss.request` |
| `progression` | `progression.technology.choice.request`, `progression.culture.choice.request`, `progression.technology.target.request`, `progression.culture.target.request`, `progression.attribute.purchase.request`, `progression.attribute.review.request`, `progression.tradition.change.request`, `progression.tradition.review.request` |
| `display` | `display.explore.request` |
| `turn` | `turn.complete.request` |
| `narrative` | `narrative.choice.request` |
| `diplomacy` | `diplomacy.response.request`, `diplomacy.firstMeet.response.request` |
| `unit` | `unit.target.action.request`, `unit.upgrade.request`, `unit.resettle.request` |
| `government` | `government.choice.request`, `government.celebration.choice.request` |
| `city` | `city.population.place.request`, `city.production.choice.request`, `city.townFocus.change.request`, `city.townFocus.review.request` |

Source scan:

```bash
rg -n "risk:\\s*[\"']mutation[\"']" packages/civ7-control-orpc/src/modules -g "*contract.ts"
```

Closure guard:

```bash
rg -n "\\bcommand\\b|operationType|rawCommand|script|javascript|session|stateName|rawJs|context|\\bargs\\b" packages/studio-server/src/contract packages/civ7-control-orpc/src/modules apps/mapgen-studio/src/server -g "*.{ts,tsx}"
```

Every hit is classified as executable public input, non-executable status/proof evidence, direct-control package internals, test/historical evidence, or blocker.
