# Prohibit Foundation Stage Cast Merge Hacks

Subject ID: `prohibit_foundation_stage_cast_merge_hacks`

Title: Prohibit Foundation Stage Cast Merge Hacks

Blueprint: `_self`

Primary category: `contract`

Secondary categories: `execution`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/_self/contract/check/prohibit_foundation_stage_cast_merge_hacks`

Files:
- `prohibit_foundation_stage_cast_merge_hacks.baseline.json`
- `prohibit_foundation_stage_cast_merge_hacks.pattern.md`
- `prohibit_foundation_stage_cast_merge_hacks.rule.json`

Evidence: The pattern forbids foundation stage advanced cast/merge fallback hacks. Foundation stage config should use the owned public config shape instead of wrapper-era unknown-object merge fallbacks.

Notes:
- Moved from `boundary` to `contract` because the pattern protects typed foundation stage config surfaces from wrapper-era fallback fragments.
