# Source Synthesis - MapGen Core Runtime Civ7

## Sources Read

| Source | Row fact | Boundary |
| --- | --- | --- |
| `packages/mapgen-core/AGENTS.md` | Defines `mapgen-core` as pure TypeScript domain logic and states direct Civ7 engine imports do not belong there; engine interaction goes through `@civ7/adapter` and `MapGenContext.adapter`. | Package owner authority; does not prove Grit predicate behavior or wrapper enforcement. |
| `packages/mapgen-core/src/AGENTS.md` | Source package tests/checks should preserve MapGen core purity and avoid generated-output hand edits. | Source-owner authority; not a product runtime proof. |
| `tools/habitat-harness/src/rules/rules.json` | Registers `grit-mapgen-core-runtime-civ7` as enforced `grit-check`, scoped to `packages/mapgen-core/src/{core,engine}/**/*.ts`, forbidding Civ7 adapter value imports, `/base-standard` paths, and runtime globals. | Registry authority only; not proof of current-tree behavior. |
| `docs/projects/habitat-harness/taxonomy.md` | Classifies `@swooper/mapgen-core` as `kind:engine`: pure TS engine/domain logic with no Civ7 runtime values or engine globals. | Architecture taxonomy; not row proof. |
| `docs/projects/habitat-harness/invariant-corpus.md` and engine-refactor packet | Normalization guardrail G3 and `core-purity` lineage cover Civ7 runtime references in MapGen core production code. | Retired parity remains unproven by this Grit row. |
| Official GritQL docs and local `.grit` examples | `import_statement(source=$source)` is the safe syntax used locally for source-literal import predicates. | Syntax authority; does not prove this row until native fixtures run. |
| Accepted core-purity wrapped-test row | Adjacent package-owned source scan treats value/runtime adapter imports as forbidden and type-only imports as clean source facts. | Context only; this row remains Grit-owned. |

## Current Predicate

The repaired Grit predicate targets:

- `packages/mapgen-core/src/core/**/*.ts`
- `packages/mapgen-core/src/engine/**/*.ts`

when it sees:

- value-bearing static imports from `@civ7/adapter`,
  `@civ7/adapter/civ7`, or `/base-standard/...`;
- side-effect imports from those runtime sources;
- mixed value/type imports from those runtime sources;
- member expressions on `GameplayMap`, `TerrainBuilder`, `ResourceBuilder`,
  `FeatureBuilder`, `AreaBuilder`, `MapConstructibles`, or `GameInfo`.

Pure `import type` and pure single-line inline `import { type ... }` adapter
imports are controls.

## Fixture Plan

Positive classes:

- listed Civ7 runtime global member expressions;
- value import from `@civ7/adapter`;
- value import from `@civ7/adapter/civ7`;
- value import from `/base-standard/...`;
- side-effect import from adapter and `/base-standard/...`;
- mixed value/type adapter import;
- both `core` and `engine` current-predicate paths.

Controls and parser-edge classifications:

- pure type-only adapter imports;
- pure inline type-only adapter imports;
- authoring or adapter-style MapGen paths outside `core` and `engine`;
- package paths outside `mapgen-core`;
- test, map, `.tsx`, and source-lookalike paths;
- source lookalikes such as `@civ7/adapterish` and `/base-standardish/...`;
- local identifiers or interfaces that contain global names without member
  access.

## Inventory Plan

Run a TypeScript parser inventory over:

- `packages/mapgen-core/src/core`
- `packages/mapgen-core/src/engine`

Exclusions:

- `node_modules`
- `dist`
- `mod`

Durable records include scan roots, exclusions, file counts, import counts,
type-only controls, value-bearing candidate counts, forbidden source counts,
runtime global member-expression counts, out-of-scope context, row id, proof
ids, and explicit non-claims. Temporary stdout or scratch files are not
durable proof.
