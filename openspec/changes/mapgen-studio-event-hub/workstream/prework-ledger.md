# D8 Prework Ledger - Studio Event Hub

Status: packet accepted; implementation pending
Date: 2026-06-14

## Packet-Authoring Prework Completed

- Confirmed D0-D7 are accepted in the packet train.
- Classified the existing `mapgen-studio-event-hub` packet as historical
  implementation-closure notes requiring D8 repair.
- Inspected the D8-D10 frame sections and the accepted D7 stream transport
  packet.
- Inspected current code evidence:
  - `packages/studio-server/src/services/StudioEventHub.ts`
  - `packages/studio-server/src/contract/studio.ts`
  - `packages/studio-server/src/router/index.ts`
  - `packages/studio-server/src/runtime.ts`
  - `packages/studio-server/src/context.ts`
  - `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts`
  - `apps/mapgen-studio/src/app/operationAdoption.ts`
  - `packages/studio-server/test/handler.test.ts`
  - `apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts`
  - `apps/mapgen-studio/test/server/oneMount.test.ts`
- Started fresh peer prework/review lanes for event surfaces,
  testing/vendor-alignment, and hardening/black-ice.

## Implementation-Shaping Prework Completed

| Surface | Decision |
| --- | --- |
| Event bus owner | daemon-owned `StudioEventHub` instance provided through `StudioServerContext` |
| Hub implementation | Effect `PubSub` with scoped subscriptions and observable cleanup proof |
| Event schema origin | TypeBox union converted through owned Standard Schema adapter |
| Event categories | sealed `hello | operation | live-game` union |
| Watch procedure | `studio.events.watch` on existing `/rpc` |
| Watch bridge | D7-selected `effect-orpc` `.effect()` plus `eventIterator(...)` |
| Client helper | `experimental_liveOptions` |
| Retry owner | explicit nonzero retry on actual watch call/link context |
| Reconnect truth | `hello` triggers `studio.operations.current` adoption |
| Polling deletion owner | D9 for operations/watchdog, D10 for live-game browser cadence |
| Spike fixture disposition | D8/D9 production tests promote equivalent assertions or delete fixtures |

## Negative Search Set

```bash
rg -n "EventSource|text/event-stream|/events|/sse|createServer\\(|new Server\\(" packages/studio-server/src apps/mapgen-studio/src -g "*.{ts,tsx}"
rg -n "studio\\.events\\.watch.*\\.handler|\\.handler\\(.*events\\.watch" packages/studio-server/src apps/mapgen-studio/src -g "*.{ts,tsx}"
rg -n "streamedOptions|experimental_streamedOptions" apps/mapgen-studio/src packages/studio-server/src -g "*.{ts,tsx}"
rg -n "retry: 0|default retry|ClientRetryPlugin\\(\\).*reconnect" apps/mapgen-studio/src packages/studio-server/src openspec/changes/mapgen-studio-event-hub -g "*.{ts,tsx,md}"
rg -n "zod|fromZod|z\\." packages/studio-server/src/contract packages/studio-server/src/services apps/mapgen-studio/src/app/hooks -g "*.{ts,tsx}"
rg -n "streamSpike|proof-only|spike-only" packages/studio-server/test apps/mapgen-studio/test openspec/changes/mapgen-studio-event-hub openspec/changes/mapgen-studio-operations-push -g "*.{ts,tsx,md}"
```

Hits are blockers unless classified as selected D7 route proof, historical
packet evidence, explicit nonzero retry ownership, or downstream disposition
evidence.

## Implementation Prework Required Before Code Edits

1. Re-run the negative search set on the selected implementation base.
2. Confirm installed `effect-orpc`, `@orpc/contract`, `@orpc/client`, and
   `@orpc/tanstack-query` APIs still support D7's selected bridge/helper.
3. Identify the exact observable cleanup probe: subscriber count, dequeue count,
   or an equivalent service-level finalizer signal.
4. Partition D9/D10 hook points so D8 may define event DTO shapes without
   converting publishers or deleting polling early.
5. Decide whether D7 spike fixture assertions are fully promoted by D8
   production tests or must be handed to D9.

## Peer-Agent Prework Lanes

- **Event surface scout:** enumerate D8-owned surfaces and confirm no surface is
  hidden inside D9/D10.
- **Testing/vendor scout:** verify Effect/oRPC/TypeBox/TanStack proof strategy
  and API-native terminology.
- **Hardening/black-ice scout:** search for hidden retained paths, orphan deferral,
  retry false-positive, stale S3 vocabulary, and unowned deletion targets.
- **Downstream scout:** verify D9/D10 packet assumptions consume D8 without
  creating another bus, schema, route, or retry owner.

## Resolved Black-Ice Decisions

- Polling retention is not open-ended: D9 and D10 are the deletion owners.
- Default `ClientRetryPlugin` construction is not reconnect proof.
- The event stream is not a durability ledger or replay log.
- `operation` and `live-game` event categories are public contract shapes in D8
  even though their publishers land in D9/D10.
- Browser localStorage request recovery is not an event recovery retained path.

## Remaining Human Decisions

None for packet acceptance. Implementation must re-run vendor/API checks if
dependency versions change.
