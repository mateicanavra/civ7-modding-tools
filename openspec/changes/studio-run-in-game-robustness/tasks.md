## 1. Workstream And Spec

- [x] 1.1 Create the dedicated OpenSpec change and project workstream packet.
- [x] 1.2 Collect peer-agent findings into workstream artifacts.
- [x] 1.3 Reconcile task state in dependent Studio Run in Game OpenSpec changes.

## 2. Direct-Control Runtime Classification

- [x] 2.1 Add shell-safe runtime classification that does not require gameplay
  globals in App UI shell/main-menu.
- [x] 2.2 Tighten readiness gates for shell, loading, begin-ready, running-game,
  Tuner-listed-but-not-ready, and stale-listener states.
- [x] 2.3 Capture begin/start errors and preserve direct-control error codes.
- [ ] 2.4 Add fake-socket tests for shell `Game` undefined, loading,
  begin-ready, running-game without exit approval, stale listener, row-refresh
  failure, connection loss, and no mutation replay.
  - Covered now: shell `Game` undefined, Tuner-listed-but-not-ready, running
    game with explicit exit-to-shell, row refresh happy path, setup mutation
    socket close, begin socket close, and no Begin replay.
  - Still bounded: dedicated stale-listener fake socket and live LSQ failure
    injection.

## 3. Studio Operation Status And UX

- [x] 3.1 Add request-id keyed Run in Game operation state and status endpoint.
- [x] 3.2 Make the browser action resumable after tab reload/fetch abort.
- [x] 3.3 Preserve structured failure details and copyable diagnostics.
- [x] 3.4 Add explicit recovery actions where the current phase supports them.
- [x] 3.5 Add middleware/UI tests for request validation, durable/disposable
  requests, row-missing `409`, failure cleanup, status resume, and no browser
  Run coupling.
  - Covered now: extracted request-validation helpers for raw payload rejection
    and durable/disposable normalization; operation-state helpers for active
    de-dupe, failure cleanup/status, `409` blocked details, uncertainty, TTL,
    and recovery actions; client snapshot helpers for status resume; footer
    rendering for stale/completed state; browser click proof for the primary
    disposable route.
  - Still bounded: route-level Vite middleware tests for every HTTP branch.
  - Follow-up hardening: operation-state helper proof now covers raw Tuner
    command timeout sanitization in public status and copyable diagnostics.

## 4. Vite/Turbo Robustness

- [x] 4.1 Prevent Run in Game artifact generation or cleanup from refreshing
  the active Studio tab before terminal operation status is recorded.
- [x] 4.2 Make dev startup authoritative with strict port or build/server stamp
  detection and clear stale-server mismatch reporting.
- [x] 4.3 Align app-local dev freshness with the Turbo workspace graph.
- [x] 4.4 Add test or proof for no tab reload/lost operation status.

## 5. Verification And Closure

- [x] 5.1 Run focused direct-control and Studio checks.
- [x] 5.2 Run `bun run verify:studio-run-in-game`.
- [x] 5.3 Run strict validation for this change and existing dependent changes.
- [ ] 5.4 Run live proof matrix when Civ is available: shell/menu,
  running-game, disposable, durable, and recovery after listener/LSQ failure.
  - Covered now: shell/menu read-only proof, Studio browser click disposable
    launch, runtime Tuner readiness, seed/dimensions proof, log markers,
    browser reload resume, and current/stale operation-state proof.
  - Still bounded: durable built-in launch and listener/LSQ live failure
    injection.
- [x] 5.5 Update proof ledger, recovery guide, closure checklist, and final
  handoff packet.

## Closure Bounds

- Live proof covered shell/menu disposable launch and browser reload resume.
  Durable built-in launch and stale-listener/LSQ live failure injection are
  recorded as bounded evidence in the proof ledger rather than overclaimed.
- Operation state is durable across browser reload/fetch abort while the same
  Vite dev server is alive; it is not persisted across Vite process restart.
