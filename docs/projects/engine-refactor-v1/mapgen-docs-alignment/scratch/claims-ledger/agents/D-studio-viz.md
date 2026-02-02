<toc>
  <item id="scope" title="Scope"/>
  <item id="rows" title="Candidate rows"/>
  <item id="anchors" title="Preferred anchors"/>
</toc>

# Agent D — Studio + visualization integration (claims working sheet)

## Scope

Audit interpretive claims related to:
- MapGen Studio integration seams and protocols,
- deck.gl visualization posture and how data is emitted/consumed,
- “streaming vs dump artifacts” expectations,
- any “target posture” statements that might be wrong vs current canon (viz is current canon).

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
- `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`
- `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
- `docs/system/libs/mapgen/how-to/**` (viz + studio how-tos)

Current code:
- `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`
- `apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts`
- `apps/mapgen-studio/src/browser-runner/worker-viz-dumper.ts`
- `apps/mapgen-studio/src/browser-runner/protocol.ts`
