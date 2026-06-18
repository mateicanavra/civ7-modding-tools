# Tasks

## 1. Pre-Implementation Grounding

- [ ] 1.1 Read `D15-execution-provenance-substrate-trigger.md`, the remediation frame, D0 compatibility records,
  and this OpenSpec packet.
- [ ] 1.2 Confirm the branch/worktree starts from the approved implementation
  stack and is clean before source edits.
- [ ] 1.3 Record the concrete write set and protected paths in the phase record.
- [ ] 1.4 Re-run or cite the required dependency gates: D6, D7, D9, or D11 consuming packet identifies impossible local states.

## 2. Implementation

- [ ] 2.1 Define trigger conditions for a provenance substrate decision.
- [ ] 2.2 Require packet-local minimization before any standalone substrate migration.
- [ ] 2.3 Document why D15 is a trigger, not default implementation.

## 3. Validation

- [ ] 3.1 Run `bun run openspec -- validate deep-habitat-d15-execution-provenance-trigger --strict`.
- [ ] 3.2 Run `bun run openspec:validate`.
- [ ] 3.3 Run `git diff --check`.

## 4. Review And Realignment

- [ ] 4.1 Run domain-language, OpenSpec, TypeScript, validation, and
  cross-domino review lanes.
- [ ] 4.2 Repair accepted P1/P2 findings before packet closure.
- [ ] 4.3 Update downstream docs, examples, specs, tests, and packet index rows
  affected by implementation facts.
- [ ] 4.4 Leave the worktree clean or write a zero-context next packet.
