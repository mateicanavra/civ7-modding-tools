# rng-authority-static

Primary category: `domain-policy`

Secondary categories: `execution-context`

Lifecycle: `steady`

Admission: `admitted`

Niche: `civ7/mapgen/pipeline`

Artifact kind: `check`

Files:
- `rng-authority-static.baseline.json`
- `rng-authority-static.check.mjs`
- `rng-authority-static.pattern.md`
- `rng-authority-static.rule.json`
- `rng-authority-static.rule.mjs`

Evidence: The check forbids ambient RNG, official generators, Math.random, and internal core RNG helpers in authored generation.

Notes:
- none
