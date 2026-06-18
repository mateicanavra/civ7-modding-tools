# Tasks

## 1. Pre-Implementation Grounding

- [ ] 1.1 Read `D7-structural-enforcement-pipeline.md`, the remediation frame, D0 compatibility records,
  and this OpenSpec packet.
- [ ] 1.2 Confirm the branch/worktree starts from the approved implementation
  stack and is clean before source edits.
- [ ] 1.3 Record the concrete write set and protected paths in the phase record.
- [ ] 1.4 Re-run or cite the required dependency gates: D0, D1, D2, D3, D5, D6, D10.

## 2. Implementation

- [ ] 2.1 Define check pipeline ownership and inputs from D2/D3/D5/D6/D10.
- [ ] 2.2 Specify result aggregation and failure/refusal states.
- [ ] 2.3 Separate enforcement result from orientation and receipts.

## 3. Validation

- [ ] 3.1 Run `bun run --cwd tools/habitat-harness test -- test/commands/habitat-commands.test.ts`.
- [ ] 3.2 Run `bun run habitat check --json`.
- [ ] 3.3 Run `bun run openspec -- validate deep-habitat-d7-structural-enforcement-pipeline --strict`.
- [ ] 3.4 Run `bun run openspec:validate`.
- [ ] 3.5 Run `git diff --check`.

## 4. Review And Realignment

- [ ] 4.1 Run domain-language, OpenSpec, TypeScript, validation, and
  cross-domino review lanes.
- [ ] 4.2 Repair accepted P1/P2 findings before packet closure.
- [ ] 4.3 Update downstream docs, examples, specs, tests, and packet index rows
  affected by implementation facts.
- [ ] 4.4 Leave the worktree clean or write a zero-context next packet.
