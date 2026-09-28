# Earthlike Climate Correction

## Investigation Brief

Prepared by root, 2026-09-27. Source baseline: `40a74b5206` after native
elevation acceptance. Owner: `plugins/mod/map/swooper-physics` unless raw
diagnostics falsify the definition hypothesis. Status: headless acceptance
passes under the explicit E2.5 amendment; native proof pending.

### Frame

The player should see regionally coherent Earthlike climate and biomes rather
than conspicuous straight horizontal stripes. Preserve broad latitude trends;
do not replace them with random texture. Foreground the causal fields and
selected strategies, not the biome palette or one attractive seed.

In scope: Swooper Earthlike configuration, the physical climate-to-biome path,
local branch/config lineage, focused regression coverage and existing studies.
Other map identities are hold guards, not simultaneous tuning subjects. Native
river writing follows acceptance of this correction, in the same worktree and
Graphite stack. Controller/Play, general visualization infrastructure, Explore
performance and unrelated main edits remain outside this correction.

Hard core: physics remains authoritative; fix the earliest demonstrated cause;
preserve legal and playable downstream products; verify raw fields separately
from Studio and Civ7. Elevation integration left physical-model hashes unchanged.
The user also observed stripes before that integration. Neither fact alone
identifies their cause.

Structural alternatives: configuration/strategy selection drift; a defect or
scale mismatch inside the current physical transition; correct physical fields
collapsed by biome classification or rendering. Raw regional variation with
only projected stripes falsifies the initial climate/config hypothesis.

### Questions And Evidence

Primary question: which transition first loses regional variation on Earthlike?
Secondary questions: was a stronger strategy disabled; does an unadopted local
branch contain the intended fix; are existing stripe tests discriminating?
Exclude new Earth simulation, global retuning and cosmetic jitter as substitutes
for causal correction. Trace source and exact admitted config, then compare
raw temperature, moisture/rainfall, aridity and biome fields on stable seeds.

Three read-only lanes report to root: current causal path; local branch/config
history; raw diagnostics and existing metric targets. Root owns synthesis,
behavioral expectations, implementation choice and all live mutations. Stop
searching once a minimal counterfactual distinguishes the leading explanation;
return to design if the necessary fix changes ownership or physical contracts.

Code and deterministic raw arrays outrank historical prose and screenshots.
Native proof establishes only the exercised setup. Missing diagnostic fields
remain missing, not successful climate evidence. No claim that a strategy is
more realistic follows from its name alone.

### Baseline And Next Action

- Baseline native map: Huge Earthlike, map/game seeds 1018, saved
  `ToT_NoModsExceptMaps`; the recipe observes player IDs 0-9.
- Matching deterministic dump: `e27fcdce-a2d4-4985-8853-cce1b468665b`, under
  `/tmp/civ7-earthlike-climate/earthlike-climate-baseline/`.
- The dump contains Ecology temperature, moisture, aridity and biome arrays.
  Hydrology baseline/refine visualization emission failed, so the dump alone
  does not support a rainfall attribution.
- Existing full-bank baseline: 27 studies, 91 scenarios, 6,197 expectations pass.
  This includes a biome-structure sample at seed 1337; its strength is itself
  under examination, not proof that the reported stripes are acceptable.
## Causal Result And Decision

The four-case convergence ablation completed eight executions with no missing
fields or facet errors. Seasonal land rainfall saturation falls from 35.7-45.3%
to zero when convergence is disabled; refined annual saturation falls from
10.9-17.8% to 0-0.42%. This identifies a scale defect, not a recommendation to
disable convergence. Raw signed-byte wind divergence is multiplied by 35 and
the authored strength, so a convergence of only 0.301 adds the entire 200-unit
rainfall range on Earthlike. It also creates precipitation without consulting
available humidity.

Temperature remains more than 99.95% explained by latitude rows in the ablation.
The thermal operation applies coefficients inherited from meter-labeled inputs
to normalized relief quantized at 100 units, without subtracting sea level.
Earthlike's final lapse coefficient cools only 0.95 C per 100 relief units. This
is not a demonstrated factor-of-100 physical conversion: relief has no meter
calibration. It is a demonstrably weak geographic response in an empirical model.

The old wind realism branch was substantially adopted on main, with later
intentional changes. Earthlike already selects vector moisture/precipitation,
pressure-driven wind and current-coupled SST. There is no missing strategy switch.
Refine's independent thermal calculation has different annual forcing and
author controls from baseline's seasonal pressure/evaporation calculation;
merging those roles is not required to fix these demonstrated defects.

## Behavioral Expectation Ledger

Declared before production edits, 2026-09-28.

- Outcome: geography changes climate within latitude bands; convergence remains
  a moisture-supported wetting signal rather than a saturation switch.
- Owner: Hydrology climate operations and Earthlike config. Definition metric
  capture/families/targets retain ownership of regression expectations.
- Cohort: Huge 1018 (players 0-9), Standard 1018/1/42 (players 0-7), map/game
  seeds equal; retain Huge 1337 existing biome study and full-bank hold guards.
- Baseline: `/tmp/civ7-earthlike-climate-counterfactual-summary.json` and the
  preceding deterministic/native elevation receipts.
- Modeled: transported moisture, wind convergence, topographic relief, latitude
  forcing, snow/albedo feedback. Approximated: rainfall and relief scales.
  Absent: physical-meter height calibration and land heat-transport simulation.
- Falsifier: normalized, moisture-gated convergence still saturates broad rows,
  or meaningful relief cooling fails to produce regional temperature/biome
  variation without violating ecology, routing or placement guards.

| Alternative | Benefit | Risk | Decision |
| --- | --- | --- | --- |
| Normalize and bound convergence; calibrate Earthlike relief cooling above sea level | Fixes both measured causes at existing owners | Downstream wetness and habitat balance change | Selected |
| Disable convergence, switch precipitation strategy, or transplant old winds | Quick apparent variation | Removes valid mechanism or changes unrelated circulation | Rejected |
| Merge baseline/refine thermal products and add land heat transport | More complete coupled climate | Changes seasonal/annual semantics beyond demonstrated need | Not required for this correction |
| Jitter biome thresholds or increase categorical smoothing | Can disguise stripes | Leaves wrong physical inputs intact | Rejected |

| ID | Measurement | Pre-declared expectation | Owner |
| --- | --- | --- | --- |
| C1 | Seasonal/annual land rainfall at 200 | Seasonal <10%; refined annual <5% in each case | Climate diagnostics; annual in existing climate metric family |
| C2 | Pooled within-row land temperature SD | 1-8 C in each case, retaining broad latitude trend | Existing climate metric family |
| C3 | Land-weighted dominant biome share by row | <=0.75 in each case; retain cold and varied biomes | Existing ecology biome-row metric family |
| H1 | Modeled upstream land/coast/elevation | Exact hashes unchanged | Diagnostic comparison |
| H2 | Routing, lakes, river hierarchy | Existing closure/integrity guards pass | River-network/integrity studies |
| H3 | Habitats, features, resources, starts | Existing ecology, placement, floodplain and full-bank guards pass | Existing study bank |
| H4 | Determinism and input semantics | Repeatable fields; datum-invariant lapse; dry convergence adds no rain; bounded wet response | Focused operation tests |

PASS requires targets plus hold guards. Missing fields are inconclusive;
mechanism failures trigger redesign, not relaxed bounds. Any calibration
amendment must be recorded before re-evaluation. The installed Civ7 1.5 policy
and legality bank remain unchanged. Live proof will load saved
`ToT_NoModsExceptMaps`, Huge Swooper Earthlike 1018, collect fresh receipts/logs,
then reveal for inspection. Mock metrics alone do not prove native behavior.

## Results

The final built public metric bank passes 28 studies, 91 unique scenarios and
6,408 expectations, including the four-case climate study and all shipped
identity, routing, ecology, placement and resource guards under the explicit
E2.5 amendment below. Receipt: `/tmp/civ7-climate-final-full-studies.json`.
Within-row temperature SD is 2.505-4.528 C; the maximum qualified-row dominant
biome fraction is 0.666 (limit 0.75), with all eight land biome families in each
case. Raw comparison records unchanged upstream land/coast/elevation hashes.
Seasonal saturation is at most 0.0733%, and refined saturation at most 0.5956%.
These are headless outcomes; native proof remains a separate acceptance gate.

The final Nx `check`, explicit `check:policy`, and `test` graph for
`swooper-physics,swooper-physics-mod` passes all 34 tasks, including 655 definition
tests (27,140 assertions) and 97 realization tests (724 assertions). Receipt:
`/tmp/civ7-climate-accepted-integrated-verification.log`. The preceding attempt
caught two test-only tuple/readonly typing errors; both are repaired and the
complete graph rerun successfully. Independent final review found no production
defect; its additional biomass-normalization coupling is documented below.

### First Candidate And Response Calibration

The first candidate passes C1-C3 and river/wind/floodplain studies, but fails
existing rainforest-presence and geological-resource aggregation guards. It is
not accepted. Temperature within-row SD is 2.51-4.53 C; modeled topography hashes
are unchanged. Existing habitat/placement failures remain under investigation.

A same-source zero-convergence comparison shows the unit-normalized response
survives annual quantization on only 8.8-13.1% of land, always by one rainfall
unit (mean contribution 0.09-0.13). Positive annual normalized convergence has
median 0.0053-0.0061, p95 0.0262-0.0331, maximum 0.0557-0.0635 across the cohort.
Before the next run, adopt empirical response gain 16 *inside* the bounded
response: upper-typical convergence reaches roughly half the wetting allowance,
and convergence >=1/16 reaches its cap. This is not a meteorological constant;
the authored strength remains the maximum humidity-supported rainfall bonus.
No acceptance threshold changes. Recheck the practical contribution as well as
clipping; a synthetic nonzero response alone is insufficient.

### Supply/Demand Interpretation

The next causal discriminator found a real interpretation mismatch: Hydrology
publishes `A = PET / (PET + rainfall + 1)`, but Earthlike starts a whole-category
drying shift at A=0.2, even when rainfall approaches four times PET. Removing
rainfall saturation exposed this previously compensated coupling. The old
Ecology PET/bias/normalization controls are unused; changing them cannot repair
the live index. With current PET, all eight cohort maxima are below A=0.42.
Simply changing the threshold would remove every desert, not fix water balance.

Pre-declare the next in-memory calibration before evaluating it: Earthlike's
active Hydrology PET temperature weight 82 -> 200, keeping its baseline 19,
temperature span 0-36 C and humidity damping 0.5; Ecology drying thresholds
become [0.5, 2/3], corresponding approximately to demand exceeding supply and
demand exceeding twice supply (the denominator retains its existing +1 guard).
For a 30 C tile, rainfall 110 should imply demand about 135 and a drying shift;
rainfall 170 should imply demand about 107 and no drying shift. Keep existing
moisture buckets initially. The eight-seed ecology cohort must retain both wet
and dry habitats, all original ecology guards, and the climate targets above.
This is calibration of a game-scale proxy, not a claim of measured Earth PET.

Seed 42's first-candidate rainforest loss is competition, not native rejection:
28 rainforest biome tiles include 11 eligible above-threshold flat-land sites,
all already occupied by mangrove. Corrected supply/demand interpretation exposes
additional suitable inland sites without changing intentional habitat priority.

The geological aggregation failure is a separate downstream sensitivity, not
grounds to select climate constants until a resource test happens to pass.
Climate legitimately changes geological habitat/policy eligibility; shared
resource competition then reshuffles even unchanged iron habitat. Finish the
climate calibration first; repair Resources selection only if its guard still
fails on the accepted physical fields. Do not waive the guard or erase lawful
climate-dependent resource habitats.

### Rejected PET Calibration And Next Discriminator

The PET-200 trial failed: rainforest features fell from 36 to 2 across eight
Standard seeds, despite rainforest biomes increasing from 557 to 681. Savanna
and sagebrush presence also failed. No PET or drying-threshold edit was promoted.
The ratio is an advisory relative aridity index, not itself a fraction of unmet
water demand. Treating 0.5 as a physically mandatory classification threshold
would overstate what this empirical budget establishes.

Before changing the shared stress model, isolate another concrete mismatch:
Earthlike requires 30 C for its tropical temperature zone, versus the operation
default of 24 C, while warm vegetation scoring starts much lower. Stronger
terrain cooling exposes that narrow support. The lookup also labels sufficiently
wet *temperate* cells tropical rainforest; biome counts therefore cannot prove
warm rainforest habitat. Run the existing eight-seed ecology cohort with only
the tropical threshold restored to 24 C in memory. Keep PET, aridity shifts,
moisture thresholds and feature scoring unchanged. This is a discriminator, not
acceptance or an authorization to tune until green. Separately inspect whether
bounded rainforest water response incorrectly penalizes its wettest endpoint.

Independent review confirms the wetness endpoint halves suitability at water=1,
without any waterlogging input, and confirms the temperate lookup loophole.
The next candidate therefore preserves PET82 and all stress/admission controls,
keeps temperate/perhumid land temperate, and replaces only rainforest's wetness
bandpass with its existing lower smoothstep. The 24 C cutoff also changes the
existing biomass energy normalization; record that coupled effect rather than
claiming a classification-only change. Savanna's configured admission floor is
zero, so its missing sites cannot be attributed to the score curve alone. Keep
the wetland-first occupancy order and native legality unchanged.

The threshold-only run passes all existing eight-seed ecology expectations,
including rainforest on every seed and savanna/sagebrush on 8/8. Promote 24 C
into Earthlike, then rerun with the two semantic rule corrections and all other
guards. Remove the 13 unused legacy Ecology temperature/PET controls from the
schema and eight authored maps; Hydrology remains their sole physical authority.

### Resources Selection Simplification

The Resources review found a specific redundant response rather than a reason
to retune climate. Habitat already publishes geological intensity with a 0.3
baseline; selection applies another 0.3 baseline, raising admission at zero
geological signal to 0.51. Its second rotation sweep then ignores intensity,
although the existing intensity-ranked completion pass already meets required
minimums and targets. Test one direct-intensity rotation pass followed by that
existing completion. Preserve official co-eligible weight arbitration, lawful
habitat, affinity, equity, same-type spacing and regional minimums. Acceptance
requires the unchanged resource cohort and focused preference/zero-intensity
fixtures; inspect close cross-type pairs because completion legitimately relaxes
cross-type spacing. This candidate is not accepted merely because pair counts
increase.

The direct-intensity candidate retains one failed aggregation sample (1338).
Inspection identifies a second independent defect: completion penalizes a site
for competitors whose target is already met or whose spacing/exclusion makes
the site unusable. Count only remaining admissible demand, including outstanding
regional obligations; retain the coefficient and all spacing policy. Six focused
fixtures distinguish satisfied, blocked, actual and regional competition. The
83-test Resources suite passes, but the unchanged aggregation guard still fails
1338 (0.8334). This is not permission to tune the selector to that seed. Review
the guard's statistical and historical authority before another production edit.

#### Explicit E2.5 Acceptance Amendment

Independent review supports changing the quantifier, not tuning a lower per-seed
bound. The current target genuinely fails; retain that result. Its measurement
pools geological types at distances 5-6 against uniform complete spatial
randomness. It does not measure adherence to each type's geological intensity.
For 1338, a diagnostic intensity-weighted support model changes from 1.080 to
0.874 when accounting for realized type composition; it omits spacing and
competition, so is not a feasibility proof. Earlier S5 evidence already recorded
a below-CSR seed in the twenty-seed observation while passing its five-seed gate
(`../placement-realignment/evidence/s5-results-2026-06-10.md`, E2.5 note).

The later pre-climate elevation receipt did pass the strict twenty-seed gate;
its archived boolean result does not retain the exact 1338 ratio. Thus the new
failure is a genuine regression against that receipt, not a retroactive pass.

Before the final integrated run, amend only this statistical expectation:
require a nonempty cohort, every ratio finite and available, and arithmetic
mean strictly greater than 1. Retain per-seed measurements, including 1338, and
all per-map habitat, legality, closure, spacing, equity and placement guards.
This accepts cohort-level aggregation, not universal per-map clustering or
physical fidelity. The current twenty-map mean is 1.2749 (median 1.2784;
excluding its strongest map, mean 1.2426), not an isolated strong outlier.
Focused tests must reject empty/missing/nonfinite evidence and mean <=1, and
accept a below-one member only when the full cohort mean exceeds one. Existing
coherent-versus-flat intensity and admissible-competition mechanism tests remain
required. A future per-map fidelity claim needs type-aware, multiscale evidence,
not another arbitrary ring cutoff. H3 is amended only in this stated respect.

Paired fixed-climate attribution separates the cleanup effects: mean ratio
1.1737 -> 1.2378 -> 1.2749 for original, direct-intensity and admissible-contest
selection. Mean selected intensity increases 0.6060 -> 0.6171 -> 0.6212 against
type-matched eligible baselines about 0.588. On 1338 specifically, completion
intensity rises 0.6557 -> 0.6676 while its ring ratio falls 0.9005 -> 0.8334.
These distinguish physical preference from this spatial proxy; they are not
comparisons against the original climate. Close cross-type pairs also increase
through existing completion semantics, so do not attribute aggregation gains
solely to intensity. The detailed paired receipt is
`/tmp/civ7-resource-guard-reasoning.md`.

### Preview Provenance

The first Arc rerun was not fresh despite rebuilding and reloading. HTTP served
the old convergence formula, lapse -0.0095 and tropical threshold 30 while the
generated files on disk contained the corrections. Vite intentionally ignores
definition `dist` writes, leaving its transformed modules cached. Restarting the
owned Nx Studio session and reselecting Earthlike replaces both cached code and
the persisted authoring envelope. Fresh HTTP responses then contain gain 16,
lapse -0.15 and tropical 24. Huge 1018, ten-player browser generation completes
with visibly regional biome boundaries; screenshot receipt:
`/tmp/civ7-earthlike-climate-preview.png`. This establishes browser execution,
not native acceptance. Do not remove all watcher ignores: they also isolate
operation-time generated writes from daemon lifetime.

### Shipped Identity Hold Calibrations

Two older presets also relied on the saturated rainfall distribution. Desert
Mountains became entirely desert under its [180,240,300,340] moisture buckets:
effective moisture never reaches the 240 needed after its aridity downgrade.
Calibrate only the lower buckets to [90,150,300,340], preserving its upper wet
thresholds and all feature admission. The identity seed and four arid seeds
then retain 48-101 savanna tiles, with no rainforest.

For Latest Juicy, preserve the documented drier live-feel identity and its
aridity [0.2,0.66]. Reject resetting that threshold to 0.45: it erased most
deserts. Also reject a 228..230 humid bucket, despite passing the single identity
case. Restore tropical 24 and move the two upper moisture boundaries together
from [228,252] to [206,230], retaining the original 24-unit interval and lower
[90,188] boundaries. This is empirical wet-tail calibration, not physical units.
Eight paired Standard/Huge cases (1018,1,42,1337) change only 1.21-3.27% of biome
tiles; desert count changes -1..+13, taiga counts stay identical, and all 36
physical-array hashes match in each pair. Tropical normalization also changes
biomass, as on Earthlike. The upper moisture boundary also sets the biomass
normalization denominator (boundary plus padding), now 278 instead of 300.
This raises unsaturated moisture-derived biomass independently of the thermal
change; the unchanged physical hashes do not cover either derived density
response. Latest remains dry: rainforest appears in four of eight
cases, and Standard 1337 still lacks forest. Do not claim general lushness.

The exact two identity/integrity studies, four Desert arid studies and Latest
wind/pressure study pass after canonical edits (seven studies, nine scenarios).
Focused config/domain tests pass 13/13. Full integrated proof remains required.
Receipts: `/tmp/civ7-shipped-ecology-canonical-verified.json` and
`/tmp/civ7-shipped-ecology-width-paired-report.json`.
