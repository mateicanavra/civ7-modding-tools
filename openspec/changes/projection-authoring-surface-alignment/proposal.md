# Proposal: Projection Authoring Surface Alignment

## Summary

Replace the standard recipe `map-*` projection stages' raw runtime step/op
authoring surface with a narrow semantic public surface. Projection stages
currently expose empty runtime step keys, lake diagnostic readback flags, Civ7
river-model thresholds under `plot-rivers`, raw `features-apply.apply`
strategy/config envelopes, and biome binding strings without enum bounds. This
slice keeps projection behavior deterministic by compiling semantic public
fields into the existing internal step/op configs, migrates first-party shipped
map configs, and proves migrated configs compile to the same internal projection
output as the pre-slice configs.

## Authority

- `docs/projects/standard-recipe-authoring-surface/PROJECT.md`
- `docs/projects/standard-recipe-authoring-surface/corpus-ledger.md`
- `docs/projects/standard-recipe-authoring-surface/taxonomy-and-slices.md`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/projects/engine-refactor-v1/deferrals.md`
- `openspec/changes/authoring-surface-corpus-and-taxonomy/`
- `openspec/changes/foundation-authoring-surface-alignment/`
- `openspec/changes/morphology-authoring-surface-alignment/`
- `openspec/changes/hydrology-authoring-surface-alignment/`
- `openspec/changes/ecology-authoring-surface-alignment/`
- `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`
- `docs/system/mods/swooper-maps/`

## Requires

- Foundation, Morphology, Hydrology, and Ecology alignment branches below this
  branch.
- Existing projection runtime steps and deterministic schema defaults.
- Current generated Studio recipe artifacts.

## Affected Owners

- `mods/mod-swooper-maps/src/recipes/standard/stages/map-*/`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-projection-public-config.ts`
- `mods/mod-swooper-maps/src/domain/ecology/biome-bindings.ts`
- `mods/mod-swooper-maps/src/domain/ecology/ops/features-apply/contract.ts`
- `mods/mod-swooper-maps/src/maps/configs/*.config.json`
- `mods/mod-swooper-maps/src/maps/generated/*.ts`
- `mods/mod-swooper-maps/test/config/`
- `apps/mapgen-studio/test/config/defaultConfigSchema.test.ts`
- `openspec/changes/projection-authoring-surface-alignment/`

## Forbidden Owners

- Hydrology truth ownership or discharge-driven river stamping.
- Ecology truth planning stages.
- Persisted raw projection `{ strategy, config }` wrappers.
- Persisted empty runtime step keys as user-facing controls.
- Persisted lake diagnostic/readback toggles.
- Compatibility shims, dual persisted shapes, or broad public exports.
- Generated source artifact hand edits.

## Public Surface

The projection public surface becomes:

- `map-morphology`: `knobs`
- `map-hydrology`: `knobs`
- `map-elevation`: `knobs`
- `map-rivers`: `knobs`, `riverProjection`
- `map-ecology`: `knobs`, `biomeBindings`

`riverProjection` owns the Civ7 river-model length thresholds that first-party
maps tune today. `biomeBindings` remains an accepted projection-level expert
surface because it maps pipeline biome symbols to official Civ7 biome globals
that affect engine fields, feature legality, and map gameplay. Empty projection
steps, lake readback, feature collision guards, and plot-effect application stay
recipe-owned internal defaults.

## Consumer Impact

Authors and Studio users no longer author projection stages through runtime step
keys such as `plot-coasts`, `lakes`, `build-elevation`, `plot-rivers`,
`plot-biomes`, `features-apply`, or `plot-effects`. First-party configs are
migrated to semantic keys and must still validate. Removed projection internals
fail strict validation as unknown keys.

## Stop Conditions

- Any projection public schema exposes raw `{ strategy, config }` envelopes.
- Any projection public schema exposes runtime step keys as public keys.
- Any projection public numeric leaf lacks both `minimum` and `maximum`.
- Any projection public string selector lacks enum/literal bounds.
- Any projection public field lacks author-facing schema documentation.
- Shipped configs or presets fail validation after migration.
- Migrated shipped configs compile to different stable projection output without
  a behavior-change proof record.

## Verification Gates

- Focused shipped config/schema tests.
- Projection compile tests that author config through semantic public keys.
- Studio generated schema/default tests.
- Stable compiled-config equivalence for shipped projection configs.
- Unknown-key tests for removed raw projection keys.
- OpenSpec validation.
- Peer-agent review and repair of accepted P1/P2 findings.
- `git diff --check`.
