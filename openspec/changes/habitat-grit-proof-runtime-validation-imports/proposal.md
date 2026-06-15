## Why

`grit-runtime-validation-imports` is an enforced Grit check for the runtime
purity boundary: recipe steps and domain strategies should not import TypeBox
runtime validation or compiler normalization helpers. Runtime execution should
consume compile-time-normalized contracts instead of mutating or normalizing
schemas at execution time.

This checkpoint opens the row packet and proves the same independent checkpoint
class as the prior accepted rows: current-predicate native fixture proof, parser
inventory over the current wrapper roots, and record truth only.

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

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-runtime-validation-imports`.
- Expand the native fixture for current-predicate behavior:
  - all five forbidden import sources report in runtime recipe step paths;
  - domain strategy, type-only import, side-effect import, other-mod raw
    predicate, and recipe step `contract.ts` classes are recorded as
    current-predicate facts;
  - config, test, domain op non-strategy, map, package, `.tsx`, source
    lookalike, re-export, and dynamic import cases remain controls.
- Record a parser inventory over `mods/mod-swooper-maps/src/recipes` and
  `mods/mod-swooper-maps/src/domain` with exact scan roots, exclusions, counts,
  row id, and proof-class labels in durable records.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current checkpoint.

## What Does Not Change

- No runtime source imports are changed.
- No pattern predicate repair is claimed.
- No Habitat wrapper/current-tree proof is claimed.
- No raw Grit acquisition, baseline, injected cleanup, Effect adapter, apply
  safety, retired parity, or product proof is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-runtime-validation-imports`.

This workstream does not own runtime refactors, compiler/validation helper
implementation, baseline mutation, or Habitat wrapper/adapter implementation.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- A landed/restacked command-trust layer before Habitat wrapper selector proof.
- An accepted typed adapter/probe cleanup surface before injected proof.
- The scaffold/baseline contract surface before explicit baseline proof.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live runtime validation imports and no owner accepts
  remediation or baseline disposition.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim wrapper, raw acquisition, baseline, injected, Effect
  adapter, apply, or product proof from native fixture/parser inventory
  evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter runtime_validation_imports --json`
- `bun run openspec -- validate habitat-grit-proof-runtime-validation-imports --strict`
- `bun run openspec:validate`
- `git diff --check`
