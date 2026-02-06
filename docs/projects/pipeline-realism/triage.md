# Triage — pipeline-realism

Unsequenced follow-ups and “we should do this later” work discovered while reconciling the proposal packets.

## Triage
- Follow-up (M1-011): Event engine updates provenance but does not mutate `foundation.crust`; decide on a crust-mutation artifact or allow event-driven crust updates to satisfy the “material change” requirement.

- Follow-up (M1-009): Add explicit contiguity/sliver guardrails for non-polar plates (or document the intentional waiver) so partition policy is enforceable beyond polar microplates.
- Follow-up (M1-009): `computeCrust` now uses `riftWeakening01` for pre-plate damage and ignores `rngSeed`; update schema docs or split parameters to avoid semantic drift and unused inputs.
- Follow-up (M1-010): Add a divergent-motion test for resistance scaling (current test only exercises compressive cases, leaving extension scaling unverified).

- Follow-up (M1-007): `potentialAmplitude01` is effectively canceled by post-generation normalization of mantle potential; decide whether to expose amplitude via forcing scale or remove/repurpose the knob to avoid inert authoring inputs.
- Follow-up (M1-008): Deprecate/remove `velocityX/velocityY/rotation` from `foundationArtifacts.plateGraph` (or assert they remain zero) now that `plateMotion` is canonical; avoid hidden kinematics reappearing downstream.
- Follow-up (M1-006): Event mechanics should consume `crust.strength` (no duplicated resistance computation) once M1-011 lands; currently strength feeds partitioning only.
- Follow-up (M1-012): Enforce 5..8 era bounds in `tectonicHistoryTiles` validation and regenerate shipped preset configs so runtime artifacts match the bounded era loop.
- Follow-up (M1-005): Foundation `advanced` (mantleForcing/lithosphere) is validated but not yet wired into step configs; ensure upcoming Foundation ops consume these inputs so the authoring surface is not inert.
- Follow-up (M1-004): Expand fingerprint normalization to cover ArrayBuffer/Map/Set if future artifacts use them, to avoid silent data loss in determinism fingerprints.
- Follow-up (M1-002): Add an explicit placeholder/provenance-missing signal for `tectonicProvenanceTiles` until tracer lineage lands (avoid downstream misinterpretation).
- Follow-up (M1-001): Promote `artifact:foundation.tectonicHistory` (and `artifact:foundation.tectonicSegments` if canonical) to core tag constants to prevent stringly-typed drift in standard recipe contracts.
- Follow-up (M1-013): Guard/document `ADVECTION_STEPS_PER_ERA` budget and clarify whether non-rift events should update lineage scalars beyond boundary metadata.
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

## Backlog

- (empty)
