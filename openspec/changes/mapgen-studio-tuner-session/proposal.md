# Shared Civ7 tuner session — Effect-scoped acquisition/release in the daemon

## Why

The Civ7 FireTuner endpoint (port 4318) wedges after long Studio sessions:
the game process accumulates leaked TCP descriptors (observed: 187
CLOSED-state fds held by CivilizationVII), after which ALL tuner reads time
out until the game is restarted. The client side drives this: every
direct-control procedure opens a fresh TCP connection and `destroy()`s it
(`withCiv7DirectControlSession` connect-per-request), and the Studio polls
several read endpoints every few seconds through the daemon — thousands of
connect/RST cycles per session, with the leak concentrating when polls
time out against a busy game (in-game mapgen, loading screens). Clean
reads leak zero fds (verified under node and Bun: sequential, concurrent,
forced-timeout matrices), so the fix is to stop the churn, not to chase a
runtime bug.

The session protocol already supports the fix: `Civ7DirectControlSession`
multiplexes concurrent requests over one socket via listenerIds and
self-heals (`connect()` is reuse-idempotent). What is missing is an owner:
a scoped, shared session whose lifetime is managed — acquired lazily,
released gracefully — and a polite failure mode when the game stops
answering. The daemon (P5 cutover) is the natural owner, and the
studio-server's Effect `ManagedRuntime` is the natural lifecycle host
(user direction: solve this with Effect — scoped release/acquisition as a
layer).

## Target Authority Refs

- `openspec/changes/mapgen-studio-bun-server/workstream/workstream-record.md`
  (Phase 4 addendum — incident evidence + isolation matrix)
- `packages/studio-server/src/{runtime,services/Civ7TunerClient}.ts`
  (Effect service idiom; `ManagedRuntime` host seam)
- effect@3.21.3 source (verified): `ManagedRuntime.make` builds the layer
  into a closeable scope; `dispose()` runs `Layer.scoped` finalizers;
  `Effect.Service` supports `scoped:` constructors and `dependencies`,
  with layer memoization deduplicating a shared service
- `packages/civ7-direct-control/src/session/*` (session class: listenerId
  multiplexing, idempotent `connect()`, `withCiv7DirectControlSession`
  funnel — the single low-churn seam all ~60 procedures pass through)
- TypeScript skill (`/typescript`): ports/adapters seam, strangler-fig
  migration (polling reads first, run-in-game untouched), functional
  gate state, proportional complexity (no pool/RcRef — the session
  instance self-heals and never needs replacement)

## What Changes

- **`@civ7/direct-control` — injection seam + graceful close + stats**
  (no Effect dependency added):
  - `Civ7DirectControlOptions.session?: Civ7DirectControlSession` —
    `withCiv7DirectControlSession` uses a caller-owned session without
    closing it; absent, behavior is unchanged. One field converges all
    ~60 procedures (they all funnel through `execute.ts`).
  - `Civ7DirectControlSession.close()` becomes graceful: reject pending,
    then `socket.end()` (FIN) and wait for `close` with a short timeout
    falling back to `destroy()`. Benefits every path, including
    run-in-game per-flow sessions, without semantic change.
  - Session-level health counters (`session.stats`): consecutive
    response-timeouts (reset on any successful frame) — the one place
    that observes ALL traffic on the shared socket.
- **`@civ7/studio-server` — `Civ7TunerSession` Effect service** (new):
  `scoped:` constructor acquiring ONE `Civ7DirectControlSession` via
  `Effect.acquireRelease` (lazy connect on first request; release =
  graceful close on `runtime.dispose()`), exposing `use(run)` (gated
  execution with typed fail-fast `Civ7TunerBackoffError` while the
  cooldown gate is open), `session` (for host injection into the
  control-oRPC context), and `health()`. Gate policy: opens after N
  consecutive response-timeouts (read from `session.stats`, so control
  traffic counts too), fixed cooldown, naturally half-open after expiry.
  `Civ7TunerClient` gains `dependencies: [Civ7TunerSession.Default]` and
  routes every accessor through `use` with the shared session injected.
  `StudioRpcHandle` gains `tuner.{session,health}` promise ports and
  `dispose()` (today nothing closes the runtime scope — finalizers never
  ran).
- **Daemon wiring** (`apps/mapgen-studio`): the control-oRPC context
  builders accept `session?` and merge it into `endpointDefaults`
  (`Civ7DirectControlOptions` already typed there — zero control-orpc
  package changes); the daemon injects the shared session from the
  studio runtime, reports tuner health (consecutive timeouts, gate
  state, wedge suspicion) on `/healthz`, and disposes the runtime on
  SIGINT/SIGTERM so the socket gets a clean FIN.
- **Run-in-game flows: UNTOUCHED** (strangler order; behavior-parity hard
  core). Engines keep their per-flow sessions — bounded, serialized by
  the operation queue, and now graceful-closing via the package fix.

## Non-Goals

- No connection pooling / RcRef / request serialization — the session
  multiplexes and self-heals; one instance for the runtime's life.
- No change to run-in-game semantics (queue, proofs, reconnect flows).
- No "restart Civ7" UI affordance this change (healthz + typed errors
  expose the wedge signal; UI surfacing is a follow-up).
- No control-orpc package changes beyond what the existing
  `endpointDefaults` type already permits.

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `packages/civ7-direct-control/src/session/{types,session}.ts`
  (+ tests), `packages/studio-server/src/{services/Civ7TunerSession.ts
  (new), services/Civ7TunerClient.ts, runtime.ts, handler.ts, index.ts}`
  (+ tests), `apps/mapgen-studio/src/server/civ7ControlOrpc.ts`,
  `apps/mapgen-studio/src/server/daemon/daemon.ts` (+ tests)
