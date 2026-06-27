# Prohibit Morphology Overlay Implementation Reads

Subject ID: `prohibit_morphology_overlay_implementation_reads`

Title: Prohibit Morphology Overlay Implementation Reads

Blueprint: `morphology-domain`

Primary category: `boundary`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/morphology-domain/boundary/check/prohibit_morphology_overlay_implementation_reads`

Files:
- `prohibit_morphology_overlay_implementation_reads.baseline.json`
- `prohibit_morphology_overlay_implementation_reads.pattern.md`
- `prohibit_morphology_overlay_implementation_reads.rule.json`

Evidence: The pattern forbids overlay implementation reads in morphology non-contract step files. Morphology implementations should not depend on overlay implementation internals.

Notes:
- Moved from `contract` to `boundary` because the pattern forbids morphology implementations from reaching overlay implementation ownership.
