# Artifact Blueprint

Status: affirmed constructible kind

Owner: DRA Habitat authority-tree workstream

Domino: 42. Establish And Sweep The Artifact Blueprint Kind

## Purpose

`artifact` is the MapGen immutable data-product blueprint kind. It governs
artifact values and contracts: stable IDs, schemas, publish/read behavior,
producer/consumer contracts, value-store semantics, and the narrow buffer
exception.

This is not Habitat support-file vocabulary, not generated build output, not
dependency-tag authority, and not a sibling `artifact-contract` blueprint.
`artifact:*` remains dependency-tag vocabulary when a rule governs dependency
edge IDs rather than artifact values.

## Constructibility Evidence

Current source-backed anchors:

- `docs/system/libs/mapgen/reference/ARTIFACTS.md`
- `docs/system/libs/mapgen/how-to/add-a-new-artifact.md`
- `packages/mapgen-core/src/authoring/artifact/**`
- `packages/mapgen-core/src/core/map-context.ts`
- `mods/*/src/domain/*/modules/*/artifacts/index.ts`
- `mods/*/src/domain/*/modules/*/artifacts/*.artifact.ts`

The initial bounded artifact-vocabulary sweep found no existing Habitat rule
packet whose whole predicate could be admitted as live artifact blueprint
authority without a split, rewrite, or semantic inversion. Artifact completion
semantics remain owned by typed dependency and execution contracts rather than
by a source-token blacklist for one historical ID prefix.

Future artifact rules should be admitted here only when the whole rule applies
to every valid artifact value or contract.

## Admitted Rules

- `require_artifact_file_shape`: source-shape contract for artifact owner files.
  Every `mods/*/src/**/artifacts/*.artifact.ts` file exports one
  `artifact = defineArtifact({ schema, ... })` authority. The artifact owns its
  complete payload schema as a direct inline `Type.*(...)` expression. Exact imported atoms may supply smaller
  primitives and cohesive subentities inside that root; an imported whole
  schema may not become the artifact container. Any optional relational
  refinement is likewise inline on the definition. Core binds structural TypeBox
  admission and that refinement into the same
  frozen authority. Grit also rejects alternate runtime exports, direct TypeBox
  error projection, local issue contracts, dynamic imports, and dependencies
  outside stable MapGen, Civ7 type/policy, and public domain model surfaces.
  Core owns artifact-id admission; the source-shape rule does not rename durable
  product identities.
- `require_artifact_index_aggregate_shape`: positive source topology for every
  `mods/*/src/domain/*/modules/*/artifacts` directory. Each directory owns
  `index.ts`, one or more `*.artifact.ts` modules, and no other direct file
  kind. This law asserts only the selected positive directory shape; it does
  not search unrelated source trees for artifact-like names.
- `require_artifact_catalog_index_shape`: positive catalog-owner law. The index
  names each sibling `artifact` import, binds one direct
  `defineArtifactCatalog` authority, and exports only `artifacts`. TypeScript's
  catalog contract owns registered artifact admission.
  The current-tree sibling/catalog census is part of this migration's proof;
  durable sibling-to-catalog completeness belongs to the future first-class
  `blueprint.toml` membership capability rather than another source parser.

- `prohibit_realized_map_artifact_tags`: residual cross-surface authority for
  the retired `artifact:map.realized.*` namespace. This packet remains until
  Core absorbs the same invariant for all artifact surfaces.

Structure-v1 can assert the selected artifact containers, but it cannot yet
derive arbitrary blueprint membership from a generated `blueprint.toml`.
Exact rule acquisition and closed source containers therefore select the
current artifact members; first-class generated membership remains a separate
Habitat capability rather than a reason to add global negative scans.
