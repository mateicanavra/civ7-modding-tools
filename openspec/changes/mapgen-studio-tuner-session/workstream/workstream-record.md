# Systematic Workstream Record

## Frame

- Objective: Stop the Civ7 tuner connection churn that wedges the game
  (leaked game-side fds → all reads time out) by making the daemon's
  polling read surface share ONE Effect-managed `Civ7DirectControlSession`
  — scoped acquisition/release in the studio `ManagedRuntime`, graceful
  FIN on shutdown, typed backoff when the game stops answering, wedge
  signal on healthz. User direction: solve with Effect; follow the
  /typescript skill's design disciplines.
- Future state: a long Studio session keeps at most one established tuner
  connection for polls; the daemon disposes its runtime on shutdown (FIN
  to the game); when the game goes silent the Studio backs off with a
  typed error instead of hammering; the wedge state is observable.
- Non-goals: pooling/RcRef; run-in-game flow changes; "restart Civ7" UI;
  control-orpc package changes.
- Hard core: behavior parity for run-in-game (serialized queue, proof
  markers, per-flow sessions untouched); read-surface response shapes +
  non-uniform status codes unchanged (failure message text may differ
  while the gate is open); `Civ7DirectControlOptions.session` absent →
  byte-identical legacy behavior; no Effect dependency enters
  `@civ7/direct-control`.
- Exterior: `codex/*` branches; CLI consumers of direct-control (the new
  options field is additive).

## Authority

- `openspec/changes/mapgen-studio-bun-server/workstream/workstream-record.md`
  Phase 4 addendum (incident: 187 leaked fds; isolation matrix: clean
  reads leak zero under node AND Bun)
- effect@3.21.3 source (ManagedRuntime scope/dispose semantics;
  Effect.Service `scoped:`/`dependencies`; layer memoization; no core
  circuit breaker — Effect-TS/effect#2843)
- effect-orpc@0.2.2 source (`runtime.runPromiseExit` per handler; no
  per-request scope — app-scope services live in the runtime layer)
- `packages/civ7-direct-control/src/session/*` (listenerId multiplexing,
  idempotent connect, the `withCiv7DirectControlSession` funnel)
- TypeScript skill references (ports/adapters, strangler fig, typed error
  contracts, proportional complexity)

## Plan

- Phase 1 (`design/tuner-session-frame`): this record + docs, `--strict`.
- Phase 2 (`design/tuner-session-seam`): direct-control injection seam +
  graceful close + stats (+ package tests).
- Phase 3 (`design/tuner-effect-session`): `Civ7TunerSession` scoped
  service + gate; `Civ7TunerClient` convergence; handler `tuner` ports +
  `dispose()`.
- Phase 4 (`design/tuner-daemon-wiring`): control mount session
  injection; healthz tuner block; signal-driven dispose; live soak
  verification (one established connection; flat CLOSED count).

## Evidence

- Phase 1 (`design/tuner-session-frame`, de06d0e4a): docs committed;
  `--strict` valid. Research wave first: effect 3.21.3 + effect-orpc +
  oRPC source verification (ManagedRuntime dispose runs Layer.scoped
  finalizers; effect-orpc has no per-request scope; no core circuit
  breaker), full consumer map of every session creation point, /typescript
  pattern sweep (ports/adapters, strangler fig, proportionality → no
  RcRef/pool: the session self-heals).
- Phase 2 (`design/tuner-session-seam`, abec11ab7): options.session seam +
  graceful FIN close + stats; 389/389 package tests (incl. 5 new pins);
  package tsc + build.
- Phase 3 (`design/tuner-effect-session`, 644d1e9db): `Civ7TunerSession`
  (Context.Tag + Layer.scoped, parameterized), gate, client convergence,
  handler `tuner.*` + `dispose()`; effect deduped to 3.21.3; studio 204
  tests incl. 3 new pins (one shared connection + FIN on dispose; gate
  fail-fast → half-open → reset; wedge-suspicion health).
- Phase 4 (`design/tuner-daemon-wiring`): control mount session injection;
  healthz tuner block; SIGINT/SIGTERM dispose. **Live soak found a real
  bug the units missed**: 13 stable ESTABLISHED tuner connections — the
  page-load burst raced `connect()` (only sequentially idempotent); fixed
  with in-flight connect dedup in the session class + concurrent-burst
  pin (390 package tests). Post-fix live evidence (fresh processes, Civ7
  in shell): healthz `tuner: { consecutiveResponseTimeouts: 0,
  gateOpenUntil: null, wedgeSuspected: false }`; readiness 200 with the
  `shell` chip live in the Game bar; **exactly 1 established connection on
  :4318 across 30s+ of app polling, zero CLOSED-state fds**; after daemon
  stop the game holds ONLY its listener (descriptor fully released —
  the wedge signature's exact inverse). Gates: tsc, studio 204, mod 471,
  build + worker bundle, `--strict` valid.
