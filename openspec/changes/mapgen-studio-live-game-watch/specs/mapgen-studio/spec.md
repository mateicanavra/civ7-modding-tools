## ADDED Requirements

### Requirement: Daemon Publishes Live-Game State Deltas

MapGen Studio SHALL publish live Civ7 status changes to `studio.events.watch`
as `live-game` events from a daemon-runtime `StudioLiveGameWatcher`.

#### Scenario: First live-game observation publishes

- **WHEN** the daemon live-game watcher observes Civ7 live state for the first
  time in a process
- **THEN** it publishes a `studio.events.watch` event with `type: "live-game"`
- **AND** the event contains a TypeBox-defined `state` payload
- **AND** the read uses the unified runtime's shared `Civ7TunerSession`

#### Scenario: Changed live-game key publishes

- **WHEN** a later watcher observation has a different live-game key derived
  from turn, Civ game hash, seed, readiness, relevant map metadata, autoplay
  state, snapshot identity, or stable status/error content
- **THEN** the daemon publishes a new `live-game` event
- **AND** the event reaches subscribers through the existing D8 EventHub and
  `studio.events.watch`

#### Scenario: Unchanged live-game key stays quiet

- **WHEN** a later watcher observation has the same live-game key as the last
  published observation
- **THEN** the watcher does not publish another `live-game` event
- **AND** clock-only changes and failure-count-only changes do not create a new
  event

#### Scenario: Watcher belongs to the daemon runtime

- **WHEN** the MapGen Studio daemon starts
- **THEN** the live-game watcher is composed under the same Effect runtime scope
  as the RPC handler, EventHub, `Civ7TunerClient`, and `Civ7TunerSession`
- **AND** production composition does not construct an alternate FireTuner
  session, direct-control client, status reader, or event bus for the watcher
- **AND** disposing the daemon runtime stops watcher publication before the
  runtime and EventHub are torn down

### Requirement: Client Applies Live-Game Events Without Status Polling

MapGen Studio SHALL render live Civ7 state from pushed `live-game` events
instead of a browser status polling loop.

#### Scenario: Live-game event updates displayed runtime state

- **WHEN** the client receives a `live-game` event
- **THEN** it updates the displayed live runtime state from the event payload
- **AND** it uses the same snapshot id/keying semantics as the durable live
  runtime model tests

#### Scenario: Snapshot read remains event-triggered request/response

- **WHEN** a pushed live-game state requires a visible snapshot refresh
- **THEN** the client may call `civ7.live.snapshot` request/response
- **AND** the request key is derived from the pushed state
- **AND** a newer live-game event aborts or causes stale older work to be
  ignored
- **AND** the existing request-key stale commit guard decides whether the
  snapshot result may update state
- **AND** the snapshot read is not an event-stream payload and not an
  independent cadence loop

#### Scenario: Setup suggestions are event-triggered request/response

- **WHEN** a pushed live-game state can affect setup visibility or suggestions
- **THEN** setup suggestion reads may run request/response from that event
- **AND** newer events abort or supersede older setup reads
- **AND** no independent browser cadence loop is introduced for setup or live
  status freshness

### Requirement: Client Live Status Polling Is Deleted

MapGen Studio SHALL remove browser-owned live status scheduling after daemon
`live-game` events own live status freshness.

#### Scenario: Poll delay helper is gone

- **WHEN** D10 implementation is complete
- **THEN** no `nextLiveRuntimePollDelayMs` helper, import, or test remains
- **AND** no poll-cadence pin remains for deleted client status polling

#### Scenario: Browser status cadence is gone

- **WHEN** D10 implementation is complete
- **THEN** app/browser source no longer schedules live status `setTimeout` or
  `setInterval` loops
- **AND** background app/browser code no longer calls `civ7.live.status`
- **AND** background app/browser code no longer calls
  `liveControlPort.readiness.current`
- **AND** live-status polling hooks, retry loops, and `refetchInterval` paths do
  not own live status freshness
- **AND** deliberate user-triggered request/response actions such as Explore
  remain allowed only when tied to the user action

### Requirement: Live Proof Owns Live Behavior Closure

D10 implementation SHALL close live-game behavior with bounded live Civ7 proof
when Civ7 is available.

#### Scenario: Civ7 is available for implementation proof

- **WHEN** the implementation branch has access to a live Civ7 runtime
- **THEN** closure evidence records the branch, commit, daemon URL or API path,
  request/event identifiers where available, timestamps, relevant log paths,
  and parsed payload shape
- **AND** the evidence shows first publish, changed-key publish, unchanged-key
  quiet behavior, shared `Civ7TunerSession` ownership, and deleted browser
  live-status cadence

#### Scenario: Civ7 is unavailable for implementation proof

- **WHEN** the implementation branch cannot access live Civ7
- **THEN** D10 implementation closure is not green for live behavior
- **AND** `workstream/next-packet.md` records the exact missing proof,
  environment prerequisite, re-entry commands, log paths, and blocked closure
  claim
