# Prohibit Domain Entrypoint Self Reexports

Subject ID: `prohibit_domain_entrypoint_self_reexports`

Title: Prohibit Domain Entrypoint Self Reexports

Blueprint: `_self`

Primary category: `boundary`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/prohibit_domain_entrypoint_self_reexports`

Files:
- `prohibit_domain_entrypoint_self_reexports.baseline.json`
- `prohibit_domain_entrypoint_self_reexports.pattern.md`
- `prohibit_domain_entrypoint_self_reexports.rule.json`

Evidence: The pattern forbids domain entrypoints re-exporting deep @mapgen/domain surfaces. Domain roots are public surfaces and should not launder deep domain paths back through themselves.

Notes:
- Extracted from `enforce_domain_refactor_boundary_profile`; kept in `boundary` because the pattern forbids public roots from laundering deep domain ownership.
