# Downstream Realignment Ledger: D12 Verify Handoff Receipt

| Surface | D12 disposition | Required action |
| --- | --- | --- |
| D0 command surface inventory | D12 changes verify JSON/help/export surfaces. | Matrix rows now describe current `VerifyReceipt` JSON and exported symbols; row counts are recalculated from the matrix. |
| D1 receipt contract boundary | D12 follows D1 bounded DTO/output discipline. | Future receipt-shaped fields remain TypeBox-first and bounded at command-output edges. |
| D3 workspace graph boundary | D12 consumes `VerifyTargetPlan` and graph-refusal states. | D12 must not locally define target truth or project availability. |
| D7 structural enforcement pipeline | D12 consumes `VerifyCheckSummaryProjection`. | D12 must not reconstruct check summary or run affected targets after D7 blocks execution. |
| D11 local feedback | Current D12 implementation does not consume hook/local-feedback projections. | Future D12 hook observations require D0/D1-compatible receipt fields and must not complete verify by themselves. |
| D14 authoring topology fence | D14 may cite D12 receipt examples and command limits. | D14 owns authoring acceptance; D12 receipts remain local verify records. |
| Habitat docs/examples | D12 may require verify wording updates. | Docs must teach receipt/handoff semantics and keep root `bun run verify` distinct from diagnostic `habitat verify`. |
| Verify tests | Focused tests now cover current receipt behavior. | Future tests should cover positive command/receipt behavior and natural failure states, not structural placement assertions. |
| Nx affected command behavior | D12 records the affected argv contract and D3 target-plan source. | Keep exact argv covered when target planning or affected execution changes. |
| Packet index | D12 implementation state is recorded. | Keep the row current after Graphite submit. |
