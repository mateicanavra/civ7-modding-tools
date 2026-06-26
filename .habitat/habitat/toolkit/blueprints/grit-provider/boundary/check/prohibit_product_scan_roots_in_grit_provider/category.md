# Prohibit Product Scan Roots In Grit Provider

Subject ID: `prohibit_product_scan_roots_in_grit_provider`

Title: Prohibit Product Scan Roots In Grit Provider

Blueprint: `grit-provider`

Primary category: `boundary`

Secondary categories: `execution`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/habitat/toolkit/blueprints/grit-provider/boundary/check/prohibit_product_scan_roots_in_grit_provider`

Files:
- `prohibit_product_scan_roots_in_grit_provider.baseline.json`
- `prohibit_product_scan_roots_in_grit_provider.pattern.md`
- `prohibit_product_scan_roots_in_grit_provider.rule.json`

Evidence: The pattern prevents repo/product scan roots from being hard-coded inside the generic Grit provider.

Notes:
- none
