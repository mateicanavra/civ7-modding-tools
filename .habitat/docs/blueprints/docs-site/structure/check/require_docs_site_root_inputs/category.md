# Require Docs Site Root Inputs

Subject ID: `require_docs_site_root_inputs`

Title: Require Docs Site Root Inputs

Blueprint: `docs-site`

Primary category: `structure`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/docs/blueprints/docs-site/structure/check/require_docs_site_root_inputs`

Files:
- `require_docs_site_root_inputs.baseline.json`
- `require_docs_site_root_inputs.rule.json`
- `require_docs_site_root_inputs.structure.toml`

Evidence: The structure rule keeps the docs-site root files present without owning parsed Mintlify navigation semantics.

Notes:
- Split from `validate_docs_site_config_inputs`; `docs.json` semantic validation remains command-check.
