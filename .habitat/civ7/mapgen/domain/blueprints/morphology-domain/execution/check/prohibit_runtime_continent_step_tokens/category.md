# Prohibit Runtime Continent Step Tokens

Subject ID: `prohibit_runtime_continent_step_tokens`

Title: Prohibit Runtime Continent Step Tokens

Blueprint: `morphology-domain`

Primary category: `execution`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/morphology-domain/execution/check/prohibit_runtime_continent_step_tokens`

Files:
- `prohibit_runtime_continent_step_tokens.baseline.json`
- `prohibit_runtime_continent_step_tokens.pattern.md`
- `prohibit_runtime_continent_step_tokens.rule.json`

Evidence: The pattern forbids runtime continent identifiers and markLandmassId calls in morphology or hydrology implementation files. Morphology and hydrology stages consume canonical artifacts instead of direct runtime continent marking.

Notes:
- Moved from `contract` to `execution` because the pattern forbids direct runtime continent/landmass marking in stage implementation flow.
