# 2026-06-10 Agent 1 - Earth benchmarks third wave

Date: 2026-06-10
Worktree: `wt-agent-mapgen-physical-rivers`
Branch: `codex/map-rivers-bulk-writer-materialization`
Role: Earth benchmark prosecutor

## 1. Framed mission

### Frame identity

This is not a repo-tuning exercise and not a search for one magic Earth number.
It is a prosecution of false precision. The mission is to recover Earth-grounded
benchmark families that are strong enough to reject implausible river/lake
worlds, but honest about threshold sensitivity, map scale, and deliberate
stylization for game visibility.

### Mission frame

Treat the unit of analysis as world- to continent-scale hydrography that a
generator can plausibly observe:

- drainage density of the resolved network,
- basin hierarchy and outlet organization,
- stream-order and discharge hierarchy,
- large-trunk or visually legible river incidence,
- and lake share where it shapes river/lake acceptance.

Foreground:

- metrics with primary dataset support,
- definition-sensitive contradictions between datasets,
- and thresholds that can become acceptance tests without pretending the map is
  a GIS facsimile of Earth.

Exterior:

- exact Earth geography,
- local hydraulics,
- seasonal hydrographs by basin,
- and any attempt to calibrate from current repo output.

### Structural alternative considered

Alternative frame: derive one global target for river count, one for major river
count, and one for lake area, then tune the generator until it lands there.

Why rejected: Earth numbers move materially with channel initiation threshold,
minimum mapped lake size, headwater inclusion, and coastline/interior geometry.
A single global target would be pseudo-scientific and would misclassify both dry
interior worlds and lake-rich or glaciated ones.

### Hard core

1. Earth hydrography must be expressed as benchmark families, not single
   constants.
2. Dataset threshold and resolution choices are part of the benchmark, not
   noise to ignore.
3. Visible game-river incidence must be tied to Earth truth plus an explicit
   stylization allowance, not silently equated with raw Earth area or length.
4. Current repo behavior is evidence of observability only; it is not allowed to
   define the benchmark.

### Falsifier

This frame fails if a single Earth metric proves stable across authoritative
datasets despite changes in channel/lake minimum size and headwater inclusion,
or if the benchmark family cannot be mapped to observables that the workstream
can actually test.

## 2. Concise internal goal

Produce an Earth-grounded benchmark set for drainage density, basin
organization, stream hierarchy, trunk spacing/incidence, and visible river
incidence, with source-backed acceptance bands, explicit contradictions, and a
workstream that turns these into generation and acceptance-test requirements.

## 3. Investigation design

### Investigation type and posture

- Type: source-grounded research and dataset reconciliation
- Frame status: committed
- Evidence standard: corroborated to audit-grade for numeric anchors that become
  acceptance thresholds
- Search geometry: widen across global hydro datasets first, then narrow to
  benchmark-carrying variables, then test contradictions
- Rail coupling: rail-neutral manual investigation with authoritative web
  sources
- Artifact durability: durable workstream note
- Uncertainty posture: adjudication and falsification

### Primary questions

1. What are the strongest Earth-scale benchmark surfaces for resolved drainage
   density, stream hierarchy, basin organization, major-trunk spacing, and
   visibly large-river incidence?
2. Which numbers are globally stable enough for acceptance bands, and which are
   only definition-sensitive reference points?
3. What do official hydro datasets imply about how small a visible major-river
   subset should be relative to the full channel network?
4. How should those Earth metrics shape generation logic and test oracles for an
   Earth-like world generator?

### Exclusion questions

- Not calibrating against current MapGen outputs.
- Not setting thresholds for exact basin counts on a single seed.
- Not claiming one Earth-like answer independent of map resolution or climate
  regime.
- Not deriving river visibility from screenshots.

### Falsification questions

1. Do authoritative datasets disagree by enough to make a proposed hard
   threshold unsafe?
2. Does a metric depend so strongly on minimum feature size that it can only be
   used after scale normalization?
3. Would a proposed threshold force dry interiors, glaciated regions, and humid
   mountain belts toward the same answer?
4. Can the proposed benchmark be observed from plausible generator artifacts
   such as basin IDs, channel masks, discharge proxies, and visible river masks?

### Search geometry

1. Official dataset layer and product docs:
   - HydroRIVERS
   - HydroATLAS / RiverATLAS / LakeATLAS
   - HydroLAKES
   - GRDC Major River Basins
   - GRWL
2. Primary dataset papers:
   - MERIT Hydro-Vector
   - HydroATLAS
   - GLAKES
   - global non-perennial river prevalence
3. Supporting process papers where needed:
   - drainage density versus climate
   - coastal segmentation / outlet spacing
   - stream-order length/area structure

### Evidence policy

Authority order:

1. Primary peer-reviewed dataset papers
2. Official hydro dataset technical documentation and product pages
3. Official government or institutional data catalogs
4. Carefully labeled derived ratios using authoritative dataset totals

Allowed claim strengths:

- `high`: primary dataset or paper with direct numeric claim
- `medium`: dataset-derived ratio or cross-source convergence
- `low`: directional support only; use as a warning band, not a hard gate

What does not count as evidence:

- current repo output,
- unattributed Earth numbers,
- secondary commentary when the primary paper or official dataset page is
  available,
- a benchmark that does not specify the mapping threshold it depends on.

### Stop and reframe conditions

- Stop when the benchmark family covers drainage density, basin hierarchy,
  stream-order/discharge structure, visible-river incidence, and trunk
  sparsity with enough evidence to shape tests.
- Reframe if the same metric moves so widely across authoritative datasets that
  it cannot even support a definition-aware benchmark family.
- Downgrade confidence when only preprint or indirect evidence exists.

## 4. Findings

### 4.1 Resolved drainage density is real, but strongly threshold-sensitive

HydroRIVERS defines global rivers as channels with upstream area at least
`10 km²` or long-term average discharge at least `0.1 m³/s`, producing
`35.85 million km` of rivers globally at 15 arc-second resolution over
`135.0 million km²` of land in the HydroATLAS land basis. That implies a
resolved global mean drainage density of about `0.266 km/km²` for this mapped
network class.

MERIT Hydro-Vector explicitly argues that existing global datasets do not
represent drainage density reasonably when they use fixed thresholds. Its final
network totals about `75 million km` of rivers, with `57,025` basins and
`156,571` watersheds. Against the same roughly `135 million km²` land basis,
that implies about `0.556 km/km²`.

Interpretation:

- Earth does not give one drainage-density number.
- It gives at least a thresholded family from about `0.27` to `0.56 km/km²`
  for globally resolved channels at contemporary dataset scales.
- That ~2.1x spread is too large for a hard single threshold, but very useful
  as an Earth-scale resolved-network band.

Process support:

Moglen, Eltahir, and Bras emphasize that drainage density is not a simple
precipitation function. High drainage density is favored by impermeable or weak
subsurface materials, sparse vegetation, and mountainous relief; low drainage
density is favored by permeable/resistant materials, dense vegetation, and low
relief. Their work also shows climate response can reverse sign across regimes,
which is another reason not to use one global target.

Assessment:

- Global benchmark family: yes
- Hard single threshold: no
- Use in generator acceptance: yes, as a definition-aware world-band plus
  climate/relief ordering constraints

### 4.2 Basin organization on Earth is nested, outlet-typed, and not purely exorheic

HydroATLAS organizes `1.0 million` nested sub-basins across `12` Pfafstetter
scales over `135.0 million km²` of land, and RiverATLAS contains `8.5 million`
 reaches. MERIT Hydro-Vector uses `57,025` outlet basins and `156,571`
watersheds with a median watershed size of about `461 km²`, again reinforcing
that Earth hydrography is nested and hierarchical rather than flat.

HydroRIVERS and GRDC both preserve outlet semantics:

- HydroRIVERS encodes downstream connectivity, upstream area, endorheic status,
  Strahler order, and discharge.
- GRDC Major River Basins includes both exorheic and endorheic major basins and
  explicitly says major basins share a common outlet or inland sink.

Interpretation:

- A plausible Earth-like generator must produce nested basin organization, typed
  terminals, and a sparse set of major outlet systems rather than a uniform
  scatter of equivalent watersheds.

Assessment:

- Global benchmark: yes
- Recommended gate style: structural/oracle, not a single numeric threshold

### 4.3 Non-perennial flow is globally common; perennial visible trunks are the minority surface

Messager et al. estimate that flow ceases at least one day per year along
`51-60%` of the world’s rivers by length.

A newer headwater-focused Nature study goes further: when small headwaters are
comprehensively accounted for, the global fraction of non-perennial channels
rises above `0.7`, up to about `0.78`, and can exceed `0.5` even in relatively
humid regions.

Interpretation:

- `51-60%` is best treated as a conservative lower-bound benchmark for mapped
  global networks at the RiverATLAS/HydroRIVERS scale.
- True full-network non-perennial dominance is probably larger once headwaters
  are fully represented.
- Therefore perennial major trunks can be common and visually important, but
  they cannot plausibly dominate total channel length.

Assessment:

- Global benchmark: yes
- Recommended use: hard directional gate on hierarchy, not a single exact
  fraction per seed

### 4.4 Stream hierarchy: headwaters dominate length, mid-orders dominate area

Downing et al. estimate that globally, first-order streams dominate total stream
length, while moderately sized rivers (orders `5-9`) comprise the greatest
global fluvial area. They also estimate rivers and streams cover about
`0.30-0.56%` of land surface.

HydroRIVERS reinforces the hierarchy with explicit Strahler order and discharge
order classes. Its `ORD_FLOW` bins are logarithmic in long-term discharge, with
classes stepping by powers of ten from `>=100,000 m³/s` down to tiny channels.

Interpretation:

- Earth-like worlds should show a long tail of low-order/headwater network
  length.
- Most visible fluvial area belongs neither to the tiniest channels nor only to
  the very largest trunk rivers.
- Major/projectable channels should be a downstream high-discharge minority of
  the resolved network, not a broad swath of all channels above a mild cutoff.

Assessment:

- Global benchmark: yes
- Recommended gate style: hierarchy and concentration tests, not exact per-order
  counts

### 4.5 Visible large-river incidence is a small subset of total network extent

The Global River Widths from Landsat (GRWL) database is the first global
compilation of river planform geometry at constant-frequency discharge. The
underlying Science paper reports:

- `>2.1 million km` of rivers at least `30 m` wide at mean annual discharge
- total global river and stream surface area of `773,000 ± 79,000 km²`
- `0.58 ± 0.06%` of Earth’s nonglaciated land surface

This is the most useful Earth anchor for visibly large rivers:

- In area terms, clearly visible river water surfaces are a sub-1% fraction of
  land globally.
- In length terms, rivers `>=30 m` wide represent only about `2.8-5.9%` of the
  total global network length depending on whether the full resolved reference
  is HydroRIVERS (`35.9 M km`) or MERIT Hydro-Vector (`75 M km`).

Interpretation:

- On Earth, visually conspicuous trunk rivers are a tiny minority of land area
  and a small minority of total channel length.
- A game map may legitimately exaggerate visible river terrain beyond raw Earth
  width for legibility, but it needs an explicit stylization multiplier rather
  than silently inflating visible-river incidence by an order of magnitude.

Assessment:

- Global benchmark: high-value and directly relevant
- Recommended use: Earth truth anchor plus declared stylization allowance

### 4.6 Major-trunk outlet spacing is sparse, but exact thresholds are definition-sensitive

Three authoritative frames all point in the same direction:

- GRDC counts `520` major river/lake basins globally.
- COSCAT divides exorheic land-ocean linkage into `151` coastal segments.
- A global coastal-river dataset identifies `5,399` coastal rivers, but only
  `40%` form geomorphic deltas, and deltas average about one per `~300 km` of
  shoreline globally.

These are not interchangeable. They describe different outlet classes:
major basins, exorheic coastal segments, and all coastal rivers. But together
they say the same thing: trunk outlets and especially sediment-significant
outlets are sparse and uneven, not uniformly packed along coastlines.

Interpretation:

- Earth does not support a dense pattern of equally important major mouths.
- Major-trunk spacing should be tested distributionally: a small minority of
  coastal intervals should host the dominant outlets.

Assessment:

- Global benchmark: yes, but weak for a single number
- Recommended use: warning band / distributional test only

### 4.7 Lake area fraction remains in the low single digits at resolved scales

Three authoritative scales matter:

- HydroLAKES (`>=10 ha`): `2.67 million km²` of lakes, about `1.98%` of the
  `135 million km²` HydroATLAS land basis
- GLAKES (`>0.03 km²`): `3.2 million km²`, `2.2%` of global land area
- Verpoorter et al. (`>0.002 km²`): about `117 million` lakes covering `3.7%`
  of Earth’s nonglaciated land area

Interpretation:

- Earth-like lake fraction is firmly a low-single-digit land-share signal.
- The exact target depends strongly on minimum mapped lake size.
- For generator acceptance, visible lake area should not be near-zero by
  default, but it also should not drift into high single digits except in
  deliberate lake-district or glacial settings.

Assessment:

- Global benchmark: yes
- Recommended use: resolved-lake-size-aware acceptance band

## 5. Source-backed benchmark table

| Benchmark family | Earth data anchor | Recommended benchmark posture | Evidence strength | Notes |
| --- | --- | --- | --- | --- |
| Resolved drainage density | HydroRIVERS `35.85 M km / 135.0 M km² = 0.266 km/km²`; MERIT Hydro-Vector `~75 M km / 135.0 M km² = 0.556 km/km²` | World-band for resolved channels around `0.25-0.6 km/km²`; require climate/relief ordering, not one exact target | Medium-high | Hard threshold only after fixing the network definition |
| Basin hierarchy / organization | HydroATLAS `1.0 M` nested sub-basins; MERIT `57,025` basins and `156,571` watersheds; HydroRIVERS typed downstream/endorehic/order fields | Structural oracle: nested, acyclic, outlet-typed basins required | High | Better as topology tests than numeric count tests |
| Non-perennial prevalence | Messager `51-60%` by length; headwater-inclusive 2025 work `>0.7` globally | Treat `51-60%` as conservative mapped-network lower bound; require perennial visible trunks to be minority by length | Medium-high | Strong contradiction across headwater inclusion; use family not exact point |
| Stream hierarchy | Downing: first-order dominates length; orders `5-9` dominate area | Require long low-order tail plus concentration of visible area in mid/high orders | Medium | Good for hierarchy tests, not per-order exact counts |
| Visible river incidence by area | GRWL / Science: `773,000 ± 79,000 km²`, `0.58 ± 0.06%` of nonglaciated land | Earth truth anchor: visible large-river water area is sub-1% of land | High | Generator may apply explicit stylization multiplier |
| Visible river incidence by length | GRWL `>2.1 M km` of rivers `>=30 m` wide; compare to HydroRIVERS `35.9 M km` or MERIT `75 M km` | Earth truth anchor: clearly visible large rivers are only `~3-6%` of total network length | Medium-high | Useful for major/navigable subset tests |
| Major-trunk outlet sparsity | GRDC `520` major basins; COSCAT `151` exorheic coastal segments; deltas about `1 / 300 km` shoreline globally | Distributional test only: dominant outlets should be sparse and uneven | Medium-low | Definition-sensitive; do not force one hard mouth-spacing number |
| Lake area fraction | HydroLAKES `~2.0%`; GLAKES `2.2%`; Verpoorter `3.7%` for very small lakes included | Default Earth-like visible-lake band `~1.5-4%`; broad acceptance `1-6%`; warn above `8%` unless setting-specific | High for low-single-digit center | Must declare the minimum visible lake size |

## 6. Contradictions and what they mean

### Contradiction 1: drainage density nearly doubles across authoritative global datasets

- HydroRIVERS implies about `0.266 km/km²`
- MERIT Hydro-Vector implies about `0.556 km/km²`

Meaning:

- Dataset threshold and headwater inclusion are first-order effects.
- The benchmark must be tied to the generator’s resolved channel class.

### Contradiction 2: non-perennial fraction is `51-60%` in one global study and `>0.7` in headwater-inclusive work

Meaning:

- The older value is a conservative mapped-network benchmark, not the final word.
- Full-network truth likely contains even more intermittent headwaters.

### Contradiction 3: lake share ranges from ~`2%` to `3.7%`

Meaning:

- Minimum mapped lake size materially changes the answer.
- Generator tests must declare which visible lake size class they are comparing
  against.

### Contradiction 4: outlet counts vary wildly across "major basins", "coastal rivers", and "geomorphic deltas"

Meaning:

- There is no honest single global trunk-mouth count.
- Outlet sparsity should be enforced via ranked distribution, not a scalar count.

## 7. What would falsify these threshold choices

1. If a better authoritative global dataset shows resolved drainage density
   outside the `0.25-0.6 km/km²` family without a threshold/resolution change,
   the drainage-density band must be revised.
2. If a global visible-river dataset for channels of comparable size to GRWL
   shows large-river area is not sub-1% of land, the visible-river incidence
   anchor fails.
3. If headwater-inclusive global evidence overturns the claim that
   non-perennial channels dominate total network length, the permanence
   hierarchy must be revised.
4. If the generator cannot observe basin hierarchy, outlet typing, or visible
   river incidence in a testable way, these benchmarks must move from hard
   acceptance to aspirational diagnostics until observability exists.

## 8. Concrete workstream for generation + acceptance tests

### A. Generation-shaping implications

1. **Split network classes explicitly**
   - hidden/full routed network
   - minor/headwater channels
   - major/projectable channels
   - visible/navigable trunk subset

2. **Do not use one global threshold for river emergence**
   Drainage density must vary by climate, relief, and likely substrate proxy.

3. **Concentrate visible rivers into a sparse subset**
   Major or navigable rivers should be a small minority of total channel length
   and very small share of land area, even after visibility exaggeration.

4. **Preserve endorheic and interior structure**
   Large-interior Earth-like worlds need nontrivial internal drainage and not
   only coast-seeking basins.

5. **Use explicit stylization multipliers**
   If visible river terrain is inflated beyond raw Earth area for gameplay
   readability, record the multiplier and keep it bounded.

### B. Acceptance-test implications

1. **World-band tests**
   - resolved drainage density within a definition-aware band
   - visible river area share in a low range relative to land
   - lake area share in a low-single-digit range

2. **Hierarchy tests**
   - low-order channels dominate total network length
   - major/projectable channels are a downstream high-discharge minority
   - visible/navigable channels are a small subset of major/projectable channels

3. **Topology tests**
   - acyclic routing
   - typed basin terminals
   - nontrivial closed-drainage presence on large-interior worlds

4. **Distributional outlet tests**
   - dominant mouths sparse relative to coastline
   - top basin fraction carries majority of total modeled trunk significance

5. **Regime-specific tests**
   - humid mountain worlds: higher local drainage density, stronger exorheic
     signal
   - arid interiors: lower perennial share, more closed drainage, sparse visible
     trunks
   - glacial/boreal settings: elevated lake share, many small lakes

### C. Recommended workstream slices

1. `earth-hydrology-benchmark-contract`
   - Define benchmark families, evidence strength, and declared minimum feature
     sizes.

2. `hydrology-observability-surface`
   - Ensure the repo emits the observables needed to test drainage density,
     hierarchy, basin terminals, and visible-river incidence.

3. `visible-river-stylization-ledger`
   - Record any multiplier from raw Earth visible-river area/length to gameplay
     visible terrain incidence.

4. `seed-matrix-earth-benchmark-suite`
   - Add ensemble tests for humid, arid-interior, coast-dominated, and
     lake-rich/glacial reference world types.

## 9. Sources

Primary papers and official dataset pages used in this pass:

- MERIT Hydro-Vector, *Scientific Data* (2021):
  https://www.nature.com/articles/s41597-021-00819-9
- HydroRIVERS product page:
  https://www.hydrosheds.org/products/hydrorivers
- HydroRIVERS technical documentation:
  https://data.hydrosheds.org/file/technical-documentation/HydroRIVERS_TechDoc_v10.pdf
- HydroATLAS product page:
  https://www.hydrosheds.org/hydroatlas
- HydroATLAS paper, *Scientific Data* (2019):
  https://www.nature.com/articles/s41597-019-0300-6
- HydroLAKES product page:
  https://www.hydrosheds.org/products/hydrolakes
- GRDC Major River Basins:
  https://grdc.bafg.de/products/basin_layers/major_rivers/
- Messager et al., global non-perennial rivers, *Nature* (2021):
  https://pubmed.ncbi.nlm.nih.gov/34135525/
- Supporting Hydrolab summary and dataset note for the same work:
  https://wp.geog.mcgill.ca/hydrolab/non-perennial-rivers-and-streams/
  https://figshare.com/articles/dataset/Global_prevalence_of_non-perennial_rivers_and_streams/14633022
- Headwater-inclusive non-perennial update, *Nature Water* (2025):
  https://www.nature.com/articles/s44221-025-00549-x
- Allen and Pavelsky, global extent of rivers and streams, *Science* (2018):
  https://www.science.org/doi/10.1126/science.aat0636
- GRWL official USGS catalog:
  https://water.usgs.gov/catalog/datasets/120270a9-e0b6-42d8-9b1f-17db852fd2b4/
- Verpoorter et al., global lake inventory, *Geophysical Research Letters*:
  https://agupubs.onlinelibrary.wiley.com/doi/full/10.1002/2014GL060641
- GLAKES, *Nature Communications* (2022):
  https://www.nature.com/articles/s41467-022-33239-3
- MERIT-Plus endorheic basins, *Scientific Data*:
  https://pmc.ncbi.nlm.nih.gov/articles/PMC10781961/
- Caldwell et al., global delta dataset, *Earth Surface Dynamics*:
  https://esurf.copernicus.org/articles/7/773/2019/
- Moglen, Eltahir, Bras, drainage density and climate:
  https://web.mit.edu/eltahir/www/a_wrr98b_files/1998%20Moglen%20Eltahir%20Bras%20WRR%2034%284%29.pdf
- Downing et al., global abundance and size distribution of streams and rivers:
  https://experts.umn.edu/en/publications/global-abundance-and-size-distribution-of-streams-and-rivers/
  https://scholars.unh.edu/nh_epscor/231/
