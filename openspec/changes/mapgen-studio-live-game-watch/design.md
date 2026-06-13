# Design - live game watch (S3.3)

## D1. Event contract ownership

`live-game` stays inside the S3.1 `StudioEvent` union and is expressed with
TypeBox/Standard Schema. The event payload is:

- `type: "live-game"`;
- `state`: daemon-owned live runtime state;
- `observedAt`: the watcher observation timestamp.

The state is the same category the client already renders: status, turn, Civ
game hash, seed, readiness, autoplay flags, snapshot id/hash, binding status,
failure count, and error when unavailable. This is not a raw FireTuner response
and not a second client model.

## D2. Shared keying model

The live-game key excludes `observedAt` and other clock-only data. For healthy
states it is based on the existing snapshot id derived from turn plus a stable
hash of Civ game hash, seed, readiness, map metadata, and autoplay state. For
error states it is based on status plus error content, not the incrementing
failure count. Repeated identical observations stay quiet.

The app's existing `liveRuntime/model.test.ts` durable pins remain the proof
for turn/hash identity and snapshot commit gating. The package watcher uses the
same helper rather than duplicating a second keying algorithm.

## D3. Watcher lifecycle and shared session

The watcher starts from `createStudioRpcHandler` only when the host enables it.
MapGen Studio's daemon enables it; package handler tests and non-daemon hosts
default to disabled.

Each tick reads the same logical live status as `civ7.live.status` through the
runtime's `Civ7TunerClient`, so every FireTuner call routes through the runtime
`Civ7TunerSession`. The watcher publishes through the already injected
EventHub. Disposal stops the timer before disposing the runtime and shutting
down the EventHub.

## D4. Client event application

The single `useStudioEvents` subscription remains the only event consumer. It
keeps `hello` reconnect adoption and `operation` handling, and adds `live-game`
application through a callback supplied by `StudioShell`.

On a live-game event, `StudioShell` updates displayed live runtime state. If
the pushed state has a snapshot request and the current snapshot is not already
fresh for that state, it reads `civ7.live.snapshot` request/response and
commits the result through the existing request-key guard. Setup config is read
request/response after a pushed event for live-to-Studio suggestions. Neither
read has its own cadence loop.

## D5. Deletion boundary

S3.3 deletes client live status scheduling:

- `nextLiveRuntimePollDelayMs`;
- the browser `setTimeout(poll, ...)` live status loop in `StudioShell`;
- background readiness overlay calls from that loop.

`liveControlPort` may remain for deliberate user-triggered control actions such
as Explore. Snapshot reads remain on oRPC request/response. Operation events
and `hello` identity behavior are unchanged.

## D6. Falsification proof

The primary watcher pin is quiet/loud behavior:

- first observation publishes;
- changed turn/hash publishes;
- unchanged key does not publish.

If the watcher publishes every tick, stops publishing changes, bypasses the
EventHub, or uses clock-only keying, the focused test must fail. Negative
search closes the deletion target because removing a scheduler is an
architectural claim.
