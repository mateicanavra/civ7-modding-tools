# Require Public Domain Surfaces In Tests

Subject ID: `require_public_domain_surfaces_in_tests`

Title: Require Public Domain Surfaces In Tests

Blueprint: `domain-public-surface`

Primary category: `boundary`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_public_domain_surfaces_in_tests`

Files:
- `require_public_domain_surfaces_in_tests.baseline.json`
- `require_public_domain_surfaces_in_tests.check.mjs`
- `require_public_domain_surfaces_in_tests.rule.json`

Evidence: The check prevents package tests from deep-importing domain internals except public domain/ops/config surfaces.

Notes:
- Residual owner class: package-local validator; test import surface policy is retained as a test/package boundary validator.
- Test-specific scan, same ownership seam as production code.
