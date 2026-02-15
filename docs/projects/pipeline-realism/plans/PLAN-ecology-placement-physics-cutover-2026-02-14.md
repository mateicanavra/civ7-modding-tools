# PLAN: Physics-First Ecology + Placement Remediation (No Fudge, No Random, Full Drift Visibility)

## Summary
We will run a hard cutover across `ecology`, `map-ecology`, `map-hydrology`, and `placement` so pipeline physics truth becomes canonical and engine calls become projection only.
The rollout is slice-based, worker-agent driven, interface-breaking by design, and ends with no legacy shims/dual paths in scope.

Locked defaults from this planning session:
1. Scope: `Ecology+Placement first`.
2. Drift policy: `Observe first` (telemetry/viz first, then fail-hard once deterministic cutover lands).
3. Existing local change safety: leave `mods/mod-swooper-maps/src/domain/morphology/ops/compute-sea-level/rules/index.ts` untouched.

## Non-Negotiable Standards
1. No random generation in the scoped surfaces after cutover.
2. No penalty/bonus/bandpass/ramp-gate composition in ecology scoring/planning.
3. Pipeline artifacts are source of truth; engine state is projection evidence only.
4. No compatibility dual-path retained at end of each merged slice.
5. Every interface break updates all producers, consumers, tests, and docs in the same slice.

## Implementation Start Sequence (must happen first when we switch to implementation)
1. Create isolated worktree from `codex/MAMBO-elevation-post-hydrology-lifecycle`.
2. Create branch `codex/prr-ecology-placement-physics-cutover`.
3. Write this plan first to `docs/projects/pipeline-realism/plans/PLAN-ecology-placement-physics-cutover-2026-02-14.md`.
4. Create orchestrator scratchpad `docs/projects/pipeline-realism/scratch/ecology-placement-physics-cutover/SCRATCH-orchestrator.md`.
5. Create worker scratchpads:
- `docs/projects/pipeline-realism/scratch/ecology-placement-physics-cutover/SCRATCH-worker-ecology-algorithms.md`
- `docs/projects/pipeline-realism/scratch/ecology-placement-physics-cutover/SCRATCH-worker-hydrology-lakes.md`
- `docs/projects/pipeline-realism/scratch/ecology-placement-physics-cutover/SCRATCH-worker-placement-resources.md`
- `docs/projects/pipeline-realism/scratch/ecology-placement-physics-cutover/SCRATCH-worker-observability.md`
- `docs/projects/pipeline-realism/scratch/ecology-placement-physics-cutover/SCRATCH-worker-verification-docs.md`

## Worker-Agent Orchestration Model
1. Orchestrator owns slice boundaries, dependency ordering, and final no-legacy sweeps.
2. Worker A owns ecology algorithm cutover.
3. Worker B owns hydrology lake determinism and map-hydrology projection cutover.
4. Worker C owns placement deterministic planning/stamping (resources, then wonders/discoveries).
5. Worker D owns drift instrumentation, trace/viz parity layers, and effect/artifact wiring.
6. Worker E owns test matrix, realism metrics scripts, and docs/ADR updates.
7. Each worker commits only on its assigned slice branch; no cross-slice edits without orchestrator reassign.

## Slice Plan (execution order)

### Slice S0: Plan Capture + Branch Stack Bootstrap
Branch: `codex/prr-epp-s0-plan-bootstrap`
Owner: Orchestrator
Changes:
1. Add plan doc + scratchpad scaffolding.
2. Add slice ledger to orchestrator scratchpad with handoff checklist template.
Exit criteria:
1. Plan committed as first branch change.
2. Scratchpads exist and are linked in plan doc.

### Slice S1: Drift Instrumentation (Observe-First)
Branch: `codex/prr-epp-s1-drift-observability`
Owner: Worker D
Changes:
1. Add parity diagnostics artifacts/effects and wire contracts:
- `mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/artifacts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
2. Emit trace + viz drift layers at each risk hook:
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/plotRivers.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/index.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts`
3. Enforce observe-first behavior:
- log and publish drift diagnostics;
- do not fail on drift yet except existing hard errors.
Exit criteria:
1. Every engine projection step emits machine-readable parity artifact + viz layer.
2. Seed run produces full drift report without schema/contract failures.

### Slice S2: Ecology Algorithm Purge (Physics Surface Cutover)
Branch: `codex/prr-epp-s2-ecology-physics-cutover`
Owner: Worker A
Changes:
1. Replace ecology scoring model with physics surface model, remove ad-hoc gates:
- `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/layers/classify.ts`
- `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/rules/aridity.ts`
- `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/rules/vegetation.ts`
- `mods/mod-swooper-maps/src/domain/ecology/ops/score-shared/index.ts`
- all `vegetation-score-*`, `wet-score-*`, `reef-score-*`, `ice-score-*` strategy files under `mods/mod-swooper-maps/src/domain/ecology/ops/`
2. Remove `minScore01` gating and random tie-breaking from feature planners:
- `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-vegetation/`
- `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-wetlands/`
- `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-reefs/`
- `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-ice/`
3. Deterministic tie-break policy:
- tie order = higher physical confidence, then lower stress, then lower tile index.
- no RNG calls allowed in these planners.
Exit criteria:
1. No ecology `bandpass`, `rampUp`, `rampDown`, `bonus`, `penalty`, or `minScore` logic remains.
2. No RNG import/use remains in scoped ecology planners.
3. Biome/feature distributions come from physical fields only.

### Slice S3: Hydrology-Derived Deterministic Lakes
Branch: `codex/prr-epp-s3-lakes-deterministic`
Owner: Worker B
Changes:
1. Add deterministic lake planning op from hydrography truth (sink/outlet/basin fill):
- new op under `mods/mod-swooper-maps/src/domain/hydrology/ops/plan-lakes/`
- publish `artifact:hydrology.lakePlan` in `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/artifacts.ts`
2. Replace engine random lakes in map stage:
- remove `adapter.generateLakes(...)` call from `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.ts`
- deterministically stamp planned lake tiles via terrain writes + cache refresh (`recalculateAreas`, `storeWaterData`)
3. Remove lake-frequency fudge:
- remove `lakeiness` knob and `tilesPerLakeMultiplier` contract path from `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/index.ts` and `lakes.contract.ts`
Exit criteria:
1. Lake placement is fully derived from hydrology artifacts.
2. No random lake generation call remains.
3. Lake parity telemetry reports only projection drift, not generation authority drift.

### Slice S4: Deterministic Resource Planning + Stamping
Branch: `codex/prr-epp-s4-resources-deterministic`
Owner: Worker C
Changes:
1. Add placement resource planner op and schema:
- new `placement/plan-resources` under `mods/mod-swooper-maps/src/domain/placement/ops/`
- extend `mods/mod-swooper-maps/src/recipes/standard/stages/placement/placement-inputs.ts`
- add `artifact:placement.resourcePlan` in `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts.ts`
2. Break adapter interface and implement deterministic resource IO:
- update `packages/civ7-adapter/src/types.ts`
- update `packages/civ7-adapter/src/civ7-adapter.ts`
- update `packages/civ7-adapter/src/mock-adapter.ts`
- new required methods: `getResourceType`, `setResourceType`, `canHaveResource`
3. Replace engine generator call:
- remove `adapter.generateResources(width, height)` from `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts`
- stamp resource plan deterministically and publish real counts in `placementOutputs`.
Exit criteria:
1. `generateResources` is no longer used.
2. Resource counts are computed from stamped placements, not placeholders.
3. Resource placement is deterministic and reproducible per seed/config.

### Slice S5: Deterministic Wonders + Discoveries + Remaining Placement Randomness
Branch: `codex/prr-epp-s5-placement-randomness-zero`
Owner: Worker C
Changes:
1. Add deterministic planners:
- `placement/plan-natural-wonders`
- `placement/plan-discoveries`
2. Break adapter interface for deterministic stamping:
- add explicit wonder/discovery placement methods in adapter interface and implementations.
3. Remove remaining random engine calls in placement apply:
- remove `addNaturalWonders` generator-style usage;
- remove `generateDiscoveries` generator-style usage;
- stamp deterministic plans directly.
Exit criteria:
1. No random generation call remains in placement stage.
2. Wonders/discoveries are deterministic and physics/geography-scored.
3. All downstream consumers updated to new artifacts.

### Slice S6: Hardening, No-Legacy Sweep, Fail-Hard Drift Policy
Branch: `codex/prr-epp-s6-hardening-docs-tests`
Owner: Worker E + Orchestrator
Changes:
1. Remove dead contracts/knobs/config keys from staged cutovers.
2. Convert observe-first drift checks to fail-hard for true contract mismatches.
3. Final no-legacy static scans:
- extend `mods/mod-swooper-maps/test/ecology/no-fudging-static-scan.test.ts`
- add placement/hydrology randomness scans.
4. Docs and ADR updates:
- `docs/system/mods/swooper-maps/architecture.md`
- `docs/system/mods/swooper-maps/vision.md`
- `docs/system/TESTING.md`
- `docs/projects/pipeline-realism/resources/spec/sections/validation-and-observability.md`
- `docs/projects/pipeline-realism/plans/README.md`
- add ADR in `docs/system/mods/swooper-maps/adrs/`
Exit criteria:
1. No legacy dual-path code remains in scoped surfaces.
2. Drift policy is strict for contract-truth violations.
3. Docs/spec/tests all align with new contracts.

## Important Public API / Interface / Type Changes
1. `EngineAdapter` will break in `packages/civ7-adapter/src/types.ts`.
2. `generateLakes` and `generateResources` are removed from active generation paths and deprecated/removed from interface by final slice.
3. New required resource IO methods: `getResourceType`, `setResourceType`, `canHaveResource`.
4. New required deterministic wonder/discovery stamp methods.
5. Placement artifacts/contracts expand with deterministic plans and real output accounting.
6. Hydrology artifacts expand with deterministic lake plan.
7. Tag/effect catalog expands for parity capture; then hardens to fail-fast contracts.

## Test Cases and Scenarios (must pass per slice gate)

1. Determinism and replay:
- update `mods/mod-swooper-maps/test/pipeline/determinism-suite.test.ts`
- add `mods/mod-swooper-maps/test/pipeline/trace-replay.test.ts`

2. Drift parity:
- add stage parity tests for morphology/hydrology/ecology/placement artifacts and viz emissions.
- assert parity artifacts exist and contain non-empty diagnostics per stage.

3. Ecology realism:
- update/add ecology tests under `mods/mod-swooper-maps/test/ecology/`
- enforce no-fudge static scan includes banned constructs and banned RNG usage in scoped ecology files.

4. Lakes:
- update `mods/mod-swooper-maps/test/map-hydrology/lakes-area-recalc-resources.test.ts`
- update `mods/mod-swooper-maps/test/map-hydrology/lakes-store-water-data.test.ts`
- add deterministic lake-plan contract test and sink/outlet consistency test.

5. Resources and placement:
- update `mods/mod-swooper-maps/test/placement/resources-landmass-region-restamp.test.ts`
- add deterministic resource-plan stamping tests and resource-count parity tests.
- add deterministic wonders/discoveries tests once slice S5 lands.

6. Metrics gate:
- add `mods/mod-swooper-maps/test/pipeline/seed-matrix-stats.test.ts`
- add `mods/mod-swooper-maps/test/pipeline/earth-metrics.test.ts`
- add diagnostics helper scripts under `mods/mod-swooper-maps/src/dev/diagnostics/` for automated metric extraction.

## Acceptance Criteria (program-level)
1. Biomes, vegetation, lakes, and resources are deterministic for a given seed/config.
2. No scoped random generation calls remain in production stage execution.
3. No scoped fudge-style score composition remains in ecology planners/scorers.
4. Pipeline truth artifacts fully drive decisions; engine state is projection evidence.
5. Drift is observable at all handoff hooks and fail-hard where contract truth must hold.
6. All affected docs/tests/contracts are updated in lockstep.
7. Repo remains clean between slices (one logical change per Graphite branch).

## Assumptions and Defaults
1. We keep the existing unexpected local change in `compute-sea-level` untouched throughout this program.
2. Foundation/morphology randomness outside ecology+placement is deferred to the next epic, but all randomness inside ecology+placement scope is eliminated in this program.
3. During S1 we only observe drift; hard-fail thresholds are enabled in S6 after deterministic cutover.
4. We do not retain legacy compatibility paths after each final merged slice.
