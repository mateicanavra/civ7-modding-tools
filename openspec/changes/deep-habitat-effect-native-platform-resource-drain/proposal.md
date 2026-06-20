# Proposal: Deep Habitat Effect Native Platform Resource Drain

## Summary

Remove Habitat-owned resource services that duplicate Effect platform services,
and route migrated filesystem and clock use through the native Effect runtime
or a deliberately small resource edge for still-synchronous public paths.

## Why

Habitat is the composition layer for robust vendor tools and repo structure. Its
own internals must model the same discipline it asks of target repositories:
kinds of things have named homes, boundaries are explicit, and infrastructure
is reused from mature providers instead of rebuilt locally.

The earlier Effect substrate introduced Habitat wrappers for filesystem, clock,
scope, write sets, and locks. This packet corrects that overreach. Native Effect
platform services are the substrate where they exist; Habitat resources remain
only where Habitat owns typed error translation, cache/temp semantics, or sync
edge containment.

## What Changes

- Delete the duplicate Habitat clock, resource scope, workspace lock, and write
  set services.
- Alias Habitat filesystem access to `@effect/platform/FileSystem` and keep
  only Habitat-specific helpers for typed errors and sync import-time edges.
- Use native `Clock.currentTimeMillis` in Effect flows.
- Use `FileSystem.makeTempDirectoryScoped` for temp directory acquisition.
- Update runtime/test layers so `NodeContext.layer` supplies platform services.
- Update guards so direct time and filesystem primitives remain contained in
  resource/provider/host boundaries.

## What Does Not Change

- Public command behavior, JSON report shapes, and package exports do not
  change.
- Provider contracts remain provider-owned; this packet removes duplicated
  resource substrate, not vendor procedure/module ownership.
- Existing sync public paths are not converted to async Effect APIs in this
  packet; their host primitives are contained behind resource helpers.

## Verification Gates

- `bun install`
- `bun run --cwd tools/habitat-harness check`
- `bun run --cwd tools/habitat-harness test`
- `bun run habitat check --tool habitat --json`
- `bun run biome:ci`
- `bun run openspec -- validate deep-habitat-effect-native-platform-resource-drain --strict`
- `bun run openspec:validate`
- `bun run build`
- `git diff --check`
