# Prohibit Ambient RNG In Authored Generation

Subject ID: `prohibit_ambient_rng_in_authored_generation`

Title: Prohibit Ambient RNG In Authored Generation

Blueprint: `_self`

Primary category: `policy`

Secondary categories: `execution`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/_self/policy/check/prohibit_ambient_rng_in_authored_generation`

Files:
- `prohibit_ambient_rng_in_authored_generation.baseline.json`
- `prohibit_ambient_rng_in_authored_generation.check.mjs`
- `prohibit_ambient_rng_in_authored_generation.pattern.md`
- `prohibit_ambient_rng_in_authored_generation.rule.json`

Evidence: The check forbids ambient RNG, official generators, Math.random, and internal core RNG helpers in authored generation.

Notes:
- none
