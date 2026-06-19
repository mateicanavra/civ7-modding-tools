# Review Disposition Ledger: deep-habitat-d7-structural-enforcement-pipeline

## Status

D7 is accepted for design/specification after fresh final rereview found no
unresolved P1/P2 blockers. The current D7 branch implements the authorized
check/report source slice; D11/D12 projection consumption, D10 protected-zone
authority, and the broad enforcement-surface freshness gate remain outside this
slice. All first-wave P1/P2 findings were accepted as repair input and repaired
in the packet.

## Findings

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Global domain-language concern catalog applies to D7 but is not acceptance evidence. | Global constraint | applied | Rewritten packet defines D7 target ontology and rejected terms; final D7 domain rereview remains required. |
| Global OpenSpec artifact-shape constraints apply to D7 but are not acceptance evidence. | Global constraint | applied | Proposal/design/spec/tasks/control records were expanded; final D7 OpenSpec/information rereview remains required. |
| Global validation-design constraints apply to D7 but are not acceptance evidence. | Global constraint | applied | `design.md`, `tasks.md`, and phase record now split design-time and later implementation gates. |
| Global cross-domino sequencing constraints apply to D7 but are not acceptance evidence. | Global constraint | applied | D7 dependencies and downstream consumer contracts are recorded; final cross-domino rereview remains required. |
| D7 packet lacked executable information architecture and did not define the Structural Enforcement ontology. | P1 | accepted and repaired | `design.md` now defines target terms, rejected terms, state model, pipeline stages, and false-green invariants; `$D7_FINAL_DOMAIN_REVIEW` accepted with no unresolved P1/P2. |
| D7 did not specify consumed adjacent-domain contracts and left local recomputation paths open. | P1 | accepted and repaired | `proposal.md` and `design.md` now define D2/D3/D5/D6/D10 consumed-contract matrices and source blockers; final cross-domino review accepted with no unresolved P1/P2. |
| False-green not-run/refusal states were incomplete. | P1 | accepted and repaired | `design.md` and `spec.md` now require explicit `RuleExecutionDisposition`, dependency-refused states, not-applicable states, and non-passing adapter/graph/baseline/protected-zone refusals; final TypeScript/validation review accepted with no unresolved P1/P2. |
| `CheckReport`, rendering, and exit status were not one truth-preserving contract. | P2 | accepted and repaired | `design.md` defines `CheckOutcome`, `CheckReportConstructionResult`, rendering/exit derivation, and semantic validation; `spec.md` adds contradiction rejection and rendering truth requirements; final TypeScript/validation review accepted with no unresolved P1/P2. |
| Selector request/result/refusal identity was underspecified. | P2 | accepted and repaired | `design.md` and `spec.md` now define `SelectorRequest`, `RuleSelectionOutcome`, `SelectorRefusal`, and selected-set rules; final domain/ontology and TypeScript/validation reviews accepted with no unresolved P1/P2. |
| Validation gates were broad and cited invalid current command for `--rule baseline-integrity`. | P2 | accepted and repaired | `design.md`, `proposal.md`, `tasks.md`, and phase record now state `baseline-integrity` is currently a built-in row, not a selectable rule, and require D0/D7 decision before citing a selectable command gate; final validation review accepted with no unresolved P1/P2. |
| Public compatibility blockers were generic. | P1 | accepted and repaired | `design.md` and `workstream/implementation-start-inventory.md` now cite concrete D0 rows and closed D0 handling values for the D7 source slice; source implementation remains blocked only for surfaces outside that inventory. |
| D11/D12 consumer contracts were missing. | P1 | accepted and repaired | `design.md`, `spec.md`, and downstream ledger now define `LocalFeedbackCheckProjection` and `VerifyCheckSummaryProjection` contracts; final domain/ontology and cross-domino reviews accepted with no unresolved P1/P2. |
| Tasks were unresolved design questions. | P2 | accepted and repaired | `tasks.md` now separates packet readiness, prerequisites, characterization, state model, pipeline migration, consumer projections, validation, and downstream closure; final OpenSpec/information review accepted with no unresolved P1/P2. |
| Workstream ledgers were generic and could not support closure. | P2 | accepted and repaired | Phase record, review ledger, downstream ledger, and closure checklist now record D7-specific state, blockers, validations, and acceptance gates; final OpenSpec/information review accepted with no unresolved P1/P2. |
| Final domain/ontology rereview found one P3 refusal-label alignment polish item. | P3 | accepted and repaired | `design.md` and `spec.md` now state diagnostic, baseline, graph, and protected-zone labels are owner-specific upstream refusals projected through D7, not new D7 policy domains. |

## Final Rereview Evidence

Fresh final rereview records against the repaired disk state found no unresolved
P1/P2 across:

| Lane | Scratch record | Result |
| --- | --- | --- |
| Domain/ontology | `$D7_FINAL_DOMAIN_REVIEW` | ACCEPTED; no unresolved P1/P2 |
| TypeScript state-space and validation | `$D7_FINAL_TYPESCRIPT_VALIDATION_REVIEW` | ACCEPTED; no unresolved P1/P2 |
| OpenSpec/information design | `$D7_FINAL_OPENSPEC_INFORMATION_REVIEW` | ACCEPTED; no unresolved P1/P2 |
| Code/topology and cross-domino sequencing | `$D7_FINAL_TOPOLOGY_CROSS_DOMINO_REVIEW` | ACCEPTED; no unresolved P1/P2 |

Accepted design/specification plus the source-start inventory authorizes the D7
structural check/report source slice. Protected-zone authority remains blocked
until D10 lands.

## Source Slice Review Notes

- Live source no longer contains `legacyScopedRule`, `ScopedRule`, or a
  classify fallback adapter; classify output uses the canonical `RuleRouting`
  shape with `coverageKind`.
- The D7 check-report API no longer accepts raw `commandArgs`; Oclif callers
  pass `CheckCommandContext`, and package default construction uses an empty
  `habitat check` context.
- TypeBox schemas in `src/lib/check/schema.ts` are the source of truth for
  check report DTO validation and derived TypeScript types.
