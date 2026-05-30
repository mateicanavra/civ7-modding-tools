# Watcher Variants

## Quiet Pass

Use when all registered worktrees are clean or expected, validations pass, and
focused scans show only expected historical/control text. Return a concise
`DONT_NOTIFY` decision with the evidence boundary.

## Stale Baseline

Use when heartbeat text names an old head or tree but disk is clean, synced,
and coherent. Treat disk as authority. Update the pass summary and continue
watching without creating a correction.

## Dirty Worktree Or Fresh Commit

Use when an implementer appears active:

1. Identify the changed files and latest commits.
2. Classify the concern lane.
3. Run only the scans needed for that lane.
4. Debounce if the diff appears to be integrating the watched correction.
5. Escalate only if the material violation remains in current disk state.

Do not revert or overwrite implementer files.

## Live Watcher Notes

Use when `NOTE-TO-DRA*.md`, `NEW.md`, `UPDATED.md`, or watcher TODOs appear.
Read them before making closure claims. They remain active until integrated,
resolved, and removed by the owning workstream or until a later authority
decision supersedes them.

## Archive Or Closure Branch

Use when the watched branch is an archive, closeout, or completed baseline:

- validate that archive specs and ledgers match closure claims;
- distinguish expected root/archive divergence from new closure claims;
- do not delete archive worktrees unless the branch is merged/superseded or the
  user/owning DRA clearly retires it;
- treat stale generated placeholder text as a violation only when it appears in
  the active closure branch or new work claims closure over it.

## Branch Stack Watcher

Use when the watcher is also guarding stack health:

- inspect `gt log --stack`, current branch, upstream sync, and worktree list;
- restack only when the user asked for stack maintenance or the watcher role
  includes it;
- resolve conflicts as stack maintenance, not as implementation repair;
- leave branches clean and clearly report any branch whose lifecycle is
  ambiguous.

## Handoff Or Retirement

Use when the user stops the watcher or moves to the next workstream:

- summarize the final clean/dirty state and current stack;
- name active notes/corrections or confirm none remain;
- record the reusable watcher prompt/context if requested;
- do not delete the automation unless the user explicitly asks;
- do not delete worktrees unless their owner/lifecycle is verified.
