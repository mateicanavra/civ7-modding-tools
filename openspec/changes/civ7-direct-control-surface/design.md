## Design State

Status: accepted for implementation after discovery.

Discovery reports converged on the same owner shape:

- `repo-surface-report.md`: CLI and Studio currently duplicate control
  ownership; add a `packages/civ7-direct-control` workspace package.
- `runtime-protocol-report.md`: Civ7 itself owns the live listener on port
  4318; direct state discovery and command execution work without FireTuner.
- restart/begin live proof: after `Network.restartGame()`, the native Begin Game
  path is `UI.notifyUIReady()` from `App UI` when loading reaches
  `WaitingForUIReady`/`WaitingToStart`; Tuner gameplay globals are ready after
  `GameStarted`.

Chrispresso Debug Console inspection adds future autocomplete insight, but it
does not change the transport design: CDC is an in-game `eval` panel with
static and dynamic completions, not an external socket client.

## Selected Boundary

Create `packages/civ7-direct-control` as package `@civ7/direct-control`.

The package owns:

- tuner socket defaults and environment parsing;
- candidate-host discovery from explicit options and environment;
- `LSQ:` state discovery;
- state selection by name, id, or role (`app-ui`, `tuner`);
- `CMD:<stateId>:<command>` execution;
- little-endian frame encode/decode and listener-id correlation;
- layered health checks;
- reconnect-by-new-socket and wait/poll helpers;
- command conveniences such as `Network.restartGame()`,
  `UI.notifyUIReady()`, and restart/begin/tuner-ready orchestration;
- generic fresh-log marker verification helpers;
- classified direct-control errors.

CLI and Studio depend on the package. They do not import each other's source
helpers and do not implement tuner framing locally.

## Runtime Model

The package supports one-off calls and persistent control sessions:

```text
connect -> LSQ -> select state -> CMD -> destroy socket
connect -> LSQ/CMD/.../CMD -> close or reconnect after Civ drops listener
```

One-off helpers may use a short-lived session. Restart/begin/readiness loops use
`Civ7DirectControlSession` so sequential `LSQ:` and `CMD:` requests share one
client connection and reconnect only across Civ7 listener transitions. This
keeps reconnect after game restart explicit without requiring a daemon
lifecycle.

The package does not retry state-changing commands automatically. It may retry
health and discovery probes because those are read-only.

## Owner Classification

- Direct-control transport owner: `packages/civ7-direct-control`.
- CLI owner: command parsing, flags, terminal output, JSON shape, and direct
  game-control commands.
- Studio owner: HTTP endpoint shape, save/deploy workflow, and UI messages.
- Operational docs owner: proof boundaries and local runbooks.
- Forbidden owner: generated outputs, deployed mod files, logs, broad shared
  utilities, and caller-local protocol implementations.

## CLI Contract

`civ7 game restart` defaults to direct socket transport. It accepts host, port,
state, timeout, JSON, and dry-run options for direct mode. `--begin` follows the
native load-screen path with `UI.notifyUIReady()`, and `--wait-tuner` waits for
the Tuner gameplay canary after Begin Game.

`civ7 game exec` sends arbitrary JavaScript to the selected tuner state,
`civ7 game health` reports listener readiness and available states,
`civ7 game health --tuner` checks gameplay API readiness, and `civ7 game
inspect` exposes curated state inspection through the same package.
Alternate runtime transports are removed rather than retained as fallbacks.

## Studio Contract

Studio keeps the `/api/map-configs` save/deploy/restart behavior, but imports
direct-control package APIs for restart and fresh-log verification. Studio may
choose Swooper-specific markers; the package only supplies generic log helpers.

## Type And Autocomplete Strategy

This slice does not create a command catalog. The evidence supports a later
generated/introspected lane:

- dynamic `Object.getOwnPropertyNames(Object.getPrototypeOf(...))` probes can
  discover native methods such as `Network.restartGame`;
- CDC's `completions.js` can be used as external reference material, not source
  truth;
- `packages/civ7-types` remains the type-only owner for durable Civ7 ambient
  declarations if those findings are promoted.

## Architecture Alternatives Rejected Or Deferred

1. CLI-owned shared utility: rejected because Studio would keep importing CLI
   internals.
2. `@civ7/adapter`: rejected because it owns in-game engine adapters, not
   developer-process socket control.
3. Local daemon/API proxy: deferred until multiple external clients or shared
   long-lived sessions justify process lifecycle and port management.
4. External supervisor/runtime-transport lane: rejected and removed from repo
   tooling because direct Civ7 control is live-proven for the same command path
   and adds health, discovery, state selection, and arbitrary command execution.

## Review Lanes Required

- Product review: developer scenarios, consumer impact, proof claims.
- Architecture review: package owner, imports, caller boundaries, no duplicate
  transport ownership.
- Spec review: OpenSpec completeness and no shortcut language.
- Verification review: mock tests, package checks, Studio gates, and live Civ7
  proof boundary.
