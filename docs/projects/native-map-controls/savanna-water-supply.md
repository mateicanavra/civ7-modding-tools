# Savanna Water-Supply Admission

## Causal Finding

The unchanged Standard Earthlike capture for seeds 3, 99 and 1234 contains warm,
tropical-seasonal habitat. The absent woodland is not explained by cold climate,
failed native placement or a missing tropical biome. Almost all candidate
habitat receives zero suitability from an additional wet-side water-supply
penalty: the scorer becomes zero at water01=0.7, although the biome admits
subhumid tropical-seasonal land above that annual supply.

`water01` is the substrate's composite annual availability proxy, including
effective moisture. It is neither rainfall in millimetres, soil waterlogging,
nor observed dry-season duration. Aridity is a separate annual demand/supply
relationship. Neither artifact establishes fire or seasonal drought. Treating
abundant supply as a categorical woodland exclusion adds an unsupported policy
on top of the existing biome and stress gates.

## Owner Repair

The existing `vegetation-score-savanna-woodland` rule retains its exact dry-side
smoothstep and removes only the upper water-supply shoulder, matching the
already accepted forest supply response. Every previous score through
water01=0.5 remains Float32-identical. Energy, water-stress and biomass factors,
land masks, broad habitat, temperature, density, confidence, occupancy and Civ
flat-terrain legality remain unchanged. There is no new operation, artifact,
authoring control, quota, temperature adjustment or seasonal-process claim.

Actual wet exposure and earlier wetland occupancy remain their own exclusions;
this change does not admit savanna on lakes, river corridors, hills or mountains.
Stock terrain.xml declares this feature on flat terrain only, so relaxing the
hill filter would be a different, unqualified change.

## Unchanged-Bank Qualification

All 57 scenario inputs and all 4,430 expectation definitions are unchanged.
Every one of the 2,166 captured physical-field hashes is exact. Ecology,
resources and placement metrics change downstream of the additional woodland;
no previously passing expectation fails. These are legitimate downstream
changes, not an output-identity claim for the whole map.

| Standard Seed | Before | After |
| --- | ---: | ---: |
| 1 | 5 | 13 |
| 2 | 37 | 101 |
| 3 | 0 | 6 |
| 42 | 8 | 14 |
| 99 | 0 | 20 |
| 1018 | 27 | 36 |
| 1234 | 0 | 3 |
| 7777 | 15 | 80 |

These are final savanna woodland tile counts, not coverage quotas. All attempts
in this cohort are accepted. The existing presence expectation changes from
five to eight successful seeds without altering its six-seed requirement.
Within-row temperature variation remains 0.14307375570774913 C against the
unchanged 1 C floor. The thermal failure is not repaired or waived.

Focused public-operation/planner/publication tests pass 31 cases with 13,836
assertions. Independent semantic and SDK-simplicity review reports ALIGNED with
no finding; the patch uses the existing operation and private arithmetic,
without new TypeScript scaffolding or recipe computation.

The complete owning graph passes checks, types, policy and builds. Definition
tests report 1,182 passes and the one retained thermal aggregate failure;
realization tests pass all 371. This is not an all-green science claim.

[PR #2251](https://github.com/mateicanavra/civ7-modding-tools/pull/2251) merges
the qualified repair through Graphite at `2026-10-02T18:14:21Z`. Main commit
`b134ef300ffd56bc022f5447c5ec16a71e8b32e4` retains the exact source tree
`f616fcaee985cd6fdc8c0f965d70287c70156f7d`. At merge/sync, the worktree was clean;
all fourteen protected main files retain their recorded bytes. The pre-push
root check graph passes all 187 tasks. This does not supersede the separately
reported science failure.

## Native And Visible Milestone

The same registered mod is deployed with Earthlike script SHA256
`b33af31a2c29ef50160dd661fc78dcca1d89713e6ae8dfcf12ec06d8e8093e5c`.
A fresh Huge 106x66 run uses map/game seeds 1018/1018, twelve players,
Exploration and the existing `ToT_NoModsExceptMaps` configuration. The owning
live verification completes at `2026-10-02T17:57:24.686Z`.
Native feature application accepts 23 savanna woodland tiles with zero
savanna legality rejections. All 666 intended dry river sources survive:
346 minor and 320 navigable, with zero missing, extra, wrong-class or
navigable-terrain mismatches. Final elevation has zero unplanned lake or
non-lake mismatches; the 165 declared water adjustments retain their separate
projection meaning rather than being relabeled output identity.

Four native photographs (`savanna-native-atlas-recovered-20261002/index.html`)
show two maximum-zoom-out neighborhoods and two details. Native reads confirm
the three newly admitted Huge1018 plots at `(1,33)`, `(0,34)` and `(80,35)`;
the world summary is exact before and after camera-only photography. The
gallery page and thumbnail bytes are verified through the existing Tailscale
Serve path. This is a current appearance milestone, not a new vessel test.

The same fresh session completes ten normal autoplay turns, T1 through
T11/500 CE. Public autoplay readback confirms zero turns remaining, inactive,
player zero and observer zero restored, then paused. The completion precedes
the final stop request; it is not an early-stop receipt. The exact current
script hash, start/end receipts and qualification are retained in
`savanna-water-supply-native-20261002/AUTOPLAY-RESULT.json`, also linked from
the mobile gallery. This proves bounded ordinary turn execution on this build,
not a new vessel route or universal game stability.

The first launch crashed in Civ during previous-game unload, before the new
generation began. Its failed receipt and native crash/log evidence remain
separate. After a Steam-launched fresh process, the existing owning live path
completes; no map algorithm was changed to recover that application lifecycle.

Evidence lives under the discoverable Civ research user-data directory:
`VisualAtlas/huge-1018/earth-calibration/earth-savanna-admission-capture-20261002`,
`earth-savanna-water-supply-design-20261002`, and
`savanna-water-supply-bank-20261002/SAVANNA-QUALIFICATION.json`.
The predeclared design, unchanged captures and qualification are separate from
the deployment/live receipts in `savanna-water-supply-native-20261002/` and the
four photo receipts in `VisualAtlas/huge-1018/savanna-native-atlas-recovered-20261002/`.
