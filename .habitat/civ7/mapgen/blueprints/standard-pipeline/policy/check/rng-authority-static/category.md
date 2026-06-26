# rng-authority-static

Blueprint: `standard-pipeline`

Primary category: `policy`

Secondary categories: `execution`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/blueprints/standard-pipeline/policy/check/rng-authority-static`

Files:
- `rng-authority-static.baseline.json`
- `rng-authority-static.check.mjs`
- `rng-authority-static.pattern.md`
- `rng-authority-static.rule.json`
- `rng-authority-static.rule.mjs`

Evidence: The check forbids ambient RNG, official generators, Math.random, and internal core RNG helpers in authored generation.

Notes:
- none
