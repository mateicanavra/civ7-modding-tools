# Whole-Map Water Coherence

Continuation of [Native Map Controls](WORKSTREAM.md), prompted by the complete
Huge/1018 gallery and the view centered at (87,31). This is a causal investigation,
not approval of a new landscape model or a new river-density default.

Term reference: [Water and Relief Glossary](../../system/libs/mapgen/reference/domains/water-and-relief-glossary.md),
with model owners, real-world sources and interpretation pitfalls.

## Frame And Decision

Determine which visible discontinuities arise from terrain formation, physical
basin routing, channel classification, or incomplete native realization. Preserve
the whole map as the comparison unit and inspect individual witnesses within it.
The outcome should identify the earliest correct owner of each needed change.

Keep physical elevation, wet water surface, directed drainage, gameplay river
class, native elevation, native cliff flags, and actual movement separate.
Neither a connected physical graph nor exact native source classes prove native
shoreline connectivity or navigability. No blanket shoreline joining, cliff
clearing, terrain flattening, or density reduction is an accepted repair.

This bounded observational slice changes no shipped configuration or generation
algorithm. Extracting climate orchestration or terrain noise is not a prerequisite:
the erosion, basin, and river-classification computations already have domain
operations. Split steps only for a real causal transition, not their line counts.

## Questions And Evidence

1. Do existing age/erosion controls change the objection, or merely smooth terrain?
2. Does small-scale input relief drive many short lake/river systems?
3. Does channel classification exaggerate that structure independently of drainage?
4. Does the native projection omit a connection that the physical model contains?
5. Are densities meaningful relative to exposed land and map size, rather than
   raw plot totals or an invented kilometres-per-tile conversion?

Source order: exact current operation/config code for modeled behavior; correlated
native observations for engine behavior; official shipped examples for supported
use cases; Earth-science sources for mechanisms, not game-tile quotas. A screenshot
locates a question; it does not determine flow direction or elevation semantics.
Historical native atlas data must not be reused as observations of new variants.

## Experiment Contract

Use existing Standard capture and metric families. A definition-owned comparison
command emits exact configurations, seeds, hashes, measurements and full-map
portable views. It must not become a second generator or silently mutate defaults.
Failures remain visible and cause a nonzero command result.

Start with Huge map/game seed 1018 and ten players. Independently vary world age,
erosion strength, era count, fluvial incision, diffusion, base relief texture,
river density, and the major-channel percentile. A combined maturity experiment
is explicitly an interaction test, not evidence for any one control. Repeat the
discriminating cases at Standard and on other seeds before choosing production
behavior. Equal seeds at different dimensions do not imply identical geography.

Predeclared expectations:

| Intervention | Expected discriminator | Hold / limitation |
| --- | --- | --- |
| Density or major percentile | Visible classes change | Ground, lake geometry and physical receivers identical |
| Fluvial rate zero | Tests whether incision survives quantization | A null response is evidence, not a failed experiment |
| Diffusion zero | Separates smoothing from channel incision | Do not call smoother terrain mature drainage |
| Age / eras / erosion | Relief and depression structure may change | Preserve actual conservation and integrity observations |
| Relief texture | Basin fragmentation may respond | Coast selection can change; report rather than conceal it |
| Wet native outlet A/B | Shore realization may change | Same map, dry writes, heights and finalization; no graph repair |

Report lake count/size, dry and navigable density, dry equal-height receivers,
channel drops in model units, lake-outlet class transitions, and authored wet-edge
coverage. Adjacent lower water is a candidate for inspection, not a correctness
rule. Non-mountain exposed area is a denominator, not certified settleable area.

## Native Discriminator

Use the existing full Huge/1018 generation and tour, not disconnected synthetic
maps. Start with bodies 56, 59 and 63. For each inlet, wet outlet and dry outlet,
observe directed cliff flags, terrain/category, native numeric height, membership,
cached ocean connection, and matched views. Shipped Earth writes river directions
on lake tiles; our current wet-source exclusion is a policy, not an API limitation.

The first A/B should add only each selected wet outlet's existing physical edge,
with its downstream channel class. If ambiguous, investigate the physical wet
path separately. Cliff-generation order is a different experiment. Do not repeat
finalization on an already finalized live map to simulate fresh generation.

Naval gameplay remains contingent on a valid normally produced stock-map unit
control. Debug-created Galley failures also occurred on official maps and cannot
decide whether our cliff or river projection is correct.

## Stop And Reframe

Stop tuning when a single-variable test cannot affect the faulty relationship.
A need for climate-informed, evolving drainage/incision is a model-design change,
not another intensity knob. Bring that causal design back with alternatives and
collateral effects before implementing it. Preserve natural divides and genuine
waterfalls; do not invent groundwater or erosion history absent from this model.

The deliverable is a reusable comparison plus an evidence-ranked recommendation,
not a claim that this first batch proves Earth-scale density or gameplay passage.

## First Comparison

The command lives with the portable definition, not the native app:

```sh
cd plugins/mod/map/swooper-physics
bun scripts/compare-coherence.ts --output /absolute/path/to/comparison
# Independent size/seed repetitions, each with its own baseline:
bun scripts/compare-coherence.ts --output /absolute/path/to/huge-42 --seed 42 \
  --variants baseline,three-eras,fluvial-zero,diffusion-zero,major-percentile,combined
bun scripts/compare-coherence.ts --output /absolute/path/to/standard-1018 --size standard \
  --variants baseline,three-eras,fluvial-zero,diffusion-zero,major-percentile,combined
```

The [private comparison](https://mateis-macbook-pro.taild8da1c.ts.net/civ/coherence-huge-1018/index.html)
contains ten complete Huge/1018 variants, exact admitted configs, existing
integrity evaluations, physical-field hashes and per-variant logs. Six-case
repetitions are beside it at `coherence-huge-42/` and
`coherence-standard-1018/`. See [viewer operations](../../process/LOCAL-VIEWERS.md).
These are portable captures, not native observations of the alternative maps.

| Huge/1018 intervention | Lake bodies | Wet cells | Major sources | Changed ground cells |
| --- | ---: | ---: | ---: | ---: |
| Shipped baseline | 55 | 203 | 294 | 0 |
| Three erosion eras | 46 | 160 | 343 | 1,523 |
| Fluvial rate zero | 55 | 203 | 294 | 5 |
| Diffusion rate zero | 61 | 218 | 295 | 664 |
| Major percentile .88 to .96 | 55 | 203 | 129 | 0 |
| Mature + normal erosion + three eras | 34 | 116 | 328 | 1,971 |

Interpretation, not a new calibration:

- **Configuration contributes, but a maturity knob is not a process repair.**
  Shipped Earthlike selects young age, low erosion and one era. At these settings,
  normalized fluvial incision mostly disappears under integer rounding; turning
  it off changes five ground cells here, none on Standard/1018, and some routing
  and classification on Huge/42. Diffusion has substantially more influence.
- **More smoothing does not mean less navigable water.** The combined case reduces
  lake counts in all three cohorts (55 to 34, 58 to 29, 26 to 18), but increases
  major sources (294 to 328, 271 to 310, 197 to 229). Erosion currently precedes
  final climate and basin routing and does not evolve that final network.
- **Major classification is independently strong.** Raising only its percentile
  reduces major sources to 129, 119 and 101 respectively. On Huge/1018, ground,
  drainage, lake geometry, discharge, water surfaces and landform masks are
  identical; 165 of the same 656 visible sources become minor. This is not a
  connectivity repair. The separate sparse-rivers knob also changes subsequent
  mountain/hill/volcano selection, despite unchanged drainage geometry.
- **Density needs a declared scale.** Baseline has 656 classified dry sources on
  2,517 exposed land cells (26.06%), including 294 major sources (11.68%). Twenty
  of 55 bodies occupy one tile. These are game-grid measurements, not real-world
  river length per square kilometre; there is no calibrated tile length or
  discharge time unit that licenses that comparison.

USGS distinguishes [computed drainage paths from mapped streams](https://www.usgs.gov/streamstats/what-are-blue-pixelated-lines-are-they-real-streams-why-are-there-so-manyfew-them)
and describes [scale-specific hydrographic representations](https://water.usgs.gov/themes/hydrofabric/).
That distinction is important here: every routed cell need not become a visible
river, and every visible river need not become a navigable game corridor.

## The (87,31) Witness

The apparent navigable head is not necessarily a physical headwater. The model
contains this directed chain (values are hydraulic surfaces in model units):

```text
dry NAV 72 -> lake 59 surface 64 -> dry NAV 64, 64, 60
          -> lake 56 surface 57 -> dry NAV 57, 53, 27
          -> lake 63 surface 22 -> dry NAV 22 -> sea surface 11
```

At the photographed focus, `(87,31)` is a minor source draining to `(87,32)`;
that source enters wet `(86,32)` in body 56. The body's physical outlet is
`(86,32) -> (85,33)`, then the navigable reach continues away. The flow is
nonascending using lake surface rather than submerged ground.

Our projection writes classified **dry** sources only. It omits the wet outlet
edge even though the physical graph includes it. Of 50 bodies whose wet outlet
receiver is classified, all 50 lack that wet-source write in this baseline.
That count identifies an authoring policy, not 50 proven native defects. The
shipped Earth Huge script itself writes river information on lake tiles, so
the API does not justify a blanket prohibition.

A fresh read of the live Huge/1018 map found no native cliff-crossing flags in
any of six directions at `(87,31)`, `(87,32)`, `(86,32)`, `(85,33)`, `(87,28)`,
`(86,29)`, `(82,36)` or `(81,36)`. Lowering cliffs therefore has no evidential
basis for this witness. Native numeric lake elevations differ from neighboring
dry elevations, but lake leveling and the native land-floor transform mean those
numbers are **not** a qualified water-surface or uphill-flow measurement.

The first native discriminator regenerated this full map twice with identical
heights, dry writes and finalization. B alone added the known wet outlet edges
of bodies 56 and 59, both northwest to their existing dry navigable receivers.
The observations cover native membership, cached connectivity and matched
views. Results below qualify only this two-edge intervention, not blanket
wet-path or terrain changes.

### Large-Lake Photo Comparison

The user's follow-up photo matches `wide-03-eastern-cool-network.png`, centered
at `(82,8)`. Its central body 42 has five wet cells, all observed as native lakes.
This makes a single-tile-only explanation insufficient. The photographed broad
channels are one inlet and one outlet, not two inflows:

| Position in photo | Physical edge | Authored class | Physical height | Wet-source write |
| --- | --- | --- | --- | --- |
| Broad upper-left | `(85,10) -> (86,10)` | NAV inlet | 38 to lake 37 | Not needed; dry source written |
| Broad lower-left | `(85,9) -> (84,9)` | Lake exit to NAV | lake 37 to 37 | Omitted |
| Narrow upper-right | `(88,10) -> (87,10)` | MINOR inlet | 38 to lake 37 | Not needed; dry source written |
| Narrow lower-right | `(87,9) -> (87,10)` | MINOR inlet | 37 to lake 37 | Not needed; dry source written |

Fresh normal-map readback at `2026-09-28T15:24:05Z` agrees with the retained
classes/heights. All five wet cells have native numeric height 260; dry inlet
sources are 398 and 388, and the dry navigable outlet is 388. All six directional
cliff flags were false at each queried wet and adjoining channel cell. The
upper-right minor source is native hill terrain; the lower-right is flat.
Neither these numeric heights nor the picture qualifies native flow direction.
Receipts are `coherence-large-lake-witness.json` and `coherence-live-summary.json`
beside the gallery.

Bodies 56 and 59 in the first A/B are both single-tile lakes, with physical
outflows approximately 4,108 and 2,722 model units. Body 42 has outflow about
2,967 despite its larger footprint. Lake area and navigable class are selected
by different computations; no evidence yet supports a minimum two- or three-tile
lake rule. Keep the two-edge A/B unchanged and use this five-tile body as an
observational comparison rather than changing geometry to fit a hypothesis.

### Full-Map Wet-Outlet A/B

Both cold-start runs completed in Civ7 1.5.0, Huge 106x66, map/game seed 1018,
ten players, using `ToT_NoModsExceptMaps`. The test-only app fixture adds zero
native writes in A (`full-map-observe`) and exactly two in B
(`full-map-wet-outlets`). Canonical generation, source configuration, all 656
dry writes, one 6,996-cell elevation input and the single finalization tuple
`false,25,2,2` are identical. Their hashes also match the prior normal-map
capture. Production lake-footprint assertions remain enabled.

| Observation | Result |
| --- | --- |
| All intended and observed native elevation cells | Identical, after elevation write and at completion |
| All 656 classified dry sources | Same class in both runs |
| Wet outlet cells | Remain lake/coast with class -1, even immediately after the extra setter calls |
| Qualified native network records | Same 184 IDs, plot counts, membership digests and focus memberships |
| Sampled directed cliff flags | All six false, unchanged |
| Cached ocean connection at `(86,29)` | A false; B true after both cache passes |
| Completed-game ocean read at `(86,29)` | B returns false again; generation-time readback change does not persist |
| Other sampled connectivity, including body 42 | Unchanged |
| Fresh public 320-plot neighborhood | No terrain, height, class, feature, climate or area-field differences |

The added writes therefore are **not wholly ignored during generation**: at
least one native connectivity readback changes temporarily. A fresh App UI
read at `2026-09-28T15:49:42Z` returns false again at `(86,29)`, so this is not
a demonstrated lasting connection repair. A wet setter does not turn the lake into a
river terrain, and matching river memberships do not describe all native
connectivity. The post-cache change is not proof of a rendered shoreline repair,
a native directed edge, or Galley passage. In particular, this experiment does
not intervene on the five-tile lake in the user's photo.

The matched native views show different channel shapes, with broader reaches
in A and narrower reaches in B around the tested junction. Neither improvement
nor causation is established: uncontrolled native mesh variation remains a
possible explanation. The report retains only camera-verified, fully explored
frames, excluding premature fog-only captures.

Do not ship a two/three-tile lake minimum or lower surrounding terrain on this
evidence. The next native question is shoreline rendering and water-surface
semantics, with an actual larger-lake outlet intervention if needed; keep that
separate from the physical erosion/routing design. The wet-source policy needs
reconsideration, but not as an assumed complete visual fix.

The [native comparison report](https://mateis-macbook-pro.taild8da1c.ts.net/civ/native-wet-outlet-ab/index.html)
and its raw receipts live beside the existing gallery. A/B proof IDs are
`wet-outlet-a-1018` and `wet-outlet-b-1018`. Built and installed bundle SHA-256
values were checked equal for each run; transport decoding recovered every
probe/completion part. The application check/test graph passed 142 tests and
18,545 assertions, and both native live-verification targets passed. No
production configuration or algorithm is changed by this fixture.

After the experiment, a cold-start normal Huge Earthlike map was restored with
the same seeds, players and saved configuration. Its live verifier completed
at `2026-09-28T15:57:25Z`; `restore-live-verification.log` beside the report
preserves the receipt. The normal script does not import the test fixture.
