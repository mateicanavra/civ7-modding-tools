# Engine Refactor v1 Authority Excavation

Status: lane artifact
Lane: source/rule/code non-mutating investigation
Prepared: 2026-07-01

## Frame

This lane excavates product and architecture authority from `engine-refactor-v1`
materials without promoting every historical note to current truth.

The controlling source for MapGen / Swooper Maps architecture normalization is:

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`

The packet explicitly supersedes the review, comparison, and debate artifacts in
`docs/projects/engine-refactor-v1/architecture-normalization-sources/`. Those
source documents are provenance and evidence trails only. They are useful for
understanding rejected alternatives and stale gravity, not for overriding the
packet.

This artifact does not build an ontology. It records naming and identity
commitments, ownership claims, proof boundaries, and positive authority
candidates that should seed later Layer 2 packets.

## Method And Budget

Primary set classified:

| Source | Classification | Use |
| --- | --- | --- |
| `docs/projects/engine-refactor-v1/architecture-normalization-packet.md` | accepted baseline | Current normalization authority; D1-D5/0e final calls; stage promotion rule; domino sequence. |
| `docs/projects/engine-refactor-v1/PROJECT-engine-refactor-v1.md` | decision evidence / directional project brief | Product context and legacy milestone intent; subordinate to the packet where stage/config/runtime vocabulary differs. |
| `docs/projects/engine-refactor-v1/deferrals.md` | deferral authority | Accepted deferrals, triggers, locked decisions, and resolved deferral history. |
| `docs/projects/engine-refactor-v1/architecture-normalization-sources/README.md` | source classification record | Declares source directory as `source-material-only`. |
| `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-review.md` | review evidence | Evidence trail for intended architecture and stale doc/code gravity. |
| `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-review-independent.md` | review evidence | Independent corroboration and sharper discovery leads; not active authority. |
| `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-decisions-codex.md` | decision evidence / provenance | Owner-pass positions, including stale rejected D1 and accepted D5/0e evidence. |
| `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-decisions-independent.md` | decision evidence / provenance | Independent decision pass; contains rejected seven-ecology-stage stance. |
| `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-decisions-comparison.md` | decision evidence / provenance | Steelman comparison; explains why D1 flat and D5 input/handoff synthesis won. |
| `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-decision-debate.md` | decision evidence / provenance | Joint synthesis folded into the packet; useful for final-call rationale. |

Additional files inspected beyond primary set: 12 of 12.

| Source | Classification | Why inspected |
| --- | --- | --- |
| `docs/projects/engine-refactor-v1/resources/spec/SPEC.md` | project spec index / authority router | Declares the split `SPEC-*` set as target architecture SSOT. |
| `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md` | accepted project spec | Runtime contract, context shape, dependency tag vocabulary, RunRequest boundary. |
| `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md` | accepted project spec | Step/domain operation vocabulary and canonical op/strategy/step surfaces. |
| `docs/projects/engine-refactor-v1/resources/spec/SPEC-tag-registry.md` | accepted project spec | Canonical dependency tag inventory and standard recipe tag names. |
| `docs/projects/engine-refactor-v1/resources/spec/SPEC-standard-content-package.md` | accepted project spec | Mod-owned content, recipe/stage/step layout, config/tag/artifact ownership. |
| `docs/projects/engine-refactor-v1/resources/spec/adr/ADR.md` | ADR index / status evidence | Separates accepted ADRs from proposed/gap-map items. |
| `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-019-cross-cutting-directionality-policy-is-runrequest-settings-not-per-step-config-duplication.md` | accepted ADR | RunRequest settings ownership for cross-cutting directionality. |
| `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-020-effect-engine-placementapplied-is-verified-via-a-minimal-ts-owned-artifact-placementoutputs-v1.md` | accepted ADR, at-risk | Interim placement effect verification via `artifact:placementOutputs`. |
| `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-025-ctx-overlays-remains-a-non-canonical-derived-debug-view-story-entry-artifacts-are-canonical.md` | accepted ADR, at-risk | Narrative story artifacts are canonical; `ctx.overlays` is debug/compat only. |
| `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-030-operation-inputs-policy.md` | accepted ADR | Plain-data op inputs, typed-array schema/validator policy, op validation surface. |
| `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-034-operation-kind-semantics.md` | accepted ADR | Strict operation kind semantics: `compute`, `plan`, `score`, `select`. |
| `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-035-config-normalization-and-derived-defaults.md` | accepted ADR | Compile-time config normalization and resolver placement. |

Stop condition reached: the primary set is classified, the additional pass
exhausted the 12-file budget, and the additional files added lower-level
accepted contract names but no new authority category that overrides the packet.

## Accepted Authority Claims

### Authority Routing

- The normalization packet is the single authoritative project baseline for
  MapGen / Swooper Maps architecture normalization. It supersedes the source
  review, comparison, and debate artifacts.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/architecture-normalization-sources/README.md`.
- For normalization conflicts, the packet wins over older project notes. Later
  promoted OpenSpec or evergreen docs may become the long-lived authority after
  promotion.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Current code is implementation evidence, not target architecture when it
  conflicts with the accepted packet.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-review.md`.

### Core Architecture Shape

- MapGen is a deterministic pipeline with explicit ownership boundaries:
  Domain, Step, Stage, Recipe, Compilation, Execution, and Projection /
  Runtime each have separate ownership.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md`.
- Domains own pure algorithms, contract-first ops, strategies, rules, domain
  types, and reusable semantics. Domains do not own runtime context, recipe
  ordering, adapter calls, or stage orchestration.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`.
- Steps are the executable contract boundary. They own `requires`, `provides`,
  artifacts/effects, config schema, op binding, input building, and one bounded
  orchestration responsibility. They must not hide heavy domain compute,
  sibling-stage internals, or sub-pipelines.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/resources/spec/SPEC-standard-content-package.md`.
- Stages own authoring/config surface, knobs scope, stage id prefix, and local
  step composition. Stages do not own global ordering, truth authority, runtime
  topology, or compute.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Recipes own global stage/step order and enablement. Hidden manifests, prose
  ordering, and `shouldRun`-style skips are not target surfaces.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md`.
- Compilation validates and normalizes authoring config into executable
  step/op config. It must not perform side effects or mutate engine state.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-035-config-normalization-and-derived-defaults.md`.
- Execution runs a compiled plan with dependency gates, write-once artifacts,
  traces, and buffers. Execution is not the place for architecture design or
  compatibility shims.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Projection / Runtime materializes truth artifacts into Civ7 engine state and
  verifies effects. Projection does not own domain truth unless an accepted
  decision labels a limitation.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.

### Stage Promotion And Stage Identity

- A stage is a recipe-level authoring and ownership surface, not a folder,
  debug grouping, implementation seam, or arbitrary domain concern.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Promote a concern to a stage when it has a distinct authoring/knobs surface,
  distinct upstream input family and downstream handoff artifact set,
  independent recipe placement, stage-scoped helpers/contracts, independent
  enablement/review/trace identity, or a projection/materialization boundary.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-decision-debate.md`.
- Do not promote solely because a domain has sub-concerns, a future knob is
  plausible, an intermediate artifact is useful, Studio wants grouping, an
  implementation variant exists, or a domain op input schema is large.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.

### D1: Stage Config Surface

- The default accepted stage config surface is flat:
  `{ knobs?, [stepId]?: stepConfig }`.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Persisted SDK-native `advanced.<stepId>` is rejected for the default surface.
  `advanced` may remain a UI grouping concept but not a persisted config key.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-decisions-comparison.md`.
- A custom `public + compile` stage remains valid only when the authoring
  surface genuinely differs from step config.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.

### D2: Lakes And Hydrology Truth

- Hydrology owns deterministic lake intent. `map-hydrology` projects and
  materializes that intent into Civ7 state and verifies drift.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Placement should consume Hydrology lake truth, not `engineProjectionLakes`.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-decisions-comparison.md`.
- Fail-hard lake parity waits until adapter materialization/readback exists.
  The accepted sequence is lake stamping/readback, `plan-lakes`, projection,
  placement migration, then parity gates.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- River projection remains explicitly deferred where engine projection cannot
  accept explicit river hydrography. Hydrology artifacts are canonical truth;
  engine surfaces are projection/visualization until the adapter capability
  exists.
  Source: `docs/projects/engine-refactor-v1/deferrals.md` (`DEF-020`).

### D3 And D4: Placement, Resources, Discoveries

- Placement should split only at real product/effect contracts, not
  helper-by-helper or maintenance-order seams.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Positive placement split candidates are natural wonders, resources, starts,
  discoveries, advanced starts, and any other product with a real artifact,
  effect, and verification surface.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Maintenance operations such as terrain validation, area recalculation, water
  cache storage, restamping, and fertility recalculation may stay
  transactional unless they gain independent contracts or consumers.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Resources and discoveries use plan-authoritative typed intent
  reconciliation. Do not gate on naive `placed === planned`.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Projection must reconcile plan vs engine-feasible placement and fail only on
  unexplained drift, wrong type/location, or untyped rejection.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-decision-debate.md`.
- D4 depends on adapter/materializer outcomes with per-tile placed items and
  typed rejection reasons. Standard generation must not fall back to official
  resource/discovery generators as a truth source.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- `effect:engine.placementApplied` currently has an accepted but at-risk
  interim verification path through minimal `artifact:placementOutputs`. That
  artifact is verification-oriented and should not be mistaken for strong
  engine readback.
  Source: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-020-effect-engine-placementapplied-is-verified-via-a-minimal-ts-owned-artifact-placementoutputs-v1.md`.

### D5: Ecology Identity

- Accepted ecology truth stage identities are:
  `ecology-pedology`, `ecology-biomes`, and `ecology-features`.
  `map-ecology` is projection/materialization only.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- `ecology-pedology` owns pedology and resource basin planning, with inputs from
  morphology topography and baseline climate, and handoff of soils/pedology and
  resource basins.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- `ecology-biomes` owns biome classification and any biome-edge refinement,
  with inputs from refined climate/cryosphere, topography, and pedology, and
  handoff of biome classification.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- `ecology-features` owns feature substrate/score layers, feature family
  intent planning, occupancy cascade, and final feature intent merge, with
  handoff of feature intents and final occupancy.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Ice, reefs, wetlands, and vegetation should remain step/artifact seams inside
  `ecology-features` unless they gain real stage-level triggers.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-decision-debate.md`.
- The stale sibling `stages/ecology/` hub should be dissolved into real owners
  or an explicitly named stage-neutral shared surface.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-review.md`.

### `map-*` Projection Identity

- `map-morphology`, `map-hydrology`, and `map-ecology` are justified only where
  they consume truth artifacts and own projection/materialization effects,
  adapter writes, `artifact:map.*` handoffs, parity diagnostics, or
  projection-specific knobs.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- `map-*` stages must not be used for Studio grouping, debug navigation, or
  internal implementation variants. Presentation needs belong in Studio/SDK
  metadata.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-decisions-codex.md`.

### Import Policy And Colocation

- The accepted import policy is scoped, not a broad `@mapgen/*` ban.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Public docs/examples should teach package exports, public consumers should
  use package exports, standard recipe assembly may use sanctioned domain
  surfaces, cross-domain source should avoid deep internals once public
  entrypoints exist, intra-op/domain internals should use relative imports, and
  tests should follow the code under test.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/resources/spec/SPEC-standard-content-package.md`.
- The first enforcement is a narrow recipe deep-import guard for `src/recipes/**`
  after small public-surface remediation.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Colocate contracts, artifacts, schemas, and helper logic with the nearest
  real owner. Stage-neutral shared surfaces are allowed only when their
  invariant and consumers are explicit.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/resources/spec/SPEC-standard-content-package.md`.

### Runtime Boundary, Tags, Artifacts, And Config

- Boundary input is `RunRequest = { recipe, settings }`; the runtime compiles a
  `RunRequest` into an `ExecutionPlan` and executes against a `StepRegistry`.
  Source: `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md`.
- `RunRequest.recipe` is the only ordering/enablement source of truth. Disabled
  steps do not appear in the `ExecutionPlan`; unknown step IDs, unknown tag IDs,
  and invalid step config are compile-time hard errors.
  Source: `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md`.
- Cross-cutting directionality policy belongs in typed `RunRequest.settings`,
  not duplicated into per-step config or read from another step's config.
  Source: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-019-cross-cutting-directionality-policy-is-runrequest-settings-not-per-step-config-duplication.md`.
- Dependency tags use stable prefixes: `artifact:*`, `buffer:*`, and `effect:*`.
  `artifact:*` declares intermediate immutable data products, `buffer:*`
  declares mutable engine-facing buffers, and `effect:*` declares externally
  meaningful engine changes/capability guarantees.
  Source: `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md`;
  `docs/projects/engine-refactor-v1/resources/spec/SPEC-tag-registry.md`.
- Tag registries are mod-owned. Duplicate tag IDs, duplicate step IDs, and
  unknown tag references are hard errors.
  Source: `docs/projects/engine-refactor-v1/resources/spec/SPEC-tag-registry.md`.
- Canonical standard recipe dependency names already present in spec include
  `artifact:foundation.plates`, `artifact:foundation.dynamics`,
  `artifact:foundation.seed`, `artifact:foundation.diagnostics`,
  `artifact:foundation.config`, `artifact:riverAdjacency`,
  `artifact:placementInputs`, `artifact:placementOutputs`, `buffer:heightfield`,
  `buffer:climateField`, `buffer:terrainType`, `buffer:elevation`,
  `buffer:rainfall`, `buffer:biomeId`, `buffer:featureType`, and engine
  effects including `effect:engine.placementApplied`.
  Source: `docs/projects/engine-refactor-v1/resources/spec/SPEC-tag-registry.md`.
- Config normalization is compile-time plan truth. Steps and recipes treat
  `ExecutionPlan.nodes[].config` as the runtime config and do not apply
  meaning-level defaulting/merging in runtime paths.
  Source: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-035-config-normalization-and-derived-defaults.md`.
- Optional `step.resolveConfig(stepConfig, settings)` and
  `op.resolveConfig(opConfig, settings)` are pure compile-time resolver
  surfaces; they must not access adapters, buffers, artifacts, runtime state,
  or RNG.
  Source: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-035-config-normalization-and-derived-defaults.md`.

### Domain Operation Commitments

- A rule is a small pure domain-specific function. Rules are internal building
  blocks and not step-callable contracts.
  Source: `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`.
- An operation is a step-callable, schema-backed domain entrypoint:
  `run(input, config) -> output`. Operation contracts are contract-first and
  live under `domain/<domain>/ops/<op>/contract.ts`.
  Source: `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`.
- A strategy is a swappable operation implementation that preserves the
  operation input/output contract. Steps select strategies via config, not by
  importing strategy modules.
  Source: `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`.
- Operation modules live under `domain/<domain>/ops/<op>/` and export exactly
  one operation. Canonical files are `contract.ts`, `types.ts`, `rules/**`,
  `rules/index.ts`, `strategies/**`, `strategies/index.ts`, and `index.ts`.
  Source: `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`.
- Domain operation inputs/outputs are plain data: POJOs plus allowed typed
  arrays. They must not include adapters, callbacks, runtime views, or hidden
  engine readback surfaces.
  Source: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-030-operation-inputs-policy.md`.
- Typed arrays are first-class runtime values, represented in schemas through
  `TypedArraySchemas.*` metadata and validated through explicit validators.
  Source: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-030-operation-inputs-policy.md`.
- Every operation has strict required kind semantics: `compute`, `plan`,
  `score`, or `select`. These are contracts, not soft documentation labels.
  Source: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-034-operation-kind-semantics.md`.

### Narrative Commitments

- Narrative/playability is expressed as typed, versioned story entry artifacts:
  `artifact:narrative.motifs.<motifId>.stories.<storyId>@vN`.
  Source: `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md`;
  `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-025-ctx-overlays-remains-a-non-canonical-derived-debug-view-story-entry-artifacts-are-canonical.md`.
- Canonical motif IDs in the standard mod spec are `corridors`, `margins`,
  `hotspots`, `rifts`, and `orogeny`. Consumers gate on specific story IDs;
  there is no published "view exists" dependency.
  Source: `docs/projects/engine-refactor-v1/resources/spec/SPEC-tag-registry.md`.
- `ctx.overlays` may remain a derived debug/compat view, but it is not
  canonical, not a scheduling surface, and must not be required for correctness.
  Source: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-025-ctx-overlays-remains-a-non-canonical-derived-debug-view-story-entry-artifacts-are-canonical.md`.

## Intended But Not Yet Fully Promoted Or Implemented

- The packet is intended to be split into OpenSpec workstreams: authority/docs
  routing, D1 config migration, import policy remediation, ecology topology,
  projection truth corrections, placement decomposition, and guardrails /
  evergreen spec promotion.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Guardrails G1-G9 are packet source records, with implemented/current guard
  scope superseded by `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`.
  The packet remains useful for why each guard exists and what cleanup enables
  it.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Standard recipe config schema/default exports should become source-visible
  or be documented as first-class generated contracts with tests proving they
  match source recipe authority.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-review.md`.
- Pure core purity remains an intended boundary: Civ7-bound map authoring /
  runtime calls must not live in pure MapGen core.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-review.md`.

## Stale, Superseded, Or Non-Normative Claims

- Source materials under
  `docs/projects/engine-refactor-v1/architecture-normalization-sources/` are
  not active decision authority. They explain the decision trail only.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/architecture-normalization-sources/README.md`.
- The Codex owner-pass D1 position that the SDK should synthesize nested
  `{ knobs?, advanced? }` is stale. The packet accepts the flat default surface.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-decisions-codex.md`;
  `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- The independent-pass D5 position that all seven current ecology stages should
  remain as plausible future knob owners is stale. The packet accepts
  `ecology-pedology`, `ecology-biomes`, `ecology-features`, and projection-only
  `map-ecology`.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-decisions-independent.md`;
  `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- A single broad `ecology` truth stage is also rejected. The accepted synthesis
  is multiple truth stages by concrete input/handoff surface.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-decisions-comparison.md`;
  `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Non-archive docs that still list a single `ecology` stage or old current-stage
  ids such as `morphology-pre/mid/post` are stale until reconciled.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-review.md`.
- `PROJECT-engine-refactor-v1.md` remains useful product context, but its old
  target topology and milestone vocabulary are directional where they conflict
  with later recipe/config/ExecutionPlan decisions. In particular, stage
  manifest, presets, legacy `MapGenConfig`, and old cluster-stage names are not
  current normalization authority.
  Source: `docs/projects/engine-refactor-v1/PROJECT-engine-refactor-v1.md`;
  `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Official Civ7 resource/discovery generators and generated output are not
  accepted truth sources for resources/discoveries or lakes when the pipeline
  claims deterministic truth. They are projection/materialization evidence or
  game-data evidence until an accepted adapter/reconciliation surface exists.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- `engineProjectionLakes` is not the target placement input. Placement should
  consume Hydrology lake truth after D2 migration.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- `placed === planned` is explicitly rejected for resources/discoveries.
  Source: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- `StoryTags`, module-level story globals/caches, and `ctx.overlays` as
  correctness surfaces are not current target authority.
  Source: `docs/projects/engine-refactor-v1/deferrals.md`;
  `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-025-ctx-overlays-remains-a-non-canonical-derived-debug-view-story-entry-artifacts-are-canonical.md`.
- `state:engine.*` is resolved/transitional-only and removed from the target
  contract in favor of verifiable `effect:*` and reified `buffer:*` /
  `artifact:*` dependencies.
  Source: `docs/projects/engine-refactor-v1/deferrals.md` (`DEF-008`).
- ADR index entries marked `Proposed` are not accepted authority merely because
  their names are attractive. The proposed gap-map entries include dependency
  terminology / registry naming, dependency key ownership, strategy config
  encoding, recipe config authoring surface, and step schema composition.
  Source: `docs/projects/engine-refactor-v1/resources/spec/adr/ADR.md`.

## Hidden Authority Candidates For Layer 2 Packets

These are decision-grade seeds that should not stay buried inside the
engine-refactor-v1 packet/spec/ADR cluster.

1. Stage identity and promotion packet.
   - Seed claims: stage promotion rule; stage is authoring/ownership surface;
     stage count is not driven by implementation variants, Studio grouping, or
     large op inputs.
   - Key sources: `architecture-normalization-packet.md`;
     `architecture-normalization-decision-debate.md`.

2. Recipe / RunRequest / ExecutionPlan authority packet.
   - Seed claims: `RunRequest = { recipe, settings }`; recipe owns ordering and
     enablement; no stage manifests, no `shouldRun`, no monolithic runtime config.
   - Key sources: `SPEC-architecture-overview.md`; ADR-ER1-019; ADR-ER1-035.

3. Stage config authoring surface packet.
   - Seed claims: flat default stage surface `{ knobs?, [stepId]?: stepConfig }`;
     `advanced` is presentation only unless a real public transform is accepted;
     compile-time normalization owns defaults.
   - Key sources: `architecture-normalization-packet.md`; ADR-ER1-035.

4. Truth/projection and `map-*` authority packet.
   - Seed claims: truth stages publish deterministic artifacts; `map-*` stages
     project/materialize and verify effects; Studio grouping is not stage
     authority.
   - Key sources: `architecture-normalization-packet.md`;
     `architecture-normalization-decisions-codex.md`.

5. Hydrology lake truth and river projection packet.
   - Seed claims: Hydrology owns lake truth; adapter stamping/readback precedes
     parity; placement consumes lake truth; river stamping remains deferred.
   - Key sources: `architecture-normalization-packet.md`; `deferrals.md`
     (`DEF-020`).

6. Placement product/effect reconciliation packet.
   - Seed claims: split only real product/effect contracts; resources and
     discoveries use typed reconciliation; `artifact:placementOutputs` is an
     interim verification artifact and not strong readback.
   - Key sources: `architecture-normalization-packet.md`; ADR-ER1-020.

7. Ecology stage identity packet.
   - Seed claims: accepted ecology surfaces are `ecology-pedology`,
     `ecology-biomes`, `ecology-features`, and projection-only `map-ecology`;
     feature-family stages promote only on real stage-level triggers.
   - Key sources: `architecture-normalization-packet.md`;
     `architecture-normalization-decision-debate.md`.

8. Domain operation contract packet.
   - Seed claims: operation module layout; operations consume plain data;
     no runtime views/adapters in op contracts; strict op kinds
     `compute` / `plan` / `score` / `select`; typed-array schema and validator
     policy.
   - Key sources: `SPEC-step-domain-operation-modules.md`; ADR-ER1-030;
     ADR-ER1-034.

9. Dependency tag and artifact/effect naming packet.
   - Seed claims: `artifact:*`, `buffer:*`, `effect:*` prefixes; mod-owned
     registry; standard recipe tag inventory; `effect:*` proof boundaries.
   - Key sources: `SPEC-tag-registry.md`; `SPEC-architecture-overview.md`.

10. Narrative/playability authority packet.
    - Seed claims: story entry artifact pattern
      `artifact:narrative.motifs.<motifId>.stories.<storyId>@vN`; motif IDs;
      `ctx.overlays` debug/compat only; no `StoryTags` authority.
    - Key sources: `SPEC-tag-registry.md`; ADR-ER1-025; `deferrals.md`.

11. Colocation/import-boundary packet.
    - Seed claims: nearest-real-owner colocation; no recipe-root global
      catalogs; scoped import policy and narrow first G4.
    - Key sources: `architecture-normalization-packet.md`;
      `SPEC-standard-content-package.md`.

12. Source classification and stale authority packet.
    - Seed claims: packet beats source material; review/debate docs are
      provenance; code is evidence; project spec/ADR accepted material is
      lower-level decision evidence unless newer packet says otherwise.
    - Key sources: `architecture-normalization-packet.md`;
      `architecture-normalization-sources/README.md`; ADR index.

## Residual Conflicts To Preserve

- ADR-ER1-020 remains accepted but at risk. The normalization packet's D4
  direction requires adapter/materializer outcomes with per-tile placed items
  and typed rejection reasons. Treat `artifact:placementOutputs` as interim
  verification authority, not the endpoint for typed reconciliation.
- Several ADR index gap-map entries are proposed, not accepted. They may be
  excellent Layer 2 candidates, but should enter as candidate packets requiring
  acceptance rather than as extracted current truth.
- Project source docs mention both older advanced-stage config and older
  ecology topology variants. The packet resolves those conflicts; do not
  re-open them through source-material snippets.

## Skills Used

- `civ7-architecture-authority`
- `civ7-product-authority`
- `investigation-design`
