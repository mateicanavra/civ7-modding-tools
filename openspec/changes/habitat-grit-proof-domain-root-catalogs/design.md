# Design - Domain Root Catalogs Proof

## Frame

### Objective

Make `grit-domain-root-catalogs` truthful as a row-owned active Habitat check
for the current Grit predicate.

### Product Movement

This row helps Habitat keep domain ownership local and reviewable before
agents author or migrate domain structure: catalog-like tag and artifact
surfaces should live at owned public surfaces, not as legacy root catalog files
under a domain root.

### Selection

- Rule id: `grit-domain-root-catalogs`
- Grit pattern: `domain_root_catalogs`
- Pattern file: `.grit/patterns/habitat/checks/domain_root_catalogs.md`
- Owner layer: `grit-check`
- Registry scope:
  `mods/mod-swooper-maps/src/domain/**/{tags,artifacts}.ts`
- Current Grit predicate scope:
  path regex
  `.*mods/mod-swooper-maps/src/domain/[^/]+/(?:tags|artifacts)\.ts$`
- Forbidden current syntax class:
  any TypeScript program in a domain-root `tags.ts` or `artifacts.ts` file.

### Hard Core

1. This is a check proof, not an apply proof.
2. Current predicate proof covers only immediate domain-root `tags.ts` and
   `artifacts.ts` files.
3. Native fixture proof, parser inventory, Habitat wrapper behavior, raw Grit
   acquisition, injected proof, baseline behavior, and product proof are
   separate proof classes.
4. Nested domain op/strategy surfaces, recipe-stage artifacts/tags, generated
   output, packages, maps, tests, and `.tsx` files are controls under this row.
5. Broader domain-root `export *` facade coverage remains owned by separate
   predicate/disposition work and is not proven by this row.
6. Current parser inventory is not Habitat wrapper enforcement proof.

### Exterior

- Swooper domain source remediation or catalog migration.
- Predicate repair for broader facade/export classes.
- Generator or migration behavior for moving catalog definitions.
- Baseline mutation.
- Product/runtime Civ7 behavior.

### Falsifier

This checkpoint fails if it claims raw Grit acquisition, apply safety,
generator/migration behavior, product/runtime behavior, or broader domain-root
facade coverage from the active check proof; if live current-predicate
domain-root catalogs are found but recorded as a clean pass without owner
disposition; or if recipe-stage artifact/tag files are mislabeled as
current-predicate domain-root catalogs.

## Source Synthesis

`rules.json` registers `grit-domain-root-catalogs` as an enforced `grit-check`
for `mod-swooper-maps`, scoped to
`mods/mod-swooper-maps/src/domain/**/{tags,artifacts}.ts`, forbidding
domain-root tag/artifact catalogs.

`taxonomy.md` records `scope:domain-surface` for public domain surfaces and
states that recipe/domain surface rules should not rely on domain-root public
facades.

`invariant-corpus.md` records normalization guardrail G2 for no domain-root
catalogs and assigns the ported enforcement to `grit-check`.

`discrepancy-log.md` records DL-10 for domain-root public-surface facade
documentation. This row does not close that documentation discrepancy and does
not prove broader `export *` facade coverage.

`grit-pattern-corpus-ledger.md` requests positive root catalog files, negative
approved generated/artifact surfaces, current domain scan, empty locked
baseline unless findings prove otherwise, and generator/migration disposition
if structural move is needed.

`grit-proof-matrix.md` records the earlier native/parser checkpoint. This
closure updates that row with current wrapper, baseline, and injected proof.

## Fixture Matrix

| Class | Expected current-predicate behavior |
| --- | --- |
| Immediate domain-root `tags.ts` | Reports |
| Immediate domain-root `artifacts.ts` | Reports |
| Nested domain op/strategy `tags.ts` or `artifacts.ts` | Does not report |
| Domain root `index.ts`, `config.ts`, or other filenames | Does not report |
| Recipe-stage `artifacts.ts` or `tags.ts` | Does not report |
| Generated-output-shaped, map, package, test, `.tsx`, and other-mod paths | Do not report |
| Domain-root facade/export examples in non-catalog files | Do not report in this row and remain broader facade non-claims |

## Proof Contract

This row checkpoint may record:

- native fixture/parser-edge proof for current-predicate behavior;
- parser inventory/live candidate evidence over current Swooper domain source;
- Habitat wrapper/current-tree selector proof for the registered rule;
- aggregate `grit-check` wrapper health with this rule included;
- explicit empty baseline ownership and `baseline-integrity` proof;
- row-specific injected violation/path-control proof;
- record-truth updates in the corpus ledger, proof matrix, command log, and
  packet files.

Proof ids:

- `DRC-NATIVE-FIXTURES-2026-06-15`: native fixture/parser-edge proof for
  current-predicate positive classes and recorded controls. The current
  checkpoint records 4 native matches and 0 ignore-sample matches.
- `DRC-DOMAIN-INVENTORY-2026-06-15`: parser inventory/live evidence over
  current Swooper domain source. The current checkpoint records 0 live
  current-row domain-root catalog matches and 0 nested domain catalog filename
  matches.
- `DRC-NATIVE-CORPUS-REFRESH-2026-06-16`: current native Grit pattern corpus
  health with DRC included.
- `DRC-DOMAIN-INVENTORY-2026-06-16`: current parser inventory/live evidence
  over Swooper domain source. The closure records 0 live current-row
  domain-root catalog matches and 0 nested domain catalog filename matches.
- `DRC-PER-RULE-SELECTOR-2026-06-16`: Habitat wrapper proof selecting exactly
  `grit-domain-root-catalogs` plus `baseline-integrity`.
- `DRC-HABITAT-GRIT-TOOL-2026-06-16`: aggregate `grit-check` wrapper proof
  with DRC included.
- `DRC-BASELINE-FILES-2026-06-16`: explicit empty baseline ownership for DRC.
- `DRC-INJECTED-PROBE-2026-06-16`: row-specific injected
  violation/path-control proof. Aggregate injected-corpus closure remains a
  non-claim while the accepted unrelated DDIT adapter activation gap remains.

This row checkpoint must not record:

- raw Grit acquisition;
- Effect adapter proof;
- apply safety;
- generator/migration proof;
- retired parity;
- broader domain-root facade closure;
- neighboring row proof;
- product proof.

## Downstream Records

The aggregate proof matrix, command proof log, and corpus ledger are updated
for this row's active-check closure. Recovery ledger, taxonomy, invariant
corpus, discrepancy log, and command docs remain unchanged because this closure
does not change policy, diagnostics, or user-facing behavior.
