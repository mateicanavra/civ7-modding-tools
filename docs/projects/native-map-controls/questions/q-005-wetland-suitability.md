---
id: Q-005
title: Wetland Suitability And Admission
recordKind: question
disposition: open
sourceRevision: 2a31c96f8d61ee713075974838dfd36a0b008021
locations:
  - id: "ecology-marsh-scoring"
    label: "Marsh Scoring"
    relation: "question-owner"
    stage: "ecology-features"
    step: "score-layers"
    operation: "ecology.features.ops.scoreWetMarsh"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-marsh/contract.ts"
  - id: "ecology-tundra-bog-scoring"
    label: "Tundra-Bog Scoring"
    relation: "question-owner"
    stage: "ecology-features"
    step: "score-layers"
    operation: "ecology.features.ops.scoreWetTundraBog"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-tundra-bog/contract.ts"
  - id: "ecology-mangrove-scoring"
    label: "Mangrove Scoring"
    relation: "question-owner"
    stage: "ecology-features"
    step: "score-layers"
    operation: "ecology.features.ops.scoreWetMangrove"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-mangrove/contract.ts"
  - id: "ecology-wetland-planning"
    label: "Wetland Planning"
    relation: "question-owner"
    stage: "ecology-features"
    step: "plan-wetlands"
    operation: "ecology.features.ops.planWetlands"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-plan-wetlands/contract.ts"
assessments:
  - claim: "Marsh, tundra-bog and mangrove have separate multiplicative suitability operations; their water and temperature inputs differ."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/score-layers/step.ts#L136-L183"
  - claim: "The original 5f82b5f1 Standard1 and Huge2 diagnostic reports marsh/bog placements and no mangroves; no otherwise score-admitted wetland was lost to prior occupancy, arbitration or final headless projection in those baseline cases. These counts precede the bog consumer correction."
    state: "supported"
  - claim: "The merged tundra-bog scorer removes generic fertility as a prerequisite while retaining hydromorphic support, atmospheric water, cold, freeze, native compatibility and the shared 0.42 admission floor."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/7080b22891f2b77297132fa7699fd42fc5fdb4a7/docs/projects/native-map-controls/wetland-consumer-coherence.md#qualified-outcome"
  - claim: "Two qualified full-recipe pairs reproduce bog increases from 2 to 8 and 1 to 6, ten taiga-to-bog changes and one bare-to-bog change, while all 41 model fields and complete starts/fairness/support/natural-wonder outputs remain exact."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/7080b22891f2b77297132fa7699fd42fc5fdb4a7/docs/projects/native-map-controls/wetland-consumer-coherence.md#qualified-outcome"
  - claim: "The qualified pair gains Clay through unchanged feature-compatibility policy, but polar resource overrepresentation increases and non-Clay range deficits persist; this is not a general distribution improvement."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/7080b22891f2b77297132fa7699fd42fc5fdb4a7/docs/projects/native-map-controls/wetland-consumer-coherence.md#qualified-outcome"
  - claim: "The broad hydromorphic proxy and annual cold/freeze fields adequately approximate bog habitat at the map's scale."
    state: "unassessed"
  - claim: "The individual suitability responses adequately represent these habitats and climate regimes at the map's scale."
    state: "unassessed"
  - claim: "Earthlike's shared 0.42 admission floor has justified ecological or product meaning across the distinct family scores."
    state: "unassessed"
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
---

# Q-005: Wetland Suitability And Admission

When eligible wetland habitat rarely becomes a feature, is the limiting factor
the environment, the family's response to it, or the rule that admits a score
for placement? Marsh, tundra bog and mangrove already have different scoring
models. They nevertheless pass through the same numerical admission floor.
The meaning of that shared comparison is the central question, not whether all
wetlands should become more common.

One [qualified bog-consumer correction][qualified] removes generic fertility as
a prerequisite without lowering the floor or changing climate. Two complete
recipe pairs produce eleven additional bogs, ten replacing taiga. They also
admit more Clay while increasing measured polar resource concentration.
This establishes a bounded correction and its consequences, not ecological
adequacy, appropriate wetland abundance or live-game acceptance. **Q-005 remains
open** for habitat meaning, the other family responses and shared admission.

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
- **[Mangrove][mangrove]** requires low marine-shore support. It combines warmth,
  fertility and low climate aridity. It does not directly multiply atmospheric
  water or plant-water availability into its score.

These are descriptions of the implemented hypotheses, not complete physical
definitions of those habitats. Hydromorphic support is not a measured water
table or a simulated duration of inundation. Intertidal support distinguishes
marine from inland sources, but is not a tidal-exposure simulation. The
[shore geometry question][geometry] and the [point-water question][point-water]
remain distinct from these family-response choices.

### What Does Bog Fertility Mean?

EPA describes bogs as nutrient-poor peat wetlands supplied largely by
precipitation, in contrast to the richer water sources of fens and many marshes.
The game's [pedology fertility index][pedology] instead combines rainfall,
humidity, relief, sediment and bedrock. It is not measured nutrients, acidity
or peat. [EPA's wetland classification][epa-wetlands] supplies physical context,
not scoring coefficients or a definition of Civ7's feature.

The retired bog response made that generic growth proxy a necessary multiplier.
The qualified change removes the prerequisite rather than reversing it or
inventing a low-fertility substitute:

```text
bog suitability = waterSuit * coldSuit * freezeSuit
```

Land and hydromorphic eligibility still apply before this product; compatibility,
occupancy and the same admission floor still apply afterward. Other fertility
consumers and the producer are unchanged. This separates bog admission from a
generic growth preference; it does not turn low fertility into evidence of bog
chemistry or validate the remaining habitat approximation.

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

## What The Qualified Pair Shows

The [qualified result][qualified] distinguishes actual retained-owner replay
through vegetation from two fresh complete headless recipe pairs. The latter
compare Standard 1/1 and Huge 2/2 against the preceding point-water-qualified
captures, with no seed search or larger prevalence sample. The paired numbers
are map seed / game seed: 1/1 for Standard and 2/2 for Huge.

| Completed recipe outcome | Standard 1/1 | Huge 2/2 |
| --- | ---: | ---: |
| Bog features | 2 to 8 | 1 to 6 |
| Taiga features | 177 to 171 | 298 to 294 |
| New bogs on previously bare cells | 0 | 1 |
| Clay placements | 4 to 6 | 2 to 6 |

The actual final feature changes are six taiga-to-bog cells in Standard and
four taiga-to-bog plus one bare-to-bog cell in Huge. There are no wider feature
changes or feature refusals. All forty-one public model fields and their types,
physical terrain, biome, water, rivers and lakes remain exact. The complete
start, fairness, resource-support and natural-wonder outputs also remain exact.

Clay gains follow the existing resource compatibility rules for final bog
features, not added mineral supply or retuned habitat, targets, ranges or
spacing. Both cases reach the existing minimum of six Clay placements but
remain two below the target of eight. This is not a general improvement in
resource distribution. The [latitude-band measure][distribution] divides a band's
share of placed land resources by its share of land. A value of one means equal
shares, not a prescribed ecological or gameplay target. Its maximum rises from
1.58491 to 2.10335 in Standard and from 2.26540 to 4.43440 in Huge. Non-Clay
range deficits persist. Both after-change maxima occur in polar bands, but
Standard's before-change maximum is near the equator; these figures compare
maxima, not one fixed band's change. Lawful placement, adequate supply and
spatial distribution are separate claims.

## Habitat Meaning Remains Open

In the retained pair, hydromorphic eligibility covers 1,442 of 1,506 exposed
land cells (95.75%) and 2,432 of 2,501 (97.24%). Such a broad floodplain-or-shore
proxy is not independent evidence of waterlogging. All eleven new bog cells
have raw tundra/native TUNDRA identity, a polar thermal category, annual
temperature between -12.893 and -9.530 degrees C, and `permafrost01 = 1`.
Those annual proxies demonstrate neither seasonal active-layer thaw nor its
absence, and do not establish peat formation or a duration of saturation.
They also do not prove physically impossible bogs or justify a new frost veto.

The remaining question is whether each family's support and response represent
its habitat at this scale, and whether the shared score floor has a justified
meaning across families. Changing a response with substrate and environmental
fields held fixed isolates the modeled family response. Changing admission
with all scores held fixed instead isolates selection policy. A change in
climate or habitat support tests a third explanation, not the floor itself.
These distinctions prevent a higher feature count from concealing which
hypothesis changed.

Evidence of physically marginal sites would support their rejection. Suitable
sites systematically excluded by a response factor would challenge that
family's response. Well-founded family scores that acquire incompatible
meanings under one floor would instead challenge shared admission. The
qualified bog correction does not settle those questions for the remaining
factors, marsh or mangrove, nor validate persistent wetness or seasonality.
Product choices about visibility or abundance remain distinct from physical
evidence, as [Q-002][prevalence] explains.

## Original Paired Observations

The [retained evidence summary][retained] reports these results for two selected
Swooper Earthlike headless/mock cases captured at
`5f82b5f1f39040e83d909793eb296fc526420511`, before the bog correction. These
are preserved baseline observations, not the later pair's current bog counts.
"Positive" and "at floor" count all
family scores at that filter, before terrain, biome and occupancy filtering;
they are not the planner's execution sequence.

| Family | Positive scores, Standard1 / Huge2 | At or above 0.42 | Final features |
| --- | ---: | ---: | ---: |
| Marsh | 447 / 569 | 3 / 2 | 2 / 2 |
| Tundra bog | 14 / 36 | 2 / 1 | 2 / 1 |
| Mangrove | 45 / 190 | 0 / 0 | 0 / 0 |

The extra Standard1 marsh candidate above the floor is a hill. No otherwise
score-admitted wetland is lost to prior occupancy, winner selection or final
headless projection in either case. Prior occupancy does remove some positive
but below-floor opportunities; it is not irrelevant in general.

The best mangrove opportunities are already flat, biome-compatible and free.
Their scores are approximately 0.369707 and 0.373966, below 0.42. Warmth and
fertility are both moderate: products of approximately `0.6364 * 0.5809 * 1`
and `0.6414 * 0.5830 * 1` explain those results. Rainforest later fills the
unclaimed sites; it did not preempt a qualifying mangrove. The controlling
loss is therefore different from Q-004's original, now-retired empty
point-water substrate.

## Scope Of The Evidence

This sheet's location map and three original source inspections retain the
explicit `2a31c96f8d61ee713075974838dfd36a0b008021` navigation baseline. The
recipe coordinates and shared location identities remain unchanged; later
source/report evidence does not refresh those original verifications.

The [evidence digest][retained] keeps the original diagnostic, later production
replay and complete recipe pairs separately identified, with full runtime,
source and documentation revisions. The original five-family replay is not the
later qualified pair. Production retained replay stops at vegetation; only the
fresh complete recipes support final feature, resource and start outcomes.
The digest retains their different dependency-byte qualifications, artifact
hashes and reported test results. Raw artifacts remain private, so the public
digest alone is not independently reproducible. The [pre-correction
sheet][baseline] preserves the original fertility question.

Structured verification here is source/report inspection, not a fresh execution.
The reported owner qualification does not establish native-game acceptance,
all-seed prevalence or physical calibration.

[scores]: https://github.com/mateicanavra/civ7-modding-tools/blob/4ae7b311a1e259449001b96b683860c5b682301e/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/score-layers/step.ts
[marsh]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-marsh/strategies/temperate-hydromorphic/index.ts
[bog]: https://github.com/mateicanavra/civ7-modding-tools/blob/4ae7b311a1e259449001b96b683860c5b682301e/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-tundra-bog/strategies/cold-hydromorphic/index.ts
[pedology]: https://github.com/mateicanavra/civ7-modding-tools/blob/4ae7b311a1e259449001b96b683860c5b682301e/plugins/mod/map/swooper-physics/src/domain/ecology/modules/pedology/ops/pedology-classify/rules/index.ts
[qualified]: https://github.com/mateicanavra/civ7-modding-tools/blob/7080b22891f2b77297132fa7699fd42fc5fdb4a7/docs/projects/native-map-controls/wetland-consumer-coherence.md#qualified-outcome
[distribution]: https://github.com/mateicanavra/civ7-modding-tools/blob/4ae7b311a1e259449001b96b683860c5b682301e/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/families/resources.ts#L386-L409
[baseline]: https://github.com/mateicanavra/civ7-modding-tools/blob/c0bea4647cb6bf2bdb9d9e69928ed153bfcff703/docs/projects/native-map-controls/questions/q-005-wetland-suitability.md
[epa-wetlands]: https://www.epa.gov/wetlands/classification-and-types-wetlands
[mangrove]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-mangrove/strategies/warm-intertidal/index.ts
[planner]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-plan-wetlands/strategies/habitat-confidence/index.ts
[floor]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/maps/configs/swooper-earthlike.config.json#L1050-L1054
[compatibility]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/packages/civ7-map-policy/src/civ7-tables.gen.ts
[retained]: ../wetland-occurrence-evidence.md
[geometry]: q-001-low-shore-neighborhood.md
[point-water]: q-004-point-water-support.md
[prevalence]: q-002-ecological-prevalence.md
