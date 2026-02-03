# Evidence Memo: D07r Morphology Consumption Contract

## Summary

- Foundation already publishes **era-resolved tectonic history** (`artifact:foundation.tectonicHistory`) and **segment topology** (`artifact:foundation.tectonicSegments`), but Morphology consumes only tile projections (`foundation.plates`, `foundation.crustTiles`).
- The accepted ADR for era-tagged Morphology explicitly endorses **single-pass physics + analytic era signals**, including **provenance metadata** for deterministic traceability.
- The D04 decision packet frames history as **Eulerian era fields + optional bounded tracer history**, which is the minimal provenance surface Morphology can consume without multi-pass physics.

## Pointers (Foundation truth + projections)

- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (era fields + rollups; `tectonicSegments` continuity source; `foundation.plates` + `foundation.crustTiles` tile projections)

## Pointers (Morphology contract + consumption)

- `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md` (requires `foundation.plates` + `foundation.crustTiles`; tile-first truth)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.contract.ts` (current recipe wiring)

## Pointers (Era + provenance posture)

- `docs/system/libs/mapgen/adrs/adr-001-era-tagged-morphology.md` (single-pass physics; provenance payload pattern)
- `docs/projects/pipeline-realism/resources/decisions/d04-evolution-semantics-history-model.md` (Eulerian era fields + bounded tracer)

## Implication for D07r

A Morphology-first contract that **requires era projections + provenance/tracer signals** is the direct continuation of D04 + ADR-001. It also aligns with the existing contract shape in `FOUNDATION.md` without forcing Morphology to consume mesh truth directly.

## Mapping to current code (anchors)

- Era fields + rollups: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts`
- Segment topology: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/contract.ts`
- Current consumption: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.contract.ts`
- Validation guard: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts` (`eraCount !== 3`)

## Observability hooks already present

- Morphology tracing smoke test: `mods/mod-swooper-maps/test/morphology/tracing-observability-smoke.test.ts`
- Trace + viz posture: `docs/system/libs/mapgen/reference/OBSERVABILITY.md`

These anchors support tightening Morphology’s input contract with **era + provenance fields** and validating belt continuity + diffusion invariants via trace/viz.
