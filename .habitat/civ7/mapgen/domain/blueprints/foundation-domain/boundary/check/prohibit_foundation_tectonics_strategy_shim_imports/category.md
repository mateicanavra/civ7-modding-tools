# Prohibit Foundation Tectonics Strategy Shim Imports

Subject ID: `prohibit_foundation_tectonics_strategy_shim_imports`

Title: Prohibit Foundation Tectonics Strategy Shim Imports

Blueprint: `foundation-domain`

Primary category: `boundary`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/foundation-domain/boundary/check/prohibit_foundation_tectonics_strategy_shim_imports`

Files:
- `prohibit_foundation_tectonics_strategy_shim_imports.baseline.json`
- `prohibit_foundation_tectonics_strategy_shim_imports.pattern.md`
- `prohibit_foundation_tectonics_strategy_shim_imports.rule.json`

Evidence: The pattern forbids direct imports of shared lib/tectonics shims. Decomposed tectonics strategies must consume local rules rather than shared shim modules.

Notes:
- Moved from `contract` to `boundary` because the pattern forbids direct imports into retired/shared shim owners.
