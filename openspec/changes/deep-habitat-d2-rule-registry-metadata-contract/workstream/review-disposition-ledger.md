# Review Disposition Ledger: deep-habitat-d2-rule-registry-metadata-contract

## Status

D2 is accepted for design/specification after final D2 rereview and focused code/topology recheck found no unresolved P1/P2 blockers. D2 source implementation is submitted in PR #1837 and approved for D3 advancement through user-delegated temporary-supervisor review after the accepted P2 command-context carry-forward repair. Its implementation-start blockers are resolved by the concrete D0 and D1 citations in `workstream/implementation-start-inventory.md`; global findings are applied constraints only, not acceptance evidence.

## Imported Negative Control Review

Source: `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D2-review.md`.

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Facet and projection contract was not specified. | P1 | accepted; repaired; final rereview closed | `design.md` now contains Current Diagnosis, Target Ontology, Target Type Model, Registry Field Inventory, Facet Contract, and Consumer Projection Matrix. `spec.md` now contains projection and facet requirements. |
| Public-surface compatibility and D0/D1 dependency state were unresolved. | P1 | accepted; repaired; final rereview closed | `proposal.md` and `design.md` state D0/D1 accepted-design prerequisites, concrete D0 rows required before source implementation, and D1 output families for malformed metadata. `tasks.md` requires D0/D1 citation before source edits. |
| OpenSpec spec delta was too thin to control implementation. | P1 | accepted; repaired; final rereview closed | `spec.md` now has separate requirements for versioned schema, term dispositions, projections, selectors, routing, graph, baseline, Grit, generated-zone, governance, malformed metadata, and downstream projection use. |
| Validation gates were not falsifying enough. | P2 | accepted; repaired; final rereview closed | `tasks.md` now requires focused selector, classify, baseline, Grit, hook, enforcement, generator, Pattern Authority, command, Nx, OpenSpec, and whitespace gates. `phase-record.md` records validation-result shape. |
| Downstream realignment was generic and unsafe for a high-fanout packet. | P2 | accepted; repaired; final rereview closed | `downstream-realignment-ledger.md` now names direct and indirect consumers, projections consumed, and design/source implementation gates. |
| Domain owner and inherited terminology were leaky. | P2 | accepted; repaired; final rereview closed | `design.md` now includes D2 owns/does-not-own boundaries and Term Disposition table. |
| Tasks remained open design work. | P2 | accepted; repaired; final rereview closed | `tasks.md` now orders implementation slices and names files, projections, tests, deletion requirements, and stop conditions. |

## Fresh D2 Investigation Dispositions

| Investigation | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Domain/ontology investigation: missing target ontology, ambiguous owner/tool/scope/lane/manifest terminology, underdefined projection contracts. | P1/P2 | accepted; repaired; final rereview closed | `design.md` Target Ontology, Domain Boundary, Term Disposition, Facet Contract, and Consumer Projection Matrix. |
| Code/topology investigation: implementation would still decide state model, projection contract, public compatibility, write set, and validation oracle. | P1/P2 | accepted; repaired; final rereview closed | `design.md` Current Diagnosis, Implementation Write Set, Safe Refactor Sequence; `tasks.md` slices and validation gates. |
| OpenSpec/testing investigation: packet should remain one change but lacked facet inventory, scenario-specific requirements, D0/D1 tables, and validation gates. | P1/P2 | accepted; repaired; final rereview closed | `proposal.md` confirms one OpenSpec change; `spec.md` has scenario-specific requirements; `phase-record.md` records validation shape. |
| TypeScript state-space investigation: target TypeScript model was left to implementation. | P1 | accepted; repaired; final rereview closed | `design.md` chooses `RuleRegistryDocumentV1`, closed `ownerTool` union, variant constraints, projections, and deletion of fallback states. |
| Information-design investigation: artifacts were broad shells and hid decisions. | P1/P2 | accepted; repaired; final rereview closed | `design.md` is now the decision center; `spec.md`, `tasks.md`, phase record, downstream ledger, and closure checklist mirror the same contract. |
| Cross-domino investigation: projection handoffs and downstream rows were missing; G-HOST dependency contradicted control records. | P1/P2 | accepted; repaired; final rereview closed | `downstream-realignment-ledger.md` now names projection handoffs and marks G-HOST as a parallel host-policy prerequisite, not D2-enabled. Packet-index and G-HOST dependency metadata now align: G-HOST requires D0/D1, and D10 consumes both D2 and G-HOST. |

## Final Rereview Dispositions

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Final code/topology rereview: `grit-injected-probe.ts` is a current registry consumer and D2 validation target, but was missing from the approved implementation write set and migration tasks. | P2 | accepted; repaired; focused code/topology recheck closed | `design.md` now includes `/tools/habitat-harness/src/lib/grit-injected-probe.ts` in the D2 implementation write set and safe refactor sequence. `tasks.md` now requires migrating `grit-injected-probe.ts` to `ruleGritFacts`/registry projections rather than `HarnessRule`, `rules`, `ruleById`, or raw `gritPattern`. `domino-D2-final-code-topology-recheck.md` accepts the repair. |
| Final code/topology rereview: hook/local-feedback is a D2-impacted surface and `ruleLocalFeedbackFacts` consumer, but D2 lacked a hook-specific validation oracle. | P2 | accepted; repaired; focused code/topology recheck closed | `proposal.md`, `tasks.md`, and `phase-record.md` now include `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts`. The phase-record non-claim states this proves hook-facing D2 metadata compatibility only, not D11 hook behavior closure. `domino-D2-final-code-topology-recheck.md` accepts the repair. |
| Temporary product/domain packet-boundary review: manual `CheckReport.command` string construction remains in current source and was not concretely carried into downstream execution records. | P2 | accepted; repaired as downstream handoff, not D2 source work | D2 downstream and closure records state D7 owns replacing manual check command string construction with Oclif command context / `StructuralCheckRequest` normalization, and D12 owns verify affected-target argv construction. D7 `design.md` and `tasks.md` now require removing `buildHabitatCommand`-style command/argv joins from check report construction while preserving D0/D1-compatible output. No D2 P1/P2 blockers remain. |

## Global Constraints

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Global domain-language concern catalog applied to draft scaffold. | Global constraint | applied, not acceptance evidence | D2 target terms now avoid proof/evidence product language and classify inherited terms. |
| Global OpenSpec artifact-shape constraints applied to draft scaffold. | Global constraint | applied, not acceptance evidence | D2 artifacts now follow proposal/design/spec/tasks/workstream shape. |
| Global validation-design constraints applied to draft scaffold. | Global constraint | applied, not acceptance evidence | D2 validation gates are falsifying and scenario-specific, but final rereview remains required. |

## Closed Design/Specification Gate

- [x] Fresh final D2 domain/ontology review accepts terminology and owner boundaries: `domino-D2-final-domain-ontology-review.md`.
- [x] Fresh final D2 OpenSpec/testing review accepts requirement families and validation gates: `domino-D2-final-openspec-testing-review.md`.
- [x] Fresh final D2 code/topology review accepted two P2 blockers and the focused recheck accepts both repairs: `domino-D2-final-code-topology-review.md`, `domino-D2-final-code-topology-recheck.md`.
- [x] Fresh final D2 TypeScript state-space review accepts the registry model and refactor sequence: `domino-D2-final-typescript-state-review.md`.
- [x] Fresh final D2 information-design review accepts artifact readability and no hidden design holes: `domino-D2-final-information-design-review.md`.
- [x] Fresh final D2 cross-domino review accepts projection handoffs, G-HOST alignment, and downstream rows: `domino-D2-final-cross-domino-review.md`.

D2 is accepted for design/specification and source implementation. User-delegated temporary-supervisor reviews found no unresolved D2 P1/P2 blockers after the D7 command-context carry-forward repair, so D3 may open from this D2 stack layer under the current review model.
