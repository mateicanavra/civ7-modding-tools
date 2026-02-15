# Scratch — worker-hydro-bridge

- Session Start (ISO timestamp): 2026-02-15T02:52:56Z
- Owned scope: M4-T14..M4-T19 across `codex/M3-015-hydrology-effectiveMoisture-soils`, `codex/default-config-intent-tuning`, `codex/MAMBO-lakes-resources-waterfill-rootcause`, `codex/MAMBO-elevation-terrain-parity-audit`, `codex/MAMBO-resources-stamping-rootcause`, `codex/MAMBO-elevation-post-hydrology-lifecycle`
- Mini-plan (next 3-5 actions):
  1. Capture branch/PR context and unresolved-review threads for each owned branch.
  2. Extract M4-T14..M4-T19 fix-now entries from review doc and map to code paths/tests.
  3. Reproduce each item at tip `codex/prr-epp-s6-hardening-docs-tests` with read-only checks.
  4. Determine supersedence/downstream coverage and classify each task.
  5. Append per-task adjudication blocks + handoff totals to this scratchpad.
- Open questions / blockers: Need authoritative unresolved-comment signal per PR (Graphite/GitHub CLI availability to be confirmed).

## Live Notes
- Pending worker kickoff.
- Worktree safety check:
  - `pwd -P` => `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-TOMMY-m4-fix-bootstrap`
  - `git rev-parse --show-toplevel` => `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-TOMMY-m4-fix-bootstrap`
  - `git branch --show-current` => `agent-TOMMY-m4-fix-bootstrap`

## M4-T14 codex/M3-015-hydrology-effectiveMoisture-soils
- Review fix-now item(s): Re-tighten unknown-key validation or add explicit rejection tests.
- PR context (PR #/URL, unresolved comments): PR #1236 (https://github.com/mateicanavra/civ7-modding-tools/pull/1236), unresolved review threads: 0.
- Repro at tip: Not reproducible for the core concern (unknown keys accepted). Tip enforces strict unknown-key rejection; no explicit hydrology-climate-refine rejection test was found.
- Supersedence evidence (branch/PR): No downstream superseding fix branch identified; strict behavior is already present at tip via core schema/normalization.
- Classification: No actionable fix-now
- Evidence paths/commands:
  - `packages/mapgen-core/src/authoring/schema.ts` (auto-sets `additionalProperties=false` when omitted).
  - `packages/mapgen-core/src/compiler/normalize.ts` (`findUnknownKeyErrors` emits `"Unknown key"` when `additionalProperties === false`).
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/steps/climateRefine.contract.ts` (empty object schema).
  - `packages/mapgen-core/test/authoring/authoring.test.ts` ("compile applies schema defaults and rejects unknown keys").
  - Commands: `git show codex/prr-epp-s6-hardening-docs-tests:<path> | nl -ba | sed -n ...`, `rg -n "unknown key|additionalProperties" ...`.
- Residual risk: Stage-specific regression coverage for hydrology-climate-refine unknown-key rejection is implicit, not explicit.
- Recommended next action: Optional follow-up test in `mods/mod-swooper-maps/test/standard-compile-errors.test.ts` covering `hydrology-climate-refine.climate-refine` unknown keys.
- Status: done

## M4-T15 codex/default-config-intent-tuning
- Review fix-now item(s): Gate acceptance on seed-matrix diagnostics and metric deltas.
- PR context (PR #/URL, unresolved comments): PR #1237 (https://github.com/mateicanavra/civ7-modding-tools/pull/1237), unresolved review threads: 0.
- Repro at tip: Not reproducible. Tip carries quantitative acceptance coverage (seed-matrix determinism + earth metrics thresholds).
- Supersedence evidence (branch/PR): Superseded downstream by `codex/prr-epp-s6-hardening-docs-tests` / PR #1267 (https://github.com/mateicanavra/civ7-modding-tools/pull/1267), commit `95c82d3b9`.
- Classification: Already tracked/superseded
- Evidence paths/commands:
  - `mods/mod-swooper-maps/test/pipeline/seed-matrix-stats.test.ts` (canonical seeds deterministic + metric bounds).
  - `mods/mod-swooper-maps/test/pipeline/earth-metrics.test.ts` (land/lake/river/biome threshold assertions).
  - `mods/mod-swooper-maps/src/dev/diagnostics/extract-earth-metrics.ts`.
  - Command: `git log --oneline codex/default-config-intent-tuning..codex/prr-epp-s6-hardening-docs-tests -- <metrics files>`.
- Residual risk: Current thresholds are broad sanity gates, not strict per-preset delta envelopes.
- Recommended next action: If desired, tighten bounds and add explicit delta checks against a frozen baseline artifact.
- Status: done

## M4-T16 codex/MAMBO-lakes-resources-waterfill-rootcause
- Review fix-now item(s): None immediate.
- PR context (PR #/URL, unresolved comments): PR #1238 (https://github.com/mateicanavra/civ7-modding-tools/pull/1238), unresolved review threads: 0.
- Repro at tip: No fix-now defect reproduced; lake lifecycle ordering safeguards remain in place at tip.
- Supersedence evidence (branch/PR): N/A for fix-now; downstream branches continue hardening deterministic lake/placement flow (`codex/prr-epp-s3-lakes-deterministic` / PR #1261).
- Classification: No actionable fix-now
- Evidence paths/commands:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.ts` (`recalculateAreas` + `storeWaterData` after lake projection).
  - `mods/mod-swooper-maps/test/map-hydrology/lakes-area-recalc-resources.test.ts` (ordering + downstream resource placement continuity).
  - Command: `git show codex/prr-epp-s6-hardening-docs-tests:<path> | nl -ba | sed -n ...`.
- Residual risk: Edge-case engine/hydrology divergence still depends on continued parity gate coverage.
- Recommended next action: Continue planned deterministic-lake authority migration and parity checks.
- Status: done

## M4-T17 codex/MAMBO-elevation-terrain-parity-audit
- Review fix-now item(s): Add stale-cache false-negative test and harden drift guard.
- PR context (PR #/URL, unresolved comments): PR #1239 (https://github.com/mateicanavra/civ7-modding-tools/pull/1239), unresolved review threads: 0.
- Repro at tip: Not reproducible. Drift guard uses cache-backed `isWater` checks and full snapshot restore with cache sync; stale-cache regression test exists.
- Supersedence evidence (branch/PR): No separate downstream superseding fix branch required for this defect; downstream `codex/prr-epp-s1-drift-observability` / PR #1259 adds observability on top.
- Classification: No actionable fix-now
- Evidence paths/commands:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.ts` (drift detection + repair path).
  - `mods/mod-swooper-maps/test/map-morphology/build-elevation-no-water-drift.test.ts` (stale cache drift simulation).
  - Command: `git log --oneline codex/MAMBO-elevation-terrain-parity-audit..codex/prr-epp-s6-hardening-docs-tests -- <buildElevation files>`.
- Residual risk: Follow-up telemetry for repair-skipped paths is still a quality improvement opportunity.
- Recommended next action: Keep as follow-up observability hardening, not fix-now.
- Status: done

## M4-T18 codex/MAMBO-resources-stamping-rootcause
- Review fix-now item(s): Make restamp failure fatal or explicitly skip downstream generation.
- PR context (PR #/URL, unresolved comments): PR #1240 (https://github.com/mateicanavra/civ7-modding-tools/pull/1240), unresolved review threads: 1 (`apply.ts` fail-open thread: https://github.com/mateicanavra/civ7-modding-tools/pull/1240#discussion_r2807972031).
- Repro at tip: Reproducible. Tip still catches `applyLandmassRegionSlots` failure, logs error, and continues into resource stamping.
- Supersedence evidence (branch/PR): No downstream superseding fix found; fail-open path remains present at `codex/prr-epp-s6-hardening-docs-tests` / PR #1267.
- Classification: Fix now
- Evidence paths/commands:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts` (catch at landmass restamp, then unconditional resource stamping block).
  - Command: `gh api graphql ... number=1240 ... reviewThreads ...` (unresolved inline thread).
  - Command: `git show codex/prr-epp-s6-hardening-docs-tests:mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts | nl -ba | sed -n '150,220p'`.
- Residual risk: Invalid landmass-region state can silently propagate into resources/starts/discoveries and produce invalid world outputs.
- Recommended next action: Implement fail-fast or explicit gated skip for downstream placement passes when restamp fails; add regression test that forces restamp throw and asserts guarded behavior.
- Status: needs decision

## M4-T19 codex/MAMBO-elevation-post-hydrology-lifecycle
- Review fix-now item(s): None immediate.
- PR context (PR #/URL, unresolved comments): PR #1241 (https://github.com/mateicanavra/civ7-modding-tools/pull/1241), unresolved review threads: 0.
- Repro at tip: No fix-now defect reproduced; post-river cache refresh remains implemented and regression-tested.
- Supersedence evidence (branch/PR): N/A for fix-now; downstream `codex/prr-epp-s1-drift-observability` / PR #1259 adds parity observability but does not indicate unresolved defect.
- Classification: No actionable fix-now
- Evidence paths/commands:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/plotRivers.ts` (`recalculateAreas` + `storeWaterData` after river/validate).
  - `mods/mod-swooper-maps/test/map-hydrology/plot-rivers-post-refresh.test.ts` (asserts refresh call order and water-cache correctness).
  - Command: `git log --oneline codex/MAMBO-elevation-post-hydrology-lifecycle..codex/prr-epp-s6-hardening-docs-tests -- <plotRivers files>`.
- Residual risk: Future lifecycle edits could regress if refresh ordering is bypassed.
- Recommended next action: Keep parity/lifecycle invariant coverage as planned in pipeline-realism hardening.
- Status: done

## Handoff
- Totals: `Fix now=1` (`M4-T18`), `Already tracked/superseded=1` (`M4-T15`), `No actionable fix-now=4` (`M4-T14`, `M4-T16`, `M4-T17`, `M4-T19`), `Defer=0`, `Needs discussion=0`.
- Blockers: Runtime test execution in this worktree currently fails without workspace dependency linking (`Cannot find module '@civ7/adapter'` from `bun test ...`); adjudication above relies on direct code/PR evidence.
