## Why

`grit-sibling-stage-step-imports` is an enforced Grit check for stage
isolation: stage code must not import another stage's private `steps/`
implementation. Stages compose through recipe order, contracts, and domain
surfaces rather than sibling step internals.

This checkpoint opens the row packet and limits the row to the independent
checkpoint class available in this stack: current-predicate native fixture
proof, parser inventory over the standard recipe stage root, and record truth
only.

## Target Authority Refs

- `mods/mod-swooper-maps/AGENTS.md`
- `tools/habitat-harness/src/rules/rules.json`
- `docs/projects/habitat-harness/taxonomy.md`
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/discrepancy-log.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `.grit/patterns/habitat/checks/sibling_stage_step_imports.md`

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-sibling-stage-step-imports`.
- Expand the native fixture for current-predicate behavior:
  - sibling stage `steps/` imports from stage root and nested stage files;
  - parser-edge relative depth and index/source-extension forms;
  - controls for same-stage step imports, stage contracts, domain surfaces,
    package paths, maps, tests, `.tsx`, source lookalikes, and non-standard
    recipe roots.
- Record a parser inventory over current Swooper standard recipe stage roots
  with exact scan roots, exclusions, counts, row id, and proof-class labels in
  durable records.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current checkpoint.

## What Does Not Change

- No recipe or stage source is changed.
- No pattern predicate repair is claimed.
- No Habitat wrapper/current-tree proof is claimed.
- No raw Grit acquisition, baseline, injected cleanup, Effect adapter, apply
  safety, retired parity, neighboring visualization/import rows, or product
  proof is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-sibling-stage-step-imports`.

This workstream does not own stage source remediation, baseline mutation,
Habitat wrapper/adapter implementation, or cross-file import migration.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- A landed/restacked command-trust layer before Habitat wrapper selector proof.
- An accepted typed adapter/probe cleanup surface before injected proof.
- The scaffold/baseline contract surface before explicit baseline proof.
- Supervisor/source-owner disposition if parser inventory finds live
  current-predicate sibling-stage step imports.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live current-predicate sibling-stage step imports and
  no owner accepts remediation or baseline disposition.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim wrapper, raw acquisition, baseline, injected, Effect
  adapter, apply, neighboring row, or product proof from native fixture/parser
  inventory evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter sibling_stage_step_imports --json`
- `bun run openspec -- validate habitat-grit-proof-sibling-stage-step-imports --strict`
- `bun run openspec:validate`
- `git diff --check`
