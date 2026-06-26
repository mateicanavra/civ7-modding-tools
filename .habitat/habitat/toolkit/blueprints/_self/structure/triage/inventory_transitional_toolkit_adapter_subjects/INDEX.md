# Habitat Toolkit Transitional Adapter Index

This subject records Habitat-owned executable adapters and related bridge assets
that were gathered during authority-tree triage. It is not a new
`.habitat/tooling/components` ontology. Generic dispatch, provider selection,
and command routing remain Toolkit implementation details under
`tools/habitat`.

Integration note: some Toolkit files still reference the previous
`.habitat/tooling/components/*` paths for generator schemas and source-check
loader modules. Those references are compatibility debt for a later Toolkit
integration slice, not evidence that this subject is the runtime resolver.

## Transitional Subjects

| Subject | Current Authority Path | Contents | Source Before Move | Integration State |
| --- | --- | --- | --- | --- |
| `preserve_generator_schema_contracts` | `habitat/toolkit/blueprints/generator/contract/triage/preserve_generator_schema_contracts/` | Generator schema writer and generated Nx schema JSON bridge assets. | `tools/habitat/scripts/write-preserve_generator_schema_contracts.ts`, `tools/habitat/src/generators/scaffold/*/support/schema.json` | Generator schema paths updated; writer still exists only as a command adapter. |
| `preserve_legacy_source_check_runtime_during_cutover` | `habitat/toolkit/blueprints/_self/structure/triage/preserve_legacy_source_check_runtime_during_cutover/` | Retired native source-check runtime and per-rule `.mjs` modules. | `tools/habitat/src/service/model/source-check/policy/source/**` | Loader paths updated; target state is conversion to Grit-backed packet-local patterns. |

Do not add new adapter subjects here unless they are admitted by `.habitat/AUTHORITY.md`.

Admitted Toolkit checks now live under `habitat/toolkit/blueprints/<blueprint>/<category>/check/`:

- `validate_boundary_taxonomy_against_workspace_graph`
- `verify_habitat_cli_smoke_contract`
- `enforce_habitat_orpc_service_wiring_shape`
- `prohibit_product_scan_roots_in_grit_provider`
- `validate_habitat_service_module_file_shape`
