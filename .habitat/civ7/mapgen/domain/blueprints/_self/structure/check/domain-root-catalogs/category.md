# Prohibit Retired Domain Root Catalogs

Subject ID: `domain-root-catalogs`

Title: Prohibit Retired Domain Root Catalogs

Blueprint: `_self`

Primary category: `structure`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `transition`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/_self/structure/check/domain-root-catalogs`

Files:
- `domain-root-catalogs.baseline.json`
- `domain-root-catalogs.pattern.md`
- `domain-root-catalogs.rule.json`
- `domain-root-catalogs.rule.mjs`

Evidence: The pattern forbids retired domain-root tags/artifacts catalog files.

Notes:
- Lifecycle is transition because it prevents a retired structure from returning.
