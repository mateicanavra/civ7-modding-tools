# Basin-Aware Terrain Evolution

**Goal:** make the climate-fed certified drainage network shape the terrain
that is ultimately projected. **Status:** independently reviewed design;
implementation remains outstanding. Part of [coherence completion](coherence-completion.md).

## Decision

Prefer fixed-climate, certified-drainage, detachment-limited channel incision
after initial hillslope shaping. Recompute certified basins as terrain changes;
publish final terrain and the network recomputed on it together.

This replaces the disconnected preliminary-area fluvial path for Earthlike.
It is not an extra smoothing pass or a second basin solver. Keep existing
hillslope diffusion initially. Explicit sediment transport, lake infilling and
spillway hydraulics are not simulated in this first coupled model. Do not
reinterpret the old deposition rate as a lake trapping law.

Alternatives rejected as the main repair:

- Refreshing preliminary receivers between eras cannot change one-era
  Earthlike. It also cannot represent certified through-lake flow.
- Raising age/erosion or reducing river density can conceal symptoms without
  coupling actual runoff and channel incision.
- Recomputing full atmosphere/ocean climate each cycle confounds the first
  causal integration and is not yet justified by evidence.

## Composition

1. Initial crust/coast shaping and hillslope diffusion, then islands and shelf.
   Give Earthlike an explicit hillslope-only operation strategy; other map
   identities retain their existing selected behavior until separately migrated.
2. Compute existing baseline climate and local runoff once. Hold rainfall,
   humidity, potential demand and finite-cell runoff forcing fixed during
   the channel-evolution loop. Do not freeze the derived body budgets.
3. Solve existing drainage basins and the certified open network on a precise
   working surface. Preserve mixed-body budgets, strict wetness, sill
   connectors, unsupported-state refusal and conservation checks.
4. Incise exposed original-land channels using certified dry discharge and
   receiving hydraulic level. Rebuild geometry/network before each subsequent
   cycle. No body ID or receiver survives a rebuild by assumption.
5. Quantize terrain once and enforce original marine/land identity, then solve
   the complete certified network again on those exact published integers.
   Only this solve supplies lake intent and minor/NAV classification.
6. Landforms, climate refinement, Ecology and placement consume the sealed
   terrain. Native projection consumes its sealed network.

## Incision And Units

Use stream-power incision with existing erodibility and exponents, driven by
certified discharge rather than gameplay river class. A downstream-first
implicit update bounds each source by its receiving hydraulic level and can
propagate lowering through an admitted flat connector. For a lake receiver,
use water surface; for original ocean, sea level rather than bathymetric floor.
Wet floors and original marine cells are not incised.

The recommended working convention is normalized relief
`h = ground / DEFAULT_ELEVATION_SCALE`, adjacent-hex distance one, and a
dimensionless evolution cycle. This is a declared model convention, not metres
or geological years. Compare it independently against the old per-map maximum
drop normalization before accepting coefficients. Existing rates are starting
values, not validated physical constants.

The current operation already retains floating scratch elevation across eras
and rounds once. The issue is not lost fractions between eras: globally
normalized flow/drop and small absolute-height incision leave little signal
after final publication. Source:
`src/domain/morphology/modules/erosion/ops/compute-geomorphic-cycle/rules/index.ts`.
Scientific formulation reference:
[Landlab Fastscape](https://landlab.csdms.io/generated/api/landlab.components.stream_power.fastscape_stream_power.html).

## Lakes And Sediment

Reuse certified water budgets. Internal wet-cell tree edges are not sediment
channels, and zero wet-cell dry discharge does not mean zero body throughflow.
Record detached material as a surface-removal diagnostic. Do not claim it was
deposited in a lake or exported to the sea without a transport/storage model.
Preserve substrate data without fabricating sediment-depth changes.

Recompute spills from changed ground; never lower them according to lake size.
Dry outlet connectors may incise; wet floors do not. Changed footprints and
outlets follow the next certified solve. Refuse newly unsupported networks
rather than silently filling, breaching or falling back to the old solver.

Explicit lake retention/export is a separate future model only if the accepted
outcome requires it, not a proxy invented to satisfy this integration. Its
absence must remain visible in model descriptions and diagnostics.

## Ownership And Precision

All source paths below are beneath `plugins/mod/map/swooper-physics/`.

| Owner | Change and consumer obligation |
| --- | --- |
| Morphology `compute-geomorphic-cycle` | Explicit initial hillslope-only strategy; no preliminary fluvial/sediment loop for that selected path |
| Morphology proposed `compute-channel-incision` | Pure dry-channel update over supplied certified hydraulic evidence; never constructs a second routing graph |
| Hydrology basin/network operations and height atoms | Admit finite precise working heights; indices stay integers; preserve certification |
| Recipe hydrography composition | Compose solve, incision, solve; numerical routines remain domain operations |
| Recipe artifact lifecycle | Distinguish initial topography from final sealed topography; do not mutate an already published final artifact |
| Mountains and downstream consumers | Migrate reads to sealed terrain and explicitly selected hydraulic inputs; do not rename discharge as contributing area |

### Artifact Transition

Keep the current stage order. Add exactly one artifact,
`initialTopography` (`artifact:morphology.topography.initial`), with the current
integer topography shape. Islands publishes this instead of final topography.
Retarget shelf, baseline climate and the existing hydrography `network` step
to it. Landmasses and coastline continue to consume final resolved exposure;
initial identity cannot substitute for land that the certified water solve
actually exposes. Shelf remains valid because bathymetry is held through
evolution.

The existing network step becomes the sole publisher of final
`artifact:morphology.topography`, together with the final hydrography, lake plan
and river network. Include final topography in its existing complete-group
validation before publication; this is not a rollback transaction. The same
certified solver publishes static terrain for a configuration with zero channel
evolution cycles; no retired water solver or fallback branch is restored.
Mountains, volcanoes, refined climate, Ecology, placement and native
projection keep their existing final-topography dependencies. Precise working
surfaces stay local to operation composition, not public iteration artifacts.

Keeping any early consumer on final terrain would create a cycle through
baseline climate and network. Likewise, refined climate, mountain masks and
gameplay river classes must not become incision inputs.

### Landform Hydraulic Input

For certified mountains composition, supply existing final
`riverNetwork.upstreamArea` to the rough-land operation instead of preliminary
`routing.flowAccum`. It already counts contributing original-land tiles over
the certified body-contracted graph, including all finite contributors and
each wet body once. Wet members repeat their body's aggregate and must not be
summed. Convert representation to
the operation's Float32 input with exact-range checking; do not add another
accumulation field or operation. No retired network input selection is retained.

Keep the rough-land logarithmic area normalization. Incision uses discharge,
but replacing this landform input with discharge would silently introduce a
different physical meaning and rainfall scale. Ridges and foothills currently
take no accumulation input; do not invent one. Final area must come from the
post-quantization network solve. The pre-island coastline distance used by
mountains is a separate consumer concern, not necessary to close this cycle.

The current certified solver already retains ordinary-array water surfaces
without integer narrowing. Widen the actual ground contracts and geometry
height atoms to finite precise values; casts or integer reconstruction between
cycles would truncate. Final public ground remains integer. Water surfaces
retain their existing precise representation, including subtile equilibrium.

Keep original marine elevation, bathymetry, sea level and land mask unchanged.
Record incision, diffusion, rounding and boundary clamps separately. This is
a surface-change ledger plus certified water conservation, not closed sediment
mass conservation.

## Implementation And Acceptance

Implement in meaningful Graphite slices: precise working geometry with identity
proof; pure incision with mechanism fixtures; recipe/artifact integration and
consumer migration; cohort/native qualification and removal of displaced code.
No public strategy is retained solely for a diagnostic comparison.

- Fixtures: descending dry channel, flat sill into lower reach, lake inlet,
  lake outlet, deep original ocean, connected bodies, changed final-rounding
  topology. Verify no wet-floor incision, no source carved below its receiver,
  immutable inputs, determinism and conservation after every solve.
- Compare routing/forcing changes separately from slope normalization. Measure
  per-process incision and the portion surviving final quantization; do not
  substitute net elevation change or lake counts.
- Run the existing full study bank and held size/seed cohorts. Keep thresholds
  unchanged. Require traceable channel-forced relief changes and coherent final
  outlet geometry, not just fewer lakes or navigable cells.
- Independently review ownership, precision, unsupported regimes and removed
  consumers before accepting production defaults.
- Qualify fresh native Huge Earthlike with the independently tested shoreline
  projection; update the full-map viewer. Navigation has its own valid control.

This design does not yet claim calibrated physical ages, discharge units,
sediment capacity or lake retention. Those limits do not prevent a coherent
first terrain/network coupling, but cannot be hidden by the term Earthlike.

## Certified Composition Qualification

The initial/final artifact transition and numerical composition are implemented.
The network step holds baseline rainfall, humidity, demand and attributed runoff
while solving fresh geometry and drainage for every precise incision cycle.
It seals ground once, solves again on those exact published integers, and admits
all four final artifacts before publishing any of them. Initially submerged
cells remain ineligible for incision even when the water solve later exposes
them; immutable initial ground, not current height, owns that admission.
Mountains consume final certified contributing area, not preliminary discharge.

Focused fixtures include two-cycle topology, changed rounding topology, held
forcing, initially submerged original-land cells, unsupported intermediate/final
solves and complete-group publication refusal. Source, tools, test types and
both owning Habitat checks pass. The full definition suite passes 1,171 tests
with the one preexisting, unchanged thermal science aggregate failure.
Evidence: `earth-calibration/c3-certified-terrain-integration-*-r3-20261001.log`
and `c3-integration-test-types-r3-20261001.log` in the durable Civ atlas.

The separately frozen `c3-certified-evolution-cohort-20261001/` completes 17
captures, 17 paired artifact executions and 17 independent operation replays.
All 26 certified balances satisfy their own roundoff bounds; the maximum
per-cell process-accounting error is `7.106e-15` model-height units. B/C/D have
exact baseline forcing, and Huge1018 C repeats exactly. Publication rounding
and clamping are separate from incision and are not sediment flux.

Independent review is aligned. One cycle at rate `.02`, m `.5`, n `1` is the
conservative full-bank candidate, not an Earth-calibrated physical erosion
rate. Relative to hillslope-only, it reduces wet cells by 14.1-22.5% in the
four admitted cases; that response is not accepted because fewer lakes look
better. The stronger `.1365` arm is mechanically valid but removes roughly
six times more raw ground. Neither inherits equivalence from the old law.
The 32 whole-map PNGs and eight responsive screenshots are portable evidence,
not native navigation or complete-bank qualification. The cohort seal is
`dd01c83a222fd54019875bebd26b8ea7929243e6442f2955e9cebf4990d29bc5`.

Production controls still select zero cycles. The next qualified domino is the
unchanged 57-scenario, 22-study bank across all three retained products, followed
by universal adoption and reviewed deletion of the displaced combined law and
unused preliminary Standard routing participation. Keep each stress product's
initial diffusion, eras, age and erosion posture; do not translate them into
channel time or new incision coefficients. No legacy fallback is an accepted
destination.
