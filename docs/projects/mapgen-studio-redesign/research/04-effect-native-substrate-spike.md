# Effect-native substrate spike — VERDICT: keep the hand-rolled shell (revisit at Effect v4 stable)

**Date:** 2026-06-12 (post tuner-session workstream, stack tip
`design/tuner-daemon-wiring`).

**Question (user-directed):** the daemon (`daemon.ts`), dev runner
(`devLive.ts`), and tuner protocol client
(`Civ7DirectControlSession`) hand-roll machinery Effect provides
natively — buffering (`Stream`/`Mailbox`), scope/release, HTTP serving
(`@effect/platform-bun`), child processes (`Command`), request
correlation (`Deferred`), timeouts, connect dedup. Would replacing them
with Effect-native primitives be simpler AND more robust — the leverage
principle, "a solution to a problem that goes away when you stop
creating that problem"? Standing falsifier: **if a native rewrite is
not simpler than what it deletes, that's a verdict, not a failure.**

**Method:** three parallel investigators, all verifying against
published tarball source (not memory): (A) `@effect/platform-bun` HTTP
serving + `runMain`; (B) platform `Socket`/`Command`/Stream framing for
the tuner client and devLive; (C) repo deletion ledger +
stable-surface constraints + effect-orpc interplay.

## The falsifiers fired. All three candidates rejected or deferred.

### Ecosystem facts (verified 2026-06-12, npm registry + tarballs)

- `effect@3.21.3` (our workspace pin) **is the current stable** — no
  bump needed for anything.
- `@effect/platform@0.96.1` / `@effect/platform-bun@0.90.0` are
  peer-compatible (`effect ^3.21.2`), BUT platform-bun declares
  **non-optional peers** `@effect/rpc`, `@effect/sql`,
  `@effect/cluster` (no `peerDependenciesMeta`) — bun installs all of
  them. 5+ new packages for one HTTP shell.
- **Effect v4 is in beta** (`4.0.0-beta.80`, published 2026-06-11;
  official guidance: "v3 remains our recommended choice for
  production"). In v4, `@effect/platform`/`rpc`/`cluster` are **folded
  into effect core** (`effect/unstable/*` paths; verified
  `@effect/platform-bun@4.0.0-beta.80` has a single `effect` peer).
  Anything written against `@effect/platform@0.96.x` today is a
  guaranteed second migration.

### 1. Daemon HTTP shell → `BunHttpServer` + `runMain`: **REJECT**

- LOC accounting is a wash: ~150 deleted (router, signals, Bun.serve
  wiring, mime/static) vs ~100–120 added (HttpRouter graph, a
  `fromOrpc` passthrough helper, Layer/scope plumbing) — plus the 5+
  dep surface.
- The load-bearing invariant (byte-identical oRPC mount behavior) is
  exactly where the drift risk lands: `HttpApp.fromWebHandler`
  decomposes/rewraps the Response (framing can drift); the correct
  idiom is `HttpServerRequest.toWeb` + `HttpServerResponse.raw`
  (zero-copy on Bun, verified), but Bun's adapter **short-circuits HEAD
  requests** before the raw branch, and the server-layer finalizer is
  graceful `server.stop()` (a wedged in-flight request blocks shutdown)
  vs today's deliberate `stop(true)`.
- Shutdown ordering inverts: Layer finalizers run server-stop **then**
  runtime dispose (tuner FIN); today we FIN first, then `stop(true)`.
  Changeable, but it's a behavior change on the fd-leak-mitigation
  path, not a free win.
- **The "one Effect graph" payoff is unattainable:** effect-orpc 0.2.2
  takes a `ManagedRuntime` positionally (`implementEffect(contract,
  runtime)`) and executes every procedure on it via
  `runtime.runPromiseExit`. A `runMain`-launched Layer graph would be a
  *second* runtime; the double-runtime topology survives any rewrite.
  (`ManagedRuntime.make(layer, memoMap)` exists for cross-runtime layer
  sharing if ever needed.)
- v3 platform static serving gives `HttpServerResponse.file` (etag
  emitted, Bun.file streaming) but **no 304/if-none-match handling, no
  path jail, no SPA fallback** — our ~25-line jail/fallback survives
  regardless.
- `@effect/cli` for three flags: overkill (drags printer peers).

### 2. Tuner protocol client rewrite (platform Socket + Stream + Deferred): **REJECT**

- "Relocation, not deletion": deletes ~115 lines of tested mechanism in
  `session.ts`, recreates **≥130 lines** of Effect mechanism (Deferred
  map, drain fiber, mapAccum framer, host fallback, lazy
  reconnect-on-next-request supervision, error-code mapping, custom
  FIN finalizer) **plus a promise facade** (`ManagedRuntime` +
  `runPromise` per method), because the byte-stable promise API (~60
  procedures, CLI + control-orpc + engines + proof subpath consumers,
  CJS build) and the zero-effect-dep constraint force an adapter no
  matter where the Effect core lives.
- Platform Socket semantics **mismatch our soak-verified invariants**:
  `makeNet` dials lazily inside each `run` (reconnect idiom = re-run
  `run`, not reconnect-on-next-request); `writer` is latched on an
  active reader fiber (write-without-reader suspends forever); the
  scope finalizer is `destroySoon()`, **not** our bounded FIN→await
  close→destroy handshake — which is the suspected fd-leak mitigation,
  pinned by tests.
- No built-in length-prefix framing exists (Ndjson/MsgPack are the
  precedents; `Stream.mapAccum` rebuilds our loop in the same line
  count — the pure byte arithmetic in `framing.ts` is irreducible and
  already factored out).
- For request/response correlation the right primitive is `Deferred`
  per listenerId (not Queue/Mailbox — those are ordered pipes;
  `Mailbox` would only fit the single raw-bytes hop).
- **The architecture already has Effect at the right altitude:**
  `Civ7TunerSession` (Layer.scoped + acquireRelease + backoff gate +
  health) owns lifecycle/policy; the class owns bytes. The gate's
  out-of-band `session.stats` read is deliberate — it is the one
  vantage that sees ALL shared-socket traffic including the
  control-oRPC mount, which bypasses `use()`. Moving the counter into a
  typed error channel inside the gate would *lose* that visibility.
- If frame-path pressure ever returns, the surgical option is
  `Mailbox` + `Deferred` *inside* the existing class boundary — not a
  transport rewrite.

### 3. devLive → platform `Command`: **PARTIAL, deferred**

The honest inverse case: `Command.start` is a verified
`acquireRelease` that **SIGTERMs the process group** on scope close
(catches vite's esbuild grandchildren — strictly stronger than our
`child.kill()`), and `Effect.raceFirst` + `Schedule.spaced` genuinely
delete ~60–80 lines of supervision (signal handlers, stop-all flag,
first-exit promise, readiness poll). But it's a dev-only script that
already works, and the price is the same `@effect/platform*` dep
surface rejected above. Verdict: adopt **only** when the platform
packages enter the workspace for other reasons.

## Revisit triggers (recorded, not scheduled)

1. **Effect v4 hits the `latest` dist-tag** — platform moves into
   `effect` core (which we already depend on), the peer-weight
   objection dissolves, and the `runMain` + scoped-finalizer shutdown
   shape becomes worth taking. Re-run this spike then.
2. Wanting WebSockets on the daemon (platform-bun's upgrade support is
   genuinely good) or real HTTP caching/range asset serving.
3. Frame-path pressure in the tuner client → `Mailbox`/`Deferred`
   inside the class boundary, never a transport rewrite.

## Standing regression gate (unchanged)

Live soak on `:4318`: exactly 1 ESTABLISHED connection across
sustained polling, zero CLOSED fds, descriptor released on daemon
stop; healthz tuner block clean. Test pins: direct-control 390, studio
204, mod 471.
