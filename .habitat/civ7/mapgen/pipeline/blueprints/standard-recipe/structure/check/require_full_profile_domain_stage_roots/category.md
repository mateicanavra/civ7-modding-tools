# Require Full Profile Domain Stage Roots

Subject ID: `require_full_profile_domain_stage_roots`

Title: Require Full Profile Domain Stage Roots

Blueprint: `standard-recipe`

Primary category: `structure`

Secondary categories: `execution`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/structure/check/require_full_profile_domain_stage_roots`

Files:
- `require_full_profile_domain_stage_roots.baseline.json`
- `require_full_profile_domain_stage_roots.rule.json`
- `require_full_profile_domain_stage_roots.structure.toml`

Evidence: The structure check forbids missing runtime stage roots for full-profile migrated domains. Full-profile domain topology depends on the explicit standard recipe stage roots that are wired in this stack.

Notes:
- Split out of full-profile domain cleanup; categorized as `structure` because it checks stage root directories only.
