---
id: Q-005
title: Wetland Suitability And Admission
recordKind: question
disposition: open
sourceRevision: ce077ddf13dc8cbbed16c1071e2aac6fafddbb60
locations:
  - id: "ecology-marsh-scoring"
    label: "Marsh Scoring"
    relation: "question-owner"
    stage: "ecology-features"
    step: "score-layers"
    operation: "ecology.features.ops.scoreWetMarsh"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-marsh/contract.ts"
  - id: "ecology-tundra-bog-scoring"
    label: "Tundra-Bog Scoring"
    relation: "question-owner"
    stage: "ecology-features"
    step: "score-layers"
    operation: "ecology.features.ops.scoreWetTundraBog"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-tundra-bog/contract.ts"
  - id: "ecology-mangrove-scoring"
    label: "Mangrove Scoring"
    relation: "question-owner"
    stage: "ecology-features"
    step: "score-layers"
    operation: "ecology.features.ops.scoreWetMangrove"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-mangrove/contract.ts"
  - id: "ecology-wetland-planning"
    label: "Wetland Planning"
    relation: "question-owner"
    stage: "ecology-features"
    step: "plan-wetlands"
    operation: "ecology.features.ops.planWetlands"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-plan-wetlands/contract.ts"
assessments:
  - claim: "Marsh, tundra-bog and mangrove have separate multiplicative suitability operations; their water and temperature inputs differ."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/score-layers/step.ts#L136-L183"
  - claim: "The original 5f82b5f1 Standard1 and Huge2 diagnostic reports marsh/bog placements and no mangroves; no otherwise score-admitted wetland was lost to prior occupancy, arbitration or final headless projection in those baseline cases. These counts precede the bog and mangrove consumer corrections."
    state: "supported"
  - claim: "The merged tundra-bog scorer removes generic fertility as a prerequisite while retaining hydromorphic support, atmospheric water, cold, freeze, native compatibility and the shared 0.42 admission floor."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/7080b22891f2b77297132fa7699fd42fc5fdb4a7/docs/projects/native-map-controls/wetland-consumer-coherence.md#qualified-outcome"
  - claim: "The bog correction's two qualified full-recipe pairs reproduce increases from 2 to 8 and 1 to 6, ten taiga-to-bog changes and one bare-to-bog change, while all 41 model fields and complete starts/fairness/support/natural-wonder outputs remain exact. These holds apply to the bog comparison, not the later mangrove comparison."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/7080b22891f2b77297132fa7699fd42fc5fdb4a7/docs/projects/native-map-controls/wetland-consumer-coherence.md#qualified-outcome"
  - claim: "The bog-qualified pair gains Clay through unchanged feature-compatibility policy, but polar resource overrepresentation increases and non-Clay range deficits persist; this is not a general distribution improvement."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/7080b22891f2b77297132fa7699fd42fc5fdb4a7/docs/projects/native-map-controls/wetland-consumer-coherence.md#qualified-outcome"
  - claim: "The merged mangrove scorer removes only generic fertility as an occurrence prerequisite, retaining the warmth/aridity responses, marine-low-shore gate, compatibility and admission policy. Nutrient importance and the empirical response scale are not thereby validated or dismissed."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/22438584f152a420901c0fa0d0e90f175a815f32/docs/projects/native-map-controls/wetland-consumer-coherence.md#selected-mechanism"
  - claim: "Two complete mangrove recipe pairs produce exactly 8 and 33 rainforest-to-mangrove changes while all 41 model fields and physical projection hold. Resource and seat coordinates change; Mango opportunity and Huge start dispersion worsen, and per-start resource support is not invariant."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/22438584f152a420901c0fa0d0e90f175a815f32/docs/projects/native-map-controls/wetland-consumer-coherence.md#completed-mangrove-pair"
  - claim: "The later source-limited moisture comparison retains the repaired consumers while changing forcing: rainforest rises and bog falls in all six prescribed pairs, while marsh and mangrove responses are mixed. Recorded plans and final headless counts agree; these are not abundance targets or 47-case feature prevalence."
    state: "supported"
  - claim: "Of 49 former bog plans first blocked by a zero B score, 48 have atmospheric moisture low enough to zero the unchanged water ramp. The exact substrate/factor cause at Standard 42 cell 255 remains unobserved."
    state: "supported"
  - claim: "The broad hydromorphic proxy and annual cold/freeze fields adequately approximate bog habitat at the map's scale."
    state: "unassessed"
  - claim: "The individual suitability responses adequately represent these habitats and climate regimes at the map's scale."
    state: "unassessed"
  - claim: "Earthlike's shared 0.42 admission floor has justified ecological or product meaning across the distinct family scores."
    state: "unassessed"
  - claim: "Earlier wetland intent reserves the sole feature slot before vegetation planning. The retained rainforest investigation exposes mangrove occupancy within rainforest-biome habitat, but does not establish that this priority is defective."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/plan-vegetation/step.ts"
  - claim: "Warm marine-low-shore suitability establishes mangrove occurrence strongly enough to reserve the only feature slot ahead of otherwise admitted rainforest at dual-qualified flat tropical sites."
    state: "unassessed"
  - claim: "The bounded occurrence review retains the intended specialized-habitat policy; no admission repair is established. Existing owners exactly replay mangrove scores and wetland/vegetation intents on thirty retained captures, without validating ecological coverage."
    state: "supported"
  - claim: "Mangrove admission covers 477 of 488 and 411 of 418 already-filtered legal, flat, free marine-low-shore candidates. The conditional 97.7% and 98.3% rates are not evidence of physically sufficient occurrence discrimination."
    state: "supported"
  - claim: "The separate seasonal-thermal outcome audit reports mangrove/forest exchanges and sixty former forest cells becoming featureless across twenty-three headless maps while physical inputs and independent scores hold. Biome compatibility changes which families may occupy a site; unsupported replacement families expose an occurrence question, not physical drying or authority to lower a floor."
    state: "supported"
  - claim: "One matched Huge native thermal comparison supports changed family application with measured physical water and river classes held. Application totals and bounded readback do not independently verify every transition across the twenty-three headless maps, calibrate occurrence or authorize a floor or priority change."
    state: "supported"
verification:
  - kind: source-inspection
    scope: "Source inspection confirms separate family operations and actual atmospheric-water, plant-water and climate-field bindings; it does not calibrate their physical responses."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/score-layers/step.ts"
  - kind: source-inspection
    scope: "Source inspection confirms flat/free eligibility precedes biome-compatible winner selection and the admission floor. Confidence is a score, not an independently calibrated probability."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-plan-wetlands/strategies/habitat-confidence/index.ts"
  - kind: source-inspection
    scope: "Source inspection confirms Earthlike's authored minimum score of 0.42. Retained replay findings remain prose evidence with separate custody limits, not a new threshold validation."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/maps/configs/swooper-earthlike.config.json#L1050-L1054"
  - kind: source-inspection
    scope: "Inspection of the merged scorer confirms the bog-only fertility removal and remaining water/cold/freeze product. It does not validate the remaining environmental proxies or shared score scale."
    revision: 4ae7b311a1e259449001b96b683860c5b682301e
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/4ae7b311a1e259449001b96b683860c5b682301e/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-tundra-bog/strategies/cold-hydromorphic/index.ts"
  - kind: source-inspection
    scope: "Inspection of the qualified owner report establishes the reported retained replay and two complete recipe pairs at runtime be9b403bdc2d586c990c56dfb543b8506f849e6c, including vegetation changes, Clay gains and increased polar overrepresentation. This is not a new execution, fresh native proof or whole-question validation."
    revision: 7080b22891f2b77297132fa7699fd42fc5fdb4a7
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/7080b22891f2b77297132fa7699fd42fc5fdb4a7/docs/projects/native-map-controls/wetland-consumer-coherence.md#qualified-outcome"
  - kind: source-inspection
    scope: "Inspection confirms the mangrove-only fertility removal, held warmth/aridity product and unchanged operation/step ownership. It does not establish real intertidal habitat, nutrient independence or calibrated occurrence probabilities."
    revision: 4829c718eb1dfe5cddd57bb3b32c2208de184fbc
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/4829c718eb1dfe5cddd57bb3b32c2208de184fbc/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-mangrove/strategies/warm-intertidal/index.ts"
  - kind: source-inspection
    scope: "Inspection of the merged owner report at a tree identical to accepted a602477b62a547fe398164090d93f072612558e9 establishes reported local controls, production retained replay and exactly two complete recipe pairs at runtime 4829c718eb1dfe5cddd57bb3b32c2208de184fbc. Changed resources, seats, support and Huge dispersion are scoped consequences, not a new execution, installation or fresh native proof."
    revision: 22438584f152a420901c0fa0d0e90f175a815f32
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/22438584f152a420901c0fa0d0e90f175a815f32/docs/projects/native-map-controls/wetland-consumer-coherence.md#completed-mangrove-pair"
  - kind: source-inspection
    scope: "The merged moisture integration retains feature-scoring operations, bindings and admission policy, including the repaired bog, mangrove, dryland and taiga consumers. Source inspection does not rerun the privately retained six-case attribution or validate the remaining ecological responses."
    revision: d17abf6f54b018600b2d13c139e8be485e2aa732
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/d17abf6f54b018600b2d13c139e8be485e2aa732/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/score-layers/step.ts"
  - kind: source-inspection
    scope: "Current Hydrology documentation distinguishes float precipitation, independently reduced wetness, native codec and later plant-water opportunity. The new forcing can change downstream climate, habitat and terrain; historical consumer-only field holds do not apply to that comparison."
    revision: eff77c0f8cd3be5b8a8fd176997918b76848bc44
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/eff77c0f8cd3be5b8a8fd176997918b76848bc44/docs/system/libs/mapgen/reference/domains/HYDROLOGY.md#L144-L217"
  - kind: source-inspection
    scope: "Inspection confirms the warm-intertidal strategy remains an explicitly coarse occurrence proxy using marine-low-shore eligibility, warmth and aridity; it does not measure tidal persistence, salinity or establishment."
    revision: fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-mangrove/strategies/warm-intertidal/index.ts"
  - kind: source-inspection
    scope: "Inspection confirms wetland intents become prior occupancy for the vegetation step. This identifies the policy relationship, not the ecological inadequacy of mangrove priority or a newly executed feature comparison."
    revision: fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/plan-vegetation/step.ts"
---

# Q-005: Wetland Suitability And Admission

What does a wetland suitability score establish: conditions in which a family
could live, or enough evidence that it should occupy the site? Marsh, tundra bog
and mangrove have different scoring models but share a numerical admission
floor. Admission also reserves a feature slot before vegetation is considered.
The meaning of the family responses, shared floor and that priority is the
question, not whether all wetlands should become more common.

The retained [six-case moisture comparison][current-evidence] contrasts the
empirical-moisture baseline (A) with source-limited forcing (B), retaining the
same repaired family responses and admission floors.
Rainforest increases and bog decreases in all six pairs; mangrove and marsh
responses are mixed. The result is not "more wetlands": it shows distinct
consumers responding differently to changed conditions. Earlier bog and
mangrove comparisons instead changed a consumer while holding its environment
fixed. Neither kind of evidence establishes ecological adequacy or appropriate
abundance. The separate [rainforest investigation][rainforest-population] exposes
dual-qualified sites. The [bounded occurrence review](#when-suitability-reserves-the-only-feature-slot)
retains mangrove priority without establishing an admission repair or validating
ecological coverage. **Q-005 remains open** for habitat meaning, the remaining
responses and admission.

The [seasonal-thermal comparison](#biome-compatibility-changes-cover-without-changing-scores)
exposes another route to changed cover: a different biome admits different
families even when the physical inputs and their suitability scores stay fixed.

## Three Responses, Not One Wetland Score

In `ecology-features / score-layers`, a substrate mask first identifies where
a family may be considered. The [score-layers step][scores] then calls separate
operations for each family. Their products combine several factors between
zero and one: a zero factor vetoes a site, while several moderate factors can
produce a small combined score even when no individual factor is zero.

- **[Marsh][marsh]** requires hydromorphic support, the model's floodplain-or-low-shore
  proxy. Its score combines atmospheric water, fertility, a temperature window
  and low aridity.
- **[Tundra bog][bog]** uses the same substrate but combines atmospheric water,
  cold and freeze factors. It no longer requires generic fertility. Its water
  input remains atmospheric moisture, not plant water or local surface-water
  opportunity; the cold/freeze response can narrow support independently of marsh.
- **[Mangrove][mangrove]** requires low marine-shore support. It combines warmth
  and low climate aridity, without generic fertility. It does not directly
  multiply atmospheric water or plant-water availability into its score.

These are descriptions of the implemented hypotheses, not complete physical
definitions of those habitats. Hydromorphic support is not a measured water
table or a simulated duration of inundation. Intertidal support distinguishes
marine from inland sources, but is not a tidal-exposure simulation. The
[shore geometry question][geometry] and the [point-water question][point-water]
remain distinct from these family-response choices.

### What Does Bog Fertility Mean?

EPA describes bogs as nutrient-poor peat wetlands supplied largely by
precipitation, in contrast to the richer water sources of fens and many marshes.
The game's [pedology fertility index][pedology] instead combines model
precipitation, normalized wetness, relief, sediment and bedrock terms. The
current moisture integration replaces its earlier rainfall/humidity-byte
inputs with float `P` and `W`; it does not turn the composite into measured
nutrients, acidity or peat. [EPA's wetland classification][epa-wetlands] supplies physical context,
not scoring coefficients or a definition of Civ7's feature.

The retired bog response made that generic growth proxy a necessary multiplier.
The qualified change removes the prerequisite rather than reversing it or
inventing a low-fertility substitute:

```text
bog suitability = waterSuit * coldSuit * freezeSuit
```

Land and hydromorphic eligibility still apply before this product; compatibility,
occupancy and the same admission floor still apply afterward. The producer and
other consumers were unchanged by the bog correction. This separates bog
admission from a generic growth preference; it does not turn low fertility into
evidence of bog chemistry or validate the remaining habitat approximation.

### Mangrove Occurrence Is Not Generic Productivity

Mangroves are coastal trees and shrubs adapted to tidal settings. Their roots
face waterlogged, oxygen-poor sediments and varying salt concentrations;
species differ in how they tolerate these conditions. Tidal flooding, salinity
and nutrient supply help shape their distribution, while dispersed young plants
must reach a site and establish there. [NOAA's estuarine account][mangrove-habitat]
describes that habitat, not a generic preference for fertile land.

Nutrients still matter. [Almahasheer and colleagues][mangrove-nutrients] observed
nutrient-poor dwarf mangroves in the Central Red Sea and found seedling growth
responses to iron addition. Their discussion also cautions that nutrient supply
can constrain early establishment. The distinction is not "nutrients do not
matter," but **a generic growth index is not a measured necessary condition for
occurrence**. Pedology's composite does not measure nitrogen, phosphorus or iron
availability, root-zone salinity, tidal flooding or recruitment success.

The selected mangrove correction therefore removes that composite multiplier,
not nutrient dependence as a biological possibility:

```text
mangrove suitability = warmSuit * ariditySuit
```

The existing warmth ramp from 18 to 30 degrees C and low-aridity response from
0.7 to 1 remain empirical controls, not calibrated occurrence probabilities.
Land, marine-low-shore, flatness, native biome compatibility and prior occupancy
still constrain admission. No replacement nutrient factor, gain or lower floor
is introduced; marsh and the fertility producer are unchanged by this correction.
The pipeline's coastal lesson explains this current response with a worked
marine-shore example. Removing the fertility multiplier is a separate consumer
correction from the later cold-season biome admission change.

Seventeen reported local regimes distinguish this change from blanket admission.
At 24 degrees C in one producer-consistent wet marine regime, removing fertility
changes the score from 0.381057 to 0.5 across the held 0.42 floor. A lower-sediment
contrast has lower produced fertility but the same new score. Moderate-rain
regimes can cross the score floor yet remain incompatible through the actual
biome classifier. Cold, dry, inland, lake-only, high-shore and water controls
reject; separate flatness, occupancy and compatibility guards also hold.
These are local model controls, not proof that a generated world reaches those
regimes or that real seedlings establish there.

The [Pedology binding][pedology-binding] also omits bedrock age while its configured
weight remains in the [fertility normalization][pedology]. That relationship is
an open producer question, not a proven defect or a normalization repair in this
consumer correction.

## A Shared Floor After Compatibility

In `ecology-features / plan-wetlands`, the [planner][planner] first requires a
flat, previously unoccupied site. It considers biome-compatible families,
selects the strongest candidate and then applies the configured minimum score.
Earthlike sets that floor to [0.42][floor]. The implementation calls the score
"confidence," but it is not an independently calibrated probability.

The [official biome compatibility masks][compatibility] for these wetland
families are mutually exclusive. They therefore do not currently compete with
one another on the same compatible tile. A shared floor is not itself evidence
that one wetland family displaces another.

A common numeric range does not by itself demonstrate that the scores have
comparable ecological meaning. Their factors and response windows differ.
Yet a low product can also be a legitimate rejection of marginal conditions.
Sparse placement alone cannot distinguish an overly restrictive response from
an appropriate one, or establish that the floor should be lowered.

The [oasis admission question][point-water] makes that distinction concrete.
Among 91 score-capable receiver climates in the six retained source-limited
maps, plant-responsive classification ends DESERT compatibility before source
support can lift the oasis score to the floor. Atmospheric dryness caps the
remaining eligible nonpolar climates in those maps.
Those conditional explanations justify no behavioral repair; they do not
validate 0.42 as a common ecological threshold across these families.

## When Suitability Reserves The Only Feature Slot

**The intended specialized-habitat priority is retained; no admission repair
is established.** This bounded decision concerns implementation and the evidence
for changing it, not scientific validation of mangrove prevalence.

Mangrove and rainforest do not meet in a single highest-score contest.
Wetland planning happens first; its admitted intent becomes
[prior occupancy for vegetation][retained-vegetation]. A mangrove can therefore
occupy a flat tropical site where rainforest would otherwise be admitted. This
is different from competition among the mutually exclusive wetland families
described above.

The completed same-site audit uses all thirty A/B captures from the
[fifteen-configuration rainforest comparison][rainforest-population]. A uses
the previous lapse on current source; B uses stronger cooling. Existing owners
reproduce the complete mangrove scores, wetland intents and vegetation intents
exactly before a diagnostic omits only mangrove reservations from the vegetation
planner's occupancy input. No physical field, score, configuration or other
family's reservation changes. This is not another generated world or a proposed
priority reversal.

| Observation | A: Previous Lapse | B: Stronger Cooling |
| --- | ---: | ---: |
| Legal, flat, previously free marine-low-shore candidates | 488 | 418 |
| Mangrove intents | 477 | 411 |
| Below the existing admission floor | 11 | 7 |
| Candidate admission fraction | 97.7% | 98.3% |
| Otherwise-admitted rainforest on those mangrove sites | 477 | 411 |

The omission releases rainforest at every mangrove site and no other vegetation
family, while preserving existing vegetation intent. All dual-qualified sites
satisfy the represented marine/relative-relief, confidence, flatness,
compatibility and earlier-occupancy gates. That establishes the representation
tradeoff without a demonstrated binding or admission bypass. The full terrain
and habitat denominator remains in Q002.

**Near-universal admission in this filtered population is not ecological
reassurance.** The remaining question is whether the
[warm-intertidal predicate][retained-mangrove] supplies adequate **occurrence**
support rather than only **suitability**. It recognizes warm, sufficiently
non-arid low marine shores, but does not measure tidal persistence, salinity,
wave disturbance, damaging cold extremes or seedling establishment. Those
omissions remain limits, not evidence for new thresholds on the supplied inputs.
Deliberately coarse specialized-habitat policy is a credible game-scale choice;
neither simplification nor a high conditional admission rate proves it wrong.

Retention could be challenged by a physically supported negative regime that
the owner can actually distinguish, or by an explicit change in the intended
product policy. No supplied discriminator is not proof that none matters.
That occurrence review holds climate, drainage, the reviewed major-river
percentile 0.92, native legality and other families fixed. A higher rainforest
score cannot rank the two families as competing probabilities: their independent
response curves
have no shared occurrence calibration. More rainforest alone supports neither
a priority reversal nor a quota. Its own
[annual habitat meaning][annual-regimes] remains a separate open question.

The [shore-topology question][geometry] remains separate: a bounded square
window is not wrapped-hex proximity, but its contribution to bulk rainforest
scarcity has not been quantified. This occurrence question selects no geometry
replacement, score adjustment, priority reversal or production repair.

The separate [adopted river-representation choice][current-river-choice] changes
available surface without changing wetland scoring or precedence. Both mangrove
and rainforest can gain space when fewer cells receive navigable terrain; that
does not imply a more permissive wetland rule or calibrated coastal coverage.
The thirty-capture occurrence audit above remains evidence at its reviewed
0.92 configuration, not a fresh replay of the adopted 0.95 surface. Q002 owns
the distinct fifteen-case qualification, matched native pair and their limits.

### Biome Compatibility Changes Cover Without Changing Scores

The separate [seasonal-thermal result][seasonal-outcomes] changes family
eligibility without changing physical inputs or the fifteen biome-independent
score layers. In its retained fifteen cases, mangrove rises from 471 to 541:
93 forest sites become mangrove and 23 mangrove sites become forest. The
wetland planner's biome compatibility changes admission, not the site's water
supply or mangrove score. Floodplain footprints and minor/navigable classes also
hold while biome-specific identities change, including grassland to tropical
floodplain. A changed feature name need not mean a changed physical process.

Across **all twenty-three cases**, including the separate eight-map ecology
study, sixty former forest cells become featureless. Fifty-seven enter
`tropicalSeasonal` habitat with an unchanged savanna score of zero; three enter
rainforest habitat with unchanged scores below the **Rainforest-specific 0.29
floor**, not the wetland floor of 0.42. The new biome no longer admits the old
forest family, but its replacement family is not supported by the existing
score/admission rules. These are visible-cover losses, not climate moisture loss;
featureless does not also mean resource-free.

Together these outcomes sharpen one existing challenge: do biome compatibility,
family responses and earlier-slot priority provide adequate occurrence
discrimination? They do not establish sixty independent defects, a mandatory
fallback feature, a lower floor or reversed mangrove priority. The source/headless
result and its [bounded native realization][seasonal-native] are accepted.
The matched Huge case supports changed family application while measured
physical water and river classes hold. Its application totals and bounded
readback do not independently verify every transition across the twenty-three
headless maps or calibrate coastal occurrence. Whole-land quality and the grouped
replacement-family question remain open. The earlier thirty-capture occurrence
decision retains its own scope rather than becoming proof for this different
comparison.

## Changed Forcing, Retained Responses

The moisture integration changes the environment supplied to these families,
not their scoring or admission laws. The [quantity map][quantities] separates
unclipped precipitation `P`, independently averaged normalized wetness `W`,
the native byte codec and later non-withdrawal plant-water opportunity.
The scorer's atmospheric-water input is not `W` directly: it normalizes
atmospheric effective moisture `M = P + 0.35 * 255 * W`. Plant-responsive
classification can also respond to local opportunity; bog's water factor does not.

Six prescribed matched headless cases yield the following final counts. Map
and game seeds are equal to the listed seed; every entry is **A to B**.

| Case | Marsh | Tundra bog | Mangrove |
| --- | ---: | ---: | ---: |
| Huge 1018 | 0 to 1 | 14 to 3 | 28 to 30 |
| Huge 2024 | 4 to 1 | 14 to 2 | 43 to 59 |
| Huge 5050 | 3 to 1 | 17 to 7 | 48 to 71 |
| Standard 1018 | 1 to 1 | 19 to 6 | 21 to 18 |
| Standard 1 | 2 to 5 | 8 to 5 | 8 to 6 |
| Standard 42 | 2 to 3 | 11 to 6 | 14 to 16 |

The retained plans, projection attempts and final headless readback agree.
No recorded same-stage peer loss or projection rejection explains these
differences. Earlier occupancy still matters: floodplains and wetlands can
reserve sites before vegetation, so this is not a claim of no competition.
The [full ten-family comparison][current-evidence] shows rainforest increasing,
forest and taiga decreasing, and steppe increasing in all six cases. Those
directions are neither abundance goals nor proof that one distribution is better.

### What Accounts For The Bog Decline?

Of 49 former bog plans whose first recorded B blocker is a zero score, 48 have
atmospheric moisture at or below 130.9. That is sufficient to zero the unchanged
water ramp at Earthlike's normalization of 238. It accounts for this bounded
group, not every lost bog or a unique decomposition of all interacting causes.
Generic fertility has not returned as a prerequisite.

**One cause remains unobserved.** Standard 42 cell 255, at (3, 3), has a zero
bog score despite atmospheric moisture 165.906296, freeze 0.964099 and annual
temperature -11.497385 degrees C. The transient hydromorphic mask and individual
factor products were not retained. The evidence therefore does not establish
which substrate/factor veto applies; it is not a demonstrated moisture failure
or a repaired site.

Mangrove retains its warmth/aridity product and marine-only shore eligibility;
the mixed count response does not measure actual tidal habitat. Marsh likewise
retains its response and floor. In Huge 1018, its maximum score rises from
0.409856 to 0.440882 across the unchanged 0.42 threshold. The annual-energy
taiga repair also remains: its observed zero-score losses are consistent with
the held atmospheric-water envelope, not a newly added frost requirement.

## What The Qualified Pair Shows

These are **earlier consumer-only comparisons**, each for Standard 1/1 and
Huge 2/2, not the six-case forcing study. Retained-owner replay establishes
scores and intent through vegetation; fresh complete recipes establish final
features, resources and starts. Their forty-one-field holds apply within their
own comparisons, not to a moisture change that alters downstream environment.

### Bog: More Clay, More Polar Concentration

The [bog comparison][qualified] removes generic fertility with environmental
fields held. Bog counts rise from 2 to 8 and 1 to 6: ten cells change from
taiga and one from bare land. Clay rises from 4 to 6 and 2 to 6 under existing
feature-compatibility rules, but neither map reaches target eight. Resources
become more concentrated in small polar land populations. More lawful placements
are not a general distribution improvement. Complete starts, fairness,
resource support and natural wonders hold in this pair.
[Detailed counts and population definitions][bog-evidence]
preserve those results and the distinction between before/after maxima and a
fixed band's change.

### Mangrove: Coastal Occupancy Changes Resources And Starts

The [mangrove comparison][mangrove-qualified] then changes exactly eight and
thirty-three cells from rainforest to mangrove, with model and physical fields
held. Resources change at twenty-three and sixteen cells; seats change for
four of eight and five of ten players. Mangos fall from 2 to 1 and 5 to 1.
Huge's sole Mango uses the legal-only regional-minimum exception despite no
remaining eligible-range sites; its target shortfall increases to four.

All players remain legally seated without fallback or relaxed regions, but
per-start resource support and coordinates are not invariant. Support becomes
three to five resources per start in both maps. Huge minimum spacing falls
from ten to nine tiles and starts are less spread relative to available land
per player. The existing cohort-mean dispersion requirement still passes on
this two-map pair, not a newly qualified full bank. Reported start "freshwater"
is modeled nearby-water opportunity used as a soft preference, **not native founding-bonus
proof**. The [complete resource/start comparison][mangrove-evidence] retains
these tradeoffs without attributing them to the later moisture integration.

## Habitat Meaning Remains Open

In the earlier bog retained pair, hydromorphic eligibility covers 1,442 of
1,506 exposed land cells (95.75%) and 2,432 of 2,501 (97.24%). Such a broad floodplain-or-shore
proxy is not independent evidence of waterlogging. All eleven new bog cells
have raw tundra/native TUNDRA identity, a polar thermal category, annual
temperature between -12.893 and -9.530 degrees C, and `permafrost01 = 1`.
Those annual proxies demonstrate neither seasonal active-layer thaw nor its
absence, and do not establish peat formation or a duration of saturation.
They also do not prove physically impossible bogs or justify a new frost veto.

The earlier mangrove retained pair admits all eight of eight and thirty-three
of thirty-three legal, flat, free marine-low-shore cells in those inputs, not
all ninety-four and 493 substrate cells. That eligible cohort contains no
climatic negative. Local controls test rejection separately; saturation in these
two eligible populations does not establish appropriate coastal coverage.
Marine low shore is not verified intertidal habitat. Tides, salinity, shelter,
wave exposure and recruitment remain unresolved, and annual ground temperature
does not measure damaging cold extremes or leaf temperature.

The remaining question is whether each family's support and response represent
its habitat at this scale, and whether the shared score floor has a justified
meaning across families. Changing a response with substrate and environmental
fields held fixed isolates the modeled family response. Changing admission
with all scores held fixed instead isolates selection policy. A change in
climate or habitat support tests a third explanation, not the floor itself.
These distinctions prevent a higher feature count from concealing which
hypothesis changed.
The seasonal-thermal result adds a concrete family-admission case: a site can
retain all modeled growth conditions yet change cover because its newly admitted
biome and existing feature responses do not select the same family.

Evidence of physically marginal sites would support their rejection. Suitable
sites systematically excluded by a response factor would challenge that
family's response. Well-founded family scores that acquire incompatible
meanings under one floor would instead challenge shared admission. The
qualified consumer corrections do not settle those questions for the remaining
factors or marsh, nor validate persistent wetness, tidal habitat or seasonality.
Product choices about visibility or abundance remain distinct from physical
evidence, as [Q-002][prevalence] explains.

Dry shrubland exposes a related occurrence question outside wetland planning:
positive suitability can permit sparse plants without independently establishing
a gameplay-significant stand. The [rejected sagebrush density contrast][dryland-meaning]
does not validate the existing cover, but it also does not justify transferring
a wetland floor, priority rule or absence requirement to sagebrush. Physical
support and native stand meaning remain separate questions in both cases.

The [post-yield desert census][desert-census] sharpens that distinction without
selecting a wetland change. Sagebrush covers 95.77% of 5,177 flat desert cells,
while all 175 feature-bare flat desert cells have precipitation at least as
large as both annual-demand estimates and a median temperature of 1.62 degrees C.
Many warmer, annually water-stressed desert sites remain covered. Category
consistency and stand occurrence therefore need separate evidence. The proposed
desert-admission guard in Q-002 is unqualified here; it neither establishes a
sagebrush repair nor validates a shared occurrence floor.

The [rainforest category witness][category-witness] shows why habitat support,
family response and selection must remain distinct: changed local-water
opportunity can remove compatible biome admission even when the feature score
rises. The absence of a newly demonstrated water double debit does not
calibrate that boundary or prove seasonal root-water sufficiency. This is a
related interpretation question, not evidence for changing wetland priority or
transferring its score floor to rainforest or sagebrush. The grouped dryland
stand question remains with [Q002][dryland-meaning].

[category-witness]: q-002-ecological-prevalence.md#rainforest-habitat-is-not-a-native-feature-guarantee
[dryland-meaning]: q-002-ecological-prevalence.md#flat-desert-is-not-necessarily-bare-desert
[desert-census]: q-002-ecological-prevalence.md#desert-expansion-without-a-rainfall-change

## Original Paired Observations

The [original diagnostic][original-evidence] covers two selected Swooper
Earthlike headless/mock cases captured at
`5f82b5f1f39040e83d909793eb296fc526420511`, before the bog and mangrove corrections.
These are preserved baseline observations, not current counts or response laws.
Standard1 and Huge2 contain two marshes each, two and one bogs, and no mangroves.
Their best legal/free mangrove scores are 0.369707 and 0.373966, below 0.42 under
the retired warmth/fertility/aridity product. Later rainforest fills unclaimed
sites; it does not preempt a qualifying mangrove. The digest preserves the full
habitat-to-placement populations, distinct from Q-004's original empty mask.

## Scope Of The Evidence

This sheet's location map points to the adopted source; its three original
source inspections retain their explicit `2a31c96f8d61ee713075974838dfd36a0b008021`
evidence vintage. The recipe coordinates and shared location identities remain
unchanged. Updating navigation does not refresh an earlier verification.

The [evidence digest][retained] separates the original diagnostic, consumer-only
pairs and current forcing comparison, with exact executed and merged revisions,
dependency qualifications and artifact hashes. Current Learning explains the
adopted scoring law, while these paired observations retain their own revisions.
Raw artifacts remain private, so the public digest alone is not independently
reproducible. The [pre-correction sheet][baseline] preserves the original question.

The moisture attribution covers six prescribed pairs, not the separate 47-case
bank. That bank has zero newly failed expectations but one inherited thermal
failure; **both raw banks remain FAIL**. None of those statements establishes
physical calibration, random-sample prevalence or improved regional warmth.
The separate [candidate Huge 1018 readback][native-smoke] matches the retained
headless B capture at exact coordinates for all 25 ordinary feature families,
including bog 3, marsh 1 and mangrove 30. This single-candidate smoke is not the
earlier native A/B, which stopped before B. Six resource refusals, three natural-wonder refusals
and sixteen planned-lake classification differences limit the native claim;
visual, navigation and played-turn adequacy remain unestablished. Structured
verification remains source or document inspection, not a new run or a
whole-question success badge.

The separate [rainforest evidence scope][rainforest-evidence] identifies its
fifteen configurations, 45 full-recipe executions, source and retained custody
digests. Its previous-lapse and stronger-cooling arms are not the A/B arms of
the moisture study above. It adds occupancy evidence and an open occurrence
question, not another consumer correction, fresh native proof or a rewrite of
the accepted [thermal][relief-response] and [classifier][classifier-meaning]
findings. The completed occurrence review adds existing-owner replays of those
same thirty A/B captures, not new full recipes. Complete mangrove score arrays
and both planners' intents match. Substrate is recomputed by its existing owner;
complete substrate masks were not retained, so complete substrate-artifact
identity is not claimed. Source remains
`fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1`. Private evidence is identified by
the following custody digests, not supplied as public reproduction downloads.

| Retained Occurrence Evidence | SHA-256 |
| --- | --- |
| Mangrove review report | `9516a9705e21d37368ab33e24ad79e474da24e52f1b6371ebca5a9eeb42ca494` |
| Same-site audit method | `875c6cd42f8565bb843715e5f89f9b96be77b93ac8108d231309a12a97af728b` |
| Same-site audit results | `13aa53117dc56347574821d3090d88364eeb6c76dc515300860494a249f7bf0b` |

The separate seasonal-thermal account refers to candidate source
`acf3ba936977fa36342eb0c645a7d9bf0675e6d5`, tree
`ba1e61f5f1a557dd884001041a75b95b5295a9a4`. Its [retained outcome review and
qualification custody][seasonal-evidence] distinguish the fifteen-map comparison
from the eight-map ecology study. The independent audit's complete final-feature
accounting supports the transitions reported here; the runner's selected changed
cells are not an exhaustive ledger of natural-wonder relocation. Feature-cell
counts are not counts of placed wonders. This sheet inspects the retained review,
not a new reduction, native observation or general feature-policy qualification.

[scores]: https://github.com/mateicanavra/civ7-modding-tools/blob/d17abf6f54b018600b2d13c139e8be485e2aa732/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/score-layers/step.ts
[marsh]: https://github.com/mateicanavra/civ7-modding-tools/blob/d17abf6f54b018600b2d13c139e8be485e2aa732/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-marsh/strategies/temperate-hydromorphic/index.ts
[bog]: https://github.com/mateicanavra/civ7-modding-tools/blob/d17abf6f54b018600b2d13c139e8be485e2aa732/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-tundra-bog/strategies/cold-hydromorphic/index.ts
[pedology]: https://github.com/mateicanavra/civ7-modding-tools/blob/d17abf6f54b018600b2d13c139e8be485e2aa732/plugins/mod/map/swooper-physics/src/domain/ecology/modules/pedology/ops/pedology-classify/rules/index.ts
[pedology-binding]: https://github.com/mateicanavra/civ7-modding-tools/blob/d17abf6f54b018600b2d13c139e8be485e2aa732/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/pedology/steps/pedology/step.ts
[qualified]: https://github.com/mateicanavra/civ7-modding-tools/blob/7080b22891f2b77297132fa7699fd42fc5fdb4a7/docs/projects/native-map-controls/wetland-consumer-coherence.md#qualified-outcome
[distribution]: https://github.com/mateicanavra/civ7-modding-tools/blob/4ae7b311a1e259449001b96b683860c5b682301e/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/families/resources.ts#L386-L409
[baseline]: https://github.com/mateicanavra/civ7-modding-tools/blob/c0bea4647cb6bf2bdb9d9e69928ed153bfcff703/docs/projects/native-map-controls/questions/q-005-wetland-suitability.md
[epa-wetlands]: https://www.epa.gov/wetlands/classification-and-types-wetlands
[mangrove]: https://github.com/mateicanavra/civ7-modding-tools/blob/d17abf6f54b018600b2d13c139e8be485e2aa732/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-mangrove/strategies/warm-intertidal/index.ts
[mangrove-qualified]: https://github.com/mateicanavra/civ7-modding-tools/blob/22438584f152a420901c0fa0d0e90f175a815f32/docs/projects/native-map-controls/wetland-consumer-coherence.md#completed-mangrove-pair
[mangrove-habitat]: https://oceanservice.noaa.gov/education/tutorial_estuaries/est07_adaptations.html
[mangrove-nutrients]: https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2016.00271/full
[start-spread]: https://github.com/mateicanavra/civ7-modding-tools/blob/4829c718eb1dfe5cddd57bb3b32c2208de184fbc/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/families/placement.ts#L468-L494
[planner]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-plan-wetlands/strategies/habitat-confidence/index.ts
[floor]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/maps/configs/swooper-earthlike.config.json#L1050-L1054
[compatibility]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/packages/civ7-map-policy/src/civ7-tables.gen.ts
[retained]: ../wetland-occurrence-evidence.md
[current-evidence]: ../wetland-occurrence-evidence.md#six-case-feature-attribution
[quantities]: ../wetland-occurrence-evidence.md#four-quantities-through-the-pipeline
[native-smoke]: ../wetland-occurrence-evidence.md#candidate-huge-1018-readback
[bog-evidence]: ../wetland-occurrence-evidence.md#qualified-bog-consumer-result
[mangrove-evidence]: ../wetland-occurrence-evidence.md#qualified-mangrove-consumer-result
[original-evidence]: ../wetland-occurrence-evidence.md#original-other-family-observations
[geometry]: q-001-low-shore-neighborhood.md
[point-water]: q-004-point-water-support.md
[prevalence]: q-002-ecological-prevalence.md
[rainforest-population]: q-002-ecological-prevalence.md#rainforest-habitat-and-feature-occupancy
[seasonal-outcomes]: q-002-ecological-prevalence.md#seasonal-thermal-recovery-and-its-limits
[seasonal-native]: q-002-ecological-prevalence.md#cold-season-admission-in-one-native-world
[seasonal-evidence]: q-002-ecological-prevalence.md#whole-land-census-and-qualification-coverage
[rainforest-evidence]: q-002-ecological-prevalence.md#rainforest-evidence-scope-and-provenance
[retained-mangrove]: https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-mangrove/strategies/warm-intertidal/index.ts
[retained-vegetation]: https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/plan-vegetation/step.ts
[relief-response]: q-006-regional-thermal-response.md#a-stronger-relief-response
[classifier-meaning]: q-007-biome-transition-meaning.md#retained-meaning-open-calibration
[annual-regimes]: q-007-biome-transition-meaning.md#annual-categories-and-seasonal-regimes
[current-river-choice]: q-002-ecological-prevalence.md#current-cooling-qualification-and-adoption
