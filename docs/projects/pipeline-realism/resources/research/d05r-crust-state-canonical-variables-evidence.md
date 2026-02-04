# Evidence Memo: D05r Crust State Canonical Variables

## Summary

D05r requires a crust model that can start from a **global basaltic lid** and produce continents as a simulation outcome while remaining deterministic, bounded, and consumable by downstream stages. The evidence across Proposal C family (maturity-based) and Proposal D family (type/age/strength) converges on one stable posture: use a continuous **maturity** state as truth, and publish the existing binary/driver fields as deterministic derivations for compatibility.

## Evidence Pointers

### Continuous “maturity” is the missing truth variable

`docs/projects/pipeline-realism/resources/packets/foundation-proposals/first-principles-crustal-evolution.md` frames continent formation as progressive differentiation driven by subduction and collision. It defines a continuous `maturity` scalar, event-driven updates (subduction increases maturity; rifts reset), and derives discrete composition codes from maturity bands. This is the smallest state that can represent gradual continentalization without pre-painting continents.

`docs/projects/pipeline-realism/resources/packets/foundation-proposals/unified-foundation-refactor.md` repeats the same structure in the evolution engine data model (`CrustalState: maturity, thickness, age`) and ties boundary classification to maturity (continental collision vs normal subduction).

### Binary type/age/strength is an effective projection, not sufficient truth

`docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/foundation-refactor-proposal.md` uses `crustType/crustAge/crustStrength` as the material surface and derives resistance for partitioning. This model is contract-compatible with today’s Foundation artifact (`type/age/strength`) and is a stable downstream API, but it does not encode gradual differentiation; “type” becomes a hard label that cannot represent transitional arc/plateau material.

### Current contract already matches the “derived fields” surface

From `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`, `artifact:foundation.crust` exposes:
- `type: u8` (`0=oceanic`, `1=continental`)
- `age: u8` (`0=new`, `255=ancient`)
- `buoyancy/baseElevation/strength: f32` (`0..1`)

Code anchors:
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/contract.ts` (schema matches the five derived fields above)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts` (current algorithm paints continents and ages without an evolution loop)

Implication: the existing contract surface is the correct projection layer for crust drivers; D05r defines the truth variables that those drivers summarize.

## Cost / Complexity Envelope (Big-O)

Let `C = cellCount`, `S = segmentCount`, `E = eraCount`.

### Truth state (D05r)

Truth state is `O(C)` memory:
- `maturity (f32)`: `4C` bytes
- `thickness (f32)`: `4C` bytes
- `thermalAge (u8)`: `1C` bytes
- `damage (u8)`: `1C` bytes

Total: `10C` bytes.

### Per-era update cost

Per era, apply event updates using segment-derived corridors plus one whole-grid healing pass:
- boundary/event pass: `O(S)` segment iteration with fixed-radius neighborhood writes
- healing/relaxation pass: `O(C)`

Total: `O(E × (S + C))` with fixed constants.

This matches the same bounded envelope as D04r Eulerian era fields and avoids any unbounded growth surfaces.

## Derived-Field Rationale (Why These Derivations Exist)

Downstream consumers and existing validation need stable scalar channels:
- `strength` is required for resistance-based partitioning (D01) and mantle stress coupling (D02r).
- `baseElevation` is required for a visually coherent isostatic baseline before Morphology adds relief.
- `type` remains a minimal categorical proxy for consumers that want a coarse ocean vs landmass split.

D05r keeps these outputs, but ties their meaning to a truth state that can represent progressive change.

## Resulting Decision Signals

- `maturity` is the canonical crust truth scalar; it is the only representation that supports manufactured continents without pre-labeling.
- `type/age/strength/buoyancy/baseElevation` are required derived fields and remain stable contract outputs.
- Boundedness is achieved by keeping crust truth `O(C)` and updating it with a fixed-cost per-era loop.
