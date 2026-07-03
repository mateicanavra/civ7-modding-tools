# Rule Remediation Studio Recipe-DAG Owner Slice

Status: closed

Canonical source of truth:
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`

## Slice Boundary

Selected row:

- `require_studio_ui_recipe_artifact_imports`

Excluded adjacent rows:

- none

Primary remediation objective:

Repair owner metadata only. The predicate, category, placement, runner, support
files, and rule id are already accepted Studio recipe-DAG boundary authority.

## Decision

Layer 1 marked the row as `placement/category metadata repair` because the live
predicate belongs to the MapGen Studio recipe-DAG lane, but its manifest still
declared `ownerProject: "habitat"`.

The corrected state is:

- `ownerProject: "mapgen-studio"`;
- placement remains `niche=civ7/mapgen/studio/recipe-dag`;
- category remains `boundary`;
- operation remains `check`;
- no source or package tests are added;
- the deferred semantic trigger remains: split later only if UI artifact
  consumption becomes broader than the recipe-DAG lane.

## Changes

Updated packet:

- `.habitat/civ7/mapgen/studio/recipe-dag/rules/require_studio_ui_recipe_artifact_imports/rule.json`

Updated durable records:

- `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`
- `.habitat/.active/dominoes/items/057-repair-studio-recipe-dag-owner-metadata.md`

Regenerated execution-surface analytics:

- `docs/projects/habitat-harness/execution-surface-map/execution-surface-map.json`
- `docs/projects/habitat-harness/execution-surface-map/execution-surface-map.md`
- `docs/projects/habitat-harness/execution-surface-map/execution-surface-anatomy.md`

## Proof Boundary

This slice proves:

- the lone Studio recipe-DAG owner metadata outlier now matches adjacent
  Studio recipe-DAG rules;
- the rule remains mechanically resolvable;
- the canonical JSON no longer has an implementation-ready metadata-repair
  queue item.

This slice does not claim a new UI import-boundary behavior. The predicate was
already accepted; this is only ownership metadata alignment.

## Review Disposition

Owner review:

| Finding | Severity | Disposition | Repair evidence | Residual risk / follow-up |
| --- | --- | --- | --- | --- |
| `require_studio_ui_recipe_artifact_imports` was the only Studio recipe-DAG rules-lane packet still owned by `habitat`; adjacent Studio recipe-DAG rules are owned by `mapgen-studio`. | P2 | repaired | Manifest owner changed to `mapgen-studio`; canonical JSON row changed from `placement/category metadata repair` to `no action`. | none |

## Closure Checklist

- [x] Manifest owner metadata repaired.
- [x] Predicate/category/placement/runner/support files preserved.
- [x] Canonical JSON updated.
- [x] Domino receipt updated.
- [x] Live rule count reconciled.
- [x] Support/runner references checked.
- [x] Focused selected-rule check run.
- [x] `bun habitat classify .habitat` run.
- [x] Execution-surface analytics regenerated.
- [x] `git diff --check` run.
- [x] Graphite commit created on branch `codex/habitat-studio-recipe-dag-owner-repair`.
