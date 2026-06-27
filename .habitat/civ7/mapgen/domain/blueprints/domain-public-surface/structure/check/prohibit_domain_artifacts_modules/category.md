# Prohibit Domain Artifacts Modules

Subject ID: `prohibit_domain_artifacts_modules`

Title: Prohibit Domain Artifacts Modules

Blueprint: `domain-public-surface`

Primary category: `structure`

Secondary categories: `artifact`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/domain-public-surface/structure/check/prohibit_domain_artifacts_modules`

Files:
- `prohibit_domain_artifacts_modules.baseline.json`
- `prohibit_domain_artifacts_modules.rule.json`
- `prohibit_domain_artifacts_modules.structure.toml`

Evidence: The structure check forbids artifacts.ts modules under domain source. Domain artifact catalogs are retired in favor of owned public domain surfaces.

Notes:
- Split out of domain aggregate cleanup; categorized as `structure` because it checks retired file placement in the domain tree.
