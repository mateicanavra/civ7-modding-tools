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
- Turbo remains the build orchestrator; root `packageManager` stays set to Bun to satisfy Turbo workspace detection.
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

**Status:** Accepted
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
checked in Tuner, plus App UI-only lifecycle/UI/storage roots. Direct-control
already owns runtime transport, state selection, approval, validation, and
wrapper promotion. Generated static profiles already own the native AI policy
lane.
**Decision:** Civ7 intelligence uses a two-sided authority architecture:
live external play through `@civ7/direct-control`, and native policy shaping
through generated static AI profiles. A game-scoped App UI controller loaded
through native `scope="game"` `UIScripts` is the baseline implementation
candidate for replacing raw per-wrapper direct-control JavaScript with a stable
in-game API. It remains subordinate to direct-control authority: direct-control
owns socket transport, state discovery, approval, no-replay behavior, and proof
promotion.
**Consequences:**
- Raw `CMD:<stateId>:<javascript>` / `game exec` stays a diagnostic and probe
  transport, not the agent-facing product API.
- oRPC/Effect is the shared control substrate for the external direct-control
  API, the game-scoped controller mod API, and future internal AI intelligence
  services. The App UI `globalThis.Civ7IntelligenceBridge.invoke(...)` surface is
  a serialized transport adapter into an in-process callable router, not an ad
  hoc product API.
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
**Decision:** `mods/mod-swooper-maps/src/domain/resources` is the owning domain for resource planning: demand/eligibility planning (family planners + group rollup), habitat-lane derivation, and site selection emitting typed per-plot intents. Recipe-layer placement steps are thin wiring + stamp/reconcile shells. The Gameplay-absorption appendix now points at `domain/resources` for resource planning; a future Gameplay domain consolidation may absorb starts/discoveries/wonders orchestration but does not re-own resource planning logic.
**Consequences:**
- `domain/placement/ops/plan-resources` (generic scalar scorer) is superseded and deleted in the S3 slice; no dual path remains.
- Resource policy grounding (Weight, MinimumPerHemisphere, legality rows, required-for-age) flows from `@civ7/map-policy` generated tables into `domain/resources` planning; the engine oracle (`canHaveResource`) is a reconcile-time check, not a planning authority.
- The absorption appendix's "invoke the engine resource generator" posture is superseded for resources by the deterministic typed plan+stamp pipeline (ADR-009).

## ADR-009: Deterministic typed reconciliation is the placement regime; engine readbacks are evidence-only

**Status:** Accepted
**Date:** 2026-06-09
**Context:** Placement survived three regime reversals in four months (engine-RNG delegation → deterministic plan+stamp → official-generator-primary → deterministic typed reconciliation via the normalization packet D3/D4, implemented 2026-05-30) and none of those decisions reached this record, which is part of why each regime's scaffolding accreted (diagnosis RC1). The placement-realignment workstream depends on the current posture being durable, so it is recorded here as the S3 entry gate (D2) requires.
**Decision:** (a) The deterministic plan is the authority for typed intent: materializers stamp intents through the adapter and reconcile engine feasibility with per-tile typed rejection reasons — never re-deciding types, never falling back to official generators as truth (D4 posture, guardrail G8 in `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`). (b) Engine readbacks are evidence-only: they verify outcomes (readback assertions, parity snapshots) and may project current engine surface state into a declared planning input, but they are never undeclared planning truth; planning consumes pipeline artifacts and policy tables. Remaining declared engine-surface reads (e.g. post-maintenance legality masks) are tracked for artifact-based reconstruction in the S6 slice.
**Consequences:**
- Shortfalls and rejections are recorded as typed outcomes instead of being silently rescued (no whole-map fallback, no least-used-type rebalance, no spacing decay).
- Live-game proof compares plan vs engine state at milestone boundaries; per-slice proof runs on artifacts + mock policy emulation.
- Future regime changes require a superseding entry here before implementation.
