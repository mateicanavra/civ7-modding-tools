# Ensure Map-Policy Dependency Independence

Subject ID: `ensure_map_policy_dependency_independence`

Title: Ensure Map-Policy Dependency Independence

Blueprint: `civ7-map-policy`

Primary category: `boundary`

Secondary categories: `artifact`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/resources/blueprints/civ7-map-policy/boundary/check/ensure_map_policy_dependency_independence`

Files:
- `ensure_map_policy_dependency_independence.baseline.json`
- `ensure_map_policy_dependency_independence.check.ts`
- `ensure_map_policy_dependency_independence.rule.json`

Evidence: The check keeps civ7-map-policy independent from adapter, MapGen, mods, Studio, and base-standard dependencies.

Notes:
- Residual owner class: future owner gap; pure import-boundary predicate should become Grit or a generic import-boundary owner.
- none
