# Prohibit Foundation Tectonics Strategy Nonlocal Imports

Subject ID: `prohibit_foundation_tectonics_strategy_nonlocal_imports`

Title: Prohibit Foundation Tectonics Strategy Nonlocal Imports

Blueprint: `foundation-domain`

Primary category: `boundary`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/foundation-domain/boundary/check/prohibit_foundation_tectonics_strategy_nonlocal_imports`

Files:
- `prohibit_foundation_tectonics_strategy_nonlocal_imports.baseline.json`
- `prohibit_foundation_tectonics_strategy_nonlocal_imports.pattern.md`
- `prohibit_foundation_tectonics_strategy_nonlocal_imports.rule.json`

Evidence: The pattern forbids strategy imports outside core authoring, ../contract.js, and ../rules/*. Decomposed tectonics strategies must stay local to their contract and rule surfaces.

Notes:
- Moved from `contract` to `boundary` because the pattern is an import-owner rule for strategy modules.
