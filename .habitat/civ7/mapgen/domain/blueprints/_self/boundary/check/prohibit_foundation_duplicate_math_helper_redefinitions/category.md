# Prohibit Foundation Duplicate Math Helper Redefinitions

Subject ID: `prohibit_foundation_duplicate_math_helper_redefinitions`

Title: Prohibit Foundation Duplicate Math Helper Redefinitions

Blueprint: `_self`

Primary category: `boundary`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/prohibit_foundation_duplicate_math_helper_redefinitions`

Files:
- `prohibit_foundation_duplicate_math_helper_redefinitions.baseline.json`
- `prohibit_foundation_duplicate_math_helper_redefinitions.pattern.md`
- `prohibit_foundation_duplicate_math_helper_redefinitions.rule.json`

Evidence: The pattern forbids duplicate clamp/math helper function declarations. Canonical math helpers should live in the owned shared surface rather than being redeclared across tectonics modules.

Notes:
- Extracted from `enforce_domain_refactor_boundary_profile`; kept in `boundary` because the pattern enforces helper ownership rather than a contract field shape.
