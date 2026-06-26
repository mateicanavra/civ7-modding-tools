# domain-config-catalogs

Blueprint: `domain-model`

Primary category: `contract`

Secondary categories: `structure`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/blueprints/domain-model/contract/check/domain-config-catalogs`

Files:
- `domain-config-catalogs.baseline.json`
- `domain-config-catalogs.check.mjs`
- `domain-config-catalogs.rule.json`

Evidence: The check constrains domain config facade exports and catalog naming/placement for owned config surfaces.

Notes:
- Mixed contract and structure; category is contracts because the config/catalog surface is the oracle.
