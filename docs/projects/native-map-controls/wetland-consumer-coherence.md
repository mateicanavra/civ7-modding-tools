# Wetland Consumer Coherence

## Scope And Objectives

Separate the environmental evidence for a wetland from generic plant-growth
preferences and from the policy that admits its score for placement. Start with
one tundra-bog dependency, not a shared-floor adjustment or a climate rewrite.
Marsh, mangrove and dryland point-water families remain independently owned.

The bog scorer currently multiplies atmospheric water, fertility, cold and freeze
responses after admitting hydromorphic substrate. Pedology's fertility blends
rainfall/humidity, relief, sediment and bedrock context; it does not measure
nutrients, acidity or peat. The [EPA's wetland classification][epa] distinguishes
precipitation-fed, nutrient-poor bogs from more minerally supplied fens. This
supports removing a generic fertility prerequisite, not interpreting low composite
fertility as proof of bog chemistry or reversing the ramp.

## Selected Owner Change

In the existing `cold-hydromorphic` tundra-bog operation, remove only the positive
fertility multiplier and retire its input and authored control:

```text
incumbent = waterSuit * fertilitySuit * coldSuit * freezeSuit
candidate = waterSuit                 * coldSuit * freezeSuit
```

Retain land and hydromorphic gates, the three remaining response curves, native
compatibility, flat-ground admission, prior occupancy and planner ordering.
Earthlike's authored floor remains `0.42`; a score is not a calibrated probability.
All three retained map configurations must remove the dead bog control together.
There is no compatibility fallback, new operation or alternative fertility law.
Other fertility consumers and their producer remain unchanged.

Bog `water01` remains `atmosphericWater01`, not plant water or local surface-water
opportunity. Hydromorphic support remains the existing floodplain-or-low-shore
proxy, including finite-water shores. It does not establish measured saturation,
hydroperiod or peat formation.

## Retained Discriminator

The actual current climate-refinement, feature-score and wetland-planning owners
reproduce the retained Standard 1 and Huge 2 incumbent publications. Holding those
inputs, other scores and admission fixed isolates the fertility factor:

| Outcome | Standard 1 | Huge 2 |
| --- | ---: | ---: |
| Bog scores increased | 14 | 36 |
| Newly positive scores | 0 | 0 |
| Floor-passing scores, before to candidate | 2 to 8 | 1 to 11 |
| Lawful bog intents, before to candidate | 2 to 8 | 1 to 6 |
| Existing bogs removed / other wet-family winners displaced | 0 / 0 | 0 / 0 |
| Newly claimed cells with retained later taiga intent | 6 | 4 |

Five Huge candidates still fail unchanged flat-ground admission. The eleven new
intents are cold, native-TUNDRA-compatible outcomes under the current model, not
eleven physically demonstrated bog habitats. Their annual temperature is
`-12.893..-9.530 C`; all have `permafrost01 = 1`. These annual proxies establish
neither seasonal active-layer thaw nor its absence, so this unit adds no frost
or permafrost veto. The hydromorphic mask covers about 96% and 97% of exposed land
in the pair; it is broad eligibility, not independent waterlogging evidence.

The original captures, current owner replay and private mathematical substitution
are distinct evidence. No fresh generation or native execution supports this
initial comparison. Ten later taiga intersections require actual downstream
qualification rather than a promise of complete output identity.

## Deliverables And Verification

Use the existing operation, step-publication and map-config tests to enforce the
reduced closed contract, rejected obsolete controls, unchanged zero-factor gates,
bounded deterministic scores and exact atmospheric-water wiring. Preserve existing
planner tests rather than duplicate them in a new harness.

Production retained replay must match the candidate bog-score and intent digests,
hold physical fields and unrelated score families, and trace actual downstream
vegetation, resources and starts. A missing retained input or execution state must
be reported, not invented. Fresh recipe and native claims need their own correlated
proof; neither follows from the mathematical discriminator.

Use one branch in the existing Graphite lineage. Review and qualify this complete
owner change before selecting another wet-family response. Persistent wetness,
source/substrate adequacy, seasonality, empirical score scale and Earth prevalence
remain open under the wetland investigation, not prerequisite new solvers.

## Links And References

- [Ecology owner contracts](../../system/libs/mapgen/reference/domains/ECOLOGY.md)
- [Dryland point-water consumer coherence](dryland-point-water-coherence.md)
- [Local plant-water response](local-plant-water-design.md)
- [Delivery inventory](delivery-inventory.md)

[epa]: https://www.epa.gov/wetlands/classification-and-types-wetlands
