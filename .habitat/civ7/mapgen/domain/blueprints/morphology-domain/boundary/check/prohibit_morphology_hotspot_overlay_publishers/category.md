# Prohibit Morphology Hotspot Overlay Publishers

Subject ID: `prohibit_morphology_hotspot_overlay_publishers`

Title: Prohibit Morphology Hotspot Overlay Publishers

Blueprint: `morphology-domain`

Primary category: `boundary`

Secondary categories: `execution`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/morphology-domain/boundary/check/prohibit_morphology_hotspot_overlay_publishers`

Files:
- `prohibit_morphology_hotspot_overlay_publishers.baseline.json`
- `prohibit_morphology_hotspot_overlay_publishers.pattern.md`
- `prohibit_morphology_hotspot_overlay_publishers.rule.json`

Evidence: The pattern forbids morphology stage source publishing HOTSPOTS story overlays. HOTSPOTS story overlay publishing is narrative-owned and must not leak into morphology stages.

Notes:
- Moved from `contract` to `boundary` because the pattern protects narrative-owned HOTSPOTS overlay publishing from morphology stage ownership.
