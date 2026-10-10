# Cold-Forest Consumer Coherence

## Frame And Ownership

Repair the existing Ecology taiga response under the native-map-controls
workstream. This is a consumer-coherence fix, not Earth thermal calibration.
The player-facing aim is cold forest opportunity on suitable boreal land,
without allowing trees at the admitted zero-energy endpoint. The only
behavioral owner is `vegetation-score-taiga`; the existing recipe, producers,
other scorers and placement policies remain intact.

## Established Defect

The released Earthlike configuration classifies sufficiently moist land as
boreal at annual temperatures above -1 and at most 4 Celsius. Cryosphere
produces freeze = clamp((2 - T) / 14), copied to vegetation cold stress. The
existing taiga response requires cold stress above 0.23, equivalent to annual
temperature below -1.22 Celsius. Those supports cannot intersect. This
contradiction predates the local plant-water release.

Retained complete Huge seed2 and Standard seed1 outputs confirm zero taiga
suitability on all 31 and 41 modeled boreal cells. Respectively 15 and 30 cells
are flat, exposed, prior-unoccupied receivers with positive other score factors.
The first refusal is suitability, not recorded Civ rejection. These are
headless complete-run publications, not live native readbacks.

The symmetric soft energy band also extends below normalized zero. With the
existing biomass baseline it leaks positive suitability at energy0/coldStress1;
the zero placement floor admits that positive score. More moisture or a global
vegetation quota cannot correct either support inconsistency.

## Selected Response

Use one bounded annual cold-forest energy envelope. Retain the existing energy
band center/width, atmospheric moisture band, biomass baseline and plant-water
stress attenuation. Remove frost severity as a separate minimum adaptation
requirement. Bound the soft transition edges to the admitted zero-to-one
interval so energy0 yields exactly0. The existing warm endpoint remains zero.

This changes no coefficient and introduces no authored knob. It is an empirical
annual opportunity envelope, not a growing-season tree-growth model or a claim
that every boreal tile must be wooded. Cold-adapted forest in negative-annual-
temperature snow/tundra remains possible. Biome names alone do not refute it.

The meaningful alternative is a seasonal growth/cold-hardiness consumer using
new producer artifacts. It may ultimately be useful, but this support defect
does not require it. Moving a freeze cutoff to hit a tree count is rejected:
it preserves two inconsistent annual habitat gates and hides their overlap.

## Pre-Declared Proof

| Question | Required Outcome |
| --- | --- |
| Actual producer chain | Held Earthlike annual T -> cryosphere -> classifier -> substrate -> scorer -> planner supports a favorable boreal interior, including freeze0 |
| Cold endpoint | Energy0/coldStress1 yields exactly0 even with favorable atmospheric moisture and the biomass baseline |
| Cold adaptation | A colder admissible case retains positive opportunity; no categorical snow/tundra ban |
| Warm response | Warm energy outside the existing envelope yields0 in the scorer itself |
| Water semantics | Atmospheric habitat remains separate from plant stress; lower plant stress cannot reduce opportunity |
| Placement | Water, non-flat terrain and prior occupancy remain disqualifying |
| Held causes | Geography, climate, cryosphere, drainage, basins, river hierarchy, plant water and biome classification stay byte-identical in paired complete runs |
| Other ecology | Other published score layers stay identical; gains/losses are attributed, not tuned to a count |

Use the existing Earthlike core and retained Standard1/Huge2 identities for
controlled comparisons. Preserve the active annual within-row spread failure;
do not relax a benchmark or add a taiga quota. Existing taiga-presence and
native-habitat checks cannot prove modeled boreal support while colder taiga
still satisfies them. Couple the actual admitted producer values in regression
tests instead.

## Delivery Boundary

Source tests and complete-run adapter observation qualify deterministic
behavior. Build/install identities, a correlated fresh Huge native generation
and bounded feature readbacks qualify the exercised Civ realization separately.
The visible map uses a fresh random seed; controlled comparisons keep their
fixed seeds. Native legality, ecological calibration and vessel movement are
different claims. No full app exit is required for a normal same-mod redeploy.

Implementation, results, review and merge identity are recorded below when
actually verified. No new seasonal artifact, treeline wiring, blanket climate
repair or projection carve is included.
