# Closure Checklist: D6 Diagnostic Pattern Catalog

## Design/Specification Readiness

- [x] Proposal cites controlling authority and source packet through remediation
  variables.
- [x] Proposal states D6's product scenario as diagnostic capability and
  diagnostic run outcomes, not admission, baseline, or apply safety.
- [x] Design defines D6 owner boundary and forbidden owners.
- [x] Design defines identity rules for `ruleId`, `DiagnosticIdentity`,
  `diagnosticCatalogEntryId`, Grit `patternIdentity`, and native diagnostic
  identity.
- [x] Design defines closed state families for catalog entries, scan-root
  decisions, native command requests, adapter outcomes, cache observations,
  diagnostic projections, run outcomes, injected probe outcomes, and consumer
  projections.
- [x] Design separates D6 diagnostic adapter failures from D9 apply transaction
  failures.
- [x] Design enumerates public/durable D0 surface blockers.
- [x] Design records D1 and D2 source implementation blockers.
- [x] Design records D15 as dormant unless a local representation gap is found.
- [x] Spec delta uses normative SHALL language with accepted/refused scenarios.
- [x] Tasks are ordered semantic slices rather than unresolved design questions.
- [x] Phase record records design-time gates, later implementation gates, and
  non-claims.
- [x] Downstream realignment names D7, D8, D9, D11, D13, and D15 handoffs.
- [x] Prior D6 domain/ontology, TypeScript/validation, OpenSpec/information, and
  code/vendor findings are imported into the review ledger.
- [x] Fresh final D6 rereview lanes read the latest repaired disk state after
  TypeScript/OpenSpec blocker repair and non-empty findings-state repair.
- [x] Review ledger has no accepted unresolved P1/P2 findings.
- [x] D6 complete-standard wording audit passes over active packet/control/final
  scratch surfaces or any remaining historical quotation is explicitly
  non-guidance.
- [x] `bun run openspec -- validate deep-habitat-d6-diagnostic-pattern-catalog --strict` passes after all repairs.
- [x] `bun run openspec:validate` passes after all repairs.
- [x] `git diff --check` passes after all repairs.
- [x] Packet index is updated only after final rereview acceptance, and only to
  accepted for design/specification, not implementation-complete.

## Source Implementation Closure (Later)

- [ ] Concrete D0 rows exist for every touched D6 public/durable surface.
- [ ] D1 output-family decisions are cited where D6 touches command outcomes,
  limitations, adapter artifacts, or refusals.
- [ ] Live D2 `ruleGritFacts` projections exist and D6 source consumes them.
- [ ] Source changes stay inside the approved D6 write set or the phase record is
  amended before edits.
- [ ] D6 failure-subset tests prevent `GritApply*` transaction states from
  appearing in diagnostic acquisition/projection/probe outcomes.
- [ ] Adapter tests cover structured failure projection before diagnostic
  rendering.
- [ ] Scan-root decision tests cover accepted, expanded-test-files, probe-only,
  empty, outside, missing, generated, protected, and unapproved roots.
- [ ] Cache/freshness tests distinguish workspace-unknown allowed from
  fresh-required missing observation.
- [ ] Injected probe tests cover expected finding, control match, metadata
  refusal, adapter failure, and cleanup/final status.
- [ ] Native Grit fixture tests and current-tree Habitat Grit command tests are
  recorded with distinct non-claims.
- [ ] `git status --short --branch` confirms injected probe cleanup leaves no
  source-tree residue.
- [ ] Graphite layer is clean, reviewable, and does not proceed past unresolved
  packet approval.
