# Rule Remediation: Standard Stage-Key Freeze Retirement Slice

Status: closed

Branch: `codex/habitat-retire-standard-stage-key-freeze`

Canonical source:
`.habitat/workstreams/rule-remediation-layer1-action-matrix.json`

## Purpose

Retire the duplicate hardcoded standard stage-key freeze after the standard
recipe topology rail became source-derived.

## Selected Rows

| Rule id | Disposition |
| --- | --- |
| `verify_standard_recipe_declared_stage_keys` | Deleted as duplicate hardcoded state. |

## Decision

The deleted rule parsed `recipe.ts` and compared the discovered stage keys to a
hardcoded accepted-stage list. That is now duplicate state:

- `preserve_standard_stage_topology_and_path_invariants` parses `recipe.ts` and
  `contract-manifest.ts`, compares their stage ids, and checks stage-root
  topology.
- `verify_runtime_stage_order_matches_contract_manifest` remains live for
  runtime/contract stage and step parity.

Keeping a third hardcoded list adds drift pressure without owning a distinct
authority surface.

## Exclusions

| Rule id | Reason |
| --- | --- |
| `verify_standard_recipe_artifacts_match_source_stages` | Still owns generated artifact parity and output currentness. |
| `verify_standard_recipe_public_authoring_surface` | Still owns strict public authoring schema, public-key, and focus-path invariants. |

## Verification

- `bun habitat check --rule preserve_standard_stage_topology_and_path_invariants --json`
  passed before this deletion on the same source-derived topology rail.
- Deleted manifest is absent from the live authority tree.
- Canonical JSON and live manifests reconcile at 117.

