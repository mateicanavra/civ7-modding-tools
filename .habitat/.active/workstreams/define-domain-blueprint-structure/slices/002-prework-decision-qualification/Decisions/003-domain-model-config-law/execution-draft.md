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

## Draft Execution Workstream

### Scope Contract

Objective: execute the complete active `Domain Model Config Law` disposition
ledger in `second-pass-disposition.md`, not a smaller first mechanical slice.

Included:

- all active work rows in `second-pass-disposition.md`;
- all keep/no-op proof rows needed to prove no accidental drift;
- pure mechanical rows with exact destinations;
- coupled mechanical rows where the destination is fixed but the executor must
  move through caller, public-stage, import, package-boundary, or classifier
  proof together.

Excluded:

- row `S06`, the resource expected-count/data-contract question, which is
  explicitly tracked in `resource-policy-data-contract.domino.md`;
- unrelated full domain-blueprint topology ratcheting outside this config-law
  packet.

The workstream is one end-to-end burn-down, but it is not one flat refactor.
Each stage closes a class of rows, gets reviewed, runs its proof gates, and only
then feeds the next stage. Agents may work in parallel inside a stage when
their write sets are distinct, but row ownership remains visible throughout.

### Workstream Operating Model

Each stage uses a cascading-depth loop:

1. Start from the final ledger rows, not from opportunistic source searches.
2. Assign each row to one lane with a concrete owner and proof gate.
3. Let the lane follow cascading references until that row class is fully
   closed; do not stop at the first import rewrite if public exports, generated
   surfaces, or stage compile paths still depend on the old shape.
4. Run local checks for that lane, then a fresh review loop for the stage.
5. Repair accepted findings before entering the next stage.

Pure mechanical rows go first because they reduce import pressure and remove
false owners. Coupled mechanical rows follow once their prerequisites are
present; they are still deterministic, but they require deeper local proof.

### Stage 0: Preflight And Pattern Readiness

Objective: confirm the destination rails and ledger authority before source
movement.

Changes:

- treat `second-pass-disposition.md` as the active ledger;
- treat `results-corpus.md` as historical first-pass input only;
- treat this document as the execution plan draft to be hardened, not source
  authority;
- confirm the operation contract, recipe stage authoring, and domain
  schema/policy patterns are available as execution proof rails;
- confirm `S06` remains the only tracked-later row.

Gate:

- no active document presents `model/config/` as a destination;
- every non-`S06` row has a stage assignment or explicit no-op proof role;
- pattern checks are structural Habitat checks, not behavior tests.

### Stage 1: Pure Mechanical Owner Materialization

Objective: materialize exact owners for rows that do not require public-stage
recomposition or package-boundary splits.

Lane A, direct policy moves:

- `P01`;
- `P02`;
- `P04a` through `P04d`;
- any exact policy import rewrites needed by those rows.

Lane B, exact stage knob reroutes:

- `K02`;
- `K03`;
- `K04b` through `K04d`;
- `K05a` through `K05d`.

Lane C, single-owner operation contract inlines:

- `O01`;
- `O04`;
- `O08`;
- any other operation-local config file proven not to participate in a coupled
  stage public surface during execution.

Lane D, exact local helper cleanup:

- `O10`, inlining `assertSameMountainFamilySelection` into
  `morphology-features/steps/mountains.ts`;
- no operation-family config bucket remains for that helper.

Acceptance:

- all lane rows import from their exact owner destinations;
- old source exports have zero importers or are carried forward only for a
  later stage explicitly named below;
- operation/stage behavior checks remain green for touched projects;
- review verifies no coupled row was partially changed and left unresolved.

### Stage 2: Coupled Operation Contract And Stage Public Recomposition

Objective: close the operation rows whose config files are entangled with stage
public authoring surfaces or operation-family contract recomposition.

Lane A, operation contract plus stage-public recomposition:

- `O02`;
- `O03`;
- `O05`;
- `O06`;
- `O07`;
- affected stage rows `ST07` through `ST10` where their public authoring
  surface composes the old operation config material.

Lane B, operation-family contract decomposition:

- `O09`;
- the `plan-ridges`, `plan-foothills`, and `plan-rough-lands` contract
  destinations;
- any stage-local mountain public mapping needed by `ST10`.

Lane C, duplicated/localized stage knobs:

- `K01`;
- `K04a`;
- affected stage rows `ST01`, `ST02`, `ST11`, and `ST12`.

Acceptance:

- operation `contract.ts` files own their input/output/strategy/default schema
  envelopes;
- no full operation envelope is extracted to `model/schemas`;
- stage public surfaces still own authoring UX and compile behavior;
- all old operation `config.ts` imports are zero or assigned to the next
  facade-retirement stage with an explicit dependency.

### Stage 3: Domain Primitive And Artifact-Support Extraction

Objective: extract the narrow accepted primitives/support schemas and prove the
rejected candidates stayed with their owners.

Lane A, accepted domain schema primitives:

- `S01`, moving `FeaturePlacementSchema` to
  `ecology/model/schemas/feature-placement.schema.ts`;
- `S02`, moving internal `BiomeSymbolSchema` to
  `ecology/model/schemas/biome-symbol.schema.ts` only after classifier trace
  proof against `BiomeSymbol` and `BIOME_SYMBOL_ORDER`.

Lane B, artifact-owned support:

- `S03`, moving `HydrologyWindFieldSchema` to
  `hydrology-climate-baseline/artifacts/wind-field.schema.ts`;
- `S04`, proving foundation tectonic scalar fields remain artifact-owned.

Lane C, rejected primitive proof:

- `S07`;
- `S08`;
- any broad config envelope encountered during Stage 2 that looks reusable by
  name but is operation-local or scorer-local by semantics.

Acceptance:

- accepted primitives have semantic names and owner barrels only where useful;
- artifact support stays with artifact files, not domain model schemas;
- rejected primitives are documented as keep/no-op proof rows, not ignored.

### Stage 4: Projection Boundary And Recipe-Root Helper Split

Objective: split projection-facing config residue into owning map stages and
external Civ7 package boundaries.

Lane A, Civ-visible projection policy:

- `P03`, moving navigable river projection policy to
  `map-rivers/riverProjectionPolicy.ts`;
- `ST20`, proving map-rivers remains the owner of projection authoring.

Lane B, official biome binding boundary:

- `S05`, splitting official biome-global vocabulary to
  `packages/civ7-map-policy/src/biome-globals.ts`;
- `MP05` and `ST21`, moving the TypeBox binding schema/helper to
  `map-ecology/biome-bindings.ts` and keeping runtime/global access at the
  adapter boundary.

Lane C, recipe-root map projection helper split:

- `MP01` plus `ST17`;
- `MP02` plus `ST18`;
- `MP03` plus `ST19`;
- `MP04` plus `ST20`;
- import-zero proof for `map-projection-public-config.ts`.

Acceptance:

- no domain model/schema file owns official Civ7 vocabulary or engine globals;
- no recipe-root `map-projection-public-config.ts` helper remains as a durable
  authority surface;
- each map stage owns its own public/knob projection surface or proves the
  surface is empty and removable under stage-shape law.

### Stage 5: Facade Retirement And Deletion Residue

Objective: delete config facades and stale aggregate files only after all owner
paths are live.

Rows:

- `D01`;
- `D02`;
- `D03`;
- `D04`;
- `D05`;
- any old operation-local `config.ts`, shared knob/multiplier, or recipe-root
  helper files left empty by Stages 1-4.

Acceptance:

- no source or generated/public export imports from root/per-domain
  `config.ts` facades unless a reviewed public API decision explicitly keeps
  one;
- deleted files have source import-zero proof and generated/public surface
  proof where relevant;
- old facade paths are not replaced by a new broad bucket under another name.

### Stage 6: Keep-Row Proof And Closure

Objective: prove the rows intentionally left in place did not move by accident
and still match their accepted owner class.

Rows:

- `ST01` through `ST06`;
- `ST09` through `ST16`;
- `ST18`;
- `ST20`;
- `ST22`;
- `S04`;
- `S07`;
- `S08`;
- any keep/no-op row touched indirectly by implementation.

Acceptance:

- keep rows have explicit proof labels in the execution record;
- P1/P2 review findings are repaired before closure;
- behavior tests, TypeScript checks, Habitat pattern checks, and import scans
  are recorded separately;
- `S06` remains the only non-closed row and is visibly tracked in its domino
  file.

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

This is the stopping point for the full config-law execution pass. There should
be no active config-law row left unresolved except `S06`, which is deliberately
outside this slice and tracked as its own domino.

Remaining work after this execution is not config-law disposition. It belongs
to later full topology ratcheting or to the resource data-contract domino.

## Review Target For Next Turn

The next review team should evaluate:

- whether this stage structure covers every non-`S06` row in
  `second-pass-disposition.md`;
- whether the pure-mechanical and coupled-mechanical split is useful for agent
  lane assignment;
- whether any coupled stage needs to be split further to avoid write-set
  collision;
- whether the operation contract, stage authoring, domain schema/policy, and
  projection-boundary patterns are strict enough to make execution mechanical;
- whether the proof gates are sufficient to close the whole config-law packet
  without slipping into unrelated domain-blueprint topology enforcement.
