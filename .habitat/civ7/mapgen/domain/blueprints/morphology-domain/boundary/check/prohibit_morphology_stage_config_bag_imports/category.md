# Prohibit Morphology Stage Config Bag Imports

Subject ID: `prohibit_morphology_stage_config_bag_imports`

Title: Prohibit Morphology Stage Config Bag Imports

Blueprint: `morphology-domain`

Primary category: `boundary`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/morphology-domain/boundary/check/prohibit_morphology_stage_config_bag_imports`

Files:
- `prohibit_morphology_stage_config_bag_imports.baseline.json`
- `prohibit_morphology_stage_config_bag_imports.pattern.md`
- `prohibit_morphology_stage_config_bag_imports.rule.json`

Evidence: The pattern forbids @mapgen/domain/config in morphology stage files. Morphology stage source should consume typed contract and artifact surfaces instead of the legacy domain config bag.

Notes:
- Moved from `contract` to `boundary` because the pattern forbids stage source from importing the domain config bag owner.
