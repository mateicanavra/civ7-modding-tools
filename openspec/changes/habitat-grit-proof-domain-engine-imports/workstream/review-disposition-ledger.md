# Review Disposition Ledger - Domain Engine Imports Active Check

| Finding id | Priority | Source | Finding | Disposition | Evidence |
| --- | --- | --- | --- | --- | --- |
| DEI-REVIEW-CURRENT | N/A | Row-local review | Active check repair implemented and pending supervisor review. The `.grit` pattern, `rules.json` entry, explicit empty baseline, and injected probe are present in this checkpoint. | Informational | `DEI-PREDICATE-REPAIR-2026-06-15`; `DEI-NATIVE-FIXTURES-2026-06-15`; `DEI-DOMAIN-OPS-INVENTORY-2026-06-15` |
| DEI-PREDICATE-BLOCKER-2026-06-15 | P2 | Native predicate design | Historical blocker: earlier Grit attempts could not safely detect non-type engine imports while preserving pure type-only controls. | Repaired for the bounded static import subset by `DEI-PREDICATE-REPAIR-2026-06-15`. Export-from, dynamic import, source-string, multiline/alternate-whitespace inline type-only closure, parser-backed owner migration, and changed type-only policy remain separate future triggers. | `DEI-PREDICATE-REPAIR-2026-06-15` |
