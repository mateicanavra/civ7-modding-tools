# D10 Design - Live Game Watch

## D1. Component Role

`StudioLiveGameWatcher` is a daemon-runtime component, not a browser feature and
not a handler-local timer. It is composed as an Effect-scoped service/layer with
the daemon's `ManagedRuntime`, `Civ7TunerClient`, `Civ7TunerSession`, and D8
`StudioEventHub`.

The component has one job: observe live Civ7 status at the daemon boundary and
publish meaningful `live-game` deltas. It does not own snapshots, setup
suggestion rendering, operation transitions, or dev-process supervision.

## D2. Event Contract Ownership

`live-game` stays inside the D8 `StudioEvent` union and is expressed with
TypeBox/Standard Schema. The event payload is:

- `type: "live-game"`;
- `state`: daemon-owned live runtime state;
- `observedAt`: the watcher observation timestamp.

The state is the category the client renders: status, turn, Civ game hash, seed,
readiness, autoplay flags, snapshot id/hash, binding status, failure content,
and unavailable/error state. It is not a raw FireTuner response and not a second
client-only model.

## D3. Shared Keying Model

The live-game key excludes `observedAt` and other clock-only data. Healthy-state
keys derive from turn, Civ game hash, seed, readiness, relevant map metadata,
autoplay state, and the snapshot identity already pinned by the live runtime
model. Error-state keys derive from stable status/error content. Incrementing
failure counters or retry timestamps alone cannot produce events.

The watcher and the client model use the same package-owned keying helper. A
duplicate app-local or test-only keying algorithm is a blocker because it lets
the daemon and browser disagree about what "changed" means.

## D4. Watcher Lifecycle And Shared Session

The daemon composes `StudioLiveGameWatcher` under the same runtime lifecycle as
the RPC handler and event hub. Starting the daemon starts the watcher; disposing
the daemon scope interrupts the watcher fiber, releases timer/schedule state,
and closes publication resources before the runtime is torn down.

Each observation reads the same logical status as `civ7.live.status` through the
runtime's `Civ7TunerClient`/`Civ7TunerSession` layer. Package tests may inject a
fake read service, but production daemon composition must not construct an
alternate FireTuner session, direct-control client, or ad-hoc status reader.

The implementation may use Effect scheduling primitives or scoped sleeps inside
the service. It may not use browser timers, app-shell timers, app-local polling
hooks, or a non-scoped package timer that outlives daemon disposal.

## D5. Client Event Application

The single `useStudioEvents` subscription remains the only event consumer. It
keeps D8 `hello` adoption and D9 `operation` handling, and adds `live-game`
application through `StudioShell`.

On a `live-game` event, `StudioShell` updates displayed live runtime state from
the event payload. If the pushed state makes a snapshot visibly stale, the app
may read `civ7.live.snapshot` request/response. That read uses a request key
derived from the pushed state, aborts or ignores older work when a newer
live-game event arrives, and commits only through the existing stale-result
guard.

Setup suggestions are also request/response follow-ups triggered by pushed
state. Their trigger predicate is the pushed state that can affect setup
visibility/suggestions; their owner is the event application path; they have no
independent interval, timeout, retry loop, or refetch cadence.

## D6. Deletion Boundary

D10 deletes browser live-status freshness authority:

- `nextLiveRuntimePollDelayMs`;
- browser live-status `setTimeout` and `setInterval` loops;
- background browser `civ7.live.status` calls;
- `liveControlPort.readiness.current` cadence calls;
- polling hooks and `refetchInterval` live-status paths;
- tests that pin deleted browser cadence behavior.

Deliberate user-triggered actions such as Explore may keep request/response
reads if they are visibly tied to the command. Snapshot and setup reads remain
request/response. Operation events and `hello` identity behavior are unchanged.

## D7. Falsification Proof

The core watcher pins are:

- first observation publishes;
- changed live-game key publishes;
- unchanged key stays quiet;
- clock-only changes stay quiet;
- production composition supplies the shared session and event hub;
- daemon disposal stops watcher publication.

The core client pins are:

- a pushed `live-game` event updates rendered state;
- snapshot/setup follow-ups are event-triggered request/response reads with
  request keys, abort/newer-event handling, and stale commit guards;
- no browser cadence path survives under a renamed helper or hook.

OpenSpec validation proves packet shape only. Focused tests prove component
behavior. Negative searches prove deletion. Live Civ7 proof is required for
implementation closure when Civ7 is available; without that environment, the
implementation writes a `next-packet.md` and remains not-green for live proof.
