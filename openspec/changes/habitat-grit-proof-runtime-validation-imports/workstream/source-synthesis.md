# Source Synthesis - Runtime Validation Imports Proof

## Authority Order

Policy authority:

1. `tools/habitat-harness/src/rules/rules.json`
2. `docs/projects/habitat-harness/taxonomy.md`
3. `docs/projects/habitat-harness/invariant-corpus.md`
4. `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
5. `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`

Behavior/proof authority:

1. `.grit/patterns/habitat/checks/runtime_validation_imports.md`
2. `scripts/lint/lint-domain-refactor-guardrails.sh`
3. `tools/habitat-harness/src/lib/grit.ts`
4. current source under `mods/mod-swooper-maps/src/recipes` and
   `mods/mod-swooper-maps/src/domain`
5. fresh native Grit and parser inventory commands

## Product Source

Habitat's product target is executable structural control for agents. For this
row, the structural control is runtime purity: agents editing runtime recipe
steps or domain strategies should be stopped before importing compile-time
validation helpers into runtime execution.

## Architecture Source

`rules.json` gives this row owner identity, scope, message, and hook lane.
`taxonomy.md` names `scope:runtime-purity` for this family. The invariant corpus
records the retired ESLint row as `eslint-runtime-typebox-ban` and assigns the
port to `grit-check`. The guardrail script's full profile includes the prior
runtime typebox/value scan source.

## Current Pattern Source

The current Grit pattern has five import-source arms for runtime recipe steps
and domain strategy files:

- `@sinclair/typebox/value`
- `@sinclair/typebox/compiler`
- `@swooper/mapgen-core/compiler/normalize`
- `@swooper/mapgen-core/authoring/validation`
- `@swooper/mapgen-core/authoring/op/validation-surface`

## Checkpoint Consequences

Current native fixture proof now records
`RVI-NATIVE-FIXTURES-2026-06-15`:

- 10 current-predicate positive classes: TypeBox value import, TypeBox compiler
  import, mapgen compiler normalize import, authoring validation import,
  validation-surface import, domain strategy forbidden import, type-only import,
  side-effect import, other-mod raw predicate import, and runtime recipe step
  `contract.ts` forbidden import;
- 0 ignore-sample matches for allowed mapgen-core imports, config paths, tests,
  domain op non-strategy paths, map paths, package paths, `.tsx`, source
  lookalikes, alias/root TypeBox imports, re-exports, and dynamic imports.

Current parser inventory now records `RVI-RUNTIME-INVENTORY-2026-06-15`:

- scan roots: `mods/mod-swooper-maps/src/recipes` and
  `mods/mod-swooper-maps/src/domain`;
- exclusions: `node_modules`, `dist`, `mod`;
- parser: TypeScript compiler API over `.ts`/`.tsx` imports, re-exports, and
  dynamic imports;
- counts: 886 scanned TS/TSX files, 344 current-predicate TS files, 0
  current-predicate TSX files, 159 runtime recipe step TS files, 185 domain
  strategy TS files, 1,005 import declarations inside current-predicate files,
  137 export-from declarations inside current-predicate files, 0 forbidden
  import matches, 0 forbidden type-only imports, 0 forbidden side-effect
  imports, 0 forbidden re-exports, 0 forbidden dynamic imports, 0 forbidden
  `contract.ts` matches, 0 forbidden matches for every forbidden source class,
  0 out-of-scope forbidden references, 0 source lookalikes in runtime, 0
  `typebox/value` alias runtime imports, and 0 root TypeBox runtime imports.

This row proves current-predicate native fixture behavior and parser
inventory/live zero-candidate evidence only. It cannot claim wrapper selector
truth, raw acquisition, baseline behavior, injected cleanup, Effect adapter
behavior, apply safety, neighboring runtime-purity rows, retired parity, or
product proof in this stack/base.
