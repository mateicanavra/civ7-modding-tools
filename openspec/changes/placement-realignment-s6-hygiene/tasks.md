# Tasks — Placement Realignment S6 (Inputs/Artifact Hygiene)

## 1. Wonder planning surface (RC5 cited bypass: inputs.ts readEngineSurface)

- [x] 1.1 Biome surface reconstructed from `ecology.biomeBindings.engineBiomeId`
  (artifact required by the derive contract; no readback).
- [x] 1.2 Feature surface from the declared `field:featureType` dependency;
  `features-apply` reifies the engine feature field unconditionally.
- [x] 1.3 Terrain kept as a DECLARED readback: contract docstring + named
  `readDeclaredEngineTerrainSurface` helper with ADR-009 rationale
  (engine-only `validateAndFixTerrain` side effects), consistent with the
  S5-declared resource legality surface read.
- [x] 1.4 Per-field disposition decision-logged in the proposal.

## 2. Elevation via topography artifact (cited: inputs.ts:186,207; apply.ts:109-117)

- [x] 2.1 Wonder + discovery planning consume `topography.elevation`.
- [x] 2.2 Wonder plan-input telemetry rows/digests consume
  `topography.elevation` (evidence surface unchanged: same buffer handle).
- [x] 2.3 Terminal placement physics-buffer parity read DECLARED in the step
  contract docstring (the comparison is the product), not removed.

## 3. GameInfo via adapter (cited: place-resources readRuntimeResourceCatalog)

- [x] 3.1 `EngineAdapter.getResourceCatalog()` added (types + live + mock);
  live reads GameInfo.Resources behind the adapter; mock serves the policy
  table catalog.
- [x] 3.2 `readRuntimeResourceCatalog` deleted from the recipe layer;
  telemetry takes the catalog argument from `context.adapter`.

## 4. Single-publish + reach-ins + ordering tags (cited: derive index.ts:54-60 etc.)

- [x] 4.1 `placementInputs` slimmed: natural-wonder/discovery plans no longer
  embedded; each plan published once by derive-placement-inputs.
- [x] 4.2 `buildPlacementPlanInput` deleted; assign-starts and
  place-natural-wonders read `placementInputs.starts`/`.wonders` directly.
- [x] 4.3 `normalizeNaturalWonderStampingStats` cross-step imports removed
  from prepare-placement-surface and the terminal placement step (artifact
  validated at publish; consumers read it as-is).
- [x] 4.4 Ordering-only artifact reads deleted (tags already carry the
  chain): place-discoveries→startAssignment, assign-advanced-starts→
  discoveryPlacementOutcomes, assign-starts→placementSurfacePreparation,
  place-resources→placementSurfacePreparation, prepare-placement-surface→
  naturalWonderPlacement.

## 5. Validators for every placement artifact

- [x] 5.1 derive-placement-inputs: placementInputs, naturalWonderPlan,
  discoveryPlan.
- [x] 5.2 place-natural-wonders: naturalWonderPlacement (count/digest/row
  reconciliation).
- [x] 5.3 place-discoveries: discoveryPlacementOutcomes (summary↔rows, typed
  reasons).
- [x] 5.4 assign-advanced-starts: advancedStartAssignment.
- [x] 5.5 prepare-placement-surface: placementSurfacePreparation (slot
  partition, drift ≤ accepted) + placementSurfaceValidationBoundary
  (full-grid boundary snapshots).
- [x] 5.6 plot-landmass-regions: projectionMeta (topology locks) +
  landmassRegionSlotByTile (slot domain).
- [x] 5.7 terminal placement: placementOutputs, engineState (grid partition,
  planned≥placed), placementEngineTerrainSnapshot (full-grid buffers).

## 6. Per-file artifact contracts

- [x] 6.1 15 placement artifact contracts split into
  `stages/placement/artifacts/contract/<artifact>.contract.ts` (one
  `defineArtifact` per file); `artifacts.ts` is assembly-only.

## 7. placementOutputs honesty

- [x] 7.1 floodplainsCount/snowTilesCount/methodCalls removed from schema +
  publish site; `isPlacementOutputSatisfied` gate rows removed (tags.ts);
  consumers audited (no other readers).

## 8. Verification

- [x] 8.1 `bun run verify:placement-metrics -- --seed 1337 --seeds 5 --size
  standard --json /tmp/pm-s6.json` vs S5 baseline (same HEAD recompute):
  metrics identical (see evidence doc).
- [x] 8.2 `bun --cwd mods/mod-swooper-maps test` green;
  `bun run --cwd mods/mod-swooper-maps check` clean;
  `bun run verify:placement-catalogs` green.
- [x] 8.3 `openspec validate --all` passes.

## 9. Docs

- [x] 9.1 Evidence doc
  `docs/projects/placement-realignment/evidence/s6-results-2026-06-10.md`
  (per-item disposition table + metric comparison).
