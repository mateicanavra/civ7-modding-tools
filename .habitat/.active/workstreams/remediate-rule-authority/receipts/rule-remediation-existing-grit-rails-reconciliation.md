# Rule Remediation: Existing Grit Rails Reconciliation

Status: closed on `codex/habitat-existing-grit-rails-reconciliation`

## Slice

Selected rules:

- `prohibit_foundation_projection_legacy_motion_source`
- `prohibit_morphology_stage_legacy_effect_gates`

Action class: runtime/source validation.

## Decision

No authority-state mutation is required. Both rules were classified as needing
runtime/source validation, but the current packets already use the correct
Habitat/Grit source-check rail over concrete recurrence-risk source scopes.

These are not package-test candidates and not Nx boundary candidates. They
guard source-token recurrence in specific standard-recipe contexts.

## Rule Outcomes

| Rule | Outcome |
| --- | --- |
| `prohibit_foundation_projection_legacy_motion_source` | Retain existing Grit rail over `foundation-projection/steps/projection.ts`; it protects canonical plate-motion artifact consumption from legacy plateGraph motion reads. |
| `prohibit_morphology_stage_legacy_effect_gates` | Retain existing Grit rail over morphology stage source; it protects against retired engine landmass/coastline effect-gate tokens. |

## Exclusions

| Row | Reason |
| --- | --- |
| `prohibit_standard_tag_catalog_legacy_morphology_effect_gates` | Separate positive tag/effect family authority work. Do not collapse it into the morphology-stage recurrence guard. |

## Proof

- `bun habitat check --rule prohibit_foundation_projection_legacy_motion_source --json`
  passed.
- `bun habitat check --rule prohibit_morphology_stage_legacy_effect_gates --json`
  passed.

## Proof Limit

This slice does not create positive projection/tag authority, delete recurrence
guards, or settle the broader tag/effect family authority. It only repairs the
canonical remediation matrix so already-correct Grit rails are not kept in the
packet-needed queue.
