# Deferrals

> Intentionally deferred work and technical debt.

---

## Format

Each deferral follows this structure:

```
## DEF-XXX: Title

**Deferred:** YYYY-MM-DD
**Trigger:** When should this be revisited?
**Context:** Why was this deferred?
**Scope:** What work is involved?
**Impact:** What are we living with?
```

---

## Active Deferrals

## DEF-001: Engine Elevation vs. Physics Heightfield Alignment

**Deferred:** 2025-12-08
**Trigger:** Next major mapgen engine refactor or post–TS-migration remediation hardening
**Context:** The Civ7 engine derives elevation internally via `TerrainBuilder.buildElevation()` using its own fractal fields and terrain tags. Our plate/physics `WorldModel` maintains a richer heightfield that cannot be pushed 1:1 into the engine (no `setElevation` API). During TS migration remediation we adopted a conservative hybrid model: physics drives macro structure; Civ fractals + `buildElevation()` provide micro-variation.
**Scope:** 
- Explore a physics-first pipeline that maps our height buckets directly to terrain (land/ocean/mountain/hill) with minimal or no use of engine fractals, then calls `buildElevation()` once.
- Alternatively, more tightly couple fractal usage to our heightfield (e.g., derive fractal thresholds/grain from physics statistics) while keeping the adapter boundary clean.
- Compare aesthetics, performance, and complexity against the current hybrid approach; update contracts/docs if we standardize on a new pattern.
**Impact:** 
- Today, engine elevation and cliffs remain a lossy derivative of our terrain layout and engine-side fractals; our internal heightfield is used for physics/story only.
- There is conceptual divergence between “true” physics elevation and what the player sees in-game.
- Addressing this will likely require coordinated changes across `@swooper/mapgen-core`, the Civ7 adapter, and docs, so we are explicitly deferring it beyond the current remediation milestone.

---

## Project-scoped deferrals

Some deferrals are intentionally scoped to a specific project/milestone (e.g., Engine Refactor v1) rather than the whole system. Keep those in the project’s deferrals doc:

- Engine Refactor v1: `docs/projects/engine-refactor-v1/deferrals.md`

## Resolved Deferrals

*Move resolved deferrals here with resolution notes.*

## DEF-002: Runtime-loadable recipes in the browser (no rebuild required)

**Deferred:** 2026-01-31
**Trigger:** When we need “drop in a recipe” workflows (OPFS/drag-and-drop), third-party recipe distribution, or we have enough recipes that bundling them all becomes a startup/bundle-size problem.
**Context:** V0.x runner intentionally bundles recipes as TS/ESM modules in the worker. This is the simplest, most reliable posture while we harden the worker protocol, viz ingest/store, and deck rendering. True runtime-loadable recipes require a different architecture (serialized recipe IR + interpreter, or dynamic module loading with tricky deployment constraints).
**Scope:**
- Define a serialized “recipe IR” that can be loaded from bytes/JSON.
- Implement a worker-side interpreter/runtime for that IR.
- Provide import UX (OPFS, drag-and-drop, URL import) and a trust/sandbox story.
**Impact:**
- Today, adding a recipe requires rebuilding the worker bundle.
- Studio remains “agnostic” at the API level, but not yet “runtime pluggable” without rebuild.

## DEF-003: SharedArrayBuffer + buffer pooling for zero-copy streaming

**Deferred:** 2026-01-31
**Trigger:** If baseline perf shows buffer copying/transfer and GC are primary bottlenecks, and we can deploy Studio with cross-origin isolation (COOP/COEP) reliably.
**Context:** Transferables already give no-copy handoff per message, but we still allocate and/or clone buffers in several places to avoid detaching producer-owned memory. A pooled SAB-backed ring buffer could reduce allocations and latency, but it introduces deployment constraints and concurrency complexity.
**Scope:**
- Ensure cross-origin isolation in deployment (COOP/COEP), plus diagnostics.
- Introduce SAB-backed buffer pools (or ring buffers) for high-volume layer streams.
- Redesign message protocol to pass offsets/lengths instead of full buffers.
**Impact:**
- Today, large payloads may incur extra copies and allocation churn (worker clone + main upload), especially for frequently updated layers.
- We retain maximum browser compatibility and simplest deployment posture for now.
