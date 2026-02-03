# Evidence Memo: D04r Dual History (Eulerian Eras + Lagrangian Provenance)

## Summary

The existing D04 evidence splits between **Eulerian era fields** (Proposal D) and **Lagrangian material tracking** (Proposal C). D04r requires **both** outputs, with bounded compute and a Morphology-first contract. The current Foundation contract already exposes Eulerian history (`artifact:foundation.tectonicHistory`) while leaving provenance undefined and validation fixed to `eraCount === 3`. The evidence below supports a dual-output decision and identifies concrete integration points.

## Evidence Pointers

### Lagrangian lineage requirements

`docs/projects/pipeline-realism/resources/packets/foundation-proposals/tectonic-evolution-engine.md` frames evolution as Lagrangian tracking. Relevant sections include “Core Concept: Lagrangian Material Tracking,” “The Evolution State” (per-cell provenance and crust age), and “Performance Considerations” (O(eras × cells) envelope). This proposal explicitly tracks crust parcels and includes fields like `originEra`, `originPlateId`, and boundary events, which are necessary for lineage-aware morphology decisions.

### Eulerian field requirements

`docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-tectonic-evolution-spec.md` frames evolution as era-resolved fields. Relevant sections include “Goals” (era-resolved outputs + bounded runtime) and “Morphology Consumption” (era selection + blending). This proposal positions era fields as the primary downstream API and emphasizes deterministic, bounded runtime.

### Current contract and guard

From `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`:
- `artifact:foundation.tectonicHistory` exists today as the truth artifact for per-era fields and rollups.
- The op contract allows `eraCount` up to 8, but validation enforces `eraCount === 3`.
- Code anchor: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts`.
- Code anchor: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts`.
- Code anchor: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts`.

Implication: a dual-output decision should preserve `tectonicHistory` and add a mandatory provenance artifact, while replacing the `eraCount === 3` guard with a profile-bound invariant.

## Cost / Complexity Envelope (Big-O)

Let `C` be mesh cell count, `E` be era count, and `S` be tectonic segment count.

**Eulerian era fields**
- Compute: `O(E × (S + C))`
- Memory: `O(E × C)` for per-era fields + `O(C)` for rollups

**Lagrangian provenance (per-cell tracer history)**
- Compute: `O(E × C × k)` where `k` is fixed advection steps per era
- Memory: `O(E × C)` for tracer history + `O(C)` for provenance scalars

Both paths are bounded and deterministic when `E` and `k` are fixed. This allows a dual-output contract without unbounded growth.

## Morphology-First Consumption

Morphology already consumes `foundation.plates` and `foundation.crustTiles`. It can be extended to consume both outputs: use **Eulerian era fields** to select boundary regimes and stress signals per era, and use **Lagrangian provenance** to weight mountain age, volcanic persistence, and crust stability by lineage (origin era, last boundary event).

This dual consumption aligns with the “manufactured continents” realism target without abandoning the existing field API.

## Resulting Decision Signals

- Eulerian fields are already canonical and should remain mandatory.
- Lagrangian provenance is required for lineage-driven morphology and must be first-class.
- The `eraCount === 3` guard must be replaced by a profile-bound invariant (fixed target + max), to align compute bounds with the dual-output model.
