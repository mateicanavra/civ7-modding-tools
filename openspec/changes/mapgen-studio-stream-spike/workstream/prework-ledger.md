# D7 Prework Ledger - Stream Transport Decision

Status: draft
Date: 2026-06-14

## Packet-Authoring Prework Completed

- Confirmed D0-D6 are accepted in the packet train.
- Read the existing `mapgen-studio-stream-spike` packet and classified it as S3.0 implementation-closure history requiring D7 frame-standard repair.
- Inspected D7-D10 frame sections and downstream event-hub / operations-push packets.
- Inspected current stream code evidence:
  - `packages/studio-server/src/contract/studio.ts`
  - `packages/studio-server/src/router/index.ts`
  - `packages/studio-server/src/services/StudioEventHub.ts`
  - `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts`
  - `apps/mapgen-studio/test/devServer/viteProxyStream.test.ts`
- Started fresh peer prework scouts for transport/API and hardening/black-ice lanes.

## Implementation-Shaping Prework Completed

| Surface | Decision |
| --- | --- |
| Watch procedure bridge | `effect-orpc` `.effect()` plus `eventIterator(...)` |
| Event schema origin | TypeBox Studio event union through owned Standard Schema adapter |
| Server subscription bridge | Effect `PubSub` subscription acquired in `Scope` and exposed as scoped async iterator |
| Transport route | existing one `/rpc` mount |
| Client consumption | `experimental_liveOptions` |
| Client retry | explicit nonzero retry on actual watch link/call context |
| Spike fixture disposition | D8/D9 promote equivalent assertions or delete proof-only fixtures |

## Negative Search Set

```bash
rg -n "studio\\.events\\.watch.*\\.handler|\\.handler\\(.*events\\.watch|text/event-stream|EventSource|new Server\\(|createServer\\(|/events|/sse" packages/studio-server/src apps/mapgen-studio/src -g "*.{ts,tsx}"
rg -n "streamedOptions|experimental_streamedOptions" apps/mapgen-studio/src packages/studio-server/src -g "*.{ts,tsx}"
rg -n "retry: 0|retry\\s*:\\s*false|default retry|ClientRetryPlugin\\(\\).*reconnect" apps/mapgen-studio/src packages/studio-server/src openspec/changes/mapgen-studio-stream-spike -g "*.{ts,tsx,md}"
rg -n "streamSpike|spike-only|proof-only" packages/studio-server/test apps/mapgen-studio/test openspec/changes/mapgen-studio-event-hub openspec/changes/mapgen-studio-operations-push -g "*.{ts,tsx,md}"
```

Hits are classified as selected path, rejected path, durable dev proxy test, downstream disposition evidence, default plugin construction with actual watch-path nonzero retry proof, or blocker.

## Implementation Prework Required Before Code Edits

1. Confirm installed `@orpc/contract`, `effect-orpc`, `@orpc/tanstack-query`, and `@orpc/client` versions still expose the selected APIs.
2. Re-run stream helper and retry scans on the selected implementation base.
3. Build cleanup fixtures that can observe subscription counts, interruption cleanup, and repeated subscribe/close behavior.
4. Confirm D8/D9 production tests promote covered D7 spike fixtures or delete them.

## Peer-Agent Prework Lanes

- **Transport/API scout:** verify selected event iterator bridge and installed client helper facts.
- **Resource cleanup scout:** verify cleanup proof surfaces and missing finalizer cases.
- **Hardening/black-ice scout:** remove hidden alternate bridges, stale branch history, default retry false positives, and unowned fixture disposition.
- **Downstream scout:** verify D8/D9/D10 consume D7 without reintroducing parallel transports.

## Resolved Black-Ice Decisions

- Plain `.handler()` is rejected for Studio events; it is not a retained alternate bridge.
- `experimental_liveOptions` is selected for latest daemon truth; accumulating stream helpers are rejected for Studio event state.
- Default `ClientRetryPlugin` construction is not reconnect proof.
- Stream transport stays on the existing `/rpc` route.
- Spike fixtures have a terminal promotion-or-deletion obligation.

## Remaining Human Decisions

None for packet acceptance. Implementation teams must re-run API evidence if dependency versions change.
