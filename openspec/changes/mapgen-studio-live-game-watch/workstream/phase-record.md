# D10 Phase Record - Studio Live Game Watch

## Phase

- Project: Studio runtime Effect refactor
- Domino: D10
- OpenSpec change: `mapgen-studio-live-game-watch`
- Owner: Codex implementation DRA lane
- Branch/Graphite stack: `codex/runtime-effect-live-game-watch`
- Status: implementation committed; operation state-machine live proof consumed
  by D12; D10 live-game watcher-specific Civ7 proof passed in the 2026-06-16
  re-entry.

## Objective

- Target movement: move live Civ7 status freshness from browser cadence into an
  Effect-scoped daemon runtime watcher that publishes `live-game` events through
  D8 `StudioEventHub`.
- Non-goals: alternate event transport, browser recovery, operation push,
  operation polling/watchdog deletion, snapshot/setup streaming, dev-process
  runner cleanup, final public/manual status endpoint closeout.
- Done condition for this slice: code/tests/docs prove package-owned watcher
  mechanics, daemon/runtime composition, client pushed-state application,
  browser cadence deletion, and either live-game watcher proof or a not-green
  live-proof handoff. D12 later consumed Run in Game and Save&Deploy operation
  live proof, while `workstream/next-packet.md` carries the remaining
  live-game watcher-specific proof.

## Gate 1 - Frame

- Hard core: one daemon-runtime live-game watcher, shared `Civ7TunerSession`,
  D8 event hub, first/change-only publication, clock-only quiet behavior, client
  pushed-state application, request/response snapshot/setup follow-ups, browser
  cadence deletion, live proof or not-green `next-packet.md`.
- Exterior: D11 Nx dev runner, D12 game-door invariant, public/manual status
  endpoint classification, operation event push, browser storage recovery,
  generated outputs.
- Falsifier: an implementer can keep a renamed browser live-status loop, read
  FireTuner through an alternate session, publish every tick, count clock-only
  fields as changes, skip live proof while claiming green, or treat old S3.3
  implementation history as current closure.
- Proof labels: OpenSpec validation, package watcher tests, daemon composition
  tests, app event/follow-up tests, negative searches, live Civ7 proof or
  not-green handoff, downstream realignment, Graphite/worktree cleanliness.
- Review lanes: packet-authoring reviews from acceptance plus fresh D10
  implementation-diff review on the current code diff.

## Gate 2 - Repo State

- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-S-studio-runtime-effect-refactor`
- Branch: `codex/runtime-effect-live-game-watch`
- Entrance status: clean above D9 commit `983218c02 feat(studio): push operation updates through events`.
- Current implementation dirty files before commit: live-game watcher/runtime
  source, handler lifecycle, public exports, app live-runtime setup guard,
  browser live-control port deletion, focused tests, and D10 workstream docs.
- Graphite stack: D10 is parented to `codex/runtime-effect-operations-push`.

## Gate 3 - Diagnosis

The pre-D10 code had a partial live-game watcher but it was handler-owned and
imperative: manual timer lifecycle, `start()`/`stop()` ownership in the RPC
handler, and browser-side live-status cadence. That shape could push events but
kept lifecycle truth outside the package Effect runtime.

The implementation repairs the ownership split:

- `StudioLiveGameWatcher` is an Effect service/layer with scoped loop fiber and
  Effect semaphore-protected `tick`.
- Production `makeStudioLiveGameWatcherLayer` consumes `Civ7TunerClient`; the
  watcher implementation does not import direct-control, construct sessions, or
  bridge back through `Runtime.runPromise` inside the tick path.
- `createStudioRpcHandler` lazily acquires the watcher service and lifecycle
  closes through `runtime.dispose()` plus daemon event-hub shutdown.
- Browser live-status cadence is removed; retained live snapshot/setup reads are
  event-triggered request/response follow-ups with stale result guards.

## Gate 4 - Corpus / Action Surfaces

| Surface | Owner | Consumer | Verification |
| --- | --- | --- | --- |
| `live-game` event payload | `packages/studio-server` TypeBox contract | app event hook | existing TypeBox/Standard Schema contract surface retained |
| live-game key helper | package live-game model | watcher and client model | keying tests, clock-only quiet tests |
| `StudioLiveGameWatcher` | daemon runtime service/layer | EventHub and Studio app | package watcher tests, disposal tests |
| shared live status read | `Civ7TunerClient` / `Civ7TunerSession` | watcher and manual status endpoint | composition source proof, negative search |
| event publication | D8 `StudioEventHub` | `studio.events.watch` subscribers | first/change/quiet tests, publish-failure diagnostics test |
| client event hook | `useStudioEvents` | `StudioShell` state | existing event-adoption tests plus live model proof |
| snapshot follow-up | request/response `civ7.live.snapshot` | live preview state | request-key/stale-commit tests retained |
| setup follow-up | request/response setup reads | setup suggestions/visibility | setup request-key stale/newer-event model test |
| browser cadence deletion | app source/tests | live status freshness | negative searches |
| live proof | local Civ7 runtime | product confidence | D10 watcher-specific proof passed 2026-06-16; `workstream/testing-ledger.md` records raw and parsed captures |

## Gate 5 - Grouping

- Contract group: TypeBox event payload and event union membership remain package-owned.
- Runtime group: Effect-scoped watcher, shared session/client path, EventHub publication, disposal behavior.
- Client group: event hook application, `StudioShell` state update, snapshot and setup request/response follow-ups.
- Deletion group: browser live-status timers, polling hooks, refetch intervals, background status/readiness calls.
- Proof group: unit/component tests, negative searches, OpenSpec/Nx gates, live Civ7 not-green handoff.

## Gate 6 - Expected Behavior

- The daemon publishes a `live-game` event on first observation.
- Changed stable live-game key publishes.
- Unchanged key, clock-only changes, and failure-count-only changes stay quiet.
- EventHub publication failure logs diagnostics, does not synthesize false live-game error state, and does not poison future publication of the same key.
- Production watcher reads through `Civ7TunerClient` and the daemon runtime's shared session path.
- Client state updates from pushed events.
- Snapshot/setup reads are request/response follow-ups triggered by pushed state, with request keys and stale/newer-event protection.
- Browser live status freshness has no remaining scheduler or readiness cadence seam.
- D10 watcher-specific live proof is green as of the 2026-06-16 re-entry. Broad
  product/state-machine proof remains owned by the downstream D12 records.

## Gate 7 - Architecture Translation

- Owning package: `@civ7/studio-server`.
- App composition owner: `apps/mapgen-studio` daemon and Studio shell.
- Effect resources: `StudioLiveGameWatcher` service/layer, scoped fiber loop,
  shared `Civ7TunerClient` / `Civ7TunerSession`, D8 `StudioEventHub`, runtime
  finalizer.
- Forbidden owners: browser live-status timer, app-local polling hook, alternate
  FireTuner status reader, direct-control bypass, second event route, Zod event
  mirror, hidden compatibility cadence.
- Public surface: `studio.events.watch` on existing `/rpc`; fake live-status
  read seams stay source-private to package tests and are not exported from the
  package barrel.

## Gate 8 - Slice Plan

D10 remains one OpenSpec change and one Graphite branch. It implements live-game
daemon publication and browser live-status cadence deletion. D11 owns Nx dev
runner/process simplification. D12 owns final game-door invariant, public/manual
status endpoint classification, live proof re-entry if still pending, and final
schema/residue closeout.

## Gates 9-10 - Proof Labels

- OpenSpec validation proves packet/spec shape only.
- Package watcher tests prove first/change/quiet/clock-only/disposal behavior
  and publication failure boundary.
- Daemon composition source tests prove shared service path and no direct-control
  watcher bypass.
- App tests prove live-runtime model keying and event adoption paths.
- Negative searches prove browser live-status cadence deletion.
- D12 records live Run in Game and Save&Deploy operation state-machine proof.
- `testing-ledger.md` records the live-game watcher-specific proof; D10 does not
  claim that proof from D12.

## Gate 11 - Review

- Packet-authoring prework/corpus, hardening/black-ice, and testing/vendor
  reviews remain recorded in `review-disposition-ledger.md`.
- Fresh implementation-diff review completed in the current lane with no
  unresolved P1/P2 after repairs. Repaired findings include late-subscriber
  live-game replay, non-throwing failure counts, proof wording, native Effect
  tick path, private fake-read seam, and workstream proof truthfulness.

## Gate 12 - Historical Implementation Closure

The original implementation commit closure required:

- fresh implementation review has no unresolved P1/P2;
- OpenSpec, package/app checks, focused tests, Nx checks, negative searches, and
  `git diff --check` are recorded;
- `workstream/next-packet.md` records the then-narrowed unrun live-game watcher
  proof;
- explicit paths are staged and Graphite commit leaves the worktree clean.

## D10 Live-Proof Re-Entry - 2026-06-16

- Branch: `codex/runtime-effect-d10-live-proof`.
- Re-entry reason: the recovery closeout stack preserved D10 task 5.8 as the
  only open runtime Effect packet row after D12 drain and stale accounting were
  reconciled.
- Entry status: proof-slice design draft in `workstream/live-proof-plan.md`;
  fresh review found one P1 and multiple P2 plan issues, all repaired in the
  plan before proof execution; live Civ7 proof was not yet claimed at this
  re-entry checkpoint.
- Owner: D10 live-game watcher proof records and task 5.8 only.
- Exterior: runtime code, public contracts, generated outputs, success-only
  proof logging, Graphite submit, and broad product/state-machine closure
  outside the watcher-specific claim.
- Gate position at entry: systematic gates 1-8 had been reopened and repaired
  for the retained live proof only; gates 9-12 remained blocked until the
  static gates, environment preflight, event-stream proof, and browser/network
  proof existed.

## D10 Live-Proof Execution - 2026-06-16

- Branch and commit: `codex/studio-dev-port-env` at `aa8325a83`.
- Proof target: D10 task 5.8 only.
- Dev surfaces: daemon `127.0.0.1:5274`, frontend `http://localhost:5273`.
- Static gates: `git diff --check`, focused app port tests,
  `mapgen-studio:check`, `mapgen-studio:test`, D10 strict OpenSpec validation,
  full OpenSpec validation, and `bun run lint` passed; lint retained only the
  existing `doc-ambiguity` advisory.
- Live gates: `/tmp/d10-game-status.json` and `/tmp/d10-game-health.json`
  returned `ok: true` and `readiness: "tuner-ready"`;
  `/tmp/d10-live-watch-1.sse` proved first `hello` and `live-game`;
  `/tmp/d10-live-watch-2.sse` proved reconnect replay; the bounded streams
  proved quiet unchanged-key behavior; `/tmp/d10-live-turn-change-summary.json`
  and `/tmp/d10-live-watch-turn-change.sse` proved changed state after an
  autoplay trigger with `turn: 34 -> 35`;
  `/tmp/d10-browser-network-proof.json` proved browser event-stream consumption
  without background live-status or readiness cadence.
- Gate position: D10 task 5.8 is closed by this proof record; proof-audit
  findings are accepted/repaired in `workstream/testing-ledger.md`.
