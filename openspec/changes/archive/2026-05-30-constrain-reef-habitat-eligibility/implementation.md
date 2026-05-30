## Implementation Evidence

Reef-family score ops now consume coastline structure from the Ecology
score-layers step:

- `shelfMask`
- `coastalWater`
- `distanceToCoast`

Feature-specific behavior remains in owning reef score ops:

- `reef-score-reef`: warm, shallow, near-coast shelf water.
- `reef-score-cold-reef`: cold, deeper shelf/edge water rather than shallow
  warm-reef relabeling, with a bounded depth window rather than "deeper is
  always better."
- `reef-score-atoll`: warm shallow shelf/bank water isolated from existing
  land coast.
- `reef-score-lotus`: exact `FEATURE_LOTUS`, warm shallow near-land water.

The Earthlike preset/config was tightened to match the owner defaults and avoid
retaining broad legacy depth bands.

## Research Evidence

The algorithm design used external formation constraints from NOAA/USGS-style
sources gathered during the research pass: warm reef-building corals need warm,
clear, shallow tropical/subtropical water; atolls are isolated reef structures
formed around subsiding volcanic islands rather than fringing coast; cold-water
corals occupy colder deeper shelf/slope/seamount habitats.

## Guard Evidence

- `mods/mod-swooper-maps/test/ecology/feature-habitat-eligibility.test.ts`
  verifies warm reef, cold reef, atoll, and `FEATURE_LOTUS` habitat partitioning.
- `mods/mod-swooper-maps/test/ecology/earthlike-balance-smoke.test.ts` bounds
  reef-family and atoll density through `standardRecipe.run`.
- Repaired Earthlike smoke metrics for seed `1018`, `32x20`: reef family
  `8/610` water tiles, atolls `0/610`.

Adversarial review P2 on unbounded cold-reef depth scoring was accepted and
repaired.

## Verification

- `bun run --cwd mods/mod-swooper-maps test -- test/ecology/no-fudging-static-scan.test.ts test/ecology/ecology-step-import-guardrails.test.ts test/ecology/score-shared-physics-selection.test.ts test/ecology/feature-planner-policies.test.ts test/ecology/feature-habitat-eligibility.test.ts test/ecology/earthlike-balance-smoke.test.ts test/ecology/op-contracts.test.ts`
  passed, 32/32 tests.
- `bun run --cwd mods/mod-swooper-maps check` passed.
- `bun run openspec -- validate constrain-reef-habitat-eligibility --strict`
  passed.
- `bun run openspec:validate` passed.
- `bun run build` passed.
- `bun run deploy:mods` passed and deployed `mod-swooper-maps`.
- `git diff --check` passed.
- Fresh `Scripting.log` evidence after deploy shows the standard recipe reached
  `[50/50] ok mod-swooper-maps.standard.placement.placement` and destroyed the
  `MapGeneration` context cleanly.
