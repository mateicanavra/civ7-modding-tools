# Placement Realignment S6 — Inputs/Artifact Hygiene

## Why

Placement planning consumed engine state and shared buffers through
undeclared edges (diagnosis RC5; audit-register stage-anatomy +
inputs-artifacts lanes): the natural-wonder planning surface was a silent
per-tile engine readback (terrain/biome/feature), elevation came from the
undeclared `context.buffers.heightfield` edge, the recipe layer read
`globalThis.GameInfo.Resources` directly, plans were double-published
(embedded in `placementInputs` AND standalone), steps imported helpers
across step boundaries, several artifact reads existed only as ordering
tokens (read-and-discard) duplicating the effect-tag chain, placement was
the only stage with empty artifact validators, and `placementOutputs`
carried permanently-zero fields that the placement gate still checked.

## Target Authority Refs

- `docs/projects/placement-realignment/refactor-plan.md` (S6 scope)
- `docs/projects/placement-realignment/diagnosis.md` (RC5)
- `docs/projects/placement-realignment/evidence/audit-register.md`
  (stage-anatomy + inputs-artifacts lanes; every bypass cited file:line)
- `docs/system/ADR.md` ADR-009 (readbacks evidence-only; declared
  engine-surface reads tracked for S6)
- `.agents/skills/civ7-architecture-authority/references/ownership-boundaries.md`
  (per-file `artifacts/contract/` normalization)

## What Changes

1. **Wonder planning surface from artifacts/fields, one declared readback.**
   `derive-placement-inputs` no longer does a silent full-surface engine
   readback. Per-field disposition (decision-logged below): BIOME is
   reconstructed from the ecology `biomeBindings.engineBiomeId` projection
   artifact (exactly what plot-biomes stamped); FEATURE comes from the
   declared `field:featureType` dependency (the features projection step now
   reifies the engine feature surface unconditionally); TERRAIN remains an
   engine read but as a DECLARED readback in the step contract with an
   ADR-009 note (mirroring the S5-declared resource legality surface read).
2. **Elevation via the topography artifact.** Wonder/discovery planning and
   the wonder plan-input telemetry consume `topography.elevation` (the
   published artifact handle) instead of `context.buffers.heightfield`
   directly. The terminal placement step's physics-buffer read is kept and
   DECLARED in its contract docstring: the physics-vs-engine comparison is
   that step's product (waterDriftCount parity evidence).
3. **GameInfo via the adapter.** New `EngineAdapter.getResourceCatalog()`
   (live: GameInfo.Resources behind the adapter; mock: static policy-table
   catalog). `readRuntimeResourceCatalog` and its `globalThis` read are
   deleted from the recipe layer; resource telemetry takes the catalog as an
   argument.
4. **Single-publish + no cross-step reach-ins + tags carry ordering.**
   `placementInputs` no longer embeds the natural-wonder/discovery plans
   (each plan is published once by its owning step); `buildPlacementPlanInput`
   and the `normalizeNaturalWonderStampingStats` cross-step imports are
   deleted (consumers read validated artifacts). Ordering-only artifact
   reads are removed in favor of the existing effect tags:
   place-discoveries↛startAssignment, assign-advanced-starts↛
   discoveryPlacementOutcomes, assign-starts↛placementSurfacePreparation,
   place-resources↛placementSurfacePreparation, prepare-placement-surface↛
   naturalWonderPlacement.
5. **Validators everywhere.** Every placement-stage artifact now has an
   `implementArtifacts` validate hook (S3/S4/S5 covered the resource/start
   artifacts): placementInputs, naturalWonderPlan, discoveryPlan,
   naturalWonderPlacement, discoveryPlacementOutcomes,
   advancedStartAssignment, placementSurfacePreparation,
   placementSurfaceValidationBoundary, projectionMeta,
   landmassRegionSlotByTile, placementOutputs, engineState,
   placementEngineTerrainSnapshot. Hooks check cheap cross-field invariants
   (count reconciliation, digest/row agreement, grid partitions, full-grid
   buffer lengths), not full recompute.
6. **Per-file artifact contracts.** The placement stage `artifacts.ts`
   multi-artifact collection is split into
   `stages/placement/artifacts/contract/<artifact>.contract.ts` (one
   `defineArtifact` per file); `artifacts.ts` only assembles the stage
   consumer surface.
7. **placementOutputs honesty.** `floodplainsCount`/`snowTilesCount`
   (hardcoded 0) and `methodCalls` (never produced) are REMOVED from the
   schema, the publish site, and the `engine.placementApplied` gate check —
   removing fake fields instead of faking measurement.

## Decision Log

- **Wonder-surface field dispositions (item 1):**
  - `biomeType` → RECONSTRUCTED from `ecology.biomeBindings.engineBiomeId`.
    plot-biomes stamps exactly this array and nothing rebinds biomes before
    placement planning, so the artifact IS the engine biome surface
    (verified value-identical: wonder plans bit-identical across the
    5-seed harness window).
  - `featureType` → DECLARED FIELD (`field:featureType`). The features
    projection step owns the reify (engine readback captured once, after
    `validateAndFixTerrain`, at the projecting step); placement consumes the
    field as a declared dependency instead of a per-tile adapter loop.
    `features-apply` now reifies unconditionally so the field is trustworthy
    even in the degenerate zero-features case (previously it stayed
    all-zeros, which would alias feature index 0).
  - `terrainType` → DECLARED READBACK (kept, declared). Terrain is the one
    field with no artifact equivalent: `validateAndFixTerrain` runs inside
    the features projection step and applies engine-only terrain
    maintenance (e.g. coast materialization) after every artifact-published
    terrain intent, so an offline reconstruction would diverge from what
    the stamp-time engine oracle sees — the exact failure mode ADR-009's
    declared-read clause exists for. Declared in the step contract
    docstring + a named `readDeclaredEngineTerrainSurface` helper,
    consistent with plan-resources' S5-declared legality surface read.
- **Wonder plan-input telemetry readbacks stay.** The per-tile
  terrain/biome/feature digests in `NATURAL_WONDER_PLAN_INPUT_V1` are
  evidence-only readbacks (earthlike live-parity proof surface); S6 fixes
  readback-as-planning-truth, not readback-as-evidence. Its elevation rows
  now come from the topography artifact (same buffer handle, no undeclared
  edge).
- **Terminal parity buffer read declared, not removed.** In
  `placement/apply.ts` reading `context.buffers.heightfield.landMask` IS
  the point (physics side of the physics-vs-engine waterDriftCount
  comparison); it is declared in the step contract docstring as an ADR-009
  evidence read. The topography artifact carries the same publish-once
  buffer handle, so there is no data difference — the declaration is the
  fix.
- **GameInfo.Ages read left in domain policy (out of cited scope).**
  `resolveActiveResourceAge` (domain/resources/policy/initial-map-authoring.ts)
  reads `globalThis.Game/GameInfo.Ages` with a safe offline default
  (AGE_ANTIQUITY). The cited bypass was `readRuntimeResourceCatalog` only;
  routing age resolution through the adapter changes a domain-policy
  signature chain and is deferred (recorded here, not silently skipped).
- **Mock resource catalog now non-empty.** `getResourceCatalog()` on the
  mock serves the policy-table id→RESOURCE_* map, so RESOURCE_PLACEMENT_V1
  telemetry now also logs on mock runs (previously live-only because the
  GameInfo read returned empty offline). This is evidence-only output; the
  metrics harness already redirects pipeline logs to stderr.
- **placementOutputs fields removed, not measured.** floodplains/snow counts
  have no placement-owned source of truth (floodplains are an ecology
  feature intent; snow is a plot effect) and `methodCalls` was a dead
  schema field; their only consumer was the `isPlacementOutputSatisfied`
  `>= 0` check (tags.ts), which validated nothing. Removed fields + gate
  rows; the gate still checks the measured counts and the
  startsAssigned >= expectedPlayers floor.
- **Artifact-contract normalization applied to the stage collection.** The
  ownership-boundaries layout heading scopes to domain modules, but its
  artifacts/contract clause generalizes ("applies to every
  artifact-contract collection: do not grow multi-artifact artifacts.ts
  files") and S5's decision log explicitly deferred this collection's split
  to S6. `artifacts.ts` remains as the stage assembly (the consumer import
  surface used by tags.ts and diagnostics), with zero `defineArtifact`
  calls of its own.
- **placement-gating test untouched.** It proves engine fail-fast mechanics
  with synthetic tags by design; the real placement topology is enforced by
  the placement-contracts order-encoding test, which this slice updates for
  the removed ordering-only artifact requires.

## Known Limits / Open Items (recorded, not faked)

- **Live biome/feature drift window.** If a live engine's
  `validateAndFixTerrain` ever rebinds biomes or strips features between
  the ecology projection and placement planning, the reconstructed
  biome/field surfaces would lag the engine while the declared terrain
  readback would not. Mock maintenance does neither; Milestone B's live
  full-grid parity run is the measurement hook.
- **Terrain readback reconstruction.** Eliminating the declared terrain
  readback would require an artifact carrying the post-maintenance terrain
  surface (e.g. a features-apply boundary snapshot); tracked as a candidate
  follow-up, not claimed here.
