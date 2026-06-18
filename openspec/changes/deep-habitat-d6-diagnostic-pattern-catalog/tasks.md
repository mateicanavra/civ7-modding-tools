# Tasks

## 1. Packet Readiness

- [x] 1.1 Replace D6 scaffold language with the full diagnostic catalog domain
  model.
- [x] 1.2 Import current negative review findings into the D6 review ledger.
- [ ] 1.3 Run fresh final D6 domain/ontology, code/vendor topology,
  TypeScript/validation, and OpenSpec/information rereviews against the repaired
  disk state.
- [ ] 1.4 Repair every accepted P1/P2 rereview finding before packet acceptance.
- [ ] 1.5 Update packet index only after rereviews record no unresolved P1/P2.

## 2. Source Implementation Prerequisites

- [ ] 2.1 Create or cite concrete D0 rows for every D6-touched public/durable
  surface listed in `design.md`.
- [ ] 2.2 Cite D1 output-family decisions for command outcomes, diagnostics,
  limitations, receipt-shaped compatibility fields, and retained proof-shaped
  compatibility fields.
- [ ] 2.3 Confirm live D2 `ruleGritFacts` implementation for Grit identity, scan
  metadata, exclusions, hook eligibility, and malformed metadata output
  families.
- [ ] 2.4 Keep source implementation blocked until 2.1-2.3 are complete.

## 3. Later Implementation Slices

- [ ] 3.1 Add D6-owned diagnostic model types in a canonical owner module.
- [ ] 3.2 Define `DiagnosticCatalogEntry` and consume D2 `ruleGritFacts`; delete
  target fallback from missing `patternIdentity` to `ruleId`.
- [ ] 3.3 Define `DiagnosticScanRootDecision` and replace string/null scan-root
  authority with closed accepted/refused decisions.
- [ ] 3.4 Define `NativeGritCheckRequest` and bounded
  `DiagnosticCommandObservation` projections with closed command families and
  parsed acquisition limited to completed command observations.
- [ ] 3.5 Define `DiagnosticCacheRequirement` and
  `DiagnosticCacheObservation`; make injected probes freshness-required by
  type.
- [ ] 3.6 Split `DiagnosticAdapterFailureKind` from D9 apply transaction
  failures and keep any broad exported failure type only as a D0-backed
  compatibility facade.
- [ ] 3.7 Replace `GritCheckParseResult` boolean/optional state with closed
  acquisition outcomes.
- [ ] 3.8 Replace adapter failure message parsing with structured failure
  projection plus compatibility rendering.
- [ ] 3.9 Define `DiagnosticRunOutcome` and project native results only through
  explicit `DiagnosticIdentity`; findings outcomes must carry non-empty
  diagnostic collections.
- [ ] 3.10 Define `InjectedProbeOutcome`; map retained compatibility
  `proofClass` fields from `validationClass` only if D0/D1 require them.
- [ ] 3.11 Define `DiagnosticConsumerProjection` as a discriminated projection
  derived from `DiagnosticRunOutcome` for D7/D8/D9/D11/D15, with non-empty
  diagnostics on findings projections.
- [ ] 3.12 Delete or facade compatibility paths according to the D0 matrix.

## 4. Later Implementation Validation

- [ ] 4.1 Run `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts`.
- [ ] 4.2 Run `bun run --cwd tools/habitat-harness test -- test/lib/grit-injected-probe.test.ts`.
- [ ] 4.3 Run `bun run --cwd tools/habitat-harness test -- test/grit/grit-patterns.test.ts`.
- [ ] 4.4 Add and run state-family tests for diagnostic adapter failure subset,
  D2 `ruleGritFacts` consumption, missing pattern identity refusal, scan-root
  decisions, cache/freshness observations, structured adapter failure
  projections, and consumer projections.
- [ ] 4.5 Run `bun run habitat check --tool grit-check --json` and selected
  Grit-rule command cases affected by D6.
- [ ] 4.6 Run `git status --short --branch` before and after injected probe
  validation to confirm cleanup state.
- [ ] 4.7 Run `bun run openspec -- validate deep-habitat-d6-diagnostic-pattern-catalog --strict`.
- [ ] 4.8 Run `bun run openspec:validate`.
- [ ] 4.9 Run `git diff --check`.

## 5. Review And Realignment

- [ ] 5.1 Update D7 downstream assumptions to consume `DiagnosticRunOutcome`
  without raw Grit internals.
- [ ] 5.2 Update D8 downstream assumptions to consume diagnostic capability and
  injected probe outcomes without admission authority.
- [ ] 5.3 Update D9 downstream assumptions to require its own transaction safety
  before writes.
- [ ] 5.4 Update D11 downstream assumptions for later staged/local feedback
  consumption.
- [ ] 5.5 Record D15 trigger status as dormant unless a local representation gap
  is identified.
- [ ] 5.6 Leave the worktree clean or write a zero-context next packet.
