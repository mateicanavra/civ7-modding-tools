# Domain Model Config Law Mechanical Execution Draft

Status: draft input, superseded for disposition by `second-pass-disposition.md`

Prepared at: 2026-07-04

Purpose: capture the mechanical execution sequence implied by the config-law
discriminator before a fresh review team works it over. This is not final
execution authority yet.

Active disposition source of truth: `second-pass-disposition.md`.

Before this draft can become an execution plan, it must be hardened against the
final row-by-row ledger in `second-pass-disposition.md`. If this draft conflicts
with that ledger, the ledger wins.

## Core Discriminator

`config` is not a valid domain authority category.

The current code uses `config` for several different concepts. The first
mechanical gain is to stop treating those concepts as siblings and route each
surface to its real owner.

Accepted owner classes:

- Operation contracts: operation input, output, and strategy schemas live with
  the operation `contract.ts`.
- Domain model schemas: reusable semantic schema fragments, value-object
  schemas, enums, and small object contracts that more than one operation or
  stage may compose.
- Domain model policy: reusable semantic constants, lookup tables, resolver
  functions, and multiplier policy.
- Stage authoring surfaces: `public`, `knobsSchema`, public-to-internal
  `compile`, and local stage composition.
- Facade residue: root or per-domain barrels that exist only to aggregate old
  config-shaped exports.
- Deletion residue: stale aggregate schemas or files with no live caller after
  import/export proof.

Rejected owner classes:

- `model/config/` as a generic destination.
- Per-domain root `config.ts` as authority.
- Operation-local `config.ts` as a permanent schema owner.
- Generic operation-family `shared/config.ts` as a permanent contract bucket.
- Extracted operation input/output schemas outside their operation contract.

## Mechanical Target Shape

### Hardening Patterns Required Before Full Execution

The full hardening pass must resolve three destination-pattern questions before
mechanical source movement is treated as closed. These are Habitat pattern
targets, not behavior tests. Tests may prove runtime behavior, but they must not
be the structural ratchet for topology or file shape.

#### 1. Operation Contract File Shape

The operation contract destination must be patternable before operation
`config.ts` files are inlined.

Required direction:

- operation input, output, strategy, and default schemas live in the owning
  operation `contract.ts`;
- operation contracts may import reusable domain schema primitives from
  `model/schemas/`;
- operation contracts may import reusable domain policy from `model/policy/`
  only when the contract needs policy-owned constants or defaults;
- operation contracts must not import operation input/output envelopes from a
  sibling `config.ts`, shared operation-family config bucket, or root domain
  config facade;
- extracted full operation input/output schemas are forbidden outside the
  operation contract definition site.

Pattern intent:

- primarily enforce forbidden imports and forbidden owner paths;
- optionally enforce local contract export shape once the existing contract
  pattern is reviewed;
- prevent mechanical inlining from accumulating dead support files or new
  config-shaped buckets.

This pattern is the destination guard for Stage 1 and Stage 2.
It is admitted as an advisory Habitat rule while known current rows remain red;
Stage 1/2 closure must promote it to enforced with an empty baseline after the
contract cleanup burns down those rows.

#### 2. Recipe Stage Authoring File Shape

The recipe stage destination must be patternable before the public-authoring
cleanup goes beyond obvious empty or wrapper-only cases.

Required direction:

- stages own `public`, `knobsSchema`, `compile`, and public-to-internal step
  construction;
- recipe stages may import domain schemas from the owning domain
  `model/schemas/` barrel when composing a public authoring schema;
- recipe stages may import domain policy from the owning domain
  `model/policy/` when applying semantic policy to stage compile behavior;
- recipe stages must not import root or per-domain `config.ts` facades;
- recipe stages must not import operation-local `config.ts` files;
- stage authoring helpers, if allowed outside `index.ts`, must live under the
  owning stage directory and must not become a recipe-wide or domain authority
  surface;
- root-level `*-public-config.ts` helpers under `recipes/standard/stages/` are
  residue, not a destination pattern.

Open shape choice for review:

- strict inline model: `public`, `knobsSchema`, and `compile` are all defined
  in the stage `index.ts`; or
- stage-local support model: stage-local schema/helper files are allowed, but
  only under the stage directory and only with constrained imports.

Either model is acceptable if the pattern makes the stage the only owner of
authoring configuration.

This pattern is the destination guard for Stage 5 and for any reroute that
moves config-shaped stage helper material.
It is admitted as an advisory Habitat rule while known current rows remain red;
Stage 5 closure must promote it to enforced with an empty baseline after
domain-config facade imports and recipe-root public-config helpers are burned
down.

#### 3. Domain Schema And Policy Export Shape

The domain primitive/policy destinations must be patternable before config
facades are retired.

Required direction:

- reusable semantic schema primitives live under `model/schemas/`;
- reusable semantic policy lives under `model/policy/`;
- both areas may expose local `index.ts` barrels;
- root/per-domain `config.ts` files are not replacement barrels for these
  areas;
- domain schemas must not contain full operation input/output envelopes;
- domain policy must not contain stage-only public authoring composition.

Pattern intent:

- make recipe imports simple: stages import domain-owned primitives from one
  domain schema source and policy from one policy source;
- avoid swapping the old `config.ts` facade for a new broad bucket with a new
  name;
- leave topology ratcheting for the wider domain blueprint until the prework
  rows have been burned down.

This pattern is the destination guard for Stage 3 and Stage 4.
It is admitted as an enforced Habitat rule now because the current tree is green
for the accepted `model/schemas` and `model/policy` destinations.

### Operation Contracts

Operation input, output, and strategy schemas must be defined at the operation
contract definition site.

If an operation currently imports its schema from `./config.js`, the default
mechanical disposition is:

1. Move the operation-owned schema declarations into the operation
   `contract.ts`.
2. Keep the operation contract export surface stable where possible.
3. Delete the operation-local `config.ts` once no importers remain.

This applies when the schema exists only to describe that operation's contract.
It does not require a semantic investigation beyond verifying that the schema is
not actually reused as a domain primitive.

### Shared Operation Schema Material

If an operation `config.ts` file exists because several operations need the same
schema material, do not preserve a generic shared config bucket.

Decision rule:

- shared operation input/output envelope: reject extraction; each operation
  recomposes its own contract at its own `contract.ts`;
- shared semantic fragment inside those contracts: extract the fragment into
  the owning domain's `model/schemas/` area, then import and compose it from
  each operation contract;
- shared semantic policy/defaults: extract to `model/policy/`, not
  `model/schemas/`;
- stage-only authoring shape: keep with the owning stage.

The goal is to share primitives, not extracted operation contracts.

### Domain Model Schemas

The domain model schema area exists to make legitimate reusable domain concepts
easy to import without reintroducing a config facade.

Draft destination:

```text
mods/mod-swooper-maps/src/domain/<domain>/model/schemas/
```

Expected shape:

- one file per semantic concept or closely coupled concept family;
- a local `index.ts` barrel for the domain schema exports;
- schemas may be imported by operation contracts and recipe stages;
- schemas must not become a dumping ground for operation input/output envelopes;
- names should describe the semantic object, not the caller that happens to use
  it first.

Open naming question for review: `model/schemas/` is preferred over
`model/dto/` because the expected objects are semantic TypeBox schemas, not
transport-only DTOs.

### Domain Model Policy

Reusable constants, resolver functions, knob multipliers, lookup tables, and
semantic defaults route to:

```text
mods/mod-swooper-maps/src/domain/<domain>/model/policy/
```

Policy is not config. Policy can be consumed by stage `compile` functions,
stage steps, and operation implementation code when the owner is genuinely
domain semantic policy.

If a policy exists only to map one stage's authoring knobs into internal step or
operation settings, it may be stage-local instead.

### Stage Authoring Surfaces

Stages own authoring configuration.

Stage-owned surfaces include:

- `public` schemas;
- `knobsSchema`;
- `compile`;
- stage-local helper functions that map author intent to internal step config;
- stage-local step composition.

Mechanical draft rule:

- all stage config construction should be owned by the stage directory;
- root-level `*-public-config.ts` helper files are not the destination;
  authoring helpers must be inline or stage-local under the owning stage
  directory;
- a later stage-shape law should decide whether those helpers must be folded
  into the stage `index.ts`, moved under a stage-local support file, or split by
  substage.

This draft does not authorize global public-schema deletion. Empty or
wrapper-only public schemas are cleanup candidates, but policy-bearing public
schemas stay stage-owned. The stage-shape rail for source/file ownership is a
Habitat Grit pattern; runtime-derived authoring-model checks may corroborate
currentness, but they are not the source/file-shape authority.

### Facade Residue

Root and per-domain `config.ts` files are transitional import surfaces, not
authority.

Known facade/residue class from the corpus:

- `mods/mod-swooper-maps/src/domain/config.ts`
- `mods/mod-swooper-maps/src/domain/foundation/config.ts`
- `mods/mod-swooper-maps/src/domain/hydrology/config.ts`
- `mods/mod-swooper-maps/src/domain/morphology/config.ts`
- `mods/mod-swooper-maps/src/domain/placement/config.ts`

Mechanical disposition:

1. Route each export to its real owner path.
2. Reroute imports to those owner paths or approved owner barrels.
3. Delete the facade only after source, generated/public export, and package
   surface checks prove no live dependency remains.

## Draft Execution Sequence

### Stage 0: Authority Patch

Objective: update the prework frame and Habitat scope language so the execution
team is not implementing against stale `model/config/` authority.

Changes:

- replace generic `model/config/` authority with `model/schemas/` and
  `model/policy/`;
- record that operations do not own config files, they own contracts;
- record that extracted operation input/output schemas are forbidden;
- record that shared semantic fragments are domain schema primitives and must
  be recomposed by each operation contract.

Gate:

- all active packet, decision-book, and scope references agree on the owner
  classes above;
- no document still presents `model/config/` as the target destination.

### Stage 0.5: Destination Pattern Drafts

Objective: draft the Habitat pattern destinations that make the mechanical
cleanup enforceable while it runs.

Changes:

- draft the operation contract file-shape pattern;
- draft the recipe stage authoring file-shape pattern;
- draft the domain `model/schemas/` and `model/policy/` export-shape patterns;
- keep these as draft or candidate pattern authority until reviewed.

Gate:

- each mechanical destination has a named pattern or an explicit accepted gap;
- the patterns are focused on structural ownership and imports, not behavior;
- the patterns do not enforce the full domain blueprint topology early;
- implementation slices can use the patterns as local proof targets without
  pulling unrelated existing code red.

### Stage 1: Operation Contract Consolidation

Objective: remove operation-local `config.ts` files where they are merely split
contract schema declarations.

Known candidates from the corpus:

- `foundation/ops/compute-crust-evolution/config.ts`
- `morphology/ops/compute-base-topography/config.ts`
- `morphology/ops/compute-coastline-metrics/config.ts`
- `morphology/ops/compute-geomorphic-cycle/config.ts`
- `morphology/ops/compute-sculpt-continental-margin/config.ts`
- `morphology/ops/compute-sea-level/config.ts`
- `morphology/ops/plan-island-chains/config.ts`
- `morphology/ops/plan-volcanoes/config.ts`

Decision criteria:

- if all exported schemas describe only the owning operation's strategy/default
  contract, inline them into that operation's `contract.ts`;
- if a nested schema is used by multiple operations because it represents a
  semantic concept, extract only that nested semantic primitive to
  `model/schemas/`;
- if a nested value is policy/default logic, extract to `model/policy/`;
- do not extract the operation's full input/output/strategy envelope.

Acceptance:

- candidate `config.ts` files are deleted or explicitly blocked with a named
  semantic reason;
- affected contracts own their schema definitions directly;
- imports no longer point to deleted operation config files;
- operation behavior and public contract shape remain equivalent.

### Stage 2: Operation-Family Shared Contract Decomposition

Objective: remove the generic operation-family config bucket without losing
shared semantic primitives.

Known candidate:

- `morphology/ops/mountains-shared/config.ts`

Decision criteria:

- operation-family full contract envelopes are not extracted as a shared config
  authority;
- stable semantic primitives move to `morphology/model/schemas/`;
- policy/defaults/guards move to `morphology/model/policy/` or the owning stage
  if they are public-authoring mapping logic;
- each operation contract recomposes its own contract from the accepted
  primitives.

Acceptance:

- no generic `mountains-shared/config.ts` owner remains;
- `plan-ridges`, `plan-foothills`, and `plan-rough-lands` each own their
  operation contract shape;
- any shared schema material has semantic names and domain model schema owner
  paths;
- any stage-only mountain public mapping remains in the
  `morphology-features` stage.

### Stage 3: Domain Schema And Policy Owner Paths

Objective: create the direct owner paths needed to retire config facades.

Changes:

- create domain-local `model/schemas/` barrels where real reusable schemas
  exist;
- route reusable semantic policy to `model/policy/`;
- do not create empty schema folders just to satisfy topology.

Decision criteria:

- schema if it defines reusable object shape or semantic vocabulary;
- policy if it defines reusable semantics, constants, lookup tables, or
  resolvers;
- stage-local if it only translates one stage's authoring surface;
- delete if no live caller and no accepted authority role.

Acceptance:

- each moved export has a real owner class;
- recipe stages import schemas from one domain schema source where applicable;
- no broad per-domain config facade is needed for schema or policy imports.

### Stage 4: Facade Retirement

Objective: remove or narrow root/per-domain config facades after owner paths are
available.

Changes:

- reroute imports away from `@mapgen/domain/<domain>/config.js`;
- delete `domain/config.ts` if source and public export checks permit;
- delete or replace per-domain `config.ts` files after imports route to
  `model/schemas/`, `model/policy/`, or stage-local files.

Acceptance:

- no stage or domain source imports from per-domain config facades;
- no root domain config facade exists unless a public API decision explicitly
  keeps it;
- generated/public package export checks are recorded before deletion claims.

### Stage 5: Stage Authoring Surface Cleanup

Objective: only after operation/domain owner paths are clean, simplify
stage-owned authoring surfaces where clearly mechanical.

Allowed now:

- delete empty public schemas where the stage has no authoring inputs;
- remove wrapper-only public schemas when the compiled result is identical to
  step defaults and no UX/policy is carried;
- move stage-only helper logic under the owning stage if it currently looks
  detached.

Forbidden in this mechanical pass:

- global public-schema deletion;
- moving public-authoring logic into domain model;
- extracting full operation contracts into shared domain schemas;
- using tests as structural/topology law.

Acceptance:

- every changed stage still owns its authoring surface;
- policy-bearing compile behavior is preserved;
- remaining messy public helper files are explicitly classified as semantic
  remainder, not hidden under config-law cleanup.

## Mechanical End State

When this draft is fully hardened and executed, the codebase should have only
one remaining authoritative concept of config in this area: recipe/stage
authoring config.

Expected closure state:

- operation files no longer use `config.ts` as a contract owner;
- operation contracts define their own input/output/strategy schema envelopes;
- reusable schema primitives are named as domain model schemas, not configs;
- reusable constants/resolvers/defaults are named as domain model policy, not
  configs;
- stage public authoring, knobs, and compile behavior remain stage-owned;
- root and per-domain `config.ts` facades are gone or explicitly preserved only
  by a reviewed public API decision;
- any remaining use of the runtime word `config` refers to the MapGen
  recipe/stage/step authoring model, not domain authority.

This is the stopping point for the mechanical bulk semantic resolution. After
that, the remaining questions should be topology and file-shape questions that
can be decided against clean owner classes rather than against an ambiguous
`config` bucket.

## Semantic Remainder After Mechanical Pass

This draft expects some rows to remain after the mechanical cleanup:

- exact stage definition file law;
- whether stage public helpers must be inline in `index.ts` or may live in
  stage-local support files;
- projection-vs-domain ownership for boundary schemas such as biome bindings;
- exact artifact-support-vs-model-schema ownership for reusable artifact field
  schemas;
- any repeated primitive that is semantically similar but not yet proven shared.

Those remainders should be smaller after the mechanical pass because operation
contract splits, generic config facades, and false `model/config/` authority
will no longer be obscuring the real questions.

## Review Target For Next Turn

The next review team should evaluate:

- whether the owner classes are complete and mutually exclusive;
- whether `model/schemas/` is the right destination name;
- whether forbidding extracted operation input/output schemas is too strict;
- whether operation-family contract decomposition should happen before or after
  simple operation contract consolidation;
- whether the stage authoring cleanup should stop at pattern drafting or also
  execute obvious empty/wrapper-only cleanup;
- whether the operation contract, stage authoring, and domain schema/policy
  destination patterns are strict enough to make the mechanical moves safe
  without enforcing the whole domain blueprint too early.
