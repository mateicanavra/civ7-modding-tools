# Require Owned Domain Config Catalog Surfaces

Subject ID: `require_owned_domain_config_catalog_surfaces`

Title: Require Owned Domain Config Catalog Surfaces

Blueprint: `domain-config-surface`

Primary category: `contract`

Secondary categories: `structure`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/domain-config-surface/contract/check/require_owned_domain_config_catalog_surfaces`

Files:
- `require_owned_domain_config_catalog_surfaces.baseline.json`
- `require_owned_domain_config_catalog_surfaces.check.mjs`
- `require_owned_domain_config_catalog_surfaces.rule.json`

Evidence: The check constrains domain config facade exports and catalog naming/placement for owned config surfaces.

Notes:
- Mixed contract and structure; category is contracts because the config/catalog surface is the oracle.
