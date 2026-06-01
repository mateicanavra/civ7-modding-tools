# Design

## Frame

The reliable unit is not a button click. It is an operation record tied to an
authored Studio snapshot and a Civ runtime launch request. Studio must show when
those three things no longer match.

## State Boundaries

- Authored state: the current Studio config, recipe, preset, seed, map size,
  player count, and resources.
- Preview state: the browser-run snapshot used by the in-Studio map preview.
- Civ runtime state: passive direct-control reads from App UI/Tuner.
- Run in Game state: a request-id keyed server operation plus a client snapshot
  fingerprint for current-vs-stale comparison.

## Decisions

- Save/Deploy is non-mutating with respect to Civ runtime by default. It writes
  and deploys map files only.
- Run in Game owns Civ setup/start mutation. If an operation is already running,
  the server returns the active operation rather than queueing another mutation.
- Client current-vs-stale comparison is local and deterministic. It does not
  prove Civ runtime state; it only tells whether the visible operation was
  requested from the current authored Studio state.
- Server helpers own phase transitions, recovery action selection, failure
  classification, TTL pruning, duplicate active-operation detection, and request
  validation.

## Remaining Boundaries

Operation records remain in memory. A Vite process restart intentionally changes
the recovery class to missing/uncertain rather than pretending the operation can
be resumed from server memory.
