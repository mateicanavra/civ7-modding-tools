# Operation Guard Decomposition

Status: unresolved prework domino

Parent packet: `Foundation Lib / Tectonics Disposition Decision Packet`

## Decision To Close

Resolve the exact destination topology for every export in
`mods/mod-swooper-maps/src/domain/foundation/lib/require.ts`.

The owner class is already decided: this is not a shared `foundation/lib`
surface and it is not an artifact contract. The remaining decision is the
per-export decomposition: which guards become operation-local
`rules/input-guards.ts` files, which guards should be duplicated as tiny local
checks, and whether any guard is replaced by an existing artifact contract or
operation contract helper.

## Frame

In:
`require.ts` exports, direct importers, and the operation/rules files that use
those guards while computing foundation artifacts.

Foreground:
the owner topology and import shape that lets `foundation/lib` disappear
without inventing a new shared validation bucket.

Exterior:
runtime behavior changes, source movement, and new shared validation law unless
the investigation proves that operation-local decomposition is wrong.

Would force a reframe:
evidence that two or more operations need the same guard as a stable public
artifact-validation contract, not just as repeated implementation convenience.

## Information Needed

- Complete export list from `require.ts`.
- Complete importer list per export.
- For each importer, the operation id and nearest legal local owner file.
- Whether the guarded input is already described by an artifact contract,
  operation contract, or operation-local precondition.
- Whether any guard is used across operations in a way that would make local
  duplication worse than a named owner-law addition.

## Closure Test

This domino closes when every `require.ts` export has one exact row:

- local destination path;
- duplicate/localize/delete/replace decision;
- import-migration note;
- governing authority reference;
- verification required for the eventual execution slice.

If a shared validation owner is required, this domino must name the owner-law
document to update and the exact exported surface it would authorize.

## Current Read

This looks medium-hair, not inherently hard. The needed evidence should exist
in imports and adjacent operation contracts. The previous pass stopped short
because it classified the owner class but did not enumerate each export against
its consuming operations.
