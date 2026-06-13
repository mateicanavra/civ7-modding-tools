# Design — event hub (S3.1)

## D1. Event category

The production event union is category-first:

- `hello`: daemon identity and connection metadata.
- `operation`: a future operation status event, with `kind` discriminating
  `run-in-game` vs `save-deploy`.
- `live-game`: a future live-game state event.

S3.1 emits only `hello`. The other variants are part of the sealed contract so
S3.2/S3.3 can fill the category without changing the watch procedure shape.

## D2. Hub ownership

The package defines the EventHub API and TypeBox event types. The daemon creates
one hub instance and passes it through `StudioServerContext`. `runtime.ts`
provides that hub into the Effect runtime layer.

This keeps one bus:

- `studio.events.watch` reads the hub from the package runtime.
- S3.2 app-side operation registries can publish to the same hub through the
  injected context object.

Do not create a package-only bus that app-side engine publishers cannot reach.

## D3. Watch procedure

`studio.events.watch` uses the S3.0-selected bridge:

- contract output: `eventIterator(StudioEventSchema)`;
- router implementation: `oe.studio.events.watch.effect(...)`;
- handler return: an async iterator object;
- first yielded event: `hello` with `serverInstanceId` and `serverStartedAt`;
- subsequent events: EventHub PubSub subscription events;
- iterator `return()` closes the subscription scope.

The watch procedure lives on the existing one `/rpc` mount. There is no
parallel SSE endpoint.

## D4. Client subscription and reconnect

The Studio app adds one hook for event subscription. The hook consumes
`orpc.studio.events.watch.experimental_liveOptions(...)` because the event
spine represents latest daemon truth rather than an accumulating log.

On `hello`, the hook:

- records the daemon identity seen from the event stream;
- calls `studio.operations.current`;
- adopts active/recent Run in Game and Save&Deploy operations through the same
  adoption helper used on initial boot.

The existing watchdog remains until S3.2. During S3.1, `hello` re-adoption is
additive and should not reload the page.

## D5. Retry plugin

`ClientRetryPlugin` is added to the single Studio `RPCLink` with a nonzero retry
policy. S3.0 proved last-event-id transport, but S3.1 still uses
`operations.current` as reconnect truth; the event stream is not an operation
durability ledger.

## D6. Proof fixture disposition

`packages/studio-server/test/streamSpike.test.ts` is S3.0 proof-only. S3.1
must either delete it or promote its assertions into production watch tests.
Closure is blocked if the proof fixture remains beside equivalent production
tests without an explicit reason.
