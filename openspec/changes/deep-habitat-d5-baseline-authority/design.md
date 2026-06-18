# Design: D5 Baseline Authority

## Frame

D5 owns Habitat's structural-debt baseline authority. It decides whether a rule
has an explicit empty baseline, explicit tracked debt, a modeled external
exception source, or a baseline contract refusal. It also decides whether a
baseline write is accepted or refused under shrink-only integrity.

The D5 source packet is controlling input, and this OpenSpec packet is the
execution-ready design/specification layer. Current code is present-behavior
input, not target-domain authority. D5 is accepted only when a future TypeScript
implementation can collapse invalid baseline states without reopening product
or ownership decisions.

## Solution Frame

- Frame: Habitat baselines are repo-maintenance controls for structural debt,
  not a generic artifact ledger and not Pattern Governance admission.
- Aspiration threshold: the executor can introduce closed unions for baseline
  authority state, expansion guard decisions, external exception source models,
  and consumer projections while preserving or facading public surfaces through
  D0.
- Constraint reality: D5 may consume D0/D2 accepted design/specification state
  now, but source implementation remains blocked behind concrete D0 rows and
  live D2 rule identity/facet projections.

## Domain Boundary

D5 owns:

- baseline file state for registered rules;
- missing, malformed, unsorted, duplicate, non-string, orphan, and unreadable
  baseline refusals;
- modeled external exception source projection and projection mismatch refusal;
- parser-owned baseline bypass refusal;
- comparison-base, base registry, and base baseline read refusals for
  shrink-only checks;
- existing-rule growth refusal;
- rule-introduction manifest acceptance/refusal for seeded new-rule debt;
- the baseline application result consumed by D7;
- the baseline integrity result consumed by D7;
- the D5-published baseline authority projection/refusal result consumed by D8;
- baseline-related command diagnostics and `--expand-baseline` guard decisions.

D5 does not own:

- D0 compatibility actions or public-surface row completeness;
- D2 rule identity, owner facets, registry schema, or route truth;
- D7 rule selection, rule execution, `CheckReport` construction, report
  rendering, or enforcement pipeline staging;
- D8 Pattern Governance lifecycle, pattern admission, hook/apply approval, or
  manifest lifecycle beyond consuming D5's baseline authority projection;
- D13 generator/scaffolding behavior;
- native rule internals such as doc-ambiguity matching outside D5's modeled
  external exception projection contract.

## Target Ontology

| Term | Decision |
| --- | --- |
| `DiagnosticKey` | Stable identity for a diagnostic that may be covered by a baseline. Current implementation evidence uses `path::message`; D5 owns whether a key is covered, uncovered, projected, or refused. |
| `BaselineEntry` | One sorted unique diagnostic key entry in `$HABITAT_TOOL/baselines/<rule-id>.json`. It is not Pattern Governance admission and not a generic structural-debt record. |
| `ExternalExceptionProjectionEntry` | One diagnostic key produced from a modeled external exception source. It is accepted only through the external projection contract. |
| `BaselineApplicationMatch` | Result of applying D5 authority to a live diagnostic. It is a consumer result for D7, not a durable data row. |
| `BaselineAuthorityState` | Target rule-level state union: `explicit-empty`, `explicit-debt`, `external-exception`, or `baseline-refusal`. |
| `BaselineRefusal` | D5-owned refusal object with a stable reason, rule id when known, location, and command-facing diagnostic message. It replaces generic failure language in target code. |
| `BaselineApplicationResult` | D5 result consumed by D7 after rule execution. It marks covered diagnostics, returns new diagnostics unchanged, and returns baseline refusals as command diagnostics. |
| `BaselineIntegrityResult` | D5 shrink-only integrity result for current tree vs comparison base. It reports accepted integrity or one or more refusals. |
| `BaselineExpansionDecision` | Target replacement for boolean `BaselineExpansionGuardResult`; it is either accepted for an introduced rule or refused with one stable reason. |
| `ExternalExceptionSource` | Target discriminated model for legacy sources outside `tools/habitat-harness/baselines/*.json`. Each variant has exactly one projection strategy and required validation behavior. |
| `RuleIntroductionBaselineManifest` | D5-owned manifest for accepting seeded baseline rows only when the rule is absent from the comparison base and manifest fields match the requested write. |
| `BaselineAuthorityProjection` | D5-published consumer projection for D8. It states whether baseline authority is explicit-empty, explicit-debt, external-exception, or refused. D8 consumes it; D8 owns lifecycle/admission. |

Rejected target language:

- `baseline decision` without naming application, integrity, expansion, or
  projection context.
- wording that gives D5 any share of D8 admission authority. The correct
  direction is D5-published baseline authority projection/refusal result
  consumed by D8.
- row freshness wording as an unmodeled bucket. Use `orphan-baseline`, external
  projection mismatch, `existing-rule growth`, or a named baseline refusal.
- row-level acceptance wording when the entry is simply tracked explicit debt.
  Use `tracked baseline key` or `explicit debt key`.
- generic structural-debt record wording because it conflates diagnostic key,
  baseline entry, external projection entry, and baseline application match.
- generic artifact-accounting terms as target code/type names. Use result,
  diagnostic, check, guard decision, projection, refusal, receipt when a command
  receipt is actually the product object, and command outcome.

## Baseline Authority State Matrix

| State or refusal | Selected when | Required fields | Consumer effect |
| --- | --- | --- | --- |
| `explicit-empty` | Registered rule has a sorted empty JSON array baseline file. | `ruleId`, `baselinePath`, `keys: []`, `locked: true`. | D7 treats every reported error as new. D8 sees explicit empty baseline authority. |
| `explicit-debt` | Registered rule has a sorted non-empty JSON array baseline file. | `ruleId`, `baselinePath`, sorted `keys`, `locked: false`. | D7 marks matching diagnostics as covered debt. D8 sees explicit debt baseline authority. |
| `external-exception` | Registered rule has a modeled external source and no explicit baseline file. | `ruleId`, `sourcePath`, `owner`, `migrationOwner`, sorted `projectedKeys`, `locked: false`. | D7 accepts only diagnostics pre-marked to exactly match projected keys. D8 sees external exception baseline authority. |
| `missing-baseline` | Registered rule has neither explicit baseline nor modeled external source. | `ruleId`, expected `baselinePath`, reason. | D7 emits baseline contract diagnostic; D8 sees refusal. |
| `malformed-baseline` | Baseline file cannot be read, is invalid JSON, or is not an array. | `ruleId`, `baselinePath`, reason detail. | D7 emits diagnostic; integrity fails. |
| `non-string-baseline-key` | Baseline array includes non-string entry. | `ruleId`, `baselinePath`, index. | D7 emits diagnostic; integrity fails. |
| `duplicate-baseline-key` | Baseline array repeats a key. | `ruleId`, `baselinePath`, duplicate key. | D7 emits diagnostic; integrity fails. |
| `unsorted-baseline` | Baseline keys are not lexicographically sorted. | `ruleId`, `baselinePath`. | D7 emits diagnostic; integrity fails. |
| `orphan-baseline` | Baseline JSON file exists for no registered rule. | orphan `ruleId`, `baselinePath`. | Built-in baseline-integrity report fails. |
| `unmodeled-external-exception` | Registry declares an exception path but D5 has no modeled external source. | `ruleId`, exception path. | D7 emits diagnostic; D8 sees refusal. |
| `external-exception-source-unreadable` | Modeled external source cannot be read. | `ruleId`, `sourcePath`. | D7 emits diagnostic; D8 sees refusal. |
| `external-exception-source-malformed` | Modeled external source cannot be parsed or projected into sorted keys. | `ruleId`, `sourcePath`. | D7 emits diagnostic; D8 sees refusal. |
| `external-exception-projection-mismatch` | Rule-reported pre-covered diagnostics do not exactly match projected keys. | `ruleId`, `sourcePath`, expected/actual counts. | D7 emits diagnostic and requires complete projection equality. |
| `parser-owned-baseline-without-contract` | A rule using explicit Habitat baseline state reports pre-covered diagnostics. | `ruleId`, `baselinePath`. | D7 emits diagnostic; parser output cannot bypass D5. |
| `comparison-base-unavailable` | Shrink-only integrity cannot resolve requested comparison base. | requested base. | Baseline-integrity fails; expansion is refused. |
| `base-rule-registry-missing` | Comparison base lacks readable rule registry. | comparison ref, registry path. | Baseline-integrity fails; expansion is refused. |
| `base-rule-registry-malformed` | Comparison base rule registry is unreadable as a valid rule list. | comparison ref, registry path. | Baseline-integrity fails; expansion is refused. |
| `base-baseline-unreadable` | Comparison base baseline file cannot be parsed for an explicit current baseline. | comparison ref, `ruleId`, baseline path. | Baseline-integrity fails for that rule. |
| `baseline-growth-existing-rule` | Current baseline adds keys for a rule present in comparison base. | `ruleId`, added keys, comparison ref. | Baseline-integrity fails; `--expand-baseline` refuses before writing. |
| `rule-introduction-manifest-missing` | New-rule baseline has seeded keys but no matching manifest. | `ruleId`, added keys, comparison base. | Baseline-integrity fails; expansion is refused. |
| `rule-introduction-manifest-mismatch` | Manifest rule id, baseline path, keys, or comparison base do not match requested write. | manifest mismatch detail. | Baseline-integrity fails; expansion is refused. |

## TypeScript State-Space Reduction

The later implementation must collapse these current state-space smells:

| Current smell | Target move |
| --- | --- |
| `BaselineExpansionGuardResult` uses `ok: boolean` plus optional `reason`. | Replace with a `BaselineExpansionDecision` union: accepted introduced-rule baseline or refused baseline expansion with a stable reason. |
| `ExternalExceptionSourceModel` allows `projectedKeys?`, `projectKeys?`, and `validate?` in optional combinations. | Replace with a discriminated `ExternalExceptionSource` union where each variant has one projection strategy and required validation semantics. |
| `BaselineContractFailure` doubles as rule-level state, integrity finding source, and command diagnostic payload. | Keep or facade for D0 compatibility, but target code should use `BaselineRefusal`, `BaselineIntegrityResult`, and `BaselineApplicationResult` projections at boundaries. |
| `createCheckReport` loads/applies baseline state inline. | D5 may provide the baseline application/integrity result; D7 owns when and how those results become `CheckReport` rows. |
| Pattern Authority manifest validation reads baseline contract fields directly. | D5 publishes `BaselineAuthorityProjection`; D8 consumes it and decides lifecycle/admission. |
| Parser-owned `baselined` flags can appear before D5 chooses authority state. | D5 treats pre-covered diagnostics as valid only for modeled external exception projection equality; explicit baseline states refuse parser-owned bypass. |

Implementation sequence must be characterization -> closed states -> public
facade decisions -> consumer migration -> deletion of invalid states. Do not
split or rename files when the move only reduces file length and leaves the
state model unchanged.

## Public Surface Compatibility

Source implementation must stop until each touched surface has a concrete D0
row and the implementation cites that row.

| Surface | Plane | Required D0 row before source edits | Target handling |
| --- | --- | --- | --- |
| `$HABITAT_TOOL/baselines/*.json` | durable data | `blocked-pending-d0-row` | Preserve sorted JSON array contract or version through D0; never silently rewrite live baselines. |
| `habitat check --json` baseline diagnostics | command-json | `blocked-pending-d0-row` | Preserve/facade or version baseline failure messages, `baselined`, `locked`, and `baseline-integrity` report fields. |
| `habitat check --rule baseline-integrity --json` | command-json | `blocked-pending-d0-row` | Required D5 command outcome; no broad all-rule check can substitute for it. |
| `habitat check --expand-baseline` behavior and messages | command | `blocked-pending-d0-row` | Guarded by `BaselineExpansionDecision`; refusal happens before file writes. |
| Baseline exports from `$HABITAT_TOOL/src/index.ts` | package-export | `blocked-pending-d0-row` | Preserve/facade/version exported types/functions while adding target state model. |
| Pattern Authority `baselineContract` manifest fields | durable schema | `blocked-pending-d0-row` | D5 publishes projection; D8 owns lifecycle/admission semantics. |
| Pattern generator baseline contract messages | command/human-output | `blocked-pending-d0-row` | Keep as D8/D13 consumer surface; D5 may define baseline authority input only. |
| Docs/examples showing baseline failures | docs-example | `blocked-pending-d0-row` | Document-only after source behavior and D0 row alignment. |
| Generated help/manifests if command metadata changes | generated | `blocked-pending-d0-row` | Generated-only; regenerate from source. |

Allowed D0 compatibility actions remain only `preserve`, `version`, `facade`,
`deprecate`, `refuse`, `document-only`, and `generated-only`.

## D7 And D8 Consumption Rules

D5 consumes D2 through rule baseline facts only: rule id, baseline source
declaration, external exception relation, rule owner/tool facts required for
messages/projections, and `RuleIntroductionBaselineManifest` acceptance input.
D5 must not parse whole registry rows, prose `exceptionPath` text, or file
presence as a second registry authority once D2 projections exist.

D7 consumes:

- `BaselineApplicationResult` for each executed rule;
- `BaselineIntegrityResult` for the built-in baseline-integrity rule;
- command diagnostics produced from D5 refusals.

D7 may not load untyped baseline internals after D5 publishes target results,
decide shrink-only policy, decide rule-introduction manifest acceptance, or
reinterpret external exception projections.

D8 consumes:

- `BaselineAuthorityProjection` for pattern lifecycle/admission checks;
- baseline refusal state when D5 cannot publish an accepted projection.

D8 may not decide whether baseline debt is accepted, whether an external source
projection is valid, whether seeded debt is allowed, or whether existing-rule
growth is permitted. D8 owns what a Pattern Authority lifecycle state does with
D5's result.

## Write Set And Protected Paths

The D5 OpenSpec repair write set is `$D5_CHANGE/**`, `$D5_REVIEW_LEDGER`,
`$D5_PHASE_RECORD`, `$D5_DOWNSTREAM_LEDGER`, `$D5_CLOSURE_CHECKLIST`,
`$REMEDIATION_DIR/context.md`, `$REMEDIATION_DIR/packet-index.md`, and D5
scratch review records under `$AGENT_SCRATCH`.

Later source implementation may edit only after D5 acceptance and prerequisites:

| Area | Allowed purpose |
| --- | --- |
| `$HABITAT_TOOL/src/lib/baseline.ts` | Define D5 state/result/projection unions, external source variants, integrity and expansion decisions. |
| `$HABITAT_TOOL/src/lib/command-engine.ts` | Consume D5 application/integrity results without redesigning D7 report construction. |
| `$HABITAT_TOOL/src/commands/check.ts` | Preserve or facade `--expand-baseline` command behavior through D0-cited decisions. |
| `$HABITAT_TOOL/src/index.ts` | Preserve/facade/version baseline exports only with D0 rows. |
| `$HABITAT_TOOL/test/lib/baseline.test.ts` | Cover the full D5 state/refusal matrix and invalid state combinations. |
| `$HABITAT_TOOL/test/commands/habitat-entrypoints.test.ts` | Cover baseline command JSON/status for D5 public outcomes. |
| `$HABITAT_TOOL/test/commands/habitat-commands.test.ts` | Cover command adapter behavior for `--expand-baseline`. |
| `$HABITAT_TOOL/test/generators/pattern-generator.test.ts` and `$HABITAT_TOOL/test/rules/pattern-authority-manifest.test.ts` | Cover D8 consuming the D5 projection; do not implement D8 lifecycle redesign. |
| Fixture-only baseline files under test-controlled temp roots | Inject malformed/missing/orphan/growth/manifest cases. |

Protected paths:

- unrelated D7 enforcement pipeline redesign beyond D5 result consumption;
- unrelated D8 Pattern Governance lifecycle/admission implementation;
- D13 generator/scaffolding behavior beyond D5 baseline projection tests;
- generated artifacts, lockfiles, and live baseline JSON edits not justified by
  D5 fixtures or current-tree baseline-integrity command;
- D2 registry/schema source except consuming implemented rule identity/facet
  projections;
- non-Habitat Civ/MapGen product domains.

## Validation Design

Design-time validation:

- strict D5 OpenSpec validation;
- full OpenSpec validation;
- `git diff --check`;
- D5 wording audit for reduced-standard language in active packet/control/final
  scratch.

Later implementation validation:

- focused baseline unit tests for every state/refusal and forbidden state
  combination;
- command entrypoint tests for baseline-integrity JSON and `--expand-baseline`
  refusal before writes;
- Pattern Authority/generator tests only for consuming D5 projection/refusal
  result;
- `bun run habitat check --rule baseline-integrity --json` as the command
  outcome for current-tree baseline integrity.

`bun run habitat check --json` may be useful for broad current-tree health but
is not the D5 command outcome and cannot replace the baseline-integrity rule
gate.

## Non-Goals

- No broad "baseline cleanup" that changes live baseline files without a D5
  fixture/current-tree command reason.
- No Pattern Governance lifecycle states in D5.
- No generic artifact subsystem.
- No command/report pipeline rewrite beyond D5 result consumption.
- No implementation before D5 final review acceptance.
