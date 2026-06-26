# Proposal: D7 Structural Enforcement Pipeline

## Summary

D7 specifies the Structural Enforcement Pipeline for Habitat `check`. It turns
selected rule metadata, graph invocation facts, diagnostic outcomes, baseline
application results, and protected-zone guard decisions into one coherent check
outcome, public `CheckReport`, human rendering, and command exit decision.

This packet replaces the prior incomplete packet with design/specification
content. Source-start inventory is now recorded for the D7 structural
check/report slice. D10 generated/protected-zone authority remains out of scope
until the later D10 packet lands.

## Product Scenario

An agent or human runs `habitat check`, `habitat check --json`, or a selector
such as `--owner`, `--rule`, `--tool`, or `--staged`. Habitat returns a
trustworthy structural result where:

- selector refusals are not confused with rule execution;
- advisory findings do not fail the check;
- enforced uncovered findings do fail the check;
- dependency, baseline, diagnostic, graph, or protected-zone refusals cannot
  become pass;
- baseline-covered findings remain visible as covered debt;
- JSON, human output, and process exit state are derived from the same
  finalized check outcome.

## Authority

- Direct user D7 entry gate and remediation restart decisions.
- `$REMEDIATION_DIR/context.md` for path variables.
- `$D7_SOURCE_PACKET` as controlling domino input.
- Accepted design/specification packets D0, D1, D2, D3, D5, and D6.
- D10 as a required protected-zone dependency, currently still draft/blocking.
- Current Habitat code/tests as current-behavior evidence, not target authority.
- Domain Design, Ontology Design, Information Design, Solution Design,
  TypeScript Refactoring, Testing Design, and Civ7 OpenSpec Workstream skills.

## What Changes

- D7 defines the check pipeline owner boundary and target state model.
- D7 defines how upstream projections are consumed without recomputing adjacent
  domain authority.
- D7 defines false-green prevention invariants for selector, execution,
  diagnostic, baseline, graph, protected-zone, report, rendering, and exit
  states.
- D7 defines D11 and D12 consumer projections so later packets do not infer
  check semantics from current `command-engine.ts`.
- D7 defines a validation matrix that falsifies real check risks.

## What Does Not Change

- D7 does not own D0 public-surface classification or concrete compatibility
  rows.
- D7 does not own D1 command receipt, verify receipt, hook trace, refusal record,
  or non-claim family definitions.
- D7 does not own D2 rule registry metadata, selector facts, or rule facet
  projections.
- D7 does not own D3 graph truth, target availability, alias dependency
  resolution, or Nx graph refusal reasons.
- D7 does not own D5 baseline state, shrink-only integrity, expansion decisions,
  external exception projection, or rule-introduction manifests.
- D7 does not own D6 diagnostic acquisition, Grit/native catalog identity,
  injected probes, adapter failure taxonomy, or cache/freshness observations.
- D7 does not own D10 protected-zone or generated-zone policy.
- D7 does not own D11 hook sequencing/local feedback or D12 verify handoff
  receipt schema.

## Requires

| Dependency | D7 design use | Source implementation blocker |
| --- | --- | --- |
| D0 | Public-surface planes and closed compatibility handling. | Concrete D0 rows are required before changing command JSON, human output, package exports, hook parsing, docs examples, script/Nx outputs, generated help, or exit behavior. |
| D1 | Check report boundary, refusal/non-claim discipline, and receipt/trace separation. | D1 implementation and output-family decisions must exist wherever D7 touches D1-governed public compatibility names. |
| D2 | Selector facts, rule report facts, rule execution facts, baseline/Grit/generated-zone projections. | Live D2 projections must replace whole-row registry authority before source implementation removes current `HarnessRule` coupling. |
| D3 | Graph target/check invocation availability and graph-refusal states. | Live D3 graph projections must exist before D7 can prevent check-related Nx wrapper false greens in source. |
| D5 | `BaselineApplicationResult`, `BaselineIntegrityResult`, and D5 refusal diagnostics. | Live D5 baseline application/integrity results must exist before D7 deletes local baseline loading/application. |
| D6 | `DiagnosticRunOutcome` or diagnostic consumer projection. | Live D6 diagnostic projections must exist before D7 deletes local Grit/native diagnostic coupling. |
| D10 | Protected-zone guard decision/refusal consumed by staged/file-layer check. | D10 is later in the stack; D7 preserves current file-layer behavior only and does not implement protected-zone report authority until D10 acceptance and live guard results. |

## Enables

- D11 Local Feedback can consume D7's local-feedback-safe check projection
  instead of parsing current human output or reinterpreting `CheckReport`.
- D12 Verify Handoff Receipt can consume D7's verify-check summary and skip/allow
  affected-target execution without redefining check semantics.

## Public Surface Impact

D7 is public-surface heavy. Source implementation must cite concrete D0 rows
before touching:

- `habitat check` flags, selector behavior, `--json`, `--output`, `--staged`,
  `--expand-baseline`, process exit behavior, and human output;
- `CheckReport`, `RuleReport`, `HabitatDiagnostic`, `RuleStatus`,
  `validateCheckReport`, `createCheckReport`, `renderCheckReport`, and
  `stringifyCheckReport` package exports;
- hook parsing/feedback that reads check JSON or messages;
- verify summary fields derived from check reports;
- Nx `habitat:check` / `habitat:rule:*` command surfaces;
- docs/examples and generated help/manifests that show check output.

Allowed D0 handling values remain exactly `preserve`, `version`, `facade`,
`deprecate`, `refuse`, `document-only`, and `generated-only`.

## Stop Conditions

Stop D7 if any artifact permits:

- `CheckReport.ok` to contradict finalized rule statuses;
- a selector refusal to be represented as ordinary successful rule execution;
- selected rules to disappear without an explicit not-run/refused disposition;
- diagnostic adapter failure, graph refusal, baseline refusal, or protected-zone
  refusal to become pass;
- advisory and enforced lanes to share status derivation by convention only;
- baseline-covered diagnostics to disappear from the report;
- renderer/stringifier/output code to invent semantics absent from the finalized
  structured outcome;
- D7 to read whole registry, baseline, Grit, graph, or protected-zone internals
  after the owning upstream projection exists.

## Verification Gates

Design-time gates:

- `bun run openspec -- validate deep-habitat-d7-structural-enforcement-pipeline --strict`
- `bun run openspec:validate`
- `git diff --check`
- D7 complete-standard wording audit across `$D7_CHANGE/**` and D7 scratch/final
  review records.

Later implementation gates are defined in `design.md` and `tasks.md`. Current
known evidence from fresh review:

- `baseline-integrity` is a built-in report row today, not a selectable rule.
  Any selectable built-in command behavior is a D0/D7 design change.
- Current entrypoint/enforcement inventory tests are red for help/inventory
  drift and must be repaired or explicitly dispositioned before source closure.
