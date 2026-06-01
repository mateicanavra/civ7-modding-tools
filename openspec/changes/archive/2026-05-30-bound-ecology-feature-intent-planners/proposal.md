## Why

Fresh Civ7 logs show the map reaches Ecology and final placement successfully,
so reef/marsh saturation is a behavior bug rather than a load failure. Source
review and recipe diagnostics show the categorical planner issue: continuous
feature score layers are converted into feature intents whenever the best score
is merely positive. That makes broad physical plausibility paint nearly every
eligible tile.

This change fixes only the score-to-intent admission category. Reefs, wetlands,
vegetation, and ice remain unique features with unique habitat logic; each
family owns its admission policy locally and its specific physics are owned by
separate feature-family changes where needed.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  Ecology truth belongs in `ecology-features`; `map-ecology` is projection.
- `mods/mod-swooper-maps/AGENTS.md`: feature planning publishes split intents
  before feature apply writes engine state.
- `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`: feature planning is
  Ecology-owned truth.
- Direct user guidance: categorical violations need categorical guards, but
  shared logic must not erase feature-specific physics.

## What Changes

- Add local Ecology feature-family planner policies: weak positive suitability
  is not enough to become a feature intent.
- Apply the family-local policy to every feature-family planner that has the
  same positive-score admission category.
- Add tests that reject the category across feature planners, not just a reef
  or marsh one-off.
- Add recipe-level ecology balance checks that run through the standard recipe.

## Dependencies

- Builds on archived `normalize-ecology-topology` and
  `normalize-architecture-dx-standardization`.

## Forbidden Non-Goals

- No probability/chance thinning.
- No one-off `modswooper` or Earthlike special casing.
- No projection-stage truth scoring or density filtering.
- No replacing feature-specific reef/wetland/vegetation/ice physics with one
  generic habitat rule.
- No `features-plan-shared`, `score-shared` admission policy, or generic
  planner router.

## Verification Gates

- focused ecology planner tests;
- recipe-level ecology balance tests;
- `bun run --cwd mods/mod-swooper-maps check`;
- `bun run openspec -- validate bound-ecology-feature-intent-planners --strict`;
- `bun run openspec:validate`;
- `bun run build`;
- `bun run deploy:mods`;
- `git diff --check`.
