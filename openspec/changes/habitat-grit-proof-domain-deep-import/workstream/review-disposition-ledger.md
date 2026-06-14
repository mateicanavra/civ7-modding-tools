# Review Disposition Ledger

| Finding | Lane | Severity | Summary | Disposition | Action | Status |
| --- | --- | --- | --- | --- | --- | --- |
| DDI-R0 | internal drafting | P2 | This packet must not collapse check proof into the apply codemod proof just because both touch deep ops imports. | accepted | Design separates check ownership from apply proof and names the apply packet as separate owner. | repaired in draft |
| DDI-R1 | adversarial Grit semantics | P1 | `ops-by-id` is claimed by metadata and packet language but does not report in disposable Grit probes. | accepted | Packet records current semantic defect, requires predicate repair, native/import/re-export positives, lookalike negatives, and injected wrapper proof. | repaired in design |
| DDI-R2 | adversarial scope | P2 | Recipe/map-local test paths currently report through this row, while test policy was described as exterior. | accepted | Packet requires ownership classification for `__tests__`, `__type_tests__`, `*.test.ts`, and external test roots, with fixtures and current-tree records. | repaired in design |
| DDI-R3 | adversarial downstream | P2 | Recovery claim ledger rows were omitted from downstream realignment even though they own H5/H6/baseline/stale-record truth. | accepted | Downstream ledger now names H5, H6, baseline, and stale-record rows and blocks closure until aggregate proof ids exist. | repaired in design |
| DDI-R4 | adversarial baseline | P3 | Baseline expansion safety belongs to shared scaffold/baseline contract repair, not this row alone. | accepted | Packet links expansion safety to the accepted scaffold/baseline contract owner and keeps this row to explicit `[]` plus unbaselined injected failure. | repaired in design |
| DDI-R5 | source-agent product boundary | P2 | Relative recipe imports reach local `src/domain/**`, outside this alias-based pattern. | accepted | Packet records alias-only boundary and requires sibling guard or accepted non-claim before complete public-surface enforcement is claimed. | repaired in design |

## Pending External Review

Required review lanes:

- product/outcome;
- Grit semantics;
- architecture/public-surface authority;
- evidence/proof classes;
- system ownership and duplication;
- Effect/substrate fit.
