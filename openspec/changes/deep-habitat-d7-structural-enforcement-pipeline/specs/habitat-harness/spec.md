## ADDED Requirements

### Requirement: Structural Enforcement Consumes Upstream Projections Only

D7 Structural Enforcement SHALL compose accepted upstream projections into check
outcomes without recomputing adjacent domain authority.

#### Scenario: D7 consumes rule metadata
- **WHEN** a check request selects registered rules
- **THEN** D7 consumes D2 selector, report, execution, baseline, Grit, and generated-zone facts
- **AND** D7 SHALL NOT treat whole registry rows, prose scope strings, or optional legacy rule fields as target authority after D2 projections exist

#### Scenario: D7 consumes graph availability
- **WHEN** a check-related Nx target, alias target, or wrapper target is part of the check invocation surface
- **THEN** D7 consumes D3 target availability or `GraphRefusal`
- **AND** D7 SHALL NOT treat wrapper exit 0 as structural success unless D3 dependency resolution is accepted

#### Scenario: D7 consumes baseline authority
- **WHEN** rule diagnostics need baseline application or baseline integrity is reported
- **THEN** D7 consumes D5 `BaselineApplicationResult` or `BaselineIntegrityResult`
- **AND** D7 SHALL NOT decide shrink-only integrity, baseline growth, external exception projection, or rule-introduction manifest acceptance

#### Scenario: D7 consumes diagnostic outcomes
- **WHEN** a selected diagnostic rule runs
- **THEN** D7 consumes D6 `DiagnosticRunOutcome` or diagnostic consumer projection
- **AND** D7 SHALL NOT parse raw Grit reports, raw process records, or infer Pattern Governance or apply safety

#### Scenario: D7 consumes protected-zone decisions
- **WHEN** staged/file-layer check encounters generated or protected-zone surfaces
- **THEN** D7 consumes D10 protected-zone guard decisions and refusals
- **AND** D7 SHALL NOT define generated/protected-zone policy or write approval

### Requirement: Selector Outcomes Are Closed Before Execution

D7 SHALL distinguish selector refusal from selected rule execution.

#### Scenario: Selector request is accepted
- **WHEN** D2 selector facts resolve to one or more selected rules
- **THEN** D7 creates a `SelectedRuleSet`
- **AND** every selected rule has an execution plan or explicit not-applicable/refused disposition

#### Scenario: Selector value is unknown
- **WHEN** a selector requests an unknown owner, rule, or tool
- **THEN** D7 creates a `SelectorRefusal`
- **AND** no ordinary rule execution is planned
- **AND** the public compatibility projection may preserve the `rule-selection-integrity` row only through D0/D1-compatible handling

#### Scenario: Selector value belongs to another selector namespace
- **WHEN** a selector requests a value that is known under another selector kind
- **THEN** D7 creates a wrong-namespace `SelectorRefusal`
- **AND** the check exits nonzero

#### Scenario: Valid selector intersection is empty
- **WHEN** multiple valid selectors have no overlapping rules
- **THEN** D7 creates an empty-intersection `SelectorRefusal`
- **AND** D7 SHALL NOT report zero executed rules as pass

### Requirement: Execution Dispositions Cannot Disappear

D7 SHALL give every selected rule an explicit execution disposition.

#### Scenario: Rule executes and reports clean
- **WHEN** a selected rule has accepted dependencies and D6 or native execution returns a clean outcome
- **THEN** D7 may construct a passing rule outcome for an enforced rule

#### Scenario: Rule executes and reports findings
- **WHEN** a selected rule has a non-empty diagnostic finding set
- **THEN** D7 preserves the diagnostics through report construction
- **AND** D7 distinguishes advisory findings from enforced uncovered findings

#### Scenario: Rule is not applicable to staged scope
- **WHEN** a selected staged rule has no approved staged roots or is not applicable to the staged request
- **THEN** D7 records a `not-applicable` disposition
- **AND** D7 SHALL NOT silently drop the selected rule from the check outcome

#### Scenario: Rule dependency is refused
- **WHEN** D2, D3, D5, D6, or D10 refuses a required dependency for a selected rule
- **THEN** D7 records a dependency-refused disposition
- **AND** the rule or check outcome cannot be pass

### Requirement: Diagnostic Failures Cannot Become Pass

D7 SHALL map D6 diagnostic failures to non-passing check outcomes.

#### Scenario: Adapter fails
- **WHEN** D6 reports tool unavailable, command failed, interrupted command, no JSON, malformed JSON, schema drift, unexpected shape, empty scan roots, projection miss, unexpected identity, or missing cache observation
- **THEN** D7 constructs a failed or refused rule outcome
- **AND** the check cannot exit as pass because of that selected rule

#### Scenario: Findings projection is empty
- **WHEN** D6 reports a findings variant
- **THEN** D7 requires a non-empty diagnostic set
- **AND** an empty findings variant is rejected before report construction

### Requirement: Baseline Application Preserves Diagnostics

D7 SHALL consume D5 baseline application without erasing structural findings.

#### Scenario: Diagnostics are covered by baseline debt
- **WHEN** D5 marks diagnostics as covered by explicit debt or modeled external exception projection
- **THEN** D7 keeps those diagnostics visible as covered debt
- **AND** D7 may derive pass for an enforced rule only when no uncovered enforced diagnostics remain

#### Scenario: Enforced diagnostics are uncovered
- **WHEN** D5 returns uncovered error diagnostics for an enforced rule
- **THEN** D7 derives a failing rule outcome
- **AND** `CheckReport.ok` is false

#### Scenario: Baseline authority refuses
- **WHEN** D5 returns a baseline application refusal or baseline integrity refusal
- **THEN** D7 renders D5's refusal as a command diagnostic
- **AND** D7 does not redefine the D5 refusal reason
- **AND** the check cannot pass

#### Scenario: Built-in baseline integrity is reported
- **WHEN** D7 includes the built-in baseline-integrity row
- **THEN** the row is derived from D5 `BaselineIntegrityResult`
- **AND** D7 SHALL NOT claim `--rule baseline-integrity` is selectable unless D0/D7 intentionally design that public command behavior

### Requirement: Lane And Status Derivation Is Centralized

D7 SHALL derive rule status from lane, diagnostics, baseline state, and refusal
state through one constructor.

#### Scenario: Advisory rule has findings
- **WHEN** an advisory rule reports one or more advisory diagnostics
- **THEN** D7 derives `advisory-findings`
- **AND** the check may exit 0 when no enforced failures/refusals exist

#### Scenario: Enforced rule has uncovered error diagnostics
- **WHEN** an enforced rule reports uncovered error diagnostics
- **THEN** D7 derives `fail`
- **AND** the check exits nonzero

#### Scenario: Rule has no diagnostics and no refusals
- **WHEN** a selected rule executes cleanly with accepted dependencies
- **THEN** D7 derives `pass`

### Requirement: CheckReport Is Derived Or Semantically Rejected

D7 SHALL make contradictory public reports unrepresentable through construction
or rejected through validation.

#### Scenario: Failing rule is present
- **WHEN** a finalized report contains any rule with status `fail`
- **THEN** `CheckReport.ok` is false

#### Scenario: No failing rule is present
- **WHEN** a finalized report contains only pass and advisory-findings statuses
- **THEN** `CheckReport.ok` is true unless the check outcome is an explicit selector/dependency refusal projected through a D0-compatible failure row

#### Scenario: Contradictory report is supplied to validation
- **WHEN** a structurally valid `CheckReport` says `ok: true` while containing a failing rule
- **THEN** D7 validation rejects the report or the report cannot be constructed through public constructors

### Requirement: Rendering Preserves Structured Truth

D7 SHALL render JSON, human output, output files, and exit codes from the same
finalized check outcome.

#### Scenario: Human rendering summarizes failure
- **WHEN** the finalized check outcome is failed or refused
- **THEN** human output says FAIL
- **AND** the listed failing/refused rule ids match the structured report

#### Scenario: JSON rendering serializes report
- **WHEN** JSON output is requested
- **THEN** the serialized `CheckReport` matches the finalized check outcome
- **AND** renderer code does not invent independent status or exit semantics

#### Scenario: Output path is requested
- **WHEN** `--output` is provided
- **THEN** D7 writes the same JSON report that stdout would render for `--json`

### Requirement: D11 Receives Local Feedback Projection

D7 SHALL publish a local-feedback-safe check projection for D11.

#### Scenario: Hook consumes check outcome
- **WHEN** D11 needs local hook feedback
- **THEN** it consumes D7 `LocalFeedbackCheckProjection`
- **AND** it does not parse D7 human output to infer structural semantics

#### Scenario: Hook reports non-claims
- **WHEN** D11 renders local feedback from D7
- **THEN** it preserves local-feedback-only non-claims
- **AND** it does not imply CI, verify, apply safety, runtime/product behavior, Graphite readiness, or OpenSpec acceptance

### Requirement: D12 Receives Verify Check Summary

D7 SHALL publish a verify-check summary projection for D12.

#### Scenario: Check permits affected verification
- **WHEN** D7's check outcome has no enforced failures or dependency refusals
- **THEN** D12 may treat the check summary as allowing affected-target execution
- **AND** D12 still owns verify receipt schema and affected-target behavior

#### Scenario: Check blocks affected verification
- **WHEN** D7's check outcome is failed, selector-refused, dependency-refused, diagnostic-refused, baseline-refused, or protected-zone-refused
- **THEN** D12 receives a skipped-affected reason
- **AND** D12 does not run affected targets as if check passed
- **AND** diagnostic-refused, baseline-refused, and protected-zone-refused are D7 projections of D6, D5, and D10 owner-specific refusal states, not new D7-owned authority domains

### Requirement: Public Surface Changes Wait For D0 Rows

D7 source implementation SHALL stop before public-surface changes when concrete
D0 rows are absent.

#### Scenario: D7 touches command JSON or human output
- **WHEN** D7 implementation would change `habitat check` JSON, human output, output files, flags, selector behavior, built-in row selectability, or exit behavior
- **THEN** the implementation cites concrete D0 rows
- **AND** every row uses one closed handling value: `preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, or `generated-only`

#### Scenario: D7 touches package exports
- **WHEN** D7 implementation changes `CheckReport`, `RuleReport`, `HabitatDiagnostic`, `RuleStatus`, `validateCheckReport`, `createCheckReport`, `renderCheckReport`, or `stringifyCheckReport`
- **THEN** the implementation cites concrete D0 rows
- **AND** source implementation stops while any touched row remains `blocked-pending-d0-row`
