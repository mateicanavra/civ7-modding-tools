# domain-ops-root-config

Primary category: `execution-context`

Secondary categories: `boundaries`

Lifecycle: `steady`

Admission: `admitted`

Niche: `civ7/mapgen/pipeline`

Artifact kind: `check`

Files:
- `domain-ops-root-config.baseline.json`
- `domain-ops-root-config.pattern.md`
- `domain-ops-root-config.rule.json`
- `domain-ops-root-config.rule.mjs`

Evidence: The pattern prevents runtime ops from reaching root config facades instead of receiving normalized config.

Notes:
- Primary purpose is keeping normalization out of runtime handlers.
