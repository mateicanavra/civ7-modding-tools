# Enforce Adapter-Only Base-Standard Imports

Subject ID: `enforce_adapter_only_base_standard_imports`

Title: Enforce Adapter-Only Base-Standard Imports

Blueprint: `civ7-adapter`

Primary category: `boundary`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/platform/blueprints/civ7-adapter/boundary/check/enforce_adapter_only_base_standard_imports`

Files:
- `enforce_adapter_only_base_standard_imports.baseline.json`
- `enforce_adapter_only_base_standard_imports.pattern.md`
- `enforce_adapter_only_base_standard_imports.rule.json`
- `enforce_adapter_only_base_standard_imports.rule.mjs`

Evidence: The pattern confines runtime base-standard imports to the adapter package.

Notes:
- Overlaps with block_unapproved_base_standard_boundary_leaks; likely consolidation candidate.
