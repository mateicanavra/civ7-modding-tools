# Agent 1 Notes: Earth-grounded river/lake benchmarks

## 1. Framed objective

Construct a benchmark family for Earth-like hydrology acceptance that is useful for Civ7 MapGen, not a false single threshold. The frame here is:

- Unit of analysis: continent- to world-scale hydrography expressed as measurable generator outputs.
- Foregrounded signal: metrics that survive translation from Earth science into a tile generator and can reject visibly wrong river/lake worlds.
- Exterior by design: detailed local hydraulics, seasonal hydrographs, exact gauged discharge targets, and any claim that one Earth number should hold on every map seed.

Working frame choice:

- Cynefin: mostly complicated, with complex edges caused by scale effects and threshold definitions.
- Object-path: objective framing for acceptance thresholds, with problem-framing support where a metric is definition-sensitive.
- Mode/durability: audience-export + standalone; this note should survive multi-agent handoff.

Structural alternative considered and rejected:

- Alternative: use one global river-count and one global lake-share target.
- Why rejected: Earth hydrography is definition-sensitive at least along three axes: channel initiation threshold, map resolution, and climate/relief regime. A single magic number would overfit one Earth dataset and fail both deserts and lake-rich/glaciated worlds.

## 2. Investigation design: primary questions, exclusion questions, falsifiers, evidence hierarchy, stop conditions

### Primary questions

1. Which Earth metrics are physically load-bearing for river/lake plausibility at generator scale?
2. Which of those metrics are globally Earth-like versus climate/relief-specific versus map-scale-normalized?
3. Where is the evidence strong enough for a hard-ish acceptance band, and where is only a softer warning band justified?
4. How should these metrics translate into repo-facing verification outputs such as `riverClass`, `lakeMask`, sink masks, basin IDs, and major-river thresholds?

### Exclusion questions

- Not trying to recover exact Earth geography.
- Not trying to set seasonal or historical discharge targets.
- Not trying to benchmark estuary geometry, wetlands, groundwater, or flood timing in detail.
- Not trying to derive exact Civ tile-to-km conversions from first principles in this note.

### Falsifiers

- If a proposed metric changes by more than about 2x solely because the source dataset changes channel/lake minimum size, it cannot be used as a single hard threshold without explicit scale-normalization.
- If a metric has no credible path to repo observability from current or plausible artifacts, it should not be promoted to primary acceptance.
- If a benchmark cannot distinguish humid mountain, humid plain, arid interior, and lake-rich/glaciated regimes, it is too blunt for Earth-like acceptance.

### Evidence hierarchy

1. Primary scientific papers and dataset papers describing global hydrography or limnology products.
2. HydroSHEDS / HydroATLAS / HydroRIVERS / HydroBASINS / LakeATLAS documentation, because these are likely the cleanest Earth-scale calibration surfaces for this repo.
3. Governmental or institutional dataset summaries where they preserve the primary numbers faithfully.
4. Derived quantities in this note only when transparently computed from authoritative dataset totals.

### Stop conditions

- Stop once the benchmark family covers drainage density, flow permanence, basin outlets, endorheic prevalence, lake area fraction, and scale coupling with enough evidence to guide acceptance.
- Stop when remaining uncertainty mainly concerns threshold-tightening, not metric selection.
- Reframe if later repo evidence shows current artifacts cannot observe basin topology or flow permanence well enough.

## 3. Findings with sources

### 3.1 Drainage density is real, but threshold-sensitive; use it as a family, not a constant

- `HydroRIVERS` maps rivers beginning at upstream area `>=10 km^2` or discharge `>=0.1 m^3/s`, totaling `35.85 million km` of rivers globally across `135.0 million km^2` land in HydroBASINS terms. That implies a coarse mapped global mean drainage density equivalent of about `0.27 km/km^2` by simple ratio. This is a derived inference from authoritative dataset totals, not a published canonical Earth constant.
- `MERIT Hydro-Vector` explicitly models variable drainage density and totals about `75 million km` of rivers over `57,025` basins and `156,571` watersheds. Against the same roughly `135 million km^2` land basis, that implies a denser mapped global mean near `0.56 km/km^2`, again a derived inference.
- The gap between `~0.27` and `~0.56 km/km^2` is not noise; it demonstrates how much the answer moves with channelization threshold and source resolution.
- Classic geomorphology still matters: high drainage density is favored by weak or impermeable materials, sparse vegetation, and mountainous relief; low drainage density is favored by permeable materials, dense vegetation, and low relief. Moglen et al. further argue the climate response is non-monotonic: below about `25 cm` effective annual precipitation, drainage density tends to increase with more precipitation, while in more humid regimes it tends to decrease as vegetation suppresses dissection.

Assessment:

- Global Earth-like: yes, but only as a scale-normalized family.
- Climate/relief-specific: strongly yes.
- Hard threshold suitability: low as a single number; medium as a band tied to mapping threshold.
- Suggested acceptance band for this repo: use a coarse world-equivalent channel-density band around `0.25-0.6 km/km^2` for the resolved network class actually represented by the generator, then require systematic departures by biome/relief rather than a single world mean on every map.
- Evidence strength: medium-high for the qualitative relationship; medium for the quantitative band.

Sources:

- Lin et al. 2021, *Scientific Data*, MERIT Hydro-Vector: [Nature](https://www.nature.com/articles/s41597-021-00819-9)
- HydroRIVERS technical documentation / product page: [HydroSHEDS](https://www.hydrosheds.org/products/hydrorivers)
- HydroBASINS product page: [HydroSHEDS](https://www.hydrosheds.org/products/hydrobasins)
- Moglen, Eltahir, Bras 1998, *Water Resources Research*: [MIT PDF](https://web.mit.edu/eltahir/www/a_wrr98b_files/1998%20Moglen%20Eltahir%20Bras%20WRR%2034%284%29.pdf)

### 3.2 Non-perennial flow is globally normal, not an edge case

- Messager et al. estimate that flow ceases at least one day per year along `51-60%` of the world’s rivers by length.
- HydroSHEDS repeats the same result in its intermittent-rivers summary and explicitly frames non-perennial rivers as the rule rather than the exception.
- This is a major framing correction for game generators: a plausible Earth-like world should not render almost all low-order drainage as permanently blue-line perennial channels.

Assessment:

- Global Earth-like: yes.
- Climate/relief-specific: yes; intermittence becomes much more prevalent in arid and semi-arid interiors, but exists in all climates and biomes.
- Hard threshold suitability: medium at world scale, low at single-map scale unless map climate is known.
- Suggested acceptance band for this repo: for total routed channel length, expect non-perennial or weak-flow classes to be common enough that perennial visible trunks are a minority by length globally, while major visible trunks remain disproportionately perennial.
- Evidence strength: high.

Sources:

- Messager et al. 2021, *Nature*: [Nature](https://www.nature.com/articles/s41586-021-03565-5)
- HydroSHEDS intermittent rivers summary: [HydroSHEDS](https://www.hydrosheds.org/applications/intermittent-rivers)

### 3.3 Endorheic basins are globally important by land area, but not mandatory on every seed

- Endorheic basins account for about `20%` of global land area.
- That makes closed drainage a core Earth behavior, especially for continental interiors and arid belts, not a rare anomaly.
- But the map-level implication is ensemble-based, not seed-absolute: archipelago-heavy or narrow-coast worlds can legitimately have little closed drainage, while large interior continents should not.

Assessment:

- Global Earth-like: yes.
- Climate/relief-specific: strongly yes; most diagnostic in arid interiors and internally drained plateaus.
- Hard threshold suitability: medium for seed ensembles, low for single seeds.
- Suggested acceptance band for this repo: on worlds with substantial continental interiors, target roughly `10-25%` of land in closed or internally draining basins across an ensemble; allow `0-10%` on coast-dominated/archipelagic worlds; treat persistent near-zero endorheic share on big-interior worlds as suspect.
- Evidence strength: high for global importance, medium for generator band.

Sources:

- Sutanudjaja et al. 2024, *Scientific Data*: [Nature](https://www.nature.com/articles/s41597-023-02875-9)
- GRDC major river basins summary for exorheic/endorheic basin handling: [GRDC](https://mrb.grdc.bafg.de/)

### 3.4 Lake area fraction is strongly minimum-size dependent; benchmark the resolved lake scale

- Verpoorter et al. found about `117 million` lakes larger than `0.002 km^2`, covering `3.7%` of Earth’s non-glaciated land area.
- LakeATLAS / HydroLAKES, with a much larger minimum mapping unit (`>=10 ha`), describe lakes and reservoirs as covering about `2%` of Earth’s land surface.
- GLAKES, mapping lakes larger than `0.03 km^2`, reports `3.4 million` lakes with total maximum area `3.2 million km^2`, about `2.2%` of global land area.
- These three numbers are consistent with each other and show why “Earth lake share” must always specify the minimum resolved lake size.

Assessment:

- Global Earth-like: yes.
- Climate/relief-specific: yes; glaciated, boreal, rifted, and sink-rich terrains rise above the global mean, arid or strongly dissected terrains fall below it.
- Hard threshold suitability: medium-high once the generator’s minimum visible lake size is fixed.
- Suggested acceptance band for this repo: for visibly resolved map lakes, a default world band around `1-4%` of land in lakes is the safest Earth-like center; `1-6%` is a defensible broader acceptance band; `>8%` should be treated as special-setting only unless the map is intentionally lake-district/postglacial.
- Evidence strength: high for scale sensitivity; medium-high for the recommended Civ-facing band.

Sources:

- Verpoorter et al. 2014, *Geophysical Research Letters*: [AGU abstract](https://agupubs.onlinelibrary.wiley.com/doi/abs/10.1002/2014GL060641)
- Lehner et al. 2022, *Scientific Data* / LakeATLAS: [Nature](https://www.nature.com/articles/s41597-022-01425-z)
- Pi et al. 2022, *Nature Communications* / GLAKES: [Nature](https://www.nature.com/articles/s41467-022-33239-3)

### 3.5 Lake connectivity matters: large lake area is mostly flow-through or terminal, not decorative isolated pits

- A global lake-topology preprint using HydroLAKES + MERIT-derived connectivity reports that by count, lakes are mostly headwater/upstream-positioned, but by area, flow-through lakes dominate at about `67.1%` of global lake surface while endorheic/terminal lakes hold about `21%` of area because a few very large terminal lakes dominate area.
- The same work shows terminal/coastal lakes are rare by count (`~0.1%` each), and only about `2%` of lakes drain to multiple destinations.
- This is useful even with lower confidence: Earth’s largest lakes are usually hydrographically consequential objects, not randomly isolated features.

Assessment:

- Global Earth-like: yes, especially as a qualitative shape constraint.
- Climate/relief-specific: yes.
- Hard threshold suitability: low-medium because the source is still a preprint and connectivity definitions vary.
- Suggested acceptance band for this repo: require most large lakes by area to be either flow-through or terminal; allow many small lakes to be headwater or isolated; do not force terminal lakes by count, but do allow them to dominate local area where present.
- Evidence strength: low-medium.

Sources:

- Lin et al. 2023 preprint, *ESSD Discussions* / TopoCat: [Copernicus PDF](https://essd.copernicus.org/preprints/essd-2022-433/essd-2022-433.pdf)

### 3.6 Major-trunk mouths should be sparse and hierarchical relative to coastline

- GRDC’s 2020 major-basin product identifies `520` major river/lake basins and `983` named major rivers globally.
- Meybeck et al.’s COSCAT framework uses `151` exorheic coastal segments, with median coastal-segment length about `2400 km` and median contributing catchment area about `0.45 million km^2`.
- I do not read these as a direct “one mouth every X km” threshold for gameplay maps. I read them as evidence that Earth’s major-trunk outlets are sparse, hierarchical, and very unevenly distributed, with a few huge outlets and many smaller ones.

Assessment:

- Global Earth-like: yes, but only as a hierarchy/distribution check.
- Climate/relief-specific: secondary.
- Hard threshold suitability: low.
- Suggested acceptance band for this repo: use distribution tests, not a single count. The largest `10-20%` of exorheic basins should account for a majority of total modeled trunk discharge or trunk length, and adjacent major mouths should usually be separated by large coastal intervals rather than appearing in every small bay.
- Evidence strength: medium-low.

Sources:

- GRDC Major River Basins: [GRDC](https://mrb.grdc.bafg.de/)
- Meybeck, Durr, Vorosmarty 2006, *Global Biogeochemical Cycles*: [AGU](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2005GB002540)

### 3.7 Connected-lake spacing scales with river size, but this is secondary for global acceptance

- Gardner et al. report, for the contiguous United States, characteristic connected lake/reservoir spacing of about `1-5 km`, shifting to `27-61 km` in larger rivers.
- This is not a global Earth benchmark and should not be promoted to a primary acceptance gate. It is useful as directional evidence that lakes connected to river corridors have spacing structure rather than pure randomness.

Assessment:

- Global Earth-like: no, not directly.
- Climate/relief-specific: moderate.
- Hard threshold suitability: low.
- Best use here: secondary diagnostic if the repo later models floodplain/chain-lake corridors explicitly.
- Evidence strength: medium for connected-lake topology, low for global acceptance.

Sources:

- Gardner, Pavelsky, Doyle 2019, *Geophysical Research Letters*: [UNC repository abstract](https://cdr.lib.unc.edu/concern/articles/xp68ks231?locale=en)

## 4. Recommended benchmark family for this repo

I would promote the following benchmark family, split by scope.

### A. Globally Earth-like core gates

1. **Resolved channel-density band**
   - Measure a scale-normalized river-length-per-land proxy for whatever the repo considers a resolved channel.
   - Aim for a world-equivalent band roughly analogous to `0.25-0.6 km/km^2`.
   - Treat this as a warning band, not a single pass/fail number.

2. **Non-perennial prevalence**
   - The total routed network should contain a large intermittent/weak-flow share.
   - Do not require most mapped channel length to be perennial.

3. **Lake area fraction**
   - Default center: `1-4%` of land in visibly resolved lakes.
   - Broad acceptance: `1-6%`.
   - Warning above `8%` unless special setting.

4. **Closed-drainage presence**
   - Across an ensemble of large-interior Earth-like worlds, expect nontrivial endorheic share.
   - Persistent zero-closed-basin behavior on big interiors is a failure signal.

### B. Biome / relief modifiers

1. **Arid interior**
   - Lower perennial share.
   - Higher closed-basin likelihood.
   - Lower lake fraction overall, but with occasional large terminal lakes.

2. **Humid mountain belts**
   - Higher local channel density and trunk initiation.
   - More exorheic routing.
   - Lakes more often flow-through than terminal.

3. **Boreal / glaciated / postglacial**
   - Elevated lake fraction.
   - Many small/headwater lakes.
   - Channel density can be locally high or irregular depending on glacial legacy and permafrost.

4. **Humid low-relief forest/plain**
   - Avoid over-dissected “vein maps”.
   - Major rivers still present, but minor channel density should not be mountain-like everywhere.

### C. Map-scale-normalized hierarchy checks

1. **Major-trunk sparsity**
   - Major river mouths should be rare relative to coastline length.

2. **Discharge concentration**
   - A small minority of basins should carry a majority of total trunk discharge/importance.

3. **Large-lake connectivity**
   - Large lakes by area should mostly be flow-through or terminal, not isolated.

## 5. Risks / unresolveds

- The hardest uncertainty is not the Earth science; it is translation from Earth units into Civ tile resolution and authored visibility classes.
- Flow permanence is a strong Earth benchmark but may be under-observable if the repo currently only materializes a single `riverClass` without explicit seasonal/baseflow semantics.
- Major-trunk spacing and outlet density are real Earth features, but I do not yet have a clean global primary-source number that is tight enough for a hard acceptance threshold. Distributional tests are safer.
- Lake connectivity percentages come from a preprint-level topology product, so I would use them for direction and sanity, not strict pass/fail.
- Any benchmark tied to “all lakes” will overclaim if the generator only resolves medium-to-large lakes.

## 6. Concrete implications for river/lake generation and verification here

1. **Do not tune rivers with one global discharge cutoff alone.**
   - Couple channel initiation and major-river selection to climate, runoff, and relief.
   - The existing notion of major-river discharge percentiles looks directionally right; it should be audited against basin hierarchy, not just visual count.

2. **Persist basin topology artifacts as first-class verification surfaces.**
   - At minimum: basin ID, outlet type (`ocean` vs `closed`), sink mask, upstream area, and major-trunk mask.
   - Without this, endorheic prevalence and outlet hierarchy cannot be verified cleanly.

3. **Separate flow class from visual class.**
   - Earth-like acceptance wants many intermittent/weak channels by total network length, while gameplay visuals may only show a subset.
   - Verification should therefore track at least: total routed network, perennial/major visible subset, and terminal sinks.

4. **Add world-balance diagnostics for hydrology analogous to existing terrain shares.**
   - Suggested outputs:
     - resolved channel density proxy
     - major-trunk count and mouth count
     - exorheic vs endorheic land share
     - lake land-share
     - largest-lake share
     - flow-through vs terminal share for large lakes
     - basin-size concentration ratio for top decile basins

5. **Grade by ensemble and by regime, not just whole-map average.**
   - World average alone will hide failures such as “all channels concentrated in one belt” or “no closed basins despite giant dry interior”.
   - Minimum useful reporting split: whole-map, humid, arid, mountain/high-relief, and interior-vs-coastal land.

6. **Use bounded acceptance bands with explicit evidence strength labels.**
   - High-confidence gates:
     - non-perennial prevalence is common globally
     - lake share depends on minimum resolved lake size
     - endorheic drainage is globally significant
   - Medium-confidence gates:
     - coarse resolved channel-density band
     - `1-6%` visible-lake acceptance band
   - Lower-confidence warnings:
     - major-mouth spacing
     - exact lake connectivity percentages

Skills used: framing-design, investigation-design
