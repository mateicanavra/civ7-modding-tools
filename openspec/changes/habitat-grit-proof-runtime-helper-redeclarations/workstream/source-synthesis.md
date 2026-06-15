# Source Synthesis - Runtime Helper Redeclarations

## Sources Read

| Source | Row fact | Boundary |
| --- | --- | --- |
| `tools/habitat-harness/src/rules/rules.json` | Registers `grit-runtime-helper-redeclarations` as enforced `grit-check` for runtime recipe steps and domain strategies, forbidding runtime layers redeclaring shared clamp/range/roll helpers. | Registry authority only; not proof of wrapper behavior. |
| `.grit/patterns/habitat/checks/runtime_helper_redeclarations.md` | Current predicate reports exact `const`, `let`, `var`, and function declarations for `clamp01`, `clampChance`, `normalizeRange`, and `rollPercent` in runtime recipe step and domain strategy `.ts` paths. | Predicate may include raw path facts; not exact wrapper selector proof. |
| `docs/projects/habitat-harness/taxonomy.md` | `scope:runtime-purity` includes no helper redeclarations in steps/strategies. | Policy family only. |
| `docs/projects/habitat-harness/invariant-corpus.md` | Retired `eslint-redefined-helpers` invariant maps exact helper redeclarations to `grit-check`. | Retired parity remains unproven in this checkpoint. |
| `scripts/lint/lint-domain-refactor-guardrails.sh` | Full profile scans include duplicate helper redefinition checks including `clamp01`. | Proving lineage only; not retired parity closure. |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Candidate row requests positive exact helper redeclarations, negative unrelated helper names, parser-edge function expressions, current runtime scan, empty locked baseline unless findings prove otherwise, and separate exact-helper apply ownership. | Aggregate row to align after proof is gathered. |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Design seed had 1 match and 1 ignore, with parser-edge and false-positive classification pending. | Aggregate row to align after proof is gathered. |

## Current Predicate

The current Grit predicate is syntax-level and reports exact declarations of:

- `clamp01`
- `clampChance`
- `normalizeRange`
- `rollPercent`

through:

- `const <helper> = $_`
- `let <helper> = $_`
- `var <helper> = $_`
- `function <helper>($...) { $... }`

when `$filename` matches:

- `mods/<mod>/src/recipes/**/stages/**/steps/**/*.ts`
- `mods/<mod>/src/domain/**/ops/**/strategies/**/*.ts`

## Fixture Plan

Positive/current-predicate classes:

- exact function declaration in runtime recipe step;
- exact `const`, `let`, and `var` declarations in runtime recipe step;
- function-expression and arrow-function initializers;
- exact helper redeclaration in domain strategy;
- step-local `contract.ts` current-predicate fact;
- other-mod raw predicate path.

Controls and parser-edge classifications:

- canonical helper imports and calls without redeclaration;
- helper-name lookalikes;
- object properties, object methods, class methods, and destructuring;
- stage-level config, repo test, map, package, non-runtime, and `.tsx` paths.

## Inventory Plan

Run a TypeScript parser inventory over:

- `mods/mod-swooper-maps/src/recipes`
- `mods/mod-swooper-maps/src/domain`

Exclusions:

- `node_modules`
- `dist`
- `mod`

Durable records will include scan roots, exclusions, current-predicate file
counts, declaration counts, row id, proof ids, and explicit non-claims.
Temporary stdout or scratch files are not durable proof.
