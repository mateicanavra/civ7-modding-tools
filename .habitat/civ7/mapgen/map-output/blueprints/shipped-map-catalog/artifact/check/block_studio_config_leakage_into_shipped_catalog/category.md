# Block Studio Config Leakage Into Shipped Catalog

Subject ID: `block_studio_config_leakage_into_shipped_catalog`

Title: Block Studio Config Leakage Into Shipped Catalog

Blueprint: `shipped-map-catalog`

Primary category: `artifact`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/map-output/blueprints/shipped-map-catalog/artifact/check/block_studio_config_leakage_into_shipped_catalog`

Files:
- `block_studio_config_leakage_into_shipped_catalog.baseline.json`
- `block_studio_config_leakage_into_shipped_catalog.check.ts`
- `block_studio_config_leakage_into_shipped_catalog.rule.json`

Evidence: The check prevents transient Studio config identifiers from leaking into shipped mod catalog artifacts.

Notes:
- none
