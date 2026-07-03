# Review Disposition Ledger: deep-habitat-d9-transformation-transaction

## Status

D9 is accepted for design/specification after fresh final rereview. Current
source implementation is partial: explicit-input dry-run execution and
fail-closed live-write boundary are live, while dry-run inventory parsing,
write-set approval, live write, handoffs, rollback, D10 path authority, and
downstream projections remain open.

## Dispositions

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| First-wave domain/ontology review found no closed transaction ontology, unresolved D8/D9 admission boundary, D10/G-HOST leakage, boolean/optional result shape, and underspecified rollback/recovery. | P1 | accepted and repaired | `$D9_FINAL_DOMAIN_REVIEW` accepted the repaired domain/ontology model with no unresolved P1/P2 findings. |
| First-wave TypeScript state-space review found optional mode flags, nullable proof/result bag, primitive strings, broad exported proof DTOs, and missing non-empty/brand constraints. | P1 | accepted and repaired | `$D9_FINAL_TYPESCRIPT_VALIDATION_REVIEW` accepted the repaired state-space and validation model with no unresolved P1/P2 findings. |
| First-wave code/vendor topology review found missing write/protected sets, invalid `habitat fix --dry-run --json` gate, D8/D10/G-HOST input ambiguity, and vendor-boundary drift. | P1 | accepted and repaired | `$D9_FINAL_CODE_VENDOR_TOPOLOGY_REVIEW` accepted the repaired code/vendor topology with no unresolved P1/P2 findings. |
| First-wave OpenSpec/information/testing review found one broad requirement, two scenarios, generic tasks, stale context routing, and missing validation split. | P1 | accepted and repaired | `$D9_FINAL_OPENSPEC_INFORMATION_REVIEW` accepted the repaired artifact structure and validation split with no unresolved P1/P2 findings. |
| First-wave cross-domino/product review found missing upstream/downstream projections, D10/G-HOST implementation blockers, D11/D13 handoff gaps, and D15 trigger ambiguity. | P1 | accepted and repaired | `$D9_FINAL_CROSS_DOMINO_REVIEW` accepted the repaired cross-domino/product contract with no unresolved P1/P2 findings. |
| Current implementation embeds MapGen public-ops validation in generic transaction code. | P1 | accepted and repaired | Final domain, topology, and cross-domino rereviews accepted the G-HOST/D10 host-gate treatment and source blocker. |
| Current root discovery can touch `mods/*/src/maps/**`, overlapping generated/protected zones. | P1 | accepted and repaired | Final topology and cross-domino rereviews accepted the D10/G-HOST protected/generated-zone blocker. |
| Public `habitat fix --json` was cited in prior gates despite no current `fix --json` flag. | P2 | accepted and repaired | Final OpenSpec/information and topology rereviews accepted the D0-controlled JSON disposition and removal of invalid current gate. |
| Formatter and gate handoffs were underspecified and could imply apply safety or product correctness. | P2 | accepted and repaired | Final TypeScript/validation and cross-domino rereviews accepted handoff state and non-claim modeling. |
| Docs and source apply lanes could collapse into one transaction path. | P2 | accepted and repaired | Final topology and OpenSpec/information rereviews accepted distinct docs/source lane requirements. |
| Live-write request lifecycle appeared circular because it required an already approved write set. | P1 | accepted and repaired | Final rereviews accepted the `DryRunIntent` / `LiveWriteIntent` / D9-produced `LiveWriteAttempt` split. |
| Implementation boundary review found D9-owned transaction input resolution discovering `mods/**/src/{recipes,maps}` roots and embedding source-lane policy in generic transaction code. | P2 | accepted and repaired | D9 now consumes D8 `ApplyTransactionInputProjection` records derived from typed rule facts or supplied explicitly by callers; filesystem/root discovery was removed from transaction runtime, focused explicit-input tests pass, and `fix --dry-run` has a production path through registry-derived projections. |
| Implementation boundary review found transaction input selection matched only opaque `transactionInputRef`, allowing mismatched `patternId`/`manifestPath` admissions to run. | P2 | accepted and repaired | `resolveTransactionInput()` now matches `{ patternId, manifestPath, transactionInputRef }` and returns `transaction-input-admission-mismatch` before any `HabitatProcess` call; `test/lib/transformation-transaction.test.ts` covers the negative case. |
| Implementation boundary review found explicit transaction inputs were schema-shaped but not repo-local/path-safe before process execution. | P2 | accepted and repaired | TypeBox schemas now constrain apply pattern paths and scan roots to repo-relative forms, invalid transaction inputs resolve to `invalid-transaction-input`, and focused tests prove `HabitatProcess` is not called for unsafe absolute paths. |
| Implementation closure review found the proposal still named the deleted transaction monolith test path. | P3 | accepted and repaired | Later implementation gates now name `test/lib/transformation-transaction.test.ts` plus future D9 split tests. |
| Implementation closure review found the positive path from default apply admissions through D8 admitted-state projection was thin. | P3 | accepted and repaired | `defaultApplyAdmissions()` now passes through `applyAdmittedState()` and `applyAdmissionProjection()`; executable transaction input is projected from typed rule facts instead of filesystem discovery. |

## Final Rereview Evidence

Accepted:

- `$D9_FINAL_DOMAIN_REVIEW`: accepted for design/specification, no unresolved P1/P2.
- `$D9_FINAL_TYPESCRIPT_VALIDATION_REVIEW`: accepted for design/specification, no unresolved P1/P2.
- `$D9_FINAL_OPENSPEC_INFORMATION_REVIEW`: accepted for design/specification, no unresolved P1/P2.
- `$D9_FINAL_CODE_VENDOR_TOPOLOGY_REVIEW`: accepted for design/specification, no unresolved P1/P2.
- `$D9_FINAL_CROSS_DOMINO_REVIEW`: accepted for design/specification, no unresolved P1/P2.
- Temporary implementation boundary reviewers Peirce the 2nd and Fermat the 2nd:
  accepted current D9 after P2 repairs; no unresolved implementation P1/P2.
