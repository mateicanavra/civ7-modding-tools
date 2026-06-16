# Review Disposition Ledger

| Finding | Lane | Severity | Summary | Disposition | Action | Status |
| --- | --- | --- | --- | --- | --- | --- |
| DDI-R0 | internal drafting | P2 | This packet must not collapse check proof into the apply codemod proof just because both touch deep ops imports. | accepted | Design separates check ownership from apply proof and names the apply packet as separate owner. | repaired in draft |
| DDI-R1 | adversarial Grit semantics | P1 | `ops-by-id` is claimed by metadata and packet language but did not report in disposable Grit probes. | accepted | Native predicate repaired: exact `ops-by-id` import and re-export now report in `DDI-NATIVE-FIXTURES-2026-06-15`, while `ops-by-identity`, `ops-by-id-extra`, and `ops-by-id/private` remain clean controls. Current restacked shared wrapper/injected proof is represented only by `HGPR-PER-RULE-SELECTORS-2026-06-15` and `HGPR-INJECTED-GRIT-ROWS-2026-06-15`; DDI-specific path-control and closure remain non-claims. | repaired for native checkpoint; shared proof inherited; row-specific closure gated |
| DDI-R2 | adversarial scope | P2 | Recipe/map-local test paths currently report through this row, while test policy was described as exterior. | accepted | Current predicate includes recipe/map-local tests, and native fixtures prove recipe `__tests__/*.test.ts` plus map `__type_tests__/*.test.ts` positives. Parser inventory found 2 live map-local test files, 0 recipe-local test files, and 0 forbidden candidates. External `test/**` remains an out-of-scope control. | repaired for native/parser checkpoint |
| DDI-R3 | adversarial downstream | P2 | Recovery claim ledger rows were omitted from downstream realignment even though they own H5/H6/baseline/stale-record truth. | accepted | Aggregate proof matrix, corpus ledger, and command proof log are realigned for `DDI-NATIVE-FIXTURES-2026-06-15`, `DDI-IMPORT-INVENTORY-2026-06-15`, and inherited shared proof ids. Recovery claim closure remains gated because raw direct acquisition, DDI-specific path-control/generated-output disposition, broader public-surface closure, and product proof remain non-claims. | partially repaired; full closure gated |
| DDI-R4 | adversarial baseline | P3 | Baseline expansion safety belongs to shared scaffold/baseline contract repair, not this row alone. | accepted | Current restacked baseline file and integrity proof are represented by `HGPR-BASELINE-FILES-2026-06-15` and `HGPR-BASELINE-INTEGRITY-2026-06-15`. This row does not create a separate baseline-mutation claim. | shared proof inherited; row-specific mutation claim avoided |
| DDI-R5 | source-agent product boundary | P2 | Relative recipe imports reach local `src/domain/**`, outside this alias-based pattern. | accepted | Parser inventory records six relative local-domain reaches as outside this alias row. They remain sibling guard or accepted non-claim input; no complete public-surface enforcement claim is made. | repaired for record truth; sibling disposition gated |
| DDI-R6 | product enforcement | P2 | The import snippet did not prove bare side-effect static imports from forbidden deep domain internals, even though the rule owns static recipe/map deep imports. | accepted | Predicate now uses `import_statement(source=...)`, exact optional-quote source matching, side-effect native fixture proof, prefix/protocol controls, and a row-specific side-effect injected probe with clean domain-source control. | repaired for side-effect import checkpoint |

## Remaining Review / Closure Gates

The prior bounded DDI checkpoint was supervisor-gated before this restack
record-truth repair. This record-truth repair is implemented and pending
supervisor review; no known P1/P2 remains after local repair evidence.

Remaining gates are row-specific and non-closure items: raw direct Grit
acquisition or accepted adapter proof if full closure needs it, map,
`ops-by-id`, or generated-output path-control proof beyond the accepted
side-effect injected probe, relative local-domain reach disposition, apply
safety owned by
`deep_import_to_public_surface`, retired parity, broader public-surface
closure, recovery-claim ledger closure, and product/runtime proof. Future
product/outcome, Grit semantics, architecture/public-surface authority,
evidence/proof-class, system ownership, and Effect/substrate review lanes reopen
only when one of those gates is implemented or claimed.
