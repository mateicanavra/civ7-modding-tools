# Evidence Memo: D06r Event Mechanics + Force Emission

## Summary

- The current Foundation implementation already computes a segment-centric boundary representation (`artifact:foundation.tectonicSegments`) with regime, polarity, intensities, and a drift vector. This is sufficient to seed a typed event model without inventing new upstream inputs.
- The current tectonic history op emits era fields by diffusing segment seed intensities into mesh cells (`buildEraFields`), but it has no explicit event semantics; this blocks causal provenance updates and any "destroy vs accrete" story at convergent margins.
- Current Morphology consumers are driven entirely by tile projections of force fields (`upliftPotential`, `riftPotential`, `boundaryType`, `volcanism`); a hybrid "events emit fields" posture preserves these consumption paths while making event causality and provenance mandatory.

## Pointers (Current Contract / Truth)

- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`
- Segment topology + intensities + drift:
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/contract.ts`
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/index.ts`
- Era fields + rollups (3-era implementation today):
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts`
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts`
- Projection dependency (tile consumers read these fields):
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts`

## Pointers (Morphology Consumers of Force Fields)

- Base landmass/topography coupling:
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.ts` (consumes `upliftPotential`, `riftPotential`, `boundaryType`, `boundaryCloseness`)
- Volcano planning coupling:
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/volcanoes.ts` (consumes `volcanism`, `boundaryType`, `boundaryCloseness`)
- Coastline ruggedness coupling:
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/ruggedCoasts.ts` (consumes `boundaryType`, `boundaryCloseness`)

## Pointers (Maximal Posture Dependencies)

- Mandatory dual history outputs (eras + provenance):
- `docs/projects/pipeline-realism/resources/spec/sections/history-and-provenance.md`
- Morphology-first contract for era + provenance consumption:
- `docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md`
- Mantle forcing substrate (source of intraplate events and regime coupling):
- `docs/projects/pipeline-realism/resources/spec/sections/mantle-forcing.md`

## Implication For D06r

D06r defines a typed event layer whose outputs are:
- deterministic per-era events (the causal surface)
- emitted era fields (the consumable surface)
- provenance updates (the audit surface)

This aligns with the existing contract posture in `FOUNDATION.md` and preserves current Morphology consumption while enabling the maximal provenance and belt continuity requirements.
