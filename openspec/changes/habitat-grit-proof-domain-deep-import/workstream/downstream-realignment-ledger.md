# Downstream Realignment Ledger

| Downstream surface | Current risk | Required realignment | Status |
| --- | --- | --- | --- |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Aggregate row currently has seeded proof labels and pending fields. | Link row proof ids, fixture counts, baseline proof, and injected proof from this packet after implementation. | pending implementation |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Row says pending repair scan and fixture strategy pending. | Update row after implementation with proof id and current-tree status. | pending implementation |
| `openspec/changes/habitat-grit-catalog/**` | H5 catalog closure can be read as stronger than row-level proof currently supports. | Preserve H5 as historical; point current row proof to this packet after implementation. | pending implementation |
| `openspec/changes/habitat-enforcement-consolidation/**` | H6 retirement claims may depend on H5 proof depth. | Realign only if implementation changes parity or old-mechanism retirement claims. | pending implementation |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` `CLAIM-H5-GRIT` | H5 truth depends on per-row proof, not catalog presence or native samples alone. | No H5 closure claim from this row until aggregate proof ids include fixtures, wrapper, raw/adapter, injected, baseline, scope, and false-positive proof. | pending implementation |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` `CLAIM-H6-ONE-PATH` | H6 one-path enforcement can be overstated if duplicate diagnostics or stale scripts own the same invariant. | Link neighboring-rule overlap disposition and owner-layer decision before claiming one-path consolidation. | pending implementation |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` `CLAIM-P1-BASELINE` | Baseline truth can be overstated if this row adds `[]` but does not link shared mutation policy. | Link explicit empty baseline proof plus accepted scaffold/baseline contract owner before claiming expansion safety. | pending implementation |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` `CLAIM-P1-STALE-RECORDS` | Historical records may imply alias-only checks cover relative local-domain reaches or test policy. | Update stale-record rows only after alias-boundary and test-scope decisions are linked. | pending implementation |
| `openspec/changes/habitat-grit-apply-deep-import-public-surface-proof/**` | Apply packet consumes exact ops findings as possible candidates. | No edit needed unless this row changes source family or scan roots. | watch |
| `docs/system/libs/mapgen/policies/IMPORTS.md` | Public-surface policy is current authority; user-facing wording may need command references if diagnostics change. | Update only if implementation changes policy or remediation text. | no edit in design phase |

## Realignment Rule

No downstream record may claim this row is fully proven until the aggregate
matrix links to exact proof ids for native fixture, wrapper current-tree,
raw acquisition or adapter proof, injected violation, baseline, and
false-positive coverage.

No recovery claim ledger row may treat this check as complete public-surface
enforcement until `ops-by-id`, recipe/map-local tests, relative local-domain
reach, neighboring-rule overlap, and baseline owner linkage are dispositioned.
