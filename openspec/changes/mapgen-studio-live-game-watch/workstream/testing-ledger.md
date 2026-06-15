# D10 Testing Ledger - Studio Live Game Watch

Status: packet accepted; implementation pending
Date: 2026-06-14

| Layer | Required proof | Adequacy criterion |
| --- | --- | --- |
| Packet/spec | OpenSpec strict + full validation | proposal/design/spec/tasks agree and no stale implementation closeout remains |
| Contract | TypeBox schema test or compile/runtime contract test | `live-game` belongs to existing `StudioEvent` union without Zod mirror |
| Watcher behavior | package tests | first observation publishes, changed key publishes, unchanged key and clock-only changes stay quiet |
| Watcher lifecycle | package tests with scoped runtime/disposal | daemon disposal interrupts watcher and no publication occurs after disposal |
| Production composition | handler/daemon composition test | production path supplies shared `Civ7TunerSession`, `Civ7TunerClient`, EventHub, and no alternate status reader |
| Client event application | app hook/shell scenario tests | pushed `live-game` updates rendered live runtime state |
| Snapshot follow-up | app scenario/model tests | pushed state triggers bounded `civ7.live.snapshot` request/response only when stale, with request-key commit guard |
| Setup follow-up | app scenario tests | pushed state triggers bounded setup request/response and aborts/supersedes stale work |
| Deletion | negative searches | browser live-status freshness has no timer, status caller, readiness cadence, polling hook, or refetch interval |
| Live proof | bounded Civ7 runtime proof | branch/commit/API/log/timestamp/payload evidence shows first/change/quiet behavior and shared-session ownership |

## Future Implementation Commands

```bash
bun run openspec -- validate mapgen-studio-live-game-watch --strict
bun run openspec:validate
bun run nx run @civ7/studio-server:test --outputStyle=static
bun run nx run @civ7/studio-server:check --outputStyle=static
bun run nx run mapgen-studio:test --outputStyle=static
bun run nx run mapgen-studio:check --outputStyle=static
rg -n "nextLiveRuntimePollDelayMs|liveStatusFailureCountRef" apps/mapgen-studio/src apps/mapgen-studio/test packages/studio-server/src packages/studio-server/test -S
rg -n "setTimeout\\(|setInterval\\(" apps/mapgen-studio/src/app apps/mapgen-studio/src/features -S
rg -n "civ7\\.live\\.status\\(" apps/mapgen-studio/src apps/mapgen-studio/test -S
rg -n "liveControlPort\\.readiness\\.current|refetchInterval|polling|status poll|status-poll" apps/mapgen-studio/src apps/mapgen-studio/test -S
rg -n "new Civ7Tuner|create.*Tuner|direct-control.*live|EventSource|text/event-stream|/events|/sse" packages/studio-server/src apps/mapgen-studio/src -S
git diff --check
```

Focused file evidence should include watcher, handler, live runtime model, and
event-adoption paths, but repo-local Nx targets remain the closure commands. If
implementation adds stronger tests under different files, update this ledger
before closure.

## Live Proof Requirements

When Civ7 is available, D10 implementation closure must record:

- branch and commit;
- daemon URL or API path used to observe events;
- timestamps around watcher start and observed event delivery;
- relevant daemon/game log paths;
- parsed `live-game` payload shape;
- evidence that an unchanged key stays quiet;
- evidence that the browser cadence deletion searches remain clean.

If Civ7 is unavailable, create `workstream/next-packet.md` with:

- missing proof class;
- environment prerequisite;
- exact re-entry commands;
- log paths to inspect;
- closure claim that remains blocked.

## Proof Labels

- OpenSpec validation proves packet shape only.
- Package tests prove watcher mechanics and lifecycle.
- App tests prove client event behavior and request/response follow-ups.
- Negative searches prove deletion of browser cadence symbols.
- Live proof proves product/runtime behavior.
