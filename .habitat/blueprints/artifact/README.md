# Artifact Blueprint

Status: affirmed constructible kind, with admitted namespace authority

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
- `mods/mod-swooper-maps/src/recipes/standard/**/artifacts.ts`
- `mods/*/src/**/artifacts/*.artifact.ts`

The initial bounded artifact-vocabulary sweep found no existing Habitat rule
packet whose whole predicate could be admitted as live artifact blueprint
authority without a split, rewrite, or semantic inversion. Domino 45 later
reprocessed the realized-map projection remainder and admitted the
`artifact:map.realized.*` namespace ban as artifact ID authority after source
evidence showed the canonical projection contract already provides the positive
model: execution completion is represented by `effect:map.*`, while
engine-derived observations use explicitly named `artifact:map.*` layers.

Future artifact rules should be admitted here only when the whole rule applies
to every valid artifact value or contract.

## Admitted Rules

- `require_artifact_file_shape`: source-shape contract for MapGen artifact
  owner files. Any `mods/*/src/**/artifacts/*.artifact.ts`
  file must expose the stable `Schema`, `artifact = defineArtifact(...)`, and
  `validate = defineArtifactValidator(artifact, ...)` owner surface. Grit
  requires that positive surface and forbids competing authorities. The typed
  catalog then proves every registered module's exact Schema, artifact factory
  provenance, validator binding, and closed runtime export surface. Core owns
  structural TypeBox projection through the exact schema binding, while
  artifact owners may add only local cardinality, relational, or domain checks
  using Core's issue contract. Additional exported artifact or validator
  authorities, complete-validator aliases, direct TypeBox projection, local
  `ArtifactValidationIssue` / `ValidationIssue` declarations, semantic artifact
  aliases are forbidden. Artifact-owner runtime imports are restricted to MapGen
  contract/lib surfaces, static Civ7 types and policy, public domain contract,
  schema, policy, and data surfaces. Artifact-private schemas remain inline;
  genuinely shared domain vocabulary lives under the owning domain's
  `model/schemas` surface without artifact validation or setup.
- `require_artifact_index_aggregate_shape`: positive source topology for every
  `mods/*/src/**/artifacts` directory. Each directory owns `index.ts`, one or
  more `*.artifact.ts` modules, and no other file kind.
  TypeScript's `defineArtifactCatalog` contract owns registered module admission.
  The current-tree sibling/catalog census is part of this migration's proof;
  durable sibling-to-catalog completeness belongs to the future first-class
  `blueprint.toml` membership capability rather than another source parser.
- `prohibit_realized_map_artifact_tags`: artifact ID namespace rule for
  realized-map projection claims.
