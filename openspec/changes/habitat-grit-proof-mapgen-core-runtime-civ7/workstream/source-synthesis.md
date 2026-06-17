# Source Synthesis - MapGen Core Runtime Civ7

## Sources Read

| Source | Row fact | Boundary |
| --- | --- | --- |
| `packages/mapgen-core/AGENTS.md` | Defines `mapgen-core` as pure TypeScript domain logic and states direct Civ7 engine imports do not belong there; engine interaction goes through `@civ7/adapter` and `MapGenContext.adapter`. | Package owner authority; does not prove Grit predicate behavior or wrapper enforcement. |
| `tools/habitat-harness/src/rules/rules.json` | Registers `grit-mapgen-core-runtime-civ7` as enforced `grit-check`, scoped to `packages/mapgen-core/src/{core,engine}/**/*.ts`, forbidding Civ7 adapter value imports, `/base-standard` paths, and runtime globals. | Registry authority only; not proof of wrapper behavior. |
| `docs/projects/habitat-harness/taxonomy.md` | Classifies `@swooper/mapgen-core` as `kind:engine`: pure TS engine/domain logic with no Civ7 runtime values or engine globals. | Architecture taxonomy; not row proof. |
| `docs/projects/habitat-harness/invariant-corpus.md` | Normalization guardrail G3 and `core-purity` lineage cover Civ7 runtime references in MapGen core production code. | Retired parity remains unproven in this checkpoint. |
| `docs/projects/engine-refactor-v1/architecture-normalization-packet.md` | Core purity is a normalization principle and G3 covers Civ7 adapter value imports, Civ globals, or Civ7 type refs inside pure `packages/mapgen-core` surfaces. | Project authority; exact G3 parity and type-ref semantics are not closed by this row. |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Candidate row requests positive Civ7 runtime imports, negative authoring/adapter boundaries, parser-edge type imports, current MapGen core scan, empty locked baseline unless findings prove otherwise, and non-apply disposition. | Aggregate row to align after proof is gathered. |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Design seed had 1 match and 1 ignore, with parser-edge and false-positive classification pending. | Aggregate row to align after proof is gathered. |

## Current Predicate

The current Grit predicate text targets syntax under:

- `packages/mapgen-core/src/core/**/*.ts`
- `packages/mapgen-core/src/engine/**/*.ts`

when it sees:

- `import ... from "@civ7/adapter"`
- `import ... from "@civ7/adapter/civ7"`
- `import ... from "/base-standard/..."`
- `import "/base-standard/..."`
- member expressions on `GameplayMap`, `TerrainBuilder`, `ResourceBuilder`,
  `FeatureBuilder`, `AreaBuilder`, `MapConstructibles`, or `GameInfo`

Native fixture proof in this checkpoint shows only the runtime-global member
branches reporting. The intended import branches do not report the fixture
import examples, so import-class enforcement remains a predicate-gap blocker.

## Fixture Plan

Positive/current-predicate classes:

- listed Civ7 runtime global member expressions;
- both `core` and `engine` current-predicate paths.

Controls and parser-edge classifications:

- value imports from `@civ7/adapter` and `@civ7/adapter/civ7` as native
  predicate-gap controls;
- `/base-standard/...` import declarations and side-effect imports as native
  predicate-gap controls;
- type-only adapter imports;
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

Durable records will include scan roots, exclusions, file counts, import
counts, type-only import counts, forbidden value/source counts, runtime global
member-expression counts, out-of-scope lookalike counts, row id, proof ids, and
explicit non-claims. Temporary stdout or scratch files are not durable proof.
