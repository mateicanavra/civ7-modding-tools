# Watcher Latency Observer Mode

The live play thread has seen ordinary direct-control calls complete in less
than a second, with occasional reads or mutations taking 7-20 seconds while a
human was interacting with Civ7. Treat that as a runtime-busy and stale-state
risk. Do not claim that macOS focus is the cause until we have stronger
correlated evidence.

## Frame

Direct-control is a synchronous tuner request/response surface. A one-off CLI
call discovers states with `LSQ:`, sends `CMD:<stateId>:<javascript>`, waits for
the response, and closes the connection. If Civ's UI/game scripting side is busy
processing input, animation, turn transition, loading, autosave, or other work,
the response can plausibly arrive late.

The problem is not just latency. It is latency plus stale state:

- A read can return after the human has changed the board.
- A validation can be legal for the old board and tactically wrong for the new
  board.
- A mutation timeout is "unknown after send", not proof that the command did
  not land.
- Tight watcher polling can add noise during the exact window when the human is
  playing.

## Operating Modes

### Human-Turn Watch

Use read-only commands. Poll the HUD/status every 3-5 seconds while the game is
stable. If a turn, blocker, or notification changes, burst briefly at
500-1000 ms, then back off again. Avoid broad map or tactical reads unless the
blocker requires them.

When the human is actively playing, prefer low-impact App UI reads:
`game play notifications`, `game play rehydrate`, or status/autoplay reads.
Treat map grids, entity summaries, GameInfo sweeps, and visibility scans as
bounded evidence collection, not ambient polling. The current repo does not
prove an OS-level "Civ is foreground" signal, so infer human play
conservatively from live game state: in-game App UI, a concrete local player,
alive human players, autoplay inactive, and no active watcher mutation.

If a read exceeds 2 seconds, mark the observation window as runtime-busy. If it
exceeds 5 seconds, treat any tactical advice from that read as stale-risk and
require a fresh HUD before recommending a mutation.

### Agent-Turn Play

Use a phase-locked loop:

1. Preflight HUD/read.
2. Validate the operation or shortcut.
3. Send with `--send --reason`.
4. Re-read immediately.

If any step crosses the stale threshold, discard the previous tactical plan and
re-read turn, blocker, selected unit, first ready unit, and target plot before
the next mutation. Never blindly retry a timed-out mutation.

### Restart Recovery

During restart/loading, use phase-aware waits instead of gameplay reads. Wait
for App UI readiness, loading state, Begin Game, then a Tuner canary. A 1 second
poll interval and a long timeout budget are appropriate here because loading
can legitimately take many seconds.

Trust App UI first after restart. State ids and sockets can be stale, and a
listed `Tuner` state is not enough proof that gameplay globals are usable.
Re-prove `Tuner` with a read-only canary before issuing gameplay reads that
depend on `Game`, `Players`, `GameplayMap`, or `GameInfo`.

## Observation Record

Future watcher tooling should emit JSONL observations shaped like this:

```json
{
  "schema": "civ7-watcher-observation.v1",
  "mode": "human-turn-watch",
  "risk": "read",
  "wrapper": "getCiv7PlayNotificationView",
  "cli": "civ7 game play notifications --json",
  "stateRole": "app-ui",
  "timeoutMs": 10000,
  "startedAt": "2026-06-01T10:30:00.000Z",
  "durationMs": 620,
  "ok": true,
  "errorCode": null,
  "turn": 60,
  "turnDate": "2525 BCE",
  "loadingStateName": "GameStarted",
  "blocker": 0,
  "blockingNotificationId": null,
  "firstReadyUnitId": null,
  "selectedUnitId": null,
  "selectedCityId": null,
  "tunerReady": true,
  "responseBytes": 2137,
  "staleGuard": "fresh",
  "notes": ["no OS focus causality claimed"]
}
```

Useful later timing breakdowns: `connectMs`, `lsqMs`, `cmdMs`, `parseMs`,
`reconnectCount`, `retryCount`, `listenerClosed`, and response part counts. If
logs are used, include `logPath`, `mtime`, `startOffset`, and `endOffset`.

## Evidence

- `packages/civ7-direct-control/README.md` describes the direct-control package
  as a local FireTuner-style socket control surface.
- `packages/civ7-direct-control/src/index.ts` sets the default tuner timeout to
  10 seconds and uses App UI vs Tuner state roles for different runtime surfaces.
- Existing restart and autoplay loops already use bounded polling rather than
  assuming instant state changes.
- Local disk resources and logs are support/forensic surfaces, not replacements
  for live direct-control state; see `local-on-disk-read-surfaces.md`.
- Studio's current live-status loop polls at low seconds-scale intervals and
  composes status, App UI, map summary, and autoplay state. That is appropriate
  for UI status, but broad map/gameplay reads should still be gated in passive
  human-watch mode.
- Official automation uses App UI autoplay/observer surfaces. Prefer runtime
  constants when observing as a player or observer rather than hard-coding
  numeric player ids.

## Shortcut Candidates

- `game probe-latency --count <n> --interval-ms <ms> --read-set status|app-ui|tuner|hud --jsonl`
- `game watch --jsonl --human-aware --interval-ms 3000 --slow-ms 2000
  --artifact watcher.jsonl`
  is now the first passive watcher shortcut. It emits the observation schema
  above from the read-only notification HUD, can include the current ready-unit
  view, labels slow/stale-risk reads without claiming OS foreground causality,
  and can append the same JSONL records to a durable artifact file.
- `game wait --until tuner-ready|turn-change|blocker-clear --timeout-ms <ms>`
- Common `--timing` JSON metadata on game commands.
- Mutation stale guards such as `--max-read-age-ms`, `--quiesce-ms`, or
  `--require-stable-hud 2`.

## Proof Boundary

This evidence pack supports a conservative observer policy. It does not prove
foreground focus as the root cause of latency spikes. Stronger proof would need
correlated timing samples, foreground-app samples, Civ loading/input state, and
possibly direct-control timing breakdowns.
