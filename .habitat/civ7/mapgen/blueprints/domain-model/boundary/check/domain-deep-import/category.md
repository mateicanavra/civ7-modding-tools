# domain-deep-import

Blueprint: `domain-model`

Primary category: `boundary`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/blueprints/domain-model/boundary/check/domain-deep-import`

Files:
- `domain-deep-import.apply.pattern.md`
- `domain-deep-import.baseline.json`
- `domain-deep-import.pattern.md`
- `domain-deep-import.rule.json`
- `domain-deep-import.rule.mjs`

Evidence: The pattern prevents recipe and map source from importing deep domain internals instead of public domain surfaces.

Notes:
- Contains an apply pattern too; future operation metadata may split the fixer from the check.
