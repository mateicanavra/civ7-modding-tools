# D7 Structural Enforcement Pipeline Domain/Ontology Investigation

Status: BLOCKING

Fresh D7 adversarial review. I treated the D7 source domino and accepted D0/D1/D2/D3/D5/D6 packets as controlling inputs, D10 as draft protected-zone dependency input, and current Habitat code/tests as evidence rather than authority.

## Findings

### P1: D7 packet does not define the Structural Enforcement Pipeline ontology it claims to settle

Evidence:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D7-structural-enforcement-pipeline.md:32` requires D7 to define selector input/failure states, selected rule set, rule execution result, normalized diagnostic, baseline application result, `CheckReport` constructor, and renderer/stringifier.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d7-structural-enforcement-pipeline/design.md:22` says "Define check pipeline ownership and inputs from D2/D3/D5/D6/D10"; lines 24-26 are bullets, not a domain model, state model, transition model, or ownership contract.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d7-structural-enforcement-pipeline/specs/habitat-harness/spec.md:5` has one broad SHALL and two scenarios; it does not enumerate selector refusal, selected-empty, execution-not-run, adapter failure, baseline refusal, graph refusal, protected-zone refusal, advisory-only, rendering, or exit-status derivation.
- Current implementation evidence shows why this must be explicit: `createCheckReport` in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:273` through `:342` currently performs selection, staged filtering, rule execution, baseline load/application, integrity, report-row construction, and `ok` derivation inline.

Required packet repair:

D7 must replace the incomplete packet with a closed target state model and transition contract. The complete repair defines these D7-owned stages and their exact inputs/outputs:

- `SelectorRequest`
- `RuleSelectionResult`
- `SelectorRefusal`
- `SelectedRuleSet`
- `StructuralCheckDependencyAvailability`
- `RuleExecutionPlan`
- `RuleExecutionObservation`
- `DiagnosticProjectionInput`
- `NormalizedRuleDiagnostic`
- `BaselineApplicationOutcome`
- `RuleReportConstructionResult`
- `CheckReportConstructionResult`
- `RenderedCheckReport`
- `CheckExitDecision`

Each stage must state its single owner, accepted upstream projections, refusal/failure states, non-claims, and transition rules. The packet must make impossible the current broad "do everything in `createCheckReport`" shape without merely splitting by file size.

### P1: D7 does not specify how it consumes adjacent domain authority, so it leaves owner confusion and local recomputation routes open

Evidence:

- D2 defines consumer projections and forbids passing whole registry records: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md:180` through `:195`.
- D3 owns graph read status, target availability, and graph refusals; `command-engine.ts` may not hard-code project targets or verify affected targets outside the graph module after D3: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/design.md:50` through `:85`.
- D5 says D7 consumes `BaselineApplicationResult`, `BaselineIntegrityResult`, and D5 command diagnostics, and may not load untyped baseline internals after D5 publishes target results: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:164` through `:172`.
- D6 says D7 receives `DiagnosticRunOutcome`, finding projections, and adapter failure projections, and must not infer raw Grit internals or pattern/apply authority: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:441` through `:450`.
- D7 design says "inputs from D2/D3/D5/D6/D10" at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d7-structural-enforcement-pipeline/design.md:24`, without naming the projections, availability/refusal states, or protected owner boundaries.
- Current code evidence shows the hazardous local-authority pattern: `command-engine.ts:281` loads baseline state directly, `:285` applies it directly, `:315` checks integrity directly, and `:423` through `:438` invokes Grit from selected whole rules. `generated-zones.ts:17` through `:37` has a local generated-zone table, while D2/D10 require protected-zone authority to be consumed through explicit contracts.

Required packet repair:

D7 must include a dependency-consumption matrix with exact accepted inputs and refused inputs:

- D2: consume `ruleSelectorFacts`, `ruleReportFacts`, `ruleExecutionFacts`, and the D2-owned metadata projections D7 is allowed to see.
- D3: consume graph target/check invocation availability and graph refusal projections; do not derive graph truth from local arrays, colon strings, or Nx output text.
- D5: consume `BaselineApplicationResult`, `BaselineIntegrityResult`, and D5 diagnostic/refusal projections.
- D6: consume `DiagnosticRunOutcome` and `DiagnosticConsumerProjection` variants; adapter failures must become failed/refused report rows, never pass.
- D10/G-HOST: consume protected-zone guard/refusal results; do not define protected-zone policy or generated-zone authority locally.

The packet must state that D7 owns aggregation and report-row construction, not the upstream truth of registry, graph, baseline, diagnostic acquisition, or protected-zone policy.

### P1: False-green state coverage is incomplete, especially not-run/dropped execution paths and unavailable dependency states

Evidence:

- The source packet says D7 must avoid selector failures, baseline/Grit leakage, and `CheckReport.ok` contradictions; stop conditions include selector failures indistinguishable from rule failures and baseline/Grit internals leaking into enforcement stages: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D7-structural-enforcement-pipeline.md:90` through `:96`.
- D6 explicitly states adapter failure can never produce a structural pass: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:336` through `:347`.
- D3 explicitly rejects no-op wrappers and missing dependency resolution as runnable target success: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/design.md:11` through `:13`, and defines graph refusal states at `:154` through `:165`.
- Current D7-relevant code can drop staged Grit execution: `rulesForExecution` filters Grit rules in staged mode when there are no staged Grit roots at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:398` through `:409`; `createCheckReport` then derives `ok` from emitted report rows at `:336` through `:342`.
- D7 spec says unavailable inputs report "blocked or failed state" at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d7-structural-enforcement-pipeline/specs/habitat-harness/spec.md:11` through `:13`; it does not define which unavailable states are blocked, failed, refused, skipped, advisory-only, or non-claim-bearing.

Required packet repair:

D7 must define a closed `RuleExecutionObservation` / `RuleExecutionDisposition` model that distinguishes:

- `executed-clean`
- `executed-findings`
- `execution-failed`
- `dependency-unavailable`
- `selector-refused`
- `diagnostic-adapter-failed`
- `diagnostic-scan-refused`
- `graph-refused`
- `baseline-refused`
- `protected-zone-refused`
- `not-run-not-applicable`
- `not-run-due-to-staged-scope`
- `not-run-due-to-upstream-refusal`

Explicitly modeled non-applicability may avoid failure, and it must carry a report row/non-claim when the user selected that rule/tool/owner. A selected rule disappearing from the selected rule set or execution plan must be impossible unless D7 emits a named skipped/refused report state with exit-status semantics.

### P2: `CheckReport`, renderer, and exit status derivation are not treated as one truth-preserving contract

Evidence:

- D1 says `CheckReport` is selected rules, rule statuses, diagnostics, and baseline/check command outcome, not a receipt or current-tree proof: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d1-receipt-contract-boundary/design.md:20`.
- D1 requires `CheckReport.ok` to be derived from rule statuses or for validation to reject contradictions: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d1-receipt-contract-boundary/design.md:177`.
- Current structural validation checks shape, not `ok`/rule-status consistency: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/diagnostics.ts:44` through `:66`.
- Current command exit derives from `report.ok`: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/check.ts:46` through `:53`.
- Current human renderer derives its summary from `report.ok`, `fail` rows, and advisory rows: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/messages.ts:27` through `:39`.
- D7 source packet requires preserving human and JSON output truth equivalence at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D7-structural-enforcement-pipeline.md:63`.

Required packet repair:

D7 must define one `CheckReportConstructionResult` that derives:

- every `RuleReport.status`;
- `CheckReport.ok`;
- renderer summary facts;
- JSON report facts;
- `CheckExitDecision`.

The renderer/stringifier should consume the constructed report, but may not invent status, suppress refusal states, or derive a divergent command outcome. Validation must include semantic consistency, not just field shape.

### P2: D7 names "failure/refusal states" but does not define selector request/result/refusal identity or selected-rule-set identity

Evidence:

- Current selector model exists in code as `RuleSelection`, `RuleSelectionResult`, `RuleSelectorFact`, and `RuleSelectionFailureReason` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:34` through `:68`.
- Current selector failures are encoded as a synthetic rule report with `ruleId: "rule-selection-integrity"` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:569` through `:603`.
- D2 defines selector facts as a projection and says selector failures must not become zero executed rules: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md:184`.
- D7 design does not mention selector vocabulary, selector fact identity, selected-rule-set identity, synthetic report-row policy, or whether selector refusal is a rule report, command refusal, or check report construction refusal.

Required packet repair:

D7 must define:

- `SelectorRequest`: user intent over `owner`, `rule`, `tool`, and later staged/command scope when relevant.
- `RuleSelectorFact`: D2-owned projection consumed by D7, not reconstructed from whole registry rows.
- `RuleSelectionResult`: accepted selected set or `SelectorRefusal`.
- `SelectedRuleSet`: stable identity containing selected rule ids plus the selector facts that produced them.
- `SelectorRefusalReport`: explicit D7 report construction for unknown selector, wrong namespace, and empty intersection.

The packet must decide whether selector refusals are represented as a synthetic `RuleReport`, a command-level refusal row, or a new check outcome. Current synthetic row may be preserved for D0/D1 compatibility, but target meaning cannot remain implicit.

### P3: D7 validation gates are too broad and do not falsify the ontology failures above

Evidence:

- D7 tasks list `test/commands/habitat-commands.test.ts`, broad `habitat check --json`, OpenSpec validation, and `git diff --check`: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d7-structural-enforcement-pipeline/tasks.md:18` through `:24`.
- The D7 source packet required rule selection tests, CheckReport schema tests, clean/failing/advisory/selector-failure/staged command behavior, baseline integrity current-tree check, and injected violation proof: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D7-structural-enforcement-pipeline.md:72` through `:84`.
- D5 explicitly says `habitat check --rule baseline-integrity --json` is the D5 command outcome and broad `habitat check --json` cannot replace it: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:234` through `:239`.

Required packet repair:

The D7 packet should replace broad validation with falsifying gates for each state family: selector refusal, empty selected set, diagnostic adapter failure, D6 scan-root refusal, baseline application refusal, baseline integrity refusal, graph refusal, protected-zone refusal, advisory-only, staged not-applicable, renderer/JSON equivalence, and exit-status derivation.

## Proposed Accepted D7 Ontology Vocabulary

Use these as target D7 language:

- `StructuralCheckRequest`: the requested check operation, including command invocation context and selector request.
- `SelectorRequest`: user selector intent over owner/rule/tool and check scope.
- `RuleSelectorFact`: D2-owned selector projection consumed by D7.
- `RuleSelectionResult`: accepted selected rules or a selector refusal.
- `SelectorRefusal`: unknown selector, wrong selector namespace, or empty selector intersection.
- `SelectedRuleSet`: accepted rule ids and selector facts; not whole registry rows.
- `StructuralCheckDependencyAvailability`: availability/refusal of D2, D3, D5, D6, and D10 inputs for this check.
- `RuleExecutionPlan`: the D7-owned plan for which selected rules will execute and which upstream projections each rule requires.
- `RuleExecutionObservation`: D7 observation of executed, failed, refused, skipped, or not-applicable rule execution.
- `DiagnosticProjectionInput`: D6-owned diagnostic run outcome or native/wrapped diagnostic output ready for D7 aggregation.
- `NormalizedRuleDiagnostic`: report-ready diagnostic after D6 projection and before/after D5 baseline application, with D5 baseline state explicit.
- `BaselineApplicationOutcome`: D5-owned result consumed by D7 for one rule.
- `ReportRowInput`: D7 aggregation input combining rule report facts, execution observation, diagnostic projection, baseline application, and dependency availability.
- `RuleReportConstructionResult`: pass/fail/advisory/refused/skipped row construction with diagnostics and non-claims.
- `CheckReportConstructionResult`: constructed `CheckReport` plus semantic consistency proof inputs.
- `RenderedCheckReport`: JSON/human output projection from the same constructed report.
- `CheckExitDecision`: exit code derived from `CheckReportConstructionResult`, never independently from renderer text.

## Rejected Terms Or Usages

- `pipeline ownership and inputs` as a substitute for a state model.
- `failure/refusal states` without closed reason values and owner.
- `result aggregation` without named aggregation inputs and output invariants.
- `baseline decision` without `BaselineApplicationResult`, `BaselineIntegrityResult`, `BaselineExpansionDecision`, or `BaselineAuthorityProjection`.
- `Grit result` as D7 input when the correct D7 input is D6 `DiagnosticRunOutcome` or `DiagnosticConsumerProjection`.
- `graph facts` without D3 availability/refusal state.
- `generated-zone guard` as D7-owned policy; D7 consumes D10/G-HOST guard/refusal results.
- `rule execution result` when it conflates process exit, diagnostic projection, adapter failure, and rule report status.
- `selected rules` if it means whole `HarnessRule` rows rather than D2 projections and selected rule ids.
- `skip`, `silent skip`, `not applicable`, or `no staged roots` unless modeled as an explicit D7 execution disposition with report and exit semantics.
- `CheckReport.ok` as a settable boolean; it must be derived or semantically validated.
- `proof` / `evidence` as D7 target language except compatibility citations classified by D0/D1.

## Stop-Condition Assessment

D7 remains ambiguous in domain model, naming, scenario coverage, and artifact structure. The current D7 OpenSpec packet does not yet settle the Structural Enforcement Pipeline; it leaves the implementation agent to invent the core ontology while editing `command-engine.ts`. That is blocking.
