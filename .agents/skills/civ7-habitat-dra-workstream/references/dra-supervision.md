# Habitat DRA Supervision

## Supervisor Role

The supervisor owns the product outcome and the control loop around implementation DRAs. The supervisor may launch implementation agents, inspect their work from disk, run independent validation, issue direct repair demands, and block closure when evidence does not satisfy the goal.

The supervisor does not accept claims because a DRA says a packet is done. Closure comes from fresh files, fresh commands, updated ledgers, resolved review findings, Graphite state, and clean worktree state.

## Launch Protocol

Every implementation DRA starts with a `/goal` prompt created through `framing-design` and, when available, the `create-goal` skill. The prompt must include:

- product outcome in the first paragraph;
- exact lane: repair chain or Grit pattern chain;
- first active workstream and sequencing rules;
- required reads, including this skill when available;
- proof classes that must be separated;
- stop rules;
- supervisor relationship and direct-message correction protocol;
- progress report contract;
- closure contract.

Use [implementation-dra-goal.md](../assets/implementation-dra-goal.md) as the copy-forward starting point.

## Review Protocol

For each DRA checkpoint or claimed closure:

1. Inspect the DRA branch/worktree, `git status`, Graphite state, diff, touched files, packet records, ledgers, and command output.
2. Compare the implementation to the launched goal, active OpenSpec packet, recovery claim ledger row, and relevant corpus.
3. Re-run the smallest command set that proves the claimed behavior, then expand where shared contracts or generated artifacts are touched.
4. Classify findings:
   - P1: product outcome, safety, ownership, or proof failure that blocks closure.
   - P2: correctness, coverage, record, or maintainability failure that blocks dependent closure.
   - P3: improvement that can be logged without blocking the active claim.
5. Send a direct repair demand for accepted P1/P2 issues. Use [supervisor-repair-demand.md](../assets/supervisor-repair-demand.md).
6. Record accepted, rejected, and re-scoped findings with evidence. Use [supervisor-review-note.md](../assets/supervisor-review-note.md).

## Direct Repair Demand Standard

A repair demand must be actionable and evidence-bound:

- name the violated goal clause or packet contract;
- cite the file, line, command, branch state, or ledger row that proves the issue;
- say what must change and what proof must be supplied;
- say what claim remains blocked until repair;
- state whether dependent work is paused.

Do not send broad dissatisfaction. Send a concrete correction.

## Watcher Use

Use `dra-structural-watcher` when you need an independent disk-first pass over an implementation DRA. The watcher should not design or implement. It should identify material drift, stale records, owner-boundary violations, hidden untracked state, and proof-class conflation.

Watcher output becomes supervisor input. The supervisor still owns classification and repair demand wording.

## Closure Gate

An implementation DRA is not closed until:

- active packet tasks and phase record match current state;
- review disposition ledger has no accepted unresolved P1/P2 findings for the closed claim;
- downstream realignment ledger records all touched or intentionally unchanged docs/commands;
- validation evidence is fresh and labeled by proof class;
- Graphite commit exists on the correct stack layer;
- worktree is clean;
- supervisor review accepts closure.
