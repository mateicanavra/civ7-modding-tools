# D7 TypeScript State-Space Investigation

Status: BLOCKING

D7 is not acceptable input yet. The packet says "pipeline" and "typed decisions", but it still leaves the concrete state model, public compatibility strategy, write set, and falsifying oracle for the implementation agent to invent. That violates the D7 stop condition: if implementation could still decide the concrete state model, write set, public compatibility, or validation oracle later, this report must block.

## Controlling Finding

The live check path is a state-space compression failure concentrated in `createCheckReport`, but the D7 packet has not yet specified the replacement type-state families tightly enough to prevent the known false-green paths.

Evidence:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:273` starts `createCheckReport(options: CheckOptions = {})`, where one broad options object carries selector fields, baseline base, command rendering args, staged mode, and staged paths.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:274-342` mixes selection, staged filtering, rule execution, baseline load/apply, mutation of diagnostics, status derivation, built-in baseline-integrity insertion, and final `CheckReport.ok` derivation.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/diagnostics.ts:36-42` exports `CheckReport` with `ok: boolean` and `rules: RuleReport[]`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/diagnostics.ts:45-66` validates shape but not the invariant that `ok` must equal "no failing rule reports".
- D1 already requires either validator rejection or construction-level impossibility for `ok: true` with a failing rule at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d1-receipt-contract-boundary/specs/habitat-harness/spec.md:36-39`. Current validation does not satisfy that.

## Current TypeScript Smell Inventory

1. Optional/flag soup in check entry input.
   `CheckOptions` extends `RuleSelection` and adds optional `base`, `commandArgs`, `staged`, and `stagedPaths` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:70-75`. This admits incoherent states: render-only args during rule execution, `stagedPaths` without `staged`, staged execution for current-tree-only rules, and baseline-base concerns on selection-only paths.

2. Boolean-correlated result state.
   `CheckReport.ok` is a free boolean at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/diagnostics.ts:36-42`, and construction derives it by convention at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:336-342`. Any caller can still construct contradictory reports because the public type allows it.

3. Selector failure encoded as a fake rule execution.
   `RuleSelectionResult` is a real DU at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:59-68`, but `createRuleSelectionFailureReport` converts it to a synthetic `RuleReport` with `ruleId: "rule-selection-integrity"` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:569-603`. That preserves current JSON compatibility, but the target model must keep "selector failed before execution" distinct from "a selected structural rule failed" internally.

4. Baseline application mutates diagnostics in place.
   `applyBaseline` mutates `d.baselined` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/baseline.ts:153-209`, and `createCheckReport` then appends baseline contract diagnostics to the same array at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:284-289`. D5 says D7 should consume `BaselineApplicationResult` and `BaselineIntegrityResult`, not decide D5 internals, at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/specs/habitat-harness/spec.md:169-184`.

5. Advisory/enforced lanes collapse through shared status strings.
   `RuleReport.status` is only `"pass" | "fail" | "advisory-findings"` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/diagnostics.ts:19-25`. Status derivation at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:289-299` treats advisory findings as non-failing by convention. The target must make "advisory finding does not fail check" a constructor rule, not a renderer convention.

6. Diagnostic adapter failures are downgraded into ordinary diagnostics.
   D6 models Grit acquisition failure families explicitly, including tool unavailable not becoming pass at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:98-104` and adapter outcomes at `:105-141`. Live Grit code has `GritCheckParseResult` as a DU at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/grit.ts:45-58`, but `runGritRules` projects failures to `{ exitCode, diagnostics }` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/grit.ts:203-212` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/grit.ts:772-780`. D7 must not lose the family when aggregating.

7. Dependency unavailable can still be modeled as "nothing ran, nothing failed" unless D7 consumes D3 states.
   D3 requires unavailable/missing graph targets and alias dependency failures to refuse before runnable commands at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/specs/habitat-harness/spec.md:22-43` and `:44-93`; D7 specifically may not treat wrapper exit 0 as success without dependency resolution at `:147-160`. Current direct `executeRule` just runs `rule.detect` for non-Grit/non-file-layer rules at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/rules/architecture.ts:109-121`.

8. Rendering can invent semantics from fields.
   Human rendering decides PASS/FAIL from `report.ok` and counts statuses directly at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/rules/messages.ts:27-39`. If a malformed report has `ok: true` and a failing rule, rendering reports PASS while listing a failing rule count. `renderCheckReport` only validates shape before JSON/string rendering at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/command-engine.ts:462-475`.

9. Public exports make this a compatibility change, not an internal refactor.
   `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/index.ts:29-50` exports `createCheckReport`, `renderCheckReport`, `stringifyCheckReport`, `CheckReport`, and `RuleReport`. D0 requires rows before changing command JSON, DTOs, exports, examples, or hooks at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/specs/habitat-harness/spec.md:3-28`. The named D0 matrix path is absent in this worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/public-surface-compatibility-matrix.md`.

## Target Discriminated Unions And Type-State Families

D7 should specify these families before implementation:

1. `CheckRequest`
   Collapse broad `CheckOptions` into:
   - `{ kind: "current-tree-check"; selectors: SelectorRequest; baseline: BaselineIntegrityRequest; command: CommandRenderInput }`
   - `{ kind: "staged-check"; selectors: SelectorRequest; stagedPaths: NonEmptyReadonlyArray<RepoPath> | { kind: "no-staged-paths" }; command: CommandRenderInput }`
   - `{ kind: "baseline-authoring"; selectors: SelectorRequest; baselineExpansion: BaselineExpansionRequest }`
   This eliminates `stagedPaths` without `staged`, baseline authoring flowing through report emission, and command args leaking into execution stages.

2. `RuleSelectionOutcome`
   Keep selector result separate from execution:
   - `{ kind: "selected"; requested: SelectorRequest; selectedRules: NonEmptyReadonlyArray<RuleExecutionPlan>; selectorFacts: SelectorFact[] }`
   - `{ kind: "selection-refused"; reason: "unknown-selector" | "wrong-selector-namespace" | "empty-selection"; selectorFacts: SelectorFact[]; reportProjection: SelectorFailureProjection }`
   Compatibility can still project `selection-refused` to `rule-selection-integrity`, but execution APIs must not accept it as selected rules.

3. `RuleExecutionPlan`
   Consume D2/D3/D6/D10 projections instead of `HarnessRule`:
   - `{ kind: "grit-diagnostic"; rule: RuleIdentity; lane: EnforcementLane; diagnosticEntry: DiagnosticCatalogEntry; scanDecision: DiagnosticScanRootDecision }`
   - `{ kind: "wrapped-target"; rule: RuleIdentity; lane: EnforcementLane; graphTarget: AvailableTarget | GraphRefusal }`
   - `{ kind: "file-layer-guard"; rule: RuleIdentity; lane: EnforcementLane; protectedZoneDecision: GuardDecision }`
   - `{ kind: "native-diagnostic"; rule: RuleIdentity; lane: EnforcementLane; diagnosticEntry: NativeDiagnosticEntry }`
   This collapses optional fields like `gritPattern?`, `generatedZone?`, `forbiddenFileNames?`, `hookScope?`, and `nxTarget?` on `HarnessRule`.

4. `DiagnosticRunOutcome`
   Collapse `{ exitCode, diagnostics }` into:
   - `{ kind: "clean"; commandObservation?: BoundedCommandObservation }`
   - `{ kind: "findings"; diagnostics: NonEmptyReadonlyArray<NormalizedDiagnostic>; commandObservation?: BoundedCommandObservation }`
   - `{ kind: "adapter-refused"; failure: DiagnosticAdapterFailure }`
   - `{ kind: "projection-refused"; reason: "projection-missed" | "unexpected-diagnostic-identity" | "cache-observation-missing"; failureDiagnostic: NormalizedDiagnostic }`
   This prevents tool unavailable, malformed JSON, projection miss, empty roots, and cache provenance gaps from being mistaken for a clean run.

5. `BaselineApplicationOutcome`
   D7 should consume, not recompute:
   - `{ kind: "baseline-applied"; covered: DiagnosticKey[]; uncovered: NormalizedDiagnostic[]; locked: boolean }`
   - `{ kind: "baseline-refused"; refusal: BaselineContractFailure; diagnostic: NormalizedDiagnostic }`
   - `{ kind: "integrity-accepted"; result: BaselineIntegrityResult }`
   - `{ kind: "integrity-refused"; refusal: BaselineIntegrityRefusal; diagnostic: NormalizedDiagnostic }`
   This prevents "baseline-covered findings erase diagnostics"; covered diagnostics remain observable as covered debt, while uncovered/current and contract diagnostics remain distinct.

6. `RuleReportDraft -> RuleReport`
   Make report construction staged:
   - `ExecutedRuleReportDraft` contains selected rule identity, lane, diagnostic outcome, baseline outcome, and duration.
   - `SelectorFailureReportDraft` contains selector failure only.
   - `BuiltInReportDraft` contains baseline-integrity or other D7-owned built-ins.
   A single `finalizeRuleReport(draft): RuleReport` derives status. Callers cannot set `status` directly.

7. `CheckOutcome -> CheckReport`
   Build the public schema at the boundary:
   - `{ kind: "check-passed"; reports: RuleReport[] }`
   - `{ kind: "check-failed"; failures: NonEmptyReadonlyArray<FailingReport>; reports: RuleReport[] }`
   - `{ kind: "check-refused"; refusal: SelectorFailure | MetadataFailure | GraphRefusal | DiagnosticAdapterFailure | BaselineRefusal; reports: NonEmptyReadonlyArray<RuleReport> }`
   Then `toCheckReport(outcome)` derives `ok`. No internal code should accept raw `CheckReport` construction except compatibility/test factories.

## Public Type And Export Compatibility Traps

- `CheckReport`, `RuleReport`, `HabitatDiagnostic`, `createCheckReport`, `renderCheckReport`, and `stringifyCheckReport` are package exports. A D7 source change that narrows, renames, versions, or stops exporting them requires concrete D0 rows. The D0 matrix file is absent, so D7 implementation is blocked if it changes those surfaces.
- `habitat check --json` is command JSON. D1 says it remains a `CheckReport` with `ok` matching rule statuses and invalid selector JSON still returns schemaVersion 1 `CheckReport` without claiming rule execution. D7 may use internal unions, but public JSON must be preserved, versioned, or facaded through D0.
- `validateCheckReport` is exported and currently shape-based. Changing it to reject contradictory reports is behaviorally correct per D1, but still a public validator behavior change; D7 needs D0 compatibility disposition.
- Hooks parse `CheckReport` and regex Grit adapter failure text at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/hooks.ts:802-823`. If D7 changes diagnostic message text or adds structured failure fields, hook compatibility must be handled explicitly.
- Tests currently mock `createCheckReport` with `ok: true, rules: []` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/commands/habitat-commands.test.ts:3-9`. If D7 requires non-empty reports or a constructor-only report type, command tests need compatibility factories rather than raw objects.

## Required Validation Gates That Would Falsify D7 Risks

D7 should not proceed until these gates are exact in the packet/tasks:

- Type-level gate: a `tsc --noEmit` or package typecheck includes negative compile-time fixtures, or equivalent `tsd`/`expectTypeOf` tests, proving raw contradictory `CheckReport` construction is unavailable through the new internal constructor path.
- Runtime validator gate: unit test `validateCheckReport({ ok: true, rules: [{ status: "fail", ... }] })` rejects, or a constructor test proves that state cannot be created.
- Selector gate: JSON and human invalid selector tests assert `selection-refused` projects to `rule-selection-integrity`, exits nonzero, and records no ordinary selected rule execution.
- Dependency-unavailable gate: injected D3 graph-refusal fixture for a wrapped target proves wrapper `exitCode: 0` cannot produce a passing rule report unless dependency resolution was accepted.
- Diagnostic adapter gate: Grit tool unavailable, no JSON, malformed JSON, schema drift, unexpected shape, projection miss, unexpected identity, and cache-provenance-missing each produce a failed/refused D7 outcome, not a clean diagnostic run.
- Lane gate: an advisory rule with findings yields `advisory-findings` and does not fail check, while an enforced rule with the same uncovered error diagnostic fails check; both paths are constructed by the same status finalizer.
- Baseline gate: covered diagnostics remain present and marked covered; uncovered diagnostics fail enforced rules; baseline contract refusals become separate command diagnostics and cannot be erased by baseline coverage.
- Rendering truth-equivalence gate: for a synthetic report with every status family, JSON and human output agree on pass/fail, failing rule IDs, advisory counts, covered diagnostics, and refusal states. Rendering must not derive semantics not present in the finalized outcome.
- Public compatibility gate: before source edits, list the exact D0 `surface_id` rows for package exports, command JSON, command human output, hooks, docs examples, and tests touched by D7, with the closed compatibility handling action.
- OpenSpec gate: `bun run openspec -- validate deep-habitat-d7-structural-enforcement-pipeline --strict` must pass only after the D7 spec names the concrete state families above or an equivalent closed model.

## Complete Repair Required To Make D7 Acceptable Input

The D7 OpenSpec packet must be repaired before implementation. The repaired packet must:

- Add a normative spec requirement for `CheckOutcome` and `RuleReportDraft` constructors deriving `ok` and `status`.
- Add a requirement that D7 consumes D2 selector/execution projections, D3 graph target/refusal states, D5 baseline application/integrity results, D6 diagnostic outcomes, and D10 guard decisions without reading whole `HarnessRule` or recomputing adjacent authority.
- Add D0 compatibility rows or cite existing concrete rows for every public check/report/export/hook surface D7 changes.
- Replace generic validation bullets with the falsifying gates above, including negative contradiction tests and injected unavailable-dependency/adapter-failure cases.

Until those are present, D7 remains BLOCKING.

Skills used: domain-design, information-design, solution-design, civ7-open-spec-workstream, typescript-refactoring.
