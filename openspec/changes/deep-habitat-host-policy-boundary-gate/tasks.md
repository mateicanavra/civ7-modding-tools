# Tasks

## 1. Pre-Implementation Grounding

- [ ] 1.1 Read `G-HOST-host-policy-boundary-gate.md`, the remediation frame, D0 compatibility records,
  and this OpenSpec packet.
- [ ] 1.2 Confirm the branch/worktree starts from the approved implementation
  stack and is clean before source edits.
- [ ] 1.3 Record the concrete write set and protected paths in the phase record.
- [ ] 1.4 Re-run or cite the required dependency gates: D0, D1. D2 is a parallel registry-metadata prerequisite for D10, not a G-HOST prerequisite.

## 2. Implementation

- [ ] 2.1 Define host policy declaration and refusal boundary.
- [ ] 2.2 Move Civ/MapGen-specific assumptions out of generic Habitat authority.
- [ ] 2.3 Gate D10/D13 generic closure on host-policy separation.

## 3. Validation

- [ ] 3.1 Run `bun run habitat classify mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json`.
- [ ] 3.2 Run `bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict`.
- [ ] 3.3 Run `bun run openspec:validate`.
- [ ] 3.4 Run `git diff --check`.

## 4. Review And Realignment

- [ ] 4.1 Run domain-language, OpenSpec, TypeScript, validation, and
  cross-domino review lanes.
- [ ] 4.2 Repair accepted P1/P2 findings before packet closure.
- [ ] 4.3 Update downstream docs, examples, specs, tests, and packet index rows
  affected by implementation facts.
- [ ] 4.4 Leave the worktree clean or write a zero-context next packet.
