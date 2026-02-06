---
milestone: M1-foundation-maximal-cutover
id: M1-foundation-maximal-cutover-review
status: draft
reviewer: AI agent
---

## Reconciliation Sync (2026-02-06)

### Stack Coverage
- Scanned stack PRs with numbers: #1074, #1075, #1076, #1077, #1078, #1079, #1080, #1081, #1082, #1083, #1084, #1085, #1086, #1087, #1088, #1089, #1090, #1091, #1092, #1093, #1094, #1095, #1096, #1097, #1098, #1114, #1115, #1116, #1117, #1118, #1119, #1120, #1121, #1122.
- Review comments scanned: 14 total (`pulls/{pr}/comments`), covering 13 review threads (`reviewThreads`), with 12 currently open + 1 already resolved upstream.
- Issue comments scanned: 80 total (`issues/{pr}/comments`); all were automation/status comments from `github-actions[bot]` + Graphite stack notices posted by `mateicanavra` (no reviewer-authored actionable issue comments found).

### Review-Thread Ledger (Synced)

| PR | Thread ID | Comment | Disposition | Current State |
| --- | --- | --- | --- | --- |
| #1074 | `PRRT_kwDOOOKvrc5swmNv` | Emit required tectonic history masks or update schema | done: superseded/resolved | Resolved upstream; follow-up resolution comment already posted. |
| #1077 | `PRRT_kwDOOOKvrc5swnXi` | Honor profile `plateCount` when knobs omitted | remaining/open | Still reproducible (`FoundationPlateCountKnobSchema` default + compile fallback logic). |
| #1078 | `PRRT_kwDOOOKvrc5swoFn` | Apply lithosphere scalars directly (0 should weaken) | remaining/open | Still reproducible (`compute-crust` remaps scalars to narrow bands). |
| #1080 | `PRRT_kwDOOOKvrc5swnAd` | Avoid capping P90 fit errors at residualNorm | remaining/open | Still reproducible (histogram reconstruction caps P90 to residual scale). |
| #1083 | `PRRT_kwDOOOKvrc5swl4c` | Honor belt influence/decay config values | remaining/open | Still reproducible (`EMISSION_*` constants used; knobs not consumed). |
| #1086 | `PRRT_kwDOOOKvrc5swmfq` | Gate dual-read diagnostics to avoid always-on O(n) work | done: fixed/resolved | Resolved by dual-read bridge removal (`7b5db6b31`), with follow-up + thread resolution in this reconciliation pass. |
| #1087 | `PRRT_kwDOOOKvrc5swmNO` | Seed diffusion from zero-intensity belt tiles | remaining/open | Still reproducible (`computeDistanceField` seeded from full `beltMask`). |
| #1090 | `PRRT_kwDOOOKvrc5swl8j` | Fail coupling gate on non-finite `plateFitRms` | remaining/open | Still reproducible (`scanFloat(...).nonFinite` not enforced in coupling gate). |
| #1091 | `PRRT_kwDOOOKvrc5swmJI` | Count era-0 origins in event provenance gate | remaining/open | Still reproducible (`originEra > 0` gate excludes era 0). |
| #1092 | `PRRT_kwDOOOKvrc5swmzA` | Use recipe mountain config for correlation gate | remaining/open | Still reproducible (gate replays with `defaultConfig`, not recipe-normalized config). |
| #1094 | `PRRT_kwDOOOKvrc5swnHU` | Normalize overlay era key to avoid padded mismatch | done: fixed/resolved | Resolved by era key normalization (`e14d78796`), with follow-up + thread resolution in this reconciliation pass. |
| #1094 | `PRRT_kwDOOOKvrc5swnHW` | Guard against sparse/gapped era variants in UI | remaining/open | Partially mitigated by variant snapping; fixed-mode UI value can still diverge from rendered snapped era. |
| #1116 | `PRRT_kwDOOOKvrc5swmdy` | Restrict `eraCount` to 5..8 to match history guard | remaining/open | Still reproducible (`advanced.budgets.eraCount` schema/compile clamp allows 1..8). |

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
Assessment: **[done: superseded/resolved]** Masks are emitted and schema remains aligned. Keeping it here as a “contract drift” example: when Foundation publishes artifacts, schema-required fields must be emitted immediately or schema loosened, otherwise downstream domains can silently break.
- PR-M1-005 (#1077) — **Honor profile plateCount when knobs are omitted**
```text
**<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Honor profile plateCount when knobs are omitted**

Because `knobs.plateCount` is now always a number (it’s defaulted to 28 in `FoundationPlateCountKnobSchema`), the `defaults.plateCount` branch here is never taken, so configs that omit `foundation.knobs.plateCount` will still get 28 plates even when `profiles.resolutionProfile` is `coarse`/`fine`/`ultra`. This makes the per-profile plate-count baselines in `FOUNDATION_PROFILE_DEFAULTS` effectively dead unless every config explicitly sets `plateCount`. If profiles are meant to supply the baseline, consider making `plateCount` optional/no-default so the profile default can take effect.

Useful? React with 👍 / 👎.
```
Assessment: **[remaining/open]** Still relevant. It’s not directly “M1-012 era loop” work, but it’s an authoring-surface semantics footgun that undermines “physics-first, evolutionary” intent: if the authored plate discretization baseline can’t vary with resolution profiles unless explicitly set, recipes/presets can look “realism-tuned” but actually be stuck on a hidden default.
- PR-M1-006 (#1078) — **Apply lithosphere scalars directly (0 should weaken strength)**
```text
**<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Apply lithosphere scalars directly (0 should weaken strength)**

The `yieldStrength01` and `mantleCoupling01` knobs are documented as 0..1 scalars, but these formulas remap them to 0.85..1.15 and 0.9..1.1. As a result, setting either knob to 0 still yields ~85–90% of baseline strength, and setting it to 1 can boost strength above baseline before clamping. This makes the “scalar” knobs ineffective for weakening or disabling lithosphere strength in configs. Consider multiplying `rawStrength` directly by the 0..1 values (or updating schema/docs to match the nonlinear mapping).

Useful? React with 👍 / 👎.
```
Assessment: **[remaining/open]** Still relevant. It’s a mismatch between the authored parameter surface (“0..1 scalars”) and runtime semantics (“narrow remap around baseline”). This becomes more important as later M1 stages rely on strength/resistance to drive evolutionary features; if authors cannot actually weaken the lithosphere, “maximal realism” tuning is constrained and confusing.
- PR-M1-008 (#1080) — **Avoid capping P90 fit errors at residualNorm**
```text
**<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Avoid capping P90 fit errors at residualNorm**

When residual errors exceed `residualNorm` (mean forcing speed × `residualNormScale`), the binning logic clamps all larger errors into the last histogram bucket (`Math.min(histogramBins - 1, ...)`). Because `plateFitP90` is later reconstructed from the bucket index times `residualNorm`, the reported P90 is effectively capped at ~`residualNorm` even if the true 90th‑percentile error is much larger. This under-reports fit error and can inflate `plateQuality` for poorly fitted plates, especially on noisy/low-forcing runs. Consider computing P90 from the unnormalized errors or extending bins to cover >1×`residualNorm` so the 90th percentile can exceed that scale when appropriate.

Useful? React with 👍 / 👎.
```
Assessment: **[remaining/open]** Still relevant. This is a “metrics lie” risk: fit diagnostics drive validation and tuning loops, so capping error can make low-quality physics appear stable. That’s directly contrary to the objective (“maximally realist”) because it hides when the solver is failing.
- PR-M1-011 (#1083) — **Honor belt influence/decay config values**
```text
**<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Honor belt influence/decay config values**

The strategy contract still exposes `beltInfluenceDistance` and `beltDecay`, but the new event-driven implementation never reads them. The call to `buildEraFields` only passes `weight`/`driftSteps`, and the emission logic uses fixed `EMISSION_RADIUS`/`EMISSION_DECAY`, so any preset or test that customizes belt width/decay will now silently have no effect. This is a behavioral regression for callers relying on those knobs; consider wiring the config values through or removing them from the contract to avoid a misleading API.

Useful? React with 👍 / 👎.
```
Assessment: **[remaining/open]** Still relevant. This is a contract/authoring-surface drift problem (similar class to the #1074 schema drift) and it matters upstack: Morphology and Studio depend on authored controls being “real” controls, not vestigial knobs.

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
- PR #1086: **[done: fixed/resolved]** “Gate dual-read diagnostics to avoid always-on O(n) work.” This was closed by removing the dual-read diagnostics bridge (`7b5db6b31`), and the step now runs the history/provenance driver path directly.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- Document `ADVECTION_STEPS_PER_ERA` in budgets/specs or add a test guard so the provenance budget can’t drift silently.
- Confirm whether collision/transform events should update lineage scalars beyond boundary metadata, and document the rationale if they should not.

### Needs Discussion
- Whether provenance advection should remain embedded in `compute-tectonic-history` or move to a dedicated op for clearer separation of concerns.

### Cross-cutting Risks
- If advection budgets change without aligned tests/docs, provenance lineage stability could drift across releases.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-014-morphology-dual-read-history-provenance-diagnostics

### Quick Take
- Morphology’s landmass step now dual-reads history/provenance tiles to emit comparison diagnostics while keeping legacy plates as authoritative inputs, aligning with the transitional cutover plan.
- Diagnostics include deltas and a quantitative summary, and tests lock the new viz keys and summary event.

### High-Leverage Issues
- Dual-read comparisons assume identical mesh addressing across legacy/new paths; if tile mapping diverges (e.g., resolution/profile shifts), diagnostics can report misleading “regressions” that are actually coordinate mismatches. Consider asserting shared addressing invariants in the diagnostic harness.
- The step contract now **requires** `tectonicHistoryTiles` + `tectonicProvenanceTiles`, so “legacy‑only” runs without new drivers cannot compile. This conflicts with the acceptance criterion that legacy-only mode remains runnable during the transition.

### PR Comment Context
- PR #1087: **[remaining/open]** “Seed diffusion from zero-intensity belt tiles.” Current diffusion still seeds from full `beltMask`, so zero-intensity seed behavior remains possible.

### Fix Now (Recommended)
- None.
- Make the new tile drivers optional in the contract (or supply deterministic placeholders) and guard diagnostics so baseline legacy-only runs are still possible during the dual-read window.

### Defer / Follow-up
- Add a thresholded “diff severity” signal (and test) so diagnostics are not purely qualitative and can gate regressions when desired.
- Consider moving dual-read diagnostics into a dedicated diagnostic step to keep landmass computations focused and to make removal in PR‑M1‑024/025 simpler.

### Needs Discussion
- Whether the dual-read period should be time-boxed by milestone (and enforced by tests) so the legacy diagnostic bridge doesn’t become permanent.
- Whether the milestone intent is “legacy outputs with new diagnostics” (current behavior) or truly “legacy-only without new artifacts present.”

### Cross-cutting Risks
- If legacy-only runs are impossible, the transition window for validating deltas independently of new drivers is effectively closed, making regression triage harder.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-015-morphology-belt-synthesis-history-provenance

### Quick Take
- Belt driver tensors are now derived from history/provenance tiles with continuity (gap fill + min length) and age-aware diffusion, and `plotMountains` consumes those drivers instead of legacy plates.
- New tests cover noise-only suppression, continuity, and age diffusion; viz emissions now include belt driver layers and summaries.

### High-Leverage Issues
- The belt synthesis pipeline still has coupled knobs (continuity + diffusion + intensity gates). Without a consolidated “parameter intent” doc, future tuning risks becoming output-sculpting rather than physics-first posture.
- `plotMountains.contract` still requires `foundationArtifacts.plates` even though the step no longer uses them, keeping a legacy dependency that undercuts the cutover posture.

### PR Comment Context
- No reviewer comments; Graphite/preview notices only.

### Fix Now (Recommended)
- None.
- Remove the unused `foundationArtifacts.plates` requirement from `plotMountains.contract` (or reintroduce intentional usage) so the belt pipeline is fully driven by history/provenance inputs.

### Defer / Follow-up
- Consider lifting belt synthesis tuning + rationale into a single morphology doc so “maximal realism” posture is explicit and doesn’t drift into ad-hoc tuning.
- Align belt synthesis tests with the D04r 5-era budget (current fixtures use `eraCount=3`) to avoid under-testing the era-weighting logic.
- Consider enforcing 5..8 era bounds for belt driver derivation to keep Morphology aligned with the bounded history/provenance contract.

### Needs Discussion
- Whether belt synthesis should expose diagnostics for “age diffusion vs continuity fill” contributions to make tuning explainable.
- When (if ever) to upgrade to anisotropic diffusion once a tangent field exists, and how to stage that without breaking current correlation gates.

### Cross-cutting Risks
- Leaving legacy plate requirements in gameplay steps makes M1-016’s “new drivers only” cutover harder and increases the chance of silent regressions back to legacy inputs.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-016-cutover-morphology-new-drivers

### Quick Take
- `plotMountains` now requires history/provenance tiles only, and contract guards enforce that legacy plates are no longer referenced in belt synthesis.
- Guard tests provide a hard “no legacy fallback” posture for belt drivers, aligning with the D07r cutover requirements.

### High-Leverage Issues
- The cutover is intentionally narrow (belts/mountains). Any remaining morphology features that still accept legacy plates should be explicitly enumerated and scheduled, otherwise “partial cutover” becomes the new steady state.
- None observed; belt synthesis is now gated on the new driver artifacts and legacy plate dependencies are actively banned.

### PR Comment Context
- No reviewer comments; Graphite/preview notices only.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- Add a small “remaining legacy consumers” inventory (doc or test) to prevent silent reintroduction of legacy inputs.
- Track the remaining morphology steps that still consume legacy plates (coasts/islands/volcanoes) so future cleanup work doesn’t stall after belts are fully cut over.

### Needs Discussion
- Whether “no legacy fallback” should become a repo-wide invariant for M1+ (beyond morphology) once the stack merges.
- Whether “cutover” should eventually include non-belt morphology steps in this milestone or remain deferred to a separate cleanup slice.

### Cross-cutting Risks
- Partial cutover (belts only) may create mixed semantics across morphology features unless the remaining plate-driven steps are explicitly scheduled for migration.

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
- PR #1090: **[remaining/open]** “Fail coupling gate on non-finite `plateFitRms` values.” The coupling gate still does not fail on `scanFloat(...).nonFinite > 0`.

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
- PR #1091: **[remaining/open]** “Count era-0 origins in event provenance gate.” The gate still checks `originEra > 0`, so era-0 origins are excluded.

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
- PR #1092: **[remaining/open]** “Use the recipe’s mountain config for the correlation gate.” The invariant still replays with `planRidgesAndFoothills.defaultConfig` instead of recipe-normalized runtime config.

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

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-022-visualization-refinement-debug-vs-refined-layer-sets-era-scr

### Quick Take
- The Studio explorer now supports an era scrubber (auto/fixed), debug vs refined layer visibility, and optional overlay layers with opacity control, with contract tests covering `variantKey=era:<n>` expectations.
- The UX upgrades materially improve pipeline-realism tuning, but a few selection/normalization gaps can still mislead users about which era/variant they are actually seeing.

### High-Leverage Issues
- Era selection uses only min/max bounds, so gaps in available variants (e.g., eras 1 and 3 only) allow choosing a non-existent era. The UI will display the requested era while the renderer silently falls back to a different variant.
- Overlay selection uses a raw `era:${manualEra}` preference; if producers emit zero-padded or otherwise formatted era keys, the overlay will fail to match the intended era even when the base layer does.
- Overlay suggestions and keys are hard-coded in `App.tsx`, deepening pipeline-specific coupling in the Studio shell and repeating the agnostic-boundary risk surfaced in M1-021.

### PR Comment Context
- PR #1094: **[done: fixed/resolved]** “`overlayVariantKeyPreference` is built as `era:${manualEra}` … if actual variant keys are zero‑padded … overlay will fall back.” This is fixed by deriving the key from available variants (`findVariantKeyForEra`) in `e14d78796`.
- PR #1094: **[remaining/open]** “Era slider clamps only to min/max … UI reports ‘Era 2’ while rendering Era 1.” Partially mitigated by variant snapping, but fixed-era UI can still display the unsnapped manual value.

### Fix Now (Recommended)
- Normalize era preferences to actual variants: derive the preferred overlay variant via `findVariantIdForEra` (or by matching the currently selected era variant key) rather than string formatting, and snap manual era to the nearest available era variant instead of using a blind min/max range.

### Defer / Follow-up
- Move overlay suggestions into recipe UI metadata (or a shared config) so the Studio shell remains agnostic to pipeline-specific `dataTypeKey` taxonomies.

### Needs Discussion
- Should overlay mode allow cross-variant overlays with a warning, or should it hard-lock to the same era/space by default and disable overlays when a matching variant is unavailable?

### Cross-cutting Risks
- Era/overlay mismatches can lead to false causal inference during tuning (e.g., attributing changes to the wrong era), which undermines the physics-first objective even if the underlying data is correct.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-023-delete-legacy-plate-motion-legacy-tectonics-truth-publicatio

### Quick Take
- RNG-driven plate velocities were removed; tile-space motion is now derived from mantle-driven `plateMotion`, and docs/tests were updated to reflect the new source of truth.
- The cleanup achieves the main motion-source cutover, but legacy motion fields still exist in contracts, leaving a surface for future drift.

### High-Leverage Issues
- `FoundationPlateSchema` and `foundationPlates` still publish `velocityX/velocityY/rotation` and tile `movementU/V/rotation`. They are now zeroed or derived, but keeping them in the contract leaves a legacy surface that can be accidentally re-used.
- There is no explicit guard that plate-graph velocities stay zero or that tile movement must originate from `plateMotion`. Tests still build `plateMotion` from plate-graph velocities, which weakens the “mantle-derived only” posture.

### PR Comment Context
- No actionable review comments; Graphite/Railway bot notices only.

### Fix Now (Recommended)
- Add a contract guard that prevents non-zero plate-graph velocities or remove the plate-graph velocity fields entirely, and update tests to avoid sourcing `plateMotion` from legacy plate-graph values.

### Defer / Follow-up
- If `foundationPlates` must continue to publish movement for visualization, explicitly mark it as derived-from-plateMotion and document the deprecation plan for legacy fields.

### Needs Discussion
- Should `foundationPlates` continue publishing movement/rotation at all, or should the canonical visualization surface be `foundation.plates.motion` only?

### Cross-cutting Risks
- Leaving legacy motion fields in contracts invites future accidental re-binding to non-physics motion, which undermines the physics-first objective.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-024-delete-legacy-morphology-belt-driver-paths-and-bridge-artifa

### Quick Take
- Removed the legacy landmass-plates step and dual-read diagnostics, and added contract guards that enforce history/provenance tiles for belt synthesis.
- This completes the belt-driver cutover, but other morphology steps still depend on `foundationArtifacts.plates` without explicit justification.

### High-Leverage Issues
- `foundationArtifacts.plates` is still required by morphology steps like rugged coasts, islands, and volcanoes. If those dependencies are still intended, they should be explicitly documented as non-belt uses; otherwise the “no legacy plates” posture is incomplete.
- The contract guard only asserts `plotMountains` drops `foundationArtifacts.plates`; there is no guard to prevent other morphology steps from reintroducing plate tensors into belt planning or adjacent flows.

### PR Comment Context
- No actionable review comments; Graphite/Railway bot notices only.

### Fix Now (Recommended)
- Add a guard (or explicit documentation) that enumerates allowed plate-tensor consumers in morphology, and remove `foundationArtifacts.plates` from any steps that are now supposed to be driver-only.

### Defer / Follow-up
- Decide whether coasts/islands/volcanoes should migrate to a new derived surface (e.g., plate topology/tectonic history) instead of plate tensors, and plan the migration if so.

### Needs Discussion
- Are plate tensors still a valid input for non-belt morphology steps, or should the pipeline fully converge on history/provenance-derived inputs?

### Cross-cutting Risks
- Leaving plate tensors in downstream morphology steps creates a backdoor for legacy-driver drift, weakening the “maximal realism” cutover guarantees.

## REVIEW agent-URSULA-M1-LOCAL-TBD-PR-M1-025-delete-dual-engine-shadow-compute-paths-after-suite-is-green

### Quick Take
- Projection now requires tectonic provenance and a guard test enforces that dependency, which is a meaningful contract hardening step.
- The bulk of the diff is a MapGen Studio config-override refactor; the ticket’s core deliverable (removing shadow/dual compute paths and comparison layers) is not clearly implemented.

### Disposition (2026-02-06)

| Item | Disposition | Rationale | Owning Slice | Phase |
| --- | --- | --- | --- | --- |
| no-dual-engine guard | must-fix-now | Core M1-025 acceptance requires explicit protection against shadow/dual compare surfaces in standard pipeline paths. | Slice 1 | Phase 0 |
| provenance-required projection guard | fixed | Projection now hard-requires provenance and is covered by contract guard coverage. | — | Complete |
| dual-read lingering concern | fixed | Prior dual-read concern from belt cutover is closed by existing no-dual-read guard coverage. | — | Complete |
| M1-022 era snapping + overlay normalization | scheduled | Studio manual era selection must resolve to available variant keys with normalized matching to avoid drift. | Slice 2 | Phase 0 |
| M1-021/022 overlay hardcoding | scheduled | Move overlay suggestions out of app shell and bind to recipe-driven lookup to reduce coupling. | Slice 3 | Phase 0 |
| M1-023 motion-field risk | scheduled | Add guard that motion surfaces stay derived from canonical `plateMotion` path while preserving current contract shape. | Slice 4 | Phase 0 |
| M1-024 plate-tensor concern | superseded by plan matrices/Phase B/C | Remaining morphology tensor-consumer decisions are tracked in canonical plan matrices and execute in later phases. | — | Phase B/C |

### High-Leverage Issues
- Acceptance criteria are not met: there is no removal of shadow/dual compute paths or comparison-only layers, and no “no shadow paths” guard beyond the provenance requirement.
- The large Studio config override refactor is out-of-scope for a pipeline shadow-path cleanup and increases review surface area and regression risk without explicit justification.

### PR Comment Context
- No actionable review comments; Graphite/Railway bot notices only.
- Final downstack scan for open PR comments (M1-022..M1-025) found no additional unresolved reviewer notes beyond the M1-022 comments already captured.

### Fix Now (Recommended)
- Either implement the actual shadow-path deletions (remove comparison-only emissions/toggles and add a dedicated “no dual-engine” guard) or split the Studio refactor into a separate PR and keep this one focused.

### Defer / Follow-up
- If the Studio refactor remains, add a focused UI regression check for schema-driven config overrides and document the intended replacement for the removed panels.

### Needs Discussion
- Is M1-025 intended to be a pipeline-only cleanup? If so, should the Studio refactor be moved to a separate milestone or issue?

### Cross-cutting Risks
- Leaving dual/compare paths in place undermines the “one authoritative spine” objective, and mixing in a large UI refactor makes it harder to verify the physics-first cutover.

## Stack Extension Comment Sync (PR-M1-026..PR-M1-034 + PR #1098)

### Review Comment Coverage
- PR-M1-026 / #1114: no review-thread comments; issue comments are automation-only (Railway/Graphite status).
- PR-M1-027 / #1115: no review-thread comments; issue comments are automation-only (Railway/Graphite status).
- PR-M1-028 / #1116: **[remaining/open]** review thread `PRRT_kwDOOOKvrc5swmdy` (“Restrict `eraCount` to 5..8 to match history guard”); runtime guard remains 5..8 while authoring surface still allows 1..8.
- PR-M1-029 / #1117: no review-thread comments; issue comments are automation-only (Railway/Graphite status).
- PR-M1-030 / #1118: no review-thread comments; issue comments are automation-only (Railway/Graphite status).
- PR-M1-031 / #1119: no review-thread comments; issue comments are automation-only (Railway/Graphite status).
- PR-M1-032 / #1120: no review-thread comments; issue comments are automation-only (Railway/Graphite status).
- PR-M1-033 / #1121: no review-thread comments; issue comments are automation-only (Railway/Graphite status).
- PR-M1-034 / #1122: no review-thread comments; issue comments are automation-only (Railway/Graphite status).
- PR #1098 (`agent-URSULA-M1-fix-studio-authoring-schema`): no review-thread comments; issue comments are automation-only (Railway/Graphite status).
