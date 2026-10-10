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
  - claim: "The privately retained Standard1 and Huge2 diagnostic reports marsh/bog placements and no mangroves; no otherwise score-admitted wetland was lost to prior occupancy, arbitration or final headless projection in those two cases."
    state: "supported"
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
---

# Q-005: Wetland Suitability And Admission

When eligible wetland habitat rarely becomes a feature, is the limiting factor
the environment, the family's response to it, or the rule that admits a score
for placement? Marsh, tundra bog and mangrove already have different scoring
models. They nevertheless compete through the same numerical admission floor.
The meaning of that shared comparison is the central question, not whether all
wetlands should become more common.

Two retained headless cases separate these possibilities enough to locate the
observed losses. Marsh and bog occur, though sparsely; mangrove has positive
coastal opportunities but never reaches the floor. These results do not settle
ecological adequacy, suitable abundance or live-game visibility.

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
  fertility, cold and freeze factors. The cold/freeze response can narrow its
  positive support independently of marsh.
- **[Mangrove][mangrove]** requires low marine-shore support. It combines warmth,
  fertility and low climate aridity. It does not directly multiply atmospheric
  water or plant-water availability into its score.

These are descriptions of the implemented hypotheses, not complete physical
definitions of those habitats. Hydromorphic support is not a measured water
table or a simulated duration of inundation. Intertidal support distinguishes
marine from inland sources, but is not a tidal-exposure simulation. The
[shore geometry question][geometry] and the [point-water question][point-water]
remain distinct from these family-response choices.

## A Shared Floor After Compatibility

In `ecology-features / plan-wetlands`, the [planner][planner] first requires a
flat, previously unoccupied site. It considers biome-compatible families,
selects the strongest candidate and then applies the configured minimum score.
Earthlike sets that floor to [0.42][floor]. The implementation calls the score
"confidence," but it is not an independently calibrated probability.

A common numeric range does not by itself demonstrate that the scores have
comparable ecological meaning. Their factors and response windows differ.
Yet a low product can also be a legitimate rejection of marginal conditions.
Sparse placement alone cannot distinguish an overly restrictive response from
an appropriate one, or establish that the floor should be lowered.

## What Survives In The Retained Pair

The [retained evidence summary][retained] reports these results for two selected
Swooper Earthlike headless/mock cases. "Positive" and "at floor" count all
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
loss is therefore different from the empty point-water substrate in Q-004.

## What Would Distinguish The Explanations

Family-specific physical evidence would establish what environmental support
and responses a score should represent at this scale. Separate product evidence
would establish whether any desired visibility or abundance is an authored
gameplay choice. Neither kind of authority can be replaced by an inherited
count or a visually appealing map; [Q-002][prevalence] holds that benchmark
distinction.

A comparison of response functions with substrate and environmental fields
held fixed would isolate the family's modeled response. A comparison of
admission floors with all scores held fixed would instead isolate selection
policy. Changes in climate or habitat support are a third comparison, not
evidence that the floor itself is wrong. Keeping these questions separate
prevents a higher feature count from concealing which hypothesis changed.

Evidence that the retained sites are physically marginal would support their
rejection. Evidence of suitable sites systematically excluded by a response
factor would support a narrower family-level concern. Evidence that well-founded
family scores acquire incompatible meanings under one floor would challenge
shared admission. The existing pair locates bounded losses; it establishes
none of those scientific or product dispositions on its own.

## Scope Of The Evidence

The [evidence summary][retained] distinguishes original receipts at
`5f82b5f1f39040e83d909793eb296fc526420511`, runtime source bridge
`22e3976f276fd9a199635dd28e6e4d35777fb629` and source inspection at
`2a31c96f8d61ee713075974838dfd36a0b008021`. It records exact five-family
score-array and wetland-planner agreement, with generated dependency-byte
differences disclosed. Raw artifacts and the diagnostic program are private;
the public digest is not independently reproducible by itself. Structured
verification here is source inspection, not new replay, native acceptance,
all-seed prevalence or physical calibration.

[scores]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/score-layers/step.ts#L136-L202
[marsh]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-marsh/strategies/temperate-hydromorphic/index.ts
[bog]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-tundra-bog/strategies/cold-hydromorphic/index.ts
[mangrove]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-mangrove/strategies/warm-intertidal/index.ts
[planner]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-plan-wetlands/strategies/habitat-confidence/index.ts
[floor]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/maps/configs/swooper-earthlike.config.json#L1050-L1054
[retained]: ../wetland-occurrence-evidence.md
[geometry]: q-001-low-shore-neighborhood.md
[point-water]: q-004-point-water-support.md
[prevalence]: q-002-ecological-prevalence.md
