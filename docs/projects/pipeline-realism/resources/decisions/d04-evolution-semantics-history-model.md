# Decision Packet: Define Evolution Semantics (History Model)

> Superseded by `docs/projects/pipeline-realism/resources/decisions/d04r-history-dual-eulerian-plus-lagrangian.md` (maximal posture: Eulerian era fields + mandatory Lagrangian provenance).

## Question

Should the Foundation evolutionary refactor treat history as **Lagrangian material tracking** (forward-simulation of crust parcels) or as **Eulerian era-resolved fields** with optional bounded tracer history, and what is the minimal downstream history API (Morphology-first)?

## Context (pointers only)

- Docs:
  - `docs/projects/pipeline-realism/resources/spec/proposal-comparison-foundation-evolutionary-refactor.md` (D04 backlog entry)
  - `docs/projects/pipeline-realism/resources/packets/foundation-proposals/tectonic-evolution-engine.md` (Part II “Core Concept: Lagrangian Material Tracking”)
  - `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-tectonic-evolution-spec.md` (Goals + “Optional Bounded Advection (Tracer History)”)
  - `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (contract, artifacts, eraCount guard note)
- Code:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts` (`eraCount !== 3` guard)
  - `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts` (`eraCount` min/max)

## Why this is ambiguous

- Proposal C frames evolution as **forward simulation with material tracking**, implying a Lagrangian history core.
- Proposal D frames evolution as **era-resolved fields + optional bounded advection**, implying Eulerian history with limited tracer context.
- Current Foundation contract already exposes **tectonic history era fields**, but downstream consumption is minimal and validation fixes `eraCount` to 3, contradicting the wider contract range.

## Why it matters

- Blocks/unblocks:
  - Locks the **performance envelope** (per-era CPU + memory scaling) and acceptable era counts.
  - Defines **downstream API** (Morphology era selection, history recency signals).
  - Determines whether **material provenance** (origin era/plate) is required or optional.
- Downstream contracts affected:
  - `artifact:foundation.tectonicHistory` and `artifact:foundation.tectonics`
  - Morphology steps that currently consume `artifact:foundation.plates` + `artifact:foundation.crustTiles`

## Simplest greenfield answer

Adopt **Eulerian era-resolved fields** as the canonical history output, with **optional bounded tracer history** for drift context. Provide a minimal, deterministic history API that Morphology can consume without requiring full material tracking.

## Why we might not yet simplify

- Lagrangian material tracking offers richer provenance (origin era/plate, accretion/subduction history) that could be valuable for “continents manufactured” realism.
- Replacing history semantics later could be costly if Morphology (or other domains) are built on material-tracking assumptions.

## Options

1) **Option A**: Lagrangian material tracking core
   - Description: Forward-simulate crust parcels; track origin era/plate, last boundary event, crust age, and material transfers (subduction/accretion).
   - Pros:
     - Most physically expressive; supports provenance-driven morphology and “manufactured continents.”
     - Directly answers “what happened to this crust.”
   - Cons:
     - Highest complexity and compute/memory envelope (stateful simulation + per-era snapshots).
     - Harder to keep deterministic and bounded without aggressive constraints.

2) **Option B**: Eulerian era fields + optional bounded tracer history
   - Description: Produce per-era masks and force fields; optionally run bounded advection to provide drift context without reconstructing plates/material.
   - Pros:
     - Lower complexity; deterministic, bounded runtime.
     - Aligns with current `tectonicHistory` contract and D-spec posture.
     - Clean Morphology API (era selection + blending).
   - Cons:
     - Limited provenance (no true material tracking).
     - “Continents manufactured” story is encoded indirectly via fields rather than material flow.

3) **Option C**: Tracer-lite (origin era + local events only)
   - Description: Keep Eulerian fields, add minimal per-cell `originEra` + `lastEvent` without full material transfers.
   - Pros:
     - Adds some provenance signal at modest cost.
   - Cons:
     - Still ambiguous about accretion/subduction; risks hybrid semantics confusion.

## Proposed default

- Recommended: **Option B (Eulerian era fields + optional bounded tracer history)**
- Rationale:
  - Matches the current Foundation contract shape (`tectonicHistory` + per-era fields) and is compatible with existing projections.
  - Keeps runtime and memory bounded while enabling Morphology to be era-aware immediately.
  - Leaves a clear upgrade path: Lagrangian tracking can be introduced later as a new op or optional mode without invalidating the baseline API.

## Acceptance criteria

- [ ] SPEC updated at: `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md`
- [ ] Migration slice created/updated at: `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md` (migration section or linked slice)
- [ ] Follow-ups tracked: none needed yet (decision packet only)
