# Design: Record Authority Repair

## Frame

This packet repairs authority records before implementation. Its domain is
record truth, not runtime design.

## Current Delta

- `effect-first-repair-backlog.md` says D14A source is submitted but adjacent
  workstream records are missing.
- D14 and D15 records can be read as broader implementation authorization than
  the user notes allow.
- Historical worktree paths are still useful evidence, but not current
  operational truth.

## Target State

Records SHALL distinguish:

- current stack-tip source status;
- historical provenance;
- command evidence;
- cache/freshness stance;
- public-contract non-claims;
- stop conditions for downstream source work.

## Repair Rules

- Do not rewrite old task history to hide the sequence.
- Add adjacent workstream records where the source layer is current but the
  closure evidence bundle is missing.
- Keep D15 dormant unless a later packet cites concrete command-observation
  rows that require it.

## Public Contract Risk

None directly. This packet protects public-contract work by preventing stale
records from authorizing source edits.
