# Review Disposition Ledger: deep-habitat-d12-verify-handoff-receipt

| Finding | Severity | Disposition |
| --- | --- | --- |
| Verify receipt state was too broad and partly optional. | P1 | Repaired with closed TypeBox schemas and focused receipt modules. |
| Verify command risked owning graph/check semantics locally. | P1 | Repaired by consuming D3 `VerifyTargetPlan` and D7 `VerifyCheckSummaryProjection`. |
| Affected execution did not distinguish skipped, failed, and executed states. | P1 | Repaired with closed `nxAffected.kind` variants and focused tests. |
| Command-output handling risked serializing raw streams. | P1 | Repaired with bounded stdout/stderr metadata and validation tests. |
| Receipt module was growing into another mixed-responsibility file. | P2 | Repaired by splitting base, schema, receipt assembly, affected execution, post-state, and command-output helpers. |
| Active D12 records still reflected design-only/source-blocked state. | P2 | Repaired in tasks, phase record, proposal, design, spec, closure, and downstream records. |
| Control note: module extraction should use an in-module `index.ts` barrel and remove superseded facade files. | P2 | Repaired by routing verify imports through the in-module barrel, updating package exports, and deleting the old adjacent facade. |
| Control note: created D12 modules and TypeBox schemas needed JSDoc/descriptions before closure. | P2 | Repaired with module/function/type JSDoc, parameter notes where useful, TypeBox schema descriptions, and derived type comments for exported receipt types. |
| Agent review found target-plan refusal receipts collapsed the D3 refusal reason to generic `graph-refusal`. | P2 | Repaired by serializing the D3 `refusal.reason` selector and updating the graph-refusal receipt test. |
| Agent record review found the D0 packet-index row count stale at 364. | P1 | Repaired by aligning the packet index to the current validated D0 matrix total of 355 rows. |
| Agent record review found closure records still routed through an obsolete human-review gate. | P1 | Repaired by removing that gating language from active D12 records and packet-index status text. |
