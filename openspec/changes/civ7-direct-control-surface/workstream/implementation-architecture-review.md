# Implementation Architecture Review

Reviewer lane: peer architecture/spec review
Date: 2026-05-31
Scope: `packages/civ7-direct-control/**`, CLI command wiring/tests, Studio Vite
API wiring, OpenSpec change artifacts, and adjacent changed docs.
Evidence policy: repo files and recorded live runtime evidence; this review is
a durable disposition artifact, not a runtime test log.

## Summary

No P1 architecture blocker remains. The final implementation establishes
`packages/civ7-direct-control` as the only scoped owner of direct tuner socket
framing, `LSQ:`, `CMD:<stateId>:...`, state selection, App UI snapshots, Tuner
readiness canaries, reconnect polling, native restart/begin orchestration, and
fresh log proof helpers.

CLI and Studio import `@civ7/direct-control`. Repo-owned Windows/FireTuner
bridge transport code, flags, tests, and operational guidance were removed
rather than kept as a fallback lane.

## Findings And Disposition

| ID | Finding | Disposition | Evidence |
|---|---|---|---|
| A1 | Studio owned host/default selection and bypassed package discovery. | accepted and repaired | Studio imports `restartCiv7GameAndBegin`, `snapshotFile`, and `waitForFreshLogMarkers` from `@civ7/direct-control`; no `CIV7_FIRETUNER_*` host parsing remains. |
| A2 | Readiness polling might replay arbitrary commands. | invalidated and constrained | Generic readiness uses health/state discovery only. Restart/begin uses a persistent session, but `Network.restartGame()` and `UI.notifyUIReady()` are executed with one attempt so state-changing commands are not replayed automatically. |
| A3 | CLI wait after restart could select a stale state id. | accepted and repaired | Default waiting uses role/name selection; explicit id selection remains caller-owned behavior. The `--begin --wait-tuner` path waits through App UI loading and proves Tuner readiness. |
| A4 | Workstream tasks and next packet were stale. | accepted and repaired | Tasks, phase record, downstream ledger, next packet, bridge-removal cutover note, and verification audit were updated after final gates. |

## Spec Alignment Notes

- Aligned: `@civ7/direct-control` owns all direct socket framing and parser
  behavior; no caller-local raw socket owner remains in CLI or Studio.
- Aligned: App UI and Tuner are modeled as different states with different API
  surfaces. `Network.restartGame()` and `UI.notifyUIReady()` run against App UI;
  gameplay canary health runs against Tuner after Begin Game.
- Aligned: CLI command surfaces expose direct command execution, health,
  inspection, restart, native begin, and Tuner readiness without bridge flags.
- Aligned: Studio restart calls the package boundary and receives begin/final
  App UI/Tuner readiness evidence.

## Residual Risks

- The live proof covers direct transport, App UI restart/begin, Tuner
  post-Begin readiness, and fresh `Scripting.log` evidence. It is not a full
  Civ7 process exit/relaunch proof.
- Type/autocomplete catalog work remains intentionally out of this implementation
  slice; runtime inspection and public corpus evidence are recorded for a later
  typed catalog slice.
