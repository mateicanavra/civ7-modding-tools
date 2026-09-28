# Certified Singleton Lakes

## Decision Boundary

The `single-tile-lake-share <= 0.2` limit is a legacy lake-selection/projection
guard, not a certified physical-integrity requirement. Retain the raw count and
share as descriptive evidence. Do not increase the threshold, remove supported
bodies, invent a minimum lake area, or change routing to satisfy this proxy.

Certified integrity instead requires complete physical footprints, positive raw
certificates, nonnegative mixed-body budgets, conserved flux, clear landform
exposure, and complete native projection. Existing direct gameplay, placement,
and relief guards remain independent requirements. Neither those guards nor
marine access prove universal gameplay quality or immediate unit navigation.

## Reproduced Failures

The first integrated bank contains 96 unique scenarios, including 47 Earthlike
scenarios. Exactly five fail this ratio. Public capture reran those exact catalog
scenarios with unchanged configurations, seeds, and player setups; all five
ratios reproduced exactly, without resampling.

| Earthlike Case | Singleton / Lake Tiles | Lake Share | Original / Exposed Land | Singleton / Original | Singleton / Exposed |
| --- | ---: | ---: | ---: | ---: | ---: |
| Tiny 1337 | 7 / 31 | 22.581% | 868 / 837 | 0.806% | 0.836% |
| Standard 3 | 26 / 112 | 23.214% | 1,715 / 1,603 | 1.516% | 1.622% |
| Standard 99 | 15 / 53 | 28.302% | 1,730 / 1,677 | 0.867% | 0.894% |
| Standard 1354 | 13 / 62 | 20.968% | 1,699 / 1,637 | 0.765% | 0.794% |
| Standard 1355 | 15 / 73 | 20.548% | 1,616 / 1,543 | 0.928% | 0.972% |

All 76 singletons are complete one-cell certified bodies, not clipped projection
remnants. Their strict spill depths are 1..6 original elevation units. Their
raw certificate balances and actual mixed outflows are positive; the smallest
is 41.565. All five runs pass the certified conservation, partition, support,
exposure, lake-realization, and river-source/class checks. Conservation residual
magnitudes are at most 2.77e-10 against arithmetic bounds of 1.64e-7..5.90e-7.
Demand evidence comes from published baseline-driven body ledgers, not PET
reconstructed from refined climate. These are headless recipe receipts, not a
new native runtime qualification.

## Direct Topology Evidence

The counterfactual restores only singleton wet cells to dry ground, leaving all
larger lakes wet. Compare actual retained land components, not component counts
alone. No water-only split occurs in these five cases. Holding accepted mountain
and volcano masks fixed on both sides produces these additional walking-graph
separations; this diagnostic is not an admissible alternate hydrology plan:

- Tiny 1337: singleton (18,32), ground 66/spill 67, separates 642 and 17 retained
  playable cells. Both have marine-coast access. Adjacent mountains are heights
  69, 71, and 73; body outflow is 920.324.
- Standard 3: singleton (56,28), ground 6/spill 7, separates 360 and 200 cells.
  Both have marine-coast access (82 and 32 coastline cells). Flanking mountains
  are height 25/15 with local relief 44/22; body outflow is 1609.011. This is a
  real valley lake plus mountain obstruction, not a missing budget or clipping.
- Standard 3: (82,15), ground 10/spill 11, separates 15 and 2 marine-accessible
  cells. Singletons (28,39), ground 50/spill 56, and (27,40), ground 49/spill 53,
  flank a 3-cell pocket. Restoring either joins it to 426 cells. That pocket has
  no marine-coast cell; all three cells border lakes. This remains a concrete
  local gameplay caveat, not justification to silently erase supported lakes.
- Standard 99, 1354, and 1355 have no singleton-attributable fixed-landform split.

Radius-3 hex neighborhoods around playable centers contain at most 2/4/4/3/3
singletons respectively. This radius is diagnostic, not a city-work rule. The
worst ratio, Standard 99, has no split; Standard 3 has a lower ratio but the
largest separation. Enlarging an unrelated lake could make the ratio pass
without improving any corridor. Thus the ratio is not a direct gameplay guard.
No zero-fragmentation target, mountain corridor policy, or universal navigation
claim follows from this study.

## Receipts

- Original bank: `/tmp/civ7-study-bank-certified-integration-first.json`.
- Public capture/analysis: `/tmp/civ7-certified-singleton-study.ts`.
- Exact scenarios and arrays: `/tmp/civ7-certified-singleton-captures.json`.
- Budgets, coordinates, clustering, topology and SHA-256 array digests:
  `/tmp/civ7-certified-singleton-results.json`.
- Cut analysis: `/tmp/civ7-certified-singleton-neighborhoods.ts`.
- Heights, blockers, before/after rows and component/coast evidence:
  `/tmp/civ7-certified-singleton-neighborhoods.json`.
