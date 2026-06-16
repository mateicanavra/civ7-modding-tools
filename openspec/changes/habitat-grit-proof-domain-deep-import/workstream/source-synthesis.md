# Source Synthesis - Domain Deep Import Proof

## Authority Order

1. Direct supervisor continuation for the bounded native/parser checkpoint.
2. `docs/projects/habitat-harness/dra-takeover-frame.md`.
3. `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`.
4. `tools/habitat-harness/src/rules/rules.json`.
5. `docs/system/libs/mapgen/policies/IMPORTS.md`.
6. `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`.
7. Current pattern file and native Grit/parser behavior.
8. H5/H6 historical records as downstream realignment inputs only.

## Product Source

The takeover frame requires every Grit row to start from the corpus row, state
the owner/proof shape, and keep proof classes separate. The corpus ledger row
for `grit-domain-deep-import` says recipes/maps compose domains through public
surfaces, not deep internals, and assigns OpenSpec id
`habitat-grit-proof-domain-deep-import`.

This checkpoint is bounded to native fixture/parser-edge proof, parser
inventory/live zero-candidate evidence, metadata scope truth, and record truth.
It does not claim full row closure.

## Architecture Source

`rules.json` registers the rule as enforced, owner `grit-check`, owner project
`mod-swooper-maps`, scope `mods/*/src/{recipes,maps}/**/*.{ts,tsx}`, and
message "Import domain code through @mapgen/domain/<domain>, /ops, or
/config.js rather than deep internals."

`IMPORTS.md` says recipe assembly should use public domain surfaces and expose
needed symbols through domain root, `/ops`, or `/config.js`.

`NORMALIZATION-GUARDRAILS.md` G4 names Habitat
`grit-recipe-domain-surface` and `grit-domain-deep-import` as mechanical checks
for recipes consuming sanctioned domain public surfaces rather than op
internals.

## Current Pattern Source

`.grit/patterns/habitat/checks/domain_deep_import.md`:

- frontmatter `level: error`;
- explicit `language js(typescript)`;
- file predicate for `mods/<mod>/src/recipes` and `mods/<mod>/src/maps`;
- source predicate for `ops/<tail>`, exact `ops-by-id`, `rules/<tail>`, and
  `strategies/<tail>` with exact optional-quote matching;
- `import_statement(source=...)`, named re-export, and star re-export arms.

Current native fixture proof:

- 12 DDI positive current-predicate matches;
- 0 ignore-sample matches;
- positives include value imports, side-effect imports, type-only imports,
  namespace imports, named re-exports, type-only re-exports, export-star,
  `.tsx`, map paths, exact `ops-by-id`, and recipe/map-local test paths;
- controls include public domain root, public `/ops`, public `/config.js`,
  `ops-by-id` lookalikes, exact-source prefix/protocol lookalikes,
  domain-source paths, external test paths, relative local-domain reaches, and
  source strings.

## Current Inventory Source

Parser inventory over
`mods/mod-swooper-maps/src/recipes` and
`mods/mod-swooper-maps/src/maps` found:

- 240 scanned TS/TSX/JSON files;
- 234 current-predicate `.ts` files and 0 `.tsx` files;
- 6 generated map files inside the current predicate;
- 0 forbidden alias import/re-export candidates;
- 125 domain-alias import declarations;
- 0 side-effect import declarations and 0 forbidden side-effect import
  candidates;
- 83 public domain-root references;
- 12 public `/ops` references;
- 30 public `/config.js` references;
- 2 map-local test files and 0 recipe-local test files;
- 6 relative local-domain reaches outside this alias-based rule;
- 0 parse diagnostics.

The six relative local-domain reaches are:

- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features/steps/plan-vegetation/index.ts:5`;
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features/steps/plan-wetlands/index.ts:5`;
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/steps/climateRefine.ts:18`;
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/river-adjacency.ts:1`;
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/plan-resources/planning.ts:6`;
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/plan-resources/planning.ts:17`.

These relative reaches are not `@mapgen/domain/...` specifiers, so this row
cannot claim complete public-surface enforcement. They remain sibling guard or
accepted non-claim input.

## Design Consequences

1. Native `ops-by-id` import and re-export behavior is repaired for this
   checkpoint, with lookalike negatives.
2. Bare side-effect imports from forbidden deep domain sources now report
   through `import_statement(source=...)`, with source-prefix/protocol controls.
3. Type-only imports and type-only named re-exports from forbidden source
   families are current-predicate positives.
4. Recipe/map-local test paths are included by the current predicate; external
   `test/**` paths are out of scope for this row.
5. `.tsx` is in current predicate and registry scope, though no live `.tsx`
   recipe/map files currently exist.
6. Generated map files are scanned by the predicate and inventory, but they are
   protected read-only evidence and are not authored fixture or injected probe
   targets.
7. Apply remediation stays in
   `habitat-grit-apply-deep-import-public-surface-proof`.
8. Current wrapper/current-tree, explicit empty baseline, and row-specific
   side-effect injected proof are recorded by `DDI-PER-RULE-SELECTOR-2026-06-16`,
   `DDI-HABITAT-GRIT-TOOL-2026-06-16`, `DDI-BASELINE-FILES-2026-06-16`, and
   `DDI-INJECTED-PROBE-2026-06-16`.
9. Raw direct Grit acquisition remains `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`;
   generated-output remediation, relative local-domain reach disposition, apply
   safety, retired parity, broader public-surface closure, and product/runtime
   proof remain non-claims.
