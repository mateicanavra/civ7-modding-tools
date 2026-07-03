# Require Domain Ops Root Presence

Subject ID: `require_domain_ops_root_presence`

Title: Require Domain Ops Root Presence

Blueprint: `domain-operation`

Primary category: `structure`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/domain-operation/structure/check/require_domain_ops_root_presence`

Files:
- `require_domain_ops_root_presence.baseline.json`
- `require_domain_ops_root_presence.rule.json`
- `require_domain_ops_root_presence.structure.toml`

Evidence: The structure check forbids missing ops roots for explicitly migrated domains. Migrated domains expose operation bundles through an owned ops root.

Notes:
- Split out of `enforce_domain_refactor_boundary_profile`; categorized as `structure` because it only checks file-tree operation roots.
