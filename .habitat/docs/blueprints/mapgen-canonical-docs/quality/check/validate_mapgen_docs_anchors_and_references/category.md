# Validate MapGen Docs Anchor Targets And Reference Warnings

Subject ID: `validate_mapgen_docs_anchors_and_references`

Title: Validate MapGen Docs Anchor Targets And Reference Warnings

Blueprint: `mapgen-canonical-docs`

Primary category: `quality`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/docs/blueprints/mapgen-canonical-docs/quality/check/validate_mapgen_docs_anchors_and_references`

Files:
- `validate_mapgen_docs_anchors_and_references.baseline.json`
- `validate_mapgen_docs_anchors_and_references.check.py`
- `validate_mapgen_docs_anchors_and_references.rule.json`

Evidence: The residual check validates repo-relative anchor target existence and reference warning policy for MapGen docs.

Notes:
- This is docs quality and navigability, not a MapGen-specific category.
- Markdown shape predicates for the mini XML `<toc>` and `## Ground truth anchors` heading now live in narrow Grit packets.
