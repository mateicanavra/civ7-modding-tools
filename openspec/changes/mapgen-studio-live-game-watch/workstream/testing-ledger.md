# D10 Testing Ledger - Studio Live Game Watch

Status: implementation evidence recorded before Graphite commit; live Civ7 Play/SaveDeploy proof is not run or claimed.
Date: 2026-06-15

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
| Live Civ7 proof | local game/FireTuner proof | not run; see `workstream/next-packet.md` |

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

## Live Proof Boundary

No live Civ7/FireTuner product proof was run in this D10 implementation pass.
D10 therefore does not claim live game green. `workstream/next-packet.md`
records the missing proof class, environment prerequisites, re-entry commands,
log paths, and closure rule for the D12 game-door invariant lane or an earlier
live-proof lane.

## Notes

- The production watcher source-composition test is intentionally source-shape
  proof, not live shared-socket proof. It proves no direct-control bypass or
  internal session owner exists in `liveGame/watcher.ts`, and that runtime
  composition uses the named `Civ7TunerClient`/`Civ7TunerSession` layers.
- Live shared-socket behavior remains a D12 live game-door proof item.
