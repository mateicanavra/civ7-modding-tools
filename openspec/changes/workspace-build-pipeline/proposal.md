## Why

The Studio Run in Game workstream touches direct-control, SDK mapgen runtime,
Swooper map generation, and Mapgen Studio. Running package-local checks can
fail or pass against stale dependency declarations unless developers remember
the correct build order. The concrete failure mode is Swooper-generated map
entries importing `@mateicanavra/civ7-sdk/mapgen` while the SDK declaration
output in `dist/mapgen/index.d.ts` has not been rebuilt yet.

## What Changes

- Encode the Studio/direct-control verification path as a root Turbo-backed
  command.
- Move root test and CI test entrypoints onto Turbo so package tests inherit
  workspace dependency builds.
- Add a focused Studio Run in Game test lane for Swooper Maps instead of
  making that lane depend on unrelated broad morphology/ecology suite health.
- Add package-specific Turbo task dependencies and outputs where package checks
  need their own generated/build outputs first.
- Add a Studio `check` script so Turbo can type-check Studio without requiring a
  full Vite bundle every time.
- Add package-local Vitest scripts for projects previously covered only by the
  root Vitest project config.

## Requires

- Existing Bun workspaces and Turbo task graph.

## Affected Owners

- Root `package.json`
- `turbo.json`
- `apps/docs/package.json`
- `apps/mapgen-studio/package.json`
- `mods/mod-swooper-maps/package.json`
- `packages/config/package.json`

## Verification Gates

- `bun run verify:studio-run-in-game`
- OpenSpec validation.
