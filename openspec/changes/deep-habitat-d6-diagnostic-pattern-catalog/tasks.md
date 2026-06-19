# Tasks

## 1. Packet Readiness

- [x] 1.1 Replace D6 scaffold language with the full diagnostic catalog domain
  model.
- [x] 1.2 Import current negative review findings into the D6 review ledger.
- [x] 1.3 Run fresh final D6 domain/ontology, code/vendor topology,
  TypeScript/validation, and OpenSpec/information rereviews against the repaired
  disk state.
- [x] 1.4 Repair every accepted P1/P2 rereview finding before packet acceptance.
- [x] 1.5 Update packet index only after rereviews record no unresolved P1/P2.

## 2. Source Implementation Prerequisites

- [x] 2.1 Create or cite concrete D0 rows for every D6-touched public/durable
  surface listed in `design.md`.
  - Source-start inventory:
    `workstream/implementation-start-inventory.md`.
  - Matrix rows include D6 durable rows for `rules.json` Grit metadata,
    registered native Grit check patterns, and native Grit fixtures.
- [x] 2.2 Cite D1 output-family decisions for command outcomes, diagnostics,
  limitations, and refusals.
  - Source-start inventory cites D1 CheckReport/RuleReport/HabitatDiagnostic,
    bounded command observation, malformed metadata, and non-claim decisions.
- [x] 2.3 Confirm live D2 projections for Grit identity, scan metadata,
  local-feedback facts, governance references, and malformed metadata output
  families.
  - D6 consumes `RuleGritFacts`; D11-owned local feedback and D8-owned
    governance remain separate D2 projections.
- [x] 2.4 Keep source implementation blocked until 2.1-2.3 are complete.
  - Complete for the source surfaces enumerated in
    `workstream/implementation-start-inventory.md`; D6 source work may begin
    only inside that boundary.

## 3. Source Implementation Slices

- [x] 3.1 Add D6-owned diagnostic model types in a canonical owner module.
  - Source slices add TypeBox-backed catalog, identity, scan-root, and failure
    schemas under `src/lib/diagnostic-catalog/`.
- [x] 3.2 Define `DiagnosticCatalogEntry` and consume D2 `ruleGritFacts`; delete
  alternate identity lookup from missing `patternIdentity` to `ruleId`.
  - Grit projection now builds a D6 catalog entry from D2 `RuleGritFacts`
    before matching observed native identity; native diagnostics now have a
    separate TypeBox-backed `native-diagnostic` catalog entry constructor and
    closed native identity that does not require `patternIdentity`.
- [x] 3.3 Define `DiagnosticScanRootDecision` and replace string/null scan-root
  authority with closed accepted/refused decisions.
  - Source slice adds the TypeBox-backed scan-root decision schema and routes
    existing Grit validation through closed accepted/refused decisions before
    rendering boundary messages. Test-directory expansion now has an explicit
    `expanded-test-files` decision with requested and effective roots.
- [x] 3.4 Define `NativeGritCheckRequest` and bounded
  `DiagnosticCommandObservation` projections with closed command families and
  parsed acquisition limited to completed command observations.
- Source slice adds a TypeBox-backed native Grit request schema with closed
  command families and output contracts, threads that request through parsed
  and adapter-failed acquisitions, and keeps parsed acquisitions limited to
  completed command observations.
- [x] 3.5 Define `DiagnosticCacheRequirement` and
  `DiagnosticCacheObservation`; make injected probes freshness-required by
  type.
- Source slice records workspace-cache-allowed versus fresh-required
  requirements in native request state, keeps cache observations bounded, and
  makes injected probe execution pass a fresh-required request contract.
- [x] 3.6 Split `DiagnosticAdapterFailureKind` from D9 apply transaction
  failures; update consumers to the D6 diagnostic failure contract.
  - Source slice adds the TypeBox-backed D6 diagnostic failure subset under
    `src/lib/diagnostic-catalog/`, moves Grit check/probe consumers to that
    subset, and leaves D9 apply transaction failures outside D6 diagnostics.
- [x] 3.7 Replace `GritCheckParseResult` boolean/optional state with closed
  acquisition outcomes.
  - Source slice replaces the parser `ok`/optional command-result DTO with the
    TypeBox-backed `GritDiagnosticAcquisition` union: parsed, adapter-failed,
    and scan-root-refused.
- [x] 3.8 Replace adapter failure message parsing with structured failure
  projection plus diagnostic rendering.
- Source slice removes text-to-failure recovery from injected probe handling,
  routes injected probe execution through `DiagnosticRunOutcome`, and drops the
  diagnostic-catalog text parser export.
- [x] 3.9 Define `DiagnosticRunOutcome` and project native results only through
  explicit `DiagnosticIdentity`; findings outcomes must carry non-empty
  diagnostic collections.
  - Grit projection now builds `DiagnosticRunOutcome` variants before converting
    to the current `RuleRunResult` boundary, with findings outcomes constructed
    only from non-empty diagnostic finding projections.
- [x] 3.10 Define `InjectedProbeOutcome`; replace proof-shaped probe fields in
  source callers and tests with D6 diagnostic/probe outcome language.
- Source slice adds the TypeBox-backed injected probe outcome schema, moves
  probe input/path/file lifecycle code into focused TypeScript modules,
  derives probe request/scope types from TypeBox schemas, and replaces
  boolean/failure-marker probe result DTO assertions with closed outcome
  variants.
- [x] 3.11 Define `DiagnosticConsumerProjection` as a discriminated projection
  derived from `DiagnosticRunOutcome` for D7/D8/D9/D11/D15, with non-empty
  diagnostics on findings projections.
  - The D6 outcome module defines the consumer projection schema and derivation
    function; downstream packets still own their packet-specific consumption.
- [x] 3.12 Delete obsolete paths and update imports/callers according to the D0
  matrix.
- Obsolete `GritCheckParseResult`, injected probe boolean/failure-marker DTOs,
  text-to-failure recovery, and proof-shaped probe fields are no longer
  referenced in the touched D6 source/test surfaces.

## 4. Source Implementation Validation

- [x] 4.1 Run `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts`.
- [x] 4.2 Run `bun run --cwd tools/habitat-harness test -- test/lib/grit-injected-probe.test.ts`.
- [x] 4.3 Run `bun run --cwd tools/habitat-harness test -- test/grit/grit-patterns.test.ts`.
- [x] 4.4 Add and run state-family tests for diagnostic adapter failure subset,
  D2 `ruleGritFacts` consumption, missing pattern identity refusal, scan-root
  decisions, cache/freshness observations, structured adapter failure
  projections, and consumer projections.
- Focused D6 tests cover the diagnostic adapter failure subset, explicit Grit
  pattern identity projection, missing pattern finding/projection states,
  scan-root refusals, cache/freshness request state, structured adapter failure
  rendering, TypeBox catalog branch validation, native catalog entries, mixed
  source/docs diagnostic outcome grouping, first-class scan-root-refused and
  cache-observation-missing outcome projection, expanded test-file scan-root
  decisions, native docs-local diagnostic outcomes, injected probe cleanup
  failure outcomes, and consumer projection.
- [x] 4.5 Run `bun run habitat check --tool grit-check --json` and selected
  Grit-rule command cases affected by D6.
- `bun run habitat check --tool grit-check --json` emits valid JSON and exits
  1 with scoped residuals: `docs-local-checkout-paths` advisory findings in
  historical scratch docs and `baseline-integrity` old-base registry parsing at
  `fbf77fe9e`. Native Grit rules no longer fail from adapter malformed-output
  projection.
- [x] 4.6 Run `git status --short --branch` before and after injected probe
  validation to confirm cleanup state.
- Status checks around focused injected probe validation returned to clean
  worktree state.
- [x] 4.7 Run `bun run openspec -- validate deep-habitat-d6-diagnostic-pattern-catalog --strict`.
- [x] 4.8 Run `bun run openspec:validate`.
- [x] 4.9 Run `git diff --check`.

## 5. Review And Realignment

- [x] 5.1 Update D7 downstream assumptions to consume `DiagnosticRunOutcome`
  without raw Grit internals.
- [x] 5.2 Update D8 downstream assumptions to consume diagnostic capability and
  injected probe outcomes without admission authority.
- [x] 5.3 Update D9 downstream assumptions to require its own transaction safety
  before writes.
- [x] 5.4 Update D11 downstream assumptions for later staged/local feedback
  consumption.
- [x] 5.5 Record D15 trigger status as dormant unless a local representation gap
  is identified.
- [x] 5.6 Leave the worktree clean or write a zero-context next packet.
