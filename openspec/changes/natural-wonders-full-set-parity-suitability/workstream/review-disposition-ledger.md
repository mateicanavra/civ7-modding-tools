# Review Disposition Ledger — Pre-Code Review

Source: `output/nw-precode-review.md` (3 lanes → synthesis, all evidence
re-verified against source). Initial verdict: **blocked** (P1=4, P2=4, P3=6).
All findings **accepted**; the packet was repaired pre-code. No finding rejected.

| ID | Sev | Disposition | Repair location |
|----|-----|-------------|-----------------|
| NW-1 | P1 | accepted | design §3, Task 2.1/2.3: in-package even/odd tables preserve footprint index order (even = `[(0,1),(1,0),(0,-1),(-1,-1),(-1,0),(-1,1)]`); by-value, not a `hex-oddq` import; probe is authority; consistency test vs `policy-grid.ts`; odd-row regression pins. |
| NW-2 | P1 | accepted | design §2, spec "Footprint Parity Is Proven By Live Readback", Task 2.3: dropped the "mock unmask via ODD_R_NEIGHBORS_*" framing — mock already shares the footprint fn; parity proven by even-row unit tests + live readback, not the mock. |
| NW-3 | P1 | accepted | design §4, Tasks 4.1-4.4: `footprintOffsets` reframed as a live contract field migrated to `footprintOffsetsByParity {even,odd}`; consumers + 2 tests listed; not "dead code". |
| NW-4 | P1 | accepted | design §7, spec "Physically Grounded And Deterministic", Task 5.4: cross-wonder selection ranks wonders by per-map best suitability (terrain-dependent), not ascending featureType + break; variety from physical viability. |
| NW-5 | P2 | accepted (folded with NW-4) | design §7, spec scenario "Suitability output is preserved", Task 5.5: `priority` output retained `[0,1]` = per-wonder suitability; per-wonder re-ranking replaces the global sort; live-parity baseline updated. |
| NW-6 | P2 | accepted | design §9, Task 6.2: `verify-manual-catalogs.ts` is a mirror check, not a length gate; de-duplicated via an exported `isSupportedNaturalWonder`. |
| NW-7 | P2 | accepted | design §1 (domain-op purity) + §4: op stays mapgen-core-only; parity offsets injected via contract data from `inputs.ts`; no map-policy import in the pure op. |
| NW-8 | P2 | accepted | design §4, Task 3.1: FOUR\* `-1→0` direction normalization handled by the byParity helper (probe-confirmed cells / conservative bounding set), not a spurious direction-0 offset. |
| NW-9 | P2 | accepted | spec "Determinism with no RNG" scenario, Task 6.4: determinism worded as "given input physical artifacts (seed-derived); no RNG"; determinism test added. |
| NW-10 | P2 | accepted | design §8, spec effects scenarios, Task 8.3: effects split placement-time (verified) vs city-acquisition-time (Expedition Base + per-city yields, out of map-gen closure scope). |
| NW-11 | P3 | accepted | design §3, Task 6.3: diagnostics split shape-only (unchanged) vs anchor-bound (parity-aware) reads. |
| NW-12 | P3 | accepted | Task 3.3: `placeFirst` plumbing — add field to op contract + forward from `inputs.ts`. |
| NW-13 | P3 | accepted (folded with NW-1) | design §3, Task 2.3: in-package consistency test guards the 4 odd-R copies from drift. |
| NW-14 | P3 | accepted | Tasks qualify `catalogs/natural-wonders.ts:37`. |
| NW-15 | P3 | accepted | design §9, spec full-set scenario, Task 3.4: drop-detector asserts catalog length == `naturalWonderTiles` row count (relative invariant), not literal 20. |
| NW-16 | P3 | accepted | corpus-ledger: Group H relabeled "arid relief (canyon/inselberg)"; Group F biome term includes DESERT (Vinicunca); noLake/minElev hard constraints listed. |

## Confirmed strong (no change)

- Engine-as-final-legality-authority; no second offline legality model.
- No RNG/seed in the op; determinism is real.
- Live closure gate non-substitutable (≥2 seeds, even-row match, "not yet met").
- Probe-before-rely ordering (Task 1 before geometry/predicate implementation).
- Corpus fidelity verified against raw XML (20 types, tiles, Direction,
  PlaceFirst, placementClass, tags, NoLake, MinElev) and the 3 drop root-causes.

## Status

All P1/P2/P3 dispositioned and repaired in the packet. Re-validate strict, then
implementation may begin at Task 1 (live probes).

---

# Implementation-diff Review — Fix 1 + Fix 2 (2026-06-19)

Adversarial multi-lane review of the implemented diff `430a93aae..HEAD` (Fix 1 =
`843891be5` variety selection; Fix 2 = `50a7ba844` retry). 3 lanes
(variety-determinism, retry-telemetry-purity, boundaries-contracts-tests) +
per-finding adversarial verification (each P1/P2 handed to an independent
refuter).

**Outcome: 0 P1, 0 confirmed-real P2 correctness defects.** Fix 1 and Fix 2 were
found correct, reproducible (no RNG/clock), contract-clean, boundary-safe; the
no-fallback materialize path is byte-identical (existing hashes/telemetry
unchanged). All confirmed findings are TEST-QUALITY gaps.

Lane highlights:
- **Fix 1**: argmax over a deterministically-sorted `remaining`; total ordering
  (effectiveScore → bestSuitability → featureType-asc; featureType unique);
  `0.5**n` exact; placeFirst (bonus 1000) dominates; 2nd same-group pick
  (1.0·0.5) loses to a fresh land wonder (~0.7); placeFirst-with-no-legal-tile
  filtered (`bestSuitability=-1`); loop terminates; priority preserved.
- **Fix 2**: no-fallback parity field-for-field; digest reads fields by name so
  spread order can't drift the hash; reconcile invariant holds (one counter +
  one row per placement; all-fail records PRIMARY once); op stays
  mapgen-core-only; `firstRejection!` provably non-null; fallbacks sanitized.
- **Boundaries**: `fallbackPlotIndices` (Type.Optional) flows through the
  artifact (schema = op output) with no strip; `collectFallbacks` excludes
  primary + its footprint + other placed footprints, dedupes, caps 6, prefers
  spacing, deterministic; map-policy boundary intact; no truth-stage edits.

| id | sev | verdict | disposition |
|---|---|---|---|
| TQ-1 | P2 | **real** | **FIXED** — strengthened the fallback test (multi-tile TWO footprint + 2 wonders) to assert no fallback footprint overlaps the wonder's own footprint or any earlier placement's footprint (`plan-ops.test.ts` "excludes overlapping footprints from fallback anchors"). |
| FIX1-001 | P3 | judgment | **FIXED** — added a deterministic variety-flip test proving the decay changes the 2nd selection from same-group to a fresh group (`plan-ops.test.ts` "diminishing-returns decay flips the second pick to a fresh group"); closes the "mechanism only proven live" gap offline. |
| FIX2-01 | P3 | judgment | **DOCUMENTED, no behavior change** — stray terrain mutation on a superseded primary anchor; bounded to inert (planner only emits anchors whose footprint already passed `validTerrainTypes`, so `ensureFeatureValidTerrain` returns "unchanged"); per-anchor pre-check is the packet §4 Fix-2 spec; clarifying comment added in `materialize.ts`. |
| FIX2-02 | P3 | judgment | **ACCEPTED, no change** — `collectFallbacks` worst-case O(selected·size) ≈ 7·7000, negligible. |
| TQ-2 | P2 | **refuted** | **DISMISSED** — claim that retry tests miss the partial-fail/pre-check path was refuted; the new materialize tests cover primary-refused→fallback-placed and all-fail single-rejection. |
| TQ-3 | P3 | judgment | **SKIPPED (covered indirectly)** — `runOpValidated` doesn't strict-check op OUTPUT, but recipe smoke tests publish the plan through the `naturalWonderPlan` artifact (schema = op output) at runtime; strengthened TQ-1 test also asserts the field shape. |

**Out of scope:** a pre-existing `slopeClass` typecheck note in
`derive-placement-inputs/index.ts` (outside the 5-file diff; tsup build +
`bun test` green; predates Fix 1/Fix 2) — not fixed (§7).

**Post-fix gate state:** `plan-ops.test.ts` 15 pass (+2); `natural-wonder-placement.test.ts`
8 pass; mod suite NW-green (only FOREIGN `no-fudging` fails); map-policy 18 pass;
openspec strict-valid.

Fix 1 + Fix 2 are review-clean. Remaining: Fix 3 (FOUR*/FOURL gen-pin) + the
live closure gate (§6), which require the live session.
