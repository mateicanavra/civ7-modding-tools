# Prohibit Hydrology Map Config Key Tokens

Subject ID: `prohibit_hydrology_map_config_key_tokens`

Title: Prohibit Hydrology Map Config Key Tokens

Blueprint: `_self`

Primary category: `contract`

Secondary categories: `structure`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/_self/contract/check/prohibit_hydrology_map_config_key_tokens`

Files:
- `prohibit_hydrology_map_config_key_tokens.baseline.json`
- `prohibit_hydrology_map_config_key_tokens.pattern.md`
- `prohibit_hydrology_map_config_key_tokens.rule.json`

Evidence: The pattern forbids legacy hydrology climate, lakes, and rivers config keys in maps. Hydrology map configuration should use the current step/public config shape rather than retired bag keys.

Notes:
- Moved from `boundary` to `contract` because the pattern protects current hydrology map config surfaces from retired bag keys.
