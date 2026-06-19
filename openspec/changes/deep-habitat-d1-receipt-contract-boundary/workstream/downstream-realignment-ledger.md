# Downstream Realignment Ledger: D1 Receipt And Command Record Boundary

## Status

D1 downstream dependencies are accepted for design/specification only after final per-domino review and re-review found no unresolved P1/P2 blockers. D1 is not implementation-complete. Concrete D0 matrix rows now exist; D1 source implementation remains blocked until the D1 execution inventory, output-family citations, inherited D0 evidence baseline, and implementation-start review dispositions are complete.

| Downstream | D1 handoff | Required downstream behavior |
| --- | --- | --- |
| D0 command surface inventory | D1 cites concrete D0 rows for every touched public/durable surface before implementation. | D0 remains compatibility authority; downstream packets cite `surface_id` instead of deciding public handling locally. |
| D2 rule registry metadata contract | D1 exposes malformed-output/non-claim families that D2 must cite when registry metadata is emitted through check/report/refusal surfaces. | D2 may own registry metadata shape but cannot invent receipt/proof semantics or bypass D1 output-family handling where it emits command reports. |
| D3/D4 workspace graph and orientation routing | `ClassifiedTarget.proof` is protected for D3/D4 as orientation/routing metadata, not a D1 receipt authority. | D3/D4 may preserve/version classify metadata through their packets; D1 cannot rename or reinterpret the field as proof/receipt ownership. |
| D5 baseline authority | Baseline failures are consumed through D2/D1 check-report and refusal/output-family boundaries. | D5 cannot treat baseline output as standalone proof or let baseline projection bypass D1 non-claims when surfaced through command reports. |
| D6 diagnostic pattern catalog | Check report and diagnostic boundaries, non-claim that diagnostics are findings inside reports. | D6 may refine diagnostic taxonomy but cannot turn diagnostics into receipt/proof semantics. |
| D7 structural enforcement pipeline | Check outcome, diagnostic status, explicit refusal/non-claim vocabulary. | D7 consumes D1 states for enforcement output and cannot invent enforcement proof language. |
| D8 pattern governance | Term-disposition rule for proof/evidence-shaped Pattern Authority fields. | D8 owns manifest vocabulary and must decide pattern-governance terms with D1 compatibility/non-claim constraints. |
| D9 transformation transaction | Apply transaction record target, lifecycle states, refusal/non-claim rules. | D9 owns behavior refactor and must collapse nullable transaction state without claiming product/runtime proof. |
| D10 protected zone authority | Refusal/recovery vocabulary for unsafe or unsupported protected-zone changes. | D10 requires D1 before defining protected-zone refusals and consumes `RefusalRecord` and non-claim semantics rather than silent skips. |
| D11 local feedback | Hook trace target, local-feedback-only non-claim, human-output compatibility rule. | D11 may rename/refine hook output after D0 row citation; it cannot imply CI authority. |
| D12 verify handoff receipt | `VerifyReceipt` target semantics, `VerifyProof` compatibility policy, affected-target states, non-claims. | D12 owns verify workflow composition and must preserve D1 handoff limits. |
| D13 scaffolding and refusal contracts | Refusal/recovery vocabulary and unsupported-shape communication. | D13 uses explicit refusals instead of fallback scaffolds or broad proof claims; its packet index dependency must cite D1 directly or explain a transitive D1 dependency through D8/G-HOST. |
| D14 authoring topology fence | Non-claim and handoff rules separating current structural substrate from future authoring topology. | D14 cannot treat D1 command records as authoring topology proof. |
| D15 execution provenance trigger | Conditional only: no trigger from D1 alone. | Trigger D15 only if multiple accepted packets need a shared execution provenance substrate beyond family-specific records. |

## Docs And Examples

| Surface | D1 disposition |
| --- | --- |
| `tools/habitat-harness/docs/IMPLEMENTED-SURFACE.md` | Classify proof/evidence language as current-state prose, compatibility example, or target replacement after D0 docs-example rows exist. |
| `tools/habitat-harness/docs/SCENARIOS.md` | Update only where D1 changes target user guidance; do not rewrite historical/current-state examples merely to hide compatibility facts. |
| Hook human-output examples | D11 consumes D1 local-feedback target meaning and D0 human-output handling. |
| Test filenames such as `proof-artifact.test.ts` and `verify-proof.test.ts` | Compatibility organization only unless D0 and D1 choose rename; reviewers must not infer target language from legacy filenames. |

## Index Update Rule

The remediation packet index records D1 as accepted for design/specification only, with `Enables` set to D6, D7, D8, D9, D10, D11, D12, D13, and D14. D10's `Requires` cell includes D1 before D10 review. D13 must cite D1 directly, or explicitly state why its D1 dependency is transitive. D1 is not implementation-complete and remains source-edit blocked until D1 execution inventory and review gates are complete.

## D10 Metadata Edit Allowance

D1 acceptance may edit only these D10 metadata surfaces to close the cross-domino dependency gate:

- `openspec/changes/deep-habitat-d10-protected-zone-authority/proposal.md`: add D1 to `Requires` and state refusal/recovery paths consume D1 `RefusalRecord` and non-claim semantics.
- `openspec/changes/deep-habitat-d10-protected-zone-authority/tasks.md`: add D1 to the dependency-gate task and forbid local redefinition of receipt/refusal vocabulary.

No D10 behavior, design, spec, validation, write-set, protected-path, or review-ledger repair is authorized by D1. D10 remains a draft scaffold until its own packet turn.
