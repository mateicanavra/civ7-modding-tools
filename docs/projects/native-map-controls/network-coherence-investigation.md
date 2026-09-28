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

Next discriminator: regenerate this full map twice with identical heights,
dry writes and finalization. In B only, add the known wet outlet edges of bodies
56 and 59, both northwest to their existing dry navigable receivers. Observe
native membership, cached connectivity and matched views; preserve the normal
map and restore it after the test. This remains pending native qualification,
not an approved blanket wet-path or terrain change.
