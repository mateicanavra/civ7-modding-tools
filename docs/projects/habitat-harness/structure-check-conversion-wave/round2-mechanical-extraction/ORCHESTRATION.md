# Round 2 Mechanical Extraction Orchestration

## Objective

Execute the prepared mechanical extraction corpus without reclassifying it.
The controlling source is
`docs/projects/habitat-harness/structure-check-conversion-wave/mechanical-extraction-inputs.jsonl`.

The closure claim is narrow: every one of the 74 prepared assertion rows is
implemented, retained with an honest residual owner, deleted/demoted, or
explicitly blocked with a recorded reason.

## Source Order

1. User direction for Round 2 mechanical extraction.
2. `.habitat/.active/frames/FRAME.md`.
3. `.habitat/AUTHORITY-TOOL-SEPARATION.md`.
4. `N-OF-1-WORKFLOW.md`.
5. `MECHANICAL-EXTRACTION-PREP.md`.
6. `mechanical-extraction-inputs.jsonl`.
7. Direct packet files and current source.

## Lanes

- `domain-aggregate`: `enforce_domain_refactor_boundary_profile`, 35 rows.
- `foundation-contracts`: `preserve_decomposed_foundation_contract_surfaces`, 16 rows.
- `morphology-overlay`: `preserve_morphology_contracts_and_overlay_ownership`, 14 rows.
- `domain-config-catalog`: `require_owned_domain_config_catalog_surfaces`, 4 rows.
- `docs-reference`: `validate_mapgen_docs_anchors_and_references`, 5 rows.

## Owner Boundaries

- `grit-check`: source, Markdown, import/export, call, identifier, and token
  shape.
- `structure-check`: current-tree file/directory topology expressible in TOML
  v1 only.
- `existing-rule`: duplicate authority removed only after the companion proof
  passes.
- `package-local-validator`: runtime, generated-output, currentness,
  API/package semantics, docs reference resolution, and warning policy.
- `delete-demote`: residue removed with an explicit reason.

## Deletion Gate

A command branch can be removed only after its assertion row has a proven
destination or an explicit `delete-demote` disposition. A `.check.*` script may
be deleted only when every assertion branch inside it has been removed,
converted, delegated, or retained as an honest residual.

## Shared Files

The orchestrator owns global docs, regenerated analytics, proof/review ledgers,
and final closure notes. Lane workers should report required shared-doc updates
instead of editing them directly.
