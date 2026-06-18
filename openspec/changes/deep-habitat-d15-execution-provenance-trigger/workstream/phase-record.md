# Phase Record: D15 Execution Provenance Trigger

## State

- Status: accepted for design/specification only after final D15 rereview;
  implementation not started and not authorized.
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

D15 is accepted for design/specification only. The packet records a dormant
trigger protocol and does not authorize source implementation. First-wave
review found P2 blockers; active packet/control records repaired them, and
final domain/ontology, TypeScript/validation, code/vendor topology,
OpenSpec/information/testing, and cross-domino/product rereviews found no
unresolved P1/P2 blockers against the repaired disk state.

## Design-Time Validation Gates

- `bun run openspec -- validate deep-habitat-d15-execution-provenance-trigger --strict`
- `bun run openspec:validate`
- `git diff --check`
- D15 wording/control audit over `$D15_CHANGE/**`, `$D15_SOURCE_PACKET`,
  `$REMEDIATION_DIR/packet-index.md`, `$REMEDIATION_DIR/context.md`, and
  `$AGENT_SCRATCH/domino-D15-*.md`.

## Later Implementation Gates

- Command-family tests named by a later accepted trigger packet.
- Public command/JSON/export/script/hook compatibility rows from D0 and D1 for
  every touched surface.
- Command observation fixtures for missing binary, nonzero command, bounded
  output, cache/freshness recording, git-state recording, and rollback state,
  only when a later accepted packet changes D15 from `dormant` to
  `trigger-accepted`.

## Non-Claims

- This remediation packet does not implement Habitat source changes.
- This packet does not validate runtime behavior.
- This packet does not approve Graphite submission for later implementation.
- Legacy code names remain compatibility facts unless design.md accepts them as
  target language.
