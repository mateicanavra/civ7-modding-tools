# Source Synthesis - Sibling Stage Step Imports

## Sources Read

| Source | Row fact | Boundary |
| --- | --- | --- |
| `mods/mod-swooper-maps/AGENTS.md` | Swooper Maps source is game-facing mod code; generated `mod/` output is read-only. | Package router only; not proof of Grit behavior. |
| `tools/habitat-harness/src/rules/rules.json` | Registers `grit-sibling-stage-step-imports` as enforced `grit-check`, scoped to standard recipe stages, forbidding one stage importing another stage's `steps/` implementation. | Registry authority only; not proof of wrapper behavior. |
| `docs/projects/habitat-harness/taxonomy.md` | Records `scope:stage-isolation`: no sibling-stage step imports. | Architecture taxonomy; not row proof. |
| `docs/projects/habitat-harness/invariant-corpus.md` | Normalization guardrail G5 maps no sibling stage step imports to `grit-check`. | Retired parity remains unproven in this checkpoint. |
| `docs/projects/habitat-harness/discrepancy-log.md` | DL-4 records the same G5 rule and a separate documentation task. | This row does not close documentation discrepancy. |
| `docs/projects/engine-refactor-v1/architecture-normalization-packet.md` | Step owns executable contract boundary and bounded orchestration; stage owns local step composition; recipe owns global stage/step order. | Project authority; not native Grit proof. |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Candidate row requests positive sibling step import, negative stage contract/domain import, parser-edge relative depth, current stage scan, empty locked baseline unless findings prove otherwise, and non-apply disposition. | Aggregate row to align after proof is gathered. |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Design seed had 1 match and 1 ignore, with parser-edge and false-positive classification pending. | Aggregate row to align after proof is gathered. |

## Current Predicate

The current Grit predicate reports import declarations in files matching:

- `mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/.*\.ts$`

when the import source matches:

- `.*\.\./[^/]+/steps/.*`

The registry scope is broader:

- `mods/mod-swooper-maps/src/recipes/standard/stages/**/*.ts`

The broader stage-root scan is contextual inventory only; immediate
stage-root public-config files do not satisfy the current Grit filename
predicate.

## Fixture Plan

Positive/current-predicate classes:

- root stage file importing a sibling stage step;
- nested stage file using deeper relative traversal to a sibling stage step;
- named import from a sibling step contract path;
- type-only import from a sibling step types path;
- index and direct step file source variants;
- sources with `.js` extension because current recipe source uses TS files
  importing JS module specifiers.

Controls and parser-edge classifications:

- same-stage `./steps/...` imports;
- stage contract/config and `@mapgen/domain/...` imports;
- package, map, test, `.tsx`, and non-standard recipe paths;
- source lookalikes such as `stepstore` and `stepsish`;
- re-export and dynamic import forms, which remain current native non-matches
  in this row checkpoint.

## Inventory Plan

Run a TypeScript parser inventory over:

- `mods/mod-swooper-maps/src/recipes/standard/stages`

Exclusions:

- `node_modules`
- `dist`
- `mod`

Durable records include scan root, exclusions, file counts, import counts,
export-from counts, dynamic import counts, sibling-stage step import counts,
same-stage step import counts, stage contract/domain import counts, out-of-scope
lookalikes, row id, proof ids, and explicit non-claims. Temporary stdout or
scratch files are not durable proof.

Current checkpoint counts:

- All-stage-root contextual scan: 216 scanned TS/TSX files, 785 import
  declarations, 39 export-from declarations, 0 dynamic imports, 0
  sibling-stage step import matches, 18 same-stage `./steps/...` imports, 117
  domain surface imports, 82 relative contract/config-shaped imports, 0
  sibling source lookalikes, 0 sibling export-from matches, and 0 sibling
  dynamic import matches.
- Actual current-predicate subset: 212 `.ts` files, 0 `.tsx` files, 776
  import declarations, 39 export-from declarations, 0 dynamic imports, 0
  sibling-stage step import matches, 18 same-stage `./steps/...` imports, 112
  domain surface imports, 82 relative contract/config-shaped imports, 0
  sibling source lookalikes, 0 sibling export-from matches, and 0 sibling
  dynamic import matches.
- Stage-root context: 19 immediate stage directories, 23 immediate stage-root
  entries, and 4 stage-root `.ts` files outside the current predicate:
  `ecology-public-config.ts`, `hydrology-public-config.ts`,
  `map-projection-public-config.ts`, and `placement-public-config.ts`.

`Relative contract/config-shaped imports` means current-predicate import
sources equal to `./contract.js` or `./config.js`, or relative import sources
containing a `contract` or `config` path segment/name under the same stage
root.
