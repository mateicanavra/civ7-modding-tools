## Why

Reefs are oversaturated because broad water suitability fields become
reef-family intents. The family-local weak-positive admission fix is necessary
but not sufficient: warm reefs, cold reefs, atolls, and exact `FEATURE_LOTUS`
need reef-family-specific physical habitat semantics.

## Target Authority Refs

- `mods/mod-swooper-maps/AGENTS.md`: Ecology owns
  `artifact:ecology.featureIntents.reefs`.
- `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`: `map-ecology` applies
  planned intents but does not plan truth.
- Direct user guidance: keep feature-specific physics anchored in sensible
  real-world expectations.

## What Changes

- Add reef-family habitat eligibility for warm reefs, cold reefs, atolls, and
  exact `FEATURE_LOTUS`.
- Keep reef scoring/planning in Ecology truth ops.
- Add focused and recipe-level tests that reject blanket reef coverage.

## Dependencies

- Requires `bound-ecology-feature-intent-planners`.

## Forbidden Non-Goals

- No chance thinning, generated-output edits, map special casing, or
  projection-stage truth scoring.

## Verification Gates

- focused reef tests;
- recipe-level reef balance tests;
- `bun run --cwd mods/mod-swooper-maps check`;
- `bun run openspec -- validate constrain-reef-habitat-eligibility --strict`;
- `bun run openspec:validate`;
- `bun run build`;
- `bun run deploy:mods`;
- `git diff --check`.
