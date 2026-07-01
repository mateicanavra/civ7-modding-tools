# Rule Remediation: Standard Recipe Context Guards

Status: closed on `codex/habitat-standard-recipe-context-guards`

Canonical record:
`.habitat/workstreams/rule-remediation-layer1-action-matrix.json`

## Purpose

Repair stale `consolidation/dedup` labels for the two standard-recipe context
guards that remain live structural Habitat authority.

## Decision

Do not consolidate these checks into package tests or delete them.

`verify_standard_recipe_artifacts_match_source_stages` owns generated standard
recipe artifact currentness against source stages, source-derived schema, UI
metadata, defaults, canonical map config normalization, and the explicit
foundation-orogeny raw-envelope exception.

`verify_standard_recipe_public_authoring_surface` owns the exact standard
recipe public authoring surface: stage public keys, strict schemas, step focus
paths, and raw-envelope constraints.

Both checks remain standard-recipe context authority until a future
parameterized projection/output or authoring-surface authority exists.

## Disposition Receipt

| Rule id | Action | Reason |
| --- | --- | --- |
| `verify_standard_recipe_artifacts_match_source_stages` | reclassified to context admission | Generated artifact parity is a structural standard-recipe authority surface, not package-test residue. |
| `verify_standard_recipe_public_authoring_surface` | reclassified to context admission | Public authoring shape is exact standard-recipe context authority until parameterized. |

## Proof Scope

Focused Habitat checks passed for both rules. No manifest, source, package-test,
or generated-output mutation was required.
