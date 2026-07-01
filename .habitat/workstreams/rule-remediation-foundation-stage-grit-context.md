# Foundation Stage Grit Context Reclassification

Status: closed

Branch: `codex/habitat-foundation-stage-grit-context`

## Purpose

Repair stale Layer 2 action labels for two standard-recipe foundation-stage
Grit checks. These rows are already narrow source-shape rails extracted from
older aggregate scripts; they do not need conversion to Habitat scripts,
package-owned tests, or immediate deletion.

## Selected Rows

| Rule id | Outcome | Reason |
| --- | --- | --- |
| `prohibit_foundation_stage_cast_merge_hacks` | reclassified to context admission | The row owns exact Grit coverage for wrapper-era cast/merge fallback fragments in standard foundation stage entrypoints. |
| `prohibit_foundation_stage_sentinel_passthrough` | reclassified to context admission | The row owns exact Grit coverage for retired Studio sentinel passthrough tokens in standard foundation stage entrypoints. |

## Excluded Adjacent Rows

| Rule id | Reason |
| --- | --- |
| `verify_standard_recipe_public_authoring_surface` | Adjacent standard-recipe authoring-surface authority remains a script because it derives schema/public-key/focus-path facts; it does not prove these exact source fragments. |
| `preserve_decomposed_foundation_contract_surfaces` | Foundation domain contract currentness explicitly says source-token bans are owned by narrow Grit packets. |

## Decision

Leave both rule packets in place and keep them as Grit. Their current shape is
the intended extraction path from previous aggregate script checks:

- static source-token/source-shape predicate;
- exact standard foundation stage entrypoint scope;
- no package test relocation;
- no broader Habitat script replacement;
- no deletion unless a future positive foundation stage contract surface fully
  subsumes the exact predicates.

## Verification

Run focused Habitat checks for both retained rules, reconcile the canonical
JSON with live manifests, run `bun habitat classify .habitat`, and run
`git diff --check`.
