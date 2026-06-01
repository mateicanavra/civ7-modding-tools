# Design: Projection Authoring Surface Alignment

## Problem

The projection stages use the default internal-as-public stage shape even when
the authored fields are not meaningful user controls. The result is a collapsed
surface:

- `map-morphology` and `map-elevation` expose empty runtime step keys.
- `map-hydrology` exposes `lakes.projectionReadback`, which is diagnostic
  behavior rather than a gameplay control.
- `map-rivers` exposes valid Civ7 river-model thresholds, but under the runtime
  step key `plot-rivers`.
- `map-ecology` exposes the raw `features-apply.apply` op envelope and
  projection-only empty `plot-effects` step key.
- biome binding strings are valid low-level projection controls, but were not
  enum-bounded and had a schema default that disagreed with runtime resolver
  defaults for `tropicalSeasonal`.

Projection is allowed to be lower-level than truth stages because it materializes
pipeline products into Civ7 engine state. That does not make every runtime
parameter author-facing. Public controls still need semantic ownership,
documentation, bounds, and deterministic lowering.

## Decision

Create explicit public schemas for the five `map-*` projection stages and
compile them into the existing internal executable shape:

- empty projection stages expose only documented `knobs` and compile to the
  existing empty step configs;
- `map-hydrology` compiles to `lakes.projectionReadback: true` so readback
  evidence remains always-on without exposing the diagnostic flag;
- `map-rivers.riverProjection` compiles to `plot-rivers` and keeps
  `riverDensity` as the existing knob transform over the authored thresholds;
- `map-ecology.biomeBindings` compiles to `plot-biomes.bindings` using only the
  official base-standard biome globals as enum/literal choices;
- `features-apply.apply` and `plot-effects` are internal projection defaults,
  not authored config.

The Ecology biome binding schema is tightened at the domain boundary so Studio
and generated defaults can only emit official biome globals. Its
`tropicalSeasonal` default is aligned to `BIOME_PLAINS`, matching the runtime
resolver and existing shipped configs. Configs that omit `tropicalSeasonal`
therefore receive `BIOME_PLAINS` from schema/default normalization instead of
the prior schema-only `BIOME_GRASSLAND` default. The `marine` binding remains
fixed to `BIOME_MARINE`; water tiles are not a free biome remapping surface.

The feature-apply `maxPerTile` guard is capped at `1` because Civ7 tiles receive
one final feature after merge validation. It remains an internal guard, not a
public feature-density control.

## Behavior Boundary

This slice changes persisted authoring shape, not projection runtime algorithms.
First-party shipped configs are migrated from runtime step keys to semantic
projection keys in the same slice. A checked-in pre-slice compiled projection
fixture proves that the migrated configs produce the same stable internal
projection config for the shipped maps.

Generated map source artifacts churn because persisted config JSON changes shape
and generated metadata hashes include source config. That churn is not claimed
as runtime behavior evidence.

No direct Civ7 runtime proof is required for this slice because compile output is
behavior-equivalent for shipped configs and runtime step implementations are not
changed.

## Deferred Work

Discharge-driven river stamping remains deferred under `DEF-020`. This slice
keeps Civ7 `modelRivers(...)` as projection-only behavior and only cleans up how
authors tune that projection.

Future profile-collapse work may replace `riverProjection` thresholds with a
higher-level river projection profile if map statistics or runtime goldens show
which values must move together. Until then, `riverProjection` is an intentional
expert projection control with deterministic lowering and bounded numeric
fields.
