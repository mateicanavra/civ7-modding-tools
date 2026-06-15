# Design - Error Spine

## Component Role

D3 is the expected-failure spine for Studio runtime operations. It converts engine-known failure reasons into typed Effect-facing values and TypeBox-backed oRPC failure data so Run in Game, Save/Deploy, and Autoplay can fail predictably without anonymous 500s or app-hosted status-code bridges.

This packet repairs an older S1.2 implementation record. The existing code is useful evidence, not the target authority. The target authority is the D2/D2.5 packet train: failure state belongs to typed runtime services and public error data belongs to `@civ7/studio-server` TypeBox contracts.

## Failure Topology

The implementation target has four layers:

- **Failure ADT:** package-visible Studio runtime failure values, tagged by domain reason rather than HTTP status.
- **Emission helpers:** app-hosted engines and later D4 services construct expected failures through named helpers instead of throwing `new Error` or `new StudioEngineError(statusCode, details)`.
- **Router mapper:** one package-owned mapping table converts `(namespace, failure tag)` to declared oRPC code/status/data. The table is total over expected failures.
- **TypeBox error data:** declared errors expose sanitized public data schemas with no expected-failure `details?: Type.Unknown()` bridge.

The ADT must be scale-continuous. Use a stable module family such as:

```text
packages/studio-server/src/errors/
  failure.ts          # tagged failure values and constructors
  errorData.ts        # TypeBox public data schemas and projection helpers
  mapping.ts          # namespace/code/status mapping
  defect.ts           # unknown exception sanitization
```

D3 implementation closure is binary: no production `StudioEngineError` or `RunInGameHttpError` construction, catch, import, or status-code bridge mapping remains in app/package code. App-hosted engines may continue to live in the app until D4, but they must emit package-owned typed failure values through named constructors instead of throwing bridge errors. Temporary mechanical adapters may exist only while editing the D3 branch; they are not an accepted closure state.

## Expected Failure Tags

D3 must cover at least these expected failure classes:

- `OperationBlocked`: another Studio operation owns the mutex/queue.
- `InvalidRequest`: request shape, identity, path, setup, seed, or raw-control guard failed.
- `OperationNotFound`: status request id not found; Run in Game and Save/Deploy include daemon identity.
- `OperationExpired`: status request id refers to a TTL-expired operation.
- `DaemonIdentityMismatch`: request or status state belongs to a different daemon instance than the current server.
- `RuntimeDisposed`: the Studio runtime is shutting down or already disposed and cannot accept or complete the operation.
- `UnsupportedOperationType`: the operation runtime receives an operation type not supported by the current service.
- `DependencyUnavailable`: direct-control, tuner, Civ process, filesystem, or deploy dependency unavailable before the operation can complete.
- `MaterializationFailed`: config/script/materialization/authorship generation failed.
- `DeployFailed`: Save/Deploy write, deploy, or rollback failed.
- `ProofFailed`: exact-authorship, setup visibility, launch, or mapgen log proof failed.
- `AutoplayStartStopFailed`: Autoplay start/stop command failed after request acceptance.
- `AutoplayVerificationFailed`: Autoplay verification/readback failed.

Tags have operation-specific reason codes. Those codes are constrained strings carried by TypeBox schemas, not arbitrary `details`, and the normative literals live in `workstream/failure-vocabulary-ledger.md`.

`workstream/failure-vocabulary-ledger.md` is the normative vocabulary table for D3 implementation. Any added tag, reason class, declared code/status, error-data schema, or recovery action must be added there and covered by tests in the same implementation slice.

Unknown exceptions are not expected failure tags. D3 still defines `UnexpectedDefectData` because the router/runtime edge must sanitize defects into declared oRPC error data, but D4 workflow `Effect.fail` unions must exclude defect containment values.

## TypeBox Error Data

D3 closes the D2.5 permissive-details guard. Declared expected error data must be TypeBox-owned and sanitized.

Allowed public data families:

- `StudioFailureData`: tag, operation namespace, reason code, message, recovery actions, request id, active request id/phase, and bounded diagnostics.
- `StatusNotFoundData`: daemon identity plus request id and failure data.
- `DependencyUnavailableData`: dependency kind, direct-control code when present, recovery actions, and sanitized cause summary.
- `UnexpectedDefectData`: sanitized defect summary for unknown exceptions only.

Forbidden public data:

- `details?: Type.Unknown()` as expected-failure payload.
- `cause: Type.Unknown()` for expected failures.
- open-ended raw command/session/script fields.
- raw direct-control response payloads unless converted into a declared sanitized shape.

If a current diagnostic field is product-critical but too broad, D3 must either type it or move it to a bounded string/JSON-summary field with an explicit lossiness note and tests.

## oRPC Mapping

`@civ7/studio-server` owns the declared error codes and mapper. App host code may call package helpers or pass failure values through the context seam, but it does not own wire mapping.

Mapping rules:

- Autoplay expected failures map only to `AUTOPLAY_BLOCKED`, `AUTOPLAY_INVALID`, `AUTOPLAY_UNAVAILABLE`, or `AUTOPLAY_FAILED`.
- Run in Game expected failures map only to `RUN_IN_GAME_BLOCKED`, `RUN_IN_GAME_INVALID`, `RUN_IN_GAME_UNAVAILABLE`, `RUN_IN_GAME_STATUS_NOT_FOUND`, or `RUN_IN_GAME_FAILED`.
- Save/Deploy expected failures map only to `SAVE_DEPLOY_BLOCKED`, `SAVE_DEPLOY_INVALID`, `SAVE_DEPLOY_UNAVAILABLE`, `SAVE_DEPLOY_STATUS_NOT_FOUND`, or `SAVE_DEPLOY_FAILED`.
- `OperationNotFound` is valid only for status procedures and must include `serverInstanceId` and `serverStartedAt`.
- `OperationExpired`, `DaemonIdentityMismatch`, `RuntimeDisposed`, and `UnsupportedOperationType` map through the exact lifecycle mapping matrix in `failure-vocabulary-ledger.md` and must preserve deterministic lifecycle semantics without becoming anonymous defects.
- Known expected failures cannot fall through to `*_FAILED` unless their tag explicitly belongs to the failed category.
- Unknown exceptions are defect containment and map to `*_FAILED` with `UnexpectedDefectData`.

Raw `ORPCError` construction is confined to router/runtime mapping ownership. Engine code, validation helpers, operation stores, and app UI code do not construct public oRPC errors.

## Recovery Actions

Recovery guidance is public state. D3 requires a typed recovery-action vocabulary instead of prose-only details. Candidate actions:

- `copy-diagnostics`
- `retry-save-deploy`
- `retry-status`
- `retry-run`
- `restart-civ-process-and-retry`
- `dismiss-civ-notification-and-retry`
- `exit-to-shell-and-continue`
- `edit-config`
- `inspect-deploy-output`
- `check-dev-server`

The implementation may add names only by extending the TypeBox recovery-action schema and tests. Arbitrary string arrays are not accepted as the durable protocol.

## Effect Alignment

D3 is not the D4 runtime-service implementation, but it sets the failure shape D4 must use. The failure ADT must be compatible with Effect typed failures:

- expected failures are data values suitable for `Effect.fail`;
- defect containment remains separate from expected failures;
- resource acquisition/release failures are typed as dependency unavailable when expected, or sanitized through router-edge defect containment when unexpected;
- mapper tests prove every failure tag has a namespace mapping before D4 services adopt it.
- workflow/service `Effect.fail` unions include `RunInGameFailure | SaveDeployFailure | AutoplayFailure | StudioOperationFailure`, not `UnexpectedDefectData` or router-edge defect wrappers.

## Packet Blockers

D3 is not accepted while any of the following remain:

- the packet treats old S1.2 implementation closure as current packet acceptance;
- the failure corpus omits Autoplay, Run in Game, Save/Deploy, status misses, validation helpers, operation stores, or direct-control dependency failures;
- the D2.5 `details?: unknown` bridge has no deletion/narrowing target;
- proof gates conflate OpenSpec validation, package tests, scenario tests, or live proof;
- review finds unresolved P1/P2 ambiguity.

## Future Implementation Closure Blockers

The D3 implementation slice cannot close while any of the following remain:

- public declared error data for expected failures contains `Type.Unknown()` / `details?: unknown`;
- expected failures are emitted as raw `Error`, status-code-shaped bridge errors, or caller-local `ORPCError`s;
- failure mapping is driven by HTTP status instead of typed domain tags;
- status misses lack daemon identity;
- recovery actions are arbitrary strings without TypeBox vocabulary;
- production app/package code still constructs, catches, imports, or maps `StudioEngineError` / `RunInGameHttpError`;
- D2.5 raw-control and effect-orpc ownership guards regress, including recipe-DAG `effect-orpc` imports being treated as a durable exception instead of classified D2.5 residue.
