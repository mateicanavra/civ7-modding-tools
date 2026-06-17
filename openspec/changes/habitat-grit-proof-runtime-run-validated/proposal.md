## Why

`grit-runtime-run-validated` is an enforced Grit check for the runtime purity
boundary: recipe steps and domain strategies should not call `runValidated`.
Runtime execution should use the non-validating runtime surface after
compile-time contract normalization has already happened.

This checkpoint opens the row packet and limits the row to the independent
checkpoint class available in this stack: current-predicate native fixture
proof, parser inventory over the current runtime roots, and record truth only.

## Target Authority Refs

- `tools/habitat-harness/src/rules/rules.json`
- `docs/projects/habitat-harness/taxonomy.md`
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `scripts/lint/lint-domain-refactor-guardrails.sh`
- `tools/habitat-harness/src/lib/grit.ts`
- `.grit/patterns/habitat/checks/runtime_run_validated.md`

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-runtime-run-validated`.
- Expand the native fixture for current-predicate behavior:
  - direct `runValidated(...)` calls in runtime recipe step paths;
  - member `.runValidated(...)` calls in runtime recipe step and domain
    strategy paths;
  - nested/callback, await, optional-chain, step-local `contract.ts`,
    step-local test-like filename, and other-mod raw predicate classes as
    current-predicate facts;
  - helper-name, import-only, non-call, dynamic property, stage-level config,
    repo test, map, package, `.tsx`, and domain op non-strategy classes as
    controls.
- Record a parser inventory over `mods/mod-swooper-maps/src/recipes` and
  `mods/mod-swooper-maps/src/domain` with exact scan roots, exclusions, counts,
  row id, and proof-class labels in durable records.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current checkpoint.

## What Does Not Change

- No runtime source calls are changed.
- No pattern predicate repair is claimed.
- No Habitat wrapper/current-tree proof is claimed.
- No raw Grit acquisition, baseline, injected cleanup, Effect adapter, apply
  safety, retired parity, neighboring runtime-purity row, or product proof is
  claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-runtime-run-validated`.

This workstream does not own runtime refactors, operation execution semantics,
baseline mutation, or Habitat wrapper/adapter implementation.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- A landed/restacked command-trust layer before Habitat wrapper selector proof.
- An accepted typed adapter/probe cleanup surface before injected proof.
- The scaffold/baseline contract surface before explicit baseline proof.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live runtime `runValidated` calls and no owner accepts
  remediation or baseline disposition.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim wrapper, raw acquisition, baseline, injected, Effect
  adapter, apply, neighboring row, or product proof from native fixture/parser
  inventory evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter runtime_run_validated --json`
- `bun run openspec -- validate habitat-grit-proof-runtime-run-validated --strict`
- `bun run openspec:validate`
- `git diff --check`
