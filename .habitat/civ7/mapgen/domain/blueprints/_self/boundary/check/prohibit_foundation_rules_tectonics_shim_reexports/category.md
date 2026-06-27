# Prohibit Foundation Rules Tectonics Shim Reexports

Subject ID: `prohibit_foundation_rules_tectonics_shim_reexports`

Title: Prohibit Foundation Rules Tectonics Shim Reexports

Blueprint: `_self`

Primary category: `boundary`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/prohibit_foundation_rules_tectonics_shim_reexports`

Files:
- `prohibit_foundation_rules_tectonics_shim_reexports.baseline.json`
- `prohibit_foundation_rules_tectonics_shim_reexports.pattern.md`
- `prohibit_foundation_rules_tectonics_shim_reexports.rule.json`

Evidence: The pattern forbids rules re-exporting shared lib/tectonics modules. Rules folders should own local rule surfaces instead of acting as shims over shared tectonics modules.

Notes:
- Extracted from aggregate/profile authority; categorized as `boundary` because the pattern forbids re-export shims over another owner.
