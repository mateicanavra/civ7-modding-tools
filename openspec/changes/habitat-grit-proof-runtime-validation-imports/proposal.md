## Why

`grit-runtime-validation-imports` is an enforced Grit check for the runtime
purity boundary: recipe steps and domain strategies should not import TypeBox
runtime validation or compiler normalization helpers. Runtime execution should
consume compile-time-normalized contracts instead of mutating or normalizing
schemas at execution time.

This closure checkpoint records the active-check proof now available for this
row: current-predicate native fixture proof, refreshed parser inventory over the
current wrapper roots, Habitat wrapper selector/current-tree proof, explicit
empty baseline ownership, row-specific injected violation/path-control proof,
and downstream record truth.

## Target Authority Refs

- `tools/habitat-harness/src/rules/rules.json`
- `docs/projects/habitat-harness/taxonomy.md`
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `scripts/lint/lint-domain-refactor-guardrails.sh`
- `tools/habitat-harness/src/lib/grit.ts`
- `.grit/patterns/habitat/checks/runtime_validation_imports.md`

## What Changes

- Preserve the per-pattern OpenSpec packet for
  `habitat-grit-proof-runtime-validation-imports` and align it with current
  active-check closure evidence.
- Preserve the native fixture for current-predicate behavior:
  - all five forbidden import sources report in runtime recipe step paths;
  - domain strategy, type-only import, side-effect import, other-mod raw
    predicate, and recipe step `contract.ts` classes are recorded as
    current-predicate facts;
  - config, test, domain op non-strategy, map, package, `.tsx`, source
    lookalike, re-export, and dynamic import cases remain controls.
- Record a refreshed parser inventory over `mods/mod-swooper-maps/src/recipes`
  and `mods/mod-swooper-maps/src/domain` with exact scan roots, exclusions,
  counts, row id, and proof-class labels in durable records.
- Record current per-rule Habitat wrapper proof, aggregate `grit-check` proof,
  explicit empty baseline proof, and row-specific injected violation/path-control
  proof.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's active-check closure checkpoint.

## What Does Not Change

- No runtime source imports are changed.
- No pattern predicate repair is claimed.
- No raw Grit acquisition, Effect adapter, apply safety, retired parity,
  neighboring runtime-purity row, or product proof is claimed.

## Owner Boundary

This workstream owns fixture, wrapper, baseline, injected-probe, parser
inventory, and proof-record truth for `grit-runtime-validation-imports`.

This workstream does not own runtime refactors, compiler/validation helper
implementation, raw Grit adapter acquisition, apply/codemod behavior, or
Habitat wrapper/adapter implementation.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- Raw direct Grit acquisition, retired parity, neighboring runtime-purity row
  closure, apply safety, Effect adapter proof, and product/runtime proof remain
  outside this row unless separately proven.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live runtime validation imports and no owner accepts
  remediation or baseline disposition.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim raw acquisition, Effect adapter, apply, parity,
  neighboring runtime-purity, or product proof from native fixture/parser,
  wrapper, baseline, or injected evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter runtime_validation_imports --json`
- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --json`
- `bun run habitat:check -- --json --rule grit-runtime-validation-imports`
- `bun run habitat:check -- --json --tool grit-check`
- `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- `bun run openspec -- validate habitat-grit-proof-runtime-validation-imports --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
