---
milestone: M4
id: M4-review
status: draft
reviewer: AI agent
---

# REVIEW M4 Ecology Placement Physics Continuum

This document is append-only for milestone task reviews. Each entry must use:
- `## REVIEW <workBranch>`
- `### Quick Take`
- `### High-Leverage Issues`
- `### PR Comment Context`
- `### Fix Now (Recommended)`
- `### Defer / Follow-up`
- `### Needs Discussion`
- `### Cross-cutting Risks`

## REVIEW codex/MAMBO-m3-002-stage-split-earth-system-first

### Quick Take
- Earth-system stage split is structurally correct and aligns with continuum direction.
- Review branch: `agent-TOMMY-M4-T01-review-MAMBO-m3-002-stage-split-earth-system--a47102`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1268

### High-Leverage Issues
- Legacy ecology config key migration risk remains if branch is consumed standalone.

### PR Comment Context
- PR #1223 has one unresolved compatibility-oriented review thread.
- PR #1223: refactor(ecology): split earth system stages and integrate biome edge refinement (https://github.com/mateicanavra/civ7-modding-tools/pull/1223)

### Fix Now (Recommended)
- Add explicit legacy-to-new stage key migration or hard error path.

### Defer / Follow-up
- Add regression test for old ecology preset key handling.

### Needs Discussion
- Whether temporary compatibility was acceptable during cutover sequencing.

### Cross-cutting Risks
- Silent config fallback can poison downstream parity baselines.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/MAMBO-m3-003-scorelayers-artifact-and-score-ops

### Quick Take
- ScoreLayers substrate landed and enables deterministic feature planning.
- Review branch: `agent-TOMMY-M4-T02-review-MAMBO-m3-003-scorelayers-artifact-and--9d3358`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1269

### High-Leverage Issues
- Occupancy base reserves deep ocean and can contradict ice suitability scoring.

### PR Comment Context
- PR #1224 has one unresolved thread on occupancy/placement semantics.
- PR #1224: feat(ecology): add score layer operations for wetlands, reefs, and ice features (https://github.com/mateicanavra/civ7-modding-tools/pull/1224)

### Fix Now (Recommended)
- Remove blanket deep-ocean reservation from shared occupancy base.

### Defer / Follow-up
- Add dedicated deep-water ice placement coverage tests.

### Needs Discussion
- Canonical boundary between occupancy hard-blocks and feature-specific constraints.

### Cross-cutting Risks
- Mismatched occupancy vs score artifacts can mislead truth validation.
- Runtime-vs-viz mismatch analysis: observed: score and occupancy can disagree for ice-eligible ocean tiles. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/MAMBO-m3-004-plan-ice-deterministic

### Quick Take
- Deterministic ice planner wiring is correct in structure and stage flow.
- Review branch: `agent-TOMMY-M4-T03-review-MAMBO-m3-004-plan-ice-deterministic-6f0890`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1270

### High-Leverage Issues
- Seed contract enforces nonnegative values while derived step seeds can be signed.

### PR Comment Context
- PR #1225 has one unresolved thread on seed contract mismatch.
- PR #1225: refactor(ecology): implement deterministic ice planning with score-based approach (https://github.com/mateicanavra/civ7-modding-tools/pull/1225)

### Fix Now (Recommended)
- Align seed schema with derived seed behavior across planners.

### Defer / Follow-up
- Add schema-validation test for signed deterministic seeds.

### Needs Discussion
- Single signedness convention for all deterministic planner contracts.

### Cross-cutting Risks
- Input validation mismatches can fail valid deterministic runs.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/MAMBO-m3-005-plan-reefs-deterministic

### Quick Take
- Deterministic reef-family planning is in place and test-backed.
- Review branch: `agent-TOMMY-M4-T04-review-MAMBO-m3-005-plan-reefs-deterministic-42c50e`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1271

### High-Leverage Issues
- No blocking branch-local defect confirmed in this pass.

### PR Comment Context
- PR #1226 has no unresolved inline reviewer findings.
- PR #1226: feat(ecology): implement deterministic reef family planning (https://github.com/mateicanavra/civ7-modding-tools/pull/1226)

### Fix Now (Recommended)
- None immediate.

### Defer / Follow-up
- Add realism-metric checks for reef distribution quality.

### Needs Discussion
- Whether current reef heuristics are sufficient for realism goals.

### Cross-cutting Risks
- Determinism can mask ecological quality regressions without quality gates.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/MAMBO-m3-006-plan-wetlands-deterministic

### Quick Take
- Wetlands planning moved to deterministic score-layer flow successfully.
- Review branch: `agent-TOMMY-M4-T05-review-MAMBO-m3-006-plan-wetlands-determinist-284a7e`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1272

### High-Leverage Issues
- No blocking branch-local defect confirmed in this pass.

### PR Comment Context
- PR #1227 has no unresolved inline reviewer findings.
- PR #1227: refactor(ecology): implement deterministic wetlands planning with score-based joint resolver (https://github.com/mateicanavra/civ7-modding-tools/pull/1227)

### Fix Now (Recommended)
- None immediate.

### Defer / Follow-up
- Add compatibility checks for retired strategy/config surfaces.

### Needs Discussion
- Whether retired wetland strategy variants should hard-fail if referenced.

### Cross-cutting Risks
- Large deletion slices can hide niche behavior regressions.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/MAMBO-m3-007-plan-vegetation-deterministic

### Quick Take
- Vegetation planning is deterministic and stage-isolated as intended.
- Review branch: `agent-TOMMY-M4-T06-review-MAMBO-m3-007-plan-vegetation-determini-33fa9e`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1273

### High-Leverage Issues
- No blocking branch-local defect confirmed in this pass.

### PR Comment Context
- PR #1228 has no unresolved inline reviewer findings.
- PR #1228: docs(pipeline-realism): update M3 execution plan for vegetation deterministic planning (https://github.com/mateicanavra/civ7-modding-tools/pull/1228)

### Fix Now (Recommended)
- None immediate.

### Defer / Follow-up
- Add seed-matrix distribution sanity tests for vegetation planners.

### Needs Discussion
- Shared invariant suite coverage across per-family planners.

### Cross-cutting Risks
- Per-family planner drift can reintroduce inconsistency over time.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/MAMBO-m3-008-stamping-strict-features-apply

### Quick Take
- Strict feature stamping posture is aligned with no-probabilistic-gating goals.
- Review branch: `agent-TOMMY-M4-T07-review-MAMBO-m3-008-stamping-strict-features--5cbbf9`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1274

### High-Leverage Issues
- Smoke test timeout signature is incompatible with Bun test API.

### PR Comment Context
- PR #1229 has unresolved P1 feedback on test signature correctness.
- PR #1229: refactor(ecology): enforce strict feature stamping with no probabilistic gating (https://github.com/mateicanavra/civ7-modding-tools/pull/1229)

### Fix Now (Recommended)
- Fix Bun timeout usage and keep strict stamping guardrails active.

### Defer / Follow-up
- Add lint/check guard against unsupported test options signatures.

### Needs Discussion
- None beyond framework-correctness discipline.

### Cross-cutting Risks
- Broken smoke tests can hide real runtime regressions.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/MAMBO-m3-009-cleanup-delete-legacy-chance

### Quick Take
- Chance/multiplier cleanup materially advances deterministic ecology flow.
- Review branch: `agent-TOMMY-M4-T08-review-MAMBO-m3-009-cleanup-delete-legacy-cha-912363`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1275

### High-Leverage Issues
- Runtime path still throws on viz key gaps and schema strictness was loosened.

### PR Comment Context
- PR #1230 has unresolved P1/P2 review feedback and explicit follow-up pressure.
- PR #1230: refactor(ecology): delete legacy chance and multiplier paths (https://github.com/mateicanavra/civ7-modding-tools/pull/1230)

### Fix Now (Recommended)
- Make viz mapping non-throwing in runtime and restore strict schema unknown-key rejection.

### Defer / Follow-up
- Add tests for unknown plot effects and unknown schema keys.

### Needs Discussion
- Hard separation of gameplay authority from visualization metadata completeness.

### Cross-cutting Risks
- Viz metadata gaps can become runtime blockers against gameplay truth.
- Runtime-vs-viz mismatch analysis: observed: viz category lookup can abort valid runtime behavior. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/MAMBO-m3-010-post-cutover-cleanup

### Quick Take
- This branch is planning/docs scaffolding for follow-up cleanup work.
- Review branch: `agent-TOMMY-M4-T09-review-MAMBO-m3-010-post-cutover-cleanup-5fefd4`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1276

### High-Leverage Issues
- Scope/expectation mismatch risk if interpreted as runtime cleanup completion.

### PR Comment Context
- PR #1231 has no unresolved inline reviewer findings.
- PR #1231: docs(pipeline-realism): add post-cutover cleanup and bugfix issues (https://github.com/mateicanavra/civ7-modding-tools/pull/1231)

### Fix Now (Recommended)
- None code-level.

### Defer / Follow-up
- Track downstream implementation closure explicitly from this scaffold.

### Needs Discussion
- Whether docs-only completion should count as milestone implementation completion.

### Cross-cutting Risks
- Milestone can look complete while execution work remains deferred.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/MAMBO-m3-011-canonical-docs-sweep

### Quick Take
- Canonical docs/contracts coverage improved for ecology plot-effects surfaces.
- Review branch: `agent-TOMMY-M4-T10-review-MAMBO-m3-011-canonical-docs-sweep-f6feb2`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1277

### High-Leverage Issues
- No blocking branch-local defect confirmed in this pass.

### PR Comment Context
- PR #1232 has no unresolved inline reviewer findings.
- PR #1232: docs(ecology): add descriptions to plot effects configuration schemas (https://github.com/mateicanavra/civ7-modding-tools/pull/1232)

### Fix Now (Recommended)
- None immediate.

### Defer / Follow-up
- Automate schema-reference generation to reduce drift.

### Needs Discussion
- None.

### Cross-cutting Risks
- Docs-only changes can drift without behavioral conformance checks.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/MAMBO-m3-012-fix-biomes-stripes

### Quick Take
- Stripe banding remediation and hydrology-index consumption are directionally strong.
- Review branch: `agent-TOMMY-M4-T11-review-MAMBO-m3-012-fix-biomes-stripes-faece2`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1278

### High-Leverage Issues
- Legacy biome tuning knobs risk becoming silent no-ops after classifier shift.

### PR Comment Context
- PR #1233 has unresolved P2 feedback on tuning compatibility semantics.
- PR #1233: fix(ecology): fix biomes horizontal stripe banding (https://github.com/mateicanavra/civ7-modding-tools/pull/1233)

### Fix Now (Recommended)
- Map/deprecate legacy tuning knobs explicitly with clear failure modes.

### Defer / Follow-up
- Add migration docs/tests for affected knob ownership.

### Needs Discussion
- Intentional architecture shift vs accidental loss of tunability.

### Cross-cutting Risks
- Silent knob no-ops erode trust in configuration surfaces.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/MAMBO-m3-014-lakes-not-filled

### Quick Take
- Store-water-data synchronization fix addresses the immediate lake fill symptom.
- Review branch: `agent-TOMMY-M4-T12-review-MAMBO-m3-014-lakes-not-filled-993ca5`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1279

### High-Leverage Issues
- Fix likely addresses symptom only; broader area-cache lifecycle remains fragile.

### PR Comment Context
- PR #1234 has no unresolved inline reviewer findings.
- PR #1234: fix(hydrology): call storeWaterData after generateLakes to update water tables (https://github.com/mateicanavra/civ7-modding-tools/pull/1234)

### Fix Now (Recommended)
- None immediate.

### Defer / Follow-up
- Pair with lifecycle-wide cache refresh invariants tests.

### Needs Discussion
- Whether this should have included area-cache refresh in same slice.

### Cross-cutting Risks
- Partial fixes can leave similar hydrology failures elsewhere.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/MAMBO-m3-013-bio-lat-cutoff

### Quick Take
- Latitude-cutoff smoothing and thermal-state adjustments reduce abrupt biome seams.
- Review branch: `agent-TOMMY-M4-T13-review-MAMBO-m3-013-bio-lat-cutoff-2ab14f`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1280

### High-Leverage Issues
- Feature viz categories may omit pre-existing engine features.

### PR Comment Context
- PR #1235 has unresolved P2 feedback on viz-category completeness.
- PR #1235: fix(ecology): smooth tropical-temperate biome transitions to prevent latitude cutoffs (https://github.com/mateicanavra/civ7-modding-tools/pull/1235)

### Fix Now (Recommended)
- Build category metadata from observed/runtime feature IDs.

### Defer / Follow-up
- Add regression coverage with pre-existing non-placed features.

### Needs Discussion
- Whether hydrology thermal-state coupling inside this ecology fix is intentional.

### Cross-cutting Risks
- Incomplete viz metadata can mislead downstream analysis.
- Runtime-vs-viz mismatch analysis: observed: runtime features can exist outside emitted viz categories. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/M3-015-hydrology-effectiveMoisture-soils

### Quick Take
- Hydrology-owned effective moisture and soils integration improves ecology grounding.
- Review branch: `agent-TOMMY-M4-T14-review-M3-015-hydrology-effectiveMoisture-soi-69ea1b`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1281

### High-Leverage Issues
- Climate-refine schema strictness relaxation can hide payload drift.

### PR Comment Context
- PR #1236 has no unresolved human inline review threads.
- PR #1236: refactor(ecology): use Hydrology effectiveMoisture instead of local derivation (https://github.com/mateicanavra/civ7-modding-tools/pull/1236)

### Fix Now (Recommended)
- Re-tighten unknown-key validation or add explicit rejection tests.

### Defer / Follow-up
- Add seed-matrix evidence for biome/vegetation response deltas.

### Needs Discussion
- Keep fixed moisture constants hardcoded vs config-driven.

### Cross-cutting Risks
- Hydrology/ecology semantics can drift without strict contracts.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/default-config-intent-tuning

### Quick Take
- Preset tuning aligns to intent but changes are very broad in one slice.
- Review branch: `agent-TOMMY-M4-T15-review-default-config-intent-tuning-384ba2`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1282

### High-Leverage Issues
- Large multi-domain parameter churn lacks attached quantitative acceptance evidence.

### PR Comment Context
- PR #1237 has no unresolved human inline review threads.
- PR #1237: feat(climate): tune map configs for more realistic hydrology and biomes (https://github.com/mateicanavra/civ7-modding-tools/pull/1237)

### Fix Now (Recommended)
- Gate acceptance on seed-matrix diagnostics and metric deltas.

### Defer / Follow-up
- Split future tuning into smaller profile-focused changes.

### Needs Discussion
- How much tuning breadth is acceptable per branch for reviewability.

### Cross-cutting Risks
- Debug/rollback complexity rises sharply with broad tuning bundles.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/MAMBO-lakes-resources-waterfill-rootcause

### Quick Take
- Lifecycle ordering fix is correct: recalc areas then water cache sync after lakes.
- Review branch: `agent-TOMMY-M4-T16-review-MAMBO-lakes-resources-waterfill-rootca-693afa`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1283

### High-Leverage Issues
- No blocking branch-local defect confirmed in this pass.

### PR Comment Context
- PR #1238 has no unresolved human inline review threads.
- PR #1238: fix(hydrology): recalculate areas after lake generation to preserve water tiles (https://github.com/mateicanavra/civ7-modding-tools/pull/1238)

### Fix Now (Recommended)
- None immediate.

### Defer / Follow-up
- Continue toward deterministic lake authority migration.

### Needs Discussion
- None.

### Cross-cutting Risks
- Engine-lake authority can still diverge from hydrology truth at edges.
- Runtime-vs-viz mismatch analysis: observed: branch specifically mitigates runtime-vs-viz/lifecycle mismatch. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/MAMBO-elevation-terrain-parity-audit

### Quick Take
- Elevation parity optimization improves performance and avoids unnecessary restoration.
- Review branch: `agent-TOMMY-M4-T17-review-MAMBO-elevation-terrain-parity-audit-06489e`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1284

### High-Leverage Issues
- Drift detection can false-negative when water cache state is stale.

### PR Comment Context
- PR #1239 has no unresolved human inline review threads.
- PR #1239: perf(map-morphology): optimize buildElevation to avoid unnecessary terrain restoration (https://github.com/mateicanavra/civ7-modding-tools/pull/1239)

### Fix Now (Recommended)
- Add stale-cache false-negative test and harden drift guard.

### Defer / Follow-up
- Add telemetry for repair-skipped decision paths.

### Needs Discussion
- Performance optimization boundaries vs strict correctness checks.

### Cross-cutting Risks
- Missed drift can cascade into hydrology/ecology/placement artifacts.
- Runtime-vs-viz mismatch analysis: observed: potential stale-cache mismatch between runtime state and parity logic. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/MAMBO-resources-stamping-rootcause

### Quick Take
- Restamp-before-resource generation addresses root cause directionally.
- Review branch: `agent-TOMMY-M4-T18-review-MAMBO-resources-stamping-rootcause-01732c`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1285

### High-Leverage Issues
- Failure path is fail-open: code logs restamp failure and continues generation.

### PR Comment Context
- PR #1240 has unresolved P2 feedback on fail-open continuation.
- PR #1240: fix(placement): restamp landmass regions before resource generation (https://github.com/mateicanavra/civ7-modding-tools/pull/1240)

### Fix Now (Recommended)
- Make restamp failure fatal or explicitly skip downstream generation.

### Defer / Follow-up
- Replace placeholder resource-count outputs with real counts.

### Needs Discussion
- Fail-fast policy for placement pipeline invariants.

### Cross-cutting Risks
- Catch-and-continue can hide invalid world-state generation.
- Runtime-vs-viz mismatch analysis: observed: invalid state can propagate despite logged failure. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/MAMBO-elevation-post-hydrology-lifecycle

### Quick Take
- Post-river area/water refresh correctly restores lifecycle ordering.
- Review branch: `agent-TOMMY-M4-T19-review-MAMBO-elevation-post-hydrology-lifecyc-2f0228`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1286

### High-Leverage Issues
- No blocking branch-local defect confirmed in this pass.

### PR Comment Context
- PR #1241 has no unresolved human inline review threads.
- PR #1241: fix(hydrology): refresh area/water caches after river generation (https://github.com/mateicanavra/civ7-modding-tools/pull/1241)

### Fix Now (Recommended)
- None immediate.

### Defer / Follow-up
- Convert spike diagnostics into enforceable parity gates.

### Needs Discussion
- Formal lifecycle invariant scope across map-hydrology and map-ecology.

### Cross-cutting Risks
- Parity divergence remains possible without hard gates.
- Runtime-vs-viz mismatch analysis: observed: branch mitigates a known runtime-vs-viz/lifecycle mismatch. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/prr-epp-s0-plan-bootstrap

### Quick Take
- Bootstrap plan establishes sequence and constraints for EPP continuum.
- Review branch: `agent-TOMMY-M4-T20-review-prr-epp-s0-plan-bootstrap-888878`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1287

### High-Leverage Issues
- Plan docs use machine-local absolute paths that reduce portability.

### PR Comment Context
- PR #1258 has one unresolved doc portability review thread.
- PR #1258: docs(plan): bootstrap ecology placement physics cutover s0 (https://github.com/mateicanavra/civ7-modding-tools/pull/1258)

### Fix Now (Recommended)
- Convert canonical plan/scratch references to repo-relative paths.

### Defer / Follow-up
- None.

### Needs Discussion
- Whether absolute local paths are ever acceptable in canonical docs.

### Cross-cutting Risks
- Portability issues can break collaboration and automation reuse.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/prr-epp-s1-drift-observability

### Quick Take
- Observe-first parity diagnostics are wired across key projection stages.
- Review branch: `agent-TOMMY-M4-T21-review-prr-epp-s1-drift-observability-60cf6d`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1288

### High-Leverage Issues
- No blocking branch-local defect confirmed in this pass.

### PR Comment Context
- PR #1259 has no unresolved review threads.
- PR #1259: feat(map): add observe-first parity diagnostics across projection stages (https://github.com/mateicanavra/civ7-modding-tools/pull/1259)

### Fix Now (Recommended)
- None immediate.

### Defer / Follow-up
- Tighten fail-hard thresholds as hardening progresses.

### Needs Discussion
- Signal-to-noise targets for parity diagnostics in CI.

### Cross-cutting Risks
- Telemetry volume can dilute critical regressions without curation.
- Runtime-vs-viz mismatch analysis: observed: mismatch channels are intentionally surfaced. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/prr-epp-s2-ecology-physics-cutover

### Quick Take
- Core deterministic ecology cutover landed and aligns with intended architecture.
- Review branch: `agent-TOMMY-M4-T22-review-prr-epp-s2-ecology-physics-cutover-38049d`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1289

### High-Leverage Issues
- Legacy map-ecology key translation drop can break existing configs branch-locally.

### PR Comment Context
- PR #1260 has one unresolved compatibility review thread.
- PR #1260: feat(ecology): enforce deterministic physics-first planners (https://github.com/mateicanavra/civ7-modding-tools/pull/1260)

### Fix Now (Recommended)
- Restore compatibility mapping or complete all config migrations in same slice.

### Defer / Follow-up
- Remove compatibility path only after explicit migration closure.

### Needs Discussion
- Policy for intentional mid-stack breaking changes.

### Cross-cutting Risks
- Branch-local breakage risk if consumed outside full stack context.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/prr-epp-s3-lakes-deterministic

### Quick Take
- Deterministic lake-plan authority replaced random engine lake generation.
- Review branch: `agent-TOMMY-M4-T23-review-prr-epp-s3-lakes-deterministic-2ad056`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1290

### High-Leverage Issues
- Upstream expansion mutates lake mask in-pass and can violate hop semantics.

### PR Comment Context
- PR #1261 has one unresolved algorithmic correctness review thread.
- PR #1261: feat(map-hydrology): cut over lakes to deterministic hydrology plan (https://github.com/mateicanavra/civ7-modding-tools/pull/1261)

### Fix Now (Recommended)
- Use frontier/snapshot expansion to avoid in-pass mutation effects.

### Defer / Follow-up
- Add property tests for hop-distance invariants.

### Needs Discussion
- Keep nonzero upstream expansion vs sink-only posture.

### Cross-cutting Risks
- Order-coupled expansion can produce non-physical lake growth.
- Runtime-vs-viz mismatch analysis: observed: runtime lake growth can diverge from intended planning semantics. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/prr-epp-s3b-lakes-regression-fix

### Quick Take
- Default sink-only setting mitigates lake over-placement regression.
- Review branch: `agent-TOMMY-M4-T24-review-prr-epp-s3b-lakes-regression-fix-08449d`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1291

### High-Leverage Issues
- Latent algorithmic bug remains reachable when nonzero upstream steps are enabled.

### PR Comment Context
- PR #1264 has no unresolved threads, but latent risk remains.
- PR #1264: fix(hydrology): change default maxUpstreamSteps to 0 to prevent lake over-placement (https://github.com/mateicanavra/civ7-modding-tools/pull/1264)

### Fix Now (Recommended)
- Patch nonzero expansion semantics before enabling beyond default.

### Defer / Follow-up
- Document maxUpstreamSteps as constrained or experimental.

### Needs Discussion
- Deprecate knob vs keep with fixed semantics.

### Cross-cutting Risks
- Default-only mitigation can hide unresolved root-cause paths.
- Runtime-vs-viz mismatch analysis: observed: mitigation reduces mismatch by constraining behavior. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/prr-epp-s4-resources-deterministic

### Quick Take
- Deterministic resource planning/stamping and adapter updates are coherent.
- Review branch: `agent-TOMMY-M4-T25-review-prr-epp-s4-resources-deterministic-21a5eb`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1292

### High-Leverage Issues
- No blocking branch-local defect confirmed in this pass.

### PR Comment Context
- PR #1265 has no unresolved review threads.
- PR #1265: feat(placement): implement deterministic resource planning and stamping (https://github.com/mateicanavra/civ7-modding-tools/pull/1265)

### Fix Now (Recommended)
- None immediate.

### Defer / Follow-up
- Run seed-matrix balance validations under S6 hardening.

### Needs Discussion
- Candidate resource-set governance across configs/mods.

### Cross-cutting Risks
- Adapter/runtime differences can still affect deterministic outcomes.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/prr-epp-s5-placement-randomness-zero

### Quick Take
- Deterministic wonders/discoveries cut random placement authority successfully.
- Review branch: `agent-TOMMY-M4-T26-review-prr-epp-s5-placement-randomness-zero-9913bc`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1293

### High-Leverage Issues
- Two significant regressions remain: wonders key compatibility and discovery default mapping semantics.

### PR Comment Context
- PR #1266 has unresolved P1 and P2 review threads.
- PR #1266: feat(placement): replace random wonders/discoveries with deterministic stamping (https://github.com/mateicanavra/civ7-modding-tools/pull/1266)

### Fix Now (Recommended)
- Fix config key migration/compat and ensure discovery defaults reflect active runtime mapping.

### Defer / Follow-up
- Add conformance tests for non-default discovery mappings.

### Needs Discussion
- Backward-compatibility expectations for config surfaces during cutover.

### Cross-cutting Risks
- Branch-local compile/semantic drift risk in modded configs.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/prr-epp-s6-hardening-docs-tests

### Quick Take
- Hardening/docs/tests sweep closes many continuity gaps and expands scans.
- Review branch: `agent-TOMMY-M4-T27-review-prr-epp-s6-hardening-docs-tests-4fee2c`; review PR: https://github.com/mateicanavra/civ7-modding-tools/pull/1294

### High-Leverage Issues
- No unresolved branch review thread, but latent hydrology nonzero-upstream risk still exists.

### PR Comment Context
- PR #1267 has no unresolved review threads.
- PR #1267: feat(pipeline-realism): add ecology-placement-physics cutover plan and implementation (https://github.com/mateicanavra/civ7-modding-tools/pull/1267)

### Fix Now (Recommended)
- Optionally lock maxUpstreamSteps to sink-only until algorithmic fix lands.

### Defer / Follow-up
- Track follow-up for discovery default mapping fidelity audit.

### Needs Discussion
- Permanently disallow nonzero upstream expansion vs fix and support.

### Cross-cutting Risks
- Hidden regressions can return if sensitive knobs are re-enabled without guards.
- Runtime-vs-viz mismatch analysis: observed: branch hardens mismatch detection but inherits prior latent algorithm risk. Gameplay/runtime truth remains authoritative when conflicts exist.
