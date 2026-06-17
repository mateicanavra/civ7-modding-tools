# Downstream Realignment Ledger

| Downstream surface | Current risk | Required realignment | Status |
| --- | --- | --- | --- |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Aggregate row could preserve old substring-exclusion and partial-proof wording. | Link the repaired predicate, current fixture counts, parser inventory, wrapper, baseline, injected proof, DDI partition, and non-claims. | done: row points at `RDS-*2026-06-16` proof IDs and keeps raw/parity/apply/product non-claims. |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Corpus row could still say substring-gap controls are non-matches rather than repaired/partitioned. | Update row with active-check closure, exact-source guards, DDI partition, current zero-candidate inventory, wrapper, baseline, and injected proof. | done. |
| `docs/system/libs/mapgen/policies/IMPORTS.md` | Policy says exact domain root, `/ops`, and `/config.js`; row predicate previously used substring allowances. | Do not edit policy; align predicate to existing policy and record DDI-owned neighboring source families. | done: predicate now uses exact allowed-source guards and DDI partitioning; policy text did not change. |
| `openspec/changes/habitat-grit-proof-domain-deep-import/**` | Neighbor row owns `ops/<tail>`, `ops-by-id`, `rules/<tail>`, and `strategies/<tail>`. | Keep those source families as RDS controls and link accepted DDI proof. | done; no DDI packet edit required. |
| `openspec/changes/habitat-grit-proof-step-contract-domain-surface/**` | Step-contract source lives under recipes and can overlap the RDS filename predicate. | Record overlap as current-predicate/native proof only; leave stricter step-contract policy to SCDS. | done; no SCDS packet edit required. |
| `openspec/changes/habitat-grit-catalog/**` | H5 catalog closure can be read as stronger than row-level proof currently supports. | Preserve H5 as historical and point current proof to this packet and aggregate RDS proof IDs. | done through current corpus/proof records; no historical packet edit in this row. |
| `openspec/changes/habitat-enforcement-consolidation/**` | H6 retired `lint-mapgen-recipe-imports.sh` and `recipe-import-boundary.test.ts` can imply parity proof. | Preserve retired parity as a non-claim unless a separate parity proof is added. | done; parity remains outside RDS closure. |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` | Front-door recovery claims can overread row closure as raw, apply, parity, or product proof. | Do not update the front-door ledger for this row unless recovery claim ownership changes; aggregate proof records carry exact RDS boundary. | unchanged by design; no current contradiction introduced. |
| `openspec/changes/habitat-grit-apply-deep-import-public-surface-proof/**` | Apply packet owns selected `ops/<tail>` rewrites, not RDS check findings. | Keep DDI/apply-owned classes out of RDS remediation claims. | done; no apply packet edit required. |

## Realignment Rule

Downstream records may claim RDS active-check closure only for the repaired
recipe `.ts` predicate: RDS-owned non-public domain subpaths report, exact
domain root/`/ops`/`/config.js` are allowed, and DDI-owned `ops/<tail>`,
`ops-by-id`, `rules/<tail>`, and `strategies/<tail>` remain sibling-owned.

No downstream record may infer raw direct Grit acquisition, source remediation,
generated-output coverage, step-contract policy closure, apply safety, retired
parity, aggregate injected-corpus closure while DDIT remains blocked, or
product/runtime proof from this row.
