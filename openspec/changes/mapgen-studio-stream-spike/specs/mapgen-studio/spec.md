## ADDED Requirements

### Requirement: Stream Spike Records Event Iterator Feasibility

MapGen Studio SHALL record an evidence-backed feasibility verdict before
implementing the production `studio.events.watch` event channel.

#### Scenario: Selected watch bridge is decided before EventHub implementation

- **WHEN** S3.0 closes
- **THEN** the stream findings identify whether S3.1 should implement
  `studio.events.watch` through `effect-orpc` `.effect()` or through a plain
  oRPC `.handler()` calling into the Effect runtime
- **AND** the rejected path, if any, is recorded as evidence rather than
  retained as a compatibility route

#### Scenario: Spike-only reference code has a terminal disposition

- **WHEN** S3.0 adds a working reference procedure, helper, or test fixture
- **THEN** the findings name whether S3.1 promotes it into production code or
  deletes it after use
- **AND** no unused spike route is allowed to survive as a hidden runtime path

### Requirement: Stream Spike Proves Subscription Cleanup

MapGen Studio SHALL prove that the daemon event subscription model can clean up
when a client disconnects or stops reading.

#### Scenario: Closing the iterator releases the subscription

- **WHEN** a test subscriber reads from the reference event iterator
- **AND** the subscriber closes or aborts the iterator
- **THEN** the underlying Effect subscription is released
- **AND** the cleanup is asserted by the proof instead of inferred

### Requirement: Stream Spike Records Client API Corrections

MapGen Studio SHALL base the S3.1 client stream implementation on the installed
oRPC client package APIs, not stale plan vocabulary.

#### Scenario: Installed stream helper names are recorded

- **WHEN** S3.0 inspects `@orpc/tanstack-query`
- **THEN** the findings record the actual stream helper API names available in
  the installed version
- **AND** any mismatch with the project plan is carried into the S3.1
  implementation notes before production code is written
