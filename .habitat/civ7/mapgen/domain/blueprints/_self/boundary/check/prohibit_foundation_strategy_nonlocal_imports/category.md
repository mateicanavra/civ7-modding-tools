# Prohibit Foundation Strategy Nonlocal Imports

Subject ID: `prohibit_foundation_strategy_nonlocal_imports`

Title: Prohibit Foundation Strategy Nonlocal Imports

Blueprint: `_self`

Primary category: `boundary`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/prohibit_foundation_strategy_nonlocal_imports`

Files:
- `prohibit_foundation_strategy_nonlocal_imports.baseline.json`
- `prohibit_foundation_strategy_nonlocal_imports.pattern.md`
- `prohibit_foundation_strategy_nonlocal_imports.rule.json`

Evidence: The pattern forbids strategy imports outside @swooper/mapgen-core/authoring, ../contract.js, and ../rules/*. Foundation strategy modules should stay local to their op module contracts and rules.

Notes:
- Categorized as `boundary` because the pattern is an import-owner rule for decomposed strategies.
