# Require Owned Domain Config Catalog Surfaces

Subject ID: `domain-config-catalogs`

Title: Require Owned Domain Config Catalog Surfaces

Blueprint: `domain-config-surface`

Primary category: `contract`

Secondary categories: `structure`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/domain-config-surface/contract/check/domain-config-catalogs`

Files:
- `domain-config-catalogs.baseline.json`
- `domain-config-catalogs.check.mjs`
- `domain-config-catalogs.rule.json`

Evidence: The check constrains domain config facade exports and catalog naming/placement for owned config surfaces.

Notes:
- Mixed contract and structure; category is contracts because the config/catalog surface is the oracle.
