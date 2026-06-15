## ADDED Requirements

### Requirement: Studio Selects One Event Watch Transport

MapGen Studio SHALL use the selected `effect-orpc` `.effect()` plus `eventIterator(...)` bridge for the production `studio.events.watch` procedure.

#### Scenario: Watch contract uses the selected event iterator bridge

- **WHEN** `studio.events.watch` is defined
- **THEN** its output contract is `eventIterator(...)` over the sealed TypeBox Studio event union through the owned Standard Schema adapter
- **AND** its router implementation uses `effect-orpc` `.effect()`
- **AND** the handler returns an async iterator object

#### Scenario: Plain handler bridge is rejected

- **WHEN** the event watch procedure is implemented
- **THEN** no production plain oRPC `.handler()` bridge exists for Studio events
- **AND** no parallel SSE endpoint, second RPC mount, or legacy event route is added

### Requirement: Studio Stream Subscriptions Have Observable Cleanup

MapGen Studio SHALL prove that the event-watch subscription bridge releases Effect resources when a client stops consuming the stream.

#### Scenario: Iterator close releases the subscription

- **WHEN** a client closes the event iterator
- **THEN** the underlying Effect `PubSub` subscription scope is closed
- **AND** the subscriber count returns to baseline

#### Scenario: Client abort or disconnect releases the subscription

- **WHEN** a client aborts or disconnects from the event iterator
- **THEN** the underlying Effect subscription finalizer runs
- **AND** subscriber/dequeue counts return to baseline after cleanup

#### Scenario: Runtime interruption releases the subscription

- **WHEN** the watch fiber or managed runtime is interrupted while a subscription is open
- **THEN** the underlying Effect subscription finalizer runs
- **AND** subscriber/dequeue counts return to baseline after cleanup

#### Scenario: Repeated subscribe and close does not leak subscribers

- **WHEN** the watch path is opened and closed repeatedly
- **THEN** subscriber/dequeue counts return to baseline after every close
- **AND** the proof fails if subscriptions accumulate

### Requirement: Studio Client Uses Live Event Consumption With Explicit Retry

MapGen Studio SHALL consume the watch stream with the installed live-query API and an explicit retry owner.

#### Scenario: Client uses live options for latest daemon truth

- **WHEN** the Studio client subscribes to `studio.events.watch`
- **THEN** it uses the installed `experimental_liveOptions` helper
- **AND** production Studio event code does not use stale `streamedOptions` vocabulary or accumulating `experimental_streamedOptions`

#### Scenario: Retry is configured on the actual watch path

- **WHEN** the Studio event watch client path is configured
- **THEN** the actual watch link or call context supplies nonzero retry
- **AND** default `ClientRetryPlugin` construction alone is not treated as reconnect proof

### Requirement: Stream Spike Fixtures Have Terminal Disposition

MapGen Studio SHALL not leave spike-only stream proof code as an unowned production path or proof island.

#### Scenario: Spike proof fixture is promoted or deleted

- **WHEN** a production EventHub/watch packet covers a D7 proof guarantee
- **THEN** any D7 spike-only fixture for that guarantee is promoted into production tests or deleted
- **AND** the disposition is recorded in the downstream packet evidence

#### Scenario: Vite RPC stream passthrough remains guarded

- **WHEN** Studio development routing proxies `/rpc`
- **THEN** a durable guard proves at least two ordered event-stream chunks pass through before upstream close
- **AND** no alternate local development event route is added
