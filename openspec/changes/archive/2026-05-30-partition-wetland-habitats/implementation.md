## Implementation Evidence

Wetland-family habitat now starts with named substrate policies in
`compute-feature-substrate/policies/wetland-substrate-masks.ts`.

Published substrate fields:

- `lowlandMask`
- `floodplainMask`
- `intertidalCoastMask`
- `sinkBasinMask`
- `hydromorphicMask`
- `wellDrainedMask`
- `isolatedWaterPointMask`

Feature-specific scoring remains in owning wet feature ops:

- `scoreWetMarsh`: requires `hydromorphicMask`.
- `scoreWetTundraBog`: requires `hydromorphicMask` plus cold/freeze scoring.
- `scoreWetMangrove`: requires `intertidalCoastMask`.
- `scoreWetOasis`: requires `isolatedWaterPointMask` plus arid and positive
  local-water scoring.
- `scoreWetWateringHole`: requires `isolatedWaterPointMask` plus its own drier
  local-water and fertility scoring.

## Research Evidence

The algorithm design used EPA/NRCS/USGS-style wetland constraints gathered
during the research pass: wetlands require persistent saturation/flooding or
hydric substrate; mangroves are warm intertidal coastal wetlands; bogs require
cold waterlogged/peat-like conditions; oases and watering holes are arid local
water-source features rather than generic floodplains.

## Guard Evidence

- `mods/mod-swooper-maps/test/ecology/feature-habitat-eligibility.test.ts`
  verifies hydromorphic, intertidal, and isolated water-source gates.
- `mods/mod-swooper-maps/test/ecology/earthlike-balance-smoke.test.ts` bounds
  wetland density through `standardRecipe.run`.
- Repaired Earthlike smoke metrics for seed `1018`, `32x20`: wetland family
  `7/30` land tiles.

Adversarial review P1 on inverted oasis/watering-hole water scoring was
accepted and repaired.

## Verification

- `bun run --cwd mods/mod-swooper-maps test -- test/ecology/no-fudging-static-scan.test.ts test/ecology/ecology-step-import-guardrails.test.ts test/ecology/score-shared-physics-selection.test.ts test/ecology/feature-planner-policies.test.ts test/ecology/feature-habitat-eligibility.test.ts test/ecology/earthlike-balance-smoke.test.ts test/ecology/op-contracts.test.ts`
  passed, 32/32 tests.
- `bun run --cwd mods/mod-swooper-maps check` passed.
- `bun run openspec -- validate partition-wetland-habitats --strict` passed.
- `bun run openspec:validate` passed.
- `bun run build` passed.
- `bun run deploy:mods` passed and deployed `mod-swooper-maps`.
- `git diff --check` passed.
- Fresh `Scripting.log` evidence after deploy shows the standard recipe reached
  `[50/50] ok mod-swooper-maps.standard.placement.placement` and destroyed the
  `MapGeneration` context cleanly.
