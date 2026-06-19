# Phase Record: D15 Execution Provenance Trigger

## State

- Status: dormant trigger confirmed; no source implementation authorized.
- Worktree: `$ACTIVE_REMEDIATION_WORKTREE`.
- Branch: `$ACTIVE_REMEDIATION_BRANCH`.
- Source packet: `$D15_SOURCE_PACKET`.
- OpenSpec change: `$D15_CHANGE`.

## Objective

Design the D15 command-observation trigger packet so accepted consuming packets
can request shared substrate work only after naming an unrepresentable local DTO
state, rejected local alternative, public-surface impact, write boundary,
validation gates, and rollback plan.

## Current Gate

D15 is dormant. The completed consuming packets do not record a
`trigger-requested` or `trigger-accepted` command-observation contradiction with
the required local DTO sufficiency record, D0/D1 handling, write set, and
validation gates. Source implementation remains blocked.

## Design-Time Validation Gates

- `bun run openspec -- validate deep-habitat-d15-execution-provenance-trigger --strict`
  passed on this branch.
- `bun run openspec:validate` passed with 250 items.
- `git diff --check` passed.
- `git diff -- tools/habitat-harness/src tools/habitat-harness/test --exit-code`
  passed, confirming D15 made no Habitat source or test changes.
- D15 wording/control audit over `$D15_CHANGE/**`, `$D15_SOURCE_PACKET`,
  `$REMEDIATION_DIR/packet-index.md`, `$REMEDIATION_DIR/context.md`, and
  `$AGENT_SCRATCH/domino-D15-*.md` found no active D15 control markers and no
  D15-local stale implementation-process, vendor, or compatibility-scaffold
  wording classes.
- Temporary supervisor/reviewer agent confirmed that D6, D7, D9, D11, and
  G-HOST do not record a D15 `trigger-requested` or `trigger-accepted`
  condition.

## Later Implementation Gates

- Command-family tests named by a later accepted trigger packet.
- Public command/JSON/export/script/hook compatibility rows from D0 and D1 for
  every touched surface.
- Command observation fixtures for missing binary, nonzero command, bounded
  output, cache/freshness recording, git-state recording, and rollback state,
  only when a later accepted packet changes D15 from `dormant` to
  `trigger-accepted`.

## Packet Boundaries

- This packet does not implement Habitat source changes.
- This packet does not validate runtime behavior.
- This packet does not approve Graphite submission for later implementation.
- Inherited code names remain compatibility facts unless design.md accepts them
  as target language.
