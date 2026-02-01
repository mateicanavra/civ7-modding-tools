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

## ADR-005: Visualization SDK v1 separates data type, representation, and projection (registry-driven)

**Status:** Proposed
**Date:** 2026-02-01
**Context:** The visualization surface needs to be meaningful and varied (multiple projections per logical layer) and correct for continuous fields (proper value domains, stats-driven normalization). The current model couples “data type” to `layerId` and “render mode” to `kind[:role]`, which blocks multi-projection unless the pipeline duplicates outputs. Continuous fields are also visually broken when raw values are treated as already normalized.
**Decision:** Adopt a v1 visualization model that separates:
- `dataTypeId` (stable semantic identity),
- representation/encoding (grid/points/segments payloads, variants),
- viewer-defined `projectionId` (multiple projections per representation/data type), driven by a centralized registry.
Value semantics (domains, no-data, transforms) and stats (min/max at minimum) become explicit inputs to rendering instead of implicit clamps.
**Consequences:**
- Viewer can provide multiple projections per data type without requiring pipeline duplication, and can standardize palettes/legends via a registry.
- Continuous fields become correct by default via stats-driven normalization, improving interpretability immediately.
- Protocol/manifest likely requires a version bump and an explicit back-compat adapter (v0 → v1) to avoid breaking existing dumps.
- Pipeline emitters can shrink toward canonical data products; “projection variety” moves to the viewer by default.
