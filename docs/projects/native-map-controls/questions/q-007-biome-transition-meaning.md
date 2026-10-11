---
id: Q-007
title: Biome Transition Meaning
recordKind: question
disposition: open
sourceRevision: 2a31c96f8d61ee713075974838dfd36a0b008021
locations:
  - id: "ecology-biome-classification"
    label: "Biome Classification"
    relation: "question-owner"
    stage: "ecology-biomes"
    step: "biomes"
    operation: "ecology.biomes.ops.classifyBiomes"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/contract.ts"
  - id: "hydrology-baseline-climate"
    label: "Baseline Climate"
    relation: "related-producer"
    stage: "hydrology-climate-baseline"
    step: "climate-baseline"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/config.ts#L84-L111"
assessments:
  - claim: "The classifier uses plant moisture/stress for nonpolar moisture categories and deliberately retains atmospheric effective moisture for its guarded tropical-temperature transition."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/rules/classify.ts#L66-L100"
  - claim: "The retained thermal pair reports 25 tropical-to-temperate-humid cells with unchanged plant-moisture/stress category buckets: 21 enter the adaptive guard and four cross adaptive thresholds within it. This is a policy interaction, not by itself a defect or a non-monotonicity result."
    state: "supported"
  - claim: "The atmospheric adjustment and both guard boundaries express a justified ecological or gameplay distinction without obsolete visual compensation or an implementation mismatch."
    state: "unassessed"
verification:
  - kind: source-inspection
    scope: "Inspection confirms the frozen recipe's real classifyBiomes binding; the owning step and classifier operation are unchanged through ae8. This is navigation/source identity, not physical qualification."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/biomes/steps/biomes/config.ts#L14-L27"
  - kind: source-inspection
    scope: "Inspection confirms separate atmospheric and plant inputs, the inclusive 1.25 C guard and the clamped moisture-dependent threshold. It does not independently reproduce the private pair's per-cell attribution."
    revision: ae8fc94d790a769fb45c60584e47304f69f53a93
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/rules/classify.ts#L66-L100"
  - kind: source-inspection
    scope: "Canonical Ecology documentation explicitly retains atmospheric thermal-transition context and identifies the categories as empirical, not scientific climatic-aridity classes. This is the declared model meaning, not its calibration."
    revision: ae8fc94d790a769fb45c60584e47304f69f53a93
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/docs/system/libs/mapgen/reference/domains/ECOLOGY.md#config-posture"
---

# Q-007: Biome Transition Meaning

What should a change from tropical to temperate mean in this model? A continuous
climate field must eventually become discrete biome categories. Crossing a
category boundary is expected; the question is whether the boundary expresses
an intended ecological or gameplay distinction, rather than disguising a
limitation of the upstream climate.

The owner is **Ecology / Biomes / Biome Classification**, after Hydrology has
produced climate and local plant-water fields, and before features and native
biome projection. The [biomes step][step] calls `classifyBiomes` with those
distinct inputs. Its physical categories are not the same as Civ7's projected
biome identities, and neither is a count of rainforest features.

## Two Different Uses Of Moisture

The classifier first combines a temperature zone with a moisture category.
For nonpolar land, plant moisture and plant stress describe local growth
conditions, including water beyond local rainfall. Near the tropical boundary,
a separate adjustment uses **atmospheric effective moisture** to decide which
temperature zone applies. This is not normalized forcing `W` or the plant-water
index. [Canonical Ecology meaning][ecology-meaning] explicitly preserves this
atmospheric context. The different inputs are deliberate; whether that
distinction has a justified ecological or gameplay meaning remains open.

The [transition rule][transition] names its original purpose: preventing
row-perfect tropical cutoffs. [Earthlike's nominal threshold][earthlike-config]
is 24 degrees C.
The atmospheric adjustment is active only within the inclusive interval
22.75-25.25 degrees C. On its dry side, the adjusted tropical threshold can
rise to 25.4 degrees C, beyond the interval's upper edge. Outside the interval,
the ordinary temperature-zone rule applies.

That relationship makes the guard itself part of the effective decision
boundary. Entering it can change the category without crossing 24 degrees C.
The [lookup][lookup] can then replace a tropical biome with `temperateHumid`
while its subhumid, humid or perhumid moisture category stays the same. This
explains how a wetter location can lose the rainforest *biome label*; it does
not establish that wetter conditions have reduced the modeled water supply.

## What The Retained Pair Exposes

The [single-world thermal comparison][thermal-pair] changes only the admitted
upstream thermal gain, but later temperature, atmospheric moisture and other
consumer inputs can respond together. It is not a classifier test with every
other argument held fixed.

The retained pair's per-cell attribution reports 25 physical tropical-to-temperate-humid
changes: 19 from tropical rainforest and six from tropical seasonal. All cool,
none crosses the hard 24 degree C cutoff, and their plant-moisture/stress
category buckets and elevations stay unchanged. The numeric moisture and
stress values need not be identical.

| Transition | Reported Cells | Meaning |
| --- | ---: | --- |
| Entry into the adaptive guard from above 25.25 degrees C | 21 | The dry-side 25.4 degree C threshold becomes applicable. |
| Adaptive-threshold crossing while remaining inside the guard | 4 | Temperature and/or atmospheric effective moisture change the predicate. |

Cell 2017 illustrates why rainforest loss is not shorthand for drying:
temperature falls from 25.285952 to 24.971687 degrees C while precipitation,
wetness and plant moisture all rise, yet its category changes when the guard
activates. Across the 25 cells, precipitation rises in 11 and falls in 14;
wetness rises in 14 and falls in 11. Twenty-four cells form a localized cluster
across the map's horizontal wrap, not a whole-latitude-row replacement.

These are concrete consequences of an existing policy. Cooling across a
categorical boundary does **not** demonstrate non-monotonic classification,
and mixed atmospheric responses do not support a broad-drying explanation.
The retained attribution also does not isolate pressure, rainfall and demand
as independent causes of the atmospheric-moisture change.

## A Proxy, A Compensation Or A Mismatch?

A defensible ecological envelope may legitimately use atmospheric conditions
to interpret a thermal boundary, even when plant-water categories have another
purpose. Its meaning would identify the habitat or gameplay distinction being
approximated and explain why the complete boundary, including both guard edges,
expresses it. In that case, retaining the rule with clearer explanation is a
real answer, not an incomplete repair.

An adjustment whose sole justification is concealing row-led upstream climate
has a different status: it is visual compensation, not an independently
supported climate mechanism. Whether it duplicates any upstream response
depends on the actual inputs and the intended distinction. The diagnostic
thermal candidate is disabled in authored maps, so its existence alone does
not make the incumbent adjustment obsolete.

A third possibility is a mismatch between a defensible intended policy and
its implemented boundary. Evidence for that would compare the declared
temperature/moisture ordering with the full classifier predicate under fixed
admitted inputs. Ordinary categorical crossings are compatible with a correct
rule; an unexplained reversal or a boundary that contradicts its declared
meaning would be more discriminating. The retained map pair motivates this
question but does not decide among these alternatives or identify a repair.

This concerns classifier meaning, not the [authority of prevalence targets][benchmarks]
or the [annual-source meaning of an oasis][oasis]. More rainforest, wider
temperature spread or fewer visible bands would not by themselves establish
a better answer.

## Evidence Boundaries

Source statements describe physics revision
`ae8fc94d790a769fb45c60584e47304f69f53a93`. The classifier operation and owning
step are unchanged from the `2a31` navigation source. The reported pair executes
`ff7b40a7beca64ac2621f6ce07fc5f2f8485a327`, with only the separate diagnostic
filename repair added. Its [custody and comparison scope][pair-provenance]
remain with Q-006. The 21/four attribution comes from the sealed thermal outcome,
not a joint population independently recomputed for this sheet.

No scalar experiment, generated map, native observation or Earth calibration
is added here. The source comment and canonical documentation establish what
the rule says and does, not verified Earth physics. This is an open meaning
question, not a declared classifier or climate defect.

[step]: https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/biomes/steps/biomes/step.ts#L21-L41
[transition]: https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/rules/classify.ts#L66-L100
[ecology-meaning]: https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/docs/system/libs/mapgen/reference/domains/ECOLOGY.md#config-posture
[lookup]: https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/rules/lookup.ts#L21-L33
[earthlike-config]: https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/plugins/mod/map/swooper-physics/src/maps/configs/swooper-earthlike.config.json#L819-L843
[thermal-pair]: q-006-regional-thermal-response.md#a-modest-response-in-one-procedural-world
[pair-provenance]: q-006-regional-thermal-response.md#procedural-pair
[benchmarks]: q-002-ecological-prevalence.md
[oasis]: q-004-point-water-support.md#two-meanings-of-dryness
