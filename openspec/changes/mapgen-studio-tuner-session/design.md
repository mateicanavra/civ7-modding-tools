# Design — Effect-scoped shared tuner session

## The resource model (proportionality decision)

Research verdict (effect@3.21.3 source + effect-orpc source + repo prior
art): the canonical Effect shape for "one shared long-lived connection,
released on shutdown" is a `Context.Tag` service built with
`Layer.scoped`/`Effect.Service({ scoped: ... })` whose constructor uses
`Effect.acquireRelease`; `ManagedRuntime.make(layer)` extends the layer
into a closeable scope and `dispose()` runs the finalizers
(`internal/managedRuntime.ts`: `disposeEffect = Scope.close(scope)`).
effect-orpc executes every `.effect` handler via
`runtime.runPromiseExit(effect, { signal })` — services come from the
runtime layer; there is no per-request scope, so the service encapsulates
any scoping internally.

`RcRef`/`Pool` were evaluated and rejected: `RcRef.invalidate` exists
(3.19.6, `@experimental`) for replace-on-failure resources, and a size-1
`Pool` would serialize use — but `Civ7DirectControlSession` multiplexes
concurrent requests over one socket (listenerId routing) and `connect()`
is reuse-idempotent (a dead socket reconnects on the next `request()`).
The instance never needs replacement, so the proportional model is **one
instance, `acquireRelease`, self-healing inside**. No semaphore: only
acquisition would need serializing, and the session class already guards
that. (Effect core has no circuit breaker — issue #2843 — so the gate is
a `Ref` cooldown, the documented minimal idiom.)

## Ownership topology (one owner, three consumers)

```
ManagedRuntime (makeStudioRuntime, daemon-lifetime, dispose() on SIGINT/SIGTERM)
  └─ Civ7TunerSession (Layer.scoped: acquireRelease ONE Civ7DirectControlSession)
       ├─ Civ7TunerClient (Effect dep): every /rpc read → use(run, {session})
       ├─ control-oRPC facade: daemon injects `session` into endpointDefaults
       │    (Civ7ControlOrpcContext.endpointDefaults is ALREADY typed as
       │     Civ7DirectControlOptions — the new options field flows through
       │     the entire router with zero control-orpc changes)
       └─ healthz: tuner.health() → { consecutiveResponseTimeouts, gate }
Run-in-game engines: untouched (per-flow sessions, serialized queue) — they
gain graceful close from the package fix but do NOT share the socket.
```

Layer memoization guarantees one instance: `Civ7TunerClient.Default`
declares `dependencies: [Civ7TunerSession.Default]`, and the runtime layer
also merges `Civ7TunerSession.Default` to expose it — the same layer
reference is memoized within one `ManagedRuntime`, so the client and the
host port see the same session.

## The seam in `@civ7/direct-control` (no Effect dependency)

```ts
// session/types.ts
interface Civ7DirectControlOptions {
  // ...existing host/port/timeoutMs/state
  /** Caller-owned session: reused, NOT closed by the callee. */
  session?: Civ7DirectControlSession;
}

// session/session.ts
export async function withCiv7DirectControlSession(options, run) {
  if (options.session) return await run(options.session); // caller owns lifecycle
  const session = new Civ7DirectControlSession(options);
  try { return await run(session); } finally { await session.close(); }
}
```

All ~60 procedures funnel through this wrapper (via `execute.ts`), so the
single field converges every read path. Long-flow procedures
(`startPreparedCiv7SinglePlayerGame`, `restartCiv7Game`,
`runCiv7SinglePlayerFromSetup`) hold their own sessions via a separate
`withSession` dependency pattern and are deliberately not converged.

**Graceful close** (leak mitigation at the root, benefits all paths):
`close()` rejects pending, then `socket.end()` (FIN) and awaits the
`close` event with a 1s timeout falling back to `destroy()`; idempotent;
release-path errors are swallowed (finalizers must not fail).

**Session stats** (the only point that observes ALL shared-socket
traffic, control reads included): `consecutiveResponseTimeouts`
incremented on each `response-timeout` rejection, reset to zero on every
successfully resolved frame; exposed read-only as `session.stats`.

## `Civ7TunerSession` service (studio-server)

```ts
class Civ7TunerSession extends Effect.Service<Civ7TunerSession>()(
  "@civ7/studio-server/Civ7TunerSession",
  {
    scoped: Effect.gen(function* () {
      const session = yield* Effect.acquireRelease(
        Effect.sync(() => new Civ7DirectControlSession()),   // lazy: connects on first request
        (s) => Effect.promise(() => s.close()),              // graceful FIN on dispose()
      );
      const gate = yield* Ref.make({ openUntil: 0 });
      const use = <A>(run: (o: { session: Civ7DirectControlSession }) => Promise<A>) =>
        gateCheck.pipe(Effect.zipRight(Effect.tryPromise({
          try: () => run({ session }),
          catch: classify,                                    // typed error union
        })));
      return { use, session, health };
    }),
  },
) {}
```

- **Gate policy**: opens when `session.stats.consecutiveResponseTimeouts
  >= 4` (set `openUntil = now + 15s`); while open, `use` fails fast with
  `Civ7TunerBackoffError` (Data.TaggedError carrying
  `consecutiveResponseTimeouts`, `retryAt`) without touching the socket;
  after expiry the next request flows (natural half-open: a timeout
  re-opens, a success resets the counter). Trigger is `response-timeout`
  ONLY — `connection-failed`/refused (game not running) is fast, leak-free
  and must keep flowing for readiness UX.
- **Error channel**: one strategy at the boundary — `use` surfaces
  `Civ7TunerBackoffError | UnknownException`; the existing router error
  mapping is unchanged in shape (live.status keeps 200 + per-field
  embedded `{error}`; non-uniform status codes preserved — only failure
  message TEXT differs when the gate fails fast, which was never pinned).
- `Civ7TunerClient` accessors change mechanically:
  `Effect.tryPromise(() => fn(args, { timeoutMs }))` →
  `tuner.use((o) => fn(args, { timeoutMs, ...o }))`.
- `StudioRpcHandle` gains `tuner: { session(): Promise<Civ7DirectControlSession>;
  health(): Promise<Civ7TunerSessionHealth> }` and `dispose(): Promise<void>`
  (delegating to `runtime.dispose()`). **Today nothing disposes the
  runtime** — finalizers never ran; the daemon now does on
  SIGINT/SIGTERM.

## Daemon wiring

- `createStudioCiv7ControlOrpcContext/RpcHandler/Middleware` options gain
  `session?: Civ7DirectControlSession` → merged into `endpointDefaults`.
- `daemon.ts`: builds the handler, resolves `await studioRpc.tuner.session()`
  once at startup, passes it to the control handler; `/healthz` gains a
  `tuner` block (`consecutiveResponseTimeouts`, `gateOpenUntil`,
  `wedgeSuspected: consecutive >= 4`); SIGINT/SIGTERM → `dispose()` →
  `server.stop()`.

## Migration order (strangler fig)

1. Package seam + graceful close + stats (independently valuable; no
   consumer change).
2. Effect service + Civ7TunerClient convergence (the /rpc poll surface).
3. Daemon wiring (control facade shares the socket; health; dispose).
4. Run-in-game convergence: explicitly deferred — out of scope.

## Implementation addenda (as built)

- The service is a `Context.Tag` + `Layer.scoped` pair
  (`makeCiv7TunerSessionLayer(options)`) rather than the `Effect.Service`
  `scoped:` sketch above — the layer must be parameterizable (tests inject
  a fake tuner endpoint + short gate timings); `Civ7TunerSessionLive` is
  the zero-config production reference that both `Civ7TunerClient`'s
  dependencies and the runtime merge share (memoized single instance).
- **Connect race found by the live soak (not the unit tests):** the
  session's `connect()` was only reuse-idempotent for sequential callers.
  A page-load burst (~13 concurrent reads through the shared session) made
  every caller see "no socket", dial its own, and leak all but the last —
  observed as 13 stable ESTABLISHED connections. Fixed at the root in
  `@civ7/direct-control`: in-flight connect deduplication (`connecting`
  promise memo), pinned by a concurrent-burst package test. Post-fix soak:
  exactly ONE established connection across sustained polling.
- The workspace `effect` versions were skewed (app + control-orpc pinned
  3.21.2, studio-server 3.21.3 → mixed-runtime warning when the layers
  crossed); deduped to 3.21.3 everywhere.

## Verification

- direct-control tests (package has a fake-tuner-server fixture):
  injected session reused and NOT closed by the wrapper; graceful close
  delivers FIN (server observes `end`, not abrupt RST); stats counter
  increments on response-timeout and resets on success.
- studio-server: gate behavior unit-tested against a stub session
  (fail-fast while open, half-open after cooldown); dispose runs the
  release (session.close called once).
- daemon route tests unchanged; live: `bun run dev` → app polls readiness
  and live status → **exactly ONE established connection on :4318 from
  the daemon, reused across polls** (`lsof -nP -iTCP:4318 | grep
  ESTABLISHED`), CLOSED-fd count stays flat during a soak; healthz tuner
  block present; Ctrl-C/daemon stop sends FIN (game-side fd count does
  not grow).
