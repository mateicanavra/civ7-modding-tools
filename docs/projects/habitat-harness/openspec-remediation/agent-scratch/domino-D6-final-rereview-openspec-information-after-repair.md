# D6 Final Rereview After Repair: OpenSpec And Information Design

## Scope

Fresh focused rereview of the latest repaired D6 disk state for OpenSpec and
information-design blockers only. This review did not inspect source
implementation for acceptance, did not implement source code, did not edit D6
packet/control files, and did not commit.

Observed branch before review/write: `codex/d6-diagnostic-pattern-packet-repair`.

## Sources Read

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/artifact-contracts.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/closure-checklist.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D6-final-rereview-openspec-information.md`

## Verdict

Accepted for design/specification only in the OpenSpec/information-design lane.

The prior P2 blockers are repaired. I found no unresolved P1/P2 findings for
this lane against the latest repaired disk state. This is not implementation
acceptance: D6 source implementation remains blocked behind concrete D0 rows,
D1 output-family/compatibility decisions where touched, and live D2
`ruleGritFacts` projections.

## Prior P2 Closure

### Repaired: native catalog entries now align with downstream identity projections

The prior review found native catalog entries could not satisfy downstream
projection fields because consumer projections required `patternIdentity`
unconditionally. The repaired packet introduces `DiagnosticIdentity` as the
shared projection authority and propagates it through catalog entries, native
findings, run outcomes, injected probe outcomes, and consumer projections.

Repair evidence:

- `design.md:101` defines `DiagnosticCatalogEntry` variants.
- `design.md:106` binds Grit entries to `DiagnosticIdentity.kind ==
  "grit-pattern"`.
- `design.md:116` binds native entries to `DiagnosticIdentity.kind ==
  "native-rule"`.
- `design.md:128` defines the closed `DiagnosticIdentity` union.
- `design.md:136` defines closed native diagnostic identities.
- `design.md:161` states `DiagnosticIdentity` is the authority for matching
  native output to selected entries.
- `design.md:163` states native diagnostics never require `patternIdentity`.
- `design.md:300`, `design.md:328`, and `design.md:370` propagate
  `DiagnosticIdentity` through finding, probe, and consumer projections.
- `spec.md:5` requires entries to bind `ruleId` to one closed
  `DiagnosticIdentity`.
- `spec.md:18` through `spec.md:25` explicitly require native entries to use
  native identity and forbid downstream `patternIdentity` requirements for that
  branch.
- `spec.md:143` through `spec.md:171` require projection to match selected
  `DiagnosticIdentity`, not a Grit-only field.

### Repaired: `NativeGritCheckRequest` no longer widens command identity to string

The prior review found `commandId: "...literal..." | string` collapsed to plain
`string`, leaving D6 command families open. The repaired packet replaces that
with a closed `NativeGritCommandFamily` discriminant and moves arbitrary runtime
correlation to `commandInvocationId`.

Repair evidence:

- `design.md:192` through `design.md:197` define the closed
  `NativeGritCommandFamily` union.
- `design.md:199` through `design.md:208` define `NativeGritCheckRequest` with
  `commandFamily: NativeGritCommandFamily` and `commandInvocationId: string`.
- `spec.md:75` through `spec.md:89` require closed command family recording and
  explicitly forbid accepting a bare string command id as a core command family.
- `tasks.md:33` through `tasks.md:35` keep later implementation scoped to closed
  command families and bounded command observations.
- `review-disposition-ledger.md:45` records the repair evidence for open
  command/catalog identity placeholders.

## P1/P2 Findings

None for this OpenSpec/information-design rereview lane.

## P3 Tightenings

- `proposal.md:91` names `DiagnosticCapabilityProjection`, while the repaired
  design/spec mostly use `DiagnosticCatalogEntry`, `DiagnosticConsumerProjection`,
  and prose "diagnostic capability." Before final promotion, align that term or
  define whether it is a named D8-facing projection alias.
- `context.md:92` still maps `$D6_FINAL_REREVIEW_OPENSPEC_INFORMATION` to the
  prior negative rereview file. If this after-repair rereview becomes the
  accepted lane evidence, add a distinct context variable or update the closure
  trail in the owner-controlled packet/control pass.
- `review-disposition-ledger.md:46` and `closure-checklist.md:29` correctly keep
  final rereview as blocking until owner synthesis updates control state. After
  all final lanes close, update those control records from "pending rereview" to
  accepted design/specification only; do not mark implementation complete.

## Validation After Writing

- `bun run openspec -- validate deep-habitat-d6-diagnostic-pattern-catalog --strict`
  passed: `Change 'deep-habitat-d6-diagnostic-pattern-catalog' is valid`.
- `git diff --check` passed.
