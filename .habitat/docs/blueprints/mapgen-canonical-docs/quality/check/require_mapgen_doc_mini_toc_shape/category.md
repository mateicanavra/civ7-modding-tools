# Require MapGen Doc Mini Toc Shape

Subject ID: `require_mapgen_doc_mini_toc_shape`

Title: Require MapGen Doc Mini Toc Shape

Blueprint: `mapgen-canonical-docs`

Primary category: `quality`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/docs/blueprints/mapgen-canonical-docs/quality/check/require_mapgen_doc_mini_toc_shape`

Files:
- `require_mapgen_doc_mini_toc_shape.baseline.json`
- `require_mapgen_doc_mini_toc_shape.pattern.md`
- `require_mapgen_doc_mini_toc_shape.rule.json`

Evidence: Grit owns the Markdown source-shape predicate that canonical MapGen docs start with the mini XML `<toc>` block.

Notes:
- Anchor target existence and reference warning policy remain in the residual docs validator.
