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

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-007-mantle-potential-generation-derived-forcing-fields-d02r

### Quick Take
- Mantle potential + forcing are now first‑class mesh‑space truth artifacts with deterministic, bounded generation, plus minimal viz emissions for inspection.
- Tests cover determinism, non‑uniform potential, and wrap‑seam behavior.

### High-Leverage Issues
- `potentialAmplitude01` is effectively neutralized: `compute-mantle-potential` normalizes the field to [-1,1] after applying amplitude, so the authored amplitude scale does not actually change forcing magnitude. This conflicts with D08r’s intent to let amplitude scale drive plate motion strength.

### PR Comment Context
- No actionable review comments; Graphite stack + Railway preview notices only.

### Fix Now (Recommended)
- Make amplitude scale observable by forcing: either scale `mantleForcing` outputs by `potentialAmplitude01` (or derived amplitude scale), or remove the post‑normalize step and instead clamp to a bounded range that preserves relative amplitude.

### Defer / Follow-up
- If normalization must remain for compatibility, expose amplitude via a dedicated `forcingScale` in the mantle forcing config and document it as the authoring control.

### Needs Discussion
- Should `foundation.mantlePotential` remain “normalized” per schema, or should we relax the contract so amplitude is preserved and bounded elsewhere (e.g., via forcing normalization)?

### Cross-cutting Risks
- Inert authoring knobs (amplitude) will cause Studio users to think they are steering physics inputs when they are not, undermining the physics‑first objective.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-008-plate-motion-solver-derived-from-mantle-forcing-d03r

### Quick Take
- New `foundation/compute-plate-motion` op derives per-plate translation + rotation directly from mantle forcing with fixed budgets and deterministic output, and is wired into tectonic segments + projection.
- Plate-motion viz emits `foundation.plateMotion.motion`; tests cover determinism, forcing sensitivity, and bounds, with retunes to keep morphology outputs stable.

### High-Leverage Issues
- `foundationArtifacts.plateGraph` still exposes `velocityX/velocityY/rotation` even though kinematics are now authoritative in `plateMotion`; leaving inert kinematics in the graph invites future hidden-motion regressions unless deprecated/removed or explicitly validated as zero.
- `requirePlateMotion` accepts `Uint8Array` for fields that should be `Float32Array` (`plateCenterX/Y`, `plateVelocity*`, `plateOmega`, `plateFit*`), weakening contract validation for downstream consumers.

### PR Comment Context
- No reviewer comments; Graphite stack + preview notices only.

### Fix Now (Recommended)
- Tighten `requirePlateMotion` to require `Float32Array` for float fields (keep `plateQuality`/`cellFitError` as `Uint8Array`) so contract guards actually catch mismatched payloads.

### Defer / Follow-up
- Deprecate or remove kinematic fields from `FoundationPlateGraphSchema` (or assert they remain zero) to keep a single source of truth for motion.

### Needs Discussion
- The emitted viz key is `foundation.plateMotion.motion`, while earlier taxonomy notes mention `foundation.plates.motion`; confirm the canonical naming and update docs/decisions to match.

### Cross-cutting Risks
- Leaving kinematics in the plate graph schema makes it easy for downstream code or future refactors to reintroduce hidden motion sources, undermining the physics-first objective.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-009-crust-priors-resistance-partition-plategraph-d01

### Quick Take
- Crust priors are now mantle-forcing coupled (divergence/stress/forcingMag), and plate partitioning consumes the resulting strength field to bias resistance.
- New tests validate resistance sensitivity and polar contiguity/sliver guards; mesh-first determinism stays intact.

### High-Leverage Issues
- Contiguity + sliver policy for non-polar plates remains implicit: only polar microplates enforce `microplateMinAreaCells` and contiguity checks, while general plates rely on algorithmic behavior without explicit guardrails. Acceptance asked for an explicit policy or rationale.

### PR Comment Context
- No reviewer comments; Graphite stack + preview notices only.

### Fix Now (Recommended)
- Add a minimal contiguity/sliver guard (or an explicit documented waiver) for non‑polar plates so the acceptance criterion is met and future refactors can’t reintroduce degenerate partitions unnoticed.

### Defer / Follow-up
- The `computeCrust` schema says `riftWeakening01` is “reserved for event-driven weakening,” but it now scales pre-plate damage; either update the description or split the parameter to avoid semantic drift.
- `computeCrust` takes `rngSeed` but does not use it; either remove it from the contract or introduce a small deterministic noise term so the seed has meaning.

### Needs Discussion
- Should resistance sensitivity be asserted via a dedicated crust/resistance artifact (separate from `crust.strength`) for clarity, or is the crust artifact expected to remain the only truth surface for partitioning?

### Cross-cutting Risks
- If contiguity/sliver constraints stay implicit, later changes to partition heuristics could silently violate the “physics-first” posture without tripping tests.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-010-boundary-segments-regime-classification-source-of-events

### Quick Take
- Segment classification now scales compression/extension/shear intensities with crust resistance while preserving the mantle-derived plate-motion basis.
- Tests extend the existing segments suite with determinism, polarity stability, and resistance-aware scaling assertions.

### High-Leverage Issues
- The new resistance-scaling test only exercises a compressive case (vn < 0), so extension scaling is effectively untested; a divergent scenario is needed to prevent sign/regime regressions from slipping through.

### PR Comment Context
- No reviewer comments; Graphite stack + preview notices only.

### Fix Now (Recommended)
- Add a divergent-motion test case that validates extension scaling increases as crust weakens (and verifies regime classification flips appropriately when intensities shift).

### Defer / Follow-up
- Consider whether resistance should also modulate polarity confidence (e.g., in mixed crust-type boundaries) or if polarity should remain strictly type-based.

### Needs Discussion
- Should the segments artifact expose a normalized “resistance scalar” per segment for downstream event heuristics, or is it sufficient that resistance only influences intensities?

### Cross-cutting Risks
- Without explicit divergent-case coverage, later changes to the intensity math could silently break rift corridor detection in the event engine.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-011-event-engine-subduction-collision-rift-transform-mandatory-f

### Quick Take
- `compute-tectonic-history` now builds event-driven era fields, force corridors, and provenance scalars from boundary segments + mantle forcing, with deterministic tie-breaking and new validation/test coverage.
- The event system still avoids mutating `artifact:foundation.crust`; all “material change” is recorded in provenance scalars, leaving the acceptance criterion only partially satisfied.

### High-Leverage Issues
- Acceptance requires each event class to change at least one crust variable and one provenance variable; the implementation only updates provenance (`originEra`, `originPlateId`, `crustAge`) and leaves `foundation.crust` untouched, so “force-only tectonics” is still possible in the data model.

### PR Comment Context
- No reviewer comments; Graphite stack + preview notices only.

### Fix Now (Recommended)
- Add a dedicated event-driven crust mutation output (either by extending `foundation.crust` with an explicit event delta, or by introducing a separate `foundation.crustEvents`/`foundation.crustMutations` artifact) and assert at least one crust scalar changes per event class.

### Defer / Follow-up
- Extend `m11-tectonic-events.test.ts` to assert an actual crust variable (or crust-mutation artifact) changes when subduction/rift events fire, not just provenance scalars.

### Needs Discussion
- If crust can only be written by `compute-crust`, should the event engine emit an explicit mutation layer that is applied in a later step, or should ownership rules be relaxed to allow crust updates here?

### Cross-cutting Risks
- Without a crust mutation path, Morphology can still be driven by “force corridors” without any material change, undermining the physics-first objective and making later invariants ambiguous.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-012-era-loop-field-emission-budgets-d04r-eulerian-outputs

### Quick Take
- D04r era loop now enforces 5–8 bounded eras with fixed per-era weights/steps and deterministic rollups; recipe validation aligns to the 5..8 window.
- Coverage gaps remain: history tile validation still accepts any positive era count, and rollup determinism checks only cover a subset of rollups.

### High-Leverage Issues
- `validateTectonicHistoryTiles` only asserts `eraCount > 0`; it does not enforce the 5..8 budget window, so tiles can drift from the bounded history contract without being rejected.

### PR Comment Context
- Downstack PR Comment Context (PR-M1-002..PR-M1-011): reviewed all PR comments. Only substantive inline review comments existed; Graphite/Railway bot comments were omitted as non-technical noise.
- PR-M1-002 (#1074) — **Emit required tectonic history masks or update schema** (thread resolved as superseded)
```text
**<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Emit required tectonic history masks or update schema**

The per‑era history tile payload you construct here omits `convergentMask`, `divergentMask`, and `transformMask`, but `FoundationTectonicHistoryTilesEraArtifactSchema` declares those fields as required (see `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts`). Now that `projection.ts` publishes `foundationTectonicHistoryTiles`, any downstream consumer using the artifact contract/schema (or relying on those masks being present) will see `undefined` and can mis-render or crash. Either populate these mask arrays alongside `boundaryType` or remove them from the artifact schema to keep the published payload consistent with the contract.

Useful? React with 👍 / 👎.
```
Assessment: This is now superseded (masks are emitted and schema remains aligned). Keeping it here as a “contract drift” example: when Foundation publishes artifacts, schema-required fields must be emitted immediately or schema loosened, otherwise downstream domains can silently break.
- PR-M1-005 (#1077) — **Honor profile plateCount when knobs are omitted**
```text
**<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Honor profile plateCount when knobs are omitted**

Because `knobs.plateCount` is now always a number (it’s defaulted to 28 in `FoundationPlateCountKnobSchema`), the `defaults.plateCount` branch here is never taken, so configs that omit `foundation.knobs.plateCount` will still get 28 plates even when `profiles.resolutionProfile` is `coarse`/`fine`/`ultra`. This makes the per-profile plate-count baselines in `FOUNDATION_PROFILE_DEFAULTS` effectively dead unless every config explicitly sets `plateCount`. If profiles are meant to supply the baseline, consider making `plateCount` optional/no-default so the profile default can take effect.

Useful? React with 👍 / 👎.
```
Assessment: Still relevant. It’s not directly “M1-012 era loop” work, but it’s an authoring-surface semantics footgun that undermines “physics-first, evolutionary” intent: if the authored plate discretization baseline can’t vary with resolution profiles unless explicitly set, recipes/presets can look “realism-tuned” but actually be stuck on a hidden default.
- PR-M1-006 (#1078) — **Apply lithosphere scalars directly (0 should weaken strength)**
```text
**<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Apply lithosphere scalars directly (0 should weaken strength)**

The `yieldStrength01` and `mantleCoupling01` knobs are documented as 0..1 scalars, but these formulas remap them to 0.85..1.15 and 0.9..1.1. As a result, setting either knob to 0 still yields ~85–90% of baseline strength, and setting it to 1 can boost strength above baseline before clamping. This makes the “scalar” knobs ineffective for weakening or disabling lithosphere strength in configs. Consider multiplying `rawStrength` directly by the 0..1 values (or updating schema/docs to match the nonlinear mapping).

Useful? React with 👍 / 👎.
```
Assessment: Still relevant. It’s a mismatch between the authored parameter surface (“0..1 scalars”) and runtime semantics (“narrow remap around baseline”). This becomes more important as later M1 stages rely on strength/resistance to drive evolutionary features; if authors cannot actually weaken the lithosphere, “maximal realism” tuning is constrained and confusing.
- PR-M1-008 (#1080) — **Avoid capping P90 fit errors at residualNorm**
```text
**<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Avoid capping P90 fit errors at residualNorm**

When residual errors exceed `residualNorm` (mean forcing speed × `residualNormScale`), the binning logic clamps all larger errors into the last histogram bucket (`Math.min(histogramBins - 1, ...)`). Because `plateFitP90` is later reconstructed from the bucket index times `residualNorm`, the reported P90 is effectively capped at ~`residualNorm` even if the true 90th‑percentile error is much larger. This under-reports fit error and can inflate `plateQuality` for poorly fitted plates, especially on noisy/low-forcing runs. Consider computing P90 from the unnormalized errors or extending bins to cover >1×`residualNorm` so the 90th percentile can exceed that scale when appropriate.

Useful? React with 👍 / 👎.
```
Assessment: Still relevant. This is a “metrics lie” risk: fit diagnostics drive validation and tuning loops, so capping error can make low-quality physics appear stable. That’s directly contrary to the objective (“maximally realist”) because it hides when the solver is failing.
- PR-M1-011 (#1083) — **Honor belt influence/decay config values**
```text
**<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Honor belt influence/decay config values**

The strategy contract still exposes `beltInfluenceDistance` and `beltDecay`, but the new event-driven implementation never reads them. The call to `buildEraFields` only passes `weight`/`driftSteps`, and the emission logic uses fixed `EMISSION_RADIUS`/`EMISSION_DECAY`, so any preset or test that customizes belt width/decay will now silently have no effect. This is a behavioral regression for callers relying on those knobs; consider wiring the config values through or removing them from the contract to avoid a misleading API.

Useful? React with 👍 / 👎.
```
Assessment: Still relevant. This is a contract/authoring-surface drift problem (similar class to the #1074 schema drift) and it matters upstack: Morphology and Studio depend on authored controls being “real” controls, not vestigial knobs.

### Fix Now (Recommended)
- Align `tectonicHistoryTiles` validation with the 5..8 era bounds so tile payloads cannot diverge from the bounded era loop contract.

### Defer / Follow-up
- Regenerate shipped preset configs (`mods/mod-swooper-maps/mod/maps/*`) when release tooling allows so 5-era defaults are reflected in artifacts and validation does not fail in runtime presets.
- Extend rollup determinism tests to cover `fractureTotal`, `volcanismTotal`, and `upliftRecentFraction`, and rename the “3-era history” test description to avoid confusion.

### Needs Discussion
- Whether D04r budget constants should be referenced in spec docs (`resources/spec/budgets.md`) or remain code/test-only.

### Cross-cutting Risks
- If legacy 3-era presets ship without regeneration, validation will reject history artifacts and downstream consumers will see missing/invalid driver channels.

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
