# D6 Final Rereview After Repair: TypeScript State-Space And Validation

## Scope

Fresh focused rereview of the latest repaired D6 disk state for TypeScript
state-space and validation blockers only. Initial gate confirmed with
`git status --short --branch` before reading or writing:

```text
## codex/d6-diagnostic-pattern-packet-repair
```

This review does not implement source code, does not edit D6 packet/control
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
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/closure-checklist.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D6-final-rereview-typescript-validation.md`

## Verdict

Accepted for design/specification only.

The prior P2 TypeScript/validation blockers are repaired in the latest disk
state, and no unresolved P1/P2 findings remain for this lane. D6 still remains
source-implementation blocked behind D0 public compatibility rows, D1 output
family decisions where touched, and live D2 `ruleGritFacts`; this rereview is
not implementation acceptance.

## Prior P2 Blocker Disposition

### Parsed acquisition cannot carry non-completed observations

Repaired. `design.md` now defines `CompletedDiagnosticCommandObservation` as the
completed-only command state and restricts `GritDiagnosticAcquisition.kind ==
"parsed"` to that command type:

- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:210`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:218`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:227`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:265`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:111`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:116`

`not-run`, `interrupted`, and `tool-unavailable` remain representable only as
bounded command observations for refusal/failure paths, not parsed report states.

### Consumer projection no longer flattens closed outcomes into optional fields

Repaired. `DiagnosticConsumerProjection` is now a discriminated projection with
separate `clean`, `findings`, `scan-root-refused`, `adapter-failed`, and other
failure/limitation variants. The old `outcomeKind` plus optional
`adapterFailureKind` shape is absent from the repaired packet:

- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:370`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:379`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:387`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:395`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:403`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:412`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md:50`

Failure fields now exist only on failure variants, clean projections carry
`readonly []`, and adapter failure cannot be combined with a structural pass.

### Probe success cannot carry dirty cleanup

Repaired. `probe-diagnostic-observed` now carries only `cleanup: "restored"`;
dirty or unrestored cleanup is modeled by `probe-cleanup-failed`, with optional
diagnostic context preserved as failure context:

- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:328`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:337`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:345`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:201`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:209`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:224`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md:72`

This restores the validation oracle: expected diagnostic observed plus dirty
cleanup is a failed probe validation, not a successful probe outcome.

### Critical closed sets and command families are no longer open placeholders

Repaired. The repaired `design.md` now defines the previously missing or open
sets for diagnostic identity, scan/projection/acquisition contracts, non-claims,
command families, parsed report states, and probe refusal reasons:

- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:127`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:140`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:144`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:148`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:151`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:192`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:199`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:271`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:347`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:82`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:88`

`NativeGritCheckRequest` now uses closed `commandFamily` values rather than a
bare string command id as core command-family authority.

## Validation Assessment

The later implementation validation matrix is adequate for design/specification
acceptance in this lane. It names concrete bad cases for malformed/wrapper JSON,
adapter failure not becoming pass, missing D2 `ruleGritFacts`, fallback refusal,
scan-root refusal families, cache/freshness failure, injected probe residue, D9
apply-tag exclusion, and command JSON compatibility:

- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md:57`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md:67`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md:54`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md:63`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:261`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:281`

Those gates remain later implementation proof obligations. They are not evidence
that source behavior is already implemented.

## P3 Tightenings

- `findings` variants use ordinary readonly arrays rather than a non-empty tuple
  type in `ParsedGritDiagnosticReport`, `DiagnosticRunOutcome`, and
  `DiagnosticConsumerProjection` (`design.md:273`, `design.md:314`,
  `design.md:384`). A later implementation can tighten this with a
  `readonly [Finding, ...Finding[]]` alias if the repo accepts that idiom.
- The grouped consumer projection variant for `projection-missed`,
  `unexpected-diagnostic-identity`, and `cache-observation-missing` carries a
  limitation but not the richer run-outcome fields (`design.md:403`). This is
  acceptable as a bounded consumer projection, but implementation should confirm
  D7/D8/D11 do not need expected/unexpected identity detail from this reduced
  projection rather than from `DiagnosticRunOutcome`.

## Non-Acceptance Boundaries

This is not implementation acceptance. D6 source implementation remains blocked
until the packet's own prerequisite rows are satisfied:

- concrete D0 compatibility rows for touched public/durable surfaces;
- D1 output-family decisions where command outcomes, diagnostics, limitations,
  adapter artifacts, or retained proof-shaped compatibility fields are touched;
- live D2 `ruleGritFacts` projections for Grit identity, scan metadata,
  exclusions, hook eligibility where relevant, and malformed metadata output
  families.
