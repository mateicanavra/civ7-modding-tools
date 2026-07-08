# Design

## Public Surface

`foundation-orogeny` owns a public config schema alongside the other Foundation
stage public helpers. The public shape names author intent, not operation
machinery. Its public fields are exactly:

- `knobs`, retaining the existing high-level `continentalAbundance` and
  `continentalRelief` levers.
- `crustCharacter`, an author-facing object derived from the default
  `computeCrustEvolution` config schema and excluding the operation
  `strategy/config` envelope.

`crustCharacter` compiles to
`crust-evolution.computeCrustEvolution.{ strategy: "default", config }` before
runtime execution.

The compile boundary is the only place that creates internal step envelopes for
this stage. Studio config builders, default config materialization, and presets
must consume the public shape.

## File Topology

Likely source write set:

- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-orogeny/index.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-orogeny/**`
- `mods/mod-swooper-maps/src/maps/configs/*.config.json` through normal
  generation or validation commands only
- `apps/mapgen-studio/src/features/configOverrides/**`
- `apps/mapgen-studio/test/config/defaultConfigSchema.test.ts`
- `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_standard_recipe_public_authoring_surface/**`

Generated outputs and lockfiles remain read-only.

## Migration

First-party checked-in configs containing the old envelope are migrated in this
packet to `crustCharacter`. Imported or user-provided configs that still contain
`foundation-orogeny.crust-evolution.computeCrustEvolution` are rejected by the
public config validation boundary with a safe validation error. New default or
preset authoring state must not emit that shape.

## Comments

JSDoc or anchor comments belong on the public schema/compile boundary when the
ownership would otherwise be non-obvious: they should explain that public config
is author-facing and internal operation envelopes are compile-time output.
