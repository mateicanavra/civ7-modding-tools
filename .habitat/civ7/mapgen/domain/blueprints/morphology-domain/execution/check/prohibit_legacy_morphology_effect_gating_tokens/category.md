# Prohibit Legacy Morphology Effect Gating Tokens

Subject ID: `prohibit_legacy_morphology_effect_gating_tokens`

Title: Prohibit Legacy Morphology Effect Gating Tokens

Blueprint: `morphology-domain`

Primary category: `execution`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/morphology-domain/execution/check/prohibit_legacy_morphology_effect_gating_tokens`

Files:
- `prohibit_legacy_morphology_effect_gating_tokens.baseline.json`
- `prohibit_legacy_morphology_effect_gating_tokens.pattern.md`
- `prohibit_legacy_morphology_effect_gating_tokens.rule.json`

Evidence: The pattern forbids old landmassApplied and coastlinesApplied effect gating tokens in morphology stages and standard tags. Morphology stages should use current typed effect gates rather than retired engine landmass/coastline gates.

Notes:
- Moved from `contract` to `execution` because the pattern forbids retired engine effect-gate tokens in stage runtime flow.
