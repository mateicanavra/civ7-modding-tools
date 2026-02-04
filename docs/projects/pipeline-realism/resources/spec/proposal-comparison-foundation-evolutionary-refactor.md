# Draft: Proposal Comparison + Decision Backlog (Foundation Evolutionary Refactor)

Date: 2026-02-03

This document is a **comparison scaffold** for synthesizing two target-model proposals into one canonical architecture for the next Foundation iteration.

Non-goals:
- This is not yet the “pure SPEC” target architecture doc.
- This does not attempt to “improve current Foundation as-is” except to harvest durable concepts (validation/observability/guardrails) that remain valuable under the new engine.

## Goal (Target Behavior)

Design a Foundation refactor that:
- starts from a **global basaltic lid** (oceanic crust everywhere at t=0)
- uses a bounded-cost but physically defensible **evolutionary tectonics model** (history/iterations are first-class)
- exposes **planet-like plate tectonics** (rift/subduction/transform/collision as emergent or systematically derived)
- produces **era-resolved outputs** that downstream stages (primarily Morphology) can consume deterministically

## Inputs (Source Packets)

Proposal C (end-to-end, “unified” narrative):
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/unified-foundation-refactor.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/tectonic-evolution-engine.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/first-principles-crustal-evolution.md`

Proposal D (subsystem specs + “authoritative” proposal):
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/foundation-refactor-proposal.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-first-principles-lid-to-continents-spec.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-plate-motion-and-partition-spec.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-tectonic-evolution-spec.md`

Non-target “hardening” (to harvest guardrails/observability concepts, not as the target):
- `docs/projects/pipeline-realism/resources/packets/m11-foundation-realism-spike/README.md`

Current contract baseline (for later cutover planning):
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`

## Proposal Pipelines (At-a-Glance)

Proposal C (unified):

```mermaid
flowchart TD
  A["Mesh (Voronoi + relax)"] --> B["Plate System (seed + Dijkstra)"]
  B --> C["Kinematics (intent + coherence)"]
  C --> D["Evolution Engine (forward simulation)"]
  D --> E["Era Masks + crust state snapshots"]
  E --> F["Tile Projection (influence fields)"]
  F --> G["Morphology consumes: era masks + maturity/age/etc"]
```

Proposal D (authoritative + specs):

```mermaid
flowchart TD
  A["Mesh"] --> B["Basaltic lid init (type/age/strength)"]
  B --> C["Mantle stress field + regime selection"]
  C --> D["Differentiation -> craton seeds + rift corridors"]
  D --> E["Plate motion policy field"]
  E --> F["Partition (resistance-aware Dijkstra)"]
  F --> G["Boundary regimes + hysteresis"]
  G --> H["Era loop (per-era masks + forces)"]
  H --> I["Tile projection (indexed, weighted)"]
  I --> J["Morphology consumes: era selection + fields"]
```

## Comparison Axes (How We’ll Reconcile)

Axes are grouped to match dependency order: spine first, then boundaries/validation, then domain semantics.

Spine:
- orchestration order (what is “primitive” vs “derived”)
- canonical artifacts and their contracts (mesh-space truth vs tile-space projections)

Boundaries:
- validation/observability (what we can assert without rendering)
- determinism + performance envelope (cost bounds)

Domain:
- mantle/lid forcing model
- plate partitioning + kinematics
- boundary interaction model
- crust evolution (continental emergence)
- era/history semantics
- downstream consumption (Morphology contract)

## Side-by-Side Matrix (C vs D)

| Axis | Proposal C (foundation-proposals) | Proposal D (proposal-packet) | Notes / Why It Matters |
|---|---|---|---|
| Planet “story” | Strong narrative (Wilson cycle, “continents manufactured”). | Strong narrative (“basaltic lid” + stress/strength regime selection). | Both align on the core premise. Divergence is in how “physics” enters the algorithms. |
| Kinematics | “Intent-driven” motion with `globalIntent` + `coherence` mixing random vs intent. | Policy-driven **vector field** (div/curl balance) + bounded variance. | D’s policy field is closer to “physical forcing”, but C’s intent surface is a powerful authoring handle. |
| When crust exists | Starts with uniform basalt; crust evolution largely in the sim loop (maturity/thickness/age). | Starts with basaltic lid then creates crust strength/age/type via craton/rift assembly before partition. | Ordering changes what partition can “see” (uniform vs resistance-aware). |
| Plate partitioning | Dijkstra growth; explicitly says resistance is uniform at partition time. | Dijkstra growth over resistance field (age/type + rift weakening) to avoid cratons + follow weak zones. | This is a first-order divergence: do we let crust drive plates, or plates drive crust? |
| Mantle forcing | Optional thermal/mantle state; kinematic intent can stand in for forcing. | Explicit mantle stress field; regime selection (stagnant/episodic/mobile) influences everything. | Decides whether “mantle” is a first-class computed field. |
| Boundary interactions | Rich event taxonomy (subduction/rift/transform/collision), forward simulation; material tracking language appears in the engine docs. | Boundary labeling via normal/tangent decomposition + hysteresis; per-era masks + force fields; optional bounded advection (not full reconstruction). | Divergence: full Lagrangian material tracking vs bounded fields + optional tracer context. |
| History outputs | Era masks and crust snapshots are first-class. | Era-resolved masks and force fields are first-class; explicit “history profile”. | Both converge on “history as output”, but differ in how much history is “simulation” vs “signals”. |
| Morphology contract | Big “what changes for Morphology” section; new signals + adaptation guide. | Morphology explicitly chooses eras (`tectonicEraMode`, weights). | Both require Morphology changes; D is more explicit about “era selection” as an API. |
| Config / authoring | Unified schema + knob mapping; includes plate count scaling, coherence, etc. | “Profiles” (resolution/continent/motion/history) -> derived constants. | Decide whether config surface is “profiles-first”, “knobs-first”, or hybrid (profiles with escape hatches). |
| Migration posture | Includes phased strategy chapters. | Includes implementation sequence and file tree; reads like a refactor map. | Later we should split migration slices out of the canonical spec. |

## Key Divergences (What We Must Resolve)

1. “Plates first” vs “crust first”
- C: partition plates, then simulate crust evolution and tectonics.
- D: compute crust strength/age/rifts first, then partition plates using a resistance field.

2. Forcing model: author intent vs mantle stress field
- C: kinematic intent can drive realistic patterns, mantle/thermal is optional.
- D: mantle stress and regime selection are first-class and upstream.

3. Evolution model: full material tracking vs bounded history signals
- C: forward simulation with event types, evolving crustal state; tends toward material-tracking semantics.
- D: era fields + optional bounded advection; avoids full plate reconstruction as a requirement.

4. Config surface: schema/knobs vs authoring profiles
- C: full schema, knob mapping, scaling rules.
- D: profiles with derived internal constants.

## Decision Backlog (To Synthesize Into One Canonical Architecture)

Each item below should become a standalone decision packet under `docs/projects/pipeline-realism/resources/decisions/`.

## Decision Status (Draft)

Draft defaults chosen (via decision packets on the synthesis branch):
- D01: crust-first resistance partition. See `docs/projects/pipeline-realism/resources/decisions/d01-ordering-crust-vs-plates.md`.
- D02r (supersedes D02): mantle forcing as potential + derived stress/velocity. See `docs/projects/pipeline-realism/resources/decisions/d02r-mantle-forcing-potential-derived.md`.
- D04r (supersedes D04): dual history outputs (Eulerian eras + mandatory Lagrangian provenance). See `docs/projects/pipeline-realism/resources/decisions/d04r-history-dual-eulerian-plus-lagrangian.md`.
- D07r: morphology consumes era fields + provenance (no wall mountains). See `docs/projects/pipeline-realism/resources/decisions/d07r-morphology-consumption-contract.md`.

Synthesis note:
- `docs/projects/pipeline-realism/resources/spec/synthesis-d01-d02-d04.md`
- Maximal SPEC:
  - `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md`

Decision status (this project):

- D01: Ordering (crust-first resistance partition) — chosen: `docs/projects/pipeline-realism/resources/decisions/d01-ordering-crust-vs-plates.md`
- D02r: Mantle forcing as potential + derived fields — chosen: `docs/projects/pipeline-realism/resources/decisions/d02r-mantle-forcing-potential-derived.md`
- D03r: Plate motion derived from mantle forcing — chosen: `docs/projects/pipeline-realism/resources/decisions/d03r-plate-motion-derived-from-mantle.md`
- D04r: Dual outputs (Eulerian eras + Lagrangian provenance) — chosen: `docs/projects/pipeline-realism/resources/decisions/d04r-history-dual-eulerian-plus-lagrangian.md`
- D05r: Canonical crust state vector — chosen: `docs/projects/pipeline-realism/resources/decisions/d05r-crust-state-canonical-variables.md`
- D06r: Event mechanics + mandatory force emission — chosen: `docs/projects/pipeline-realism/resources/decisions/d06r-event-mechanics-and-force-emission.md`
- D07r: Morphology consumes era + provenance projections — chosen: `docs/projects/pipeline-realism/resources/decisions/d07r-morphology-consumption-contract.md`
- D08r: Authoring/config surface (physics inputs only) — chosen: `docs/projects/pipeline-realism/resources/decisions/d08r-authoring-and-config-surface.md`
- D09r: Validation/observability posture — chosen: `docs/projects/pipeline-realism/resources/decisions/d09r-validation-and-observability.md`

## Candidate “Hardening” Concepts to Harvest (M11 Spike)

These are candidates to explicitly pull into the new engine if they remain valuable and are not already superseded by better canonical docs/implementation.

- Validation/observability: define measurable invariants for plate partitions, boundary regimes, belt continuity, crust/age distributions.
- Failure-mode framing: enumerate “ways this looks fake” and map each to a detectable signal.
- Segment/belt abstraction: model boundaries as segments/belts (not just per-cell noise) to avoid “wall mountains”.
- Deterministic micro-structure policy: bounded noise only after macro drivers are established.

Verification needed:
- Which of these are already implemented in current Foundation steps.
- Which are already better specified in `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` or adjacent canonical docs.

## Next Step (After This Draft)

Decisions are complete and the canonical SPEC exists:
- `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md`

Migration slices exist (prepare → cutover → cleanup):
- `docs/projects/pipeline-realism/resources/spec/migration-slices/`

Remaining work is implementation + calibration:
- implement the migration slices (code changes)
- calibrate strict validation thresholds (promote a small subset of diagnostics → CI gates)
