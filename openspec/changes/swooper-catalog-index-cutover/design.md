# Design

## Catalog Authority

`CatalogSourceIndex` is the only catalog source authority. Catalog generation
iterates index entries and reads the referenced configs.

## Target Shape

Studio catalog/recipe generation produces the metadata-only outputs defined in
`target-vocabulary.md`. Run in Game generated mod trees are owned by the Run in
Game generator.

## Enforcement

Behavior tests compare generated catalog metadata. SA-09
`nx-swooper-catalog-index-target-topology` enforces the target and topology
shape.
