# Marine Ice Feature Eligibility

## Decision

The October 2 native Huge1018 run attempts 26 `FEATURE_ICE` placements, all on
finite inland water, and rejects all 26. Installed Civ7 1.5.0.43
`Base/modules/base-standard/data/terrain.xml` declares that feature as
`NoLake=true`, Coast/Ocean terrain and Marine biome. The existing scorer also
admits alpine land through authored elevation and freeze thresholds. That
capability is live for custom configurations, but has no qualified native
alpine projection. Its retirement is deliberate, not a dead-code assertion.

The selected repair admits marine feature intent at the existing Ecology
scorer and planner. It does not change physical freezing, permafrost, ground
ice, snow, climate, water levels or drainage. Filtering only at projection
would leave unsupported intents claiming occupancy before Civ rejects them.

## Ownership

`ice-score-ice` now has one `marine-temperature` strategy. It consumes the
existing final `topography.externalWaterMask` and current
`climateIndices.surfaceTemperatureC`, with dimensions. Exact mask membership
one receives the unchanged temperature ramp; all other cells receive zero.
This is marine-eligible feature scoring, not a newly qualified SST contract.

`features-plan-ice` independently requires the same mask and checks membership
before occupancy or confidence. This matters because an authored confidence
threshold of zero admits a zero score, and callers can supply their own high
scores. The existing `>=` confidence boundary remains unchanged for eligible
recipients. Steps merely declare and forward the existing artifact references;
no new artifact, cast, registry or compatibility lane is introduced.

The scorer strictly retires `landMask`, `elevation`, `freezeIndex`, the
`thermal-elevation` strategy and `alpineElevationMinM`, `alpineElevationMaxM`,
`alpineFreezeMin01`. The three retained authored configurations migrate only
that ice envelope; sea-temperature values remain `-10/-2`. Old operation and
complete-map envelopes refuse canonical admission rather than silently losing
their obsolete fields. Generated schemas and artifacts remain owner-generated.

Physical external water is the established prescribed ocean recipient, not
the inverse of initial or exposed land and not native `isLake`. Native size
classification may still reject a small external component. Final
`canHaveFeature` reporting remains authoritative for those projection cases;
this repair neither forces placement nor conceals residual rejection.

## Qualification Contract

The prospective ledger and implementation design are retained in the
discoverable Civ research directory:
`~/Library/Application Support/Civ7Tools/VisualAtlas/huge-1018/earth-calibration/ice-feature-native-qualification-20261002/`.

Acceptance requires:

- Exact retained temperature ramp, Float32 outputs and confidence boundaries;
  no finite-water or terrestrial intent even with supplied high scores and
  threshold zero; malformed and retired contracts refuse.
- Direct declared mask/temperature forwarding, unchanged prior artifacts,
  preserved Lotus/reef checks and physical cryosphere/snow tests.
- All 57 current scenario identities, 22 studies and 4,430 comparator
  definitions unchanged, apart from the declared ice-envelope migration.
- All 38 captured physical fields per scenario unchanged: 2,166 exact hashes.
  Cryosphere/snow lanes are qualified by unchanged owners and inputs plus
  focused tests, not falsely claimed as additional captured hashes.
- No previously passing study expectation regresses. The existing thermal
  variation failure stays unchanged and unwaived.
- Fresh saved Huge1018 native generation removes the demonstrated 26 ice
  attempts and 26 rejections while preserving river sources/classes and
  native height observations.

Released occupancy can legitimately change later feature, resource or start
placement. Such changes must be reported; whole-map identity is not required.
Deployment, live generation and appearance remain separate claims.

## Outcome

The completed 57-scenario comparison retains all 22 studies, 4,430 comparator
definitions and the entire evaluation exactly. All 2,166 physical-field hashes
remain exact. The declared strategy migration is the only configuration change;
1,095 unaffected source hashes remain exact. Portable ice intent falls from
1,224 attempts to zero across 42 scenarios. That portable count is not native
placement evidence. Independent review reproduces the qualification and pins.

Focused verification passes 44 tests and 457 assertions. The definition suite
passes 1,194 tests with only the existing thermal aggregate failing; realization
passes 371. After correcting two test-wrapper contextual types and removing the
empty retired strategy directory, the 32-task check/build graph passes. No
physical requirement or study observation changes.

The generated build is deployed with Earthlike script SHA256
`9180402573b831fde9dd4ce9146b8cc858b5c64acd83301d5a61b1feba453e71`.
Fresh saved Huge1018/1018, twelve-player Exploration generation completes on
October 2 at `21:23:16Z`, through the public live verification target. The
demonstrated 26 invalid ice attempts and rejections become zero. All native
feature rejections are zero; 23 savanna tiles remain applied, and all 346 minor
and 320 navigable sources and final native height measurements remain exact.
The saved setup, bounded generation window and installed bytes are verified.

The preceding attempt crashes while unloading the old game, before generation.
Its crash report and unchanged generation log are retained independently. A
fresh Steam process recovers the public target without another deployment or a
map-algorithm workaround. That is lifecycle recovery, not a failed ice law.

Complete bank and native receipts are under
`earth-calibration/marine-ice-bank-20261002/` and
`earth-calibration/marine-ice-native-20261002/`. Qualification status is
`MARINE_ICE_OWNER_QUALIFIED` and `QUALIFIED_MARINE_ICE_NORMAL_GENERATION`.
The repair is merged through
[PR #2255](https://github.com/mateicanavra/civ7-modding-tools/pull/2255), at
`2026-10-02T21:43:29Z`, into main commit
`f9cab8d7b9e816f330514b521986219cd5808117`. Native Graphite sync preserves
the qualified source tree exactly; all fourteen protected main-checkout files
retain their original hashes. The existing game is fully revealed through the
public Explore command; that is visibility evidence, not another movement trial.
This closes feature admission, not all Earth climate calibration, universal
marine identity or a new vessel test. The prior sixteen-view atlas retains its
own build and turn; these feature-intent repairs are not new photographic proof.
