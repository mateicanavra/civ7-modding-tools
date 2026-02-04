# Decision Packet: Canonical Crust State Variables (D05r)

## Question

What is the **canonical truth representation** of lithosphere/crust state in Foundation, and which fields are deterministic **derivations** published for downstream consumers and backwards-compatible contracts?

## Context (pointers only)

- Docs:
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (current `artifact:foundation.crust` contract and meaning)
- `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md` (basaltic lid + evolutionary physics posture)
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/first-principles-crustal-evolution.md` (maturity/thickness/age model + event rules)
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/unified-foundation-refactor.md` (evolution engine data structures including maturity/thickness/age)
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/foundation-refactor-proposal.md` (type/age/strength model)
- Code:
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/contract.ts` (current crust fields and ranges)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts` (current “paint” crust algorithm)

## Why this is ambiguous

- Proposal families disagree on whether crust is **binary** (`type/age/strength`) or **continuous** (maturity/thickness/age), and they attach different physical meaning to “age”.
- The maximal Foundation posture starts from a **global basaltic lid** and requires continents to be **manufactured** by evolution, which requires a continuous state variable to model progressive differentiation.
- The current contract already exposes `type`, `age`, `buoyancy`, `baseElevation`, `strength`, but it does not define which subset is truth versus derived.

## Why it matters

- Plate partitioning depends on a **resistance field**; resistance must be grounded in canonical crust truth so plate layouts are explainable and reproducible.
- Evolution (D04r) requires per-era drivers and provenance; crust state must define what evolves under boundary events and mantle forcing.
- Downstream consumers (D07r) require stable, interpretable signals; crust state must produce deterministic tile projections and be observable via invariants.

## Decision (maximal)

Foundation’s canonical crust truth is the **continuous crust state**, centered on a **maturity scalar** with a small set of additional state variables. The existing binary/driver fields remain published, but they are deterministic derivations of the truth state.

## Canonical Truth State Variables (mesh space)

Per mesh cell, the truth state is:

- `maturity` (f32; `0..1`)
  - Meaning: degree of differentiation/continentality.
  - `0` = basaltic oceanic lid; `1` = mature cratonic continental crust.
- `thickness` (f32; `0..1`)
  - Meaning: normalized crustal thickness proxy, used for buoyancy and strength.
- `thermalAge` (u8; `0..255`)
  - Meaning: normalized thermal age since last “new basalt” reset (rift / seafloor creation / consumption reset).
- `damage` (u8; `0..255`)
  - Meaning: accumulated mechanical weakening from rifting/fracture/shear; decays deterministically (healing).

These variables are the only crust fields directly updated by events in the evolution loop.

## Published Derived Fields (mesh space)

The Foundation contract continues to publish (and consumers continue to read) the following, but they are derived:

- `type` (u8): `0=oceanic`, `1=continental` derived from `maturity` thresholding.
- `age` (u8): aliases `thermalAge` (normalized thermal age), not provenance age.
- `buoyancy` (f32; `0..1`): derived from (`maturity`, `thickness`, `thermalAge`).
- `baseElevation` (f32; `0..1`): derived isostatic proxy from `buoyancy` (and thickness).
- `strength` (f32; `0..1`): derived from (`maturity`, `thickness`, `thermalAge`, `damage`).

## Event Update Rule Hooks (mesh space)

The evolution engine updates crust truth via deterministic event hooks fed by:
- mantle forcing (`artifact:foundation.mantleForcing` per D02r), and
- boundary segments + regimes (`artifact:foundation.tectonicSegments`, `artifact:foundation.tectonicHistory` per D04r).

Required hooks (named for integration points, not implementation detail):
- `crust.onRift(spreadingRate, mask)` → reset to basaltic lid at spreading centers
- `crust.onSubductionOverriding(subductionRate, polarity, arcMask)` → increase maturity + thickness in volcanic arcs
- `crust.onSubductionConsumed(subductionRate, trenchMask)` → reset consumed material to basaltic lid
- `crust.onCollision(compressionRate, sutureMask)` → thicken + modestly mature collisional belts
- `crust.onTransform(shearRate, faultMask)` → increase damage along transforms
- `crust.onPlume(plumeIntensity, hotspotMask)` → add thickened basaltic plateaus with low maturity
- `crust.onHeal()` → deterministic damage decay each era

## Hard Invariants

- Ranges:
  - `maturity ∈ [0,1]`, `thickness ∈ [0,1]`
  - `thermalAge ∈ [0,255]`, `damage ∈ [0,255]`
- Monotonicity and resets:
  - `thermalAge` increments by a fixed per-era delta and clamps at `255`.
  - `thermalAge` resets to `0` in rift-created and consumed bands.
  - `maturity` increases only via `onSubductionOverriding` and `onCollision`, and decreases only via reset/consumption events.
- Derivation consistency:
  - `type` must equal continental iff `maturity >= MATURITY_CONTINENT_THRESHOLD`.
  - `strength` must be non-increasing in `damage` and non-decreasing in (`thermalAge`, `maturity`, `thickness`) over their valid ranges.

## Fixed Budgets (compute + memory)

- Crust truth is `O(C)` memory, where `C = cellCount`:
  - `maturity (f32)`, `thickness (f32)`, `thermalAge (u8)`, `damage (u8)`
- Per-era crust updates are bounded:
  - exactly one boundary-event pass per era (`O(S)` segments + fixed-radius neighborhood writes)
  - exactly one healing/relaxation pass per era (`O(C)`)

## Wow Scenario (must be enabled by this decision)

Across eras, a planet starts as a basaltic lid, then:
- subduction builds island arcs that mature into proto-continents,
- collisions weld arcs into cratonic cores and thickened belts,
- rifting splits mature continents and creates young ocean basins with clear age gradients,
- plume plateaus accrete as transitional “micro-continents”.

This scenario requires `maturity` and `thickness` as truth state, with deterministic resets and growth under events.

## Mapping To Current Contract / Code

Current contract anchor: `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (`artifact:foundation.crust`).

Today, `artifact:foundation.crust` exposes:
- `type: u8`, `age: u8`, `buoyancy: f32`, `baseElevation: f32`, `strength: f32`

D05r defines:
- `age` as thermal age (`thermalAge`) and makes it an explicit truth variable.
- `type/buoyancy/baseElevation/strength` as deterministic derivations from (`maturity`, `thickness`, `thermalAge`, `damage`).

## Acceptance criteria

- [ ] Evidence memo added at: `docs/projects/pipeline-realism/resources/research/d05r-crust-state-canonical-variables-evidence.md`
- [ ] SPEC section added at: `docs/projects/pipeline-realism/resources/spec/sections/crust-state.md`
