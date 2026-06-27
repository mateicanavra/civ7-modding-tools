# Validate Docs Site Config Inputs

Subject ID: `validate_docs_site_config_inputs`

Title: Validate Docs Site Config Inputs

Blueprint: `docs-site`

Primary category: `contract`

Secondary categories: `quality`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/docs/blueprints/docs-site/contract/check/validate_docs_site_config_inputs`

Files:
- `validate_docs_site_config_inputs.baseline.json`
- `validate_docs_site_config_inputs.check.ts`
- `validate_docs_site_config_inputs.rule.json`

Evidence: The check validates docs-site `docs.json` publication navigation semantics.

Notes:
- Root file presence moved to `require_docs_site_root_inputs`.
