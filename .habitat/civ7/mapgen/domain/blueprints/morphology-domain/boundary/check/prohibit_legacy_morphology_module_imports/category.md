# Prohibit Legacy Morphology Module Imports

Subject ID: `prohibit_legacy_morphology_module_imports`

Title: Prohibit Legacy Morphology Module Imports

Blueprint: `morphology-domain`

Primary category: `boundary`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/morphology-domain/boundary/check/prohibit_legacy_morphology_module_imports`

Files:
- `prohibit_legacy_morphology_module_imports.baseline.json`
- `prohibit_legacy_morphology_module_imports.pattern.md`
- `prohibit_legacy_morphology_module_imports.rule.json`

Evidence: The pattern forbids imports or source references to retired morphology module paths. Retired morphology module paths must stay removed after morphology contracts moved to canonical public surfaces.

Notes:
- Moved from `contract` to `boundary` because the pattern is an import/source ownership rule for retired morphology module paths.
