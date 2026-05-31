## Why

MapGen Studio renders and saves the recipe config schema it receives from the
recipe artifacts. Once Morphology exposes a real public surface, Studio must be
verified against that public contract so the UI cannot regress to raw internal
step/op envelopes.

## Target Authority Refs

- Direct user decision: Studio edits semantic public authoring config, not
  internal op/projection schemas.
- `openspec/specs/mapgen-normalization-workstreams/spec.md`: Studio contract
  source is explicit.
- `openspec/changes/morphology-public-config-surface`: Morphology public schema
  owner.

## What Changes

- Add Studio-facing contract coverage proving generated standard recipe
  artifacts expose Morphology public keys and hide raw op-envelope selectors.
- Keep Studio as a schema consumer; the recipe/core layers own the public schema.

## Requires

- `mapgen-public-config-boundary`
- `morphology-public-config-surface`

## Enables Parallel Work

- Studio-based Morphology and Earthlike tuning through repo-backed configs.

## Forbidden Non-Goals

- No UI-only filtering of internal schemas.
- No browser-local shipped-map authority.
- No raw Morphology op envelopes in Studio default or repo-backed config saves.

## Verification Gates

- `bun test apps/mapgen-studio/test/config/defaultConfigSchema.test.ts`
- `bun run --cwd mods/mod-swooper-maps build:studio-recipes`
- `bun run --cwd apps/mapgen-studio build`
- `bun run openspec -- validate studio-public-config-contract --strict`
- `git diff --check`
