# Triage — pipeline-realism

Unsequenced follow-ups and “we should do this later” work discovered while reconciling the proposal packets.

## Triage

- Follow-up (M1-006): Event mechanics should consume `crust.strength` (no duplicated resistance computation) once M1-011 lands; currently strength feeds partitioning only.
- Follow-up (M1-005): Foundation `advanced` (mantleForcing/lithosphere) is validated but not yet wired into step configs; ensure upcoming Foundation ops consume these inputs so the authoring surface is not inert.
- Follow-up (M1-004): Expand fingerprint normalization to cover ArrayBuffer/Map/Set if future artifacts use them, to avoid silent data loss in determinism fingerprints.
- Follow-up (M1-002): Add an explicit placeholder/provenance-missing signal for `tectonicProvenanceTiles` until tracer lineage lands (avoid downstream misinterpretation).
- Follow-up (M1-001): Promote `artifact:foundation.tectonicHistory` (and `artifact:foundation.tectonicSegments` if canonical) to core tag constants to prevent stringly-typed drift in standard recipe contracts.
- Decision (M1-001): Use `artifact:foundation.plateMotion` as the canonical ID; `plateKinematics` remains a schema concept. New M1 artifacts carry `version: 1` while legacy artifacts stay unversioned until their owning issues update producers.
- Decision (M1-002): Projection accepts optional `tectonicProvenance` input; when absent, provenance tiles publish deterministic placeholder values (`originEra=0`, `originPlateId=cellToPlate`, `lastBoundaryEra=255`, `lastBoundaryType=255`, `driftDistance=0`). Revisit once PR-M1-013 lands.
- Decision (M1-003): Visualization keys for history/provenance align to the artifact catalog (`foundation.history.*`, `foundation.provenance.*`), and plate-motion keys use `foundation.plates.motion`. Mantle/plate-motion emissions are deferred until their producer ops land (PR-M1-007/008).
- Decision (M1-004): Validation harness lives in `mods/mod-swooper-maps/test/support/validation-harness.ts`; missing artifacts are reported as `status: missing` until producers land; Tier-1 fingerprint list mirrors milestone acceptance artifacts.
- Decision (M1-005): Foundation authoring surface follows D08r (`version` + `profiles` + numeric `knobs` + optional mantle/lithosphere `advanced`); per-step `foundation.advanced.*` overrides are removed. Resolution profiles map to shipped baselines (`coarse`=desert-mountains, `balanced`=earthlike, `fine`=shattered-ring, `ultra`=sundered-archipelago). `plateActivity` scales projection via piecewise linear mapping (0→0.8/-1, 0.5→1/0, 1→1.2/+2).
- Decision (M1-006): Basaltic lid baseline ships as canonical crust truth (`maturity/thickness/thermalAge/damage`) with derived `type/age/buoyancy/baseElevation/strength`. Default lithosphere scalars: `basalticThickness01=0.25`, `yieldStrength01=0.55`, `mantleCoupling01=0.6`, `riftWeakening01=0.35`. Plate partition resistance now derives from `crust.strength` via `1 + 4*strength` (no duplicate resistance computation).

## Backlog

- (empty)
