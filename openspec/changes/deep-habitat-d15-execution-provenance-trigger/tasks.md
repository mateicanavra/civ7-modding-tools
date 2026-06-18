# Tasks

## 1. Pre-Implementation Grounding

- [ ] 1.1 Read `$D15_SOURCE_PACKET`, `$REMEDIATION_DIR/context.md`,
  `$REMEDIATION_DIR/packet-index.md`, accepted D6/D7/D9/D11/G-HOST downstream
  ledgers, D0 compatibility records, and this OpenSpec packet.
- [ ] 1.2 Confirm the branch/worktree starts from the approved implementation
  stack and is clean before source edits.
- [ ] 1.3 Confirm whether any accepted consuming packet records a concrete
  unrepresentable command-observation state.
- [ ] 1.4 Keep D15 dormant unless a consuming packet satisfies the trigger request
  contract in `design.md`.

## 2. Trigger Contract

- [ ] 2.1 Define the allowed `dormant`, `trigger-requested`,
  `trigger-accepted`, and `trigger-rejected` states.
- [ ] 2.2 Require a packet-local DTO sufficiency artifact before any standalone
  substrate work. The artifact must include the attempted discriminated union,
  typestate, or projection shape; the remaining contradiction; a negative fixture
  or typed example; the rejected safe TypeScript alternatives; the required
  field ownership map; and the proposed shared discriminants.
- [ ] 2.3 Record D6, D7, D9, D11, and G-HOST as dormant unless their accepted
  packet records the exact trigger inputs.
- [ ] 2.4 Preserve concrete D0 row citations and D1 output-family/non-claim
  handling for any future public command-observation fields.

## 3. Validation

- [ ] 3.1 Run `bun run openspec -- validate deep-habitat-d15-execution-provenance-trigger --strict`.
- [ ] 3.2 Run `bun run openspec:validate`.
- [ ] 3.3 Run `git diff --check`.
- [ ] 3.4 Run a D15 wording/control audit over `$D15_CHANGE/**`,
  `$D15_SOURCE_PACKET`, `$REMEDIATION_DIR/packet-index.md`,
  `$REMEDIATION_DIR/context.md`, and `$AGENT_SCRATCH/domino-D15-*.md`.

## 4. Review And Realignment

- [ ] 4.1 Run domain-language, OpenSpec, TypeScript, validation, and
  cross-domino review lanes.
- [ ] 4.2 Repair accepted P1/P2 findings before packet closure.
- [ ] 4.3 Update downstream records for D6, D7, D9, D11, G-HOST, packet index, and
  any future trigger owner.
- [ ] 4.4 Mark D15 accepted for design/specification only after final rereviews and
  validation pass on the same disk state.
- [ ] 4.5 Leave source implementation blocked unless a later accepted packet changes
  D15 from dormant to trigger-accepted.
