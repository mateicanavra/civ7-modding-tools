# Prohibit Root Config Facade Imports In Domain Ops

Subject ID: `domain-ops-root-config`

Title: Prohibit Root Config Facade Imports In Domain Ops

Blueprint: `domain-operation`

Primary category: `execution`

Secondary categories: `boundary`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/domain-ops-root-config`

Files:
- `domain-ops-root-config.baseline.json`
- `domain-ops-root-config.pattern.md`
- `domain-ops-root-config.rule.json`
- `domain-ops-root-config.rule.mjs`

Evidence: The pattern prevents runtime ops from reaching root config facades instead of receiving normalized config.

Notes:
- Primary purpose is keeping normalization out of runtime handlers.
