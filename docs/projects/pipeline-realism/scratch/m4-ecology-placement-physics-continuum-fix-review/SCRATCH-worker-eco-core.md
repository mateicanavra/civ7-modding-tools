# Scratch — worker-eco-core

- Session Start (ISO timestamp): 2026-02-15T02:52:55Z
- Owned scope: M4-T01..M4-T13 across listed codex/MAMBO-m3-* branches; adjudication against tip `codex/prr-epp-s6-hardening-docs-tests`
- Mini-plan (next 3-5 actions):
  1. Pull fix-now entries from REVIEW-M4 doc and map to M4-T01..M4-T13.
  2. Gather PR context per owned branch (PR URL/number + unresolved comments).
  3. Verify reproducibility against tip branch and check downstream supersedence.
  4. Write per-task adjudication blocks with evidence and classification.
- Open questions / blockers: Need consistent CLI/API source for unresolved PR review comments across all listed branches.

## Live Notes
- Worker kickoff complete; beginning adjudication wave.
- Safety correction check @ 2026-02-15T02:56:32Z:
  - `pwd -P` => `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-TOMMY-m4-fix-bootstrap`
  - `git rev-parse --show-toplevel` => `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-TOMMY-m4-fix-bootstrap`
  - `git branch --show-current` => `agent-TOMMY-m4-fix-bootstrap`
  - Action: continue adjudication from dedicated TOMMY worktree only.

## M4-T01 codex/MAMBO-m3-002-stage-split-earth-system-first
- Review fix-now item(s): Add explicit legacy-to-new stage key migration or hard error path.
- PR context (PR #/URL, unresolved comments): PR #1223 https://github.com/mateicanavra/civ7-modding-tools/pull/1223; unresolved comments: 1 compatibility thread (`recipe.ts` legacy ecology mapping).
- Repro at tip: Reproducible at `codex/prr-epp-s6-hardening-docs-tests` (tip `c55febd8`): split ecology stage IDs are present, no explicit legacy `ecology` alias/migration path found in recipe or compile path.
- Supersedence evidence (branch/PR): None found downstream up to `codex/prr-epp-s6-hardening-docs-tests` / PR #1267.
- Classification: Fix now
- Evidence paths/commands:
  - `git show codex/prr-epp-s6-hardening-docs-tests:mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
  - `packages/mapgen-core/src/compiler/recipe-compile.ts` (compile loops known stages; no root-stage alias handling)
  - `rg -n "legacy.*ecology|ecology.*legacy" mods/mod-swooper-maps/src/recipes/standard packages/mapgen-core/src`
- Residual risk: Legacy configs may silently drift from intended behavior when consumed outside full migration context.
- Recommended next action: Implement explicit `ecology -> ecology-*` mapping adapter or fail-fast on legacy key with actionable error.
- Status: done

## M4-T02 codex/MAMBO-m3-003-scorelayers-artifact-and-score-ops
- Review fix-now item(s): Remove blanket deep-ocean reservation from shared occupancy base.
- PR context (PR #/URL, unresolved comments): PR #1224 https://github.com/mateicanavra/civ7-modding-tools/pull/1224; unresolved comments: 1 occupancy/placement semantics thread.
- Repro at tip: Reproducible. Tip still reserves `deepWater || navigableRiver` in occupancy base.
- Supersedence evidence (branch/PR): None found downstream to tip / PR #1267.
- Classification: Fix now
- Evidence paths/commands:
  - `git show codex/prr-epp-s6-hardening-docs-tests:mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features-score/steps/score-layers/index.ts | nl -ba | sed -n '236,272p'`
- Residual risk: Ice-eligible deep ocean tiles remain permanently blocked, causing score/occupancy divergence.
- Recommended next action: Reserve only hard blockers in shared occupancy base and let family planners enforce feature-specific ocean constraints.
- Status: done

## M4-T03 codex/MAMBO-m3-004-plan-ice-deterministic
- Review fix-now item(s): Align seed schema with derived seed behavior across planners.
- PR context (PR #/URL, unresolved comments): PR #1225 https://github.com/mateicanavra/civ7-modding-tools/pull/1225; unresolved comments: 1 seed contract mismatch thread.
- Repro at tip: Reproducible. `plan-ice` contract enforces `seed >= 0`, while derived step seeds are signed and can be negative.
- Supersedence evidence (branch/PR): None found downstream to tip / PR #1267.
- Classification: Fix now
- Evidence paths/commands:
  - `git show codex/prr-epp-s6-hardening-docs-tests:mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-ice/contract.ts | nl -ba | sed -n '1,40p'`
  - `git show codex/prr-epp-s6-hardening-docs-tests:packages/mapgen-core/src/lib/rng/label.ts | nl -ba | sed -n '1,80p'`
  - `bun -e 'import { deriveStepSeed } from "./packages/mapgen-core/src/lib/rng/label.ts"; ...'` => `negative_count 2000`
- Residual risk: Valid deterministic runs can fail schema validation when signed seeds are produced.
- Recommended next action: Standardize planner seed contract (signed int32 or explicit uint32 normalization) and add contract tests.
- Status: done

## M4-T04 codex/MAMBO-m3-005-plan-reefs-deterministic
- Review fix-now item(s): None immediate.
- PR context (PR #/URL, unresolved comments): PR #1226 https://github.com/mateicanavra/civ7-modding-tools/pull/1226; unresolved comments: 0.
- Repro at tip: No fix-now issue to repro from review entry.
- Supersedence evidence (branch/PR): N/A; no fix-now item.
- Classification: No actionable fix-now
- Evidence paths/commands:
  - REVIEW entry states `Fix Now (Recommended): None immediate`.
  - PR context query: `gh api graphql ... number=1226` => `count=0`.
- Residual risk: Ecological quality regressions can hide behind deterministic correctness if realism metrics stay absent.
- Recommended next action: Keep as deferred follow-up (realism distribution checks).
- Status: done

## M4-T05 codex/MAMBO-m3-006-plan-wetlands-deterministic
- Review fix-now item(s): None immediate.
- PR context (PR #/URL, unresolved comments): PR #1227 https://github.com/mateicanavra/civ7-modding-tools/pull/1227; unresolved comments: 0.
- Repro at tip: No fix-now issue to repro from review entry.
- Supersedence evidence (branch/PR): N/A; no fix-now item.
- Classification: No actionable fix-now
- Evidence paths/commands:
  - REVIEW entry states `Fix Now (Recommended): None immediate`.
  - PR context query: `gh api graphql ... number=1227` => `count=0`.
- Residual risk: Retired strategy/config surfaces may regress quietly without explicit compatibility checks.
- Recommended next action: Keep deferred compatibility coverage in follow-up test slices.
- Status: done

## M4-T06 codex/MAMBO-m3-007-plan-vegetation-deterministic
- Review fix-now item(s): None immediate.
- PR context (PR #/URL, unresolved comments): PR #1228 https://github.com/mateicanavra/civ7-modding-tools/pull/1228; unresolved comments: 0.
- Repro at tip: No fix-now issue to repro from review entry.
- Supersedence evidence (branch/PR): N/A; no fix-now item.
- Classification: No actionable fix-now
- Evidence paths/commands:
  - REVIEW entry states `Fix Now (Recommended): None immediate`.
  - PR context query: `gh api graphql ... number=1228` => `count=0`.
- Residual risk: Planner-family behavior can drift without shared invariant coverage.
- Recommended next action: Preserve deferred seed-matrix/invariant suite additions.
- Status: done

## M4-T07 codex/MAMBO-m3-008-stamping-strict-features-apply
- Review fix-now item(s): Fix Bun timeout usage and keep strict stamping guardrails active.
- PR context (PR #/URL, unresolved comments): PR #1229 https://github.com/mateicanavra/civ7-modding-tools/pull/1229; unresolved comments: 1 (timeout signature thread).
- Repro at tip: Not reproduced as a runtime/API failure in current toolchain; timeout object signature executes under Bun v1.3.7 (test fails on ecology assertion, not timeout API mismatch).
- Supersedence evidence (branch/PR): No code-level supersedence branch found; issue appears stale/tooling-shifted relative to current Bun behavior.
- Classification: No actionable fix-now
- Evidence paths/commands:
  - `git show codex/prr-epp-s6-hardening-docs-tests:mods/mod-swooper-maps/test/ecology/earthlike-balance-smoke.test.ts | nl -ba | sed -n '8,24p'`
  - `bun test mods/mod-swooper-maps/test/ecology/earthlike-balance-smoke.test.ts --timeout 30000` (executes test body; fails on wetland threshold assertion).
- Residual risk: If Bun timeout API semantics change again, this signature could regress.
- Recommended next action: Optional follow-up lint/style rule for timeout signature consistency; no urgent fix-now required.
- Status: done

## M4-T08 codex/MAMBO-m3-009-cleanup-delete-legacy-chance
- Review fix-now item(s): (1) Make viz mapping non-throwing in runtime. (2) Restore strict unknown-key rejection for biome-noise schema surface.
- PR context (PR #/URL, unresolved comments): PR #1230 https://github.com/mateicanavra/civ7-modding-tools/pull/1230; unresolved comments: 2 (P1 viz throw + P2 schema strictness).
- Repro at tip:
  - (1) Reproducible: plot-effect viz mapping still throws on unknown keys.
  - (2) Original `noise.schema.ts` path no longer exists at tip (schema surface refactored downstream).
- Supersedence evidence (branch/PR):
  - (2) Superseded structurally by `codex/MAMBO-m3-012-fix-biomes-stripes` / PR #1233 (biome config surface redesign; prior noise schema file removed).
  - (1) Not superseded downstream; still present at tip / PR #1267.
- Classification: Fix now
- Evidence paths/commands:
  - `git show codex/prr-epp-s6-hardening-docs-tests:mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/viz.ts | nl -ba | sed -n '1,60p'`
  - `bun -e 'import { plotEffectVizValueOrThrow } ... ; plotEffectVizValueOrThrow("PLOTEFFECT_UNKNOWN" as any)'` => throws
  - `git ls-tree -r --name-only codex/prr-epp-s6-hardening-docs-tests mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes` (no `noise.schema.ts`)
- Residual risk: Runtime can abort valid placement when viz metadata lags new/unknown plot-effect keys.
- Recommended next action: Switch viz lookup to fail-open (category 0 + trace warning), keep strictness policy explicit for active biome schema surfaces.
- Status: done

## M4-T09 codex/MAMBO-m3-010-post-cutover-cleanup
- Review fix-now item(s): None code-level.
- PR context (PR #/URL, unresolved comments): PR #1231 https://github.com/mateicanavra/civ7-modding-tools/pull/1231; unresolved comments: 0.
- Repro at tip: No code fix-now item to repro.
- Supersedence evidence (branch/PR): N/A; docs-scaffold branch.
- Classification: No actionable fix-now
- Evidence paths/commands:
  - REVIEW entry states `Fix Now (Recommended): None code-level`.
  - PR context query: `gh api graphql ... number=1231` => `count=0`.
- Residual risk: Milestone progress can be misread if docs scaffolding is interpreted as runtime completion.
- Recommended next action: Keep execution closure tracking in downstream implementation branches/PRs.
- Status: done

## M4-T10 codex/MAMBO-m3-011-canonical-docs-sweep
- Review fix-now item(s): None immediate.
- PR context (PR #/URL, unresolved comments): PR #1232 https://github.com/mateicanavra/civ7-modding-tools/pull/1232; unresolved comments: 0.
- Repro at tip: No fix-now issue to repro from review entry.
- Supersedence evidence (branch/PR): N/A; docs/contracts branch with no fix-now defect identified.
- Classification: No actionable fix-now
- Evidence paths/commands:
  - REVIEW entry states `Fix Now (Recommended): None immediate`.
  - PR context query: `gh api graphql ... number=1232` => `count=0`.
- Residual risk: Docs/reference drift remains possible without behavior-conformance automation.
- Recommended next action: Track schema-reference automation as defer/follow-up.
- Status: done

## M4-T11 codex/MAMBO-m3-012-fix-biomes-stripes
- Review fix-now item(s): Map/deprecate legacy tuning knobs explicitly with clear failure modes.
- PR context (PR #/URL, unresolved comments): PR #1233 https://github.com/mateicanavra/civ7-modding-tools/pull/1233; unresolved comments: 1 (tuning compatibility semantics).
- Repro at tip: Reproducible semantic gap. Several temperature/aridity knobs remain in schema, but core classification now consumes Hydrology indices directly; legacy knob intent is partially inactive/ambiguous.
- Supersedence evidence (branch/PR): No downstream branch up to tip shows explicit migration/error policy for these knobs.
- Classification: Needs discussion
- Evidence paths/commands:
  - `git show codex/prr-epp-s6-hardening-docs-tests:mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/strategies/default.ts | nl -ba | sed -n '88,144p'`
  - `rg -n "config\\.temperature\\.(equator|pole|lapseRate|seaLevel|bias)|config\\.aridity\\.(temperatureMin|temperatureMax|petBase|petTemperatureWeight|humidityDampening|rainfallWeight|bias|normalization)" mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes -g '*.ts'` => no runtime references
  - `rg -n "computeTemperature\\(|computeAridityIndex\\(" mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes -g '*.ts'` (definitions only)
- Residual risk: Silent/partial no-op knobs erode config trust and can cause tuning confusion.
- Recommended next action: Decide policy (hard-fail deprecated knobs vs explicit remap) and apply consistently across ecology+hydrology config surfaces.
- Status: needs decision

## M4-T12 codex/MAMBO-m3-014-lakes-not-filled
- Review fix-now item(s): None immediate.
- PR context (PR #/URL, unresolved comments): PR #1234 https://github.com/mateicanavra/civ7-modding-tools/pull/1234; unresolved comments: 0.
- Repro at tip: Branch-local “lakes not filled” symptom is not the active unresolved item at tip; downstream lifecycle synchronization is present (`recalculateAreas` + `storeWaterData` in lakes step).
- Supersedence evidence (branch/PR): Superseded by downstream lifecycle hardening in `codex/MAMBO-lakes-resources-waterfill-rootcause` / PR #1238 (carried into tip).
- Classification: Already tracked/superseded
- Evidence paths/commands:
  - `gh pr view 1238 --json number,url,title,headRefName,baseRefName,state`
  - `git show codex/prr-epp-s6-hardening-docs-tests:mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.ts | nl -ba | sed -n '84,92p'`
- Residual risk: Separate nonzero-upstream lake expansion semantics remain latent elsewhere (outside this review item’s immediate fix-now scope).
- Recommended next action: Keep nonzero-upstream semantics tracked in dedicated downstream lake-algorithm thread.
- Status: done

## M4-T13 codex/MAMBO-m3-013-bio-lat-cutoff
- Review fix-now item(s): Build category metadata from observed/runtime feature IDs.
- PR context (PR #/URL, unresolved comments): PR #1235 https://github.com/mateicanavra/civ7-modding-tools/pull/1235; unresolved comments: 1 (viz-category completeness).
- Repro at tip: Reproducible by inspection. Viz categories are built from `FEATURE_PLACEMENT_KEYS` only, while emitted feature grids represent runtime engine feature IDs across tiles.
- Supersedence evidence (branch/PR): None found downstream to tip / PR #1267.
- Classification: Fix now
- Evidence paths/commands:
  - `git show codex/prr-epp-s6-hardening-docs-tests:mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/viz.ts | nl -ba | sed -n '50,78p'`
  - `git show codex/prr-epp-s6-hardening-docs-tests:mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/index.ts | nl -ba | sed -n '142,165p'`
- Residual risk: Incomplete viz category metadata can obscure true runtime feature composition in diagnostics/parity workflows.
- Recommended next action: Build categories from observed feature IDs (plus known palette mapping fallback) and include unknown/pre-existing engine features explicitly.
- Status: done

## Handoff
- Totals: 13 tasks adjudicated (`Fix now`: 5, `Already tracked/superseded`: 1, `Needs discussion`: 1, `No actionable fix-now`: 6, `Defer`: 0).
- Confirmed tip baseline for repro checks: `codex/prr-epp-s6-hardening-docs-tests` at `c55febd8af83ed04894c27d8aa2da5cac4659ad1`.
- Primary blockers: none operational.
- Decision-needed item: M4-T11 compatibility/deprecation policy for legacy biome tuning knobs.
