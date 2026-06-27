# Prohibit Foundation Tectonics Rules Reexport Shims

Subject ID: `prohibit_foundation_tectonics_rules_reexport_shims`

Title: Prohibit Foundation Tectonics Rules Reexport Shims

Blueprint: `foundation-domain`

Primary category: `boundary`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/foundation-domain/boundary/check/prohibit_foundation_tectonics_rules_reexport_shims`

Files:
- `prohibit_foundation_tectonics_rules_reexport_shims.baseline.json`
- `prohibit_foundation_tectonics_rules_reexport_shims.pattern.md`
- `prohibit_foundation_tectonics_rules_reexport_shims.rule.json`

Evidence: The pattern forbids rules indexes re-exporting shared lib/tectonics modules as shims. Decomposed tectonics rule indexes must own local rule surfaces.

Notes:
- Moved from `contract` to `boundary` because the pattern is a re-export ownership rule, not a surface-shape predicate.
