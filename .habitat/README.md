# Habitat Authority Tree

This directory is the repository's authority tree for Habitat enforcement. The Habitat SDK code under `tools/habitat` manages, validates, and executes these artifacts, but package source, root scripts, tests, CI, hooks, and tool configs are not independent sources of enforcement truth.

The current layout is a blueprint-oriented authority tree:

```text
.habitat/<authority-area>/blueprints/<blueprint>/<category>/<artifact-kind>/<packet>/
```

- `<authority-area>` is the authored jurisdiction, such as `global`, `docs`, `habitat`, `civ7`, or `civ7/mapgen`.
- `<blueprint>` is the broad thing being authored and enforced.
- `<category>` is one of the universal single-word purpose categories in `SUBJECT-CATEGORIES.md`.
- `<artifact-kind>` is `check`, `fix`, `generate`, `migrate`, or `triage`.
- `<packet>` is the current gathered authority packet.

This is not a final machine-readable ontology, and it is not evidence that runtime integration has been fully rebuilt. It is the current authority layout for continued reduction.

## Authority Planes

- `AUTHORITY.md`: what may be authoritative here and what remains Toolkit execution machinery.
- `AUTHORITY-TREE-SHAPE.md`: the current blueprint tree shape.
- `ARTIFACT-KINDS.md`: mutability rules for `check`, `fix`, `generate`, `migrate`, and `triage`.
- `SUBJECT-CATEGORIES.md`: universal category model plus the current packet ledger.
- `dominoes.md`: working ratchet sequence for authority-tree and runner integration dominoes.
- `config.md`: human-readable operation model; not parsed as tool dispatch config.

## Packet Files

Packet folders may contain:

- `<packet>.rule.json`: rule metadata.
- `<packet>.baseline.json`: baseline, fixture, current-tree, or generated-artifact evidence.
- `<packet>.pattern.md`: primary authored pattern source.
- `<packet>.apply.pattern.md`: secondary apply pattern source.
- `<packet>.check.{sh,mjs,py,ts}`: transitional read-only command adapter.
- `<packet>.operation.md`: provisional identity for non-check operations.
- `category.md`: temporary working metadata for classification and semantic notes.

## Compatibility Notes

Curated `habitat check --rule <id>` execution is the currently proven bridge. Broad full-suite execution still has known resolver/admission debt and should be rebuilt around the blueprint path shape with `triage` excluded by default.
