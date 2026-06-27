# Require Ecology Canonical Op Module Topology

Subject ID: `require_ecology_canonical_op_module_topology`

Title: Require Ecology Canonical Op Module Topology

Blueprint: `ecology-domain`

Primary category: `structure`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/ecology-domain/structure/check/require_ecology_canonical_op_module_topology`

Files:
- `require_ecology_canonical_op_module_topology.baseline.json`
- `require_ecology_canonical_op_module_topology.rule.json`
- `require_ecology_canonical_op_module_topology.structure.toml`

Evidence: The structure check forbids ecology op modules missing canonical topology direct children. Ecology is the canonical exemplar for decomposed op module topology; support directories, schema quality, and JSDoc quality remain outside structure-check.

Notes:
- Split out of ecology cleanup; categorized as `structure` because TOML owns only current file-tree topology, not schema/JSDoc quality.
- `score-shared` is support, not an op module root. Strategy-only op families are canonical without local `rules/` or `types.ts`.
