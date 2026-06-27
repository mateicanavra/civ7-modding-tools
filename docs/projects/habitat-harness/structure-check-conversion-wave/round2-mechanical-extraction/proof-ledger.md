# Round 2 Proof Ledger

## Preflight

- Corpus validation: passed. The canonical input has 74 rows, with
  `ready-for-implementation=61`, `ready-for-split-implementation=1`, and
  `ready-to-retain-or-move=12`.
- Lane-slice validation: passed. The five generated lane JSONL files sum to 74
  rows.
- Branch: `codex/habitat-mechanical-extraction-wave`.

## Segment Proofs

| Segment | Rule | Focused Proof | Result | Notes |
| --- | --- | --- | --- | --- |
| domain-aggregate | `enforce_domain_refactor_boundary_profile` | `bun tools/habitat/bin/dev.ts check --rule enforce_domain_refactor_boundary_profile --json` | pass | Residual command script now keeps only the ecology full-profile quality branch. |
| domain-aggregate | new Grit packets | selected focused `--tool grit-check` proofs | pass | Includes domain tag artifact, hydrology, narrative, foundation, RNG, and unknown-bag extractions. |
| domain-aggregate | new structure packets | focused `--tool structure-check` proofs | mixed | `prohibit_domain_artifacts_modules` passes. `require_ecology_canonical_op_module_topology` is intentionally red on current ecology op topology debt. |
| foundation-contracts | `preserve_decomposed_foundation_contract_surfaces` | `bun tools/habitat/bin/dev.ts check --rule preserve_decomposed_foundation_contract_surfaces --json` | pass | Retains only positive package/currentness residuals. |
| foundation-contracts | 11 Grit packets | focused `--tool grit-check` proofs | pass | The earlier broad-token performance concern was resolved by implementing all rows as narrow Habitat Grit packets; no row was demoted for performance. |
| morphology-overlay | `preserve_morphology_contracts_and_overlay_ownership` | `bun tools/habitat/bin/dev.ts check --rule preserve_morphology_contracts_and_overlay_ownership --json` | pass | Retains only package/currentness residuals. |
| morphology-overlay | 12 Grit packets | focused `--tool grit-check` proofs | pass | Reviewer-requested import/call syntax tightening also passes. |
| domain-config-catalog | `require_owned_domain_config_catalog_surfaces` | `bun tools/habitat/bin/dev.ts check --rule require_owned_domain_config_catalog_surfaces --json` | pass | Retains exact positive validator residuals. |
| domain-config-catalog | `prohibit_milestone_prefixed_standard_recipe_tag_catalog_names` | focused `--tool grit-check` proof | pass | One Grit packet intentionally covers both `milestone-prefixed-recipe-tag-catalogs` and `milestone-tag-catalog-name-ban`. |
| docs-reference | `validate_mapgen_docs_anchors_and_references` | `bun tools/habitat/bin/dev.ts check --rule validate_mapgen_docs_anchors_and_references --json` | expected fail | Retained docs-validator residual reports missing anchors and reference warnings. |
| docs-reference | 2 Markdown/Grit packets | focused `--tool grit-check` proofs | pass | Grit owns source-shape/Markdown-shape assertions only. |

## Aggregate Proofs

- `bun tools/habitat/bin/dev.ts check --tool grit-check --json`: passed with
  79 selected rules and no failing rules.
- `bun tools/habitat/bin/dev.ts check --tool structure-check --json`: expected
  fail. The only failing rule is
  `require_ecology_canonical_op_module_topology`, with 42 real current-tree
  topology diagnostics.
- `bun tools/habitat/bin/dev.ts check --tool command-check --json`: expected
  fail on retained/pre-existing non-extraction rows:
  - `verify_studio_recipe_artifacts_are_current`: stale generated/currentness
    artifact check.
  - `validate_mapgen_docs_anchors_and_references`: retained docs anchor/reference
    validator residual.
  - `validate_boundary_taxonomy_against_workspace_graph`: pre-existing module
    resolution failure for `@habitat/cli/resources/paths`.
- execution-surface analytics regeneration: passed. The regenerated map reports
  577 surfaces, 125 `rule-json` records, and 0 `rule-module` records.
- execution-surface JSON parse: passed.
- JSONL ledger parse: passed for the canonical 74-row corpus and all five lane
  slices.
- `bun test tools/habitat/test/rules/registry/contract.test.ts`: passed after
  updating expected registry counts to the new rule totals.
- `bun run --cwd tools/habitat test`: passed, 34 test files and 316 tests.
- `bun run --cwd tools/habitat check`: passed.
- `nx run habitat:build`: passed.
- `git diff --check`: passed.
