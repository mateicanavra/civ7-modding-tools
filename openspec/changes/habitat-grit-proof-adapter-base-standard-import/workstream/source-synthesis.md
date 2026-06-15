# Source Synthesis - Adapter Base Standard Import

## Sources Read

| Source | Row fact | Boundary |
| --- | --- | --- |
| `packages/civ7-adapter/AGENTS.md` | `packages/civ7-adapter/**` is the sole boundary for importing Civ7 engine globals and `base-standard` APIs. | Package router only; not proof of Grit behavior. |
| `tools/habitat-harness/src/rules/rules.json` | Registers `grit-adapter-base-standard-import` as enforced `grit-check`, scoped to `packages/**/*.ts` outside `packages/civ7-adapter`, forbidding runtime `/base-standard/` imports outside `@civ7/adapter`. | Registry authority only; not proof of wrapper behavior. |
| `scripts/lint/lint-adapter-boundary.sh` | Legacy wrapped script scans broad `/base-standard/` strings in packages, excludes adapter, `.d.ts`, config/build files, and records an allowlist. | Wrapped-script context; not native Grit predicate proof or baseline proof. |
| `docs/projects/habitat-harness/taxonomy.md` | `kind:adapter` owns Civ7 engine globals and `/base-standard/` imports exclusively. | Architecture taxonomy; not current-tree proof. |
| `docs/projects/habitat-harness/invariant-corpus.md` | Adapter-boundary invariant records 7 allowlisted broad string files and says H5's Grit runtime-import rule starts empty while wrapped script retains broad provenance-string scan context until H6 disposition. | Invariant lineage; not current Grit proof. |
| `docs/projects/habitat-harness/discrepancy-log.md` | DL-9 records adapter-boundary allowlist context as a follow-up to migrate into the harness/baseline records. | Discrepancy context; not baseline proof in this row. |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Candidate row requests positive non-adapter base-standard imports, negative adapter-owned imports, current package scan, existing adapter baseline reconciliation, and non-apply disposition. | Aggregate row to align after proof is gathered. |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Design seed has 1 match and 1 ignore, with parser-edge and false-positive classification pending. | Aggregate row to align after proof is gathered. |

## Current Predicate

The current Grit predicate reports import declarations whose source matches:

- `.*/base-standard/.+`

when the filename matches:

- `.*packages/.*\.ts$`

and the filename does not include:

- `packages/civ7-adapter/`

The current predicate is syntax/path scoped. It does not by itself prove
wrapper command behavior, raw acquisition, injected cleanup, baseline behavior,
wrapped-script parity, source remediation, or product/runtime closure.

## Fixture Plan

Positive/current-predicate classes:

- direct value import from `/base-standard/...` outside adapter;
- direct side-effect import from `/base-standard/...` outside adapter;
- current native behavior for type-only import from `/base-standard/...`;
- current native behavior for `.d.ts` import from `/base-standard/...`.

Controls and parser-edge classifications:

- adapter-owned `/base-standard/...` imports;
- non-package paths and `.tsx` paths;
- source strings that do not contain the exact `/base-standard/` segment;
- broad provenance or test harness strings that mention `/base-standard/`;
- export-from and dynamic import shapes that the current native predicate does
  not match.

## Inventory Plan

Run a TypeScript parser inventory over:

- `packages`

Exclusions:

- `node_modules`
- `dist`

Durable records include scan root, exclusions, file counts, actual current
predicate counts, direct `/base-standard/` import counts, type-only/value/side
effect split, export-from and dynamic import counts, adapter-owned import
counts, broad string-lookalike counts, live candidate paths, row id, proof ids,
blockers, and explicit non-claims. Stdout or scratch files are not durable
proof.

Current checkpoint counts:

- 944 scanned TS/TSX/JSON files under `packages`.
- 910 `.ts` suffix files, including 2 `.d.ts` files and 908 non-`.d.ts`
  `.ts` files.
- 0 `.tsx` files and 34 `.json` files.
- 910 current-predicate `.ts` suffix files.
- 895 current-predicate files outside `packages/civ7-adapter`.
- 2 current-predicate `.d.ts` files outside adapter and 893
  current-predicate non-`.d.ts` files outside adapter.
- 15 current-predicate adapter files.
- 3,111 import declarations outside adapter.
- 588 type-only import declarations outside adapter.
- 2,521 value import declarations outside adapter.
- 2 side-effect imports outside adapter.
- 541 export-from declarations outside adapter.
- 2 dynamic imports outside adapter.
- 0 direct `/base-standard/` import declarations outside adapter.
- 0 direct type-only, value, or side-effect `/base-standard/` imports outside
  adapter.
- 0 direct `/base-standard/` export-from declarations outside adapter.
- 0 direct `/base-standard/` dynamic imports outside adapter.
- 8 outside-adapter string-lookalike files and 81 outside-adapter
  string-lookalike literals.
- 10 adapter-owned `/base-standard/` import declarations, including 1
  adapter-owned side-effect import.
- 0 parse diagnostics.

The outside-adapter string-lookalike files are broad legacy wrapped-script
context, not current-row direct import candidates:

- `packages/civ7-map-policy/scripts/verify.ts`
- `packages/civ7-map-policy/src/civ7-tables.gen.ts`
- `packages/civ7-map-policy/src/coast-classification.ts`
- `packages/civ7-map-policy/src/river-constants.ts`
- `packages/civ7-map-policy/src/river-type-metadata.source.ts`
- `packages/civ7-map-policy/test/map-policy.test.ts`
- `packages/civ7-types/index.d.ts`
- `packages/mapgen-core/test/setup.ts`
