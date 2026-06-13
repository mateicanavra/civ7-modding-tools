# Design — stream spike (S3.0)

## D1. Spike boundary

S3.0 is a feasibility slice. It may add test-local reference code, focused
fixtures, and spike artifacts. It does not introduce the production
`EventHub`, the production `studio.events.watch` procedure, or client store
feed rewrites. Production implementation starts in S3.1 after this slice names
the selected bridge.

The reference code has one of two terminal dispositions:

- promoted by S3.1 into the production `studio.events.watch` path; or
- deleted by S3.1 when it has served as proof-only scaffolding.

No spike reference may remain as an unused route, shim, or compatibility path.

## D2. Contract proof

The contract proof answers whether the current installed packages can express:

```ts
studio.events.watch -> eventIterator(StudioEventSchema)
```

where the handler is implemented through the same `effect-orpc`
`implementEffect` pattern used by `packages/studio-server`. The evidence must
include the installed type/runtime source that makes the verdict true or false.

If `.effect()` cannot return an event iterator safely, S3.1 shall implement the
watch procedure with a plain oRPC `.handler()` that calls into the Effect
runtime boundary. That is a selected implementation path, not a retained
fallback.

## D3. PubSub adapter proof

The daemon-side event category is Effect-native. The spike must prove a small
adapter from `PubSub` subscription to async iterator consumption:

- every published event is yielded in order for one subscriber;
- closing the iterator or aborting the client releases the subscription;
- cleanup is observable by a focused test, not inferred from code review.

The adapter may be test-local in S3.0. S3.1 owns the production EventHub
service and final adapter placement.

## D4. Transport proof

The future watch procedure must use the existing one `/rpc` surface. The spike
must prove that the server handler and development proxy path preserve streaming
semantics. Evidence can be a focused app-level test, a Bun fetch proof against
the handler, or a source-backed disposition if the current test harness cannot
exercise vite without adding brittle infrastructure.

The proof must name what it falsifies: buffering all events until close,
dropping later events, or failing to run cleanup on client disconnect.

## D5. Client proof

The plan named `streamedOptions`, but the installed client package is the
authority for exact API names. The spike records the actual API exposed by the
installed `@orpc/tanstack-query` version and demonstrates the consumption shape
or records the source-backed correction for S3.1.

The reconnect proof must inspect `ClientRetryPlugin` behavior for event
iterator retries and record whether S3.1 can rely on it directly. If a live
network retry test is impractical in S3.0, the findings must state the boundary
and the minimal S3.1 test that closes it.

## D6. Findings format

`workstream/findings.md` is the durable output. It must contain:

- verdict: feasible, feasible with caveats, risky, or rejected;
- selected S3.1 procedure bridge;
- evidence map with file/package pointers;
- integration touchpoints;
- constraints and risks;
- deletion/promotion targets for any spike-only reference;
- exact next tests S3.1 must keep or add.
