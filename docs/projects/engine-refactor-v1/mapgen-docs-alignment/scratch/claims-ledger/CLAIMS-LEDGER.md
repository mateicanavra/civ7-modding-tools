<toc>
  <item id="purpose" title="Purpose"/>
  <item id="authority" title="Authority model"/>
  <item id="schema" title="Row schema"/>
  <item id="ledger" title="Claims ledger"/>
  <item id="queue" title="Patch queue"/>
</toc>

# Claims ledger — MapGen canonical docs

## Purpose

This ledger is the single place to record **every claim** in canonical MapGen docs that might be:
- interpretive,
- target-architecture prescriptive,
- or drift-prone.

The goal is to separate **what is** (code) from **what should be** (target modeling/specs) without inventing new architecture.

## Authority model

This ledger follows the authority model from:
- `docs/projects/engine-refactor-v1/mapgen-docs-alignment/SLICE-12A-CLAIMS-AUDIT-DIRECTIVE.md`

## Row schema

Columns:

- `claimId`
- `docPath`
- `quotedClaim`
- `claimType`
- `state` (CURRENT-CORRECT / TARGET-CORRECT / CURRENT-DRIFT / TARGET-DRIFT / CONFLICT / OPEN-QUESTION)
- `anchors` (paths; include at least one)
- `recommendedEdit`
- `notes`

## Claims ledger

| claimId | docPath | quotedClaim | claimType | state | anchors | recommendedEdit | notes |
|---|---|---|---|---|---|---|---|
| seed-000 | `docs/system/libs/mapgen/reference/RUN-SETTINGS.md` | “Docs should prefer **RunSettings** as the concept…” | naming | TARGET-DRIFT | `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/04-type-surfaces.md`, `packages/mapgen-core/src/core/env.ts` | Treat `Env` as canonical. Reframe “RunSettings” as a legacy spec name (if referenced at all). | Seed row resolved: target spec indicates runtime envelope is `Env`. |
| seed-001 | `docs/system/libs/mapgen/reference/domains/NARRATIVE.md` | “Narrative is the target-canonical domain intended to encode “story overlays”…“ | ownership | TARGET-DRIFT | `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/gameplay/APPENDIX-SCOPE-AND-ABSORPTION.md`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md` | Reframe as “Gameplay-owned narrative/playability” (absorption posture). Keep any pipeline-stage naming notes as “current wiring” only. | Seed row resolved: target posture is Gameplay absorbs Narrative. |
| seed-002 | `docs/system/libs/mapgen/reference/domains/PLACEMENT.md` | “Placement is the pipeline boundary where “map content” becomes “gameplay outcomes”…“ | ownership | TARGET-DRIFT | `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/gameplay/APPENDIX-SCOPE-AND-ABSORPTION.md` | Reframe as Gameplay stage/phase (placement is legacy naming); avoid presenting Placement as a target-canonical MapGen domain. | Seed row to force early review. |
| A-ENV-002 | `docs/system/libs/mapgen/reference/RUN-SETTINGS.md` | “Target naming is: `type RunRequest = { recipe: Recipe; settings: RunSettings };`” | naming | TARGET-DRIFT | `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/04-type-surfaces.md` | Replace target snippet with `RunRequest = { recipe, env }` and add a short “legacy naming” note (older specs used RunSettings/settings). | Avoid implying a rename-back migration. |
| A-OBS-001 | `docs/system/libs/mapgen/reference/OBSERVABILITY.md` | “Run reproducibility is rooted in the run settings (`RunSettings`, `Env` today)…“ | naming | TARGET-DRIFT | `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/04-type-surfaces.md`, `packages/mapgen-core/src/core/env.ts` | Replace with “Env (legacy docs: RunSettings)”. | P1: removes confusion before examples land. |
| A-GLO-001 | `docs/system/libs/mapgen/reference/GLOSSARY.md` | “Target **RunSettings** vs current code **Env**.” | naming | TARGET-DRIFT | `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/04-type-surfaces.md` | Replace drift pair with “Legacy specs: RunSettings → Canonical: Env”. | Target docs already moved to Env for compiler architecture. |
| B-NARR-002 | `docs/system/libs/mapgen/reference/domains/NARRATIVE.md` | “Narrative is **not** included as a stage.” | behavior | CURRENT-CORRECT | `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` | None (keep). | Keep as “current wiring” signal after posture reframe. |
| B-PLAC-002 | `docs/system/libs/mapgen/reference/domains/PLACEMENT.md` | “Placement provides: `effect:engine.placementApplied`…” | behavior | CURRENT-CORRECT | `mods/mod-swooper-maps/src/recipes/standard/tags.ts`, `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/contract.ts` | None (keep). | Verified tag exists + is provided. |
| C-IMP-001 | `docs/system/libs/mapgen/policies/IMPORTS.md` | “Do not use `@mapgen/*` in canonical docs or examples.” | policy | TARGET-CORRECT | `docs/projects/engine-refactor-v1/resources/spec/SPEC-packaging-and-file-structure.md`, `packages/mapgen-core/package.json` | None (keep). | Guardrail enables copy/paste outside monorepo. |

## Patch queue

Once ledger rows are validated, collect concrete patches here:

- P0: correctness regressions (fix immediately)
- P1: high confusion drift (fix before Slice 12B examples)
- P2: low-risk cleanup (can wait)
