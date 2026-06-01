## ADDED Requirements

### Requirement: Feature Balance Uses Engine-Valid Surfaces

Earthlike feature balance SHALL count a feature family as product-visible only
when its planned and applied surface is valid for the Civ7 engine terrain and
biome rules.

#### Scenario: Vegetation feature intents are planned
- **WHEN** forest, taiga, savanna woodland, sagebrush steppe, or rainforest
  intents are emitted
- **THEN** the planner accounts for the projected terrain class and engine biome
  class needed for that feature family
- **AND** mock-adapter feature acceptance alone is insufficient proof

#### Scenario: Reef-family intents are planned
- **WHEN** reef, cold reef, atoll, or lotus intents are emitted
- **THEN** coast-valid reef families and ocean-valid atoll families use distinct
  habitat masks
- **AND** aggregate reef-family counts cannot hide all-atoll or all-cold-reef
  rejection

#### Scenario: Feature apply rejects intents
- **WHEN** `canHaveFeature` rejects a planned feature
- **THEN** diagnostics record the feature key and rejection reason
- **AND** Earthlike balance gates fail when product-required families are
  rejected below their visible floor
