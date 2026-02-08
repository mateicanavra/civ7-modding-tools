# Agent D: Upstream Compatibility (Pipeline-Realism Stack Tip vs Ecology Base)

## Objective

Ensure the Ecology refactor plan does not mis-specify contracts due to upstream changes in Foundation/Morphology in the current pipeline-realism stack tip.

You are comparing:
- Base: `agent-ORCH-feasibility-ecology-arch-alignment` (SHA recorded in `00-plan.md`)
- Tip: current pipeline-realism stack tip branch (see `gt ls` in primary checkout; likely `agent-GOBI-PRR-*`)

This is plan hardening, not implementation.

## Deliverable (write here)

1. Identify **upstream artifacts** Ecology depends on (from `CONTRACT-MATRIX.md` / `CONTRACTS.md`).
2. For each upstream dependency:
   - what changed on the stack tip vs base (IDs, schema fields, semantics)
   - whether the Ecology plan needs adjustments
3. Provide a concrete patch list for the M2 doc:
   - what assumptions to update
   - what issues/gates to add
   - any prework prompts required if tip is still moving

## Starting Pointers

Ecology upstream deps:
- `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/CONTRACT-MATRIX.md`

Likely upstream artifact definitions:
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-*/artifacts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/*` (if morphology depends)

Recommended diff command (committed changes only):
- `git diff <base>..<tip> -- <path>`

## Constraints

- Do not reindex Narsil MCP.
- Avoid ADRs as primary references.

## Findings (Resolved, Evidence-Backed)

### Branch + SHA grounding

- Ecology plan base (Phase 3 worktree base): `15ea01ba01a56a85a4fecd384dd7860eea0582e2`
  - from `agent-ORCH-feasibility-ecology-arch-alignment` (see `00-plan.md`)
- Pipeline-realism stack tip (checked): `agent-GOBI-PRR-s124-viz-mountains-regression-guard`
  - SHA: `910d122210be4799f211816eff68e0460f763f9f`

### What Ecology depends on (upstream)

From `$SPIKE/CONTRACT-MATRIX.md`, Ecology truth steps require:
- `artifact:morphology.topography`
- `artifact:hydrology.climateField`
- `artifact:hydrology.cryosphere`
- `artifact:hydrology.hydrography`

### Observed deltas vs tip

Diffed files (base..tip):
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/artifacts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/artifacts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/artifacts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
- compiler semantics:
  - `packages/mapgen-core/src/compiler/recipe-compile.ts`
  - `packages/mapgen-core/src/compiler/normalize.ts`
  - `packages/mapgen-core/src/authoring/step/contract.ts`

Result:
- Only `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts.ts` differed.
  - Change: `MorphologyBeltDriversArtifactSchema` gained new fields:
    - `collisionPotential`, `subductionPotential`, `beltAge`, `dominantEra`
  - Evidence: `git diff 15ea01ba0..910d12221 -- mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts.ts`
- Ecology does **not** depend on belt drivers; it depends on `artifact:morphology.topography`.
  - Therefore: no required plan changes for Ecology inputs as of this tip.

### Required M2 doc edits

- Add an upstream compatibility section grounded to base SHA + tip branch+SHA.
- Add a prework prompt to re-run this diff immediately before execution begins (tip may move).
