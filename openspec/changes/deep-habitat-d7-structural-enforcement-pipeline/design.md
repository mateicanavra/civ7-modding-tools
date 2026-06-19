# Design: D7 Structural Enforcement Pipeline

## Frame

D7 is the Structural Enforcement owner for `habitat check`: it composes accepted
upstream results into a finalized check outcome, public report, rendering, and
exit decision. It does not decide registry metadata, graph truth, baseline
authority, diagnostic acquisition, or protected-zone policy. It makes those
inputs explicit enough that implementation can collapse the current broad
`createCheckReport` state space without inventing product/domain decisions.

Acceptance threshold: the packet is acceptable for design/specification only
when an implementation agent can name every D7-owned state, consumed upstream
projection, public-surface blocker, validation oracle, and downstream consumer
contract without opening chat history.

## Current Enforcement Inventory

| Current surface | Current role | Public/D0 plane | Target owner | Target D7 stage | False-green risk |
| --- | --- | --- | --- | --- | --- |
| `CheckOptions` in `$HABITAT_TOOL/src/lib/command-engine.ts` | One optional object for selectors, base, command args, staged mode, and staged paths. | package-export if exposed through `createCheckReport`; command behavior through CLI flags. | D7 for check request normalization; D11 for hook invocation policy later. | `StructuralCheckRequest` construction. | `stagedPaths` without staged mode, baseline authoring mixed with report emission, and command rendering args leaking into execution planning. |
| `selectRules` / `RuleSelectionResult` | Selects whole `HarnessRule` rows or returns selector failure. | package-export, command-json/human through selector failures. | D2 owns selector facts; D7 owns check-level selector outcome projection. | `RuleSelectionOutcome`. | Selector failure can be projected as a fake executed rule without internal distinction. |
| `rulesForExecution` | Drops staged Grit rules when no approved staged roots exist. | command behavior and hook behavior. | D7 for execution disposition; D11 owns hook sequencing. | `RuleExecutionPlan` and `RuleExecutionDisposition`. | Selected rules can disappear from reports without a not-run/refused state when user selected a scoped check. |
| `executeSelectedRules` | Groups Grit, computes scan roots, runs Grit, and runs native/file-layer rules. | command behavior, package-internal. | D6 owns diagnostic acquisition; D7 owns orchestration over consumer projections. | `RuleExecutionObservation`. | Adapter failure or scan-root refusal can collapse into ordinary diagnostics or absence of diagnostics. |
| `executeRule` in `$HABITAT_TOOL/src/rules/architecture.ts` | Runs non-Grit detect commands or file-layer rules from whole registry rows. | package-export and command behavior. | D2/D3/D6/D10 inputs; D7 aggregation. | Execution observation over accepted projections. | Wrapper exit 0 can be treated as structural pass without D3 dependency resolution. |
| `loadBaselineState` / `applyBaseline` / `checkBaselineIntegrity` | Loads baseline files, mutates diagnostics, emits baseline failures and built-in integrity row. | command-json/human, durable baseline data, package exports. | D5. D7 consumes D5 results. | `BaselineApplicationOutcome` and built-in report row construction. | Baseline-covered diagnostics can disappear or baseline refusals can be folded into ordinary findings. |
| `RuleReport` / `CheckReport` in `$HABITAT_TOOL/src/lib/diagnostics.ts` | Public report DTOs with settable `ok`, status strings, diagnostics. | package-export, command-json, docs examples. | D7 for check report construction; D1 constrains boundary. | `CheckReportConstructionResult`. | Structurally valid report can say `ok: true` while containing a failing rule. |
| `validateCheckReport` | Shape-only validation. | package-export, command-json guard. | D7 with D1 compatibility. | Semantic report validator or constructor gate. | Contradictory reports survive validation and rendering. |
| `renderCheckReport` / `stringifyCheckReport` / `$HABITAT_TOOL/src/rules/messages.ts` | Renders JSON/human output from `CheckReport`. | command-json, human-output, package-export. | D7. | `RenderedCheckReport` and `CheckExitDecision`. | Renderer can present PASS from `report.ok` while counts show failing reports. |
| `verify` command check summary | Calls `createCheckReport` and summarizes rule status counts. | command-json for verify. | D12 consumes D7 projection; D7 publishes check summary. | `VerifyCheckSummaryProjection`. | Verify currently loses selector request facts and must infer skipped affected target semantics from `report.ok`. |
| hooks parsing check JSON | Reads check reports and Grit adapter failures for local feedback. | hook and human-output. | D11 consumes D7 projection. | `LocalFeedbackCheckProjection`. | Hook semantics can be inferred from current JSON or message text instead of D7/D11 contracts. |

## Domain Boundary

| Concern | Owner | D7 use |
| --- | --- | --- |
| Public compatibility plane, row ids, and handling action. | D0 | D7 blocks source changes until concrete rows exist. |
| Check report family limits, non-claims, refusal/receipt boundary. | D1 | D7 inherits report/diagnostic/refusal boundaries and does not call a `CheckReport` a receipt. |
| Selector facts, rule report facts, rule execution facts, rule facet projections. | D2 | D7 consumes projections and selected rule ids; D7 does not parse whole registry rows as authority. |
| Graph target availability, alias dependency resolution, graph refusals. | D3 | D7 consumes graph invocation availability/refusal for check-related target surfaces. |
| Baseline application, baseline integrity, baseline refusals. | D5 | D7 renders D5 results into check rows. |
| Diagnostic acquisition, adapter outcomes, diagnostic projections. | D6 | D7 consumes D6 outcomes and maps them to enforcement rows. |
| Protected/generated-zone guard decisions and refusals. | D10 | D7 renders D10 guard results; D7 does not own protected-zone policy. |
| Hook sequencing and local feedback trace. | D11 | D7 publishes a local-feedback-safe check projection. |
| Verify handoff receipt and affected-target execution. | D12 | D7 publishes a verify-check summary projection. |

## Target Ontology

Accepted D7 target terms:

| Term | Meaning |
| --- | --- |
| `StructuralCheckRequest` | Normalized check operation: Oclif-derived command context, selector request, check mode, base request, staged request when present. |
| `SelectorRequest` | User selector intent over owner, rule, tool, and command scope. |
| `RuleSelectionOutcome` | Accepted selected rule set or selector refusal. |
| `SelectorRefusal` | Unknown selector, wrong selector namespace, or empty selector intersection. |
| `SelectedRuleSet` | Non-empty selected rule identities plus D2 selector facts. |
| `StructuralDependencyAvailability` | Per-check availability/refusal of D2, D3, D5, D6, and D10 inputs. |
| `RuleExecutionPlan` | D7-owned plan for each selected rule using accepted upstream projections. |
| `RuleExecutionDisposition` | Executed, not applicable, refused by upstream dependency, or failed before diagnostics. |
| `DiagnosticConsumptionOutcome` | D6 diagnostic consumer projection as consumed by D7. |
| `BaselineApplicationOutcome` | D5 baseline application/integrity result as consumed by D7. |
| `StructuralRuleOutcome` | D7 aggregation of rule identity, lane, execution disposition, diagnostic outcome, baseline outcome, and dependency state. |
| `RuleReportDraft` | Internal constructor input for one public `RuleReport`; not exported as current public DTO unless D0 versions/facades it. |
| `CheckOutcome` | Final D7 state: passed, failed, advisory-only, selector-refused, dependency-refused, or no-applicable-rules. |
| `CheckReportConstructionResult` | Constructed public `CheckReport` plus semantic consistency state. |
| `LocalFeedbackCheckProjection` | D11-safe projection that preserves local-only non-claims. |
| `VerifyCheckSummaryProjection` | D12-safe projection for affected-target skip/execute decisions. |

Rejected target language:

- `pipeline ownership and inputs` without a state model.
- `rule execution result` when it conflates process exit, diagnostic projection,
  adapter failure, rule report status, and baseline result.
- `selected rules` when it means whole mutable `HarnessRule` rows.
- `baseline decision` without specifying application, integrity, expansion, or
  projection context.
- `Grit result` as D7 input; D7 consumes D6 outcomes/projections.
- `graph facts` without D3 availability/refusal state.
- `generated-zone guard` as D7-owned policy; D7 consumes D10 decisions.
- `skip` or `silent skip`; use an explicit `not-applicable` or
  `dependency-refused` disposition with report/exit semantics.
- `CheckReport.ok` as a free settable boolean inside core D7 code.
- proof/evidence-shaped names as target language; current public names remain
  compatibility facts where D0/D1 require them.

## Consumed Contract Matrix

| Upstream | D7 consumes | D7 must not do |
| --- | --- | --- |
| D2 | `ruleSelectorFacts`, `ruleReportFacts`, `ruleExecutionFacts`, `ruleBaselineFacts`, `ruleGritFacts`, and `ruleGeneratedZoneFacts` as relevant to selected rules. | Consume whole registry rows as target authority, parse prose `scope`, or treat optional `gritPattern`, `generatedZone`, `nxTarget`, `hookScope`, or `detect` fields as a replacement for D2 projections. |
| D3 | Available project target, unavailable target, alias target dependency resolution, aggregate/workspace target state, and `GraphRefusal` states for check-related Nx invocation surfaces. | Treat wrapper exit 0, `node -e ""`, or missing dependency execution as structural success. |
| D5 | `BaselineApplicationResult`, `BaselineIntegrityResult`, D5 refusal reasons, and command diagnostics generated from D5 refusals. | Load/apply baseline internals, decide shrink-only growth, accept rule-introduction manifests, or validate external exception projection locally. |
| D6 | `DiagnosticRunOutcome` or `DiagnosticConsumerProjection`: clean, non-empty findings, scan-root refused, adapter failed, projection missed, unexpected identity, cache observation missing. | Parse raw Grit JSON/text/process records, infer Pattern Governance, infer apply safety, or downgrade adapter failure to pass. |
| D10 | Protected-zone guard accepted/refused states and recovery guidance. | Define generated/protected-zone policy, downgrade protected-zone refusal to advisory, or infer write approval. |

## Target State Model

```ts
type NonEmptyReadonlyArray<T> = readonly [T, ...T[]];

type StructuralCheckRequest =
  | { kind: "current-tree-check"; selectors: SelectorRequest; base: BaselineComparisonRequest; command: CommandContext }
  | { kind: "staged-check"; selectors: SelectorRequest; staged: StagedCheckScope; base: BaselineComparisonRequest; command: CommandContext }
  | { kind: "baseline-authoring"; selectors: SelectorRequest; expansion: BaselineExpansionRequest; command: CommandContext };

type RuleSelectionOutcome =
  | { kind: "selected"; selector: SelectorRequest; facts: readonly RuleSelectorFact[]; selected: NonEmptyReadonlyArray<SelectedRuleIdentity> }
  | { kind: "selector-refused"; selector: SelectorRequest; refusal: SelectorRefusal; facts: readonly RuleSelectorFact[] };

type RuleExecutionDisposition =
  | { kind: "executed"; durationMs: number; observation: CommandObservation }
  | { kind: "not-applicable"; reason: "staged-scope-no-approved-roots" | "rule-not-in-requested-scope" }
  | { kind: "dependency-refused"; owner: "D2" | "D3" | "D5" | "D6" | "D10"; refusal: UpstreamRefusal }
  | { kind: "execution-failed"; failure: RuleExecutionFailure };

type DiagnosticConsumptionOutcome =
  | { kind: "clean"; diagnostics: readonly [] }
  | { kind: "findings"; diagnostics: NonEmptyReadonlyArray<NormalizedRuleDiagnostic> }
  | { kind: "diagnostic-refused"; reason: DiagnosticRefusalReason; diagnostic: NormalizedRuleDiagnostic };

type BaselineApplicationOutcome =
  | { kind: "baseline-applied"; covered: readonly DiagnosticKey[]; uncovered: readonly NormalizedRuleDiagnostic[]; locked: boolean }
  | { kind: "baseline-refused"; refusal: BaselineRefusal; diagnostic: NormalizedRuleDiagnostic }
  | { kind: "integrity-accepted"; result: BaselineIntegrityResult }
  | { kind: "integrity-refused"; refusal: BaselineIntegrityRefusal; diagnostic: NormalizedRuleDiagnostic };

type StructuralRuleOutcome =
  | { kind: "rule-passed"; lane: "enforced"; diagnostics: readonly NormalizedRuleDiagnostic[]; covered: readonly DiagnosticKey[] }
  | { kind: "rule-failed"; lane: "enforced"; failingDiagnostics: NonEmptyReadonlyArray<NormalizedRuleDiagnostic>; covered: readonly DiagnosticKey[] }
  | { kind: "rule-advisory-findings"; lane: "advisory"; diagnostics: NonEmptyReadonlyArray<NormalizedRuleDiagnostic> }
  | { kind: "rule-refused"; lane: "enforced" | "advisory"; refusal: RuleRefusal; diagnostics: NonEmptyReadonlyArray<NormalizedRuleDiagnostic> }
  | { kind: "rule-not-applicable"; lane: "enforced" | "advisory"; reason: "staged-scope-no-approved-roots" };

type CheckOutcome =
  | { kind: "passed"; reports: readonly FinalizedRuleReport[] }
  | { kind: "failed"; failingReports: NonEmptyReadonlyArray<FinalizedRuleReport>; reports: NonEmptyReadonlyArray<FinalizedRuleReport> }
  | { kind: "advisory-only"; advisoryReports: NonEmptyReadonlyArray<FinalizedRuleReport>; reports: NonEmptyReadonlyArray<FinalizedRuleReport> }
  | { kind: "selector-refused"; refusalReport: FinalizedRuleReport }
  | { kind: "dependency-refused"; refusalReports: NonEmptyReadonlyArray<FinalizedRuleReport>; reports: NonEmptyReadonlyArray<FinalizedRuleReport> }
  | { kind: "no-applicable-rules"; selector: SelectorRequest; report: FinalizedRuleReport };
```

Construction rules:

- `findings` variants use non-empty arrays.
- `CheckOutcome.kind == "passed"` cannot contain a report with status `fail`.
- `CheckOutcome.kind == "advisory-only"` exits 0 but must carry advisory report
  rows.
- `selector-refused`, `dependency-refused`, and enforced `rule-failed` outcomes
  exit nonzero.
- Public `CheckReport.ok` is derived from `CheckOutcome`; core D7 code does not
  accept a raw `ok` boolean except inside D0/D1 compatibility facades and tests.
- Covered diagnostics remain in report rows with covered/baselined state; D7
  does not erase them to make a rule look clean.
- Owner-specific refusals such as diagnostic acquisition refusal, baseline
  refusal, graph refusal, and protected-zone refusal remain attached to their
  owning upstream state and are projected through D7 as dependency/refusal
  outcomes with explicit owner and reason fields. D11 and D12 may expose
  audience-specific refusal labels, but they do not create new D7-owned refusal
  domains.

## Pipeline Stages

1. Request normalization constructs `StructuralCheckRequest` from CLI/package
   inputs and rejects impossible option combinations before execution planning.
2. Selector resolution consumes D2 selector facts and produces
   `RuleSelectionOutcome`.
3. Execution planning consumes D2 execution facets plus D3/D6/D10 availability
   facts and creates one `RuleExecutionPlan` per selected rule.
4. Diagnostic consumption consumes D6 projections and refuses adapter/projection
   failure states.
5. Baseline application consumes D5 application/integrity results and preserves
   covered, uncovered, and refusal diagnostics.
6. Rule aggregation derives `StructuralRuleOutcome` from lane, diagnostics,
   baseline state, and dependency disposition.
7. Report construction converts rule outcomes into public-compatible
   `RuleReport` rows and derives `CheckOutcome`.
8. Rendering/stringifying consumes only the finalized report outcome and cannot
   derive independent status.
9. Exit decision derives only from `CheckOutcome`.

## False-Green Invariant Matrix

| Risk | Target prevention | Required later oracle |
| --- | --- | --- |
| `ok: true` with failing rule. | Constructor derives `ok`; semantic validator rejects contradictions. | Unit test with contradictory report plus constructor tests. |
| Selector failure treated as selected-rule pass. | `selector-refused` outcome cannot enter execution planning. | JSON/human invalid selector tests. |
| Selected staged Grit rule disappears silently. | `not-applicable` or `dependency-refused` disposition with explicit selected-rule relation. | Staged selected-rule tests with no approved roots and approved roots. |
| Adapter failure becomes clean. | D6 adapter/projection failure maps to `rule-refused` or `dependency-refused`. | Grit tool unavailable/no JSON/malformed JSON/projection miss fixtures. |
| Wrapper/Nx alias false green. | D3 graph availability/refusal required for check-related target invocation surfaces. | Injected missing-project alias or cache-disabled dependency-execution gate after D3 source exists. |
| Baseline-covered diagnostics erased. | Covered diagnostics remain visible; only uncovered enforced errors fail. | Baseline-covered report-construction test. |
| Baseline contract failure hidden. | D5 baseline refusal maps to failing diagnostic row. | Missing/malformed/orphan/growth/manifest fixture tests. |
| Protected-zone violation downgraded. | D10 guard refusal maps to failing/refused check outcome. | Staged generated-zone violation test after D10 acceptance. |
| Human and JSON disagree. | Renderer consumes finalized report only; no independent status derivation. | Render/stringify equivalence tests. |
| Verify/hook infer semantics from raw fields. | D7 publishes projections for D11/D12. | Projection consumer tests in D11/D12 implementation. |

## Public Surface Compatibility Inventory

Rows use `blocked-pending-d0-row` until the concrete D0 matrix exists. Source
implementation cannot start while touched public rows remain placeholders.

| Surface | Plane | D0 surface id | Required handling before source edits |
| --- | --- | --- | --- |
| `habitat check` flags and selector behavior | command-behavior | `blocked-pending-d0-row` | Preserve, facade, version, or refuse explicitly. |
| `habitat check --json` schemaVersion 1 `CheckReport` | command-json | `blocked-pending-d0-row` | Preserve unless D0 versions; semantic consistency may tighten through facade/validator decision. |
| `CheckReport.command` | command-json/package-export | `blocked-pending-d0-row` | Preserve serialized compatibility while replacing manual command/argv string construction with Oclif-derived command context. |
| `habitat check` human output | human-output | `blocked-pending-d0-row` | Preserve/facade/version summary and refusal wording. |
| `habitat check --output` | command-behavior | `blocked-pending-d0-row` | Preserve write semantics or version through D0. |
| `habitat check --staged` | command-behavior/hook | `blocked-pending-d0-row` | Preserve staged behavior while adding explicit not-applicable/refusal states. |
| `habitat check --expand-baseline` | command-behavior | `blocked-pending-d0-row` | D5 owns expansion; D7 preserves command separation. |
| `baseline-integrity` built-in row | command-json/human-output | `blocked-pending-d0-row` | Decide whether it remains built-in only or becomes selectable; current `--rule baseline-integrity` fails. |
| `CheckReport`, `RuleReport`, `HabitatDiagnostic`, `RuleStatus` | package-export/command-json | `blocked-pending-d0-row` | Preserve/facade/version names and schema. |
| `validateCheckReport` | package-export | `blocked-pending-d0-row` | Tighten semantics only through D0/D1-compatible handling. |
| `createCheckReport`, `renderCheckReport`, `stringifyCheckReport` | package-export | `blocked-pending-d0-row` | Preserve public call shape or version/facade. |
| Hook parsing of check output | hook/human-output | `blocked-pending-d0-row` | Preserve D11 compatibility until D11 consumes projection. |
| Verify check summary | command-json | `blocked-pending-d0-row` | D12 consumes D7 projection; current `{}` selector summary is compatibility fact. |
| Nx `habitat:check` and `habitat:rule:*` outputs | script/Nx target output | `blocked-pending-d0-row` | Preserve or version target output semantics with D3 dependency facts. |
| Docs/examples/generated help | docs-example/generated-only | `blocked-pending-d0-row` | Document-only or generated-only changes after source behavior is settled. |

## D11 Consumer Contract

D7 must publish `LocalFeedbackCheckProjection` for D11 with:

- `kind`: `pass`, `fail`, `advisory-only`, `selector-refused`,
  `dependency-refused`, `diagnostic-unavailable`, `baseline-refused`,
  `protected-zone-refused`, or `not-applicable`;
- selected rule ids and status counts;
- failed/advisory rule ids;
- local rendering message and recovery hint when present;
- non-claims: local feedback only, not CI, not verify, not product/runtime
  behavior, not apply safety, not Graphite/OpenSpec readiness.

D11 may decide hook sequencing and staged-file behavior. It may not parse D7
human output to discover structural semantics.

The diagnostic, baseline, and protected-zone projection labels above are
audience-facing labels for D6, D5, and D10 owner-specific refusal states carried
through D7; they are not separate D7 policy domains.

## D12 Consumer Contract

D7 must publish `VerifyCheckSummaryProjection` for D12 with:

- requested selectors and check mode;
- selected real rule ids and built-in row ids;
- status counts, advisory count, failing count, refused count, and
  not-applicable count;
- `allowsAffectedExecution: boolean`, derived from `CheckOutcome`;
- skipped-affected reason when check failed/refused;
- bounded non-claims: check does not prove CI, runtime/product behavior, apply
  safety, Graphite readiness, OpenSpec acceptance, or graph target execution.

D12 owns verify receipt schema and affected-target execution. D7 only supplies
the check summary and skip/allow signal.

Skipped-affected reasons may name diagnostic, baseline, graph, or protected-zone
refusals when those owner-specific states are present, but D12 receives them as
D7 check-summary projections, not as permission to recompute upstream authority.

## Write Set And Protected Paths

This design packet may edit only `$D7_CHANGE/**`, `$REMEDIATION_DIR/context.md`,
`$REMEDIATION_DIR/packet-index.md` when D7 status changes, and D7 scratch/final
review files under `$AGENT_SCRATCH`.

Later source implementation may edit only after D7 acceptance and prerequisites:

| Area | Purpose |
| --- | --- |
| `$HABITAT_TOOL/src/lib/command-engine.ts` | Keep public facade while delegating to D7 pipeline stages. |
| New `$HABITAT_TOOL/src/lib/check/**` or equivalent | D7-owned state model, report construction, selector projection, execution aggregation, consumer projections. |
| `$HABITAT_TOOL/src/lib/diagnostics.ts` | Semantic `CheckReport` construction/validation while preserving public compatibility. |
| `$HABITAT_TOOL/src/rules/messages.ts` | Truth-preserving human rendering only from finalized outcome. |
| `$HABITAT_TOOL/src/commands/check.ts` | Oclif command context, request normalization, and exit handling only if public flags stay D0-compatible. |
| `$HABITAT_TOOL/src/commands/verify.ts` and verify summary helpers | Consume D7 verify summary projection without owning check semantics. |
| `$HABITAT_TOOL/src/lib/hooks.ts` | Only compatibility bridge until D11 consumes D7 projection. |
| `$HABITAT_TOOL/src/index.ts` | Export facades or versioned public symbols only with D0 rows. |
| Focused tests under `$HABITAT_TOOL/test/commands/**` and `$HABITAT_TOOL/test/lib/**` | Characterization and D7 state/consumer validation. |

Protected paths:

- `$HABITAT_TOOL/baselines/**` except fixture-controlled tests owned by D5;
- `$HABITAT_TOOL/src/rules/rules.json` and registry generators unless D2 owns
  the change;
- `$HABITAT_TOOL/src/lib/baseline.ts` D5 semantics;
- `$HABITAT_TOOL/src/lib/grit.ts`, `grit-failures.ts`, and
  `grit-injected-probe.ts` D6 semantics;
- `$HABITAT_TOOL/src/lib/generated-zones.ts` D10 semantics until D10 acceptance;
- `$HABITAT_TOOL/src/plugin.js` D3 graph topology unless D3 owns the change;
- `.grit/**`, generated artifacts, lockfiles, and non-Habitat product domains.

## Validation Matrix

| Gate | Command/test | Expected outcome | Covers | Non-claim |
| --- | --- | --- | --- | --- |
| D7-OPEN | `bun run openspec -- validate deep-habitat-d7-structural-enforcement-pipeline --strict` | exit 0 | OpenSpec shape | Not source behavior |
| D7-ALL-OPEN | `bun run openspec:validate` | exit 0 | Cross-change OpenSpec consistency | Not source behavior |
| D7-DIFF | `git diff --check` | exit 0 | Patch hygiene | Not semantic correctness |
| D7-SELECTOR | `bun run --cwd tools/habitat-harness test -- test/lib/rule-selection.test.ts` | exit 0 | Selector facts/refusals and staged Grit filtering | Not command output |
| D7-ENTRY | `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts` | exit 0 after current help failure repaired/dispositioned | Public command behavior, invalid selector JSON/human, baseline contract JSON | Not current-tree cleanliness |
| D7-SURFACE | `bun run --cwd tools/habitat-harness test -- test/lib/enforcement-surface.test.ts` | exit 0 after registry inventory drift repaired/dispositioned | Enforcement inventory and Nx target surface | Not rule correctness |
| D7-REPORT-SEMANTIC | new focused report-construction test | contradictory `ok`/status report rejected or unconstructable | False-green report invariant | Not diagnostic correctness |
| D7-LANE | new focused lane/status tests | advisory findings exit/pass; enforced uncovered errors fail | Lane separation | Not advisory completeness |
| D7-BASELINE | `bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts` plus D7 report tests | D5 states project into D7 rows without erasure | Baseline application/integrity consumption | Not baseline policy ownership |
| D7-DIAGNOSTIC | `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/lib/grit-injected-probe.test.ts test/grit/grit-patterns.test.ts` plus D7 adapter-failure tests | D6 adapter/refusal states cannot pass | Diagnostic consumption | Not Pattern Governance or apply safety |
| D7-PROTECTED | staged generated-zone fixture after D10 acceptance | protected-zone refusal exits nonzero and remains D10-owned | D10 guard consumption | Not write approval |
| D7-RENDER | new render/stringify equivalence tests | JSON/human/exit agree for pass/fail/advisory/refusal states | Rendering truth equivalence | Not rule correctness |
| D7-COMMAND-CURRENT | focused `habitat check` commands selected by implemented surfaces | expected status recorded per current tree | Public command integration | Not CI/runtime/product behavior |

Do not cite `bun run habitat:check -- --json --rule baseline-integrity` as a
current valid gate. Today it is an invalid selector. Making built-in rows
selectable is a D0/D7 public behavior decision.

## Refactor Pattern

D7 implementation must follow the TypeScript Refactoring bar:

1. Characterize current public behavior before structural moves.
2. Introduce closed discriminated states before splitting files.
3. Keep public DTOs behind D0/D1-compatible facades while internal state space
   collapses.
4. Migrate consumers stage by stage.
5. Delete local recomputation and invalid state constructors.
6. Run compiler/tests after each logical move.

The rejected alternative is splitting `command-engine.ts` by file size. The
target is lower reachable state space: no broad option object, no settable
`ok`, no whole-row registry authority, no erased baseline-covered diagnostics,
and no adapter/graph/protected-zone failure represented as pass.
