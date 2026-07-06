# Domain Model Config Law Execution Workstream

Status: superseded for closure by `repair-execution.md`; retained as historical execution record

Prepared at: 2026-07-04

> Supersession warning: do not use closure rows, `closed-*` statuses, or proof
> claims below as active truth. They are historical evidence of the pass that
> produced the repair. Current red rows live in `red-ledger.md`; current
> execution gates live in `repair-execution.md`.

Active disposition source of truth: `disposition.md`

Current repair red source of truth: `red-ledger.md`

Current repair execution source of truth: `repair-execution.md`

Tracked-later domino: `resource-policy-data-contract.domino.md`

## Execution Frame

This document carries execution for the active `Domain Model Config Law`
prework decision. It is not a second disposition ledger. The row oracle is
`disposition.md`; this document turns that ledger into a staged burn-down path.

Execution principle:

```text
disposition row -> destination rail -> characterization proof -> owner construction -> caller migration -> old-owner retirement -> row proof -> fresh review
```

The intended end state is one authoritative meaning of `config` in this area:
recipe/stage authoring configuration. Everything currently named `config` but
owned by an operation contract, domain model schema primitive, domain model
policy, artifact support file, official Civ7 package, map projection stage, or
facade residue is moved to that owner or deleted.

In scope:

- every row in `disposition.md` except `S06`;
- pure mechanical owner materialization;
- coupled mechanical rows that require caller, stage-public, package-boundary,
  classifier, or projection proof in the same stage;
- keep/no-op proof rows before nearby deletion can invalidate them;
- deletion of root/per-domain config facades and shared helper residue only
  after owner paths are live and import-zero proof is recorded.

Out of scope:

- row `S06`, carried by `resource-policy-data-contract.domino.md`;
- full domain-blueprint topology ratcheting beyond the config-law rows;
- source movement that lacks a row in `disposition.md`;
- new product behavior, new public authoring UX, or generated output edits;
- using behavior tests as topology or file-shape law.

Each stage is a fresh execution context. The executor starts from the rows named
in that stage, confirms the governing destination rails, lays down or identifies
behavior characterization before movement, implements, gets fresh-agent review,
repairs accepted findings, records row proof, and only then enters the next
stage.

## Authority Inputs

Required reads before Stage 0:

- `disposition.md`
- `resource-policy-data-contract.domino.md`
- `../../single-prework-decision-frame.md`
- `../../../../decision-book/content-classes.md`
- `../../../../decision-book/move-classes.md`
- `../../../../decision-book/owner-boundaries.md`
- `.habitat/scopes/domain/scopes/model/scopes/schemas/scope.md`
- `.habitat/scopes/domain/scopes/model/scopes/policy/scope.md`
- `.habitat/scopes/domain/scopes/ops/files/contracts-ts.md`
- `.habitat/scopes/domain/scopes/artifacts/files/artifact-ts.md`
- active Habitat blueprint/pattern files for operation contract, recipe stage
  authoring, and domain schema/policy shape at execution time.

Authority order:

1. direct user decisions in this workstream;
2. active `.habitat/scopes/**` scope, file, and pattern documents;
3. shared decision-book criteria;
4. canonical Civ7 product and architecture authority;
5. current source, tests, Narsil, Nx, KNIP, and Git evidence;
6. stale docs and history as explanatory evidence only.

## Destination Rails

These rails are implementation-time decision criteria. They constrain movement
without reopening the disposition.

### Operation Contracts

Operation input, output, strategy, defaults, and operation-owned schema
envelopes live in the operation `contract.ts`.

Allowed:

- local schema declarations for the owning operation;
- imports from the owning domain `model/schemas/` for accepted primitives;
- imports from the owning domain `model/policy/` only for accepted semantic
  policy/defaults;
- TypeBox and operation contract construction dependencies allowed by the local
  operation pattern.

Forbidden:

- sibling operation `config.ts` as a permanent owner;
- generic operation-family `shared/config.ts` buckets;
- imported full operation input/output envelopes;
- root/per-domain `config.ts` facades.

Implementation-time decision rule:
if a shared operation config contains reusable semantic fragments, extract only
the primitive fragment to `model/schemas/` or policy to `model/policy/`; each
operation still recomposes its own contract envelope locally.

### Domain Model Schemas

`<domain>/model/schemas/` owns reusable semantic schema primitives only:
schema fragments, enums, types, invariants, defaults objects, and object-local
schema packets that operations or stages compose.

It does not own full operation envelopes, stage public schemas, `knobsSchema`,
compile mappings, reusable semantic policy, official Civ7 vocabulary, or
adapter/runtime facts.

Implementation-time decision rule:
a broad schema object is not automatically a primitive. If the source is an
aggregate, identify the smallest semantic concept that repeats or deserves
domain vocabulary; otherwise keep the material with the operation or stage.

### Domain Model Policy

`<domain>/model/policy/` owns reusable domain semantic law: classification
encodings, domain-owned legality interpretation, scoring policy, selection
policy, resolver tables, multiplier tables, and interpretation over domain
artifacts.

It does not own TypeBox schema primitives, operation-local tuning, stage-only
authoring composition, official Civ7 catalogs, globals, or adapter behavior.

Implementation-time decision rule:
if a table maps one stage's knob directly into one stage's internal step shape,
keep it stage-local. Promote only reusable domain semantic policy.

### Stage Authoring Surfaces

Recipe stages own authoring configuration:

- `public`;
- `knobsSchema`;
- public-to-internal `compile`;
- stage-local authoring helpers;
- stage-local projection/binding helpers;
- step composition.

Allowed:

- imports from domain `model/schemas/` and `model/policy/` when composing a
  stage-owned public surface;
- stage-local helper files under the owning stage directory when the active
  stage pattern permits them.

Forbidden:

- root/per-domain `config.ts` facades;
- operation-local `config.ts` files;
- recipe-root `*-public-config.ts` helper files as durable owners;
- domain model ownership of public authoring UX.

Stage 0 must confirm the active stage-authoring rail. Until that rail is
confirmed, executors may move material into stage-local owner files required by
the ledger, but must not delete empty/static/wrapper public surfaces merely
because they look removable.

### Official Civ7 And Adapter Boundaries

Official Civilization 7 vocabulary is not domain-owned by default.

Routes:

- ambient engine/global TypeScript declarations: `@civ7/types`;
- reusable official map-policy facts, resource/feature catalogs, legality
  tables, and table-index mappings: `@civ7/map-policy`;
- runtime engine/API reads, writes, and materialization: adapter/runtime owner;
- stage-specific binding composition: owning map stage.

Implementation-time decision rule:
if a schema maps internal domain values to official engine globals, split the
official vocabulary to the external owner and keep the stage binding helper
with the stage.

### Facade And Deletion Residue

Root and per-domain `config.ts` files are import facades, not owners.

Deletion is allowed only after:

- every exported symbol has moved to its row owner or been deleted by row
  disposition;
- source import scans prove no live source/test imports remain;
- generated/public export scans are checked where the path was exported
  publicly;
- keep/no-op rows adjacent to the deletion have owner proof;
- no new broad bucket replaced the facade under a different name.

## Global Preflight

Run before Stage 1 source movement:

```bash
git status --short --branch
gt log --no-interactive | head -60
bun habitat classify .habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law
bun habitat classify mods/mod-swooper-maps/src/domain
bun --silent nx show project mod-swooper-maps --json
```

Use Narsil MCP as the first graph pass for symbol/reference/caller/import
questions that affect ownership or caller impact. Use Nx for project ownership,
targets, and dependency impact. Use KNIP only as supporting deletion evidence,
without fix mode. Use Git history and blame only when historical ownership or
stale-source status materially affects a row.

If a required check is already red before a stage begins, record the pre-stage
failure and prove post-stage equivalence before accepting conditional closure.

## Proof Model

Each stage closes only when it records all applicable proof classes separately:

- row ledger coverage;
- static/import scans;
- TypeScript/check/build checks;
- behavior tests;
- Habitat pattern checks;
- preservation review for moved symbols;
- review disposition;
- Graphite/worktree state.

No proof class substitutes for another. A behavior test may prove runtime
behavior, but it never proves file shape or topology law. A Habitat pattern may
prove structure, but it never proves stage compile behavior or operation
contract semantics.

Command families:

- static/import: targeted `rg`, Narsil graph evidence, or Habitat-owned import
  scans for old paths, forbidden owner paths, generated/public exports, and
  retired symbols;
- TypeScript/checks: Nx target checks for touched projects/packages plus
  nearest package checks when needed;
- behavior: focused tests for touched operations, stage compile behavior,
  projection/readback behavior, scorer behavior, and contract behavior;
- Habitat patterns: relevant blueprint/pattern checks for contract shape, stage
  authoring shape, and domain `model/schemas` / `model/policy` owner shape;
- closure: `git diff --check`, `git status`, Graphite stack/status, row ledger
  reconciliation, and stale-record audit.

## Stage Manifest

Each non-`S06` row has one stage of record. Rows may appear in later closure
audits, but their primary proof belongs to the stage below.

| Rows | Stage of record | Primary lane |
| --- | --- | --- |
| `P01`, `P02`, `P04a`, `P04b`, `P04c`, `P04d` | Stage 1 | domain policy moves |
| `O01`, `O04` | Stage 1 | isolated operation contract inlines |
| `K02`, `ST03` | Stage 2 | foundation-tectonics authoring |
| `K03`, `ST04` | Stage 2 | foundation-orogeny authoring |
| `K04b` | Stage 2 | hydrology-climate-baseline knob localization |
| `K04c` | Stage 2 | hydrology-climate-refine knob localization |
| `K04d`, `ST13` | Stage 2 | hydrology-hydrography authoring |
| `K05a` | Stage 2 | morphology-coasts knob localization |
| `K05b` | Stage 2 | morphology-erosion knob localization |
| `K05c` | Stage 2 | morphology-shelf knob localization |
| `K05d` | Stage 2 | morphology-features knob localization |
| `O05`, `ST07` | Stage 3 | shelf operation contract plus stage-public recomposition |
| `O02`, `ST08` | Stage 3 | erosion operation contract plus stage-public recomposition |
| `O03`, `O06`, `ST09` | Stage 3 | coasts operation contract plus stage-public recomposition |
| `O07`, `O08`, `ST10` | Stage 3 | features operation contract plus stage-public recomposition |
| `O09`, `O10` | Stage 3 | mountains family decomposition |
| `K01`, `K04a`, `ST01`, `ST02`, `ST11`, `ST12` | Stage 3 | duplicated/localized shared knobs |
| `S01`, `S02`, `S03`, `S04`, `S07`, `S08` | Stage 4 | primitives, artifact support, rejected primitive proof |
| `S05`, `P03`, `MP01`, `MP02`, `MP03`, `MP04`, `MP05`, `ST17`, `ST18`, `ST19`, `ST20`, `ST21` | Stage 5 | official boundary and map projection helper split |
| `ST05`, `ST06`, `ST14`, `ST15`, `ST16`, `ST22` | Stage 6 | keep proof before deletion |
| `D01`, `D02`, `D03`, `D04`, `D05` | Stage 7 | facade and residue retirement |
| all closed rows | Stage 8 | closure audit only |
| `S06` | outside scope | tracked later |

## Row Coverage Contract

The executor maintains a row ledger inside this document during implementation.
Every non-`S06` row must finish with one of these states:

- `closed-moved`;
- `closed-inline`;
- `closed-recomposed`;
- `closed-rerouted`;
- `closed-deleted`;
- `closed-keep-proof`;
- `reopened-blocked`.

`reopened-blocked` is allowed only when implementation evidence contradicts the
accepted disposition enough that source movement would invent law. It blocks
dependent stages until the row is resolved or moved to a tracked domino by
explicit user/authority decision.

Minimum ledger row:

```text
| Row | Stage | Final state | Owner path or delete proof | Behavior proof | Structure/import proof | Review disposition |
| --- | --- | --- | --- | --- | --- | --- |
```

Stage closure record:

```text
| Stage | Row | Required proof from disposition | Actual evidence | Proof class | Review lane | Disposition | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
```

The executor fills the stage closure record at the end of each stage, not only
at final closure. A row is not closed by appearing in a group; it is closed by a
row-level record with evidence.

## Stage 0: Authority And Route Lock

Objective: prove the execution surface is ready before moving code.

Rows:

- all rows for assignment;
- `S06` for exclusion proof only.

Changes:

- no source changes;
- confirm active Habitat rails for operation contracts, stage authoring, and
  domain schema/policy shape;
- create the implementation row ledger section if it is not already present;
- open `resource-policy-data-contract.domino.md` and record that no `S06` work
  items are present in this execution plan.

Pass:

- every non-`S06` row is assigned to exactly one execution stage;
- every stage has a write-set owner model and proof class;
- no active document presents `model/config/`, root/per-domain `config.ts`, or
  operation-family `shared/config.ts` as a destination;
- structural proof is assigned to Habitat patterns/scopes, not behavior tests;
- advisory red pattern rows are named and tied to stages that will burn them
  down;
- stage-authoring rail is confirmed, or empty/wrapper public-surface deletion is
  frozen until a later rail decision.

Fail:

- a row lacks a stage assignment;
- an exact destination from `disposition.md` is weakened to a broad bucket;
- `S06` appears in implementation scope;
- an implementation prerequisite requires a new destination law.

Review lanes:

- coverage reviewer: row assignment and `S06` exclusion;
- rail reviewer: pattern/scope readiness and no false config owner;
- proof reviewer: planned checks match claim strength.

Gate to Stage 1:
no accepted P1/P2 finding remains.

## Stage 1: Pure Owner Materialization

Objective: move exact-owner material that reduces false imports without
requiring public-stage recomposition or external package-boundary splits.

What changes:

- direct domain policy files are created under `model/policy/`;
- isolated operation config files inline into operation `contract.ts`.

Rows and lanes:

| Lane | Rows | Nature of work |
| --- | --- | --- |
| Domain policy moves | `P01`, `P02`, `P04a`, `P04b`, `P04c`, `P04d` | Move reusable semantic policy to exact `model/policy` files and reroute imports. |
| Isolated operation inlines | `O01`, `O04` | Inline operation-owned strategy schemas into owning `contract.ts` files and remove local config residue if import-zero. |

Decision criteria:

- if a symbol needs stage public recomposition, stop that symbol and move it to
  its Stage 2 or Stage 3 lane instead of making a partial edit;
- if a policy table is discovered to be stage-only mapping, keep it stage-local
  and reopen the row before moving it to domain policy;
- operation envelopes are never extracted outside their contract files.

Pass:

- each lane row imports from its exact owner destination;
- no old source export remains live unless named as later-stage residue;
- operation contracts do not import sibling `config.ts`;
- focused behavior/type checks for touched operations pass or have recorded
  pre-stage equivalence.

Fail:

- any row is partially migrated with an old facade still required for behavior;
- a new broad `policy` or `schemas` bucket is created without a named concern;
- operation envelopes are extracted outside their contract files.

Review lanes:

- source/import reviewer: old-path imports, barrel exports, accidental facade
  dependency;
- owner-shape reviewer: exact owner path versus broad bucket;
- behavior reviewer: constants/resolvers/schema behavior unchanged.

Gate to Stage 2:
Stage 1 rows are closed or explicitly reopened; accepted P1/P2 findings are
repaired.

## Stage 2: Simple Stage Authoring Localization

Objective: localize exact stage-owned knobs that can move before the heavier
operation/public recomposition.

What changes:

- stage-owned knob schemas move into the owning stage directories;
- affected stage surfaces are updated only enough to consume the localized
  knobs;
- stage rows with later public/compile recomposition remain open for Stage 3
  and are not closed by Stage 2.

Rows and lanes:

| Lane | Rows | Nature of work |
| --- | --- | --- |
| Foundation tectonics | `K02`, `ST03` | Move plate activity authoring to `foundation-tectonics`. |
| Foundation orogeny | `K03`, `ST04` | Move continental/crust-character authoring to `foundation-orogeny`. |
| Hydrology baseline | `K04b` | Move seasonality/ocean coupling knobs to `hydrology-climate-baseline`; `ST11` closes in Stage 3. |
| Hydrology refine | `K04c` | Move cryosphere knob to `hydrology-climate-refine`; `ST12` closes in Stage 3. |
| Hydrology hydrography | `K04d`, `ST13` | Move river/lake authoring knobs to `hydrology-hydrography`. |
| Morphology coasts | `K05a` | Move sea-level/coast ruggedness knobs to `morphology-coasts`; `ST09` closes in Stage 3. |
| Morphology erosion | `K05b` | Move erosion knob to `morphology-erosion`; `ST08` closes in Stage 3. |
| Morphology shelf | `K05c` | Move shelf-width knob to `morphology-shelf`; `ST07` closes in Stage 3. |
| Morphology features | `K05d` | Move volcanism/orogeny knobs to `morphology-features`; `ST10` closes in Stage 3. |

Decision criteria:

- duplicate/localize authoring schemas rather than inventing cross-stage
  authoring owners;
- stages may import domain policy/schemas only for accepted domain semantics;
- no stage imports operation-local `config.ts` or root/per-domain config
  facades for the localized knob rows after its lane closes.
- do not mark an `ST*` row closed in Stage 2 if that stage surface is named in
  Stage 3.

Pass:

- each Stage 2 row owns its knob schema locally;
- stage compile behavior is unchanged by focused characterization or existing
  tests;
- no recipe-root helper or per-domain config facade becomes the durable owner.

Fail:

- shared authoring knobs are promoted as domain primitives without primitive
  proof;
- a stage still imports from a root/per-domain config facade after its lane;
- wrapper/empty public surfaces are deleted before Stage 0 rail permission.

Review lanes:

- stage owner reviewer: stage-local placement and allowed imports;
- behavior reviewer: compile/knob behavior unchanged;
- import reviewer: no old facade dependency for closed lanes.

Gate to Stage 3:
all simple stage authoring lanes are closed or reopened with exact blocker
evidence; no accepted P1/P2 review finding remains for the current stage or
dependent stages.

## Stage 3: Coupled Operation Contract And Public Recomposition

Objective: close rows where operation contract material and stage public
authoring are coupled.

What changes:

- operation contracts own their full input/output/strategy/default schema
  envelopes;
- stages recompose public authoring schemas from stage-owned definitions and
  accepted primitives/policy;
- shared operation-family config disappears as a contract bucket.

Rows and lanes:

| Lane | Rows | Nature of work |
| --- | --- | --- |
| Shelf operation/public | `O05`, `ST07` | Inline continental-margin contract material while preserving shelf authoring. |
| Erosion operation/public | `O02`, `ST08` | Inline base-topography relief material while preserving erosion authoring. |
| Coasts operation/public | `O03`, `O06`, `ST09` | Inline coastline metrics and sea-level material while preserving coasts authoring. |
| Features operation/public | `O07`, `O08`, `ST10` | Inline island-chain and volcano material while preserving features authoring. |
| Mountains family decomposition | `O09`, `O10` | Recompose ridge/foothill/rough-land contracts and move the family assertion into morphology-features stage logic; the `ST10` row closes in the features operation/public lane. |
| Duplicate shared knobs | `K01`, `K04a`, `ST01`, `ST02`, `ST11`, `ST12` | Duplicate/localize shared plate-count and climate knobs into actual stage owners. |

Decision criteria:

- contracts may compose accepted primitives, but full operation envelopes stay
  local;
- operation-mirror public schema names do not remain stable for call sites;
  they close by deletion/no public schema. Only independently proven,
  non-mirror stage UX may remain in the stage `index.ts`;
- duplication is preferred over inventing a cross-stage authoring owner when
  two stages share a knob shape;
- `O08` and `O10` stay in this coupled stage because their disposition requires
  stage-public or morphology-features proof.

Pass:

- all affected operation contracts compile without operation-local `config.ts`
  imports;
- stage public compile behavior is preserved by focused characterization or
  existing tests;
- `mountains-shared/config.ts` is not a durable bucket;
- every old config export involved in this stage is either deleted or listed as
  Stage 7 deletion residue with import-zero preconditions.

Fail:

- a stage starts importing operation-local `config.ts`;
- a full operation envelope is moved to `model/schemas/`;
- shared authoring knobs are promoted as domain primitives without primitive
  proof.

Review lanes:

- contract reviewer: local contract ownership and no operation-family bucket;
- stage authoring reviewer: public/knob/compile behavior and stage-local helper
  placement;
- coupling reviewer: caller migration is complete for every row in the lane.

Gate to Stage 4:
all coupled operation/stage rows are closed or reopened with exact blocker
evidence; no accepted P1/P2 review finding remains for the current stage or
dependent stages.

## Stage 4: Primitive And Artifact-Support Extraction

Objective: extract narrow accepted primitives/support schemas and prove rejected
primitive candidates stay put.

What changes:

- accepted ecology schema primitives move to exact `model/schemas` files;
- hydrology wind-field artifact support moves to the owning stage artifact
  support destination;
- rejected primitive candidates are recorded as keep/proof rows.

Rows and lanes:

| Lane | Rows | Nature of work |
| --- | --- | --- |
| Accepted domain primitives | `S01`, `S02` | Extract `FeaturePlacementSchema` and internal `BiomeSymbolSchema` only at the accepted primitive boundary. |
| Artifact support | `S03`, `S04` | Move wind-field artifact support to the stage artifact support owner and prove foundation tectonic scalar fields remain artifact-owned. |
| Rejected primitive proof | `S07`, `S08` | Prove snow/ice thresholds and ecology scorer thresholds stay with owning operation contracts. |

Decision criteria:

- `S02` requires classifier trace proof against `BiomeSymbol` and
  `BIOME_SYMBOL_ORDER` before extraction;
- official `BIOME_*` binding vocabulary is not part of `S02`; it belongs to
  Stage 5 row `S05`;
- artifact support does not become domain `model/schemas` by convenience;
- repeated names are not enough for extraction without compatible semantics.

Pass:

- accepted primitives have semantic file names and are exported only through
  useful owner barrels;
- no full strategy envelope is extracted as a primitive;
- artifact support consumers import from the stage artifact support owner;
- rejected rows have explicit keep-proof evidence.

Fail:

- official Civ7 binding vocabulary lands in ecology model schemas;
- artifact payload support is promoted to domain model schemas without owner
  proof;
- rejected candidates are ignored instead of proved.

Review lanes:

- primitive-boundary reviewer: smallest accepted primitive, no aggregate dump;
- artifact-boundary reviewer: artifact support owner and no model-schema leak;
- no-op reviewer: keep rows have real proof.

Gate to Stage 5:
all primitive/support rows are closed and the official vocabulary split remains
assigned to Stage 5; no accepted P1/P2 review finding remains for the current
stage or dependent stages.

## Stage 5: Official Boundary And Map Projection Helper Split

Objective: split projection-facing config residue into owning map stages and
external Civ7 package boundaries.

What changes:

- official biome-global vocabulary moves to `@civ7/map-policy`;
- map-ecology owns the TypeBox binding helper for stage projection;
- Civ-visible river projection policy moves to the map-rivers stage;
- recipe-root projection public-config helper exports split back into their
  owning stages.

Rows and lanes:

| Lane | Rows | Nature of work |
| --- | --- | --- |
| Official biome boundary | `S05`, `MP05`, `ST21` | Split official biome-global vocabulary to map-policy and stage binding helper to `map-ecology`. |
| Map morphology | `MP01`, `ST17` | Recompose static morphology projection authoring into `map-morphology`. |
| Map hydrology | `MP02`, `ST18` | Recompose lake projection/readback authoring into `map-hydrology`. |
| Map elevation | `MP03`, `ST19` | Recompose static elevation projection authoring into `map-elevation`. |
| Map rivers | `P03`, `MP04`, `ST20` | Move navigable river projection policy and public projection authoring to `map-rivers`. |

Decision criteria:

- official Civ7 facts must not land in domain model files;
- runtime/global access stays at the adapter boundary;
- stage binding schema/helper belongs to the owning map stage, not domain
  ecology;
- empty public/knob wrappers may be deleted only if the stage-shape rail permits
  absence and behavior proof confirms no call-site dependency.

Pass:

- no source imports remain from `map-projection-public-config.ts`;
- each map stage owns its own public/knob projection surface or proves absence
  is valid;
- `@civ7/map-policy` owns official biome-global vocabulary;
- map-ecology imports official vocabulary from map-policy and owns only the
  stage binding composition.

Fail:

- official vocabulary remains in a domain model or recipe-root helper bucket;
- a recipe-root public-config helper survives as an authority surface;
- empty wrapper deletion breaks stage definition shape or generated surfaces.

Review lanes:

- external-boundary reviewer: map-policy/adapter/domain separation;
- projection-stage reviewer: one owning map stage per lane;
- import-zero reviewer: recipe-root helper imports and exports are gone.

Gate to Stage 6:
projection and external-boundary rows are closed and no root helper remains
except as Stage 7 deletion residue with import-zero proof; no accepted P1/P2
review finding remains for the current stage or dependent stages.

## Stage 6: Keep Proof Before Deletion

Objective: prove keep/no-op rows that sit next to facade deletion before any
deletion stage can run.

What changes:

- no deletion changes;
- static and real authoring stages receive owner-class proof;
- the proof record makes later facade deletion safe.

Rows and lanes:

| Lane | Rows | Nature of work |
| --- | --- | --- |
| Static stage keep proof | `ST05`, `ST06` | Prove static stages remain valid before deleting surrounding facade residue. |
| Ecology/placement keep proof | `ST14`, `ST15`, `ST16`, `ST22` | Prove real stage authoring surfaces remain stage-owned before facade deletion. |

Decision criteria:

- keep rows are proved by owner class plus caller/compile evidence, not by
  current path alone;
- if a keep row still imports facade material that Stage 7 plans to delete, the
  row is not closed until the import is rerouted or the deletion is stopped.

Pass:

- each keep row has `closed-keep-proof` evidence;
- no keep row relies on a root/per-domain config facade for ownership;
- fresh review confirms deletion may proceed without invalidating keep rows.

Fail:

- a keep row moved accidentally;
- a keep row still imports deleted/future-deleted config material;
- proof relies on current path alone.

Review lanes:

- keep-row reviewer: owner class and caller/compile proof;
- dependency reviewer: no planned Stage 7 deletion invalidates a keep row;
- proof reviewer: keep proof is recorded separately from deletion proof.

Gate to Stage 7:
all Stage 6 keep rows are closed; no accepted P1/P2 review finding remains for
the current stage or dependent stages.

## Stage 7: Facade And Residue Retirement

Objective: delete root/per-domain config facades and stale helper files only
after all owner paths are live and adjacent keep rows are proved.

What changes:

- root and per-domain config facades retire;
- stale aggregate config files, shared knob/multiplier files, operation
  `config.ts`, operation-family `shared/config.ts`, and recipe-root helper
  files are deleted when their prior stage recorded import-zero residue;
- public/generated exports are rerouted or removed according to accepted owner
  paths.

Rows and lanes:

| Lane | Rows | Nature of work |
| --- | --- | --- |
| Domain facade deletion | `D01`, `D02`, `D03`, `D04`, `D05` | Delete root/per-domain facades after all exports route to exact owners. |
| Residue ledger | prior-stage residue entries | Delete only files emitted by prior stage closure notes and tied to disposition rows. |

Decision criteria:

- deletion waits for source import-zero proof and public export proof;
- compatibility re-exports are not kept unless a reviewed public API decision
  explicitly preserves them;
- a facade cannot be replaced by a new broad bucket under `model/schemas`,
  `model/policy`, or stage helpers;
- no catch-all cleanup is allowed unless Stage 0 adds an explicit row.

Pass:

- no source/test/generated/public import uses root or per-domain config facades;
- deleted files are tied to closed row owners or residue ledger entries;
- `rg` scans for old config paths and symbols are recorded;
- domain exports point to exact owners, not transitional config surfaces.

Fail:

- any facade remains because a row was not migrated;
- a public import surface breaks without an explicit compatibility decision;
- deletion removes behavior that was not characterized in earlier stages.

Review lanes:

- deletion reviewer: import-zero and generated/public surface proof;
- compatibility reviewer: no accidental public API break beyond accepted owner
  movement;
- residue reviewer: no new broad bucket or untracked config-shaped helper.

Gate to Stage 8:
all delete rows are closed and no old facade/helper path remains except a row
explicitly reopened by evidence; no accepted P1/P2 review finding remains for
the current stage or dependent stages.

## Stage 8: Closure Audit

Objective: aggregate proof, confirm row ledger closure, and leave a clean
handoff.

Rows:

- all non-`S06` rows for final ledger audit;
- `S06` only for tracked-later confirmation.

What changes:

- no new source movement unless repairing accepted review findings;
- execution record gains final proof labels for every row.

Pass:

- every non-`S06` row has a final ledger state;
- keep rows have explicit `closed-keep-proof` entries in their stage of record;
- no accepted P1/P2 review finding remains;
- preservation review has no `unresolved loss`;
- behavior tests, TypeScript checks, Habitat pattern checks, import scans,
  review disposition, Graphite commit, and worktree cleanliness are recorded as
  separate claims.

Fail:

- a row is closed only by group membership;
- a keep row relies on current path alone instead of owner class plus caller
  evidence;
- `S06` is the only non-closed row but lacks its domino reference.

Review lanes:

- full-ledger reviewer: every non-S06 row has final state;
- proof-label reviewer: each proof claim is supported by the right evidence
  class;
- closure reviewer: review dispositions, Graphite/worktree state, and no stale
  draft or next-action ambiguity.

## Verification Matrix

Use the smallest command set that proves the touched rows, but record proof
classes separately.

Required families:

- Narsil graph evidence for non-obvious symbol/reference/caller relationships;
- `rg` import and old-symbol scans for every deleted or retired path;
- Nx project-target discovery before selecting runnable checks;
- focused tests for touched stage compile behavior, operation contracts,
  artifact support, and projection helpers;
- `nx run mod-swooper-maps:check`;
- `nx run mod-swooper-maps:test` unless pre-existing Habitat/Grit state makes
  full target proof conditional, in which case record pre/post equivalence;
- `bun habitat classify` for touched `.habitat` and source scopes;
- `git diff --check -- <touched paths>`;
- KNIP as deletion support only when available and useful, no fix mode.

Do not collapse these claims. A green behavior test does not prove topology
law; a green Habitat pattern does not prove runtime behavior.

## Review Model

Run fresh review after each stage. Use the smallest lane set that covers the
stage risk.

Common review lanes:

- row coverage reviewer: compares execution rows against `disposition.md`;
- owner-boundary reviewer: checks operation contracts, stage authoring,
  `model/schemas`, `model/policy`, map-policy, type, and adapter boundaries;
- preservation reviewer: for moved source paths, marks exported symbols and
  behavior-bearing definitions as `preserved`, `intentional loss`, or
  `unresolved loss`;
- proof reviewer: checks evidence labels and prevents tests from claiming
  structure law;
- scope/pattern reviewer: checks Habitat scope/pattern claims only;
- closure reviewer: checks row ledger, review disposition, stale records,
  Graphite state, and final claim language.

Common finding disposition:

```text
| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| <specific issue> | P1/P2/P3 | accepted/rejected/invalidated/tracked-outside-scope/waived-P3/cleared | <file, command, or reason> |
```

Closure rule:

- accepted P1/P2 findings must be repaired, source-rejected with evidence,
  invalidated by later evidence, or moved outside the active workstream with an
  owner and re-entry trigger. They cannot be waived for stage or final closure;
- rejected findings need source evidence or authority reasoning;
- waived-P3 findings need risk, owner, and re-entry trigger;
- tracked-outside-scope findings need a tracked owner and re-entry trigger; do
  not hide them in narrative.

## Stop Conditions

Stop the current stage if:

- any row lacks an owner/proof mapping;
- any old import/export remains without an explicit downstream dependency;
- a Habitat pattern needed for the stage claim is missing and not recorded as
  advisory;
- a behavior check fails without a documented pre-stage equivalent failure;
- a generated/public surface contradicts source import proof;
- a reviewer returns an accepted P1/P2;
- preservation review reports an `unresolved loss`;
- Graphite/worktree state cannot support the closure claim;
- implementation evidence contradicts the accepted row destination enough that
  continuing would invent destination law.

## Implementation Row Ledger

Execution filled this ledger on 2026-07-04/2026-07-05. Rows share proof
commands where a stage moved a coherent owner class; row state still remains
row-level.

| Row | Stage | Final state | Owner path or delete proof | Behavior proof | Structure/import proof | Review disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `P01` | Stage 1 | closed-moved | `mods/mod-swooper-maps/src/domain/foundation/model/policy/plate-activity.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | `require_domain_model_schema_policy_owner_shape`; old config import scans | fresh review clean; accepted review findings repaired |
| `P02` | Stage 1 | closed-moved | `mods/mod-swooper-maps/src/domain/hydrology/model/policy/climate-knob-policy.ts`; `mods/mod-swooper-maps/src/domain/hydrology/model/policy/hydrography-knob-policy.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | `require_domain_model_schema_policy_owner_shape`; old config import scans | fresh review clean; accepted review findings repaired |
| `P03` | Stage 5 | closed-moved | `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/riverProjectionPolicy.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | map projection helper scans; recipe-root helper import-zero scan | fresh review clean; accepted review findings repaired |
| `P04a` | Stage 1 | closed-moved | `mods/mod-swooper-maps/src/domain/morphology/model/policy/coast-knob-policy.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | `require_domain_model_schema_policy_owner_shape`; morphology public surface rule | fresh review clean; accepted review findings repaired |
| `P04b` | Stage 1 | closed-moved | `mods/mod-swooper-maps/src/domain/morphology/model/policy/erosion-knob-policy.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | `require_domain_model_schema_policy_owner_shape`; morphology public surface rule | fresh review clean; accepted review findings repaired |
| `P04c` | Stage 1 | closed-moved | `mods/mod-swooper-maps/src/domain/morphology/model/policy/shelf-knob-policy.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | `require_domain_model_schema_policy_owner_shape`; morphology public surface rule | fresh review clean; accepted review findings repaired |
| `P04d` | Stage 1 | closed-moved | `mods/mod-swooper-maps/src/domain/morphology/model/policy/landform-knob-policy.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | `require_domain_model_schema_policy_owner_shape`; morphology public surface rule | fresh review clean; accepted review findings repaired |
| `O01` | Stage 1 | closed-inline | `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts`; deleted `compute-crust-evolution/config.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | operation config import-zero scan; foundation config-bag Grit checks | fresh review clean; accepted review findings repaired |
| `O02` | Stage 3 | closed-inline | `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/contract.ts`; deleted op `config.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | operation config import-zero scan; `require_morphology_public_surface_imports` | fresh review clean; accepted review findings repaired |
| `O03` | Stage 3 | closed-inline | `mods/mod-swooper-maps/src/domain/morphology/ops/compute-coastline-metrics/contract.ts`; deleted op `config.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | operation config import-zero scan; morphology pattern checks | fresh review clean; accepted review findings repaired |
| `O04` | Stage 1 | closed-inline | `mods/mod-swooper-maps/src/domain/morphology/ops/compute-geomorphic-cycle/contract.ts`; deleted op `config.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | operation config import-zero scan; TypeScript export proof through `domain/morphology/ops.ts` | fresh review clean; accepted review findings repaired |
| `O05` | Stage 3 | closed-inline | `mods/mod-swooper-maps/src/domain/morphology/ops/compute-sculpt-continental-margin/contract.ts`; deleted op `config.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | operation config import-zero scan; morphology pattern checks | fresh review clean; accepted review findings repaired |
| `O06` | Stage 3 | closed-inline | `mods/mod-swooper-maps/src/domain/morphology/ops/compute-sea-level/contract.ts`; deleted op `config.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | operation config import-zero scan; morphology pattern checks | fresh review clean; accepted review findings repaired |
| `O07` | Stage 3 | closed-inline | `mods/mod-swooper-maps/src/domain/morphology/ops/plan-island-chains/contract.ts`; deleted op `config.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | operation config import-zero scan; morphology pattern checks | fresh review clean; accepted review findings repaired |
| `O08` | Stage 3 | closed-inline | `mods/mod-swooper-maps/src/domain/morphology/ops/plan-volcanoes/contract.ts`; deleted op `config.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | operation config import-zero scan; morphology pattern checks | fresh review clean; accepted review findings repaired |
| `O09` | Stage 3 | closed-recomposed | `mods/mod-swooper-maps/src/domain/morphology/ops/plan-ridges/contract.ts`; `mods/mod-swooper-maps/src/domain/morphology/ops/plan-foothills/contract.ts`; deleted `mountains-shared/config.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test`; `test/morphology/mountain-family-controls.test.ts` through Nx | shared config import-zero scan; public `MountainsConfig` exported through `@mapgen/domain/morphology/ops` | fresh review clean; accepted review findings repaired |
| `O10` | Stage 3 | closed-recomposed | `mods/mod-swooper-maps/src/domain/morphology/ops/plan-rough-lands/contract.ts`; deleted `mountains-shared/config.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test`; `test/morphology/mountain-family-controls.test.ts` through Nx | shared config import-zero scan; morphology pattern checks | fresh review clean; accepted review findings repaired |
| `K01` | Stage 3 | closed-recomposed | foundation plate-count authoring localized to owning foundation stages | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; old shared knob scan | fresh review clean; accepted review findings repaired |
| `K02` | Stage 2 | closed-moved | `mods/mod-swooper-maps/src/domain/foundation/model/policy/plate-activity.ts`; foundation-tectonics stage wiring | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; old foundation config/shared scans | fresh review clean; accepted review findings repaired |
| `K03` | Stage 2 | closed-moved | `mods/mod-swooper-maps/src/domain/foundation/model/policy/crust-character.ts`; foundation-orogeny stage wiring | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; old foundation config/shared scans | fresh review clean; accepted review findings repaired |
| `K04a` | Stage 3 | closed-recomposed | hydrology stage-local authoring plus `domain/hydrology/model/policy/*` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; old hydrology shared scans | fresh review clean; accepted review findings repaired |
| `K04b` | Stage 2 | closed-moved | `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/knobs.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; old hydrology shared scans | fresh review clean; accepted review findings repaired |
| `K04c` | Stage 2 | closed-moved | `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/knobs.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; old hydrology shared scans | fresh review clean; accepted review findings repaired |
| `K04d` | Stage 2 | closed-moved | `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/knobs.ts`; `domain/hydrology/model/policy/hydrography-knob-policy.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; old hydrology shared scans | fresh review clean; accepted review findings repaired |
| `K05a` | Stage 2 | closed-moved | `mods/mod-swooper-maps/src/domain/morphology/model/policy/coast-knob-policy.ts`; morphology-coasts stage wiring | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; morphology public surface rule | fresh review clean; accepted review findings repaired |
| `K05b` | Stage 2 | closed-moved | `mods/mod-swooper-maps/src/domain/morphology/model/policy/erosion-knob-policy.ts`; morphology-erosion stage wiring | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; morphology public surface rule | fresh review clean; accepted review findings repaired |
| `K05c` | Stage 2 | closed-moved | `mods/mod-swooper-maps/src/domain/morphology/model/policy/shelf-knob-policy.ts`; morphology-shelf stage wiring | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; morphology public surface rule | fresh review clean; accepted review findings repaired |
| `K05d` | Stage 2 | closed-moved | `mods/mod-swooper-maps/src/domain/morphology/model/policy/landform-knob-policy.ts`; morphology-features stage wiring | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; morphology public surface rule | fresh review clean; accepted review findings repaired |
| `S01` | Stage 4 | closed-moved | `mods/mod-swooper-maps/src/domain/ecology/model/schemas/feature-placement.schema.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | domain model schema pattern; deleted `ecology/shared/placement-schema.ts` import-zero proof | fresh review clean; accepted review findings repaired |
| `S02` | Stage 4 | closed-moved | `mods/mod-swooper-maps/src/domain/ecology/model/schemas/biome-symbol.schema.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | domain model schema pattern; official vocabulary remains outside domain primitive | fresh review clean; accepted review findings repaired |
| `S03` | Stage 4 | closed-moved | `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/artifacts/wind-field.schema.ts`; deleted `domain/hydrology/ops/shared/wind-field.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | artifact/stage support import-zero scan | fresh review clean; accepted review findings repaired |
| `S04` | Stage 4 | closed-keep-proof | foundation tectonic scalar artifact fields remain artifact-owned | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | `preserve_decomposed_foundation_contract_surfaces`; `require_artifact_file_shape` | fresh review clean; accepted review findings repaired |
| `S05` | Stage 5 | closed-moved | `packages/civ7-map-policy/src/biome-globals.ts`; `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/biome-bindings.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | `@civ7/map-policy` export proof; deleted domain ecology binding import-zero scan | fresh review clean; accepted review findings repaired |
| `S06` | outside scope | tracked-later | `resource-policy-data-contract.domino.md` | n/a | excluded from this execution | n/a |
| `S07` | Stage 4 | closed-keep-proof | snow/ice thresholds remain with owning operation contracts: ice planning thresholds stay in `domain/ecology/ops/features-plan-ice/contract.ts`; stage caller only supplies authored settings | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | operation contract keep proof; no shared domain primitive extracted because the values are operation-local planning policy, not reusable schema vocabulary | fresh review clean; accepted review findings repaired |
| `S08` | Stage 4 | closed-keep-proof | ecology scorer thresholds remain operation-local: burned/jungle/sand scoring settings stay in their respective `domain/ecology/ops/plot-effects-score-*` contracts; stage public config only composes authored UX | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | operation contract keep proof; no shared domain primitive extracted because the values tune individual scorers rather than define reusable ecology model vocabulary | fresh review clean; accepted review findings repaired |
| `MP01` | Stage 5 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/index.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | deleted `map-projection-public-config.ts` import-zero scan | fresh review clean; accepted review findings repaired |
| `MP02` | Stage 5 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/index.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | deleted recipe-root projection helper scan | fresh review clean; accepted review findings repaired |
| `MP03` | Stage 5 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/map-elevation/index.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | deleted recipe-root projection helper scan | fresh review clean; accepted review findings repaired |
| `MP04` | Stage 5 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/index.ts`; `riverProjectionPolicy.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | deleted recipe-root projection helper scan | fresh review clean; accepted review findings repaired |
| `MP05` | Stage 5 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`; `biome-bindings.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | map-policy/domain import split; deleted domain ecology binding scan | fresh review clean; accepted review findings repaired |
| `ST01` | Stage 3 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-lithosphere/index.ts` and stage-local step wiring | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; old config/shared scans | fresh review clean; accepted review findings repaired |
| `ST02` | Stage 3 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-mantle/index.ts` and stage-local step wiring | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; old config/shared scans | fresh review clean; accepted review findings repaired |
| `ST03` | Stage 2 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/index.ts` and steps | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; old foundation shared scans | fresh review clean; accepted review findings repaired |
| `ST04` | Stage 2 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-orogeny/index.ts` and steps | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; old foundation shared scans | fresh review clean; accepted review findings repaired |
| `ST05` | Stage 6 | closed-keep-proof | static map-elevation stage remains stage-owned | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | `require_recipe_stage_authoring_file_shape`; recipe-root helper import-zero scan | fresh review clean; accepted review findings repaired |
| `ST06` | Stage 6 | closed-keep-proof | static map-morphology stage remains stage-owned | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | `require_recipe_stage_authoring_file_shape`; recipe-root helper import-zero scan | fresh review clean; accepted review findings repaired |
| `ST07` | Stage 3 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-shelf/index.ts` and steps | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; morphology public surface rule | fresh review clean; accepted review findings repaired |
| `ST08` | Stage 3 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/index.ts` and steps | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; morphology public surface rule | fresh review clean; accepted review findings repaired |
| `ST09` | Stage 3 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/index.ts` and steps | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; morphology public surface rule | fresh review clean; accepted review findings repaired |
| `ST10` | Stage 3 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/index.ts`; `mountain-ranges-public-config.ts`; steps | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test`; mountain-family tests through Nx | stage authoring pattern; morphology public surface rule | fresh review clean; accepted review findings repaired |
| `ST11` | Stage 3 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/public-config.ts`; `knobs.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; deleted hydrology root helper scan | fresh review clean; accepted review findings repaired |
| `ST12` | Stage 3 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/public-config.ts`; `knobs.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; deleted hydrology root helper scan | fresh review clean; accepted review findings repaired |
| `ST13` | Stage 2 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/public-config.ts`; `knobs.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | stage authoring pattern; deleted hydrology root helper scan | fresh review clean; accepted review findings repaired |
| `ST14` | Stage 6 | closed-keep-proof | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-biomes/public-config.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | `verify_standard_recipe_public_authoring_surface`; stage authoring pattern | fresh review clean; accepted review findings repaired |
| `ST15` | Stage 6 | closed-keep-proof | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features/public-config.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | `verify_standard_recipe_public_authoring_surface`; stage authoring pattern | fresh review clean; accepted review findings repaired |
| `ST16` | Stage 6 | closed-keep-proof | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-pedology/public-config.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | `verify_standard_recipe_public_authoring_surface`; stage authoring pattern | fresh review clean; accepted review findings repaired |
| `ST17` | Stage 5 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/index.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | deleted `map-projection-public-config.ts` import-zero scan | fresh review clean; accepted review findings repaired |
| `ST18` | Stage 5 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/index.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | deleted `map-projection-public-config.ts` import-zero scan | fresh review clean; accepted review findings repaired |
| `ST19` | Stage 5 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/map-elevation/index.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | deleted `map-projection-public-config.ts` import-zero scan | fresh review clean; accepted review findings repaired |
| `ST20` | Stage 5 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/index.ts`; `riverProjectionPolicy.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | deleted `map-projection-public-config.ts` import-zero scan | fresh review clean; accepted review findings repaired |
| `ST21` | Stage 5 | closed-recomposed | `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`; `biome-bindings.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | map-policy/domain import split; deleted `domain/ecology/biome-bindings.ts` scan | fresh review clean; accepted review findings repaired |
| `ST22` | Stage 6 | closed-keep-proof | `mods/mod-swooper-maps/src/recipes/standard/stages/placement/public-config.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | `verify_standard_recipe_public_authoring_surface`; deleted recipe-root helper scan | fresh review clean; accepted review findings repaired |
| `D01` | Stage 7 | closed-deleted | deleted `mods/mod-swooper-maps/src/domain/config.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | root/domain config import-zero scan | fresh review clean; accepted review findings repaired |
| `D02` | Stage 7 | closed-deleted | deleted `mods/mod-swooper-maps/src/domain/foundation/config.ts`; foundation shared knob files | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | old foundation config/shared import-zero scan | fresh review clean; accepted review findings repaired |
| `D03` | Stage 7 | closed-deleted | deleted `mods/mod-swooper-maps/src/domain/hydrology/config.ts`; hydrology shared knob files; recipe-root `hydrology-public-config.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | old hydrology config/shared import-zero scan | fresh review clean; accepted review findings repaired |
| `D04` | Stage 7 | closed-deleted | deleted `mods/mod-swooper-maps/src/domain/morphology/config.ts`; morphology shared knob files | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | `require_morphology_config_facade_exports`; old morphology config/shared import-zero scan | fresh review clean; accepted review findings repaired |
| `D05` | Stage 7 | closed-deleted | deleted `mods/mod-swooper-maps/src/domain/placement/config.ts`; recipe-root `placement-public-config.ts` | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` | old placement config/root helper import-zero scan | fresh review clean; accepted review findings repaired |

## Final Closure Record

| Closure item | Evidence |
| --- | --- |
| Branch | `codex/foundation-lib-tectonics-s6-closure` |
| Commit | Graphite closure commit for this execution slice |
| Graphite state | committed after final verification gates |
| Worktree state | clean after Graphite closure commit |
| Final row matrix | `Implementation Row Ledger`; every non-`S06` row is closed |
| Proof matrix | `nx run mod-swooper-maps:check`; `nx run mod-swooper-maps:test` (`552 pass`, `2 skip`, `0 fail`); `bun tools/habitat/bin/dev.ts check --owner mod-swooper-maps --json`; targeted pattern checks for artifact, operation contract, stage authoring, domain model schema/policy, public domain imports, morphology public imports; retired path `rg` scans; `git diff --check` |
| Preservation matrix | Moves preserve exported schema/policy/contract symbols through exact owners; intentional losses are deleted facades/shared buckets/config files after import-zero proof; no unresolved loss found by implementation review before final agent review |
| Review disposition summary | Fresh review completed. Row coverage/import reviewer found no issues. Boundary reviewer raised stale public-domain/morphology/test import-surface rules; accepted and repaired. Closure reviewer raised stale execution record language and weak `S07`/`S08` keep-proof wording; accepted and repaired. |
| Structural advisories | Full owner check is green with advisory-only operation-contract file-shape findings for `domain/morphology/ops/compute-belt-drivers/contract.ts`, `domain/ecology/ops/plan-plot-effects/contract.ts`, and `domain/resources/ops/adjust-resource-support/contract.ts`; these are outside this config-law row set and are not execution blockers. |
| KNIP report-only support | `bunx --bun knip --workspace mods/mod-swooper-maps --include files --no-progress` ran as a non-gating support check and returned broad pre-existing unused-file noise across generated/scripts/contracts/tests; it was not used as a closure gate. |
| Stale-record audit | Updated stale Habitat rules that still required deleted morphology config facades, stage-level foundation validation, old public-domain import surfaces, old public-test import surfaces, and old morphology public import surfaces |
| S06 deferral | `resource-policy-data-contract.domino.md` |
| Excluded claims | `S06`; full domain-blueprint topology ratchet beyond these config-law rows; product/runtime claims beyond green project checks/tests |

Do not claim product/runtime readiness beyond the named evidence.

## Closure Criteria

The workstream closes only when:

- every non-`S06` row in `disposition.md` has a final ledger state;
- every deleted path has import-zero and public/export proof where applicable;
- every moved/inline/recomposed row has behavior proof appropriate to its owner;
- every keep/no-op row has owner-class proof before adjacent deletion;
- operation contract, stage authoring, and model schema/policy structure checks
  are green or remaining reds are outside this config-law slice and explicitly
  named;
- no accepted P1/P2 review finding remains unrepaired;
- `S06` remains the only tracked-later row and still points to
  `resource-policy-data-contract.domino.md`;
- Graphite/git state is recorded and the worktree is clean after the execution
  commit.

Expected end state:

- operation files no longer use `config.ts` as contract owners;
- operation contracts define their own input/output/strategy/default schema
  envelopes;
- reusable schema primitives live under exact domain `model/schemas` files;
- reusable semantic policy lives under exact domain `model/policy` files;
- public authoring, knobs, compile behavior, and projection bindings remain
  stage-owned;
- official Civ7 vocabulary routes through `@civ7/map-policy`, `@civ7/types`,
  or adapter/runtime owners;
- root/per-domain `config.ts` facades and recipe-root public-config helpers are
  gone unless explicitly reopened by a reviewed public API decision.

Remaining work after closure is not active config-law disposition. It belongs
to later domain-blueprint topology ratcheting or the resource data-contract
domino.
