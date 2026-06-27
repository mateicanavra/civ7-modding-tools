# Closure

Status: closed with aggregate proof complete.

## Implemented Moves

- Added `prohibit_retired_studio_devlive_daemon_file` as native
  `structure-check`.
- Added `require_docs_site_root_inputs` as native `structure-check`.
- Added `validate_habitat_service_module_root_topology` as native
  `structure-check`.
- Added `prohibit_studio_rpc_eventhub_lifecycle_leaks` as `grit-check`.
- Shrunk four command-check scripts to remove branches moved to their new
  owners.
- Updated execution-surface scanner support for `.structure.toml`.
- Regenerated execution-surface analytics with structure TOML surfaced as
  `structure-spec`.

## Retained Non-Structure Owners

- Package JSON and Nx target shape: future Nx/data-driven owner.
- Evaluated Vite config and required source-token currentness: retained command
  residual or package-local validator.
- Runtime stage/manifest parity: package-runtime validator.
- Workspace boundary taxonomy: graph/Nx data validation.
- Docs anchors/references: docs validator plus possible future Grit Markdown
  shape split.
- Domain aggregate profiles: follow-up explicit domain split wave.

## Final Counts

- New structure-check packets: 3.
- New Grit packet: 1.
- Command scripts shrunk: 4.
- Command scripts deleted: 0.
- Native structure-check packets total: 4.
- Grit-check packets total: 37.
- Command-check packets total: 31.

## Accepted Current Reds

- `verify_studio_recipe_artifacts_are_current`: package-local generated artifact
  freshness.
- `validate_mapgen_docs_anchors_and_references`: existing docs anchor/reference
  debt.
- `validate_boundary_taxonomy_against_workspace_graph`: existing workspace graph
  command-script module-resolution failure.

## Next Domino

Run a targeted domain aggregate split only after accepting explicit domain
topology root lists. Do not infer domain topology from profile auto-detection.
