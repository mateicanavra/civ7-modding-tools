# Habitat Authority Tree

This directory is the repository's authority tree for Habitat enforcement. The Habitat SDK code under `tools/habitat` manages, validates, and executes these artifacts, but package source, root scripts, tests, CI, hooks, and tool configs are not independent sources of enforcement truth.

The current layout is a niche/blueprint authority tree:

```text
.habitat/<niche>/blueprints/<blueprint>/<category>/<artifact-kind>/<packet>/
```

- `<niche>` is the authored jurisdiction, such as `global/workspace`, `docs`, `habitat/toolkit`, `civ7/platform`, or `civ7/mapgen/domain`.
- `<blueprint>` is the constructible kind or lifecycle-owned shape inside that
  niche.
- `_self` is the temporary niche-authority packet-placement placeholder for
  packets about the niche as a whole.
- `<category>` is one of the universal single-word purpose categories in `SUBJECT-CATEGORIES.md`.
- `<artifact-kind>` is `check`, `fix`, `generate`, `migrate`, or `triage`.
- `<packet>` is the current gathered authority packet.

This is not a final machine-readable ontology, and it is not evidence that runtime integration has been fully rebuilt. It is the current authority layout for continued reduction.

## Authority Planes

- `AUTHORITY.md`: what may be authoritative here and what remains Toolkit execution machinery.
- `AUTHORITY-ONTOLOGY.md`: normative conceptual model for Habitat, blueprints, instances, capabilities, niches, admission, and authority activation.
- `AUTHORITY-TREE-SHAPE.md`: the current niche/blueprint tree shape.
- `DOMINO-FRAME.md`: operating frame for choosing and carrying authority-tree dominoes across branches, agents, and review loops.
- `AUTHORITY-SLICE-FRAME.md`: normative frame for bounded authority-slice
  work, including how to classify current rules without promoting packet
  labels into ontology.
- `AUTHORITY-DOMAIN-OPERATION-SLICE.md`: implementation-ready spec for the
  Domain Operation Kind Pocket slice selected after the Recipe Kind Pocket.
- `ARTIFACT-KINDS.md`: mutability rules for `check`, `fix`, `generate`, `migrate`, and `triage`.
- `SUBJECT-CATEGORIES.md`: universal category model and derivation rules.
- `dominoes.md`: working ratchet sequence for authority-tree and runner integration dominoes.
- `config.md`: human-readable operation model; not parsed as tool dispatch config.

## Rule Manifest Files

Habitat discovers rule manifests by finding `.habitat/**/rule.json`.
The current niche/blueprint path is inventory placement, not identity:
moving a manifest does not change the rule when its `id`, `placement`,
`runner`, and artifact references stay the same.

Packet folders may contain:

- `rule.json`: rule manifest with stable `id`, `title`, current `placement`,
  policy/routing fields, explicit `runner`, and explicit artifact references.
- `baseline.json`: baseline, fixture, current-tree, or generated-artifact
  evidence referenced from `rule.json`.
- `pattern.md`: primary authored pattern source referenced from `rule.json`.
- `apply.pattern.md`: secondary apply pattern source.
- `structure.toml`: Habitat-native topology source referenced from `rule.json`.
- `check.{sh,mjs,ts}`: Habitat-native read-only script adapter referenced
  from `rule.json`.
- `fix.mjs`, `generate.{sh,ts}`: mutating operation implementation.
- `operation.md`: provisional identity for non-check operations.

Do not reintroduce packet-prefixed role filenames or packet-local
`category.md`. Do not derive rule identity or execution entrypoints from the
current packet path. The path is current placement evidence only.

## Compatibility Notes

Curated `habitat check --rule <id>` execution is the currently proven bridge.
Broad full-suite execution should be rebuilt around admitted authority once
blueprints, instances, capabilities, and niche governance have a vertical pilot.
