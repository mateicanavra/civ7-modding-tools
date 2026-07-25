# Module Artifact Catalog File

Status: active working reference

Subject:
`<domain>/modules/<module>/artifacts/index.ts`

Role:
the singular catalog for sibling artifact authorities.

Required shape:

- named-imports `artifact` from each sibling `*.artifact.ts` owner under its
  semantic key;
- exports one `artifacts = defineArtifactCatalog({ ... })`;
- exports no parallel module, validator, contract, or schema maps.

Schema, validation, operation behavior, and dependency wiring remain outside
the catalog.

Executable authority:

- `.habitat/blueprints/artifact/require_artifact_index_aggregate_shape/`
- `.habitat/blueprints/artifact/require_artifact_catalog_index_shape/`
