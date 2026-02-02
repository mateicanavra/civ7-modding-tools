<toc>
  <item id="scope" title="Scope"/>
  <item id="rows" title="Candidate rows"/>
  <item id="anchors" title="Preferred anchors"/>
</toc>

# Agent E — Tutorials/how-to correctness (claims working sheet)

## Scope

Audit interpretive claims related to:
- tutorials and how-tos that prescribe workflows (“do X to add an op”, “do Y to debug”),
- step/stage/recipe usage guidance,
- any implied behavior claims in tutorials that may not match current code.

Non-goal: do not add new examples/snippets here (that’s Slice 12B). Just mark missing-example opportunities for 12B.

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

Canonical docs:
- `docs/system/libs/mapgen/tutorials/**`
- `docs/system/libs/mapgen/how-to/**`

Current code:
- `packages/mapgen-core/**`
- `packages/mapgen/**` (standard recipe + domains wiring)
- `apps/mapgen-studio/**` (any Studio-specific steps)
