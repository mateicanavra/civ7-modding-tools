# Review Disposition Ledger: deep-habitat-d9-transformation-transaction

## Status

D9 is accepted for design/specification after fresh final rereview. It is not
implementation-complete and not source-ready. Source implementation remains
blocked wherever concrete D0 rows, live D8 apply-admission projections, D10
path/generated/protected-zone decisions, or G-HOST host-gate declarations are
required and absent.

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

## Final Rereview Evidence

Accepted:

- `$D9_FINAL_DOMAIN_REVIEW`: accepted for design/specification, no unresolved P1/P2.
- `$D9_FINAL_TYPESCRIPT_VALIDATION_REVIEW`: accepted for design/specification, no unresolved P1/P2.
- `$D9_FINAL_OPENSPEC_INFORMATION_REVIEW`: accepted for design/specification, no unresolved P1/P2.
- `$D9_FINAL_CODE_VENDOR_TOPOLOGY_REVIEW`: accepted for design/specification, no unresolved P1/P2.
- `$D9_FINAL_CROSS_DOMINO_REVIEW`: accepted for design/specification, no unresolved P1/P2.
