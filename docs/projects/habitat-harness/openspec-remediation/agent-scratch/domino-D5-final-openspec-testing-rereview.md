# D5 Final OpenSpec/Testing Rereview

## Verdict

Accepted for design/specification only.

No unresolved P1 or P2 findings were found on current disk for the D5 Baseline
Authority OpenSpec packet/control records reviewed in this lane. This acceptance
does not authorize source implementation. Implementation remains blocked behind
concrete D0 rows for every touched public or durable surface and live D2 baseline
facts/projections wherever D5 consumes rule metadata.

## Scope And Grounding

Worktree:
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`

Branch: `codex/deep-habitat-openspec-remediation`.

Mandatory skills read in full:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/testing-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`

Directly relevant OpenSpec workstream references read:

- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/artifact-contracts.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/validation-checks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`

Current packet/control surfaces read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/downstream-realignment-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/closure-checklist.md`

Negative-control inputs read:

- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D5-review.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D5-openspec-testing-investigation.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D5-information-design-investigation.md`

Additional grounding read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md`
- `docs/projects/habitat-harness/openspec-remediation/context.md`

## Command Evidence

- `bun run openspec -- validate deep-habitat-d5-baseline-authority --strict`:
  passed; output: `Change 'deep-habitat-d5-baseline-authority' is valid`.
- `bun run openspec:validate`: passed; output: `Totals: 249 passed, 0 failed
  (249 items)`.
- `git diff --check`: passed with no output.

These gates prove OpenSpec structural validity and diff whitespace hygiene only.
They do not prove runtime behavior, implementation readiness, current-tree
baseline health, or completion of later D5 implementation gates.

## Acceptance Basis

The current spec covers the D5 state/refusal matrix with normative scenarios.
It defines the single rule-level authority outcome set at
`openspec/changes/deep-habitat-d5-baseline-authority/specs/habitat-harness/spec.md:5`,
then covers explicit empty/debt, missing, malformed, non-string, duplicate,
unsorted, and orphan baseline states at `spec.md:13`, `spec.md:20`,
`spec.md:27`, `spec.md:33`, `spec.md:39`, `spec.md:44`, `spec.md:49`, and
`spec.md:54`. It covers modeled/unmodeled external sources, unreadable and
malformed sources, projection mismatch, and parser-owned explicit-baseline
bypass at `spec.md:59` through `spec.md:101`. It covers shrink-only integrity,
comparison-base refusals, base registry failures, base baseline unreadability,
and existing-rule growth at `spec.md:103` through `spec.md:139`. It covers
rule-introduction manifest acceptance/refusal and existing-rule growth priority
at `spec.md:141` through `spec.md:167`. It closes the D7/D8 consumer boundary
and D0 public-surface stop condition at `spec.md:169` through `spec.md:195`.

Design-time gates are separated from later implementation gates. The proposal
lists only OpenSpec validation and `git diff --check` under design-time
structural gates at `proposal.md:113` through `proposal.md:119`, then lists
behavioral implementation gates separately at `proposal.md:121` through
`proposal.md:129`. The phase record mirrors that split at `phase-record.md:41`
through `phase-record.md:63`, and the design validation section does the same at
`design.md:216` through `design.md:239`.

The required targeted command is exact. `bun run habitat check --rule
baseline-integrity --json` appears as the D5 command outcome in the proposal at
`proposal.md:127`, the D5 public-surface row at `design.md:145`, the later
implementation validation gate at `design.md:234`, the phase record at
`phase-record.md:61`, the tasks at `tasks.md:61`, and the closure checklist at
`closure-checklist.md:26`. Broad `bun run habitat check --json` appears only as
a public surface to characterize or as an explicit non-substitute at
`design.md:237` and `phase-record.md:61`.

The packet/control records are internally consistent and execution-ready for a
later implementation packet. D5 ownership and non-ownership are explicit at
`design.md:28` through `design.md:56`; target ontology and rejected language are
specified at `design.md:58` through `design.md:90`; state/refusal rows are
specified at `design.md:92` through `design.md:116`; D0 public surfaces are
enumerated as blocked pending concrete D0 rows at `design.md:136` through
`design.md:154`; D7/D8 consumption rules are bounded at `design.md:156` through
`design.md:182`; and write/protected sets are named at `design.md:184` through
`design.md:214`.

The workstream records do not treat older negative reviews as acceptance
evidence. The review ledger states that prior findings are input and repair
evidence, not final acceptance evidence, at
`workstream/review-disposition-ledger.md:3` through
`workstream/review-disposition-ledger.md:8`. The phase record states that
earlier investigation files are negative-control input and repair guidance, not
final acceptance evidence, at `workstream/phase-record.md:24` through
`workstream/phase-record.md:30`. The downstream ledger keeps packet status
blocked until fresh final rereview records no unresolved P1/P2 findings at
`workstream/downstream-realignment-ledger.md:12`.

## Findings

P1: none.

P2: none.

P3: none.

## Non-Claims

- This rereview does not edit packet/source files.
- This rereview does not accept D0, D2, D7, D8, or D13.
- This rereview does not run later implementation tests or the later targeted
  `bun run habitat check --rule baseline-integrity --json` runtime gate.
- This rereview does not claim source implementation can start before concrete
  D0 rows and live D2 facts/projections are available and cited.

Skills used: domain-design, information-design, testing-design, solution-design,
civ7-open-spec-workstream.
