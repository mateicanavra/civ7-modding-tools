# Docs / Platform / Resources Lane

Status: implemented the docs root-input structure split and rejected false
structure candidates.

Implemented:
- `require_docs_site_root_inputs`: structure-check split from `validate_docs_site_config_inputs`.

Retained:
- `validate_docs_site_config_inputs` keeps parsed `docs.json` navigation semantics.
- `validate_mapgen_docs_anchors_and_references` remains docs reference validation with known red references.
- `validate_boundary_taxonomy_against_workspace_graph` remains graph/taxonomy validation.
- Platform/resource boundary and provenance checks stay out of structure-check.

Proof is recorded in `proof-ledger.md`.
