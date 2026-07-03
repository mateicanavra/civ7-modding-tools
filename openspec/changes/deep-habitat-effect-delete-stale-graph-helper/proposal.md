# Change: Deep Habitat Effect Delete Stale Graph Helper

## Why

The active `habitat graph` command runs through the effect-oRPC service module
and `NxProvider`. A leftover `src/lib/graph.ts` helper still shells directly to
the `target-check` alias, bypassing the provider/resource path and preserving a
raw vendor command surface that no caller uses.

Habitat should not keep dead compatibility helpers around after the provider
path exists.

## What Changes

- Delete the unused `src/lib/graph.ts` helper.
- Remove it from public-surface allowlists.
- Add it to the deleted-adapter guard so it cannot return silently.

## Non-Goals

- Do not change the `habitat graph` command behavior.
- Do not change `NxProvider.graph`.
- Do not add topology tests.

## Validation

- Public-surface guard and package TypeScript should pass.
- Root Habitat check should continue to pass through the service/provider graph
  surface.
