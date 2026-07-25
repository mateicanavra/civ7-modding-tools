# MapGen Architecture Normalization Packet

Status: `authoritative-project-baseline`
Date: `2026-05-29`
Owner: Architecture normalization workstream

This is the single authoritative packet for MapGen / Swooper Maps architecture
normalization. It supersedes the review, comparison, and debate artifacts now
kept under `architecture-normalization-sources/`.

Use this packet to plan the refactor and migration work. Do not treat the source
materials as competing authority; they exist for provenance, evidence trails,
and future audit.

## How To Use This Packet

This packet serves three reader tasks:

1. **Decide what correct architecture means.** Read "Target Shape" and
   "Stage Promotion Rule."
2. **Understand what is wrong today.** Read "Problem Layers" and the stage
   scorecard.
3. **Sequence implementation.** Read "Accepted Decisions" and "Domino
   Sequence."

The packet intentionally works at multiple levels:

- **Principles:** the stable architecture rules that should survive the current
  refactor.
- **Problem categories:** the root causes behind the scattered findings.
- **Decisions:** the concrete calls that resolve D1-D5 and 0e.
- **Dominoes:** the order of operations for migration planning.
- **Verification:** acceptance criteria and guardrails that keep later work
  from re-opening settled questions.

The accepted pre-A.2 package boundary correction is specified in
[`package-ownership-migration.md`](package-ownership-migration.md). It refines
the package-ownership consequences below without changing D1-D5.

## Decision Snapshot

| Decision | Final call                                                                                                               | Why it matters                                                                                              | First implementation consequence                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| D1       | Use flat default stage config: `{ knobs?, [stepId]?: stepConfig }`. No persisted SDK-native `advanced`.                  | Removes duplicate authoring shapes and settles the public config contract.                                  | Migrate configs/docs/tests from `advanced.<stepId>` to top-level step ids; delete unwrap compiles.     |
| D2       | Lakes are Hydrology truth, but adapter materialization/readback comes before fail-hard parity.                           | Prevents engine projection from masquerading as physics truth while avoiding the prior brittle-gate revert. | Add lake stamping/readback, then `plan-lakes`, then projection, then placement input migration.        |
| D3       | Split placement at real product/effect contracts only.                                                                   | Exposes hidden gameplay boundaries without manufacturing fake dependency chains.                            | Promote wonders/resources/starts/discoveries/advanced-starts as real contracts one boundary at a time. |
| D4       | Resources use typed intent reconciliation; discoveries delegate materialization to Civ7 and retain observed counts.      | Preserves deterministic resource intent without inventing a map-side discovery authority Civ7 does not expose. | Reconcile resource intents per tile; record discovery attempts, placements, and rejections as metrics/log evidence. |
| D5       | Ecology truth stage IDs are `ecology-pedology`, `ecology-biomes`, and `ecology-features`; `map-ecology` is projection only. Their source nests by family under `stages/ecology/{pedology,biomes,features,projection}`. | Avoids both seven speculative feature-family wrappers and one overbroad ecology blob without conflating runtime identity with filesystem layout. | Fold feature-family wrappers with output-equivalence tests; retain `stages/ecology/` only as the semantic family container. |
| 0e       | Use a scoped import policy; enforce a narrow recipe deep-import guard first.                                             | Makes module boundaries enforceable without broad-banning legitimate internal imports.                      | Remediate public surfaces, then turn on the first `src/recipes/**` guardrail.                          |

## Source Material

The following documents are source material only:

- `architecture-normalization-sources/architecture-normalization-review.md`
- `architecture-normalization-sources/architecture-normalization-review-independent.md`
- `architecture-normalization-sources/architecture-normalization-decisions-codex.md`
- `architecture-normalization-sources/architecture-normalization-decisions-independent.md`
- `architecture-normalization-sources/architecture-normalization-decisions-comparison.md`
- `architecture-normalization-sources/architecture-normalization-decision-debate.md`

They are useful evidence. They are not the active packet.

## Authority Stack

When this packet disagrees with older project notes, this packet wins for the
normalization workstream. When this packet is later folded into OpenSpec or
evergreen docs, the promoted spec/ADR becomes the long-lived authority.

Use sources in this order:

1. **This packet** for current normalization decisions and sequencing.
2. **Current code** as implementation evidence, especially:
   - `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
   - `packages/mapgen-core/src/authoring/stage/create.ts`
   - `packages/mapgen-core/src/authoring/recipe/create.ts`
   - `packages/mapgen-core/src/engine/PipelineExecutor.ts`
3. **Canonical MapGen and Swooper docs** for standing architecture:
   - `docs/system/libs/mapgen/MAPGEN.md`
   - `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
   - `docs/system/libs/mapgen/policies/`
   - `docs/system/libs/mapgen/reference/`
   - `docs/system/mods/swooper-maps/`
4. **Project spec and ADRs** for accepted engine-refactor decisions:
   - `docs/projects/engine-refactor-v1/resources/spec/SPEC-*.md`
   - `docs/projects/engine-refactor-v1/resources/spec/adr/`
   - `docs/system/ADR.md`

Known stale sources must not override this packet:

- `reference/STANDARD-RECIPE.md` still needs reconciliation with the live
  standard recipe.
- Existing packet/source docs before this file's current state contain stale
  D1 and D5 calls.
- Some spec/appendix docs still use superseded stage names such as
  `morphology-pre/mid/post`.

## Target Shape

MapGen is a deterministic pipeline with explicit ownership boundaries.

| Layer                | Owns                                                                                                                                                              | Must not own                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Domain               | Pure algorithms, contract-first ops, strategies, rules, domain types, reusable domain semantics, and immutable artifact authorities cataloged by their direct producing modules. | Runtime context, recipe ordering, adapter calls, or stage orchestration. |
| Step                 | Executable contract boundary: `requires`, `provides`, artifact selection/publication, effects, config schema, op binding, input building, and one bounded orchestration responsibility. | Heavy domain compute, sibling-stage internals, hidden sub-pipelines, or artifact catalogs. |
| Stage                | Authoring/config surface, knobs scope, stage id prefix, and local step composition.                                                                               | Global ordering, truth authority, runtime topology, compute, or artifact catalogs. |
| Recipe               | Global stage/step order and enablement.                                                                                                                           | Hidden manifests, prose ordering, or `shouldRun`-style skips.            |
| Compilation          | Validate and normalize authoring config into executable step/op config.                                                                                           | Side effects or engine state.                                            |
| Execution            | Run the compiled plan with dependency gates, write-once artifact vintages, and traces.                                                                             | Architecture design, shared mutable buffers, or compatibility shims.     |
| Projection / Runtime | Materialize immutable domain products into Civ7 engine state, observe current state invocation-locally, and verify effects.                                      | Domain truth, artifact catalogs, or mutable engine snapshots published as artifacts. |

Recipe steps use one source topology: `steps/<step-id>/config.ts` owns the
runtime-free `defineStep` contract, while `steps/<step-id>/step.ts` owns the
`createStep` implementation. The step directory name is the contract's exact
kebab-case id. Stage roots import step implementations directly; forwarding
step barrels and flat `*.contract.ts`/implementation pairs are not additional
authorities.

Two invariants dominate the refactor:

- **Recipe owns ordering.** Stage order is the recipe array. `requires` and
  `provides` are gates, not a separate topology engine.
- **Truth and projection stay separate.** Physics/domain stages publish truth
  artifacts. `map-*` / Gameplay stages project those artifacts into engine
  fields, adapter calls, effects, and parity evidence.
- **Artifacts are immutable domain/module products.** Their definitions and
  catalogs live with the direct producing module. Recipe stages may compose
  steps that publish them, but stages do not define catalogs. Mutable/current
  Civ7 state remains invocation-local adapter observation; completed scalar or
  component evidence may flow through metrics facets without becoming a
  pipeline artifact.

## Stage Promotion Rule

A stage is not a folder, a debug grouping, or an implementation seam. A stage is
a recipe-level authoring and ownership surface.

Promote a concern to a stage when at least one of these is true:

- It has a distinct stage-level authoring or knobs surface.
- It has a distinct upstream input family and downstream handoff artifact set.
- It needs independent recipe placement, or another stage must be able to run
  between it and neighboring work.
- It owns stage-scoped helpers/contracts shared by multiple steps that should
  not become broad shared catalogs.
- It needs independent enablement, review identity, or trace identity at the
  recipe level.
- It is a projection/materialization boundary that consumes truth and emits
  engine-facing fields/effects or `artifact:map.*` style handoffs.

Do not promote solely because:

- a domain has many sub-concerns,
- a future knob is plausible,
- an intermediate artifact is useful,
- Studio wants a grouping,
- an implementation variant exists, or
- a domain op would otherwise have a large input schema.

Domain-op input size is controlled by step input builders and op contract
design. Stage count can make input/handoff surfaces clearer, but it is not the
primary mechanism for shrinking op schemas.

## Problem Layers

The architecture review findings collapse into six root problem layers. This is
the order to reason about them, even when implementation work lands in smaller
branches.

### 1. Authority And Doc Gravity

**Root cause:** multiple docs looked current while encoding different targets:
single ecology vs split ecology, nested `advanced` vs flat config, old stage
names, engine-owned surfaces vs truth-owned surfaces.

**Why it comes first:** stale authority causes every later refactor to reopen
settled questions. If implementers enter through the wrong doc, they will repair
the wrong architecture.

**Normalization principle:** one project packet owns the current baseline.
OpenSpec/evergreen docs are updated from that packet later, not independently
negotiated during implementation.

### 2. Authoring Surface Drift

**Root cause:** stages were using different config surface idioms for the same
concept. Five stages hand-wrote a nested `advanced` wrapper and unwrap
`compile`; default/no-public stages already use a flat Shape A surface.

**Why it comes early:** D1 changes the public recipe config shape. That affects
Studio, presets, docs, tests, and migration scripts. Leaving it unresolved makes
every stage cleanup uncertain.

**Normalization principle:** use one default stage authoring surface:
`{ knobs?, [stepId]?: stepConfig }`. Compile presence denotes a semantic
authoring transform; when that transform has no knobs or public keys, the exact
persisted surface is `{}` and fixed step configuration remains private. Keep a
public schema only for genuine authored controls.

### 3. Ownership And Colocation Drift

**Root cause:** old single-stage roots and centralized catalogs survived after
the architecture moved on. Examples include recipe-root `tags.ts`,
retired flat sibling roots such as `stages/ecology-biomes/` and
`stages/morphology-features/`, and broad multi-owner config files.

**Why it follows authoring surface:** once the stage/config target is fixed,
source layout can move toward the real owners without preserving wrappers for a
soon-to-change surface.

**Normalization principle:** colocate contracts, schemas, and helper logic with
the nearest real owner. Artifact authorities and their sole catalogs live with
the direct producing domain module; recipe and stage catalogs are forbidden.
Other stage-neutral shared surfaces are allowed only when their invariant and
consumers are explicit.

### 4. Truth/Projection Authority Leaks

**Root cause:** some surfaces are claimed as deterministic pipeline truth while
current implementation delegates intent to Civ7 engine generators or adapter
projection.

Load-bearing examples:

- `map-hydrology` projects authored lake intent through the adapter and records
  readback; it must not reintroduce official lake generation as truth.
- placement plans resources as authored intents and reconciles adapter
  legality/readback. Discovery materialization delegates to Civ7's official
  narrative-coupled generator and retains exact attempted/placed/rejected
  counts as observation evidence rather than an authored plan.
- `map-*` stages are valid only when they are projection/materialization lanes,
  not domain truth or Studio grouping devices.

**Why it comes after ownership cleanup:** fail-hard verification without the
right adapter/materialization capability repeats known revert patterns.

**Normalization principle:** make truth artifacts explicit first, then add
adapter materialization/readback, then gate parity.

### 5. Hidden Contract Boundaries

**Root cause:** some broad steps hide product/effect workflows behind internal
helper calls. Placement is the main example: one large apply step contains
multiple gameplay products and projection concerns.

**Why it waits until earlier decisions:** splitting too early creates fake
`requires -> provides` chains that only restate array order. D3 and D4 need the
authoring surface, import policy, and truth/projection posture settled first.

**Normalization principle:** split only at real product/effect contracts.
Maintenance calls may stay transactional until they have independent artifacts,
effects, or consumers.

### 6. Consumer And Package Boundary Drift

**Root cause:** public consumers and routers sometimes depend on generated
artifacts, stale docs, or Civ7-bound code inside pure MapGen core.

**Why it cuts across the sequence:** these are high-leverage DX repairs, but
some depend on prior contract choices. They should be grouped with the first
slice that makes their target clear.

**Normalization principle:** pure core remains pure; Studio consumes source
contracts or documented generated outputs; AGENTS/docs route to live authority.

## Accepted Decisions

### D1: Default Stage Config Surface Is Flat

**Decision:** use the existing default/no-public stage surface:

```ts
{
  knobs?: StageKnobs;
  [stepId]?: StepConfig;
}
```

Do not add SDK-native nested `advanced`. Delete boilerplate stages that define
`public.advanced` only to return `config.advanced` from `compile`. Tighten the
derived step-key schema where feasible so the flat surface is typed earlier,
not only during later compile validation.

**Why:** flat Shape A already exists and is simpler. `advanced` can remain a UI
grouping concept without becoming a persisted config key. A custom `public +
compile` stage remains valid when the surface genuinely differs from step
config.

**Migration impact:** this is a public recipe config migration. It touches
Studio schemas/defaults, presets, docs, tests, and any config examples that
currently use `advanced.<stepId>`.

### D2: Lakes Are Hydrology Truth, But Adapter Capability Comes First

**Decision:** Hydrology should own deterministic lake intent. `map-hydrology`
should project/materialize that intent into Civ7 engine state and verify drift.
Placement should consume Hydrology lake truth, not `engineProjectionLakes`.

**Sequencing constraint:** do not fail-hard until explicit adapter
materialization/readback exists. The order is:

1. Add or expose lake stamping/readback capability.
2. Implement `plan-lakes` as real Hydrology intent, not a renamed `sinkMask`.
3. Make `map-hydrology` stamp/project that plan.
4. Migrate placement off `engineProjectionLakes`.
5. Add parity gates only after projection can prove the planned mask.

**Why:** Civ7 lake generation is projection behavior, not pipeline-owned
intent. But gating against an unstamped diagnostic repeats the prior revert
pattern.

### D3: Split Placement Only At Real Product/Effect Boundaries

**Decision:** decompose placement into contract-bounded product/effect steps,
not helper-by-helper steps.

Good candidates include:

- natural wonders,
- resources,
- starts,
- discoveries,
- advanced starts,
- any other product with a real artifact/effect and verification surface.

Maintenance operations such as terrain validation, area recalculation, water
cache storage, restamping, and fertility recalculation may remain transactional
unless they gain independent consumers or contracts.

**Why:** the broad placement apply step hides too much behavior, but a
mechanical split would manufacture fake contracts that only encode ordering.

### D4: Resources Reconcile Typed Intent; Discoveries Retain Official Observations

**Decision:** the resource plan is authority for typed placement intent.
Resource projection reconciles plan vs engine-feasible placement and fails only
on unexplained drift, wrong type/location, or untyped rejection.

Discovery placement has a different authority. Civ7's official generator owns
its narrative-coupled selection and materialization; Swooper supplies the
ordered start exclusions and polar margin, then retains attempted, placed, and
rejected totals as successful observation evidence. It does not manufacture a
discovery plan, per-tile outcomes, or a fake causal artifact.

**Why:** engine legality owns resource feasibility at materialization time.
Count equality can fail on legitimate rejection or pass while placing the wrong
resource. Discovery identities and budgets depend on live narrative state that
is not a stable map-side catalog, so treating the official generator as the
materialization authority is more truthful than duplicating it.

**Dependency:** resource reconciliation requires adapter/materializer outcomes
with per-tile placed items and typed rejection reasons. Discovery observation
requires the adapter to expose the official generator's attempted/placed
counts; successful completion is carried by the step effect and metrics/log
evidence.

### D5: Ecology Uses Multiple Truth Stages By Input/Handoff Surface

**Decision:** normalize Ecology to the following recipe-level surfaces:

The names below are stable runtime stage IDs. Physical source follows semantic
containment under `stages/ecology/{pedology,biomes,features}` and
`stages/ecology/projection`; filesystem nesting does not change runtime
identity.

| Stage              | Purpose                                                                                                                 | Stage handoff                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `ecology-pedology` | Pedology and resource basin planning. Inputs are morphology topography plus baseline climate.                           | Soils/pedology and resource basins.                   |
| `ecology-biomes`   | Biome classification and any biome-edge refinement. Inputs are refined climate/cryosphere plus topography and pedology. | Biome classification.                                 |
| `ecology-features` | Feature substrate/score layers, feature family intent planning, occupancy cascade, and final feature intent merge.      | Feature intents and final occupancy.                  |
| `map-ecology`      | Projection/materialization only: engine biome ids, feature type writes, plot effects, diagnostics/parity.               | Engine-facing fields/effects and projection evidence. |

Do not keep the current seven truth stages as one wrapper per feature family
without real stage surfaces. Do not collapse all truth into one broad
`ecology` stage. Keep score/substrate and family intents as step/artifact seams
inside `ecology-features` unless they gain real stage-level triggers.

**Why:** pedology, biomes, and feature planning have different input families
and handoff artifacts. Ice/reefs/wetlands/vegetation are currently empty-knob
single-step wrappers and do not each justify recipe-stage identity.

**Execution risk:** merging feature-family stages is behavior-sensitive. The
migration needs output-equivalence tests or golden artifact checks for feature
plans, occupancy, and final projection inputs.

### D5 Extension: `map-*` Stages Are Projection Only

`map-morphology`, `map-hydrology`, and `map-ecology` are justified only where
they consume immutable domain products and own projection/materialization
effects, adapter writes, parity diagnostics, projection-specific knobs, or
publication of another immutable product selected from its direct domain
module's catalog. Stable `artifact:map.*` product ids do not confer catalog
ownership on a recipe stage.

Projection behavior does not itself create authored configuration. Fixed
projection stages use configurationless compiled surfaces; Swooper-specific
binding policy stays local to its projection step and official Civ7 identities
come from Civ7 policy.

If a `map-*` stage exists only for Studio grouping, debug navigation, or an
internal implementation seam, collapse it or solve the presentation need with
Studio/SDK metadata.

### 0e: Import Policy Is Scoped, With A Narrow First Guardrail

**Decision:** keep a scoped import matrix rather than a broad `@mapgen/*` ban.

- Public docs/examples should not teach workspace-only aliases.
- Public consumers should use package exports.
- `@mapgen/domain/*` is a temporary workspace alias, not a durable public
  surface. Package-local consumers use finite mod-owned facades or relative
  internals; external consumers use real package exports.
- Cross-domain source should avoid deep internals once finite owner surfaces
  exist. Intra-op/domain internals use relative imports.
- Tests should follow the code under test.

**First enforcement:** ship a narrow G4 guardrail for `src/recipes/**` deep
reach-ins after the small public-surface remediation. Keep the broader matrix as
policy until matching public surfaces exist.

## Stage And Area Scorecard

| Area                    | Verdict                      | What must change                                                                                          |
| ----------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| `foundation`            | Clean reference              | Preserve as the Shape A / contract-first reference.                                                       |
| Morphology truth stages | Transitional                 | Delete unwrap-`advanced` boilerplate; move remaining heavy step logic into ops where needed.              |
| `map-morphology`        | Transitional projection      | Keep only projection/materialization concerns; clean up surface/key naming and milestone tags.            |
| Hydrology truth stages  | Mostly aligned               | Keep contract-first truth products; improve semantic tags where needed.                                   |
| `map-hydrology` lakes   | Divergent                    | Add lake truth + adapter stamping/readback or keep engine lakes labeled projection limitation until then. |
| Ecology truth           | Divergent topology           | Normalize to pedology, biomes, features nested beneath `stages/ecology/`; retain only genuinely shared family surfaces at the family root. |
| `map-ecology`           | Transitional projection      | Keep projection-only; move any truth/scoring/planning work back upstream.                                 |
| Placement               | Divergent                    | Split real product/effect boundaries; implement D4 typed reconciliation later.                            |
| Core SDK purity         | Divergent                    | Move Civ7-bound map authoring/runtime calls out of pure core.                                             |
| Studio config exports   | DX mismatch                  | Make recipe config schema/defaults source-visible or first-class generated contracts.                     |
| Artifact catalogs       | Divergent                    | Remove recipe/stage catalogs and split domain-root multi-owner catalogs into direct producing-module owners. |
| Routers / docs          | Divergent until this cleanup | Route to this packet and later OpenSpec/evergreen authorities.                                            |

## Domino Sequence

### Domino 0: Freeze Authority And Source Material

**Goal:** make one packet the workstream baseline.

**Actions:**

- Keep this packet in the main project docs area.
- Move source/review/debate documents under
  `architecture-normalization-sources/`.
- Update references so no source doc is mistaken for the active packet.

**Why first:** every later migration depends on not reopening D1-D5/0e through
stale docs.

**Done when:**

- `architecture-normalization-packet.md` is the only root-level
  architecture-normalization decision artifact.
- source materials live only in the sibling source directory.
- searches for the moved docs point either to source material or this packet.

### Domino 1: Product Surface And Import Policy

**Goal:** settle the public authoring and module-boundary shape before file
moves.

**Actions:**

- Implement D1 flat default stage surface migration.
- Delete boilerplate `public.advanced` unwrap compiles.
- Tighten generated/derived step-key schemas where feasible.
- Remediate recipe deep imports needed for narrow G4.
- Document the import matrix.

**Why early:** D1 is a public config contract; 0e controls enforceable module
boundaries. Moving stage files before these are settled risks preserving the
wrong shape.

**Done when:**

- Studio/default config tests pass against the flat surface.
- presets/config examples use top-level step ids rather than persisted
  `advanced`.
- recipe assembly no longer deep-reaches internals covered by the first G4
  guardrail.

### Domino 2: Colocation And Ecology Topology

**Goal:** make family containers and stages map to real shared and
input/handoff surfaces.

**Actions:**

- Restrict family containers such as `stages/ecology/` and
  `stages/morphology/` to genuinely shared surfaces; nest each stage beneath
  its semantic family.
- Normalize Ecology to `ecology-pedology`, `ecology-biomes`,
  `ecology-features`, and projection-only `map-ecology` runtime IDs while
  storing them at `ecology/{pedology,biomes,features}` and `map/ecology`.
- Preserve behavior with tests/golden artifacts for feature intents,
  occupancy, and projection inputs.
- Remove recipe/stage artifact catalogs and decompose broad domain catalogs
  into direct producing-module owners.

**Why after Domino 1:** topology cleanup should not carry forward stale config
or import idioms.

**Done when:**

- no stage imports a sibling stage's `steps/`;
- feature-family wrappers have been folded without output drift;
- `STANDARD-RECIPE.md` and Ecology reference docs match the live recipe target.

### Domino 3: Projection Truth Corrections

**Goal:** remove engine-as-truth leaks without brittle gates.

**Actions:**

- Add lake materialization/readback, then implement Hydrology lake truth.
- Migrate placement lake inputs off `engineProjectionLakes`.
- Audit `map-*` stages against the projection-only rule.
- Keep current engine-owned surfaces labeled as projection limitations until
  the corresponding truth + adapter capability exists.

**Why after topology:** projection gates are meaningful only after truth
artifacts and stage ownership are explicit.

**Done when:**

- lake plan truth exists and is projected through an explicit adapter path;
- placement consumes the lake truth artifact;
- `map-*` stages either own projection/materialization or have been collapsed.

### Domino 4: Placement Product Boundaries And Truthful Materialization Evidence

**Goal:** expose gameplay products as real contracts and reconcile engine
feasibility honestly.

**Actions:**

- Split placement one product/effect boundary at a time.
- Keep maintenance sequencing transactional unless it gains a real contract.
- Add adapter/materializer outcomes with typed placed items and rejection
  reasons for resource intent.
- Implement D4 typed resource reconciliation.
- Delegate discovery materialization to Civ7's official generator and retain
  exact attempted/placed/rejected observations without a discovery plan or
  pipeline artifact.
- Supersede records that conflate resource intent authority with discovery
  materialization authority.

**Why late:** this depends on the contract vocabulary, projection posture, and
adapter capability decisions established earlier.

**Done when:**

- placement products have explicit contracts/effects;
- resources fail only on unexplained drift or typed mismatch;
- discovery completion and counts are observable in headless metrics and the
  live engine log;
- no doc claims Swooper-authored discovery truth where Civ7 owns the product.

### Domino 5: OpenSpec Promotion And Guardrails

**Goal:** promote stable decisions into long-lived specs and make relapse
mechanically hard.

**Actions:**

- Convert this packet into OpenSpec workstreams/milestones.
- Update evergreen/spec docs from accepted workstream outputs.
- Add guardrails only after the corresponding cleanup lands.

**Why last:** guardrails should encode achieved structure. They should not red
bar main before the migration that makes them pass.

**Done when:**

- OpenSpec owns executable migration workstreams;
- evergreen/spec docs reflect implemented decisions;
- CI or doc lint catches regressions to old architecture.

## Guardrails To Add After Cleanup

**Promotion status:** implemented G1-G9 guard scope is now superseded by
`docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`. Keep this table
as the packet source record; use the policy for current commands, proof
boundaries, and the cleanup slice that enables each guard.

| ID  | Fails on                                                                                               | Enable after                       |
| --- | ------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| G1  | milestone-prefixed tag identifiers such as `M\d+_` in source                                           | tag decomposition uses final names |
| G2  | recipe/stage artifact catalogs or domain-root multi-owner artifact catalogs                            | catalog-owner migration             |
| G3  | Civ7 adapter value imports, Civ globals, or Civ7 type refs inside pure `packages/mapgen-core` surfaces | core purity migration              |
| G4  | recipe deep imports outside sanctioned public domain surfaces                                          | first import-policy remediation    |
| G5  | a stage importing a sibling stage's `steps/`                                                           | Ecology topology cleanup           |
| G6  | standard recipe docs stage list diverging from live recipe/stage source                                | recipe-doc reconciliation          |
| G7  | non-archive docs using superseded current-stage ids outside history/migration context                  | spec/doc naming cleanup            |
| G8  | broad steps growing hidden uncontracted sub-concerns                                                   | placement split                    |
| G9  | boilerplate unwrap-`advanced` compiles reintroduced                                                    | D1 migration                       |

## OpenSpec Handoff Notes

Do not turn this packet directly into one giant implementation ticket. Split it
into OpenSpec workstreams around the dominoes:

1. **Authority and docs routing.**
2. **D1 config surface migration plus Studio/preset fallout.**
3. **Import policy and public surface remediation.**
4. **Ecology topology and colocation.**
5. **Projection truth corrections, starting with lakes.**
6. **Placement decomposition, resource reconciliation, and discovery observation.**
7. **Guardrails and evergreen spec promotion.**

Each OpenSpec workstream should carry:

- target state,
- current-state evidence,
- explicit non-goals,
- acceptance criteria,
- migration tests,
- docs to update,
- guardrails to enable after the slice lands.

## Current Non-Goals

This packet does not implement the refactor. It does not:

- edit MapGen source code,
- migrate configs or presets,
- update evergreen OpenSpec/spec docs,
- add CI guardrails,
- claim in-game verification,
- or close projection limitations that still require adapter capability.

It establishes the accepted architecture baseline and sequencing for that work.
