## Why

Guardrails should encode achieved architecture. If they are enabled before the
cleanup they prove, they red-bar the repo and push implementers toward
shortcuts. This final change promotes implemented decisions into durable specs
and enables G1-G9 only when their corresponding slices have landed.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  Domino 5 and Guardrails To Add After Cleanup.
- `openspec/config.yaml`: OpenSpec validation is additive and specs remain
  downstream of accepted authority until promoted through completed workstreams.
- `openspec/specs/change-management/spec.md`: validation is additive evidence;
  archive after implementation may merge accepted deltas.
- `openspec/specs/mapgen-normalization-workstreams/spec.md`: guardrails encode
  achieved structure.

## What Changes

- Enable G1-G9 style guards only after their cleanup slices pass or scope a
  guard to already-passing behavior.
- Promote stable implemented decisions into evergreen docs, ADRs, and
  OpenSpec specs.
- Archive completed OpenSpec changes when implementation evidence exists.
- Run an explicit promotion ceremony before treating OpenSpec specs,
  evergreen docs, or ADRs as the long-lived authority replacing packet
  sections.
- Record proof boundaries for tests, docs, generated output, and in-game
  checks.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mapgen-normalization-workstreams`: adds the final promotion and guardrail
  closure slice for the full normalization train.

## Dependencies

- Requires: the corresponding cleanup change for each guard:
  - G9 after `normalize-config-surface`
  - G4 after `normalize-import-boundaries`
  - G3 after `normalize-core-studio-dx-boundaries`
  - G5-G7 after `normalize-ecology-topology` and docs realignment
  - G1-G2 after catalog/tag owner cleanup
  - G8 after `normalize-placement-contracts`
- Enables parallel work: future feature work can rely on mechanical relapse
  checks.

## Forbidden Non-Goals

- No guard that fails current intended source structure.
- No OpenSpec archive of unimplemented changes.
- No claim that archiving alone promotes authority.
- No claim that OpenSpec validation proves source behavior, generated output,
  or in-game behavior.
- No source refactor implementation in this slice except guard/doc promotion
  fallout.

## Impact

- Affected owners: guard scripts, CI/lint/doc lint, evergreen docs, ADRs,
  OpenSpec specs/archive, proof records.
- Expected write set:
  - guard/lint/test scripts
  - `openspec/specs/**`
  - `openspec/changes/archive/**`
  - canonical docs and ADR/deferral records
  - packet status or cross-reference updates that identify promoted authority
  - docs/tests for seeded guard failures where practical
- Protected paths: primary refactor implementation files except narrow changes
  needed to make guards or docs truthful.
- Stop conditions:
  - a guard's cleanup slice has not landed;
  - a promoted spec describes target architecture not yet implemented;
  - no file records what authority supersedes which packet section;
  - proof claims conflate validation, local tests, generated output, or
    in-game checks.
- Verification gates:
  - guard commands and seeded-failure tests where supported;
  - `bun run openspec:validate`;
  - `bun run openspec -- archive <completed-change>` only for completed
    implemented changes;
  - authority promotion record naming the evergreen doc, ADR, or OpenSpec spec
    that supersedes the packet section;
  - relevant doc lint/tests;
  - `git diff --check`.
