# SPIKE: Ecology + Placement Runtime Divergence (Biome/Vegetation/Resources/Lakes/Relief)

Date: 2026-02-14
Project: pipeline-realism
Type: Exploratory spike (diagnosis only; no production code changes)

## 1) Objective

Understand why gameplay outcomes appear badly broken (biome selection/diversity, vegetation presence, resource placement, lake elevation behavior, and overall relief/flatness) while visualization can still look plausible.

This is not an implementation plan; this is a shape-and-boundaries diagnosis of the current pipeline and runtime handoff behavior.

## 2) Assumptions and Unknowns

### Assumptions used to proceed

- `narsil-mcp` indexing represents the primary worktree only.
- `hybrid_search` is avoided due instability/freeze behavior; investigation used non-hybrid `narsil-mcp` tools and direct code reads.
- Reported symptoms are runtime/gameplay-first; visualization parity is not assumed.
- Base stack context during spike: `codex/MAMBO-elevation-post-hydrology-lifecycle` (top of active ecology-related stack at time of investigation).

### Unknowns that remain

- Exact rejection reasons and counts for engine-side placement failures on real gameplay seeds (features/resources).
- Whether certain presets/sizes/seeds cross threshold cliffs and magnify the failures.
- Which failures are silent due catch-and-continue behavior and therefore under-observed.

### Why these unknowns matter now

They directly affect remediation ordering. If we tune thresholds before instrumenting runtime rejection causes, we risk masking the core runtime-vs-artifact drift.

## 3) What We Learned

This section preserves the original spike conclusions and expands with full evidence and nuance from each axis.

### High-level synthesis

- The dominant pattern is **runtime divergence**: artifacts/viz often represent one truth, while Civ runtime outcomes can differ materially after engine-owned steps.
- Several failures are likely additive: climate/biome thresholding, binding collapse, hard gating in feature apply, and resource eligibility gates.
- The current test suite catches many invariants but still has runtime blind spots due mock-adapter behavior and missing rejection-path assertions.

### A. Climate -> Biomes -> Vegetation chain

Core finding:
- Climate signals are produced and consumed in the expected order, but thresholding/normalization and aridity shifting can collapse ecological diversity and reduce vegetation suitability heavily.

Evidence path:
- Climate baseline publishes climate field: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/steps/climateBaseline.ts`
- Climate refine publishes indices (`effectiveMoisture`, `surfaceTemperatureC`, `aridityIndex`, `freezeIndex`): `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/steps/climateRefine.ts`
- Biome classification consumes those indices: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts`
- Feature score and vegetation planning consume derived substrate/scores: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features-score/steps/score-layers/index.ts`, `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-vegetation/steps/plan-vegetation/index.ts`

Detail:
- `computeVegetationSubstrate` normalizes moisture by `moistureNormalization` (default effectively ~`190 + 40 = 230`), and all vegetation scoring depends on this `water01` signal.
- `scoreVegetationForest` applies `bandpass(water, 0.35, 0.8, 0.1)`. Tiles below `water01 ~ 0.35` (roughly `effectiveMoisture < ~80`) collapse toward near-zero suitability.
- Aridity is computed as `pet / (pet + rainfall + 1)` and then used to shift moisture-zone buckets (`[0.45, 0.7]` thresholds), pushing many tiles toward semiarid/arid outcomes.
- Density penalties stack later (`density -= aridityIndex * vegetationPenalty`), compounding low vegetation outcomes.

Implication:
- Even with climate fields present, downstream score gates can produce sparse vegetation and reduced biome diversity.

### B. Biome symbol -> engine biome binding collapse

Core finding:
- Engine-facing biome binding can compress cold classes into tundra-like outcomes.

Evidence path:
- Binding map: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-biomes/helpers/engine-bindings.ts`
- Earthlike config also reflects cold collapse behavior in map config/preset files:
  - `mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json`
  - `mods/mod-swooper-maps/src/presets/earthlike/...` (preset variants)

Detail:
- `snow`, `tundra`, and `boreal` map into the same engine biome class (`BIOME_TUNDRA`) in defaults/config.

Implication:
- Even if classification truth has differentiation upstream, runtime biome identity can appear compressed, matching reports of large tundra swaths and low diversity.

### C. Feature application hard gates and abort behavior

Core finding:
- `features-apply` can reject or abort when collisions or engine eligibility checks fail, causing planned/viz features to disappear in gameplay.

Evidence path:
- Apply logic + rejects/throws: `mods/mod-swooper-maps/src/domain/ecology/ops/features-apply/strategies/default.ts`
- Map-stage application orchestration: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/index.ts`
- Contract dependencies: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts`

Detail:
- The apply step consumes all feature-intent families and checks engine gate `adapter.canHaveFeature(...)` before stamping.
- Collisions (`maxPerTile`/merge constraints) and `canHaveFeature=false` can produce rejection samples and fail/abort paths.
- Stage split means missing one intent artifact can break the apply stage chain.

Implication:
- Viz may show planned intents while runtime shows sparse/empty feature outcomes if apply rejects or aborts.

### D. Placement/resources: engine delegation and landmass region gating

Core finding:
- Resource generation is delegated to engine and can silently yield zero when landmass region IDs are default/none or when upstream placement prerequisites are missing.

Evidence path:
- Placement apply: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts`
- Placement inputs/contracts:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/derive-placement-inputs/inputs.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/derive-placement-inputs/contract.ts`
- Landmass projection step: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/plot-landmass-regions/index.ts`
- Civ resource gate: `.civ7/outputs/resources/Base/modules/base-standard/maps/resource-generator.js`

Detail:
- `applyPlacementPlan` restamps landmass regions then calls `adapter.generateResources(width,height)`.
- Civ resource logic checks landmass-region eligibility; default/none-like region IDs are ineligible.
- If slot projection degrades to none/default or required upstream effects are missing, resources can be zero in gameplay.
- In `apply.ts`, resource generation is wrapped in catch-and-continue behavior (trace/log path), which can reduce visibility of hard failures.

Implication:
- “Resources don’t show up at all” can happen even when placement stage appears to run in viz/test flows.

### E. Lakes and elevation parity

Core finding:
- Engine lake generation does not consume hydrology sink/outlet truth; post-hydrology engine mutations are not fully reconciled back into hydrology artifacts.

Evidence path:
- Lakes step: `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.ts`
- Rivers modeling step: `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/plotRivers.ts`
- Hydrography sink/outlet derivation: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/steps/rivers.ts`

Detail:
- Hydrology computes sink/outlet/discharge from morphology-derived elevation truth.
- `generateLakes(...)` is engine-owned and not constrained by those sink/outlet artifacts.
- Subsequent terrain/water mutations (rivers/lakes/fixes) are not round-tripped into canonical hydrography artifacts for downstream consumers.

Implication:
- Lake height/drainage mismatches can appear in gameplay relative to hydrology truth and viz artifacts.

### F. Flatness perception and morphology -> runtime projection

Core finding:
- Rich morphology elevation can be collapsed when runtime rebuilds elevation from discrete terrain classes.

Evidence path:
- Topography truth generation: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.ts`
- Terrain stamping: `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains.ts`
- Runtime rebuild: `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.ts`

Detail:
- Morphology artifacts encode continuous elevation intent.
- Runtime eventually calls engine `buildElevation()` after terrain classification, which can smooth/coarsen relief.

Implication:
- Gameplay map can feel flatter than morphology visualization suggests.

### G. Test signal observed during spike

Command run (targeted non-mutating tests during investigation):
- `bun test test/ecology test/placement test/map-hydrology/lakes-area-recalc-resources.test.ts test/map-hydrology/lakes-store-water-data.test.ts` (in `mods/mod-swooper-maps`)

Observed:
- `57` pass, `1` fail.
- Failure in `test/ecology/ecology-baseline-fixtures.test.ts` due fingerprint mismatch across ecology artifacts.

Interpretation:
- Most targeted behavioral tests pass, but this does not invalidate gameplay failures; it highlights a runtime-coverage gap versus mock/viz-friendly test paths.

## 4) Potential Shapes

If pursued, two conceptual shapes emerged:

1. Runtime-reconciled pipeline (recommended first)
- Keep engine generation paths for now.
- Add deterministic reconciliation: after engine-mutating steps, publish/refresh canonical artifacts from runtime outcomes.
- Promote rejection telemetry to first-class diagnostics.

2. Deterministic truth-first pipeline
- Shift more generation decisions from engine calls to deterministic domain ops.
- Use engine as projection executor of prevalidated plans.

Why shape 1 first:
- Lower risk.
- Fastest path to isolate root-cause buckets with hard evidence.
- Avoids premature architecture rewrite before runtime diagnostics are trustworthy.

## 5) Minimal Experiment (Optional)

Smallest experiments to validate/invalidate leading hypotheses:

1. Runtime rejection telemetry experiment
- Capture per-seed counters and sampled reasons for:
  - `canHaveFeature=false`
  - feature collision/merge rejects
  - resource ineligibility due landmass-region default/none

2. Landmass region integrity experiment
- For fixed seeds, snapshot `landmassRegionSlotByTile` and runtime landmass-region IDs immediately before `generateResources`.
- Validate non-default coverage versus resource placements.

3. Hydrology-lake parity experiment
- Compare hydrology sink/outlet masks with final runtime lake tiles.
- Quantify off-mask placement rate.

4. Relief parity experiment
- Compare morphology elevation distribution versus post-`buildElevation` runtime distribution for the same seeds.

## 6) Risks and Open Questions

- Silent catch-and-continue paths can hide fatal conditions in runtime stages.
- Mock adapters likely under-represent engine gate strictness.
- Some thresholds may be brittle across map sizes and seed distributions.
- Runtime engine scripts may impose constraints not reflected in deterministic artifacts.

Key decisions required before remediation planning:
- Telemetry-first (instrument/reconcile then tune) vs tuning-first.
- Which boundaries become contractually required for artifact-runtime parity checks.
- Which regressions become hard fail versus warning-only in CI and runtime diagnostics.

## 7) Next Steps

If continuing from this spike:

1. Promote to remediation planning in slices (worker-agent executable).
2. Start with telemetry/reconciliation slices before broad retuning.
3. Add seed-matrix acceptance criteria for biome diversity, vegetation applied count, resource count, lake parity, and relief variance.
4. Keep runtime-vs-viz parity checks as explicit gate criteria for each slice.

---

## Appendix A: Directly Confirmed Root-Cause Candidates (ranked)

### High confidence

- Biome cold-class collapse in engine binding/config (`snow/tundra/boreal -> tundra`).
- Resource no-show when landmass region IDs are default/none at engine generation point.
- Lakes generated without hydrology sink/outlet constraints.

### Medium confidence

- Vegetation near-zero due moisture normalization + score gate cliffs + aridity penalties.
- Feature apply failures from `canHaveFeature` and collision paths causing runtime sparse outcomes.
- Flatness due continuous morphology elevation compressed by terrain-class projection + engine rebuild.

## Appendix B: Scratchpad (multi-agent condensed)

- Climate chain is structurally present and ordered; issue appears parameter/gating + runtime handoff, not missing stage execution.
- `features-apply` strictness and `canHaveFeature` are likely runtime amplifiers that viz does not emulate.
- Placement depends on upstream effects; missing effects can skip resource generation entirely.
- Hydrology artifacts can go stale relative to runtime terrain/water after engine mutation steps.

## Appendix C: “So What”

This is not one isolated bug. It is a boundary-management problem across ecology/hydrology/placement and engine projection.

The highest-leverage path is to stabilize truth boundaries (instrument, reconcile, assert parity), then tune ecology parameters on top of reliable runtime evidence. Tuning first risks chasing noise.
