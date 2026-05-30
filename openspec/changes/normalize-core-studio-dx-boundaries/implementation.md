# normalize-core-studio-dx-boundaries Implementation Record

Date: 2026-05-30
Branch: `codex/normalize-core-studio-dx-boundaries-impl`
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-normalize-authority-routing`

## Scope

This slice separates pure MapGen core from Civ7 runtime-bound map entrypoint
glue and records Studio's recipe artifact contract source.

## Core Runtime Boundary

- Removed the Civ7-bound `@swooper/mapgen-core/authoring/maps` entrypoint from
  `mapgen-core`.
- Moved `createMap` into the shared Civ7 SDK at
  `@mateicanavra/civ7-sdk/mapgen`.
- Updated Swooper map entrypoints and their type-inference guard to import the
  SDK map surface.
- Did not add a compatibility alias in `mapgen-core`; the old owner was the
  purity violation this slice removes.

The SDK owner is intentional: `createMap` is a reusable Civ7 map-entrypoint
helper for any map package, not a `mod-swooper-maps` special case.

## Studio Contract Source

- Studio continues to consume recipe schema/default/ui metadata through
  first-class `mod-swooper-maps/recipes/*-artifacts` package entrypoints.
- `apps/mapgen-studio/src/recipes/catalog.ts` and
  `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md` now state that
  those artifacts are generated from recipe package source by
  `bun run --cwd mods/mod-swooper-maps build:studio-recipes`.
- Generated `dist/` files remain build proof, not editable product policy.

## Consumer Impact

- Affected in-repo consumers:
  - `mods/mod-swooper-maps/src/maps/*.ts`
  - `mods/mod-swooper-maps/src/maps/__type_tests__/createMap-config.inference.ts`
- Public API change:
  - Removed `@swooper/mapgen-core/authoring/maps`.
  - Added `@mateicanavra/civ7-sdk/mapgen`.

## Verification

Commands run from the worktree:

- `bun install`
- `bun run --cwd packages/sdk check`
- `bun run --cwd packages/sdk build`
- `bun run --cwd packages/mapgen-core check`
- `bun run --cwd packages/mapgen-core build`
- `bun run --cwd packages/mapgen-core test -- test/architecture/core-purity.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run --cwd mods/mod-swooper-maps build`
- `bun run --cwd apps/mapgen-studio build`
- `rg -n "^import(?!\\s+type).*@civ7/adapter|@civ7/adapter/civ7|\\bcreateCiv7Adapter\\b|\\bGameplayMap\\b|\\bengine\\s+as\\s+unknown\\b" packages/mapgen-core/src -g '*.ts' -g '!packages/mapgen-core/src/dev/**' -P || true`
- `bun run openspec -- validate normalize-core-studio-dx-boundaries --strict`
- `bun run openspec:validate`
- `git diff --check`
