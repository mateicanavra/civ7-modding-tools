# Discoveries — live placement fix (design + pre-declared ledger)

Workstream: `civ7-mapgen-workstream` · Arm: **Behavioral + Technical** (generation-logic) ·
Domain: `placement` · Branch: `agent-A-civ7-discoveries-live-placement` (on top of the studio-effect stack).

## 0. Symptom

Discoveries (Civ7's goody-hut-like narrative sites: Cave/Ruins/Campfire/Tents/Cairn/Rich/Wreckage on land;
Coast/Shipwreck on water) **do not appear in the live game**.

## 1. Root cause (confirmed mechanism; one honest caveat)

The live recipe plans discoveries itself and stamps each via
`place-discoveries → adapter.placeDiscoveryIntent → stampDiscovery → MapConstructibles.addDiscovery(x,y,visualType,activationType)`.
The visual/activation type values come from a **static djb2-xor catalog**
(`packages/civ7-adapter/src/manual-catalogs/discoveries.ts`; provenance `scripts/placement/verify-manual-catalogs.ts`).
The live engine derives discovery types from its own runtime: visual = `Database.makeHash(ConstructibleType)`
(a different hash family than djb2-xor) and activation = the native `DiscoveryActivationTypes.BASIC/INVESTIGATION`
enum (a **small ordinal**, not a hash). So `addDiscovery` returns `false` for every stamp → each site is
recorded `status:"rejected" reason:"adapter-rejected"` and the step **succeeds with 0 placed**.

Live evidence: `Scripting.log` shows `[51/53] place-discoveries` runs and returns **ok in 2 ms** (silent zero).

Why it was invisible (masking):
- **MockAdapter.stampDiscovery always returns `true`** → all headless diagnostics report "placed".
- The placement summary/outcome telemetry is gated behind `trace.isVerbose` and never logged.
- A typed `adapter-rejected` outcome is treated as a *valid* result; `placed=0` never fails the step.
- `verify-manual-catalogs.ts` validates the catalog against the **same** djb2-xor function that built it (a tautology).
- Sibling catalogs (natural wonders, resources) use engine **indices** + a **readback** and do place live, so the run looks healthy overall.

Caveat (honest): the exact native enum values and `Database.makeHash` algorithm are runtime-injected and not in
the submodule JS, so "djb2 ≠ engine hash" is confirmed *structurally* and closed *empirically* by the in-game gate below.
The fix is correct **regardless of which sub-bug dominates**, because it stops guessing engine encodings entirely.

## 2. The role of discoveries (why the static catalog can never be right)

Discovery **type and availability** are a **narrative-system** product, not a geography product:
the placeable visuals are `GameInfo.DiscoverySiftingImprovements ∩ GameInfo.NarrativeStories` (age-conditional,
with a per-queue budget the official generator decrements). A map-side static table cannot know this; only the
live engine can. The geography question ("where") is secondary; the narrative question ("what / whether it shows")
is essential and lives in the engine. The official `generateDiscoveries` is the authority for that coupling.

## 3. Design decision — Option A: defer live placement to the official generator

The adapter **already** wraps the official generator (`generateOfficialDiscoveries(width,height,startPositions,polarMargin)`,
exact signature every base map calls last). The mod simply never calls it. Route `place-discoveries` through it.

- **Robust**: hash-free, patch-proof (reads runtime enums + live narrative tables), correct-by-construction.
- **Beautiful**: deletes a class of tautological/fragile code (the djb2 catalogs + bespoke plan).
- **Faithful**: it *is* the game's own logic; restores the full land+coast+ocean+narrative-gated population the land-only bespoke plan dropped.
- **Verifiable**: the official generator logs `Total Discoveries Placed: N` → a direct in-game count (today's gate is blind to discoveries).

Step ordering already matches the official order (NW → resources → starts → **discoveries**), so the generator's
`isNaturalWonder` / `getResourceType` / `getDistanceToClosestStart` checks see correct engine state.

### Rejected alternatives
- **B — fix the encodings in place** (resolve visual/activation from runtime, keep stamping the bespoke plan):
  still must replicate narrative-availability gating + water population, and re-reads the same runtime enums → reintroduces
  the exact guessed-encoding fragility. Rejected.
- **C — physics site-bias + runtime type resolution** (keep the relief/aridity plan, resolve types live): a genuine
  feature (Earth-aware discovery clustering) but it must re-implement the narrative-coupled generator to be correct.
  **Deferred** as a possible future enhancement layered *on top of* the official generator, not a bug fix.

## 4. Implementation (two slices)

- **Slice 1 (correctness):** `place-discoveries` reads `startAssignment` (start plot indices) + `polarWaterRows`
  (`CIV7_BROWSER_TABLES_V0.mapGlobals`), calls `adapter.generateOfficialDiscoveries(...)`, publishes the placed
  count, and logs `[SWOOPER_MOD] DISCOVERY_PLACEMENT_V1 {...}` so the live run is no longer silent on discoveries.
- **Slice 2 (cleanup, after live proof):** retire the bespoke `plan-discoveries` op, the `discoveryPlan` artifact +
  its derivation, both djb2 catalogs, `getDiscoveryCatalog`, and the tautological discovery section of
  `verify-manual-catalogs.ts`; simplify the outcome artifact to a lean placed-count summary; update tests.

## 5. Pre-declared verification ledger (fill BEFORE tuning; amend only with recorded evidence)

| ID | Expectation | Direction / bound | Proof surface | Closure class |
|----|-------------|-------------------|---------------|---------------|
| D1 | Live discoveries placed count | `0 → > 0` (expect dozens on Huge antiquity) | `Scripting.log` `Total Discoveries Placed: N` + `DISCOVERY_PLACEMENT_V1 {placedCount}` | **in-game observed** |
| D2 | Discoveries visible on the map | ≥1 discovery improvement model rendered at an expected tile | camera move + window screenshot via CLI (drain cinematic overlay first) | visual corroboration |
| D3 (guard) | Mapgen still completes | `[mapgen-complete]` + `"seed":1337`, no rejectPattern | live `studio-run-in-game-live` gate | in-game observed |
| D4 (guard) | No regression in starts/resources/NW | counts unchanged vs pre-fix (still placed) | placement summary + parity | in-game observed |
| H1 | Headless recipe still valid | `check-types` + placement tests green; `diag:dump` runs; official path invoked | local build/test/diag | generated |

**Pass rule:** D1 > 0 AND D3 hold on a Huge/earthlike seed → primary close; D2 corroborates visually; D4 guards regressions.
Headless (H1) gates entry to the live run but, per the masking above, **cannot** itself prove placement.

## 6. Results — VERIFIED (in-game observed)

Live run: branch `agent-A-civ7-discoveries-live-placement` @ `b5229b26b`, map `swooper-earthlike`,
`MAPSIZE_HUGE` (106×66, 6996 plots), seed/game-seed 1337, 10 players, **antiquity** age, 2026-06-17 ~02:28 local.
Gate: `studio-run-in-game-live` → exit 0, markers `[mapgen-complete]` + `"seed":1337`, no rejectPattern.

| ID | Predicted | Observed | Verdict | Evidence class |
|----|-----------|----------|---------|----------------|
| D1 | placed `0 → > 0` (dozens on Huge) | **78 placed** (118 attempted, 40 rejected) | **PASS** | in-game observed |
| D2 | ≥1 discovery model rendered at an expected tile | Rich@(61,37), Cave@(47,31) rendered (camera centerMatchesTarget; `/tmp/disc-rich-6137.png`, `/tmp/disc-cave-4731.png`) | **PASS** | visual |
| D3 | `[mapgen-complete]` + `"seed":1337`, no rejectPattern | matched in order | **PASS** | in-game observed |
| D4 | starts/resources/NW unchanged | 5 wonders + 219 resources placed; 53/53 steps ok | **PASS** | in-game observed |
| H1 | local gates green | type-check, build, adapter tests 22/22, placement tests (− pre-existing `plan-ops` resources break), `diag:dump` | **PASS** | generated |

Proof corroboration from `Scripting.log`:
- `[SWOOPER_MOD] DISCOVERY_PLACEMENT_V1 {"plannedCount":118,"placedCount":78,"rejectedCount":40}` (my telemetry)
- official: `Discovery generation 106 66` → `Total Discoveries Placed: 78` (0 ocean — correct for antiquity)
- 78 `VALID DISCOVERY SPOT FOUND` lines; visual mix Cairn×11/Tents×10/Campfire×9/Cave×9/Wreckage×8/Rich×7/Ruins×7 (61 land + 17 coastal) — narrative-gated variety, not a single hardcoded type
- `[51/53] ok ... place-discoveries (107.00ms)` vs the pre-fix silent **2ms / 0 placed**

**Boundary:** in-game observed for this one Huge/earthlike/seed-1337/antiquity run. Other sizes/seeds/ages
(exploration adds ocean shipwrecks) not separately proven. `final-surface-parity` does NOT cover discoveries
(grid readback excludes constructibles), so the Scripting.log count + the visual capture are the closure evidence.

**Pre-existing (not this change):** `plan-ops.test.ts` fails on a missing `resolveActiveResourceAge` export from the
resources barrel — inherited from the studio-effect base, untouched here. Flagged for the resources owner.
