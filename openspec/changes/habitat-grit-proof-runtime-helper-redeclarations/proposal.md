## Why

`grit-runtime-helper-redeclarations` is an enforced Grit check for the runtime
purity boundary: recipe steps and domain strategies should import canonical
helpers from `@swooper/mapgen-core` instead of redeclaring local clamp, range,
or roll helpers.

This checkpoint closes the active check row after the successor
`habitat-grit-apply-helper-redeclarations` source-owner remediation removed the
three live helper redeclarations. The row now records current-predicate native
fixture proof, zero-candidate parser inventory over the current runtime roots,
Habitat wrapper/current-tree proof, explicit empty baseline proof, row-specific
injected violation/path-control proof, and record truth.

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
- Record that the current source tree has zero current-predicate helper
  redeclaration candidates after the accepted AHR remediation.
- Record Habitat per-rule and aggregate `grit-check` wrapper proof, explicit
  empty baseline / `baseline-integrity` proof, and row-specific injected
  violation/path-control proof for the active rule.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's active-check closure checkpoint.

## What Does Not Change

- No runtime source declarations are changed in this RHR row; source
  remediation is owned by `habitat-grit-apply-helper-redeclarations`.
- No pattern predicate repair is claimed in this closure checkpoint.
- No raw Grit acquisition, Effect adapter, generic Habitat apply registration,
  transaction/rollback, injected apply behavior, retired parity, neighboring
  runtime-purity row, aggregate injected-corpus closure, or product/runtime
  proof is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-runtime-helper-redeclarations`.

This workstream does not own runtime refactors, helper migration/codemod
behavior, generic apply safety, or Habitat wrapper/adapter implementation.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- The accepted AHR source-owner remediation remains the source-mutation
  authority for the former live candidates.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live runtime helper redeclarations after AHR
  remediation.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim raw acquisition, Effect adapter, generic apply behavior,
  neighboring row, aggregate injected-corpus closure, or product proof from
  native fixture/parser inventory evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter runtime_helper_redeclarations --json`
- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --json`
- `bun run habitat:check -- --json --rule grit-runtime-helper-redeclarations`
- `bun run habitat:check -- --json --tool grit-check`
- `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- `bun run openspec -- validate habitat-grit-proof-runtime-helper-redeclarations --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
