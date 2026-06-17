# Source Synthesis - Domain Root Catalogs

## Sources Read

| Source | Row fact | Boundary |
| --- | --- | --- |
| `mods/mod-swooper-maps/AGENTS.md` | Swooper Maps source is game-facing mod code; generated `mod/` output is read-only. | Package router only; not proof of Grit behavior. |
| `tools/habitat-harness/src/rules/rules.json` | Registers `grit-domain-root-catalogs` as enforced `grit-check`, scoped to domain `tags.ts` and `artifacts.ts`, forbidding domain-root tag/artifact catalogs. | Registry authority only; not proof of wrapper behavior. |
| `docs/projects/habitat-harness/taxonomy.md` | Records domain surface ownership and broader domain-root facade expectations. | Architecture taxonomy; broader facade coverage is a non-claim for this row. |
| `docs/projects/habitat-harness/invariant-corpus.md` | Normalization guardrail G2 records no domain-root catalogs and maps the ported rule to `grit-check`. | Retired parity remains unproven in this checkpoint. |
| `docs/projects/habitat-harness/discrepancy-log.md` | DL-10 records broader domain-root public-surface documentation work. | This row does not close documentation discrepancy or broader facade coverage. |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Candidate row requests positive root catalog files, negative approved generated/artifact surfaces, current domain scan, empty locked baseline unless findings prove otherwise, and generator/migration disposition if needed. | Aggregate row to align after proof is gathered. |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Earlier bounded checkpoint had native/parser proof only; this closure adds current wrapper, baseline, and injected proof. | Aggregate row to align after proof is gathered. |

## Current Predicate

The current Grit predicate reports any TypeScript program in files matching:

- `.*mods/mod-swooper-maps/src/domain/[^/]+/(?:tags|artifacts)\.ts$`

The registry scope is:

- `mods/mod-swooper-maps/src/domain/**/{tags,artifacts}.ts`

The current native predicate appears narrower than the registry glob because it
matches immediate domain-root catalog files only. Nested domain surfaces are
path controls unless later predicate repair expands the rule.

## Fixture Plan

Positive/current-predicate classes:

- immediate domain-root `tags.ts`;
- immediate domain-root `artifacts.ts`;
- multiple domain root names;
- non-empty and empty program bodies under the current filename predicate.

Controls and parser-edge classifications:

- domain root `index.ts`, `config.ts`, and `catalog.ts`;
- nested domain op/strategy/shared/config `tags.ts` or `artifacts.ts`;
- recipe-stage `tags.ts` and `artifacts.ts`;
- generated-output-shaped, map, package, test, `.tsx`, and other-mod paths;
- broader domain-root facade/export examples in non-catalog files.

## Inventory Plan

Run a TypeScript parser inventory over:

- `mods/mod-swooper-maps/src/domain`

Exclusions:

- `node_modules`
- `dist`
- `mod`

Durable records include scan root, exclusions, file counts, actual current
predicate counts, nested catalog filename counts, domain-root non-catalog file
counts, live candidate paths, row id, proof ids, blockers, and explicit
non-claims. Temporary stdout or scratch files are not durable proof.

Current closure counts:

- 664 scanned TS/TSX files under the Swooper domain root, all `.ts`.
- 7 immediate domain directories and 46 immediate domain-root entries.
- 26 immediate domain-root `.ts` files.
- 0 current-predicate `tags.ts` files.
- 0 current-predicate `artifacts.ts` files.
- 0 current-predicate TSX files.
- 0 nested domain catalog filename files.
- 0 immediate-root catalog-name lookalikes.
- 7 immediate-root `index.ts` files and 5 immediate-root `config.ts` files.
- 46 immediate-root import declarations.
- 38 total immediate-root `ExportDeclaration` nodes.
- 36 immediate-root export-from declarations with module specifiers.
- 25 immediate-root named export declaration nodes.
- 56 immediate-root named export specifier elements.
- 52 immediate-root exported declaration symbols from exported
  `const`/`function`/`type`/`interface`/`enum` declarations.
- 2 local named export declaration nodes without module specifiers, both in
  `mods/mod-swooper-maps/src/domain/narrative/config.ts` at lines 50 and 60.
- 13 immediate-root value-star facades, recorded only as broader facade context
  outside this catalog row: `foundation/config.ts` twice,
  `hydrology/config.ts` twice, `hydrology/index.ts` once,
  `morphology/config.ts` twice, and `resources/index.ts` six times.

An initial inventory attempt with an over-escaped file-extension regex produced
0 scanned files. That stdout was scratch only and is not durable proof.

Current wrapper proof selects DRC through
`bun run habitat:check -- --json --rule grit-domain-root-catalogs`, and the
aggregate `grit-check` wrapper includes DRC with 30 Grit rules plus
`baseline-integrity` passing. The explicit DRC baseline is `[]`. The registered
injected probe reports the injected domain-root `tags.ts` path and leaves the
domain-root `index.ts` control clean. Raw direct Grit acquisition and broader
domain-root facade closure remain non-claims.
