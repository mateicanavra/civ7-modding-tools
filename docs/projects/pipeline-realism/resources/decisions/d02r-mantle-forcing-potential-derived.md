# Decision Packet: Define Mantle Forcing as Potential + Derived Stress/Velocity (D02r)

## Question

Do we require a **first-class mantle forcing potential** in mesh space and treat stress proxy + forcing velocity as deterministic derivatives (not optional), making mantle forcing the canonical upstream driver for regimes and kinematics?

## Context (pointers only)

- Docs:
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (Truth vs projection; current artifact surfaces for crust strength/tectonics/plates)
- `docs/projects/pipeline-realism/resources/packets/realism-packet/analysis.md` (mantle driver motivation; explicit mantle/lid posture)
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/foundation-refactor-proposal.md` (stress vs strength regime selection)
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/foundation-domain-improvements.md` (mantle-inspired velocity field concept)
- `docs/projects/engine-refactor-v1/resources/spike/spike-foundation-realism-gaps.md` (basin-weighted driver as low-order mantle proxy)
- `docs/projects/pipeline-realism/resources/decisions/d02-forcing-mantle-minimum.md` (superseded baseline)

## Why this is ambiguous

- Prior D02 allowed a mantle-lite proxy or intent-only kinematics, leaving mantle forcing optional.
- Multiple sources mention mantle drivers, but none commit to a canonical truth artifact with deterministic derivations.
- The Foundation contract today has no mantle driver artifact; this is a strict posture change.

## Why it matters

- Blocks/unblocks:
- Unblocks D03/D04 by establishing a mandatory upstream forcing substrate for kinematics, regimes, and tectonic history.
- Downstream contracts affected:
- `artifact:foundation.crust` (strength proxy used in coupling)
- `artifact:foundation.plateGraph` (plate kinematics derived from mantle forcing velocity)
- `artifact:foundation.tectonics` + `artifact:foundation.tectonicHistory` (regime + stress/volcanism fields derived from forcing)
- `artifact:foundation.plates` projection (tile consumers interpret mantle-derived drivers)

## Simplest greenfield answer

Adopt a **mesh-space mantle forcing potential** as canonical truth, with deterministic derivations for stress proxy, forcing velocity, and upwelling/downwelling classification; all downstream regime/kinematic decisions must be grounded in these fields.

## Why we might not yet simplify

- Adds new truth artifacts and derivation steps before implementation exists.
- Requires careful invariants to avoid turning mantle forcing into disguised noise.

## Options

1) **Option A: Mantle forcing potential (first-class truth) + derived stress/velocity**
   - Description:
   - Introduce mesh-space mantle potential as canonical truth; derive stress proxy, forcing velocity field, and upwelling/downwelling classification deterministically from the potential; couple to lithosphere strength to decide rifts/subduction/hotspots.
   - Pros:
   - Physics-first posture with a single authoritative driver.
   - Deterministic, low-order structure compatible with mesh-first contract.
   - Cons:
   - Requires new artifact schemas and stricter invariants.

2) **Option B: Intent/kinematics only**
   - Description:
   - Keep mantle forcing implicit; derive velocity from author intent + coherence.
   - Pros:
   - Lower implementation cost.
   - Cons:
   - Breaks physics-first claim; no mantle truth artifact.

## Proposed default

- Recommended: **Option A**
- Rationale:
- D02r is a maximal forcing decision: mantle potential is the first-class upstream substrate, not an optional or secondary signal.
- Low-order mantle structure (cell/plume/downwelling fields) provides deterministic realism without filtered noise.
- Enables strict invariants and coherent coupling rules for regimes and kinematics.

## Acceptance criteria

- [ ] SPEC updated at: `docs/projects/pipeline-realism/resources/spec/sections/mantle-forcing.md`
- [ ] Migration slice created/updated at: `docs/projects/pipeline-realism/resources/spec/migration-slices/foundation-mantle-forcing.md`
- [ ] Follow-ups tracked: add D02r outcome to `docs/projects/pipeline-realism/resources/decisions/README.md` or Linear (if required)
