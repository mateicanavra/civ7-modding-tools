# Prohibit Foundation Strategy Shared Tectonics Lib Imports

Subject ID: `prohibit_foundation_strategy_shared_tectonics_lib_imports`

Title: Prohibit Foundation Strategy Shared Tectonics Lib Imports

Blueprint: `_self`

Primary category: `boundary`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/prohibit_foundation_strategy_shared_tectonics_lib_imports`

Files:
- `prohibit_foundation_strategy_shared_tectonics_lib_imports.baseline.json`
- `prohibit_foundation_strategy_shared_tectonics_lib_imports.pattern.md`
- `prohibit_foundation_strategy_shared_tectonics_lib_imports.rule.json`

Evidence: The pattern forbids direct shared lib/tectonics imports from strategy modules. Shared tectonics logic should be mediated through local op rules/modules, not imported directly by decomposed strategies.

Notes:
- Extracted from aggregate/profile authority; kept in `boundary` because the pattern forbids direct imports into shared tectonics implementation.
