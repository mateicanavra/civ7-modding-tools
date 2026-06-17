# D10 Testing Ledger - Studio Live Game Watch

Status: implementation evidence plus narrowed live-game watcher proof recorded.
Date: 2026-06-15; live proof appended 2026-06-16.

## Proof Matrix

| Layer | Proof | Result |
| --- | --- | --- |
| Packet/spec | `bun run openspec -- validate mapgen-studio-live-game-watch --strict` | passed |
| Full OpenSpec | `bun run openspec:validate` | passed |
| Watcher behavior/lifecycle | `bun run --cwd packages/studio-server test -- test/liveGameWatcher.test.ts test/handler.test.ts` | passed; 20 tests after D10 replay/failure-count repairs |
| Client event/follow-up model | `bun run --cwd apps/mapgen-studio test -- test/liveRuntime/model.test.ts test/studioEvents/operationAdoption.test.ts` | passed; 19 tests after D10 shell follow-up source guard |
| Package check | `bun run --cwd packages/studio-server check` | passed |
| App check | `bun run --cwd apps/mapgen-studio check` | passed |
| Nx package check | `bun run nx run @civ7/studio-server:check --outputStyle=static` | passed; graph-owned Habitat/Grit dependencies green |
| Nx app check | `bun run nx run mapgen-studio:check --outputStyle=static` | passed; rebuilt `@civ7/studio-server` outputs through Nx dependency graph |
| Negative search | cadence/status/session scans below | passed with classified non-D10 hits only |
| Live Civ7 proof | local game/FireTuner proof | passed for D10 watcher-specific task 5.8 on 2026-06-16; see live proof append below |

## Focused Behavior Evidence

- `packages/studio-server/test/liveGameWatcher.test.ts` proves first publish,
  changed-key publish, clock-only quiet behavior, EventHub publish failure as
  diagnostics-only, non-throwing live-status failures increment
  `failureCount`, latest live-game replay for late subscribers, and runtime
  scope disposal stopping automatic watcher publication.
- `packages/studio-server/test/handler.test.ts` proves the actual
  `studio.events.watch` route delivers hello first and replays a retained
  `live-game` event to new subscribers after a pre-subscription publish.
- `apps/mapgen-studio/test/liveRuntime/model.test.ts` proves live-runtime
  snapshot/setup request keys and stale/newer-event commit guards.
- `apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts` proves pushed
  live-game event application and source-guards the `StudioShell`
  `applyLiveGameState` path: pushed state calls setup and snapshot
  request/response follow-ups, uses setup request keys, and does not introduce
  timers, `civ7.live.status`, `liveControlPort.readiness.current`, or
  `refetchInterval`.

## Negative Search Evidence

Command:

```bash
rg -n "nextLiveRuntimePollDelayMs|liveStatusFailureCountRef|civ7\\.live\\.status\\(|fetchLiveRuntimeStatus|useLive.*Poll|refetchInterval|polling|status poll|status-poll|liveControlPort\\.readiness\\.current|setInterval\\(|setTimeout\\(" apps/mapgen-studio/src apps/mapgen-studio/test packages/studio-server/src packages/studio-server/test -S
```

Result classification:

- no `nextLiveRuntimePollDelayMs`, `liveStatusFailureCountRef`,
  background browser `civ7.live.status(` caller, `fetchLiveRuntimeStatus`,
  live polling hook, `refetchInterval`, or `liveControlPort.readiness.current`
  cadence call remains;
- retained `setTimeout` hits are unrelated server/test timeouts, D9 Save/Deploy
  event waiter timeout, autorun timer, viz/render backstops, and generic async
  helpers; none are live-status freshness cadence;
- retained comments mentioning polling are tuner/session historical comments or
  contract prose, not browser live-status cadence code.

Command:

```bash
rg -n "@civ7/direct-control|Civ7DirectControlSession|Civ7TunerSessionLive|setTimeout|setInterval" packages/studio-server/src/liveGame packages/studio-server/src/runtime.ts packages/studio-server/src/handler.ts -S
```

Result classification:

- `packages/studio-server/src/liveGame/**` has no direct-control import, no
  `Civ7DirectControlSession`, no `Civ7TunerSessionLive`, no `setTimeout`, and
  no `setInterval`;
- `runtime.ts` retains the top-level named `Civ7TunerSessionLive` owner and
  named `Civ7TunerClient.Default` layer reference;
- handler lifecycle starts/acquires `StudioLiveGameWatcher` through the runtime
  service and disposes by closing the runtime scope plus the daemon event hub.

Command:

```bash
rg -n "readiness\\.current|liveControlPort" apps/mapgen-studio/src apps/mapgen-studio/test -S
```

Result classification:

- `liveControlPort.readiness.current` was deleted from the browser port;
- remaining `readiness.current` hits are the protected control-oRPC route tests
  and `orpc.ts` route taxonomy comment;
- `StudioShell` uses `liveControlPort.display.explore.request` only.

## Original Live Proof Boundary

No live Civ7/FireTuner product proof was run in this D10 implementation pass.
D10 therefore does not claim live game green. `workstream/next-packet.md`
records the missing proof class, environment prerequisites, re-entry commands,
log paths, and closure rule for the D12 game-door invariant lane or an earlier
live-proof lane.

## Live Proof Append - 2026-06-16

Proof class: D10 live-game watcher-specific proof for task 5.8. This is not a
Graphite submit/drain claim and not a broad product proof beyond the watcher
surface named here.

Execution state:

- branch and commit: `codex/studio-dev-port-env` at `aa8325a83`;
- worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-runtime-effect-prework`;
- proof-run identity: `git rev-parse --abbrev-ref HEAD` returned
  `codex/studio-dev-port-env`, `git rev-parse --short=9 HEAD` returned
  `aa8325a83`, and `git status --short --branch` returned a clean branch before
  proof-record edits;
- game preflight: `/tmp/d10-game-status.json` records
  `node packages/cli/bin/run.js game status --json` returning `ok: true`,
  `playable: true`, `readiness: "tuner-ready"`;
- tuner preflight: `/tmp/d10-game-health.json` records
  `node packages/cli/bin/run.js game health --tuner --json` returning
  `ok: true`, host `127.0.0.1`, port `4318`, turn `25`, map `74x46`,
  `autoplayActive: false`;
- Studio command:
  `STUDIO_DAEMON_PORT=5274 STUDIO_DEV_PORT=5273 STUDIO_DEV_RPC_TARGET=http://127.0.0.1:5274 bun run nx run mapgen-studio:dev --outputStyle=static`;
- daemon health: `/tmp/d10-daemon-health.json` records
  `http://127.0.0.1:5274/healthz` returning
  `runtimeMode: "studio-daemon-effect-orpc"`, repo root equal to this worktree,
  and `serverInstanceId: "studio-server-mqg5sfqo-agj-1"`;
- listener proof: `/tmp/d10-daemon-listener.txt` records Bun listening on
  `127.0.0.1:5274`; `/tmp/d10-vite-listener.txt` records Vite listening on
  `[::1]:5273`;
- frontend: `http://localhost:5273/` returned `200 OK` before browser proof;
- cleanup: after the autoplay trigger, `node packages/cli/bin/run.js game
  autoplay --action configure --observe-as-player 0 --return-as-player 0
  --no-pause --json` returned `ok: true`; final recorded autoplay state remained
  `isActive: false` and `isPaused: false`.

Raw and parsed artifacts:

- `/tmp/d10-live-watch-1.sse` - first bounded stream, 596 bytes, mtime
  `2026-06-16T00:46:09-0400`;
- `/tmp/d10-live-watch-2.sse` - reconnect stream, 596 bytes, mtime
  `2026-06-16T00:46:27-0400`;
- `/tmp/d10-live-watch-changed.sse` - changed-state stream, 988 bytes, mtime
  `2026-06-16T00:47:46-0400`;
- `/tmp/d10-live-proof-summary.json` - parsed changed-state evidence, 5834
  bytes, mtime `2026-06-16T00:47:58-0400`;
- `/tmp/d10-live-watch-current.sse` - later live stream with explicit turn
  progression, 1396 bytes, mtime `2026-06-16T00:53:03-0400`;
- `/tmp/d10-live-watch-turn-change.sse` - changed-turn stream after recorded
  autoplay trigger, 1012 bytes, mtime `2026-06-16T00:54:21-0400`;
- `/tmp/d10-live-turn-change-summary.json` - parsed turn-change evidence, 6748
  bytes, mtime `2026-06-16T00:54:43-0400`;
- `/tmp/d10-browser-network-proof.json` - same-run browser/network summary,
  4122 bytes, mtime `2026-06-16T00:49:25-0400`;
- `/tmp/d10-browser-network-proof.png` - browser screenshot from the same run,
  389355 bytes, mtime `2026-06-16T00:49:25-0400`.
- `/tmp/d10-game-status.json`, `/tmp/d10-game-health.json`,
  `/tmp/d10-daemon-health.json`, `/tmp/d10-vite-listener.txt`, and
  `/tmp/d10-daemon-listener.txt` - preflight/surface proof artifacts, mtimes
  `2026-06-16T00:52:56-0400` through `2026-06-16T00:52:59-0400`.

Accepted L1-L7 observations:

| ID | Result | Evidence |
| --- | --- | --- |
| L1 initial subscribe | passed | `/tmp/d10-live-watch-1.sse` contains `hello` with `serverInstanceId: "studio-server-mqg5sfqo-agj-1"`, `serverStartedAt: "2026-06-16T04:45:34.512Z"`, `observedAt: "2026-06-16T04:45:59.116Z"`. |
| L2 first live-game | passed | Same stream contains `live-game` with `status: "ok"`, `turn: 1`, `seed: -928103809`, `snapshotId: "status:1:ab1139ae"`, `bindingStatus: "unbound-runtime"`, `failureCount: 0`. |
| L3 reconnect replay | passed | `/tmp/d10-live-watch-2.sse` opened after L2 and contains `hello` at `2026-06-16T04:46:17.186Z` followed by the retained `live-game` with `snapshotId: "status:1:ab1139ae"` and observedAt `2026-06-16T04:45:42.519Z`. |
| L4 quiet unchanged key | passed | `/tmp/d10-live-watch-1.sse` emitted one replayed `live-game` with stable key `ok:status:1:ab1139ae`; from `hello.observedAt` `2026-06-16T04:45:59.116Z` until bounded stream close at file mtime `2026-06-16T00:46:09-0400`, no duplicate unchanged-key `live-game` appeared. `/tmp/d10-live-watch-2.sse` repeated the same retained key from `hello.observedAt` `2026-06-16T04:46:17.186Z` until stream close at `2026-06-16T00:46:27-0400`. Each window exceeds two 3000ms watcher intervals plus margin. |
| L5 changed state | passed | `/tmp/d10-live-turn-change-summary.json` records trigger `node packages/cli/bin/run.js game autoplay --action start --turns 1 --json --wait-timeout-ms 30000`, exit `0`, started `2026-06-16T04:53:56.176Z`, completed `2026-06-16T04:54:10.638Z`; `/tmp/d10-live-watch-turn-change.sse` changed from `turn: 34`, `snapshotId: "status:34:443ccd4c"`, `autoplayActive: false` to `turn: 35`, `snapshotId: "status:35:f6bb1f45"`, `autoplayActive: true` at `2026-06-16T04:54:21.182Z`. `/tmp/d10-live-watch-current.sse` separately shows live runtime progression `turn: 24 -> 25 -> 26`. |
| L6 runtime/source path | passed | Live stream was produced by daemon `runtimeMode: "studio-daemon-effect-orpc"`; source composition shows `apps/mapgen-studio/src/server/daemon/daemon.ts` calls `createStudioRpcHandler(context, { liveGameWatch: {} })`, `packages/studio-server/src/handler.ts` ensures `StudioLiveGameWatcher` before handling `/rpc`, `packages/studio-server/src/runtime.ts` composes `StudioLiveGameWatcher` with `Civ7TunerClient`, `Civ7TunerSessionLive`, and `StudioEventHubLive`, and `packages/studio-server/src/liveGame/watcher.ts` publishes only when `liveGameStateKey` changes. |
| L7 browser no-background-cadence | passed | `/tmp/d10-browser-network-proof.json` records title `MapGen Studio`, body text `Ready. Live Civ7 turn 2 seed -928103809`, one `/rpc/studio/events/watch` request/response with `text/event-stream`, one allowed `/rpc/civ7/live/snapshot`, one allowed `/rpc/civ7/setupConfig`, no request failures, and no `civ7.live.status` or `readiness.current` requests during the 15-second capture. |

Static gates rerun on this stack before closure:

- `git diff --check` passed;
- `bun run --cwd apps/mapgen-studio test -- test/server/daemonFetch.test.ts test/server/nxDevRunner.test.ts` passed, 13 tests;
- `bun run nx run mapgen-studio:check --outputStyle=static` passed;
- `bun run openspec -- validate mapgen-studio-live-game-watch --strict` passed;
- `bun run openspec:validate` passed, 186 items;
- `bun run habitat classify apps/mapgen-studio` required
  `nx run mapgen-studio:check`, `nx run mapgen-studio:test`, and
  `bun run lint`;
- `bun run habitat classify openspec/changes/mapgen-studio-live-game-watch/workstream` required `bun run lint`;
- `bun run nx run mapgen-studio:test --outputStyle=static` passed, 50 files
  and 247 tests;
- `bun run lint` passed with the existing `doc-ambiguity` advisory only.

Proof-audit disposition:

| Finding | Severity | Disposition |
| --- | --- | --- |
| Authoritative records still showed task 5.8 and live proof open. | P1 | accepted-repaired: `tasks.md`, `testing-ledger.md`, `closure-checklist.md`, `phase-record.md`, `next-packet.md`, and `live-proof-plan.md` now promote the accepted proof and preserve proof boundaries. |
| Quiet-window timestamps and stable key were not explicit enough. | P2 | accepted-repaired: L4 now names the stable key, stream start markers, close mtimes, and the no-duplicate condition across two bounded windows. |
| L5 changed-state criterion was ambiguous when only autoplay/snapshot state changed. | P2 | accepted-repaired: a second turn-change capture proves `turn: 34 -> 35` after the recorded autoplay trigger. |
| Preflight, run identity, static gates, and daemon/run surfaces needed artifact pointers. | P2 | accepted-repaired: the ledger now names branch/commit/status, `/tmp/d10-game-status.json`, `/tmp/d10-game-health.json`, `/tmp/d10-daemon-health.json`, listener captures, exact dev command, and current static gates. |
| Browser proof needed concise L7 summary. | P3 | accepted-repaired: L7 names the browser/network JSON and screenshot evidence. |

## Notes

- The production watcher source-composition test is intentionally source-shape
  proof, not live shared-socket proof. It proves no direct-control bypass or
  internal session owner exists in `liveGame/watcher.ts`, and that runtime
  composition uses the named `Civ7TunerClient`/`Civ7TunerSession` layers.
- Live shared-socket instrumentation is not claimed here. L6 pairs live stream
  output with source-composition proof for the current daemon/runtime path.
