# Validate MapGen Docs Anchors And References

Subject ID: `mapgen-docs`

Title: Validate MapGen Docs Anchors And References

Blueprint: `mapgen-canonical-docs`

Primary category: `quality`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/docs/blueprints/mapgen-canonical-docs/quality/check/mapgen-docs`

Files:
- `mapgen-docs.baseline.json`
- `mapgen-docs.check.py`
- `mapgen-docs.rule.json`

Evidence: The check validates docs table-of-contents anchors and repo-relative doc references for MapGen docs.

Notes:
- This is docs quality and navigability, not a MapGen-specific category.
