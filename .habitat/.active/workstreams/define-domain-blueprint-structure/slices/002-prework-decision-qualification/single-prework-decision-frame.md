# Single Prework Decision Frame

Status: normative reference for this prework slice

This document defines how to resolve one unresolved prework decision from
`inventory.md`.

One pass takes one numbered item from `inventory.md`, answers that item's
`Decision:` question, and records the result in the owning workstream
reference. The pass is a single prework decision qualification. It is not done
until the disposition table is fully resolved for every row; packet completion
alone is not closure.

Examples:

- completed narrative decision decides what `domain/narrative/**` is and who
  owns it;
- item 1 decides whether `model/config/` is a required domain structure and
  what exact current config-shaped material is stage-owned, operation-owned,
  domain primitive/policy material, facade residue, or deletion;
- item 3 decides the true owners of
  `resources/policy/initial-map-authoring.ts`.

The pass may be run by one steward or by a small agent team, but the decision
unit remains one inventory item.

## Objective

For the selected inventory item, produce one of these outcomes:

1. **Qualified for Slice 001:** every source path or symbol covered by the
   item has an exact destination or delete action, backed by an existing scope,
   file description, pattern, or shared owner criterion.
2. **Reference update required before execution:** the owner is clear, but the
   governing scope, file description, pattern, or decision-book criterion must
   be updated before the item can become executable.
3. **Out of Slice 001:** the item belongs to a named later owner-law domino
   and must stay out of the next mechanical implementation slice.
4. **Implementation-gated:** the row owner and action are known, but execution
   waits for a named scope, file, pattern, decision-book, or other authority
   reference update.
5. **Executable now:** an easy, clearly proved deletion, split, or other source
   action should be executed through an execution slice tied to this prework
   packet instead of being deferred by habit.

The actual decision is the `Decision:` line in the selected inventory item.
The pass exists to answer that line, not to discover a new category of work.

Unresolved rows are not a success state. If a row cannot receive a destination,
delete action, implementation-gated action, executable-now action, or tracked
named later domino, the selected prework decision remains blocked.

## Skill Routing

Use skills at the gate where their guidance changes the selected decision. Do
not load a skill just because it is named here.

- `habitat:systematic-workstream`: use for every pass. It supplies the
  required loop: authority/oracle, corpus, expectation model, owner map, and
  closure.
- `cognition:investigation-design`: use before source investigation when the
  selected decision needs competing hypotheses, source authority rules, or
  explicit stop/reframe conditions.
- `cognition:team-design`: use when more than one agent is assigned. It owns
  role boundaries, handoffs, accountability, and review relationships.
- `cognition:prompt-design`: use when writing agent prompts for evidence or
  review lanes. It keeps prompts bounded, non-duplicative, and tied to the
  selected decision.
- `civ7-architecture-authority`: use when deciding owner placement, explicit
  non-owners, package boundaries, import surfaces, topology, or source-shape
  gates.
- `civ7-product-authority`: use when deciding MapGen domain meaning, public
  surface, official resource truth, caller compatibility, or product boundary.
- `civ7-habitat-dra-workstream`: use when changing Habitat authority material,
  review closure, or workstream packet shape.
- `civ7-mapgen-workstream`: use when the selected decision changes MapGen
  domain, recipe, stage, operation, artifact, or generated-map semantics.
- `search:narsil-mcp`: use when symbol/reference/call evidence materially
  affects ownership or consumer impact.

## Authority And Evidence Order

Authority order:

1. direct user decisions in the active session;
2. active `.habitat/scopes/**` scope, file, and pattern documents plus any
   scope/file/pattern documents still local to this workstream;
3. shared decision-book criteria in this workstream;
4. canonical Civ7 product and architecture authority;
5. current source, callers, tests, and generated/runtime evidence;
6. Git history and stale docs as explanatory evidence only.

Current location is evidence, not authority. Domain ownership comes from the
owner law and source evidence. A helper name needs a named destination law.

## Config-Shaped Row Discriminator

For the domain model config-law item, do not treat the word `config` or a
current `config.ts` filename as an owner. Decide by the architectural role.

Recognized config-related owners:

- stage authoring surface: public schema, `knobsSchema`, public-to-internal
  `compile`, and local step composition owned by the stage;
- internal step config: step contract schema and step normalization boundary;
- operation or strategy contract config: operation contract surface;
- domain model primitive or config contract: reusable schema fragments, enums,
  types, and invariants that stages and operations compose;
- domain model policy: reusable semantic policy tables or mapping functions
  that encode domain law rather than object-local primitive validation;
- facade residue: broad root `config.ts` barrels that only re-export other
  material.

Decision questions:

1. Is this export the shape a recipe author supplies to one stage? If yes, it
   is stage-owned.
2. Is this export compiling public intent into step or operation config? If
   yes, it is stage/step-owned unless it encodes reusable domain semantic law.
3. Is this export a domain concept independent of one stage surface, such as a
   primitive schema, enum, type, or invariant? If yes, it may be
   domain-config-owned.
4. Is this reusable semantic policy rather than a primitive or config contract?
   If yes, route it to `model/policy/`, not `model/config/`.
5. Is this file only a broad import facade? If yes, it is not an owner; classify
   the underlying exports and delete or replace the facade through the public
   import-surface law.

This keeps the prework pass from creating a false third config model. Domains
may export primitives used to compose stage public schemas and operation
contracts, but domains do not own the stage authoring surface or the
public-to-step compilation mapping.

## Required Evidence

Every pass gathers only the evidence needed to answer the selected decision.

Required evidence:

- the selected inventory item text;
- active scope/file/pattern docs that could govern the item;
- relevant decision-book entries;
- current source files named by the item;
- importers, exported symbols, and caller paths;
- package, product, or architecture docs for plausible owners;
- Narsil symbol/reference evidence when ownership depends on graph
  relationships.

The pass inspects enough counter-evidence to reject likely wrong owners before
selecting a destination.

## Stage 1: Name The Decision

Copy the selected `Decision:` line from `inventory.md` and keep it as the pass
question.

Record:

- in scope;
- exterior;
- candidate owners;
- likely non-owners;
- falsifier that would change the expected direction;
- stop condition that would prevent a decision.

This stage prevents the pass from becoming a general research sweep.

## Stage 2: Gather Authority

Read the active authority before reading current code as target shape.

Output:

- controlling scope/file/pattern docs;
- decision-book entries that apply;
- product or architecture docs that apply;
- authority gaps, if any.

If no authority can distinguish the candidate owners, the pass records the row
as blocked. It may become a tracked later domino only after that carrying
inventory, packet, or later-slice reference is written.

## Stage 3: Inventory The Affected Source

Inspect the source named by the item and make the affected row set visible.

Output:

```text
| Path or symbol | Current role | Imports/callers | Candidate owner |
| --- | --- | --- | --- |
```

Use exact paths and symbol names. Expand globs. Preserve rows even when several
rows share the same expected disposition.

## Stage 4: Trace Ownership Evidence

Trace the item far enough to decide who owns the material.

Tool-first expectation:

- Start with Narsil MCP for symbol/reference/caller/import/call-graph evidence.
  The server is up for this repo, indexed on the primary worktree, and tracks
  the latest stack state. Use repo id `civ7-modding-tools#2fa31857` unless
  `list_repos` reports a newer id.
- Use Narsil Git lenses and local Git for history: file history, blame, recent
  changes, hotspots, `git blame`, and `git log --follow`.
- Use NX for project ownership, dependency, target, and runnable-check analysis.
- Use KNIP dead-code analysis before accepting deletion
  confidence, and record tool limits.

Required relationship checks:

- exports and barrels;
- imports and callers;
- operation, recipe, stage, package, or runtime consumers;
- generated or artifact consumers when relevant;
- dead or duplicate surfaces.

Use `rg` and TypeScript/source inspection as corroboration and detail reading,
not as the only first pass for graph-shaped questions.

## Stage 5: Decide Per-Row Disposition

For each source row, decide:

- content class;
- rightful owner and explicit non-owner;
- exact destination path, delete action, implementation-gated action,
  executable-now action, or tracked named later domino;
- governing scope/file/pattern/decision-book entry;
- evidence strength: `verified`, `corroborated`, or `blocked`.

Rows land in exact destinations. If the destination is a directory, that
directory must already have a scope or file-pattern law that positively defines
the content.

Use `blocked` only when the row is not resolved. A row with a named later domino
is resolved for this prework decision only if that domino is written to an
owning inventory, packet, or later-slice reference and removed from the next
mechanical implementation slice. A row with an implementation-gated action is
resolved only when the required reference update is named exactly enough for the
next DRA to apply it.

## Stage 6: Decide The Inventory Item

Collapse the row dispositions into one item-level decision:

- `Qualified for Slice 001`;
- `Reference update required before execution`;
- `Out of Slice 001: <named later domino>`;
- `Executable now: <execution slice>`;
- `Blocked: <specific authority gap>`.

This item-level decision updates `inventory.md` or the relevant later slice
packet. It is the output the user reviews before implementation.

## Stage 7: Write Back

The pass writes results into the durable location that owns the result:

- exact source-path dispositions go to the implementation slice inventory;
- reusable criteria go to `decision-book/`;
- topology law goes to `scope.md`;
- file law goes to `files/*.md`;
- cross-file law goes to `patterns/*.md`;
- unresolved external work either becomes a tracked named later domino written
  to the owner that will carry it forward, or leaves the packet blocked;
- implementation-gated work names the exact reference update needed before
  execution;
- easy, clearly executable rows may open a small execution slice from the
  packet so the prework pass burns down complexity instead of preserving it.

The decision does not live only in notes from the pass.

## Agent Roles

Use agents only when they reduce risk or parallelize independent evidence
lanes. The steward remains accountable for the final decision.

### Steward

Owns the selected inventory item, final synthesis, disposition decisions, and
write-back. The steward decides when evidence is sufficient and rejects vague
destinations.

### Authority Mapper

Reads active scope/file/pattern docs, decision-book entries, and Civ7 authority
docs. Returns controlling references, gaps, and non-owner implications.

### Source Mapper

Inspects named source paths, expands globs, lists exports/imports/callers, and
builds the affected path-or-symbol table. Does not decide architecture.

### Relationship Tracer

Uses `rg`, source inspection, and Narsil symbol/reference tools when useful to
trace consumers and owner relationships. Returns path-grounded evidence only.

### Owner Classifier

Classifies rows against owner boundaries and content classes. Must name exact
destination/delete/later-domino dispositions, explicit non-owners, and evidence
strength.

### Adversarial Reviewer

Checks the completed pass for fake buckets, invented destinations, current-path
authority, missing counter-evidence, and unresolved rows disguised as decisions.

### Process Reviewer

Checks that the pass answered the selected `Decision:` line, wrote the result
to the owning reference, and did not create another reporting layer.

## Agent Prompt Contract

Every agent prompt must include:

- absolute checkout path;
- the exact inventory item and its `Decision:` line;
- source authority order;
- hard core: no invented destinations, no generic buckets, current paths are
  evidence only;
- write behavior, normally read-only;
- exact paths or docs to inspect;
- required output shape;
- blocker condition.

Agents return findings, not final decisions, unless explicitly assigned the
steward role.

## Closure Criteria

A pass is closed only when:

- every row in the item corpus is fully resolved by exact destination, delete
  action, implementation-gated action, executable-now action, or explicitly
  tracked named later domino;
- every disposition cites its governing authority, proof, or tracked later
  domino;
- the selected inventory item's `Decision:` line has been answered;
- reusable criteria and scope/file/pattern laws are written to their owners;
- fresh review has no accepted P1/P2 findings.

If any row remains unresolved, the pass does not close. The steward must either
resolve it as a tracked later domino by writing it to the carrying
inventory/packet/later-slice reference and removing it from the next mechanical
implementation slice, or mark the selected decision blocked.
