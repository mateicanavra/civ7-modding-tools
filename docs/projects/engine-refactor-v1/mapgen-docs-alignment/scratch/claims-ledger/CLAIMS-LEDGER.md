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
| seed-000 | `docs/system/libs/mapgen/reference/RUN-SETTINGS.md` | “Docs should prefer RunSettings as the concept…” | naming | OPEN-QUESTION | `packages/mapgen-core/src/core/env.ts` | Re-evaluate against Phase 2/workflow; adjust to avoid implying regression. | Seed row to force early review. |
| seed-001 | `docs/system/libs/mapgen/reference/domains/NARRATIVE.md` | “Status: Canonical (domain reference)” | ownership | OPEN-QUESTION | `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/references/phase-2-modeling.md` | Reframe page posture if narrative overlays are forbidden in target. | Seed row to force early review. |

## Patch queue

Once ledger rows are validated, collect concrete patches here:

- P0: correctness regressions (fix immediately)
- P1: high confusion drift (fix before Slice 12B examples)
- P2: low-risk cleanup (can wait)
