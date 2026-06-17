# Review Disposition Ledger - Viz Contract Ownership

| Finding id | Priority | Source | Disposition | Evidence / notes |
| --- | --- | --- | --- | --- |
| VCO-REVIEW-CURRENT-2026-06-15 | n/a | Historical bounded blocker checkpoint | Historical / superseded by closure work | Supervisor accepted the prior bounded checkpoint for native file-hub proof and parser inventory. That checkpoint did not close import predicate or live private-viz source blockers. |
| VCO-IMPORT-PREDICATE-GAP-2026-06-15 | Blocker | Native fixture/parser-edge evidence | Repaired / proof recorded | `VCO-PREDICATE-REPAIR-2026-06-16` switches the row to `import_statement(source=$source)` with row-owned source-shape guards; focused native proof reports 6 positives and 0 ignores, and wrapper proof passes with zero VCO diagnostics. |
| VCO-LIVE-PRIVATE-VIZ-IMPORT-2026-06-15 | Blocker | Parser inventory | Remediated / proof recorded | The live `plotBiomes.ts` import from `./plot-biomes/viz.js` is replaced with a stage-surface import from `../viz.js`; the shared helper now lives at `stages/map-ecology/viz.ts`. Parser inventory records 0 current VCO matches and package source proof passes. |
| VCO-SOURCE-SCOPE-GUARDRAIL-2026-06-16 | P2 | Supervisor in-progress guardrail | Accepted / repaired in packet | Source remediation is now explicit VCO scope, with separate source proof, predicate proof, wrapper proof, baseline proof, injected proof, and non-claims. |
