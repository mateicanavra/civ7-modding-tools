---
id: Q-010
title: Resource Composition And Allocation
recordKind: question
disposition: open
sourceRevision: ce077ddf13dc8cbbed16c1071e2aac6fafddbb60
locations:
  - id: "resources-habitat-fields"
    label: "Resource Habitat Fields"
    relation: "related-producer"
    stage: "placement"
    step: "plan-resource-demands"
    operation: "resources.habitat.ops.deriveHabitatFields"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/recipes/standard/stages/placement/steps/plan-resource-demands/config.ts"
  - id: "resources-demand-admission"
    label: "Resource Demand Admission"
    relation: "question-owner"
    stage: "placement"
    step: "plan-resource-demands"
    operation: "resources.demand.ops.resolveResourceDemands"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/resources/modules/demand/ops/resolve-resource-demands/contract.ts"
  - id: "resources-site-selection"
    label: "Resource Site Selection"
    relation: "question-owner"
    stage: "placement"
    step: "select-resource-sites"
    operation: "resources.sites.ops.selectResourceSites"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/resources/modules/sites/ops/select-resource-sites/contract.ts"
  - id: "resources-start-support"
    label: "Resource Start Support"
    relation: "downstream-consumer"
    stage: "placement"
    step: "adjust-resources"
    operation: "resources.support.ops.adjustResourceSupport"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/recipes/standard/stages/placement/steps/adjust-resources/config.ts"
  - id: "resources-materialization"
    label: "Resource Materialization"
    relation: "downstream-consumer"
    stage: "placement"
    step: "place-resources"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/recipes/standard/stages/placement/steps/place-resources/config.ts"
assessments:
  - claim: "Demand admission, constrained site selection, start support and adapter materialization are distinct steps. Place Resources declares no operation binding."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/recipes/standard/stages/placement/steps/place-resources/config.ts"
  - claim: "Per-type deficits sum positive row-level target-minus-placement gaps; oversupply elsewhere does not cancel a gap. Their total need not equal aggregate targets minus aggregate placements."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/resources/modules/sites/ops/select-resource-sites/strategies/blue-noise-rotation/index.ts"
  - claim: "The retained f200858 fifteen-map comparison worsens fixed-obligation resource composition while all candidate intents have legal matching headless outcomes and starts retain their resource floor. This is not native resource qualification or a uniquely attributed allocation defect."
    state: "supported"
  - claim: "Two bounded ce077dd native witnesses reject eight of 195 Standard intents and four of 196 Huge intents as cannot-have-resource, despite headless admission. Offline legality is not a guarantee of native admission; this does not establish the underlying rule mismatch or a repair."
    state: "supported"
  - claim: "Admitted capacity and sequential site selection deliver adequate type diversity, trade access, expansion quality and long-term resource composition."
    state: "unassessed"
verification:
  - kind: source-inspection
    scope: "Inspection confirms resource habitat and demand bindings in plan-resource-demands and separate site-selection/support owners in Placement. These owner files are unchanged between f200858 and ce077dd; no allocation replay was executed."
    revision: ce077ddf13dc8cbbed16c1071e2aac6fafddbb60
    date: '2026-10-12'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/recipes/standard/stages/placement/steps/plan-resource-demands/config.ts"
  - kind: source-inspection
    scope: "Inspection confirms positive per-type shortfall accounting and distinct sequential planning phases. It does not identify a unique binding constraint, prove global optimality or establish a better feasible allocation."
    revision: ce077ddf13dc8cbbed16c1071e2aac6fafddbb60
    date: '2026-10-12'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/resources/modules/sites/ops/select-resource-sites/strategies/blue-noise-rotation/index.ts"
---

# Q-010: Resource Composition And Allocation

When a resource is missing, is the landscape unable to support it, has a
constrained planner left a usable opportunity unfilled, or did a placement
attempt fail? These are different explanations. The open question is whether
resource demand and sequential allocation produce an adequate composition,
including types that disappear before a demand target exists, and whether
offline admission describes what Civ7 will actually accept.

This belongs in **Placement**, after climate, habitats and terrain have been
resolved. Resource habitat feeds demand admission; site selection allocates
the admitted demand; start support adjusts the plan; adapter writes realize
it. [Q-002][ecology] explains the ecological
consequences of changed water supply; [Q-009][hydrology] owns its physical
calibration. Resource composition is neither a rainforest repair nor a reason,
by itself, to restore excess upstream yield.

## Capacity, Allocation And Writes Are Different Populations

Habitat suitability and game legality do not describe the same sites. Their
intersection, together with authored exclusions, constrains admitted demand.
Sequential selection then encounters spacing, existing occupancy and regional
or player-support obligations. A type with some individually legal sites may
still lack a site satisfying every remaining constraint when its turn arrives.

An honest `no-admitted-site` result means none passed that constrained remaining
search. It is not proof that no physically suitable place exists or that no
different lawful allocation could do better. Conversely, a successful write
only establishes that a selected intent was realized. It does not establish
that the plan has sufficient variety or useful geographic distribution.

## The Same Obligation Reveals More Deterioration

The retained annual-yield comparison uses the same fifteen complete headless
maps, ten Huge and five Standard, generated at
`f20085808332b5051971dd465e189e834daaa5d4`. Resource policy is unchanged. The
headline per-type deficit rises from 464 to 551, but that comparison changes
its population: twelve map/type rows lose legal capacity and leave demand
admission. They remove 79 target intents, seven old placements and 72 old
deficit units from the total. No rows gain admission.

On the same 494 admitted map/type rows, the obligation is held:

| Same Admitted Rows | Baseline | Annual-Yield Candidate |
| --- | ---: | ---: |
| Target intents | 3,584 | 3,584 |
| Placements | 3,270 | 3,112 |
| Per-type deficit units | 392 | 551 |

The same-obligation deterioration is **159 deficit units**, not the headline
87. Deficits sum each row's positive target-minus-placement gap; excess in
another row cannot offset it. They need not equal aggregate targets minus
aggregate placements. These are missing units against per-type targets, not
unique missing tiles, failed writes or players without resources.

Initial-age type absences rise from 18 to 37 across the same 510 map/type cases.
Regional obligations are a separate overlapping measure, not units to add to
these deficits. A changing admitted population can therefore conceal a loss of
composition even when every reported shortfall is accounted for correctly.

## Two Resources, Different Explanations

Map 14, Standard seed 918829240, keeps all 34 types admitted with total demand
240, but placements fall from 220 to 195. Clay's habitat-and-legal capacity
falls from 19 to three. Cotton's falls only from eight to seven, while its
placements fall from six to two. Capacity is important, but those different
responses do not establish it as the complete explanation.

Sequential competition, spacing, exclusions and equity may bind differently.
The retained evidence identifies neither a unique limiting constraint nor a
better feasible allocation. A missing type cannot simply be attributed to the
feature writer, nor does it establish that the demand target was appropriate.

## Contract Compliance Does Not Establish Composition

All 3,112 candidate intents have legal matching headless outcomes with no
writer refusals. All 140 starts retain at least two resources under the current
support floor. Those facts protect specific contracts, not type diversity,
trade access, expansion quality or long-term yields. These are headless
outcomes, not a native resource-legality certificate or a native post-write
support-floor measurement.

The combined source `ce077ddf13dc8cbbed16c1071e2aac6fafddbb60` retains the same
resource and generation owners. Its benchmark-only difference from the retained
generation source does not repair allocation or erase the observed deficits.

## Offline Admission Does Not Guarantee Native Legality

Two bounded native witnesses at `ce077dd` expose a separate limit. Their
resource-placement receipts report:

| Native Witness | Planned | Placed | Refused |
| --- | ---: | ---: | ---: |
| Standard, seed 918829240 | 195 | 187 | 8 |
| Huge, seed 668178883 | 196 | 192 | 4 |

All twelve refusals carry `cannot-have-resource`; both receipts report zero
placement mismatches within their own native reconciliation, not equivalence
with the headless world. The corresponding retained `f200858` captures admit
every planned intent. This is a disagreement about admission, not just a target
the planner left unfilled. These twelve refusals are not units to add to the
551 headless planning deficits. Successful headless writes cannot establish
that those same placements are legal in Civ7.

Placement receipts and later map readback describe different moments. Standard
has ten changed resource cells but eight fewer resources overall; Huge has four
changed cells and four fewer resources. The refusal totals are not a count of
every changed cell, and those readbacks alone do not identify which native rule
or intervening effect explains each difference. No underlying repair, general
native legality, visual quality or source adoption is established here.

## What Would Separate Scarcity From An Allocation Limit?

With habitat, legality, demand, spacing and support obligations held, a lawful
alternative allocation would distinguish unavoidable scarcity from an ordering
or competition effect. If another allocation meets more of the same obligations,
that would challenge the incumbent allocation without proving its global
optimum or selecting a replacement algorithm. If no improvement is established,
that alone would not prove optimality; infeasibility needs independent support.

Separately, a justified gameplay interpretation of type diversity and spatial
access could show that the existing composition is sufficient despite missed
targets, or that present guards miss a consequential loss. Demand admission,
allocation quality and the meaning of adequacy need distinct evidence. None
is settled by increasing the aggregate placement count alone.

Native admission adds a further distinction: agreement on the same intended
sites and pre-write state would support the offline legality model, while
repeated native refusals would expose an incomplete rule or state assumption.
That comparison concerns whether the plan can be realized, not whether its
resource composition is good enough.

## Evidence Scope And Identity

The fifteen-map composition comparison remains headless evidence at `f200858`.
The two native observations belong to reviewed source `ce077dd`; its unchanged
generation policy does not make those observations a native census of all
fifteen maps. The retained native resource receipts are the fresh Standard
series `8978aeb4-1ui` and Huge series `9638a39a-16i`, not earlier receipts in
the same logs. Their private source bytes are identified without publishing
machine paths or raw game observations:

| Retained Native Evidence | SHA-256 |
| --- | --- |
| Standard receipt log | `3e7d1c6805b553c7be3d4a4206dc917d26bdcd78aab8c803aa1a9d2d059e2196` |
| Huge receipt log | `5f89b122ac08308d0c487ad51094703cc379965615f1814a4beec984ce06e23d` |
| Standard readback reconciliation | `0ee83b35fc8af719a4c57ca6ff5259fbcbb9231b399626fd9ee840c950beb19b` |
| Huge readback reconciliation | `cff241edc610f4542e8afde37fa4224df4bfab99562006572d741bf34a76b0a6` |

[ecology]: q-002-ecological-prevalence.md#annual-water-yield-and-its-landscape-consequences
[hydrology]: q-009-annual-water-yield.md
