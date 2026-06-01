# Review Ledger

## Findings

### Accepted: Save endpoint still had restart behavior

- **Risk:** Save could mutate Civ lifecycle outside the Run in Game operation
  model.
- **Disposition:** Removed save-side restart execution and reject restart
  requests on `/api/map-configs`.

### Accepted: Deploy correctness and Vite tab stability were pulling opposite ways

- **Risk:** A light deploy avoided Vite reloads but could deploy against stale
  workspace dependencies; a full deploy could refresh the active tab.
- **Disposition:** Keep Studio deploy dependency-aware and ignore workspace
  `dist`/`types` outputs in Vite watch.

### Accepted: UI controls did not consistently reflect operation conflict

- **Risk:** Save, Browser Run, reroll, auto-run, and Run in Game could overlap
  or appear available while another operation owned filesystem/Civ state.
- **Disposition:** Add Save/Deploy status and guard conflicting UI controls and
  handlers.

### Accepted: Process-restart recovery needed to be a deliberate Run in Game action

- **Risk:** Disposable setup row recovery could be mistaken for a normal retry or
  hidden inside Save/Deploy.
- **Disposition:** Show `Restart Civ & Run` when the prior operation proves a
  process boundary is required.

### Accepted: Save/Deploy needed server-authoritative operation state

- **Risk:** A tab reload, HMR refresh, aborted fetch, or stale browser state
  could lose Save/Deploy status while the server queue continued.
- **Disposition:** Added a request-id keyed Save/Deploy store, status endpoint,
  client polling, and localStorage resume key.

### Accepted: API callers needed the same conflict semantics as the UI

- **Risk:** Direct POSTs or stale tabs could enqueue Save/Deploy during Run in
  Game, or Run in Game during Save/Deploy, bypassing disabled buttons.
- **Disposition:** Save/Deploy and Run in Game now check each other's active
  operation stores and return structured conflicts before queueing mutation.

### Accepted: Durable Run in Game mode was tied too closely to browser preview

- **Risk:** A saved/deployed config that had not been browser-run could still be
  treated as disposable.
- **Disposition:** Durable materialization now also accepts current
  saved/deployed config provenance, plus unchanged repo-backed preset config.

### Accepted: Standard recipe proof exceeded the default Vitest timeout

- **Risk:** The map generation worker could look fatal in CI or local full-suite
  verification even when the recipe completed successfully.
- **Disposition:** Kept the existing 30s worker deadline and raised only this
  long-running test's Vitest timeout to 35s. The isolated proof completed with
  `run.finished`, and the full verification passed afterward.
