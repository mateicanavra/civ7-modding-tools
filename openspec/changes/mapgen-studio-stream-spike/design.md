# Design - Studio Stream Transport Decision

## Component Role

D7 is the transport-selection component for the Studio event spine. It does not own the production event bus categories; it owns the decision that D8-D10 build on:

```text
studio.events.watch
  contract: TypeBox StudioEvent -> Standard Schema -> eventIterator(...)
  router: effect-orpc .effect()
  server bridge: Effect PubSub subscription -> scoped async iterator
  transport: existing /rpc mount
  client: experimental_liveOptions with explicit nonzero retry
```

D7 prevents D8 from rediscovering transport details while implementing EventHub semantics.

## Selected Procedure Bridge

The production watch bridge is:

- `@orpc/contract` `eventIterator(...)` output;
- `effect-orpc` `.effect()` implementation;
- handler result is the async iterator object, not a drained array or buffered response;
- TypeBox event union converted through the owned Standard Schema adapter;
- existing one `/rpc` mount from D0.

The plain oRPC `.handler()` bridge is rejected for Studio events. It is not retained as a parallel implementation, legacy route, or local emergency path.

## Effect Subscription Bridge

The EventHub subscription bridge uses Effect `PubSub` and scoped cleanup:

- each subscriber acquires a subscription in a `Scope`;
- iterator `return()` closes the scope;
- client abort/disconnect closes the iterator and releases the subscription;
- runtime/fiber interruption closes the scope;
- repeated subscribe/close cycles leave subscriber/dequeue counts at baseline.

D7 requires observable cleanup tests. Code review of `finally` blocks or scope construction is not proof.

## Client Consumption Bridge

The installed TanStack oRPC helper for latest daemon state is `experimental_liveOptions`. The Studio event spine is a latest-state channel: `hello` re-adopts current daemon truth, operation events replace operation polling, and live-game events replace browser live polling. It is not an accumulating chunk log.

`experimental_streamedOptions` is a source-backed non-fit for production Studio events because it accumulates chunks. Bare `streamedOptions` is stale plan vocabulary and must not appear as a production API name.

The retry owner must be explicit on the actual event-watch path. Either the RPC link or the watch call context supplies nonzero retry. A default `new ClientRetryPlugin()` has retry `0` and does not prove reconnect behavior.

## Transport Proof

The stream uses the existing one `/rpc` path through the Studio daemon and Vite development proxy. D7's transport proof must falsify:

- all events buffered until upstream close;
- first event delivered but later events dropped;
- client close not reaching server cleanup;
- dev proxy turning an event stream into a non-streaming response.

The durable dev proxy guard is `apps/mapgen-studio/test/devServer/viteProxyStream.test.ts`, or an equal/stronger successor that reads at least two ordered chunks from the response body before upstream close.

## Spike Fixture Disposition

Any spike-only reference code is temporary proof infrastructure. The next production packet that owns the same behavior must do one of:

- promote the assertions into production EventHub/watch tests; or
- delete the fixture after equivalent production coverage exists.

No spike fixture, reference route, helper, or test-only procedure can remain as a hidden runtime path or unowned proof island.

## Packet Blockers

D7 is not accepted while any of the following remain:

- plain `.handler()` is described as an available production bridge for Studio events;
- the packet permits a second event route, second RPC mount, or parallel SSE endpoint;
- cleanup proof does not include interruption/disconnect and repeated subscribe/close behavior;
- retry proof relies on default `ClientRetryPlugin` construction only;
- client consumption uses stale or accumulating stream helper vocabulary;
- spike fixture promotion/deletion is unowned;
- D8/D9/D10 production semantics are collapsed into D7 transport selection;
- review finds unresolved P1/P2 ambiguity.
