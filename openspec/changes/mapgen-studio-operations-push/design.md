# Design - operations push (S3.2)

## D1. Operation event authority

S3.2 makes daemon operation registries the publishing authority for operation
freshness. Run in Game and Save&Deploy stores emit a `StudioEvent` with
`type: "operation"` whenever the retained operation state changes.

The published event contains:

- `kind`: `run-in-game` or `save-deploy`;
- `status`: the daemon-owned operation status snapshot;
- `observedAt`: the operation state's `updatedAt` timestamp.

The operation status object remains the existing typed status shape. S3.2 does
not introduce a parallel client model or a second operation transport.

## D2. Publisher injection

The daemon creates the S3.1 EventHub before constructing Studio engines and
passes the hub into `createStudioEngines`.

The app-side operation stores receive a small publisher callback. Stores stay
focused on state transitions; the engine/context wiring owns translation from
store updates to EventHub publication. The callback runs on create/update, and
complete/fail publish through their existing update path.

Publication must not block or rewrite operation execution. If EventHub publish
unexpectedly rejects, the transition remains recorded in the daemon registry
and the rejection is surfaced through the daemon diagnostics path rather than
silently spawning a second status-poll fallback.

## D3. Client operation application

The S3.1 event hook keeps `hello` behavior: hello re-reads
`studio.operations.current` for reconnect adoption. S3.2 adds explicit
`operation` handling:

- Run in Game events set Run in Game operation state.
- Save&Deploy events set Save&Deploy operation state.
- Terminal Run in Game events preserve the existing terminal toast behavior for
  live operations.

Boot/reconnect adoption still suppresses old terminal toasts by marking adopted
terminal Run in Game operations as already handled. Live pushed terminal events
must not be pre-marked before the toast effect sees them.

## D4. Polling deletion boundary

S3.2 deletes operation polling authority:

- `useOperationStatusPolls`;
- `StudioShell` refresh callbacks used only by that hook;
- synthetic 404-to-terminal status-missing mapping for operation polling;
- the private Save&Deploy `while (running) { sleep; status }` completion loop;
- `useDaemonInstanceWatchdog` and its `serverInfo` polling identity path.

Manual/public status procedures may remain as API contracts if still used by
tests or deliberate UI diagnostics, but they are not background freshness or
identity authority after S3.2.

## D5. Live-game deferral

Live-game polling and live-game watcher behavior are intentionally untouched.
S3.3 owns live-game event publication and deletion of live-game polling. S3.2
must not smuggle live-game changes into the operation-push branch.

## D6. Falsification proof

The primary falsification pin is transition publication:

- a store/engine test observes an operation event after a phase transition;
- if the publisher callback/EventHub bridge is removed, that test fails.

Client tests must prove `operation` events update both operation states without
calling the deleted polling hooks. Negative search is part of the closeout
evidence because the deletion target is architectural, not only behavioral.
