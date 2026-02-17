# Triage — pipeline-realism

Unsequenced follow-ups and “we should do this later” work discovered while reconciling the proposal packets.

## Triage
- Follow-up (M4-fix-loop): Decide legacy biome knob compatibility policy for post-classifier posture (`codex/MAMBO-m3-012-fix-biomes-stripes`): explicit shim, explicit compile error, or contract removal; align docs + migration guidance.
- Follow-up (M4-fix-loop): Decide permanent policy for `maxUpstreamSteps > 0` after deterministic lakes cutover (`codex/prr-epp-s6-hardening-docs-tests`): keep disallowed, or support with enforced hop-invariant/property tests and guardrails.
- Follow-up (M4-review): Decouple runtime feature placement/stamping from Studio-viz key/category completeness so missing viz metadata never aborts valid gameplay/runtime outcomes.
- Follow-up (M4-review): Resolve score-layer occupancy baseline conflicts with feature-specific eligibility (notably deep-ocean ice) and add explicit invariant tests for occupancy-vs-score coherence.
- Follow-up (M4-review): Re-tighten schema strictness for ecology/placement contracts (unknown-key rejection) and add coverage for legacy/retired knob drift.
- Follow-up (M4-review): Standardize deterministic seed signedness across planner contracts and validators to avoid rejecting valid derived seeds.
- Follow-up (M4-review): Add CI guardrails for Bun test API compatibility (timeout/signature patterns) so framework drift cannot silently disable milestone smoke gates.
- Follow-up (M4-review-loop): Stabilize full-profile domain guardrails (hydrology step-id config posture and ecology module-shape/JSDoc baseline debt) so second-leg review failures are branch-local and actionable.
- Follow-up (M4-review-loop): Decide whether to narrow the informational `TODO|legacy|shim|dual|shadow` scan to exclude archival trees (for reviewer signal), while keeping the denylist-based no-legacy scan as the required enforcement gate.

- Follow-up (M1-011): Event engine updates provenance but does not mutate `foundation.crust`; decide on a crust-mutation artifact or allow event-driven crust updates to satisfy the “material change” requirement.

- Follow-up (M1-009): Add explicit contiguity/sliver guardrails for non-polar plates (or document the intentional waiver) so partition policy is enforceable beyond polar microplates.
- Follow-up (M1-009): `computeCrust` now uses `riftWeakening01` for pre-plate damage and ignores `rngSeed`; update schema docs or split parameters to avoid semantic drift and unused inputs.
- Follow-up (M1-010): Add a divergent-motion test for resistance scaling (current test only exercises compressive cases, leaving extension scaling unverified).

- Follow-up (M1-007): `potentialAmplitude01` is effectively canceled by post-generation normalization of mantle potential; decide whether to expose amplitude via forcing scale or remove/repurpose the knob to avoid inert authoring inputs.
- Follow-up (M1-008): Deprecate/remove `velocityX/velocityY/rotation` from `foundationArtifacts.plateGraph` (or assert they remain zero) now that `plateMotion` is canonical; avoid hidden kinematics reappearing downstream.
- Follow-up (M1-018): Add non-finite checks for plate-fit residual arrays and a wrap-seam continuity check for mantle potential/forcing; calibrate plate-motion diagnostics so they don’t warn on every canonical case.
- Follow-up (M1-019): Add a crust-change invariant tied to event corridors and validate belt continuity against actual Morphology outputs (not just derived drivers).
- Follow-up (M1-020): Add output-level distribution gates against actual `plotMountains` mask and ensure correlation gates use runtime morphology config (not just defaults).
- Follow-up (M1-021): Move causal shortcut definitions into recipe UI meta (avoid hardcoded dataTypeKeys in Studio) and consider a generic stage-authoring panel registry.
- Follow-up (M1-022): Snap manual era selection to available `variantKey` eras (not just min/max) and normalize overlay era preferences to the actual variant keys to avoid UI/overlay mismatches.
- Follow-up (M1-022): Move overlay suggestion mappings into recipe UI metadata or shared config to keep Studio agnostic of pipeline-specific keys.
- Follow-up (M1-024): Enumerate and justify remaining `foundationArtifacts.plates` consumers in morphology (coasts/islands/volcanoes/ruggedCoasts), or migrate them to history/provenance-driven inputs.
- Follow-up (M1-025): Delete remaining shadow/dual compute paths and comparison-only viz layers, and add an explicit “no dual-engine” guard once the gate suite is green.
- Follow-up (M1-006): Event mechanics should consume `crust.strength` (no duplicated resistance computation) once M1-011 lands; currently strength feeds partitioning only.
- Follow-up (M1-012): Enforce 5..8 era bounds in `tectonicHistoryTiles` validation and regenerate shipped preset configs so runtime artifacts match the bounded era loop.
- Follow-up (M1-005): Foundation `advanced` (mantleForcing/lithosphere) is validated but not yet wired into step configs; ensure upcoming Foundation ops consume these inputs so the authoring surface is not inert.
- Follow-up (M1-004): Expand fingerprint normalization to cover ArrayBuffer/Map/Set if future artifacts use them, to avoid silent data loss in determinism fingerprints.
- Follow-up (M1-002): Add an explicit placeholder/provenance-missing signal for `tectonicProvenanceTiles` until tracer lineage lands (avoid downstream misinterpretation).
- Follow-up (M1-001): Promote `artifact:foundation.tectonicHistory` (and `artifact:foundation.tectonicSegments` if canonical) to core tag constants to prevent stringly-typed drift in standard recipe contracts.
- Follow-up (M1-013): Guard/document `ADVECTION_STEPS_PER_ERA` budget and clarify whether non-rift events should update lineage scalars beyond boundary metadata.
- Follow-up (M1-014): Decide whether dual-read should permit legacy-only runs; if so, make history/provenance tile requirements optional or provide placeholders and isolate diagnostics for easy removal.
- Follow-up (M1-015): Remove legacy `foundationArtifacts.plates` requirement from `plotMountains` once history/provenance-driven belts are authoritative; align belt tests to 5-era budgets.
- Follow-up (M1-016): Schedule migration for remaining plate-driven morphology steps (coasts/islands/volcanoes) to avoid mixed driver semantics after belt cutover.
- Decision (M1-001): Use `artifact:foundation.plateMotion` as the canonical ID; `plateKinematics` remains a schema concept. New M1 artifacts carry `version: 1` while legacy artifacts stay unversioned until their owning issues update producers.
- Decision (M1-002): Projection accepts optional `tectonicProvenance` input; when absent, provenance tiles publish deterministic placeholder values (`originEra=0`, `originPlateId=cellToPlate`, `lastBoundaryEra=255`, `lastBoundaryType=255`, `driftDistance=0`). Revisit once PR-M1-013 lands.
- Decision (M1-003): Visualization keys for history/provenance align to the artifact catalog (`foundation.history.*`, `foundation.provenance.*`), and plate-motion keys use `foundation.plates.motion`. Mantle/plate-motion emissions are deferred until their producer ops land (PR-M1-007/008).
- Decision (M1-004): Validation harness lives in `mods/mod-swooper-maps/test/support/validation-harness.ts`; missing artifacts are reported as `status: missing` until producers land; Tier-1 fingerprint list mirrors milestone acceptance artifacts.
- Decision (M1-005): Foundation authoring surface follows D08r (`version` + `profiles` + numeric `knobs` + optional mantle/lithosphere `advanced`); per-step `foundation.advanced.*` overrides are removed. Resolution profiles map to shipped baselines (`coarse`=desert-mountains, `balanced`=earthlike, `fine`=shattered-ring, `ultra`=sundered-archipelago). `plateActivity` scales projection via piecewise linear mapping (0→0.8/-1, 0.5→1/0, 1→1.2/+2).
- Decision (M1-006): Basaltic lid baseline ships as canonical crust truth (`maturity/thickness/thermalAge/damage`) with derived `type/age/buoyancy/baseElevation/strength`. Default lithosphere scalars: `basalticThickness01=0.25`, `yieldStrength01=0.55`, `mantleCoupling01=0.6`, `riftWeakening01=0.35`. Plate partition resistance now derives from `crust.strength` via `1 + 4*strength` (no duplicate resistance computation).
- Decision (M1-007): `compute-tectonic-segments` default `intensityScale` raised to `900` (and stage config aligned) to preserve uplift/stress magnitudes under mantle-derived plate motion.
- Decision (M1-008): Morphology sea-level tuning: `water-heavy` knob delta increased to `+15`; `realismEarthlikeConfig` uses `seaLevel: "water-heavy"` and `shelfWidth: "narrow"` to keep deep-ocean share stable post-cutover.
- Decision (M1-009): Pre-plate weak zones are mantle-coupled: `compute-crust` consumes `mantleForcing` and seeds `damage` from positive divergence weighted by stress/forcing magnitude (`riftWeakening01` scaled), producing resistance variation before plate partition.
- Decision (M1-010): Tectonic segment intensities scale with lithosphere resistance: compression is boosted for stronger crust, while extension/shear are boosted for weaker crust, keeping regimes resistance-aware without shifting baseline intensity budgets.
- Decision (M1-011): Event mechanics are integrated into `compute-tectonic-history` (segments + mantle upwelling as events) with fixed D06r emission radii/decays and deterministic tie-breaks; `foundation.tectonicProvenance` is now emitted with identity tracerIndex per era until PR-M1-013 adds advection; lineage resets use D06r thresholds and overriding-plate attribution for subduction arcs.
- Decision (M1-012): D04r era loop is bounded to a target of 5 eras (max 8) with fixed per-era budgets; config arrays must match `eraCount` and defaults are set to 5-era weights/steps. Validation now enforces `5..8` era counts (no legacy 3-era acceptance).
- Decision (M1-013): D04r provenance now advects with fixed `ADVECTION_STEPS_PER_ERA=6`, using boundary-event drift with mantle drift fallback; provenance scalars are propagated per era before event resets. Provenance/history era counts are enforced to `5..8` in require/validation to prevent legacy posture.
- Decision (M1-014): Morphology dual-read diagnostics live in `landmass-plates`, comparing legacy plates to newest-era history/provenance tiles. New `morphology.dualRead.*` layers + `morphology.dualRead.summary` trace event provide quantitative deltas while leaving legacy drivers authoritative until PR-M1-016.
- Decision (M1-015): Belt synthesis now seeds from `tectonicHistoryTiles`/`tectonicProvenanceTiles` boundary regimes (no dedicated segment→tile projection yet). Belts use seed-based isotropic diffusion with age/recency width scaling, and propagate driver magnitudes from nearest belt seed to keep orogeny causal. Upgrade path: introduce tangent-aware diffusion once belt orientation fields exist.
- Decision (M1-016): Plot-mountains contract drops `foundation.plates` and requires history/provenance tiles only; other morphology steps (coasts/features) still use plate tensors until explicit migration work lands.
- Decision (M1-017): Determinism suite uses three canonical cases (baseline, wrap-active, compact-low-plates) with fixed plateCount/plateActivity knobs; float policy is bit-identical hashing (no quantization unless later explicitly scoped).
- Decision (M1-018): Foundation physics invariants are implemented in `test/support/foundation-invariants.ts` with hard gates on mantle potential range/std, mantle forcing bounds/non-degeneracy, and plate-motion coupling residuals; diagnostic-only plate-fit stats warn on quality drift without gating.
- Decision (M1-019): Event/provenance causality and belt continuity are gated via tile-space history/provenance signals (event threshold 20, ≥60% corridor boundary coverage, ≥75% origin resets aligned to events, belt component size/neighbor density floors) using `deriveBeltDriversFromHistory`.
- Decision (M1-020): Morphology correlation gate replays `planRidgesAndFoothills` with plotMountains-equivalent fractal seeds and enforces driver/mountain alignment thresholds (signal ≥30, strong ≥80, ≥35% strong-driver coverage, ≥60% mountains on-driver).
- Decision (M1-024): Remove morphology dual-read diagnostics from `landmass-plates` once belt consumption is history/provenance-only; keep `landmassPlates` plate usage limited to base topography/substrate (non-belt).
- Decision (M1-025): Projection requires mesh-level `foundation.tectonicProvenance` once D04r provenance is live; optional fallback is removed to prevent shadow paths.

## Backlog

- (empty)
