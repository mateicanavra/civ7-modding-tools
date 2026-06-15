# D2.5 Review Disposition Ledger

Status: accepted
Date: 2026-06-14

| ID | Lane | Finding | Severity | Disposition | Repair |
| --- | --- | --- | --- | --- | --- |
| D2.5-R1 | testing scout | Studio adapter lacks recoverable TypeBox origin metadata; this must be the first implementation proof because contract tests cannot otherwise prove schema origin. | P1 | accepted | Packet requires adapter origin recovery, input/output/error schema recovery tests, and alignment with the control-oRPC adapter precedent. |
| D2.5-R2 | testing scout | Existing tests are behavior-heavy and do not enumerate TypeBox contract samples, declared error data schemas, or event iterator schemas. | P2 | accepted | Testing ledger requires Value.Check/Parse matrices, declared error enumeration, adapter behavior tests, event/live schema tests, and package gates. |
| D2.5-R3 | testing scout | App-local casts from oRPC responses/events into Run in Game and Save&Deploy app status types remain current evidence. | P2 | accepted | Schema ledger records the cast sites and requires type-derivation tests plus cast negative-search closeout. |
| D2.5-R4 | testing scout | Raw-field searches need classification because status/proof fields like `processRestart.command` are legitimate evidence, while executable raw input fields are forbidden. | P2 | accepted | Proposal/design/spec/testing ledgers now require hit classification rather than naive deletion. |
| D2.5-R5 | schema scout | `studio.operations.current` and operation events duplicate looser operation schemas instead of composing canonical Run in Game / Save&Deploy DTO schemas. | P1 | accepted | Packet now requires canonical operation DTO schema reuse across endpoint status, current projection, and events. |
| D2.5-R6 | schema scout | Engine error `details?: unknown` is TypeBox-backed but still a permissive bridge; it must be classified as D3-bound residue or narrowed now. | P2 | accepted | Design/spec/schema/testing ledgers require D3 bridge classification or TypeBox-backed narrowing with tests. |
| D2.5-R7 | schema scout | Stale comments remain beyond package index, including app/server `zod-derived catalog`, and effect-orpc import boundary wording is inaccurate. | P2 | accepted | Schema ledger expands stale comment searches and requires current recipe-DAG contract/error-builder effect-orpc imports to move/delete or become router-owned builder helpers. |
| D2.5-R8 | testing/parity review | Draft checklist blurred packet acceptance with future implementation closure, making known mixed-baseline residue look like a failed acceptance gate. | P1 | accepted | Split packet acceptance gates from future implementation closure gates across proposal, design, tasks, closure checklist, and testing ledger. |
| D2.5-R9 | adversarial residue review | Literal raw-field searches can pass while `runInGame.start` remains an open public mutation input accepting arbitrary raw-control keys for downstream scanning. | P1 | accepted | Added open mutation input rule: close public input schemas or prove recovered-schema plus parser guard rejects raw-control fields before engine execution. |
| D2.5-R10 | adversarial residue review | Permissive error `details?: unknown` bridge could orphan if D3 still preserves unknown data. | P1 | accepted | Added same-stack D3 deletion/narrowing target and guard requirement for any retained permissive error-detail bridge. |
| D2.5-R11 | adversarial residue review | Stale app-as-source comments are not covered by Zod-only searches. | P2 | accepted | Added app-as-source/mirrored DTO comment residue to searches and closure rules. |
| D2.5-R12 | adversarial residue review | effect-orpc import ownership was left as a future classification decision. | P2 | accepted | Packet now requires explicit ownership rule: only router/runtime implementation may own effect-orpc imports; recipe-DAG contract/error-builder imports are implementation residue to move/delete or encapsulate behind router-owned builders. |
| D2.5-R13 | hardening/prework review | Phase record stop conditions still treated future implementation residue as packet acceptance blockers. | P1 | accepted | Split `packet-phase-record.md` into packet acceptance stop conditions and future implementation closure blockers. |
| D2.5-R14 | hardening/prework and black-ice reviews | D2.5 packet acceptance commands did not carry dependency freshness, baseline build/check, Graphite state, selected-baseline, and dirty-file quarantine proof. | P2 | accepted | Added entrance proof commands and checklist rows to proposal, tasks, testing ledger, and closure checklist. |
| D2.5-R15 | black-ice review | D2.5 allowed recipe-DAG contract/error-builder effect-orpc imports, conflicting with the controlling frame's router-isolation rule. | P2 | accepted | Aligned D2.5 to router/runtime-only effect-orpc import ownership and treats recipe-DAG imports as implementation residue. |
| D2.5-R16 | black-ice review | D3 error-details bridge timing was weaker in the prework ledger than in design/closure rules. | P2 | accepted | Prework ledger now requires the decision and any D3 packet guard update before D2.5 implementation closure. |

## Required Fresh Reviews

- TypeScript/schema authority review: accepted.
- Testing/parity review: accepted.
- Adversarial residue/orphan review: accepted.
- Hardening/prework philosophy review: accepted after targeted re-review.
- Black-ice disambiguation review: accepted after targeted re-review.

## Acceptance Summary

D2.5 has no unresolved P1/P2 findings. The final targeted reviews accepted the split between packet acceptance and future implementation closure, the explicit entrance/build/Graphite proof gates, router-only `effect-orpc` ownership, and the D3 bridge timing rule.
