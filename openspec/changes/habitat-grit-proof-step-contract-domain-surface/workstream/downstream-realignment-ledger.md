# Downstream Realignment Ledger

| Downstream surface | Current risk | Required realignment | Status |
| --- | --- | --- | --- |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Aggregate row may treat native fixture and current pass state as enough proof. | Link proof ids, parser-form counts, source-specifier controls, path controls, wrapper roots, raw acquisition, injected proof, baseline proof, and overlap disposition after implementation. | partial: `SCDS-NATIVE-FIXTURES-2026-06-15` and `SCDS-IMPORT-INVENTORY-2026-06-15` linked for native/parser checkpoint; wrapper, raw/adapter, injected, baseline, parity, and exact-scope closure remain blocked/non-claim |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Row currently records proving sources and pending current scan state. | Update after implementation with proof ids, fixture counts, current-tree status, and scope disposition. | partial: proof ids and native/parser counts recorded; current-tree wrapper, baseline, injected, raw acquisition, and exact filename/source closure remain blocked/non-claim |
| `docs/projects/habitat-harness/invariant-corpus.md` | Retired `eslint-step-contract-imports` can be read as fully replaced. | Link row-level proof before claiming retirement parity; downgrade or block if filename/test/path controls remain unowned. | pending implementation |
| `docs/projects/habitat-harness/taxonomy.md` | `scope:domain-surface` can blur ordinary recipe policy with step-contract policy. | Keep step-contract root-only rule separate from ordinary recipe root/ops/config policy unless taxonomy gains a reviewed sub-scope note. | pending implementation |
| `docs/projects/habitat-harness/discrepancy-log.md` | Surface discrepancies may omit step-contract stricter policy or overlap with recipe-domain/deep-domain rows. | Update only if implementation changes predicate, metadata, or owner boundaries. | watch |
| `docs/system/libs/mapgen/policies/IMPORTS.md` | Policy already distinguishes step contracts, but implementation may expose wording gaps around `/ops` and `/config.js`. | Do not edit during design; after implementation, update only if policy needs sharper wording for step contracts. | watch |
| `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md` | Authoring docs could imply contract ops declarations may import runtime ops directly. | Update only if implementation reveals a documentation ambiguity that affects authors. | watch |
| `docs/system/libs/mapgen/how-to/add-a-step.md` | Step authoring guidance may need a direct note if diagnostics become user-facing. | Update only if diagnostics or remediation guidance changes. | watch |
| `openspec/changes/habitat-grit-proof-recipe-domain-surface/**` | Recipe-domain row overlaps contract files under recipe roots. | Link multi-rule expectations or predicate partition proof so ordinary recipe policy does not own contract-only remediation. | partial: native fixture now records step-contract overlap forms as SCDS current-predicate positives; reviewed multi-rule closure remains pending |
| `openspec/changes/habitat-grit-proof-domain-deep-import/**` | Domain-deep row overlaps `ops/<tail>`, `rules/<tail>`, and `strategies/<tail>` inside step contracts. | Link overlap proof and preserve domain-deep ownership outside step contracts. | partial: SCDS fixture records `ops/<tail>`, `ops-by-id`, `rules/<tail>`, and `strategies/<tail>` as SCDS current-predicate positives; domain-deep predicate repair/overlap closure remains pending |
| `openspec/changes/habitat-grit-proof-contract-export-all/**` | Contract-export row overlaps star re-export cases in contract files. | Link source-surface diagnostic separately from value-star export diagnostic. | partial: SCDS fixture records star re-export source-surface behavior; contract-export overlap closure remains pending |
| `openspec/changes/habitat-grit-catalog/**` | H5 catalog closure can be read as stronger than per-row proof currently supports. | Preserve H5 as historical; point current row proof to this packet after implementation. | pending implementation |
| `openspec/changes/habitat-enforcement-consolidation/**` | H6 retired lint/test mechanisms may imply one-path enforcement before this row proves parity. | Realign if implementation changes parity or exposes unowned filename/test/scope gaps. | pending implementation |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` `CLAIM-H5-GRIT` | H5 truth depends on row proof, not catalog presence. | No closure claim from this row until aggregate proof ids cover native, wrapper, raw/adapter, injected, baseline, path controls, and overlap. | pending implementation |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` `CLAIM-H6-ONE-PATH` | One-path enforcement can be overstated if retired tests or neighboring rows still own parts of the invariant. | Link retired-mechanism parity and neighboring-rule disposition before claiming consolidation. | pending implementation |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` `CLAIM-P1-BASELINE` | Empty baseline can be mistaken for shared baseline mutation safety. | Link explicit baseline proof plus accepted scaffold/baseline contract owner before expansion-safety claims. | pending implementation |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` `CLAIM-P1-STALE-RECORDS` | Stale records may imply exact all-mod wrapper enforcement or exact filename scope. | Update stale-record rows only after wrapper/raw scope and filename lookalike disposition are linked. | pending implementation |
| `tools/habitat-harness/src/rules/rules.json` | Metadata says `contract.ts,*.contract.ts` while pattern regex also catches lookalikes ending in `contract.ts`. | Implementation must repair predicate/metadata or record a named blocked owner before exact filename-scope claims. | partial: native fixture records `notacontract.ts` as a current-predicate positive and parser inventory found 0 live filename lookalikes; exact filename-scope closure remains pending |
| `.grit/patterns/habitat/checks/step_contract_domain_surface.md` | Source regex has a leading wildcard and can catch prefixed or relative strings containing `@mapgen/domain/<domain>/<tail>`. | Implementation must repair predicate/source semantics or record source-specifier lookalike disposition before exact source-scope claims. | partial: native fixture records prefixed, relative, and protocol source strings as current-predicate positives and parser inventory found 0 live source lookalikes; exact source-scope closure remains pending |
| `tools/habitat-harness/baselines/grit-step-contract-domain-surface.json` | Missing explicit baseline means baseline-integrity proof is implicit. | Add `[]`, prove integrity accepts it, and prove injected findings fail unbaselined. | pending implementation |

## Realignment Rule

No downstream record may claim this row is fully proven until the aggregate
matrix links proof ids for native fixture, parser forms, wrapper current-tree,
wrapper scan roots, raw acquisition or adapter proof, injected violation,
baseline behavior, source-specifier controls, filename/path controls, overlap
disposition, retired parity, and stale-record updates.

No recovery claim may treat this check as all-mod step-contract enforcement
until wrapper roots, raw roots, other-mod probes, and metadata wording are
reconciled. No claim may treat filename scope as exact until `contract.ts`,
`*.contract.ts`, and lookalikes ending in `contract.ts` are dispositioned.
No claim may treat source-specifier scope as exact until prefixed, relative,
and other non-package strings matched by the current source regex are
dispositioned.
