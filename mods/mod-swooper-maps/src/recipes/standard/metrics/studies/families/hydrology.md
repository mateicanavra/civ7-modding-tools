# Hydrology measurements

**Executable authority:** [`families/hydrology.ts`](../../families/hydrology.ts)

This family measures modeled river coverage by minor and major class, outlet and
ocean-terminal coverage, the published river-network summary, navigable-river
selection, and final headless readback reconciliation.

River classes remain model evidence: `0` is absent, `1` is minor, and `>=2` is
major and eligible for navigable projection. Missing terminal classification is
retained as `null`; the measurement does not infer it or decide how many rivers a
product should contain.

## Scale and interpretation

- A Civ tile is a strategy-scale sample, not a geodetic cell. Study sheets record
  the named Civ7 dimensions and must state any latitude assumption used for a
  tile-to-kilometer translation. A tile is never compared directly to a 30 m
  river pixel.
- Hidden drainage and minor/headwater intent may sit below Civ terrain
  visibility. Only modeled `riverClass>=2` is eligible for
  `TERRAIN_NAVIGABLE_RIVER`; `riverClass=1` remains hydrology model evidence unless a
  separate native metadata writer is proven.
- An Earth-referenced target names its climate/relief regime: `wet`, `normal`,
  `arid`, `mountain`, `closed`, `archipelago`, or an explicit extension. A dry or
  no-visible-river result is meaningful only with its regime and measured
  denominators.
- The captured river-network summary retains land/water/lake denominators,
  minor/major counts, permanence, low-order hierarchy, terminal shares, basin
  coverage, and routing-health counters. Projected terrain and headless readback
  stay separate from that model evidence.
- Any Civ-visible exaggeration, merging, omission, or native-engine substitution
  belongs in the pre-declared expectation ledger with its Earth anchor, affected
  metric, reason, changed product claim, and proof gate.

## Earth reference families

- [HydroRIVERS](https://www.hydrosheds.org/products/hydrorivers) maps reaches at
  a coarse floor of catchment area `>=10 km2` or average flow `>=0.1 m3/s` and
  reports 8.5 million reaches over 35.9 million km.
- [Global hydrography analysis](https://www.nature.com/articles/s41597-021-00819-9)
  treats the HydroRIVERS threshold as empirical; targets use regime families and
  topology rather than one universal scalar.
- [GRWL](https://www.science.org/doi/10.1126/science.aat0636) covers more than
  2.1 million km of rivers at least 30 m wide. It anchors visible-river scale, not
  total drainage density.
- [Global non-perennial river modeling](https://pubmed.ncbi.nlm.nih.gov/34135525/)
  estimates that flow stops at least one day per year along 51-60% of river
  length, so permanence is a distribution rather than a universal channel state.
- [HydroLAKES](https://www.hydrosheds.org/products/hydrolakes) reports about
  1.4 million lakes and reservoirs covering 2.67 million square kilometers.
