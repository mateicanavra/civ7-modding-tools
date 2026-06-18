# D6 Latest-Disk Final Rereview: TypeScript State-Space And Validation

## Scope

Fresh final rereview of the latest disk state for the D6 Diagnostic Pattern
Catalog TypeScript state-space and validation lane. Initial gate confirmed with
`git status --short --branch` before review work:

```text
## codex/d6-diagnostic-pattern-packet-repair
```

This rereview does not implement source code, does not edit D6 packet/control
files, and does not grant implementation acceptance.

## Sources Read

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/testing-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/llm-slop-cleanup.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/worked-examples.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/review-disposition-ledger.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/closure-checklist.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D6-final-rereview-typescript-validation-after-repair.md`

## Verdict

Accepted for design/specification only.

No unresolved P1/P2 findings remain for this latest-disk TypeScript/validation
lane. The latest disk gives the later implementation a closed enough type-state
and validation contract for D6 design/specification acceptance: illegal states
are pushed into discriminated models, findings states cannot be empty, parsed
acquisition is completed-only, probe success is restored-only, and downstream
consumer projection no longer depends on optional failure fields.

This is not implementation acceptance. D6 source implementation remains blocked
behind concrete D0 public/durable compatibility rows, D1 output-family decisions
where touched, and live D2 `ruleGritFacts` projections.

## Latest-Disk Type-State Assessment

### Non-empty findings states are repaired

Accepted. The prior empty-findings acceptance risk is repaired at all three
state levels this lane needs:

- Native parsed reports split clean from findings, and findings reports require
  `NonEmptyReadonlyArray<NativeDiagnosticFinding>` (`design.md:271`,
  `design.md:273`, `design.md:275`).
- `DiagnosticRunOutcome.kind == "clean"` carries `readonly []`, while
  `DiagnosticRunOutcome.kind == "findings"` carries
  `NonEmptyReadonlyArray<DiagnosticFindingProjection>` (`design.md:314`,
  `design.md:316`).
- `DiagnosticConsumerProjection.kind == "clean"` carries `readonly []`, while
  the findings consumer projection carries
  `NonEmptyReadonlyArray<DiagnosticFindingProjection>` (`design.md:372`,
  `design.md:378`, `design.md:382`, `design.md:386`).

The spec now states the same invariant normatively: findings report, run outcome,
and consumer projection each carry at least one diagnostic finding, and D7
findings projections cannot represent an empty diagnostic set (`spec.md:154`,
`spec.md:160`, `spec.md:238`, `spec.md:243`). Tasks also preserve the invariant
as an implementation slice (`tasks.md:46`, `tasks.md:51`).

### Prior P2 repairs remain accepted on latest disk

Accepted. The previous TypeScript/validation P2s remain repaired after the
non-empty findings update:

- Closed diagnostic identity and command families: `DiagnosticIdentity`,
  `DiagnosticScanContract`, `DiagnosticProjectionContract`,
  `NativeDiagnosticAcquisitionContract`, `DiagnosticNonClaim`, and
  `NativeGritCommandFamily` are explicit closed sets (`design.md:127`,
  `design.md:140`, `design.md:144`, `design.md:148`, `design.md:151`,
  `design.md:192`). The spec refuses unknown command families and forbids bare
  string command-family authority (`spec.md:82`, `spec.md:88`).
- Parsed acquisition is limited to completed observations:
  `CompletedDiagnosticCommandObservation` is separated from the broader
  observation union, and `GritDiagnosticAcquisition.kind == "parsed"` accepts
  only the completed command state (`design.md:210`, `design.md:218`,
  `design.md:225`, `design.md:264`). The spec repeats that parsed acquisition
  carries a completed command observation only (`spec.md:111`, `spec.md:116`).
- Injected probe success is restored-only:
  `probe-diagnostic-observed` carries `cleanup: "restored"`; dirty or unrestored
  cleanup is represented by `probe-cleanup-failed` (`design.md:330`,
  `design.md:339`, `design.md:347`). The spec forbids dirty or unrestored
  cleanup from being represented as success (`spec.md:203`, `spec.md:211`) and
  preserves observed diagnostics only as cleanup-failure context (`spec.md:226`,
  `spec.md:230`).
- Consumer projection is discriminated rather than optional-field soup:
  `DiagnosticConsumerProjection` has separate clean, findings,
  scan-root-refused, adapter-failed, and limitation/failure projection variants
  (`design.md:372`, `design.md:381`, `design.md:389`, `design.md:397`,
  `design.md:405`). The design explicitly forbids flattening failure fields into
  optional properties (`design.md:414`).

### Validation design is adequate for design/specification

Accepted. The later implementation validation matrix names the important
falsification cases rather than relying on generic test coverage: malformed or
wrapper JSON cannot become clean, adapter failure cannot become a structural
pass, missing D2 `patternIdentity` cannot fall back to `ruleId`, D9 `GritApply*`
tags cannot enter D6 diagnostic states, scan-root families cannot collapse into
generic command failure, cache/freshness observation is checked, and injected
probe cleanup residue is observable (`phase-record.md:69`, `phase-record.md:81`;
`tasks.md:56`, `tasks.md:71`).

Those gates are implementation proof obligations only. They do not show source
behavior is already implemented, and the packet correctly keeps source work
blocked (`proposal.md:75`, `design.md:429`, `tasks.md:14`,
`phase-record.md:30`, `spec.md:264`).

## P3 Notes

- `DiagnosticConsumerProjection` groups `projection-missed`,
  `unexpected-diagnostic-identity`, and `cache-observation-missing` into one
  reduced consumer variant with `limitation: DiagnosticNonClaim` rather than
  carrying each richer run-outcome field (`design.md:405`). This is acceptable
  because D7 can consume `DiagnosticRunOutcome` directly, but implementation
  should confirm no downstream consumer relies on the reduced projection for
  expected/unexpected identity detail.
- `NativeDiagnosticAcquisitionContract` currently contains only
  `docs-text-diagnostic` with `standard-text-report` (`design.md:148`), while
  command requests also model `standard-apply-dry-run` observations
  (`design.md:192`, `design.md:206`; `spec.md:90`). This is not a P2 because
  command-family/output-contract states remain closed and D9 apply safety is
  explicitly excluded, but implementation should keep the docs text and apply
  dry-run observation split visible in type names and tests.

## Closure Statement

For the latest-disk TypeScript/validation lane, D6 can be accepted for
design/specification only with no unresolved P1/P2 findings. Existing control
records still need the project-level acceptance gate to update after all fresh
latest-disk lanes complete (`review-disposition-ledger.md:52`,
`closure-checklist.md:29`, `phase-record.md:67`).
