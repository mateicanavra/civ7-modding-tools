# CLI Notification Dismissal oRPC Send Slice

## Scope

Route `civ7 game play dismiss-notification --send` through the native
in-process `notifications.dismiss.request` server-side client. The CLI remains
the shell-facing command owner; `packages/civ7-control-orpc` owns the semantic
dismissal procedure; `@civ7/direct-control` remains the low-level
runtime/proof port for notification dismissal reads, validation, closeout
execution, and postcondition evidence.

The inspect-only `game play dismiss-notification` path remains the existing
direct-control notification dismissal read. This slice does not revive a
facade-only notification read procedure.

## Write Set

- `packages/cli/src/commands/game/play/dismiss-notification.ts`
- `packages/cli/test/commands/game/play/notification/dismiss.test.ts`
- This OpenSpec scenario/task/workstream record

## Boundary

- No Studio, controller bridge, RPCLink, OpenAPI, or transport work.
- No direct-control procedure-core scaffolding.
- No raw command/session/state/Tuner payloads, route diagnostics, closeout
  paths, verification attempts, or legacy `verified` in normal send output.
- No play-thread wake and no live-game/runtime proof claim.
- No parent Task 5.x/6.x/7.x acceptance by implication.

## Proof

- Focused CLI test proves the approved send path reaches the existing
  direct-control notification dismissal runtime command through the in-process
  service client path, emits semantic `notifications.dismiss.request` output,
  and keeps raw command/session/state, route diagnostics, closeout path,
  verification attempts, and legacy `verified` out of normal JSON.
- Existing stale notification fixtures continue to prove engine-front-still-live
  paths are sent-unverified and no-repeat guarded in the CLI surface.
- Closure still requires `check:cli`, `test:cli:play`, relevant strict
  OpenSpec validates, diff hygiene, and a durable Graphite commit.
