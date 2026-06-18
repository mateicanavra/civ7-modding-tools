# Review Disposition Ledger: D1 Receipt And Command Record Boundary

## Status

D1 is accepted for design/specification only. Final per-domino review and re-review found no accepted unresolved P1/P2 findings after repair. D1 is not implementation-complete, and source edits remain blocked until concrete D0 matrix rows exist for every affected public or durable surface.

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Global domain-language concern catalog applied to draft scaffold. | Global constraint | applied, not acceptance evidence | This packet treats global findings as constraints only; D1 acceptance comes from the per-domino review and re-review records below. |
| Global OpenSpec artifact-shape constraints applied to draft scaffold. | Global constraint | applied, not acceptance evidence | Proposal/design/tasks/spec/workstream files were rewritten as D1-specific design, not broad scaffold. |
| Global information-design constraints applied to draft scaffold. | Global constraint | applied, not acceptance evidence | D1 now records state, sequence, write set, protected paths, validation gates, and downstream consumers in stable locations. |
| Global validation-design constraints applied to draft scaffold. | Global constraint | applied, not acceptance evidence | Validation gates now include expected status, oracle, bad case, cache/freshness stance, and non-claims. |
| Global cross-domino sequencing constraints applied to draft scaffold. | Global constraint | applied, not acceptance evidence | Downstream ledger now names D6-D14 consumers and conditional D15 trigger status. |
| Prior D1 review: no schema/non-claim/current-test inventory. | P1 | accepted, repaired and accepted in final review | `design.md` now includes D0 surface dependency inventory, target semantic objects, canonical non-claims, state families, and required tests/gates. |
| Prior D1 review: public-surface compatibility circular / D0 dependency unresolved. | P1 | accepted, repaired and accepted in final review | `proposal.md`, `design.md`, `tasks.md`, and `phase-record.md` state D1 implementation is blocked until concrete D0 rows exist; design may proceed against D0 accepted row contract. |
| Prior D1 review: domain boundary too broad. | P1 | accepted, repaired and accepted in final review | `design.md` now separates shared D1 receipt/handoff semantics from check, verify, hook, apply, adapter, Graphite, and OpenSpec owners. |
| Prior D1 review: spec delta too thin. | P2 | accepted, repaired and accepted in final review | `specs/habitat-harness/spec.md` now contains separate requirements for classification, check reports, diagnostics, verify receipts, hooks, apply transactions, adapter artifacts, legacy DTOs, refusals, typed relationships, non-claims, and Graphite/OpenSpec separation. |
| Prior D1 review: validation not falsifying enough and omitted verify/fix/hook surfaces. | P2 | accepted, repaired and accepted in final review | `tasks.md` and `phase-record.md` now require focused tests plus `habitat check --json`, `habitat verify --json`, `habitat fix --dry-run`, `habitat hook --help`, and OpenSpec/git gates with bad cases. |
| Prior D1 review: write set/protected paths absent. | P2 | accepted, repaired and accepted in final review | `proposal.md` and `design.md` now define the approved write set and protected paths. |
| Prior D1 review: downstream effects underspecified. | P2 | accepted, repaired and accepted in final review | `workstream/downstream-realignment-ledger.md` now names D6-D14 dependencies and D15 trigger rule. |
| Prior D1 review: historical proof/artifact language in docs/hook output not dispositioned. | P2 | accepted, repaired and accepted in final review | `design.md` term disposition and D0 inventory classify hook notice, docs phrases, adapter artifact names, proof ids/classes, and test filename semantics as compatibility facts unless target-retained. |
| Domain/ontology investigation: no closed relationship/state ontology. | P1 | accepted, repaired and accepted in final review | `design.md` now names typed relations, closed state families, term dispositions, and canonical non-claims. |
| Code/topology investigation: D1 could accidentally touch classify/Pattern Authority surfaces. | P1 | accepted, repaired and accepted in final review | `design.md` and `tasks.md` protect `ClassifiedTarget.proof` and Pattern Authority proof fields for D3/D4/D8/D13 unless D0 and owning packets authorize D1 edits. |
| OpenSpec/testing investigation: tasks were open questions rather than implementation actions. | P2 | accepted, repaired and accepted in final review | `tasks.md` now orders grounding, D0 prerequisite, inventory, implementation sequence, bad-case tests, validation, review, and realignment. |
| Final information-design review: execution inventory lacks complete row contract and stable recording shape. | P1 | accepted, repaired and re-reviewed | `design.md` now defines the D1 execution inventory row contract with D0 row slot, plane, contract state, compatibility handling, schema stance, owner, tests, bad cases, non-claims, downstream consumers, and implementation disposition. Cleared by `domino-D1-rereview-domain-information.md`. |
| Final information-design review: validation gates lack a defined place for actual results. | P2 | accepted, repaired and re-reviewed | `workstream/phase-record.md` now includes `Validation Results Recording Contract`, and `tasks.md` requires recording results there. Cleared by `domino-D1-rereview-domain-information.md` and `domino-D1-rereview-validation-openspec.md`. |
| Final information-design and cross-domino reviews: packet index dependency implications stale. | P2 | accepted, repaired and re-reviewed | D1 downstream ledger now requires correcting the D1 `Enables` cell and adding D1 to D10 prerequisites; packet index and D10 draft were updated accordingly. Cleared by `domino-D1-rereview-cross-domino.md`. |
| Control cleanup: D1 protected-path text did not name the D10 metadata edit exception it relied on. | P2 | accepted, repaired and re-reviewed | `proposal.md`, `design.md`, and `downstream-realignment-ledger.md` now allow only D10 dependency metadata edits and explicitly forbid D10 behavior/design/spec/validation repair during D1. Cleared by `domino-D1-rereview-domain-information.md` and `domino-D1-rereview-validation-openspec.md`. |
| Final testing/validation review: combined focused D1 test gate is not exact. | P2 | accepted, repaired and re-reviewed | `tasks.md` and `phase-record.md` now use the exact combined Vitest command. Cleared by `domino-D1-rereview-validation-openspec.md`. |
| Final testing/validation review: adapter artifact retention and bounded raw-output oracles are underdefined. | P2 | accepted, repaired and re-reviewed | `spec.md`, `tasks.md`, and `phase-record.md` now require closed retention handling and bounded raw-output metadata bad cases. Cleared by `domino-D1-rereview-validation-openspec.md`. |
| Final domain/ontology review: D0 action vocabulary mixed with D1 strategy terms. | P2 | accepted, repaired and re-reviewed | `proposal.md` separates D0 contract state from closed compatibility handling; `design.md` inventory now uses D0 row slots and moves D1 strategy to a separate column. Cleared by `domino-D1-rereview-domain-information.md`. |
| Final domain/ontology review: relationship endpoints underdefined. | P2 | accepted, repaired and re-reviewed | `design.md` now defines `CommandInvocation`, `PostStateObservation`, `LegacyCompatibilitySurface`, `DownstreamHandoffTarget`, and `RefusedRequest`, and the relationship table names allowed endpoint classes. Cleared by `domino-D1-rereview-domain-information.md`. |
| Final domain/ontology review: diagnostics and adapter capture ownership not single-authority sharp. | P2 | accepted, repaired and re-reviewed | `design.md` splits check report summary ownership from D6/D7 diagnostic taxonomy and names current adapter artifact ownership constrained by D1, with D15 only if later triggered. Cleared by `domino-D1-rereview-domain-information.md`. |
| Final domain/ontology review: normative spec uses target-suspect evidence language. | P3 | accepted, repaired and re-reviewed | `spec.md` now says apply change observation instead of the reviewed target-suspect phrase. Cleared by `domino-D1-rereview-domain-information.md`. |

## Final Review Requirement

D1 final review requirement is satisfied for design/specification acceptance. Required scratch records:

- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-final-domain-ontology-review.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-final-openspec-review.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-final-code-topology-review.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-final-testing-validation-review.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-final-information-design-review.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-final-cross-domino-review.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-rereview-domain-information.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-rereview-validation-openspec.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-rereview-cross-domino.md`
