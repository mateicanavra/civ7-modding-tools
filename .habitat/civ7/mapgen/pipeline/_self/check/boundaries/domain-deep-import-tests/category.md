# domain-deep-import-tests

Primary category: `boundaries`

Secondary categories: none

Lifecycle: `steady`

Admission: `admitted`

Niche: `civ7/mapgen/pipeline`

Artifact kind: `check`

Files:
- `domain-deep-import-tests.baseline.json`
- `domain-deep-import-tests.check.mjs`
- `domain-deep-import-tests.rule.json`

Evidence: The check prevents package tests from deep-importing domain internals except public domain/ops/config surfaces.

Notes:
- Test-specific scan, same ownership seam as production code.
