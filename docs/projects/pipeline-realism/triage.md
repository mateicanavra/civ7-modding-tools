# Triage — pipeline-realism

Unsequenced follow-ups and “we should do this later” work discovered while reconciling the proposal packets.

## Triage

- Follow-up (M1-002): Add an explicit placeholder/provenance-missing signal for `tectonicProvenanceTiles` until tracer lineage lands (avoid downstream misinterpretation).
- Follow-up (M1-001): Promote `artifact:foundation.tectonicHistory` (and `artifact:foundation.tectonicSegments` if canonical) to core tag constants to prevent stringly-typed drift in standard recipe contracts.
- Decision (M1-001): Use `artifact:foundation.plateMotion` as the canonical ID; `plateKinematics` remains a schema concept. New M1 artifacts carry `version: 1` while legacy artifacts stay unversioned until their owning issues update producers.
- Decision (M1-002): Projection accepts optional `tectonicProvenance` input; when absent, provenance tiles publish deterministic placeholder values (`originEra=0`, `originPlateId=cellToPlate`, `lastBoundaryEra=255`, `lastBoundaryType=255`, `driftDistance=0`). Revisit once PR-M1-013 lands.
- Decision (M1-003): Visualization keys for history/provenance align to the artifact catalog (`foundation.history.*`, `foundation.provenance.*`), and plate-motion keys use `foundation.plates.motion`. Mantle/plate-motion emissions are deferred until their producer ops land (PR-M1-007/008).

## Backlog

- (empty)
