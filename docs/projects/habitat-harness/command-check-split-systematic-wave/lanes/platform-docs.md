# Platform/Docs Lane

Status: implemented by orchestrator because the agent pool was saturated.

Rows:

- `block_unapproved_base_standard_boundary_leaks`
- `validate_mapgen_docs_anchors_and_references`

## Outcome

`block_unapproved_base_standard_boundary_leaks` was deleted as admitted executable authority. Its true runtime-import assertion is already owned and proven by `enforce_adapter_only_base_standard_imports`; the deleted shell script's broader `/base-standard/` string scan reported Civ7 map-policy provenance strings, not runtime imports. That branch was demoted rather than preserved in Habitat.

`validate_mapgen_docs_anchors_and_references` remains command-check. Its script mixes Markdown shape checks with filesystem target resolution, router-target liveness, warnings, and strictness flags. The valuable source-shape branches can become Grit later, but this wave did not split them because the current red state is real docs anchor drift, not duplicate command-check scaffolding.

## Proof

- `bun tools/habitat/bin/dev.ts check --rule enforce_adapter_only_base_standard_imports --json` passed.
- `bun tools/habitat/bin/dev.ts check --rule block_unapproved_base_standard_boundary_leaks --json` now fails selector validation as expected after deletion.
- `bun tools/habitat/bin/dev.ts check --rule validate_mapgen_docs_anchors_and_references --json` still fails on pre-existing missing anchor targets and `@mapgen/*` warnings.
