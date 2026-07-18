# Destination Simplification Frame

Status: normative frame for the immediate big-swing Habitat destination
dominoes

Built: 2026-06-30

Owner: DRA Habitat authority-tree workstream

Durability: standalone reference for agents deciding which real destinations
to admit next, which candidate destinations to merge or reject, and which
remaining pockets should become artifact, dependency-tag, garbage, or later
blueprint-pruning work.

## Frame Identity

Frame name: Destination Simplification

For situation: repeated authority-tree slices have moved many rules into
affirmed blueprint and niche lanes, but the remaining unsorted pockets still
carry false candidate destinations, negative cleanup guards, and several
architecture-backed kinds that should now be admitted before more small
remainder work.

Mode: frame-discovery

Object-path: objective

## Scope And Provenance

In scope:

- Immediate big-swing destination choices after Domino 38.
- Real blueprint destinations that should now be admitted or gathered.
- Candidate destination merges that reduce state space.
- Explicit not-blueprint calls for surfaces that should not become ontology.
- The next ordering decision after dependency-tag gathering: artifact,
  garbage, or targeted `_blueprints` pruning depending on what the changed
  tree reveals.

Out of scope:

- Final Habitat admission, capability, projection, or instance schema design.
- Global cleanup of every `_remainder` or `_blueprints` lane before a bounded
  destination slice needs it.
- Promoting config, adapter, projection, package, runner, service, or current
  defect labels into blueprint authority.
- Deciding final inheritance or composition between future artifact and
  dependency-tag blueprints.

Source pointers:

- `.habitat/.active/dominoes/README.md`
- `.habitat/AUTHORITY-ONTOLOGY.md`
- `.habitat/AUTHORITY-TREE-SHAPE.md`
- `.habitat/.active/frames/BLUEPRINT-KIND-GATHERING-FRAME.md`
- `.habitat/.active/frames/REMAINDER-RECLAMATION-FRAME.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md`
- `docs/system/libs/mapgen/reference/ARTIFACTS.md`
- `docs/system/libs/mapgen/policies/DEPENDENCY-IDS-AND-REGISTRIES.md`
- `packages/mapgen-core/src/engine/tags.ts`
- Current `.habitat/**/rule.json` manifests as evidence, not ontology.

## WHAT

This frame treats the next phase as destination simplification, not smaller
and smaller remainder chasing. It selects real architecture-backed kinds and
destination merges as the unit of analysis, foregrounds the reduction of false
candidate destinations, and holds generic projection/config/adapter surfaces
outside blueprint authority until a specific constructible kind proves itself.

## WHY

The authority tree is now clean enough that false destinations are a larger
source of confusion than missing local movement. If agents continue with tiny
remainder slices first, they will keep re-litigating whether artifact-shaped,
tag-shaped, effect-shaped, projection-shaped, and config-shaped rows need new
owners. The stronger move is to admit the few real destinations the source
architecture already proves, merge over-split concepts, and leave the rest as
honest niche, remainder, or garbage pressure. The rejected alternative is to
run another broad unsorted-corpus classification pass; that flattens dependency
order and turns uncertain labels into hidden taxonomy.

## Construction History

Structural alternative considered: continue with the projection-contract
surface row as the next domino.

Why rejected or demoted: that path over-focuses on one retained remainder and
keeps a generic projection surface in view even though source evidence now
shows stronger architecture-backed destinations exist.

Structural alternative considered: gather artifact first.

Why rejected or demoted: artifact is real, but many artifact-looking rows are
actually about dependency IDs, tag registries, `requires`/`provides`, or effect
gating. Dependency-tag should be admitted first so artifact does not swallow
edge/tag governance.

Structural alternative considered: prune all fake `_blueprints` before
admitting any new destination.

Why rejected or demoted: pruning is real pressure, but doing it globally would
recreate broad-corpus classification. The better ordering is to prune false
sibling destinations inside bounded touched-row passes, then run a targeted
garbage or `_blueprints` pass only if the dependency-tag slice reveals that as
the next highest leverage move.

## Selection Commitments

In:

- Architecture-backed kinds and destination merges visible in docs, source, and
  unresolved Habitat rows.
- `_blueprints`, `_remainder`, and only-metadata-sorted rows only as evidence
  for the next bounded destination slice.
- Rows about dependency IDs, tag prefixes, tag registries, `requires`,
  `provides`, effect gating, artifact IDs, artifact schemas, artifact
  publication, and artifact reads.
- Explicit not-blueprint calls for over-split or fake destinations.

Foreground:

- Dependency-tag before artifact.
- Merge before split when two labels describe one constructible thing.
- The owner container over an output label when the output itself is not
  constructible.
- Garbage pressure as a real outcome, not a failure to find ontology.
- Touched-row pruning inside bounded slices.

Exterior:

- Generic projection as a blueprint.
- Config-surface as a blueprint.
- Adapter-boundary as a blueprint.
- Effect-tag as a sibling blueprint separate from dependency-tag.
- Artifact-contract as a sibling blueprint separate from artifact.
- Domain-operation-strategy as a blueprint before source proves independent
  constructibility rather than strategy-file cleanup.

## Hard Core And Protective Belt

Hard core:

1. `artifact` is a real blueprint kind, and its artifact contract belongs
   inside artifact authority rather than a sibling `artifact-contract`
   blueprint.
2. `dependency-tag` is a real blueprint kind; `artifact:*` and `effect:*` are
   tag kinds under it, not separate blueprint destinations.
3. `config-surface`, `adapter-boundary`, and generic `projection` are not
   blueprints now.
4. Dependency-tag gathering was the correct first move because it clarified
   edge semantics that otherwise made artifact, effect, projection, and config
   rows look more tangled than they were.
5. After dependency-tag, the next branch is selected by the changed tree:
   artifact gathering if artifact-value/schema/publication rows become clear,
   otherwise targeted garbage or `_blueprints` pruning.

Protective belt:

- Config may later become a niche or a narrow public-config/map-config owner,
  but not a blueprint by default.
- Adapter and projection pressure may later become specific enforcement or
  projection surfaces if a bounded slice proves a real owner.
- A slice may create an empty destination when the destination is source-backed;
  emptiness then becomes evidence that current rows need positive refactoring
  before they can fill it.
- Some Studio, platform, docs, or toolkit `_blueprints` may later prove real
  kinds, but they must pass the same constructibility test instead of inheriting
  authority from folder names.

## Decided Destination Set

Affirmed or ready-to-admit blueprint destinations:

- `recipe`
- `recipe-stage`
- `recipe-step`
- `domain`
- `domain-operation`
- `domain-operation-strategy`
- `mod-map`
- `dependency-tag`
- `artifact`

Niches and holding lanes, not blueprints:

- `civ7/mapgen/pipeline/config`
- `civ7/mapgen/pipeline/contracts`
- `civ7/mapgen/pipeline/runtime`
- `civ7/mapgen/map-output`
- `civ7/mapgen/studio`
- `civ7/platform`
- concrete domain contexts such as `foundation`, `morphology`, `hydrology`,
  and `ecology`

Not blueprint destinations now:

- `config-surface`
- `effect-tag`
- `artifact-contract`
- `adapter-boundary`
- generic `projection`
- `worker-bundle`
- `dev-runner`
- `runtime-dependencies` (resolved for MapGen visualization by Domino 43)

Supersession note: Domino 52 later admitted `domain-operation-strategy` after
source/docs proved independent constructibility through the operation strategy
envelope, `defineOp`/`createOp`/`createStrategy` binding, and 104 current
strategy implementations across six domains. The original exclusion remains
valid only as a warning against admitting strategy-file cleanup by path label
alone.

## Garbage And Pruning Pressure

Strong cleanup or pruning pressure exists in:

- foundation strategy, rules-index, and shim rows;
- morphology legacy/effect/config/overlay rows;
- `pipeline/config/_remainder/prohibit_wrapper_only_advanced_config`;
- `pipeline/cutover/_remainder`;
- hydrology and morphology legacy config-key rows;
- Studio `_blueprints` that look like service/build checks rather than
  constructible kinds.

Supersession note: `validate_ecology_op_contract_quality` retired after generic
MapGen Grit authority absorbed its JSDoc rail and its Ecology-only source proxy
proved unfit to validate composed TypeBox values.

Do not delete these rows just because they are noisy. Garbage collection should
mean one of: behaviorless legacy cleanup can retire, a stronger positive rule
replaces the negative proxy, a duplicate row consolidates into an existing
owner, or a candidate destination is visibly demoted out of `_blueprints`.

## Immediate Domino Sequence

### Landed: Dependency Tag Blueprint Gathering

Affirm `.habitat/blueprints/dependency-tag/` and gather whole-rule authority
about dependency tag IDs, tag prefixes, tag registries, `requires`/`provides`,
and effect gating when the whole predicate fits dependency-tag governance.
Explicitly prevent `effect-tag`, `tag-catalog`, `projection-contract`, and
`config-surface` from becoming sibling blueprints in the touched slice.

Leave artifact-value, artifact-schema, publish/read, and immutable value-store
rules for artifact unless the whole predicate is dependency-tag governance.

### Then: Re-read And Choose Artifact, Garbage, Or `_blueprints` Pruning

After dependency-tag movement, re-read the changed tree. Choose the next move
from the state it creates:

- run Artifact Blueprint Gathering if artifact value/schema/publish/read rows
  now have a coherent whole-rule input set;
- run a targeted garbage pass if the dependency-tag slice exposes mostly
  duplicate negative proxies or obsolete cleanup rows;
- run a targeted `_blueprints` pruning pass if false candidate destinations
  still bias the next move more than any real destination does.

This is a decision gate, not permission to run a broad corpus campaign.

## Reframe Conditions

Reframe before the next implementation if:

- dependency-tag cannot be distinguished from artifact as an independent
  constructible/governable kind;
- most dependency-tag candidates require new config, projection, import-law,
  or package-graph surfaces;
- artifact gathering would require splitting artifact from artifact contract;
- `effect-tag` has to become a separate sibling blueprint to make the slice
  work;
- the branch produces only docs or labels without moving, demoting, deleting,
  or proving a concrete authority surface.

Degeneration trigger: if two consecutive big-swing destination slices create
new destinations but mostly leave rows in `_remainder` without pruning false
siblings or naming stronger positive replacements, stop and run a garbage or
candidate-pruning frame before admitting another kind.

## NOT HOW

This frame does not prescribe exact branches, prompts, file moves, or Graphite
subjects. It decides the destination shape and ordering. Implementation prompts
own the actual bounded input set, movement, validation, review, and commit.
