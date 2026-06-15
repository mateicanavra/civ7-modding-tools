# Design - Studio Operations Current

## Component Role

D6 is the read-model component for daemon-owned operation truth. D4 owns admission, registries, current projection, TTL, events, and disposal. D5 workflows publish typed phase/proof/failure transitions into D4. D6 exposes that state through `studio.operations.current` and makes the browser adopt it at boot.

D6 does not create another registry. It does not make browser storage a recovery source. It does not replay request ids into status procedures to discover daemon state.

## Target Module Topology

Use the D4/D5 runtime topology:

```text
packages/studio-server/src/contract/studio.ts
  StudioOperationsCurrentRequest
  StudioOperationsCurrentResponse
  StudioOperationsCurrentOperation

packages/studio-server/src/services/StudioOperationRuntime.ts
  current(): Effect.Effect<StudioOperationsCurrentResponse, never, never>

packages/studio-server/src/router/index.ts
  studio.operations.current -> resolves StudioOperationRuntime.current

apps/mapgen-studio/src/app/operationAdoption.ts
  readAndAdoptStudioOperationsCurrent from studio.operations.current

apps/mapgen-studio/src/app/StudioShell.tsx
  calls the adoption helper once during boot

apps/mapgen-studio/src/stores/runStore.ts
  session UI state only; no persisted operation recovery keys
```

This file/symbol map is the target D6 topology. Existing `currentOperations` engine helpers are migration source evidence, not the target owner. Package runtime owns current truth; router is a thin Effect/oRPC leaf; app shell plus `operationAdoption.ts` adopt the projection; browser stores hold UI state only. `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts` is protected D8/D9 event/push surface and is not inside the D6 write set except for explicit deletion-target notes.

## Runtime Projection Contract

`studio.operations.current({})` returns:

- `serverInstanceId`
- `serverStartedAt`
- `observedAt`
- `runInGame.active`
- `runInGame.recent`
- `saveDeploy.active`
- `saveDeploy.recent`

Every operation projection is TypeBox-backed and derived from the D2.5/D3/D4 public ADTs. It includes only public operation identity, kind, status/phase, timestamps, failure/recovery/proof summaries, and daemon identity required by the UI. It excludes private app store state, raw control fields, unknown details blobs, registry internals, callback references, and request fingerprint internals.

`recent` is terminal-only and ordered newest first after D4 TTL pruning. Active operations appear in `active`, not duplicated in `recent`. Terminal records remain visible only inside the retained runtime window. A fresh daemon returns empty active/recent collections and its own daemon identity.

## TTL And Status Agreement

D6 reads through D4 runtime pruning rules. Current and status cannot disagree about lifecycle state:

- if `operations.current` reports an operation, direct status lookup for that operation id returns the same public projection family;
- if an active operation exists, `operations.current` reports it in `active`, direct status reports an active/in-progress projection, and `recent` does not duplicate it;
- if a terminal operation remains retained, `operations.current` reports it in terminal-only `recent`, direct status reports the same terminal public projection, and `active` is null for that operation kind;
- if D4 has marked an id expired but still knows the tombstone, `operations.current` omits it and direct status returns D3 `OperationExpired` with current daemon identity;
- if D4 has physically pruned the id, or never knew it, `operations.current` omits it and direct status returns D3 typed not-found data with current daemon identity;
- if the id belongs to a different daemon identity, status returns D3 `DaemonIdentityMismatch` with the current daemon identity;
- a daemon restart creates a new `serverInstanceId` and reports empty operation truth.

D6 cannot synthesize an uncertain browser state for a missing operation. Missing daemon truth is represented as missing daemon truth.

## Client Boot Adoption

The D6-owned shell boot effect performs a daemon-current read:

```ts
studio.operations.current({})
```

The shell/adoption hook uses the response to seed displayed operation state:

- active Run in Game adopts as active Play state;
- retained terminal Run in Game seeds only terminal recent/current display and cannot be treated as active work;
- active Save/Deploy adopts as active deploy state;
- retained terminal Save/Deploy seeds only terminal recent/current display and cannot restart deploy;
- Autoplay remains a D5 immediate command outside D6 current projection.

Existing active-operation status polling and the D8/D9-owned event-hook hello adoption read remain deletion-targeted surfaces until D8/D9 replace them with event/push transport. D6 does not add a polling loop for `operations.current` and does not treat the event-hook hello read as D6 closure proof.

## Browser Recovery Deletion

The following are deleted as operation recovery sources:

- persisted Run in Game request id;
- persisted Run in Game source snapshot;
- persisted last Run in Game source;
- persisted Save/Deploy request id;
- any production `sourceSnapshotStorage.ts` module that supports cross-reload operation recovery.

The implementation search corpus includes current symbol names: `runInGameRequestId`, `saveDeployRequestId`, `runInGameSnapshot`, `lastRunInGameSource`, `setRunInGameSnapshot`, `setLastRunInGameSource`, `sourceSnapshotStorage`, `readStoredRunInGameSourceSnapshot`, `parseRunInGameClientSnapshot`, and `parseRunInGameSourceSnapshot`. `runStore` operation-shaped fields are in-memory session UI/proof aids only and are not serialized for operation recovery. Retained snapshot/fingerprint helpers are pure relation/proof helpers with no operation recovery storage path.

Protected storage owners are exact and tested:

- authoring state key `mapgen-studio.authoring-state.v1` in `apps/mapgen-studio/src/features/studioState/persistence.ts`;
- preset scratch key `mapgen-studio.scratchConfigs` in `apps/mapgen-studio/src/features/presets/storage.ts`;
- theme key `theme-preference` in `apps/mapgen-studio/src/ui/hooks/useTheme.ts`;
- non-operation UI state owners outside the D6 write set.

## TypeBox And Error Discipline

D6 adds no Zod schema. The operation-current public contract uses TypeBox and the repo Standard Schema adapter with recoverable `TSchema` origin. Static public TypeScript types are derived from canonical TypeBox operation DTO schemas and are no broader than runtime validation.

Known missing-operation outcomes use D3 typed not-found data. D6 does not construct `RunInGameHttpError`, `StudioEngineError`, raw `ORPCError`, status-code truth, or public `details?: unknown` for expected current/status outcomes.

## Packet Blockers

D6 is not accepted while any of the following remain:

- the packet treats browser localStorage operation replay as a valid recovery path;
- `operations.current` reads app-local stores instead of D4 runtime projection;
- current/status TTL agreement is not specified;
- fresh-daemon empty truth is not specified;
- TypeBox schema origin is not specified;
- client boot adoption can replay request ids into status calls;
- unrelated localStorage owners are accidentally inside the deletion boundary;
- D8/D9 event/push replacement is conflated with D6;
- review finds unresolved P1/P2 ambiguity.
