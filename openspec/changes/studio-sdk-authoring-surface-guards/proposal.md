# Proposal: Studio/SDK Authoring Surface Guards

## Summary

Add cross-cutting guards over the standard recipe authoring surface after the
domain behavior slices have migrated their own schemas, shipped configs,
generated artifacts, and Studio proof. The remaining risk is not one more stage
cleanup; it is consumer drift: Studio, generated recipe artifacts, generated map
entrypoints, and identity tests can accidentally reintroduce raw step/op
surfaces or keep validating stale assumptions.

This slice hardens those shared consumers without changing recipe runtime
behavior.

## Authority

- `docs/projects/standard-recipe-authoring-surface/PROJECT.md`
- `docs/projects/standard-recipe-authoring-surface/taxonomy-and-slices.md`
- `docs/projects/standard-recipe-authoring-surface/proof-ledger.md`
- `docs/projects/standard-recipe-authoring-surface/review-disposition-ledger.md`
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`
- `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`
- Prior authoring-surface slice OpenSpecs from corpus through placement.

## Affected Owners

- `mods/mod-swooper-maps/test/config/`
- `apps/mapgen-studio/test/config/`
- `openspec/changes/studio-sdk-authoring-surface-guards/`
- `docs/projects/standard-recipe-authoring-surface/`

## Forbidden Owners

- Stage implementation files, unless a guard exposes a real regression.
- Persisted compatibility wrappers, dual config shapes, or broad public exports.
- Generated artifact hand edits.
- Runtime placement, ecology, hydrology, morphology, projection, or foundation
  algorithms.
- Direct Civ7 runtime proof, unless a guard repair changes generated map
  behavior.

## What Changes

- Add source-level standard-recipe guards proving every standard stage has an
  explicit semantic public authoring model and no generated/default consumer
  needs raw step/op authoring keys.
- Add Studio catalog/runtime guards proving Studio's UI artifacts and worker
  runtime consume the same generated standard schema/defaults.
- Add focus-path guards proving generated Studio UI metadata points only at
  public config schema/default paths.
- Repair stale shipped-map identity checks so they inspect semantic public
  config for authoring shape and compiled config for internal strategy output.
- Add generated map entrypoint guards proving SDK-facing generated maps keep
  using canonical public map config envelopes instead of inlining raw or
  compiled config.

## Consumer Impact

No author-facing config changes. The slice only strengthens tests and project
records so future SDK/Studio/generated consumers cannot drift back to raw
standard-recipe internals without failing a focused guard.

## Verification Gates

- OpenSpec strict validation.
- Focused MapGen config guard tests.
- Focused Studio config artifact tests.
- Existing standard recipe config/preset/Studio validation suite.
- `apps/mapgen-studio check`.
- `packages/mapgen-core build` and `packages/mapgen-core check`.
- `mods/mod-swooper-maps check`, recorded with existing SDK import residual if
  unchanged.
- Peer-agent review and repair of accepted P1/P2 findings.
- `git diff --check`.
