## ADDED Requirements

### Requirement: Daemon Publishes Live-Game State Deltas

MapGen Studio SHALL publish live Civ7 status changes to `studio.events.watch`
as `live-game` events from the daemon.

#### Scenario: First live-game observation publishes

- **WHEN** the daemon live-game watcher observes Civ7 live state for the first
  time in a process
- **THEN** it publishes a `studio.events.watch` event with `type: "live-game"`
- **AND** the event contains a TypeBox-defined `state` payload
- **AND** the read uses the unified runtime's shared `Civ7TunerSession`

#### Scenario: Changed turn or game hash publishes

- **WHEN** a later watcher observation has a different live-game key derived
  from turn, Civ game hash, or stable status content
- **THEN** the daemon publishes a new `live-game` event
- **AND** the event reaches subscribers through the existing EventHub

#### Scenario: Unchanged live-game key stays quiet

- **WHEN** a later watcher observation has the same live-game key as the last
  published observation
- **THEN** the watcher does not publish another `live-game` event
- **AND** clock-only changes do not create a new event

### Requirement: Client Applies Live-Game Events Without Status Polling

MapGen Studio SHALL render live Civ7 state from pushed `live-game` events
instead of a browser status polling loop.

#### Scenario: Live-game event updates displayed runtime state

- **WHEN** the client receives a `live-game` event
- **THEN** it updates the displayed live runtime state from the event payload
- **AND** it uses the same snapshot id/keying semantics as the durable live
  runtime model tests

#### Scenario: Snapshot read remains request/response

- **WHEN** a pushed live-game state requires a visible snapshot refresh
- **THEN** the client may call `civ7.live.snapshot` request/response
- **AND** the existing request-key stale commit guard still decides whether the
  snapshot result may update state
- **AND** the snapshot read is not an event-stream payload

#### Scenario: Setup suggestions are event-triggered

- **WHEN** a pushed live-game state is applied
- **THEN** setup suggestion reads may run request/response from that event
- **AND** no independent browser cadence loop is introduced for setup/live
  status freshness

### Requirement: Client Live Status Polling Is Deleted

MapGen Studio SHALL remove client-owned live status scheduling after daemon
`live-game` events own live status freshness.

#### Scenario: Poll delay helper is gone

- **WHEN** S3.3 is complete
- **THEN** no `nextLiveRuntimePollDelayMs` helper, import, or test remains
- **AND** no poll-cadence pin remains for deleted client status polling

#### Scenario: Browser status setTimeout loop is gone

- **WHEN** S3.3 is complete
- **THEN** `StudioShell` no longer schedules a live status `setTimeout` loop
- **AND** background live status reads no longer call `civ7.live.status` from
  the browser
- **AND** deliberate request/response actions such as Explore can remain
