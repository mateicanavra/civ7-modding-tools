# D3 Prework Ledger - Error Spine

Status: draft
Date: 2026-06-14

## Packet-Authoring Prework Completed

- Identified the existing D3 OpenSpec records as stale old-S1.2 implementation closure artifacts.
- Traced current failure bridge and mapper through `engineErrors.ts`, `context.ts`, `engines.ts`, `contract/errors.ts`, package context comments, and existing tests.
- Classified D2.5 permissive expected-error details as a D3 deletion/narrowing obligation.
- Classified current raw `ORPCError` construction as router/runtime ownership only; app-host engine code cannot own public wire mapping.
- Classified status-code-derived failure kinds as useful old evidence but not the Effect-native domain model.

## Implementation Prework Required Before Code Edits

1. Re-run the error corpus search over app server, package contract, package context, router, and tests.
2. Enumerate every `new StudioEngineError`, `throw new Error`, raw `ORPCError`, `Type.Unknown()` error-data schema, and recovery-action source.
3. Decide exact module names for the failure ADT/error-data/mapping family and record them before editing.
4. Define the TypeBox `StudioFailureData`, `StatusNotFoundData`, `DependencyUnavailableData`, and `UnexpectedDefectData` schemas before changing engines.
5. Define the recovery-action literal vocabulary before replacing string arrays. The starting vocabulary is owned by `failure-vocabulary-ledger.md`: `check-dev-server`, `copy-diagnostics`, `dismiss-civ-notification-and-retry`, `edit-config`, `exit-to-shell-and-continue`, `inspect-deploy-output`, `restart-civ-process-and-retry`, `retry-run`, `retry-save-deploy`, and `retry-status`.
6. Plan status-code bridge deletion before code edits. D3 implementation closure requires a negative search proving no production `StudioEngineError` / `RunInGameHttpError` construction, catch, import, or bridge mapping remains in app/package code.
7. Map each current failure site and frame-required operation lifecycle outcome to a typed expected-failure tag before deleting the status-code bridge.
8. Run the `effect-orpc` import scan from D2.5 and classify non-router hits as D2.5 residue until removed; D3 cannot introduce new `effect-orpc` ownership.

## Peer-Agent Prework Lanes

- **Failure corpus scout:** enumerate every expected failure throw/return site and classify desired failure tag.
- **Schema/data scout:** design TypeBox error-data schemas and negative searches for permissive details.
- **Effect alignment scout:** verify failure values are suitable for `Effect.fail` and D4 service layers.
- **Testing oracle scout:** map failure tags to package/app test files and scenario gates.
- **Black-ice reviewer:** search for fallback, compatibility, legacy, permissive, unknown, bridge, proof inflation, and stale old-S1.2 closure claims.

## Resolved Black-Ice Decisions

- D3 is not already accepted merely because the old S1.2 branch merged.
- `details?: unknown` is not a durable expected-error protocol.
- HTTP status is not the failure taxonomy.
- Raw `ORPCError` construction is router/runtime mapping ownership, not engine or app UI ownership.
- Unknown exceptions are defects, not expected operation outcomes.
- Defect containment data is a router-edge projection, not part of workflow `Effect.fail` unions or expected mapper totality.
- Recovery actions are typed public data.
- Failure vocabulary is a ledger-backed table, not prose spread across design text, app operation-state helpers, and UI assumptions.
- Production status-code bridge residue is not allowed at D3 implementation closure; D4 consumes typed failures, not bridge exceptions.

## Remaining Human Decisions

None for packet acceptance. Implementation choices are bounded by the frame and must be resolved from code evidence before code edits.
