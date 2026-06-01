# Studio Operation State Completion Phase Record

## Objective

Complete the unfinished Studio Run in Game robustness work by making Studio
operation state truthful: Save/Deploy, browser preview, direct-control live
status, authored config state, and Run in Game operation status must not imply
each other's proof.

## Reframe

The previous slice treated launch robustness as the main problem. Testing showed
the larger issue is state relationship clarity. A previous successful operation
can be stale relative to current Studio edits; Save was still a Civ runtime
mutation; duplicate clicks could enqueue more work; and operation-state logic was
embedded in Vite middleware instead of being directly testable.

## Implementation Notes

- Isolated the existing Swooper Earthlike config edit on its own Graphite branch.
- Save/Deploy now sends `restart: false`, and the Vite save endpoint only
  restarts Civ when explicitly requested.
- Run in Game stores a client fingerprint of the authored launch inputs and
  marks operations as current/stale/unknown.
- The server returns the active running operation for duplicate launch clicks.
- Operation-state and request validation now live in testable server modules.

## Verification

- Focused Run in Game tests pass locally.
- Full Studio/Turbo/OpenSpec verification passed through
  `bun run verify:studio-run-in-game`.
- Browser proof completed a disposable Run in Game request from the Studio,
  verified `Complete Current`, verified `Complete Stale` after an authored seed
  edit, and verified same-server tab reload recovery.

## Closure Bounds

- Operation status is durable across browser reloads while the same Vite server
  remains alive. It is not persisted across Vite process restart.
- Durable built-in launch and live LSQ/listener failure injection remain bounded
  by the prior robustness proof ledger; this slice closes the Studio
  operation-state gaps that made those bounds hard to interpret.
