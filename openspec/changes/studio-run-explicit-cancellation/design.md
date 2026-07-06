# Design

## Cancellation Semantics

`runInGame.cancel({ requestId })` targets one active operation. If the operation
is active, cancellation marks it cancelling, interrupts the worker, executes
cleanup, records diagnostics, emits one terminal event, and returns cancelled
status. Runtime ownership lease release happens after cleanup and diagnostics
finalization. Repeated calls return the same terminal cancelled status.

If the operation is already terminal, cancel returns the existing terminal
status without mutation. If the request id is unknown, cancel returns a safe
not-found response.

## HTTP Abort

HTTP abort is transport behavior only. It does not cancel an admitted operation,
does not replay mutations, and does not change terminalization. The browser can
resume by querying status by request id.
