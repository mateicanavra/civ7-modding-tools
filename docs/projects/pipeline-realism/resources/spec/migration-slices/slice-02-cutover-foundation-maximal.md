# Migration Slice: Cutover Foundation to Maximal Engine (Current → Target)

## Scope

- Decision packets:
  - [ ] `docs/projects/pipeline-realism/resources/decisions/d01-ordering-crust-vs-plates.md`
  - [ ] `docs/projects/pipeline-realism/resources/decisions/d02r-mantle-forcing-potential-derived.md`
  - [ ] `docs/projects/pipeline-realism/resources/decisions/d03r-plate-motion-derived-from-mantle.md`
  - [ ] `docs/projects/pipeline-realism/resources/decisions/d05r-crust-state-canonical-variables.md`
  - [ ] `docs/projects/pipeline-realism/resources/decisions/d06r-event-mechanics-and-force-emission.md`
  - [ ] `docs/projects/pipeline-realism/resources/decisions/d04r-history-dual-eulerian-plus-lagrangian.md`
  - [ ] `docs/projects/pipeline-realism/resources/decisions/d09r-validation-and-observability.md`
- SPEC sections:
  - `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md`
  - `docs/projects/pipeline-realism/resources/spec/sections/*` (mantle, motion, crust, events, history)

## Current divergence

- What exists today:
  - Foundation’s legacy path derives crust/plates/tectonics via current “plate mesh” and historical diffusion logic.
  - Plate motion is not strictly mantle-derived in maximal sense.
  - History/provenance may be limited or absent.
- Why it exists:
  - [ ] Compatibility requirement: downstream still consumes legacy tile drivers.
  - [ ] Partial refactor: maximal semantics exist as docs/spec but not as code.
  - [ ] Bridge construct: legacy projections and artifacts exist as the seam to downstream.

## Target change

- SPEC section: `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md`
- Target behavior:
  - Foundation runs the maximal evolutionary physics model:
    - basaltic lid start (explicit)
    - mantle forcing truth (potential + derived)
    - plate motion derived from mantle forcing (plate-like kinematics)
    - crust state is load-bearing and evolves under events
    - events are the cause layer; they emit era fields and update provenance
    - dual outputs are mandatory: Eulerian history + Lagrangian provenance
  - Legacy projections may remain temporarily, but must be explicit bridges with deletion targets.

## Phased plan

### Phase 1: Prepare (wire maximal internals without changing legacy outputs)

- Changes:
  - Introduce maximal internal steps producing the new truth artifacts (if not already from Slice 01):
    - mantle potential/forcing
    - plate motion
    - crust state (basaltic lid init)
    - segments + events
    - history + provenance
  - Produce maximal projections (history/provenance tiles) but do not require them downstream yet.
  - Keep legacy projection artifacts produced as compatibility outputs in this phase.
- Verification:
  - D09r Tier-1 gates pass for all new truth artifacts.
  - determinism smoke: stable fingerprints for the maximal truth artifacts across repeated runs.
  - “wow scenario” smoke runs demonstrate coherent belts and plausible plate-like structures in viz layers.
- Rollback:
  - disable maximal step chain and revert to legacy steps; keep Slice 01 artifacts if necessary.

### Phase 2: Cutover (Foundation derives legacy-facing drivers from maximal truth)

- Changes:
  - Make maximal truth chain the source of truth.
  - Derive any still-required legacy-facing artifacts from maximal truth (explicit bridges):
    - e.g., newest-era rollups → legacy tectonics fields
    - per-plate kinematics → legacy plate movement projections
  - Remove any remaining legacy random/intent sources for plate motion.
- Verification:
  - Correlation checks (strict diagnostics):
    - mantle forcing divergence/convergence correlates with rift/subduction potentials
    - plate motion residuals within bounds
  - Visual “spine” renders coherently: mantle → plates → events → belts.
- Rollback:
  - revert the bridge derivations to legacy sources (temporary; should only be used if maximal chain is broken).

### Phase 3: Cleanup (remove legacy Foundation semantics)

- Deletion targets:
  - [ ] Remove legacy plate-motion generation logic (non-mantle-derived).
  - [ ] Remove legacy history diffusion implementation once D06r event engine is authoritative.
  - [ ] Remove any dual-engine shadow compute paths (keep metrics-only if required briefly, but set deletion trigger).
- Verification:
  - D09r gates pass.
  - no code path still publishes legacy “truth” that contradicts maximal truth.
- Rollback:
  - N/A for deletions (must be reintroduced intentionally if needed).

## Risks and quality gates

| Risk | Likelihood | Mitigation | Gate |
|------|------------|------------|------|
| Foundation becomes “maximal in name only” (still legacy semantics) | M | force all legacy outputs to be derived from maximal truth | code-level audit: legacy outputs have `derivedFrom` comments + tests |
| Plate motion decouples from mantle forcing | M | enforce coupling invariants + residual bounds | strict diagnostics promoted to CI gates |
| Events emit belts but do not change material (fake tectonics) | M | D06r requires crust/provenance updates per event | invariants: sees continent emergence by state transitions |

## Tracking

- Deferrals/issues:
  - none; this is the core cutover.
- Tracking gaps (if any):
  - define the canonical seed/config suite for strict validation and keep it stable.

