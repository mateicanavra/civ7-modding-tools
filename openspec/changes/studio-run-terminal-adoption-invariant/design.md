# Design

## Adoption Model

The browser receives operation updates from `studio.events.watch`. On mount,
hello, reconnect, and visible recovery action, it reads
`studio.operations.current` and reconciles daemon state into the local view.

Terminal adoption rules:

- terminal daemon status wins over local in-progress state;
- terminal status for a request is handled once;
- reconnect does not replay `runInGame.start`;
- stream failure sets recoverable public UI state and triggers reconciliation
  where appropriate;
- private diagnostics remain behind explicit lookup.

## File Topology

Likely source write set:

- `apps/mapgen-studio/src/features/operations/**`
- `apps/mapgen-studio/src/features/runInGame/**` or current Run in Game UI
  owner
- `apps/mapgen-studio/src/lib/orpc/**` if the event/current client boundary is
  centralized there
- `apps/mapgen-studio/test/**` browser/client tests

## Recovery States

The public UI should represent:

- active operation;
- terminal completed;
- terminal failed or cancelled with safe category and recovery actions;
- stream disconnected but daemon state being reconciled;
- no active operation.

It should not represent private diagnostic sections or local file paths.
