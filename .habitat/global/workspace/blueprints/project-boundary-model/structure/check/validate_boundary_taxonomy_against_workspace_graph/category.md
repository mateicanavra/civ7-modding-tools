# Validate Boundary Taxonomy Against Workspace Graph

Subject ID: `validate_boundary_taxonomy_against_workspace_graph`

Title: Validate Boundary Taxonomy Against Workspace Graph

Blueprint: `project-boundary-model`

Primary category: `structure`

Secondary categories: `boundary`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/global/workspace/blueprints/project-boundary-model/structure/check/validate_boundary_taxonomy_against_workspace_graph`

Files:
- `validate_boundary_taxonomy_against_workspace_graph.baseline.json`
- `validate_boundary_taxonomy_against_workspace_graph.rule.json`

Evidence: The check audits package manifests, Nx metadata, boundary config, and taxonomy docs for graph/model consistency.

Notes:
- Residual owner class: workspace graph validator. The executable adapter lives in `tools/habitat/scripts/validate-boundary-taxonomy-against-workspace-graph.ts`; this packet is Habitat authority metadata/delegation.
