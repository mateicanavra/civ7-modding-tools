# MapGen Studio stream spike

## Why

The runtime simplification program's event spine depends on one typed daemon
event channel: `studio.events.watch`. S3.1 should implement that channel as
execution, not discovery. S3.0 proves the unknown transport bridge first:

- whether `effect-orpc` `implementEffect` can serve an `eventIterator` output
  from an Effect handler;
- whether an Effect `PubSub` can be adapted to an async iterator with
  disconnect-tied cleanup;
- whether the Studio daemon/vite development path preserves SSE/event-iterator
  streaming without buffering;
- whether the installed TanStack oRPC client helpers and `ClientRetryPlugin`
  support the intended client consumption and reconnect behavior.

The product outcome is simple: the daemon owns ephemeral truth and pushes it;
the browser renders and re-adopts on reconnect. This spike prevents the event
spine from inheriting a speculative API assumption.

## Target Authority Refs

- `docs/projects/studio-runtime-simplification/PLAN.md` — WS-3 S3.0 requires
  a small stream feasibility spike before `event-hub`.
- `openspec/changes/mapgen-studio-runtime-one-mount/` — the one `/rpc` surface
  that the future watch procedure must use.
- `openspec/changes/mapgen-studio-operations-current/` — `operations.current`
  remains the reconnect/re-adoption source after stream reconnects.
- Installed package evidence in this repo:
  `@orpc/contract`, `@orpc/tanstack-query`, `@orpc/client/plugins`, and
  `effect-orpc`.
- Current daemon/vite development routing under `apps/mapgen-studio/src/server`
  and `apps/mapgen-studio` tests.

## What Changes

- Add a working reference proof for the selected watch-procedure bridge. The
  reference may be test-local or spike-scoped, but it must not become a hidden
  production route outside S3.1. S3.1 either promotes the selected approach into
  `studio.events.watch` or deletes the spike-only reference.
- Prove or reject `effect-orpc` `.effect()` returning an `eventIterator`
  async iterator.
- Prove Effect `PubSub` subscription cleanup when the client stops reading.
- Prove server transport and dev proxy behavior for event streaming.
- Prove client consumption against the installed oRPC TanStack API names and
  `ClientRetryPlugin` behavior, or record a bounded incompatibility with source
  evidence.
- Produce `workstream/findings.md` with the verdict, integration touchpoints,
  constraints, selected S3.1 path, and any deletion/promotion target.

## Non-Goals

- No production EventHub service in this slice.
- No deletion of operation polls, watchdog, or live-game polling in this slice.
  S3.2/S3.3 own those deletions.
- No second runtime surface or alternate transport.
- No Zod expansion for new event contracts; any new durable schema introduced
  after the spike uses TypeBox/Standard Schema.
- No long-lived dual path. If the spike selects plain oRPC `.handler()` for
  `studio.events.watch`, that is the S3.1 implementation path and the
  `.effect()` route remains rejected evidence, not a compatibility lane.

## Impact

- `openspec/changes/mapgen-studio-stream-spike/**`
- Focused reference/test files under `packages/studio-server/test/**` and/or
  `apps/mapgen-studio/test/**`
- Minimal spike-only helper code if required to exercise the real handler
  stack; any such helper must name its S3.1 promotion or deletion target.

## Verification Gates

- `bun run openspec -- validate mapgen-studio-stream-spike --strict`
- Focused package/app test proving event-iterator server behavior.
- Focused adapter test proving unsubscribe/finalizer cleanup.
- Focused transport/client proof or source-backed disposition for the dev proxy
  and TanStack client/retry pieces.
- `workstream/findings.md` cites the files/package declarations that support
  the final S3.1 decision.
