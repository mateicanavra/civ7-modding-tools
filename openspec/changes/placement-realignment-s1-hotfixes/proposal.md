## Why

The S0 instrumented baseline (`evidence/baseline-2026-06-09.md`) confirmed
four defects that are fixable without re-architecture: starts seated on
mountains/volcanoes (E1.1 hard-invariant violation on 2/5 seeds), studio runs
seating 2x the intended players (E1.2 studio half), silent openPool/desperation
fallbacks (E1.7), and a resource legality rescue that decays authored spacing
to 0 (RDP step 2, owed "immediately" by the accepted
resource-distribution-policy strategy). S1 lands these surgical hotfixes so
the vertical is correct enough to measure the bigger S2–S5 realignment against.

## Target Authority Refs

- `docs/projects/placement-realignment/refactor-plan.md` (S1 slice scope)
- `docs/projects/placement-realignment/diagnosis.md` (RC6 partially + selected
  P1 findings: impassability screen, studio doubling, silent fallbacks)
- `docs/projects/placement-realignment/expectations.md` (E1.1, E1.2, E1.7,
  E2.6/E2.9 shortfall semantics)
- `docs/projects/placement-realignment/evidence/baseline-2026-06-09.md`
  (before-numbers) and `evidence/audit-register.md` (player-starts + resources
  lanes, file:line citations)
- `docs/projects/resource-distribution-policy/PROJECT-resource-distribution-policy.md`
  (accepted strategy step 2: spacing-preserving fallback)

## What Changes

- **(a) E1.1 impassability screen.** `placement/plan-starts` op input gains
  `mountainMask`, `volcanoMask`, and `naturalWonderPlotIndices`; candidate
  admission rejects those tiles with typed rejection reasons
  (`mountain|volcano|natural-wonder`). The assign-starts step contract now
  requires `morphology.mountains`, `morphology.volcanoes`, and
  `placement.naturalWonderPlacement` and wires them into the op. The
  materializer's desperation fallback is screened by the same exclusion mask.
  Scoring is NOT redesigned.
- **(b) E1.2 studio half.** `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`
  splits `playerCount` ceil/floor across `PlayersLandmass1/2` (per-hemisphere
  base-game semantics) instead of duplicating the total into both slots. The
  `--studio-mapinfo` probe in `scripts/placement/placement-metrics.ts` mirrors
  the fixed mapping.
- **(c) E1.7 loud fallbacks.** openPool/desperation seating emits
  `console.warn` + a warn-tagged trace event (`placement.starts.fallback`),
  and the `startAssignment` artifact records per-seat
  `seatPaths: ("regional"|"openPool"|"desperation")[]`. Selection unchanged.
- **(d) RDP step 2 spacing floor.** The relaxed-spacing assignment phase in
  `place-resources/materialize.ts` (spacing decay to 0) is removed; counts
  that cannot be met at the authored `minSpacingTiles` are recorded as
  `assignment.spacingShortfallCount` (artifact schema + runtime telemetry +
  warn trace `placement.resources.spacingShortfall`) instead of forced. The
  assignment algorithm is otherwise untouched (S3 owns the rewrite); the
  whole-map dispersed plot order remains (S3 removes it).
- **(e) Dead code.** `chooseLeastUsedLegalResource` deleted (zero callers);
  `findLegalPlotWithRelaxedSpacing` deleted with the relaxed phase; the
  `relaxed-spacing` literal removed from the assignment-phase schema/type.

## Decision Log (spec left these open; recorded here, not decided silently)

- **Volcano source:** a dedicated volcano artifact EXISTS
  (`morphology.volcanoes.volcanoMask`, stamped to `FEATURE_VOLCANO` by
  map-morphology `plotVolcanoes`), so the screen uses it directly instead of
  the mountainMask+wonders-only acceptable fallback the plan allowed.
- **Wonder plot set:** placed rows contribute the planned anchor,
  `observedPlotIndex` (engine relocation), and `expectedFootprintReadback`
  plot indices — footprint tiles are wonder-occupied land even though the
  E1.1 harness only checks anchors; cheap and strictly safer.
- **Desperation screening:** E1.1 is a hard invariant, and the desperation
  path bypasses planned candidates, so the step passes the same exclusion
  mask to the materializer (`unsettleableMask`). Without this the screen
  would hold only while regional pools suffice.
- **"Warn-level" trace:** the trace API has no severity levels and
  `TraceScope.event` only emits in verbose mode, so loudness = unconditional
  `console.warn` (live runs) + `level: "warn"`-tagged trace event payload
  (studio/verbose traces). No new trace API in a hotfix slice.
- **Worker default:** when `request.playerCount` is absent the worker seats 8
  total (ceil/floor of 8 = 4/4), preserving the previous default total
  (formerly 4+4) while fixing the semantics for explicit counts.
- **Relaxed phase removal vs flooring:** flooring the decay loop at the
  authored spacing makes it identical to the strict phase (same query, fewer
  available plots), i.e. dead code; so the phase is removed and the shortfall
  recorded, rather than keeping a no-op loop. `spacingShortfallCount` is
  emitted in runtime telemetry only when > 0 to respect the Civ7 log
  truncation budget asserted in tests.
- **Studio probe semantics:** `--studio-mapinfo` now mirrors the FIXED worker
  mapping (it asserts seated == intended) instead of permanently reproducing
  the historical defect; the before-state stays documented in the S0 baseline.

## Requires

- `placement-realignment-s0-metrics` (baseline + harness this slice is
  measured against).

## Enables Parallel Work

- S2 policy-table restoration and S4 starts realignment build on a vertical
  whose start seats are at least legal and honestly counted.
- RDP steps 3–5 proceed with step 2 discharged.

## Affected Owners

- `mods/mod-swooper-maps/**` placement domain/stage owners.
- `apps/mapgen-studio/**` browser-runner owner (one mapInfo mapping).
- `scripts/placement/**` metrics runner.
- `docs/projects/placement-realignment/evidence/**`.

## Forbidden Owners

- No edits to generated files (`civ7-tables.gen.ts`, `dist/**`, `mod/**`,
  `.civ7/outputs/**`).
- No scoring redesign, no selection-strategy move (S4), no assignment
  algorithm rewrite or dispersed-fallback removal (S3), no knob surface
  changes (S3/S4/S7).

## Consumer Impact

- `startAssignment` artifact: additive `seatPaths` field + 3 new rejection
  reason literals.
- `resourcePlacementOutcomes.assignment`: additive `spacingShortfallCount`;
  the `relaxed-spacing` literal is removed from `assignmentPhase` (no longer
  producible; no external consumer constructs it — verified by repo grep).
- assign-starts step contract: 3 new required artifacts, all published by
  steps that already run earlier in the stage (no ordering change).
- Studio runs now seat the configured player count (visible behavior change in
  studio maps: half the starts vs before, as intended).

## Stop Conditions

- Any sub-item turning out to require re-architecture (per refactor-plan slice
  rules) — skip it, record why here, keep the slice shippable.
- E1.1 not reaching 0% on the 5 baseline seeds after the screen lands.

## Verification Gates

- `bun run verify:placement-metrics -- --seed 1337 --seeds 5 --size standard`
  → E1.1 invalidCount 0 on all seeds (vs 7.5% mean at S0).
- `bun run verify:placement-metrics -- --seed 1337 --seeds 1 --size standard --studio-mapinfo`
  → 8 seated for 8 intended (vs 16 at S0).
- `bun --cwd mods/mod-swooper-maps test test/placement test/resources`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate placement-realignment-s1-hotfixes --strict`
- Results recorded:
  `docs/projects/placement-realignment/evidence/s1-results-2026-06-09.md`.
