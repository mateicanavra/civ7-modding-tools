# Rule Remediation: Standard Recipe Context Guards

Status: closed on `codex/habitat-standard-recipe-context-guards`

Canonical record:
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`

## Purpose

Repair stale `consolidation/dedup` labels for the two standard-recipe context
guards that remain live structural Habitat authority.

## Decision

Do not consolidate these checks into package tests or delete them.

`verify_standard_recipe_artifacts_match_source_stages` owns generated standard
recipe artifact currentness against source stages, source-derived schema, UI
metadata, defaults, canonical map config normalization, and the explicit
foundation-orogeny raw-envelope exception.

`verify_standard_recipe_public_authoring_surface` owns package-derived
currentness for the exact standard recipe authoring model: stage public keys,
strict derived schemas, step focus paths, and raw-envelope constraints. Static
source/file shape for recipe stage authoring belongs to Grit-backed Habitat
patterns, not this script.

Both checks remain standard-recipe context authority until a future
parameterized projection/output or authoring-surface authority exists.

## Disposition Receipt

| Rule id | Action | Reason |
| --- | --- | --- |
| `verify_standard_recipe_artifacts_match_source_stages` | reclassified to context admission | Generated artifact parity is a structural standard-recipe authority surface, not package-test residue. |
| `verify_standard_recipe_public_authoring_surface` | reclassified to context admission | Derived public keys, strict schemas, and focus paths are exact standard-recipe context currentness until parameterized; source/file shape belongs to Grit patterns. |

## Proof Scope

Focused Habitat checks passed for both rules. No manifest, source, package-test,
or generated-output mutation was required.
