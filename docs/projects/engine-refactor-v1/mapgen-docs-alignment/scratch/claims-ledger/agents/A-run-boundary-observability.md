<toc>
  <item id="scope" title="Scope"/>
  <item id="rows" title="Candidate rows"/>
  <item id="anchors" title="Preferred anchors"/>
</toc>

# Agent A — Run boundary + observability (claims working sheet)

## Scope

Audit interpretive claims related to:
- the “run boundary” concept (`Env` / “RunSettings” / runId / planFingerprint),
- tracing/observability (trace sinks, event schemas, where traces are emitted),
- visualization posture (streaming vs dump artifacts),
- any doc statements that prescribe the “target” naming/contract for these.

Goal: produce **ledger rows** (not prose) that can be merged into `../CLAIMS-LEDGER.md`.

## Candidate rows

Add rows here in the same format as the ledger table:
- `claimId`
- `docPath`
- `quotedClaim`
- `claimType`
- `state`
- `anchors`
- `recommendedEdit`
- `notes`

### Rows (draft)

| claimId | docPath | quotedClaim | claimType | state | anchors | recommendedEdit | notes |
|---|---|---|---|---|---|---|---|
| A-ENV-001 | `docs/system/libs/mapgen/reference/RUN-SETTINGS.md` | “Docs should prefer **RunSettings** as the concept…” | naming | TARGET-DRIFT | `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/04-type-surfaces.md`, `packages/mapgen-core/src/core/env.ts` | Reframe: canonical runtime envelope is `Env` (formerly called `RunSettings` in older specs). Remove “prefer RunSettings” posture. | P0: avoid architecture regression. |
| A-ENV-002 | `docs/system/libs/mapgen/reference/RUN-SETTINGS.md` | “Target naming is: `type RunRequest = { recipe: Recipe; settings: RunSettings };`” | naming | TARGET-DRIFT | `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/04-type-surfaces.md`, `packages/mapgen-core/src/engine/execution-plan.ts` | Replace target snippet with `RunRequest = { recipe, env }` and add a short “legacy naming” note referencing older specs. | Avoid mixing “target vs current” incorrectly. |
| A-OBS-001 | `docs/system/libs/mapgen/reference/OBSERVABILITY.md` | “Run reproducibility is rooted in the run settings (`RunSettings`, `Env` today)…” | naming | TARGET-DRIFT | `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/04-type-surfaces.md`, `packages/mapgen-core/src/core/env.ts` | Replace “RunSettings, Env today” with “Env (legacy docs: RunSettings)”. | Also update any `RunRequest.settings.trace` references elsewhere. |
| A-GLO-001 | `docs/system/libs/mapgen/reference/GLOSSARY.md` | “Target **RunSettings** vs current code **Env**.” | naming | TARGET-DRIFT | `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/04-type-surfaces.md` | Replace with “Legacy specs: RunSettings → Canonical: Env”. | Spec drift is now the issue; not code drift. |
| A-RUNID-001 | `docs/system/libs/mapgen/reference/GLOSSARY.md` | “Current implementation: `runId === planFingerprint`…” | behavior | CURRENT-CORRECT | `packages/mapgen-core/src/engine/observability.ts` | None (keep). | Good anchor already exists. |

## Preferred anchors

Target authority (what should be):
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/WORKFLOW.md`
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/references/phase-2-modeling.md`

Current code (what is):
- `packages/mapgen-core/src/core/env.ts`
- `packages/mapgen-core/src/**` (trace/viz hooks; runner boundary)
- `apps/mapgen-studio/src/browser-runner/**` (worker protocol + trace/viz sinks)
