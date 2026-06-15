# D10 Prework Ledger - Studio Live Game Watch

Status: packet accepted; implementation pending
Date: 2026-06-14

## Packet-Authoring Prework Completed

- Confirmed D0-D9 are accepted or committed in the packet train before D10.
- Classified the existing `mapgen-studio-live-game-watch` artifacts as
  historical S3.3 implementation closeout records, not acceptable D10 packet
  state.
- Inspected the D10 frame, D8 event hub packet, D9 operations push packet, and
  current live-game implementation surfaces.
- Started fresh peer lanes for prework/corpus, hardening/black-ice, and
  testing/vendor alignment.

## Implementation-Shaping Decisions

| Surface | Decision |
| --- | --- |
| Watcher owner | Effect-scoped daemon runtime `StudioLiveGameWatcher` service/layer |
| Event transport | existing D8 `studio.events.watch` over `/rpc` |
| Event schema | TypeBox `live-game` payload inside D8 `StudioEvent` union |
| FireTuner/session owner | shared daemon runtime `Civ7TunerSession` via `Civ7TunerClient` |
| Publication rule | publish first observation and changed stable key only |
| Quiet rule | unchanged key, clock-only changes, retry timestamps, and failure-count-only changes stay quiet |
| Client owner | single `useStudioEvents` path plus `StudioShell` pushed-state application |
| Snapshot follow-up | request/response read triggered by pushed state, request-key guarded |
| Setup follow-up | request/response read triggered by pushed state, abort/supersede on newer event |
| Deletion target | browser live-status freshness cadence in every renamed form |
| Live proof | required when Civ7 available; otherwise write `next-packet.md` and do not close green |

## Negative Search Set

```bash
rg -n "nextLiveRuntimePollDelayMs|liveStatusFailureCountRef" apps/mapgen-studio/src apps/mapgen-studio/test packages/studio-server/src packages/studio-server/test -S
rg -n "setTimeout\\(|setInterval\\(" apps/mapgen-studio/src/app apps/mapgen-studio/src/features -S
rg -n "civ7\\.live\\.status\\(" apps/mapgen-studio/src apps/mapgen-studio/test -S
rg -n "liveControlPort\\.readiness\\.current|refetchInterval|polling|status poll|status-poll" apps/mapgen-studio/src apps/mapgen-studio/test -S
rg -n "new Civ7Tuner|create.*Tuner|direct-control.*live|LiveGameWatcher.*setTimeout|EventSource|text/event-stream|/events|/sse" packages/studio-server/src apps/mapgen-studio/src -S
```

Hits block D10 implementation closure unless classified as a deliberate
user-triggered request/response action, test fixture text that proves deletion,
or a D12-owned public/manual diagnostic endpoint.

## Implementation Prework Required Before Code Edits

1. Re-run the negative search set on the selected implementation base.
2. Identify the canonical live status read function and prove it routes through
   `Civ7TunerClient` / `Civ7TunerSession`.
3. Identify exact daemon composition site for `StudioLiveGameWatcher` and D8
   `StudioEventHub`.
4. Partition deliberate user-triggered live requests from background freshness
   before deleting browser status callers.
5. Define request keys and stale/newer-event behavior for snapshot and setup
   follow-ups before changing client code.
6. Decide and script the bounded live Civ7 proof path before implementation
   closure, or write `next-packet.md` when the environment is unavailable.

## Peer-Agent Prework Lanes

- **Prework/corpus scout:** enumerate live-game surfaces, stale artifacts,
  deletion targets, and implementation ambiguity.
- **Hardening/black-ice review:** remove S3/S4 stale closure claims, hidden
  browser cadence, fake-green proof, and unclear downstream handoffs.
- **Testing/vendor review:** design falsification tests, live proof boundary,
  Effect-native lifecycle target, and composition proof.

## Resolved Black-Ice Decisions

- Old S3.3 merge/green records are historical evidence only; D10 packet
  acceptance does not claim implementation closure.
- Browser live-status cadence deletion is mandatory across helper, timer, hook,
  refetch, and background status/readiness call forms.
- Handler-local manual timer ownership is not the target shape. D10 target is an
  Effect-scoped daemon runtime watcher service/layer.
- Snapshot/setup follow-ups are request/response reads triggered by pushed
  events, not stream payloads and not independent freshness loops.
- Live Civ7 proof is a separate proof class; OpenSpec validation and unit tests
  cannot satisfy it.

## Remaining Human Decisions

None for packet acceptance. Implementation must write `next-packet.md` instead
of claiming green if the live Civ7 proof environment is unavailable.
