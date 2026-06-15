# Design - Studio Event Hub

## Component Role

D8 is the event-spine component for Studio runtime state. It takes D7's selected
stream bridge and gives it one production owner:

```text
Studio daemon
  creates one StudioEventHub
  injects it into StudioServerContext
  provides it to the package Effect runtime

studio.events.watch
  emits hello immediately
  subscribes to StudioEventHub
  releases subscription on close/abort/interruption

Studio client
  subscribes with experimental_liveOptions
  owns nonzero retry on the actual watch call
  uses hello to re-adopt daemon current operations
```

D8 does not publish operation or live-game events yet. It defines the stable
contract and runtime channel those downstream publishers must use.

## Event Contract

The event union is category-first and TypeBox-owned:

- `hello`: daemon identity and connection observation metadata.
- `operation`: future operation status event. `kind` distinguishes
  `run-in-game` from `save-deploy`; `status` reuses the canonical operation DTOs
  from `studio.operations.current`.
- `live-game`: future live-game state event. `state` reuses the canonical
  live-game state schema.

The event contract is sealed at D8 so D9 and D10 add publishers without changing
the watch procedure shape. Sealed does not mean extensible-by-details-blob:
adding a new public event category requires an explicit future spec change.

The TypeBox schema is converted to Standard Schema through the owned adapter.
Zod, ad hoc casts, or app-local event DTO definitions are forbidden owners.

## Hub Ownership

`packages/studio-server` owns the `StudioEventHub` API and service tag. The app
daemon owns the concrete instance lifetime:

- the daemon creates one hub per daemon runtime;
- `StudioServerContext` carries that hub into the package router/runtime;
- D9 operation publishers and D10 live-game publishers receive the same hub
  through context, not a second bus;
- daemon shutdown closes the hub and interrupts open subscribers.

The service API is intentionally small:

- `publish(event)` appends an event to current subscribers;
- `subscribe({ initialEvents })` returns an async iterator over the immediate
  initial events and then hub events;
- `activeSubscriberCount()` exists only as observability for cleanup proof;
- `shutdown()` terminates the hub for daemon disposal/tests.

There is no browser-owned event bus, app-local server bus, alternate package
bus, or localStorage event recovery path.

## Watch Procedure

`studio.events.watch` is the only Studio event subscription procedure:

- contract output: `eventIterator(StudioEventSchema)`;
- router implementation: `oe.studio.events.watch.effect(...)`;
- handler return: an async iterator object;
- first yielded event: `hello`;
- subsequent events: `StudioEventHub` subscription events;
- route: existing `/rpc` handler from D0.

`hello` includes:

- `serverInstanceId`;
- `serverStartedAt`;
- `observedAt`.

`observedAt` is the server-side emission time for the event, not a client clock
or durable replay cursor.

## Subscription Cleanup

Each watch subscription must acquire its underlying Effect `PubSub`
subscription in a scope owned by the iterator. Cleanup is a behavior, not a code
style:

- iterator `return()` closes the subscription scope;
- client abort/disconnect closes the subscription scope;
- runtime/fiber interruption closes the subscription scope;
- hub shutdown releases pending subscribers;
- repeated subscribe/close cycles return observable subscriber count to
  baseline.

Production closure cannot rely only on reading a `finally` block. Tests must
observe subscriber cleanup.

## Client Subscription

The Studio app adds one event subscription hook:

- consumes `orpc.studio.events.watch.experimental_liveOptions(...)`;
- passes explicit nonzero retry on the actual watch path;
- sets TanStack query retry behavior so oRPC owns event-stream reconnect;
- treats event data as latest daemon state, not an accumulating log.

The selected client helper is `experimental_liveOptions`. Accumulating stream
helpers and stale `streamedOptions` vocabulary are rejected for Studio events.

On `hello`, the hook calls `studio.operations.current` and applies the D6
operation adoption helper. The hook must not reload the page or resurrect
browser request-id recovery.

On future `operation` and `live-game` events, the hook may apply the event DTOs
to local UI state, but D9 and D10 own the publisher conversions and poll
deletions that make those events authoritative.

## Downstream Handoffs

D8 leaves named downstream work, not open-ended deferral:

- D9 `mapgen-studio-operations-push` publishes operation transitions through
  this hub and deletes operation polling/watchdog authority after parity is
  proven.
- D10 `mapgen-studio-live-game-watch` publishes daemon live-game state through
  this hub and deletes browser live-game polling/timer authority after parity is
  proven.
- D12 `mapgen-studio-game-door-invariant` closes remaining game-door runtime
  invariants after event-pushed runtime ownership is complete.

D9/D10 must not introduce another bus, route, retry owner, event schema family,
or app-local stream wrapper.

## Packet Blockers

D8 is not accepted while any of the following remain:

- event contract or watch procedure still described with stale closure status
  instead of D8 packet-train ownership;
- `operation` or `live-game` categories lack downstream owners;
- polling/watchdog retention lacks D9/D10 deletion owner and proof trigger;
- watch retry proof relies on default `ClientRetryPlugin` construction;
- cleanup proof collapses close, abort/disconnect, interruption, shutdown, and
  repeated subscribe/close into one vague assertion;
- packet allows an alternate event route, parallel bridge, app-local event
  server, Zod event schema, or browser storage recovery path;
- D7 spike-only fixture disposition is unowned;
- review finds unresolved P1/P2 ambiguity.
