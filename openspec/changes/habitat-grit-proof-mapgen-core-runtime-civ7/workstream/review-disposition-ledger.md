# Review Disposition Ledger - MapGen Core Runtime Civ7

| Finding id | Priority | Source | Finding | Disposition | Evidence |
| --- | --- | --- | --- | --- | --- |
| MCR-REVIEW-CURRENT | N/A | Active closure repair | Predicate repair and active-check proof are implemented; checkpoint is pending supervisor review after final local validation. | Informational | `MCR-PREDICATE-REPAIR-2026-06-16`; `MCR-NATIVE-FIXTURES-2026-06-16`; `MCR-CORE-INVENTORY-2026-06-16`; `MCR-PER-RULE-SELECTOR-2026-06-16`; `MCR-INJECTED-PROBE-2026-06-16` |
| MCR-PREDICATE-GAP-2026-06-15 | P2 | Prior native fixture proof | Prior predicate text did not report intended import classes. | Repaired. The predicate now uses `import_statement(source=$source)` with exact source matching and value/type guards; native fixtures report value, side-effect, and mixed value/type runtime import classes. | `MCR-PREDICATE-REPAIR-2026-06-16`; `MCR-NATIVE-FIXTURES-2026-06-16` |
| MCR-TYPE-IMPORTS-2026-06-15 | P2 | Parser inventory | Current MapGen core/engine roots contain 4 imports from `@civ7/adapter`, all type-only. | Dispositioned as clean controls for this row. `rules.json` forbids adapter value imports and runtime globals; pure type-only imports are erased and remain outside this Grit row's runtime-coupling predicate. | `MCR-CORE-INVENTORY-2026-06-16`; `CORE-PURITY-SOURCE-INVENTORY-2026-06-16` adjacent context |
