# Studio Run Terminal Adoption Invariant

## Why

The daemon owns operation truth, but a browser can miss a terminal event,
reload with stale local state, or reconnect after the operation has already
completed or failed. The UI must not keep presenting Run in Game as running
after the daemon has terminalized the operation.

This packet hardens public terminal adoption without making the browser a
second runtime owner.

## Authority

- Direct user guidance that the visible Studio path must not hang or hide
  terminal failures.
- `target-vocabulary.md` public status phases and public/private split.
- `packet-authoring-contract.md` live endpoint and review requirements.
- Completed packets: `studio-run-public-status-diagnostics`,
  `studio-run-operation-registry-identity`, and
  `studio-event-recovery-and-adoption`.

## Requires

- Daemon operation registry identity and current-operation surface.
- Public status/diagnostics split from the completed packet train.
- Existing event stream and current-operation client boundaries.

## Enables Parallel Work

- Browser-originated request harness can rely on a stable terminal state oracle.
- Runtime setup repair can fail safely without producing a stale browser
  spinner.

## Affected Owners

- Studio operation event stream client
- `studio.operations.current` adoption on mount/reconnect
- Run in Game status UI and recovery copy
- public `/rpc` current/status/events contracts
- browser tests for event-drop, reconnect, reload, and stale local state

## Forbidden Owners

- Browser-owned runtime polling loops as a second source of truth.
- Automatic replay of `runInGame.start` during recovery.
- Public UI payloads carrying private diagnostics or file paths.

## Write Set

Likely write set:

- `apps/mapgen-studio/src/app/operationAdoption.ts`
- `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts`
- Run in Game status/toast UI owners
- Studio operation adoption tests
- this OpenSpec packet and workstream evidence

## Consumer Impact

Users see terminal completed, failed, or cancelled status after reload,
reconnect, or missed terminal event. Private detail remains available only by
explicit diagnostics lookup.

## Stop Conditions

- Browser local state can keep showing running after daemon terminal state.
- Recovery replays a start mutation.
- Event/current/status surfaces disagree on request id after reconciliation.
- Public payloads leak private diagnostics.

## Before And After

Before:

- a missed terminal event can leave browser-visible in-progress state stale;
- recovery depends on current-operation adoption being used consistently;
- endpoint terminal state and visible UI terminal state are not tested together.

After:

- mount, reload, and reconnect reconcile against daemon current operation;
- terminal status is adopted exactly once for the request;
- stream failure appears as recoverable public UI state, not an endless spinner;
- no mutation is replayed automatically during recovery.

## Behavior Verification

Tests simulate missed terminal events, stream disconnect/reconnect, browser
reload, and stale local operation state. The oracle is visible terminal status
matching daemon state with public-safe payloads.

## Structural Enforcement

Permanent positive assertion:

- browser operation state follows daemon operation identity through events and
  current-operation reconciliation; it does not own runtime completion.

This is primarily a TypeScript state-machine and UI behavior invariant. Avoid
new topology scripts unless Habitat already owns the class of boundary.

## Verification Gates

- `bun run openspec -- validate studio-run-terminal-adoption-invariant --strict`.
- `bun habitat classify` for the packet write set and every reported command.
- Focused browser operation adoption tests.
- Live Studio endpoint check where current/status show terminal state and the
  rendered UI adopts that state after reload or stream reconnect.
- TypeScript refactoring, code quality/structure, library correctness,
  testing-design, and Habitat/authority review lanes.
