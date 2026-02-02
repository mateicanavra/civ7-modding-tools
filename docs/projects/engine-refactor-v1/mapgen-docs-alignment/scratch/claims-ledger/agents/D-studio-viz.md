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

### Rows (draft)

| claimId | docPath | quotedClaim | claimType | state | anchors | recommendedEdit | notes |
|---|---|---|---|---|---|---|---|
| D-VIZ-001 | `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` | “Steps emit visualization data via `context.viz?.dump*` methods … which call `trace.event(...)` under the hood.” | behavior | CURRENT-CORRECT | `apps/mapgen-studio/src/browser-runner/worker-viz-dumper.ts`, `mods/mod-swooper-maps/src/dev/viz/dump.ts` | None (keep). | Verify the precise call-chain: dumper → trace.event (or scope.event). |
| D-VIZ-002 | `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` | “`TraceScope.event(...)` is gated behind `verbose` … so visualization emission is also gated.” | behavior | CURRENT-CORRECT | `packages/mapgen-core/src/trace/index.ts` (`createStepScope`) | None (keep). | `event(...)` is a no-op unless `isVerbose`. |

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
