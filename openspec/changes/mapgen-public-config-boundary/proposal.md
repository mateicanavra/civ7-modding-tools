## Why

The MapGen authoring SDK already supports explicit stage `public + compile`
surfaces, but the regression showed that product-facing recipes can fall back to
raw internal step/op schemas when a genuine public transform is removed. That
leaks op envelopes such as `{ strategy, config }` into Studio and persisted map
configs.

This change records and verifies the SDK boundary: public recipe config is the
stage surface; internal step/op contracts are compiler/runtime input after
stage compilation.

## Target Authority Refs

- Direct user decision: public config is semantic authoring input compiled into
  internal step/op config; projection/internal config is not public config.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  Target Shape, Problem Layer 2, and D1.
- `openspec/specs/mapgen-normalization-workstreams/spec.md`: flat config
  migration and genuine public transforms remain explicit.

## What Changes

- Add SDK/compiler-level coverage proving explicit public stage schemas hide
  internal op envelopes from the recipe surface.
- Keep the normal flat shape `{ knobs?, [publicKey]?: publicConfig }`.
- Keep raw step schemas as internal compiled config for execution.

## Requires

- Existing `createStage` `public + compile` support.

## Enables Parallel Work

- `morphology-public-config-surface`
- `studio-public-config-contract`

## Forbidden Non-Goals

- No persisted `advanced` wrapper.
- No Studio-only schema patching to hide internal fields.
- No broad removal of internal no-public stages that are not product-facing.

## Verification Gates

- `bun test packages/mapgen-core/test/authoring/authoring.test.ts packages/mapgen-core/test/compiler/recipe-compile.test.ts`
- `bun run openspec -- validate mapgen-public-config-boundary --strict`
- `git diff --check`
