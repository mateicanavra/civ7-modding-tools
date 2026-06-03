## Design

Studio Run in Game is a long-running launch operation with explicit phases and
proof, not a synchronous browser action. `@civ7/direct-control` owns all Civ7
state-role reads and mutations; Studio owns request construction, operation
state display, and recovery UX.

## Runtime Classification

Direct control SHALL classify runtime readiness with shell-safe setup/UI probes
before it asks gameplay globals for runtime data. In shell/main-menu, App UI can
provide setup control while `Game`, `GameContext`, `Players`, and
`GameplayMap` may be undefined. That state is `shell`, not broken health.

Readiness terms are intentionally distinct:

- `connected`: socket state listing responded.
- `shell`: App UI setup control is reachable.
- `loading`: App UI reports loading or transition state.
- `begin-ready`: setup/start has reached a state where Begin may be available
  but Tuner gameplay reads are not yet proven.
- `game-started`: App UI reports the game has started.
- `tuner-ready`: Tuner gameplay reads and map summary are usable.
- `controller-ready`: a project-owned game-scoped App UI controller responds
  with compatible version and capabilities. This becomes the primary gameplay
  read/validator readiness claim after
  `direct-control-game-controller-bridge` lands.
- `stale-listener`: TCP accepts or state list partially responds but protocol
  commands do not complete within the wait budget.

## Operation Status

Run in Game uses a request-id keyed operation state. The POST starts and records
the operation; status is available through a separate read endpoint so a browser
reload or fetch abort can resume display. Mutating phases are never silently
replayed after timeout. Retrying a failed/uncertain run creates a new operation
or requires an explicit recovery action.

Required phases:

`idle`, `materializing`, `deploying`, `checking-civ7`, `reload-needed`,
`preparing-setup`, `starting-game`, `waiting-for-proof`, `complete`,
`blocked`, `failed`, `uncertain`.

## Vite And Artifact Regeneration

Run in Game must not modify browser-imported generated modules in a way that
forces Vite to reload the active Studio tab before the operation reaches a
terminal or durable resumable status. The preferred implementation is to keep
disposable launch materialization isolated from browser imports and avoid
cleanup regeneration during the in-flight operation. If Vite watch ignores are
used, they must be backed by a browser-click proof, not assumed sufficient.

## Failure Details And Recovery

Studio preserves structured direct-control failure details: phase, failure
class, map script, materialization mode/path, reload boundary, completed
phases, direct-control error code, and copyable diagnostics. Recovery actions
are explicit: retry status check, reload Civ7 UI, exit to main menu and
continue, retry run, and copy diagnostics. Disruptive recovery is only automatic
when the original Run in Game action already authorized it and the phase state
records that authorization.

## Review Lanes

- Direct-control lifecycle review: state classification, readiness gates, and
  no mutation replay.
- Studio/Vite robustness review: server identity, HMR/reload behavior,
  operation status persistence, and client recovery display.
- Verification review: tests and live proof matrix prove the failure modes, not
  only the happy path.
- Product/UX review: developers can understand what happened and choose
  recovery without reading terminal logs.
