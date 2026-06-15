## ADDED Requirements

### Requirement: Studio Owns One Daemon Event Hub

MapGen Studio SHALL create one daemon-owned `StudioEventHub` per daemon runtime
and provide that hub to the Studio package router/runtime through
`StudioServerContext`.

#### Scenario: One hub is shared by watch procedure and future publishers

- **WHEN** the daemon constructs the Studio server context
- **THEN** `studio.events.watch` subscribes to the same `StudioEventHub` instance
  that downstream operation and live-game publishers receive
- **AND** no package-only, browser-owned, or app-local alternate event bus is
  created

#### Scenario: Event schema is TypeBox-owned and sealed

- **WHEN** Studio exposes runtime events
- **THEN** the public event union is `hello | operation | live-game`
- **AND** the union is defined with TypeBox and converted to Standard Schema by
  the owned adapter
- **AND** operation event payloads use the canonical operation DTOs from
  `studio.operations.current`
- **AND** live-game event payloads use the canonical live-game state schema
- **AND** no Zod, catch-all details blob, or app-local duplicate event schema
  owns the public event shape

### Requirement: Studio Exposes One Event Watch Procedure

MapGen Studio SHALL expose daemon runtime events through a single
`studio.events.watch` oRPC procedure on the existing `/rpc` surface.

#### Scenario: Watch emits hello on subscribe

- **WHEN** a client subscribes to `studio.events.watch`
- **THEN** the first event is `hello`
- **AND** the event includes `serverInstanceId`, `serverStartedAt`, and
  `observedAt`

#### Scenario: Watch yields hub events after hello

- **WHEN** a client remains subscribed after the initial `hello`
- **THEN** subsequent `operation` and `live-game` events are yielded from
  `StudioEventHub`
- **AND** D9/D10 may add publishers without changing the watch procedure shape

#### Scenario: Watch subscription cleanup releases resources

- **WHEN** a client closes, aborts, or disconnects from the event iterator
- **THEN** the daemon releases the underlying EventHub subscription
- **AND** cleanup is asserted by focused tests with an observable subscription
  count or equivalent proof

#### Scenario: Watch interruption releases resources

- **WHEN** the watch fiber/runtime is interrupted or the daemon hub shuts down
- **THEN** the daemon releases the underlying EventHub subscription
- **AND** repeated subscribe/close cycles return subscriber state to baseline

#### Scenario: No alternate event transport exists

- **WHEN** D8 is implemented
- **THEN** Studio events are exposed only through `studio.events.watch` on
  `/rpc`
- **AND** no parallel SSE endpoint, second RPC mount, app-local event server, or
  retained alternate route is added

### Requirement: Client Re-Adopts On Event Stream Hello

MapGen Studio SHALL use the event stream `hello` event to re-adopt daemon-owned
operation truth through `studio.operations.current`.

#### Scenario: Hello triggers current operation adoption

- **WHEN** the client receives a `hello` event
- **THEN** it calls `studio.operations.current`
- **AND** it updates displayed Run in Game and Save/Deploy operation state from
  daemon truth through the D6 adoption helper
- **AND** it does not reload the page or use browser request-id recovery

#### Scenario: Event watch retry is deliberate

- **WHEN** the client subscribes to `studio.events.watch`
- **THEN** the actual watch path uses `experimental_liveOptions`
- **AND** the watch call or link context supplies a nonzero retry policy
- **AND** default `ClientRetryPlugin` construction alone is not treated as
  reconnect proof

#### Scenario: Polling deletion remains owned by downstream packets

- **WHEN** D8 is implemented
- **THEN** operation status polling and daemon-instance watchdog deletion remain
  owned by D9 `mapgen-studio-operations-push`
- **AND** live-game browser polling/timer deletion remains owned by D10
  `mapgen-studio-live-game-watch`
