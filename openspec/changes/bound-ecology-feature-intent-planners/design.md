## Context

Ecology feature placement has two jobs. Score ops produce continuous physical
suitability fields. Planner ops convert those fields into sparse feature
intents that projection can materialize. The current planners collapse those
jobs by treating any positive score as placement intent.

## Owner

Feature intent admission is a policy, and policies stay with the feature family
strategy they modulate. Each ecology feature family MUST own its score-to-intent
policy in a local `policies/` directory:

```text
mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-reefs/policies/
mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-wetlands/policies/
mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-vegetation/policies/
mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-ice/policies/
```

The implementation MUST NOT create `features-plan-shared`, `score-shared`
admission, generic `shared`, projection admission, or step-contract routing. If
score-to-intent admission later becomes product-free MapGen machinery, it must
move to MapGen core through a separate change. Reef, wetland, vegetation, and
ice habitat physics stay with their owning feature ops/contracts.

## Policy

Feature planners MUST NOT place a candidate only because its score is positive.
Each family-local policy defines what counts as a confident intent for that
family. Reef and ice features require high-confidence physical evidence;
wetland and vegetation families may use lower family-local thresholds because
their score ops multiply several independent ecology signals and would
otherwise erase legitimate habitat. The invariant is not one universal
threshold; it is that each in-kind planner has an explicit policy and weak
positive scores cannot place features.

Feature-family contracts may and should add stricter habitat rules. The local
admission policies only close the weak-positive category and must not carry
habitat physics that belong in feature-family score ops.

Planner order is mandatory: feature-family habitat eligibility first,
family-local weak-positive admission second, occupancy/reservation claim third,
artifact publish last. Guard coverage should prevent generic feature-planner
shared directories and should prove each in-kind planner has a local policy. If
a policy grows beyond score-to-intent admission, the new logic must stay with
the owning feature op/family or move to MapGen core if it is genuinely
product-free machinery.

## Review Lanes

- Architecture: truth stays in `ecology-features`; projection stays in
  `map-ecology`.
- Physics/gameplay: family-local admission improves sparsity without flattening
  feature-specific habitats.
- DX/complexity: policy files are small behavior attachments used by strategies,
  not routers or shared buckets.
- Adversarial: no chance thinning, fallback behavior, or manual step wiring as
  closure proof.
