# D3 Failure Vocabulary Ledger

Status: draft vocabulary
Date: 2026-06-14

This ledger is normative for D3 implementation. It prevents a hidden second taxonomy from emerging in app-host engines, operation-state projections, or client UI recovery hints.

| Family | Tag | Owner module | Declared codes/status | TypeBox data | Recovery actions | Class |
| --- | --- | --- | --- | --- | --- | --- |
| `StudioOperationFailure` | `OperationBlocked` | `packages/studio-server/src/errors/failure.ts` | `AUTOPLAY_BLOCKED` 409, `RUN_IN_GAME_BLOCKED` 409, `SAVE_DEPLOY_BLOCKED` 409 | `StudioFailureData` with active request id/phase when present | `retry-status`, `copy-diagnostics` | expected |
| `StudioOperationFailure` | `InvalidRequest` | `packages/studio-server/src/errors/failure.ts` | `AUTOPLAY_INVALID` 400, `RUN_IN_GAME_INVALID` 400, `SAVE_DEPLOY_INVALID` 400 | `StudioFailureData` with declared reason code and bounded diagnostics | `edit-config`, `copy-diagnostics` | expected |
| `StudioOperationFailure` | `OperationNotFound` | `packages/studio-server/src/errors/failure.ts` | `RUN_IN_GAME_STATUS_NOT_FOUND` 404, `SAVE_DEPLOY_STATUS_NOT_FOUND` 404 | `StatusNotFoundData` with request id, `serverInstanceId`, and `serverStartedAt` | `retry-status`, `copy-diagnostics` | expected |
| `StudioOperationFailure` | `OperationExpired` | `packages/studio-server/src/errors/failure.ts` | see lifecycle mapping matrix | `StatusNotFoundData` for status procedures; `StudioFailureData` for start/immediate commands | `retry-status`, `copy-diagnostics` | expected lifecycle |
| `StudioOperationFailure` | `DaemonIdentityMismatch` | `packages/studio-server/src/errors/failure.ts` | see lifecycle mapping matrix | `StatusNotFoundData` for status procedures; `StudioFailureData` for start/immediate commands | `retry-status`, `copy-diagnostics` | expected lifecycle |
| `StudioOperationFailure` | `RuntimeDisposed` | `packages/studio-server/src/errors/failure.ts` | see lifecycle mapping matrix | `DependencyUnavailableData` with runtime lifecycle reason | `check-dev-server`, `retry-status`, `copy-diagnostics` | expected lifecycle |
| `StudioOperationFailure` | `UnsupportedOperationType` | `packages/studio-server/src/errors/failure.ts` | see lifecycle mapping matrix | `StudioFailureData` with operation type and declared reason | `copy-diagnostics` | expected lifecycle |
| `StudioOperationFailure` | `DependencyUnavailable` | `packages/studio-server/src/errors/failure.ts` | `AUTOPLAY_UNAVAILABLE` 503, `RUN_IN_GAME_UNAVAILABLE` 503, `SAVE_DEPLOY_UNAVAILABLE` 503 | `DependencyUnavailableData` with dependency kind, optional direct-control code, and sanitized cause summary | `check-dev-server`, `retry-run`, `retry-save-deploy`, `restart-civ-process-and-retry`, `copy-diagnostics` | expected |
| `RunInGameFailure` | `MaterializationFailed` | `packages/studio-server/src/errors/failure.ts` | `RUN_IN_GAME_FAILED` 500 | `StudioFailureData` with declared materialization reason and bounded diagnostics | `edit-config`, `copy-diagnostics` | expected |
| `RunInGameFailure` | `DeployFailed` | `packages/studio-server/src/errors/failure.ts` | `RUN_IN_GAME_FAILED` 500 | `StudioFailureData` with declared deploy reason and bounded diagnostics | `retry-run`, `inspect-deploy-output`, `copy-diagnostics` | expected |
| `SaveDeployFailure` | `DeployFailed` | `packages/studio-server/src/errors/failure.ts` | `SAVE_DEPLOY_FAILED` 500 | `StudioFailureData` with declared deploy/rollback reason and bounded diagnostics | `retry-save-deploy`, `inspect-deploy-output`, `copy-diagnostics` | expected |
| `RunInGameFailure` | `ProofFailed` | `packages/studio-server/src/errors/failure.ts` | `RUN_IN_GAME_FAILED` 500 | `StudioFailureData` with declared proof reason and bounded diagnostics | `dismiss-civ-notification-and-retry`, `exit-to-shell-and-continue`, `restart-civ-process-and-retry`, `copy-diagnostics` | expected |
| `AutoplayFailure` | `AutoplayStartStopFailed` | `packages/studio-server/src/errors/failure.ts` | `AUTOPLAY_FAILED` 500 | `StudioFailureData` with start/stop command, direct-control code when present, and bounded diagnostics | `retry-status`, `copy-diagnostics` | expected |
| `AutoplayFailure` | `AutoplayVerificationFailed` | `packages/studio-server/src/errors/failure.ts` | `AUTOPLAY_FAILED` 500 | `StudioFailureData` with verification reason and bounded diagnostics | `retry-status`, `copy-diagnostics` | expected |
| router-edge defect containment | `UnexpectedDefect` | `packages/studio-server/src/errors/defect.ts` | namespace `*_FAILED` 500 | `UnexpectedDefectData` with sanitized summary only | `copy-diagnostics` | defect containment, excluded from workflow `Effect.fail` unions |

## Lifecycle Mapping Matrix

Lifecycle variants are expected runtime outcomes, not open-ended implementation choices. D3 implementation maps them as follows:

| Procedure family | `OperationExpired` | `DaemonIdentityMismatch` | `RuntimeDisposed` | `UnsupportedOperationType` |
| --- | --- | --- | --- | --- |
| Run in Game start | `RUN_IN_GAME_INVALID` 400 / `StudioFailureData` | `RUN_IN_GAME_INVALID` 400 / `StudioFailureData` | `RUN_IN_GAME_UNAVAILABLE` 503 / `DependencyUnavailableData` | `RUN_IN_GAME_INVALID` 400 / `StudioFailureData` |
| Run in Game status | `RUN_IN_GAME_STATUS_NOT_FOUND` 404 / `StatusNotFoundData` | `RUN_IN_GAME_STATUS_NOT_FOUND` 404 / `StatusNotFoundData` | `RUN_IN_GAME_UNAVAILABLE` 503 / `DependencyUnavailableData` | `RUN_IN_GAME_INVALID` 400 / `StudioFailureData` |
| Save/Deploy start | `SAVE_DEPLOY_INVALID` 400 / `StudioFailureData` | `SAVE_DEPLOY_INVALID` 400 / `StudioFailureData` | `SAVE_DEPLOY_UNAVAILABLE` 503 / `DependencyUnavailableData` | `SAVE_DEPLOY_INVALID` 400 / `StudioFailureData` |
| Save/Deploy status | `SAVE_DEPLOY_STATUS_NOT_FOUND` 404 / `StatusNotFoundData` | `SAVE_DEPLOY_STATUS_NOT_FOUND` 404 / `StatusNotFoundData` | `SAVE_DEPLOY_UNAVAILABLE` 503 / `DependencyUnavailableData` | `SAVE_DEPLOY_INVALID` 400 / `StudioFailureData` |
| Autoplay immediate command | `AUTOPLAY_INVALID` 400 / `StudioFailureData` | `AUTOPLAY_INVALID` 400 / `StudioFailureData` | `AUTOPLAY_UNAVAILABLE` 503 / `DependencyUnavailableData` | `AUTOPLAY_INVALID` 400 / `StudioFailureData` |

Status-procedure lifecycle data that uses `StatusNotFoundData` must include current daemon identity and the request id. Start/immediate command lifecycle data must include enough bounded diagnostics to explain why the operation was refused without exposing raw runtime internals.

## Reason-Code Matrix

Failure tags are the stable taxonomy; reason codes are operation-specific refinements. The literals below are normative TypeBox schema values. D3 implementation must declare them before engine edits and must test that engine/application projections cannot invent untyped reason strings.

| Family | Tag | Reason code | Declared code/status | TypeBox data | Recovery actions | Oracle |
| --- | --- | --- | --- | --- | --- | --- |
| `StudioOperationFailure` | `OperationBlocked` | `active-operation-conflict` | namespace `*_BLOCKED` 409 | `StudioFailureData` | `retry-status`, `copy-diagnostics` | mutex/queue conflict scenario |
| `StudioOperationFailure` | `InvalidRequest` | `invalid-request` | namespace `*_INVALID` 400 | `StudioFailureData` | `edit-config`, `copy-diagnostics` | request parser/guard tests |
| `StudioOperationFailure` | `OperationNotFound` | `status-not-found` | status procedure `*_STATUS_NOT_FOUND` 404 | `StatusNotFoundData` | `retry-status`, `copy-diagnostics` | status miss identity echo tests |
| `StudioOperationFailure` | `OperationExpired` | `expired-operation` | lifecycle mapping matrix | `StatusNotFoundData` or `StudioFailureData` | `retry-status`, `copy-diagnostics` | TTL/expired registry tests |
| `StudioOperationFailure` | `DaemonIdentityMismatch` | `daemon-identity-mismatch` | lifecycle mapping matrix | `StatusNotFoundData` or `StudioFailureData` | `retry-status`, `copy-diagnostics` | server identity mismatch tests |
| `StudioOperationFailure` | `RuntimeDisposed` | `runtime-disposed` | lifecycle mapping matrix | `DependencyUnavailableData` | `check-dev-server`, `retry-status`, `copy-diagnostics` | ManagedRuntime disposal tests |
| `StudioOperationFailure` | `UnsupportedOperationType` | `unsupported-operation-type` | lifecycle mapping matrix | `StudioFailureData` | `copy-diagnostics` | unsupported operation routing tests |
| `RunInGameFailure` | `DependencyUnavailable` | `direct-control-unavailable` | `RUN_IN_GAME_UNAVAILABLE` 503 | `DependencyUnavailableData` | `retry-run`, `check-dev-server`, `copy-diagnostics` | direct-control unavailable scenario |
| `RunInGameFailure` | `MaterializationFailed` | `materialization-proof-missing` | `RUN_IN_GAME_FAILED` 500 | `StudioFailureData` | `edit-config`, `copy-diagnostics` | materialization proof scenario |
| `RunInGameFailure` | `DeployFailed` | `deploy-failed` | `RUN_IN_GAME_FAILED` 500 | `StudioFailureData` | `retry-run`, `inspect-deploy-output`, `copy-diagnostics` | disposable deploy failure scenario |
| `RunInGameFailure` | `DependencyUnavailable` | `restart-unsupported` | `RUN_IN_GAME_UNAVAILABLE` 503 | `DependencyUnavailableData` | `exit-to-shell-and-continue`, `copy-diagnostics` | restart boundary unsupported scenario |
| `RunInGameFailure` | `DependencyUnavailable` | `restart-failed` | `RUN_IN_GAME_UNAVAILABLE` 503 | `DependencyUnavailableData` | `restart-civ-process-and-retry`, `copy-diagnostics` | restart failure scenario |
| `RunInGameFailure` | `ProofFailed` | `setup-row-unavailable` | `RUN_IN_GAME_FAILED` 500 | `StudioFailureData` | `exit-to-shell-and-continue`, `copy-diagnostics` | setup row visibility scenario |
| `RunInGameFailure` | `ProofFailed` | `start-game-failed` | `RUN_IN_GAME_FAILED` 500 | `StudioFailureData` | `dismiss-civ-notification-and-retry`, `copy-diagnostics` | start-game failure scenario |
| `RunInGameFailure` | `ProofFailed` | `log-proof-missing` | `RUN_IN_GAME_FAILED` 500 | `StudioFailureData` | `retry-run`, `copy-diagnostics` | mapgen log proof timeout scenario |
| `RunInGameFailure` | `ProofFailed` | `exact-authorship-mismatch` | `RUN_IN_GAME_FAILED` 500 | `StudioFailureData` | `retry-run`, `copy-diagnostics` | exact authorship proof scenario |
| `RunInGameFailure` | `ProofFailed` | `timeout-uncertain` | `RUN_IN_GAME_FAILED` 500 | `StudioFailureData` | `retry-status`, `copy-diagnostics` | uncertain/timeout scenario |
| `SaveDeployFailure` | `InvalidRequest` | `invalid-request` | `SAVE_DEPLOY_INVALID` 400 | `StudioFailureData` | `edit-config`, `copy-diagnostics` | save/deploy request parser tests |
| `SaveDeployFailure` | `InvalidRequest` | `path-jail-rejection` | `SAVE_DEPLOY_INVALID` 400 | `StudioFailureData` | `edit-config`, `copy-diagnostics` | path jail tests |
| `SaveDeployFailure` | `OperationBlocked` | `active-operation-conflict` | `SAVE_DEPLOY_BLOCKED` 409 | `StudioFailureData` | `retry-status`, `copy-diagnostics` | save/deploy mutex tests |
| `SaveDeployFailure` | `DeployFailed` | `save-failed` | `SAVE_DEPLOY_FAILED` 500 | `StudioFailureData` | `retry-save-deploy`, `copy-diagnostics` | save failure scenario |
| `SaveDeployFailure` | `DeployFailed` | `deploy-failed` | `SAVE_DEPLOY_FAILED` 500 | `StudioFailureData` | `retry-save-deploy`, `inspect-deploy-output`, `copy-diagnostics` | deploy failure scenario |
| `SaveDeployFailure` | `DeployFailed` | `rollback-failed` | `SAVE_DEPLOY_FAILED` 500 | `StudioFailureData` | `inspect-deploy-output`, `copy-diagnostics` | rollback failure scenario |
| `SaveDeployFailure` | `OperationNotFound` | `status-not-found` | `SAVE_DEPLOY_STATUS_NOT_FOUND` 404 | `StatusNotFoundData` | `retry-status`, `copy-diagnostics` | save/deploy status miss test |
| `AutoplayFailure` | `OperationBlocked` | `active-operation-conflict` | `AUTOPLAY_BLOCKED` 409 | `StudioFailureData` | `retry-status`, `copy-diagnostics` | autoplay mutex tests |
| `AutoplayFailure` | `DependencyUnavailable` | `direct-control-unavailable` | `AUTOPLAY_UNAVAILABLE` 503 | `DependencyUnavailableData` | `check-dev-server`, `copy-diagnostics` | autoplay dependency scenario |
| `AutoplayFailure` | `AutoplayStartStopFailed` | `start-failed` | `AUTOPLAY_FAILED` 500 | `StudioFailureData` | `retry-status`, `copy-diagnostics` | autoplay start failure scenario |
| `AutoplayFailure` | `AutoplayStartStopFailed` | `stop-failed` | `AUTOPLAY_FAILED` 500 | `StudioFailureData` | `retry-status`, `copy-diagnostics` | autoplay stop failure scenario |
| `AutoplayFailure` | `AutoplayVerificationFailed` | `verification-failed` | `AUTOPLAY_FAILED` 500 | `StudioFailureData` | `retry-status`, `copy-diagnostics` | autoplay verification scenario |

## Recovery Action Vocabulary

The public recovery-action schema is a TypeBox union of these exact values unless D3 implementation extends this ledger and its tests in the same slice:

- `check-dev-server`
- `copy-diagnostics`
- `dismiss-civ-notification-and-retry`
- `edit-config`
- `exit-to-shell-and-continue`
- `inspect-deploy-output`
- `restart-civ-process-and-retry`
- `retry-run`
- `retry-save-deploy`
- `retry-status`

The existing free string arrays in app operation-state helpers are implementation evidence, not durable protocol. D3 implementation must either project those strings through this vocabulary or delete them in favor of TypeBox-derived values.
