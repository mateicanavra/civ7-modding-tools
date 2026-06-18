# D15 Final Code/Vendor Topology Review

## Verdict

Accepted for design/specification only.

No unresolved P1/P2 code/vendor topology blockers remain on the repaired disk
state. D15 remains a dormant Command Observation Trigger packet. It does not
authorize Habitat source implementation, Effect/process migration, shared
command-observation substrate work, public output changes, package export
changes, Nx/plugin target changes, hook changes, or vendor command semantic
changes.

## Review Scope

Reviewed current D15 artifacts through `$ACTIVE_REMEDIATION_WORKTREE`,
including `$REMEDIATION_DIR/context.md`, `$REMEDIATION_DIR/packet-index.md`,
`$D15_SOURCE_PACKET`, `$D15_CHANGE/**`, first-wave
`$AGENT_SCRATCH/domino-D15-*.md`, D6/D7/D9/D11/G-HOST downstream edges, and
current Habitat command/code topology.

## Acceptance Rationale

The repaired D15 packet now has the required dormant trigger topology:

- the packet index defines D15 as dependent on D6, D7, D9, D11, or G-HOST only
  when one records a concrete local command-observation representation failure;
- design defines `dormant`, `trigger-requested`, `trigger-accepted`, and
  `trigger-rejected`, and missing trigger fields keep D15 dormant;
- design requires field-level ownership, public/durable surface impact,
  concrete D0 rows, D1 output-family/non-claim handling, write/protected set,
  validation gates, and rollback plan before implementation;
- the spec rejects prose-only local DTO insufficiency and requires a separate
  accepted OpenSpec change before any trigger implementation;
- the downstream ledger keeps D6, D7, D9, D11, and G-HOST as dormant trigger
  consumers and preserves D0/D1 as source blockers.

Current code topology does not itself justify opening D15. Habitat already has
local command-observation records in relevant owner surfaces: process requests,
Grit check diagnostics, Grit apply transactions, hook feedback, verify
handoff, and private package exports treated as public repo contracts when
touched. Future shared substrate work must show state-space reduction beyond
those local DTO/projection islands.

## Findings

P1: none.

P2: none.

P3: some downstream rows still use historical provenance/substrate labels in
D7/D9/G-HOST wording. D15's active design constrains target language to command
observation, so this is not a blocker.

## Source Blockers

Source implementation remains blocked unless a later accepted packet changes
D15 from `dormant` to `trigger-accepted` with concrete D0 rows, D1
output-family/non-claim handling, a bounded write/protected set, and accepted
validation gates.
