## ADDED Requirements

### Requirement: Studio Exposes One Event Watch Procedure

MapGen Studio SHALL expose daemon runtime events through a single
`studio.events.watch` oRPC procedure on the existing `/rpc` surface.

#### Scenario: Watch emits hello on subscribe

- **WHEN** a client subscribes to `studio.events.watch`
- **THEN** the first event is `hello`
- **AND** the event includes the daemon `serverInstanceId` and
  `serverStartedAt`

#### Scenario: Watch subscription cleanup releases resources

- **WHEN** a client closes or aborts the event iterator
- **THEN** the daemon releases the underlying EventHub subscription
- **AND** the cleanup is asserted by a focused test

#### Scenario: No alternate event transport exists

- **WHEN** S3.1 is complete
- **THEN** Studio events are exposed only through `studio.events.watch` on
  `/rpc`
- **AND** no parallel SSE endpoint or compatibility route is added

### Requirement: Client Re-Adopts On Event Stream Hello

MapGen Studio SHALL use the event stream `hello` event to re-adopt daemon-owned
operation truth without deleting the S3.2 polling/watchdog targets early.

#### Scenario: Hello triggers current operation adoption

- **WHEN** the client receives a `hello` event
- **THEN** it calls `studio.operations.current`
- **AND** it updates displayed Run in Game and Save&Deploy operation state from
  daemon truth

#### Scenario: Polling remains until operations-push

- **WHEN** S3.1 lands
- **THEN** existing operation status polls and the daemon-instance watchdog
  remain active
- **AND** their deletion targets remain S3.2/S3.3
