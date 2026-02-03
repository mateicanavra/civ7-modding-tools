# Evidence Memo: D04 Evolution Semantics (History Model)

## Summary

The two proposal streams diverge on **history semantics**:
- Proposal C (forward simulation) treats history as **Lagrangian material tracking** with explicit crust parcel provenance.
- Proposal D (authoritative spec) treats history as **Eulerian era-resolved fields** with optional **bounded tracer advection** for drift context.

The current Foundation contract already provides **per-era tectonic fields** (`artifact:foundation.tectonicHistory`), but downstream consumption is minimal and validation locks `eraCount` to 3 despite the broader schema allowance.

## Proposal C Pointers (Lagrangian material tracking)

- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/tectonic-evolution-engine.md`
  - “Executive Summary” (forward-simulating engine)
  - “Core Concept: Lagrangian Material Tracking”
  - “The Evolution State” (per-cell provenance + crust age)
  - “Performance Considerations” (O(eras × cells))

The doc explicitly frames the model as **tracking material parcels through time** and records per-cell provenance (`originEra`, `originPlateId`, `lastBoundaryEra`, `lastBoundaryEvent`).

## Proposal D Pointers (Eulerian era fields + bounded tracer)

- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-tectonic-evolution-spec.md`
  - “Goals” (era-resolved outputs + bounded runtime)
  - “Optional Bounded Advection (Tracer History)”
  - “Morphology Consumption” (era selection + blending)

The doc explicitly frames evolution as **per-era masks and force fields**, with **optional advection** for history context rather than full plate reconstruction.

## Mapping to Current Contract / Code

From `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`:
- Truth artifact: `artifact:foundation.tectonicHistory` (per-era fields + rollups) and `artifact:foundation.tectonics` (current drivers).
- Current validation guard: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts` rejects anything where `eraCount !== 3`.
- Contract schema: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts` allows `eraCount` in `[1..8]`.
- Current downstream consumption: Morphology consumes tile projections (`foundation.plates`, `foundation.crustTiles`) rather than `tectonicHistory` directly.

Implication: adopting **Eulerian era fields** aligns with the existing contract shape and allows gradual Morphology adoption by adding era-aware sampling. A Lagrangian core would require either a new truth artifact or a redefinition of `tectonicHistory` to encode per-cell provenance.

## Cost / Complexity Envelope (Big-O + Memory)

Let:
- `C` = mesh cell count
- `S` = tectonic segment count
- `E` = era count
- `T` = tile count

**Option A: Lagrangian material tracking**
- Compute: `O(E × (S + C))` (per-era boundary interactions + material updates), plus any neighborhood diffusion.
- Memory (truth): `O(C)` for state (origin era/plate, last event, crust age, accumulators) + `O(C × E)` if per-era snapshots are retained.
- Notes: highest CPU and memory; requires strong determinism and bounds to keep `E` practical.

**Option B: Eulerian era fields + optional bounded tracer**
- Compute: `O(E × S)` to classify boundaries + `O(E × C)` for per-era fields; optional advection `O(E × C × k)` with bounded `k` (small drift steps).
- Memory (truth): `O(C × E)` for per-era fields + `O(C)` for rollups; optional `O(C × E)` for tracer snapshots.
- Notes: stays aligned with current `tectonicHistory` shape and keeps bounded runtime.

**Option C: Tracer-lite**
- Compute: same as Option B plus `O(E × C)` to update `originEra`/`lastEvent`.
- Memory: `O(C × E)` for fields + `O(C)` for tracer-lite signals.

## Minimal History API (Morphology-first)

A minimal, deterministic API that Morphology can consume without full material tracking:

- **Truth (mesh space)** `artifact:foundation.tectonicHistory`:
  - `eraCount: number`
  - `eras[]` (length = `eraCount`), each with:
    - `boundaryType: Uint8Array`
    - `convergentMask/divergentMask/transformMask: Uint8Array` (0/1)
    - `upliftPotential/riftPotential/shearStress/volcanism/fracture: Uint8Array`
  - Rollups:
    - `lastActiveEra: Uint8Array` (255 = never)
    - `upliftRecentFraction: Uint8Array`
- **Optional bounded tracer**:
  - `eraTracer?: Uint32Array[]` (length = `eraCount`, per-cell origin index), only if enabled.
- **Projection**:
  - Use existing `artifact:foundation.tileToCellIndex` to sample the mesh-space arrays for tile-based Morphology.

This API is additive to today’s contract and aligns with the D-spec’s “era selection + blending” model while leaving room to introduce Lagrangian provenance later.

## eraCount Guard (Should We Relax?)

- Current guard enforces `eraCount === 3` (validation step), despite the schema allowing up to 8.
- For Eulerian era fields, relaxing to **`1..8`** (or aligning with the target `historyProfile` configs) is low risk and directly enables morphology era selection experiments.
- If Lagrangian material tracking is chosen, `eraCount` becomes a **primary cost driver** and should remain bounded with explicit presets (e.g., 3, 5, 8) and budgeted performance tests.

## Hardening / Observability Concepts to Carry Forward

- **Determinism + bounded runtime** as explicit invariants (already emphasized in D proposal).
- **Per-era mask sanity checks** (non-empty masks, regime distribution thresholds) to catch degenerate outputs.
- **Era selection diagnostics** for Morphology (e.g., record chosen era mode + weights in metadata) to prevent “silent drift.”
