# Artifact Blueprint

Status: affirmed constructible kind, no admitted live rule packets yet

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
- `packages/mapgen-core/src/core/types.ts`
- `mods/mod-swooper-maps/src/recipes/standard/**/artifacts.ts`

The current bounded artifact-vocabulary sweep found no existing Habitat rule
packet whose whole predicate can be admitted as live artifact blueprint
authority without a split, rewrite, or semantic inversion. Future artifact
rules should be admitted here only when the whole rule applies to every valid
artifact value or contract.
