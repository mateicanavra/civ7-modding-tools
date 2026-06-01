## Why

Morphology stages are product-facing Earth-shape authoring surfaces, but their
current schemas expose internal step/op envelopes to Studio. That makes normal
authoring edits validate against implementation details and blocks the intended
semantic config workflow.

This change gives Morphology explicit flat public schemas and deterministic
compile functions that produce internal step/op config.

## Target Authority Refs

- Direct user decision: all public config is semantic knobs/stage schema that
  compiles to internal schemas; raw projection/op config is not public surface.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  Target Shape, D1, and stage promotion rule.
- `mods/mod-swooper-maps/AGENTS.md`: Swooper Maps owns source recipe content;
  generated outputs are not edited by hand.

## What Changes

- Add explicit public schemas for `morphology-coasts`,
  `morphology-routing`, `morphology-erosion`, and `morphology-features`.
- Compile semantic public keys to internal step/op envelopes.
- Define the target semantic public surface consumed by the shipped-config
  migration workstream.
- Preserve existing semantic knobs and first-party tuning values.

## Requires

- `mapgen-public-config-boundary`

## Enables Parallel Work

- `studio-public-config-contract`
- `migrate-swooper-morphology-public-configs`
- Later Earthlike balance tuning on a stable authoring surface.

## Forbidden Non-Goals

- No `advanced` wrapper.
- No dual persisted morphology shapes.
- No raw `{ strategy, config }` envelopes in Morphology public config.
- No change to Morphology stage topology or runtime physics in this slice.

## Verification Gates

- `bun test mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts mods/mod-swooper-maps/test/m11-config-knobs-and-presets.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate morphology-public-config-surface --strict`
- `git diff --check`
