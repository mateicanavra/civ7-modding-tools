# Design — operations current (S2.1)

## D1. The daemon owns recovery by enumeration, not by browser replay

The status endpoints remain request-id lookups. S2.1 adds a separate daemon
truth read:

```ts
studio.operations.current({})
```

The response includes:

- `serverInstanceId`
- `serverStartedAt`
- `observedAt`
- `runInGame.active`
- `runInGame.recent`
- `saveDeploy.active`
- `saveDeploy.recent`

`active` is the currently running operation or `null`. `recent` is the full set
of non-pruned retained operations, including terminal records, ordered newest
first. A fresh daemon returns both `active: null` and `recent: []` for both
registries. The client does not replay browser-owned request ids into status
calls to discover this.

## D2. Current snapshots use the existing stores and TTL semantics

The operation stores already own TTL pruning and `findActive()`. S2.1 adds
enumeration methods on those stores rather than creating a second registry:

- `list(): readonly OperationState[]` prunes first.
- `current(): { active, recent }` can be composed by the engine over both
  stores.

Status lookup and `operations.current` therefore agree on expiry: a pruned
request disappears from `current`, and a direct status lookup for the old id
returns the existing typed `*_STATUS_NOT_FOUND` error with the current daemon
identity.

## D3. New contract schema is TypeBox/Standard Schema

The runtime simplification program already recorded that new durable contract
schemas should not extend the legacy Zod success I/O surface. The new
`operations.current` output uses TypeBox through the shared
`typeboxStandardSchema` adapter. Existing legacy Zod schemas remain a S4.1
closeout target and are not expanded for the new state spine procedure.

## D4. Client adoption is explicit and narrow

On boot, `StudioShell` calls `studio.operations.current` once. It adopts:

- `runInGame.active` if present, otherwise the newest retained Run in Game
  operation if useful for status display.
- `saveDeploy.active` if present, otherwise the newest retained Save&Deploy
  operation if useful for status display.

After adoption, existing status polls continue while operations are active.
S3.2 deletes those polls when operation events exist. S2.1 does not add a new
poll for `operations.current`.

## D5. Browser recovery bridge deletion boundary

`runStore` remains the owner of session-only run UI state:

- `runInGameSnapshot`
- `lastRunInGameSource`
- `lastRunSnapshot`
- `lastSaveDeployConfig`

It no longer persists or hydrates any operation recovery field:

- `runInGameRequestId`
- `runInGameSnapshot`
- `lastRunInGameSource`
- `saveDeployRequestId`

`lastRunInGameSource` can remain in memory as a session UI aid for the Live Game
preset, but it is not a cross-reload recovery channel. The
`sourceSnapshotStorage.ts` localStorage module is deleted. Snapshot and source
snapshot builders/parsers in `clientState.ts` stay because proof identity and
current/stale relation logic still depend on their shapes.

## D6. Verification shape

Tests should falsify the owner flip:

- fresh engine instance -> `operations.current` reports empty registries;
- active Run in Game or Save&Deploy operation appears in `current`;
- terminal retained operation appears in `recent`;
- after TTL expiry, `current` omits the operation and status by the old id
  yields typed NOT_FOUND with current `serverInstanceId`;
- client/store tests no longer write/read operation recovery localStorage keys;
- `clientState.test.ts` current/stale relation pins remain.

Shortcut scan target: no live S2.1 artifact may describe the deleted
localStorage operation bridge as parity, hard-core, recovery, or compatibility.
