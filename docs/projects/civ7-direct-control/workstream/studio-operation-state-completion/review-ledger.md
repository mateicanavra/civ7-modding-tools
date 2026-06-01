# Review Ledger

## Accepted Findings

- Prior closure overclaimed completion while OpenSpec tasks remained unchecked.
  Disposition: this phase keeps unchecked work visible until tests/proof run.
- Save/Deploy and Run in Game were too tightly coupled. Disposition: Save/Deploy
  no longer launches Civ by default.
- A completed Run in Game result could appear current after Studio edits.
  Disposition: client snapshots classify current/stale/unknown relation.
- Operation-state behavior was hard to test because it lived inside Vite
  middleware. Disposition: extracted focused server helpers and tests.

## Bounds

- Server operation records are still in memory only.
- Browser/live proof is still required after the full verification pass.
