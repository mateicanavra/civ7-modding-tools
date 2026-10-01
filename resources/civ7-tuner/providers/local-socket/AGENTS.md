# Local Socket Civ7 Tuner Provider

## Role

- Acquire and gracefully release one logical Civ7 Tuner session over its local
  framed socket protocol.
- Translate configuration, connection, framing, state, timeout, and dispatch
  facts into the parent resource's typed vocabulary.
- Reset may reconnect within an acquired scope. Scope release is terminal:
  refuse further work and await pending connection and socket retirement.

## Boundary

- `index.ts` is the only consumer face.
- This provider owns no gameplay meaning, command-output decoding, retry
  policy, readiness threshold, or application selection.
- The framing protocol remains private until a second independent consumer
  earns a standalone package.

## Proof

- `test/semantics/` owns config, framing, and state-selection meaning.
- `test/execution/` owns acquisition, multiplexing, epoch, and release behavior.
- `test/collaboration/` owns opt-in proof against a real Civ7 Tuner.
