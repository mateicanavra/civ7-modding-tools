## Why

`grit-sibling-stage-step-imports` is an enforced Grit check for stage
isolation: stage code must not import another stage's private `steps/`
implementation. Stages compose through recipe order, contracts, and domain
surfaces rather than sibling step internals.

This checkpoint closes the row as an active Habitat/Grit check. The row now
proves the repaired import-declaration predicate, current source inventory,
Habitat wrapper projection, explicit empty baseline ownership, and row-specific
injected violation/path-control behavior.

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
  - side-effect static imports from sibling stage `steps/` paths;
  - parser-edge relative depth and index/source-extension forms;
  - controls for same-stage step imports, stage contracts, domain surfaces,
    package paths, maps, tests, `.tsx`, source lookalikes, and non-standard
    recipe roots.
- Repair the predicate to use `import_statement(source=$source)` so static
  side-effect import declarations are covered with the same source/path guard.
- Record a parser inventory over current Swooper standard recipe stage roots
  with exact scan roots, exclusions, counts, row id, and proof-class labels in
  durable records.
- Record Habitat per-rule wrapper proof, aggregate `grit-check` proof,
  explicit empty baseline / `baseline-integrity`, and row-specific injected
  violation/path-control proof.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current checkpoint.

## What Does Not Change

- No recipe or stage source is changed.
- No raw Grit acquisition, Effect adapter, apply safety, retired parity,
  neighboring visualization/import rows, or product proof is claimed.
- No export-from or dynamic-import closure is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-sibling-stage-step-imports`.

This workstream does not own stage source remediation, baseline mutation,
Habitat wrapper/adapter implementation, or cross-file import migration.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- Supervisor/source-owner disposition if parser inventory finds live
  current-predicate sibling-stage step imports.

## Stop Conditions

- Native fixture behavior requires a broader predicate repair than the
  source-literal static-import subset proven here.
- Current inventory finds live current-predicate sibling-stage step imports and
  no owner accepts remediation or baseline disposition.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim raw acquisition, export-from or dynamic-import closure,
  Effect adapter, apply, neighboring row, or product proof from native
  fixture/parser inventory evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter sibling_stage_step_imports --json`
- `bun run habitat:check -- --json --rule grit-sibling-stage-step-imports`
- `bun run habitat:check -- --json --tool grit-check`
- `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- `bun run openspec -- validate habitat-grit-proof-sibling-stage-step-imports --strict`
- `bun run openspec:validate`
- `git diff --check`
