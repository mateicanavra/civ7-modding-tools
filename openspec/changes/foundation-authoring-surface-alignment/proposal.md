# Proposal: Foundation Authoring Surface Alignment

## Summary

Convert the standard recipe Foundation stage from a public raw step/op envelope
surface to semantic authoring groups that compile deterministically into the
same internal step/op configs. Migrate first-party shipped map configs in the
same slice, regenerate owned map artifacts, and add schema, Studio, compile, and
unknown-key proof.

This slice is intended to be behavior-equivalent for shipped configs. It changes
the persisted authoring surface shape, not the generated Foundation behavior.

## Authority

- `docs/projects/standard-recipe-authoring-surface/PROJECT.md`
- `docs/projects/standard-recipe-authoring-surface/taxonomy-and-slices.md`
- `openspec/changes/authoring-surface-corpus-and-taxonomy/`
- `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-032-recipe-config-authoring-surface.md`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`
- `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`
- `openspec/changes/mapgen-public-config-boundary/`
- `openspec/changes/studio-public-config-contract/`

## Requires

- Corpus/taxonomy slice committed below this branch.
- Existing standard recipe compile and validation paths.
- Generated Studio recipe artifacts from `build:studio-recipes`.

## Affected Owners

- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/`
- `mods/mod-swooper-maps/src/maps/configs/`
- `mods/mod-swooper-maps/src/maps/generated/`
- `mods/mod-swooper-maps/test/config/`
- `mods/mod-swooper-maps/test/standard-compile-errors.test.ts`
- `apps/mapgen-studio/src/ui/data/defaultConfig.ts`
- `apps/mapgen-studio/test/config/defaultConfigSchema.test.ts`
- `docs/projects/standard-recipe-authoring-surface/`
- `openspec/changes/foundation-authoring-surface-alignment/`

## Forbidden Owners

- Runtime Foundation domain algorithms.
- Projection/topology runtime implementations.
- Compatibility shims or dual persisted config shapes.
- Hand edits to generated dist artifacts.

## Public Surface

Foundation keeps the flat stage shape and now exposes:

- `knobs`
- `meshResolution`
- `mantleSources`
- `mantleForcing`
- `lithosphere`
- `platePartition`
- `plateMotion`
- `tectonicSegmentation`
- `tectonicEras`
- `tectonicFields`
- `tectonicRollups`

The former public raw step keys (`mesh`, `mantle-potential`, `mantle-forcing`,
`crust`, `plate-graph`, `plate-motion`, `tectonics`, `crust-evolution`,
`projection`, `plate-topology`) are not accepted in Foundation public config.
`projection`, topology, and empty maintenance ops remain internal/defaulted.

## Migration

First-party shipped map configs are migrated from raw step/op envelopes to the
semantic public groups in this same slice. Removed legacy fields intentionally
fail strict validation instead of being silently accepted.

## Consumer Impact

Authors and Studio users see semantic Foundation groups instead of step/op
envelopes with `{ strategy, config }`. Runtime compile still receives the
internal step/op config shape it expects.

## Stop Conditions

- Foundation public schema still exposes raw `{ strategy, config }`.
- A shipped config or preset no longer validates.
- Migrated shipped configs compile to different internal Foundation config
  without an explicit behavior-change proof record.
- Generated Studio/default artifacts expose old Foundation step keys.
- OpenSpec or focused schema tests fail.

## Verification Gates

- Focused MapGen config/schema/compile tests.
- Studio default schema test.
- Generated map artifact regeneration via `build:studio-recipes`.
- Stable compiled-config equivalence for shipped map Foundation configs.
- OpenSpec validation.
- `git diff --check`.
