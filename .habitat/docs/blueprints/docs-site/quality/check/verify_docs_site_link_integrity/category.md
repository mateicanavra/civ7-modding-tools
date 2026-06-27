# Verify Docs Site Link Integrity

Subject ID: `verify_docs_site_link_integrity`

Title: Verify Docs Site Link Integrity

Blueprint: `docs-site`

Primary category: `quality`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/docs/blueprints/docs-site/quality/check/verify_docs_site_link_integrity`

Files:
- `verify_docs_site_link_integrity.baseline.json`
- `verify_docs_site_link_integrity.check.ts`
- `verify_docs_site_link_integrity.rule.json`

Evidence: The check runs docs-site link validation over a temporary pages-only copy.

Notes:
- Residual owner class: docs validator; link integrity is docs runtime/content validation.
- none
