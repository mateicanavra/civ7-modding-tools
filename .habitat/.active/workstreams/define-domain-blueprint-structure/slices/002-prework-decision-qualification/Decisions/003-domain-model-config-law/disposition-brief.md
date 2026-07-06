# Domain Model Config Law Disposition Brief

Status: historical executed brief; final ledger is `disposition.md`

Prepared at: 2026-07-04

Historical use only:
the imperative language below is preserved as the executed prompt/brief record.
Do not run it as current work. The current disposition authority is
`disposition.md`, and the current execution-planning surface is
`execution.md`.

Purpose: run a full row-by-row disposition pass over the existing config-law
corpus after the destination rails were clarified. This pass is investigation
and disposition only. It does not implement source moves, delete files, enforce
advisory rules, or harden the execution plan.

## Objective

Produce a deterministic disposition table for every row from the first-pass
investigation corpus.

Each row must end in one concrete action:

- `move`: source material moves to an exact owner file;
- `inline`: operation-owned schema material moves into the owning
  `contract.ts`;
- `recompose`: operations rebuild their own contracts from accepted primitives;
- `reroute`: imports move from a facade to exact owner paths;
- `delete`: the row has no retained owner after liveness/export proof;
- `keep`: the row remains where it is because that path is the exact owner;
- `track later`: the row is outside this config-law decision and is written to
  a named later domino or owning inventory reference;
- `needs destination`: the accepted owner classes still cannot place the row,
  with the missing owner-law question named.

Do not use "mechanical now", "mechanical after prerequisite", or "semantic
remainder" as row outcomes. Those are derived views over the action ledger
after this pass is complete.

## Non-Objectives

- No source implementation.
- No runtime or behavior changes.
- No Grit or Habitat enforcement changes.
- No broad public-schema removal.
- No execution-plan hardening beyond producing the disposition input that a
  later execution plan can consume.

## Authority Inputs

Read these before source inspection:

- `../../frame.md`
- `../../single-prework-decision-frame.md`
- `../../decision-runner-brief.md`
- `../../inventory.md`
- `../../../../decision-book/content-classes.md`
- `../../../../decision-book/move-classes.md`
- `../../../../decision-book/owner-boundaries.md`
- `.habitat/scopes/domain/`
- `.habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/`
- `.habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/`
- `.habitat/blueprints/domain/require_domain_model_schema_policy_owner_shape/`
- `investigation-brief.md`
- first-pass investigation corpus, preserved in Git history
- `execution.md`

Treat the first-pass investigation corpus as evidence, not as final disposition
authority.
Earlier "candidate owner" and "disposition lead" cells may be wrong under the
new destination rails and must be re-evaluated.

## Canonical Input Row Set

The required disposition ledger covers:

- every row from the first-pass corpus under `Durable Row-Level Corpus`;
- every row in `Public Stage Surface Table`;
- every row in `Domain Primitive And Operation Overlap Table` that is not
  already represented by a durable row;
- every row in `Facade And Import Pressure Table` that is not already
  represented by a durable row;
- any primitive candidate discovered by the Primitive Hunter, mapped back to
  the source rows that produced it.

The metrics table and opportunity-lane prose are evidence, not ledger rows.
If a group row expands into path/symbol rows during investigation, preserve the
expanded rows in the final ledger and keep the original group row as a parent
or evidence note.

## Destination Rails

The pass uses these accepted destinations:

- Operation contracts own operation input, output, strategy, and default
  schemas. Split operation `config.ts` declarations default to `inline` into the
  owning operation `contract.ts`.
- Operation-family shared config buckets are not a permanent owner. Shared
  semantic fragments may move to `model/schemas`; shared policy may move to
  `model/policy`; each operation contract recomposes its own envelope.
- Domain `model/schemas` owns reusable semantic schema fragments, enums, types,
  invariants, and object-local schema contracts that stages and operations
  compose. It does not own full operation envelopes or stage authoring surfaces.
- Domain `model/policy` owns reusable semantic constants, lookup tables,
  defaults, resolver functions, and multiplier policy. It does not own stage
  authoring composition.
- Artifact support is a valid destination when a fragment exists to support an
  artifact contract or artifact-owned validation shape. Artifact-owned
  fragments are not promoted to `model/schemas` just because an operation or
  stage also references them.
- Official Civilization 7 vocabulary, engine globals, resource identifiers,
  adapter-facing ids, and map-policy translation do not default to domain
  owners. Test `@civ7/types`, `@civ7/map-policy`, and adapter ownership before
  assigning any domain `model/schemas` or `model/policy` destination.
- Recipe stages own public schemas, `knobsSchema`, public-to-internal
  `compile`, projection-facing authoring behavior, and stage-local helpers.
- Root/per-domain `config.ts` files are transitional import facades or stale
  aggregates. They are not owners.
- If none of the above can place a row, record `needs destination` and name the
  missing law precisely.

## Workstream Shape

Run this as a systematic workstream:

```text
authority rails -> corpus rows -> row action ledger -> derived execution views
```

Keep row obligations visible. Group rows to reduce investigation cost, but do
not let a group hide a path, symbol, import surface, or missing proof.

## Required Output

Create `disposition.md` in this packet with:

1. A short frame confirming the accepted owner classes.
2. A row disposition table with these columns:

```text
| Row | Path/symbol | Current role | Final action | Exact owner/destination | Explicit non-owner | Required proof | Evidence strength | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

3. A derived view section generated from the row table:

```text
| View | Rows | Why |
| --- | --- | --- |
| execution-ready after normal proof | ... | ... |
| prerequisite-coupled | ... | ... |
| tracked later domino | ... | ... |
| needs destination law | ... | ... |
```

The derived view is allowed only after the row table exists.

4. A short "execution-plan implications" section naming what the later
execution plan can do mechanically and what it must exclude.

## Investigation Lanes

Use one steward plus fresh agents. The steward owns synthesis and final row
decisions.

### Agent A: Operation Contract Rows

Objective: resolve operation-local and operation-family `config.ts` rows.

Focus:

- eight operation-local `config.ts` files named in the corpus;
- `morphology/ops/mountains-shared/config.ts`;
- repeated nested schema fragments such as `WorldAgeSchema`, hypsometry,
  islands, volcanism, coast metrics, and mountains.

Return:

- row table entries for each operation/config symbol;
- exact `inline`, `recompose`, `move`, `keep`, or `needs destination` action;
- evidence for any proposed schema primitive or policy extraction;
- proof commands or Narsil/Git references needed before implementation.

Avoid:

- preserving generic shared config buckets;
- extracting full operation input/output/strategy envelopes;
- implementing changes.

### Agent B: Primitive Hunter

Objective: find and resolve domain schema primitives below the level of large
shared schemas.

This is a dedicated lane because primitive extraction is the hidden-depth part
of the pass. Do not stop at full schema overlap. A large shared schema such as
`FeaturePlacementSchema` may itself be a legal owner, or it may be a packet of
smaller primitives that should be named separately.

Focus:

- property-key overlap across operation contracts, artifact contracts, stage
  public schemas, and existing shared schemas;
- repeated scalar or object concepts such as placement coordinates, weights,
  selectors, counts, thresholds, identifiers, biome symbols, world-age values,
  hypsometry/elevation terms, wind fields, field vectors, and range objects;
- nested TypeBox fragments inside operation-local `config.ts` files and public
  stage schemas;
- large shared schemas that may need decomposition into primitive parts.

Method:

- build a property/concept overlap map, not just a schema-name overlap map;
- distinguish coincidental field names from shared domain vocabulary by reading
  constraints, descriptions, callers, and compile/normalization behavior;
- decide whether each repeated concept is a reusable schema primitive,
  reusable policy, artifact-owned contract support, stage-local authoring
  shape, operation-local tuning, or no extraction;
- name exact `model/schemas/<primitive>.schema.ts` destinations only when the
  primitive is semantically stable and composable by more than one owner.

Return:

- a primitive candidate table:

```text
| Concept/property | Source rows | Shared semantics? | Action | Exact owner/destination | Source-row disposition impact | Why not larger/smaller |
| --- | --- | --- | --- | --- | --- | --- |
```

- decomposition recommendation for each large shared schema candidate;
- a mapping from every primitive candidate back to the original corpus row or
  expanded source row it changes;
- explicit rejection notes for repeated fields that are not true primitives.

Avoid:

- treating a large shared schema as the primitive by default;
- promoting every repeated property key;
- extracting full operation envelopes;
- turning `model/schemas` into a broad bag of caller-shaped config.

### Agent C: Domain Policy And Boundary Rows

Objective: resolve reusable schema and policy candidates.

Focus:

- ecology `BiomeEngineBindingsSchema`;
- hydrology `HydrologyWindFieldSchema`;
- hydrology/foundation/morphology shared knobs and multiplier policy;
- hydrology navigable river projection policy;
- foundation artifact field support leads only insofar as they affect this
  config-law pass.

Return:

- exact `model/schemas`, `model/policy`, stage-local, artifact-support,
  `keep`, `track later`, or `needs destination` action per row;
- explicit non-owner for each promoted or rejected primitive;
- evidence distinguishing reusable domain law from stage projection behavior.

Avoid:

- promoting every repeated field to a schema primitive;
- treating artifact contract shape as part of this pass unless it blocks a row;
- turning `model/schemas` into a new config bucket.

### Agent D: Facade And Stage Authoring Rows

Objective: resolve facade residue and stage authoring surfaces.

Focus:

- root `domain/config.ts`;
- per-domain `foundation/config.ts`, `hydrology/config.ts`,
  `morphology/config.ts`, `placement/config.ts`;
- recipe stage `public`, `knobsSchema`, `compile`, and
  `*-public-config.ts` helper rows.

Return:

- exact `reroute`, `delete`, `keep`, stage-local owner, or `needs destination`
  action per facade/stage row;
- proof required before deleting each facade;
- list of stage rows that are empty/wrapper-only versus policy/UX-bearing.

Avoid:

- global public-schema deletion;
- using script checks as source/file-shape authority;
- moving stage authoring logic into domain model.

## Tooling Expectations

Use Narsil first for graph-shaped questions: symbol references, call/import
relationships, and history lenses. Use local `rg` and TypeScript reads to
verify the active worktree. Use Git for `git blame` and `git log --follow`.
Use Nx for project ownership and runnable target discovery. Use KNIP for
deletion candidates with no fix mode; record limits when KNIP cannot prove a
claim.

## Evidence Standard

Claim strength:

- `verified`: source path, importer/reference, and authority match are checked;
- `corroborated`: source evidence and authority direction agree, but
  implementation proof remains;
- `blocked`: the row cannot receive an exact action under current law.

Deletion needs source import proof plus public/generated export proof where the
surface is exported. Facade retirement needs both export reroute action and
post-reroute deletion proof.

## Stop And Reframe Conditions

Stop and report rather than forcing a destination if:

- a row cannot fit operation contract, `model/schemas`, `model/policy`,
  artifact support, stage authoring, facade residue, delete, tracked later
  domino, or existing-owner keep;
- public API evidence proves a root/per-domain config facade is intentional;
- a stage public surface carries behavior that cannot be expressed as
  stage-owned authoring under the current recipe-stage rule;
- a proposed `model/schemas` row would require full operation envelope
  extraction;
- source evidence contradicts an accepted destination rail.

## Review Loop

After the steward drafts `disposition.md`, run a fresh review set:

- Review 1: row completeness and no hidden grouped rows.
- Review 2: owner-law correctness against the destination rails.
- Review 3: primitive-decomposition depth, especially whether large shared
  schemas were broken down far enough.
- Review 4: executability of the derived view without treating it as row truth.

Accepted P1/P2 findings must be repaired before the pass is considered ready
for execution-plan hardening.

## Brief Review Notes

This brief was reviewed by three fresh agents before use. Accepted findings
were repaired:

- the canonical input row set is now explicit, so agents do not choose their
  own subset of the first-pass corpus;
- `track later` is a valid action for outside-scope evidence rows;
- primitive candidates must map back to original source rows;
- artifact support is a valid owner destination;
- the embedded handoff prompt now uses root-correct paths, requires lane
  assignment, and names the steward synthesis artifact;
- the reusable runner now has a final config-law override preventing
  accidental execution-slice creation.

## Handoff Prompt For The Final Disposition Team

Use this prompt for the implementation-neutral investigation team. Fill the
`Lane assignment` field before sending it to any agent.

```text
You are running the final Domain Model Config Law disposition for the
Civ7 Modding Tools Habitat workstream.

Assume no prior thread context. Work in:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown

Your job is investigation and disposition only. Do not edit source code, move
files, delete files, or change enforcement.

Read:
- root AGENTS.md;
- .habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/frame.md;
- .habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/single-prework-decision-frame.md;
- .habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/inventory.md;
- .habitat/.active/workstreams/define-domain-blueprint-structure/decision-book/*.md;
- .habitat/scopes/domain/;
- the three config-law Habitat rule packets under .habitat/blueprints/;
- .habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/investigation-brief.md;
- first-pass investigation corpus preserved in Git history;
- .habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/disposition-brief.md.

Lane assignment:
<Agent A Operation Contract Rows | Agent B Primitive Hunter | Agent C Domain
Policy And Boundary Rows | Agent D Facade And Stage Authoring Rows | Steward
Synthesis>

Revisit every row in the corpus from ground up. Treat earlier classifications
as evidence, not final authority. Use the accepted destination rails to assign
one concrete action per row: move, inline, recompose, reroute, delete, keep
with exact owner, track later, or needs destination.

Do not write "mechanical now" or "mechanical later" as a row outcome. Those
views are derived after the action ledger exists.

One lane must be a dedicated Primitive Hunter. That agent looks below full
schema overlap into property-key overlap, nested TypeBox fragments, repeated
scalar/object concepts, and large shared schemas that may need decomposition.

Return the exact rows assigned to your lane, with evidence strength, explicit
non-owner, proof needed before implementation, and any `needs destination`
question stated narrowly.

The steward synthesizes lane outputs into
.habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/disposition.md.
```
