# Prohibit Unknown Bag Config Usage

Subject ID: `prohibit_unknown_bag_config_usage`

Title: Prohibit Unknown Bag Config Usage

Blueprint: `_self`

Primary category: `contract`

Secondary categories: `quality`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/_self/contract/check/prohibit_unknown_bag_config_usage`

Files:
- `prohibit_unknown_bag_config_usage.baseline.json`
- `prohibit_unknown_bag_config_usage.pattern.md`
- `prohibit_unknown_bag_config_usage.rule.json`

Evidence: The pattern forbids UnknownRecord and INTERNAL_METADATA_KEY in domain source. Domain config should stay typed and explicit rather than relying on unknown bag metadata escape hatches.

Notes:
- Moved from `boundary` to `contract` because the pattern protects typed domain config surfaces from unknown-bag escape hatches.
