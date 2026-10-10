---
id: Q-002
title: Ecological Prevalence And Benchmark Authority
recordKind: question
disposition: open
sourceRevision: 2a31c96f8d61ee713075974838dfd36a0b008021
locations:
  - id: "benchmark-ecological-prevalence"
    label: "Ecological Prevalence Benchmarks"
    relation: "question-owner"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts"
  - id: "ecology-vegetation-planning"
    label: "Vegetation Planning"
    relation: "related-producer"
    stage: "ecology-features"
    step: "plan-vegetation"
    operation: "ecology.features.ops.planVegetation"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-plan-vegetation/contract.ts"
  - id: "ecology-feature-application"
    label: "Feature Application"
    relation: "downstream-consumer"
    stage: "map-ecology"
    step: "features-apply"
    operation: "ecology.features.ops.applyFeatures"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-apply/contract.ts"
assessments:
  - claim: "The ecology benchmark contains explicit vegetation-share, feature-presence, cold-reef and floodplain-attempt predicates."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts"
  - claim: "The Earthlike identity bounds remain unchanged while the Desert Mountains absolute rainforest-tile cap is removed."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/shipped-identities.md"
  - claim: "Current study policy classifies remaining appearance counts and shares as product assumptions or regression guards, not physical laws or independently calibrated Earth observations."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/STUDIES.md"
  - claim: "Each retained prevalence predicate has justified population, denominator and variability support, including habitat-conditioned numerical calibration where claimed."
    state: "unassessed"
verification:
  - kind: source-inspection
    scope: "Source inspection confirms the ecology predicates and their unchanged numerical bounds; no benchmark or generation was run."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts"
  - kind: source-inspection
    scope: "Source inspection confirms Earthlike identity values and removal of both Desert Mountains absolute-count consumers, not ecological adequacy."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/identities.ts"
  - kind: source-inspection
    scope: "Source inspection confirms the Earthlike core selection and product-assumption classification, not predicate-level calibration provenance."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/STUDIES.md"
---

# Q-002: Ecological Prevalence And Benchmark Authority

**Current source review (2026-10-10):** At
`2a31c96f8d61ee713075974838dfd36a0b008021`, the
[Earthlike identity][current-identity-target] and
[ecology target values][current-ecology-target] remain unchanged. The
[current study policy][current-study-policy] selects `earthlike-core` by default
and classifies remaining appearance counts, shares and component bounds as
product assumptions or regression guards, not physical laws or independently
calibrated Earth observations. The Desert Mountains absolute 20-tile cap
[has been removed from both consumers][current-identity-protocol], not retuned.
This answers part of the original classification question without establishing
predicate-level justification for population, denominator, variability or
habitat-conditioned numerical support. No benchmark or new calibration was
executed by this review.

## Historical Evidence

The original packet below is preserved at
`fda02f26040a47f6bbd78ef685c1ad4fe909cc05`. Its linked tests and decisions are
historical evidence, not newly executed verification.

**Type:** triage. **Context:** source review of the Earthlike identity and ecology
targets at `fda02f26040a47f6bbd78ef685c1ad4fe909cc05`.
**Evidence disposition:** numerical predicates confirmed; their complete
decision/calibration provenance is not established by this review. This is not
proof that every threshold is wrong, nor a new plant-water release veto.

**Question and consequence:** Which bounds express authorized gameplay identity,
which ensure a test exercises a feature, and which claim ecological adequacy?
Should a particular expectation depend on available lawful habitat rather than
an unconditional count or whole-map share? Conflating these claims could reward
implausible coverage or reject a physically coherent map, but neither outcome
has been demonstrated here.

**Facts and affected path:** The [Earthlike identity target][identity-target]
requires a projected lake component of at least four tiles, five vegetation
families, named feature presence and rainforest at most 65% of vegetation.
The [ecology targets][ecology-target] separately require vegetation on 8-55% of
land, rainforest at most 70% of vegetation and 35% of land, named-feature
presence across rolls, cold-reef presence in four rolls and at least eight
floodplain attempts in the representative sample. Representative identity and
cohort constraints are different supports, not automatically contradictory
numbers. Inputs are measured feature/attempt counts, land and vegetation
denominators, lake components and cohort identities; outputs are benchmark
pass/fail receipts consumed by acceptance review, not new procedural forcing.

**Evidence, rivals and missing support:** The source explicitly labels many
bounds as product identity or representative coverage. The floodplain attempts
floor explicitly exercises an otherwise inactive row; it need not estimate
Earth prevalence. These are serious rival explanations to an arbitrary-physics
claim. What remains missing is a predicate-level trace from owner decision to
population, denominator, variability and justified bound. No independent
observational or habitat-conditioned calibration was established by this source
review; that is an evidence gap, not proof that such evidence cannot exist.

**Smallest investigation and disproof:** Select one disputed predicate and one
already retained Earthlike case. Trace its original decision and exact sample
support before any new run. Join the corresponding habitat eligibility,
compatibility, intent and observed result if retained, holding the producer
revision and cohort fixed. If those observations are absent, name the missing
receipt before proposing a capture. Recovering an authorized product/coverage
requirement with the stated support and a matching measurement can disprove the
claim that this predicate is an unsupported physics gate. Conversely, a number
alone cannot distinguish scarcity, illegal placement and an erroneous scorer.
The result may simply clarify a claim or remove duplicated checks; changing the
denominator, threshold or generator is not preselected.

**Next check:** Revisit when an Earthlike prevalence check would motivate a
scientific change or a new eligible-habitat support is proposed. Route a failure
needed by current work directly to its owner. This does not reopen the decided
themed-preset exclusion or 20-tile-cap removal. Close or promote the selected
predicate with its exact evidence; do not launch a sweep of all quotas.

[identity-target]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/identities.ts
[ecology-target]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts
[current-identity-target]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/identities.ts
[current-ecology-target]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts
[current-study-policy]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/STUDIES.md
[current-identity-protocol]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/shipped-identities.md
