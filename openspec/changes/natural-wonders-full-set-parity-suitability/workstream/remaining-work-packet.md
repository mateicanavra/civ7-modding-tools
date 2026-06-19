# Natural Wonders — Remaining-Work Packet (NORMATIVE)

> **STATUS: COMPLETE (2026-06-19).** All three §4 fixes are now IMPLEMENTED,
> committed, and live-closed:
> - **Fix 1 (variety)** — `843891be5`. Cross-type variety live-proven: earthlike
>   places a land wonder every seed (mountain/forest); desert-mountains adds
>   volcano + mountain + reef FOUR*.
> - **Fix 2 (retry)** — `50a7ba844` (+ test hardening `3655a5feb`).
> - **Fix 3 (FOUR* self-orient)** — `1a917a27c`. Resolved differently than §4
>   anticipated: the engine refuses a forced `Direction:0` for ALL 4-tile classes,
>   so the fix passes `Direction:-1` (self-orient) + anchor-only offline footprint
>   — NOT gen-time geometry pinning. Barrier Reef (FOURADJACENT) + Everest
>   (FOURPARALLELAGRM) place live.
> - Closure evidence: `live-proof-ledger.md` §D (2 seeds × 2 map types); closure
>   review dispositioned in `review-disposition-ledger.md`. Scoped-out (documented):
>   Thera terrain, Valley of Flowers odd-Q/odd-R predicate, FOURL (Hoerikwaggo)
>   never selected, in-game effect-yields. The §4 text below is preserved as the
>   original normative spec for historical reference.

Strong reference for the remaining implementation. The infrastructure (parity,
full-set eligibility, predicates, selection framework, effects-by-placement) is
DONE, committed, and live-proven (§2). **Three fixes in §4 are REQUIRED and
UNIMPLEMENTED** — they are NOT in the committed code yet; §4 is the spec to build,
not a description of existing work. A fresh implementer MUST author §4 against this
doc's directives (the cited design rationale is §1–§3), then verify every "MUST"
and the closure gate (§6). Order is causal: **Fix 1 → Fix 2 → Fix 3** (Fix 3
depends on Fix 1; see §4 Fix-3).

Status date: 2026-06-19. Owner: agent-A.

---

## 0. Where things stand

- **Worktree:** `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-A-mapgen-oddr-consumer-migration`
- **Branch:** `agent-A-natural-wonders-full-set-parity-suitability` (stacked on
  `agent-A-mapgen-oddr-consumer-migration`). **6 commits, DRAFT — NOT published.**
  1. `a26466e3b` design packet
  2. `c28372198` parity + full-set + contract migration + predicates + placeFirst + tests
  3. `fd4abab56` suitability + cross-wonder selection (variety mechanism)
  4. `4fd5d5368` align diagnostics/materialize tests with parity geometry
  5. `96a7da60b` live-closure evidence ledger
  (this doc = a 7th docs commit)
- **OpenSpec change** `natural-wonders-full-set-parity-suitability` strict-validates.
- **Repo gates GREEN** except **2 pre-existing FOREIGN failures** on the parent
  stack — DO NOT fix them (out of scope): `packages/civ7-adapter` →
  `mock-terrain-policy.test.ts` ("validation-materialized coast"); `mod-swooper-maps`
  → `no-fudging-static-scan` flagging `place-discoveries/contract.ts:10`. Both fail
  with this change's edits stashed (confirmed).
- **Live:** two `swooper-earthlike` HUGE gens (seeds 1337, 2024) reached
  `[mapgen-complete]`. See §5.

---

## 1. Hard-won facts (DO NOT re-derive; verify if relying)

1. **Parity tables (authoritative — live probe + 5 base-placed clusters + policy-grid set-match).**
   Resolved by `(anchorY & 1)`:
   - `ODD` (= historical `CIV7_DIRECTION_OFFSETS`): d0(1,1) d1(1,0) d2(1,-1) d3(0,-1) d4(-1,0) d5(0,1)
   - `EVEN`: d0(0,1) d1(1,0) d2(0,-1) d3(-1,-1) d4(-1,0) d5(-1,1)
   - Indices 1,4 parity-invariant; 0,2,3,5 swap. Neighbor SETS match `policy-grid.ts` per parity.
2. **Direction model.** The mod normalizes wonder `Direction:-1 → 0`
   (`resolveNaturalWonderMaterializationDirection`) and passes that CONCRETE direction
   to BOTH the offline footprint AND `setFeatureType`; the engine stamps the dir-0
   footprint deterministically. The base game passes `-1` (engine self-orients,
   varied dirs) — that is **NOT** the mod path. All 20 wonders carry `Direction:-1`
   **except Fuji=2, Vihren=1**.
3. **Footprint geometry model (validated live).** `off(d)` = the per-parity table entry:
   - ONE = `[anchor]`; TWO/TWOADJACENT = `[anchor, off(d)]`;
     THREETRIANGLE/THREETRIANGLEDEEPOCEAN = `[anchor, off(d), off(d+1)]`.
   - **FOURPARALLELAGRM = `[anchor, off(d), off(d+1), corner]`** where `corner` = chain
     `off(d+1)` from the `off(d)`-cell using THAT cell's parity (`anchorParity ^ off(d).dy`).
     CONFIRMED by Thera (odd, dir 4 → `[(0,0),(-1,0),(0,1),(-1,1)]`).
   - **FOURADJACENT / FOURL dir-0 cells are NOT yet engine-pinned** — current code ships
     hypotheses: FOURADJACENT = row-line `[(0,0),(1,0),(2,0),(3,0)]`; FOURL =
     `[anchor, off(d), chain(off(d),d), off(d+1)]` = **2 steps along dir + 1 clockwise
     turn** (NOTE: the code comment at `natural-wonder-footprints.ts` FOURL case wrongly
     says "3 along + 1 turn" — reconcile the comment to the real shape during Fix 3,
     where the shape is replaced by the engine-observed stamp anyway).
4. **Engine API quirks.** `GameplayMap.getFeatureType(x,y)` returns the feature **ROW
   INDEX** (NW ids `{0,1,28..45}`), NOT `Database.makeHash`. The adapter places with
   `Feature = row index` and readback-compares against it. `canHaveFeatureParam`
   adapter form is 4-arg `(x,y,Feature,featureData)`; base generator form is 3-arg
   `(x,y,featureParam)`. **`canHaveFeatureParam`-true does NOT guarantee
   `setFeatureType`-success** (see §4 Fix-2).
5. **Started-game tuner CANNOT place** (`setFeatureType`→false; `canHaveFeatureParam`
   trivially true post-gen). Only PURE READS work post-start
   (`getAdjacentPlotLocation`, `isCliffCrossing`, `getFeatureType`). FOUR*/FOURL
   geometry MUST be pinned at GEN time (during recipe execution), not the live tuner.
6. **Probe harness (THROWAWAY — delete at cleanup):**
   `mods/mod-swooper-maps/scripts/live/nw-live-probe.ts`. Modes: `--boot` (cold-boot
   base map + connectivity/parity/predicate probes), `--scan` (full-map NW cluster
   scan by index → `output/nw-live-scan-result.json`), `--anchors` (read clusters at
   `Scripting.log` "Placed … At X:n Y:m" anchors). Cold boot:
   `open "steam://rungameid/1295660"` → poll shell → `runCiv7SinglePlayerFromSetup`;
   tuner exec via `executeCiv7TunerCommand` (role `tuner`).
7. **Live launch/verify:** `nx run mod-swooper-maps:verify -- --mode
   studio-run-in-game-live --mutate --map-script "{swooper-maps}/maps/<name>.js"
   --map-size MAPSIZE_HUGE --seed <n> --game-seed <n> --player-count 10
   --from-running-game exit-to-shell --wait-timeout-ms 240000`. ALWAYS `nx run
   mod-swooper-maps:deploy` (which builds core first) before a mutating verify.
   Success = `[mapgen-complete]` + `"seed":<n>` in `Scripting.log`, no rejectPattern.
8. **Telemetry:** `NATURAL_WONDER_PLAN_V1` (planRows: `["p",plotIndex,x,y,featureType,
   direction,elevation,priorityPpm]`) and `NATURAL_WONDER_PLACEMENT_V1` (placed/rejected
   + `rejectionExamples`) in `Scripting.log`.

---

## 2. What is DONE (committed, do not redo)

- map-policy `natural-wonder-footprints.ts`: in-package EVEN/ODD tables, `(y&1)`
  selection in `getNaturalWonderFootprintIndices`, `getNaturalWonderFootprintOffsetsByParity`,
  shape-only `getNaturalWonderFootprintOffsets` (odd representative), FOUR* placement
  classes, 5 predicate tags in `SUPPORTED_POLICY_TAGS`.
- `catalogs/natural-wonders.ts`: exported `isSupportedNaturalWonder`; dropped the
  `placeFirst && tiles>1` guard → catalog = full 20.
- Contract migration `footprintOffsets → footprintOffsetsByParity{even,odd}` across
  op contract / `inputs.ts` / `default.ts` / 2 tests; `placeFirst` plumbed end to end.
- Predicates in `default.ts` tag switch: ADJACENTTOCOAST / NOTADJACENTTOLAND /
  ADJACENTTOSAMETERRAIN computed via odd-Q footprint neighbors; ADJACENTCLIFF /
  NOLANDOPPOSITECLIFF pass-through (engine-deferred — pure op has no cliff oracle).
- Signal forwarding (zero new artifact deps): `vegetationDensity`, `effectiveMoisture`,
  `surfaceTemperature` (biomeClassification), `fertility` (pedology), `discharge`,
  `slopeClass` (hydrography) → op contract → planner.
- `suitabilityAt(group, tile)` per requirement-group A-I + `WONDER_GROUP_BY_FEATURE`;
  cross-wonder `bestSuitability` ranking; `priority` output preserved.
- Tests: flipped catalog/diagnostics/materialize bug-certifying assertions; added
  even-row geometry, odd-row pins (Redwood/Fuji dir2/Vihren dir1), FOURPARALLELAGRM,
  policy-grid consistency, no-silent-drop, determinism.
- Adversarial static review (3 lanes): **0 findings** (code structurally sound; the
  variety issue is a runtime tuning gap, not a static defect).

---

## 3. User decisions (this session — BINDING)

1. **Variety target = "Fix land-exclusion; variety across map types."** Earthlike maps
   MUST place a MIX (mountain/forest/volcano/arid, not only water). It is ACCEPTABLE
   that similar earthlike seeds yield similar sets; variety emerges across map TYPES
   (pangaea / archipelago / desert-mountains). This is physical-determinism, NOT RNG,
   and NOT a hard per-group quota — re-balance so groups compete on merit.
2. **Proceed with all 3 fixes now**, then re-run ≥2 live seeds (and ideally ≥2 map
   types), re-review, present for publish.

---

## 4. Remaining fixes (NORMATIVE)

### Fix 1 — Cross-type variety via diminishing-returns selection (`default.ts`)

ROOT CAUSE: water groups (C reef, D deep) saturate `bestSuitability` at 1.0 (shelf/deep
tiles abundant) while land wonders have scarce legal footprints (rare volcano /
3-mountain triangles) → lower `bestSuitability`; `placeFirst` consumes 3 of 7 slots;
the `featureType`-asc tie-break favors low-id water wonders. Result: every earthlike
seed selects 3 placeFirst + 4 water, **zero land wonders**.

MUST:
- Replace the static `plans.sort` + linear selection (default.ts ~294-360) with a
  **greedy diminishing-returns** selection: each iteration pick the remaining wonder
  with the highest `effectiveScore`, place it, decrement availability:
  `effectiveScore(wonder) = placeFirstBonus(wonder) + bestSuitability(wonder) *
  DISCOUNT^(countAlreadySelectedFromItsGroup)`. Use `DISCOUNT ≈ 0.5` (tune live);
  `placeFirstBonus` a large constant so placeFirst wonders (with a legal tile) sort
  ahead. Re-evaluate group counts each iteration. **Deterministic, NO RNG.**
- This makes a 2nd water wonder (`1.0*0.5=0.5`) lose to a fresh mountain (`~0.7`),
  yielding a mix; a mountain-heavy map naturally takes more mountain wonders (variety
  across map types).
- Tie-break: higher `bestSuitability`, then lower `featureType` (last resort only).
- Keep `priority` output = the placed tile's per-wonder suitability `[0,1]`.
- VERIFY LIVE that earthlike maps now place ≥2 land-type wonders (mountain/forest/
  volcano/arid). If land still excluded, slightly boost the weakest land group
  formulas in `suitabilityAt` so a good land tile reaches ~0.6+ (re-tune, do not
  loosen hard constraints).

### Fix 2 — Materialize retry across candidates (`contract.ts` + `default.ts` + `materialize.ts`)

ROOT CAUSE: `canHaveFeatureParam`-true ≠ `setFeatureType`-success. The base generator
collects MANY valid tiles and picks one; the mod picks ONE best tile and does not
retry, so the 3 hardest wonders (Valley of Flowers ADJACENTMOUNTAIN odd-Q/odd-R
near-miss; Mapu'a Vaea ADJACENTCLIFF engine-deferred; Barrier Reef FOURADJACENT) get
`set-feature-false` and drop.

MUST:
- Plan op output: add `fallbackPlotIndices?: number[]` per placement = the wonder's
  next-best sorted candidates (exclude `usedPlots` + footprint overlaps; cap ~6;
  respect spacing where possible). The engine is the FINAL legality authority.
- `materialize.ts`: for each placement, try the primary anchor, then each fallback,
  re-computing the parity-aware footprint per anchor + the occupancy/terrain
  pre-check, calling `adapter.placeNaturalWonder` until one returns `placed`; only
  record a rejection if ALL candidates fail. Keep the existing rejection telemetry
  for the all-fail case.
- Op stays mapgen-core-only; no engine in the planner.

### Fix 3 — FOUR*/FOURL geometry, gen-time pinned

**PREREQUISITE (causal): Fix 1 must first get FOURADJACENT (Barrier Reef) and FOURL
(Hoerikwaggo) SELECTED into the placed set** — otherwise the recipe never reaches
`materialize` for them and there is no engine stamp to read back. Verify Fix 1 selects
these two live (≥2 seeds / a mountain-or-reef-favorable map) BEFORE starting Fix 3.

Barrier Reef (FOURADJACENT) `set-feature-false` at Direction 0; the base game places
it at Direction -1 (self-orient). Two candidate resolutions — DETERMINE EMPIRICALLY:
- (a) **dir-0 shape wrong:** pin the real dir-0 stamp. Temporarily set FOURADJACENT/
  FOURL `byParity` to anchor-only `[(0,0)]` (readback trivially passes, engine stamps
  the real footprint) + add temp gen-time neighborhood-scan logging in `materialize`
  → run one live gen → read the actual stamped cells → encode them in map-policy →
  remove bootstrap + temp logging → re-run to confirm strict readback passes.
- (b) **FOUR* need self-orientation:** if Direction 0 never places them, pass
  `Direction:-1` for FOUR* and have the adapter DERIVE the occupied cells from
  readback (scan) instead of strict offline==stamp — scope this relaxation to FOUR*
  only to avoid regressing the working classes.
Prefer (a) (keeps the adapter's strict readback). MUST end with Barrier Reef and
Hoerikwaggo placing live with offline footprint == engine stamp.

---

## 5. Live evidence so far (seeds 1337 & 2024, swooper-earthlike HUGE)

- Placed (BOTH seeds, identical): Bermuda(0), Gullfoss(32), Iguazu(34), Great Blue
  Hole(44). Rejected `set-feature-false` (BOTH): Valley of Flowers(28), Barrier
  Reef(29), Mapu'a Vaea(45). Planned 7 identical across seeds.
- PROVEN: parity (Bermuda 3-tile, odd anchor, strict readback match), full-set
  eligibility, predicates (Bermuda ADJACENTTOCOAST+NOTADJACENTTOLAND; Great Blue Hole
  ADJACENTTOSAMETERRAIN), 2 previously-dropped placing.
- NOT MET: cross-type variety (land excluded), 3 hardest placing, FOUR*/FOURL
  geometry, even-row multi-tile live readback.

---

## 6. Closure gate (MUST achieve before requesting publish)

- ≥2 seeds AND ideally ≥2 map TYPES placing a MIX of wonder types incl ≥1 land type
  (mountain/forest/volcano/arid) and ≥1 previously-dropped wonder.
- One EVEN-row multi-tile placement whose live readback matches the offline footprint.
- FOUR*/FOURL (Barrier Reef, Hoerikwaggo) placing with strict readback.
- Placement-time effects spot-check (engine-automatic on the `setFeatureType` path).
- Record all in `workstream/live-proof-ledger.md`; fill corpus-ledger O1-O5.

---

## 7. Standing constraints

- agent-A prefix; isolated worktree; `gt` for stacking; NEVER `gt sync` without
  `--no-restack`; do not restack/commit foreign branches (`agent-DRA-*`).
- Check `git diff --cached` before EVERY commit (no foreign staged files). Stage NW
  files explicitly; never `-A` (the throwaway harness + `output/*.json` are untracked).
- Commit trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- **Publish (`gt submit`/`ss`) ONLY after explicit user approval.**
- FORBIDDEN edits: truth-stage artifact PRODUCERS (morphology/ecology/hydrology),
  mapgen-core primitives, `civ7-tables.gen.ts`, game resources, studio UI. Signals
  are FORWARDED, not recomputed. Do NOT fix the 2 pre-existing foreign test failures.
- BOUNDARIES: the plan op (`plan-natural-wonders`) MUST NOT import `@civ7/map-policy`
  or any engine; map-policy (`kind:foundation`) MUST NOT import `@swooper/mapgen-core`.
- Earthlike metrics are invariant targets: re-tune suitability weights, do NOT loosen
  hard constraints. Remove dead code outright (don't patch). Delete the throwaway
  probe harness at cleanup.

## 8. Gates

- `bun run build` (or `nx run @civ7/map-policy:build`, `@civ7/adapter:build`,
  `mod-swooper-maps:build`).
- `nx run @civ7/map-policy:test`; `bun test` in `packages/civ7-adapter` (expect the 1
  foreign terrain-policy fail); `nx run mod-swooper-maps:test` (expect the 1 foreign
  no-fudging fail; ALL NW tests must pass).
- `bun run openspec -- validate natural-wonders-full-set-parity-suitability --strict`.

## 9. Edit-site map (current source)

- `packages/civ7-map-policy/src/natural-wonder-footprints.ts` — parity tables,
  `footprintOffsetsForParity`, `getNaturalWonderFootprintOffsetsByParity`, FOUR* (Fix 3).
- `mods/mod-swooper-maps/src/domain/placement/ops/plan-natural-wonders/contract.ts` —
  add `fallbackPlotIndices` to output placements (Fix 2).
- `.../plan-natural-wonders/strategies/default.ts` — `suitabilityAt`,
  `WONDER_GROUP_BY_FEATURE`, the selection block ~294-360 (rewrite: Fix 1 + emit
  fallbacks for Fix 2).
- `.../derive-placement-inputs/{inputs.ts,index.ts,contract.ts}` — signal forwarding (done).
- `.../place-natural-wonders/materialize.ts` — retry loop (Fix 2); temp gen-scan
  logging for Fix 3.
- Tests: `test/placement/plan-ops.test.ts`, `test/placement/derive-placement-inputs.test.ts`,
  `test/placement/natural-wonder-placement.test.ts`,
  `test/diagnostics/surface-delta-context.test.ts`,
  `packages/civ7-map-policy/test/map-policy.test.ts`,
  `packages/civ7-adapter/test/natural-wonder-catalog.test.ts`.
