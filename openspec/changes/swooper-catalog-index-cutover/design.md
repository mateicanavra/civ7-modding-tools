# Design

## Catalog Authority

`CatalogSourceIndex` is the only catalog source authority. Catalog generation
iterates index entries and reads the referenced configs.

## Target Shape

Studio catalog/recipe generation produces the metadata-only outputs defined in
`target-vocabulary.md`. Run in Game generated mod trees are owned by the Run in
Game generator.

## Enforcement

Behavior tests compare generated catalog metadata and the focused Nx target
gates prove the metadata-only output classes. SA-09
`structure-swooper-catalog-index-target-topology` enforces the durable source
topology for the cutover and the retirement of the Packet 4 transitional
advisory.
