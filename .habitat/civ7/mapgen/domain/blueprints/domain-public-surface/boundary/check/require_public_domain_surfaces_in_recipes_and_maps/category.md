# Require Public Domain Surfaces In Recipes And Maps

Subject ID: `require_public_domain_surfaces_in_recipes_and_maps`

Title: Require Public Domain Surfaces In Recipes And Maps

Blueprint: `domain-public-surface`

Primary category: `boundary`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_public_domain_surfaces_in_recipes_and_maps`

Files:
- `require_public_domain_surfaces_in_recipes_and_maps.apply.pattern.md`
- `require_public_domain_surfaces_in_recipes_and_maps.baseline.json`
- `require_public_domain_surfaces_in_recipes_and_maps.pattern.md`
- `require_public_domain_surfaces_in_recipes_and_maps.rule.json`

Evidence: The pattern prevents recipe and map source from importing deep domain internals instead of public domain surfaces.

Notes:
- Contains an apply pattern too; future operation metadata may split the fixer from the check.
