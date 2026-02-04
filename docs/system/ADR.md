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
