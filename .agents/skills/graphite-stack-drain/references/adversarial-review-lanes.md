# Adversarial Review Lanes

Use review lanes before turning a messy stack situation into mutation. The goal
is not to create bureaucracy; it is to prevent the familiar failure modes:
partial accounting, stale source deletion, wrong restack target, hidden dirty
worktree, or visualizing noisy labels as if they were decisions.

## Lane 1: Accuracy

Question:

> What concrete state claim could be false, stale, or inferred from the wrong
> layer?

Check:

- Graphite cache parentage vs `gt log short`;
- local refs vs origin refs;
- PR state vs patch overlap;
- current worktree state vs prior snapshot;
- whether leaves are single branches or tops of mini-stacks.

Output:

- corrected facts;
- ambiguous facts that need another command;
- any claim that must be downgraded from "done" to "diagnostic".

## Lane 2: Operational Usefulness

Question:

> Does this classification tell us what to do next?

Check:

- ready-to-land support stacks;
- accounted source stacks ready to retire after sink durability;
- live stacks that should not be globally restacked;
- over-atomized stacks that should be folded before submit;
- branches that are just pinned by worktrees.

Output:

- one recommended next domino;
- stop conditions;
- commands that should not be run globally.

## Lane 3: Clarity

Question:

> Would another operator understand this map without knowing the conversation?

Check:

- semantic stack names instead of opaque branch-only labels;
- timeline and base/parent context;
- source vs sink labels;
- accounting moves separate from PR diagnostics;
- defaults hidden unless diagnostic view requires them.

Output:

- renamed stack/segment labels;
- labels to remove because they restate defaults;
- labels to split because they conflate state and decision.

## Lane 4: Quality

Question:

> Does this workflow preserve the intended work while reducing topology?

Check:

- whether adopted behavior is actually present in the sink;
- whether excluded source changes were intentionally dropped;
- whether folding crosses review-worthy boundaries;
- whether restack conflicts indicate a deeper semantic integration issue;
- whether validation/proof claims are scoped to what actually ran.

Output:

- accepted risk;
- required validation;
- blocker list;
- whether to continue, pause, or reframe.

## Ready-To-Send Auditor Prompt

Use this with a peer agent when available:

```text
You are part of a team helping manage a Graphite stack/worktree drain. Do not
edit files. Adversarially audit one lane: accuracy, operational usefulness,
clarity, or quality. Inspect deterministic topology captures, Graphite metadata,
Git refs, worktrees, branch history, accounting overlays, and relevant docs.
Return concise findings with exact file paths/branch names, state which claims
are concrete facts vs accounting decisions, and recommend the next safe action.
```
