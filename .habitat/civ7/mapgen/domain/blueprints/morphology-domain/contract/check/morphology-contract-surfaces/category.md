# Preserve Morphology Contracts And Overlay Ownership

Subject ID: `morphology-contract-surfaces`

Title: Preserve Morphology Contracts And Overlay Ownership

Blueprint: `morphology-domain`

Primary category: `contract`

Secondary categories: `structure`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/morphology-domain/contract/check/morphology-contract-surfaces`

Files:
- `morphology-contract-surfaces.baseline.json`
- `morphology-contract-surfaces.check.mjs`
- `morphology-contract-surfaces.rule.json`

Evidence: The check preserves morphology contract surfaces and rejects runtime IDs, overlay leakage, legacy imports, and old config keys.

Notes:
- Domain-specific bundle; later split may separate contract shape from topology cleanup.
