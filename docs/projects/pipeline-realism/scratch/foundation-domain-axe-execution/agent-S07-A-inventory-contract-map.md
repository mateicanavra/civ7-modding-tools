# Agent S07-A — Inventory + Contract Map (M4-004 lane split)

## What I changed (paths)
- Produced an exhaustive consumer + docs inventory for the lane split (no code edits).

## Why it matches rails
- Keeps the cutover atomic: enumerates every consumer that must move in the same slice to avoid any dual publish / fallback reads.
- Preserves truth vs projection: only *projection* artifacts move to `artifact:map.foundation*`; truth artifacts remain `artifact:foundation.*`.

## Proof (commands run + results)
- Used `$narsil-mcp` for cross-repo semantic search (avoided `hybrid_search`).
- Follow-up enforcement is via `rg` “no legacy ids remain” scans (see checklist).

## Checklist (consumer inventory)
### Artifact IDs to hard-cut (projection-only)
- `artifact:foundation.plates` → `artifact:map.foundationPlates`
- `artifact:foundation.tileToCellIndex` → `artifact:map.foundationTileToCellIndex`
- `artifact:foundation.crustTiles` → `artifact:map.foundationCrustTiles`
- `artifact:foundation.tectonicHistoryTiles` → `artifact:map.foundationTectonicHistoryTiles`
- `artifact:foundation.tectonicProvenanceTiles` → `artifact:map.foundationTectonicProvenanceTiles`

### Code touchpoints (must be rewired in S07)
- Core tag constants: `packages/mapgen-core/src/core/types.ts` (the 5 `FOUNDATION_*_ARTIFACT_TAG` values)
- Artifact registry removal: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (remove the 5 projection artifacts from `foundationArtifacts`; keep schema exports for reuse)
- Publisher step (projection): `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts`
- Intra-foundation consumer: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.contract.ts` (+ runtime consumer in `plateTopology.ts`)
- Morphology consumers + contracts:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts` (+ runtime consumer in `landmassPlates.ts`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/islands.contract.ts` (+ runtime consumer in `islands.ts`)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes.contract.ts` (+ runtime consumer in `volcanoes.ts`)

### Tests + guardrails that must flip to `mapArtifacts.foundation*`
- `mods/mod-swooper-maps/test/pipeline/artifacts.test.ts`
- `mods/mod-swooper-maps/test/pipeline/foundation-gates.test.ts`
- `mods/mod-swooper-maps/test/foundation/contract-guard.test.ts`
- `mods/mod-swooper-maps/test/morphology/contract-guard.test.ts`
- `mods/mod-swooper-maps/test/pipeline/mountains-nonzero-probe.test.ts`
- `mods/mod-swooper-maps/test/standard-run.test.ts`
- Harness/invariants:
  - `mods/mod-swooper-maps/test/support/validation-harness.ts`
  - `mods/mod-swooper-maps/test/support/foundation-invariants.ts`

### Docs that become stale after S07 (update now if they’re linted / relied on)
- Canonical domain refs:
  - `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`
  - `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`
- Project spec docs likely containing old ids:
  - `docs/projects/pipeline-realism/resources/spec/artifact-catalog.md`
  - `docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md`
  - `docs/projects/pipeline-realism/resources/spec/sections/validation-and-observability.md`
- Policy/spec references worth aligning (if they include explicit id examples):
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
  - `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`

## Open risks / follow-ups
- Ensure doc-lint/CI doesn’t fail due to stale `artifact:foundation.*` mentions in spec docs outside the code scan scope; run `rg` across `docs/` and patch as needed.
- Ensure the “no legacy ids remain” scan includes `docs/` once S07 is committed (or explicitly defer to S09 with a tracked checklist).
