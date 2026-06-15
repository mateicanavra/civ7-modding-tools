# MapGen Studio Stream Transport Decision

## Why

D8 and D9 depend on one daemon-owned event channel that can carry runtime truth without reopening browser polling or alternate transports. D7 locks the stream transport decision before production EventHub semantics are treated as stable.

The selected transport is the S3.0-proven path: `effect-orpc` `.effect()` returns an `eventIterator(...)` async iterator on the existing `/rpc` mount, backed by an Effect `PubSub` subscription whose scope closes when the iterator closes or the watch fiber is interrupted. The Studio client consumes the channel with the installed `@orpc/tanstack-query` live helper and an explicit nonzero retry policy.

## Authority

- `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md`
- `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md`
- `openspec/changes/mapgen-studio-runtime-one-mount/`
- `openspec/changes/mapgen-studio-operations-current/`
- `openspec/changes/mapgen-studio-stream-spike/workstream/findings.md`
- Current evidence:
  - `packages/studio-server/src/contract/studio.ts`
  - `packages/studio-server/src/router/index.ts`
  - `packages/studio-server/src/services/StudioEventHub.ts`
  - `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts`
  - `apps/mapgen-studio/test/devServer/viteProxyStream.test.ts`

## What Changes

- Repair the existing `mapgen-studio-stream-spike` change from S3.0 implementation-closure history into the D7 normative packet.
- Select `effect-orpc` `.effect()` plus `eventIterator(...)` as the only production watch-procedure bridge.
- Select Effect `PubSub` plus scoped async iterator cleanup as the only EventHub subscription bridge.
- Select the existing one `/rpc` transport path; no parallel SSE route, second RPC mount, or app-local event server is allowed.
- Select `experimental_liveOptions` as the client consumption helper for latest daemon state. `experimental_streamedOptions` remains a source-backed non-fit for the Studio event spine.
- Require the actual event-watch path to configure nonzero retry. Installing `ClientRetryPlugin` with its default retry policy is not sufficient.
- Preserve the durable Vite `/rpc` stream passthrough guard as D7 transport proof.
- Require every spike-only reference fixture to have one terminal disposition: promoted into D8/D9 production tests or deleted.

## Non-Goals

- No production EventHub behavior is specified here beyond the selected transport bridge; D8 owns production EventHub/watch semantics.
- No operation event publication or operation-poll deletion; D9 owns that.
- No live-game event publication or live-game polling deletion; D10 owns that.
- No browser localStorage recovery.
- No Zod expansion for stream or event contracts.
- No retained alternate bridge for plain oRPC `.handler()`. The handler path is rejected evidence because `.effect()` plus `eventIterator(...)` is the selected path.

## Future Implementation Write Set

- `packages/studio-server/src/contract/**`
- `packages/studio-server/src/router/**`
- `packages/studio-server/src/services/**`
- `packages/studio-server/test/**`
- `apps/mapgen-studio/src/lib/orpc.ts`
- `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts`
- `apps/mapgen-studio/test/devServer/viteProxyStream.test.ts`
- `apps/mapgen-studio/test/studioEvents/**`

Protected paths:

- Alternate HTTP/SSE servers or second RPC mounts.
- Browser storage owners and D6 operation-current adoption logic except reconnect call sites.
- D9 operation publisher logic and D10 live-game watcher logic.
- Generated outputs and built bundles.

## Verification Gates

### Packet Acceptance Gates

- `bun run openspec -- validate mapgen-studio-stream-spike --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git status --short --branch`
- `gt status`
- `gt log --no-interactive`
- Transport/API, downstream realignment, testing/proof, and hardening/black-ice reviews have no unresolved P1/P2 findings.

### Future Implementation Closure Gates

- Package/app gates:
  - `bun run --cwd packages/studio-server test -- test/handler.test.ts`
  - `bun run --cwd packages/studio-server check`
  - `bun run --cwd apps/mapgen-studio test -- test/devServer/viteProxyStream.test.ts test/studioEvents/operationAdoption.test.ts`
  - `bun run --cwd apps/mapgen-studio check`
- Watch procedure contract uses `eventIterator(TypeBoxStudioEventSchema)` through the owned Standard Schema adapter.
- Router implements `studio.events.watch` through `oe.studio.events.watch.effect(...)`; no production `.handler()` watch bridge remains.
- Subscription cleanup proof covers iterator `return()`, client abort/disconnect, and runtime/fiber interruption.
- Repeated subscribe/close proof shows no subscriber/dequeue growth.
- Vite `/rpc` passthrough proof reads at least two ordered stream chunks before upstream close.
- Client watch path uses `experimental_liveOptions` with explicit nonzero retry context or link policy.
- Negative searches:
  - no parallel SSE endpoint or second Studio event route;
  - no bare `streamedOptions` production use for Studio events;
  - no default-only retry claim for event watch;
  - no S3.0 spike fixture remains without D8/D9 promotion or deletion evidence.
