# Migration Slice: Prepare New Artifacts + Viz Spine (Current → Target)

## Scope

- Decision packets:
  - [ ] `docs/projects/pipeline-realism/resources/decisions/d02r-mantle-forcing-potential-derived.md`
  - [ ] `docs/projects/pipeline-realism/resources/decisions/d04r-history-dual-eulerian-plus-lagrangian.md`
  - [ ] `docs/projects/pipeline-realism/resources/decisions/d09r-validation-and-observability.md`
- SPEC sections:
  - `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md` (Truth artifacts + budgets)
  - `docs/projects/pipeline-realism/resources/spec/sections/visualization-and-tuning.md`

## Current divergence

- What exists today:
  - Foundation produces legacy plate/crust projections and a limited “history” surface.
  - Visualization exists as an external observer (trace → `VizDumper` → Studio/dumps).
  - Validation exists but does not yet enforce maximal era/provenance budgets and agreements.
- Why it exists:
  - [ ] Compatibility requirement: current Morphology consumes legacy Foundation tile drivers.
  - [ ] Partial refactor: maximal mantle forcing + provenance outputs exist only as docs/spec right now.
  - [ ] Bridge construct: old “eraCount === 3” and other legacy assumptions may exist in current validation.

## Target change

- SPEC section: `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md`
- Target behavior:
  - new maximal truth artifacts are published (mantle potential/forcing; dual history/provenance),
  - projections exist for Studio inspection,
  - validation asserts contract correctness and budget invariants,
  - no downstream behavior change yet (Morphology not cut over in this slice).

## Phased plan

### Phase 1: Prepare

- Changes:
  - Add `artifact:foundation.mantlePotential` (truth; mesh).
  - Add `artifact:foundation.mantleForcing` (truth; mesh).
  - Add viz emission for mantle potential/forcing in mesh + tile projection form using stable `dataTypeKey`s.
  - Add/extend validation to enforce:
    - array length/index bounds
    - finite values
    - bounded domains per units contract
  - Add/extend projection plumbing needed for tile views (if not already present).
- Verification:
  - D09r Tier-1 gates pass on the standard recipe suite.
  - determinism smoke: same seed+config → stable artifact fingerprints for mantle outputs.
  - Studio renders mantle layers in both mesh and tile spaces with correct orientation.
- Rollback:
  - remove new artifacts and their validators; no consumer should depend on them in this phase.

### Phase 2: Prepare (Dual history/provenance outputs without downstream cutover)

- Changes:
  - Add/extend `artifact:foundation.tectonicHistory` to the D04r contract (eraCount budget + per-era fields).
  - Add `artifact:foundation.tectonicProvenance` (mandatory tracerIndex history + scalars).
  - Add projections:
    - `artifact:foundation.tectonicHistoryTiles`
    - `artifact:foundation.tectonicProvenanceTiles`
  - Replace any legacy “eraCount === 3” validation with D04r/D09r invariants.
  - Emit per-era viz layers using `variantKey=era:<n>`.
- Verification:
  - D09r Tier-1 gates pass: history/provenance agree on `eraCount`, tracer indices in-range.
  - performance budget checks: memory surfaces stay within target bounds for max map sizes.
  - Studio era scrubber can render per-era layers.
- Rollback:
  - remove new history/provenance artifacts and projections; keep legacy behavior.

### Phase 3: Cleanup (slice-local)

- Deletion targets:
  - [ ] Delete the legacy `eraCount === 3` hard assumption wherever it exists (validation/consumers).
  - [ ] Delete any “optional publish” gating for mantle forcing once the next slice consumes it (do not let it linger).
- Verification:
  - compile-time: no code path still assumes `eraCount === 3`.
- Rollback:
  - N/A for deletion targets (must be reintroduced intentionally if needed).

## Risks and quality gates

| Risk | Likelihood | Mitigation | Gate |
|------|------------|------------|------|
| Mantle forcing becomes a display-only field (ignored by engine) | M | ensure Slice 2 consumes mantle forcing for motion/partition | D03r/D01 consumption exists and validators confirm coupling |
| Memory blow-up from `eraCount * cellCount` arrays | M | enforce D04r budgets and typed-array-only storage | budget gate in D09r passes at max dimensions |
| Visualization keys drift / become ad-hoc | M | standardize keys in the project viz section and reference canonical viz doc | Studio renders stable layer identities across runs |

## Tracking

- Deferrals/issues:
  - none (this slice is required pre-cutover)
- Tracking gaps (if any):
  - create issues for any calibrated thresholds that must move from diagnostics → gates

