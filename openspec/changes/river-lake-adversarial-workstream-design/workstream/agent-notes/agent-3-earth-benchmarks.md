# Agent 3: Earth Hydrology Benchmark Prosecutor

Date: 2026-06-09  
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-mapgen-physical-rivers`  
Branch: `codex/river-lake-adversarial-synthesis`

## 1. Framed objective

### Frame

- **Cynefin domain:** complicated
- **Object:** objective
- **Lifecycle:** second-order revision
- **Mode:** audience-export
- **Durability:** standalone

### Active goal

Derive external-data-backed, Earth-like benchmark expectations for Swooper Maps rivers and lakes without backfitting to current generator output. The deliverable must distinguish:

1. what can be justified numerically from authoritative Earth data,
2. what is only defensible as a typed or climate-conditioned expectation,
3. what is scale-sensitive and therefore cannot be turned into a single global threshold for Civ-facing mapgen.

### Hard core

- Earth benchmarks come from external Earth evidence, not from current generator behavior.
- Full hydrology truth, projected Civ-visible rivers, and rendered in-game visibility are different proof classes.
- Any threshold that ignores channel-head definition, climate, or map scale is presumptively weak.

### Exterior

- Civ materialization mechanics
- ownership / package placement
- implementation topology
- local generator tuning from observed current outputs

### Falsifier

If the evidence shows that a requested benchmark category has no stable Earth-wide numeric threshold once scale and definition are held constant, the result must be a typed benchmark or a benchmark family, not a fake scalar target.

### Structural alternative rejected

Rejected frame: "pick one Earth number per metric and tune generator output to hit it."  
Reason: this collapses scale, climate, and definition differences and would reproduce the exact proof inflation failure mode already present in this workstream.

## 2. Investigation brief

### Brief

- **Investigation type:** external research + decision support for systematic workstream gate 6 (`expectations-before-stats`)
- **Frame stability:** committed
- **Evidence standard:** corroborated for benchmark families; verified where a numeric global figure is explicitly published by a peer-reviewed or official source
- **Search geometry:** widen on global syntheses, then narrow to benchmark-bearing metrics
- **Rail coupling:** rail-neutral manual investigation with authoritative web sources
- **Artifact use:** durable note for downstream OpenSpec/test design
- **Uncertainty posture:** falsification-first

### Primary questions

1. What Earth evidence exists for drainage density, channel-head / upstream-area floors, perennial versus non-perennial share, endorheic prevalence, and lake abundance / area?
2. Which of those support direct numeric targets, and which only support benchmark classes or climate-conditioned expectations?
3. What benchmark surfaces are appropriate for Swooper Maps given that Civ map scale is coarse and user-visible rivers are a projection of fuller hydrology truth?

### Exclusion questions

- Not: "what numbers match our current output?"
- Not: "what does Civ visibly stamp today?"
- Not: "what threshold is easiest to implement?"

### Evidence policy

- Prefer peer-reviewed global syntheses, official hydrology data products, and official product documentation.
- Prefer sources that name mapping thresholds or domain limits.
- When sources conflict, prefer the source with the clearer scope and the more explicit threshold definition.
- If a source is only informative for one scale surface, mark that explicitly instead of generalizing it.

### Stop / reframe conditions

- Stop using a metric as a scalar target if its value changes materially with channelization threshold or mapping unit.
- Reframe a numeric target into a typed benchmark if the strongest sources only justify directional or climate-conditioned claims.

## 3. Evidence notes with linked sources and dates

| Topic | Source | Date | Evidence note | Benchmark relevance |
| --- | --- | --- | --- | --- |
| Coarse global river inventory floor | [HydroRIVERS product page](https://www.hydrosheds.org/products/hydrorivers) | accessed 2026-06-09 | HydroRIVERS includes rivers with catchment area at least `10 km²` or average flow at least `0.1 m³/s`, totaling `35.9 million km` globally. | Good evidence for a **coarse mapped river floor**, not for full hydrology truth. |
| Variable drainage density is real; fixed thresholds are weak | [Lin et al., Scientific Data](https://www.nature.com/articles/s41597-021-00819-9) | 2021 | Global hydrography work states drainage density varies spatially and that fixed global channelization thresholds are empirically weak. The paper notes HydroRIVERS' `10 km² / 0.1 m³/s` floor is empirical, not a proof-backed Earth constant. | Supports benchmark families and attacks one-number tuning. |
| Climate strongly changes drainage density | [Carlston via USGS](https://www.usgs.gov/publications/effect-climate-drainage-density-and-streamflow) | 1966-09-30 | USGS-hosted publication reports lower drainage densities can occur in infiltrative marine climates, while increasing aridity magnifies drainage-density variability; impermeable badlands can be extremely dense. | Supports climate-conditioned ordering instead of a single scalar density target. |
| Headwaters dominate network length | [Hydrography90m, ESSD](https://essd.copernicus.org/articles/14/4525/2022/essd-14-4525-2022.html) | 2022-10-17 | Headwaters are estimated to contribute `>70%` of overall stream length. Hydrography90m uses a `0.05 km²` channel initiation floor and argues that larger thresholds such as `1 km²` omit vital headwater features. | Strong evidence that full hydrology truth must include much smaller channels than coarse river products. |
| Non-perennial rivers are already a majority at coarse global mapping | [Messager et al. abstract via PubMed](https://pubmed.ncbi.nlm.nih.gov/34135525/) | 2021-06-16 | Published estimate: water ceases to flow for at least one day per year along `51-60%` of the world's rivers by length. | Strong numeric benchmark for a coarse global network floor. |
| Headwater-complete networks are even more non-perennial | [Botter et al., Nature Water](https://www.nature.com/articles/s44221-025-00549-x) | 2026 | When small headwaters are accounted for, global non-perennial fraction rises above `0.7` and up to `0.78`; contributing area at channel heads is reported as `<<1 km²`, and reported drainage density lies in the broad range `1-100 km km^-2`. | Strong evidence that non-perennial share is scale-sensitive and that headwater-complete truth should be majority non-perennial by a wide margin. |
| Endorheic basins are a major Earth feature | [Wang et al., Nature Geoscience](https://www.nature.com/articles/s41561-018-0265-7) | 2018 | Abstract states endorheic basins spatially align with arid / semi-arid climates and are globally significant enough that their water-storage changes matter at planetary scale. Search and linked secondary materials tied to this paper consistently describe them as about one-fifth of land surface. | Supports "closed basins must exist materially" in Earth-like worlds; exact band needs uncertainty markers. |
| Lake-bearing endorheic basins still cover a large land share | [Lake-TopoCat, ESSD](https://essd.copernicus.org/articles/15/3483/2023/) | 2023 | Endorheic basins are `5.1%` of lake-network basin count, `18%` by area of lake-network basins, and cover about `15.4%` of global surface excluding Antarctica. Paper explicitly notes this is lower than the conventional "about a fifth" because arheic deserts with no lakes are excluded. | Strong benchmark for lake-bearing closed drainage, and a useful lower bound against "all water reaches ocean." |
| Global lake inventory at 10 ha floor | [HydroLAKES product page](https://www.hydrosheds.org/products/hydrolakes) | accessed 2026-06-09 | HydroLAKES contains `1.4 million` lakes / reservoirs at `>=10 ha`, totaling `2.67 million km²`. | Strong baseline for low-single-digit global lake area at moderate inventory floor. |
| Smaller lakes matter; large lakes dominate area | [GLAKES, Nature Communications](https://www.nature.com/articles/s41467-022-33239-3) | 2022 | Global lake area at `>0.03 km²` is `3.2 million km²` or `2.2%` of land area. Small lakes (`<1 km²`) are `94.39%` of count but only `15%` of area; large lakes (`>100 km²`) are `0.05%` of count but `59%` of area. `49.8%` of lake count is north of `60°N`. | Strong evidence for low-single-digit area fraction, count-area skew, and high-latitude clustering. |
| Lake spacing and river connectivity are structured, not random | [Gardner et al., GRL summary](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2018GL080841) | 2019 | Connected lakes decrease in abundance and increase in size as river size increases; characteristic spacing in smaller rivers is reported around `1-5 km`, shifting much wider on larger rivers. | Useful qualitative support that rivers and lakes should form structured alternation, but this is regional and not a global scalar acceptance target. |

## 4. Findings, benchmark recommendations, uncertainties, and attacks on weak thresholds

### A. What can be justified numerically

1. **Coarse mapped global non-perennial share**
   - Defensible benchmark: for a coarse global river network floor comparable to HydroRIVERS / GIRES assumptions, non-perennial share should be a **majority**, centered on roughly `0.51-0.60` of network length.
   - Evidence: Messager 2021.

2. **Headwater-complete non-perennial share**
   - Defensible benchmark: once small headwaters are included, non-perennial share should be **well above a bare majority**, with a plausible Earth-like global target family around `0.70-0.78`.
   - Evidence: Botter 2026.
   - Caution: this depends on actually representing low-order channels. It is invalid if the pipeline prunes the network aggressively before measurement.

3. **Headwater dominance of total network length**
   - Defensible benchmark: low-order / headwater channels should contribute **most** river length; a useful numeric anchor is `>70%`.
   - Evidence: Hydrography90m 2022.

4. **Global lake area fraction**
   - Defensible benchmark: natural-lake area on an Earth-like world is in the **low single digits of land area**, with a global reference bracket around `1.8%-2.2%` depending on inventory floor.
   - Evidence: HydroLAKES and GLAKES.
   - Caution: count is highly sensitive to minimum mapped lake size, but area fraction is much more portable.

5. **Closed-drainage land share**
   - Defensible benchmark family: Earth-like worlds should preserve a **material** endorheic land share, with published references clustering around roughly `15%-20%` depending on whether arheic no-lake deserts are included.
   - Evidence: Lake-TopoCat 2023 plus Wang 2018 conventional framing.
   - Caution: use as a band, not a knife-edge number.

### B. What should not become a single scalar target

1. **Drainage density**
   - Do **not** set one global drainage-density target for Swooper Maps.
   - Why:
     - drainage density varies strongly with climate, infiltration, relief, lithology, and channel-head definition;
     - the reported plausible range for full networks is broad (`1-100 km km^-2`);
     - coarse products like HydroRIVERS and fine products like Hydrography90m measure fundamentally different network domains.
   - Correct use: benchmark **ordering and band families** by climate / terrain class and by declared network floor.

2. **Channel initiation / upstream-area floor**
   - Do **not** assert one physically correct upstream-area floor without first declaring the represented surface.
   - Why:
     - full geomorphic truth can begin at very small contributing areas (`0.05 km²` in Hydrography90m; field evidence `<<1 km²`);
     - coarse global river products use much larger empirical floors (`10 km²` in HydroRIVERS).
   - Correct use: separate at least two surfaces:
     - **truth network floor**: small, headwater-sensitive, hydrology-owned;
     - **visible Civ projection floor**: coarser, product / render constrained.

### C. Benchmark families recommended for Swooper Maps

#### 1. Full hydrology truth benchmarks

These are the upstream physical expectations before Civ projection:

- **Non-perennial majority is mandatory** for representative Earth-like worlds.
- **Headwaters dominate network length**.
- **Closed basins are non-trivial**, especially in dry belts / rain shadows / interior plateaus.
- **Drainage density must vary by climate and substrate**, not remain flat across humid mountains, humid plains, marine lowlands, arid basins, and badland-like terrain.

#### 2. Projected visible-river benchmarks

These are downstream from full truth and should be treated as projection:

- Major visible rivers should be a **small minority of total channel length**.
- Removing headwaters for visibility must not erase the upstream truths they summarize.
- The visible network should preserve:
  - trunk continuity to ocean or terminal sink,
  - closed-basin terminals where present,
  - climate-conditioned sparseness or density,
  - visible lake-river coupling on major corridors.

#### 3. Lake benchmarks

- **Area fraction:** target low single digits globally, not near-zero and not tens of percent.
- **Count-area skew:** small lakes should dominate count; large lakes should dominate area.
- **Regional clustering:** high-latitude / glaciated terrain should be lake-rich relative to many low-latitude dry interiors.
- **Terminal lakes:** closed drainage should express through terminal-lake or terminal-wetland behavior where climate allows.

### D. Recommended benchmark bands for Earth-like acceptance

These are the benchmark bands I would currently defend for a representative Earth-like world, with the stated caveats:

| Metric | Recommended benchmark | Confidence | Notes |
| --- | --- | --- | --- |
| Full-truth non-perennial length fraction | `>= 0.5`, with healthy Earth-like targets often `0.7+` when headwaters are represented | medium | Hard fail below majority unless the world is intentionally hyper-humid or the truth network is heavily pruned. |
| Headwater / low-order share of total truth-network length | `> 0.7` | medium | Depends on internal order definition, but the "majority by a lot" claim is strong. |
| Endorheic land share in representative Earth-like worlds | center near `0.15-0.20`, tolerate broader band such as `0.10-0.25` pending climate-mix design | low-to-medium | Must be climate-conditioned; exact band should be finalized with a declared Earth-like climate corpus. |
| Natural-lake area share of land | center near `0.018-0.022`, tolerate coarse-map projection deviations while staying low-single-digit | medium | Area travels better than count. |
| Drainage density | no single scalar; require ordered climate / terrain cohorts and floor-declared benchmark families | high | Any one-number target here would be false precision. |

### E. Attacks on weak thresholds

1. **Attack: copying current generator output**
   - Rejected outright. That is calibration to self, not Earth.

2. **Attack: using HydroRIVERS `10 km²` as the hydrology truth floor**
   - Rejected. That is a coarse global product threshold for mapped rivers, not a full geomorphic channel domain.

3. **Attack: using Hydrography90m `0.05 km²` as the visible Civ floor**
   - Rejected. That is a headwater-sensitive hydrography floor, not a renderable game-materialization guarantee.

4. **Attack: one global drainage-density number**
   - Rejected. The literature explicitly says drainage density varies with climate / physiography and with channelization threshold.

5. **Attack: measuring only perennial / major rivers and calling it Earth-like**
   - Rejected. That erases the dominant temporary and headwater portions of real river networks.

## 5. Recommended workstream / test changes

### Benchmark architecture changes

1. **Declare benchmark surfaces explicitly**
   - `hydrologyTruth`
   - `projectedVisibleRivers`
   - `lakeMaterialization`
   - `renderedCivVisibility`

2. **Declare network floor explicitly in every benchmark artifact**
   - upstream-area / discharge / selection floor
   - whether headwaters are included
   - whether non-channelized inter-lake drainage paths are included or excluded

3. **Replace scalar "earthlike river density" with cohort-based benchmark families**
   - humid mountain
   - humid plain / low relief
   - marine / infiltrative low-density case
   - semi-arid closed basin interior
   - arid / badland high-variability case
   - glaciated or post-glacial lake-rich case

### Test-design implications

1. **Design tests against physical expectations before tuning**
   - This is a gate-6 requirement from `civ7-systematic-workstream`.

2. **Use layered proof classes**
   - local stats prove benchmark conformance at the selected surface;
   - Studio proves authored/debug visibility;
   - Civ runtime proves materialization / rendering;
   - none of those substitutes for the others.

3. **Add floor-sensitivity sweeps**
   - For any benchmark involving non-perennial fraction or drainage density, measure behavior across multiple internal network floors.
   - Closure fails if the claimed "Earth-like" result only appears at one arbitrary pruning threshold.

4. **Add climate-cohort assertions**
   - Example:
     - semi-arid interiors retain more closed drainage than humid maritime belts;
     - high-latitude / glaciated cohorts are more lake-rich than hot dry interiors;
     - visible trunk density is lower than truth-network density by design, but must preserve watershed structure.

5. **Prefer ratios and ordering over raw counts when map scale is coarse**
   - counts of tiny lakes and first-order channels are mapping-unit sensitive;
   - area fractions, closed-basin share, headwater share, and climate-ordering are more stable.

### Closure criteria I would require

An Earth-like hydrology slice should not close unless it shows:

1. a benchmark ledger that names the measurement surface and network floor for each metric;
2. a representative Earth-like climate corpus used before looking at observed output;
3. full-truth metrics showing majority non-perennial behavior and headwater-dominated length where headwaters are represented;
4. non-trivial closed-basin share that survives routing;
5. low-single-digit lake area fraction with sensible regional clustering;
6. separate downstream proof that visible rivers / lakes in Studio and Civ are projections of that truth rather than disconnected stamping artifacts.

## 6. Final synthesis

The strongest Earth-backed conclusion is not "pick one river number." It is:

- real Earth river networks are dominated by headwaters,
- those headwaters make non-perennial flow the norm rather than the exception,
- closed drainage is a material part of Earth hydrology,
- lakes occupy a low-single-digit share of land area with an extreme count-area skew,
- and any benchmark that ignores scale or channel-head definition is structurally unsound.

For Swooper Maps, the right move is therefore a **benchmark family**, not a single scalar target: use explicit measurement surfaces, explicit network floors, climate-conditioned cohorts, and separate proof classes for hydrology truth versus Civ-visible projection.

Skills used: framing-design, investigation-design, civ7-product-authority, civ7-systematic-workstream.
