# Phase Loop

Use this reference to run one phase from selection to closure.

## Phase Entrance

Before selecting work:

```bash
git status --short --branch
gt status
gt ls --show-untracked --all
```

Then identify:

- active branch/stack/worktree and dirty-file ownership;
- active project/spec/workstream artifacts;
- controlling authority docs and skills;
- current code/tests/generated outputs the phase touches;
- prerequisites and downstream work depending on the phase;
- phase artifact path.

## Phase Selection

Select one bounded phase that can be reviewed and verified. A good phase has:

- one objective;
- named owners and forbidden owners;
- a concrete write set;
- known consumer impact;
- required tests/proofs;
- explicit non-goals;
- downstream assumptions to revisit.

## Spec Or Change Definition

Before code, write or update phase artifacts so they answer:

- why this phase exists;
- which authority refs control it;
- what changes and what does not;
- which owners receive each concern;
- which shortcuts are rejected;
- what tasks prove implementation;
- what verification and closure require.

## Pre-Code Review

Use review lanes from `team-and-review-lanes.md`. Accepted P1/P2 findings block dependent code until repaired, rejected with source evidence, invalidated with later evidence, or resolved by user/authority decision.

## Implementation

- Keep edits inside the phase write set unless the phase record is updated.
- Update task/phase state as facts change.
- Do not hand-edit generated outputs.
- Do not preserve stale behavior through fallbacks unless explicitly authorized.
- Run focused checks as soon as the slice is testable.

## Verification

Record:

- commands run;
- outputs/results;
- what each result proves;
- skipped gates and rationale;
- remaining risk.

## Realignment

Before closure, inspect and patch affected downstream:

- active project specs and issue docs;
- canonical docs when durable authority changed;
- tests/guards/scripts;
- generated-output assumptions;
- phase records and Next Packets;
- deferrals/triage entries.

## Pause, Close, And Archive

A paused phase writes `next-packet.md`. It is not closed.

Close only when:

- phase tasks are complete;
- material findings have disposition;
- accepted blockers are repaired;
- verification supports the closure claim;
- downstream realignment is recorded;
- repo/Graphite state is clean or explicitly handed off;
- no stale running agents remain.

