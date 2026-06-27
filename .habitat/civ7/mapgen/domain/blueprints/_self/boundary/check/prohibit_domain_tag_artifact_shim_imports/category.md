# Prohibit Domain Tag Artifact Shim Imports

Subject ID: `prohibit_domain_tag_artifact_shim_imports`

Title: Prohibit Domain Tag Artifact Shim Imports

Blueprint: `_self`

Primary category: `boundary`

Secondary categories: `structure`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/prohibit_domain_tag_artifact_shim_imports`

Files:
- `prohibit_domain_tag_artifact_shim_imports.baseline.json`
- `prohibit_domain_tag_artifact_shim_imports.pattern.md`
- `prohibit_domain_tag_artifact_shim_imports.rule.json`

Evidence: The pattern forbids @mapgen/domain/tags and @mapgen/domain/artifacts shim imports. Retired tag and artifact shims should not become public domain ownership again.

Notes:
- Extracted from `enforce_domain_refactor_boundary_profile`; kept in `boundary` because the executable predicate is import/export reach into retired shim owners.
