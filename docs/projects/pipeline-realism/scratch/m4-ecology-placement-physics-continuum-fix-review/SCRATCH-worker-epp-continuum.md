# Scratch — worker-epp-continuum

- Session Start (ISO timestamp): 2026-02-15T03:05:40Z
- Owned scope: M4-T20..M4-T27 (`codex/prr-epp-s0-plan-bootstrap` through `codex/prr-epp-s6-hardening-docs-tests`)
- Mini-plan (next 3-5 actions):
  1. Pull fix-now entries for M4-T20..M4-T27 from REVIEW-M4.
  2. Gather PR context and unresolved comments for s0..s6 branches.
  3. Reproduce/verify each issue at tip `codex/prr-epp-s6-hardening-docs-tests`.
  4. Determine downstream supersedence and classify each task.
  5. Write adjudication blocks and handoff summary.
- Open questions / blockers: Need to confirm whether unresolved PR comments that are now stale (due to downstream changes) should be marked as superseded vs no-actionable.

## Live Notes
- Worker kickoff complete in dedicated TOMMY worktree; starting M4-T20..M4-T27 adjudication.

## M4-T20 codex/prr-epp-s0-plan-bootstrap
- Review fix-now item(s): Convert canonical plan/scratch references to repo-relative paths.
- PR context (PR #/URL, unresolved comments): PR #1258 https://github.com/mateicanavra/civ7-modding-tools/pull/1258; unresolved comments: 1 (doc portability thread on absolute paths).
- Repro at tip: Reproducible at `codex/prr-epp-s6-hardening-docs-tests` (`c55febd8`): plan still contains many machine-local absolute paths.
- Supersedence evidence (branch/PR): None found downstream; issue remains open at tip.
- Classification: Fix now
- Evidence paths/commands:
  - `rg -n "/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/" docs/projects/pipeline-realism/plans/PLAN-ecology-placement-physics-cutover-2026-02-14.md`
- Residual risk: Non-portable execution steps force manual reinterpretation and increase cross-environment drift.
- Recommended next action: Replace absolute paths with repo-relative paths in plan/scratch references.
- Status: done

## M4-T21 codex/prr-epp-s1-drift-observability
- Review fix-now item(s): None immediate.
- PR context (PR #/URL, unresolved comments): PR #1259 https://github.com/mateicanavra/civ7-modding-tools/pull/1259; unresolved comments: 0.
- Repro at tip: No fix-now issue to reproduce from review entry.
- Supersedence evidence (branch/PR): N/A (no fix-now defect identified).
- Classification: No actionable fix-now
- Evidence paths/commands:
  - REVIEW entry for `codex/prr-epp-s1-drift-observability` lists `Fix Now (Recommended): None immediate`.
  - `gh api graphql ... number=1259` => unresolved `count=0`.
- Residual risk: Telemetry volume/threshold tuning still requires follow-up but not as a fix-now defect.
- Recommended next action: Keep deferred threshold calibration under hardening follow-up.
- Status: done

## M4-T22 codex/prr-epp-s2-ecology-physics-cutover
- Review fix-now item(s): Restore compatibility mapping or complete all config migrations in same slice.
- PR context (PR #/URL, unresolved comments): PR #1260 https://github.com/mateicanavra/civ7-modding-tools/pull/1260; unresolved comments: 1 (legacy map-ecology key translation thread).
- Repro at tip: Original in-repo preset/config mismatch from the PR thread is not reproducible at tip; shipped configs/preset now use kebab-case stage-step keys (`plot-biomes`, `plot-effects`, `features-apply`).
- Supersedence evidence (branch/PR): Downstream `codex/prr-epp-s6-hardening-docs-tests` / PR #1267 carries migrated in-repo config/preset surfaces.
- Classification: Already tracked/superseded
- Evidence paths/commands:
  - `git show codex/prr-epp-s6-hardening-docs-tests:mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`
  - `jq '.\"map-ecology\" | keys' mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json`
  - `jq '.config.\"map-ecology\" | keys' mods/mod-swooper-maps/src/presets/standard/earthlike.json`
  - `rg -n "featuresApply" mods/mod-swooper-maps/src/maps/configs mods/mod-swooper-maps/src/presets -g '*.ts' -g '*.json'` (no matches)
- Residual risk: External legacy configs (outside repo) can still break without a documented compatibility/error policy.
- Recommended next action: Document this as an intentional breaking surface or add explicit legacy-key error guidance.
- Status: done

## M4-T23 codex/prr-epp-s3-lakes-deterministic
- Review fix-now item(s): Use frontier/snapshot expansion to avoid in-pass mutation effects.
- PR context (PR #/URL, unresolved comments): PR #1261 https://github.com/mateicanavra/civ7-modding-tools/pull/1261; unresolved comments: 1 (upstream-expansion correctness thread).
- Repro at tip: Reproducible; upstream expansion still mutates `lakeMask` in pass while reading `lakeMask[receiver]`, allowing order-coupled multi-hop growth in a single step.
- Supersedence evidence (branch/PR): None found downstream to tip; same algorithm remains.
- Classification: Fix now
- Evidence paths/commands:
  - `git show codex/prr-epp-s6-hardening-docs-tests:mods/mod-swooper-maps/src/domain/hydrology/ops/plan-lakes/strategies/default.ts | nl -ba | sed -n '28,43p'`
  - Repro probe:
    - `bun -e '... flowDir=[-1,0,1,2,3], sink at 0, maxUpstreamSteps=1 ...'` => `[1,1,1,1,1]` (multi-hop expansion in one pass)
- Residual risk: Lake growth depends on tile iteration order instead of hop distance semantics.
- Recommended next action: Implement per-pass snapshot/frontier semantics and add hop-distance invariant tests.
- Status: done

## M4-T24 codex/prr-epp-s3b-lakes-regression-fix
- Review fix-now item(s): Patch nonzero expansion semantics before enabling beyond default.
- PR context (PR #/URL, unresolved comments): PR #1264 https://github.com/mateicanavra/civ7-modding-tools/pull/1264; unresolved comments: 0.
- Repro at tip: Reproducible for non-default configs; contract still exposes `maxUpstreamSteps` (`0..8`) and strategy still uses in-pass mutation.
- Supersedence evidence (branch/PR): Partial mitigation only: `codex/prr-epp-s3b-lakes-regression-fix` / PR #1264 changed default to sink-only (`0`), carried into tip via PR #1267.
- Classification: Fix now
- Evidence paths/commands:
  - `git show codex/prr-epp-s6-hardening-docs-tests:mods/mod-swooper-maps/src/domain/hydrology/ops/plan-lakes/contract.ts | nl -ba | sed -n '31,39p'`
  - `rg -n "maxUpstreamSteps" mods/mod-swooper-maps/src/domain/hydrology/ops/plan-lakes mods/mod-swooper-maps/test/hydrology-plan-lakes.test.ts`
- Residual risk: Any nonzero override reintroduces the unresolved lake expansion defect.
- Recommended next action: Either hard-clamp nonzero values to 0 until fix lands or land T23 frontier fix before allowing nonzero.
- Status: done

## M4-T25 codex/prr-epp-s4-resources-deterministic
- Review fix-now item(s): None immediate.
- PR context (PR #/URL, unresolved comments): PR #1265 https://github.com/mateicanavra/civ7-modding-tools/pull/1265; unresolved comments: 0.
- Repro at tip: No fix-now issue to reproduce from review entry.
- Supersedence evidence (branch/PR): N/A (no fix-now defect identified).
- Classification: No actionable fix-now
- Evidence paths/commands:
  - REVIEW entry for `codex/prr-epp-s4-resources-deterministic` lists `Fix Now (Recommended): None immediate`.
  - `gh api graphql ... number=1265` => unresolved `count=0`.
- Residual risk: Deterministic resource quality/seed-matrix balance still needs deferred validation.
- Recommended next action: Keep seed-matrix balance checks in follow-up hardening.
- Status: done

## M4-T26 codex/prr-epp-s5-placement-randomness-zero
- Review fix-now item(s): (1) Fix config key migration/compat. (2) Ensure discovery defaults reflect active runtime mapping.
- PR context (PR #/URL, unresolved comments): PR #1266 https://github.com/mateicanavra/civ7-modding-tools/pull/1266; unresolved comments: 2 (wonders config migration + discovery default mapping).
- Repro at tip:
  - (1) Prior in-repo `wondersPlusOne` compatibility break from PR thread is not reproducible in shipped configs/support files at tip (migration complete).
  - (2) Reproducible: adapter default discovery placement remains hardcoded to `IMPROVEMENT_CAVE` + `BASIC`.
- Supersedence evidence (branch/PR):
  - (1) Superseded downstream by `codex/prr-epp-s6-hardening-docs-tests` / PR #1267 (in-repo config migration).
  - (2) No downstream supersedence found to tip.
- Classification: Fix now
- Evidence paths/commands:
  - `rg -n "wondersPlusOne" mods/mod-swooper-maps/src/maps/configs mods/mod-swooper-maps/src/presets mods/mod-swooper-maps/test/support -g '*.ts' -g '*.json'` (no matches)
  - `git show codex/prr-epp-s6-hardening-docs-tests:packages/civ7-adapter/src/civ7-adapter.ts | nl -ba | sed -n '530,547p'`
  - `git show codex/prr-epp-s6-hardening-docs-tests:mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/derive-placement-inputs/inputs.ts | nl -ba | sed -n '48,76p'`
- Residual risk: Discovery stamping can diverge from runtime discovery-sifting mappings in modded/non-default environments.
- Recommended next action: Resolve discovery defaults from active runtime mapping (or make mapping explicit/configured) instead of fixed constants.
- Status: done

## M4-T27 codex/prr-epp-s6-hardening-docs-tests
- Review fix-now item(s): Optionally lock `maxUpstreamSteps` to sink-only until algorithmic fix lands.
- PR context (PR #/URL, unresolved comments): PR #1267 https://github.com/mateicanavra/civ7-modding-tools/pull/1267; unresolved comments: 0.
- Repro at tip: Latent nonzero-upstream risk remains reproducible (knob still exposed; T23 algorithm issue unresolved).
- Supersedence evidence (branch/PR): Partial mitigation from `codex/prr-epp-s3b-lakes-regression-fix` / PR #1264 (default `maxUpstreamSteps=0`) is present at tip, but hard lock is not.
- Classification: Needs discussion
- Evidence paths/commands:
  - `git show codex/prr-epp-s6-hardening-docs-tests:mods/mod-swooper-maps/src/domain/hydrology/ops/plan-lakes/contract.ts | nl -ba | sed -n '31,39p'`
  - `git show codex/prr-epp-s6-hardening-docs-tests:mods/mod-swooper-maps/src/domain/hydrology/ops/plan-lakes/strategies/default.ts | nl -ba | sed -n '28,43p'`
  - `rg -n "maxUpstreamSteps" mods/mod-swooper-maps/test/hydrology-plan-lakes.test.ts`
- Residual risk: A future nonzero config change can silently re-enable order-coupled lake over-expansion.
- Recommended next action: Decide policy now: (A) hard-lock to 0 until frontier fix lands, or (B) keep experimental with explicit docs/guards.
- Status: needs decision

## Handoff
- Totals: 8 tasks adjudicated (`Fix now`: 4, `Already tracked/superseded`: 1, `Needs discussion`: 1, `No actionable fix-now`: 2, `Defer`: 0).
- Tip baseline used for reproducibility checks: `codex/prr-epp-s6-hardening-docs-tests` at `c55febd8af83ed04894c27d8aa2da5cac4659ad1`.
- Key open decisions:
  - T27: hard-lock `maxUpstreamSteps` to 0 vs keep configurable pending frontier fix.
  - T22 residual: whether to formalize external legacy `map-ecology` key breakage policy/documentation.
- Operational blockers: none.

## Continuation Start (2026-02-15T03:48:56Z)
- Session Start (ISO timestamp): 2026-02-15T03:48:56Z
- Owned scope: Remaining M4 fix-loop closure per frozen queue (19 tasks).
- Mini-plan (next 3-5 actions):
  1. Run absolute-path preflight and verify worktree/branch context.
  2. Re-check PR comments and classification for assigned remaining tasks.
  3. Execute assigned code-fix/disposition outcomes and capture evidence.
  4. Record runtime-vs-viz conclusion and recommended next action.
- Open questions / blockers: none at re-anchor.
- Guardrails: absolute paths only; no primary worktree edits; Graphite-only branch operations.
