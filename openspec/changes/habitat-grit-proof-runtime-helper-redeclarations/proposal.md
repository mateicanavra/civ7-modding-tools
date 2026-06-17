## Why

`grit-runtime-helper-redeclarations` is an enforced Grit check for the runtime
purity boundary: recipe steps and domain strategies should import canonical
helpers from `@swooper/mapgen-core` instead of redeclaring local clamp, range,
or roll helpers.

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
- `.grit/patterns/habitat/checks/runtime_helper_redeclarations.md`

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-runtime-helper-redeclarations`.
- Expand the native fixture for current-predicate behavior:
  - exact helper function declarations for `clamp01`, `clampChance`,
    `normalizeRange`, and `rollPercent`;
  - exact helper variable redeclarations through `const`, `let`, and `var`;
  - parser-edge function-expression and arrow-function initializers;
  - domain strategy, step-local `contract.ts`, and other-mod raw predicate
    classes as current-predicate facts;
  - imported helper usage, lookalike names, property/method/class shapes,
    destructuring, config, test, map, package, `.tsx`, and non-strategy domain
    paths as controls.
- Record a parser inventory over `mods/mod-swooper-maps/src/recipes` and
  `mods/mod-swooper-maps/src/domain` with exact scan roots, exclusions, counts,
  row id, and proof-class labels in durable records.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current checkpoint.

## What Does Not Change

- No runtime source declarations are changed.
- No pattern predicate repair is claimed.
- No Habitat wrapper/current-tree proof is claimed.
- No raw Grit acquisition, baseline, injected cleanup, Effect adapter, apply
  safety, retired parity, neighboring runtime-purity row, or product proof is
  claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-runtime-helper-redeclarations`.

This workstream does not own runtime refactors, helper migration/codemod
behavior, baseline mutation, or Habitat wrapper/adapter implementation.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- A landed/restacked command-trust layer before Habitat wrapper selector proof.
- An accepted typed adapter/probe cleanup surface before injected proof.
- The scaffold/baseline contract surface before explicit baseline proof.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live runtime helper redeclarations and no owner
  accepts remediation, baseline disposition, or apply-row handling.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim wrapper, raw acquisition, baseline, injected, Effect
  adapter, apply, neighboring row, or product proof from native fixture/parser
  inventory evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter runtime_helper_redeclarations --json`
- `bun run openspec -- validate habitat-grit-proof-runtime-helper-redeclarations --strict`
- `bun run openspec:validate`
- `git diff --check`
