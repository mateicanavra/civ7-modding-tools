# Architecture Boundaries For MapGen/Swooper Rule Remediation

Lane: DRA habitat authority tree pruning frame
Scope: non-mutating source/rule/code investigation
Evidence standard: corroborated architecture topology, not runtime verification

## Investigation Frame

This lane answers: which architecture boundaries, owners, non-owners, import
rules, and package/module separations should govern MapGen/Swooper Maps rule
remediation.

In scope:

- root and relevant subtree `AGENTS.md`;
- named MapGen architecture, policy, reference, and active project-baseline docs;
- package/project metadata for `mapgen-core`, `mapgen-viz`, SDK, adapter,
  Swooper Maps, and MapGen Studio;
- representative source anchors for constructibility.

Out of scope:

- rule edits;
- product source edits;
- generated output edits;
- package tests;
- proving current runtime behavior.

Authority order used:

1. User lane instructions and no-mutation contract.
2. Root/subtree `AGENTS.md`.
3. `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
   for MapGen/Swooper normalization baseline.
4. Canonical MapGen docs and accepted ADRs/policies where they record later
   promoted decisions.
5. Source and project metadata as implementation evidence.

## Source Set Processed

Authority and policy:

- `AGENTS.md`
- `packages/mapgen-core/AGENTS.md`
- `packages/mapgen-core/src/AGENTS.md`
- `mods/mod-swooper-maps/AGENTS.md`
- `mods/mod-swooper-maps/src/AGENTS.md`
- `packages/mapgen-viz/AGENTS.md`
- `packages/sdk/AGENTS.md`
- `packages/civ7-adapter/AGENTS.md`
- `docs/system/ARCHITECTURE.md`
- `docs/system/ADR.md`
- `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
- `docs/system/libs/mapgen/policies/IMPORTS.md`
- `docs/system/libs/mapgen/policies/MODULE-SHAPE.md`
- `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`
- `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`
- `docs/system/libs/mapgen/reference/domains/DOMAINS.md`
- `docs/system/libs/mapgen/reference/domains/*` heading/anchor scan
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/projects/habitat-harness/taxonomy.md`
- `eslint.boundaries.config.mjs`

Representative source anchors:

- `packages/mapgen-core/src/authoring/stage.ts`
- `packages/mapgen-core/src/compiler/recipe-compile.ts`
- `packages/mapgen-core/src/engine/PipelineExecutor.ts`
- `packages/civ7-adapter/src/types.ts`
- `packages/civ7-adapter/src/civ7-adapter.ts`
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/**`
- `mods/mod-swooper-maps/src/domain/**` directory and import samples
- package/project metadata for the requested packages/apps.

## Project-Plane Topology

Project-plane boundaries are positive dependency allowances over `kind:*` tags,
enforced by `eslint.boundaries.config.mjs` and documented in
`docs/projects/habitat-harness/taxonomy.md`.

| Project | Path | Tag | Positive dependencies |
|---|---|---|---|
| MapGen core | `packages/mapgen-core` | `kind:engine` | `kind:adapter`, `kind:foundation` |
| MapGen viz | `packages/mapgen-viz` | `kind:foundation` | `kind:foundation` only |
| SDK | `packages/sdk` | `kind:sdk` | `kind:engine`, `kind:adapter`, `kind:foundation`, `kind:plugin` |
| Civ7 adapter | `packages/civ7-adapter` | `kind:adapter` | `kind:foundation` |
| Swooper Maps mod | `mods/mod-swooper-maps` | `kind:mod` | `kind:sdk`, `kind:engine`, `kind:adapter`, `kind:foundation`, `kind:control`, `kind:plugin` |
| MapGen Studio | `apps/mapgen-studio` | `kind:app` | `kind:sdk`, `kind:engine`, `kind:adapter`, `kind:foundation`, `kind:plugin`, `kind:control`, `kind:mod`, `kind:tooling` |

Important separation: project-plane legality does not imply local/module-plane
legality. For example, a mod can depend on MapGen core and adapter at the
project plane, but recipe code still must honor the scoped MapGen import matrix.

## Owner / Non-Owner Map

### SDK

Owner claims:

- Owns public TypeScript mod-authoring APIs, builders, nodes, XML file
  abstractions, localizations, and mod output contracts.
- Owns the SDK root package and the `@mateicanavra/civ7-sdk/mapgen` subpath as
  public surface separation.

Non-owner claims:

- Does not own MapGen pipeline internals, recipes, algorithms, stage topology,
  or Civ7 runtime adapter calls.
- Does not own generated `dist/` output as editable truth.

Constructibility:

- `packages/sdk/package.json` exports root and `./mapgen`; project tag
  `kind:sdk` allows engine/adapter/foundation/plugin dependencies.
- Normalization guardrail G11 says the SDK root must remain Node/Bun safe and
  MapGen runtime helpers belong only under the mapgen subpath.

### Civ7 Adapter

Owner claims:

- Sole owner of direct Civ7 engine globals and `/base-standard/...` imports.
- Owns translation from engine/runtime APIs into stable adapter methods.
- Owns policy/legality/readback and projection/materialization adapter calls:
  `canHaveResource`, `getResourceType`, `stampLakes`,
  `placeResourceIntent`, `placeDiscoveryIntent`, feature/plot-effect writes,
  start-position wrappers, and readback result types.

Non-owner claims:

- Does not own MapGen algorithms, recipe semantics, mod tuning, or SDK XML
  generation.

Constructibility:

- `packages/civ7-adapter/src/civ7-adapter.ts` directly imports `/base-standard`
  modules and wraps engine globals.
- `packages/civ7-adapter/src/types.ts` already exposes lake projection
  readbacks and typed resource/discovery/natural-wonder placement outcomes.

### MapGen Core

Owner claims:

- Owns pure MapGen authoring/runtime machinery: stage/step/domain contracts,
  recipe compilation, execution plans, executor dependency validation, tags,
  artifacts, tracing, deterministic utilities, and reusable pure libs.

Non-owner claims:

- Must not own mod-specific recipe content, Civ7 runtime globals, game-facing
  bootstrap files, generated mod output, Studio UI, or projection truth.

Constructibility:

- `packages/mapgen-core/src/authoring/stage.ts` implements the default flat
  stage surface `{ knobs?, [stepId]?: stepConfig }` when no public transform is
  declared, and semantic public+compile stages when a real transform exists.
- `packages/mapgen-core/src/compiler/recipe-compile.ts` validates strict
  stage ids and step ids; it explicitly rejects stale `ecology` when split
  ecology stages exist.
- `packages/mapgen-core/src/engine/PipelineExecutor.ts` owns dependency tag
  gating and trace scoping.
- Core imports adapter types and consumes `EngineAdapter` abstractions. A broad
  rule saying "mapgen-core may never mention adapter" would contradict the
  accepted `kind:engine -> kind:adapter` project-plane allowance and current
  core context model.

Potential contradiction:

- `packages/mapgen-core/src/dev/introspection.ts` references `globalThis`
  engine objects (`GameplayMap`, `TerrainBuilder`, etc.). The normalization
  G3 guard explicitly scopes core purity to `src/core` and `src/engine` and
  leaves dev introspection outside that guard, but the architecture skill's
  broader "core stays pure" wording is stricter. A remediation rule should
  follow the narrower accepted guard unless it deliberately reopens the dev
  introspection exception.

### MapGen Viz And Apps

Owner claims:

- `packages/mapgen-viz` owns shared visualization contract types.
- MapGen Studio owns UI, browser worker, streaming/dump ingest, recipe DAG
  display, setup forms, and run-in-game orchestration as an app surface.

Non-owner claims:

- Does not own generation truth, domain algorithms, engine projection, or public
  recipe semantics beyond consuming stable surfaces.

Constructibility:

- `packages/mapgen-viz` is `kind:foundation`.
- `apps/mapgen-studio` is `kind:app`, allowed to depend on the product graph.
- ADR-004 says UI consumes recipe artifacts while workers consume runtime recipe
  modules; `apps/mapgen-studio/src/recipes/catalog.ts` imports generated recipe
  config artifacts from the mod package.

### Swooper Maps Mod / Standard Recipe

Owner claims:

- Owns game-facing mod integration, map entrypoints, source recipe content,
  recipe stages, domain ops, and generated deployment package generation.
- Standard recipe order is owned by source, not prose. Current ordering source
  is `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`, delegated through
  `contract-manifest.ts`.
- Source recipe package owns the content domains and their public recipe-facing
  facades.

Non-owner claims:

- Does not own pure reusable core machinery, adapter internals, or hand-edited
  generated `mod/` output.

Constructibility:

- Current recipe source already uses the packet's accepted ecology topology:
  `ecology-pedology`, `ecology-biomes`, `ecology-features`, and projection-only
  `map-ecology`.
- Current recipe also includes `map-morphology`, `map-hydrology`,
  `map-elevation`, and `map-rivers` as projection/materialization lanes.
- Current placement stage has multiple product/effect steps:
  `place-natural-wonders`, `plan-resources`, `assign-starts`,
  `adjust-resources`, `place-resources`, `place-discoveries`,
  `assign-advanced-starts`, and terminal `placement`.

### Domains Inside Swooper Maps

Owner claims:

- Domains own pure ops, strategies, rules, domain types, artifact semantics, and
  reusable domain policy.
- Steps own orchestration and boundary contracts, not heavy domain computation.
- Stages own authoring/config surfaces and local step composition.
- Recipe owns global ordering.

Current intended domain map:

- Foundation: truth in mesh space; tile-space projections only for downstream
  tile consumers.
- Morphology: tile-space terrain/earth-matter truth; map projection applies
  morphology truth to engine terrain/feature fields.
- Hydrology: canonical drainage routing, discharge, rivers, lake intent, and
  climate/hydrography truth.
- Ecology: pedology, resource basins, biome classification, feature/plot-effect
  planning truth; `map-ecology` projection only.
- Resources: owns resource planning, demand/eligibility, habitat lanes, site
  selection, support adjustment.
- Gameplay/Placement: owns gameplay-product orchestration, starts,
  discoveries, natural wonders, late placement effects; target docs say legacy
  Placement/Narrative are absorbed into Gameplay except resources remain owned
  by `domain/resources`.

Non-owner claims:

- Narrative is legacy naming, not target-canonical ownership.
- Placement does not re-own resource planning after ADR-008.
- `map-*` stages do not own upstream truth, planning, or Studio grouping.

## Import / Boundary Rules

### Project Plane

The Nx boundary table is a positive allowlist by tags. It should be used to
reject illegal package-level edges, not to encode MapGen-local structure.

Examples:

- `kind:adapter -> kind:foundation` only.
- `kind:engine -> kind:adapter|foundation`.
- `kind:mod -> sdk|engine|adapter|foundation|control|plugin`.
- `kind:app -> sdk|engine|adapter|foundation|plugin|control|mod|tooling`.

### Package Public Surfaces

Canonical docs/examples and external consumers should use package exports:

- `@swooper/mapgen-core/authoring`
- `@swooper/mapgen-core/engine`
- `@swooper/mapgen-core/compiler/normalize`
- `@swooper/mapgen-core/lib/grid`
- `@civ7/adapter`
- `@civ7/adapter/civ7`
- `@civ7/adapter/mock`
- `@mateicanavra/civ7-sdk`
- `@mateicanavra/civ7-sdk/mapgen`

Disallowed for public docs/examples:

- workspace-only `@mapgen/*`;
- `@swooper/mapgen-core/src/...`;
- `@swooper/mapgen-core/dist/...`;
- relative paths that traverse package boundaries.

### Standard Recipe / Domain Import Matrix

Allowed current recipe surfaces:

- Standard recipe assembly may import `@mapgen/domain/<domain>/ops`.
- Standard stages may import `@mapgen/domain/<domain>/config.js`.
- Config/schema facades may use domain roots where they are declared public
  domain surfaces.
- Domain internals use relative imports within the same owner.

Disallowed:

- Recipe imports of domain internals such as
  `@mapgen/domain/<domain>/shared/...`,
  `@mapgen/domain/<domain>/ops/<op>/...`,
  `@mapgen/domain/<domain>/rules/...`, or
  `@mapgen/domain/<domain>/types.js`.
- Sibling stage `steps/` imports.
- Broad barrels that obscure ownership.

Constructibility:

- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` uses the sanctioned
  `/ops` surfaces for domain compile-op collection.
- Sample recipe-stage imports use `/config.js` and `/ops`, which the import
  policy explicitly allows.
- `contract-manifest.ts` imports step contracts directly from stage folders.
  This appears to be a positive candidate owner for DAG/contract presentation,
  but it should not be generalized into a recipe permission to reach arbitrary
  step internals.

## Positive-Boundary Candidates That Should Absorb Local Negative Rules

These are broader positive authorities or named owner surfaces that should be
preferred over brittle negative pattern rules.

1. Project-plane `kind:*` taxonomy.
   Use the tag dependency table for package-level ownership. Do not replace it
   with ad hoc import bans that would make legal edges illegal.

2. Adapter method taxonomy.
   `TRUTH-VS-PROJECTION.md` distinguishes authored entropy, policy/readback,
   projection/materialization, and engine compatibility. Rules should forbid
   engine globals outside adapter, but allow adapter-owned readback/materializer
   methods as the sanctioned path.

3. MapGen core authoring surfaces.
   `createStage`, `createRecipe`, `compileRecipeConfig`, `PipelineExecutor`,
   artifact contracts, and op contracts are positive owners. Rules should push
   stage/config/order/gating concerns to these surfaces rather than only banning
   local wrappers.

4. Recipe domain facades.
   The import matrix allows `@mapgen/domain/<domain>`, `/ops`, and `/config.js`
   in specific recipe contexts. These named surfaces absorb the local negative
   "do not deep import domain internals" rule.

5. Stage-family artifact owner surfaces.
   Source currently has stage-family shared surfaces such as
   `stages/foundation/artifacts.ts`, `stages/morphology/artifacts.ts`, and
   `stages/ecology/artifacts.ts`. The packet allows stage-neutral shared
   surfaces only when invariant and consumers are explicit. Ecology reference
   docs explicitly say the shared Ecology artifact surface is allowed because
   multiple truth and projection stages consume the same artifact invariants.
   Rule remediation should distinguish these owner surfaces from stale hubs.

6. `domain/resources` as resource-planning authority.
   ADR-008 and Placement docs supersede legacy placement/gameplay claims that
   resources are official-generator or placement-owned. Negative rules against
   `domain/resources` participation in placement would be stale.

7. `@mateicanavra/civ7-sdk/mapgen` subpath.
   G11 turns "SDK root must be runtime safe" into a positive split: runtime
   helpers belong on the mapgen subpath, not in the SDK root.

8. `contract-manifest.ts` as standard recipe contract/DAG candidate.
   Current source centralizes stage/step contract ordering for recipe DAG
   display and order checks. If rule remediation wants to ban recipe deep step
   contract imports, it should first provide a positive owner/export path for
   this manifest role.

9. Dev-introspection exception in MapGen core.
   Normalization guardrail G3 explicitly scopes the core-runtime-Civ7 guard to
   `packages/mapgen-core/src/core` and `src/engine`; dev introspection helpers
   are outside that guard. A broader rule may be valid, but only as a new
   architecture decision.

## Contradictions / Drift / Likely Stale Claims

### System Architecture Overview Is Stale

`docs/system/ARCHITECTURE.md` omits important current packages/apps such as
`packages/mapgen-core`, `packages/mapgen-viz`, `packages/civ7-adapter`, and
`apps/mapgen-studio`. It is useful as a high-level orientation doc, but not as
authoritative package topology for MapGen remediation.

### MapGen Core Source Router Uses Stale Doc Paths

`packages/mapgen-core/src/AGENTS.md` points to
`docs/system/libs/mapgen/architecture.md` and
`docs/system/libs/mapgen/design.md`. The active docs in the assigned source set
are `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`, policies, reference
docs, and the normalization packet. Treat the src router doc links as stale
routing, not architecture.

### Normalization Packet Contains Implemented-Status Staleness

The packet remains the accepted baseline for D1-D5/0e decisions, but several
"what must change" status rows are stale relative to later accepted docs/source:

- D2 lake materialization/readback has source support in adapter types and
  `civ7-adapter.ts` (`stampLakes`, lake readback result).
- D4 typed resource/discovery/natural-wonder outcomes have source support in
  `packages/civ7-adapter/src/types.ts`.
- ADR-009 now records deterministic typed reconciliation as the accepted
  placement regime.
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md` appears updated, while
  the packet's "Known stale sources" still says that page needs reconciliation.

Use the packet for architectural decisions, but do not use its older
implementation-status rows to negate later promoted ADR/reference/source
evidence.

### `stages/ecology`, `stages/morphology`, `stages/foundation` Are Ambiguous

The packet says stale hubs like `stages/ecology/` and `stages/morphology/`
should be dissolved unless they are explicit shared surfaces. Current source
still has stage-family shared modules:

- `stages/ecology/artifacts.ts`
- `stages/ecology/artifact-validation.ts`
- `stages/morphology/artifacts.ts`
- `stages/foundation/artifacts.ts`
- `stages/foundation/validation.ts`
- `stages/foundation/viz.ts`

Some are now likely accepted positive owner surfaces; Ecology docs explicitly
justify shared artifact invariants. Rule remediation should not blindly delete
or ban these paths. It should require named owner/invariant and concrete
consumers.

### Discovery Placement Docs vs Public Config Comment

Placement domain docs claim `place-discoveries` is deterministic typed outcomes
and ADR-009 forbids falling back to official generators as truth. The public
placement config file comments that discoveries are placed by Civ7's official
discovery generator through the adapter and have no authored knob. This is not
necessarily a contradiction if "official generator" is adapter-owned
materialization/compatibility evidence, but it is a high-risk wording conflict:
rules should forbid treating official generator output as planning truth.

### MapGen Core Runtime Purity Needs Guard Scope Precision

Broad docs say core stays pure, while current code and taxonomy allow core to
depend on adapter abstractions and keep dev introspection outside the G3 guard.
Rules should target direct engine globals and `/base-standard` imports in the
accepted scopes, not adapter type imports or sanctioned dev exceptions unless a
new decision removes them.

## Accepted Boundaries To Preserve

- Recipe owns ordering; tags are gates, not an alternate topology engine.
- Stage ids are product/config/trace surfaces only when stage-promotion criteria
  are met.
- Default stage config is flat: `{ knobs?, [stepId]?: stepConfig }`.
- Semantic public+compile stages are allowed only when they own a real surface
  transform.
- Truth artifacts and projection/materialization outputs remain separate.
- `map-*` stages are projection/materialization/effects/readback lanes, not
  truth or Studio grouping.
- Adapter legality/readback validates or materializes authored truth; it does
  not become truth.
- Official resources are game-data evidence, not package architecture.
- Generated outputs are proof of generation, not editable source or policy.
- `shared`, `common`, broad barrels, and old hubs are non-owners unless they
  have an explicit invariant and consumers.

## Missing High-Leverage Sources

Not processed deeply in this lane, but high leverage before rule edits:

- Exact Habitat/Grit rules named by guardrails:
  `.habitat/blueprints/domain/require_public_domain_surfaces_in_recipes_and_maps/rule.json`,
  `.habitat/patterns/checks/**`,
  `.habitat/civ7/platform/adapter/rules/enforce_adapter_only_base_standard_imports/rule.json`.
- The OpenSpec/archive implementation records for `normalize-*` slices that
  converted packet decisions into accepted evergreen source.
- `tsconfig` path aliases for `@mapgen/*`, because they define what source
  imports are constructible.
- `docs/system/mods/swooper-maps/architecture.md` for mod-specific target
  posture beyond the core MapGen docs.
- Focused tests proving current status:
  standard recipe order/doc sync, normalization guardrails, placement
  reconciliation, lake projection/readback, SDK mapgen-entrypoint boundary, and
  Studio artifact/runtime import separation.
- Generated recipe artifacts under `mods/mod-swooper-maps/dist/recipes/**` and
  generated map configs, only as proof observations, not source truth.

## Rule Remediation Guidance

1. Prefer positive owner surfaces over negative import bans:
   project tags, adapter methods, package exports, domain `/ops` and
   `/config.js`, stage-family artifact owner modules, and SDK subpaths.
2. Keep project-plane and intra-project-plane rules separate.
3. When a local negative rule conflicts with a later positive authority, update
   the rule to target the stale behavior instead of the path shape.
4. For old stage-family hubs, test for owner/invariant/consumer rather than
   path name alone.
5. For official generator surfaces, ban planning truth dependence, not
   adapter-owned compatibility/materialization calls.
6. For MapGen core purity, encode the accepted G3 scope unless deliberately
   reopening dev introspection and adapter-type usage.
