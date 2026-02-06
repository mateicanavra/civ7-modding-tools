---
milestone: M1-foundation-maximal-cutover
id: M1-foundation-maximal-cutover-review
status: draft
reviewer: AI agent
---

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-001-publish-foundation-truth-artifacts

### Quick Take
- Core artifact contracts and docs landed with versioned schemas for the new maximal outputs; tests cover the new IDs and “provides” enforcement.
- One acceptance mismatch remains: `artifact:foundation.tectonicHistory` is defined as a string constant in the recipe instead of an importable core tag, which violates the “no string retyping” requirement and risks drift.

### High-Leverage Issues
- `artifact:foundation.tectonicHistory` (and `artifact:foundation.tectonicSegments`) are string literals in `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` rather than exported constants in `packages/mapgen-core/src/core/types.ts`, contradicting the acceptance criteria and artifact catalog’s canonical contract surface.

### PR Comment Context
- No reviewer comments; Graphite stack/CI notes only.

### Fix Now (Recommended)
- Add `FOUNDATION_TECTONIC_HISTORY_ARTIFACT_TAG` (and `FOUNDATION_TECTONIC_SEGMENTS_ARTIFACT_TAG` if it is canonical) to `packages/mapgen-core/src/core/types.ts`, then import and use them in `foundation/artifacts.ts`.
- Extend the contract guard test to assert `foundationArtifacts.tectonicHistory.id` (and `tectonicSegments` if canonical) uses the core constants.

### Defer / Follow-up
- Decide whether `artifact:foundation.plateTopology` is a public artifact; either add it to the artifact catalog or remove it from the standard recipe contracts to avoid silent drift.

### Needs Discussion
- Confirm that `artifact:foundation.tectonicHistory` is intended to be a canonical “truth” artifact for M1 (milestone acceptance lists it, but this issue’s deliverables did not).

### Cross-cutting Risks
- Stringly‑typed truth artifact IDs in the causal spine can silently diverge from the catalog and break Studio/pipeline consumers.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-002-project-tectonic-history-provenance-tiles

### Quick Take
- History/provenance tile projections are wired through the Foundation projection op and step, using a single `tileToCellIndex` mapping and deterministic placeholders when provenance is missing.
- Validation and tests cover the new projection artifacts and “provides means published” contract, aligning with the physics-first, derived‑from‑truth objective.

### High-Leverage Issues
- None observed; projections are derived from a single mapping and validated for shape/determinism.

### PR Comment Context
- No actionable review comments; Graphite stack notices only.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- Consider an explicit “provenance missing” flag or metadata on `tectonicProvenanceTiles` so downstream consumers don’t treat placeholder values as real lineage data before `LOCAL-TBD-PR-M1-013` lands.

### Needs Discussion
- Whether placeholder provenance tiles should be surfaced to Studio/tuning overlays as “synthetic” to avoid misinterpretation during iteration.

### Cross-cutting Risks
- Placeholder provenance may be misinterpreted by downstream gates/visuals if not clearly labeled until the tracer system is in place.

