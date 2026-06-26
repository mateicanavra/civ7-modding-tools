# Ensure Studio Worker Bundle Is Browser-Safe

Subject ID: `ensure_studio_worker_bundle_is_browser_safe`

Title: Ensure Studio Worker Bundle Is Browser-Safe

Blueprint: `ensure_studio_worker_bundle_is_browser_safe`

Primary category: `execution`

Secondary categories: `artifact`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/studio/blueprints/ensure_studio_worker_bundle_is_browser_safe/execution/check/ensure_studio_worker_bundle_is_browser_safe`

Files:
- `ensure_studio_worker_bundle_is_browser_safe.baseline.json`
- `ensure_studio_worker_bundle_is_browser_safe.check.mjs`
- `ensure_studio_worker_bundle_is_browser_safe.rule.json`

Evidence: The check ensures the built browser worker bundle does not contain Node, base-standard, or runtime-only symbols.

Notes:
- none
