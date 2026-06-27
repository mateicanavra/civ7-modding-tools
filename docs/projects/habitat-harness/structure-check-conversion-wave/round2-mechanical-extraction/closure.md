# Round 2 Closure

Status: closed.

## Target Counts

- Total assertion rows: 74.
- Implementation-ready rows: 61.
- Retained/move-later residuals: 12.
- Inline split rows: 1.

## Final Row Accounting

- `grit-check`: 43 assertion rows implemented as 42 new Grit packets. The
  milestone tag catalog ban is intentionally shared by two rows:
  `milestone-prefixed-recipe-tag-catalogs` and
  `milestone-tag-catalog-name-ban`.
- `structure-check`: 3 prepared rows implemented, plus the topology branch from
  the single inline split. This produced 4 structure-check packets.
- `existing-rule`: 12 duplicate branches removed after companion-owner proof.
- `delete-demote`: 3 branches removed as debt/overlap residue.
- `package-local-validator`: 12 residual rows retained in shrunk command-check
  scripts with honest non-Grit/non-structure ownership.
- `needs-split`: 1 ecology row split. The topology branch moved to
  `structure-check`; the non-topology ecology full-profile quality branch
  remains in the residual domain aggregate command check.

## What Changed

- The five mixed command-check packets were shrunk so they no longer carry
  already-extracted source-shape or topology assertions.
- New Grit packets now own source, Markdown, import/export, call, identifier,
  and token-shape assertions from the corpus.
- New structure-check packets now own pure file-tree topology assertions using
  TOML v1.
- Retained command-check branches now represent package-local/currentness,
  docs-validator, or ecology quality residuals rather than mixed authority.
- Execution-surface analytics were regenerated after the extraction.

## Expected Reds After Closure

- Resolved by the follow-up residual-owner closure pass:
  - `require_ecology_canonical_op_module_topology` is now green.
  - `verify_studio_recipe_artifacts_are_current` was removed from Habitat
    authority and left to package/Nx ownership.
  - `validate_mapgen_docs_anchors_and_references` moved to docs-owned tooling
    and is green.
  - `validate_boundary_taxonomy_against_workspace_graph` moved its executable
    adapter into Habitat Toolkit tooling and is green.

## Closure Boundary

This wave is closed because every row from
`mechanical-extraction-inputs.jsonl` is now implemented, delegated to an
existing owner, deleted/demoted, retained with an honest residual owner, or
split with both branches accounted for.

The next domino is not more extraction for these 74 rows. It is paying down the
remaining residual owner classes: ecology topology debt, docs anchor/reference
validation, Studio artifact currentness, and the boundary taxonomy module
resolution failure.
