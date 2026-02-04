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

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-017-determinism-suite-canonical-seeds

### Quick Take
- The determinism suite now defines three canonical cases and fingerprints Tier‑1 artifacts via the shared validation harness, with byte-level float hashing.
- The test provides a single entrypoint for CI drift detection and uses stable seeded configurations that exercise wrap and plate-count variance.

### High-Leverage Issues
- Drift reports only indicate “artifact fingerprint mismatch” without subfield/typed-array detail, which makes failures less actionable than the acceptance criteria call for.

### PR Comment Context
- No reviewer comments; Graphite/preview notices only.

### Fix Now (Recommended)
- Extend the determinism suite error report to surface per‑artifact subfield diffs when available (e.g., include the harness’ per-field fingerprints or the first mismatching field).

### Defer / Follow-up
- If cross‑platform float drift appears, add a scoped quantization policy and document which artifacts permit tolerance.

### Needs Discussion
- Whether the canonical case set should live in docs (validation/observability spec) to lock the determinism contract beyond test code.

### Cross-cutting Risks
- Artifact-level-only drift messages slow down triage and weaken the “determinism as a feature” posture.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-018-physics-invariants-mantle-forcing-plate-motion-coupling-resi

### Quick Take
- Added `M1_FOUNDATION_GATES` and `M1_FOUNDATION_DIAGNOSTICS` invariants (mantle potential/forcing bounds + plate motion coupling residual ratio) and wired them into the determinism suite; gates now fail runs on non-physical forcing/coupling drift.
- Diagnostics run but currently warn for all canonical cases (plate motion diagnostics), suggesting thresholds need calibration to stay signal-bearing.

### High-Leverage Issues
- Coupling invariants do not fail on non-finite `plateFitRms` / `plateFitP90` values. `scanFloat` tracks `nonFinite` but the coupling checks ignore it, so NaNs can slip through while still passing the residual ratio. Add explicit non-finite checks to align with “NaNs/infs fail loudly.”
- The “wrap-correct” requirement for mantle potential/forcing is not explicitly checked; invariants only validate bounds and variance. If wrap integrity matters (e.g., continuity at longitudinal seam), add an explicit wrap seam check.

### PR Comment Context
- No actionable review comments; Graphite/Railway bot notices only.

### Fix Now (Recommended)
- Add non-finite checks for `plateFitRms` / `plateFitP90` and fail hard when `nonFinite > 0`.
- Add a simple wrap-seam continuity check for mantle potential/forcing (e.g., max seam delta threshold) if wrap-correctness is a requirement.

### Defer / Follow-up
- Calibrate diagnostic thresholds (`PLATE_QUALITY_MEAN_MIN`, `CELL_FIT_OK_FRACTION_MIN`) or log as structured metrics; current diagnostics warn on every canonical case, which will desensitize triage.

### Needs Discussion
- Are the coupling residual thresholds intended to be scale-aware (from units spec), or should we lock to these static values for M1 and revisit in M2?

### Cross-cutting Risks
- Diagnostics that always fail will be ignored, reducing the ability to detect real coupling regressions later.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-019-physics-invariants-events-must-change-crust-provenance-belts

### Quick Take
- Added event→provenance causality checks and belt continuity gates to `M1_FOUNDATION_GATES`, so corridor signals now require provenance stamps and belts must be wide/continuous when events are active.
- The new gates run inside the determinism suite, giving fast feedback on “force-only tectonics” and belt wall regressions, but they currently only validate provenance and derived belt masks.

### High-Leverage Issues
- The acceptance criteria require **material/crust change** when events fire, but no crust-state invariant was added. Right now only provenance tiles are enforced, so “force-only crust” can still pass.
- Belt continuity is validated on `deriveBeltDriversFromHistory` output rather than actual Morphology belt artifacts. This can miss regressions where Morphology output diverges from the drivers.

### PR Comment Context
- No actionable review comments; Graphite/Railway bot notices only.

### Fix Now (Recommended)
- Add a crust-change gate that asserts event corridors imply measurable deltas in crust state (e.g., `damage`, `thermalAge`, `strength`) relative to pre-event baselines or previous era.
- If an explicit belt output artifact exists, add a belt continuity check against that output (not just derived drivers).

### Defer / Follow-up
- Calibrate belt continuity thresholds against multiple canonical seeds to avoid brittle failures as tuning changes.

### Needs Discussion
- Which crust fields are considered the canonical “material change” signal for D09r (damage, strength, maturity, or a derived delta)?

### Cross-cutting Risks
- Without a crust-change gate, events can remain “cosmetic,” undermining the physics-first objective even while provenance checks pass.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-020-morphology-correlation-gates-drivers-belts-no-wall-mountains

### Quick Take
- Added `morphology-driver-correlation` to `M1_FOUNDATION_GATES`, re-running `planRidgesAndFoothills` with history/provenance-derived drivers and enforcing driver coverage + “no noise-only mountains.”
- Gates now run in the determinism suite, aligning belts/mountains with causal drivers and catching obvious wall/noise regressions early.

### High-Leverage Issues
- The gate validates a **reconstructed plan** rather than the actual `plotMountains` output. If the pipeline diverges after the planning step, this invariant can pass while the shipped mountain mask regresses.
- “No wall mountains” checks are still applied to derived belt drivers, not the final mountain/belt outputs. This leaves a gap for output-level distribution regressions.

### PR Comment Context
- No actionable review comments; Graphite/Railway bot notices only.

### Fix Now (Recommended)
- Add a gate that inspects the actual `plotMountains` output artifact (or a published mountain/belt mask) and applies the distribution checks directly to that output.

### Defer / Follow-up
- Validate correlation thresholds against multiple seeds or configs to reduce brittleness as tuning evolves.

### Needs Discussion
- Should correlation gates lock to the default morphology config, or should they read the recipe/profile-specific config used in the run?

### Cross-cutting Risks
- If we only validate the reconstructed plan, downstream morphology changes can drift without tripping the physics-alignment gates.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-021-studio-authoring-physics-input-controls-causal-overlays-no-v

### Quick Take
- Studio now exposes a dedicated “Foundation (Physics Inputs)” panel backed by the recipe schema, keeping authoring confined to D08r inputs; schema guard tests enforce that derived keys (velocity/belt/regime) are absent.
- “Causality spine” layer shortcuts were added to ExplorePanel, letting authors jump to canonical `dataTypeKey` layers without adding correctness logic to the viewer.

### High-Leverage Issues
- `CAUSAL_LAYER_SHORTCUTS` is hard-coded in `App.tsx`, tightly coupling Studio to pipeline-specific keys. This breaks the Studio-agnostic boundary and will drift when other recipes or key taxonomies evolve.
- The Foundation authoring panel is hardwired into `RecipePanel` instead of using a generic “stage authoring” mechanism, which sets a precedent for domain-specific UI in a supposed agnostic shell.
- `FoundationAuthoringPanel`’s schema lookup skips `allOf`/`$ref` traversal; if schema structure changes, the panel will silently degrade to “schema unavailable.”

### PR Comment Context
- No actionable review comments; Graphite/Railway bot notices only.

### Fix Now (Recommended)
- Add `aria-label`s for icon-only buttons and replace click-only `<div>` overlays with accessible buttons or keyboard handlers (per Web Interface Guidelines).
- Move causal shortcut definitions into recipe UI meta (or a shared config file) so Studio doesn’t hardcode pipeline keys.

### Defer / Follow-up
- Consider a generic “stage authoring panel” registry keyed by recipe metadata to avoid future Foundation-only UI accretion.

### Needs Discussion
- Is it acceptable for Studio to ship with hard-coded D08r/D09r shortcuts, or should all shortcuts be recipe-defined?

### Cross-cutting Risks
- Hard-coded UI shortcuts and domain panels will force Studio updates for every taxonomy change, undermining the intended agnostic boundary.
