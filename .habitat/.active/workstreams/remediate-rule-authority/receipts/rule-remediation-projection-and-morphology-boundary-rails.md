# Projection And Morphology Boundary Rails

Status: closed on `codex/habitat-foundation-config-boundary-rail`

## Purpose

Close the remaining implementation-ready boundary-inversion rows from the
boundary review queue that do not require a user semantic decision.

## Selected Rows

| Rule id | Outcome |
| --- | --- |
| `prohibit_misplaced_projection_adapter_calls` | Admitted as exact Grit callsite authority for projection/materialization adapter call owners. The pattern already names allowed projection call owners and passes after packet-local Grit execution was repaired. |
| `prohibit_morphology_stage_config_bag_imports` | Repaired to cover every `morphology*` standard-recipe stage, including `morphology-shelf`, while still allowing the sanctioned `@mapgen/domain/morphology/config.js` facade. |

## Semantic Decision

Projection/materialization adapter calls are not a generic module-boundary
problem. They are exact standard-recipe callsite ownership, so the current Grit
rule remains the honest authority until a parameterized projection-step model
exists.

Morphology standard-recipe stages may import morphology-specific typed config
surfaces, but must not import the root `@mapgen/domain/config` bag. This is a
source-pattern boundary, not a package-owned behavior test.

## Excluded Rows

| Rule id | Reason |
| --- | --- |
| `prohibit_morphology_hotspot_overlay_publishers` | Sealed blocker: overlay ownership is a product/architecture decision. |
| `prohibit_morphology_story_overlay_contract_artifact` | Same overlay ownership decision. |
| `prohibit_morphology_overlay_implementation_reads` | Needs a broader positive step implementation/dependency authority decision before mutation. |

## Verification

- `bun habitat check --rule prohibit_misplaced_projection_adapter_calls --json`
- `bun habitat check --rule prohibit_morphology_stage_config_bag_imports --json`
- injected bad import probe failed for `prohibit_morphology_stage_config_bag_imports`
- injected allowed morphology-specific import probe passed for `prohibit_morphology_stage_config_bag_imports`
- `bun habitat classify .habitat`
- `bun run --cwd tools/habitat check`
- `bun run --cwd tools/habitat analyze:execution-surface`
- live manifest/current JSON coverage reconciliation
- `git diff --check`

## Record

The canonical operational record is
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`; this receipt
does not duplicate the action matrix.
