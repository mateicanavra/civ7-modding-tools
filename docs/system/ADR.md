---
system: mapgen
component: documentation
concern: adr-index
---

# Architecture Decision Records

> Significant architectural decisions made in this project.

---

## Format

Each decision follows this structure:

```
## ADR-XXX: Title

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Context:** What prompted this decision?
**Decision:** What was decided?
**Consequences:** What are the implications?
```

---

## Decisions

<!-- Example:
## ADR-XXX: Example Decision Title

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Context:** What prompted this decision?
**Decision:** What was decided?
**Consequences:**
- What got easier?
- What got harder?
-->

## ADR-001: Bun is the monorepo package manager contract

**Status:** Accepted
**Date:** 2026-01-26
**Context:** This repo is a multi-package TypeScript monorepo. Maintaining split “pnpm for installs + Bun for scripts/tests” behavior created drift (two sources of truth for workspaces, pnpm-only config surface area, and pnpm-specific repo code and docs). We want a single, consistent package manager contract across local dev, CI, and publishing.
**Decision:** Bun is the only supported package manager for this repo. The workspace is defined by root `package.json` `workspaces`, the lockfile is `bun.lock`, and all workflows use `bun install --frozen-lockfile` and `bun run …` for orchestration.
**Consequences:**
- Contributors must install Bun (see `.bun-version`) and use Bun commands documented in `docs/PROCESS.md` and `docs/process/CONTRIBUTING.md`.
- pnpm artifacts and pnpm-specific repo logic should not be reintroduced (no `pnpm-lock.yaml`, no `pnpm-workspace.yaml`, no pnpm-only config knobs).
- Turbo remained the build orchestrator at the time of this ADR (Nx replaced it in 2026-06; see `openspec/changes/habitat-nx-adoption`); root `packageManager` stays set to Bun.
- Dependency overrides use the standard `overrides` field instead of pnpm-only configuration.
- Migration analysis and roll-forward notes live in `docs/projects/temp/SPIKE-bun-migration-feasibility.md`.

## ADR-002: MapGen Studio runs pipelines in a long-lived Dedicated Worker with explicit cancellation + generations

**Status:** Accepted
**Date:** 2026-01-31
**Context:** MapGen Studio is a browser-native pipeline runner that streams visualization artifacts to a deck.gl renderer. We need deterministic execution without UI jank, reliable cancellation, and correctness under frequent rerolls/selection changes. Early slices relied on “terminate the worker” as cancellation, and the protocol surface drifted (`run.cancel` existed but was not meaningfully implemented).
**Decision:** MapGen Studio uses a **long-lived Dedicated Worker** as the default runtime. Each run is addressed by `{runId, generation}` and can be canceled via a `run.cancel` message (cooperative cancellation). The main thread retains a hard fallback to terminate/recreate the worker if it becomes unhealthy.
**Consequences:**
- Cancellation becomes a real contract (not an implementation detail), enabling “ignore stale work” semantics without killing the worker.
- The protocol must include stable identity (`runId`, `generation`, monotonic `seq`) so the UI can safely coalesce/ignore events.
- Worker code must periodically observe cancellation (between steps, and in long loops inside sinks/serialization) to ensure responsiveness.
- Hard terminate remains available as a reliability safety valve, but is not the primary cancellation mechanism.

## ADR-003: Visualization ingest uses a main-thread external store with RAF-gated commits; deck.gl stays imperative

**Status:** Accepted
**Date:** 2026-01-31
**Context:** Streaming `viz.layer.upsert` events can be frequent and large. Tying message rate directly to React state updates and deck layer rebuilds creates jank and correctness hazards (stale selection, StrictMode/ref mutation footguns). Additionally, deck camera interactions should not be routed through React render cycles.
**Decision:** MapGen Studio’s visualization state is owned by a **main-thread external store** (compatible with `useSyncExternalStore`) that (a) ingests worker/dump events and (b) commits updates to subscribers at most once per animation frame for live runs. The deck.gl host remains **imperative** (core `Deck`), with React controlling only “what to show” and UI state.
**Consequences:**
- Worker message rate does not directly control React commit frequency.
- Selection + manifest updates become atomic within the store (no render-time ref mutation patterns).
- deck.gl layer identity (`Layer.id`) and data stability become explicit invariants, improving performance predictability.
- Dump replay can opt into “lossless event application” semantics when needed, distinct from live coalescing.

## ADR-004: UI consumes recipe artifacts; worker consumes recipe runtime

**Status:** Accepted
**Date:** 2026-01-31
**Context:** Studio must be an agnostic “recipe runner + visualizer”. Importing runtime recipe modules into the UI bundle duplicates heavy code across main+worker bundles and blurs the UI/compute boundary. The UI only needs schema/defaults/labels to drive forms and display.
**Decision:** Recipe packages expose **artifacts** (schema/defaults/metadata) separately from **runtime** recipe code. The UI imports only artifacts. The worker imports runtime recipe modules.
**Consequences:**
- Main bundle size and parse time drop; worker bundle remains the compute-heavy boundary.
- Import directions become enforceable (lint + bundle policy checks).
- Recipes become “cataloged” by artifacts; runtime is loaded only in the compute environment.

## ADR-005: Visualization SDK v1 (v1-only) standardizes layer identity, spaces, and value semantics

**Status:** Accepted
**Date:** 2026-02-01
**Context:** The visualization surface needs to be meaningful and varied (multiple “projections”/spaces per logical layer) and correct for continuous fields (proper value domains, stats-driven normalization). The previous model coupled “data type” to `layerId` and collapsed distinct coordinate spaces/variants. Continuous fields were also visually broken when raw values were treated as already normalized.
**Decision:**
- Adopt a **v1-only** visualization contract implemented as a shared package: `@swooper/mapgen-viz` (`packages/mapgen-viz/src/index.ts`).
- Standardize a v1 manifest (`VizManifestV1`) with `version: 1` and a canonical layer entry (`VizLayerEntryV1`).
- Define stable identity via:
  - `layerKey` (opaque, stable; used for streaming upserts and dump replay identity)
  - `dataTypeKey` (stable semantic identity)
  - `spaceId` (explicit coordinate space; primary UI “Projection” selector)
  - `variantKey?` (explicit variants within a data type)
- Make value semantics explicit and correct by default:
  - `VizScalarField.stats` (min/max at minimum)
  - `VizScalarField.valueSpec` (domain/noData/transform/scale/units)
- Add `gridFields` as a first-class layer kind to support multi-field grids and vector field rendering.
**Consequences:**
- MapGen Studio and dump replay accept **only** `manifest.json` with `version: 1` (no compatibility shims/adapters for older dumps).
- Studio can safely present multiple spaces/representations/variants for a single `dataTypeKey` without collisions by grouping on `dataTypeKey → spaceId → kind[:meta.role] → variantKey`.
- Producers should keep `layerKey` stable and treat `dataTypeKey`/`spaceId` as intentional, user-facing structure (not incidental implementation details).

## ADR-006: Standard Recipe splits Morphology truth into coasts/routing/erosion/features stages

**Status:** Accepted (superseded in part by ADR-008 for canonical drainage routing)
**Date:** 2026-02-03
**Context:** The Standard recipe previously grouped multiple distinct Morphology responsibilities under `morphology-mid` (coast shaping + routing + geomorphology), which reduced legibility in the pipeline, Studio navigation, and configuration surfaces. It also made it harder to name contracts according to what the stage actually guarantees, and complicated future work (notably: splitting routing into finer-grained stages without conflating “same-kind” operations).
**Decision:** The Standard recipe’s Morphology truth is authored as four stages:
- `morphology-coasts` (landmass formation + coastline metrics)
- `morphology-routing` (flow routing truth)
- `morphology-erosion` (geomorphology / erosion pass)
- `morphology-features` (islands + volcano intent + landmass decomposition)

We keep domain-level identities stable:
- Artifact ids remain `artifact:morphology.*`.
- Op ids remain `morphology/*`.
- Viz `dataTypeKey` remains stable.

We accept that full step ids change because stage ids are embedded in the full id.

Canonical water-movement routing is no longer owned by this decision. See
ADR-008 for the Hydrology-owned drainage routing boundary; Morphology routing
remains a geomorphic terrain-shaping proxy unless a later decision removes or
renames that artifact.

**Consequences:**
- Stage boundaries become explicit and align with author mental models (“what exists before what”).
- Knobs become easier to scope correctly (steering inputs rather than post-hoc correction).
- Studio stage/step naming becomes more meaningful by adding explicit `stageLabel`/`stepLabel` to recipe uiMeta.
- Any tooling that relied on the old stage ids (`morphology-pre/mid/post`) must be updated as part of the cutover (configs, docs, guardrails).

## ADR-007: Civ7 intelligence uses two authority sides with a game-scoped controller

**Status:** Accepted
**Date:** 2026-06-03
**Context:** The Civ7 intelligence-layer investigation found several tempting but
unsafe ways to describe live AI influence: raw `game exec` as an agent API,
companion UI scripts as a third control plane, Tuner-loaded mod claims, and a
generic "bridge" architecture. Later live probes materially changed the
implementation target: App UI game context exposed the same major gameplay roots
checked in Tuner, plus App UI-only lifecycle/UI/storage roots. Generated static
profiles already own the native AI policy lane.
**Decision:** Civ7 intelligence uses a two-sided authority architecture:
live external play through `@civ7/direct-control`, and native policy shaping
through generated static AI profiles. A game-scoped App UI controller loaded
through native `scope="game"` `UIScripts` is the baseline implementation
candidate for replacing raw per-wrapper direct-control JavaScript with a stable
in-game API. `@civ7/control-orpc` owns the public service contract, router,
admission, and composed behavior. The game-scoped controller is a provider
adapter for that service. Direct-control retains the currently mixed low-level
tuner and Civ7-side JavaScript responsibilities until those nodes are extracted.
**Consequences:**
- Raw `CMD:<stateId>:<javascript>` / `game exec` stays a diagnostic and probe
  transport, not the agent-facing product API.
- oRPC/Effect is the shared control substrate. The App UI installs the selected
  native nested router client at `globalThis.Civ7IntelligenceBridge`; it does
  not reconstruct schemas or dispatch serialized procedure keys.
- `UIScripts` proof is App UI game-context proof unless shell or Tuner
  availability is separately demonstrated. Shell requires its own entrypoint;
  Tuner is not a modinfo deployment target in the baseline.
- The controller can reduce repeated raw-wrapper verification, but it does not
  remove lifecycle, approval, action legality, hotseat, age-transition, or
  semantic outcome proof.
- Controller-owned independent gameplay sends remain eliminated unless
  direct-control has
  created an exact approved action record and rereads the resulting
  postcondition.

## ADR-008: domain/resources owns resource planning

**Status:** Accepted
**Date:** 2026-06-09
**Context:** Two recorded authorities for resource placement were never reconciled: the engine-refactor Gameplay-absorption appendix (`docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/gameplay/APPENDIX-SCOPE-AND-ABSORPTION.md`, which planned to absorb the legacy `domain/placement` into a Gameplay domain that "oversees" resources by invoking the engine generator), and the newer `domain/resources` (official corpus, earthlike expectations, family demand planners) introduced by the resource-distribution-policy project. The placement-realignment workstream (D2, S3 entry gate) requires deciding ownership BEFORE wiring, so the decision lands in code and in this record at the same time instead of being retrofitted (the RC1 anti-pattern diagnosed in `docs/projects/placement-realignment/diagnosis.md`).
**Decision:** `plugins/mod/map/swooper-physics/src/domain/resources` is the owning domain for resource planning: one terminal demand resolver binds the exact canonical expectation corpus to habitat lanes and current legality, then site selection emits typed per-plot intents. Recipe-layer placement steps are thin observation, orchestration, publication, and stamp/reconcile shells. The Gameplay-absorption appendix now points at `domain/resources` for resource planning; a future Gameplay domain consolidation may absorb starts/discoveries/wonders orchestration but does not re-own resource planning logic.
**Consequences:**
- `domain/placement/ops/plan-resources` (generic scalar scorer) is superseded and deleted in the S3 slice; no dual path remains.
- Dependency-free static resource facts (`Weight`, `MinimumPerHemisphere`, age validity, and the roster-independent `Staple`/`UnlocksCiv` fallback basis) flow from `@civ7/map-policy` into `domain/resources` planning. `MinimumPerHemisphere` is an amount, not proof that the minimum applies.
- Exact `isResourceRequiredForAge` is active-roster-dependent and enters planning only through `EngineAdapter`. If that policy surface is unavailable, planning admits an age-valid minimum only from the static roster-independent basis; otherwise it records `unresolved`, never `false`.
- The engine legality oracle (`canHaveResource`) remains a reconcile-time check, not a planning authority.
- The absorption appendix's "invoke the engine resource generator" posture is superseded for resources by the deterministic typed plan+stamp pipeline (ADR-009).
- (S4 amendment, 2026-06-10) Start placement diverges from the official `chooseStartSectors` sector grid: the inert start-sector machinery (knobs, contract fields, runtime plumbing, sector viz) was removed and landmass-region slots (`plot-landmass-regions`) are the regional mechanism driving seat assignment; the adapter's `chooseStartSectors`/`assignStartPositions` wrappers remain typed but uncalled.
- (2026-07-26 amendment) The four empty-config family planners, their synthetic group rollup, and the duplicate `resourceEligibility` artifact were removed. `resolveResourceDemands` now derives each canonical habitat predicate once and publishes the complete candidate ledger directly.

## ADR-009: Deterministic typed reconciliation is the placement regime; engine readbacks are evidence-only

**Status:** Accepted
**Date:** 2026-06-09
**Context:** Placement survived three regime reversals in four months (engine-RNG delegation → deterministic plan+stamp → official-generator-primary → deterministic typed reconciliation via the normalization packet D3/D4, implemented 2026-05-30) and none of those decisions reached this record, which is part of why each regime's scaffolding accreted (diagnosis RC1). The placement-realignment workstream depends on the current posture being durable, so it is recorded here as the S3 entry gate (D2) requires.
**Decision:** (a) The deterministic plan is the authority for typed intent: materializers stamp intents through the adapter and reconcile engine feasibility with per-tile typed rejection reasons — never re-deciding types, never falling back to official generators as truth (D4 posture, guardrail G8 in `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`). (b) Engine state readbacks are evidence-only: they verify outcomes (readback assertions, parity snapshots) and may project current engine surface state into a declared planning input, but they are never undeclared planning truth. Declared live policy queries may enter planning only through `EngineAdapter`; resource age requirement follows the closed admission rule in ADR-008. Remaining declared engine-surface reads (e.g. post-maintenance legality masks) are tracked for artifact-based reconstruction in the S6 slice.
**Consequences:**
- Shortfalls and rejections are recorded as typed outcomes instead of being silently rescued (no whole-map fallback, no least-used-type rebalance, no spacing decay).
- Live-game proof compares plan vs engine state at milestone boundaries; per-slice proof runs on artifacts + mock policy emulation.
- Future regime changes require a superseding entry here before implementation.

## ADR-010: Placement knobs are semantic groups derived from op schemas, with relationship controls and Earth-like defaults

**Status:** Accepted
**Date:** 2026-06-10
**Amended by:** ADR-014. The product taxonomy and operation-owned controls
remain authoritative; the former stage-level grouped public wrapper has been
retired in favor of the complete step and operation-derived surface.
**2026-07-27 amendment:** The incomplete seat-index StartBias preference was
removed when Standard adopted exact ordered player identity and setup evidence.
Generated StartBias rows remain Civ7 policy facts, but any future product use
must bind exact admitted civilization and leader evidence rather than
reconstruct or approximate that identity inside `plan-starts`.
**Context:** Before the placement-realignment workstream, the placement stage's knob surface was hollow: the stage `knobs` schema was empty, resources exposed only density/min-spacing/share-cap, the start-sector knobs were hardwired inert, studio exposed no placement controls at all, and the controls users actually wanted (sparsity, resource↔resource affinity/exclusion, resource↔start support) did not exist (diagnosis RC7). Hand-shadowed public schemas had already drifted from op reality elsewhere in the stage.
**Decision:** Placement public config is organized as **semantic knob groups per product** (`resources`, `starts`, `support`, plus `naturalWonders`/`discoveries`), and each op-backed group is **derived from the owning op's default strategy config schema** (the foundation pattern) — never hand-shadowed. The taxonomy treats density AND sparsity, rarity fidelity, type-aware spacing, resource↔resource affinity/exclusion, and the resource↔start relationship (support floor, radius, equity tolerance, strength) as first-class controls alongside start scoring weights, spacing floor/desired buffers, fairness tolerance, and coastal/river preferences. Every knob declares an explicit min/max range; **defaults are Earth-like** (they reproduce the predeclared expectation gates in `docs/projects/placement-realignment/expectations.md`) and knobs expand outward from that baseline to their declared extremes.
**Consequences:**
- Studio's placement panel is schema-driven from the generated recipe artifacts (`build:studio-recipes`); there is no parallel hand-maintained config path to drift.
- Adding an op config field automatically surfaces it as a knob candidate; ranges and descriptions are authored once at the op contract.
- Tuning changes are weight/range edits inside declared bounds, recorded against the expectation ledger — not new code paths.
- Expressiveness is testable: the sparsity/exclusion expectation (E3.4) gates that max-sparsity and exclusion settings actually produce their declared extremes.
- Default changes are behavior changes: they must be verified against the expectation gates before shipping (the ledger amends only by recorded evidence).

## ADR-011: Habitat fix preview is authority-derived and preview-only

**Status:** Accepted
**Date:** 2026-07-13
**Context:** Habitat's fix path duplicated registered rule authority in a
hardcoded rule-id table, then expanded that duplicate into apply admissions,
transaction inputs, worktree observations, protected-path decisions, and
live-write states even though live mutation was unavailable. Diagnostic
`apply-dry-run` acquisition also could not serve as fix authority because its
own contract grants observation only.
**Decision:** A registered Grit rule admits no-write fix preview only through
one atomic runner field:
`fix: { kind: "preview-only", pattern, effects }`. The field binds the decision,
its validated pattern asset, and the closed file effects it may expose;
diagnostic facts omit it and a
separate immutable `RuleFixFacts` projection feeds the stable
`RuleFixPreview` capability. The concrete Grit implementation remains private
and reuses the pinned, scoped, closed-output provider path. Explicit rule
selection is all-or-nothing, supports one or many ids, and defaults to every
admitted record. Non-dry `habitat fix` refuses before service/provider
realization; no live-write endpoint or internal live-write state is retained.
**Consequences:**
- `diagnosticAcquisition`, remediation prose, pattern files, and rule ids cannot
  imply fix admission.
- The hardcoded admission list, parallel Pattern Governance/transaction model,
  raw Grit apply dependency, and speculative worktree/write state are deleted.
- Selector, report, routing, and diagnostic facts cannot observe fix admission;
  only `RuleFixFacts` carries it, while authority-path routing carries the
  pattern path only as navigation evidence.
- Preview preserves compact transformation evidence privately and projects only
  deterministic `modify | create | rename | delete` impacts. A changed-path
  rewrite requires both rename and destination-modify authority. Undeclared
  observed effects refuse that rule without exposing its impacts.
- Current-tree provider proof precedes admission. A diagnostic policy whose
  governed corpus cannot produce a complete observation remains unadmitted.
- A provider analysis failure outside exact rule path coverage does not make a
  preview incomplete. Existing paths are canonicalized, exact coverage uses the
  installed Picomatch semantics, and findings must remain inside the canonical
  repository, selected root, and registered coverage. Ambiguous, escaped,
  non-exact, and covered analysis failures continue to fail closed.
- Scan-root planning and finding validation share one cross-volume-aware
  repository-containment law.
- Candidate generation remains candidate-only. Active admission is authored
  through reviewed `rule.json`; the obsolete active pattern-manifest lifecycle
  is deleted. `operation.kind` remains the separate authority for a packet's
  mutability class and does not imply preview admission.
- Live mutation, rollback, formatting, gates, and commit readiness require a
  new explicit product and authority decision; they cannot grow out of the
  preview-only type by fallback.

## ADR-012: One Nx graph owns a worktree output namespace

**Status:** Accepted
**Date:** 2026-07-13
**Context:** Independent Nx invocations in one worktree rebuilt the same
dependency outputs concurrently. One graph cleaned `mapgen-core/dist` while a
second graph's SDK build was consuming it, producing a false missing-module
failure. Nx task ordering, deduplication, and `parallelism` apply inside one
graph; cache restoration can also replace declared outputs, so changing a
bundler's clean flag alone cannot make independent graphs safe.
**Decision:** A worktree is one mutable build-output namespace. All
output-materializing targets needed for one proof run in one Nx invocation,
where Nx owns dependency order, deduplication, caching, and parallelism. Do not
start competing output-materializing graphs for routine proof; compose the
required targets and edges into one graph. Each cached writer declares only the
artifacts it writes, aggregate targets declare no outputs, destructive clean
targets are uncached, and consumers depend on every generated artifact they
read. Validation-only TypeScript checks disable composite and incremental state
and own no build artifacts.

Nx-owned Habitat targets are one-way graph leaves or dependency-only nodes.
Local Habitat rules execute in one owner-local leaf; registered `runner:nx`
rules become concrete sibling dependencies. Public owner and aggregate targets
use `nx:noop` and never launch Habitat or another Nx scheduler.
**Consequences:**
- Swooper checks and tests compose their bundle, generated artifacts, recipe
  artifacts, and dependency builds in one task graph. Its default and Studio
  deployment pipelines remain intentionally exclusive modes over the generated
  map artifacts and `mod/maps`.
- Habitat, CLI, Studio, direct-control, and intelligence-bridge aggregate
  targets no longer duplicate their phase targets' output ownership.
- Direct-control bundle and declaration phases have disjoint cached outputs;
  each phase cleans only its own files.
- Separate output-materializing shell invocations or proof worktrees are not a concurrency
  mechanism for one worktree. Global locks, blanket serialization, retries,
  disabled cleaning, and source aliases are rejected because they either
  duplicate Nx authority, hide missing task edges, or permit stale artifacts.
- Routine proof does not require a temporary worktree. One native Nx graph owns
  scheduling, cache restoration, failure propagation, and parallel execution.

## ADR-008: Hydrology owns canonical drainage routing

**Status:** Accepted
**Date:** 2026-06-09
**Context:** The river recovery investigation found two routing concepts using
the same language. Morphology publishes `artifact:morphology.routing` from a raw
terrain proxy used by erosion and mountain/rough-land planning. Hydrology was
also computing local steepest-descent receivers for discharge, lakes, and river
classification, which fragmented rivers in local terrain sinks and let
downstream projection compensate with non-physical corridors. Older docs
assigned “flow routing truth” to Morphology, while later domain-refactor
materials assigned canonical routing/hydrography to Hydrology.
**Decision:** Hydrology owns canonical drainage routing for water movement:
depression-conditioned receivers, drainage basin ids, contributing area,
terminal classification, discharge, river class, and lake intent. Morphology
owns terrain and earth-matter precursors: topography, land/water mask,
bathymetry, substrate, coastline metrics, landform basins/depressions, and any
geomorphic routing proxy needed by terrain-shaping consumers. `map-*` stages
consume Hydrology truth for projection and must not synthesize fallback river
corridors to hide broken upstream drainage.
**Consequences:**
- Hydrology computes drainage routing over Morphology topography before
  discharge accumulation and river/lake planning.
- Morphology's current routing artifact remains available to existing
  Morphology consumers, but it is not canonical river/lake truth.
- Future cleanup should either rename/narrow `artifact:morphology.routing` to
  make the proxy role explicit, or replace Morphology consumers with more
  precise terrain-shaping inputs.
- Verification must keep generated hydrology truth, map projection/readback,
  Studio display, and rendered in-game Civ visibility as separate proof classes.

## ADR-013: Recipe composition owns exact stage identity and visualization manifests require it

**Status:** Accepted (supersedes ADR-005's v1 manifest contract)
**Date:** 2026-07-18
**Context:** Step-authored phase labels and inferred stage names created parallel
pipeline taxonomies. Visualization v1 also omitted the exact recipe stage that
owned each emitted layer, so consumers reconstructed identity from step strings
or presentation groupings.
**Decision:** Steps author stable local ids only. A recipe composes steps into
unique, delimiter-safe stage ids and assigns exact `stageId` to compiled plans,
trace events, facets, visualization emissions, and recipe-DAG projections.
Visualization uses a hard v2 manifest cut: every step and layer carries that
exact stage identity, and path-backed readers reject non-v2 or identity-incomplete
manifests. No v1 adapter or inferred stage fallback is admitted.
**Consequences:**
- Recipe order and stage membership have one authority: recipe composition.
- Steps and recipe completion ids do not repeat phase or stage ownership.
- Studio consumes exact stage identity from live worker evidence; it does not
  parse step ids to recreate it.
- Viz owns serialized v2 admission; mod diagnostics own filesystem orchestration and comparison.
- Existing v1 dumps are historical evidence and must be regenerated before use.

## ADR-014: Recipe stages expose operation-derived configuration by default

**Status:** Accepted (amends ADR-010)
**Date:** 2026-07-24
**Context:** Standard stages accumulated four shared `public.config.ts` modules
that rebuilt operation strategy schemas behind friendly aliases and profile
names. The files crossed domain boundaries to reconstruct authoring surfaces,
duplicated defaults already admitted by step contracts, and became large
parallel configuration authorities. Stage knobs now provide the smaller
facility those profiles were reaching for: one semantic choice can tune one or
more already-shaped operation configs without replacing their authored structure.
**Decision:** A recipe stage normally exposes the complete schemas of its
steps, including operation envelopes composed by `defineStep`, plus any
stage-wide knobs. External stage `public.config.ts` modules are not an
authoring kind. A full `public` override is exceptional: it must be a
`Type.Object(...)` authored inline in the concrete `createStage` definition and
must have a meaningful compiler that intentionally hides and translates the
internal surface. Renaming keys, choosing an operation strategy, recreating
defaults, or fanning one value into multiple operation occurrences does not
qualify.
**Consequences:**
- Advanced authors retain every operation strategy and config field through
  the ordinary generated recipe schema. A knob's neutral/default posture
  preserves directly authored values; non-neutral postures transform those
  values relatively instead of replacing them with a second absolute baseline.
- Shipped map configs remain the named product presets. A future profile may
  become a knob only when it has independent product meaning and
  shape-preservingly tunes explicit operation config. Cross-operation coupling
  is strong evidence for a knob, but is not required when one operation has a
  real product-level posture distinct from its advanced numeric controls.
- Strategy schema descriptions are user-facing authoring documentation and
  must remain semantic and contextual at their owning operation.
- The recipe-stage blueprint excludes external public-config files and rejects
  detached public overrides plus obvious empty or passthrough compiler wrappers.

## ADR-015: Step causality is exact artifacts plus plan-only completions

**Status:** Accepted
**Date:** 2026-07-27
**Context:** MapGen represented step causality through a tag registry, runtime
satisfaction ledger, effect evidence, adapter call accounting, and optional
postcondition predicates. Most tags duplicated admitted write-once artifacts;
the remainder represented successful external Civ7 transactions but accumulated
no payload. The machinery created multiple descriptions of the same execution
state without proving runtime isolation or improving selected-plan scheduling.
**Decision:** A step has one ordered `requires` list and one ordered `provides`
list. Each entry is either an exact `Artifact` authority or a typed, payload-free
`CompletionId`. Selected-plan compilation requires exactly one earlier provider,
rejects competing providers, and preserves exact artifact identity. Artifact
publication remains the sole runtime admission and postcondition transition. A
completion is only a causal plan edge for successful external-state mutation
that a downstream consumer genuinely needs and no exact admitted artifact
expresses; sequential fail-fast execution proves provider reachability without
emitting or storing completion state.
**Consequences:**
- Tag registries, effect definitions, adapter ledgers, postcondition callbacks,
  runtime completion emission, and satisfaction reports are deleted.
- Engine-method declarations remain capability whitelists. They neither derive
  nor satisfy completions because a method call is not the same authority as a
  successful step transaction.
- Exact artifacts are preferred whenever their admitted payload semantically
  represents the downstream outcome. Planning or pre-materialization artifacts
  cannot serve as sentinels for later Civ7 mutations.
- Authored order alone does not earn a completion. Every completion must name a
  concrete downstream dependency on otherwise invisible mutable state.
- Initial setup remains immutable invocation context, while trace events remain
  observation; neither is a dependency kind.

## ADR-016: Swooper Physics definition and Civ7 realization are separate projects

**Status:** Accepted
**Date:** 2026-07-28
**Context:** `mods/mod-swooper-maps` combined the reusable Swooper domain and
Standard recipe product with Civ7 file rendering, generated map entrypoints,
bundling, deployment, Studio run-mod materialization, and live verification.
That made the product definition appear to own filesystem mutation and made
Studio depend on a deployable mod package merely to consume recipe contracts.
The mixed owner also obscured which outputs were authored product identity and
which were one runtime realization of that identity.
**Decision:** The reusable Swooper product definition lives at
`plugins/mod/map/swooper-physics` as package `@swooper/swooper-physics`, Nx
project `swooper-physics`, and `kind:mod`. It owns the six domain models, the
Standard recipe and its authored configuration, shipped map configs/catalog,
metrics and visualization authorship, and product-specific diagnostic
commands. The Civ7 realization lives at `apps/mods/map/swooper-physics` as
package `@swooper/swooper-physics-mod`, Nx project `swooper-physics-mod`, and
`kind:app`. It owns generated map entrypoints, Civ7 metadata and output files,
bundling, deployment, request-local Studio mod generation, and live proof.
The app imports only finite public definition entrypoints. The definition never
imports the app, and Studio imports definition contracts while invoking app Nx
targets for materialization. Existing Civ7 mod ids and serialized recipe ids
remain product behavior and do not change with repository paths.
**Consequences:**
- `kind:app -> kind:mod` is the definition dependency. The app may also consume
  a product-neutral `kind:mapgen-tool` for application-owned generation,
  diagnostics, or live-proof workflows; tools never import apps or product
  definitions. Directory naming does not weaken the existing kind taxonomy or
  turn the definition into a leaf CLI plugin.
- Canonical map configs remain authored Swooper product identity beside the
  metrics and studies that evaluate them. The app consumes their admitted
  catalog rather than maintaining a second shipped-map registry.
- Generated entry modules and mod output have one application owner and are
  regenerated at the new root. No compatibility package, proxy target, or
  second output location remains under `mods/`.
- MapGen Studio consumes recipe runtime, authoring artifacts, DAG, map-config,
  and catalog entrypoints from the definition. It may orchestrate the app's
  build/deploy targets but does not import app source.
- CLI topic plugins under `plugins/cli/topics` are a separate normalization;
  this decision does not broaden `kind:plugin` or its dependency allowances.

## ADR-017: The Civ7 CLI shell registers independently owned topic plugins

**Status:** Accepted
**Date:** 2026-07-28
**Context:** `packages/cli` owned the executable shell, global hooks, and every
command implementation. That mixed application startup with cohesive oclif
topic surfaces and made reusable capability packages look CLI-owned merely
because commands consumed them.
**Decision:** The CLI shell remains the `kind:app` owner of the binary, startup,
global hooks, plugin registration, and shell-wide operational targets. A
cohesive command topic may live at `plugins/cli/topics/<topic>` as one
`kind:cli-topic-plugin` project with its own source, behavior tests, build, and
oclif manifest. The shell registers that package exactly once and retains no
forwarding commands. Topic plugins adapt `kind:plugin`, `kind:library`, and
`kind:control` capabilities; reusable capabilities never move into a topic
solely because its commands are their current consumer. The control allowance
exists so the `game` topic can adapt the canonical live-control contracts and
runtimes into CLI UX; it does not permit topic-owned transports or control
services.
**Consequences:**
- `kind:app -> kind:cli-topic-plugin` and
  `kind:cli-topic-plugin -> {kind:plugin, kind:library, kind:control}` are the
  complete new project-plane edges.
- Each topic keeps its topic-prefixed directory under `src/commands`, because
  oclif derives canonical command ids from paths rather than package names.
- The generic CLI-topic blueprint closes project, source, command, and test
  spines. oclif owns native command discovery and manifests; Nx and TypeScript
  own package edges and imports.
- The `data`, `docs`, `git-mod`, and `game` topics are independent instances.
  Graph, archive, configuration, file, Git, mod, and live-control mechanics
  remain in their existing reusable package owners.

**Amendment (2026-07-28):** The shell's physical owner is `apps/cli`, not
`packages/cli`, because it realizes an executable application rather than a
reusable package. `apps/cli/civ7.ts` owns development composition,
`apps/cli/bin/run.js` owns production launch, and command topics remain
independent plugins.
