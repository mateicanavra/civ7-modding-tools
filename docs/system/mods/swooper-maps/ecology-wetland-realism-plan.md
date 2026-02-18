# Wetland Realism Fix Plan (Physics Gates + Habitat-First Pipeline)

## Summary
Wetlands are currently over-claiming humid tiles because suitability is climate-heavy and family competition is mediated mostly by occupancy order.  
This plan fixes that by introducing a hard physical habitat regime and making wetlands/vegetation planners consume disjoint eligibility masks. Result: humid highlands stop becoming marsh/bog by default, and wet features only appear where geomorphology/hydrology supports them.

## Branch + Workflow Setup
1. Parent from stack tip: `codex/agent-H-resource-official-primary`.
2. Create branch: `dev-ecology-wetland-physics-habitat-partition`.
3. Create isolated worktree at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-dev-dev-ecology-wetland-physics-habitat-partition`.
4. Track branch in Graphite with parent `codex/agent-H-resource-official-primary`.
5. Keep one logical commit on this branch (or one additional layer only if scope must split).

## Implementation Design

### 1) Add a dedicated habitat eligibility artifact
Files:
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifact-validation.ts`

Add `FeatureEligibilityArtifactSchema` and `ecologyArtifacts.featureEligibility` with:
- `hydromorphicMask: Uint8Array`
- `wellDrainedMask: Uint8Array`
- `floodplainMask: Uint8Array`
- `intertidalCoastMask: Uint8Array`

Invariant:
- `hydromorphicMask` and `wellDrainedMask` are disjoint.
- `landMask == hydromorphicMask OR wellDrainedMask` for land tiles.

### 2) Extend feature substrate op to compute physical habitat masks
Files:
- `mods/mod-swooper-maps/src/domain/ecology/ops/compute-feature-substrate/contract.ts`
- `mods/mod-swooper-maps/src/domain/ecology/ops/compute-feature-substrate/strategies/default.ts`
- `mods/mod-swooper-maps/src/domain/ecology/ops/compute-feature-substrate/rules/*.ts`
- `mods/mod-swooper-maps/src/domain/ecology/ops/compute-feature-substrate/rules/index.ts`
- `mods/mod-swooper-maps/src/domain/ecology/ops/compute-feature-substrate/rules/validate.ts`

Input additions:
- `elevation`, `seaLevel`, `discharge`, `sinkMask` (all already available in pipeline artifacts).

Output additions:
- `floodplainMask`, `intertidalCoastMask`, `hydromorphicMask`, `wellDrainedMask`.

Hard-logic rules (no chance/penalty tuning):
- `floodplainMask`: near-river + lowland + meaningful flow signal.
- `intertidalCoastMask`: coastal land + low elevation above sea level.
- `hydromorphicMask`: floodplain OR lowland sink basin OR intertidal coast.
- `wellDrainedMask`: land and not hydromorphic.

### 3) Wire the new habitat artifact in `ecology-features-score`
Files:
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features-score/steps/score-layers/contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features-score/steps/score-layers/index.ts`

Changes:
- Feed new physical inputs into `computeFeatureSubstrate`.
- Publish `ecologyArtifacts.featureEligibility` from the score step.
- Keep score-layer publication unchanged for feature scores.

### 4) Add hard eligibility gates to wet score ops
Files:
- `mods/mod-swooper-maps/src/domain/ecology/ops/wet-score-marsh/contract.ts`
- `mods/mod-swooper-maps/src/domain/ecology/ops/wet-score-marsh/strategies/default.ts`
- `mods/mod-swooper-maps/src/domain/ecology/ops/wet-score-tundra-bog/contract.ts`
- `mods/mod-swooper-maps/src/domain/ecology/ops/wet-score-tundra-bog/strategies/default.ts`
- `mods/mod-swooper-maps/src/domain/ecology/ops/wet-score-mangrove/contract.ts`
- `mods/mod-swooper-maps/src/domain/ecology/ops/wet-score-mangrove/strategies/default.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features-score/steps/score-layers/index.ts`

Hard gates:
- Marsh: require `hydromorphicMask == 1`.
- Tundra bog: require `hydromorphicMask == 1` plus existing cold/freeze logic.
- Mangrove: require `intertidalCoastMask == 1`.

No new probabilistic terms; no output penalties.

### 5) Make planner competition habitat-partitioned by design
Files:
- `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-wetlands/contract.ts`
- `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-wetlands/strategies/default.ts`
- `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-vegetation/contract.ts`
- `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-vegetation/strategies/default.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-wetlands/steps/plan-wetlands/contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-wetlands/steps/plan-wetlands/index.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-vegetation/steps/plan-vegetation/contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-vegetation/steps/plan-vegetation/index.ts`

Planner input additions:
- Wet planner consumes `hydromorphicMask`.
- Vegetation planner consumes `wellDrainedMask`.

Planner behavior:
- Wet planner skips non-hydromorphic tiles.
- Vegetation planner skips non-well-drained tiles.
- Occupancy order no longer creates family dominance on overlapping humid tiles because overlap is removed by habitat classification.

### 6) Keep stage order stable unless needed
File:
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`

Default choice for this branch:
- Keep current stage ordering (`... reefs -> wetlands -> vegetation`) because disjoint eligibility masks remove ordering bias.
- Only reorder if tests show residual overlap artifacts.

## Important API/Contract Changes
1. `compute-feature-substrate` op input/output schema expands with physical fields + habitat masks.
2. New `ecologyArtifacts.featureEligibility` artifact and validator.
3. Wet score op contracts require habitat masks.
4. Wetland/vegetation planner contracts require eligibility masks.

No public gameplay surface change and no new external config knobs are introduced.

## Tests and Scenarios

### Unit tests
Files to add/update under `mods/mod-swooper-maps/test/ecology/`:
- New tests for `compute-feature-substrate` rules:
  - floodplain classification from river/discharge/lowland.
  - intertidal coast classification near sea level.
  - disjointness and coverage invariants for hydromorphic vs well-drained masks.
- Update wet score op tests:
  - marsh/bog/mangrove return zero when physical gate fails despite high climate suitability.

### Step tests
Update:
- `mods/mod-swooper-maps/test/ecology/wetlands-step.test.ts`
- `mods/mod-swooper-maps/test/ecology/vegetation-step.test.ts`

Add assertions that planners only claim tiles allowed by eligibility masks.

### Integration/smoke
Update or add:
- `mods/mod-swooper-maps/test/ecology/earthlike-balance-smoke.test.ts`
- New targeted scenario test for humid highlands:
  - humid, near-river, high-elevation tiles do not become marsh/bog.
  - lowland floodplain tiles still produce wetlands.
  - tropical low coastal tiles still produce mangroves.

### Static posture guard
Confirm `mods/mod-swooper-maps/test/ecology/no-fudging-static-scan.test.ts` still passes (no chance/penalty/multiplier style regressions).

## Verification Commands (implementation phase)
- `bun test mods/mod-swooper-maps/test/ecology/wetlands-step.test.ts`
- `bun test mods/mod-swooper-maps/test/ecology/vegetation-step.test.ts`
- `bun test mods/mod-swooper-maps/test/ecology/earthlike-balance-smoke.test.ts`
- `bun test mods/mod-swooper-maps/test/ecology/no-fudging-static-scan.test.ts`
- Repo-standard typecheck/build commands per existing scripts.

## Assumptions and Defaults
- Branch base is the stack tip `codex/agent-H-resource-official-primary`.
- Fix scope is this branch only: marsh/bog/mangrove realism and wet-vs-vegetation dominance.
- Oasis/watering-hole logic remains unchanged in this pass.
- Hard physical eligibility is preferred over output tuning knobs.
- Current untracked scratch path in this worktree is not touched by this implementation (work happens in a fresh isolated worktree).
