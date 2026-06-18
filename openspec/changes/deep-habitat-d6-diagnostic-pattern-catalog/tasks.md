# Tasks

## 1. Pre-Implementation Grounding

- [ ] 1.1 Read `D6-diagnostic-pattern-catalog.md`, the remediation frame, D0 compatibility records,
  and this OpenSpec packet.
- [ ] 1.2 Confirm the branch/worktree starts from the approved implementation
  stack and is clean before source edits.
- [ ] 1.3 Record the concrete write set and protected paths in the phase record.
- [ ] 1.4 Re-run or cite the required dependency gates: D0, D1, D2.

## 2. Implementation

- [ ] 2.1 Define diagnostic acquisition/projection contracts.
- [ ] 2.2 Separate pattern catalog entries from Pattern Authority admission.
- [ ] 2.3 Specify native/Grit diagnostic normalization and failure states.

## 3. Validation

- [ ] 3.1 Run `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/lib/diagnostics.test.ts`.
- [ ] 3.2 Run `bun run habitat check --json`.
- [ ] 3.3 Run `bun run openspec -- validate deep-habitat-d6-diagnostic-pattern-catalog --strict`.
- [ ] 3.4 Run `bun run openspec:validate`.
- [ ] 3.5 Run `git diff --check`.

## 4. Review And Realignment

- [ ] 4.1 Run domain-language, OpenSpec, TypeScript, validation, and
  cross-domino review lanes.
- [ ] 4.2 Repair accepted P1/P2 findings before packet closure.
- [ ] 4.3 Update downstream docs, examples, specs, tests, and packet index rows
  affected by implementation facts.
- [ ] 4.4 Leave the worktree clean or write a zero-context next packet.
