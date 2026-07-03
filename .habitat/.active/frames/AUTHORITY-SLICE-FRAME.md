# Authority Slice Frame

Status: normative frame for bounded Habitat authority-slice work

Built: 2026-06-29

Owner: DRA Habitat authority-tree workstream

Durability: standalone reference for stateless agents taking one bounded slice
from transitional rule packets toward blueprint, niche, capability, and
instance authority.

## Scope And Provenance

This frame governs the next class of Habitat work: bounded slices that move
current rule manifests out of transitional packet organization and toward the
authority model in `AUTHORITY-ONTOLOGY.md`.

Source pointers:

- `AUTHORITY-ONTOLOGY.md`: normative definitions for blueprint, instance,
  capability, niche, and admission.
- `AUTHORITY.md`: current authority rules and location-independent manifest
  constraint.
- `DOMINO-FRAME.md`: higher-level domino selection frame.
- `.habitat/.active/dominoes/README.md` and `.habitat/.active/dominoes/index.md`:
  active sequence surface that points to this frame for slice work.
- Current `.habitat/**/rule.json` manifests: evidence inventory, not ontology.
- Current repository source tree: instance evidence, not automatic authority.

In scope:

- One bounded input group at a time.
- Current rules, runner files, baselines, and source paths needed by that group.
- Coarse movement toward the correct authority owner.
- Local decisions that reduce future states for the next slice.

Out of scope:

- Whole-corpus classification snapshots.
- Global cleanup, deletion, or consolidation before the slice has moved.
- Treating current folder names, packet names, runner names, or defect names as
  concepts.
- Final global schema design for blueprint, instance, capability, niche, or
  admission manifests.
- Renaming `pathCoverage`, `scanRoots`, or runner behavior unless the bounded
  slice proves it is necessary.

## WHAT

This frame treats the bounded slice as the unit of analysis. The primary signal
is not "which current bucket contains this rule," but "which constructible kind
or governed context should own the rule once the current evidence is made less
misleading." Most current rules are assumed to be incomplete definitions of
rules for kinds until proven otherwise. The work should therefore move one
known dependency pocket into the most truthful coarse authority shape, let that
changed structure reveal the next problem, and avoid flattening relationship
chains into whole-corpus metadata snapshots.

## WHY

The prior tempting frame was "classify all rules into blueprints,
capabilities, niches, and obsolete rows." That would flatten dependency chains
and freeze the current bad categories as data. The better frame is bounded
state change: choose a known slice, move the rules that are obviously about
the same kind family, preserve honest remainder buckets, and re-evaluate only
after the system shape has changed. This matters because many current rules
look special-case or niche-owned only because the blueprint rule they should
belong to has not yet been completed.

## Construction History

Structural alternative considered: global rule inventory classification.

Why rejected: it produces a broad snapshot but not a structural change. It
would hide dependency order and make stateless agents overfit to current packet
labels.

Structural alternative considered: move current "blueprint" buckets as-is.

Why rejected: current buckets such as `standard-recipe` can be instance or
context evidence rather than blueprint authority. Moving them as blueprints
would preserve the misconception under a cleaner path.

Chosen frame: bounded kind-family slice. The slice starts from a known current
evidence pocket, identifies the prescribed blueprints and coarse remainder
contexts, performs a mechanical movement for that pocket, then re-reads the
changed system before selecting the next pocket.

## Selection Commitments

In:

- Bounded input groups with visible dependency chains.
- Rules that currently look special-case but may be incomplete blueprint
  governance.
- Current source paths as evidence for instances and anchor grammar.
- Current `rule.json` manifests as stable rule identity and execution records.

Foreground:

- Blueprint kind before named variant.
- Correct-most enclosing owner before perfect final ontology.
- Coarse sorting before cleanup and consolidation.
- State-changing moves before additional ledgers.
- Explicit uncertainty where a rule might later move from niche to blueprint or
  from blueprint to niche.

Exterior:

- Whole-corpus metadata snapshots.
- Treating `standard-recipe`, `foundation-domain`, `morphology-domain`, or
  similar current packet labels as blueprints by default.
- Calling every semantic remainder a domain. In MapGen, `domain` is a specific
  pipeline concept, not a synonym for governed area.
- Creating capabilities because a rule is cross-cutting in one slice.
- Consolidating bad rules before the owning kind is clearer.

## Hard Core And Protective Belt

Hard core:

1. A blueprint is a constructible kind, not a named concrete variant, current
   folder, runner, defect label, or one-off context.
2. Current rule packets are evidence. They do not decide ontology.
3. A bounded slice must change structure before its lessons are generalized.
4. Capabilities and niches are admitted only when blueprint ownership cannot
   truthfully own the rule.
5. `rule.json` identity and explicit runner/support-file references remain stable
   while physical placement changes.

Protective belt:

- Exact directory names for future `blueprints`, `niches`, `capabilities`, and
  rule folders may change.
- Category/aspect vocabulary may remain in manifest metadata while physical
  ownership moves.
- A current named variant may become an instance, a transitional niche, or a
  later same-kind child blueprint after slice evidence is inspected.
- Rules may be marked for later deletion or consolidation, but only obvious
  dead/conflicting rows should be deleted during the movement slice.
- Initial slices may leave explicit "revisit after movement" notes when a rule
  is correct relative to the bounded pocket but not globally settled.

## Working Classification Criteria

Use these criteria in this order.

### Blueprint

Classify as blueprint authority only when the rule governs a constructible
kind.

Ask:

- Can there be multiple instances of this kind?
- Does the kind have an anchor grammar or canonical shape?
- Could Habitat generate, validate, migrate, or repair an instance of it?
- Does the rule describe what must remain true for every valid instance?

If yes, the rule belongs under the blueprint for the kind.

If the label is a named concrete variant, such as `standard recipe`, do not
promote it to blueprint by default. First test whether the real blueprint is
the more general kind, such as `recipe`.

### Instance Or Transitional Context

Classify as instance/context evidence when the rule applies to one current
concrete example rather than all instances of the kind.

Ask:

- Is this about the current Swooper Maps standard recipe specifically?
- Would another recipe instance validly differ?
- Is the rule enforcing temporary cutover state or historical cleanup?

If yes, keep it in a coarse context or transitional niche until instance
manifests exist.

### Niche

Classify as niche authority only when the rule governs an operable space that
admits instances by accepted facts.

Ask:

- Is this about governance across different kinds?
- Does the rule express membership, maintenance, review, or policy for a space?
- Would moving it under one blueprint weaken or misstate the rule?

If yes, use a niche. Keep the niche coarse. Do not oversplit by every current
folder or subject label.

### Capability

Classify as capability only when the rule describes a reusable attachable
behavior or operational concern that can apply across blueprint kinds.

Ask:

- Is this behavior selected or activated by an instance?
- Can multiple blueprint kinds use it without redefining the kind?
- Is the rule not merely a required part of one blueprint's governance?

If uncertain, keep the rule as blueprint governance for the current slice.
Creating premature capabilities increases state space.

### Obsolete, Weak, Or Consolidation Candidate

Mark for later cleanup when a rule is:

- a negative loose assertion that should become a positive strict rule;
- a historical cutover guard whose source condition is gone;
- duplicative with a stronger rule in the same correct owner;
- enforcement for a bad pattern that should not survive the new model.

Do not make global cleanup the first move. Cleanup follows ownership clarity.

## Slice Method

1. Pick one known dependency pocket.
2. Name the general kind family before looking at current packet labels.
3. Identify the smallest prescribed blueprints for that kind family.
4. Identify the minimum semantic remainder contexts needed to keep honest facts
   out of the blueprints.
5. Move rules into the correct-most enclosing owner for this bounded pocket.
6. Preserve `id`; update `placement`, runner file refs, artifact refs, and docs
   as needed.
7. Run focused Habitat proof.
8. Re-read the changed structure before selecting the next bounded slice.

Do not produce a broad corpus ledger unless it directly drives the current
slice movement. A ledger that does not change structure is not a completed
slice.

Two placement rules from the first slice now govern future slices:

- Concrete instance topology, exact order, and artifact parity stay in a
  coarse current-context bucket until they are generalized into kind rules.
- Rules that mix a candidate kind with adjacent domain or runtime concerns
  stay under the coarse owning context until a later slice can split the
  rule cleanly.

## First Working Example: Recipe Kind Pocket

The first bounded input group is the Recipe Kind Pocket.

Primary evidence input:

- `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/**`
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/*`
- `mods/mod-swooper-maps/src/recipes/standard/stages/*/steps/*`

Secondary evidence input, only when needed by a recipe/stage/step rule:

- `.habitat/civ7/mapgen/pipeline/rules/**`
- `.habitat/blueprints/domain/**`
- `.habitat/civ7/mapgen/domains/rules/*/**` rows that point
  directly at recipe stage or step contracts.
- `.habitat/civ7/mapgen/map-output/_blueprints/map-projection/**` rows that
  point directly at recipe projection steps.

Do not include all MapGen domain, map-output, studio, SDK, visualization, or
core rules in this first slice.

### Prescribed Blueprints

`recipe`

: Constructible kind for authored generation recipes. This is the blueprint.
  `standard recipe` is not the blueprint. It is current Swooper Maps evidence
  for the recipe kind and may later become an instance or a context/niche fact.

`recipe-stage`

: Constructible kind for a stage that participates in a recipe. Stage names
  such as `foundation-lithosphere`, `map-rivers`, or `placement` are current
  instances or later specializations only if explicitly admitted as same-kind
  child blueprints.

`recipe-step`

: Constructible kind for a step inside a recipe stage. Step contract shape,
  runtime purity, dependency/effect declarations, and local boundaries are
  likely blueprint governance for this kind.

Do not admit `standard-recipe` as a blueprint. Do not admit
`domain-operation`, `operation-strategy`, or `map-projection` in the first
recipe slice unless a rule cannot be honestly placed under recipe, stage, step,
or a coarse remainder context.

### Initial Remainder Contexts

`swooper-maps`

: Product/mod context. Use when a rule is tied to the Swooper Maps mod rather
  than the recipe kind.

`swooper-maps-standard-recipe`

: Transitional context for the concrete current standard recipe evidence. Use
  when a rule is about this named current recipe example rather than every
  recipe.

`mapgen-pipeline`

: Optional coarse niche for orchestration or generation policy that crosses
  recipe instances and is not truthful as recipe blueprint governance.

Do not introduce `foundation-domain`, `morphology-domain`, `ecology-domain`,
or similar remainder niches in this slice unless a specific rule forces the
distinction. In MapGen, `domain` has a specific pipeline meaning and must not
become a generic remainder label.

### Rough Rule Organization Plan

Moved `recipe` blueprint governance:

- recipe-level runtime domain operation bundle imports.

Moved `recipe-stage` blueprint governance:

- sibling stage private step import boundaries;
- stage surface requirements that apply to all valid stages.

Moved `recipe-step` blueprint governance:

- typed dependency and effect tags;
- direct recipe-step contract roots.

Moved to `swooper-maps-standard-recipe` transitional context:

- declared stage keys;
- runtime stage order against the current contract manifest;
- public authoring surface;
- recipe artifact relationship to current source stages;
- stage topology and path invariants;
- full profile stage root requirements;
- migrated consumer effect gating tokens.

Moved to coarse `mapgen-pipeline` context until a later split:

- no bare value export-all from contract surfaces;
- no empty object defaults in contract schemas;
- no runtime validation/compiler imports;
- no runtime calls to `runValidated`;
- no runtime local config default merging.

Likely transitional context or later cleanup:

- legacy stage aliases and cutover shims;
- wrapper-only advanced config;
- ecology fudge terms and legacy generator surface prohibitions;
- rules that only exist because the current standard recipe is mid-migration.

Potential later adjacent slice, not first:

- domain operation kind;
- operation strategy kind;
- map projection kind;
- generated map entrypoint kind.

## Reframe Conditions

Force a reframe if the recipe slice cannot place most current standard-recipe
rules under `recipe`, `recipe-stage`, `recipe-step`, or one coarse transitional
context without inventing a broad replacement taxonomy.

Run a reframe diagnostic if two consecutive bounded slices:

- create more capability or niche buckets than blueprint-owned rules;
- preserve current packet labels as ontology;
- add ledgers without moving, demoting, deleting, or proving a concrete
  authority surface;
- require the user to restate that current named variants are not blueprints.

## Assumptions Committed

- The current `rule.json` manifest model is stable enough for physical
  reorganization.
- `standard recipe` is current evidence, not a blueprint.
- The first useful general kind family is recipe -> stage -> step.
- Cleanup and consolidation become cheaper after ownership movement.
- Exact final layout remains open; this frame governs classification and slice
  discipline, not final schema syntax.

## How This Document Changes

After each bounded slice, update this document only when the slice teaches a
general rule for future slices. Do not turn it into a slice log. Slice-specific
evidence belongs in the branch's workstream record or the changed authority
objects themselves.
