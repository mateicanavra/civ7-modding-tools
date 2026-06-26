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
- [x] Packet index updates are deferred until packet-boundary approval.

## Source Implementation Closure

- [x] Concrete D0 rows exist for every touched D6 public/durable surface.
- [x] D1 output-family decisions are cited where D6 touches command outcomes,
  limitations, adapter artifacts, or refusals.
- [x] Live D2 `ruleGritFacts` projections exist and D6 source consumes them.
- [x] Source changes stay inside the approved D6 write set or the phase record is
  amended before edits.
- [x] D6 failure-subset tests prevent `GritApply*` transaction states from
  appearing in diagnostic acquisition/projection/probe outcomes.
- [x] Adapter tests cover structured failure projection before diagnostic
  rendering.
- [x] Scan-root decision tests cover accepted, expanded-test-files, probe-only,
  empty, outside, missing, generated, protected, and unapproved roots.
- [x] Cache/freshness tests distinguish workspace-unknown allowed from
  fresh-required missing observation.
- [x] Injected probe tests cover expected finding, control match, metadata
  refusal, adapter failure, cleanup/final status, and cleanup failure as a
  closed `probe-cleanup-failed` outcome.
- [x] Native diagnostic catalog tests cover a D6-owned `native-diagnostic`
  entry with closed native identity and no Grit `patternIdentity`.
- [x] Native docs-local diagnostics flow through a real D6
  `native-diagnostic` outcome instead of an adapter-failed stand-in.
- [x] TypeBox catalog-branch tests reject cross-domain scan/projection
  contracts instead of allowing generic catalog rows to leak across Grit/native
  consumers.
- [x] Mixed source/docs diagnostic outcome tests preserve JSON source grouping
  and text docs grouping instead of collapsing them into one output family.
- [x] Diagnostic outcome tests preserve `scan-root-refused` and
  `cache-observation-missing` as first-class machine states instead of thinning
  them into generic adapter failures.
- [x] Injected probe scope schema carries only domain-used path and scan-root
  fields, not process/provenance metadata.
- [x] Native Grit fixture tests and current-tree Habitat Grit command tests are
  recorded with distinct non-claims.
- [x] `git status --short --branch` confirms injected probe cleanup leaves no
  source-tree residue.
- [x] Graphite layer must be verified clean before submission and does not
  proceed past unresolved packet approval.

## Residual Validation Context

- `bun run habitat check --tool grit-check --json` emits valid D0/D1-compatible
  JSON and no native Grit adapter malformed-output failures. It exits 1 from
  scoped residuals outside D6 source closure: `docs-local-checkout-paths`
  advisory findings in historical scratch docs and `baseline-integrity`
  old-base registry parsing at `fbf77fe9e`.
