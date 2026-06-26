# Enforce Domain Refactor Boundary Profile

Subject ID: `enforce_domain_refactor_boundary_profile`

Title: Enforce Domain Refactor Boundary Profile

Blueprint: `_self`

Primary category: `boundary`

Secondary categories: `structure`, `policy`

Artifact kind: `check`

Lifecycle: `transition`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/enforce_domain_refactor_boundary_profile`

Files:
- `enforce_domain_refactor_boundary_profile.baseline.json`
- `enforce_domain_refactor_boundary_profile.check.sh`
- `enforce_domain_refactor_boundary_profile.denylist.txt`
- `enforce_domain_refactor_boundary_profile.rule.json`

Evidence: The shell guardrail bundles migrated-domain checks for adapter/context reach, projection, config, cross-domain use, RNG, and module shape.

Notes:
- Aggregate/profile subject; split later into smaller packets if it remains long-lived.
