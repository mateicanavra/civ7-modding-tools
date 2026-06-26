# Prohibit Root Config Facade Imports In Domain Ops

Subject ID: `prohibit_root_config_facade_imports_in_domain_ops`

Title: Prohibit Root Config Facade Imports In Domain Ops

Blueprint: `domain-operation`

Primary category: `execution`

Secondary categories: `boundary`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_root_config_facade_imports_in_domain_ops`

Files:
- `prohibit_root_config_facade_imports_in_domain_ops.baseline.json`
- `prohibit_root_config_facade_imports_in_domain_ops.pattern.md`
- `prohibit_root_config_facade_imports_in_domain_ops.rule.json`

Evidence: The pattern prevents runtime ops from reaching root config facades instead of receiving normalized config.

Notes:
- Primary purpose is keeping normalization out of runtime handlers.
