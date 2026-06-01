# Design: Ecology Authoring Surface Alignment

## Problem

The corpus ledger classifies Ecology as authoring-surface collapse. Pedology,
biome classification, feature scoring, feature planning, and plot-effect
coverage currently publish internal step ids, op ids, strategy selectors, raw
`config` wrappers, and engine selector identifiers directly to authored map
configs. That gives first-party configs enough control to preserve current map
behavior, but it makes Studio render implementation envelopes instead of
semantic Ecology controls.

Ecology also has a mixed shape: some values are real expert controls with direct
map impact, while others are private execution details. Examples of valid public
controls include fertility, moisture, temperature, suitability thresholds, and
coverage percentages. Examples of private details include selected strategy ids,
empty vegetation score op envelopes, and plot-effect engine selector names.

## Decision

Create explicit public schemas for the three Ecology truth stages and compile
them into the existing internal executable shape:

- `soilClassification` compiles to `pedology.classify`, selecting the default,
  coastal-shelf, or orogeny-boosted strategy from a semantic profile;
- `resourceBasinPlanning` compiles to `resource-basins.plan`, selecting the
  default, hydro-fluvial, or mixed strategy from a semantic profile;
- `biomeClassification` compiles to `biomes.classify`;
- feature scoring groups compile to `score-layers` ops while empty vegetation
  scoring envelopes remain recipe-owned defaults;
- `icePlanning` and `reefPlanning` compile to selected planning strategies from
  semantic profiles;
- wetland, vegetation, and plot-effect public groups compile to their existing
  planning ops with default strategies;
- plot-effect selector identifiers are injected by compile and are not accepted
  as authored config.

The TypeBox public schemas clone relevant Ecology strategy config schemas after
removing the envelope owner layer. Public descriptions are normalized to
author-facing map impact language, and numeric leaves receive finite min/max
ranges. This keeps exact shipped-map values authorable without exposing the
execution envelope that applies them.

## Behavior Boundary

This slice changes persisted authoring shape, not Ecology runtime algorithms.
First-party shipped configs are migrated from raw envelopes to semantic public
keys in the same slice. A checked-in pre-slice compiled Ecology fixture proves
that the migrated configs produce the same stable internal Ecology config for the
shipped maps.

Generated map source artifacts may churn because persisted config JSON changes
shape and generated metadata hashes include source config. That churn is not
claimed as runtime behavior evidence.

## Deferred Work

Several Ecology groups remain expert numeric controls rather than compact product
profiles. Future profile-collapse work is owned by the standard recipe
authoring-surface workstream and should re-enter only when map statistics,
goldens, or runtime proof show which coupled values must move together. Until
then, this slice records an intentional expert public surface with semantic
group ownership and deterministic lowering.

Projection-stage ownership in `map-ecology` is deferred to the projection
authoring-surface audit. This slice only changes Ecology truth stages.
