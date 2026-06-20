# Desert “ocean damage” — feasibility + design

**Question:** Can a Civ7 mod apply the ocean / deep‑water damage effect (the attrition that kills units ending their turn on deep ocean) to units on **desert** tiles — and, per the design decision below, only to the *deep / dangerous* parts of deserts (and, symmetrically, deep‑cold zones)?

**Bottom line:** **Yes — feasible, via data, and the base game already ships a near‑exact precedent.** The literal “ocean damage” effect cannot be retargeted (its only data surface is *immunity*; the trigger is engine‑internal to the deep‑water plot property). But Civ7’s **PlotEffects** system is a data‑defined, per‑turn, per‑tile HP‑damage mechanism — structurally identical to ocean damage — and this repo’s map‑gen pipeline already scores and stamps sand/snow plot effects from physical signals. The selective “deep desert / deep cold hazard” is therefore a **surgical extension of an existing op**, not new machinery.

Evidence tiers: **T1** = base‑game data the engine ships/loads · **T2** = SDK source that authors such data · **T3** = repo prior art · **T4** = inference. Project rule: *data‑validity ≠ live‑engine acceptance* — anything not already exercised by base data is flagged as an **open live‑proof item**.

---

## 1. What “ocean damage” actually is (T1)

- The **only** data lever for water damage is *protection*: `MODIFIER_PLAYER_UNITS_ADJUST_WATER_DAMAGE` → `EFFECT_ADJUST_UNIT_WATER_DAMAGE_PROTECTION` (`base-standard/data/modifiers.xml:56`). Every use **grants immunity** (`MOD_TECH_EX_NO_OCEAN_DAMAGE` via Shipbuilding, `progression-trees-tech-gameeffects.xml:39`; Tonga’s `NO_OCEAN_DAMAGE`).
- The **magnitude** is a global parameter: `PLOT_WATER_DAMAGE_BASE=11`, `PLOT_WATER_DAMAGE_RAND=10` (`age-exploration/data/gameplay-systems.xml:19-20`), scaled by `HANDICAP_WATER_DAMAGE` (`difficulties.xml`).
- **There is no terrain argument and no “deal water damage” effect.** The damage *trigger* is engine‑internal to the deep‑ocean plot property. ⇒ **Ocean damage cannot be re‑pointed at desert directly.**

## 2. The precedent that makes it easy (T1)

The base game **already damages units on desert**, via two distinct systems:

1. **Desert dust storms.** `RANDOM_EVENT_DUST_STORM_GRADIENT/HABOOB` are `EventClass=CLASS_DUSTSTORM`, **`BiomeType="BIOME_DESERT"`** (`random-events.xml:69-70`); they deal `DamageType="UNIT_DAMAGED" MinHP=30..MaxHP=60` (`random-events.xml:173-174`) and lay `PLOTEFFECT_SAND` (`:186-187`). Immunity is data‑expressible: `EFFECT_UNITS_IMMUNE_TO_RANDOM_EVENTS` + `RandomEventClass=CLASS_DUSTSTORM` (cf. Gen. Moroz blizzard immunity).
2. **PlotEffects with a `Damage` column** (`plot-effects.xml`, schema `01_GameplaySchema.sql:3013-3027`):

   | PlotEffect | Damage | Notes |
   |---|---|---|
   | `PLOTEFFECT_IS_BURNING` | 15 | `TimeDecay`, `AllowOnWater=false` |
   | `PLOTEFFECT_RADIOACTIVE_FALLOUT` | 50 | `TimeValue=10` |
   | `PLOTEFFECT_PLAGUE` | 25 | decays |
   | `PLOTEFFECT_STONE_TRAP`/`DIGSITE` | 25 | `TriggerOnEnter`, `RemoveOnEnter` |
   | **`PLOTEFFECT_SAND`** | **0** | already exists, desert‑themed, currently harmless |

   The DDL: `Damage INTEGER NOT NULL DEFAULT 0`, with `TriggerOnEnter` (default **0** ⇒ damage applies *while occupied*, i.e. per turn, not only on entry), `TimeDecay`/`TimeValue` (auto‑decay), `UnoccupiedDecay`, `AllowOnWater`. A **permanent** hazard = `Damage=N, TimeDecay=0, UnoccupiedDecay=0, TriggerOnEnter=0`.

## 3. Feasibility of the data paths

| Path | Mechanism | Effort | Fidelity | Key open live‑proof |
|---|---|---|---|---|
| **A. Permanent PlotEffect hazard (CHOSEN)** | new/overridden `PlotEffects` row with `Damage`, stamped on selected tiles via the repo’s existing `addPlotEffect` map‑gen step | Low–Med | High (tile deals per‑turn HP, like ocean) | Does a non‑decaying damaging plot‑effect harm a **land** occupant every turn? |
| A2. Amplify dust storms | data override of `random-events.xml` (freq/HP) | Low | Med (random/transient) | none major; has native immunity hook |
| B. Modifier + biome gate | `ModifierBuilder` → `EFFECT_UNIT_ADJUST_DAMAGE` (`run-once="false"`) gated by `REQUIREMENT_PLOT_BIOME_TYPE_MATCHES`/`BIOME_DESERT` on `COLLECTION_PLAYER_UNITS` | Low (SDK; Dacia template) | High | exact per‑turn cadence of `run-once="false"` |
| C. Gameplay‑script DOT | JS on‑turn/move hook → desert check → damage | High | Highest control | whether Civ7 exposes the hook+damage API to mods |
| ~~`ADJUST_UNIT_AREA_DAMAGE` / `ARMY_ADJUST_ATTRITION_DAMAGE`~~ | offensive splash ability / **0 base‑game uses** | — | — | rejected (not terrain hazards) |

Supporting facts: biome gate is proven (`REQUIREMENT_PLOT_BIOME_TYPE_MATCHES` used by Dai Viet `BIOME_TROPICAL`, water‑wonders `BIOME_MARINE`); `EFFECT_UNIT_ADJUST_DAMAGE` is the signed HP lever (Amount=25/50 or `Destroy=TRUE`; Iceland uses it for healing) with `run-once="false"` precedent (`narrative-stories-gameeffects.xml:2059,2287`). `ImmuneDamage` is a **Constructibles** (wonder) column, **not** a unit lever — so per‑unit immunity to a *custom* plot effect has no clean generic data hook (limitation, see §6).

---

## 4. Chosen design — selective, physically‑grounded hazard (Path A)

Not every desert tile; only **deep / dangerous** desert (and symmetric **deep cold**), emerging deterministically from the map’s physics. This drops straight onto the repo’s existing ecology plot‑effect pipeline.

**The pipeline already exists** (`mods/mod-swooper-maps/src/domain/ecology/ops/`):
- `plot-effects-score-sand` → per‑tile `score01` = mean of normalized `aridityIndex`, `surfaceTemperature`, inverse `freezeIndex`, inverse `vegetationDensity`, inverse `effectiveMoisture` (eligible: aridity ≥ 0.55, temp ≥ 18 °C, freeze ≤ 0.25, veg ≤ 0.2, moisture ≤ 90, biome ∈ {desert, temperateDry}). **High score = hottest/driest interior = “deep desert.”**
- `plot-effects-score-snow` → `score01` = weighted `freezeIndex` + `elevation` + `moisture`, eligible at `surfaceTemperature ≤ 4 °C`. **High score = deepest cold — directly temperature‑tied.**
- `plan-plot-effects` → deterministic **top‑coverage by score** with **tiered thresholds** (snow already: `light 0.35 / medium 0.6 / heavy 0.8`, `coveragePct 80`; “M3 posture: deterministic, seeded tie‑break only”).
- `map-ecology/steps/plot-effects` → projects the plan to the engine via `adapter.addPlotEffect(x,y,type)` (`civ7-adapter/src/types.ts:576`). `DESERT_BIOME` is already resolved in `mapgen-core` (`core/terrain-constants.ts:86`).

**The extension = a hazard tier + a “massive/interior” gate.**

- **Deep cold:** add an `extreme` band above `heavyThreshold` in the snow plan whose selector is a *damaging* plot effect. Coldest/highest tiles only.
- **Deep desert:** give the (currently single‑tier) sand plan the same multi‑tier treatment — `hazardThreshold` band → damaging `PLOTEFFECT_DESERT_HEAT`; below → cosmetic `PLOTEFFECT_SAND`. Add a **contiguous‑mass + interior‑distance gate** so the hazard only appears in *large* desert interiors (“crossing is clearly dangerous”), not isolated dunes:
  - connected‑component over `sandEligibleMask`; keep components ≥ `minMassTiles`;
  - distance transform → require `interiorDistance ≥ minInteriorDist` (tiles far from the desert edge).
  - This is a new pure rule alongside the existing `plan-plot-effects/rules/snow-elevation.ts`.

All deterministic (pure function of physical fields; RNG only as exact‑tie break) — consistent with the natural‑wonders “physically‑grounded suitability, not random” decision.

---

## 5. Implementation plan (file‑by‑file)

1. **Data — damaging plot effects.** Author a raw SQL/XML file via `ImportFileBuilder` (T2): `PLOTEFFECT_DESERT_HEAT` (`Damage=11` to match `PLOT_WATER_DAMAGE_BASE`, `TimeDecay=0, UnoccupiedDecay=0, TriggerOnEnter=0, AllowOnWater=0`) and `PLOTEFFECT_DEEP_COLD` (e.g. `Damage=8`), each with a `Name` LOC row. Ship via an `ACTION_GROUP_ACTION` UPDATE/IMPORT.
2. **Types/viz.** Register the two keys in `@mapgen/domain/ecology` `PlotEffectKey` and add viz categories (mirror `plot-effects/viz.ts`, which already lists `PLOTEFFECT_SAND`).
3. **Contract — `plan-plot-effects/contract.ts`.** Extend `PlotEffectsSandPlanSchema` to multi‑tier (add `hazardThreshold`, `hazard` selector, `minMassTiles`, `minInteriorDist`); add an `extreme`/`hazard` band + selector to `PlotEffectsSnowSelectorsSchema`/plan.
4. **Strategy — `plan-plot-effects/strategies/default.ts`.** Assign hazard vs cosmetic by score band (mirror the snow band logic), after applying the mass/interior gate; keep the deterministic `selectTopCoverage`.
5. **Rule — `plan-plot-effects/rules/desert-mass.ts`** (new). Connected components + distance transform over `sandEligibleMask`. Pure, tested.
6. **Config.** Enable sand (`sand.enabled=true`) and set thresholds/coverage in the relevant `mods/mod-swooper-maps/src/maps/configs/*.config.json` (desert‑heavy maps: `swooper-desert-mountains`, etc.); set the cold extreme band.
7. **Tests + parity.** Unit‑test the new rule + band assignment; **regenerate the ecology‑parity fingerprint fixtures** (`test/fixtures/ecology-parity/…`) — placements change deterministically, so the fixture delta is expected and reviewable.
8. **Live‑proof.** Launch Civ7, park a land unit in a deep‑desert hazard tile, confirm per‑turn HP loss in `Scripting.log`; repeat for deep cold. (See §6.)

## 6. Open live‑proof items & risks

- **★ Per‑turn damage on land (the one real unknown).** Every base damaging plot effect either decays (`IS_BURNING`, `PLAGUE`) or is `TriggerOnEnter` (`STONE_TRAP`). A **permanent, non‑decaying** damaging plot effect on land is structurally supported by the schema but not directly precedented → must be confirmed in `Scripting.log`. Fallback if the engine won’t per‑turn‑damage a permanent effect: Path A2 (amplified dust storms) or Path B (`run-once="false"` modifier).
- **Map‑gen persistence.** `addPlotEffect` at gen is proven (the existing step), but persistence of a *custom permanent* effect into live turns is the test.
- **Per‑unit immunity** has no clean data hook for custom plot effects (`ImmuneDamage` is wonders‑only). The dust‑storm path (A2) *does* have `EFFECT_UNITS_IMMUNE_TO_RANDOM_EVENTS` — relevant if we want “camel/desert units cross safely.”
- **Balance/AI.** AI pathing may not avoid the hazard; tune `Damage`, `coveragePct`, `minMassTiles` conservatively. UX: hazard must be legible (viz/tooltip + the storm‑style notification).

## 7. Status / provenance

- Branch `desert-ocean-attrition-feasibility` (off `start-dist-homeland-rebalance`).
- Evidence gathered via narsil code‑intel over the vendored base‑game dump (`.civ7/outputs/resources`) + repo SDK/mapgen source. The original background feasibility workflow stalled mid‑`Understand` on the large gameeffects XML; the findings here were produced by direct structural search and supersede it.

---

## 8. RESULTS — implemented & PROVEN LIVE (2026-06-20)

The one real unknown from §6 is **resolved: yes.** A permanent, non-decaying plot effect **does** damage a land occupant every turn.

**Live proof (latest-juicy, driven via the `civ7` CLI):** `PLOTEFFECT_DESERT_HEAT` (`Damage=11, TimeDecay=false, UnoccupiedDecay=false, AllowOnWater=false`) loads with **no rollback**, registers at runtime, and was **placed on 36 deepest-desert tiles** (24% sand coverage). A stationary unit on a DESERT_HEAT tile lost **exactly 11 HP across one turn** (0 → 11, turn 1 → 2). This is the genuine ocean-damage twin.

**What shipped (simpler than the §5 plan):**
- `mod/data/desert-hazard.xml` — ROOT `<Database>` with `Types` + `PlotEffects` rows for `PLOTEFFECT_DESERT_HEAT`. Loaded via a game-scope `UpdateDatabase`. LOC name in `MapText.xml`.
- `plan-plot-effects` — the sand channel gained an **optional `hazard` companion selector** (`sand.hazard`) that co-places the hazard on the same top-coverage deep-desert tiles the cosmetic sand selects. (Lighter than the full multi-tier + connected-mass/interior-distance gate of §4–5; coverage % already constrains it to the deepest tiles. The mass/interior gate remains available as a future refinement.) Wired via `ecology-public-config.ts` `PLOT_EFFECT_SELECTORS.sandHazard`; viz category added; tests in `test/ecology/plot-effects-sand-hazard.test.ts`.
- The global `EFFECT_UNIT_ADJUST_DAMAGE` modifier path (§3 Path B) was **dropped**: it is one-shot in 100% of base usage (`run-once="true"`) and a biome modifier hits *all* desert, contradicting the "deep parts only" design.

**Corrected finding — the "art-gated / unplaceable" fear was wrong.** A missing world-VFX does **not** block placement: the engine builds the visual as `WorldUI.triggerVFXAtPlot("VFX_ADDED_TO_MAP_"+PlotEffectType)` in `onPlotEffectAddedToMap` (`world-vfx.js:77`) and silently no-ops when the asset is absent; the gameplay placement + `Damage` still apply. The earlier "0 placements" was a data-load rollback, not art.

**Open: the world-visual.** There is **no data-only way to render a persistent ground marker.** A custom type has no art, and even base `PLOTEFFECT_SAND` has *no persistent decal* — its only visual is a one-shot "appears" animation (`triggerVFXAtPlot`, vs the persistent `addVFXAtPlot` used only by `PLOTEFFECT_FLOODED`), which mapgen placement never fires (verified: SAND added to 7 tundra tiles at runtime showed zero overlay). The hazard is surfaced via the **plot tooltip** ("Deep Desert Heat") + the terrain already reading as harsh desert. A real overlay would need the art pipeline or a persistent-art **feature** — future work.

### 8.1 Plot-effect permanence survey (all 15 base effects, `plot-effects.xml` — the only definition file)

Permanence is governed by two flags: **`TimeDecay`** (counts down `TimeValue` turns) and **`UnoccupiedDecay`** (vanishes when no unit occupies the tile). "Permanent" = **both false**.

| Class (TimeDecay / UnoccupiedDecay) | Effects | Damage | Notes |
|---|---|---|---|
| **PERMANENT** (false / false) | `FLOODED` (0); `SNOW_LIGHT/MEDIUM/HEAVY_PERMANENT` (0); `STONE_TRAP` (25), `DIGSITE` (25) | 0, except traps=25 | FLOODED has the *only* persistent VFX (`addVFXAtPlot`); SNOW_*_PERMANENT render via terrain material. STONE_TRAP/DIGSITE are permanent **but** `TriggerOnEnter`+`RemoveOnEnter` → one-shot, removed when stepped on (not continuous). |
| **OCCUPANCY-HELD** (false / true) | `UNIT_FORTIFICATIONS` (0, Defense=3) | 0 | Persists only while a unit sits on it. |
| **TIME-DECAY** (true / false) | `IS_BURNING` (15, 2t), `PLAGUE` (25, 1t), `RADIOACTIVE_FALLOUT` (50, 10t) | 15–50 | The per-turn damagers — but all expire after `TimeValue` turns. |
| **FULLY TRANSIENT** (true / true) | `SAND` (0), **`BURNED` (0)**, `SNOW_LIGHT/MEDIUM/HEAVY_TRANSIENT` (0) | 0 | Weather/cosmetic; decay fast. |

**Key takeaways:**
- **`BURNED` is NOT permanent** — it is fully transient (both decay flags true, like `SAND`). The explicit permanence signal in the data is the **`_PERMANENT` vs `_TRANSIENT` name suffix** on the snow effects.
- The permanent **damaging** effects (`STONE_TRAP`, `DIGSITE`) are **one-shot traps** (`RemoveOnEnter`), not continuous attrition.
- ⇒ **No base plot effect is permanent AND deals continuous per-turn damage to occupants.** That niche was empty — which is exactly what `PLOTEFFECT_DESERT_HEAT` (permanent, `Damage=11`, no `TriggerOnEnter`) was created to fill, and is now proven to work.
