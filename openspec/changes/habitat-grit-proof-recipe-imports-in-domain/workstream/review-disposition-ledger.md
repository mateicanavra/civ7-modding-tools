# Review Disposition Ledger - Recipe Imports In Domain

| Finding id | Priority | Source | Finding | Disposition | Evidence / action |
| --- | --- | --- | --- | --- | --- |
| `RID-REVIEW-CURRENT` | N/A | Implementation DRA | Row is implemented and locally verified; supervisor review has not accepted the checkpoint yet. | Informational | Native fixture, parser inventory, wrapper selector, baseline inventory, injected probe, and OpenSpec evidence are recorded; next gate is supervisor review. |
| `RID-DYNAMIC-IMPORT-GAP-2026-06-16` | P2 | Product row review | The domain-to-recipe boundary can be bypassed with `import("...recipes...")` even though domain source must not depend on recipe modules. | Repaired in this layer. Dynamic recipe imports in domain `.ts` are now current-predicate positives with source-string, lookalike, and recipe-layer controls preserved. | `RID-DYNAMIC-NATIVE-FIXTURES-2026-06-16`; registered RID injected probe updated to the dynamic import class. |
