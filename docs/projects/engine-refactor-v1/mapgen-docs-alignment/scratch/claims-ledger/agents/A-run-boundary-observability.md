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

## Preferred anchors

Target authority (what should be):
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/WORKFLOW.md`
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/references/phase-2-modeling.md`

Current code (what is):
- `packages/mapgen-core/src/core/env.ts`
- `packages/mapgen-core/src/**` (trace/viz hooks; runner boundary)
- `apps/mapgen-studio/src/browser-runner/**` (worker protocol + trace/viz sinks)
