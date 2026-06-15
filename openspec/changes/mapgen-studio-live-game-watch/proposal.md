# MapGen Studio live game watch

## Why

D9 moves operation freshness onto `studio.events.watch`, but live Civ7 state is
still the next runtime island unless the live-game cadence is owned by the
daemon runtime. A browser-owned status loop makes the client a scheduler for
FireTuner truth, splits live status reads away from the shared session, and
creates a quiet path for stale "live idle" UI even when the game is live.

D10 makes live Civ7 status freshness a daemon-runtime responsibility. The
server observes live status through the unified runtime's shared
`Civ7TunerSession`, publishes `live-game` deltas through the D8
`StudioEventHub`, and the client renders pushed state. Snapshot and setup reads
remain deliberate request/response reads triggered by pushed live-game state;
they do not become event payloads and do not keep an independent browser
cadence.

## Target Authority Refs

- `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md`
  D10: daemon-side watcher under runtime lifecycle, shared `Civ7TunerSession`,
  first/change-only publication, client event application, setup/snapshot
  request/response follow-up, browser cadence deletion, and live proof boundary.
- `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md` D10:
  D10 follows D8 event hub and D9 operations push, and precedes D11 Nx dev
  runner plus D12 game-door invariant closeout.
- `openspec/changes/mapgen-studio-event-hub/`: D8 supplies the one daemon-owned
  `StudioEventHub`, the TypeBox `hello | operation | live-game` event union,
  and the one `studio.events.watch` transport.
- `openspec/changes/mapgen-studio-operations-push/`: D9 removes operation
  freshness polling and establishes pushed operation event consumption without
  reintroducing background polling.
- Direct user decision: TypeBox is the schema substrate for this surface; no new
  Zod schema or compatibility bridge is allowed.

## What Changes

- Define the `live-game` event payload as a TypeBox state object under the D8
  `StudioEvent` union.
- Add a package-side live-game state builder/keying helper so the daemon watcher
  and client model share turn/hash/snapshot-id semantics.
- Add an Effect-scoped `StudioLiveGameWatcher` service/layer composed into the
  daemon runtime. The watcher reads through the same `Civ7TunerSession` layer as
  `civ7.live.status` and publishes only when the live-game key changes.
- Enable that watcher from the MapGen Studio daemon as runtime composition, not
  as app/browser scheduling or ad-hoc child supervision.
- Extend the single Studio event hook to apply `live-game` events.
- Delete browser live-status scheduling: the live status `setTimeout` or
  `setInterval` loop, background browser `civ7.live.status` callers,
  `liveControlPort.readiness.current` cadence calls, polling hook/refetch
  intervals, `nextLiveRuntimePollDelayMs`, and deleted cadence tests.
- Preserve snapshot and setup reads as request/response calls triggered by
  pushed live-game events, with explicit request keys, abort/newer-event
  handling, and stale commit guards.

## Non-Goals

- No second event route, SSE endpoint, or live-game-specific transport.
- No operation polling, `serverInfo` identity polling, operation watchdog, or
  localStorage recovery reintroduction.
- No migration of snapshot/setup data onto the event stream.
- No browser-owned live status freshness under a renamed helper, hook, retry,
  refetch interval, or hidden timer.
- No broad migration of all historical success schemas. D12 owns final schema
  residue and public/manual status endpoint classification after D10 and D11.

## Impact

- `packages/studio-server/src/contract/studio.ts`
- `packages/studio-server/src/liveGame/**`
- `packages/studio-server/src/handler.ts`
- `packages/studio-server/src/router/index.ts`
- `packages/studio-server/src/index.ts`
- `apps/mapgen-studio/src/server/daemon/daemon.ts`
- `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts`
- `apps/mapgen-studio/src/app/StudioShell.tsx`
- `apps/mapgen-studio/src/features/liveRuntime/model.ts`
- focused package/app tests and deletion of client poll-delay pins

## Verification Gates

- `bun run openspec -- validate mapgen-studio-live-game-watch --strict`
- Focused package tests: watcher publishes the first observation, publishes
  changed keys, stays quiet for unchanged keys, ignores clock-only changes, and
  uses the injected shared session/read service.
- Focused daemon composition proof: production daemon supplies the event hub,
  `ManagedRuntime`, `Civ7TunerClient`, and `Civ7TunerSession` layer to
  `StudioLiveGameWatcher`; fake read functions are test-only seams.
- Focused app/model tests: `live-game` events update live runtime state, turn
  and game-hash keying stays stable, snapshot request-key commit gates remain
  green, and setup follow-up is event-triggered with abort/newer-event handling.
- Negative searches prove no browser live-status cadence remains:
  `nextLiveRuntimePollDelayMs`, live status `setTimeout`/`setInterval`,
  background browser `civ7.live.status`, `liveControlPort.readiness.current`,
  polling hooks, `refetchInterval`, and deleted cadence tests.
- Live proof with Civ7 available: on the implementation branch and commit, the
  daemon watcher publishes first/change live-game states, stays quiet on an
  unchanged key, uses the shared `Civ7TunerSession`, and the browser live-status
  cadence remains deleted. Evidence must name branch, commit, command/API path,
  timestamp, relevant logs, and observed payload shape.
- If Civ7 is unavailable, D10 implementation cannot close green. It must write
  `workstream/next-packet.md` with exact missing live proof, environment
  prerequisite, re-entry commands, log paths, and the closure claim that remains
  blocked.
