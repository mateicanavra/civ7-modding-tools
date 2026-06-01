## Why

The packet names consumer/package boundary drift as a cross-cutting problem:
pure MapGen core must not own Civ7 runtime calls, and Studio should consume
source-visible or first-class generated contracts rather than accidental
generated artifacts. This needs a separate DX/boundary slice so D1 does not
absorb every consumer repair.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  Problem Layer 6, Stage And Area Scorecard, Domino 1/2 fallout.
- `openspec/config.yaml`: core remains pure; OpenSpec records owner and
  forbidden-owner write sets.
- `docs/system/libs/mapgen/policies/IMPORTS.md` and package ownership docs as
  standing authority for public consumers.

## What Changes

- Move Civ7-bound map runtime/authoring helpers out of pure
  `packages/mapgen-core` surfaces or place them behind an explicit Civ7-bound
  owner.
- Define how Studio consumes recipe config schema/default contracts after D1:
  source-visible contracts, first-class generated contracts, or an explicit
  build step.
- Update Studio imports away from accidental generated-output authority.
- Add proof that pure core no longer imports adapter/runtime values.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mapgen-normalization-workstreams`: adds a dedicated consumer/package-boundary
  slice distinct from D1 config migration and import-policy enforcement.

## Dependencies

- Requires: `normalize-config-surface`, `normalize-import-boundaries`.
- Enables parallel work: G3 guard, stable Studio adoption of later topology
  changes, and cleaner generated-contract ownership.

## Forbidden Non-Goals

- No persisted config-shape migration; D1 owns that.
- No ecology topology migration.
- No projection or placement behavior changes.
- No generated `dist/` or `mod/` hand edits.
- No generic `shared` package for product-bearing Studio contracts.

## Impact

- Affected owners: MapGen core, Civ7 adapter/mod runtime boundary, Studio
  recipe catalog/config consumers, package exports, docs.
- Expected write set:
  - `packages/mapgen-core/src/authoring/maps/**`
  - explicit Civ7-bound owner package or mod runtime source
  - `apps/mapgen-studio/src/recipes/**`
  - `apps/mapgen-studio/src/browser-runner/**`
  - package exports and tests for the moved surfaces
  - boundary docs
- Protected paths: D1 config migration files except contract consumption
  fallout, ecology topology, hydrology/placement source, generated outputs.
- Stop conditions:
  - Studio cannot consume source or generated contracts without a new build
    ownership decision;
  - moving map runtime helpers would break public SDK consumers without a
    consumer gate;
  - a proposed home imports Civ7 runtime values into pure core.
- Verification gates:
  - package typechecks/builds for core, adapter/mod, and Studio;
  - search proving pure core has no Civ7 adapter/runtime value imports;
  - Studio config contract tests;
  - `bun run openspec -- validate normalize-core-studio-dx-boundaries --strict`;
  - `bun run openspec:validate`;
  - `git diff --check`.
