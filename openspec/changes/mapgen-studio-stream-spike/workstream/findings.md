# Stream Spike Findings

## Status

Complete for S3.0. This record is the input to S3.1 `event-hub`.

## Verdict

Feasible with caveats.

S3.1 should implement `studio.events.watch` as an `effect-orpc` `.effect()`
procedure with `eventIterator(...)` output. The handler should return an async
iterator backed by an Effect `PubSub` subscription. The client should consume
the procedure through `experimental_liveOptions` and `ClientRetryPlugin`, not
through the stale plan wording `streamedOptions`.

## Evidence Map

- `@orpc/contract` 1.14.5 exposes `eventIterator(yields, returns?)` as a schema
  whose input shape is `AsyncIteratorObject` and whose output shape is
  `AsyncIteratorClass`
  (`node_modules/.bun/@orpc+contract@1.14.5/node_modules/@orpc/contract/dist/index.d.mts:300`).
- `effect-orpc` types `.effect()` output as `InferSchemaInput<TOutputSchema>`;
  for `eventIterator(...)`, that is the async iterator object the handler must
  return (`packages/studio-server/node_modules/effect-orpc/src/contract.ts:41`).
- `effect-orpc` runs the handler effect and returns `exit.value` directly; it
  does not drain the iterator inside the Effect runtime call
  (`packages/studio-server/node_modules/effect-orpc/src/effect-runtime.ts:91`).
- `@orpc/tanstack-query` 1.14.5 exposes
  `experimental_streamedOptions` and `experimental_liveOptions`, not bare
  `streamedOptions`
  (`node_modules/.bun/@orpc+tanstack-query@1.14.5+78905631a608f42d/node_modules/@orpc/tanstack-query/dist/index.d.mts:143`).
- The TanStack integration checks that the client output is an async iterator
  before running streamed/live query helpers
  (`node_modules/.bun/@orpc+tanstack-query@1.14.5+78905631a608f42d/node_modules/@orpc/tanstack-query/dist/index.mjs:155`).
- `ClientRetryPlugin` defaults retry to `0`, tracks event metadata `id` and
  `retry`, and reconnects event iterators by re-calling the procedure with the
  last event id
  (`node_modules/.bun/@orpc+client@1.14.5/node_modules/@orpc/client/dist/plugins/index.mjs:287`).
- The daemon routes every `/rpc*` request to one `studioRpc.handle(request,
  { prefix: "/rpc" })`
  (`apps/mapgen-studio/src/server/daemon/daemon.ts:137`).
- Vite dev config proxies exactly `/rpc` to the daemon
  (`apps/mapgen-studio/vite.config.ts:50`).

## Selected S3.1 Bridge

Implement production `studio.events.watch` through the existing
`effect-orpc` router:

1. Define the sealed event union with TypeBox/Standard Schema.
2. Add `studio.events.watch` as `eventIterator(StudioEventSchema)`.
3. Implement with `.effect()` returning an async iterator object.
4. Back the iterator with the runtime EventHub service's Effect `PubSub`.
5. Emit `hello` immediately on connect so `experimental_liveOptions` has an
   initial value and restart identity is available.
6. Configure `ClientRetryPlugin` on the Studio client link or call context with
   a nonzero retry count.

The plain oRPC `.handler()` path is not selected. It remains a rejected
contingency because `.effect()` is proven type/runtime-feasible in this repo.

## Touchpoints

- Contract insertion: `packages/studio-server/src/contract/index.ts` under
  `studio.events.watch`, plus a new TypeBox/Standard Schema event contract.
- Router insertion: `packages/studio-server/src/router/index.ts` under
  `oe.studio.events.watch.effect(...)`.
- Runtime service: `packages/studio-server/src/runtime.ts` gains the EventHub
  layer in S3.1.
- Client link: `apps/mapgen-studio/src/lib/orpc.ts` gains
  `ClientRetryPlugin`.
- Client consumption: S3.1 adds one event subscription hook using
  `experimental_liveOptions`.
- Reconnect behavior: reconnect triggers `studio.operations.current` adoption
  from the S2.1 state spine.

## Constraints And Risks

- New durable schemas must use TypeBox/Standard Schema. The S3.0 proof uses
  TypeBox and the local `toStandardSchema` adapter.
- `experimental_liveOptions` is the correct helper for this event spine because
  it models latest daemon state. `experimental_streamedOptions` accumulates
  chunks and is the wrong shape for an unbounded daemon event bus.
- `ClientRetryPlugin` is inert unless configured with retry > 0. S3.1 must wire
  that deliberately.
- Event metadata should use oRPC's exported `withEventMeta` helper for ids and
  retry delay. S3.1 can start without replaying old events because
  `operations.current` is the reconnect truth source, but ids are still useful
  for the retry plugin's last-event-id transport.
- Existing Node HTTP helper tests buffer `Response.body` with `arrayBuffer()`;
  they do not prove streaming. Streaming tests must read from the response or
  client iterator directly.
- Dev proxy stream passthrough is now live-proven by a minimal Vite proxy test,
  not only inferred from source.

## Spike Reference Disposition

- `packages/studio-server/test/streamSpike.test.ts` is S3.0 proof-only
  reference code. S3.1 must either promote its assertions into production
  EventHub/watch tests or delete this spike fixture once production tests cover:
  `.effect()` eventIterator delivery, PubSub cleanup, and retry last-event-id.
- `apps/mapgen-studio/test/devServer/viteProxyStream.test.ts` is a durable dev
  proxy guard. It should remain unless S3.1 replaces it with an equal or
  stronger proof that the real app dev proxy passes event streams without
  buffering.
- No production route, client subscription, EventHub service, or alternate
  transport was added in S3.0.

## S3.1 Required Tests

- Subscribe to `studio.events.watch` and receive `hello` with
  `serverInstanceId` and `serverStartedAt`.
- Closing/aborting the watch iterator releases the underlying PubSub
  subscription.
- `ClientRetryPlugin` reconnect path is configured and carries last-event-id
  when event metadata is present.
- Reconnect invokes `studio.operations.current` and re-adopts daemon-owned
  operation truth.
- Production event tests replace or delete the S3.0 spike fixture.

## Proof Commands

- `bun run --cwd packages/studio-server test -- test/streamSpike.test.ts`
  passed: `.effect()` eventIterator delivery, PubSub cleanup, and
  `ClientRetryPlugin` last-event-id reconnect.
- `bun run --cwd apps/mapgen-studio test -- test/devServer/viteProxyStream.test.ts`
  passed: Vite `/rpc` proxy delivers the first SSE chunk before upstream close.
