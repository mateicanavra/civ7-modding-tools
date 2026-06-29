# Domain Kind Pocket Slice

Status: completed-slice frame and reference

Built: 2026-06-29

Owner: DRA Habitat authority-tree workstream

Durability: standalone reference for agents investigating and moving the
Domain Kind Pocket.

## Scope And Provenance

This frame governed the bounded slice after Recipe and Domain Operation.
Use it with `AUTHORITY-SLICE-FRAME.md`, not instead of it. The generic slice
frame defines the method; this document defines the specific pocket, evidence
surface, and selection pressure for `domain`.

Source order:

1. Direct user decisions in the active Habitat authority-tree workstream.
2. `DOMINO-FRAME.md` and `dominoes.md` for selecting this as the next active
   domino.
3. `AUTHORITY-ONTOLOGY.md` for blueprint, instance, capability, and niche
   concepts.
4. This document for Domain Kind Pocket input boundaries, slice-specific
   commitments, and movement decisions once the domino has been selected.
5. `AUTHORITY-SLICE-FRAME.md` for the bounded slice method.
6. Current `.habitat/**/rule.json` manifests as evidence inventory.
7. Current MapGen and Swooper Maps source as constructibility evidence.

In scope:

- The `domain` constructible kind.
- Candidate rule pockets currently named `domain-public-surface` and
  `domain-config-surface`.
- The enumerated direct domain rule inputs in this document. Other immediate
  `.habitat/civ7/mapgen/domain/rules/*` rows are secondary unless this frame
  names them.
- Source evidence for `defineDomain`, `createDomain`, domain entrypoints,
  domain ops registries, domain contracts, and domain config facades.
- Consumer import evidence from recipe and map source where it proves the
  domain public surface.
- The already affirmed `domain-operation` blueprint as adjacent child pressure,
  not as something to reopen broadly.

Out of scope:

- Broad MapGen domain cleanup.
- Foundation, morphology, hydrology, ecology, narrative, placement, resources,
  or other concrete domain labels as blueprints by label inheritance.
- Strategy-file cleanup unless it proves a domain-kind rule directly.
- Map output, map projection, studio, SDK, visualization, resources, platform,
  and docs pockets except where a rule directly proves the domain kind.
- Creating capabilities or niche admission records during this slice.
- Consolidating weak rules before their correct owner is clearer.

## WHAT

This frame treats `domain` as the next constructible kind to test and move.
The primary signal is that MapGen source already exposes a durable domain
construction surface: `defineDomain({ id, ops })`, `createDomain(domain,
implementations)`, domain entrypoints, operation contracts, operation
implementations, and optional config facades. Current packets named
`domain-public-surface` or `domain-config-surface` are not automatically
blueprints; they are evidence for facets of the `domain` kind unless source
evidence proves an independent constructible kind.

## WHY

The tempting alternative is to treat `domain-public-surface` as the next
blueprint because it has a visible packet pocket. That preserves a current
enforcement facet as ontology and leaves the parent kind unnamed. The stronger
move is to affirm the parent `domain` kind above the already moved
`domain-operation` kind. This reduces future state: import-surface,
config-surface, entrypoint, retired-catalog, and consumer-boundary rules can be
judged relative to one parent constructible kind instead of spread across
surface labels and concrete domain contexts.

## Construction History

Structural alternative considered: `domain-public-surface` as the next kind.

Why rejected or demoted: public surface is a facet of a domain's external
contract. It does not by itself provide a constructible instance grammar. If it
becomes durable, it should likely be a domain facet or governance surface, not
the parent blueprint.

Structural alternative considered: concrete domains as the next slice
(`foundation-domain`, `morphology-domain`, `ecology-domain`, and similar).

Why rejected or demoted: those labels are current instances or contexts. They
may contain useful evidence, but promoting them first would repeat the
`standard-recipe` error by treating named examples as blueprints before the
general kind is in place.

Chosen frame: Domain Kind Pocket. Establish the parent `domain` kind, use
existing public/config surface pockets as evidence, keep concrete domains
contextual unless a rule directly governs all domain instances, and re-read the
tree after physical movement.

## Selection Commitments

In:

- Rules that govern source-proven domain instances or the source-proven domain
  entrypoint/anchor contract.
- Rules that define how domain entrypoints expose public domain surfaces.
- Rules that govern the relationship between domain internals and consumers
  such as recipes, maps, and tests.
- Rules that forbid retired domain-root shapes or unknown domain config
  patterns when those rules are about domain kind validity.
- Source files that prove the domain construction model.

Foreground:

- `domain` as constructible kind.
- `domain-operation` as an already affirmed adjacent child kind.
- Public surface and config surface as domain facets until proven otherwise.
- Correct-most enclosing owner over perfect final subdivision.
- Coarse movement that makes the next read more truthful.

Exterior:

- Treating current `_blueprints/domain-public-surface` or
  `_blueprints/domain-config-surface` folders as admitted blueprints.
- Treating concrete domain names as blueprint authority by folder label.
- Reopening the full domain-operation slice.
- Sorting every broad pipeline or recipe consumer rule into this pocket.
- Creating an `operation-strategy`, `domain-public-surface`, or
  `domain-config-surface` blueprint in this slice.

## Hard Core And Protective Belt

Hard core:

1. `domain` is the candidate blueprint because source code defines domain as a
   constructible kind.
2. Public surface and config surface are domain facets/evidence unless proven
   independently constructible.
3. Concrete domains are instances or contexts, not blueprints by label
   inheritance.
4. The slice should move rules only when their whole rule meaning is correct
   relative to `domain`, `domain-operation`, or one coarse context.
5. Current manifests preserve identity and execution behavior while physical
   placement changes.

Protective belt:

- The final internal layout under `.habitat/blueprints/domain/` is not decided
  here.
- A future slice may split facets or capabilities after the parent kind is
  admitted.
- Some public/config surface rules may stay contextual or be marked as cleanup
  candidates if they only describe Swooper Maps transition state.
- Consumer import rules may belong to `domain` if they define the public
  surface contract from the consumer side.
- `domain-operation` may receive a direct child/adjacent note if this slice
  exposes parent-child pressure, but it should not be reclassified wholesale.

## Evidence Surface

Primary source evidence:

- `packages/mapgen-core/src/authoring/contracts.ts`
- `packages/mapgen-core/src/authoring/domain.ts`
- `packages/mapgen-core/src/authoring/index.ts`
- `mods/mod-swooper-maps/src/domain/index.ts`
- `mods/mod-swooper-maps/src/domain/*/index.ts`
- `mods/mod-swooper-maps/src/domain/*/ops.ts`
- `mods/mod-swooper-maps/src/domain/*/ops/contracts.ts`
- `mods/mod-swooper-maps/src/domain/*/ops/index.ts`
- `mods/mod-swooper-maps/src/domain/*/config.ts`

Original primary rule inputs were the then-live `domain-public-surface` and
`domain-config-surface` candidate pockets plus four direct domain rules:

- `prohibit_domain_entrypoint_self_reexports`
- `prohibit_domain_tag_artifact_shim_imports`
- `prohibit_retired_domain_root_catalogs`
- `prohibit_unknown_bag_config_usage`

Secondary review inputs, not automatic moves:

- `.habitat/blueprints/domain-operation/**`
- `.habitat/civ7/mapgen/domain/ecology/rules/**`
- `.habitat/civ7/mapgen/domain/foundation/rules/**`
- `.habitat/civ7/mapgen/domain/foundation/_remainder/**`
- `.habitat/civ7/mapgen/domain/morphology/_remainder/**`
- `.habitat/civ7/mapgen/domain/rules/prohibit_rng_callback_state_in_ops`
- Any other immediate `.habitat/civ7/mapgen/domain/rules/*` row not named in
  the primary rule inputs above.
- Broad pipeline rules only when their whole rule meaning directly governs the
  domain kind.

Deliberate default exclusions:

- Foundation, morphology, ecology, and similar legacy-token cleanup rows.
- Strategy-file rules that only make sense by treating `strategies/<name>.ts`
  path grammar as ontology.
- Map projection, map output, studio, SDK, visualization, resource, platform,
  and docs pockets.
- Recipe implementation rules unless they are consumer-side evidence for the
  domain public contract.

## Working Classification Criteria

Classify a rule under `domain` when:

- it applies to every source-proven domain instance or to the source-proven
  domain entrypoint/anchor contract;
- it preserves the domain public contract, entrypoint contract, config facade,
  or retired root topology;
- it can be stated without naming a concrete domain such as foundation or
  morphology; and
- moving it under `domain` makes the rule less special-case, not more.

Leave a rule contextual when:

- it only describes the current Swooper Maps cutover state;
- it depends on one concrete domain's legacy topology;
- it would require inventing a new facet blueprint to justify the move; or
- only part of the rule belongs to `domain` and the split is not already
  source-obvious.

Mark cleanup pressure, without performing cleanup, when:

- the rule is a loose negative assertion that should become a positive domain
  contract;
- the rule duplicates a stronger domain rule after movement;
- the rule exists to police a retired artifact shape that no longer exists; or
- the rule mixes domain kind governance with instance-specific transition
  cleanup.

## Slice Dispositions

Moved to `.habitat/blueprints/domain/`:

- `prohibit_domain_artifacts_modules`
- `prohibit_recipe_imports_in_domain_source`
- `prohibit_relative_domain_reaches_from_recipes_and_maps`
- `require_public_domain_surfaces_in_recipes_and_maps`
- `require_public_domain_surfaces_in_tests`
- `restrict_recipes_to_public_domain_surfaces`
- `prohibit_domain_entrypoint_self_reexports`
- `prohibit_domain_tag_artifact_shim_imports`
- `prohibit_retired_domain_root_catalogs`
- `prohibit_unknown_bag_config_usage`

Left contextual:

- `require_owned_domain_config_catalog_surfaces` moved to
  `.habitat/civ7/mapgen/domain/rules/require_owned_domain_config_catalog_surfaces`
  because it mixes a morphology config facade assertion with standard recipe
  tag-catalog evidence. That mix is real cleanup pressure, not proof of a
  separate `domain-config-surface` blueprint.

Explicitly excluded from the Domain Kind Pocket:

- `prohibit_milestone_prefixed_standard_recipe_tag_catalog_names` moved to
  `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_milestone_prefixed_standard_recipe_tag_catalog_names`
  because its whole path coverage is current standard-recipe tag catalog
  cleanup, not domain-kind governance.

## Movement Shape

Affirmed domain-kind rules landed at:

```text
.habitat/blueprints/domain/<rule-id>/
```

This is a working placement for this slice, not final proof of every future
domain layout. Moved manifests preserved rule `id`, behavior, explicit
`runner.files`, and `artifacts.baseline` references. `placement.blueprint`
became `domain` for rules moved to the parent kind. Rules that remained
contextual stayed in the smallest honest context for later reassessment.

## Falsifiers

Stop and reframe if:

- the primary input rules cannot mostly be placed under `domain`,
  `domain-operation`, or one coarse context without creating a broad new
  taxonomy;
- public/config surface rules only make sense as separate blueprints and not
  as domain facets;
- concrete domain labels must become blueprints for the slice to proceed;
- the movement requires changing runtime behavior; or
- the slice turns into broad cleanup instead of physical authority movement.

Degeneration trigger: if two consecutive domain-slice decisions promote
surface labels or concrete domain labels instead of the parent constructible
kind, pause and rerun the slice frame before moving more files.

## Review Result

Two lightweight review lanes were run during implementation:

- Ontology review: check that the frame does not smuggle public/config surface
  labels or concrete domain names into blueprint authority.
- Workstream review: check source order, input boundaries, falsifiers, and
  proof expectations.

Accepted P1/P2 findings were repaired or dispositioned before closure.

## Closure Notes

This completed slice:

- affirmed `domain` as the constructible parent kind for the moved rules;
- demoted `domain-public-surface` and `domain-config-surface` from candidate
  blueprint labels into facet evidence;
- kept concrete domain contexts such as foundation, morphology, and ecology
  out of blueprint authority; and
- exposed mixed config/catalog cleanup pressure without solving it in this
  branch.

Do not use this frame as permission to classify the whole MapGen domain tree.
Its purpose is to preserve the completed Domain Kind Pocket decision and make
the next state-changing slice natural and bounded.
