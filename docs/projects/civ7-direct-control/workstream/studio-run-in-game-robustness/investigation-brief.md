# Investigation Brief

## Frame

The problem is not whether direct control can start Civ7; that was already
proven for durable and disposable Swooper rows. The problem is whether the
browser-operated Studio workflow is reliable across real state transitions and
developer mistakes. This phase selects in runtime phase classification, durable
operation state, Vite reload behavior, and recovery UX. It selects out
FireTuner/Windows bridge fallback and broad Civ setup UI cloning.

## Known Evidence At Open

- Shell/main-menu currently exposes only App UI, and Tuner absence is expected.
- A generic App UI health snapshot failed in shell with `Game is not defined`
  because it read gameplay globals without guards.
- A browser Run in Game click from shell triggered Vite page reloads while
  generated/imported artifacts changed, leaving status stuck on the prior
  shell health error.
- Prior live proofs showed direct-control durable and disposable launches can
  succeed when shell reload makes the row visible and Civ responds to LSQ.
- Prior task state still had unchecked proof/test boxes in
  `studio-run-current-map-config` and `studio-live-civ7-map-sync`.

## Investigation Questions

- Which direct-control commands should classify shell/setup readiness without
  requiring gameplay globals?
- Where does Studio currently lose Run in Game operation state after reload or
  fetch abort?
- Which source writes during Run in Game are watched/imported by Vite?
- What tests most directly falsify the previously observed failures?
- What recovery actions are legitimate without silently replaying mutations?
