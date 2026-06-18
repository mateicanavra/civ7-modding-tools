# D6 Final Rereview After Observed-Identity Repair: TypeScript State-Space And Validation

## Scope

Fresh final rereview of the latest D6 disk state for TypeScript state-space and
validation design after the observed-identity repair. Initial gate confirmed with
`git status --short --branch` before reading or writing:

```text
## codex/d6-diagnostic-pattern-packet-repair
```

The worktree already contained modified D6 packet/control files and prior scratch
reviews. This review did not implement source code, did not edit D6
packet/control files, and did not commit.

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
- `/Users/mateicanavra/.agents/skills/typescript/SKILL.md`
- `/Users/mateicanavra/.agents/skills/typescript/references/design-patterns.md`
- `/Users/mateicanavra/.agents/skills/typescript/references/refactoring-patterns.md`
- `/Users/mateicanavra/.agents/skills/typescript/references/axes.md`
- `/Users/mateicanavra/.agents/skills/typescript/references/where-defaults-hide.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/closure-checklist.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md`
- Existing prior scratch references:
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D6-final-rereview-typescript-validation-after-repair.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D6-final-rereview-openspec-information-after-repair.md`

## Verdict

Accepted for design/specification only in the TypeScript/validation lane.

I found no unresolved P1/P2 findings against the latest repaired D6 disk state.
The observed-identity repair, non-empty findings-state repair, and earlier
closed-union repairs now meet the design/specification acceptance threshold for
this lane.

This is not implementation acceptance. D6 source remains blocked behind concrete
D0 public/durable compatibility rows, D1 output-family/compatibility decisions
where touched, and live D2 `ruleGritFacts` projections.

## Assessment

### Observed identity evidence is no longer accepted identity

Accepted. The latest `design.md` separates accepted `DiagnosticIdentity` from
raw `ObservedDiagnosticIdentity`:

- `design.md:76` through `design.md:87` define the identity vocabulary and mark
  observed identity as raw native-output evidence.
- `design.md:89` through `design.md:99` require observed evidence to match the
  selected identity and treat disagreements or unexpected identity as projection
  failure, not pass.
- `design.md:132` through `design.md:160` define accepted
  `DiagnosticIdentity` and separate `ObservedDiagnosticIdentity` variants.
- `design.md:293` through `design.md:305` keep parsed reports and native findings
  on observed identity evidence before projection.
- `design.md:321` through `design.md:352` project accepted
  `DiagnosticIdentity` only after match and keep observed mismatch as
  `unexpected-diagnostic-identity`.
- `spec.md:143` through `spec.md:185` require projection matching, unexpected
  identity failure, and `local_name`/parsed `check_id` disagreement behavior.

This repairs the prior type-state bug: raw native output can no longer be typed
as already accepted catalog identity. The state-space now has a real parse/match
boundary: observed evidence enters as `ObservedDiagnosticIdentity`; only matching
evidence is promoted into accepted diagnostic projections.

### Non-empty findings states are now modeled by type

Accepted. The latest state models now distinguish clean reports from findings
reports without permitting empty findings in a findings branch:

- `design.md:293` through `design.md:297` define `ParsedGritDiagnosticReport`
  with `findings-report.findings: NonEmptyReadonlyArray<NativeDiagnosticFinding>`.
- `design.md:336` through `design.md:343` define
  `DiagnosticRunOutcome.kind == "findings"` with
  `NonEmptyReadonlyArray<DiagnosticFindingProjection>`.
- `design.md:399` through `design.md:415` define findings consumer projections
  with non-empty diagnostics.
- `spec.md:156` through `spec.md:164` require the findings report, run outcome,
  and consumer projection each to carry at least one finding.
- `spec.md:249` through `spec.md:255` prohibit empty findings projections for D7.
- `tasks.md:46` through `tasks.md:53` preserve the non-empty findings obligation
  in later implementation slices.

This closes the prior reachable-state hole where a `"findings"` state could carry
`[]`, forcing consumers to re-check a state the discriminant should have proven.

### Prior closed-union repairs remain intact

Accepted. The earlier TypeScript/validation repairs are still present after the
observed-identity patch:

- Closed catalog and identity models: `design.md:101` through `design.md:181`.
- Closed scan-root decisions and refusal reasons: `design.md:187` through
  `design.md:209`, `spec.md:39` through `spec.md:68`.
- Closed native command families with arbitrary correlation moved to
  `commandInvocationId`: `design.md:211` through `design.md:230`, `spec.md:75`
  through `spec.md:89`.
- Parsed acquisition completed-only command observation:
  `design.md:232` through `design.md:251`, `design.md:286` through
  `design.md:289`, `spec.md:111` through `spec.md:117`.
- D6 diagnostic adapter failure subset excludes D9 `GritApply*` failures:
  `design.md:270` through `design.md:319`, `spec.md:105` through `spec.md:142`.
- Injected probe success requires restored cleanup, while dirty/unrestored
  cleanup is a failure variant: `design.md:354` through `design.md:390`,
  `spec.md:209` through `spec.md:242`.
- Consumer projections are discriminated and do not flatten clean/findings/failure
  fields into optional-property soup: `design.md:396` through `design.md:444`,
  `spec.md:244` through `spec.md:274`.

These repairs satisfy the TypeScript state-space bar: illegal states that matter
to D6 acceptance are represented as separate discriminants or made
unrepresentable, not encoded as nullable/optional fields, open strings, or
message text.

## P1/P2 Findings

None for this TypeScript/validation rereview lane.

## P3 Tightenings

- `design.md:432` through `design.md:438` groups
  `projection-missed`, `unexpected-diagnostic-identity`, and
  `cache-observation-missing` into one reduced consumer-projection shape with a
  generic `limitation`. This is acceptable for design/specification because
  `DiagnosticRunOutcome` retains the richer fields, but implementation should
  confirm downstream consumers do not need the expected identity, observed
  unexpected identity, or cache observation from the reduced consumer projection.
- `design.md:437` uses singular `limitation` for the grouped reduced failure
  projection while the other consumer projection variants use `limitations`.
  This is not a blocker, but aligning the shape or documenting the reduced
  variant's intentionally singular limitation would reduce consumer friction.

## Non-Acceptance Boundaries

This rereview accepts D6 for design/specification only in this lane. It does not
accept source implementation, current runtime behavior, command JSON behavior, or
public exported TypeScript surfaces.

Later implementation still must prove the design through the packet's stated
gates, including D0 row citations, D1 output-family decisions, live D2
`ruleGritFacts`, focused adapter/probe/Grit fixture tests, command behavior tests,
and cleanup-state checks.

## Validation After Writing

- `git diff --check`: passed.
