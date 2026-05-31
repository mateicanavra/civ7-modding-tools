## Why

The Studio visibility repair exposed the raw foundation plate-motion diagnostic
as a default-visible world-space vector segment layer. That is the wrong
authoring surface for balance work: the useful product diagnostic is tile-space
plate motion with directional arrows, because terrain, coasts, mountains, and
ecology are inspected on generated map tiles.

## Target Authority Refs

- Direct user decision: plate motion must remain tile-based with directional
  arrows for normal Studio use.
- `openspec/changes/earthlike-balance-diagnostic-gates`: balance proof depends
  on product-visible diagnostics, not only successful execution.
- `openspec/specs/mapgen-normalization-workstreams/spec.md`: truth and
  projection/materialization surfaces stay distinct.
- `mods/mod-swooper-maps/AGENTS.md`: generated outputs are regenerated through
  package scripts rather than hand-edited.

## What Changes

- Keep raw foundation plate-motion world vectors available only as debug
  diagnostics.
- Keep the tile-projected plate-motion vector field default-visible in Studio.
- Require the default tile surface to include the arrow render mode.
- Replace the broad "every data-emitting step must be default visible" test
  with a semantic Studio contract for the core balance diagnostics.

## Write Set

- Foundation plate-motion visualization metadata.
- Foundation projection visualization label/contract.
- Studio browser-runner visualization regression test.
- This OpenSpec change record.

## Forbidden Non-Goals

- No changes to plate-motion generation physics.
- No changes to map balance tuning.
- No broad visibility rule that forces internal debug diagnostics into the
  default Studio surface.

## Verification Gates

- `bun test apps/mapgen-studio/test/browserRunner/standardLayerVisibility.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate restore-plate-motion-tile-arrows --strict`
- `git diff --check`
