## 1. Frame

- [x] 1.1 Workstream record + proposal/design/tasks/spec deltas committed
      (`design/tuner-session-frame`), `--strict` valid.

## 2. direct-control seam (`design/tuner-session-seam`)

- [x] 2.1 `Civ7DirectControlOptions.session?` — caller-owned session;
      `withCiv7DirectControlSession` reuses without closing; absent →
      unchanged behavior.
- [x] 2.2 Graceful `close()`: reject pending → `end()` (FIN) → await
      `close` with 1s fallback `destroy()`; idempotent.
- [x] 2.3 `session.stats`: consecutive response-timeouts (increment on
      response-timeout, reset on any resolved frame).
- [x] 2.4 Package tests (fake tuner server): injected session reused +
      not closed; FIN observed on graceful close; stats counter behavior.
- [x] 2.5 Gates: direct-control tests, tsc, dependents build.

## 3. Effect service (`design/tuner-effect-session`)

- [x] 3.1 `Civ7TunerSession` (studio-server): `scoped:` acquireRelease of
      one session; `use(run)` with cooldown gate (threshold 4, 15s,
      response-timeout only) + typed `Civ7TunerBackoffError`; `session` +
      `health()` ports.
- [x] 3.2 `Civ7TunerClient`: `dependencies: [Civ7TunerSession.Default]`;
      accessors route through `use` with the shared session injected.
- [x] 3.3 `runtime.ts` merges the session layer (memoized single
      instance); `handler.ts` exposes `tuner.{session,health}` +
      `dispose()`.
- [x] 3.4 Tests: gate fail-fast/half-open/reset against a stub session;
      dispose closes the session exactly once.
- [x] 3.5 Gates: studio-server build + tests, studio app tsc/tests.

## 4. Daemon wiring (`design/tuner-daemon-wiring`)

- [x] 4.1 Control mount options gain `session?` → merged into
      `endpointDefaults` (no control-orpc package changes).
- [x] 4.2 `daemon.ts`: inject the shared session into the control
      handler; `/healthz` tuner block (consecutive timeouts, gate,
      `wedgeSuspected`); SIGINT/SIGTERM → `dispose()` → stop.
- [x] 4.3 Tests: daemon health/dispatch updates; existing pins green.
- [x] 4.4 Gates: tsc, studio tests, mod tests, build + worker bundle,
      `--strict` valid.
- [x] 4.5 Live verification (fresh processes, Civ7 in shell): readiness +
      live polls work; `lsof -nP -iTCP:4318` shows ONE established
      connection reused across polls and a flat CLOSED count during a
      soak; healthz tuner block live; daemon stop sends FIN.
- [x] 4.6 Workstream record closed with evidence; goal-ledger entry.

## 5. Deferred (explicit)

- [ ] 5.1 Run-in-game flow convergence onto the shared session — OUT OF
      SCOPE (behavior parity); revisit only with a dedicated parity
      harness.
- [ ] 5.2 "Restart Civ7" recovery affordance in the Studio UI driven by
      `wedgeSuspected` — follow-up surface work.
