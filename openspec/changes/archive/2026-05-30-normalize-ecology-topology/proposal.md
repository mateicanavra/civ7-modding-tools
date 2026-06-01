## Why

D5 resolves the recurring ecology question: Ecology should be multiple truth
stages only where input and handoff surfaces justify stage identity, with
`map-ecology` as projection only. Current feature-family wrappers and stale
ecology hubs risk exposing implementation variants as recipe topology.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`: D5,
  D5 Extension, Problem Layers 3 and 4, Domino 2, Guardrails G5-G7.
- `openspec/config.yaml`: Ecology truth stages are `ecology-pedology`,
  `ecology-biomes`, and `ecology-features`; `map-ecology` is projection only.
- `openspec/specs/mapgen-normalization-workstreams/spec.md`: ecology topology
  uses real stage surfaces and folded feature wrappers require output proof.

## What Changes

- Normalize recipe-level ecology truth stages to `ecology-pedology`,
  `ecology-biomes`, and `ecology-features`.
- Fold feature-family wrapper stages into `ecology-features` as steps or
  artifacts unless they gain real stage-level surfaces.
- Dissolve stale `stages/ecology/` hub code into real owners or explicit
  stage-neutral shared surfaces.
- Keep `map-ecology` projection/materialization only.
- Update configs, presets, Studio metadata, and docs affected by stage IDs.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mapgen-normalization-workstreams`: records D5 as a topology and colocation
  change with equivalence proof, not a catalog cleanup side-effect.

## Dependencies

- Requires: `normalize-config-surface`, `normalize-import-boundaries`.
- Enables parallel work: map-ecology projection audit, ecology guardrails
  G5-G7, and later evergreen docs promotion.

## Forbidden Non-Goals

- No one-stage `ecology` blob.
- No stage per feature family unless a stage-promotion trigger is named.
- No truth/scoring/planning work inside `map-ecology`.
- No lake, placement, resource, or discovery reconciliation behavior changes.
- No generated output hand edits.

## Impact

- Affected owners: standard recipe, ecology stages, ecology domain ops,
  ecology artifacts/contracts, Studio recipe metadata, config presets, docs.
- Expected write set:
  - `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology*/**`
  - ecology domain/artifact files needed by moved owners
  - configs and presets referencing ecology stage IDs
  - ecology tests/golden fixtures
  - `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
  - `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`
- Protected paths: D1 SDK migration, import guard scripts, hydrology lake
  behavior, placement implementation, generated outputs.
- Stop conditions:
  - output-equivalence cannot distinguish intentional topology move from
    behavior drift;
  - a feature family has a real product/config/projection contract that
    requires its own stage;
  - `map-ecology` currently owns truth work that must first be moved upstream.
- Verification gates:
  - golden or output-equivalence checks for feature plans, occupancy, and final
    projection inputs;
  - recipe/stage list tests;
  - docs/stage-list reconciliation;
  - `bun run openspec -- validate normalize-ecology-topology --strict`;
  - `bun run openspec:validate`;
  - `git diff --check`.
