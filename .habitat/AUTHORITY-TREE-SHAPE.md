# Habitat Authority Tree Shape

Status: current transitional physical reference for the authority packet tree

This document defines the current physical packet shape for `.habitat`
authority artifacts. It captures the transitional organization where affirmed
constructible kinds live under top-level `blueprints/`, niche-local
blueprint-shaped candidates live under `_blueprints/`, and niche/context
inventory uses `rules/` so it is not smuggled into blueprint authority. It is
the active pruning and packet-placement reference, not the final
blueprint-definition layout. The normative conceptual model for Habitat,
blueprints, instances, capabilities, niches, admission, and authority
activation lives in `AUTHORITY-ONTOLOGY.md`. This document does not define
final resolver metadata, support-file ontology, cascade semantics, or typed
blueprint manifests.

`.habitat/_support/execution/` is a temporary execution-support bridge outside
the authority hierarchy. It is not a niche and must not be used as a precedent
for new authored policy placement.

## Core Decision

Habitat currently separates affirmed blueprint authority from niche-local
candidate/remainder inventory. A niche is an authored jurisdiction: an area,
domain, package family, or governed place. A blueprint is an affirmed
constructible kind or lifecycle-owned shape. Candidate blueprint-shaped packets
stay colocated with their niche under `_blueprints/` until a slice affirms them
or demotes them. Enforcement attaches to the constructible kind; being
enforceable does not by itself make something a blueprint. Runtime boundaries
and workflow objects qualify only when they are manifest-backed constructible
kinds or lifecycle-owned shapes, not runner classes, commands, or current
defect labels.

Current pruning shape:

```text
.habitat/
  blueprints/
    <blueprint>/
      <packet>/
  <niche>/
    _blueprints/
      <candidate>/
        <packet>/
    rules/
      <packet>/
    _remainder/
      <packet>/
    <child-niche>/
      ...
```

Top-level `blueprints/` is the physical lane for affirmed constructible kind
authority. Niche-local `_blueprints/` is the physical lane for candidate
blueprint-shaped groupings that have not yet been accepted as real blueprint
authority. The underscore is intentional visual friction.

`rules/` is the physical lane for packets that describe the niche itself or a
current context that has not been accepted as a blueprint. It is transitional
rule inventory, not final niche admission. `_self` may still appear as a
manifest placement value, but it is no longer a physical blueprint directory.
Category names are single-word universal purpose categories: `boundary`,
`structure`, `contract`, `execution`, `output`, `quality`, and `policy`.
Operation kinds are mutability classes: `check`, `fix`, `generate`, and
`migrate`. Category and operation kind live in manifest placement metadata, not
path directories.

`_remainder/` is the physical lane for sorted-but-deferred packets after a
remainder slice has reviewed them. It is visual debt, not a niche, blueprint,
capability, or final ontology plane. Use `_remainder/<packet>/` inside the
smallest honest niche when a packet has been inspected, does not truthfully
belong under affirmed blueprint authority or intentional niche `rules/`, and
needs a later mechanical destination such as a positive kind rule, external
enforcement surface, split, consolidation, or retirement. The underscore is
intentional visual friction: future agents should see that these packets are
already sorted and still unresolved.

## Concepts

### Niche

The path above `_blueprints/` or `rules/` is the authored jurisdiction. It
answers where in this repository's governed ecosystem the candidate or
remainder authority currently belongs.
Examples include `global/workspace`, `docs`, `habitat/toolkit`,
`civ7/platform`, `civ7/resources`, and `civ7/mapgen/domains`.
The plural `domains` lane is intentional: it is the MapGen domain-family niche,
not the affirmed singular `domain` blueprint under top-level `blueprints/`.

Niches may nest when the language and authority become more specific. A niche
is not itself assumed to be buildable. It may contain `rules/`, `_remainder/`,
`_blueprints/` candidates, and child niches. Contexts should become child
niches when keeping them under `rules/` would make the tree read as though the
parent niche owned them as rule subcategories.

### Blueprint

A blueprint is the portable concept-level unit. In the ontology, blueprints
are encapsulated constructible definitions whose child blueprints monotonically
specialize the parent kind. In this transitional physical tree, top-level
blueprint directories hold gathered packets that define, enforce, generate,
fix, or migrate the affirmed thing being authored.

Blueprints are intentionally broader than individual rule subjects, but
narrower than areas such as `workspace`, `documentation`, `toolkit`,
`platform`, `resources`, `domain`, `pipeline`, or `studio`.

The packet folders under a blueprint are not the final anatomy of a blueprint
definition. They are current gathered authority packets while final typed
blueprint manifests and cascade semantics remain open. Category and operation
kind are manifest facts for those packets.

Affirmed blueprint examples include:

- `blueprints/recipe`
- `blueprints/recipe-stage`
- `blueprints/recipe-step`
- `blueprints/domain`
- `blueprints/domain-operation`
- `blueprints/mod-map`
- `blueprints/dependency-tag`
- `blueprints/artifact`

Candidate blueprint-shaped examples include:

- `global/workspace/_blueprints/project-boundary-model`
- `docs/_blueprints/docs-site`
- `habitat/toolkit/_blueprints/service-module`

Known transitional misfits, not blueprint exemplars:

- `civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules`,
  `civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/<prefix>/rules`,
  and `civ7/mapgen/pipeline/swooper-maps-standard-recipe/**/_remainder`
  are the bounded current-recipe context for concrete Swooper Maps standard
  recipe evidence. Top-level `rules/` holds recipe-wide context; stage-prefix
  `rules/` holds coherent context rules for a stage family; `_remainder`
  means the predicate needs split, consolidation, or retirement before it can
  be live context authority. Treat this whole lane as instance/context
  material until a row is generalized under a recipe, recipe-stage, or
  recipe-step blueprint.
- `civ7/mapgen/domains/foundation/rules` and
  `civ7/mapgen/domains/ecology/rules` are current concrete-domain context
  rules, not accepted blueprints by label inheritance. Foundation currently has
  both intentional context rules and sorted deferred packets; do not collapse
  those lanes.
- `civ7/mapgen/domains/morphology/_remainder` is the first reviewed
  concrete-domain remainder. Its packets have been sorted out of intentional
  `rules/` authority but are not final owners; treat them as visible debt for
  later movement, split, consolidation, projection, or retirement.
- `civ7/mapgen/domains/foundation/_remainder` contains reviewed foundation
  packets that are not final context authority: mixed recipe-step plus
  operation-contract predicates, projection implementation cleanup,
  strategy-file locality pressure, and rules-index shim cleanup.
- `civ7/mapgen/studio/devops/rules`,
  `civ7/mapgen/studio/browser-worker/rules`,
  `civ7/mapgen/studio/recipe-dag/rules`, and
  `civ7/mapgen/studio/server/rules` are Studio child operating-area staging
  lanes. `devops` is the development, delivery, and local-operator workflow
  lane around the Studio subsystems, not a runtime subsystem itself. Their
  current packets were moved whole out of the old Studio
  `_blueprints` lane; treat the child niches as honest Studio subsystems, not
  as proof that packet contents have already been split, generalized,
  retired, or admitted as blueprint authority.
- `civ7/resources/map-policy/rules` and
  `civ7/resources/civ7-types/rules` are child resource/package lanes for
  official-resource-derived generated and protected surfaces. They are not
  admitted `civ7-map-policy` or `civ7-types` blueprint kinds.
- `civ7/platform/adapter/rules`,
  `civ7/platform/control-orpc/rules`,
  `civ7/platform/direct-control/session/rules`, and
  `civ7/platform/game-ui-bridge/rules` are child platform operating-area
  lanes for adapter import discipline, control-oRPC contract purity,
  direct-control session lifecycle ownership, and the game-UI bridge bootstrap
  surface. They are not admitted `adapter`, `control-orpc`,
  `direct-control-session`, or `bridge` blueprint kinds.

### Rules Lane

`rules/` is the current physical lane for authority about the niche as a whole.
It prevents niche-local packets from being mixed with child blueprint names
while the final manifest model is still being designed.

Use `rules/<packet>/` for packets owned by the niche. When a named context such
as `foundation` has its own rules or remainder, represent it as a child niche
with its own `rules/` and `_remainder/` lanes. Do not leave
sorted-but-deferred leftovers in `rules/`; move them to `_remainder/` inside
the smallest honest niche.

### Remainder Lane

`_remainder/` is a transitional lane for packets that have already been
reviewed by a bounded slice but cannot yet move to their final owner without
future work. It keeps sorted leftovers visible in the tree instead of hiding
them inside `rules/` or in a separate classification document.

Use `_remainder/<packet>/` for deferred leftovers inside the smallest honest
niche. The child-niche path preserves navigability; `_remainder` itself does
not create a niche, blueprint, capability, or semantic category.

Typical reasons a packet belongs in `_remainder/`:

- the current negative rule is evidence for a missing positive kind rule;
- the rule belongs to a projected enforcement surface such as Nx boundaries,
  package graph, import law, or build/test orchestration, but that destination
  is not part of the current branch;
- the rule needs a source-obvious split, consolidation, or retirement later;
- the rule is sorted and intentionally deferred, not silently unexamined.

Do not put intentionally owned niche/context rules in `_remainder/`. They stay
under `rules/`.

### Category

A category answers what universal engineering purpose a packet serves.
Categories are manifest placement values, not packet directories.

The category model is defined in `SUBJECT-CATEGORIES.md`.

### Operation Kind

An operation kind answers what Habitat is allowed to do: read-only evaluation,
repair, generation, or migration. Operation kinds are manifest placement values,
not packet directories. Mutability rules are defined in
`RULE-OPERATION-KINDS.md`.

### Artifact Blueprint

`blueprints/artifact` is affirmed product blueprint authority for MapGen
artifact values and contracts: stable IDs, schemas, write-once publish/read
behavior, producer/consumer contracts, value-store semantics, and the narrow
buffer exception.

It is not a generic Habitat term. Do not use `artifact` for rule categories,
operation kinds, support files, generated build output, or Habitat packet role
files. `artifact:*` remains dependency-tag vocabulary when a rule governs
dependency edge IDs rather than artifact values.

### Packet

The leaf folders are current authority packets. They are gathered enforceable or
executable units, not necessarily final blueprint internals. The path is current
inventory placement. Rule identity, current placement facts, runner file
references, and baseline references are authored in `rule.json` so the same
rule can move without changing identity or behavior. Child filenames remain
generic role names such as `rule.json`, `baseline.json`, `pattern.md`,
`structure.toml`, `check.ts`, `generate.ts`, or `operation.md`.

## Negative Rules

- Do not promote niches, package areas, maintenance chores, runner names, or current defect names into blueprints.
- Do not create categories from domain terms such as `mapgen`, `docs-site`, `source-check`, or `guardrail`.
- Do not reintroduce category or operation-kind directories; those facts belong
  in manifest placement metadata.
- Do not classify mutating work as `check`.
- Do not treat `triage` as admitted executable authority.

## Current Classification Rule

Classify each packet by authority lane first: affirmed blueprint authority,
candidate blueprint-shaped niche inventory, intentional niche `rules`
inventory, or sorted `_remainder` inventory. If a packet is about an affirmed
constructible kind, place it under top-level
`blueprints/<blueprint>/<packet>/`. If it is blueprint-shaped but not yet
affirmed by a slice, keep it under
`<niche>/_blueprints/<candidate>/<packet>/`. If a packet is about the niche,
place it under `<niche>/rules/<packet>/`. If the rule belongs to a narrower
context that should remain visible as a jurisdiction, make that context a child
niche and place the packet under `<niche>/<child-niche>/rules/<packet>/`. If a
reviewed packet is mixed, deferred, or waiting on a future destination, place
it under `<smallest-honest-niche>/_remainder/<packet>/`. Do not add a second
packet-local classification file.
