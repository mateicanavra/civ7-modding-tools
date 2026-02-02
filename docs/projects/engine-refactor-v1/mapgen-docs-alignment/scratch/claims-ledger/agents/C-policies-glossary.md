<toc>
  <item id="scope" title="Scope"/>
  <item id="rows" title="Candidate rows"/>
  <item id="anchors" title="Preferred anchors"/>
</toc>

# Agent C — Policies + glossary coherence (claims working sheet)

## Scope

Audit interpretive claims related to:
- vocabulary and terminology (glossary words, “canonical names”),
- import policies and package boundary posture (`@swooper/*` vs `@mapgen/*`),
- dependency injection / composition conventions,
- “this should be the target policy” statements.

Hotspot: docs implying `RunSettings` is target-canonical (potential regression if `Env` is intentionally canonical).

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

Canonical system docs (posture):
- `docs/system/libs/mapgen/policies/**`
- `docs/system/libs/mapgen/reference/GLOSSARY.md`
