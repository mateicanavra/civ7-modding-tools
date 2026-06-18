# D7 OpenSpec / Information Design Investigation

Status: BLOCKING

## Review Frame

This is a fresh adversarial review of:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D7-structural-enforcement-pipeline.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d7-structural-enforcement-pipeline/`

I treated prior agent findings as non-authoritative. The acceptance bar is whether the D7 OpenSpec packet leaves a later execution agent with no product/domain trade-off to invent. It does not.

The current D7 packet has topic labels without executable information architecture. It names categories such as registry facts, graph facts, diagnostic projections, baselines, generated-zone guards, `CheckReport`, consumers, validation, and stop conditions without defining the state model, inventories, tables, scenarios, or artifact contracts that make those labels executable.

## Blocking Findings

### P1: `design.md` does not contain the current-state inventory required to refactor `createCheckReport`

The source D7 packet explicitly requires current `CheckReport` field inventory, selector scenarios, and baseline/Grit consumer boundaries. The OpenSpec `design.md` does not inventory the current enforcement state at all. It never enumerates the current responsibilities mixed in `tools/habitat-harness/src/lib/command-engine.ts`: selector validation, selected rule set construction, staged Grit filtering, Grit/native/file-layer execution, baseline load/application, baseline integrity, status derivation, report construction, JSON validation, rendering, output writing, and verify consumption.

Missing artifact contract: add a "Current Enforcement Inventory" table with columns for current symbol/path, current role, public/D0 surface impact, source authority today, target owner, target D7 stage, consumed upstream contract, false-green risk, and required deletion/migration. This must include at least `CheckOptions`, `RuleSelectionResult`, `rulesForExecution`, `executeSelectedRules`, `createRuleSelectionFailureReport`, `createCheckReport`, `RuleReport`, `CheckReport`, `validateCheckReport`, `renderCheckReport`, `stringifyCheckReport`, staged/file-layer behavior, and verify's current `createCheckReport` call.

Without this table, an implementer must decide which existing shapes are compatibility facades, which are target names, and which code paths are deleted.

### P1: D7 has no target state model for enforcement outcomes

The D7 design says "Specify result aggregation and failure/refusal states" but does not specify them. There is no discriminated union or equivalent closed model for:

- selector request, selector failure, empty selection, and selected rule set;
- execution planning vs execution result;
- skipped/staged/not-run rule states;
- D6 diagnostic outcomes consumed by enforcement;
- D5 baseline application and integrity outcomes consumed by enforcement;
- D10 protected-zone guard outcomes consumed by enforcement;
- D7-owned rule status derivation;
- `CheckReport.ok` derivation;
- command/report refusal state.

This violates the TypeScript state-space bar. The current code already has an `ok: boolean` report field correlated by convention with rule statuses. D1 states that `CheckReport.ok` must be derived from rule statuses or validation must reject contradictions. D7 must define the constructor/validator contract that makes that impossible.

Missing artifact contract: add a "Target Enforcement State Model" section with concrete type-shape pseudocode or tables. It needs `CheckRequest`, `RuleSelectionOutcome`, `RuleExecutionPlan`, `RuleExecutionOutcome`, `RuleAggregationInput`, `RuleAggregationOutcome`, `CheckReportConstructionResult`, and `CheckRenderRequest`. Each state needs selected-when conditions and forbidden combinations.

### P1: consumed upstream contracts are named but not integrated

The proposal lists D2/D3/D5/D6/D10 as inputs, but the packet never says exactly what D7 consumes from each or what D7 may not recompute.

Required consumed-contract table is missing:

| Upstream | D7 must consume | D7 must not do |
| --- | --- | --- |
| D2 | `ruleSelectorFacts`, `ruleReportFacts`, `ruleExecutionFacts`, `ruleBaselineFacts`, `ruleGritFacts`, `ruleGeneratedZoneFacts` as applicable | read whole `RuleRegistryRecord`/legacy `HarnessRule` as authority or parse prose `scope`, `detect`, `message`, `remediate` |
| D3 | available target, aggregate target, dependency declaration, resolved dependency, graph refusal facts for check invocation surfaces | treat Nx wrapper exit 0 or `node -e ""` alias as structural success |
| D5 | `BaselineApplicationResult`, `BaselineIntegrityResult`, D5 refusal reasons | load/apply baseline internals or decide shrink-only integrity locally |
| D6 | `DiagnosticRunOutcome` or discriminated consumer projection with non-empty findings, adapter failure, projection miss, cache/freshness failure | consume raw Grit reports/process records or infer Pattern Governance/apply safety |
| D10 | protected-zone guard decisions/refusals and recovery guidance | hard-code generated zones or downgrade protected-zone violations to advisory warnings |

Without this table, D7 remains a broad orchestration bucket and implementers decide owner boundaries while coding.

### P1: D0/D1 public-surface blockers are not actionable

D7 says "Check JSON may change through D0 compatibility and D1 receipt/non-claim decisions" and "D0 compatibility disposition" is needed, but it does not list the specific D0 rows or row classes D7 must cite before source implementation.

Missing artifact contract: add a public-surface compatibility inventory with one row per touched plane: `habitat check` flags/exit behavior, `--json` schemaVersion 1 report shape, invalid selector JSON/human behavior, `--output`, `--staged`, `--expand-baseline` interaction boundaries if touched, `CheckReport`/`RuleReport`/`HabitatDiagnostic`/`validateCheckReport` package exports, `renderCheckReport`/`stringifyCheckReport` exports, verify's check summary consumption, hook parse expectations, docs examples, and Nx `habitat:check`/`habitat:rule:*` surfaces where D3 projects invocation.

D1-specific blockers are also missing: D7 must adopt the D1 distinction that `CheckReport` is check output, not receipt/proof; diagnostics are findings inside reports; refusals and recovery are explicit; canonical non-claims bound the report. The D7 packet does not list the D1 non-claims it inherits or the D1 bad case `ok: true` with a failing rule.

### P1: D11/D12 consumer contracts are missing

D7 claims it unblocks D11 and D12, but it does not define what they receive.

Missing D11 contract: a hook-local projection for structural check outcome that distinguishes pass, fail, advisory-only, refused/blocked, malformed/unavailable diagnostic input, baseline refusal, protected-zone refusal, and non-claims. D11 must be able to consume this without parsing human output or recreating check semantics.

Missing D12 contract: a verify-handoff projection that summarizes selected rules, selected real rules, built-in rules, status counts, advisory/failing counts, blocked/refused state, graph-related non-claims, and check-report validity without letting verify create new check authority. D12 must know whether a blocked upstream check prevents affected target execution and how to report skipped state.

The current downstream ledger row "Later domino packets | pending" is not a consumer contract.

### P1: spec delta is too thin to control implementation

`specs/habitat-harness/spec.md` contains one requirement and two scenarios. It does not cover:

- selector unknown, wrong namespace, empty intersection, and invalid selector human/JSON behavior;
- selected rule set and no-rule/refused states;
- clean enforced rule, failing enforced rule, advisory findings, and advisory-only check result;
- D6 adapter failure, scan-root refusal, projection miss, unexpected identity, and cache-observation-missing;
- D5 explicit-empty, explicit-debt, external-exception, baseline refusal, and baseline-integrity refusal handling;
- D10 protected-zone refusal during staged check;
- missing upstream authority/refusal states from D2/D3/D5/D6/D10;
- `CheckReport.ok` contradiction rejection;
- render/stringify truth equivalence;
- D11/D12 consumer projection scenarios;
- D0/D1 compatibility blocker scenarios.

The current scenarios "all inputs are available" and "an input authority is unavailable" are too broad to falsify a wrong implementation.

### P2: tasks remain design questions instead of implementation steps

Tasks 2.1-2.3 are:

- "Define check pipeline ownership and inputs from D2/D3/D5/D6/D10."
- "Specify result aggregation and failure/refusal states."
- "Separate enforcement result from orientation and receipts."

These are the core design deliverables, not source implementation steps. Under the OpenSpec workstream contract, tasks must be implementation steps after design is resolved.

Repair expectation: move design work into `design.md` and `spec.md`; rewrite tasks as ordered implementation slices with files, tests, deletion requirements, public-surface citations, and gates. Example task shape: "Introduce `RuleSelectionOutcome` from D2 `ruleSelectorFacts` in `<path>`; preserve invalid-selector JSON behavior covered by `<test>`; delete local selector namespace inference after projection tests pass."

### P2: validation matrix is not falsifying enough

The D7 proposal and phase record list green commands, but not expected statuses, bad cases, cache/freshness stance, proof oracle, non-claims, or which state each gate falsifies. The source packet required exact command behavior for clean, failing, advisory, selector failure, staged modes, baseline integrity current-tree check, representative injected violation proof, and cache stance.

Missing artifact contract: a validation matrix with columns: gate id, command/test, expected status, states covered, required bad case, cache/freshness stance, D0/D1 surface covered, non-claims, and closure owner. It should include separate rows for invalid selector JSON/human, stale selector cannot pass as baseline-covered proof, baseline refusal, D6 adapter failure/projection miss, staged generated-zone violation, advisory-only result, report contradiction rejection, `renderCheckReport`/`stringifyCheckReport`, and D11/D12 projection consumers.

### P2: workstream ledgers cannot support closure

The D7 review ledger records global constraints and a pending per-domino gate. The downstream realignment ledger has generic `pending` rows. The closure checklist has unchecked generic statements that could be satisfied by headings rather than content.

Missing ledger repairs:

- Review ledger needs rows for this investigation's accepted/rejected findings and concrete repair evidence paths.
- Downstream ledger needs named D0, D1, D2, D3, D5, D6, D10, D11, D12 rows with exact consumed/provided contract and patch/no-patch disposition.
- Closure checklist must require current-state inventory, target state model, false-green invariant matrix, consumed contract matrix, D11/D12 projection contracts, validation matrix, task rewrite, and no unresolved P1/P2 review findings.

## Wording That Lowers The Bar

The following current wording delegates design to implementation:

- `proposal.md`: "Define check pipeline ownership and inputs from D2/D3/D5/D6/D10." This says a design must happen later; it does not define the inputs.
- `proposal.md`: "Specify result aggregation and failure/refusal states." This is the central D7 state model, currently an unresolved task.
- `proposal.md`: "Check JSON may change through D0 compatibility and D1 receipt/non-claim decisions." This is true but insufficient; it lacks D0 row inventory and D1 non-claim adoption.
- `design.md`: "Target Contract" repeats the proposal bullets without adding design content.
- `design.md`: "Implementation Readiness" says the executor must have D0 disposition, write set, tests, and review findings, but the packet does not provide the D7-specific inventory needed to obtain them.
- `design.md`: "Use standard engineering terms..." is generic. It does not choose D7's target ontology or dispose current terms like `RuleSelectionResult`, `CheckOptions`, `RuleReport`, `RuleStatus`, `baselined`, `locked`, `detect`, `message`, `remediate`, `VerifyProof`, and `proof`.
- `tasks.md`: "Re-run or cite the required dependency gates" leaves dependency acceptance criteria open. D7 needs concrete accepted-design vs live-implementation blockers for each dependency.
- `spec.md`: "aggregate typed registry, graph, diagnostic, baseline, and protected-zone decisions" hides the actual aggregation rules. "Reports blocked or failed state" leaves the blocked-vs-failed trade-off to implementation.

## Proposed Information Architecture For The Rewrite

### `proposal.md`

1. Summary: D7 as Structural Enforcement report constructor and command outcome authority.
2. Product scenario: check command returns reliable structural result without false-green paths.
3. Authority and inputs: source D7 packet, remediation frame, accepted D0/D1/D2/D3/D5/D6, D10 status explicitly classified.
4. What changes: exact D7-owned responsibilities.
5. What does not change: registry, graph, diagnostic acquisition, baseline authority, protected-zone authority, hook local feedback, verify handoff.
6. Requires/enables with accepted-design vs live-implementation blockers.
7. Public-surface impact summary with pointer to detailed D0/D1 table in `design.md`.
8. Stop conditions as false-green invariants, not generic prose.
9. Validation gate summary with pointer to the full matrix.

### `design.md`

1. Frame and acceptance threshold.
2. Current Enforcement Inventory.
3. Domain boundary and single-authority owner map.
4. Target ontology and term disposition.
5. Consumed Contract Matrix for D2/D3/D5/D6/D10.
6. Target Enforcement State Model with closed states.
7. Pipeline stage design:
   - request normalization;
   - selector resolution;
   - execution planning;
   - diagnostic acquisition consumption;
   - baseline application;
   - protected-zone guard consumption;
   - rule aggregation/status derivation;
   - `CheckReport` construction/validation;
   - rendering/stringifying;
   - consumer projections.
8. False-Green Invariant Matrix: impossible state, current risk, target prevention, test/gate.
9. D0/D1 Public Surface Compatibility Blockers.
10. D11/D12 Consumer Contracts.
11. Implementation write set and protected paths.
12. Safe refactor sequence: characterize -> introduce closed states -> facades -> migrate consumers -> delete invalid paths.
13. Validation matrix with bad cases and non-claims.
14. Rejected alternatives.

### `specs/habitat-harness/spec.md`

Split the single broad requirement into scenario-specific requirements:

1. Structural Enforcement consumes named upstream projections.
2. Selector outcomes are closed and cannot execute as rule results.
3. Rule execution outcomes distinguish clean, findings, advisory, skipped, refused, and adapter-failed states.
4. Baseline application and integrity are D5 results rendered by D7.
5. Diagnostic acquisition failures cannot become pass.
6. Protected-zone guard refusals cannot become advisory/pass.
7. `CheckReport.ok` is derived or contradiction-rejected.
8. Human/JSON rendering preserve the same truth.
9. D11 consumes local-feedback-safe check projections.
10. D12 consumes verify-handoff-safe check projections.
11. Public surface changes wait for D0 rows and D1 non-claim/receipt boundaries.

Each requirement needs concrete scenarios for the bad cases named in the source D7 packet.

### `tasks.md`

Tasks should become implementation slices, not design placeholders:

1. Grounding and D0/D1/D2/D3/D5/D6/D10 live blocker citation.
2. Characterization tests for current selector/report behavior.
3. State model introduction.
4. Selector projection migration.
5. Diagnostic outcome consumption migration.
6. Baseline result consumption migration.
7. Protected-zone guard consumption migration.
8. Report constructor and validator hardening.
9. Renderer/stringifier truth equivalence.
10. D11/D12 consumer projection additions.
11. Deletion of local recomputation and substitute-authority paths.
12. Validation and downstream realignment.

### Workstream ledgers

The phase record should name acceptance threshold, dependency status, write/protected paths, and validation matrix. The review ledger should track this review and repairs. The downstream ledger should have one row per upstream consumed contract and downstream consumer. The closure checklist should fail if any design table, scenario set, validation row, or ledger disposition is absent.

## Stop Condition Applied

An execution agent would still have to guess multiple product/domain trade-offs:

- what exact D7 closed state model replaces the current boolean/optional report construction;
- whether blocked upstream input is a failed rule, a refused check, a command failure, or a separate report state;
- how to map every D5/D6/D10 failure family into `RuleReport.status`, diagnostics, and `CheckReport.ok`;
- what D11 and D12 may consume without parsing the full check report;
- which D0/D1 surfaces must be preserved, facaded, versioned, or refused before source edits.

Therefore D7 is BLOCKING until those artifact contracts are written into the OpenSpec packet.
