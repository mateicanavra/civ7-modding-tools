# Prohibit Product Scan Roots In Grit Provider

Subject ID: `habitat-provider-domain-paths`

Title: Prohibit Product Scan Roots In Grit Provider

Blueprint: `grit-provider`

Primary category: `boundary`

Secondary categories: `execution`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/habitat/toolkit/blueprints/grit-provider/boundary/check/habitat-provider-domain-paths`

Files:
- `habitat-provider-domain-paths.baseline.json`
- `habitat-provider-domain-paths.pattern.md`
- `habitat-provider-domain-paths.rule.json`

Evidence: The pattern prevents repo/product scan roots from being hard-coded inside the generic Grit provider.

Notes:
- none
