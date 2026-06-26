# Block Unapproved Base-Standard Boundary Leaks

Subject ID: `block_unapproved_base_standard_boundary_leaks`

Title: Block Unapproved Base-Standard Boundary Leaks

Blueprint: `civ7-adapter`

Primary category: `boundary`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/platform/blueprints/civ7-adapter/boundary/check/block_unapproved_base_standard_boundary_leaks`

Files:
- `block_unapproved_base_standard_boundary_leaks.baseline.json`
- `block_unapproved_base_standard_boundary_leaks.check.sh`
- `block_unapproved_base_standard_boundary_leaks.rule.json`

Evidence: The shell check scans package source for base-standard imports outside civ7-adapter.

Notes:
- Legacy command allowlist overlaps with enforce_adapter_only_base_standard_imports.
