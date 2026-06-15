# D7 Stream Transport Findings

Status: normative packet evidence
Date: 2026-06-14

## Verdict

D7 selects `effect-orpc` `.effect()` returning `eventIterator(...)` as the Studio event-watch bridge.

The selected client consumption shape is `experimental_liveOptions` with explicit nonzero retry on the actual event-watch path. The selected server subscription shape is Effect `PubSub` acquired in a `Scope` and exposed as a scoped async iterator.

## Evidence Map

| Finding | Evidence | Packet decision |
| --- | --- | --- |
| `eventIterator(...)` is the correct contract output for event watch. | `packages/studio-server/src/contract/studio.ts` imports `eventIterator` and defines `eventsWatch` with an event iterator output. | D8/D9 use this output shape; no alternate event route. |
| `effect-orpc` `.effect()` can serve the event iterator. | `packages/studio-server/src/router/index.ts` implements `oe.studio.events.watch.effect(...)` returning `eventHub.subscribe(...)`. | Plain `.handler()` is rejected for Studio events. |
| Effect `PubSub` subscription cleanup is the resource boundary. | `packages/studio-server/src/services/StudioEventHub.ts` uses `PubSub.subscribe(...).pipe(Scope.extend(scope))`, closes the `Scope` in iterator return, and exposes `activeSubscriberCount()`. | Future proofs assert cleanup by subscriber-count/dequeue behavior, not code review. |
| Vite `/rpc` proxy can pass streaming responses before upstream close. | `apps/mapgen-studio/test/devServer/viteProxyStream.test.ts` is the current passthrough guard; D7 raises its required oracle to two ordered chunks before upstream close. | Keep this guard after strengthening it to the two-chunk oracle, or replace it with an equal/stronger passthrough proof. |
| Client latest-state consumption uses live options. | `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts` uses `orpc.studio.events.watch.experimental_liveOptions(...)`. | `experimental_streamedOptions` is not the Studio event-spine shape. |
| Retry must be explicitly owned. | `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts` passes `context: studioEventsWatchClientContext()` with infinite retry. | Default `ClientRetryPlugin` construction is not reconnect proof. |

## Rejected Paths

- Plain oRPC `.handler()` for `studio.events.watch`.
- Parallel SSE endpoint or second Studio event route.
- Bare `streamedOptions` plan vocabulary.
- Accumulating `experimental_streamedOptions` for latest daemon event state.
- Default-only retry claim for watch reconnect.
- Spike-only production route, helper, or fixture with no D8/D9 disposition.

## Downstream Contract

- D8 consumes the selected bridge when specifying production `StudioEventHub` and `studio.events.watch` semantics.
- D9 consumes the same bridge when operation transition events replace operation polling.
- D10 consumes the same bridge when live-game events replace browser live polling.
- D12 verifies no final runtime path reintroduces parallel transports, browser recovery, or raw game-door event fields.
