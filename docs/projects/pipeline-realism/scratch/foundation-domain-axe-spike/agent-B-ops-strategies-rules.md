# Agent B — Operation Decomposition / Strategies / Rules

## Axis Ownership
Break mega-ops into coherent smaller ops and define strategy/rules factoring, with emphasis on:
- `compute-tectonic-history`,
- op orchestration within steps,
- eliminating op-calls-op composition smells.

## Deliverables
1. Decomposition map for major Foundation ops.
2. Proposed op catalog (ids/kinds, boundaries, sequencing assumptions).
3. Strategy and rule module factoring model per decomposed op.

## Working Notes (append-only)
- 

## Proposed target model
- 

## Breaking-change inventory
- 

## Open risks
- 

## Decision asks for orchestrator
- 

### 2026-02-14 — Agent B decomposition pass

#### Evidence snapshot
- The modeling rules are explicit that steps orchestrate and ops stay atomic/internal (steps call ops; strategies/rules stay internal; avoid mega-ops). [evidence: docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:25, docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:30, docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:136, docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:139]
- The Foundation spike already locks "atomic ops" + "no op-calls-op" as an invariant. [evidence: docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/foundation/spike-foundation-modeling.md:267, docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/foundation/spike-foundation-modeling.md:466]
- `compute-tectonic-history` is materially monolithic (1563 LOC) and currently calls another op (`computeTectonicSegments.run`) inside op runtime. [evidence: mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1, mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1184, mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1192]
- Inference: `compute-tectonic-history` accepts `input.segments` by contract/step wiring but recomputes per-era segments internally with default config; this means provided segments are not driving history behavior. [evidence: mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts:206, mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:74, mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1184]
- Step wiring is currently mostly one-op-per-step except `tectonics`; we can keep step boundaries and still move composition into steps without stage explosion. [evidence: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mesh.contract.ts:15, mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateMotion.contract.ts:16, mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts:27, mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:771]
- Other large ops with mixed concerns: `compute-plate-graph` (seed planning + partition assignment), `compute-plate-motion` (fit + diagnostics), `compute-plates-tensors` delegating to a large projection function. [evidence: mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts:341, mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts:544, mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-motion/index.ts:121, mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-motion/index.ts:192, mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/index.ts:45, mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts:75]
- `compute-crust-evolution` exposes strategy knobs in contract but runtime currently ignores config (`_config`), so factoring should make config meaning explicit or remove it. [evidence: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts:14, mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:63]

#### Decomposition map (current -> target)
- `foundation/compute-tectonic-history` -> split into:
  - `foundation/compute-era-plate-membership` (derive `plateIdByEra`)
  - `foundation/compute-segment-events` (convert segment tensors -> tectonic event stream)
  - `foundation/compute-hotspot-events` (intraplate forcing events)
  - `foundation/compute-era-tectonic-fields` (diffuse events to per-era fields)
  - `foundation/compute-tectonic-history-rollups` (totals/fractions/last-era indices)
  - `foundation/compute-tectonics-current` (newest-era snapshot + cumulative uplift)
  - `foundation/compute-tracer-advection` (era tracer index transport)
  - `foundation/compute-tectonic-provenance` (origin/last-boundary/crustAge updates)
  - Rationale: separates kinematics history, event semantics, field synthesis, and provenance state transitions currently interleaved in one op. [evidence: mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:225, mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:458, mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:972, mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1231, mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1414]
- `foundation/compute-plate-graph` -> split into:
  - `foundation/plan-plate-seeds` (role/kind/seed selection + polar lock plan)
  - `foundation/compute-plate-membership` (weighted region growth assignment)
  - Rationale: seed policy and partition algorithm are distinct responsibilities with different config pressure. [evidence: mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts:341, mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts:517, mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts:549]
- `foundation/compute-plate-motion` -> split into:
  - `foundation/compute-plate-motion-fit` (center/velocity/omega)
  - `foundation/score-plate-motion-fit` (RMS/P90/quality diagnostics)
  - Rationale: fit and scoring are separable compute vs score concerns. [evidence: mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-motion/index.ts:116, mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-motion/index.ts:138, mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-motion/index.ts:192]
- `foundation/compute-crust-evolution` -> split into:
  - `foundation/compute-crust-state-evolution` (maturity/thickness/thermalAge/damage)
  - `foundation/compute-crust-derived-fields` (type/age/buoyancy/baseElevation/strength)
  - Rationale: separates time integration state from deterministic projection/derivation. [evidence: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:77, mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:140, mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:148]
- `foundation/compute-plates-tensors` -> split into:
  - `foundation/compute-tile-to-cell-index`
  - `foundation/project-crust-tiles`
  - `foundation/project-tectonic-history-tiles`
  - `foundation/project-tectonic-provenance-tiles`
  - `foundation/project-plates-tiles`
  - Rationale: projection sub-products already have independent schemas/artifacts and can be tested independently. [evidence: mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/contract.ts:340, mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts:770, mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts:775, mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts:780, mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts:785, mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts:820]

#### Step weaving proposal (no op-calls-op)
- Keep current stage step boundaries for initial migration stability: `mesh -> mantle-potential -> mantle-forcing -> crust -> plate-graph -> plate-motion -> tectonics -> crust-evolution -> projection -> plate-topology`. [evidence: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:771]
- `tectonics` step should become the explicit orchestrator for era loops:
  - call `compute-era-plate-membership` once,
  - for each era: call `compute-tectonic-segments` with era membership, then `compute-segment-events`, `compute-hotspot-events`, `compute-era-tectonic-fields`,
  - after loop: call rollup/current/provenance ops,
  - publish `tectonicSegments`, `tectonicHistory`, `tectonicProvenance`, `tectonics`.
  - This removes op-internal op calls while preserving artifact contract boundaries. [evidence: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts:20, mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:55, mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1184]
- `plate-graph` step should orchestrate `plan-plate-seeds -> compute-plate-membership` and then publish existing `foundationPlateGraph` shape.
- `plate-motion` step should orchestrate `compute-plate-motion-fit -> score-plate-motion-fit` and publish existing artifact shape.
- `projection` step should orchestrate mapping first (`compute-tile-to-cell-index`) then parallel-safe projections (`project-*` ops) before publishing existing artifact set. [evidence: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts:21]

#### Strategy/rules factoring model (per decomposed op family)
- General rule:
  - Default to a single `default` strategy per new op first.
  - Add strategy variants only when algorithmic variants preserve exact I/O shape.
  - Keep micro-heuristics in op-local `rules/**` (not exported to steps). [evidence: docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:75, docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:77, docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:243]
- `compute-era-plate-membership`
  - strategy: `advected-voronoi` (current behavior)
  - rules: `computeMeanEdgeLen`, `findNearestCell`, `seedPlateCellsForEra`, `growPlateVoronoi`
- `compute-segment-events`
  - strategy: `regime-intensity` (current behavior)
  - rules: `inferConvergenceMode`, `deriveEventIntensities`, `deriveEventOriginPlate`, `buildSeedCells`
- `compute-era-tectonic-fields`
  - strategy: `diffusive-belts`
  - rules: `deriveEmissionParams`, `driftSeedCells`, `diffuseEventInfluence`, `pickBoundaryTypeByChannel`
- `compute-tectonic-history-rollups`
  - strategy: `u8-rollup`
  - rules: `sumEraChannel`, `computeRecentFraction`, `computeLastActiveEra`
- `compute-tracer-advection`
  - strategy: `neighbor-greedy-backtrace`
  - rules: `chooseDriftNeighbor`, `mixBoundaryAndMantleDrift`
- `compute-tectonic-provenance`
  - strategy: `threshold-reset`
  - rules: `deriveResetThreshold`, `propagateProvenanceByTrace`, `applyRiftReset`, `applyArcReset`, `applyHotspotReset`, `deriveCrustAge`
- `plan-plate-seeds`
  - strategy: `polar-caps-v1`
  - rules: `buildPolarEligibilityMasks`, `pickExtremeYCell`, `pickSeedCell`, `lockContiguousRegion`
- `compute-plate-membership`
  - strategy: `weighted-region-growth`
  - rules: `computeCellResistance`, `growAssignments`
- `compute-plate-motion-fit`
  - strategy: `weighted-rigid-fit`
  - rules: `smoothForcing`, `accumulatePlateMoments`, `fitOmegaWithClamp`
- `score-plate-motion-fit`
  - strategy: `histogram-p90`
  - rules: `computeResiduals`, `buildLogHistogram`, `deriveQualityByte`
- `compute-crust-state-evolution`
  - strategy: `history-integrated-v1`
  - rules: `integrateEraSignals`, `applyRiftRecycle`, `accumulateDamage`
- `compute-crust-derived-fields`
  - strategy: `isostatic-proxy-v1`
  - rules: `deriveTypeFromMaturity`, `deriveBuoyancy`, `deriveStrength`
- projection family
  - strategies: `nearest-cell` mapping + `direct-sample` projection variants
  - rules: `nearestMeshCellForTile`, `computeBoundaryDistanceField`, `sampleHistoryEra`, `sampleProvenance`

#### Candidate target op catalog (ids/kinds + rough I/O boundaries)
| id | kind | rough input boundary | rough output boundary |
|---|---|---|---|
| `foundation/compute-mesh` | `compute` | `{ width,height,rngSeed } + mesh config` | `{ mesh }` |
| `foundation/compute-mantle-potential` | `compute` | `{ mesh,rngSeed } + source/potential config` | `{ mantlePotential }` |
| `foundation/compute-mantle-forcing` | `compute` | `{ mesh,mantlePotential } + forcing config` | `{ mantleForcing }` |
| `foundation/compute-crust` | `compute` | `{ mesh,mantleForcing,rngSeed } + lithosphere config` | `{ crustInit }` |
| `foundation/plan-plate-seeds` | `plan` | `{ mesh,crust,rngSeed } + plate/polar config` | `{ platesMeta,seedCells,lockedPlateId,allowedMasks }` |
| `foundation/compute-plate-membership` | `compute` | `{ mesh,crust,seedPlan }` | `{ cellToPlate }` |
| `foundation/compute-plate-graph` | `compute` | `{ seedPlan,cellToPlate }` | `{ plateGraph }` |
| `foundation/compute-plate-motion-fit` | `compute` | `{ mesh,plateGraph,mantleForcing } + fit config` | `{ centers,velocities,omega,cellResidual }` |
| `foundation/score-plate-motion-fit` | `score` | `{ plateFit,cellResidual,plateGraph } + scoring config` | `{ plateFitRms,plateFitP90,plateQuality,cellFitError }` |
| `foundation/compute-tectonic-segments` | `compute` | `{ mesh,crust,plateGraphLike,plateMotion } + segment config` | `{ segments }` |
| `foundation/compute-era-plate-membership` | `compute` | `{ mesh,plateGraph,plateMotion } + era drift config` | `{ plateIdByEra }` |
| `foundation/compute-segment-events` | `compute` | `{ mesh,crust,segments }` | `{ events }` |
| `foundation/compute-hotspot-events` | `compute` | `{ mesh,mantleForcing,eraPlateId }` | `{ hotspotEvents }` |
| `foundation/compute-era-tectonic-fields` | `compute` | `{ mesh,events } + emission/weight config` | `{ eraFields }` |
| `foundation/compute-tectonic-history-rollups` | `compute` | `{ eras,activityThreshold }` | `{ upliftTotal,collisionTotal,subductionTotal,fractureTotal,volcanismTotal,recentFractions,last*Era }` |
| `foundation/compute-tectonics-current` | `compute` | `{ newestEra,rollups }` | `{ tectonics }` |
| `foundation/compute-tracer-advection` | `compute` | `{ mesh,eras,mantleForcing,stepsPerEra }` | `{ tracerIndex }` |
| `foundation/compute-tectonic-provenance` | `compute` | `{ mesh,eras,tracerIndex,plateGraph } + threshold config` | `{ tectonicProvenance }` |
| `foundation/compute-crust-state-evolution` | `compute` | `{ crustInit,tectonics,tectonicHistory,tectonicProvenance } + evolution config` | `{ maturity,thickness,thermalAge,damage }` |
| `foundation/compute-crust-derived-fields` | `compute` | `{ crustState }` | `{ type,age,buoyancy,baseElevation,strength }` |
| `foundation/compute-tile-to-cell-index` | `compute` | `{ width,height,mesh }` | `{ tileToCellIndex }` |
| `foundation/project-crust-tiles` | `compute` | `{ crust,tileToCellIndex }` | `{ crustTiles }` |
| `foundation/project-tectonic-history-tiles` | `compute` | `{ tectonicHistory,plateMotion,tileToCellIndex }` | `{ tectonicHistoryTiles }` |
| `foundation/project-tectonic-provenance-tiles` | `compute` | `{ tectonicProvenance,plateGraph,tileToCellIndex }` | `{ tectonicProvenanceTiles }` |
| `foundation/project-plates-tiles` | `compute` | `{ plateGraph,plateMotion,tectonics,tileToCellIndex } + boundary projection config` | `{ plates }` |
| `foundation/compute-plate-topology` | `compute` | `{ plates.id,width,height }` | `{ plateTopology }` |

## Proposed target model
- Keep Foundation stage step boundaries stable in phase-1 decomposition, but convert heavy steps into explicit multi-op orchestrators (especially `tectonics`, `projection`, `plate-motion`, `plate-graph`). [evidence: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:771]
- Remove op-internal composition by extracting `compute-tectonic-history` into eight focused ops and moving all sequencing to `tectonics` step runtime.
- Preserve external artifact contracts during decomposition (`foundation.tectonicSegments`, `foundation.tectonicHistory`, `foundation.tectonicProvenance`, `foundation.tectonics`, projection artifacts) while replacing the internal op graph.
- Use strict strategy/rules layering for each decomposed op:
  - strategy = algorithm variant with stable I/O,
  - rules = small internal decision units,
  - no step imports from rules/strategies directly. [evidence: docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:26, docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:27]

## Breaking-change inventory
- Op id and config surface breaks (internal): introducing new op ids around tectonic history, plate graph, plate motion, and projection decomposition; step contracts need remapping of `ops` bindings. [evidence: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts:26]
- Behavior break (likely intentional): tectonic history should stop recomputing segments with `computeTectonicSegments.defaultConfig`; it should consume step-orchestrated segment computation per era.
- Potential behavior break: making `compute-crust-evolution` config meaningful (or deleting dead knobs) changes outputs because current runtime ignores these knobs. [evidence: mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts:63]
- Stage compile config break: `foundation.index.ts` currently emits monolithic `computeTectonicHistory` config; decomposition introduces nested op configs and likely new defaults. [evidence: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:748]
- Test/tooling break: validators and fixtures currently expect current artifact pathways; new intermediate ops imply additional unit targets and updated integration assertions. [evidence: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts:499]

## Open risks
- Determinism drift risk if era loop sequencing or RNG label boundaries change during extraction (especially if any per-era randomized behavior is introduced later).
- Performance risk from per-era segment recomputation now made explicit at step level; could increase runtime cost unless cached/memoized across adjacent eras.
- Semantic risk in provenance resets if threshold calibration logic is split incorrectly across ops (resets currently depend on era-local maxima + event types). [evidence: mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1372]
- Integration risk with visualization because `tectonics` step currently assumes one combined `historyResult`; decomposition needs a stable compose point before viz dumping. [evidence: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:83]

## Decision asks for orchestrator
- Decide whether decomposition lands as:
  - A) single-step internal refactor (keep step list unchanged), or
  - B) additional intermediate steps for tectonic era simulation/provenance.
- Decide policy for `segments` truth in history:
  - A) step-owned per-era segment recomputation (recommended), or
  - B) keep internal recomputation behavior (conflicts with no-op-calls-op posture).
- Decide whether to preserve current artifact contracts exactly during first cut, or allow additive intermediate artifacts for debug/test leverage.
- Decide fate of dead `compute-crust-evolution` strategy knobs:
  - A) activate and honor them,
  - B) remove from contract.
- Decide whether `plate-topology` remains step-local (`buildPlateTopology`) or becomes a domain op to align with op-per-concern posture. [evidence: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.ts:52]

### 2026-02-14 — Parseability Addendum (YAML)

```yaml
decomposition_map:
  compute_tectonic_history:
    target_ops:
      - foundation/compute-era-plate-membership
      - foundation/compute-segment-events
      - foundation/compute-hotspot-events
      - foundation/compute-era-tectonic-fields
      - foundation/compute-tectonic-history-rollups
      - foundation/compute-tectonics-current
      - foundation/compute-tracer-advection
      - foundation/compute-tectonic-provenance
    evidence_paths:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:225
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:458
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:972
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts:1414
  compute_plate_graph:
    target_ops:
      - foundation/plan-plate-seeds
      - foundation/compute-plate-membership
    evidence_paths:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts:341
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts:549
  compute_plate_motion:
    target_ops:
      - foundation/compute-plate-motion-fit
      - foundation/score-plate-motion-fit
    evidence_paths:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-motion/index.ts:116
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-motion/index.ts:192
  compute_plates_tensors:
    target_ops:
      - foundation/compute-tile-to-cell-index
      - foundation/project-crust-tiles
      - foundation/project-tectonic-history-tiles
      - foundation/project-tectonic-provenance-tiles
      - foundation/project-plates-tiles
    evidence_paths:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/contract.ts:340
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/index.ts:45
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts:75

step_orchestration_shift:
  tectonics_step_orchestrates_ops:
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:55
    - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts:20
  no_op_calls_op_policy:
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:25
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:30
    - docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/foundation/spike-foundation-modeling.md:466

strategy_rules_factoring:
  rule: strategies_keep_io_stable_rules_hold_micro_policies
  evidence_paths:
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:75
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:77
    - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:243
```
