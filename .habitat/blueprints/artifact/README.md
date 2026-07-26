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
- `mods/*/src/domain/*/artifacts/index.ts`
- `mods/*/src/domain/*/artifacts/*.artifact.ts`

The initial bounded artifact-vocabulary sweep found no existing Habitat rule
packet whose whole predicate could be admitted as live artifact blueprint
authority without a split, rewrite, or semantic inversion. Artifact completion
semantics remain owned by typed dependency and execution contracts rather than
by a source-token blacklist for one historical ID prefix.

Future artifact rules should be admitted here only when the whole rule applies
to every valid artifact value or contract.

## Admitted Rules

- `require_artifact_file_shape`: source-shape contract for domain artifact
  owner files. Any `mods/*/src/domain/*/artifacts/*.artifact.ts`
  file must expose the stable `Schema`, `artifact = defineArtifact(...)`, and
  `validate = defineArtifactValidator(artifact, ...)` owner surface. Grit
  requires the canonical Core constructor imports, that positive binding
  surface, and no other runtime export authority. The literal artifact id must
  begin with the owning domain
  namespace (`artifact:<domain>.`), which prevents recipe/effect completion
  namespaces from becoming artifact identities. The typed catalog then proves
  every registered module's exact artifact factory provenance, validator
  binding, and closed runtime export surface. Core owns
  structural TypeBox projection through the exact schema binding, while
  artifact owners may add only local cardinality, relational, or domain checks
  using Core's issue contract. Additional exported artifact or validator
  authorities, complete-validator aliases, direct TypeBox projection, local
  `ArtifactValidationIssue` / `ValidationIssue` declarations, semantic artifact
  aliases are forbidden. Artifact owners import runtime artifact authority only
  from Core's canonical contracts surface; every other dependency remains
  relative to the owning domain's named model schema, policy, or data surface.
  This closes Node, package-runtime, and cross-domain private escape hatches
  without naming individual product domains.
  Artifact-private schemas remain inline; genuinely shared domain vocabulary
  lives under the owning domain's `model/schemas` surface without artifact
  validation or setup.
- `require_artifact_index_aggregate_shape`: positive source topology for every
  `mods/*/src/domain/*/artifacts` directory. Each directory owns `index.ts`, one or
  more `*.artifact.ts` modules, and no other direct file kind. This law asserts
  only the selected positive directory shape; it does not search unrelated
  source trees for artifact-like names.
- `require_artifact_catalog_index_shape`: positive catalog-owner law. The index
  namespace-imports sibling artifact modules, binds one `defineArtifactCatalog`
  authority, and exports only the catalog's module and handle projections.
  TypeScript's catalog contract owns registered module admission.
  The current-tree sibling/catalog census is part of this migration's proof;
  durable sibling-to-catalog completeness belongs to the future first-class
  `blueprint.toml` membership capability rather than another source parser.

- `prohibit_realized_map_artifact_tags`: residual cross-surface authority for
  the retired `artifact:map.realized.*` namespace. The positive domain-qualified
  artifact-id relation covers admitted domain artifact owners, but this packet
  remains until Core absorbs the same invariant for its non-domain surfaces.

Structure-v1 can assert the selected artifact containers, but it cannot yet
derive arbitrary blueprint membership from a generated `blueprint.toml`.
Exact rule acquisition and closed source containers therefore select the
current artifact members; first-class generated membership remains a separate
Habitat capability rather than a reason to add global negative scans.
