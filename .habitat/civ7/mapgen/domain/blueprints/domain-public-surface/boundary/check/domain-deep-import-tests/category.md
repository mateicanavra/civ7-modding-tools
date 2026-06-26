# domain-deep-import-tests

Blueprint: `domain-public-surface`

Primary category: `boundary`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/domain-deep-import-tests`

Files:
- `domain-deep-import-tests.baseline.json`
- `domain-deep-import-tests.check.mjs`
- `domain-deep-import-tests.rule.json`

Evidence: The check prevents package tests from deep-importing domain internals except public domain/ops/config surfaces.

Notes:
- Test-specific scan, same ownership seam as production code.
