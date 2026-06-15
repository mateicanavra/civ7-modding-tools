# Review Disposition Ledger - MapGen Core Runtime Civ7

| Finding id | Priority | Source | Finding | Disposition | Evidence |
| --- | --- | --- | --- | --- | --- |
| MCR-REVIEW-OPEN | N/A | Row launch | No accepted P1/P2 findings are open at packet creation. | Informational | Revisit after fixture/parser proof and supervisor review. |
| MCR-PREDICATE-GAP-2026-06-15 | Blocker | Native fixture proof | The current Grit predicate text includes import branches for `@civ7/adapter`, `@civ7/adapter/civ7`, and `/base-standard/...`, but native fixture proof produced 7 matches only for runtime-global member expressions. Import examples in the ignore fixture produced 0 matches. | Recorded as import-class enforcement blocker; predicate semantics are not repaired in this layer. | `MCR-NATIVE-FIXTURES-2026-06-15` |
| MCR-TYPE-IMPORTS-2026-06-15 | Blocker | Parser inventory | Current MapGen core/engine roots contain 4 type-only imports from `@civ7/adapter` and 0 adapter value imports. `rules.json` says adapter value imports, while H5/G3 wording includes type refs; source-owner/predicate policy disposition is needed before clean closure. | Recorded as source-owner/predicate disposition blocker; no MapGen source is changed and no baseline is created in this layer. | `MCR-CORE-INVENTORY-2026-06-15` |
