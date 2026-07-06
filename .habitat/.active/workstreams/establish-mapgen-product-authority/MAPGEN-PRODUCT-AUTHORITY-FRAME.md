# MapGen Product Authority Frame

Status: reference frame
Scope: Civ7 MapGen / Swooper Maps product and architecture authority for future Habitat Layer 2 rule-remediation packets
Prepared: 2026-07-01

## Purpose And Use

This frame is the top-down authority seed for future Habitat rule-remediation
decision packets. It exists so packet authors do not infer product architecture
from isolated negative rules, current folder shape, generated output, or stale
migration residue.

Use this frame to decide whether a rule is:

- truly context-local;
- a proxy for broader positive authority;
- a stale migration guard that can retire;
- a mixed-owner predicate that must split;
- a boundary or structure rule that should invert into an allowlist, schema, or
  source-native validation rail.

This frame is not the operational remediation matrix. The machine-readable
source of remediation progress remains
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`.

## Evidence And Claim Status

Authority order for this frame:

1. Current user decisions and root/subtree `AGENTS.md`.
2. Accepted project baseline:
   `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
3. Canonical evergreen and MapGen docs under `docs/`.
4. Accepted ADRs and deferrals.
5. Current source as constructibility or contradiction evidence.
6. Official Civ7 resources as game-data evidence.
7. In-game/runtime checks as exact-runtime proof.
8. OpenSpec/change records as downstream implementation records unless
   promoted.
9. Archived docs, old project notes, generated output, and tests as discovery or
   proof evidence only.

Claim labels:

- **Accepted authority**: controls future packet decisions unless later
  authority supersedes it.
- **Candidate authority**: a named pressure surface that may become a kind,
  schema, boundary graph, source-native validation rail, or positive authority,
  but remains candidate until a Layer 2 packet affirms owner, proof shape, and
  constructibility.
- **Intended authority**: the repo wants this to become true, but implementation
  or promotion is incomplete.
- **Constructible evidence**: source proves a concept can be implemented,
  validated, or exercised, but does not alone make it product authority.
- **Official game-resource evidence**: supports game identifiers, XML/schema
  examples, and observed base-game data facts; does not define SDK/MapGen
  ownership or editable product policy.
- **In-game/runtime validation proof**: proves only the checked runtime setup,
  adapter path, game version, input, and output condition; it does not become
  source truth or general architecture authority by itself.
- **Source contradiction**: current source conflicts with accepted/intended
  authority and must be named, not averaged away.
- **Stale/superseded**: useful as evidence of migration residue, not as live
  authority.
- **Open gate**: choosing would encode product or architecture philosophy not
  already settled by authority.

## Core Commitments

### Typed Mod Authoring

Civ7 Modding Tools exists to let technical modders create and verify mods
through typed source, generated outputs, reusable tooling, and explicit control
surfaces instead of hand-editing XML or generated output.

Sources:

- `docs/PRODUCT.md`
- `docs/system/ARCHITECTURE.md`
- root `AGENTS.md`

Layer 2 consequence:

Rules that guard generated output should normally move upstream to the source,
generator, verify command, schema, or package boundary that creates the output.
Generated output is proof, not editable product policy.

### Deterministic MapGen Pipeline

MapGen is a deterministic pipeline with separate owners for domain truth, step
contracts, stage authoring surfaces, recipe ordering, compilation, execution,
projection/materialization, and runtime proof.

Sources:

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/system/libs/mapgen/MAPGEN.md`
- `docs/system/libs/mapgen/reference/GLOSSARY.md`

Layer 2 consequence:

Every rule should be classified by the owner that can truthfully define and
prove the invariant. Current path shape, folder grouping, or generated artifact
shape is not enough.

### Recipe Order Owns Execution Topology

Recipe order is source-owned and explicit. Dependency tags validate readiness
and wiring; they are not a hidden topology engine.

Sources:

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts`

Layer 2 consequence:

Rules that infer ordering from docs lists, generated artifacts, manifests,
`shouldRun`-style skips, or tag strings should be rechecked against the source
recipe and compile/runtime rails.

### Truth And Projection Stay Separate

Domain and truth stages publish deterministic truth artifacts. `map-*`,
placement, adapter, and runtime surfaces project truth into engine state,
effects, parity evidence, generated mod output, diagnostics, or UI consumers.

Sources:

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- `docs/system/mods/swooper-maps/architecture.md`

Layer 2 consequence:

Rules that mix `artifact:*`, `effect:*`, map projection, runtime tokens, or
stage contracts need owner/proof decomposition before admission. Projection can
prove materialization; it does not silently become upstream truth.

### Flat Strict Config Is The Default

The accepted default stage config surface is flat:
`{ knobs?, [stepId]?: stepConfig }`. Persisted SDK-native `advanced.<stepId>` is
rejected for the default surface. Semantic `public + compile` stage surfaces are
valid only when a genuine public authoring transform exists.

Sources:

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-035-config-normalization-and-derived-defaults.md`
- `packages/mapgen-core/src/authoring/stage.ts`
- `packages/mapgen-core/src/compiler/recipe-compile.ts`

Layer 2 consequence:

Retired config-key blacklist rules should not be moved into package tests. A
config pipeline should be structurally correct through schema, compile-time
normalization, type-level rails, and source-native validation. Retired literals
need replacement only when recurrence risk is concrete.

### Stage Identity Is Product Authority, Not Folder Shape

A stage is a recipe-level authoring and ownership surface. It is justified by
distinct authoring/config, upstream input family, downstream handoff artifact
set, independent recipe placement, stage-scoped contracts/helpers, independent
enablement/review/trace identity, or projection/materialization boundary.

Do not promote a stage because a folder exists, Studio wants grouping, an
implementation variant exists, a future knob is plausible, or an intermediate
artifact is convenient.

Sources:

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`

Layer 2 consequence:

Stage-kind work should usually make existing truth/projection/product
classification mechanically visible. It should not invent a parallel ontology
that duplicates already accepted truth/projection authority.

## Accepted Authority Map

### SDK

Accepted owner:

- public TypeScript mod-authoring APIs;
- XML/mod builder contracts;
- SDK package root and opt-in `@mateicanavra/civ7-sdk/mapgen` subpath.

Not owner:

- MapGen pipeline internals;
- recipe topology;
- domain algorithms;
- Civ7 engine globals;
- generated output as source truth.

Source evidence:

- `packages/sdk/package.json`
- `packages/sdk/src/index.ts`
- `packages/sdk/src/mapgen/createMap.ts`
- `packages/sdk/AGENTS.md`

### Civ7 Adapter

Accepted owner:

- direct Civ7 engine globals and `/base-standard/...` imports;
- runtime feasibility and legality checks;
- projection/materialization adapter methods;
- engine readback and typed outcome/result contracts.

Not owner:

- MapGen algorithms;
- recipe semantics;
- mod tuning;
- SDK XML generation.

Source evidence:

- `packages/civ7-adapter/src/civ7-adapter.ts`
- `packages/civ7-adapter/src/types.ts`

### MapGen Core

Accepted owner:

- pure MapGen authoring/runtime machinery;
- artifact contracts and runtime publication;
- stage/step/domain/op contracts;
- recipe compilation and execution plan mechanics;
- dependency/effect tag validation;
- tracing and deterministic utility surfaces.

Not owner:

- mod-specific recipe content;
- Civ7 runtime globals as an ordinary owner surface;
- Studio UI;
- generated mod output;
- adapter internals.

Source evidence:

- `packages/mapgen-core/src/authoring/artifact/**`
- `packages/mapgen-core/src/authoring/step/contract.ts`
- `packages/mapgen-core/src/authoring/stage.ts`
- `packages/mapgen-core/src/authoring/domain.ts`
- `packages/mapgen-core/src/authoring/op/**`
- `packages/mapgen-core/src/compiler/recipe-compile.ts`
- `packages/mapgen-core/src/engine/tags.ts`
- `packages/mapgen-core/src/engine/PipelineExecutor.ts`

Open caution:

`packages/mapgen-core/src/dev/introspection.ts` reads Civ7 globals for verbose
diagnostics. The accepted G3 guard currently scopes core purity more narrowly
than a blanket "core never touches globals" claim, but that exclusion does not
bless dev introspection as a MapGen Core owner surface. A future packet should
either explicitly bless the diagnostic exception or move it behind the correct
adapter/dev-tooling boundary.

### Swooper Maps Standard Recipe

Accepted owner:

- concrete map-generation product content;
- standard recipe stage/step order;
- source stage composition;
- mod-specific map configs and generated map-entry inputs;
- Swooper map design intent.

Not owner:

- reusable core machinery;
- adapter internals;
- generated `mod/` output as hand-authored truth.

Sources:

- `mods/mod-swooper-maps/AGENTS.md`
- `docs/system/mods/swooper-maps/architecture.md`
- `docs/system/mods/swooper-maps/vision.md`
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- `mods/mod-swooper-maps/src/maps/configs/canonical.ts`

### Domains

Accepted owner:

- pure algorithms;
- contract-first ops;
- strategies;
- domain rules and types;
- reusable semantics.

Not owner:

- runtime context;
- recipe ordering;
- adapter calls;
- stage orchestration.

Accepted current domain posture:

- Foundation: mesh-space/tectonic truth and downstream tile projections.
- Morphology: tile-space terrain/earth-matter truth.
- Hydrology: drainage, discharge, rivers, lake intent, hydrography truth.
- Ecology: pedology, biomes, features, and related truth products.
- Resources: resource planning, including demand/eligibility, habitat lanes,
  site selection, and support adjustment.
- Gameplay: target owner for gameplay-facing integration surfaces such as
  starts, discoveries, natural wonders, and late placement effects, subject to
  the `domain/resources` carve-out.
- Placement: current legacy/source surface for gameplay-product orchestration.
  It should not be promoted as the target-canonical owner without a later
  decision.
- Narrative: stale/absorbed alias for target Gameplay ownership, not an
  independent current target owner.

Sources:

- `docs/system/libs/mapgen/reference/domains/DOMAINS.md`
- `docs/system/libs/mapgen/reference/domains/*.md`
- `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`
- `docs/system/libs/mapgen/policies/MODULE-SHAPE.md`

Open caution:

Gameplay, Placement, and Narrative names currently collide. Target docs say
Gameplay absorbs legacy Narrative and Placement, while current source still has
Placement stage/domain names. Official resource corpus/policy/type ownership is
also open/shared map-policy drift rather than accepted `domain/resources`
ownership. Morphology/story overlay ownership is therefore a semantic gate, not
a cleanup-only task.

### Studio And Visualization

Accepted owner:

- MapGen Studio UI;
- browser worker/runtime surface;
- recipe DAG display;
- trace/dump presentation;
- visualization manifest and layer consumer contracts.

Not owner:

- generation truth;
- domain algorithms;
- engine projection authority;
- public recipe semantics beyond consuming stable surfaces.

Source evidence:

- `apps/mapgen-studio/src/browser-runner/**`
- `apps/mapgen-studio/src/recipes/catalog.ts`
- `packages/mapgen-viz/src/index.ts`

Layer 2 consequence:

Studio-generated artifacts and browser-runtime files can prove app consumption
and currentness. They should not become product-policy owners.

## Constructible Positive Surfaces

These surfaces are strong candidates for Layer 2 packets because source already
contains named contracts, validators, or runtime rails.

### Artifact Contract Authority

Constructible evidence:

- `packages/mapgen-core/src/authoring/artifact/contract.ts`
- `packages/mapgen-core/src/authoring/artifact/runtime.ts`
- `packages/mapgen-core/src/core/types.ts`

Claim:

Artifacts are first-class write-once value contracts with `artifact:*` identity,
schema validation, publication/read APIs, duplicate-publish detection, and
missing/invalid artifact errors.

Boundary:

Do not merge artifact authority with `field:*` mutable buffers or `effect:*`
materialization tags. Buffer/field mutability is a narrow exception, not a
general artifact model.

### Step Contract Authority

Constructible evidence:

- `packages/mapgen-core/src/authoring/step/contract.ts`
- `packages/mapgen-core/src/authoring/types.ts`

Claim:

Steps are the executable contract boundary. They own IDs, phase, config schema,
requires/provides tags, artifact dependencies, operation dependencies, input
building, and bounded orchestration.

### Stage Authoring And Config Authority

Constructible evidence:

- `packages/mapgen-core/src/authoring/stage.ts`
- `packages/mapgen-core/src/compiler/recipe-compile.ts`

Claim:

Stages can expose a flat internal config surface by default or an explicit
semantic public surface with a compile transform. Unknown stage IDs, unknown
step IDs, and invalid step/op config are compile-time errors.

### Recipe Order And Manifest Authority

Constructible evidence:

- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts`
- `packages/mapgen-core/src/authoring/recipe.ts`

Claim:

The standard recipe has executable source order and manifest-derived stage/step
membership. Packet authors should start from this source when deciding whether
a stage/step rule is stale, local, or broader.

### Dependency And Effect Tag Family Authority

Constructible evidence:

- `packages/mapgen-core/src/engine/tags.ts`
- `mods/mod-swooper-maps/src/recipes/standard/tag-contracts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
- `packages/mapgen-core/src/engine/PipelineExecutor.ts`

Claim:

Dependency tags are registered metadata with kind, ID, owner, and satisfaction
semantics. Execution checks required tags before steps and provided tags after
steps.

Boundary:

Current central `tags.ts` is implementation evidence and migration source. Do
not strengthen root-catalog string scans if the desired authority is registered
tag-family and owner validation.

### Domain Operation And Strategy Authority

Constructible evidence:

- `packages/mapgen-core/src/authoring/domain.ts`
- `packages/mapgen-core/src/authoring/op/**`
- `packages/mapgen-core/src/authoring/bindings.ts`
- `mods/mod-swooper-maps/src/domain/*/ops/**`

Claim:

Domain operations are typed pure computation/planning contracts. Strategies are
variant implementations inside operation envelopes, with op kinds such as
`compute`, `plan`, `score`, and `select`.

Boundary:

A generic domain-operation authority must include an exception/support-dir
model. It cannot simply copy one domain's folder shape across all domains.

### Hydrology Truth And Map-Hydrology Projection

Constructible evidence:

- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/artifacts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/steps/lakes.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/**`
- `packages/civ7-adapter/src/civ7-adapter.ts`

Claim:

Hydrology owns deterministic lake intent through `artifact:hydrology.lakePlan`.
`map-hydrology` materializes and records engine projection/readback evidence.

### Placement Product/Effect Contracts

Constructible evidence:

- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/**`
- `packages/civ7-adapter/src/types.ts`
- `packages/civ7-adapter/src/civ7-adapter.ts`

Claim:

Placement resources, discoveries, starts, natural wonders, and placement
outcomes are typed intent/reconciliation surfaces. They are not simple
`placed === planned` checks.

## Layer 2 Positive Authority Candidates

These are candidates to evaluate as slice-level packets. They are not all new
blueprint kinds. Some are schemas, positive boundary graphs, manifest
annotations, or source-native validation rails.

| Candidate | Why it matters | Frame constraint |
| --- | --- | --- |
| Helper-surface authority | Foundation duplicate helpers and runtime helper redeclarations are broader than one stage. | Define by invariant and consumers. Avoid a shared-utils dumping ground. |
| Stage truth/projection/product classification | Multiple local rules guard map/projection/runtime tokens in truth-stage contracts. | Make accepted concepts mechanically visible; do not invent a parallel taxonomy. |
| Dependency/effect tag family authority | Root-catalog and token guards are weak proxies for registered tag validity. | Prefer registered tag-family/owner validation over string scans. |
| Domain-operation generic surfaces | Ecology/Foundation local op rules smell like missing generic op authority. | Include topology, contract quality, strategy locality, config facade, and support-dir exceptions separately. |
| Standard-stage public config/contract surface | Several rules guard config bags, cast merges, sentinel passthroughs, and contract metadata. | Separate public compile/schema authority from retired local residue. |
| Generated-zone/resource-derived package authority | Generated Civ7 types, map-policy tables, and provenance labels share protected-output pressure. | Keep generated output as proof; source/generator/verify rails own policy. |
| Studio UI/runtime recipe artifact boundary | Studio UI imports and worker/runtime rows span app/source/build-output surfaces. | Split UI, worker runtime, server, generated artifact consumption, and build-currentness proof. |
| Deterministic authored-generation / adapter capability | Generator-token and random/fudge rows point at deterministic authored intent and adapter-approved runtime capability. | Do not turn old token bans into package tests; use source-native policy or retire stale tokens. |
| Morphology story overlay ownership | Overlay publishing has unresolved Gameplay/Placement/Narrative/Morphology owner pressure. | Treat as open semantic gate unless current authority resolves owner. |
| Public-domain import surface | Public domain surfaces in tests and recipe/map consumers need boundary clarity. | Requires an executable enforcement rail that actually sees test files, or a split between public/internal test policy. |

## Stale, Superseded, Or Contradicted Claims

### Stale MapGen Routing In `docs/SYSTEM.md`

`docs/SYSTEM.md` still describes Mapgen notes as archived, but root
`AGENTS.md`, `docs/system/libs/mapgen/MAPGEN.md`, and the normalization packet
route current work through the live MapGen/Swooper docs and project baseline.
Do not use the older orientation note to downgrade current MapGen authority.

### Transitional Standard Recipe Docs

`docs/system/libs/mapgen/reference/STANDARD-RECIPE.md` is useful, but explicitly
transitional. Follow the normalization packet and current recipe source where
the page conflicts with accepted decisions or implementation.

### Swooper Vision Details

`docs/system/mods/swooper-maps/vision.md` is product-rich and preserves design
intent. Its exact algorithm sketches and ratios are source-only until accepted
by current architecture docs, source contracts, or a later decision.

### Ecology Hub Drift

Current source still contains shared files under
`mods/mod-swooper-maps/src/recipes/standard/stages/ecology/**`, even though
accepted topology uses `ecology-pedology`, `ecology-biomes`,
`ecology-features`, and `map-ecology`. This is a real drift surface. Future
packets must decide whether the hub is an explicitly named stage-neutral shared
surface or residue to dissolve into real owners.

### Resource Policy Ownership Drift

Some official resource corpus/policy code currently lives under
`domain/resources`, while source notes point toward shared map-policy/types
ownership. Treat current source as constructibility evidence, not final
ownership, until a packet names the shared policy/package boundary.

### Generated Output And Package Tests

Generated output and package tests are not junk drawers for stale policy. A
rule should move into source/package tests only when it proves behavior the
package owns. Stale key literals, migration ghosts, output text, and retired
negative assertions usually need retirement or source-native structure, not
test relocation.

## Packet Author Rules

1. Start from accepted authority, then source constructibility, then rule text.
2. Before admitting a local rule, ask whether a positive authority surface would
   collapse the rule and its neighbors.
3. Treat local special-cases in repeated niche kinds as design smells until the
   broader authority is checked.
4. Use source evidence to prove constructibility or contradiction, not to
   promote current folder shape into ontology.
5. Split rules when one predicate spans truth/projection, source/generated,
   type/value, public/internal, runtime/build, or context/generic authority.
6. Retire retired literals without replacement when recurrence risk is not
   concrete.
7. Prefer closed structures, source-native schemas, positive boundary graphs,
   and registry validation over lists of forbidden strings.
8. Keep artifact, field, effect tag, and dependency tag semantics distinct.
9. Preserve open semantic gates instead of forcing a local owner.
10. Do not create new frame variants or operational ledgers when the existing
    JSON and this reference are sufficient.

## Source Index

Primary authority:

- `AGENTS.md`
- `docs/PRODUCT.md`
- `docs/system/ARCHITECTURE.md`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/projects/engine-refactor-v1/deferrals.md`
- `docs/system/libs/mapgen/MAPGEN.md`
- `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
- `docs/system/libs/mapgen/policies/IMPORTS.md`
- `docs/system/libs/mapgen/policies/MODULE-SHAPE.md`
- `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`
- `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- `docs/system/libs/mapgen/reference/ARTIFACTS.md`
- `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `docs/system/libs/mapgen/reference/TAGS.md`
- `docs/system/libs/mapgen/reference/domains/DOMAINS.md`
- `docs/system/mods/swooper-maps/architecture.md`
- `docs/system/mods/swooper-maps/vision.md`

Engine-refactor specification evidence:

- `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-tag-registry.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-standard-content-package.md`
- `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-019-cross-cutting-directionality-policy-is-runrequest-settings-not-per-step-config-duplication.md`
- `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-020-effect-engine-placementapplied-is-verified-via-a-minimal-ts-owned-artifact-placementoutputs-v1.md`
- `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-025-ctx-overlays-remains-a-non-canonical-derived-debug-view-story-entry-artifacts-are-canonical.md`
- `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-030-operation-inputs-policy.md`
- `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-034-operation-kind-semantics.md`
- `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-035-config-normalization-and-derived-defaults.md`

Constructibility anchors:

- `packages/mapgen-core/src/authoring/artifact/**`
- `packages/mapgen-core/src/authoring/stage.ts`
- `packages/mapgen-core/src/authoring/step/contract.ts`
- `packages/mapgen-core/src/authoring/domain.ts`
- `packages/mapgen-core/src/authoring/op/**`
- `packages/mapgen-core/src/compiler/recipe-compile.ts`
- `packages/mapgen-core/src/engine/tags.ts`
- `packages/mapgen-core/src/engine/PipelineExecutor.ts`
- `packages/civ7-adapter/src/civ7-adapter.ts`
- `packages/civ7-adapter/src/types.ts`
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts`
- `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
- `mods/mod-swooper-maps/src/domain/**`
- `apps/mapgen-studio/src/browser-runner/**`
- `apps/mapgen-studio/src/recipes/catalog.ts`
- `packages/mapgen-viz/src/index.ts`
- `packages/sdk/src/index.ts`
- `packages/sdk/src/mapgen/createMap.ts`
