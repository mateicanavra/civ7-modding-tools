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

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-003-wire-viz-datatypekeys-causal-spine

### Quick Take
- DataTypeKeys were normalized to the `foundation.history.*` / `foundation.provenance.*` taxonomy with `variantKey` used for eras, and viz emission tests now enforce the no‑era‑in‑key rule.
- Debug/refined visibility is wired consistently via `defineVizMeta`, keeping the causal spine discoverable without flooding default layers.

### High-Leverage Issues
- None observed; keys, space IDs, and variant usage align with the taxonomy + regression tests.

### PR Comment Context
- No actionable review comments; Graphite stack notices only.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- Ensure downstream Morphology issues reserve and emit the planned `morphology.drivers.*` keys so the taxonomy stays consistent end‑to‑end.

### Needs Discussion
- Confirm the shared `foundation.history.*` keys across mesh‑space and tile‑space are intended to be disambiguated solely by `spaceId` in Studio grouping (current contract assumes this).

### Cross-cutting Risks
- If Studio ever stops grouping by `spaceId`, mesh/tile history layers will collide under the same `dataTypeKey`.


## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-004-validation-harness-scaffolding

### Quick Take
- Shared validation harness utilities landed in `mods/mod-swooper-maps/test/support`, with stable fingerprinting for typed arrays and a reusable invariant runner.
- The harness smoke test verifies determinism and failure reporting, giving M1 a single, obvious entry point for future invariants.

### High-Leverage Issues
- None observed; the harness is reusable, deterministic, and scoped to the test support layer as intended.

### PR Comment Context
- No actionable review comments; Graphite stack/preview notices only.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- Expand `normalizeForFingerprint` to handle `ArrayBuffer`, `Map`, and `Set` explicitly if those appear in downstream artifacts to avoid silent hash collisions or missing data in fingerprints.

### Needs Discussion
- Confirm whether the M1 validation seeds/dimensions should be centralized in a shared “suite config” doc/source (for reuse by non-test tooling) or remain test-only constants.

### Cross-cutting Risks
- If future artifacts include non-plain objects (e.g., `Map`, `ArrayBuffer`), fingerprints may under-represent data until normalization is extended.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-005-compile-config-surface

### Quick Take
- D08r Foundation authoring is now an explicit TypeBox schema (`foundation.version`, `profiles`, `knobs`, optional `advanced`) with strict compile-time validation and determinism tests.
- Presets/configs were migrated to the new profile + knob surface, and plate activity scaling is wired into projection kinematics with clear, test‑backed semantics.

### High-Leverage Issues
- None observed; schema and tests align with the “no kinematics hacks” posture and compile strictness goals.

### PR Comment Context
- No actionable review comments; Graphite stack + Railway preview notices only.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- `foundation.advanced` (mantleForcing/lithosphere) is validated but not yet consumed in step configs; ensure the upcoming mantle/lithosphere ops plumb these inputs so the authoring surface is not inert.

### Needs Discussion
- Whether the D08r profile defaults (coarse/balanced/fine/ultra) should be centralized in a single “authoring defaults” reference to avoid drift between recipe defaults, presets, and Studio defaults.

### Cross-cutting Risks
- If advanced mantle/lithosphere inputs remain unused past M1, authors may believe they are driving physics inputs when they are effectively ignored.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-006-basaltic-lid-init-lithosphere-strength-mantle-coupled

### Quick Take
- Crust initialization now starts as a uniform basaltic lid (no pre-authored continents) and emits the full truth set (`maturity`, `thickness`, `thermalAge`, `damage`, `strength`).
- Plate partitioning now consumes `crust.strength`, and tests + specs were updated to validate the basaltic‑lid baseline and downstream morphology expectations.

### High-Leverage Issues
- None observed in the baseline crust initialization; determinism and bounds checks are covered by new/updated tests.

### PR Comment Context
- No actionable review comments; Graphite stack + Railway preview notices only.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- Event mechanics still need to consume `crust.strength` (and avoid recomputing resistance) once the D06r event engine lands; otherwise the new strength surface is only partially authoritative.

### Needs Discussion
- Confirm whether `crust.type` should remain derived purely from `maturity` (threshold = 0.55) or if future event-driven transitions should explicitly set type to avoid drift with evolving maturity semantics.

### Cross-cutting Risks
- If event mechanics do not adopt `crust.strength`, the new lithosphere resistance field will be underutilized and semantics may diverge across domains.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-013-provenance-tracer-system-lineage-scalars-d04r-lagrangian-outputs

### Quick Take
- Provenance is now emitted as a D04r Lagrangian output with per-era tracer advection (fixed steps) and event-driven resets; era bounds are enforced in `require` + validation (5..8).
- Tests assert determinism, bounded tracer indices, and causal updates in event corridors; tile projection fixtures now reflect 5-era inputs.

### High-Leverage Issues
- None observed; provenance now satisfies causal + boundedness requirements and is consumed downstream.

### PR Comment Context
- No reviewer comments; Graphite stack/preview notices only.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- Document `ADVECTION_STEPS_PER_ERA` in budgets/specs or add a test guard so the provenance budget can’t drift silently.
- Clarify whether collision/transform events should update lineage scalars beyond boundary metadata, and document the rationale if they should not.

### Needs Discussion
- Whether provenance advection should remain embedded in `compute-tectonic-history` or move to a dedicated op for clearer separation of concerns.

### Cross-cutting Risks
- If advection budgets change without aligned tests/docs, provenance lineage stability could drift across releases.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-014-morphology-dual-read-history-provenance-diagnostics

### Quick Take
- Morphology’s landmass step now dual-reads history/provenance tiles to emit comparison diagnostics while keeping legacy plates as authoritative inputs, aligning with the transitional cutover plan.
- Diagnostics include deltas and a quantitative summary, and tests lock the new viz keys and summary event.

### High-Leverage Issues
- The step contract now **requires** `tectonicHistoryTiles` + `tectonicProvenanceTiles`, so “legacy‑only” runs without new drivers cannot compile. This conflicts with the acceptance criterion that legacy-only mode remains runnable during the transition.

### PR Comment Context
- No reviewer comments; Graphite/preview notices only.

### Fix Now (Recommended)
- Make the new tile drivers optional in the contract (or supply deterministic placeholders) and guard diagnostics so baseline legacy-only runs are still possible during the dual-read window.

### Defer / Follow-up
- Consider moving dual-read diagnostics into a dedicated diagnostic step to keep landmass computations focused and to make removal in PR‑M1‑024/025 simpler.

### Needs Discussion
- Whether the milestone intent is “legacy outputs with new diagnostics” (current behavior) or truly “legacy-only without new artifacts present.”

### Cross-cutting Risks
- If legacy-only runs are impossible, the transition window for validating deltas independently of new drivers is effectively closed, making regression triage harder.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-015-morphology-belt-synthesis-history-provenance

### Quick Take
- Belt driver tensors are now derived from history/provenance tiles with continuity (gap fill + min length) and age-aware diffusion, and `plotMountains` consumes those drivers instead of legacy plates.
- New tests cover noise-only suppression, continuity, and age diffusion; viz emissions now include belt driver layers and summaries.

### High-Leverage Issues
- `plotMountains.contract` still requires `foundationArtifacts.plates` even though the step no longer uses them, keeping a legacy dependency that undercuts the cutover posture.

### PR Comment Context
- No reviewer comments; Graphite/preview notices only.

### Fix Now (Recommended)
- Remove the unused `foundationArtifacts.plates` requirement from `plotMountains.contract` (or reintroduce intentional usage) so the belt pipeline is fully driven by history/provenance inputs.

### Defer / Follow-up
- Align belt synthesis tests with the D04r 5-era budget (current fixtures use `eraCount=3`) to avoid under-testing the era-weighting logic.
- Consider enforcing 5..8 era bounds for belt driver derivation to keep Morphology aligned with the bounded history/provenance contract.

### Needs Discussion
- When (if ever) to upgrade to anisotropic diffusion once a tangent field exists, and how to stage that without breaking current correlation gates.

### Cross-cutting Risks
- Leaving legacy plate requirements in gameplay steps makes M1-016’s “new drivers only” cutover harder and increases the chance of silent regressions back to legacy inputs.
