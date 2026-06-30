# Habitat Authority Tree

This directory is the repository's authority tree for Habitat enforcement. The Habitat SDK code under `tools/habitat` manages, validates, and executes these artifacts, but package source, root scripts, tests, CI, hooks, and tool configs are not independent sources of enforcement truth.

The current layout has four packet lanes:

```text
.habitat/blueprints/<blueprint>/<packet>/
.habitat/<niche>/_blueprints/<candidate>/<packet>/
.habitat/<niche>/rules/<packet>/
.habitat/<niche>/_remainder/<packet>/
.habitat/<niche>/<child-niche>/...
```

- Top-level `blueprints/` contains affirmed constructible kind authority.
- `<niche>` is the authored jurisdiction, such as `global/workspace`, `docs`, `habitat/toolkit`, `civ7/platform`, or `civ7/mapgen/domains`.
- `_blueprints/` is a niche-local candidate/likeness container. It visually
  marks blueprint-shaped packets that have not yet been affirmed as real
  blueprint authority.
- `rules/` is transitional rule inventory for niche-wide or current-context
  rules that must not be represented as blueprint authority.
- `_remainder/` is sorted-but-deferred inventory after slice review. It is not
  a niche, blueprint, capability, or final ontology lane.
- `<child-niche>` is a narrower jurisdiction nested inside its parent, such as
  `civ7/mapgen/domains/foundation`. A child niche may have its own `rules/`,
  `_blueprints/`, `_remainder/`, and further child niches.
- Category lives in `rule.json` placement metadata and operation kind lives in `operation.kind`, not in
  physical directories.
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
- `AUTHORITY-REMAINDER-SLICE-FRAME.md`: normative frame for contextual
  remainder slices after parent kinds have moved, including decision criteria
  for blueprint movement, honest context, missing positive kind rules,
  external enforcement-surface pressure, and cleanup candidates.
- `AUTHORITY-AUTONOMOUS-DOMINO-LOOP.md`: normative frame for running repeated
  bounded authority-tree dominoes autonomously when the destinations already
  exist and the work can close with physical movement, proof, and review.
- `AUTHORITY-DOMAIN-OPERATION-SLICE.md`: completed-slice reference for the
  Domain Operation Kind Pocket slice selected after the Recipe Kind Pocket.
- `AUTHORITY-DOMAIN-KIND-SLICE.md`: completed-slice reference for the Domain
  Kind Pocket slice that affirmed `domain` above public/config surface facets.
- `frames/BLUEPRINT-KIND-GATHERING-FRAME.md`: normative frame for affirming one
  constructible blueprint kind, then gathering bounded whole-rule authority
  into that kind while demoting non-fitting evidence.
- `RULE-OPERATION-KINDS.md`: mutability rules for `check`, `fix`, `generate`, and `migrate`, plus the reserved triage holding state.
- `SUBJECT-CATEGORIES.md`: universal category model and derivation rules.
- `dominoes.md`: working ratchet sequence for authority-tree and runner integration dominoes.
- `config.md`: human-readable operation model; not parsed as tool dispatch config.

## Rule Manifest Files

Habitat discovers rule manifests by finding `.habitat/**/rule.json`.
The current niche/blueprint/rules path is inventory placement, not identity:
moving a manifest does not change the rule when its `id`, `placement`,
`runner`, and support file references stay the same.

Packet folders may contain:

- `rule.json`: rule manifest with stable `id`, `title`, current `placement`,
  policy/routing fields, explicit `runner`, and explicit support file references.
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
