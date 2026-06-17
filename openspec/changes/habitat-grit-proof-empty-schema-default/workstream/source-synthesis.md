# Source Synthesis - Empty Schema Default

## Sources Read

| Source | Row fact | Boundary |
| --- | --- | --- |
| `tools/habitat-harness/src/rules/rules.json` | Registers `grit-empty-schema-default` as enforced `grit-check` for contract schema files, forbidding empty object defaults in schema definitions. | Registry authority only; not proof of wrapper behavior. |
| `.grit/patterns/habitat/checks/empty_schema_default.md` | Current predicate reports `default: {}` in domain op or recipe step `*.contract.ts` paths. | Predicate excludes ordinary `contract.ts`; not exact contract-schema policy closure. |
| `docs/projects/habitat-harness/invariant-corpus.md` | Retired `eslint-empty-schema-defaults` invariant maps no `{ default: {} }` in contract schemas to `grit-check`. | Retired parity remains unproven in this checkpoint. |
| `scripts/lint/lint-domain-refactor-guardrails.sh` | Full profile includes schema-related checks and retired guardrail lineage. | Proving lineage only; not retired parity closure. |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Candidate row requests positive `Type.Object` default `{}` shape, negative property defaults, parser-edge nested schemas, current schema scan, empty locked baseline unless findings prove otherwise, and non-apply disposition. | Aggregate row to align after proof is gathered. |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Design seed had 1 match and 1 ignore, with parser-edge and false-positive classification pending. | Aggregate row to align after proof is gathered. |

## Current Predicate

The current Grit predicate is syntax-level and reports:

- `default: {}`

when `$filename` matches:

- `mods/<mod>/src/domain/**/ops/**/*.contract.ts`
- `mods/<mod>/src/recipes/**/steps/**/*.contract.ts`

## Fixture Plan

Positive/current-predicate classes:

- domain op `*.contract.ts` empty object default;
- TypeBox options object with empty default;
- nested schema object with empty default;
- recipe step `*.contract.ts` empty object default;
- other-mod raw predicate path.

Controls and parser-edge classifications:

- property defaults that are not object-level empty defaults;
- non-empty object defaults and scalar/array/null defaults;
- ordinary `contract.ts` paths;
- config, test, map, package, non-contract, and `.tsx` paths;
- lookalike property names.

## Inventory Plan

Run a TypeScript parser inventory over:

- `mods/mod-swooper-maps/src/recipes`
- `mods/mod-swooper-maps/src/domain`

Exclusions:

- `node_modules`
- `dist`
- `mod`

Durable records will include scan roots, exclusions, current-predicate file
counts, ordinary-contract file counts, empty default counts, row id, proof ids,
and explicit non-claims. Temporary stdout or scratch files are not durable
proof.
