# Review Disposition Ledger

| Finding | Lane | Severity | Summary | Disposition | Action | Status |
| --- | --- | --- | --- | --- | --- | --- |
| DIPS-R0 | internal drafting | P2 | The packet must not preserve current manual apply orchestration merely because it exists; the user clarified that Effect should be reconsidered when it removes structural failure modes. | accepted | Treat Effect Grit adapter or equivalent typed transaction substrate as the live-apply gate. | repaired in draft |
| DIPS-R1 | adversarial | P2 | Safe-transform completion was weaker in the normative spec than in proposal/design. | accepted | Enumerate full proof set and aggregate proof-id linkage in the final safe-transform scenario. | repaired |
| DIPS-R2 | adversarial | P2 | Import/export safety was under-specified for aliases, inline type specifiers, default, namespace, mixed, and side-effect import forms. | accepted | Add import-clause model, fail-closed unsupported forms, and per-specifier export/type/value tracking. | repaired |
| DIPS-R3 | adversarial | P2 | Rollback wording could allow manual apply plus recorded cleanup. | accepted | Require substrate-owned cleanup/finalizers; allow Git only through typed transaction service with before digests, allowed paths, command provenance, and final clean-status proof. | repaired |
| DIPS-R4 | adversarial | P2 | Downstream realignment missed H5 catalog records and the Habitat workstream record. | accepted | Add H5 proposal/tasks/phase record and workstream record to downstream ledger. | repaired |
| DIPS-R5 | adversarial | P3 | Evidence log clean-status wording could be read against the current untracked packet directory. | accepted | Clarify that the clean tracked-source status was at dry-run probe time before packet doc additions. | repaired |

## Pending External Review

Required review lanes before implementation:

- product/outcome;
- Grit/apply semantics;
- TypeScript/export authority;
- Effect/substrate;
- evidence/system.
